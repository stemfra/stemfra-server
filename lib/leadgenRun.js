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

// Which engine runs a COLD run: 'native' (lib/leadgenNative.js, in this process) or 'n8n'
// (the webhook). LEADGEN_ENGINE sets the default; a request may override with `engine`.
// Warm runs stay on n8n. P41, 2026-09-17.
const DEFAULT_ENGINE = (process.env.LEADGEN_ENGINE || 'native').toLowerCase() === 'n8n' ? 'n8n' : 'native';

/**
 * Close a run: leadgen_runs row (status, counts, the one-sentence summary) + the
 * requester's bell. ONE implementation for both engines: the n8n callback
 * (POST /api/leadgen/run-complete) and the native pipeline call this.
 */
async function closeRun({ runId = null, message = '', summary = {} }) {
  const s = summary && typeof summary === 'object' ? summary : {};
  const inserted = Number(s.inserted) || 0;
  const status = s.stopped_at === 'failed' ? 'failed' : inserted > 0 ? 'completed' : 'empty';
  const notes = String(message || '').slice(0, 500);
  if (!runId) { console.log('[leadgen] run closed without run_id:', notes); return { status }; }

  const { data: run, error } = await supabase.from('leadgen_runs')
    .update({ status, leads_found: inserted, completed_at: new Date().toISOString(), notes, metadata: s })
    .eq('id', runId).select('id, requested_by, city, vertical').maybeSingle();
  if (error) console.error('[leadgen] run close update failed:', error.message);

  const alreadyToasted = answeredInline.delete(runId);
  if (run?.requested_by && !alreadyToasted) {
    const where = [run.city, run.vertical ? run.vertical.replace('_', ' ') : null].filter(Boolean).join(' · ');
    const title = status === 'failed'
      ? `Lead-gen run failed${where ? ` (${where})` : ''}`
      : inserted > 0
        ? `Lead-gen: ${inserted} new lead${inserted === 1 ? '' : 's'}${where ? ` (${where})` : ''}`
        : `Lead-gen finished with no new leads${where ? ` (${where})` : ''}`;
    const { error: nErr } = await supabase.rpc('crm_notify', {
      p_user: run.requested_by, p_kind: 'leadgen_run', p_title: title, p_body: notes,
      p_route: '/leads', p_entity_type: 'leadgen_run', p_entity_id: String(runId),
    });
    if (nErr) console.error('[leadgen] run close notify failed:', nErr.message);
  }
  return { status };
}

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
    engine: engineReq = null,
    dry_run      = false,
  } = body;
  let engine = system === 'cold' ? (['native', 'n8n'].includes(engineReq) ? engineReq : DEFAULT_ENGINE) : 'n8n';

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
  const native = require('./leadgenNative');
  // No Apify / OpenAI key on this server yet: fall back to the n8n workflow when it is wired.
  if (engine === 'native' && !native.configured() && webhookUrl) engine = 'n8n';
  if (engine === 'native' && !native.configured()) {
    return { status: 503, json: { success: false, message: 'Native lead-gen needs APIFY_TOKEN and OPENAI_API_KEY on the server.' }, runId: null };
  }
  if (engine === 'n8n' && !webhookUrl) {
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

  // One run at a time (Peter, 2026-09-17): a second Fetch Leads while one is working is
  // refused unless the caller asks for it (`allow_parallel`; the batch runner is sequential
  // already). A run older than 35 minutes is treated as dead, not as "in progress".
  if (body.allow_parallel !== true) {
    const since = new Date(Date.now() - 35 * 60_000).toISOString();
    const { data: busy } = await supabase.from('leadgen_runs').select('id, city, vertical')
      .eq('status', 'requested').gte('requested_at', since).limit(1);
    if (busy && busy.length) {
      const b = busy[0];
      return { status: 409, json: { success: false, code: 'run_in_progress', run_id: b.id, message: `A lead-gen run is already in progress (${[b.city, String(b.vertical || '').replace('_', ' ')].filter(Boolean).join(' · ')}). Wait for it to finish.` }, runId: null };
    }
  }

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

  if (engine === 'native') {
    // Runs in this process, in the background; it closes its own run (closeRun) when done.
    // `done` lets a script or test await the result; the HTTP route ignores it.
    const done = native.runNative({ runId, payload, close: closeRun, dryRun: dry_run === true });
    return { status: 202, json: { success: true, engine, message: `Lead-gen run started for ${vertical}${city ? ` in ${city}` : ''}. You will get a notification when it finishes.`, run_id: runId }, runId, done };
  }

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

module.exports = { startRun, closeRun, answeredInline, DEFAULT_ENGINE };
