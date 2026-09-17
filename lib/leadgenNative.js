// leadgenNative — the cold lead-gen pipeline run INSIDE the server (P41, 2026-09-17).
// A port of the n8n "System B (Cold / Google Maps)" v16 workflow, step for step:
//   scrape (Apify, ASYNC run so 100 places never hit the 5-minute run-sync limit)
//   → website gate → normalize (the v13 record + readiness + booking platform)
//   → digital-ready gate → dedupe → score + draft (OpenAI, JSON mode) → keep? → insert
//   → close the run (same leadgen_runs row + bell as the n8n callback).
// Why native (Peter, 2026-09-17): the n8n copy carried a stale prompt nobody could see
// in git, and a failed node says nothing. Here every candidate leaves a DECISION row
// (stage + reason) in leadgen_runs.metadata.decisions, progress is written while the
// run works, the prompt is a file in git (prompts/leadgen-system.txt) and no secret
// lives in a workflow export. Not Twilio; Apify + OpenAI + Supabase only.
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const supabase = require('../config/supabase');
const { recordFromPlace, readinessOf } = require('./leadGoogleRefresh');

const APIFY_ACTOR = 'compass~crawler-google-places';
const APIFY_BASE = 'https://api.apify.com/v2';
const SCRAPE_TIMEOUT_MS = Number(process.env.LEADGEN_SCRAPE_TIMEOUT_MS) || 25 * 60_000;
const SCORE_CONCURRENCY = Number(process.env.LEADGEN_SCORE_CONCURRENCY) || 4;
const MODEL = process.env.LEADGEN_SCORING_MODEL || process.env.LEADGEN_MODEL || 'gpt-4o';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Two prompts since 2026-09-17 (Peter: keep every place, draft only on demand):
//   leadgen-qualify.txt = judge + score a candidate, NO draft (runs on every candidate that
//                         passes the free gates; a small model is enough)
//   leadgen-draft.txt   = write the A1-based outreach for ONE lead a person picked
const PROMPTS = path.join(__dirname, '..', 'prompts');
const QUALIFY_MODEL = process.env.LEADGEN_QUALIFY_MODEL || 'gpt-4o-mini';
const MIN_VOLUME = Number(process.env.LEADGEN_MIN_VOLUME) || 5; // trait_volume 5 = 25+ reviews at 4.0+
// Retired offers must never reach a model again (the 2026-09-17 audit).
const RETIRED = ['$1,000', '$99', '$399', 'monthly plan from', 'not US-based'];
function prompt(name) {
  const text = fs.readFileSync(path.join(PROMPTS, name), 'utf8').trim();
  const stale = RETIRED.find((x) => text.includes(x));
  if (stale) throw new Error(`prompts/${name} carries retired content: "${stale}"`);
  return text;
}
const systemPrompt = () => prompt('leadgen-qualify.txt');

function configured() { return !!process.env.APIFY_TOKEN && !!openai; }

// A listing whose "website" is one of these does not own its storefront.
const NOT_OWN_SITE = /(youtube\.com|youtu\.be|twitter\.com|\/\/(www\.)?x\.com|pinterest\.|snapchat\.com|wa\.me|whatsapp\.com|google\.com\/maps|g\.page|goo\.gl|threads\.net|linktr\.ee|linktree|lnk\.bio|bio\.link|beacons\.ai|instagram\.com|facebook\.com|tiktok\.com|business\.site|yelp\.com|booksy\.com|vagaro\.com|square\.site|squareup\.com|fresha\.com|schedulicity|setmore|acuityscheduling|as\.me|glossgenius|mindbodyonline|mindbody\.io|styleseat\.com|thecut\.co|joinblvd|blvd\.co|janeapp|jane\.app|massagebook|treatwell|wellnessliving|momence|genbook|simplybook|calendly|wixsite\.com|godaddysites\.com|sites\.google\.com|weebly\.com|perceny\.com|nearcut\.com)/i;
const PLATFORMS = [
  ['booksy', /booksy\.com/i], ['fresha', /fresha\.com/i], ['vagaro', /vagaro\.com/i],
  ['mindbody', /mindbodyonline|mindbody\.io/i], ['square', /square\.site|squareup\.com/i],
  ['styleseat', /styleseat\.com/i], ['glossgenius', /glossgenius/i], ['schedulicity', /schedulicity/i],
  ['acuity', /acuityscheduling|\/\/[^/]*as\.me/i], ['setmore', /setmore/i], ['thecut', /thecut\.co/i],
  ['boulevard', /joinblvd|blvd\.co/i],
  ['other', /janeapp|jane\.app|massagebook|treatwell|wellnessliving|momence|zenoti|booker\.com|genbook|simplybook|calendly|nearcut\.com|perceny\.com/i],
];
// Platforms that are ALSO a consumer marketplace (the shop's page sits beside other shops).
// The rest are plain booking tools: no competitor sits next to the shop there, so outreach must
// never claim it (2026-09-17: a GlossGenius shop got the marketplace line).
const MARKETPLACES = new Set(['booksy', 'fresha', 'vagaro', 'mindbody', 'styleseat', 'thecut', 'schedulicity']);
function bookingPlatformOf(p) {
  const hay = [p.website || '', JSON.stringify(p.bookingLinks || []), p.servicesLink || '', p.reserveTableUrl || ''].join(' ');
  const hit = PLATFORMS.find(([, re]) => re.test(hay));
  return hit ? hit[0] : null;
}
/** trait_volume, deterministic (the rubric in prompts/leadgen-system.txt): review
 *  count and rating are facts, so the model never gets to be generous with them. */
