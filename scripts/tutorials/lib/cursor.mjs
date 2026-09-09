// A visible, gliding cursor for headless recordings. Headless Chromium paints
// no pointer, so the page gets an overlay arrow that follows Playwright's mouse
// events, plus a soft ripple on click. Every move is animated in steps so the
// viewer can follow the pointer the way they would a real screen recording.
//
// Word cues: `hover`/`click`/`sweep` accept `at: '<phrase>'`; the move starts
// ~0.9s before that phrase is spoken (record.mjs supplies `cue`), so the
// cursor lands on the item as the voice names it, the way the guided tour's
// spotlight does.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The pointer is the guided tour's white hand glove (stemfra_cms index.css
// `.tour-overlay` cursor, hotspot 10,1), so the tutorials read as the same
// product as the in-CMS tour (Peter, 2026-09-07).
const GLOVE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'glove.svg'), 'utf8');

const OVERLAY = `
(() => {
  if (window.__tutorialCursor) return;
  const el = document.createElement('div');
  el.id = 'tutorial-cursor';
  el.innerHTML = ${JSON.stringify(GLOVE)};
  Object.assign(el.style, { position: 'fixed', left: '0px', top: '0px', zIndex: '2147483647', pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))', transform: 'translate(-10px,-1px)', display: 'none' });
  const ripple = document.createElement('div');
  Object.assign(ripple.style, { position: 'fixed', width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #6366F1', background: 'rgba(99,102,241,.18)', zIndex: '2147483646', pointerEvents: 'none', transform: 'translate(-50%,-50%) scale(.2)', opacity: '0', transition: 'transform .35s ease-out, opacity .45s ease-out' });
  const mount = () => { document.documentElement.appendChild(ripple); document.documentElement.appendChild(el); };
  if (document.documentElement) mount(); else document.addEventListener('DOMContentLoaded', mount);
  window.addEventListener('mousemove', (e) => { el.style.display = 'block'; el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; }, true);
  window.addEventListener('mousedown', (e) => {
    ripple.style.left = e.clientX + 'px'; ripple.style.top = e.clientY + 'px';
    ripple.style.transition = 'none'; ripple.style.transform = 'translate(-50%,-50%) scale(.2)'; ripple.style.opacity = '1';
    requestAnimationFrame(() => { ripple.style.transition = 'transform .35s ease-out, opacity .45s ease-out'; ripple.style.transform = 'translate(-50%,-50%) scale(1.6)'; ripple.style.opacity = '0'; });
  }, true);
  window.__tutorialCursor = true;
})();`;

export async function installCursor(context) {
  await context.addInitScript(OVERLAY);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function makeCursor(page) {
  let pos = { x: 700, y: 400 };
  let cue = async () => {}; // replaced per segment by record.mjs
  async function glideTo(x, y, ms = 650) {
    const steps = Math.max(12, Math.round(ms / 16));
    await page.mouse.move(x, y, { steps });
    pos = { x, y };
  }
  async function center(target, { scroll = false } = {}) {
    const loc = (typeof target === 'string' ? page.locator(target) : target).filter({ visible: true }).first();
    await loc.waitFor({ state: 'visible', timeout: 8000 }).catch(() => { throw new Error(`target not visible: ${typeof target === 'string' ? target : '<locator>'}`); });
    if (scroll) { await loc.scrollIntoViewIfNeeded(); await sleep(250); }
    const box = await loc.boundingBox();
    if (!box) throw new Error('no box for target');
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
  }
  return {
    pos: () => pos,
    setCue: (fn) => { cue = fn; },
    /** Glide to a locator/selector and rest there. `at` = phrase to sync to. */
    hover: async (target, { at, ms = 650, settle = 700, scroll = false } = {}) => { if (at) await cue(at); const c = await center(target, { scroll }); await glideTo(c.x, c.y, ms); await sleep(settle); },
    /** Glide, pause, click, pause. `at` = phrase to sync to. */
    click: async (target, { at, ms = 650, before = 350, after = 900, scroll = false } = {}) => {
      if (at) await cue(at);
      const c = await center(target, { scroll }); await glideTo(c.x, c.y, ms); await sleep(before);
      await page.mouse.down(); await sleep(70); await page.mouse.up(); await sleep(after);
    },
    /** Visit several targets in turn; items are selectors or { target, at }. */
    sweep: async (items, { each = 800 } = {}) => {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const target = typeof it === 'string' ? it : it.target;
        const next = items[i + 1];
        // With word cues the dwell comes from waiting for the next word; a
        // fixed dwell on top makes the pointer fall behind in fast lists.
        const dwell = it.hold ?? (it.at && next && next.at ? 0 : each);
        try { if (it.at) await cue(it.at); const c = await center(target, { scroll: !!it.scroll }); await glideTo(c.x, c.y, 500); if (dwell) await sleep(dwell); }
        catch { /* skip a missing target, keep the take */ }
      }
    },
    moveTo: async (x, y, ms = 500) => { await glideTo(x, y, ms); },
    type: async (text, { delay = 55 } = {}) => { await page.keyboard.type(text, { delay }); },
    sleep,
  };
}
