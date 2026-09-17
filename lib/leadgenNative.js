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

const PROMPT_FILE = path.join(__dirname, '..', 'prompts', 'leadgen-system.txt');
// Retired offers must never reach the scorer again (the 2026-09-17 audit).
const RETIRED = ['$1,000', '$99', '$399', 'monthly plan from', 'not US-based'];
function systemPrompt() {
  const text = fs.readFileSync(PROMPT_FILE, 'utf8').trim();
  const stale = RETIRED.find((s) => text.includes(s));
  if (stale) throw new Error(`prompts/leadgen-system.txt carries retired content: "${stale}"`);
  return text;
}

function configured() { return !!process.env.APIFY_TOKEN && !!openai; }

// A listing whose "website" is one of these does not own its storefront.
const NOT_OWN_SITE = /(linktr\.ee|linktree|lnk\.bio|bio\.link|beacons\.ai|instagram\.com|facebook\.com|tiktok\.com|business\.site|yelp\.com|booksy\.com|vagaro\.com|square\.site|squareup\.com|fresha\.com|schedulicity|setmore|acuityscheduling|as\.me|glossgenius|mindbodyonline|mindbody\.io|styleseat\.com|thecut\.co|joinblvd|blvd\.co|janeapp|jane\.app|massagebook|treatwell|wellnessliving|momence|genbook|simplybook|calendly|wixsite\.com|godaddysites\.com|sites\.google\.com|weebly\.com|perceny\.com|nearcut\.com)/i;
const PLATFORMS = [
  ['booksy', /booksy\.com/i], ['fresha', /fresha\.com/i], ['vagaro', /vagaro\.com/i],
  ['mindbody', /mindbodyonline|mindbody\.io/i], ['square', /square\.site|squareup\.com/i],
  ['styleseat', /styleseat\.com/i], ['glossgenius', /glossgenius/i], ['schedulicity', /schedulicity/i],
  ['acuity', /acuityscheduling|\/\/[^/]*as\.me/i], ['setmore', /setmore/i], ['thecut', /thecut\.co/i],
  ['boulevard', /joinblvd|blvd\.co/i],
  ['other', /janeapp|jane\.app|massagebook|treatwell|wellnessliving|momence|zenoti|booker\.com|genbook|simplybook|calendly|nearcut\.com|perceny\.com/i],
];
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
function candidateOf(p) {
  const { readiness, signals } = readinessOf(p);
  const record = recordFromPlace(p);
  delete record.refreshed_from;
  return {
    business_name: p.title || '',
    phone: p.phone || p.phoneUnformatted || p.contactDetails?.phones?.[0] || '',
    email: ownerEmail([...(p.emails || []), ...(p.contactDetails?.emails || [])]),
    website: p.website || '',
    city: p.city || '',
    source_detail: p.url || p.placeId || '',
    raw_signal: JSON.stringify(record),
    readiness, readiness_signals: signals,
    booking_platform: bookingPlatformOf(p),
    review_count: Number(p.reviewsCount) || 0,
    rating: Number(p.totalScore) || 0,
    price_level: p.price || null,
    trait_volume: volumeOf(p.reviewsCount, p.totalScore),
  };
}

// ── Prompt (the n8n Build Prompt node) ───────────────────────────────────────
function userPrompt(c, { runCountry, template }) {
  const lines = [
    'signal_source: google_maps', 'raw_signal:', c.raw_signal, '',
    'Known structured fields (may be partial):',
    `business_name: ${c.business_name}`, `phone: ${c.phone}`, `email: ${c.email}`, `website: ${c.website}`,
    `city: ${c.city}`, `listing_url: ${c.source_detail}`,
    `digital_readiness: ${c.readiness}${c.readiness_signals.length ? ` (${c.readiness_signals.join(', ')})` : ''}`,
    `review_count: ${c.review_count}`, `rating: ${c.rating}`, `trait_volume: ${c.trait_volume} (computed, copy it)`, `price_level: ${c.price_level || 'unknown'}`,
    `booking_platform: ${c.booking_platform || 'none'} (where the listing's website or Book button points)`,
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

async function score(c, ctx) {
  const r = await openai.chat.completions.create({
    model: MODEL, temperature: 0.3, response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: ctx.system }, { role: 'user', content: userPrompt(c, ctx) }],
  });
  return JSON.parse(r.choices[0].message.content || '{}');
}

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
    ai_draft_subject: ai.draft_subject || null,
    ai_draft_message: ai.draft_message || null,
    source: 'google_maps', stage: 'new_lead', review_status: 'needs_review', service: 'website',
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

