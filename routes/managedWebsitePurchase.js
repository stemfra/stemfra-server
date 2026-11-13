const { origin, websiteReturnOrigin } = require('../lib/checkoutOrigins');
const router = require('express').Router();
const catalogue = require('../lib/managedWebsiteCatalogue');
const db = require('../config/supabase');
const core = require('../lib/whop/core');
const service = require('../lib/managedWebsitePurchaseService');
const { randomBytes } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { isPurchaseOwner } = require('../lib/managedWebsitePurchase');
const handoffs = new Map();
const cartEnabled = () => process.env.WHOP_ENABLED === 'true' && (
  process.env.WHOP_SANDBOX === 'true'
    ? process.env.WHOP_WEBSITE_CUSTOM_SANDBOX === 'true'
    : process.env.WHOP_SANDBOX === 'false' && process.env.WHOP_WEBSITE_CUSTOM_PRODUCTION === 'true'
);
const fail = (message, status) => Object.assign(Error(message), { status });
const enabled = () => process.env.MANAGED_WEBSITE_PURCHASE_ENABLED === 'true';
router.get('/config', (_req, res) => res.set('Cache-Control', 'no-store').json({
  enabled: enabled(),
  embeddedCheckout: enabled() && process.env.WHOP_ENABLED === 'true' && process.env.WHOP_SANDBOX === 'false' && process.env.WHOP_WEBSITE_CUSTOM_PRODUCTION === 'true',
  cmsEmbeddedCheckout: process.env.WHOP_ENABLED === 'true' && process.env.WHOP_SANDBOX === 'false' && process.env.WHOP_CMS_CARD_CHECKOUT_PRODUCTION === 'true',
}));
router.use((_req, res, next) => enabled() ? next() : res.status(503).json({ error: 'Checkout is temporarily unavailable.' }));
router.get('/sandbox-return', (req, res) => {
  if (!process.env.WHOP_WEBSITE_SANDBOX_RETURN_ORIGIN || process.env.WHOP_SANDBOX !== 'true') return res.sendStatus(404);
  const { purchase, status, checkout_status, payment, payment_id, receipt_id } = req.query;
  if (typeof purchase !== 'string' || !/^[0-9a-f-]{36}$/i.test(purchase)) return res.sendStatus(400);
  let target;
  try {
    origin('WHOP_WEBSITE_SANDBOX_RETURN_ORIGIN', { relay: true });
    target = new URL('/checkout', websiteReturnOrigin(true));
  } catch (error) { return res.status(error.status).json({ error: error.message }); }
  target.searchParams.set('purchase', purchase);
  const outcome = status || checkout_status;
  if (['success', 'succeeded', 'failed', 'canceled'].includes(outcome)) target.searchParams.set('status', outcome);
  const reference = payment || payment_id || receipt_id;
  if (typeof reference === 'string' && /^pay_[a-zA-Z0-9]+$/.test(reference)) target.searchParams.set('payment', reference);
  res.set('Cache-Control', 'no-store').redirect(303, target.href);
});
router.use(catalogue.middleware, catalogue.requestGate);
// Bound anonymous attempts. OTP resends additionally use a database claim.
const attempts = new Map();
router.use((req, res, next) => {
  const key = require('../lib/clientIp').clientIp(req), now = Date.now();
  const hit = attempts.get(key);
  if (!hit || hit.until < now) attempts.set(key, { count: 1, until: now + 60000 });
  else if (++hit.count > 60) return res.status(429).json({ error: 'Please wait a minute and try again.' });
  if (attempts.size > 10000) for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
  next();
});
const route = fn => async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try { res.json(await fn(req)); }
  catch (e) { if (!e.status) console.error('[website-purchase]', e.message); res.status(e.status || 503).json({ error: e.status ? e.message : 'Setup is temporarily unavailable. Your purchase is saved. Please try again.' }); }
};
router.get('/cart/card-config', route(async req => {
  if (!cartEnabled()) throw fail('Card checkout is unavailable.', 404);
  const price = req.query.currency === 'USD' ? catalogue.active('USD') : null;
  if (!price || price.id !== req.query.version) throw fail('The subscription price has changed.', 409);
  const cfg = core.config();
  const planId = cfg.plans[price.plan_key]?.plan;
  if (!planId) throw fail('Card checkout is unavailable.', 503);
  return { accountId: cfg.account, planId };
}));
router.post('/start', catalogue.newQuoteGate, route(async req => {
  const cartCheckout = req.body.cartCheckout === true;
  if (cartCheckout && !cartEnabled()) throw fail('Card checkout is unavailable.', 404);
  if (req.body.termsAccepted !== true) throw Object.assign(Error('Accept the subscription terms to continue.'), { status: 400 });
  let starterId = typeof req.body.starterId === 'string' ? req.body.starterId : null;
  const themes = { manhattan: 'rourke-sloane', 'classic-nyc': 'argyle-and-sons', sorrel: 'maison-lune', 'beauty-house': 'vesper-beauty-house', box: 'ironclad-athletics', volt: 'forge-and-bell', blackfly: 'blackfly-barbell', '212': '212-strength-co', sanctuary: 'wildflower-yoga-pilates', sawiet: 'lila-studio', 'zen-haven': 'umbra', escape: 'lull', reverie: 'reveline', ellaris: 'ellaris-spa', lumora: 'vela', respira: 'aurea' };
  if (!starterId && req.body.theme) {
    starterId = themes[req.body.theme];
    if (!starterId) throw Object.assign(Error('That design is unavailable.'), { status: 400 });
  }
  const starter = starterId ? await require('../lib/starters').getApprovedStarter(starterId) : null;
  if (starterId && !starter) throw Object.assign(Error('That design is unavailable.'), { status: 400 });
  // Canonical source IDs and business type come from the approved catalogue.
  if (starter) starterId = starter.id;
  const vertical = starter?.vertical?.slug || require('../lib/verticalConfig').resolveVerticalSlug(req.body.vertical || 'barbers');
  if (!starterId && !require('../lib/verticalConfig').configFor(vertical)) throw Object.assign(Error('Choose an available business type.'), { status: 400 });
  const price = require('../lib/whop/websitePrices').price(req.body.subscriptionCurrency);
  // The issuer must return to the origin that owns the browser checkout session.
  const requestOrigin = req.get('origin');
  const checkoutOrigin = requestOrigin === process.env.CLIENT_ALTERNATE_URL?.trim() ? requestOrigin : undefined;
  return service.start({ vertical, starterId, planKey: price.key, country: req.body.country || null, ...(checkoutOrigin ? { checkoutOrigin } : {}), ...(cartCheckout ? { cartCheckout } : {}),
    claimToken: typeof req.body.claimToken === 'string' ? req.body.claimToken : null,
    acceptedAt: new Date().toISOString(), legalVersions: require('../lib/legalDocs').LEGAL_DOCS, clientIp: require('../lib/clientIp').clientIp(req), userAgent: String(req.headers['user-agent'] || '').slice(0, 500), pricingVersion: price.version }, core.config());
}));
async function purchase(req) { return service.load(req.body.id, req.body.key); }
router.post('/card/quote', route(async req => service.quoteCard(await purchase(req), core.config(), req.body.address)));
router.post('/card/confirm', route(async req => service.confirmCard(await purchase(req), core.config(), req.body)));
router.post('/status', route(async req => {
  const row = await purchase(req);
  const paymentId = req.body.paymentId || (row.selection?.cartCheckout && row.state === 'pending' ? row.selection.cardAttempt?.paymentId : null);
  const p = await service.refresh(row, core.config(), paymentId);
  const jwt = String(req.headers.authorization || '').replace(/^Bearer /, '');
  const auth = jwt ? await db.auth.getUser(jwt) : null;
  const verified = !auth?.error && isPurchaseOwner(p, auth?.data?.user);
  return { state: p.state, restartInUsd: p.state === 'pending' && p.currency !== 'USD' && !p.selection?.cardAttempt && !p.checkout_id && !p.snapshot?.paid, verified, siteId: verified && p.state === 'complete' ? p.site_id : null,
    ...(p.selection?.cardAttempt ? { cardPaymentStarted: true, cardPaymentId: p.selection.cardAttempt.paymentId || null } : {}),
    ...(p.snapshot?.paid ? { email: p.snapshot.customer_email, newAccount: p.state !== 'complete' && p.new_account === true, codeSentAt: p.otp_sent_at || null } : {}) }; 
}));
router.post('/code', route(async req => service.sendCode(await service.refresh(await purchase(req), core.config()), req.body.key)));
async function paidCart(req) {
  const p = await purchase(req);
  if (p.sandbox !== core.config().sandbox || !p.selection?.cartCheckout || p.selection.checkoutMode !== 'custom-card' || !p.snapshot?.paid || !p.auth_user_id)
    throw fail('Request a verification code for your paid checkout first.', 409);
  return p;
}
router.post('/cart/verify', route(async req => {
  const p = await paidCart(req);
  const code = req.body.code;
  if (typeof code !== 'string' || !/^\d{8}$/.test(code)) throw fail('Enter the eight-digit verification code.', 400);
  // Each verification gets its own auth client. The shared service client
  // must never pick up a customer's session.
  const auth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).auth;
  const { data, error } = await auth.verifyOtp({ email: p.snapshot.customer_email.toLowerCase(), token: code, type: 'email' });
  if (error || !data.session || !isPurchaseOwner(p, data.user)) throw fail('That code could not be verified. Check it or request a new one.', 400);
  const grant = randomBytes(32).toString('hex');
  handoffs.set(grant, { id: p.id, access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  setTimeout(() => handoffs.delete(grant), 120000).unref();
  return { grant };
}));
router.post('/cart/exchange', route(async req => {
  const p = await paidCart(req);
  const entry = handoffs.get(req.body.grant);
  if (entry?.id !== p.id) throw fail('Your setup link expired. Verify your email again to continue.', 410);
  handoffs.delete(req.body.grant);
  return { access_token: entry.access_token, refresh_token: entry.refresh_token };
}));
router.post('/cart/complete', route(async req => {
  const p = await paidCart(req);
  const entry = handoffs.get(req.body.grant);
  if (entry?.id !== p.id) throw fail('Your setup link expired. Verify your email again to continue.', 410);
  const company = typeof req.body.company === 'string' ? req.body.company.trim() : '';
  if (!company || company.length > 200) throw fail('Enter your business name.', 400);
  const auth = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  }).auth;
  const { data, error } = await auth.setSession(entry);
  if (error || !isPurchaseOwner(p, data.user)) throw fail('Verify your email again to continue.', 401);
  if (p.state !== 'complete' && p.new_account === true) {
    const password = req.body.password;
    if (typeof password !== 'string' || password.length < 8) throw fail('Use at least 8 characters for your password.', 400);
    const changed = await auth.updateUser({ password });
    if (changed.error) throw fail(changed.error.message, 400);
  }
  catalogue.assertAvailable(p.snapshot?.billing_address?.country, p.snapshot?.billing_address?.state);
  const result = await service.complete(p, data.user, core.config(), company);
  return result;
}));
router.post('/complete', route(async req => {
  const jwt = String(req.headers.authorization || '').replace(/^Bearer /, '');
  const { data, error } = await db.auth.getUser(jwt);
  if (error || !data.user) throw Object.assign(Error('Verify your email to continue.'), { status: 401 });
  const company = String(req.body.company || '').trim();
  if (!company || company.length > 200) throw Object.assign(Error('Enter your business name.'), { status: 400 });
  const p = await service.refresh(await purchase(req), core.config());
  catalogue.assertAvailable(p.snapshot?.billing_address?.country, p.snapshot?.billing_address?.state);
  return service.complete(p, data.user, core.config(), company);
}));
module.exports = router;
module.exports.service = service;
