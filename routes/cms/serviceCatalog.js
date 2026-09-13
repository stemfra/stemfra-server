// /api/cms/service-catalog — the setup wizard's "tick what you offer" list
// (P39 onboarding v2, slice a, 2026-09-13).
//   GET  /?siteId=…        → { vertical, items: [{ name, duration, kind }], community: [{ name, duration, count }] }
//   POST /suggest          → { ok } records a custom service an owner typed (service_suggestions)
// Community = names other shops in the same vertical typed at least twice that are
// not yet in the curated list; they show under "Others in your trade also offer".
const express = require('express');
const supabase = require('../../config/supabase');
const { requireCmsAuth, verifySiteOwnership } = require('../../middleware/cmsAuth');
const { catalogFor } = require('../../lib/serviceCatalog');

const router = express.Router();
router.use(express.json({ limit: '20kb' }));
router.use(requireCmsAuth);

async function verticalOfSite(siteId) {
  const { data } = await supabase.from('sites').select('id, vertical:verticals(slug)').eq('id', siteId).maybeSingle();
  return data?.vertical?.slug || null;
}

router.get('/', async (req, res) => {
  const siteId = String(req.query.siteId || '');
  if (!siteId) return res.status(400).json({ error: 'siteId is required' });
  const site = await verifySiteOwnership(req.cmsUser.id, siteId);
  if (!site) return res.status(403).json({ error: 'Not your site' });
  const slug = await verticalOfSite(siteId);
  const { vertical, items } = await catalogFor(slug);
  let community = [];
  if (vertical) {
    const { data } = await supabase.from('service_suggestions').select('name, duration_minutes').eq('vertical_slug', vertical).limit(2000);
    const curated = new Set(items.map((i) => i.name.toLowerCase()));
    const counts = new Map();
    for (const r of data || []) {
      const key = String(r.name || '').trim().toLowerCase();
      if (!key || curated.has(key)) continue;
      const e = counts.get(key) || { name: String(r.name).trim(), duration: r.duration_minutes || 30, count: 0 };
      e.count++; counts.set(key, e);
    }
    community = [...counts.values()].filter((e) => e.count >= 2).sort((a, b) => b.count - a.count).slice(0, 12);
  }
  res.json({ vertical, items, community });
});

router.post('/suggest', async (req, res) => {
  const { siteId, name, duration_minutes, price_cents, currency } = req.body || {};
  if (!siteId || !name) return res.status(400).json({ error: 'siteId and name are required' });
  const site = await verifySiteOwnership(req.cmsUser.id, siteId);
  if (!site) return res.status(403).json({ error: 'Not your site' });
  const slug = await verticalOfSite(siteId);
  const { vertical } = await catalogFor(slug);
  const clean = String(name).trim().slice(0, 80);
  if (!clean) return res.status(400).json({ error: 'name is required' });
  await supabase.from('service_suggestions').insert({
    vertical_slug: vertical || slug || 'unknown', name: clean,
    duration_minutes: Number.isFinite(+duration_minutes) ? +duration_minutes : null,
    price_cents: Number.isFinite(+price_cents) ? +price_cents : null,
    currency: currency || null, site_id: siteId,
  }).then(() => {}, (e) => console.warn('[service-catalog] suggest insert failed:', e.message));
  res.json({ ok: true });
});

module.exports = router;
