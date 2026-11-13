const { cmsCardReturnUrl } = require('../checkoutOrigins');
const crypto = require('node:crypto');
const db = require('../../config/supabase');
const core = require('./core');
const catalogue = require('../managedWebsiteCatalogue');
const { resolveBillingIdentity } = require('../billingProfile');

const enabled = (sandbox, env = process.env) => sandbox
  ? env.WHOP_CMS_CARD_CHECKOUT_SANDBOX === 'true'
  : env.WHOP_CMS_CARD_CHECKOUT_PRODUCTION === 'true';
const unavailable = () => Object.assign(Error('Card checkout is temporarily unavailable.'), { status: 503 });
const pending = () => Object.assign(Error('This website already has a payment attempt. Check Billing before trying again.'), { status: 409 });
const clean = value => String(value ?? '').trim();
const fields = ['line1', 'line2', 'city', 'state', 'postal_code', 'country'];

function addressOf(profile) {
  const address = Object.fromEntries(fields.map(key => [key, clean(profile?.[key])]));
  address.country = catalogue.iso(address.country) || '';
  if (!address.line1 || !address.city || !address.country || fields.some(key => address[key].length > 200)) {
    throw Object.assign(Error('Add a complete billing address before continuing.'), { status: 400 });
  }
  catalogue.assertAvailable(address.country, address.state);
  return address;
}

const normalize = value => clean(value).replace(/\s+/g, ' ').toLowerCase();
const marker = id => `cms-card-${id}`;
const isCustom = intent => intent?.acquisition_mode === 'checkout' && !!intent.checkout_id && !intent.checkout_url;
const proof = (cfg, intent, id, billing, expires) => crypto.createHmac('sha256', cfg.secret)
  .update(JSON.stringify([intent.id, id, billing, expires])).digest('hex');

async function billingFor(siteId, email) {
  const profile = (await resolveBillingIdentity(siteId))?.profile;
  return { email: clean(profile?.billing_email || email), name: [profile?.first_name, profile?.last_name].map(clean).filter(Boolean).join(' '),
    address: addressOf(profile) };
}

function context(siteId, currency) {
  const cfg = core.config();
  if (!enabled(cfg.sandbox)) throw unavailable();
  const back = cmsCardReturnUrl(cfg.sandbox, siteId).href;
  const offer = cfg.plans[require('./websitePrices').price(currency).key];
  if (!offer?.plan) throw unavailable();
  return { cfg, offer, back };
}

async function quote(siteId, userId, email, currency) {
  const { cfg, offer, back } = context(siteId, currency);
  const billing = await billingFor(siteId, email);
  const prepared = await db.rpc('whop_prepare_checkout', { p_target: siteId, p_user: userId,
    p_key: require('./websitePrices').price(currency).key, p_plan: offer.plan,
    p_product: 'website', p_sandbox: cfg.sandbox, p_email: email });
  if (prepared.error) throw pending();
  const intent = prepared.data;
  if (!intent || intent.requested_by !== userId || intent.saved_payment_id) throw pending();
  if (intent.acquisition_mode === 'pending') {
    const claimed = await db.from('whop_checkout_intents').update({ acquisition_mode: 'checkout', checkout_id: marker(intent.id) })
      .eq('id', intent.id).eq('acquisition_mode', 'pending').select('id').maybeSingle();
    if (claimed.error || !claimed.data) throw pending();
    intent.acquisition_mode = 'checkout';
    intent.checkout_id = marker(intent.id);
  }
  if (!isCustom(intent) || Date.now() - Date.parse(intent.created_at) >= 23 * 3600000) throw pending();
  if (intent.checkout_id === marker(intent.id)) {
    const checkout = await core.checkout(cfg, intent, back);
    const saved = await db.from('whop_checkout_intents').update({ checkout_id: checkout.checkoutId })
      .eq('id', intent.id).eq('checkout_id', marker(intent.id));
    if (saved.error) throw unavailable();
  }
  const result = await cfg.client.paymentQuotes.create({ account_id: cfg.account, address: billing.address,
    line_items: [{ plan_id: offer.plan, quantity: 1 }] });
  const cur = offer.currency || currency;
  const tax = result.tax_amount ? core.cents(result.tax_amount, cur) : 0;
  if (core.cents(result.total, cur) !== offer.cents + tax) throw unavailable();
  const expires = Date.now() + 10 * 60_000;
  return { accountId: cfg.account, planId: offer.plan, environment: cfg.sandbox ? 'sandbox' : 'production',
    billing, returnUrl: back, id: result.id, proof: proof(cfg, intent, result.id, billing, expires), expires,
    total: result.total, tax: result.tax_amount };
}

async function confirm(siteId, userId, email, currency, input) {
  const { cfg, offer, back } = context(siteId, currency);
  const { token, quoteId, quoteProof, expires } = input || {};
  if (!/^ctok_[a-z0-9_-]{1,200}$/i.test(token ?? '') || !/^pq_[a-z0-9_-]{1,200}$/i.test(quoteId ?? '') ||
      !/^[a-f0-9]{64}$/.test(quoteProof ?? '') || !Number.isSafeInteger(expires) || expires < Date.now()) {
    throw Object.assign(Error('Review the payment total again.'), { status: 400 });
  }
  const { data: intent, error } = await db.from('whop_checkout_intents').select('*').eq('site_id', siteId)
    .eq('requested_by', userId).eq('sandbox', cfg.sandbox).eq('product', 'website').eq('state', 'pending').maybeSingle();
  if (error || !isCustom(intent) || intent.checkout_id === marker(intent.id) || intent.plan_id !== offer.plan ||
      Date.now() - Date.parse(intent.created_at) >= 23 * 3600000) throw pending();
  if (intent.saved_payment_id) throw pending();
  const billing = await billingFor(siteId, email);
  if (!crypto.timingSafeEqual(Buffer.from(quoteProof, 'hex'), Buffer.from(proof(cfg, intent, quoteId, billing, expires), 'hex'))) {
    throw Object.assign(Error('Billing details changed. Review the payment total again.'), { status: 409 });
  }
  const confirmation = await cfg.client.confirmationTokens.retrieve({ id: token, account_id: cfg.account });
  const address = addressOf(confirmation.billing_address);
  if (normalize(confirmation.billing_details?.email) !== normalize(billing.email) ||
      fields.some(key => normalize(address[key]) !== normalize(billing.address[key]))) {
    throw Object.assign(Error('The card details do not match the reviewed billing address.'), { status: 409 });
  }
  // The provider binds one payment to the intent even if a response is lost or
  // two tabs try different cards. Never issue a fresh key for a pending intent.
  const payment = await cfg.client.payments.create({ account_id: cfg.account, confirmation_token: token,
    quote_id: quoteId, off_session: false, return_url: back,
    metadata: { stemfra_order_id: intent.id, stemfra_product: 'website' } },
    { idempotencyKey: `stemfra-cms-card-${intent.id}` });
  if (!/^pay_[a-z0-9]+$/i.test(payment.id || '')) throw unavailable();
  const saved = await db.from('whop_checkout_intents').update({ saved_payment_id: payment.id })
    .eq('id', intent.id).eq('checkout_id', intent.checkout_id);
  if (saved.error) throw pending();
  return { paymentId: payment.id, clientSecret: payment.client_secret ?? null };
}

module.exports = { enabled, isCustom, quote, confirm };
