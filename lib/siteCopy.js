// The "finish" job (ROADMAP P39 slice c, 2026-09-15): when the owner presses
// Finish in the setup wizard, the sections that still carry the DEMO's words
// are rewritten for this business from the facts we hold (name, vertical,
// town, services with prices, team, hours, the Google snapshot), and the demo
// sections that make CLAIMS we cannot back (awards, stats, partner logos, the
// cloned reviews) are hidden until the owner fills them. Service descriptions
// that are still the seed's get their own line. One GPT call, JSON out.
//
// Rules: only sections evaluateSampleSections reports as sample are touched
// (an owner's edit is never overwritten; `force` rewrites everything for dev);
// the model gets the demo text as a LENGTH reference only and is told never
// to carry its history, years, awards or numbers over; every string is
// em-dash-free (house rule). The run is recorded on
// site_theme_settings.metadata.ai_copy so the CMS can say "written for you".
const OpenAI = require('openai');
const supabase = require('../config/supabase');
const { evaluateSampleSections } = require('./sampleContent');
const { SEED_SOURCE_BY_VERTICAL } = require('./provisionSite');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const COPY_MODEL = process.env.SITE_COPY_MODEL || process.env.BUSINESS_MODEL || 'gpt-4o';

const en = (v) => (v && typeof v === 'object' ? (v.en ?? '') : (typeof v === 'string' ? v : '')) || '';
const clean = (s) => String(s ?? '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();

// Demo sections whose content is a claim, not a fact we hold: hidden while sample.
const HIDE_WHILE_SAMPLE = new Set(['awards', 'stats_band', 'partners', 'testimonials']);

// (page slug, section_type) → which text fields the model rewrites.
const TARGETS = {
  'home:hero': ['headline', 'subheadline'],
  'home:intro': ['headline', 'body'],
  'home:rich_text': ['headline', 'body'],
  'home:service_grid': ['intro', 'category_cards'],
  'home:team_grid': ['intro'],
  'about:intro': ['body'],
  'about:rich_text': ['headline', 'body'],
  'services:intro': ['body'],
  'faq:intro': ['body'],
  'faq:faq': ['items'],
  'book:intro': ['body'],
};
// Team pages differ per vertical (barbers, stylists, coaches, teachers, team).
const TEAM_SLUGS = new Set(['barbers', 'stylists', 'coaches', 'teachers', 'therapists', 'team']);

function fieldValue(content, field) {
  if (field === 'items') return Array.isArray(content.items) ? content.items.map((it) => ({ q: en(it.q), a: en(it.a) })) : [];
  // Category cards (the barbers "The Menu" carousel): title stays, the blurb is rewritten.
  if (field === 'category_cards') return Array.isArray(content.category_cards) ? content.category_cards.map((c) => ({ title: en(c.title), body: en(c.body) })) : [];
  if (field === 'intro') return typeof content.intro === 'string' ? content.intro : en(content.intro);
  return en(content[`${field}_i18n`]);
}

function applyField(content, field, value) {
  if (field === 'items') return { ...content, items: value.map((it) => ({ q: { en: clean(it.q) }, a: { en: clean(it.a) } })) };
  if (field === 'category_cards') {
    const byTitle = new Map(value.map((c) => [String(c.title || '').toLowerCase().trim(), c.body]));
    return { ...content, category_cards: (content.category_cards || []).map((c) => {
      const body = byTitle.get(en(c.title).toLowerCase().trim());
      return typeof body === 'string' && body.trim() ? { ...c, body: clean(body) } : c;
    }) };
  }
  if (field === 'intro') return { ...content, intro: clean(value) };
  const key = `${field}_i18n`;
  return { ...content, [key]: { ...((content[key] && typeof content[key] === 'object') ? content[key] : {}), en: clean(value) } };
}

async function loadFacts(siteId) {
  const [site, theme, services, team, sections] = await Promise.all([
    supabase.from('sites').select('id, subdomain, status, currency, business_hours, time_zone, metadata, company:companies(name), vertical:verticals(slug, display_name)').eq('id', siteId).single(),
    supabase.from('site_theme_settings').select('logo_url, favicon_url, metadata').eq('site_id', siteId).maybeSingle(),
    supabase.from('site_services').select('id, name, description, price_cents, price_display_mode, duration_minutes, kind, is_active').eq('site_id', siteId).order('display_order'),
    supabase.from('site_team_members').select('name, role, is_active').eq('site_id', siteId).eq('is_active', true).order('display_order'),
    supabase.from('site_sections').select('id, section_type, content, is_visible, page:site_pages(id, slug)').eq('site_id', siteId),
  ]);
  if (site.error || !site.data) throw new Error(`site ${siteId}: ${site.error?.message || 'not found'}`);
  const loc = (sections.data || []).find((s) => s.section_type === 'location_map' && s.page?.slug === 'home')?.content || {};
  const gbp = theme.data?.metadata?.gbp?.snapshot || null;
  return { site: site.data, theme: theme.data || null, services: services.data || [], team: team.data || [], sections: sections.data || [], loc, gbp, goals: theme.data?.metadata?.goals || null };
}

function factsForPrompt(f) {
  const s = f.site;
  const hours = s.business_hours && typeof s.business_hours === 'object'
    ? Object.entries(s.business_hours).map(([d, v]) => `${d}: ${v && v.closed ? 'closed' : v ? `${v.open || '?'} to ${v.close || '?'}` : '?'}`).join('; ')
    : null;
  const money = (c) => (typeof c === 'number' ? `${(c / 100).toFixed(c % 100 ? 2 : 0)} ${s.currency || 'USD'}` : null);
  return {
    business_name: s.company?.name || s.subdomain,
    business_type: s.vertical?.display_name || s.vertical?.slug,
    town: [f.loc.address_parts?.city || null, f.loc.address_parts?.state || null].filter(Boolean).join(', ') || (f.loc.address ? String(f.loc.address).split(',').slice(-3, -1).join(',').trim() : null),
    address: f.loc.address || null,
    phone: f.loc.phone || null,
    hours,
    services: f.services.filter((x) => x.is_active !== false).map((x) => ({ name: en(x.name), price: money(x.price_cents), from: x.price_display_mode === 'from', minutes: x.duration_minutes, kind: x.kind || 'appointment' })),
    team: f.team.map((t) => ({ name: t.name, role: en(t.role) })),
    team_size: f.team.length,
    google_listing: f.gbp ? { category: f.gbp.categoryName || f.gbp.category || null, rating: f.gbp.totalScore || f.gbp.rating || null, reviews: f.gbp.reviewsCount || null, description: f.gbp.description || null } : null,
    owner_goals: f.goals,
    booking: 'Customers book online on the website and pay at the venue (no online card payment). Bookings are confirmed by email with a reminder the day before.',
  };
}

// Brand-masked, whitespace-folded text for the sample comparison. The clone
// rename swaps the seed's name and its "&" / "and" spellings, so mask all three.
function maskBrand(text, brand) {
  let t = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const b = String(brand || '').toLowerCase().trim();
  if (!b) return t;
  for (const v of new Set([b, b.replace(/\s*&\s*/g, ' and '), b.replace(/\s+and\s+/g, ' & ')])) t = t.split(v).join('@brand@');
  return t;
}
const fieldText = (content, field, brand) => maskBrand(JSON.stringify(fieldValue(content || {}, field)), brand);

// Positional key (page slug, section_type, nth of that type on the page):
// clones preserve section order, the same rule lib/sampleContent uses.
function positionalIndex(sections) {
  const counters = new Map();
  const index = new Map();
  for (const s of sections) {
    const base = `${s.page?.slug || ''}:${s.section_type}`;
    const n = counters.get(base) || 0;
    counters.set(base, n + 1);
    index.set(`${base}:${n}`, s);
  }
  return index;
}

// A target is still the demo's when every field we would rewrite reads the
// same as the seed's (TEXT only: localized image URLs never count, which is
// why lib/sampleContent's whole-content comparison is not enough here).
function targetsOf(sections, seedSections, tenantBrand, seedBrand, force) {
  const seedIndex = positionalIndex(seedSections);
  const counters = new Map();
  const out = [];
  for (const s of sections) {
    const slug = s.page?.slug || '';
    const base = `${slug}:${s.section_type}`;
    const n = counters.get(base) || 0;
    counters.set(base, n + 1);
    const key = `${TEAM_SLUGS.has(slug) ? 'team' : slug}:${s.section_type}`;
    const fields = TARGETS[key] || (key === 'team:intro' ? ['body'] : null);
    if (!fields) continue;
    const current = {};
    for (const fld of fields) current[fld] = fieldValue(s.content || {}, fld);
    if (Object.values(current).every((v) => (Array.isArray(v) ? v.length === 0 : !v))) continue;
    if (!force) {
      const seed = seedIndex.get(`${base}:${n}`);
      if (!seed) continue;
      const same = fields.every((fld) => fieldText(s.content, fld, tenantBrand) === fieldText(seed.content, fld, seedBrand));
      if (!same) continue;
    }
    out.push({ id: s.id, key, fields, current, content: s.content || {} });
  }
  return out;
}

// Page SEO (title + description) for home / services / about: rewritten when
// still the seed's (brand-masked) or empty.
const SEO_SLUGS = ['home', 'services', 'about'];
async function seoTargets(siteId, seedId, tenantBrand, seedBrand, force) {
  const [t, s] = await Promise.all([
    supabase.from('site_pages').select('id, slug, title, meta_title, meta_description').eq('site_id', siteId).in('slug', SEO_SLUGS),
    seedId ? supabase.from('site_pages').select('slug, meta_title, meta_description').eq('site_id', seedId).in('slug', SEO_SLUGS) : Promise.resolve({ data: [] }),
  ]);
  const seedBy = new Map((s.data || []).map((p) => [p.slug, p]));
  const out = [];
  for (const p of t.data || []) {
    const seed = seedBy.get(p.slug);
    const cur = { meta_title: en(p.meta_title), meta_description: en(p.meta_description) };
    const same = (k) => !cur[k] || (seed && maskBrand(cur[k], tenantBrand) === maskBrand(en(seed[k]), seedBrand));
    if (!force && !(same('meta_title') && same('meta_description'))) continue;
    out.push({ id: p.id, slug: p.slug, title: en(p.title), current: cur });
  }
  return out;
}

async function loadSeedSections(seedId) {
  if (!seedId) return { sections: [], brand: '' };
  const [secs, site] = await Promise.all([
    supabase.from('site_sections').select('id, section_type, content, page:site_pages(slug)').eq('site_id', seedId),
    supabase.from('sites').select('company:companies(name)').eq('id', seedId).maybeSingle(),
  ]);
  return { sections: secs.data || [], brand: site.data?.company?.name || '' };
}

async function seedServiceDescriptions(seedId) {
  if (!seedId) return new Map();
  const { data } = await supabase.from('site_services').select('name, description').eq('site_id', seedId);
  const m = new Map();
  for (const r of data || []) m.set(en(r.name).toLowerCase().trim(), en(r.description));
  return m;
}

/**
 * Rewrite the sample copy for a site. Returns what changed.
 * @param {string} siteId
 * @param {{ force?: boolean, dryRun?: boolean }} [opts]
 */
async function draftSiteCopy(siteId, { force = false, dryRun = false, probe = false } = {}) {
  const f = await loadFacts(siteId);
  const seedId = f.site.metadata?.cloned_from || SEED_SOURCE_BY_VERTICAL[f.site.vertical?.slug] || null;
  const { sampleSectionIds } = await evaluateSampleSections(siteId);
  const sampleIds = new Set(sampleSectionIds);
  const seed = await loadSeedSections(seedId);

  const targets = targetsOf(f.sections, seed.sections, f.site.company?.name || '', seed.brand, force);
  const pageTargets = await seoTargets(siteId, seedId, f.site.company?.name || '', seed.brand, force);
  const seedDesc = await seedServiceDescriptions(seedId);
  const serviceTargets = f.services.filter((x) => x.is_active !== false).filter((x) => {
    const d = en(x.description);
    return force || !d || d === (seedDesc.get(en(x.name).toLowerCase().trim()) || '');
  });
  const hide = f.sections.filter((s) => HIDE_WHILE_SAMPLE.has(s.section_type) && s.is_visible !== false && (force || sampleIds.has(s.id)));

  // Demo brand assets still on the tenant (the wizard composes replacements).
  let sampleFavicon = !f.theme?.favicon_url;
  let sampleLogo = !f.theme?.logo_url;
  if (seedId) {
    const { data: st } = await supabase.from('site_theme_settings').select('logo_url, favicon_url').eq('site_id', seedId).maybeSingle();
    if (st?.favicon_url && st.favicon_url === f.theme?.favicon_url) sampleFavicon = true;
    if (st?.logo_url && st.logo_url === f.theme?.logo_url) sampleLogo = true;
  }

  const result = { siteId, written: [], services: 0, pages: [], hidden: [], sampleFavicon, sampleLogo, model: COPY_MODEL, skipped: null };
  if (probe) {
    return { ...result, probe: { seedId, seedSections: seed.sections.length, seedBrand: seed.brand, targets: targets.map((t) => t.key), pages: pageTargets.map((p) => p.slug), serviceTargets: serviceTargets.length, hide: hide.map((s) => `${s.page?.slug}:${s.section_type}`) } };
  }
  if (!targets.length && !serviceTargets.length && !pageTargets.length) {
    // Nothing left that is the demo's; still hide claim sections if any.
    if (!dryRun) for (const s of hide) await supabase.from('site_sections').update({ is_visible: false }).eq('id', s.id);
    result.hidden = hide.map((s) => `${s.page?.slug}:${s.section_type}`);
    result.skipped = 'nothing_sample';
    return result;
  }
  if (!openai) { result.skipped = 'no_openai_key'; return result; }

  const facts = factsForPrompt(f);
  const ask = {
    sections: targets.map((t) => ({ key: t.key, id: t.id, fields: t.fields, demo_text_as_length_reference: t.current })),
    services: serviceTargets.map((x) => ({ id: x.id, name: en(x.name), minutes: x.duration_minutes, kind: x.kind || 'appointment' })),
    pages: pageTargets.map((p) => ({ id: p.id, page: p.slug, demo_as_length_reference: p.current })),
  };
  const system = [
    'You write website copy for a local service business. Warm, plain, specific, confident; no hype, no cliches, no exclamation marks.',
    'Use ONLY the facts provided. Never invent history, years in business, generations, awards, press, numbers of customers, ratings, guarantees or policies that are not in the facts. If a detail is unknown, leave it out.',
    'The demo text is given ONLY as a length and structure reference: match its length, keep NONE of its facts or claims.',
    'Write for customers of this business in the country implied by the address (US English by default). Use the business name naturally but not in every sentence.',
    'Never use an em dash or an en dash anywhere; use a comma, a colon or a full stop.',
    'FAQ: six items, each a real customer question answered from the facts (how to book, hours, where, what to expect, payment at the venue, changing or cancelling by replying to the confirmation email or calling). Do not promise walk-ins, parking, products or deposits unless the facts say so.',
    'Service descriptions: one sentence, at most 16 words, about what the customer gets. No price in the description.',
    'Hero headline: at most 8 words, no full stop. Hero subheadline: at most 22 words. "headline" fields elsewhere: at most 7 words. "body": two to four short sentences, paragraphs separated by a blank line where the reference has them.',
    '"category_cards": keep every title exactly, rewrite each "body" (at most 30 words, what that group of services offers here); never name a person.',
    'Pages: "meta_title" at most 60 characters in the form "<business name> | <what and where>", "meta_description" at most 155 characters inviting a booking.',
    'Return ONLY JSON: { "sections": [{ "id": string, "values": { <field>: string | [{q,a}] | [{title,body}] } }], "services": [{ "id": string, "description": string }], "pages": [{ "id": string, "meta_title": string, "meta_description": string }] }. Every requested id and field must be present.',
  ].join('\n');
  const user = `FACTS:\n${JSON.stringify(facts, null, 1)}\n\nWRITE:\n${JSON.stringify(ask, null, 1)}`;

  const r = await openai.chat.completions.create({
    model: COPY_MODEL,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
  });
  const out = JSON.parse(r.choices?.[0]?.message?.content || '{}');
  if (process.env.SITE_COPY_DEBUG) console.log('[siteCopy] raw model output:', JSON.stringify(out).slice(0, 4000));
  // The model sometimes echoes the request shape (`fields`) instead of `values`.
  const bySection = new Map((Array.isArray(out.sections) ? out.sections : []).map((s) => [s.id, s.values || s.fields || {}]));
  const byService = new Map((Array.isArray(out.services) ? out.services : []).map((s) => [s.id, s.description]));
  for (const t of targets) if (!bySection.has(t.id)) console.warn(`[siteCopy] model returned nothing for ${t.key} (${t.id})`);

  for (const t of targets) {
    const vals = bySection.get(t.id);
    if (!vals) continue;
    let content = t.content;
    let touched = false;
    for (const fld of t.fields) {
      const v = vals[fld];
      if (fld === 'items') {
        if (!Array.isArray(v) || !v.length) continue;
        content = applyField(content, fld, v.filter((it) => it && it.q && it.a));
      } else if (fld === 'category_cards') {
        if (!Array.isArray(v) || !v.length) continue;
        content = applyField(content, fld, v.filter((c) => c && c.title));
      } else {
        if (typeof v !== 'string' || !v.trim()) continue;
        content = applyField(content, fld, v);
      }
      touched = true;
    }
    if (!touched) continue;
    if (!dryRun) {
      const { error } = await supabase.from('site_sections').update({ content }).eq('id', t.id).eq('site_id', siteId);
      if (error) throw new Error(`section ${t.key}: ${error.message}`);
    }
    result.written.push(t.key);
  }
  for (const x of serviceTargets) {
    const d = byService.get(x.id);
    if (typeof d !== 'string' || !d.trim()) continue;
    if (!dryRun) {
      const { error } = await supabase.from('site_services').update({ description: { ...((x.description && typeof x.description === 'object') ? x.description : {}), en: clean(d) } }).eq('id', x.id).eq('site_id', siteId);
      if (error) throw new Error(`service ${en(x.name)}: ${error.message}`);
    }
    result.services += 1;
  }
  const byPage = new Map((Array.isArray(out.pages) ? out.pages : []).map((p) => [p.id, p]));
  for (const p of pageTargets) {
    const v = byPage.get(p.id);
    if (!v) continue;
    const patch = {};
    if (typeof v.meta_title === 'string' && v.meta_title.trim()) patch.meta_title = { en: clean(v.meta_title).slice(0, 70) };
    if (typeof v.meta_description === 'string' && v.meta_description.trim()) patch.meta_description = { en: clean(v.meta_description).slice(0, 170) };
    if (!Object.keys(patch).length) continue;
    if (!dryRun) {
      const { error } = await supabase.from('site_pages').update(patch).eq('id', p.id).eq('site_id', siteId);
      if (error) throw new Error(`page ${p.slug} seo: ${error.message}`);
    }
    result.pages.push(p.slug);
  }
  if (!dryRun) for (const s of hide) await supabase.from('site_sections').update({ is_visible: false }).eq('id', s.id);
  result.hidden = hide.map((s) => `${s.page?.slug}:${s.section_type}`);

  if (!dryRun && (result.written.length || result.services || result.pages.length || result.hidden.length)) {
    const meta = { ...((f.theme?.metadata && typeof f.theme.metadata === 'object') ? f.theme.metadata : {}) };
    meta.ai_copy = { written_at: new Date().toISOString(), model: COPY_MODEL, sections: result.written, services: result.services, pages: result.pages, hidden: result.hidden };
    if (f.theme) await supabase.from('site_theme_settings').update({ metadata: meta }).eq('site_id', siteId);
    else await supabase.from('site_theme_settings').insert({ site_id: siteId, metadata: meta });
  }
  return result;
}

module.exports = { draftSiteCopy, COPY_MODEL };
