const router = require('express').Router();
const db = require('../../config/supabase');
const { requireCmsAuth, verifySiteOwnership } = require('../../middleware/cmsAuth');
const STEPS = new Set(['intro', '1', '2', '3', '4', 'preview']);
router.use(requireCmsAuth);
router.use('/:siteId', async (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  try {
    if (!await verifySiteOwnership(req.cmsUser.id, req.params.siteId)) return res.status(403).json({ error: 'Not your site.' });
    next();
  } catch { res.status(503).json({ error: 'Could not check setup access.' }); }
});
router.get('/:siteId', async (req, res) => {
  const { data, error } = await db.from('site_setup_progress').select('step,business_draft,revision,updated_at')
    .eq('site_id', req.params.siteId).eq('user_id', req.cmsUser.id).maybeSingle();
  if (error) return res.status(503).json({ error: 'Could not load saved setup.' });
  res.json(data || { step: null, business_draft: null, revision: 0 });
});
router.put('/:siteId', async (req, res) => {
  const body = req.body || {};
  if (!Number.isSafeInteger(body.revision) || body.revision < 0 || (body.step !== undefined && !STEPS.has(body.step))) return res.status(400).json({ error: 'Invalid setup progress.' });
  const patch = { revision: body.revision + 1, updated_at: new Date().toISOString() };
  if (body.step !== undefined) patch.step = body.step;
  if (body.business_draft !== undefined) {
    const draft = body.business_draft;
    if (draft !== null && (typeof draft !== 'object' || Array.isArray(draft) || JSON.stringify(draft).length > 16000)) return res.status(400).json({ error: 'Invalid setup draft.' });
    patch.business_draft = draft;
  }
  const keys = { site_id: req.params.siteId, user_id: req.cmsUser.id };
  // Insert only if absent; the conditional update below fences other tabs/devices.
  const seeded = await db.from('site_setup_progress').upsert(keys, { onConflict: 'site_id,user_id', ignoreDuplicates: true });
  if (seeded.error) return res.status(503).json({ error: 'Could not save setup.' });
  const { data, error } = await db.from('site_setup_progress').update(patch).match(keys).eq('revision', body.revision).select('step,business_draft,revision,updated_at').maybeSingle();
  if (error) return res.status(503).json({ error: 'Could not save setup.' });
  if (!data) return res.status(409).json({ error: 'Setup changed in another window. Reload to continue.' });
  res.json(data);
});
module.exports = router;