function volumeOf(reviews, rating) {
  const n = Number(reviews) || 0; const r = Number(rating) || 0;
  let v;
  if (n >= 200) v = r >= 4.5 ? (n >= 400 ? 10 : 9) : r >= 4.3 ? 8 : 6;
  else if (n >= 75) v = r >= 4.3 ? (n >= 120 ? 8 : 7) : 5;
  else if (n >= 25) v = r >= 4.0 ? (n >= 50 ? 6 : 5) : 4;
  else v = n >= 10 ? 3 : 2;
  return r > 0 && r < 4.0 ? Math.min(v, 4) : v;
}
// Emails scraped from a booking page or a site builder belong to the VENDOR, not the owner
// (2026-09-17: two leads carried help.us@booksy.com and one was emailed). Never keep them.
const VENDOR_EMAIL = /@([a-z0-9-]+\.)*(booksy|fresha|vagaro|mindbodyonline|mindbody|squareup|square|styleseat|glossgenius|schedulicity|acuityscheduling|setmore|thecut|joinblvd|nearcut|perceny|janeapp|massagebook|treatwell|wellnessliving|momence|wix|wixpress|godaddy|weebly|squarespace|sentry|example|google|facebook|instagram|yelp|linktr|domain|email)\.[a-z.]+$/i;
const JUNK_EMAIL = /\.(png|jpe?g|gif|webp|svg)$|^(noreply|no-reply|donotreply|support@booksy)/i;
function ownerEmail(list) {
  return (Array.isArray(list) ? list : [list]).map((e) => String(e || '').trim().toLowerCase())
    .find((e) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e) && !VENDOR_EMAIL.test(e) && !JUNK_EMAIL.test(e)) || '';
}
const hasOwnSite = (p) => !!p.website && !NOT_OWN_SITE.test(p.website);

const COUNTRY_NAME = { US: 'United States', CA: 'Canada', GB: 'United Kingdom' };
function locationOf(payload) {
  const country = String(payload.country || 'US').toUpperCase();
  return [payload.city, payload.state_name || payload.state_code, payload.country_name || COUNTRY_NAME[country] || 'United States']
    .filter(Boolean).join(', ');
}

// ── Apify, async: start the actor run, poll it, read the dataset ─────────────
async function apify(pathname, init = {}) {
  const r = await fetch(`${APIFY_BASE}${pathname}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.APIFY_TOKEN}`, ...(init.headers || {}) },
  });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`Apify ${r.status}: ${body?.error?.message || 'request failed'}`);
  return body;
}
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function scrape(payload, onProgress) {
  const input = {
    searchStringsArray: [String(payload.vertical || '').replace(/_/g, ' ')],
    locationQuery: locationOf(payload),
    maxCrawledPlacesPerSearch: payload.max_results,
    language: 'en',
    scrapeContacts: true,
    skipClosedPlaces: true,
    scrapePlaceDetailPage: true,
  };
  const started = await apify(`/acts/${APIFY_ACTOR}/runs`, { method: 'POST', body: JSON.stringify(input) });
  const run = started.data;
  await onProgress({ stage: 'scraping', apify_run_id: run.id, location: input.locationQuery });
  const deadline = Date.now() + SCRAPE_TIMEOUT_MS;
  let status = run.status;
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
    if (Date.now() > deadline) throw new Error(`Apify run ${run.id} still ${status} after ${Math.round(SCRAPE_TIMEOUT_MS / 60000)} min`);
    await sleep(10_000);
    status = (await apify(`/actor-runs/${run.id}`)).data.status;
    // Places found so far = the dataset's item count (drives the CRM progress bar).
    const found = await apify(`/datasets/${run.defaultDatasetId}`).then((d) => d.data?.itemCount || 0, () => 0);
    await onProgress({ stage: 'scraping', apify_run_id: run.id, location: input.locationQuery, done: found, total: payload.max_results });
  }
  if (status !== 'SUCCEEDED') throw new Error(`Apify run ${run.id} ended ${status}`);
  const items = await apify(`/datasets/${run.defaultDatasetId}/items?clean=true&format=json`);
  return { places: (Array.isArray(items) ? items : []).filter((p) => p && p.title), apifyRunId: run.id, location: input.locationQuery };
}

