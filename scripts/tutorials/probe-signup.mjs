// Walks the real sign-up + setup wizard as LAUNCH_EMAIL and dumps what each
// screen offers (headings, visible button texts, inputs), with a screenshot per
// screen, so the launch-set scripts target real controls. Creates the account
// for real: run cleanup-launch.mjs --apply afterwards.
//   node -r dotenv/config scripts/tutorials/probe-signup.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', '..', '..', 'stemfra_video', 'tutorials', '_probe');
mkdirSync(out, { recursive: true });
const BASE = process.env.CMS_BASE || 'http://localhost:5180';
const EMAIL = process.env.LAUNCH_EMAIL, PASSWORD = process.env.LAUNCH_PASSWORD;
if (!EMAIL || !PASSWORD) throw new Error('LAUNCH_EMAIL / LAUNCH_PASSWORD not set');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
let n = 0;
async function dump(label) {
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const t = (els) => Array.from(els).filter(vis).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
    return {
      url: location.pathname + location.search,
      headings: t(document.querySelectorAll('h1, h2, h3')).slice(0, 12),
      buttons: [...new Set(t(document.querySelectorAll('button, a[role="button"]')))].slice(0, 40),
      aria: [...new Set(Array.from(document.querySelectorAll('button[aria-label]')).filter(vis).map((b) => b.getAttribute('aria-label')))].slice(0, 20),
      inputs: Array.from(document.querySelectorAll('input, textarea, select')).filter(vis).map((e) => `${e.tagName.toLowerCase()}[type=${e.type}] ph="${e.placeholder || ''}" val="${String(e.value || '').slice(0, 30)}"`).slice(0, 25),
      tours: [...new Set(Array.from(document.querySelectorAll('[data-tour]')).map((e) => e.getAttribute('data-tour')))],
    };
  });
  const file = join(out, `${String(++n).padStart(2, '0')}-${label}.png`);
  await page.screenshot({ path: file });
  console.log(`\n=== ${label} (${file})\n${JSON.stringify(info, null, 1)}`);
}
const click = async (sel, wait = 1200) => { const ok = await page.locator(sel).first().click({ timeout: 4000 }).then(() => true).catch(() => false); await page.waitForTimeout(wait); console.log(`click ${sel}: ${ok}`); return ok; };

await page.goto(`${BASE}/signup?vertical=barbers`, { waitUntil: 'load' });
await dump('signup-step0');
const inputs = page.locator('input');
await inputs.nth(0).fill('Clean Cuts Barbers');
await inputs.nth(1).fill('Sam');
await inputs.nth(2).fill('Okoro');
await click('button:has-text("Continue")');
await dump('signup-step1-goals');
await click('button:has-text("Take bookings online")', 500);
await click('button:has-text("Continue")');
await dump('signup-step2-account');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await click('input[type="checkbox"]', 300);
await click('button:has-text("Create my site")', 500);
await page.waitForURL((u) => !/signup/.test(u.pathname), { timeout: 90000 }).catch(() => console.log('still on signup'));
await page.waitForTimeout(4000);
await dump('after-signup');
// the wizard: try the obvious ways in
for (const sel of ['button:has-text("Start")', 'button:has-text("Let")', 'button:has-text("Begin")', 'button:has-text("Get started")', 'button:has-text("Next")', 'button:has-text("Resume")']) {
  if (await page.locator(sel).first().isVisible().catch(() => false)) { await click(sel, 1500); break; }
}
await dump('wizard-step1');
for (let i = 2; i <= 5; i++) {
  await click('button:has-text("Next"), button:has-text("Complete")', 2500);
  await dump(`wizard-step${i}`);
}
await page.waitForTimeout(3000);
await dump('final');
await browser.close();
