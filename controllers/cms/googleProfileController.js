// CMS "Google Business Profile" surface (Task #23 — GBP linkage). The lead-gen
// funnel targets local businesses that HAVE a Google listing (rating/presence)
// but NO website; once we publish their site, its value is only realized when
// the GBP points at it. This endpoint gives an owner everything they need to
// either CONNECT their existing listing (website field + appointment link + NAP
// consistency) or CREATE one from scratch — and records their progress.
//
// No Google API in v1 (that needs platform-scale approval); this is the
// high-touch guidance surface + a place to store the owner's status.
const supabase = require('../../config/supabase');
const { verifySiteOwnership } = require('../../middleware/cmsAuth');

function siteWebsite(site) {
  return `https://${site.custom_domain || `${site.subdomain}.stemfra.com`}`;
}

// GET /api/cms/google-profile?siteId= — the info bundle the guidance page needs:
// the exact website + booking link to paste into GBP, the site's NAP for
// consistency, and the owner's saved status.
async function getInfo(req, res) {
  try {
    const siteId = req.query?.siteId;
    if (!siteId) return res.status(400).json({ success: false, message: 'Missing siteId.' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ success: false, message: 'Not your site.' });

    const [{ data: full }, { data: theme }, { data: sections }] = await Promise.all([
      supabase.from('sites').select('subdomain, custom_domain, status, company:companies(name)').eq('id', siteId).single(),
      supabase.from('site_theme_settings').select('metadata').eq('site_id', siteId).maybeSingle(),
      supabase.from('site_sections').select('section_type, content').eq('site_id', siteId).eq('section_type', 'location_map'),
    ]);

    const loc = sections?.[0]?.content || {};
    const website = siteWebsite(full);
    const meta = (theme?.metadata && typeof theme.metadata === 'object') ? theme.metadata : {};
    const gbp = (meta.gbp && typeof meta.gbp === 'object') ? meta.gbp : {};

    res.json({
      success: true,
      website,
      bookUrl: `${website}/book`,
      published: full.status === 'live',
      nap: {
        name: full.company?.name || full.subdomain || '',
        address: loc.address || '',
        phone: loc.phone || '',
      },
      gbp: {
        has_profile: gbp.has_profile ?? null, // 'yes' | 'no' | null (undeclared)
        profile_url: gbp.profile_url || '',
        created: gbp.created === true,
        linked: gbp.linked === true,
      },
    });
  } catch (e) {
    console.error('[googleProfile.getInfo]', e.message);
    res.status(500).json({ success: false, message: 'Could not load Google Profile info.' });
  }
}

// POST /api/cms/google-profile — save the owner's GBP status into
// site_theme_settings.metadata.gbp (select-then-update/insert; no ON CONFLICT
// dependency, matching the onboarding/nav_mode metadata convention).
async function save(req, res) {
  try {
    const { siteId, has_profile, profile_url, created, linked } = req.body || {};
    if (!siteId) return res.status(400).json({ success: false, message: 'Missing siteId.' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ success: false, message: 'Not your site.' });

    const { data: row } = await supabase.from('site_theme_settings').select('site_id, metadata').eq('site_id', siteId).maybeSingle();
    const meta = (row?.metadata && typeof row.metadata === 'object') ? { ...row.metadata } : {};
    const prev = (meta.gbp && typeof meta.gbp === 'object') ? meta.gbp : {};
    meta.gbp = {
      ...prev,
      ...(has_profile !== undefined ? { has_profile: has_profile === 'yes' ? 'yes' : has_profile === 'no' ? 'no' : null } : {}),
      ...(profile_url !== undefined ? { profile_url: (profile_url || '').trim() || null } : {}),
      ...(created !== undefined ? { created: !!created } : {}),
      ...(linked !== undefined ? { linked: !!linked } : {}),
      updated_at: new Date().toISOString(),
    };

    const { error } = row
      ? await supabase.from('site_theme_settings').update({ metadata: meta }).eq('site_id', siteId)
      : await supabase.from('site_theme_settings').insert({ site_id: siteId, metadata: meta });
    if (error) throw new Error(error.message);

    res.json({ success: true, gbp: meta.gbp });
  } catch (e) {
    console.error('[googleProfile.save]', e.message);
    res.status(500).json({ success: false, message: 'Could not save. Try again.' });
  }
}