// ── Candidate (the n8n Normalize Candidate node) ─────────────────────────────
function candidateOf(p, payload = {}) {
  const { readiness, signals } = readinessOf(p);
  const record = recordFromPlace(p);
  delete record.refreshed_from;
  return {
    place_key: p.placeId || p.url || '',
    business_name: p.title || '',
    phone: p.phone || p.phoneUnformatted || p.contactDetails?.phones?.[0] || '',
    email: ownerEmail([...(p.emails || []), ...(p.contactDetails?.emails || [])]),
    website: p.website || '',
    has_own_site: hasOwnSite(p),
    city: p.city || '',
    state: p.state || '',
    country: String(p.countryCode || payload.country || 'US').toUpperCase(),
    source_detail: p.url || p.placeId || '',
    record,
    raw_signal: JSON.stringify(record),
    readiness, readiness_signals: signals,
    booking_platform: bookingPlatformOf(p),
    review_count: Number(p.reviewsCount) || 0,
    rating: Number(p.totalScore) || 0,
    price_level: p.price || null,
    trait_volume: volumeOf(p.reviewsCount, p.totalScore),
  };
}

/** The leadgen_places row for a candidate + what the run decided about it. */
function placeRow(c, { status, reason, ai = null, leadScore = null, leadId = null, runId = null, vertical = null }) {
  return {
    place_key: c.place_key, source_detail: c.source_detail || null, name: c.business_name,
    vertical, country: c.country || null, region: c.state || null, city: c.city || null,
    phone: c.phone || null, email: c.email || null, website: c.website || null,
    has_own_site: c.has_own_site, booking_platform: c.booking_platform, readiness: c.readiness,
    review_count: c.review_count, rating: c.rating, price_level: c.price_level, fit_score: c.trait_volume,
    status, reason: reason || null, ai, lead_score: leadScore, lead_id: leadId, record: c.record,
    last_run_id: runId, last_seen_at: new Date().toISOString(),
  };
}

// ── Prompt (the n8n Build Prompt node) ───────────────────────────────────────
function userPrompt(c, { runCountry, template = null }) {
  const lines = [
    'signal_source: google_maps', 'raw_signal:', c.raw_signal, '',
    'Known structured fields (may be partial):',
    `business_name: ${c.business_name}`, `phone: ${c.phone}`, `email: ${c.email}`, `website: ${c.website}`,
    `city: ${c.city}`, `listing_url: ${c.source_detail}`,
    `digital_readiness: ${c.readiness}${(c.readiness_signals || []).length ? ` (${c.readiness_signals.join(', ')})` : ''}`,
    `review_count: ${c.review_count}`, `rating: ${c.rating}`, `trait_volume: ${c.trait_volume} (computed, copy it)`, `price_level: ${c.price_level || 'unknown'}`,
    `booking_platform: ${c.booking_platform || 'none'} (where the listing's website or Book button points)`,
    `platform_is_marketplace: ${c.booking_platform ? (MARKETPLACES.has(c.booking_platform) ? 'yes (other shops are shown in the same app)' : 'no (a booking tool page; no other shops are shown there)') : 'n/a'}`,
    `run_country: ${runCountry}`,
  ];
  if (template?.body) {
    lines.push('',
      "OUTREACH TEMPLATE (A1): your draft_message MUST follow this template's structure and flow. Rules:",
      '- Keep {{demo_link}} and {{start_free_link}} EXACTLY as written (they are filled in at send time).',
      "- Replace every other placeholder ({{first_name}}, {{business_name}}, {{city}}, {{vertical}}, ...) with this candidate's REAL values; if a first name is unknown, open with a natural greeting instead.",
      '- OMIT the signature block ({{sender_name}} and below): a signature is appended automatically.',
      "- Personalize the opening around this business's specific situation; keep the rest of the template's flow and its self-serve CTA.",
      `template_subject: ${template.subject || ''}`, 'template_body:', template.body);
  }
  return lines.join('\n');
}

