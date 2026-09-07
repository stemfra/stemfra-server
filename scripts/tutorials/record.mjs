#!/usr/bin/env node
// Stemfra CMS tutorial recorder (pipeline A in stemfra_platform/docs/CMS_TUTORIAL_VIDEOS.md).
//
//   node scripts/tutorials/record.mjs 01-welcome [--base http://localhost:5180] [--out <dir>]
//
// 1. Launches headless Chromium (Playwright, 1440x900, video recording on),
//    signs in to the CMS as the demo owner, and runs the video's segments from
//    videos/<id>.mjs. Each segment = one narration line + one on-screen action;
//    the recorder speaks the line (ElevenLabs, cached), performs the action with
//    a gliding overlay cursor, then holds the screen until the line has ended.
// 2. Records the branded intro/outro cards the same way (lib/cards.mjs).
// 3. Assembles with ffmpeg: intro + take + outro, narration placed at each
//    segment's timestamp, and writes <out>/<id>.mp4 + manifest.json + a
//    YouTube chapters block.
//
// Re-running re-uses every unchanged narration line (hash cache), so a label
// change re-records one sentence, not the video.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { narrate, elevenKey, audioSeconds } from './lib/narrate.mjs';
import { installCursor, makeCursor } from './lib/cursor.mjs';
import { introHtml, outroHtml } from './lib/cards.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(here, '..', '..');
const stemfraRoot = join(serverRoot, '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) { console.error('usage: record.mjs <video-id> [--base url] [--out dir] [--skip-cards]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const BASE = opt('--base', 'http://localhost:5180');
const OUT = opt('--out', join(stemfraRoot, 'stemfra_video', 'tutorials', id));
const W = 1440, H = 900, FPS = 30;
const INTRO_SECONDS = 6, OUTRO_SECONDS = 6;

const video = (await import(pathToFileURL(join(here, 'videos', `${id}.mjs`)).href)).default;
const work = join(OUT, 'work'); mkdirSync(work, { recursive: true });
const cache = join(stemfraRoot, 'stemfra_video', 'tutorials', '_narration-cache');
const apiKey = elevenKey(serverRoot);
const log = (...a) => console.log('[record]', ...a);

function login() {
  const txt = readFileSync(join(stemfraRoot, 'stemfra_email_service_key', 'demos-cms-login.txt'), 'utf8');
  const email = txt.match(/^Email:\s*(\S+)/m)?.[1];
  const password = txt.match(/^Password:\s*(\S+)/m)?.[1];
  if (!email || !password) throw new Error('demo CMS login not found');
  return { email: process.env.CMS_TUTORIAL_EMAIL || email, password: process.env.CMS_TUTORIAL_PASSWORD || password };
}

// Pre-record every narration line first, so the take never waits on the API.
log('narration...');
const lines = [];
const introLine = await narrate(video.intro, { cacheDir: cache, apiKey });
for (const s of video.segments) lines.push({ ...s, audio: await narrate(s.say, { cacheDir: cache, apiKey }) });
const outroLine = await narrate(video.outro, { cacheDir: cache, apiKey });
log(`${lines.length} lines ready`);

const browser = await chromium.launch({ headless: true });

/** Record one HTML card for N seconds; returns the mp4 path. */
async function recordCard(name, html, seconds) {
  const dir = join(work, `rec-${name}`); mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir, size: { width: W, height: H } } });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(seconds * 1000);
  await ctx.close();
  const webm = readdirSync(dir).filter((f) => f.endsWith('.webm')).map((f) => join(dir, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
  const mp4 = join(work, `${name}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-t', String(seconds), '-vf', `scale=${W}:${H},fps=${FPS},format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-an', mp4]);
  return mp4;
}

// ── The take ────────────────────────────────────────────────────────────────
const recDir = join(work, 'rec-main'); mkdirSync(recDir, { recursive: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: recDir, size: { width: W, height: H } }, colorScheme: 'light' });
await installCursor(ctx);
const page = await ctx.newPage();
const recStart = Date.now();
const now = () => (Date.now() - recStart) / 1000;

const creds = login();
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', creds.email);
await page.fill('input[type="password"]', creds.password);
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });
if (video.start) await video.start({ page, base: BASE });
await page.waitForTimeout(1500);
const cursor = makeCursor(page);
await cursor.moveTo(W * 0.62, H * 0.55, 10);
await page.waitForTimeout(600);

