// ─── "Find your logo" (P25 phase 1, 2026-09-10) ──────────────────────────────
//
// Import a business's EXISTING mark from its website domain. Three sources,
// tried in order, all server-side so no key or CORS reaches the browser:
//   1. Brandfetch Brand API (BRANDFETCH_API_KEY; free tier), the best quality:
//      typed logos (icon / logo / symbol) with SVG/PNG formats and light/dark themes.
//   2. The site's own HTML: apple-touch-icon, rel=icon (largest sizes), og:image.
//   3. Google's favicon service at 256px, always available, lowest quality.
// Picking one IMPORTS it through Cloudinary into the site's own folder + a
// site_media row with provenance, exactly like the Unsplash stock photos, so
// it behaves like an upload (Media library, clone localization, folder delete).
//
// NOTE: config/supabase.js exports the client directly; single-var require.
const crypto = require('crypto');
const supabase = require('../../config/supabase');
const { cloudinary, isCloudinaryConfigured } = require('../../config/cloudinary');
const { verifySiteOwnership, resolveContactId } = require('../../middleware/cmsAuth');

const BRANDFETCH_KEY = process.env.BRANDFETCH_API_KEY || '';
const FETCH_TIMEOUT_MS = 7000;
const HTML_CAP = 600 * 1024;
const MAX_LOGO_DIMENSION = 1600;

function normaliseDomain(input) {
  let s = String(input || '').trim().toLowerCase();
  if (!s) return null;
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0];
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s) ? s : null;
}

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { redirect: 'follow', ...opts, signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StemfraLogoFinder/1.0; +https://stemfra.com)', ...(opts.headers || {}) } });
  } finally { clearTimeout(t); }
}

// 1. Brandfetch
async function brandfetchCandidates(domain) {
  if (!BRANDFETCH_KEY) return [];
  const res = await fetchWithTimeout(`https://api.brandfetch.io/v2/brands/${encodeURIComponent(domain)}`, { headers: { Authorization: `Bearer ${BRANDFETCH_KEY}` } });
  if (!res.ok) return [];
  const data = await res.json();
  const out = [];
  for (const logo of data.logos || []) {
    for (const f of logo.formats || []) {
      if (!f.src) continue;
      out.push({
        id: crypto.createHash('sha1').update(f.src).digest('hex').slice(0, 12),
        src: f.src, source: 'brandfetch', type: logo.type || 'logo', theme: logo.theme || null,
        format: f.format || null, width: f.width || null, height: f.height || null, background: f.background || null,
        label: `${logo.type || 'logo'}${logo.theme ? `, for ${logo.theme === 'dark' ? 'light' : 'dark'} backgrounds` : ''}`,
      });
    }
  }
  // SVG first, then larger rasters.
  return out.sort((a, b) => (b.format === 'svg') - (a.format === 'svg') || (b.width || 0) - (a.width || 0)).slice(0, 12);
}

// 2. The site's own HTML
async function siteCandidates(domain) {
  const out = [];
  for (const origin of [`https://${domain}`, `https://www.${domain}`]) {
    let html = '';
    try {
      const res = await fetchWithTimeout(origin, { headers: { Accept: 'text/html' } });
      if (!res.ok) continue;
      const reader = res.body.getReader();
      const chunks = []; let total = 0;
      while (total < HTML_CAP) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); total += value.length; }
      html = Buffer.concat(chunks).toString('utf8');
    } catch { continue; }
    const base = origin;
    const abs = (u) => { try { return new URL(u, base).href; } catch { return null; } };
    const tags = html.match(/<(?:link|meta)\b[^>]*>/gi) || [];
    for (const tag of tags) {
      const attr = (n) => { const m = tag.match(new RegExp(`\\b${n}\\s*=\\s*["']([^"']*)["']`, 'i')); return m ? m[1] : null; };
      const rel = (attr('rel') || '').toLowerCase();
      if (/apple-touch-icon/.test(rel) && attr('href')) {
        const sizes = attr('sizes'); const n = sizes ? Number(sizes.split('x')[0]) : 180;
        out.push({ src: abs(attr('href')), source: 'site', type: 'icon', label: `App icon${sizes ? ` ${sizes}` : ''}`, width: n, height: n });
      } else if (/\bicon\b/.test(rel) && attr('href')) {
        const sizes = attr('sizes'); const n = sizes && /^\d+x\d+$/.test(sizes) ? Number(sizes.split('x')[0]) : 32;
        if (n >= 64 || /\.svg(\?|$)/i.test(attr('href'))) out.push({ src: abs(attr('href')), source: 'site', type: 'icon', label: `Site icon${sizes ? ` ${sizes}` : ''}`, width: n, height: n });
      } else if (/og:image|twitter:image/i.test(attr('property') || attr('name') || '') && attr('content')) {
        out.push({ src: abs(attr('content')), source: 'site', type: 'social', label: 'Social share image', width: null, height: null });
      }
    }
    if (out.length) break;
  }
  const seen = new Set();
  return out.filter((c) => c.src && !seen.has(c.src) && seen.add(c.src)).map((c) => ({ ...c, id: crypto.createHash('sha1').update(c.src).digest('hex').slice(0, 12) }));
}

