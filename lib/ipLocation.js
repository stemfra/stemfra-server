// ipLocation — "near Brooklyn, New York, United States" for a request (security
// notices, 2026-09-15; Facebook's sign-in alert is the reference). Two sources:
//   1. Cloudflare's visitor-location headers (cf-ipcity / cf-region /
//      cf-ipcountry) when the request came through the proxy with the
//      "Add visitor location headers" managed transform on: free, instant.
//   2. Otherwise one HTTPS lookup of the IP at ipwho.is (no key, free tier,
//      3 s cap, cached in memory), skipped for private and loopback addresses.
// Never throws: a failed lookup gives null and the email simply omits the row.
const cache = new Map(); // ip → { label, at }
const TTL_MS = 6 * 60 * 60 * 1000;

const PRIVATE = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc|fd|fe80)/i;

function fromCloudflare(req) {
  const h = req?.headers || {};
  const city = h['cf-ipcity'] || null;
  const region = h['cf-region'] || null;
  const country = h['cf-ipcountry'] && h['cf-ipcountry'] !== 'XX' && h['cf-ipcountry'] !== 'T1' ? h['cf-ipcountry'] : null;
  if (!city && !region && !country) return null;
  return { city, region, country: countryName(country) };
}

function countryName(code) {
  if (!code) return null;
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(String(code).toUpperCase()) || code; } catch { return code; }
}

async function lookup(ip) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 3000);
  try {
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,city,region,country`, { signal: ctrl.signal });
    const j = await r.json().catch(() => null);
    if (!j || j.success === false) return null;
    return { city: j.city || null, region: j.region || null, country: j.country || null };
  } catch {
    return null;
  } finally { clearTimeout(t); }
}

function label(loc) {
  if (!loc) return null;
  const parts = [loc.city, loc.region, loc.country].filter(Boolean);
  // "New York, New York, United States" reads better as "New York, United States".
  const dedup = parts.filter((p, i) => i === 0 || p !== parts[i - 1]);
  return dedup.length ? dedup.join(', ') : null;
}

/** Human location for a request's client IP; null when unknown. */
async function locationForRequest(req, ip) {
  const cf = fromCloudflare(req);
  if (cf) return label(cf);
  if (!ip || PRIVATE.test(ip)) return null;
  const hit = cache.get(ip);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.label;
  const out = label(await lookup(ip));
  cache.set(ip, { label: out, at: Date.now() });
  return out;
}

module.exports = { locationForRequest, label };
