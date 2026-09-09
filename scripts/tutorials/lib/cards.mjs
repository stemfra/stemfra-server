// Branded intro and end cards for the tutorial videos.
//
// Choreography = the Claude Design handoff "Stemfra Video Intro", LIGHT theme
// (~/Downloads/x/design_handoff_stemfra_intro, README.md): a 4.8s piece on a
// white stage where the ink S mark rises and settles, STEMFRA builds letter by
// letter, the blue-to-violet rule draws and the video title rises in, all
// under one slow camera move. The handoff authors every visible property as a
// pure function of the time T, so that is how the cards render here: the page
// exposes window.__render(T) and the recorder steps T frame by frame and
// screenshots each one (no CSS keyframes, no real-time screencast), which is
// what keeps the motion smooth at 4K. Values are the handoff's 4K numbers
// divided by two (1920x1080 stage; the recorder scales the page).
//
// Additions to the handoff: a fade to white after 4.8s so the cut to the
// recording is soft (Peter: the intro card is silent; the spoken promise comes
// over the first CMS screen), and an end card that reuses the same lockup with
// "stemfra.com" as the headline (Peter 2026-09-08: simple, no "up next", no
// "/help", no kicker). The dark theme in the handoff is not used.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const MARK = (root) => `data:image/png;base64,${readFileSync(join(root, '..', 'stemfra_client', 'public', 'logo', '01_ink-transparent.png')).toString('base64')}`;

export const INTRO_END_T = 4.8;      // the handoff's resolved last frame
export const INTRO_SECONDS = 5.3;    // + the fade to white
export const OUTRO_SECONDS = 3.5;
export const CARD_FPS = 30;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/**
 * One page for every card. `mode` = 'intro' (title rises at 3.35s, fade to
 * white after 4.8s) or 'outro' (everything arrives together, headline is the
 * address, no fade). The page draws nothing until __render(T) is called.
 */
