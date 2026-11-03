const { WhopClient, WhopEnvironment } = require('@whop/sdk');
const { unwrapWebhook } = require('@whop/sdk/helpers');
const PORTAL = 'https://whop.com/@me/settings/orders/';
const CATALOG = Object.freeze({
  managed_website: { plan: 'plan_4Ai5KZN6ROwfM', currency:'USD', cents: 29900, label: 'Managed website', credits: 0 },
  ...Object.fromEntries(['CAD','GBP','KES'].map(c=>{const p=require('./websitePrices').price(c);return [p.key,{...p,plan:''}];})),
  launch_starter: { plan: 'plan_GxLYUzXIgyZk2', cents: 10000, label: 'Starter', credits: 2000 },
  launch_growth: { plan: 'plan_mAP5O5oJ6RVNk', cents: 20000, label: 'Growth', credits: 5000 },
  launch_business: { plan: 'plan_5Ev5UVXJTVLMQ', cents: 30000, label: 'Business', credits: 10000 },
});
function config(env = process.env) {
  if (env.WHOP_ENABLED !== 'true' || !env.WHOP_API_KEY || !env.WHOP_ACCOUNT_ID || !env.WHOP_WEBHOOK_SECRET) throw new Error('whop_unavailable');
  const sandbox = env.WHOP_SANDBOX !== 'false';
  // Sandbox must never charge the production variants Peter supplied.
  const plans = Object.fromEntries(Object.entries(CATALOG).map(([key, value]) => [key, { ...value,
    plan: env[`WHOP_PLAN_${key.toUpperCase()}`] || (sandbox ? '' : value.plan),
  }]));
  return require('../managedWebsiteCatalogue').configure({ _catalogueEnabled:true, sandbox, plans, account: env.WHOP_ACCOUNT_ID, secret: env.WHOP_WEBHOOK_SECRET,
    client: new WhopClient({ token: env.WHOP_API_KEY, apiVersionDate: '2026-10-15-1',
      environment: sandbox ? WhopEnvironment.Sandbox : WhopEnvironment.Production, timeoutInSeconds: 15, maxRetries: 1 }) });
}
function safeUrl(value, sandbox = false) {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === (sandbox ? 'sandbox.whop.com' : 'whop.com') && !url.username && !url.password ? url.href : null; } catch { return null; }
}
function cents(money, currency = 'USD') {
  if (!money || String(money.currency).toUpperCase() !== currency || !/^\d+\.\d{2}$/.test(money.amount)) throw new Error('unsupported_payment_amount');
  const [whole, fraction] = money.amount.split('.');
  const amount = Number(whole) * 100 + Number(fraction);
  if (!Number.isSafeInteger(amount)) throw new Error('unsupported_payment_amount');
  return amount;
}
function iso(value) { if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) throw new Error('missing_provider_timestamp'); return new Date(value).toISOString(); }
async function checkout(cfg, intent, redirect) {
  const offer = cfg.plans[intent.plan_key];
  if (!offer?.plan) throw new Error('plan_not_configured');
  const result = await cfg.client.checkoutConfigurations.create({ account_id: cfg.account, plan_id: offer.plan,
    metadata: { stemfra_order_id: intent.id, stemfra_product: intent.product }, redirect_url: redirect,
  }, { idempotencyKey: `stemfra-checkout-${intent.id}` });
  const url = safeUrl(result.purchase_url, cfg.sandbox);
  if (!url) throw new Error('invalid_checkout_url');
  return { url, checkoutId: result.id };
}
function verify(raw, headers, cfg) {
  const event = unwrapWebhook(raw, { headers, key: cfg.secret });
  if (!event || typeof event.type !== 'string' || typeof event.data?.id !== 'string' || typeof headers['webhook-id'] !== 'string') throw new Error('invalid_webhook');
  return event;
}
async function snapshot(cfg, event) {
  if(cfg._catalogueEnabled)require('../managedWebsiteCatalogue').configure(cfg,await require('../managedWebsiteCatalogue').read());
  const paymentEvent = ['payment.succeeded', 'payment.failed'].includes(event.type);
  const membershipEvent = ['membership.activated', 'membership.deactivated', 'membership.updated', 'membership.valid', 'membership.invalid'].includes(event.type);
  if (!paymentEvent && !membershipEvent) return null;
  const payment = paymentEvent ? await cfg.client.payments.retrieve({ id: event.data.id }) : null;
  const membershipId = payment ? payment.membership_id : event.data.id;
  if (!membershipId) return null; // Not one of our recurring subscriptions.
  let member;
  try { member = await cfg.client.memberships.retrieve({ id: membershipId }); }
  catch (error) {
    // A declined first checkout can reference a membership Whop never created.
    // Never apply this exception to renewals, paid payments or transient errors.
    if (error.statusCode !== 404 || event.type !== 'payment.failed' || payment?.status !== 'open'
      || payment.substatus !== 'failed' || payment.billing_reason !== 'subscription_create') throw error;
    if (payment.account_id !== cfg.account) throw new Error('wrong_whop_account');
    const entry = Object.entries(cfg.plans).find(([, offer]) => offer.plan && offer.plan === payment.plan_id);
    if (!entry) return null;
    const product = entry[0].startsWith('managed_website') ? 'website' : 'ai';
    if (payment.metadata?.stemfra_product !== product) throw new Error('product_mismatch');
    return { initial_failure: true, product, plan_id: payment.plan_id, payment_id: payment.id,
      order_id: payment.metadata?.stemfra_order_id, checkout_id: payment.checkout_configuration_id };
  }
  if (member.account?.id !== cfg.account || (payment && payment.account_id !== cfg.account)) throw new Error('wrong_whop_account');
  const offerEntry = Object.entries(cfg.plans).find(([, offer]) => offer.plan && offer.plan === (payment?.plan_id ?? member.plan_id));
  if (!offerEntry) return null; // Other Whop products do not belong to these integrations.
  const [key, offer] = offerEntry;
  if (member.plan_id !== offer.plan) throw new Error('membership_plan_mismatch');
  if (!Number.isInteger(member.billing_period_days) || member.billing_period_days < 28 || member.billing_period_days > 31 || member.collection_method !== 'charge_automatically' || cents(member.renewal_price, offer.currency || 'USD') !== offer.cents) throw new Error('unsupported_subscription_terms');
  const meta = member.metadata || {};
  const orderId = meta.stemfra_order_id || payment?.metadata?.stemfra_order_id;
  const product = key.startsWith('managed_website') ? 'website' : 'ai';
  if (meta.stemfra_product && meta.stemfra_product !== product) throw new Error('product_mismatch');
  const start = member.current_period_start ? iso(member.current_period_start) : null;
  const end = member.current_period_end ? iso(member.current_period_end) : null;
  const paid = payment?.status === 'paid' && payment.substatus === 'succeeded' && !payment.refunded_at;
  let lineItems = [], amount = 0;
  if (paid) {
    // Exact major-unit money, not net proceeds: tax is preserved separately.
    const subtotal = cents(payment.subtotal, offer.currency || 'USD'), total = cents(payment.total, offer.currency || 'USD');
    const tax = payment.tax_amount ? cents(payment.tax_amount, offer.currency || 'USD') : 0;
    if (subtotal !== offer.cents || total !== subtotal + tax || payment.currency !== (offer.currency || 'USD').toLowerCase()) throw new Error('payment_price_mismatch');
    amount = total;
    lineItems = [{ label: key.startsWith('managed_website') ? 'Managed website subscription' : `Stemfra AI ${offer.label}`, cents: subtotal }];
    if (tax) lineItems.push({ label: 'Tax collected by Whop', cents: tax });
  }
  return { member_id: member.member_id || member.member?.id || null,
    payment_method_id: payment?.payment_method?.id || payment?.payment_method_id || null,
    order_id: typeof orderId === 'string' ? orderId : null, product, plan_key: key, plan_id: offer.plan,
    label: offer.label, monthly_cents: offer.cents, credits: offer.credits, membership_id: member.id,
    checkout_id: payment?.checkout_configuration_id ?? null, payment_id: payment?.id ?? null,
    paid, amount_cents: amount, line_items: lineItems, currency: offer.currency || 'USD',
    paid_at: paid ? iso(payment.paid_at) : null,
    payment_created_at: payment ? iso(payment.created_at) : null,
    period_start: start, period_end: end, updated_at: iso(member.updated_at),
    status: member.status === 'active' ? 'active' : ['canceled', 'expired', 'completed'].includes(member.status) ? 'cancelled' : 'past_due',
    cancel_at_period_end: !!member.cancel_at_period_end, canceled_at: member.canceled_at,
    manage_url: safeUrl(member.manage_url, cfg.sandbox) || (cfg.sandbox ? PORTAL.replace("whop.com", "sandbox.whop.com") : PORTAL),
    customer_email: payment?.customer_email ?? null,
  };
}

// The pinned SDK uses cancel_at_period_end, not the newer cancellation_mode API.
async function setCancellation(cfg, membershipId, cancel, product) {
  if (typeof membershipId !== 'string' || !membershipId.startsWith('mem_')) throw new Error('missing_membership');
  const event = { type: 'membership.updated', data: { id: membershipId } };
  const before = await snapshot(cfg, event);
  if (!before || before.product !== product || before.membership_id !== membershipId) throw new Error('membership_mismatch');
  if (before.status !== 'active' || !before.period_end || Date.parse(before.period_end) <= Date.now()) throw new Error('membership_not_active');
  if (before.cancel_at_period_end !== cancel) {
    await cfg.client.memberships.update({ id: membershipId, cancel_at_period_end: cancel });
  }
  const after = await snapshot(cfg, event);
  if (!after || after.product !== product || after.membership_id !== membershipId || after.cancel_at_period_end !== cancel || after.status !== 'active' || after.period_end !== before.period_end) throw new Error('cancellation_not_confirmed');
  return after;
}

module.exports = { iso, setCancellation, CATALOG, PORTAL, config, checkout, verify, snapshot, safeUrl, cents };
