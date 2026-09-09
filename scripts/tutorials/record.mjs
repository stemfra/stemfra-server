#!/usr/bin/env node
// Stemfra CMS tutorial recorder (pipeline A in stemfra_platform/docs/CMS_TUTORIAL_VIDEOS.md).
//
//   node scripts/tutorials/record.mjs 01-welcome [--base http://localhost:5180] [--out <dir>] [--hd | --2k]
//
// 1. Headless Chromium (Playwright) at 1920x1080, deviceScaleFactor 2, frames
//    captured through CDP screencast (lib/capture.mjs) -> a 3840x2160 master
//    (--hd records at scale 1 -> 1920x1080, faster for drafts; --2k at
//    scale 4/3 -> 2560x1440). Signs in as the
//    demo owner and runs the video's segments from videos/<id>.mjs: one
//    narration line + one on-screen action each. Narration comes from
//    ElevenLabs with word timestamps (lib/narrate.mjs, cached); the recorder
//    starts a line, and every cursor move marked `at: '<phrase>'` waits for
//    that word, so pointer and voice stay together.
// 2. Records the branded intro/outro cards the same way (lib/cards.mjs).
// 3. ffmpeg: intro + take + outro, narration placed by Chromium's own frame
//    timestamps, -> <out>/<id>.mp4 + manifest.json + chapters.txt.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { narrate, elevenKey, audioSeconds, phraseStart } from './lib/narrate.mjs';
import { installCursor, makeCursor } from './lib/cursor.mjs';
import { introHtml, outroHtml, coverHtml, renderCard, renderCover, INTRO_SECONDS, OUTRO_SECONDS } from './lib/cards.mjs';
import { startCapture, encodeFrames, dropFrames } from './lib/capture.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(here, '..', '..');
const stemfraRoot = join(serverRoot, '..');
const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
if (!id) { console.error('usage: record.mjs <video-id> [--base url] [--out dir] [--hd | --2k]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf(k); return i === -1 ? d : args[i + 1]; };
const BASE = opt('--base', 'http://localhost:5180');
const OUT = opt('--out', join(stemfraRoot, 'stemfra_video', 'tutorials', id));
const SCALE = args.includes('--hd') ? 1 : args.includes('--2k') ? 4 / 3 : 2;
const DRY = args.includes('--dry'); // no ElevenLabs: estimated word timing, silent output (script/selector checks)
const VW = 1920, VH = 1080, W = Math.round(VW * SCALE), H = Math.round(VH * SCALE), FPS = 30;
const CUE_LEAD = 0.9; // seconds before a phrase that its cursor move starts

const video = (await import(pathToFileURL(join(here, 'videos', `${id}.mjs`)).href)).default;
const work = join(OUT, 'work'); mkdirSync(work, { recursive: true });
const cache = join(stemfraRoot, 'stemfra_video', 'tutorials', '_narration-cache');
const apiKey = DRY ? null : elevenKey(serverRoot);
const say = (text) => narrate(text, { cacheDir: cache, apiKey, dry: DRY });
const log = (...a) => console.log('[record]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function login() {
  const txt = readFileSync(join(stemfraRoot, 'stemfra_email_service_key', 'demos-cms-login.txt'), 'utf8');
  const email = txt.match(/^Email:\s*(\S+)/m)?.[1];
  const password = txt.match(/^Password:\s*(\S+)/m)?.[1];
  if (!email || !password) throw new Error('demo CMS login not found');
  return { email: process.env.CMS_TUTORIAL_EMAIL || email, password: process.env.CMS_TUTORIAL_PASSWORD || password };
}

// Narration first (cached), so the take never waits on the API.
log('narration...');
// The cover card is SILENT (Peter, 2026-09-08: a line on the card ran over the
// first CMS line and read as two voices). The video's `intro` promise is spoken
// as the first line over the opening screen instead, cursor at rest.
const lines = [];
if (video.intro) lines.push({ id: 'intro', title: undefined, say: video.intro, hold: 0.4, run: async () => {}, audio: await say(video.intro) });
for (const s of video.segments) lines.push({ ...s, audio: await say(s.say) });
const outroLine = await say(video.outro);
log(`${lines.length} lines ready${DRY ? ' (dry run: ' + lines.filter((l) => l.audio.estimated).length + ' estimated)' : ''}`);

const browser = await chromium.launch({ headless: true });

// Cards are deterministic: every frame is T stepped by 1/FPS and screenshotted
// (lib/cards.mjs renderCard), never a real-time screencast, so the motion is
// smooth even at 4K where the screencast only manages ~11 fps.
async function recordCard(name, html, seconds) {
  const dir = join(work, `frames-${name}`);
  const mp4 = await renderCard(browser, html, { seconds, out: join(work, `${name}.mp4`), workDir: dir, scale: SCALE, fps: FPS, width: W, height: H });
  dropFrames(dir);
  return mp4;
}

// ── The take ────────────────────────────────────────────────────────────────
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: SCALE, colorScheme: 'light' });
await installCursor(ctx);
const page = await ctx.newPage();
// Account: the demo owner by default; `account: 'launch'` uses LAUNCH_EMAIL /
// LAUNCH_PASSWORD (the fresh-site account for Playlist 4); `signup: true`
// skips the login entirely (the video films the sign-up itself).
if (!video.signup) {
  const creds = video.account === 'launch'
    ? { email: process.env.LAUNCH_EMAIL, password: process.env.LAUNCH_PASSWORD }
    : login();
  if (!creds.email || !creds.password) throw new Error('missing credentials for this video');
  await page.goto(`${BASE}/login`, { waitUntil: 'load' });
  await page.fill('input[type="email"]', creds.email);
  await page.fill('input[type="password"]', creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });
}
if (video.start) await video.start({ page, base: BASE });
await page.waitForTimeout(1200);
const cursor = makeCursor(page);
await cursor.moveTo(VW * 0.62, VH * 0.55, 10);

