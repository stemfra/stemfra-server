// leadGoogleRefresh — refill a lead's Google Maps record (2026-09-15, Peter's
// call during his calling shift). 71 of the pipeline's leads were re-inserted
// from old n8n runs with only a name and a city on `raw_signal`, so the CRM's
// Business info panel had nothing to show. This looks the business up again
// (the same Apify search the setup wizard's "Find my business" uses), keeps the
// record in the v13 lead-gen shape (n8n-workflows/leadgen-normalize-v13.paste.md,
// the shape the CRM panel reads) and scores readiness by the same rule the
// workflow applies at ingest. Facts only: no review text, no photos.
//
// A lead is only overwritten when the search returns the SAME business (name
// match, else phone match); anything else is reported as unmatched and left as
// it was. Never touches stage, owner, consent or outreach fields.
const supabase = require('../config/supabase');
const { searchPlaces } = require('./googlePlacesFinder');
const { logActivity } = require('./activity');

const THIN_BYTES = 200; // a re-inserted stub is ~100 chars; a real record is 1 KB+

function first(arr) { return Array.isArray(arr) && arr.length ? arr[0] : null; }
function digits(s) { return String(s || '').replace(/\D/g, '').slice(-10); }
function normName(s) {
  return String(s || '').toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\b(inc|llc|corp|co|ltd|the)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

/** The v13 record, field for field what the n8n Normalize node stores. */
function recordFromPlace(p) {
  return {
    title: p.title, categoryName: p.categoryName, categories: (p.categories || []).slice(0, 5),
    address: p.address, street: p.street, city: p.city, state: p.state, postalCode: p.postalCode, countryCode: p.countryCode,
    neighborhood: p.neighborhood, phone: p.phone, phoneUnformatted: p.phoneUnformatted, website: p.website, url: p.url,
    placeId: p.placeId, cid: p.cid, location: p.location, totalScore: p.totalScore, reviewsCount: p.reviewsCount,
    reviewsDistribution: p.reviewsDistribution, openingHours: p.openingHours, price: p.price,
    description: p.description || p.ownerDescription || null,
    claimed: p.claimThisBusiness === false, imagesCount: p.imagesCount || 0,
    bookingLinks: (p.bookingLinks || []).slice(0, 3),
    instagram: first(p.instagrams), facebook: first(p.facebooks), tiktok: first(p.tiktoks), youtube: first(p.youtubes),
    twitter: first(p.twitters), linkedin: first(p.linkedIns), pinterest: first(p.pinterests),
    ownerUpdates: (p.ownerUpdates || []).length, additionalInfo: p.additionalInfo || null,
    scrapedAt: p.scrapedAt || new Date().toISOString(),
    refreshed_from: `google refresh ${new Date().toISOString().slice(0, 10)}`,
  };
}

/** Digital readiness, the v13 rule (docs/LEADGEN.md): unclaimed = old school,
 *  claimed only = middle, claimed + a sign of life = modern. */
function readinessOf(p) {
  const claimed = p.claimThisBusiness === false;
  const socials = (p.instagrams || []).length + (p.facebooks || []).length + (p.tiktoks || []).length;
  const signals = [
    claimed ? 'claimed listing' : 'unclaimed listing',
    (p.ownerDescription || p.description) ? 'owner description' : null,
    (p.ownerUpdates || []).length > 0 ? 'owner posts' : null,
    (p.imagesCount || 0) >= 20 ? `${p.imagesCount} photos` : null,
    ((p.bookingLinks || []).length > 0 || p.servicesLink) ? 'booking link' : null,
    socials > 0 ? 'social profile' : null,
  ].filter(Boolean);
  if (!claimed) return { readiness: 'old_school', signals };
  const life = signals.length > 1;
  return { readiness: life ? 'modern' : 'middle', signals };
}

function parseRaw(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  try { return JSON.parse(raw); } catch { return null; }
}

function isThin(lead) {
  const raw = lead.raw_signal;
  if (!raw) return true;
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw);
  if (text.length < THIN_BYTES) return true;
  const rec = parseRaw(raw);
  return !rec || !rec.placeId;
}

/** Pick the place that IS this lead: same name, else same phone; null otherwise. */
function pickMatch(lead, places) {
  const want = normName(lead.company_name);
  const phone = digits(lead.phone);
  const byName = places.find((p) => normName(p.title) === want);
  if (byName) return byName;
  const byPhone = phone && places.find((p) => digits(p.phoneUnformatted || p.phone) === phone);
  if (byPhone) return byPhone;
  const loose = places.find((p) => want && (normName(p.title).includes(want) || want.includes(normName(p.title))));
  return loose || null;
}

async function loadLead(leadId) {
  const { data, error } = await supabase.from('leads')
    .select('id, company_name, phone, phone_country, region, raw_signal, qualification, readiness, source_detail, is_test')
    .eq('id', leadId).single();
  if (error) throw new Error(error.message);
  return data;
}

