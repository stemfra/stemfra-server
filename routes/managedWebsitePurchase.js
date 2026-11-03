const router = require('express').Router();
const catalogue = require('../lib/managedWebsiteCatalogue');
const db = require('../config/supabase');
const core = require('../lib/whop/core');
const service = require('../lib/managedWebsitePurchaseService');
const enabled = () => process.env.MANAGED_WEBSITE_PURCHASE_ENABLED === 'true';
router.get('/config', (_req, res) => res.json({ enabled: enabled() }));
router.use((_req, res, next) => enabled() ? next() : res.status(503).json({ error: 'Checkout is temporarily unavailable.' }));
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
router.post('/start', catalogue.quoteGate, route(async req => {
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
  return service.start({ vertical, starterId, planKey: price.key, country: req.body.country || null,
    claimToken: typeof req.body.claimToken === 'string' ? req.body.claimToken : null,
    acceptedAt: new Date().toISOString(), legalVersions: require('../lib/legalDocs').LEGAL_DOCS, clientIp: require('../lib/clientIp').clientIp(req), userAgent: String(req.headers['user-agent'] || '').slice(0, 500), pricingVersion: price.version }, core.config());
}));
async function purchase(req) { return service.load(req.body.id, req.body.key); }
router.post('/status', route(async req => {
  const p = await service.refresh(await purchase(req), core.config(), req.body.paymentId);
  const jwt = String(req.headers.authorization || '').replace(/^Bearer /, '');
  const auth = jwt ? await db.auth.getUser(jwt) : null;
  const verified = !auth?.error && require('../lib/managedWebsitePurchase').isPurchaseOwner(p, auth?.data?.user);
  return { state: p.state, verified, siteId: verified && p.state === 'complete' ? p.site_id : null,
    ...(p.snapshot?.paid ? { email: p.snapshot.customer_email, newAccount: p.state !== 'complete' && p.new_account === true, codeSentAt: p.otp_sent_at || null } : {}) }; 
}));
router.post('/code', route(async req => service.sendCode(await service.refresh(await purchase(req), core.config()), req.body.key)));
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