const cap = await startCapture(page, join(work, 'frames-take'), { maxWidth: W, maxHeight: H });
await cap.tick(); await sleep(400);
const takeStart = Date.now() / 1000;
const manifest = [];
for (const s of lines) {
  const t0 = Date.now() / 1000;
  // The voice starts CUE_LEAD after the segment does, so even a line's first
  // word can be led by the pointer (the cursor is already gliding as it lands).
  const speakAt = t0 + CUE_LEAD;
  const missing = [];
  cursor.setCue(async (phrase) => {
    const at = phraseStart(s.audio.words, phrase);
    if (at == null) { missing.push(phrase); return; }
    const wait = speakAt + at - CUE_LEAD - Date.now() / 1000;
    if (wait > 0) await sleep(wait * 1000);
  });
  log(`segment ${s.id} (${s.audio.seconds.toFixed(1)}s): ${s.say.slice(0, 56)}...`);
  // goto: navigate (any origin) and bring the overlay cursor back where it was.
  const goto = async (url, wait = 1200) => { await page.goto(url, { waitUntil: 'load' }).catch(() => {}); await sleep(wait); const p = cursor.pos(); await page.mouse.move(p.x, p.y); await cap.tick(); };
  try { await s.run({ page, cursor, base: BASE, goto }); }
  catch (e) { log(`  ! action failed in ${s.id}: ${e.message.split('\n')[0]}`); }
  if (missing.length) log(`  ! cue phrase not in line: ${missing.join(' | ')}`);
  const minHold = CUE_LEAD + s.audio.seconds + (s.hold ?? 0.7);
  const elapsed = Date.now() / 1000 - t0;
  if (elapsed < minHold) await sleep((minHold - elapsed) * 1000);
  await cap.tick();
  manifest.push({ id: s.id, title: s.title, say: s.say, start: t0 - takeStart, speak: speakAt - takeStart, end: Date.now() / 1000 - takeStart, audio: s.audio.file, audioSeconds: s.audio.seconds });
}
await cap.tick(); await sleep(800);
const takeEnd = Date.now() / 1000;
const takeFrames = await cap.stop();
// Optional cleanup (e.g. delete the demo record the video created). Runs after
// the capture stops, so nothing of it is filmed.
if (video.finish) { try { await video.finish({ page, base: BASE }); log('finish() done'); } catch (e) { log(`! finish() failed: ${e.message.split('\n')[0]}`); } }
await ctx.close();
log(`take: ${takeFrames.length} frames over ${(takeEnd - takeStart).toFixed(1)}s`);
const takeMp4 = encodeFrames(takeFrames, { startTs: takeStart, endTs: takeEnd, out: join(work, 'take.mp4'), width: W, height: H, fps: FPS });
dropFrames(join(work, 'frames-take'));

// ── Cards ───────────────────────────────────────────────────────────────────
const introMp4 = await recordCard('intro', introHtml(serverRoot, { title: video.title }), INTRO_SECONDS);
const outroMp4 = await recordCard('outro', outroHtml(serverRoot), OUTRO_SECONDS);
await renderCover(browser, coverHtml(serverRoot, { title: video.title }), join(OUT, 'cover.png')); // YouTube thumbnail = the intro's resolved frame
await browser.close();

// ── Assemble ────────────────────────────────────────────────────────────────
const silent = join(work, 'silent.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', introMp4, '-i', takeMp4, '-i', outroMp4, '-filter_complex', '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]', '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', silent]);
const total = audioSeconds(silent);
const takeLen = takeEnd - takeStart;
const placed = [
  ...manifest.map((m) => ({ file: m.audio, at: INTRO_SECONDS + m.speak })),
  { file: outroLine.file, at: INTRO_SECONDS + takeLen + 0.6 },
].filter((p) => p.file);
const inputs = placed.flatMap((p) => ['-i', p.file]);
const delays = placed.map((p, i) => `[${i + 1}:a]adelay=${Math.round(p.at * 1000)}|${Math.round(p.at * 1000)}[a${i}]`).join(';');
const mix = placed.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${placed.length}:normalize=0:duration=longest[aout]`;
const final = join(OUT, `${id}.mp4`);
if (!placed.length) execFileSync('cp', [silent, final]); else execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', total.toFixed(3), '-movflags', '+faststart', final]);

const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const chapterRows = [['0:00', video.title]];
for (const m of manifest) if (m.title) chapterRows.push([mmss(INTRO_SECONDS + m.start), m.title]);
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify({ id, title: video.title, base: BASE, size: `${W}x${H}`, total, intro: INTRO_SECONDS, outro: OUTRO_SECONDS, take: takeLen, segments: manifest }, null, 2));
writeFileSync(join(OUT, 'chapters.txt'), `${video.description}\n\n${chapterRows.map(([t, l]) => `${t} ${l}`).join('\n')}\n`);
log(`done: ${final} (${total.toFixed(1)}s, ${W}x${H})`);