module.exports = { getInfo, save };

// ─── Find my business on Google (P39 onboarding v2, 2026-09-14) ──────────────
// POST /api/cms/google-profile/find { siteId, name, where } → { candidates }
// One Apify Google Maps search (lib/googlePlacesFinder) for the typed name near
// the typed place; a few candidates shaped for the wizard's "Is this you?" list.
const finder = require('../../lib/googlePlacesFinder');

async function find(req, res) {
  try {
    const { siteId, name, where } = req.body || {};
    if (!siteId) return res.status(400).json({ success: false, message: 'Missing siteId.' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ success: false, message: 'Not your site.' });
    if (!finder.configured()) return res.status(503).json({ success: false, message: 'Google lookup is not configured on this server.' });
    if (!String(name || '').trim()) return res.status(400).json({ success: false, message: 'Type your business name.' });
    const { data: full } = await supabase.from('sites').select('country').eq('id', siteId).maybeSingle();
    const candidates = await finder.findBusiness({ name, where, country: full?.country || 'US' });
    res.json({ success: true, candidates });
  } catch (e) {
    console.error('[googleProfile.find]', e.message);
    res.status(502).json({ success: false, message: `Google lookup failed: ${e.message}` });
  }
}

// POST /api/cms/google-profile/use { siteId, candidate } → { applied }
// The owner picked a candidate. The wizard fills its own form (name, location,
// address, phone) and saves those on "Save & continue"; this endpoint stores the
// rest right away: business hours from Google (when readable), social handles
// Google lists (only where the site has none), and the facts snapshot under
// site_theme_settings.metadata.gbp (has_profile, profile_url, place_id, snapshot),
// which slice (c) and the GBP guidance page read later.
async function use(req, res) {
  try {
    const { siteId, candidate: c } = req.body || {};
    if (!siteId || !c || typeof c !== 'object') return res.status(400).json({ success: false, message: 'Missing siteId or candidate.' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ success: false, message: 'Not your site.' });
    const applied = [];

    if (c.businessHours && typeof c.businessHours === 'object') {
      const { error } = await supabase.from('sites').update({ business_hours: c.businessHours }).eq('id', siteId);
      if (error) throw new Error(error.message);
      applied.push('hours');
    }

    const { data: row } = await supabase.from('site_theme_settings').select('site_id, metadata, instagram_handle, facebook_handle, tiktok_handle, youtube_handle, twitter_handle').eq('site_id', siteId).maybeSingle();
    const meta = (row?.metadata && typeof row.metadata === 'object') ? { ...row.metadata } : {};
    const prev = (meta.gbp && typeof meta.gbp === 'object') ? meta.gbp : {};
    const { businessHours, openingHours, ...facts } = c;
    meta.gbp = {
      ...prev,
      has_profile: 'yes',
      profile_url: c.url || prev.profile_url || null,
      place_id: c.placeId || prev.place_id || null,
      snapshot: { ...facts, openingHours: openingHours || [] },
      found_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const patch = { metadata: meta };
    const socials = c.socials && typeof c.socials === 'object' ? c.socials : {};
    for (const [key, col] of [['instagram', 'instagram_handle'], ['facebook', 'facebook_handle'], ['tiktok', 'tiktok_handle'], ['youtube', 'youtube_handle'], ['twitter', 'twitter_handle']]) {
      const v = socials[key];
      if (v && !(row && row[col])) { patch[col] = String(v); applied.push(key); }
    }
    const { error } = row
      ? await supabase.from('site_theme_settings').update(patch).eq('site_id', siteId)
      : await supabase.from('site_theme_settings').insert({ site_id: siteId, ...patch });
    if (error) throw new Error(error.message);
    applied.push('profile');
    res.json({ success: true, applied, gbp: { has_profile: 'yes', profile_url: meta.gbp.profile_url, place_id: meta.gbp.place_id } });
  } catch (e) {
    console.error('[googleProfile.use]', e.message);
    res.status(500).json({ success: false, message: 'Could not save the Google details. Try again.' });
  }
}

module.exports.find = find;
module.exports.use = use;
