// Cloudflare for SaaS "Custom Hostnames" on the stemfra.com zone + Worker
// routes on tenant zones (2026-09-16, ROADMAP "Domain routing at scale" (b)).
//
// WHY: a BYO brand domain (argyleandsons.click) used to be attached as a Pages
// CUSTOM DOMAIN on its vertical's project, which burns one of the 100 slots a
// Pages project gets on the Free plan. With Cloudflare for SaaS the owner
// CNAMEs their domain at `sites.stemfra.com` (TENANT_CNAME_TARGET), Cloudflare
// issues the certificate at the edge, and the tenant-router Worker (route `*/*`
// on the stemfra.com zone) serves the site from the vertical's Pages bundle.
// 100 hostnames are included, then $0.10 per hostname per month; the fallback
// origin is an originless record because the Worker IS the origin.
//
// Raw API only. The policy of WHICH mechanism a domain gets (custom hostname vs
// a Worker route on a zone we own vs the legacy Pages attach) lives in
// lib/tenantHosts.js; keep this file free of it.
//
// Token scopes: Zone:SSL and Certificates:Edit (custom hostnames + fallback
// origin), Zone:DNS:Edit, Zone:Workers Routes:Edit, all on the account's zones.
const axios = require('axios');
const { ZONE_ID, API_TOKEN, cfHeaders } = require('../config/cloudflare');

const API = 'https://api.cloudflare.com/client/v4';
const TIMEOUT = 30000;
const WORKER_SCRIPT = process.env.TENANT_ROUTER_WORKER || 'stemfra-tenant-router';

function ensureConfigured() {
  if (!API_TOKEN || !ZONE_ID) throw new Error('Cloudflare not configured (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID).');
}
const errText = (err) => (err.response ? JSON.stringify(err.response.data) : err.message);
const errorCodes = (err) => (err.response?.data?.errors || []).map((e) => e.code);

// 1404 = "No quota has been allocated for this zone or for this account":
// Cloudflare for SaaS is not enabled on the zone (a dashboard step: SSL/TLS →
// Custom Hostnames → Enable, with payment details on the account).
class SaasNotEnabledError extends Error {
  constructor(detail) {
    super(`Cloudflare for SaaS is not enabled on the stemfra.com zone (${detail}). Enable it in the dashboard: SSL/TLS → Custom Hostnames → Enable.`);
    this.code = 'saas_not_enabled';
  }
}
function rethrow(err) {
  const codes = errorCodes(err);
  if (codes.includes(1404) || codes.includes(1456)) throw new SaasNotEnabledError(codes.join(','));
  throw new Error(errText(err));
}

// ─── Custom hostnames (BYO domains on other people's DNS) ─────────────────────

