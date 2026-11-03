// CMS publish controller (Phase 2d). Owner-facing readiness + publish/unpublish.
// Auth via requireCmsAuth (owner JWT) + verifySiteOwnership for every siteId.
// config/supabase.js exports the client directly; we only need the auth helpers
// + the publish/completeness libs here.
const supabase = require('../../config/supabase');
const { verifySiteOwnership } = require('../../middleware/cmsAuth');
const { evaluateCompleteness } = require('../../lib/siteCompleteness');
const { evaluateSampleSections } = require('../../lib/sampleContent');
const { evaluateSiteQuality } = require('../../lib/siteQuality');
const { publishSite, unpublishSite, getBillingStatus } = require('../../lib/sitePublish');

const ZONE = 'stemfra.com';
const CMS_URL = process.env.CMS_URL || 'http://localhost:5180';

// GET /api/cms/site-publish/readiness/:siteId — checklist + billing + URLs.
async function getReadiness(req, res) {
  try {
    const { siteId } = req.params;
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    const [completeness, billing] = await Promise.all([
      evaluateCompleteness(siteId),
      getBillingStatus(siteId),
    ]);
    res.json({
      ...completeness,
      billing,
      subdomain: site.subdomain,
      customDomain: site.custom_domain || null,
      liveUrl: `https://${site.subdomain}.${ZONE}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/site-publish/publish { siteId } — previewing → live.
async function publish(req, res) {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    const result = await publishSite(siteId); // ownership and completeness are enforced
    res.json(result);
  } catch (err) {
    if (err.code === 'not_ready') return res.status(409).json({ error: err.message, code: err.code, completeness: err.completeness });
    if (err.code === 'needs_payment') return res.status(402).json({ error: err.message, code: err.code, billing: err.billing });
    if (err.code === 'bad_state') return res.status(409).json({ error: err.message, code: err.code });
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/site-publish/unpublish { siteId } — live → previewing.
async function unpublish(req, res) {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    res.json(await unpublishSite(siteId, { actorName: 'owner' }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/site-publish/billing-checkout { siteId } — pay-to-publish.
// Owner-facing System A checkout; amounts derive from the site's vertical
// (owner can't set prices). On success the webhook flips the subscription to
// active, clearing the publish billing gate.
async function billingCheckout(req, res) {
  try {
    const { siteId } = req.body;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });

    const result = await require('../../lib/whop/service').prepare(siteId, req.cmsUser.id, req.cmsUser.email);
    res.json(result);
  } catch (err) {
    if (err.code === 'no_stripe') return res.status(503).json({ error: 'Billing is not configured yet.' });
    if (err.code === 'no_email') return res.status(400).json({ error: 'Add a billing email to your account first.' });
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/site-publish/request-invoice { siteId } — Payoneer-first
// pay-to-publish. Instead of sending the owner to a Stripe checkout, we open a
// PENDING subscription (so the publish gate stays closed until payment clears),
// create the initial charge (setup + first month), and mark it requested — which
// emails the owner a payment request and rings their bell. Staff confirms the
// Payoneer payment in the CRM, which flips the subscription active and opens the
// gate. Idempotent: a second click won't duplicate the subscription/charge or
// re-send the email.
async function requestPublishInvoice(req, res) {
  return res.status(410).json({ error: 'Use Billing to subscribe securely through Whop.', code: 'subscription_billing_retired' });
}

// GET /api/cms/site-publish/sample-status/:siteId — ids of sections whose text
// still equals the clone source's (the CMS badges them "Sample"; the badge
// clears on the section's first real edit). Best-effort: errors return empty.
async function getSampleStatus(req, res) {
  try {
    const { siteId } = req.params;
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    res.json(await evaluateSampleSections(siteId));
  } catch (e) {
    console.error('[cms/publish] sample-status failed:', e.message);
    res.json({ sampleSectionIds: [] });
  }
}

// GET /api/cms/site-publish/quality/:siteId — theme-aware quality suggestions
// (lib/siteQuality.js). Advisory only; NEVER part of the publish gate. Errors
// degrade to an empty list so the Publish page never breaks on this.
async function getQuality(req, res) {
  try {
    const { siteId } = req.params;
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    res.json(await evaluateSiteQuality(siteId));
  } catch (e) {
    console.error('[cms/publish] quality failed:', e.message);
    res.json({ findings: [], summary: null });
  }
}

module.exports = { getReadiness, publish, unpublish, billingCheckout, requestPublishInvoice, getSampleStatus, getQuality };
