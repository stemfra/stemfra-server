// serviceCatalog — the services the setup wizard offers as tick boxes (P39
// onboarding v2, slice a, 2026-09-13).
//
// The list IS the vertical's default theme: the active services of the seed
// site (lib/verticalConfig `seedSite`, e.g. Argyle & Sons for barbershops),
// in their display order, with their names and durations. Peter's call
// (2026-09-13, after seeing "Kids' haircut" next to the seed's "Children's
// haircut" and "Scissor cut" next to "Scissor haircut"): the seed lists were
// curated already and are enough to start; a second hand-written list only
// produced near-duplicates. So curating the catalogue = editing the seed site's
// services in the CMS. Prices come from the owner, never from here (the seed's
// demo prices stay on rows the owner keeps; a re-ticked row starts blank).
// Fitness rows carry `kind: 'class'` from `site_services.kind` so the CMS
// creates them as classes.
//
// Custom names owners add land in `service_suggestions` (routes/cms/serviceCatalog);
// promote the frequent ones by adding them to the seed site.
const supabase = require('../config/supabase');
const { resolveVerticalSlug, configFor, seedSourceFor } = require('./verticalConfig');

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map(); // vertical → { at, items }

function i18nEn(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.en || Object.values(v).find((s) => typeof s === 'string') || '';
  return String(v);
}

/** Resolve any spelling of a vertical (slug, alias, lead-gen name) to the canonical slug. */
function verticalKey(verticalSlug) {
  const slug = resolveVerticalSlug(String(verticalSlug || '').toLowerCase());
  return configFor(slug) ? slug : null; // resolveVerticalSlug echoes unknown input; only real verticals pass
}

/** { vertical, items: [{ name, duration, kind }] } for a vertical; empty when unknown. */
async function catalogFor(verticalSlug) {
  const vertical = verticalKey(verticalSlug);
  if (!vertical) return { vertical: null, items: [] };
  const seedSite = seedSourceFor(vertical);
  if (!seedSite) return { vertical, items: [] };

  const hit = cache.get(vertical);
  if (hit && Date.now() - hit.at < CACHE_MS) return { vertical, items: hit.items };

  const { data, error } = await supabase
    .from('site_services')
    .select('name, duration_minutes, kind, display_order')
    .eq('site_id', seedSite)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('[serviceCatalog] seed read failed:', error.message);
    return { vertical, items: hit ? hit.items : [] };
  }
  const seen = new Set();
  const items = [];
  for (const r of data || []) {
    const name = i18nEn(r.name).trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    items.push({ name, duration: r.duration_minutes || 30, kind: r.kind === 'class' ? 'class' : 'appointment' });
  }
  cache.set(vertical, { at: Date.now(), items });
  return { vertical, items };
}

module.exports = { catalogFor, verticalKey };
