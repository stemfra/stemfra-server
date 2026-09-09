// Second launch probe: logs in as LAUNCH_EMAIL, walks wizard steps 2 to 4 with
// proper waits (the save takes a few seconds), dumps each; then the publish page
// once the wizard is done. Screenshots in _probe/.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', '..', '..', 'stemfra_video', 'tutorials', '_probe');
mkdirSync(out, { recursive: true });
const BASE = process.env.CMS_BASE || 'http://localhost:5180';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
let n = 20;
async function dump(label) {
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const t = (els) => Array.from(els).filter(vis).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
    const wiz = document.querySelector('h2')?.closest('section') || document.body;
    return { h2: t(document.querySelectorAll('h2')).filter((x) => x.length < 80), buttons: [...new Set(t(document.querySelectorAll('button')))].filter((b) => b.length < 50 && !/Dashboard|Bookings|Revenue|Stacy|More|^SO$|Take a quick|Ask Stacy|Setup25/.test(b)).slice(0, 40), aria: [...new Set(Array.from(document.querySelectorAll('button[aria-label]')).filter(vis).map((b) => b.getAttribute('aria-label')))].filter((a) => !/Collapse|Publish menu|Notifications|Account|nav/.test(a)).slice(0, 25), inputs: Array.from(document.querySelectorAll('input, textarea, select')).filter(vis).map((e) => `${e.tagName.toLowerCase()}[type=${e.type}] ph="${e.placeholder || ''}" val="${String(e.value || '').slice(0, 24)}"`).filter((s) => !/Search…/.test(s)).slice(0, 30), text: (wiz.innerText || '').replace(/\s+/g, ' ').slice(0, 500) };
  });
  const file = join(out, `${String(++n).padStart(2, '0')}-${label}.png`);
  await page.screenshot({ path: file });
  console.log(`\n=== ${label}\n${JSON.stringify(info, null, 1)}`);
}
async function next(fromHeading) {
  const b = page.getByRole('button', { name: /save & continue|^next|complete|finish|done/i }).first();
  console.log('next button:', await b.textContent().catch(() => '?'), 'disabled:', await b.isDisabled().catch(() => '?'));
  await b.click({ timeout: 5000 }).catch((e) => console.log('click err', e.message.split('\n')[0]));
  await page.waitForFunction((h) => !Array.from(document.querySelectorAll('h2')).some((x) => x.textContent.trim() === h), fromHeading, { timeout: 15000 }).catch(() => console.log('heading did not change'));
}
await page.goto(`${BASE}/login`, { waitUntil: 'load' });
await page.fill('input[type="email"]', process.env.LAUNCH_EMAIL);
await page.fill('input[type="password"]', process.env.LAUNCH_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });
await page.waitForTimeout(4000);
if (await page.locator('button:has-text("Start")').first().isVisible().catch(() => false)) { await page.locator('button:has-text("Start")').first().click(); await page.waitForTimeout(1500); }
// jump to step 2 (step 1 was saved by the debug run)
await page.locator('button[aria-label="Go to Your services"]').click().catch(() => {});
await page.waitForTimeout(1500);
await dump('services');
await next('These are sample services, make them yours');
await dump('hours');
const h = (await page.locator('h2').allTextContents()).find((x) => /open|hours|week/i.test(x)) || '';
await next(h.trim());
await dump('team');
const h2 = (await page.locator('h2').allTextContents()).find((x) => /people|team/i.test(x)) || '';
await next(h2.trim());
await page.waitForTimeout(4000);
await dump('after-wizard');
await page.goto(`${BASE}/settings/publish`, { waitUntil: 'load' }); await page.waitForTimeout(5000);
console.log('PUBLISH TEXT:', (await page.locator('#publish').innerText().catch(() => 'n/a')).replace(/\s+/g, ' ').slice(0, 900));
await dump('publish');
await browser.close();
