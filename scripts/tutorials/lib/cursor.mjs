// A visible, gliding cursor for headless recordings. Headless Chromium paints
// no pointer, so the page gets an overlay arrow that follows Playwright's mouse
// events, plus a soft ripple on click. Every move is animated in steps so the
// viewer can follow the pointer the way they would a real screen recording.
const OVERLAY = `
(() => {
  if (window.__tutorialCursor) return;
  const el = document.createElement('div');
  el.id = 'tutorial-cursor';
  el.innerHTML = '<svg width="26" height="30" viewBox="0 0 26 30" xmlns="http://www.w3.org/2000/svg"><path d="M3 2 L3 24 L8.5 18.5 L12.5 27.5 L16.5 25.8 L12.6 17 L20 17 Z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  Object.assign(el.style, { position: 'fixed', left: '0px', top: '0px', zIndex: '2147483647', pointerEvents: 'none', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.35))', transform: 'translate(-3px,-2px)', display: 'none' });
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
  async function glideTo(x, y, ms = 650) {
    const steps = Math.max(12, Math.round(ms / 16));
    await page.mouse.move(x, y, { steps });
    pos = { x, y };
  }
  async function center(target) {
    const loc = typeof target === 'string' ? page.locator(target).first() : target.first();
    await loc.waitFor({ state: 'visible', timeout: 8000 });
    await loc.scrollIntoViewIfNeeded();
    const box = await loc.boundingBox();
    if (!box) throw new Error('no box for target');
    return { x: box.x + box.width / 2, y: box.y + box.height / 2, box };
  }
  return {
    pos: () => pos,
    show: async () => { await page.mouse.move(pos.x, pos.y); },
    /** Glide to a locator/selector and rest there. */
    hover: async (target, { ms = 650, settle = 700 } = {}) => { const c = await center(target); await glideTo(c.x, c.y, ms); await sleep(settle); },
    /** Glide, pause, click, pause. Returns nothing; use for real UI actions. */
    click: async (target, { ms = 650, before = 350, after = 900 } = {}) => {
      const c = await center(target); await glideTo(c.x, c.y, ms); await sleep(before);
      await page.mouse.down(); await sleep(70); await page.mouse.up(); await sleep(after);
    },
    /** Sweep across several targets in turn (the "hover each in turn" beat). */
    sweep: async (targets, { each = 800 } = {}) => { for (const t of targets) { try { const c = await center(t); await glideTo(c.x, c.y, 500); await sleep(each); } catch { /* skip a missing target, keep the take */ } } },
    /** Move to a raw point (for resting the cursor out of the way). */
    moveTo: async (x, y, ms = 500) => { await glideTo(x, y, ms); },
    type: async (text, { delay = 55 } = {}) => { await page.keyboard.type(text, { delay }); },
    sleep,
  };
}
