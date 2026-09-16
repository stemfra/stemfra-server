// Case 7 orchestrator — after a Porkbun registration succeeds, move the
// domain's DNS onto a Cloudflare zone in our account and switch Email Routing
// on (Case 11). Shared by BOTH register paths (owner cms/domainController +
// staff admin/domainsController) so they can't drift.
//
// Every step is best-effort and reported in `steps` — a partial failure never
// loses the purchase (same convention as the register controllers). The
// Porkbun ALIAS/www records the caller already created stay in place: they
// serve during the NS-delegation window (minutes to ~48h) and are simply
// ignored once Cloudflare's nameservers take over.
const zones = require('./cloudflareZones');
const registrar = require('./registrar');

/**
 * @param {string} domain      apex domain just registered (e.g. myspa.com)
 * @param {string} pagesTarget {project}.pages.dev (legacy mode) or the tenant CNAME target
 * @returns {{ zoneId, nameServers, zoneStatus, steps }}
 */
async function provisionDomainZone(domain, pagesTarget) {
  const steps = {};
  let zone = null;

  // 1. Zone in our Cloudflare account (idempotent).
  try {
    const r = await zones.createZone(domain);
    zone = r.zone;
    steps.zone = r.created ? 'created' : 'existed';
  } catch (e) {
    steps.zone = e.message;
    return { zoneId: null, nameServers: null, zoneStatus: null, steps };
  }

  // 2. Delegate the domain to the zone's assigned nameservers at Porkbun.
  const ns = zone.name_servers || [];
  if (ns.length >= 2) {
    try {
      await registrar.active().updateNameServers(domain, ns);
      steps.nameservers = 'ok';
    } catch (e) {
      steps.nameservers = e.message;
    }
  } else {
    steps.nameservers = 'no nameservers assigned yet';
  }

  // 3. Site records in the zone, apex + www. Legacy mode: PROXIED CNAME → the
  //    Pages project (Cloudflare flattens the apex CNAME). Custom-hostnames mode
  //    (TENANT_CUSTOM_HOSTNAMES): a DNS-ONLY CNAME → the tenant target, the same
  //    record a BYO owner adds; the custom hostname on stemfra.com (created by
  //    lib/tenantHosts.attachBrandDomain right after this) serves it.
  const { CUSTOM_HOSTNAMES, CNAME_TARGET } = require('./tenantHosts');
  const rec = (name) => (CUSTOM_HOSTNAMES
    ? { type: 'CNAME', name, content: CNAME_TARGET, proxied: false }
    : { type: 'CNAME', name, content: pagesTarget, proxied: true });
  try {
    await zones.createZoneRecord(zone.id, rec(domain));
    steps.zoneApex = 'ok';
  } catch (e) { steps.zoneApex = e.message; }
  try {
    await zones.createZoneRecord(zone.id, rec(`www.${domain}`));
    steps.zoneWww = 'ok';
  } catch (e) { steps.zoneWww = e.message; }

  // 4. Email Routing on — Cloudflare inserts the MX/SPF records itself; it
  //    becomes functional as soon as the zone activates. Free forwarding is a
  //    perk of every Stemfra-registered domain (Case 11 v1 decision).
  try {
    await zones.enableEmailRouting(zone.id);
    steps.emailRouting = 'ok';
  } catch (e) { steps.emailRouting = e.message; }

  return { zoneId: zone.id, nameServers: ns, zoneStatus: zone.status || 'pending', steps };
}

module.exports = { provisionDomainZone };
