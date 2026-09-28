// The ONE way to read a caller's address (P45, 2026-09-28).
//
// Every limiter used to take the FIRST value of x-forwarded-for. That value is
// written by the caller: a script that sends a different x-forwarded-for on
// each request got a fresh limiter bucket each time and was never limited
// (proved locally: 35 requests with a rotating header, 35 x 200).
//
// Forwarded headers are only as trustworthy as whoever wrote them:
//   production  the request comes through Cloudflare, then our proxy (Traefik).
//               1. cf-connecting-ip: written by Cloudflare at the edge, which
//                  overwrites whatever the caller sent.
//               2. the LAST hop of x-forwarded-for: appended by our own proxy,
//                  so it is the address that proxy saw.
//   elsewhere   no proxy writes anything, so every forwarded header is the
//               caller's own text: use the socket address.
//
// TRUST_FORWARDED=true|false overrides the production default (for a staging
// box behind the same proxies, or a production box with none).
//
// Residual risk, recorded in ROADMAP P45: a caller who reaches the origin
// without passing Cloudflare can write cf-connecting-ip himself. The fix is at
// the firewall (accept only Cloudflare's ranges on 443), not here.
//
// Never use the first x-forwarded-for value for a limit or a cap again.
const TRUST = process.env.TRUST_FORWARDED != null
  ? /^(1|true|yes)$/i.test(process.env.TRUST_FORWARDED)
  : process.env.NODE_ENV === 'production';

function clientIp(req) {
  if (TRUST) {
    const h = req?.headers || {};
    const cf = String(h['cf-connecting-ip'] || '').trim();
    if (cf) return cf.slice(0, 64);
    const hops = String(h['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1].slice(0, 64);
  }
  return String(req?.socket?.remoteAddress || req?.ip || 'unknown').slice(0, 64);
}

module.exports = { clientIp };
