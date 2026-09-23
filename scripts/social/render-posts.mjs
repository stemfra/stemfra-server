// Social posts renderer (2026-09-22): six vertical posts for Facebook (1080x1350)
// and TikTok / Reels (1080x1920), rendered from our own brand and our own photos
// (the CRM's `solutions.<slug>.hero.photo` slots) with headless Chromium, so the
// output matches stemfra.com exactly and needs no placeholder swapping.
//
//   node scripts/social/render-posts.mjs [--out <dir>] [--only barbers,spa] [--formats feed,story]
//
// Copy comes from docs/SOCIAL_POSTS_CLAUDE_DESIGN_2026-09.md (prompt 1). Rules:
// no em-dash, Stemfra in sentence case, the cap wording as on the site.
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = opt('--out', join(root, 'stemfra_video', 'social', new Date().toISOString().slice(0, 10)));
const ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
const FORMATS = (opt('--formats', 'feed,story') || '').split(',').filter(Boolean);
const ASSETS_URL = process.env.MARKETING_ASSETS_URL || 'https://api.stemfra.com/api/marketing/assets';

const POSTS = [
  { slug: 'barbers',  eyebrow: 'Barbershop',        headline: 'Your chair, your name, your website.' },
  { slug: 'salons',   eyebrow: 'Beauty salon',      headline: 'Your clients should book you, not a marketplace.' },
  { slug: 'massage',  eyebrow: 'Massage studio',    headline: 'Booked while your hands are busy.' },
  { slug: 'spa',      eyebrow: 'Day spa',           headline: 'Your guests see only you.' },
  { slug: 'yoga',     eyebrow: 'Yoga and Pilates',  headline: 'Classes, passes and memberships. One place, yours.' },
  { slug: 'crossfit', eyebrow: 'CrossFit box',      headline: 'Your box, your own site. Drop-ins book themselves.' },
];
const SUB = 'A website built for you. Free to claim, 5% when it books, never more than $400 a month.';
const CTA = 'Start free at stemfra.com';
const SIZES = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } };

async function heroPhotos() {
  const res = await fetch(ASSETS_URL);
  const data = await res.json();
  // The endpoint answers { assets: { "<slot>": { url, width, height, alt } } }.
  const raw = Array.isArray(data) ? data : (data.assets || data.items || data);
  const list = Array.isArray(raw) ? raw : Object.entries(raw).map(([slot, v]) => ({ slot, ...(typeof v === 'object' ? v : { url: v }) }));
  const out = {};
  for (const a of list) {
    const m = /^solutions\.(\w+)\.hero\.photo$/.exec(a.slot || '');
    if (m && a.url) out[m[1]] = a.url;
  }
  return out;
}

// Cloudinary: ask for the render size so the file is sharp and small.
const cld = (url, w, h) => url.replace('/image/upload/', `/image/upload/c_fill,g_auto,w_${w},h_${h},q_auto:good,f_jpg/`);

function html({ post, photo, logo, w, h, story }) {
  // The feed crop is shorter: 4:5 leaves less room under the photo than 9:16.
  const photoH = Math.round(h * (story ? 0.6 : 0.52));
  const pad = story ? 96 : 72; // TikTok safe margin
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:${w}px;height:${h}px;background:#2B2622;font-family:'Hanken Grotesk',Inter,system-ui,sans-serif;color:#E6DDCD;overflow:hidden}
  .photo{position:absolute;left:0;top:0;width:${w}px;height:${photoH}px;object-fit:cover;filter:saturate(.92) contrast(1.02)}
  .fade{position:absolute;left:0;top:${photoH - 300}px;width:${w}px;height:300px;background:linear-gradient(180deg,rgba(43,38,34,0) 0%,#2B2622 100%)}
  .body{position:absolute;left:${pad}px;right:${pad}px;bottom:${story ? 150 : 64}px}
  .row{display:flex;align-items:flex-end;justify-content:space-between;margin-top:${story ? 64 : 44}px}
  .eyebrow{font-size:${story ? 26 : 24}px;letter-spacing:.32em;text-transform:uppercase;color:#C9B891;font-weight:500;margin:0 0 ${story ? 34 : 26}px}
  h1{font-weight:300;font-size:${story ? 86 : 78}px;line-height:1.04;letter-spacing:-.015em;margin:0;color:#F5EFE6}
  .rule{width:56px;height:2px;background:#C9B891;opacity:.9;margin:${story ? 40 : 32}px 0}
  .sub{font-size:${story ? 36 : 31}px;line-height:1.4;font-weight:300;color:#E6DDCD;max-width:${w - 2 * pad - 40}px;margin:0}
  .cta{font-size:${story ? 30 : 27}px;letter-spacing:.22em;text-transform:uppercase;font-weight:500;color:#F5EFE6}
  .logo{display:flex;flex-direction:column;align-items:center;gap:12px}
  .logo img{height:${story ? 64 : 58}px}
  .logo span{font-size:${story ? 18 : 16}px;letter-spacing:.34em;color:#E6DDCD;font-weight:500}
</style></head><body>
  <img class="photo" src="${photo}">
  <div class="fade"></div>
  <div class="body">
    <p class="eyebrow">${post.eyebrow}</p>
    <h1>${post.headline}</h1>
    <div class="rule"></div>
    <p class="sub">${SUB}</p>
    <div class="row">
      <div class="cta">${CTA}</div>
      <div class="logo"><img src="${logo}"><span>STEMFRA</span></div>
    </div>
  </div>
</body></html>`;
}

const photos = await heroPhotos();
const logoB64 = await readFile(join(root, 'stemfra_client', 'public', 'logo', '03_cream-transparent.png'));
const logo = `data:image/png;base64,${logoB64.toString('base64')}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const made = [];
for (const post of POSTS) {
  if (ONLY.length && !ONLY.includes(post.slug)) continue;
  const src = photos[post.slug];
  if (!src) { console.warn(`no hero photo for ${post.slug}, skipped`); continue; }
  for (const fmt of FORMATS) {
    const { w, h } = SIZES[fmt];
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.setContent(html({ post, photo: cld(src, w, Math.round(h * 0.62)), logo, w, h, story: fmt === 'story' }), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    const file = join(OUT, `${post.slug}-${fmt}-${w}x${h}.png`);
    await page.screenshot({ path: file, type: 'png' });
    await page.close();
    made.push(file);
    console.log('wrote', file);
  }
}
await browser.close();
await writeFile(join(OUT, 'captions.md'), POSTS.map((p) => `## ${p.eyebrow}\n${p.headline}\n${SUB}\n${CTA}\nhttps://stemfra.com/start?utm_source=facebook&utm_medium=social&utm_campaign=verticals\n`).join('\n'));
console.log(`${made.length} files in ${OUT}`);
