// Pre-invoice review (P43, 2026-09-24, from the Gemini evaluation of 2026-09-22).
//
// The 24-hour auto-collect rule (lib/bookingAutoCollectSweeper.js) marks a priced,
// confirmed booking as collected when the owner never touched it, and the 5% then
// lands on the monthly statement. Before P43 the owner found out on the invoice.
// Now, three days before the month closes, the owner gets a bell + an email that
// lists exactly the bookings the rule collected for them, with one tap per row to
// say "did not happen" (the CMS sets status no_show, which drops the booking out
// of the commission basis, see COMMISSION_MODEL.md and the classify() gate in
// reportsController). The same list sits on the CMS Billing → Invoices page all
// month via `listReviewBookings` (GET /api/cms/billing payload `preInvoice`).
//
// Scope: ONLY bookings the sweeper auto-collected (metadata.auto_collected = true).
// A booking the owner marked collected by hand is a decision, not a surprise.
// Owner-entered walk-ins never appear (they carry no commission, P36).
//
// Idempotent: one bell + email per site per month (cms_notifications type
// `pre_invoice_review`, metadata.month). Skips demo / test sites like the meter,
// so it is inert until a real tenant exists. PRE_INVOICE_REVIEW_ENABLED=false
// turns the sweep off; the CMS list keeps working regardless.
const supabase = require('../config/supabase'); // single-var import (repo convention)
const { isNonProductionSite } = require('./testData');
const { getCommissionConfig } = require('./commission');
const { sendMail } = require('./mailer');
const emails = require('../templates/transactionalEmails');
const { cmsMagicLink } = require('./cmsMagicLink');

const REVIEW_DAYS_BEFORE_CLOSE = 3;
const NOTIFICATION_TYPE = 'pre_invoice_review';

