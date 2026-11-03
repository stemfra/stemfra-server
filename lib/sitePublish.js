// Publishing requires website completeness. Payment is managed separately
// (Peter, 2026-11-02); publishing does not collect or require a subscription.
const supabase = require('../config/supabase');
const { evaluateCompleteness } = require('./siteCompleteness');
const { attachSiteDomain } = require('./attachSiteDomain');

// Has the site cleared platform billing (System A)?
async function getBillingStatus(siteId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, provider, current_period_end')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`billing lookup: ${error.message}`);
  const required = false;
  return { status: data?.status || null, required, active: data?.status === 'active' && (!required || (data.provider === 'whop' && new Date(data.current_period_end).getTime() > Date.now())) };
}

/**
 * Publish a site: previewing → live. Throws a tagged Error if a gate fails
 * (err.code: 'not_ready' | 'bad_state').
 * @param {string} siteId
 * @param {object} [opts]
 */
async function publishSite(siteId) {
  const { data: site, error } = await supabase
    .from('sites').select('id, status, subdomain').eq('id', siteId).single();
  if (error || !site) throw new Error(`site ${siteId} not found: ${error?.message}`);
  if (site.status === 'live') return { siteId, status: 'live', alreadyLive: true };
  if (!['previewing', 'pending_domain', 'onboarding'].includes(site.status)) {
    const e = new Error(`cannot publish from status "${site.status}"`); e.code = 'bad_state'; throw e;
  }

  const completeness = await evaluateCompleteness(siteId);
  if (!completeness.ready) {
    const e = new Error('Site is not ready to publish: required items are incomplete.');
    e.code = 'not_ready'; e.completeness = completeness; throw e;
  }

  // Ensure the host is attached to its vertical project (idempotent). Best-effort
  // so a transient Cloudflare hiccup doesn't strand a paid, complete site — the
  // attach can be retried; the status flip is what "live" means.
  let domain = null;
  try {
    domain = await attachSiteDomain(siteId);
  } catch (err) {
    domain = { error: err.message };
  }

  const { error: upErr } = await supabase
    .from('sites')
    .update({ status: 'live', went_live_at: new Date().toISOString() })
    .eq('id', siteId);
  if (upErr) throw new Error(`status→live: ${upErr.message}`);
  // Audit (found missing in the #8 rehearsal, 2026-08-19): best-effort site_activity row.
  try {
    const { logSiteActivity } = require('./activity');
    await logSiteActivity({ siteId, action: 'site_published', actorName: 'owner', entityType: 'site', entityId: siteId, entityName: site.subdomain, details: { subdomain: site.subdomain, domain: domain && !domain.error ? domain.domainStatus || 'attached' : null } });
  } catch { /* never block publish on audit */ }

  // "Your website is live" to the owner (P39k, 2026-09-15). Fire-and-forget;
  // the publish is already committed above, so a mail failure only logs.
  try {
    const { sendSiteLiveEmail } = require('./siteLifecycleEmails');
    sendSiteLiveEmail(siteId).catch(err => console.error('[sitePublish] live email failed:', err.message));
  } catch (err) { console.error('[sitePublish] live email failed:', err.message); }

  // (`billing` was dropped with the payment gate; referencing it here threw
  // "billing is not defined" AFTER the site went live → the CMS got a 500 and
  // kept showing "Not published" until reload. Found in the Clean Cuts run.)
  return { siteId, status: 'live', subdomain: site.subdomain, domain };
}

/** Unpublish: live → previewing (keeps the host attached). */
async function unpublishSite(siteId, opts = {}) {
  const { data: site, error } = await supabase.from('sites').select('id, status').eq('id', siteId).single();
  if (error || !site) throw new Error(`site ${siteId} not found: ${error?.message}`);
  if (site.status === 'suspended') {
    const e = new Error('This website is suspended. Resolve its status before changing publication.');
    e.code = 'bad_state'; throw e;
  }
  if (site.status === 'previewing') return { siteId, status: 'previewing', already: true };
  const { error: upErr } = await supabase.from('sites').update({ status: 'previewing' }).eq('id', siteId);
  // Audit (2026-08-19): the support site went previewing with no trail; never again.
  try { const { logSiteActivity } = require('./activity'); await logSiteActivity({ siteId, action: 'site_unpublished', actorName: opts?.actorName || 'unknown', entityType: 'site', entityId: siteId, entityName: site.subdomain, details: {} }); } catch { /* best-effort */ }
  if (upErr) throw new Error(`status→previewing: ${upErr.message}`);
  // The unpublish twin of the live email (P39k, 2026-09-15). The owner path
  // passes actorName 'owner'; anything else (staff, scripts) is named as
  // Stemfra support in the mail so the owner is not surprised.
  try {
    const { sendSiteUnpublishedEmail } = require('./siteLifecycleEmails');
    const byStaff = (opts?.actorName || 'unknown') !== 'owner';
    sendSiteUnpublishedEmail(siteId, { byStaff }).catch(err => console.error('[sitePublish] unpublished email failed:', err.message));
  } catch (err) { console.error('[sitePublish] unpublished email failed:', err.message); }
  return { siteId, status: 'previewing' };
}

module.exports = { publishSite, unpublishSite, getBillingStatus };