// 3. Google favicon service
const faviconCandidate = (domain) => ({ id: 'gfavicon', src: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`, source: 'favicon-service', type: 'icon', label: 'Favicon (256px)', width: 256, height: 256 });

async function domainForSite(site, override) {
  const fromInput = normaliseDomain(override);
  if (fromInput) return fromInput;
  if (site.company_id) {
    const { data: co } = await supabase.from('companies').select('website').eq('id', site.company_id).maybeSingle();
    const d = normaliseDomain(co?.website);
    if (d) return d;
  }
  return normaliseDomain(site.custom_domain);
}

// GET /api/cms/brand-logo/lookup?siteId=&domain=
async function lookup(req, res) {
  try {
    const { siteId, domain: override } = req.query;
    if (!siteId) return res.status(400).json({ error: 'siteId required' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site' });
    const domain = await domainForSite(site, override);
    if (!domain) return res.status(400).json({ error: 'Enter the business website, for example example.com' });
    const [bf, own] = await Promise.all([brandfetchCandidates(domain).catch(() => []), siteCandidates(domain).catch(() => [])]);
    const candidates = [...bf, ...own, faviconCandidate(domain)];
    res.json({ domain, candidates, providers: { brandfetch: !!BRANDFETCH_KEY } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/brand-logo/import { siteId, src, source, label }
// Pulls the chosen file into the site's Cloudinary folder (SVG kept as SVG,
// rasters normalised to capped WebP) + a site_media row with provenance.
async function importLogo(req, res) {
  try {
    if (!isCloudinaryConfigured()) return res.status(503).json({ error: 'Uploads are not configured.' });
    const { siteId, src, source, label } = req.body || {};
    if (!siteId || !src) return res.status(400).json({ error: 'siteId and src required' });
    let url;
    try { url = new URL(src); } catch { return res.status(400).json({ error: 'Bad image URL' }); }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return res.status(400).json({ error: 'Bad image URL' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site' });

    const isSvg = /\.svg(\?|$)/i.test(url.pathname + url.search) || /format=svg/.test(src);
    const id = crypto.randomUUID().replace(/-/g, '');
    const result = await cloudinary.uploader.upload(src, {
      folder: site.subdomain, public_id: id, resource_type: 'image', overwrite: false,
      ...(isSvg ? {} : { format: 'webp', quality: 'auto:good', transformation: [{ width: MAX_LOGO_DIMENSION, height: MAX_LOGO_DIMENSION, crop: 'limit' }] }),
    });
    const contactId = await resolveContactId(req.cmsUser.id);
    const ext = isSvg ? 'svg' : 'webp';
    const { data: row, error: dbErr } = await supabase.from('site_media').insert({
      site_id: siteId, filename: `logo-${source || 'import'}-${id.slice(0, 8)}.${ext}`,
      mime_type: isSvg ? 'image/svg+xml' : 'image/webp', size_bytes: result.bytes, width: result.width || null, height: result.height || null,
      storage_provider: 'cloudinary', storage_key: result.public_id, original_url: result.secure_url,
      alt_text: label || 'Logo', uploaded_by: contactId,
      metadata: { source: `brand-logo:${source || 'unknown'}`, imported_from: src, label: label || null },
    }).select('id').single();
    if (dbErr) throw new Error(`site_media: ${dbErr.message}`);
    res.json({ mediaId: row.id, secure_url: result.secure_url, width: result.width || null, height: result.height || null, format: ext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── SVG logo builder (P25 phase 2, 2026-09-11) ──────────────────────────────
//
// The CMS composes a vector logo (business name set in a Google Font, an
// optional Iconify icon, colours from the theme) and converts the text to
// outlines in the browser, so the saved SVG needs no font. The server only
// proxies the two public corpora (Iconify, Google Fonts) and stores the result.

const ICONIFY = 'https://api.iconify.design';
const MAX_SVG_BYTES = 400 * 1024;

// GET /api/cms/brand-logo/icons?q=  → { icons: ["mdi:content-cut", …] }
async function iconSearch(req, res) {
  try {
    const q = String(req.query.q || '').trim().slice(0, 60);
    if (!q) return res.json({ icons: [] });
    const r = await fetchWithTimeout(`${ICONIFY}/search?query=${encodeURIComponent(q)}&limit=48`);
    if (!r.ok) return res.status(502).json({ error: 'Icon search is unavailable right now' });
    const j = await r.json();
    res.json({ icons: Array.isArray(j.icons) ? j.icons : [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/cms/brand-logo/icon?name=prefix:icon  → { body, width, height }
// `body` is the icon's inner SVG markup in a width×height box (Iconify JSON API).
async function iconData(req, res) {
  try {
    const name = String(req.query.name || '').trim();
    const m = /^([a-z0-9-]+):([a-z0-9-]+)$/.exec(name);
    if (!m) return res.status(400).json({ error: 'Bad icon name' });
    const r = await fetchWithTimeout(`${ICONIFY}/${m[1]}.json?icons=${m[2]}`);
    if (!r.ok) return res.status(502).json({ error: 'Icon service is unavailable right now' });
    const j = await r.json();
    // Many names are aliases (mdi:scissors → content-cut); follow the parent chain.
    let key = m[2];
    for (let i = 0; i < 4 && !(j.icons && j.icons[key]) && j.aliases && j.aliases[key]; i++) key = j.aliases[key].parent;
    const ic = j.icons && j.icons[key];
    if (!ic) return res.status(404).json({ error: 'Icon not found' });
    res.json({ name, body: ic.body, width: ic.width || j.width || 24, height: ic.height || j.height || 24 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/cms/brand-logo/font?family=&weight=  → { url }  (a TTF the browser
// can fetch cross-origin from fonts.gstatic.com and outline with opentype.js).
// Google returns TrueType when the request carries no browser User-Agent.
async function fontFile(req, res) {
  try {
    const family = String(req.query.family || '').trim().slice(0, 60);
    const weight = String(req.query.weight || '700').replace(/[^0-9]/g, '') || '700';
    if (!/^[A-Za-z0-9 ]+$/.test(family)) return res.status(400).json({ error: 'Bad font family' });
    // Display faces such as Bebas Neue ship one weight; fall back to 400.
    const fam = encodeURIComponent(family).replace(/%20/g, '+');
    let used = weight, text = null;
    for (const w of [weight, '400']) {
      const r = await fetch(`https://fonts.googleapis.com/css2?family=${fam}:wght@${w}`, { headers: { 'User-Agent': '' } });
      if (r.ok) { text = await r.text(); used = w; break; }
    }
    if (text == null) return res.status(404).json({ error: 'Font not found' });
    const url = (text.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/) || [])[1];
    if (!url) return res.status(404).json({ error: 'No TrueType file for that font' });
    res.json({ family, weight: used, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/cms/brand-logo/build { siteId, svg, kind: 'logo'|'favicon', label, params }
// Stores the composed SVG in the site's Cloudinary folder (+ a site_media row
// with the builder params, so the mark can be rebuilt later). A favicon is
// rasterised by Cloudinary to a 256px PNG so every browser can use it.
async function buildLogo(req, res) {
  try {
    if (!isCloudinaryConfigured()) return res.status(503).json({ error: 'Uploads are not configured.' });
    const { siteId, svg, kind, label, params } = req.body || {};
    if (!siteId || typeof svg !== 'string') return res.status(400).json({ error: 'siteId and svg required' });
    const trimmed = svg.trim();
    if (!/^<svg[\s>]/i.test(trimmed) || !/<\/svg>\s*$/i.test(trimmed)) return res.status(400).json({ error: 'Not an SVG document' });
    if (Buffer.byteLength(trimmed, 'utf8') > MAX_SVG_BYTES) return res.status(413).json({ error: 'Logo is too large' });
    if (/<script|<foreignObject|<image|javascript:|on[a-z]+\s*=/i.test(trimmed)) return res.status(400).json({ error: 'SVG contains disallowed content' });
    const site = await verifySiteOwnership(req.cmsUser.id, siteId);
    if (!site) return res.status(403).json({ error: 'Not your site' });

    const favicon = kind === 'favicon';
    const id = crypto.randomUUID().replace(/-/g, '');
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(trimmed, 'utf8').toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: site.subdomain, public_id: id, resource_type: 'image', overwrite: false,
      ...(favicon ? { format: 'png', transformation: [{ width: 256, height: 256, crop: 'fit' }] } : {}),
    });
    const contactId = await resolveContactId(req.cmsUser.id);
    const ext = favicon ? 'png' : 'svg';
    const { data: row, error: dbErr } = await supabase.from('site_media').insert({
      site_id: siteId, filename: `${favicon ? 'favicon' : 'logo'}-built-${id.slice(0, 8)}.${ext}`,
      mime_type: favicon ? 'image/png' : 'image/svg+xml', size_bytes: result.bytes, width: result.width || null, height: result.height || null,
      storage_provider: 'cloudinary', storage_key: result.public_id, original_url: result.secure_url,
      alt_text: label || (favicon ? 'Favicon' : 'Logo'), uploaded_by: contactId,
      metadata: { source: 'brand-logo:builder', kind: favicon ? 'favicon' : 'logo', builder: params && typeof params === 'object' ? params : null },
    }).select('id').single();
    if (dbErr) throw new Error(`site_media: ${dbErr.message}`);
    res.json({ mediaId: row.id, secure_url: result.secure_url, width: result.width || null, height: result.height || null, format: ext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function healthcheck(req, res) {
  res.json({ ok: true, brandfetch: !!BRANDFETCH_KEY, cloudinary: isCloudinaryConfigured(), builder: true });
}

module.exports = { lookup, importLogo, iconSearch, iconData, fontFile, buildLogo, healthcheck, normaliseDomain };