const en = (v) => (v && typeof v === 'object' ? (v.en || Object.values(v)[0] || '') : (v || ''));
const money = (cents, cur = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format((cents || 0) / 100);

// UTC calendar month around `now`: [start, now] for the list, plus the close date.
function monthWindow(now = new Date()) {
  const y = now.getUTCFullYear(), m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const lastDay = new Date(Date.UTC(y, m + 1, 0));
  const daysLeft = lastDay.getUTCDate() - now.getUTCDate();
  return {
    monthKey: `${y}-${String(m + 1).padStart(2, '0')}`,
    monthLabel: start.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    fromIso: start.toISOString(),
    toIso: now.toISOString(),
    closesOn: lastDay.toISOString().slice(0, 10),
    daysLeft,
  };
}

// The bookings the auto-collect rule billed for this site this month, oldest first,
// with the totals the statement will carry. Read-only.
async function listReviewBookings(siteId, { now = new Date() } = {}) {
  const w = monthWindow(now);
  const [cfg, { data: site }, { data: rows, error }] = await Promise.all([
    getCommissionConfig(),
    supabase.from('sites').select('currency').eq('id', siteId).maybeSingle(),
    supabase
      .from('site_bookings')
      .select('id, starts_at, service_name_snapshot, amount_cents, status, metadata, source, customer:site_customers(first_name, last_name)')
      .eq('site_id', siteId)
      .in('status', ['confirmed', 'completed'])
      .eq('payment_status', 'none')
      .gt('amount_cents', 0)
      .eq('metadata->>auto_collected', 'true')
      .or('source.is.null,source.not.like.owner_%')
      .gte('starts_at', w.fromIso)
      .lte('starts_at', w.toIso)
      .order('starts_at', { ascending: true })
      .limit(500),
  ]);
  if (error) throw error;
  const currency = String(site?.currency || cfg.currency || 'USD').toUpperCase();
  const bookings = (rows || []).map((b) => ({
    id: b.id,
    startsAt: b.starts_at,
    service: en(b.service_name_snapshot) || 'Service',
    customer: [b.customer?.first_name, b.customer?.last_name].filter(Boolean).join(' ') || null,
    amountCents: b.amount_cents || 0,
    collectedAt: b.metadata?.collected_at || null,
  }));
  const amountCents = bookings.reduce((s, b) => s + b.amountCents, 0);
  const rate = cfg.rate || 0;
  const capCents = Number(cfg.capCents) > 0 ? Math.round(Number(cfg.capCents)) : 0;
  return {
    month: w.monthKey,
    monthLabel: w.monthLabel,
    closesOn: w.closesOn,
    daysLeft: w.daysLeft,
    currency,
    rate,
    capCents,
    count: bookings.length,
    amountCents,
    commissionCents: Math.round(amountCents * rate), // on these rows alone; the statement caps the month's total
    bookings,
  };
}

// Live, non-demo sites with their owner contact (mirrors the meter's filter).
async function billableSites({ includeDemo = false } = {}) {
  const { data, error } = await supabase
    .from('sites')
    .select('id, metadata, owner_contact_id, company:companies(name), subdomain')
    .eq('status', 'live')
    .limit(100000);
  if (error) throw error;
  return (data || []).filter((s) => includeDemo || !isNonProductionSite(s));
}

// One pass. Fires only inside the last REVIEW_DAYS_BEFORE_CLOSE days of the month.
async function sweepOnce({ now = new Date(), dryRun = false, includeDemo = false } = {}) {
  const w = monthWindow(now);
  if (w.daysLeft > REVIEW_DAYS_BEFORE_CLOSE) return { skipped: 'not_in_window', daysLeft: w.daysLeft };

  const sites = await billableSites({ includeDemo });
  let notified = 0, skipped = 0, empty = 0;
  for (const site of sites) {
    let review;
    try { review = await listReviewBookings(site.id, { now }); } catch (e) { console.error('[pre-invoice] list failed for', site.id, e.message); continue; }
    if (!review.count) { empty++; continue; }

    // Idempotency: one review per site per month.
    const { data: existing } = await supabase
      .from('cms_notifications').select('id')
      .eq('site_id', site.id).eq('type', NOTIFICATION_TYPE)
      .filter('metadata->>month', 'eq', w.monthKey).limit(1);
    if (existing && existing.length) { skipped++; continue; }
    if (dryRun) { notified++; continue; }

    const n = review.count;
    const title = n === 1 ? '1 booking is about to be billed' : `${n} bookings are about to be billed`;
    const body = `Your ${review.monthLabel} statement closes on ${w.closesOn}. Review the bookings we marked as collected and tap "Did not happen" on any that never took place.`;

    // Bell (always; billing category is never muted in the CMS).
    await supabase.from('cms_notifications').insert([{
      site_id: site.id, type: NOTIFICATION_TYPE, category: 'billing',
      title, body, href: '/billing/invoices',
      metadata: { month: w.monthKey, count: n, amount_cents: review.amountCents, commission_cents: review.commissionCents },
    }]);

    // Email to the owner (billing notice, not gated on the marketing prefs).
    try {
      if (site.owner_contact_id) {
        const { data: owner } = await supabase
          .from('contacts').select('email, auth_user_id, first_name').eq('id', site.owner_contact_id).maybeSingle();
        if (owner?.email) {
          const dashboardUrl = await cmsMagicLink(owner.auth_user_id, '/billing/invoices');
          const built = emails.ownerPreInvoiceReview({
            businessName: site.company?.name || site.subdomain,
            greetingName: owner.first_name || null,
            count: n,
            monthLabel: review.monthLabel,
            closesOn: w.closesOn,
            amountLabel: money(review.amountCents, review.currency),
            commissionLabel: money(review.commissionCents, review.currency),
            capLabel: review.capCents ? money(review.capCents, review.currency) : null,
            dashboardUrl,
          });
          await sendMail({ fromName: 'Stemfra', to: owner.email, subject: title, html: built.html, text: built.text });
        }
      }
    } catch (e) { console.error('[pre-invoice] owner email failed:', e.message); }
    notified++;
  }
  const summary = { month: w.monthKey, sites: sites.length, notified, skipped, empty };
  if (!dryRun) console.log('[pre-invoice] swept', summary);
  return summary;
}

// Twice a day; the month-end window + the per-month idempotency make it safe.
function startPreInvoiceReviewSweeper({ intervalMs = 12 * 3600 * 1000 } = {}) {
  if (process.env.PRE_INVOICE_REVIEW_ENABLED === 'false') {
    console.log('• Pre-invoice review sweeper DISABLED (PRE_INVOICE_REVIEW_ENABLED=false)');
    return null;
  }
  setTimeout(() => sweepOnce().catch((e) => console.error('[pre-invoice]', e.message)), 90_000);
  const t = setInterval(() => sweepOnce().catch((e) => console.error('[pre-invoice]', e.message)), intervalMs);
  t.unref?.();
  console.log(`✓ Pre-invoice review sweeper running every ${Math.round(intervalMs / 3600000)}h (last ${REVIEW_DAYS_BEFORE_CLOSE} days of the month; skips demo sites)`);
  return t;
}

module.exports = { listReviewBookings, sweepOnce, startPreInvoiceReviewSweeper, monthWindow, REVIEW_DAYS_BEFORE_CLOSE };
