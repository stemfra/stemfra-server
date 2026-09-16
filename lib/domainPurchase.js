// Shared domain purchase orchestration (2026-08-10). ONE place that turns a
// paid-for registrar purchase into a fully wired tenant domain, used by BOTH
// the staff path (controllers/admin/domainsController.registerDomain) and the
// owner instant path (controllers/cms/domainController.registerOwn). Keep the
// two callers on this — never inline the steps again (they drifted once).
//
// Every post-purchase step is best-effort: once the registrar charge has
// happened we must never lose that fact to a DNS/Cloudflare hiccup — we record
// the failing step and carry on.
const supabase = require('../config/supabase');
const registrar = require('./registrar');
const { projectFor } = require('./verticalConfig');
const { provisionDomainZone } = require('./domainZone');
const tenantHosts = require('./tenantHosts');

// Registers `availability.domain` (a fresh checkDomain result) for `site` and
// wires everything: Porkbun apex ALIAS + www CNAME → CF Pages attach → CF zone
// + NS delegation + Email Routing (Case 7) → sites.custom_domain.
// Returns { orderId, target, steps }. Throws ONLY if the registrar purchase
// itself fails (nothing spent yet).
async function purchaseAndWire({ site, availability }) {
  const reg = registrar.active();
  const result = await reg.register(availability.domain, {
    costCents: availability.costCents, whoisPrivacy: true, dryRun: false,
  });

  const project = projectFor(site.vertical?.slug);
  const target = tenantHosts.cnameTargetFor(project);
  const steps = {};
  // Porkbun records serve during the nameserver hand-over (legacy Pages mode);
  // under custom hostnames the site answers once the Cloudflare zone below is
  // active, which lib/domainActivation already waits for ("propagating").
  try { await reg.createDnsRecord(availability.domain, { type: 'ALIAS', name: '', content: target }); steps.apex = 'ok'; }
  catch (e) { steps.apex = e.message; }
  try { await reg.createDnsRecord(availability.domain, { type: 'CNAME', name: 'www', content: target }); steps.www = 'ok'; }
  catch (e) { steps.www = e.message; }
  // Zone first (Case 7), THEN the brand-domain attach: once the zone exists in
  // our account, lib/tenantHosts serves the domain with a Worker route on that
  // zone (no custom hostname, no Pages slot). Apex and www are both covered
  // (www 522'd on argyleandsons.click 2026-08-18 when only the apex was attached).
  try { const z = await provisionDomainZone(availability.domain, target); Object.assign(steps, z.steps); }
  catch (e) { steps.zone = e.message; }
  try { const a = await tenantHosts.attachBrandDomain({ project, domain: availability.domain, managed: true }); steps.attach = a.mode; Object.assign(steps, a.steps); }
  catch (e) { steps.attach = e.message; }
  await supabase.from('sites').update({ custom_domain: availability.domain }).eq('id', site.id);
  // Not public until DNS really serves it (lib/domainActivation.js): the CMS
  // keeps sending people to the stemfra.com address until 'active'.
  try { await require('./domainActivation').markPropagating(site.id, availability.domain); } catch { /* best-effort */ }

  return { orderId: result.orderId, target, steps };
}

module.exports = { purchaseAndWire };
