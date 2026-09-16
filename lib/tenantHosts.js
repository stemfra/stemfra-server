// Brand (custom) domains: the ONE place that decides how a tenant's own
// domain gets served (2026-09-16). Every caller that used to talk to
// cloudflarePages.attachCustomDomain for a BRAND domain goes through here:
// attachSiteDomain, cms/domainController, admin/sitesController,
// domainPurchase + domainZone. Subdomains ({sub}.stemfra.com) are not this
// module's business: the wildcard Worker serves them from a sites row alone.
//
// Three mechanisms, chosen per domain:
//   pages     — legacy: attach the host as a Pages custom domain on the
//               vertical's project (TENANT_CUSTOM_HOSTNAMES unset/false).
//   hostname  — Cloudflare for SaaS custom hostname on the stemfra.com zone
//               for a domain whose DNS lives elsewhere (BYO). The owner CNAMEs
//               it at TENANT_CNAME_TARGET; the tenant-router Worker (route */*)
//               serves it. No Pages slot.
//   zone      — the domain is a zone in OUR account (Stemfra registered it,
//               lib/domainZone): the Worker gets a route on that zone and the
//               zone's records point at an originless proxied A. No custom
//               hostname either (a hostname that is also a zone in the same
//               account is not a documented Cloudflare for SaaS case).
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
// Documentation IP (TEST-NET-1): never answers, so an orange-clouded record
// only exists to bring the host to the edge where the Worker route serves it.
const ORIGINLESS_IP = '192.0.2.1';

const isApex = (domain) => domain.split('.').length === 2;
const hostsOf = (domain) => (isApex(domain) ? [domain, `www.${domain}`] : [domain]);
const routePattern = (domain) => `*${domain}/*`; // apex + every subdomain of the zone

/** Which mechanism {domain} gets. `managed` = Stemfra registered it (own zone). */
async function modeFor(domain, { managed } = {}) {
  if (!CUSTOM_HOSTNAMES) return { mode: 'pages', zone: null };
  const zone = managed === false ? null : await zones.getZoneByName(isApex(domain) ? domain : domain.split('.').slice(-2).join('.')).catch(() => null);
  if (zone) return { mode: 'zone', zone };
  return { mode: 'hostname', zone: null };
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
  if (mode === 'zone') {
    await saas.ensureWorkerRoute(zone.id, routePattern(zone.name)); steps.route = 'ok';
    for (const host of hostsOf(domain)) {
      try { await zones.createZoneRecord(zone.id, { type: 'A', name: host, content: ORIGINLESS_IP, proxied: true }); steps[`dns:${host}`] = 'ok'; }
      catch (e) { steps[`dns:${host}`] = e.message; }
    }
    return { mode, steps, cnameTarget: CNAME_TARGET, zoneId: zone.id };
  }
  const row = await saas.createCustomHostname(domain); steps.hostname = row.already ? 'existed' : 'created';
  if (isApex(domain)) { try { const w = await saas.createCustomHostname(`www.${domain}`); steps.hostnameWww = w.already ? 'existed' : 'created'; } catch (e) { steps.hostnameWww = e.message; } }
  return { mode, steps, cnameTarget: CNAME_TARGET };
}

/** Live status of {domain}. Never throws on a missing row (status 'pending'). */
async function brandDomainStatus({ project, domain, managed, recheck = false }) {
  const { mode, zone } = await modeFor(domain, { managed });
  if (mode === 'pages') {
    const d = await cf.getCustomDomain(project, domain);
    return { mode, domain, status: d?.status === 'active' ? 'active' : 'pending', detail: d?.status || 'missing', cnameTarget: `${project}.pages.dev` };
  }
  if (mode === 'zone') {
    // Our zone: served the moment the zone is active at the registrar.
    const active = zone.status === 'active';
    return { mode, domain, status: active ? 'active' : 'pending', detail: `zone ${zone.status}`, cnameTarget: CNAME_TARGET };
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

/** Undo attachBrandDomain. Idempotent across all three mechanisms. */
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
  const zone = await zones.getZoneByName(isApex(domain) ? domain : domain.split('.').slice(-2).join('.')).catch(() => null);
  if (zone) { try { await saas.deleteWorkerRoute(zone.id, routePattern(zone.name)); steps.route = 'ok'; } catch (e) { steps.route = e.message; } }
  return { steps };
}

module.exports = { CUSTOM_HOSTNAMES, CNAME_TARGET, ORIGINLESS_IP, cnameTargetFor, attachBrandDomain, brandDomainStatus, detachBrandDomain, modeFor, routePattern, isApex };
