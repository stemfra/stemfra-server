// The wizard's finish job (P39 slice c): rewrite the demo copy for this
// business. Owner JWT + ownership, like every CMS endpoint.
const { verifySiteOwnership } = require('../../middleware/cmsAuth');
const { draftSiteCopy } = require('../../lib/siteCopy');

// POST /api/cms/site-copy/draft { siteId, force?, dryRun? }
async function draft(req, res) {
  try {
    const { siteId, force = false, dryRun = false } = req.body || {};
    if (!siteId) return res.status(400).json({ error: 'siteId required' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site.' });
    // `force` is a dev aid only: it rewrites edited sections too.
    const allowForce = process.env.NODE_ENV !== 'production' && !!force;
    const result = await draftSiteCopy(siteId, { force: allowForce, dryRun: !!dryRun });
    res.json(result);
  } catch (err) {
    console.error('[cms/site-copy] draft failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { draft };
