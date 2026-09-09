// ElevenLabs narration with WORD TIMESTAMPS and an on-disk cache. Same voice +
// settings as the CMS guided tour (stemfra_cms/scripts/generate-tour-voice.mjs):
// Jessica at 0.95. One mp3 + one json per narration line, keyed by a hash of
// (text, voice, speed): an unchanged line is never re-billed, a changed line
// re-records alone. The word times let the recorder move the cursor to a
// target exactly when its word is spoken (see record.mjs `cue`).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export const VOICE_ID = 'DbwWo4rVEd5NrejHYUnm'; // Jessica, the brand voice
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';
const VOICE_SETTINGS = { speed: 0.95, stability: 0.5, similarity_boost: 0.75 };

export function elevenKey(serverRoot) {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const m = readFileSync(join(serverRoot, '.env'), 'utf8').match(/^ELEVENLABS_API_KEY=(\S+)/m);
  if (!m) throw new Error('No ELEVENLABS_API_KEY in env or stemfra_server/.env');
  return m[1];
}

export function audioSeconds(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
  return Number(out);
}

/** Character alignment -> [{ word, start, end }] (lower-cased, punctuation stripped). */
function wordsFromAlignment(a) {
  const words = [];
  let cur = null;
  a.characters.forEach((ch, i) => {
    const s = a.character_start_times_seconds[i], e = a.character_end_times_seconds[i];
    if (/\s/.test(ch)) { if (cur) { words.push(cur); cur = null; } return; }
    if (!cur) cur = { word: '', start: s, end: e };
    cur.word += ch; cur.end = e;
  });
  if (cur) words.push(cur);
  return words.map((w) => ({ ...w, word: w.word.toLowerCase().replace(/[^a-z0-9']/g, '') })).filter((w) => w.word);
}

/** Seconds into the line at which `phrase` starts, or null when not found. */
export function phraseStart(words, phrase) {
  const target = phrase.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9']/g, '')).filter(Boolean);
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => words[i + k].word === t)) return words[i].start;
  }
  return null;
}

/** Dry-run stand-in: Jessica at 0.95 averages ~2.6 words a second; no audio file. */
export function estimateLine(text) {
  const ws = text.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9']/g, '')).filter(Boolean);
  const per = 1 / 2.6; let t = 0.15;
  const words = ws.map((word) => { const w = { word, start: t, end: t + per * 0.85 }; t += per + (/[.,:;]$/.test(word) ? 0.18 : 0); return w; });
  return { file: null, seconds: t + 0.3, words, estimated: true };
}

/** Returns { file, seconds, words } for a line of narration, recording it only once. */
export async function narrate(text, { cacheDir, apiKey, voiceId = VOICE_ID, speed = VOICE_SETTINGS.speed, dry = false }) {
  mkdirSync(cacheDir, { recursive: true });
  const key = createHash('sha1').update(`${voiceId}|${speed}|${text}`).digest('hex').slice(0, 16);
  const file = join(cacheDir, `${key}.mp3`), meta = join(cacheDir, `${key}.json`);
  if (dry && !(existsSync(file) && existsSync(meta))) return estimateLine(text);
  if (!existsSync(file) || !existsSync(meta)) {
    // Retry on transient network errors and on Cloudflare's "Just a moment"
    // challenge page (seen 2026-09-08 as a 403 HTML body), with a short backoff.
    let j;
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${OUTPUT_FORMAT}`, {
          method: 'POST',
          headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'stemfra-tutorials/1.0 (+https://stemfra.com)' },
          body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { ...VOICE_SETTINGS, speed } }),
        });
        if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).replace(/<[^>]+>/g, ' ').slice(0, 120)}`);
        j = await res.json();
        break;
      } catch (e) {
        if (attempt >= 4) throw e;
        await new Promise((r) => setTimeout(r, attempt * 4000));
      }
    }
    writeFileSync(file, Buffer.from(j.audio_base64, 'base64'));
    writeFileSync(meta, JSON.stringify({ text, words: wordsFromAlignment(j.normalized_alignment || j.alignment) }));
  }
  const { words } = JSON.parse(readFileSync(meta, 'utf8'));
  return { file, seconds: audioSeconds(file), words };
}