function cardHtml(root, { mode, headline }) {
  const letters = 'STEMFRA'.split('').map((c) => `<span class="ch">${c}</span>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1920px; height: 1080px; overflow: hidden; background: #FFFFFF; }
    body { font-family: 'Instrument Sans', Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; color: #2B2724; }
    .stage { position: absolute; inset: 0; background: #FFFFFF; overflow: hidden; }
    .cam { position: absolute; inset: 0; transform-origin: 50% 50%; will-change: transform; }
    .col { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 30px; }
    .mark { display: block; height: 320px; width: auto; }
    .label { margin-top: 46px; display: flex; font-weight: 500; font-size: 42px; letter-spacing: 0.42em; text-indent: 0.42em; line-height: 1; color: #2B2724; }
    .ch { display: inline-block; }
    .rule { margin-top: 33px; width: 120px; height: 3px; border-radius: 2px; background: linear-gradient(90deg, #3B82F6, #8B5CF6); }
    .head { margin-top: 75px; height: 170px; display: flex; align-items: flex-start; justify-content: center; font-weight: 700; font-size: 75px; letter-spacing: -0.022em; line-height: 1.08; text-align: center; max-width: 1500px; }
    .fade { position: absolute; inset: 0; background: #FFFFFF; opacity: 0; pointer-events: none; }
  </style></head><body>
  <div class="stage">
    <div class="cam" id="cam"><div class="col">
      <img class="mark" id="mark" src="${MARK(root)}" alt="">
      <div class="label" id="label">${letters}</div>
      <div class="rule" id="rule"></div>
      <div class="head" id="head">${esc(headline)}</div>
    </div></div>
    <div class="fade" id="fade"></div>
  </div>
  <script>
    const MODE = ${JSON.stringify(mode)};
    const clamp01 = (x) => Math.max(0, Math.min(1, x));
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
    const easeOutBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const tween = (ease) => (from, to, start, end) => (T) => {
      if (T <= start) return from; if (T >= end) return to;
      return from + (to - from) * ease(clamp01((T - start) / (end - start)));
    };
    const enter = tween(easeOutExpo), push = tween(easeInOutSine), pop = tween(easeOutBack);
    const $ = (id) => document.getElementById(id);
    const chars = Array.from(document.querySelectorAll('.ch'));
    const TOTAL = ${mode === 'intro' ? INTRO_SECONDS : OUTRO_SECONDS};

    function renderIntro(T) {
      const zoom = enter(1.12, 1, 0, 2.3)(T) * push(1, 1.04, 2.3, 4.8)(T);
      const camY = push(-11, 7, 0, 4.8)(T);
      $('cam').style.transform = 'translateY(' + camY + 'px) scale(' + zoom + ')';
      $('mark').style.opacity = enter(0, 1, 0.1, 0.85)(T);
      $('mark').style.transform = 'translateY(' + enter(35, 0, 0.1, 1.1)(T) + 'px) scale(' + pop(0.74, 1, 0.1, 1.15)(T) + ')';
      chars.forEach((c, i) => {
        const at = 1.35 + i * 0.06;
        c.style.opacity = enter(0, 1, at, at + 0.5)(T);
        c.style.transform = 'translateY(' + enter(15, 0, at, at + 0.7)(T) + 'px)';
      });
      $('rule').style.opacity = enter(0, 1, 2.75, 2.95)(T);
      $('rule').style.transform = 'scaleX(' + enter(0, 1, 2.75, 3.4)(T) + ')';
      $('head').style.opacity = enter(0, 1, 3.35, 4.05)(T);
      $('head').style.transform = 'translateY(' + enter(23, 0, 3.35, 4.2)(T) + 'px)';
      $('fade').style.opacity = push(0, 1, 4.8, TOTAL)(T);
    }
    function renderOutro(T) {
      $('cam').style.transform = 'translateY(0px) scale(' + push(1, 1.02, 0, TOTAL)(T) + ')';
      const a = enter(0, 1, 0.05, 0.75)(T), y = enter(14, 0, 0.05, 0.85)(T);
      for (const id of ['mark', 'label', 'rule']) { $(id).style.opacity = a; $(id).style.transform = 'translateY(' + y + 'px)'; }
      $('head').style.opacity = enter(0, 1, 0.55, 1.25)(T);
      $('head').style.transform = 'translateY(' + enter(23, 0, 0.55, 1.4)(T) + 'px)';
      $('fade').style.opacity = 0;
    }
    window.__render = (T) => { (MODE === 'intro' ? renderIntro : renderOutro)(T); return T; };
    window.__ready = Promise.all([
      document.fonts.load('500 42px "Instrument Sans"'),
      document.fonts.load('700 75px "Instrument Sans"'),
    ]).catch(() => null).then(() => document.fonts.ready).then(() => true);
    window.__render(0);
  </script></body></html>`;
}

export const introHtml = (root, { title }) => cardHtml(root, { mode: 'intro', headline: title });
export const outroHtml = (root) => cardHtml(root, { mode: 'outro', headline: 'stemfra.com' });
/** The cover is the intro's resolved frame (T = 4.8). */
export const coverHtml = (root, { title }) => introHtml(root, { title });

async function openCard(browser, html, { scale }) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => window.__ready).catch(() => null);
  await page.waitForTimeout(150);
  return { ctx, page };
}

/**
 * Render a card deterministically: step T from 0 to `seconds` at `fps`,
 * screenshot every frame at `scale` x 1920x1080, encode to `out` (mp4, no audio).
 */
export async function renderCard(browser, html, { seconds, out, workDir, scale = 2, fps = CARD_FPS, width, height }) {
  const { ctx, page } = await openCard(browser, html, { scale });
  mkdirSync(workDir, { recursive: true });
  const n = Math.round(seconds * fps);
  const lines = ['ffconcat version 1.0'];
  for (let i = 0; i < n; i++) {
    const file = join(workDir, `f${String(i).padStart(4, '0')}.jpg`);
    await page.evaluate((t) => window.__render(t), i / fps);
    await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
    lines.push(`file '${file}'`, `duration ${(1 / fps).toFixed(5)}`);
  }
  lines.push(`file '${join(workDir, `f${String(n - 1).padStart(4, '0')}.jpg`)}'`, 'duration 0.034');
  await ctx.close();
  const list = `${out}.txt`;
  writeFileSync(list, lines.join('\n') + '\n');
  const W = width ?? Math.round(1920 * scale), H = height ?? Math.round(1080 * scale);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=${W}:${H},fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-an', out]);
  return out;
}

/** The YouTube thumbnail: the intro's resolved frame at 1280x720. */
export async function renderCover(browser, html, out) {
  const { ctx, page } = await openCard(browser, html, { scale: 1 });
  await page.evaluate((t) => window.__render(t), INTRO_END_T);
  const full = `${out}.1920.png`;
  await page.screenshot({ path: full, type: 'png' });
  await ctx.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', full, '-vf', 'scale=1280:720', out]);
  return out;
}