const takeStart = now();
const manifest = [];
for (const s of lines) {
  const start = now();
  log(`segment ${s.id} (${s.audio.seconds.toFixed(1)}s): ${s.say.slice(0, 60)}...`);
  try { await s.run({ page, cursor, base: BASE }); }
  catch (e) { log(`  ! action failed in ${s.id}: ${e.message.split('\n')[0]}`); }
  const minHold = s.audio.seconds + (s.hold ?? 0.7);
  const elapsed = now() - start;
  if (elapsed < minHold) await page.waitForTimeout((minHold - elapsed) * 1000);
  manifest.push({ id: s.id, title: s.title, say: s.say, start: start - takeStart, end: now() - takeStart, audio: s.audio.file, audioSeconds: s.audio.seconds });
}
await page.waitForTimeout(800);
const takeEnd = now();
await ctx.close();
const takeWebm = readdirSync(recDir).filter((f) => f.endsWith('.webm')).map((f) => join(recDir, f)).sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
log(`take recorded: ${takeWebm} (${(takeEnd - takeStart).toFixed(1)}s of ${takeEnd.toFixed(1)}s)`);

// ── Cards ───────────────────────────────────────────────────────────────────
const introMp4 = await recordCard('intro', introHtml(serverRoot, { title: video.title }), INTRO_SECONDS);
const outroMp4 = await recordCard('outro', outroHtml(serverRoot), OUTRO_SECONDS);
await browser.close();

// ── Assemble ────────────────────────────────────────────────────────────────
const takeMp4 = join(work, 'take.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', takeStart.toFixed(3), '-i', takeWebm, '-t', (takeEnd - takeStart).toFixed(3), '-vf', `scale=${W}:${H},fps=${FPS},format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-an', takeMp4]);
const silent = join(work, 'silent.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', introMp4, '-i', takeMp4, '-i', outroMp4, '-filter_complex', '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]', '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', silent]);
const total = audioSeconds(silent);

// Audio: every line placed on the final timeline (intro line at 1.6s, segment
// lines at INTRO + start, outro line at INTRO + take + 0.6s).
const placed = [
  { file: introLine.file, at: 1.6 },
  ...manifest.map((m) => ({ file: m.audio, at: INTRO_SECONDS + m.start })),
  { file: outroLine.file, at: INTRO_SECONDS + (takeEnd - takeStart) + 0.6 },
];
const inputs = placed.flatMap((p) => ['-i', p.file]);
const delays = placed.map((p, i) => `[${i + 1}:a]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[a${i}]`).join(';');
const mix = placed.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${placed.length}:normalize=0:duration=longest[aout]`;
const final = join(OUT, `${id}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-t', total.toFixed(3), final]);

// Chapters for the YouTube description (first chapter must be 0:00).
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const chapterRows = [['0:00', video.title]];
for (const m of manifest) if (m.title) chapterRows.push([mmss(INTRO_SECONDS + m.start), m.title]);
const chapters = chapterRows.map(([t, l]) => `${t} ${l}`).join('\n');
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ id, title: video.title, base: BASE, total, intro: INTRO_SECONDS, outro: OUTRO_SECONDS, take: takeEnd - takeStart, segments: manifest }, null, 2));
writeFileSync(join(OUT, 'chapters.txt'), `${video.description}\n\n${chapters}\n`);
log(`done: ${final} (${total.toFixed(1)}s)`);
