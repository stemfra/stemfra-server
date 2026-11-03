const db = require('../../config/supabase');
const { siteKind } = require('../testData');
const { sendMail } = require('../mailer');
const core = require('./core');
const DAY = 86400000;
let running = false;

function reminderDue(sub, now = Date.now()) {
  const remaining = Date.parse(sub.current_period_end || '') - now;
  return sub.provider === 'whop' && sub.status === 'active' && !sub.cancel_at_period_end
    && remaining > 2 * DAY && remaining <= 3 * DAY;
}

// One reminder per site/provider renewal date. Atomic metadata compare-and-swap
// prevents two workers claiming the same notice; Resend deduplicates crash retries.
async function sweepOnce({ dryRun = true } = {}) {
  if (!dryRun && (process.env.WHOP_RENEWAL_REMINDERS_ENABLED !== 'true'
    || process.env.WHOP_SANDBOX !== 'false' || process.env.EMAIL_PROVIDER !== 'resend'
    || !process.env.RESEND_API_KEY)) return { skipped: 'disabled' };
  const { data: rows, error } = await db.from('subscriptions').select('*')
    .eq('provider', 'whop').eq('status', 'active');
  if (error) throw new Error('subscriptions_read_failed');
  const actions = [];
  for (const sub of rows || []) {
    if (!reminderDue(sub)) continue;
    const { data: site, error: siteError } = await db.from('sites')
      .select('id,subdomain,metadata,deleted_at,owner:contacts!sites_owner_contact_id_fkey(email),company:companies(name)')
      .eq('id', sub.site_id).maybeSingle();
    if (siteError) throw new Error('site_read_failed');
    if (!site || site.deleted_at || siteKind(site) !== 'real') continue;
    const membership = sub.metadata?.whop_membership_id;
    if (!membership) continue;
    const cycle = sub.current_period_end;
    const previous = sub.metadata?.renewal_reminder;
    if (previous?.cycle === cycle && (previous.status === 'sent'
      || Date.parse(previous.lock_until || '') > Date.now())) continue;
    // Resend's retry deduplication is time limited. Ambiguous older sends need review.
    if (previous?.cycle === cycle && Date.now() - Date.parse(previous.first_attempt_at) >= 23 * 3600000) {
      actions.push({ siteId: site.id, action: 'delivery-review-required' }); continue;
    }
    if (dryRun) { actions.push({ siteId: site.id, action: 'reminder-due', renewal: cycle }); continue; }
    const cfg = core.config();
    const state = await core.snapshot(cfg, { type: 'membership.updated', data: { id: membership } });
    if (!state || state.product !== 'website' || state.status !== 'active'
      || state.cancel_at_period_end || Date.parse(state.period_end) !== Date.parse(cycle)) continue;
    const binding = await db.from('whop_checkout_intents').select('id').eq('site_id', site.id)
      .eq('membership_id', membership).eq('sandbox', false).eq('state', 'paid').maybeSingle();
    if (binding.error || !binding.data) continue;
    const owner = Array.isArray(site.owner) ? site.owner[0] : site.owner;
    if (!owner?.email) continue;
    const now = new Date().toISOString();
    const notice = { cycle, status: 'sending', first_attempt_at: previous?.cycle === cycle ? previous.first_attempt_at : now,
      lock_until: new Date(Date.now() + 300000).toISOString() };
    const meta = { ...(sub.metadata || {}), renewal_reminder: notice };
    const claimed = await db.from('subscriptions').update({ metadata: meta }).eq('id', sub.id)
      .eq('metadata', JSON.stringify(sub.metadata || {})).select('id');
    if (claimed.error || !claimed.data?.length) continue;
    const company = Array.isArray(site.company) ? site.company[0] : site.company;
    const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: sub.currency }).format(sub.monthly_amount_cents / 100);
    const key = `stemfra-renewal-${sub.id}-${Date.parse(cycle)}`;
    const result = await sendMail({ fromName: 'Stemfra', to: owner.email,
      subject: `Your Stemfra subscription renews in 3 days`,
      text: `Your managed website subscription for ${company?.name || site.subdomain} is scheduled to renew on ${new Date(cycle).toISOString().slice(0, 10)} (UTC). Expected subscription amount: ${amount}, plus applicable taxes. Whop will automatically charge your subscription payment method. No manual payment is needed. Manage or cancel your subscription before renewal: ${core.safeUrl(state.manage_url, false) || core.PORTAL}`,
      html: require('../../templates/transactionalEmails').platformRenewalReminder({
        businessName: company?.name || site.subdomain, amountLabel: amount,
        renewalLabel: new Date(cycle).toISOString().slice(0, 10),
        dashboardUrl: core.safeUrl(state.manage_url, false) || core.PORTAL,
      }),
      idempotencyKey: key, messageId: `<${key}@stemfra.com>` });
    if (result) {
      const saved = await db.from('subscriptions').update({ metadata: { ...meta,
        renewal_reminder: { ...notice, status: 'sent', sent_at: new Date().toISOString(), lock_until: null } } })
        .eq('id', sub.id).eq('metadata', JSON.stringify(meta)).select('id');
      if (saved.error || !saved.data?.length) throw new Error('reminder_ack_requires_review');
      actions.push({ siteId: site.id, action: 'reminder-sent' });
    }
  }
  return { actions };
}
function startRenewalReminderSweeper() {
  if (process.env.WHOP_RENEWAL_REMINDERS_ENABLED !== 'true') return;
  const run = async () => {
    if (running) return;
    running = true;
    try { await sweepOnce({ dryRun: false }); } catch { console.error('[whop] renewal reminder requires review'); }
    finally { running = false; }
  };
  const timer = setInterval(run, 3600000); timer.unref();
}
module.exports = { reminderDue, sweepOnce, startRenewalReminderSweeper };
