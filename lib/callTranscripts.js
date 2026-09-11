// callTranscripts — transcribe + summarise a recorded CRM call (2026-09-11).
//
// Peter, first calling shift: "look at the call transcript from my call with
// this client and learn from it". Recordings were on Twilio but nobody could
// read them. Runs ONLY on the production server (Twilio rule): the recording
// is fetched here with the account credentials, sent to OpenAI's transcription
// endpoint (docs: /v1/audio/transcriptions, 25 MB cap, mp3 accepted, `prompt`
// steers names), then summarised into the shape the drawer and the team learn
// from: what the prospect asked, objected to, agreed to, and the next step.
//
// Entry points:
//   transcribeCall(callId, { force })  → { transcript, summary } (stores on calls)
//   queueTranscription(callId)         → fire-and-forget after recording-status
// Env: OPENAI_API_KEY (required), CALL_TRANSCRIPTS_ENABLED (default on; 'false'
// stops the webhook auto-run, the staff endpoint still works),
// TRANSCRIBE_MODEL (default gpt-4o-mini-transcribe), TRANSCRIPT_SUMMARY_MODEL
// (default gpt-4o-mini). Recordings under 20 s are skipped (voicemail beeps).
const OpenAI = require('openai');
const supabase = require('../config/supabase');
const { accountSid, authToken } = require('../config/twilio');

const MIN_SECONDS = 20;
const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL || 'gpt-4o-mini-transcribe';
const SUMMARY_MODEL = process.env.TRANSCRIPT_SUMMARY_MODEL || 'gpt-4o-mini';
const ENABLED = process.env.CALL_TRANSCRIPTS_ENABLED !== 'false';

let client = null;
function openai() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

async function fetchRecording(call) {
  const base = call.recording_url
    ? call.recording_url
    : `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${call.recording_sid}`;
  const url = base.endsWith('.mp3') ? base : `${base}.mp3`;
  const basic = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const r = await fetch(url, { headers: { Authorization: `Basic ${basic}` } });
  if (!r.ok) throw new Error(`Twilio recording fetch ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 25 * 1024 * 1024) throw new Error('Recording over the 25 MB transcription limit');
  return buf;
}

const SUMMARY_PROMPT = `You summarise a recorded sales call between a Stemfra rep and a small-business owner (barbershop, salon, gym, yoga studio, massage studio or spa). Stemfra builds and runs the business's website with online booking, reminders and an AI front desk, free to claim and publish, paid by a 5% commission on bookings. Return JSON only with these keys:
"summary": 2 to 4 sentences, plain English, no em-dashes.
"questions": the questions the prospect asked, verbatim where possible (array of strings).
"objections": concerns or pushbacks the prospect raised (array of strings).
"agreed": what the prospect agreed to or showed interest in (array of strings).
"next_step": one sentence, the concrete next action and who owns it, or "" if none.
"sentiment": one of "warm", "neutral", "cold".
"coaching": 1 to 3 short notes on what the rep could do better next time (array of strings).`;

async function summarise(transcript, ctx) {
  const res = await openai().chat.completions.create({
    model: SUMMARY_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SUMMARY_PROMPT },
      { role: 'user', content: `Business: ${ctx.company || 'unknown'}. Contact: ${ctx.contact || 'unknown'}. Direction: ${ctx.direction}. Duration: ${ctx.seconds}s.\n\nTranscript:\n${transcript.slice(0, 60_000)}` },
    ],
  });
  const text = res.choices?.[0]?.message?.content || '{}';
  try { return JSON.parse(text); } catch { return { summary: text.slice(0, 1000) }; }
}

async function transcribeCall(callId, { force = false } = {}) {
  const { data: call, error } = await supabase
    .from('calls')
    .select('id, direction, recording_url, recording_sid, recording_duration_seconds, duration_seconds, transcript, transcribed_at, lead_id, contact_id, leads:leads!calls_lead_id_fkey(company_name, contact_name, first_name), contacts:contacts!calls_contact_id_fkey(first_name, last_name)')
    .eq('id', callId).maybeSingle();
  if (error) throw error;
  if (!call) throw new Error('Call not found');
  if (call.transcript && !force) return { transcript: call.transcript, summary: null, cached: true };
  if (!call.recording_url && !call.recording_sid) throw new Error('No recording on this call');
  const seconds = call.recording_duration_seconds || call.duration_seconds || 0;
  if (seconds < MIN_SECONDS && !force) throw new Error(`Recording too short to transcribe (${seconds}s)`);

  const company = call.leads?.company_name || null;
  const contact = call.leads?.contact_name || [call.contacts?.first_name, call.contacts?.last_name].filter(Boolean).join(' ') || null;

  try {
    const audio = await fetchRecording(call);
    const file = new File([audio], `${call.id}.mp3`, { type: 'audio/mpeg' });
    const tr = await openai().audio.transcriptions.create({
      file,
      model: TRANSCRIBE_MODEL,
      response_format: 'text',
      // Names steer spelling; Stemfra is never in the model's vocabulary.
      prompt: `Stemfra sales call${company ? ` with ${company}` : ''}. Words: Stemfra, booking, commission, claim link.`,
    });
    const transcript = typeof tr === 'string' ? tr : (tr.text || '');
    const summary = transcript.trim() ? await summarise(transcript, { company, contact, direction: call.direction, seconds }) : null;
    await supabase.from('calls').update({ transcript, transcript_summary: summary, transcribed_at: new Date().toISOString(), transcript_error: null }).eq('id', call.id);
    return { transcript, summary };
  } catch (err) {
    await supabase.from('calls').update({ transcript_error: String(err.message || err).slice(0, 500) }).eq('id', call.id).then(() => {}, () => {});
    throw err;
  }
}

/** After recording-status: best-effort, never blocks the webhook. */
function queueTranscription(callId) {
  if (!ENABLED || !process.env.OPENAI_API_KEY) return;
  setImmediate(() => {
    transcribeCall(callId).catch((e) => console.warn('[transcripts] auto-transcribe failed:', callId, e.message));
  });
}

module.exports = { transcribeCall, queueTranscription, MIN_SECONDS };
