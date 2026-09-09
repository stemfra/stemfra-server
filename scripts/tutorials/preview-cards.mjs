#!/usr/bin/env node
// Renders the intro card, the end card and the cover still on their own, for
// approval without a full take:  node scripts/tutorials/preview-cards.mjs ["Video title"]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { introHtml, outroHtml, coverHtml, renderCard, renderCover, INTRO_SECONDS, OUTRO_SECONDS } from './lib/cards.mjs';
import { dropFrames } from './lib/capture.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(here, '..', '..');
const out = join(serverRoot, '..', 'stemfra_video', 'tutorials', '_cards');
mkdirSync(out, { recursive: true });
const title = process.argv[2] || 'Welcome to your Stemfra CMS';
const VW = 1920, VH = 1080;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true });
const SCALE = process.argv.includes('--4k') ? 2 : 1;
async function card(name, html, seconds) {
  const dir = join(out, `frames-${name}`);
  const mp4 = await renderCard(browser, html, { seconds, out: join(out, `${name}.mp4`), workDir: dir, scale: SCALE, width: VW * SCALE, height: VH * SCALE });
  dropFrames(dir);
  return mp4;
}
const intro = await card('intro', introHtml(serverRoot, { title }), INTRO_SECONDS);
const outro = await card('outro', outroHtml(serverRoot), OUTRO_SECONDS);
await renderCover(browser, coverHtml(serverRoot, { title }), join(out, 'cover.png'));
await browser.close();
// One clip: intro, then a 2s white stand-in for the recording, then the end card.
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', intro, '-f', 'lavfi', '-i', `color=c=white:s=${VW}x${VH}:d=2:r=30`, '-i', outro, '-filter_complex', '[1:v]format=yuv420p[w];[0:v][w][2:v]concat=n=3:v=1:a=0[v]', '-map', '[v]', '-c:v', 'libx264', '-crf', '18', join(out, 'preview.mp4')]);
console.log(`intro ${intro}\noutro ${outro}\ncover ${join(out, 'cover.png')}\npreview ${join(out, 'preview.mp4')}`);
