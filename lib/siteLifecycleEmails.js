// Owner lifecycle emails for a site's publish state (ROADMAP P39k item 2,
// 2026-09-15): "Your website is live" when a site flips to live, and its
// unpublish twin. Called fire-and-forget from lib/sitePublish.js; a failure
// logs and never touches the publish itself. Skipped for the demo / Starter
// fleet (staff publish those from scripts) and for test mailboxes
// (lib/testData isTestEmail), so example.com owners never reach Resend.
// Templates: transactionalEmails siteLive / siteUnpublished; previews at
// /dev/preview/site-live and /dev/preview/site-unpublished.
const supabase = require('../config/supabase');
const { sendMail } = require('./mailer');
const { CMS_URL } = require('./cmsMagicLink');
const { publicHostFor } = require('./domainActivation');
const { isTestEmail, siteKind } = require('./testData');
const tx = require('../templates/transactionalEmails');

const ZONE = process.env.TENANT_ZONE || 'stemfra.com';

async function loadSite(siteId) {
  const { data, error } = await supabase
    .from('sites')
    .select('id, subdomain, custom_domain, metadata, company:companies(name), owner:contacts!sites_owner_contact_id_fkey(email, first_name, last_name, full_name)')
    .eq('id', siteId)
    .single();
  if (error || !data) throw new Error(`site ${siteId}: ${error?.message || 'not found'}`);
  return data;
}

function recipient(site) {
  const o = site.owner || {};
  const email = (o.email || '').trim();
  if (!email || isTestEmail(email)) return null;
  const first = o.first_name || (o.full_name ? o.full_name.split(/\s+/)[0] : null);
  const last = o.last_name || (o.full_name ? o.full_name.split(/\s+/).slice(1).join(' ') || null : null);
  return { email, firstName: first, lastName: last };
}

/**
 * Email the owner that their site is live. `to` overrides the recipient for
 * staff tests (Peter's own mailboxes only). Returns true when a send was made.
 */
async function sendSiteLiveEmail(siteId, { to = null } = {}) {
  const site = await loadSite(siteId);
  if (siteKind(site) === 'demo' && !to) return false;
  const who = to ? { email: to, firstName: site.owner?.first_name || null, lastName: site.owner?.last_name || null } : recipient(site);
  if (!who) return false;
  const mail = tx.siteLive({
    firstName: who.firstName, lastName: who.lastName,
    businessName: site.company?.name || site.subdomain,
    liveUrl: `https://${publicHostFor(site, ZONE)}`,
    dashboardUrl: CMS_URL,
  });
  await sendMail({ fromName: 'Stemfra', to: who.email, subject: mail.subject, text: mail.text, html: mail.html });
  return true;
}

async function sendSiteUnpublishedEmail(siteId, { to = null, byStaff = false } = {}) {
  const site = await loadSite(siteId);
  if (siteKind(site) === 'demo' && !to) return false;
  const who = to ? { email: to, firstName: site.owner?.first_name || null, lastName: site.owner?.last_name || null } : recipient(site);
  if (!who) return false;
  const mail = tx.siteUnpublished({
    firstName: who.firstName, lastName: who.lastName,
    businessName: site.company?.name || site.subdomain,
    liveUrl: `https://${publicHostFor(site, ZONE)}`,
    dashboardUrl: CMS_URL,
    byStaff,
  });
  await sendMail({ fromName: 'Stemfra', to: who.email, subject: mail.subject, text: mail.text, html: mail.html });
  return true;
}

module.exports = { sendSiteLiveEmail, sendSiteUnpublishedEmail };
