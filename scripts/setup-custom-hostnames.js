#!/usr/bin/env node
// One-time Cloudflare setup for brand domains via Cloudflare for SaaS
// (lib/tenantHosts.js, ROADMAP "Domain routing at scale" (b)). Idempotent.
// DRY-RUN by default; pass --apply to make changes.
//
//   node -r dotenv/config scripts/setup-custom-hostnames.js            # plan
//   node -r dotenv/config scripts/setup-custom-hostnames.js --apply    # do it
//   node -r dotenv/config scripts/setup-custom-hostnames.js --apply --migrate
//       also moves every site's existing custom_domain onto the new mechanism
//       (custom hostname or own-zone Worker route) and, once a hostname is
//       ACTIVE, detaches the legacy Pages custom domain that held its slot.
//
// PREREQUISITE (dashboard, Peter): Cloudflare for SaaS enabled on stemfra.com
// (SSL/TLS → Custom Hostnames → Enable; payment details on the account). Until
// then steps 2 and 4 fail with "No quota has been allocated" and this script
// says so.
//
// What it does on the stemfra.com zone (CLOUDFLARE_ZONE_ID):
//   1. DNS: `sites.stemfra.com` (TENANT_CNAME_TARGET) → AAAA 100::, PROXIED.
//      The originless record the docs prescribe when a Worker is the origin;
//      it is BOTH the fallback origin and the host owners CNAME at.
//   2. Fallback origin = that host (PUT custom_hostnames/fallback_origin).
//   3. Worker routes: `*/*` → stemfra-tenant-router (custom hostnames enter the
//      zone with their own Host, so the `*.stemfra.com/*` route never matches
//      them) + a no-Worker BYPASS for the apex `stemfra.com/*` (the marketing
//      site). Existing infra bypass routes (api/cms/crm/www…) keep winning.
//   4. --migrate: per site with a custom_domain → tenantHosts.attachBrandDomain;
//      then, for each hostname/route that is active, remove the Pages attach.
//
// Token scopes: Zone:DNS:Edit, Zone:Workers Routes:Edit, Zone:SSL and
// Certificates:Edit (custom hostnames), Cloudflare Pages:Edit (the detach).
require('dotenv').config();
const supabase = require('../config/supabase');
const { upsertDnsRecord, listDnsRecords, resolveZoneId } = require('../lib/cloudflareDns');
const saas = require('../lib/cloudflareCustomHostnames');
const cf = require('../lib/cloudflarePages');
const { projectFor } = require('../lib/verticalConfig');

const ZONE = 'stemfra.com';
const TARGET = process.env.TENANT_CNAME_TARGET || 'sites.stemfra.com';
const APPLY = process.argv.includes('--apply');
const MIGRATE = process.argv.includes('--migrate');
const say = (s) => console.log(s);