function whereOf(lead) {
  const rec = parseRaw(lead.raw_signal) || {};
  return [rec.city, lead.region].filter(Boolean).join(', ');
}

/**
 * Refresh one lead. Returns { status: 'updated' | 'unmatched' | 'dry_run', title?, readiness? }.
 * `actor` = { id, name } of the staff member (for the activity feed).
 */
async function refreshLeadFromGoogle(leadId, { dryRun = false, actor = null } = {}) {
  const lead = await loadLead(leadId);
  const where = whereOf(lead);
  const country = lead.phone_country === 'CA' ? 'Canada' : lead.phone_country === 'GB' ? 'United Kingdom' : 'US';
  if (!String(lead.company_name || '').trim()) return { status: 'unmatched', reason: 'no company name', searched: 0, where };
  // Apify occasionally times out at the 90 s cap; one retry covers it.
  let places;
  try {
    places = await searchPlaces({ name: lead.company_name, where, country, max: 5 });
  } catch (e) {
    if (!/TIMED-OUT|timeout|aborted/i.test(e.message)) throw e;
    places = await searchPlaces({ name: lead.company_name, where, country, max: 5 });
  }
  const place = pickMatch(lead, places);
  if (!place) return { status: 'unmatched', searched: places.length, where };
  const record = recordFromPlace(place);
  const { readiness, signals } = readinessOf(place);
  if (dryRun) return { status: 'dry_run', title: record.title, readiness, signals, where };
  const prevRec = parseRaw(lead.raw_signal) || {};
  if (prevRec.reinserted_from) record.reinserted_from = prevRec.reinserted_from;
  const patch = {
    raw_signal: JSON.stringify(record),
    readiness,
    qualification: { ...(lead.qualification || {}), readiness_signals: signals },
  };
  if (!lead.phone && (place.phoneUnformatted || place.phone)) patch.phone = place.phoneUnformatted || place.phone;
  if (!lead.source_detail && place.url) patch.source_detail = place.url;
  const { error } = await supabase.from('leads').update(patch).eq('id', leadId);
  if (error) throw new Error(error.message);
  await logActivity({
    action: 'lead_google_refreshed', entityType: 'lead', entityId: leadId, entityName: lead.company_name,
    actorId: actor?.id || null, actorName: actor?.name || 'Stemfra',
    details: { readiness, signals, reviews: record.reviewsCount ?? null, claimed: record.claimed },
  });
  return { status: 'updated', title: record.title, readiness, signals, where };
}

// ── Background sweep (one at a time; in-memory state, one per server) ──────
const sweep = { running: false, total: 0, done: 0, updated: 0, unmatched: 0, failed: 0, startedAt: null, finishedAt: null, dryRun: false, last: null };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function thinLeadIds(limit) {
  const { data, error } = await supabase.from('leads')
    .select('id, raw_signal')
    .or('is_test.is.null,is_test.eq.false')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data || []).filter(isThin).map((l) => l.id).slice(0, limit);
}

/** Kick off the sweep; returns the state at once (the work runs in the background). */
async function startSweep({ limit = 200, dryRun = false, requestedBy = null, actor = null } = {}) {
  if (sweep.running) return { ...sweep, alreadyRunning: true };
  const ids = await thinLeadIds(limit);
  Object.assign(sweep, { running: true, total: ids.length, done: 0, updated: 0, unmatched: 0, failed: 0, startedAt: new Date().toISOString(), finishedAt: null, dryRun, last: null });
  (async () => {
    for (const id of ids) {
      try {
        const r = await refreshLeadFromGoogle(id, { dryRun, actor });
        if (r.status === 'updated' || r.status === 'dry_run') sweep.updated++; else sweep.unmatched++;
        sweep.last = r.title || null;
      } catch (e) {
        sweep.failed++;
        console.error('[google-refresh] lead', id, e.message);
      }
      sweep.done++;
      await sleep(1500);
    }
    sweep.running = false;
    sweep.finishedAt = new Date().toISOString();
    if (requestedBy) {
      const title = `Google records refreshed: ${sweep.updated} of ${sweep.total} leads`;
      const body = `${sweep.unmatched} not found on Google, ${sweep.failed} failed${dryRun ? ' (dry run, nothing written)' : ''}.`;
      const { error } = await supabase.rpc('crm_notify', {
        p_user: requestedBy, p_kind: 'leadgen_run', p_title: title, p_body: body,
        p_route: '/leads', p_entity_type: 'leadgen_run', p_entity_id: 'google-refresh',
      });
      if (error) console.error('[google-refresh] notify failed:', error.message);
    }
  })();
  return { ...sweep };
}

function sweepStatus() { return { ...sweep }; }

module.exports = { refreshLeadFromGoogle, startSweep, sweepStatus, isThin, recordFromPlace, readinessOf, pickMatch };