/** The custom hostname row for {hostname}, or null. */
async function findCustomHostname(hostname) {
  ensureConfigured();
  try {
    const { data } = await axios.get(`${API}/zones/${ZONE_ID}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result?.[0] || null;
  } catch (err) { rethrow(err); }
}

/**
 * Create {hostname} as a custom hostname with an HTTP-validated DV certificate.
 * Idempotent: an existing row is returned as-is. Validation runs on its own
 * once the owner's CNAME points at the target (real-time validation); the
 * Worker passes /.well-known/pki-validation/ through so the CA's check lands.
 */
async function createCustomHostname(hostname) {
  ensureConfigured();
  const existing = await findCustomHostname(hostname);
  if (existing) return { ...existing, already: true };
  try {
    const { data } = await axios.post(
      `${API}/zones/${ZONE_ID}/custom_hostnames`,
      { hostname, ssl: { method: 'http', type: 'dv', settings: { min_tls_version: '1.2' } } },
      { headers: cfHeaders, timeout: TIMEOUT },
    );
    return data.result;
  } catch (err) {
    // 1406 = hostname already exists on the zone (race with a parallel attach).
    if (errorCodes(err).includes(1406)) return { ...(await findCustomHostname(hostname)), already: true };
    rethrow(err);
  }
}

/** Ask Cloudflare to re-check the hostname now (after the owner adds DNS). */
async function recheckCustomHostname(hostname) {
  ensureConfigured();
  const row = await findCustomHostname(hostname);
  if (!row) return null;
  try {
    const { data } = await axios.patch(`${API}/zones/${ZONE_ID}/custom_hostnames/${row.id}`, { ssl: { method: 'http', type: 'dv' } }, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result;
  } catch (err) { rethrow(err); }
}

/** Remove the custom hostname. Idempotent (absent = done). */
async function deleteCustomHostname(hostname) {
  ensureConfigured();
  const row = await findCustomHostname(hostname);
  if (!row) return { success: true, already: true };
  try {
    const { data } = await axios.delete(`${API}/zones/${ZONE_ID}/custom_hostnames/${row.id}`, { headers: cfHeaders, timeout: TIMEOUT });
    return data;
  } catch (err) {
    if (err.response?.status === 404) return { success: true, already: true };
    rethrow(err);
  }
}

/** Both the hostname and its certificate must be active before traffic flows. */
function isActive(row) {
  return !!row && row.status === 'active' && row.ssl?.status === 'active';
}

// ─── Fallback origin (the zone-wide origin for every custom hostname) ─────────

async function getFallbackOrigin() {
  ensureConfigured();
  try {
    const { data } = await axios.get(`${API}/zones/${ZONE_ID}/custom_hostnames/fallback_origin`, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result;
  } catch (err) {
    if (err.response?.status === 404) return null;
    rethrow(err);
  }
}

async function setFallbackOrigin(origin) {
  ensureConfigured();
  try {
    const { data } = await axios.put(`${API}/zones/${ZONE_ID}/custom_hostnames/fallback_origin`, { origin }, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result;
  } catch (err) { rethrow(err); }
}

// ─── Worker routes on any zone in the account ────────────────────────────────
// A domain Stemfra registered has its own zone in our account (lib/domainZone),
// so it never needs a custom hostname: the tenant-router Worker is routed on
// THAT zone and the zone's own Universal SSL covers it. (A hostname that is a
// zone in the same account is not a documented Cloudflare for SaaS case, so we
// do not mix the two.)

async function listWorkerRoutes(zoneId) {
  ensureConfigured();
  try {
    const { data } = await axios.get(`${API}/zones/${zoneId}/workers/routes`, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result || [];
  } catch (err) { throw new Error(errText(err)); }
}

/** Route {pattern} on {zoneId} to the tenant-router Worker. Idempotent. */
async function ensureWorkerRoute(zoneId, pattern, script = WORKER_SCRIPT) {
  const routes = await listWorkerRoutes(zoneId);
  const hit = routes.find((r) => r.pattern === pattern);
  if (hit && (hit.script || null) === script) return { ...hit, already: true };
  try {
    if (hit) {
      const { data } = await axios.put(`${API}/zones/${zoneId}/workers/routes/${hit.id}`, { pattern, script }, { headers: cfHeaders, timeout: TIMEOUT });
      return data.result;
    }
    const { data } = await axios.post(`${API}/zones/${zoneId}/workers/routes`, { pattern, script }, { headers: cfHeaders, timeout: TIMEOUT });
    return data.result;
  } catch (err) { throw new Error(errText(err)); }
}

/** Delete the route with {pattern} on {zoneId}. Idempotent. */
async function deleteWorkerRoute(zoneId, pattern) {
  const routes = await listWorkerRoutes(zoneId);
  const hit = routes.find((r) => r.pattern === pattern);
  if (!hit) return { success: true, already: true };
  try {
    const { data } = await axios.delete(`${API}/zones/${zoneId}/workers/routes/${hit.id}`, { headers: cfHeaders, timeout: TIMEOUT });
    return data;
  } catch (err) { throw new Error(errText(err)); }
}

module.exports = {
  SaasNotEnabledError,
  WORKER_SCRIPT,
  findCustomHostname,
  createCustomHostname,
  recheckCustomHostname,
  deleteCustomHostname,
  isActive,
  getFallbackOrigin,
  setFallbackOrigin,
  listWorkerRoutes,
  ensureWorkerRoute,
  deleteWorkerRoute,
};
