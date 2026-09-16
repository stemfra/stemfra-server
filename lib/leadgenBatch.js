// leadgenBatch — run MANY lead-gen runs back to back (2026-09-16, Peter: "generate
// 1,000 leads across US, UK and CA"). One trigger = one city × one vertical, at
// most 100 places, so a big pull is dozens of runs. This queue starts them one
// at a time on the server (survives a closed laptop), waits for each run's
// n8n summary (leadgen_runs.status leaves 'requested' through /run-complete),
// then starts the next, and rings the requester's bell once with the totals.
//
// One batch at a time per process (in-memory state; the leadgen_runs rows are
// the durable record). POST /api/leadgen/batch { runs: [...], pace_seconds? }
// with the same fields a single trigger takes per run; GET /batch/status.
const supabase = require('../config/supabase');
const { startRun } = require('./leadgenRun');

const RUN_TIMEOUT_MS = Number(process.env.LEADGEN_BATCH_RUN_TIMEOUT_MS || 12 * 60_000); // a 100-place run scores every candidate
const POLL_MS = 15_000;

let batch = null; // { id, requestedBy, runs: [{...params, runId, status, inserted, message}], index, startedAt, finishedAt, pace }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function batchStatus() {
  if (!batch) return { active: false };
  const done = batch.runs.filter((r) => r.status && r.status !== 'queued' && r.status !== 'running');
  return {
    active: !batch.finishedAt,
    id: batch.id,
    startedAt: batch.startedAt,
    finishedAt: batch.finishedAt || null,
    total: batch.runs.length,
    done: done.length,
    inserted: batch.runs.reduce((n, r) => n + (r.inserted || 0), 0),
    current: batch.runs[batch.index] ? { vertical: batch.runs[batch.index].vertical, city: batch.runs[batch.index].city, country: batch.runs[batch.index].country, status: batch.runs[batch.index].status } : null,
    runs: batch.runs.map((r) => ({ vertical: r.vertical, city: r.city, country: r.country, runId: r.runId, status: r.status, inserted: r.inserted ?? null, message: r.message || null })),
  };
}

// Wait for n8n's /run-complete to close the row (status completed | empty | failed).
async function waitForRun(runId) {
  const started = Date.now();
  while (Date.now() - started < RUN_TIMEOUT_MS) {
    await sleep(POLL_MS);
    const { data } = await supabase.from('leadgen_runs').select('status, leads_found, notes, metadata').eq('id', runId).maybeSingle();
    if (data && data.status && data.status !== 'requested') return data;
  }
  return null; // still 'requested': n8n never reported; the row stays for the Coverage page
}

async function runBatch() {
  for (batch.index = 0; batch.index < batch.runs.length; batch.index++) {
    if (batch.cancelled) break;
    const r = batch.runs[batch.index];
    r.status = 'running';
    try {
      const out = await startRun({ id: batch.requestedBy }, r);
      r.runId = out.runId;
      if (!out.json.success) { r.status = 'failed'; r.message = out.json.message; continue; }
      if (out.json.summary) {
        // Short run: the summary came back inline.
        r.status = out.json.summary.stopped_at === 'done' ? 'completed' : 'empty';
        r.inserted = out.json.summary.inserted || 0;
        r.message = out.json.message;
      } else if (r.runId) {
        const row = await waitForRun(r.runId);
        if (row) {
          r.status = row.status;
          r.inserted = row.leads_found || row.metadata?.inserted || 0;
          r.message = row.notes || null;
        } else { r.status = 'timeout'; r.message = 'n8n did not report within the wait'; }
      } else { r.status = 'unknown'; }
    } catch (e) {
      r.status = 'failed'; r.message = e.message;
    }
    if (batch.pace > 0 && batch.index < batch.runs.length - 1) await sleep(batch.pace * 1000);
  }
  batch.finishedAt = new Date().toISOString();

  // One bell with the totals, per country, to whoever started it.
  const s = batchStatus();
  const byCountry = {};
  for (const r of batch.runs) { const k = r.country || '?'; byCountry[k] = (byCountry[k] || 0) + (r.inserted || 0); }
  const failed = batch.runs.filter((r) => ['failed', 'timeout', 'unknown'].includes(r.status)).length;
  const title = `Lead-gen batch done: ${s.inserted} new lead${s.inserted === 1 ? '' : 's'} from ${s.total} run${s.total === 1 ? '' : 's'}`;
  const body = Object.entries(byCountry).map(([c, n]) => `${c}: ${n}`).join(' · ') + (failed ? ` · ${failed} run${failed === 1 ? '' : 's'} did not finish` : '');
  try {
    await supabase.rpc('crm_notify', { p_user: batch.requestedBy, p_kind: 'leadgen_run', p_title: title, p_body: body, p_route: '/leads', p_entity_type: 'leadgen_batch', p_entity_id: batch.id });
  } catch (e) { console.error('[leadgen-batch] notify failed:', e.message); }
  console.log(`[leadgen-batch] ${batch.id} finished: ${title} (${body})`);
}

/** Start a batch. Throws if one is already running. */
function startBatch({ requestedBy, runs, paceSeconds = 20 }) {
  if (batch && !batch.finishedAt) { const e = new Error('A lead-gen batch is already running.'); e.code = 'batch_running'; throw e; }
  if (!Array.isArray(runs) || !runs.length) throw new Error('runs must be a non-empty array');
  if (runs.length > 200) throw new Error('At most 200 runs per batch');
  batch = {
    id: `batch_${Date.now().toString(36)}`,
    requestedBy,
    runs: runs.map((r) => ({ ...r, status: 'queued' })),
    index: 0,
    pace: Math.max(0, Number(paceSeconds) || 0),
    startedAt: new Date().toISOString(),
    finishedAt: null,
    cancelled: false,
  };
  runBatch().catch((e) => { console.error('[leadgen-batch] crashed:', e.message); batch.finishedAt = new Date().toISOString(); });
  return batchStatus();
}

/** Stop after the current run finishes. */
function cancelBatch() {
  if (!batch || batch.finishedAt) return { active: false };
  batch.cancelled = true;
  return batchStatus();
}

module.exports = { startBatch, cancelBatch, batchStatus };
