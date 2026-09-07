// ElevenLabs narration with an on-disk cache. Same voice + settings as the CMS
// guided tour (stemfra_cms/scripts/generate-tour-voice.mjs): Jessica at 0.95.
// One mp3 per narration line, keyed by a hash of (text, voice, speed) so an
// unchanged line is never re-billed and a changed line re-records alone.
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

/** Returns { file, seconds } for a line of narration, recording it only once. */
export async function narrate(text, { cacheDir, apiKey, voiceId = VOICE_ID, speed = VOICE_SETTINGS.speed }) {
  mkdirSync(cacheDir, { recursive: true });
  const key = createHash('sha1').update(`${voiceId}|${speed}|${text}`).digest('hex').slice(0, 16);
  const file = join(cacheDir, `${key}.mp3`);
  if (!existsSync(file)) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${OUTPUT_FORMAT}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { ...VOICE_SETTINGS, speed } }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return { file, seconds: audioSeconds(file) };
}
