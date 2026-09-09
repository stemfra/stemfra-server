// DOM probe for tutorial scripts: signs in as the demo owner (same credentials
// as record.mjs), visits each path given on the command line and prints the
// selectors a script would target (data-tour ids, headings, button labels,
// field labels, textarea placeholders). Headless, no recording.
//   node -r dotenv/config scripts/tutorials/probe.mjs /content/home /media
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const stemfraRoot = join(here, '..', '..', '..');
const BASE = process.env.CMS_BASE || 'http://localhost:5180';
const paths = process.argv.slice(2).filter((a) => a.startsWith('/'));
const evalIdx = process.argv.indexOf('--eval');
const extra = evalIdx === -1 ? null : process.argv[evalIdx + 1]; // extra page.evaluate expression per path
const txt = readFileSync(join(stemfraRoot, 'stemfra_email_service_key', 'demos-cms-login.txt'), 'utf8');
const email = txt.match(/^Email:\s*(\S+)/m)?.[1];
const password = txt.match(/^Password:\s*(\S+)/m)?.[1];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${BASE}/login`, { waitUntil: 'load' });
await page.fill('input[type="email"]', email);
await page.fill('input[type="password"]', password);
await page.click('button[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith('/login'), { timeout: 30000 });

for (const p of paths) {
  await page.goto(`${BASE}${p}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const t = (els) => Array.from(els).map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
    return {
      url: location.pathname + location.search,
      tours: [...new Set(Array.from(document.querySelectorAll('[data-tour]')).map((e) => e.getAttribute('data-tour')))],
      headings: t(document.querySelectorAll('h1, h2')).slice(0, 20),
      buttons: [...new Set(t(document.querySelectorAll('main button')))].slice(0, 80),
      ariaButtons: [...new Set(Array.from(document.querySelectorAll('button[aria-label]')).map((b) => b.getAttribute('aria-label')))].slice(0, 40),
      labels: [...new Set(t(document.querySelectorAll('main label')))].slice(0, 50),
      placeholders: [...new Set(Array.from(document.querySelectorAll('input, textarea')).map((e) => e.placeholder).filter(Boolean))].slice(0, 30),
      sideLinks: [...new Set(t(document.querySelectorAll('aside a, aside button')))].slice(0, 40),
      ids: [...new Set(Array.from(document.querySelectorAll('main [id]')).map((e) => e.id))].slice(0, 40),
    };
  });
  if (extra) info.extra = await page.evaluate(extra);
  console.log(`\n=== ${p}\n` + JSON.stringify(info, null, 1));
}
await browser.close();