/**
 * Run the whole pipeline for one leadgen_runs row. Never throws: a failure closes
 * the run as failed with the error in notes. `close` = leadgenRun.closeRun.
 * `dryRun` scores but inserts nothing (the decisions still show what would land).
 */
async function runNative({ runId, payload, close, dryRun = false }) {
  const decisions = [];
  const decide = (c, stage, reason, extra = {}) => decisions.push({ name: c.business_name || c.title || '?', stage, reason, ...extra });
  const progress = async (p) => {
    if (!runId) return;
    await supabase.from('leadgen_runs').update({ metadata: { engine: 'native', progress: { ...p, at: new Date().toISOString() } } }).eq('id', runId).then(() => {}, () => {});
  };
  const counts = { scraped: 0, had_website: 0, no_website: 0, old_school: 0, digital_ready: 0, duplicates: 0, new_candidates: 0, scored: 0, score_errors: 0, not_relevant: 0, below_score: 0, no_contact: 0, kept: 0, inserted: 0, not_saved: 0 };
  const where = payload.city || payload.search_query || 'run';
  const minScore = Number(payload.min_score) || 5;
  const runCountry = String(payload.country || 'US').toUpperCase();
  const finish = (stopped_at, extraMsg) => {
    const parts = [`${counts.scraped} place${counts.scraped === 1 ? '' : 's'} scraped`];
    if (counts.had_website) parts.push(`${counts.had_website} had a website`);
    if (counts.old_school) parts.push(`${counts.old_school} old-school listing${counts.old_school === 1 ? '' : 's'} skipped`);
    if (counts.duplicates) parts.push(`${counts.duplicates} already in the CRM`);
    if (counts.not_relevant) parts.push(`${counts.not_relevant} not a fit`);
    if (counts.below_score) parts.push(`${counts.below_score} scored below ${minScore}`);
    if (counts.no_contact) parts.push(`${counts.no_contact} without a phone or email`);
    if (counts.score_errors) parts.push(`${counts.score_errors} scoring error${counts.score_errors === 1 ? '' : 's'}`);
    if (counts.not_saved) parts.push(`${counts.not_saved} not saved`);
    parts.push(dryRun ? `${counts.kept} would be new leads (dry run)` : `${counts.inserted} new lead${counts.inserted === 1 ? '' : 's'}`);
    const message = `${where}: ${parts.join(', ')}.${extraMsg ? ` ${extraMsg}` : ''}`;
    const summary = { ...counts, stopped_at, engine: 'native', dry_run: dryRun, model: MODEL, city: payload.city || null, vertical: payload.vertical || null, decisions };
    return close({ runId, message, summary }).then(() => ({ message, summary }));
  };

  try {
    const system = systemPrompt();
    const { places, apifyRunId, location } = await scrape(payload, progress);
    counts.scraped = places.length;
    if (!places.length) return await finish('scrape');

    const noSite = [];
    for (const p of places) {
      if (hasOwnSite(p)) { counts.had_website++; decide(p, 'website_filter', `own website: ${p.website}`, { reviews: Number(p.reviewsCount) || 0, rating: Number(p.totalScore) || 0, platform: bookingPlatformOf(p) }); } else noSite.push(p);
    }
    counts.no_website = noSite.length;
    if (!noSite.length) return await finish('website_filter');

    const ready = [];
    for (const p of noSite) {
      const c = candidateOf(p);
      if (!c.business_name || !c.source_detail) { decide(c, 'normalize', 'no name or listing url'); continue; }
      if (c.readiness === 'old_school') { counts.old_school++; decide(c, 'readiness', 'unclaimed listing'); } else ready.push(c);
    }
    counts.digital_ready = ready.length;
    if (!ready.length) return await finish('readiness');

    const { data: existing, error: dErr } = await supabase.from('leads').select('source_detail')
      .eq('source', 'google_maps').in('source_detail', ready.map((c) => c.source_detail));
    if (dErr) throw new Error(`dedupe lookup failed: ${dErr.message}`);
    const seen = new Set((existing || []).map((r) => r.source_detail));
    const fresh = [];
    for (const c of ready) {
      if (seen.has(c.source_detail)) { counts.duplicates++; decide(c, 'dedupe', 'already in the CRM'); } else { seen.add(c.source_detail); fresh.push(c); }
    }
    counts.new_candidates = fresh.length;
    if (!fresh.length) return await finish('dedupe');

    await progress({ stage: 'scoring', apify_run_id: apifyRunId, location, done: 0, total: fresh.length });
    const ctx = { system, runCountry, template: payload.template_a1 || null, runId };
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
      const facts = { reviews: c.review_count, rating: c.rating, platform: c.booking_platform };
      if (error || !ai) { counts.score_errors++; decide(c, 'score', `scoring failed: ${error || 'empty'}`, facts); continue; }
      counts.scored++;
      ai.trait_volume = c.trait_volume;
      // lead_score can never sit more than one point above the volume trait.
      const s = Math.min(Number(ai.lead_score) || 0, c.trait_volume + 1);
      ai.lead_score = s;
      const detail = { ...facts, score: s, volume: ai.trait_volume ?? null, owner: ai.trait_owner_decides ?? null, web: ai.trait_weak_web ?? null, why: ai.reasoning || null };
      if (ai.is_relevant !== true) { counts.not_relevant++; decide(c, 'score', 'not relevant', detail); continue; }
      if (s < minScore) { counts.below_score++; decide(c, 'score', `score ${s} below ${minScore}`, detail); continue; }
      const row = leadRow(ai, c, ctx);
      if (!row.phone && !row.email) { counts.no_contact++; decide(c, 'score', 'no phone or email', detail); continue; }
      keep.push({ c, row, detail });
    }
    counts.kept = keep.length;
    if (!keep.length) return await finish('score');

    if (!dryRun) {
      await progress({ stage: 'saving', apify_run_id: apifyRunId, location, done: 0, total: keep.length });
      for (const { c, row, detail } of keep) {
        const { data, error } = await supabase.from('leads').insert(row).select('id');
        if (error) { counts.not_saved++; decide(c, 'insert', `not saved: ${error.message}`, detail); continue; }
        // A BEFORE INSERT trigger that drops the row (old-school backstop) returns no row and no error.
        if (!data || !data.length) { counts.not_saved++; decide(c, 'insert', 'not saved: blocked by a database rule', detail); continue; }
        counts.inserted++; decide(c, 'inserted', 'new lead', { ...detail, lead_id: data[0].id });
      }
    } else {
      for (const { c, row, detail } of keep) decide(c, 'dry_run', 'would insert', { ...detail, subject: row.ai_draft_subject, draft: row.ai_draft_message, channel: row.suggested_channel, bucket: row.pain_point_bucket });
    }
    return await finish('done');
  } catch (e) {
    console.error('[leadgen native] run failed:', e);
    return finish('failed', `Failed: ${e.message}`).catch(() => ({ message: e.message, summary: { stopped_at: 'failed' } }));
  }
}

module.exports = { runNative, ownerEmail, volumeOf, configured, candidateOf, bookingPlatformOf, hasOwnSite, locationOf, systemPrompt };
