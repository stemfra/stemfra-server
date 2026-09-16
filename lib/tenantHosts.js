// Brand (custom) domains: the ONE place that decides how a tenant's own
// domain gets served (2026-09-16). Every caller that used to talk to
// cloudflarePages.attachCustomDomain for a BRAND domain goes through here:
// attachSiteDomain, cms/domainController, admin/sitesController,
// domainPurchase + domainZone. Subdomains ({sub}.stemfra.com) are not this
// module's business: the wildcard Worker serves them from a sites row alone.
//
// Two mechanisms, by the TENANT_CUSTOM_HOSTNAMES flag:
//   hostname  — Cloudflare for SaaS custom hostname on the stemfra.com zone
//               (apex + www twin), HTTP-validated DV certificate, served by the
//               tenant-router Worker through the zone's `*/*` route. The owner
//               points ONE CNAME at TENANT_CNAME_TARGET. For a domain whose
//               zone WE run (Stemfra registered it, lib/domainZone) we write
//               that CNAME ourselves, DNS-ONLY: the host then enters Cloudflare
//               through the stemfra.com zone exactly like a BYO domain. No
//               Pages slot, no per-zone Worker route.
//   pages     — legacy: attach the host as a Pages custom domain on the
//               vertical's project (flag unset/false).
//
// WHY no Worker route on the domain's own zone (the first cut, 2026-09-16):
// `wrangler deploy` reconciles the script's routes on EVERY zone and deleted
// the routes it did not know about, which took cleancutsbarber.click down for
// two minutes on the next Worker deploy. Custom hostnames are Cloudflare state
// that no deploy touches. The DNS-only same-account case was proven live the
// same night (saastest.cleancutsbarber.click: hostname + cert active in 50 s).
//
// Status contract for consumers: { mode, domain, status: 'active'|'pending',
// detail, cnameTarget } — 'active' only when Cloudflare will really serve it.
const cf = require('./cloudflarePages');
const saas = require('./cloudflareCustomHostnames');
const zones = require('./cloudflareZones');

const CUSTOM_HOSTNAMES = process.env.TENANT_CUSTOM_HOSTNAMES === 'true';
// The host owners CNAME at. An originless proxied record on stemfra.com that
// is also the zone's fallback origin (scripts/setup-custom-hostnames.js).
const CNAME_TARGET = process.env.TENANT_CNAME_TARGET || 'sites.stemfra.com';

const isApex = (domain) => domain.split('.').length === 2;
const hostsOf = (domain) => (isApex(domain) ? [domain, `www.${domain}`] : [domain]);
const zoneNameOf = (domain) => (isApex(domain) ? domain : domain.split('.').slice(-2).join('.'));
const routePattern = (zoneName) => `*${zoneName}/*`; // the retired per-zone route, cleaned up on attach/detach

/** Which mechanism {domain} gets, plus our own zone for it when we run one. */
async function modeFor(domain, { managed } = {}) {
  if (!CUSTOM_HOSTNAMES) return { mode: 'pages', zone: null };
  const zone = managed === false ? null : await zones.getZoneByName(zoneNameOf(domain)).catch(() => null);
  return { mode: 'hostname', zone };
}

/** What the owner points their DNS at for {project}. */
function cnameTargetFor(project) {
  return CUSTOM_HOSTNAMES ? CNAME_TARGET : `${project}.pages.dev`;
}

/**
 * Make {domain} (and the www twin of an apex) serve the site of {project}.
 * Best-effort on the twin; the apex result is what the caller reports.
 */
async function attachBrandDomain({ project, domain, managed }) {
  const { mode, zone } = await modeFor(domain, { managed });
  const steps = {};
  if (mode === 'pages') {
    await cf.attachCustomDomain(project, domain); steps.attach = 'ok';
    if (isApex(domain)) { try { await cf.attachCustomDomain(project, `www.${domain}`); steps.attachWww = 'ok'; } catch (e) { steps.attachWww = e.message; } }
    return { mode, steps, cnameTarget: `${project}.pages.dev` };
  }
  // Our own zone: the CNAME the owner would add, written for them, DNS-only.
  if (zone) {
    for (const host of hostsOf(domain)) {
      try { await zones.replaceZoneRecords(zone.id, host, { type: 'CNAME', content: CNAME_TARGET, proxied: false }); steps[`dns:${host}`] = 'ok'; }
      catch (e) { steps[`dns:${host}`] = e.message; }
    }
    // The retired per-zone Worker route (first cut) must not linger.
    try { await saas.deleteWorkerRoute(zone.id, routePattern(zone.name)); } catch { /* best-effort */ }
  }
  const row = await saas.createCustomHostname(domain); steps.hostname = row.already ? 'existed' : 'created';
  if (isApex(domain)) { try { const w = await saas.createCustomHostname(`www.${domain}`); steps.hostnameWww = w.already ? 'existed' : 'created'; } catch (e) { steps.hostnameWww = e.message; } }
  return { mode, steps, cnameTarget: CNAME_TARGET, zoneId: zone?.id || null };
}

/** Live status of {domain}. Never throws on a missing row (status 'pending'). */
async function brandDomainStatus({ project, domain, managed, recheck = false }) {
  const { mode } = await modeFor(domain, { managed });
  if (mode === 'pages') {
    const d = await cf.getCustomDomain(project, domain);
    return { mode, domain, status: d?.status === 'active' ? 'active' : 'pending', detail: d?.status || 'missing', cnameTarget: `${project}.pages.dev` };
  }
  let row = recheck ? await saas.recheckCustomHostname(domain) : null;
  if (!row) row = await saas.findCustomHostname(domain);
  return {
    mode, domain,
    status: saas.isActive(row) ? 'active' : 'pending',
    detail: row ? `${row.status}/${row.ssl?.status || 'no-ssl'}` : 'missing',
    errors: [...(row?.verification_errors || []), ...((row?.ssl?.validation_errors || []).map((e) => e.message))],
    cnameTarget: CNAME_TARGET,
  };
}

/** Undo attachBrandDomain. Idempotent across mechanisms and the retired route. */
async function detachBrandDomain({ project, domain }) {
  const steps = {};
  // Legacy Pages attach may exist from before the switch; always clear it.
  for (const host of hostsOf(domain)) {
    try { await cf.removeCustomDomain(project, host); steps[`pages:${host}`] = 'ok'; } catch (e) { steps[`pages:${host}`] = e.message; }
  }
  if (!CUSTOM_HOSTNAMES) return { steps };
  for (const host of hostsOf(domain)) {
    try { await saas.deleteCustomHostname(host); steps[`hostname:${host}`] = 'ok'; } catch (e) { steps[`hostname:${host}`] = e.message; }
  }
  const zone = await zones.getZoneByName(zoneNameOf(domain)).catch(() => null);
  if (zone) { try { await saas.deleteWorkerRoute(zone.id, routePattern(zone.name)); steps.route = 'ok'; } catch (e) { steps.route = e.message; } }
  return { steps };
}

module.exports = { CUSTOM_HOSTNAMES, CNAME_TARGET, cnameTargetFor, attachBrandDomain, brandDomainStatus, detachBrandDomain, modeFor, isApex };
