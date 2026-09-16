// leadgenRun — start ONE lead-gen run (the body of POST /api/leadgen/trigger,
// lifted out on 2026-09-16 so the batch runner (lib/leadgenBatch.js) can start
// runs without an HTTP round trip or a short-lived browser JWT). Validates the
// request, composes the Google Maps search, opens the coverage row
// (leadgen_runs), fires the n8n webhook and returns the same {status, json}
// the route used to send. Not Twilio; nothing here touches a phone line.
const supabase = require('../config/supabase');
const { KNOWN_VERTICALS } = require('./verticalConfig');

// Runs that answered their summary inline (a short run: every candidate dropped
// early) so the /run-complete callback can skip the duplicate bell.
const answeredInline = new Set();

/**
 * @param {{id:string}} user  the staff user starting the run (leadgen_runs.requested_by)
 * @param {object} body       the trigger payload (system, vertical, city, country, …)
 * @returns {Promise<{status:number, json:object, runId:string|null}>}
 */
async function startRun(user, body = {}) {
  const {
    system       = 'cold',
    vertical     = 'barbershop',
    city         = '',
    country      = null,
    country_name = null,
    state_code   = null,
    state_name   = null,
    search_query,
    max_results  = 30,
    min_score    = 5,
  } = body;

  if (system !== 'cold' && system !== 'warm') {
    return { status: 400, json: { success: false, message: 'system must be "cold" or "warm".' }, runId: null };
  }
  if (!KNOWN_VERTICALS.has(vertical)) {
    return { status: 400, json: { success: false, message: `Unknown vertical "${vertical}". Allowed: ${[...KNOWN_VERTICALS].join(', ')}.` }, runId: null };
  }
  if (system === 'cold' && !city && !search_query) {
    return { status: 400, json: { success: false, message: 'A city or search_query is required for a cold run.' }, runId: null };
  }
  const maxResults = Math.min(Math.max(parseInt(max_results, 10) || 30, 1), 100); // clamp 1–100
  const minScore   = Math.min(Math.max(parseInt(min_score, 10) || 5, 1), 10);     // clamp 1–10

  const webhookUrl = system === 'cold' ? process.env.N8N_LEADGEN_COLD_URL : process.env.N8N_LEADGEN_WARM_URL;
  if (!webhookUrl) {
    return { status: 503, json: { success: false, message: `Lead-gen (${system}) is not configured on the server yet.` }, runId: null };
  }

  // "barbershop in Brooklyn, New York, United States": full state name > ISO code > nothing.
  const verticalText   = vertical.replace('_', ' ');
  const stateSegment   = state_name   || state_code   || null;
  const countrySegment = country_name || country      || null;
  const segments       = [city, stateSegment, countrySegment].filter(Boolean);
  const defaultQuery   = `${verticalText} in ${segments.join(', ')}`;

  // The active A1 outreach template rides along so the scoring agent drafts
  // inside the agreed structure (Template Manager = source of truth). Best-effort.
  let template_a1 = null;
  try {
    const { data: tpl } = await supabase.from('email_templates').select('subject, body').eq('code', 'A1').eq('is_active', true).maybeSingle();
    if (tpl) template_a1 = tpl;
  } catch { /* freehand fallback */ }

  const payload = {
    system, vertical, city, country, country_name, state_code, state_name,
    search_query: search_query || defaultQuery,
    max_results: maxResults,
    min_score:   minScore,
    template_a1,
    triggered_by: user.id,
    triggered_at: new Date().toISOString(),
  };

  // Coverage ledger: ONE leadgen_runs row per run, BEFORE the webhook, so even a
  // failed/empty run counts as "we tried this city"; run_id rides on the payload.
  let runId = null;
  try {
    const { data: run, error } = await supabase.from('leadgen_runs').insert({
      system, vertical, country: country || null, country_name: country_name || null,
      state_code: state_code || null, state_name: state_name || null, city: city || null,
      search_query: payload.search_query, max_results: maxResults, min_score: minScore,
      requested_by: user.id, status: 'requested',
    }).select('id').single();
    if (error) console.error('[leadgen] coverage run insert failed:', error.message);
    else { runId = run.id; payload.run_id = runId; }
  } catch (e) { console.error('[leadgen] coverage run insert threw:', e.message); }

  try {
    // Fire the webhook; a short run answers its summary inside the 25 s wait,
    // a long one times out here and reports through /run-complete instead.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.N8N_WEBHOOK_SECRET) headers['x-leadgen-secret'] = process.env.N8N_WEBHOOK_SECRET;
    const r = await fetch(webhookUrl, { method: 'POST', headers, body: JSON.stringify(payload), signal: controller.signal });
    clearTimeout(timeout);

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      console.error('[leadgen] n8n webhook returned', r.status, text);
      if (runId) await supabase.from('leadgen_runs').update({ status: 'failed', notes: `n8n ${r.status}` }).eq('id', runId).then(() => {}, () => {});
      return { status: 502, json: { success: false, message: `Lead-gen workflow could not be started (n8n responded ${r.status}).` }, runId };
    }

    const resBody = await r.json().catch(() => null);
    if (resBody && resBody.summary && typeof resBody.message === 'string') {
      if (runId) answeredInline.add(runId);
      return { status: 200, json: { success: true, message: resBody.message, summary: resBody.summary, run_id: runId }, runId };
    }
    return { status: 202, json: { success: true, message: `Lead-gen ${system} run started for ${vertical}${city ? ` in ${city}` : ''}. You will get a notification when it finishes.`, run_id: runId }, runId };
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[leadgen] n8n webhook timed out waiting for response (run likely still in progress)');
      return { status: 202, json: { success: true, message: 'Lead-gen run started (still processing). Check the review queue in a few minutes.', run_id: runId }, runId };
    }
    console.error('[leadgen] trigger error:', err);
    if (runId) await supabase.from('leadgen_runs').update({ status: 'failed', notes: err.message }).eq('id', runId).then(() => {}, () => {});
    return { status: 500, json: { success: false, message: err.message }, runId };
  }
}

module.exports = { startRun, answeredInline };