async function chatJson(model, system, user, temperature) {
  const r = await openai.chat.completions.create({
    model, temperature, response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  return JSON.parse(r.choices[0].message.content || '{}');
}
/** Judge + score ONE candidate. No draft. */
const score = (c, ctx) => chatJson(QUALIFY_MODEL, ctx.system, userPrompt(c, { runCountry: ctx.runCountry }), 0.2);

// ── Lead row (the n8n Parse + Map node) ──────────────────────────────────────
const CA_PROVINCE = /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/;
function leadRow(ai, c, { runCountry, runId }) {
  const business = ai.business_name || c.business_name || '';
  const region = ai.region || null;
  const phoneCountry = (ai.phone_country && String(ai.phone_country).toUpperCase())
    || (region === 'GB' ? 'GB' : CA_PROVINCE.test(region || '') ? 'CA' : runCountry);
  return {
    contact_name: (ai.contact_name && String(ai.contact_name).trim()) || `Owner — ${business || '(unknown business)'}`,
    company_name: business || null,
    email: ownerEmail([ai.email, c.email]) || null,
    phone: ai.phone || c.phone || null,
    phone_country: phoneCountry,
    currency: phoneCountry === 'GB' ? 'GBP' : phoneCountry === 'CA' ? 'CAD' : 'USD',
    entity_type: ['company', 'sole_trader', 'partnership'].includes(ai.entity_type) ? ai.entity_type : 'unknown',
    template_slug: ai.matched_template || null,
    region,
    pain_point_bucket: ai.pain_point_bucket || null,
    lead_score: ai.lead_score != null ? Number(ai.lead_score) : null,
    suggested_channel: (ai.suggested_channel === 'email' && !ownerEmail([ai.email, c.email])) ? 'phone' : (ai.suggested_channel || null),
    ai_draft_subject: null, // drafted on demand (draftForLead), never at ingest
    ai_draft_message: null,
    // Straight into the pipeline (Peter, 2026-09-18): the Review queue existed to approve an
    // outreach draft before it was sent. Leads now arrive without a draft and nothing is sent
    // on its own, so a qualified lead is a New Lead at once; messages are written and sent
    // deliberately, one lead at a time or as a mass action on a filtered selection.
    source: 'google_maps', stage: 'new_lead', review_status: 'approved', service: 'website',
    source_detail: c.source_detail || null,
    raw_signal: c.raw_signal,
    readiness: c.readiness,
    leadgen_run_id: runId || null,
    qualification: {
      readiness_signals: c.readiness_signals,
      vertical: ai.vertical || null,
      buying_trigger: ai.buying_trigger || null,
      booking_platform: c.booking_platform,
      review_count: c.review_count, rating: c.rating, price_level: c.price_level,
      trait_volume: ai.trait_volume ?? null,
      trait_affordability: ai.trait_volume ?? null, // legacy key the CRM card reads
      trait_owner_decides: ai.trait_owner_decides ?? null,
      trait_weak_web: ai.trait_weak_web ?? null,
      reasoning: ai.reasoning || null,
      engine: 'native',
    },
  };
}

async function pool(items, size, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

/** Save what a run decided about every place (one upsert). A place that already became a
 *  lead keeps its lead_id and 'promoted' status whatever a later run decides. */
async function savePlaces(rows, runId) {
  if (!rows.length) return { saved: 0 };
  const keys = rows.map((r) => r.place_key);
  const { data: had } = await supabase.from('leadgen_places').select('place_key, status, lead_id, first_run_id').in('place_key', keys);
  const before = new Map((had || []).map((r) => [r.place_key, r]));
  const out = rows.map((r) => {
    const b = before.get(r.place_key);
    const keepLead = b && b.lead_id && !r.lead_id;
    return { ...r, first_run_id: b ? b.first_run_id : runId, ...(keepLead ? { lead_id: b.lead_id, status: 'promoted', reason: 'already a lead' } : {}) };
  });
  const { error } = await supabase.from('leadgen_places').upsert(out, { onConflict: 'place_key' });
  if (error) console.error('[leadgen native] places upsert failed:', error.message);
  return { saved: error ? 0 : out.length };
}

/**
 * Run the whole pipeline for one leadgen_runs row. Never throws: a failure closes the run
 * as failed with the error in notes. `close` = leadgenRun.closeRun. EVERY scraped place is
 * kept in leadgen_places with its status; only the ones that pass the free gates (no own
 * site, digital-ready, busy enough, new) reach the model, and no outreach is drafted here.
 * `dryRun` judges but writes no lead and no place.
 */
async function runNative({ runId, payload, close, dryRun = false }) {
  const decisions = [];
  const placeRows = [];
  const vertical = payload.vertical || null;
  const facts = (c) => ({ reviews: c.review_count, rating: c.rating, platform: c.booking_platform });
  // One call records the decision (run log) AND the place's status (leadgen_places).
  const decide = (c, stage, reason, status, extra = {}, place = {}) => {
    decisions.push({ name: c.business_name || '?', stage, reason, ...facts(c), ...extra });
    if (c.place_key) placeRows.push(placeRow(c, { status, reason, runId, vertical, ...place }));
  };
  const progress = async (p) => {
    if (!runId) return;
    await supabase.from('leadgen_runs').update({ metadata: { engine: 'native', progress: { ...p, at: new Date().toISOString() } } }).eq('id', runId).then(() => {}, () => {});
  };
  const counts = { scraped: 0, had_website: 0, no_website: 0, old_school: 0, low_volume: 0, duplicates: 0, new_candidates: 0, scored: 0, score_errors: 0, not_relevant: 0, below_score: 0, no_contact: 0, kept: 0, inserted: 0, not_saved: 0, places_saved: 0 };
  const where = payload.city || payload.search_query || 'run';
  const minScore = Number(payload.min_score) || 5;
  const runCountry = String(payload.country || 'US').toUpperCase();
  const finish = async (stopped_at, extraMsg) => {
    if (!dryRun && placeRows.length) counts.places_saved = (await savePlaces(placeRows, runId)).saved;
    const parts = [`${counts.scraped} place${counts.scraped === 1 ? '' : 's'} scraped`];
    if (counts.had_website) parts.push(`${counts.had_website} had a website`);
    if (counts.old_school) parts.push(`${counts.old_school} old-school`);
    if (counts.low_volume) parts.push(`${counts.low_volume} too quiet (few reviews)`);
    if (counts.duplicates) parts.push(`${counts.duplicates} already in the CRM`);
    if (counts.not_relevant) parts.push(`${counts.not_relevant} not a fit`);
    if (counts.below_score) parts.push(`${counts.below_score} scored below ${minScore}`);
    if (counts.no_contact) parts.push(`${counts.no_contact} without a phone or email`);
    if (counts.score_errors) parts.push(`${counts.score_errors} scoring error${counts.score_errors === 1 ? '' : 's'}`);
    if (counts.not_saved) parts.push(`${counts.not_saved} not saved`);
    parts.push(dryRun ? `${counts.kept} would be new leads (dry run)` : `${counts.inserted} new lead${counts.inserted === 1 ? '' : 's'}`);
    const message = `${where}: ${parts.join(', ')}.${extraMsg ? ` ${extraMsg}` : ''}`;
    const summary = { ...counts, stopped_at, engine: 'native', dry_run: dryRun, model: QUALIFY_MODEL, min_volume: MIN_VOLUME, city: payload.city || null, vertical, decisions };
    await close({ runId, message, summary });
    return { message, summary };
  };

  try {
    const system = systemPrompt();
    const { places, apifyRunId, location } = await scrape(payload, progress);
    counts.scraped = places.length;
    if (!places.length) return await finish('scrape');

    // Free gates, in code: own website → old-school → too quiet. Everything is kept as a place.
    const ready = [];
    const seenKeys = new Set();
    for (const p of places) {
      const c = candidateOf(p, payload);
      if (!c.business_name || !c.place_key || seenKeys.has(c.place_key)) continue;
      seenKeys.add(c.place_key);
      if (c.has_own_site) { counts.had_website++; decide(c, 'website_filter', `own website: ${c.website}`, 'own_site'); continue; }
      counts.no_website++;
      if (c.readiness === 'old_school') { counts.old_school++; decide(c, 'readiness', 'unclaimed listing', 'old_school'); continue; }
      if (c.trait_volume < MIN_VOLUME) { counts.low_volume++; decide(c, 'volume', `too quiet: ${c.review_count} reviews at ${c.rating}`, 'low_volume'); continue; }
      ready.push(c);
    }
    if (!ready.length) return await finish(counts.no_website === 0 ? 'website_filter' : 'readiness');

    const { data: existing, error: dErr } = await supabase.from('leads').select('id, source_detail')
      .eq('source', 'google_maps').in('source_detail', ready.map((c) => c.source_detail));
    if (dErr) throw new Error(`dedupe lookup failed: ${dErr.message}`);
    const leadBySource = new Map((existing || []).map((r) => [r.source_detail, r.id]));
    const fresh = [];
    for (const c of ready) {
      if (leadBySource.has(c.source_detail)) { counts.duplicates++; decide(c, 'dedupe', 'already in the CRM', 'promoted', {}, { leadId: leadBySource.get(c.source_detail) }); } else fresh.push(c);
    }
    counts.new_candidates = fresh.length;
    if (!fresh.length) return await finish('dedupe');

    await progress({ stage: 'scoring', apify_run_id: apifyRunId, location, done: 0, total: fresh.length });
    const ctx = { system, runCountry, runId };
    let scoredSoFar = 0;
    const scored = await pool(fresh, SCORE_CONCURRENCY, async (c) => {
      let out;
      try { out = { c, ai: await score(c, ctx) }; } catch (e) { out = { c, error: e.message }; }
      scoredSoFar += 1;
      await progress({ stage: 'scoring', apify_run_id: apifyRunId, location, done: scoredSoFar, total: fresh.length });
      return out;
    });

    const keep = [];
    for (const { c, ai, error } of scored) {
      if (error || !ai) { counts.score_errors++; decide(c, 'score', `scoring failed: ${error || 'empty'}`, 'new'); continue; }
      counts.scored++;
      ai.trait_volume = c.trait_volume;
      // lead_score can never sit more than one point above the volume trait.
      const s = Math.min(Number(ai.lead_score) || 0, c.trait_volume + 1);
      ai.lead_score = s;
      const detail = { score: s, volume: c.trait_volume, owner: ai.trait_owner_decides ?? null, web: ai.trait_weak_web ?? null, why: ai.reasoning || null };
      const place = { ai, leadScore: s };
      // Relevance is decided HERE, from a concrete reason the model must name. A bare
      // is_relevant=false is not trusted (2026-09-17: a small model rejected shops on Booksy
      // that scored 9). Unknown or missing reason = relevant.
      const REJECTS = ['chain', 'wrong_vertical', 'outside_market', 'closed', 'not_end_client'];
      const rejectReason = REJECTS.includes(ai.reject_reason) ? ai.reject_reason : null;
      ai.is_relevant = !rejectReason;
      if (rejectReason) { counts.not_relevant++; decide(c, 'score', `not a fit: ${rejectReason.replace(/_/g, ' ')}`, 'not_relevant', detail, place); continue; }
      if (s < minScore) { counts.below_score++; decide(c, 'score', `score ${s} below ${minScore}`, 'not_relevant', detail, place); continue; }
      const row = leadRow(ai, c, ctx);
      if (!row.phone && !row.email) { counts.no_contact++; decide(c, 'score', 'no phone or email', 'no_contact', detail, place); continue; }
      keep.push({ c, row, detail, place });
    }
    counts.kept = keep.length;
    if (!keep.length) return await finish('score');

    if (!dryRun) await progress({ stage: 'saving', apify_run_id: apifyRunId, location, done: 0, total: keep.length });
    for (const { c, row, detail, place } of keep) {
      if (dryRun) { decide(c, 'dry_run', 'would insert', 'qualified', { ...detail, channel: row.suggested_channel, bucket: row.pain_point_bucket }, place); continue; }
      const { data, error } = await supabase.from('leads').insert(row).select('id');
      // A BEFORE INSERT trigger that drops the row (old-school backstop) returns no row and no error.
      if (error || !data || !data.length) { counts.not_saved++; decide(c, 'insert', `not saved: ${error ? error.message : 'blocked by a database rule'}`, 'qualified', detail, place); continue; }
      counts.inserted++; decide(c, 'inserted', 'new lead', 'promoted', { ...detail, lead_id: data[0].id }, { ...place, leadId: data[0].id });
    }
    return await finish('done');
  } catch (e) {
    console.error('[leadgen native] run failed:', e);
    return finish('failed', `Failed: ${e.message}`).catch(() => ({ message: e.message, summary: { stopped_at: 'failed' } }));
  }
}

// ── Draft on demand ──────────────────────────────────────────────────────────
/** Write the A1-based outreach for ONE lead (its Google record + computed facts). Saves
 *  ai_draft_subject / ai_draft_message on the lead and returns them. */
async function draftForLead(leadId, { template = null } = {}) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const { data: lead, error } = await supabase.from('leads')
    .select('id, company_name, phone, email, region, phone_country, raw_signal, readiness, source_detail, qualification, suggested_channel')
    .eq('id', leadId).maybeSingle();
  if (error || !lead) throw new Error('Lead not found');
  const q = lead.qualification || {};
  let rec = {};
  try { rec = typeof lead.raw_signal === 'string' ? JSON.parse(lead.raw_signal) : (lead.raw_signal || {}); } catch { rec = {}; }
  // Two first-contact templates (Peter, 2026-09-17): A1 = the shop books through a platform
  // (Booksy, Fresha…), A1b = no website of its own and no booking tool. Falls back to A1.
  let tpl = template;
  if (!tpl) {
    const onPlatform = !!(q.booking_platform || bookingPlatformOf(rec));
    const { data } = await supabase.from('email_templates').select('code, subject, body').in('code', ['A1', 'A1b']).eq('is_active', true);
    const byCode = Object.fromEntries((data || []).map((t) => [t.code, t]));
    tpl = (onPlatform ? byCode.A1 : byCode.A1b) || byCode.A1 || null;
  }
  const c = {
    business_name: lead.company_name || rec.title || '', phone: lead.phone || '', email: lead.email || '',
    website: rec.website || '', city: rec.city || '', source_detail: lead.source_detail || '',
    raw_signal: typeof lead.raw_signal === 'string' ? lead.raw_signal : JSON.stringify(rec),
    readiness: lead.readiness || 'unknown', readiness_signals: q.readiness_signals || [],
    review_count: q.review_count ?? rec.reviewsCount ?? 0, rating: q.rating ?? rec.totalScore ?? 0,
    price_level: q.price_level || rec.price || null,
    booking_platform: q.booking_platform || bookingPlatformOf(rec),
    trait_volume: q.trait_volume ?? volumeOf(rec.reviewsCount, rec.totalScore),
  };
  const out = await chatJson(MODEL, prompt('leadgen-draft.txt'), userPrompt(c, { runCountry: lead.phone_country || 'US', template: tpl }), 0.5);
  const isEmail = !!lead.email;
  const patch = { ai_draft_subject: isEmail ? (out.draft_subject || null) : null, ai_draft_message: out.draft_message || null };
  if (!patch.ai_draft_message) throw new Error('The model returned no draft');
  const { error: uErr } = await supabase.from('leads').update(patch).eq('id', leadId);
  if (uErr) throw new Error(uErr.message);
  return { lead_id: leadId, template: tpl?.code || null, ...patch };
}

// ── Re-judge kept places after a rule change (free data, small AI cost) ──────
/** Judge again the places a run marked not_relevant / new, with today's rules; the ones that
 *  pass become leads. Returns { judged, promoted, still_rejected }. */
async function rejudgePlaces({ runId = null, statuses = ['not_relevant', 'new'], minScore = 5, limit = 200 } = {}) {
  let q = supabase.from('leadgen_places').select('*').in('status', statuses).eq('has_own_site', false).is('lead_id', null).gte('fit_score', MIN_VOLUME).limit(limit);
  if (runId) q = q.eq('last_run_id', runId);
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  const system = systemPrompt();
  const REJECTS = ['chain', 'wrong_vertical', 'outside_market', 'closed', 'not_end_client'];
  const out = { judged: 0, promoted: 0, still_rejected: 0, names: [] };
  await pool(rows || [], SCORE_CONCURRENCY, async (pl) => {
    const rec = pl.record || {};
    const c = { place_key: pl.place_key, business_name: pl.name, phone: pl.phone || '', email: pl.email || '', website: pl.website || '',
      has_own_site: false, city: pl.city || '', state: pl.region || '', country: pl.country || 'US', source_detail: pl.source_detail || pl.place_key,
      record: rec, raw_signal: JSON.stringify(rec), readiness: pl.readiness || 'middle', readiness_signals: [], booking_platform: pl.booking_platform,
      review_count: pl.review_count, rating: Number(pl.rating) || 0, price_level: pl.price_level, trait_volume: pl.fit_score };
    let ai; try { ai = await score(c, { system, runCountry: c.country }); } catch { return; }
    out.judged++;
    const reason = REJECTS.includes(ai.reject_reason) ? ai.reject_reason : null;
    ai.trait_volume = c.trait_volume; ai.lead_score = Math.min(Number(ai.lead_score) || 0, c.trait_volume + 1); ai.is_relevant = !reason;
    const row = leadRow(ai, c, { runCountry: c.country, runId: pl.last_run_id });
    if (reason || ai.lead_score < minScore || (!row.phone && !row.email)) {
      out.still_rejected++;
      await supabase.from('leadgen_places').update({ ai, lead_score: ai.lead_score, status: reason || ai.lead_score < minScore ? 'not_relevant' : 'no_contact', reason: reason ? `not a fit: ${reason.replace(/_/g, ' ')}` : ai.lead_score < minScore ? `score ${ai.lead_score} below ${minScore}` : 'no phone or email' }).eq('id', pl.id);
      return;
    }
    const { data, error: iErr } = await supabase.from('leads').insert(row).select('id');
    if (iErr || !data || !data.length) { await supabase.from('leadgen_places').update({ ai, lead_score: ai.lead_score, status: 'qualified', reason: `not saved: ${iErr ? iErr.message : 'blocked by a database rule'}` }).eq('id', pl.id); return; }
    out.promoted++; out.names.push(pl.name);
    await supabase.from('leadgen_places').update({ ai, lead_score: ai.lead_score, status: 'promoted', reason: 'new lead (re-judged)', lead_id: data[0].id }).eq('id', pl.id);
  });
  return out;
}

/** After the own-website patterns change: places kept as own_site whose "website" is no longer
 *  counted as one go back to 'new' so rejudgePlaces() can judge them. Returns the names. */
async function regatePlaces() {
  const { data } = await supabase.from('leadgen_places').select('id, name, website').eq('status', 'own_site').limit(5000);
  const flip = (data || []).filter((p) => !hasOwnSite({ website: p.website }));
  for (const p of flip) await supabase.from('leadgen_places').update({ has_own_site: false, status: 'new', reason: 'website is a social or link page, not their own site' }).eq('id', p.id);
  return flip.map((p) => p.name);
}

// ── Promote a kept place to a lead (staff action) ────────────────────────────
async function promotePlace(placeId, { userId = null } = {}) {
  const { data: pl, error } = await supabase.from('leadgen_places').select('*').eq('id', placeId).maybeSingle();
  if (error || !pl) throw new Error('Place not found');
  if (pl.lead_id) return { lead_id: pl.lead_id, already: true };
  // Peter's rule (2026-09-16): unclaimed listings are not our audience. Kept as data, never a lead.
  if (pl.readiness === 'old_school') throw new Error('This listing is unclaimed on Google (old-school). Those are kept for the statistics but are not promoted to leads.');
  const rec = pl.record || {};
  const c = {
    place_key: pl.place_key, business_name: pl.name, phone: pl.phone || '', email: pl.email || '', website: pl.website || '',
    has_own_site: pl.has_own_site, city: pl.city || '', state: pl.region || '', country: pl.country || 'US',
    source_detail: pl.source_detail || pl.place_key, record: rec, raw_signal: JSON.stringify(rec),
    readiness: pl.readiness || 'middle', readiness_signals: [],
    booking_platform: pl.booking_platform, review_count: pl.review_count, rating: Number(pl.rating) || 0,
    price_level: pl.price_level, trait_volume: pl.fit_score,
  };
  // Reuse the run's judgment when there is one; otherwise ask once (no draft).
  let ai = pl.ai;
  if (!ai && openai) { try { ai = await score(c, { system: systemPrompt(), runCountry: c.country }); } catch { ai = null; } }
  ai = { ...(ai || {}), trait_volume: c.trait_volume };
  if (ai.lead_score == null) ai.lead_score = c.trait_volume;
  if (!ai.vertical) ai.vertical = pl.vertical;
  const row = leadRow(ai, c, { runCountry: c.country, runId: pl.last_run_id });
  row.qualification.promoted_by = userId; row.qualification.promoted_from = pl.status;
  const { data, error: iErr } = await supabase.from('leads').insert(row).select('id');
  if (iErr) throw new Error(iErr.message);
  if (!data || !data.length) throw new Error('The database refused this lead (an unclaimed listing is blocked by rule).');
  await supabase.from('leadgen_places').update({ lead_id: data[0].id, status: 'promoted', reason: 'promoted by staff', ai, lead_score: ai.lead_score }).eq('id', placeId);
  return { lead_id: data[0].id, already: false };
}

module.exports = { placeRowFor: placeRow, runNative, rejudgePlaces, regatePlaces, draftForLead, promotePlace, savePlaces, ownerEmail, volumeOf, configured, candidateOf, bookingPlatformOf, hasOwnSite, locationOf, systemPrompt };
