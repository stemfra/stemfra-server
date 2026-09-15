// Account security notices (ROADMAP P39k item 3, 2026-09-15). The CMS calls
// POST /api/cms/security/event after a successful password change or 2FA
// change, and POST /api/cms/security/session on every sign-in with a device
// id it keeps in localStorage. Both paths end here: an email in the Stemfra
// register (transactionalEmails accountSecurity) plus a `security` row in
// cms_notifications for every site the owner runs (the locked category, so
// the bell always shows it). Emails to test mailboxes are skipped.
const supabase = require('../config/supabase');
const { sendMail } = require('./mailer');
const { CMS_URL } = require('./cmsMagicLink');
const { TEST_EMAIL_DOMAINS } = require('./testData');

// Security notices skip only the test DOMAINS (example.com, stemfra.com):
// Peter's own end-to-end mailboxes in TEST_EMAILS must still get them, the
// whole point is proving the notice reaches a real inbox.
function isTestDomain(email) {
  const domain = String(email || '').toLowerCase().split('@')[1] || '';
  return !domain || TEST_EMAIL_DOMAINS.includes(domain);
}
const tx = require('../templates/transactionalEmails');

const KINDS = new Set(Object.keys(tx.SECURITY_COPY));

function clientIp(req) {
  return (req?.headers?.['cf-connecting-ip'] || (req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim() || req?.ip || '').slice(0, 64) || null;
}

// "Chrome on Mac" from a user agent; enough for a "was this you" mail.
function describeDevice(ua) {
  const s = String(ua || '');
  if (!s) return null;
  const browser = /Edg\//.test(s) ? 'Edge' : /OPR\//.test(s) ? 'Opera' : /Firefox\//.test(s) ? 'Firefox' : /Chrome\//.test(s) ? 'Chrome' : /Safari\//.test(s) ? 'Safari' : 'a browser';
  const os = /iPhone|iPad/.test(s) ? 'iPhone or iPad' : /Android/.test(s) ? 'Android' : /Macintosh/.test(s) ? 'Mac' : /Windows/.test(s) ? 'Windows' : /Linux/.test(s) ? 'Linux' : 'an unknown device';
  return `${browser} on ${os}`;
}

function whenLabel(d = new Date()) {
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC';
}

async function ownerContext(authUserId) {
  const { data: contact } = await supabase.from('contacts').select('id, first_name, full_name').eq('auth_user_id', authUserId).maybeSingle();
  let sites = [];
  if (contact?.id) {
    const { data } = await supabase.from('sites').select('id').eq('owner_contact_id', contact.id);
    sites = data || [];
  }
  const firstName = contact?.first_name || (contact?.full_name ? contact.full_name.split(/\s+/)[0] : null);
  return { firstName, siteIds: sites.map((s) => s.id) };
}

/**
 * Email + in-app notice for one security event.
 * @param {{ authUserId: string, email: string, kind: string, req?: object, newEmail?: string, deviceUa?: string }} o
 */
async function notifySecurityEvent({ authUserId, email, kind, req, newEmail = null, deviceUa = null }) {
  if (!KINDS.has(kind)) throw new Error(`unknown security event ${kind}`);
  const { firstName, siteIds } = await ownerContext(authUserId);
  const device = describeDevice(deviceUa || req?.headers?.['user-agent']);
  const ip = clientIp(req);
  const when = whenLabel();
  const copy = tx.SECURITY_COPY[kind];

  // In-app: one row per site the owner runs (the bell is per site).
  if (siteIds.length) {
    await supabase.from('cms_notifications').insert(siteIds.map((site_id) => ({
      site_id, type: `security_${kind}`, category: 'security',
      title: copy.subject,
      body: [device, ip ? `IP ${ip}` : null, when].filter(Boolean).join(' · '),
      href: '/profile/security', metadata: { kind, device, ip },
    }))).then(() => {}, (e) => console.warn('[security] bell insert failed:', e.message));
  }

  const recipients = [email, kind === 'email_changed' ? newEmail : null].filter((e) => e && !isTestDomain(e));
  let sent = 0;
  for (const to of new Set(recipients)) {
    const mail = tx.accountSecurity({ kind, firstName, email, whenLabel: when, device, ip, newEmail, securityUrl: `${CMS_URL}/profile/security` });
    try { await sendMail({ fromName: 'Stemfra', to, subject: mail.subject, text: mail.text, html: mail.html }); sent++; }
    catch (e) { console.error('[security] email failed:', e.message); }
  }
  return { kind, sent, bells: siteIds.length };
}

/**
 * Record the device of a sign-in; a device id this account has never used
 * sends the "new sign-in" notice. The very first device an account records
 * is stored silently (nobody is told about the browser they already use).
 */
async function registerDevice({ authUserId, email, deviceId, req }) {
  const id = String(deviceId || '').slice(0, 80);
  if (!id) return { known: false, recorded: false };
  const ua = req?.headers?.['user-agent'] || null;
  const ip = clientIp(req);
  const { data: existing } = await supabase.from('cms_known_devices').select('id').eq('auth_user_id', authUserId).eq('device_id', id).maybeSingle();
  if (existing) {
    await supabase.from('cms_known_devices').update({ last_seen_at: new Date().toISOString(), ip, user_agent: ua }).eq('id', existing.id);
    return { known: true, recorded: true };
  }
  const { count } = await supabase.from('cms_known_devices').select('id', { count: 'exact', head: true }).eq('auth_user_id', authUserId);
  const { error } = await supabase.from('cms_known_devices').insert({ auth_user_id: authUserId, device_id: id, user_agent: ua, ip });
  if (error) { console.warn('[security] device insert failed:', error.message); return { known: false, recorded: false }; }
  if (count > 0) {
    notifySecurityEvent({ authUserId, email, kind: 'new_device', req, deviceUa: ua }).catch((e) => console.error('[security] new device notice failed:', e.message));
    return { known: false, recorded: true, notified: true };
  }
  return { known: false, recorded: true, notified: false };
}

module.exports = { notifySecurityEvent, registerDevice, describeDevice, KINDS };
