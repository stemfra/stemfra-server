// placesLookup — look a business up in OUR OWN data before paying anyone (Peter,
// 2026-09-17). Lead-gen keeps every Google Maps place it scrapes in leadgen_places with the
// full Google record, so a lead refresh, and an owner who claims a shop we already
// scraped, can be served from the database for free. Callers fall back to Apify (lead
// refresh) only when nothing fresh enough matches.
const supabase = require('../config/supabase');

const FRESH_DAYS = Number(process.env.PLACES_FRESH_DAYS) || 120;

function normName(s) {
  return String(s || '').toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(inc|llc|ltd|limited|corp|co|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
const digits = (s) => String(s || '').replace(/\D/g, '').slice(-10);
const isFresh = (row) => !row.last_seen_at || (Date.now() - new Date(row.last_seen_at).getTime()) < FRESH_DAYS * 86400000;

/** By Google place id or Maps URL: the exact place, or null. */
async function placeByKey({ placeId = null, url = null } = {}) {
  const keys = [placeId, url].filter(Boolean);
  if (!keys.length) return null;
  const { data } = await supabase.from('leadgen_places').select('*').or(
    keys.map((k) => `place_key.eq.${JSON.stringify(k)}`).concat(url ? [`source_detail.eq.${JSON.stringify(url)}`] : []).join(','),
  ).limit(1);
  return (data && data[0]) || null;
}

/**
 * By name (+ optional place text such as "Brooklyn, NY" or a postcode, + phone). Returns the
 * matching rows, best first: exact normalised name, then same phone, then a name that
 * contains the other. `where` must appear in the row's city / region / address when given.
 */
async function placesByName({ name, where = '', phone = '', country = null, limit = 4 } = {}) {
  const want = normName(name);
  if (!want) return [];
  const token = want.split(' ').sort((a, b) => b.length - a.length)[0];
  if (!token || token.length < 3) return [];
  let q = supabase.from('leadgen_places').select('*').ilike('name', `%${token}%`).limit(60);
  if (country) q = q.eq('country', String(country).toUpperCase());
  const { data } = await q;
  const whereTokens = normName(where).split(' ').filter((t) => t.length >= 2);
  const wantPhone = digits(phone);
  const scored = [];
  for (const row of data || []) {
    const got = normName(row.name);
    const rec = row.record || {};
    const hay = normName([row.city, row.region, rec.address, rec.postalCode, rec.neighborhood, rec.state].filter(Boolean).join(' '));
    const whereOk = !whereTokens.length || whereTokens.some((t) => hay.split(' ').includes(t));
    const samePhone = wantPhone.length >= 7 && digits(row.phone) === wantPhone;
    let score = 0;
    if (got === want) score = 3; else if (samePhone) score = 2.5; else if (got.includes(want) || want.includes(got)) score = 1.5;
    if (!score || (!whereOk && !samePhone)) continue;
    scored.push({ row, score: score + (whereOk ? 0.4 : 0) + (isFresh(row) ? 0.1 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.row);
}

/** leadgen_places row → the wizard's candidate shape (googlePlacesFinder.toCandidate). */
function candidateFromPlaceRow(row) {
  const r = row.record || {};
  // hoursFromGoogle lives in googlePlacesFinder; required lazily to avoid a cycle.
  const { hoursFromGoogle } = require('./googlePlacesFinder');
  return {
    placeId: r.placeId || null,
    name: r.title || row.name,
    address: r.address || [r.street, r.city, r.state, r.postalCode].filter(Boolean).join(', '),
    street: r.street || null, city: r.city || row.city || null, state: r.state || row.region || null,
    postalCode: r.postalCode || null, countryCode: r.countryCode || row.country || null,
    neighborhood: r.neighborhood || null,
    phone: r.phone || r.phoneUnformatted || row.phone || null,
    website: r.website || null,
    category: r.categoryName || null,
    rating: typeof r.totalScore === 'number' ? r.totalScore : null,
    reviews: typeof r.reviewsCount === 'number' ? r.reviewsCount : null,
    claimed: r.claimed === true,
    description: r.description || null,
    url: r.url || row.source_detail || null,
    location: r.location && typeof r.location === 'object' ? { lat: r.location.lat, lng: r.location.lng } : null,
    socials: { instagram: r.instagram || null, facebook: r.facebook || null, tiktok: r.tiktok || null, youtube: r.youtube || null, twitter: r.twitter || null, linkedin: r.linkedin || null, pinterest: r.pinterest || null },
    openingHours: Array.isArray(r.openingHours) ? r.openingHours : [],
    businessHours: hoursFromGoogle(r.openingHours),
    imagesCount: r.imagesCount || 0,
    permanentlyClosed: false,
    source: 'stemfra_places',
    seenAt: row.last_seen_at || null,
  };
}

/** Readiness signals from a stored record (the v13 rule, same words as readinessOf). */
function signalsFromRecord(r = {}) {
  return [
    r.claimed ? 'claimed listing' : 'unclaimed listing',
    r.description ? 'owner description' : null,
    (r.ownerUpdates || 0) > 0 ? 'owner posts' : null,
    (r.imagesCount || 0) >= 20 ? `${r.imagesCount} photos` : null,
    (r.bookingLinks || []).length > 0 ? 'booking link' : null,
    (r.instagram || r.facebook || r.tiktok) ? 'social profile' : null,
  ].filter(Boolean);
}

module.exports = { placeByKey, placesByName, candidateFromPlaceRow, signalsFromRecord, isFresh, normName, FRESH_DAYS };
