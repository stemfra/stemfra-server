// ─── Locale defaults from the signup country (P31, 2026-09-10) ───────────────
//
// A new site used to inherit currency / time zone / locale from the Starter it
// was cloned from (all US demos), so a Canadian or British signup got a USD
// site until someone changed it in CMS Settings → Payments. This derives the
// three from the country (+ state / province when we have it) the owner gave
// at signup. US keeps the Starter's time zone unless a state is known.
const { countryIso, usStateCode } = require('./geo');

const US_TZ = {
  AL: 'America/Chicago', AK: 'America/Anchorage', AZ: 'America/Phoenix', AR: 'America/Chicago', CA: 'America/Los_Angeles',
  CO: 'America/Denver', CT: 'America/New_York', DE: 'America/New_York', DC: 'America/New_York', FL: 'America/New_York',
  GA: 'America/New_York', HI: 'Pacific/Honolulu', ID: 'America/Boise', IL: 'America/Chicago', IN: 'America/Indiana/Indianapolis',
  IA: 'America/Chicago', KS: 'America/Chicago', KY: 'America/New_York', LA: 'America/Chicago', ME: 'America/New_York',
  MD: 'America/New_York', MA: 'America/New_York', MI: 'America/Detroit', MN: 'America/Chicago', MS: 'America/Chicago',
  MO: 'America/Chicago', MT: 'America/Denver', NE: 'America/Chicago', NV: 'America/Los_Angeles', NH: 'America/New_York',
  NJ: 'America/New_York', NM: 'America/Denver', NY: 'America/New_York', NC: 'America/New_York', ND: 'America/Chicago',
  OH: 'America/New_York', OK: 'America/Chicago', OR: 'America/Los_Angeles', PA: 'America/New_York', RI: 'America/New_York',
  SC: 'America/New_York', SD: 'America/Chicago', TN: 'America/Chicago', TX: 'America/Chicago', UT: 'America/Denver',
  VT: 'America/New_York', VA: 'America/New_York', WA: 'America/Los_Angeles', WV: 'America/New_York', WI: 'America/Chicago',
  WY: 'America/Denver',
};
const CA_PROVINCE_CODE = {
  ontario: 'ON', quebec: 'QC', 'québec': 'QC', 'british columbia': 'BC', alberta: 'AB', manitoba: 'MB', saskatchewan: 'SK',
  'nova scotia': 'NS', 'new brunswick': 'NB', 'newfoundland and labrador': 'NL', 'prince edward island': 'PE',
  'northwest territories': 'NT', nunavut: 'NU', yukon: 'YT',
};
const CA_TZ = {
  ON: 'America/Toronto', QC: 'America/Toronto', BC: 'America/Vancouver', AB: 'America/Edmonton', MB: 'America/Winnipeg',
  SK: 'America/Regina', NS: 'America/Halifax', NB: 'America/Moncton', NL: 'America/St_Johns', PE: 'America/Halifax',
  NT: 'America/Yellowknife', NU: 'America/Iqaluit', YT: 'America/Whitehorse',
};

function caProvinceCode(name) {
  const raw = String(name || '').trim();
  if (!raw) return null;
  if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
  return CA_PROVINCE_CODE[raw.toLowerCase()] || null;
}

/**
 * { currency, locale, time_zone } for a signup country (+ region), or {} when
 * the country is unknown so the Starter's values stay. Only defined keys are
 * returned, so callers can spread it over the source site row.
 */
function defaultsForCountry(country, state) {
  const iso = countryIso(country);
  if (iso === 'US') {
    const code = usStateCode(state);
    return { currency: 'USD', locale: 'en-US', ...(code && US_TZ[code] ? { time_zone: US_TZ[code] } : {}) };
  }
  if (iso === 'CA') {
    const code = caProvinceCode(state);
    return { currency: 'CAD', locale: 'en-CA', time_zone: (code && CA_TZ[code]) || 'America/Toronto' };
  }
  if (iso === 'GB') return { currency: 'GBP', locale: 'en-GB', time_zone: 'Europe/London' };
  if (iso === 'IE') return { currency: 'EUR', locale: 'en-IE', time_zone: 'Europe/Dublin' };
  if (iso === 'AU') return { currency: 'AUD', locale: 'en-AU', time_zone: 'Australia/Sydney' };
  if (iso === 'NZ') return { currency: 'NZD', locale: 'en-NZ', time_zone: 'Pacific/Auckland' };
  if (iso === 'NG') return { currency: 'NGN', locale: 'en-NG', time_zone: 'Africa/Lagos' };
  return {};
}

module.exports = { defaultsForCountry, caProvinceCode, CA_PROVINCE_CODE, CA_TZ, US_TZ };