(async () => {
  const zoneId = await resolveZoneId({ zoneName: ZONE });
  say(`zone ${ZONE} = ${zoneId}   mode: ${APPLY ? 'APPLY' : 'DRY-RUN (pass --apply)'}${MIGRATE ? ' + MIGRATE' : ''}\n`);

  // ── 0. is Cloudflare for SaaS on? ─────────────────────────────────────────
  let saasOn = true;
  try { await saas.getFallbackOrigin(); }
  catch (e) { if (e.code === 'saas_not_enabled') { saasOn = false; say(`0. ${e.message}\n   → steps 2 and 4 wait for that; steps 1 and 3 can run now.\n`); } else throw e; }
  if (saasOn) say('0. Cloudflare for SaaS is enabled on the zone\n');

  // ── 1. the originless target record ───────────────────────────────────────
  const recs = await listDnsRecords({ zoneId, name: TARGET });
  const have = recs.find((r) => r.type === 'AAAA' && r.content === '100::' && r.proxied);
  if (have) say(`1. ${TARGET} → AAAA 100:: proxied exists`);
  else if (APPLY) {
    // A wildcard A record also matches this name; a specific record wins at DNS.
    await upsertDnsRecord({ zoneId, type: 'AAAA', name: TARGET, content: '100::', proxied: true, comment: 'Cloudflare for SaaS fallback origin + CNAME target (tenant-router Worker is the origin)' });
    say(`1. created ${TARGET} → AAAA 100:: proxied`);
  } else say(`1. would create ${TARGET} → AAAA 100:: proxied`);

  // ── 2. fallback origin ────────────────────────────────────────────────────
  if (saasOn) {
    const fo = await saas.getFallbackOrigin();
    if (fo?.origin === TARGET) say(`2. fallback origin = ${TARGET} (${fo.status})`);
    else if (APPLY) { const r = await saas.setFallbackOrigin(TARGET); say(`2. fallback origin set to ${TARGET} (${r?.status || 'pending'})`); }
    else say(`2. would set fallback origin ${fo?.origin || '(none)'} → ${TARGET}`);
  } else say('2. fallback origin: skipped (SaaS not enabled)');

  // ── 3. Worker routes ──────────────────────────────────────────────────────
  const routes = await saas.listWorkerRoutes(zoneId);
  const byPattern = Object.fromEntries(routes.map((r) => [r.pattern, r]));
  // Bypass BEFORE the catch-all, so the apex never routes to the Worker even
  // for a second (a Worker-less route is the most specific match and wins).
  // The catch-all itself is refused by Cloudflare (100327) until Cloudflare for
  // SaaS is on; `sites.stemfra.com` already matches `*.stemfra.com/*`.
  const want = [
    { pattern: `${ZONE}/*`, script: null, why: 'apex = marketing site, never the tenant router' },
    { pattern: '*/*', script: saas.WORKER_SCRIPT, why: 'custom hostnames arrive with their own Host' },
  ];
  let catchAll = false;
  for (const w of want) {
    const cur = byPattern[w.pattern];
    if (cur && (cur.script || null) === w.script) { say(`3. route ${w.pattern} → ${w.script || 'no Worker'} exists`); if (w.pattern === '*/*') catchAll = true; continue; }
    if (!APPLY) { say(`3. would ${cur ? 'update' : 'create'} route ${w.pattern} → ${w.script || 'no Worker'}  (${w.why})`); continue; }
    try {
      await saas.ensureWorkerRoute(zoneId, w.pattern, w.script);
      say(`3. ${cur ? 'updated' : 'created'} route ${w.pattern} → ${w.script || 'no Worker'}  (${w.why})`);
      if (w.pattern === '*/*') catchAll = true;
    } catch (e) {
      if (/100327/.test(e.message)) say(`3. route ${w.pattern}: waits for Cloudflare for SaaS (100327: wildcard host needs it)`);
      else throw e;
    }
  }
  if (catchAll) say('   ↳ list { pattern = "*/*", zone_name = "stemfra.com" } in workers/tenant-router/wrangler.toml too, so a redeploy keeps it');
  const bypasses = routes.filter((r) => !r.script).map((r) => r.pattern).sort();
  say(`   existing no-Worker bypasses: ${bypasses.join(', ') || '(none)'}`);

  // ── 4. migrate existing brand domains ─────────────────────────────────────
  if (!MIGRATE) { say('\n4. migration: pass --migrate to move existing custom domains'); return; }
  if (process.env.TENANT_CUSTOM_HOSTNAMES !== 'true') { say('\n4. migration needs TENANT_CUSTOM_HOSTNAMES=true in the env this script runs with'); return; }
  const tenantHosts = require('../lib/tenantHosts');
  const { data: sites, error } = await supabase.from('sites')
    .select('id, subdomain, custom_domain, vertical:verticals(slug)')
    .not('custom_domain', 'is', null).is('deleted_at', null);
  if (error) throw error;
  say(`\n4. ${sites.length} site(s) with a custom domain`);
  for (const s of sites) {
    const project = projectFor(s.vertical?.slug);
    const { mode } = await tenantHosts.modeFor(s.custom_domain);
    if (!APPLY) { say(`   would attach ${s.custom_domain} (${s.subdomain}) as ${mode}`); continue; }
    try {
      const a = await tenantHosts.attachBrandDomain({ project, domain: s.custom_domain });
      const st = await tenantHosts.brandDomainStatus({ project, domain: s.custom_domain });
      say(`   ${s.custom_domain} (${s.subdomain}): ${a.mode} ${JSON.stringify(a.steps)} → ${st.status} (${st.detail})`);
      if (st.status === 'active') {
        for (const host of tenantHosts.isApex(s.custom_domain) ? [s.custom_domain, `www.${s.custom_domain}`] : [s.custom_domain]) {
          const r = await cf.removeCustomDomain(project, host);
          say(`     Pages ${host}: ${r.already ? 'was not attached' : 'detached'}`);
        }
      } else say('     Pages attach kept until the new mechanism is active (rerun later)');
    } catch (e) { say(`   ${s.custom_domain}: ERROR ${e.message}`); }
  }
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
