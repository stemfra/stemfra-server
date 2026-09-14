// googlePlacesFinder — "Find my business on Google" for the setup wizard (P39
// onboarding v2, 2026-09-14, Peter: owners arriving from ads type their business
// name and we pull the Google Business Profile facts, the same data lead-gen
// stores as the prefill snapshot).
//
// Runs the Apify Google Maps Scraper synchronously (compass~crawler-google-places,
// run-sync-get-dataset-items) for ONE search string in ONE location, a handful of
// places, no paid add-ons (no reviews, no contacts enrichment: socials therefore
// arrive only when Google lists them on the profile itself). Returns candidates
// shaped for the wizard plus a `businessHours` JSON ready for sites.business_hours.
// Facts only, never review text or photo URLs (Google's terms; same rule as the
// lead snapshot). Cost: a fraction of a cent per place on the pay-per-event plan.
const APIFY_ACTOR = 'compass~crawler-google-places';
const MAX_PLACES = 4;
const TIMEOUT_S = 90;

function configured() { return !!process.env.APIFY_TOKEN; }

const DAY_KEY = { monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu', friday: 'fri', saturday: 'sat', sunday: 'sun' };

/** "10 AM" / "10:30 PM" / "9am" → "HH:MM" (24 h); null when unreadable. */
function to24h(s) {
  const m = String(s || '').replace(/ | /g, ' ').trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toLowerCase() === 'p') h += 12;
  return `${String(h).padStart(2, '0')}:${m[2] || '00'}`;
}

/**
 * Apify openingHours [{ day: 'Monday', hours: '10 AM to 8 PM' | 'Closed' | 'Open 24 hours' }]
 * → our HoursJson { mon: { open, close, closed }, … }. Days Google does not list
 * are marked closed. Split shifts ("9 AM to 1 PM, 2 to 6 PM") keep the first
 * opening and the last closing (the site shows one window per day).
 */
function hoursFromGoogle(openingHours) {
  if (!Array.isArray(openingHours) || openingHours.length === 0) return null;
  const out = {};
  for (const key of Object.values(DAY_KEY)) out[key] = { closed: true };
  let readable = 0;
  for (const row of openingHours) {
    const key = DAY_KEY[String(row?.day || '').toLowerCase()];
    if (!key) continue;
    const text = String(row.hours || '').replace(/ | /g, ' ').trim();
    if (/closed/i.test(text)) continue;
    if (/open 24 hours/i.test(text)) { out[key] = { open: '00:00', close: '23:59', closed: false }; readable++; continue; }
    const times = text.match(/\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?/gi) || [];
    if (times.length < 2) {
      // "9 to 5 PM": the first time borrows the meridiem of the last one.
      const loose = text.match(/(\d{1,2}(?::\d{2})?)\s*(?:to|–|-)\s*(\d{1,2}(?::\d{2})?\s*[ap]\.?m\.?)/i);
      if (!loose) continue;
      const close = to24h(loose[2]);
      const mer = /p/i.test(loose[2].slice(-3)) ? 'PM' : 'AM';
      let open = to24h(`${loose[1]} ${mer}`);
      // "9 to 5 PM" opens in the morning: if borrowing PM puts the opening after
      // the closing, the opening was the other half of the day.
      if (open && close && open >= close) open = to24h(`${loose[1]} ${mer === 'PM' ? 'AM' : 'PM'}`);
      if (open && close) { out[key] = { open, close, closed: false }; readable++; }
      continue;
    }
    const open = to24h(times[0]);
    const close = to24h(times[times.length - 1]);
    if (open && close) { out[key] = { open, close, closed: false }; readable++; }
  }
  return readable ? out : null;
}

function first(arr) { return Array.isArray(arr) && arr.length ? arr[0] : null; }

/** The wizard-facing candidate: facts the site can use, nothing else. */
function toCandidate(p) {
  return {
    placeId: p.placeId || null,
    name: p.title || '',
    address: p.address || [p.street, p.city, p.state, p.postalCode].filter(Boolean).join(', '),
    street: p.street || null, city: p.city || null, state: p.state || null, postalCode: p.postalCode || null, countryCode: p.countryCode || null,
    neighborhood: p.neighborhood || null,
    phone: p.phone || p.phoneUnformatted || null,
    website: p.website || null,
    category: p.categoryName || null,
    rating: typeof p.totalScore === 'number' ? p.totalScore : null,
    reviews: typeof p.reviewsCount === 'number' ? p.reviewsCount : null,
    claimed: p.claimThisBusiness === false,
    description: p.description || p.ownerDescription || null,
    url: p.url || null,
    location: p.location && typeof p.location === 'object' ? { lat: p.location.lat, lng: p.location.lng } : null,
    socials: {
      instagram: first(p.instagrams), facebook: first(p.facebooks), tiktok: first(p.tiktoks),
      youtube: first(p.youtubes), twitter: first(p.twitters), linkedin: first(p.linkedIns), pinterest: first(p.pinterests),
    },
    openingHours: Array.isArray(p.openingHours) ? p.openingHours : [],
    businessHours: hoursFromGoogle(p.openingHours),
    imagesCount: p.imagesCount || 0,
    permanentlyClosed: p.permanentlyClosed === true,
  };
}

/**
 * Search Google Maps for a business by name near a place. `where` is free text
 * ("Brooklyn, NY", "Austin, Texas", a postcode); Apify geocodes it.
 */
async function findBusiness({ name, where, country = 'US' }) {
  if (!configured()) throw new Error('APIFY_TOKEN is not set on the server');
  const q = String(name || '').trim();
  if (!q) throw new Error('Type the business name');
  const input = {
    searchStringsArray: [q],
    locationQuery: [String(where || '').trim(), country === 'US' ? 'USA' : country].filter(Boolean).join(', '),
    maxCrawledPlacesPerSearch: MAX_PLACES,
    language: 'en',
    skipClosedPlaces: false,
    scrapeContacts: false,
    scrapeReviewsPersonalData: false,
    maxReviews: 0,
    maxImages: 0,
  };
  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?timeout=${TIMEOUT_S}&clean=true`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), (TIMEOUT_S + 15) * 1000);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.APIFY_TOKEN}` },
      body: JSON.stringify(input),
      signal: ctrl.signal,
    });
    const body = await r.json().catch(() => null);
    if (!r.ok) {
      const msg = body?.error?.message || `Apify ${r.status}`;
      throw new Error(msg);
    }
    const items = Array.isArray(body) ? body : [];
    return items.filter((p) => p && p.title).map(toCandidate);
  } finally { clearTimeout(t); }
}

module.exports = { findBusiness, hoursFromGoogle, toCandidate, configured };
