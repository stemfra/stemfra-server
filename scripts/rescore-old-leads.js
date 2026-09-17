#!/usr/bin/env node
// Re-score the Google Maps leads that entered the CRM under the OLD rules (before the
// native engine, 2026-09-17) with today's rules, from the Google record each lead already
// carries: no Apify call, a few cents of OpenAI. Peter's decisions (2026-09-17):
//   • nothing is deleted;
//   • a lead someone already worked (a call, an email, a stage beyond New Lead) keeps its
//     stage and only gains the facts (reviews, rating, booking platform, volume);
//   • an untouched lead that is too quiet goes to Lost with the reason; the rest are judged
//     again (score, relevance) and lose their old draft (written from the retired A1);
//   • every lead is copied into leadgen_places so the market data is complete.
// Usage:  node scripts/rescore-old-leads.js            preview, writes nothing, no AI
//         node scripts/rescore-old-leads.js --apply    do it
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const supabase = require('../config/supabase');
const native = require('../lib/leadgenNative');

const APPLY = process.argv.includes('--apply');
const MIN_VOLUME = Number(process.env.LEADGEN_MIN_VOLUME) || 5;
const QUIET = (rc, rt) => `Too quiet for a commission offer: ${rc} Google reviews at ${rt} (rule 2026-09-17)`;

const parse = (raw) => { if (!raw) return null; if (typeof raw === 'object') return raw; try { return JSON.parse(raw); } catch { return null; } };

(async () => {
  const { data: leads, error } = await supabase.from('leads')
    .select('id, company_name, phone, email, region, phone_country, stage, review_status, outreach_status, raw_signal, readiness, source_detail, qualification, lead_score, is_test, leadgen_run_id, vertical')
    .eq('source', 'google_maps').limit(2000);
  if (error) throw new Error(error.message);
  const old = leads.filter((l) => !l.is_test && (l.qualification || {}).engine !== 'native');
  const { data: callRows } = await supabase.from('calls').select('lead_id').in('lead_id', old.map((l) => l.id));
  const called = new Set((callRows || []).map((c) => c.lead_id));

  const out = { total: old.length, no_record: 0, touched_facts_only: 0, already_lost: 0, quiet_to_lost: 0, judged: 0, judged_rejected: 0, judged_kept: 0, places: 0, errors: 0 };
  const places = [];
  const toJudge = [];

  for (const l of old) {
    const rec = parse(l.raw_signal);
    if (!rec || !rec.placeId) { out.no_record++; continue; }
    const p = { ...rec, claimThisBusiness: rec.claimed ? false : true, instagrams: rec.instagram ? [rec.instagram] : [], facebooks: rec.facebook ? [rec.facebook] : [], tiktoks: rec.tiktok ? [rec.tiktok] : [], ownerDescription: rec.description, ownerUpdates: new Array(rec.ownerUpdates || 0).fill(1), emails: l.email ? [l.email] : [] };
    const c = native.candidateOf(p, { country: l.phone_country || 'US' });
    c.readiness = l.readiness || c.readiness;
    const facts = { booking_platform: c.booking_platform, review_count: c.review_count, rating: c.rating, price_level: c.price_level, trait_volume: c.trait_volume, trait_affordability: c.trait_volume };
    const touched = called.has(l.id) || (l.outreach_status && l.outreach_status !== 'not_sent') || !['new_lead', 'lost'].includes(l.stage);
    const base = { l, c, facts };
    if (l.stage === 'lost') { out.already_lost++; base.action = 'facts'; base.placeStatus = c.readiness === 'old_school' ? 'old_school' : 'promoted'; }
    else if (touched) { out.touched_facts_only++; base.action = 'facts'; base.placeStatus = 'promoted'; }
    else if (c.trait_volume < MIN_VOLUME) { out.quiet_to_lost++; base.action = 'quiet'; base.placeStatus = 'low_volume'; }
    else { base.action = 'judge'; base.placeStatus = 'promoted'; toJudge.push(base); }
    places.push(base);
  }
  out.judged = toJudge.length;

  console.log(APPLY ? 'APPLYING' : 'PREVIEW (nothing is written, no AI call)');
  console.log(JSON.stringify(out, null, 1));
  const sample = (a) => places.filter((x) => x.action === a).slice(0, 6).map((x) => `${x.l.company_name} (${x.c.review_count} @ ${x.c.rating}${x.c.booking_platform ? ', ' + x.c.booking_platform : ''})`).join(' · ');
  console.log('\nto Lost (quiet):', sample('quiet'));
  console.log('\nto be judged again:', sample('judge'));
  if (!APPLY) return process.exit(0);

  // 1. facts on every lead; quiet → Lost
  for (const x of places) {
    const patch = { qualification: { ...(x.l.qualification || {}), ...x.facts, rescored_at: new Date().toISOString().slice(0, 10) } };
    if (x.action === 'quiet') Object.assign(patch, { stage: 'lost', lost_reason: QUIET(x.c.review_count, x.c.rating), review_status: 'approved', ai_draft_subject: null, ai_draft_message: null });
    const { error: e } = await supabase.from('leads').update(patch).eq('id', x.l.id);
    if (e) { out.errors++; console.error(x.l.company_name, e.message); }
  }
  // 2. judge the rest again (no draft), 4 at a time
  const system = native.systemPrompt();
  const OpenAI = require('openai'); const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const REJECTS = ['chain', 'wrong_vertical', 'outside_market', 'closed', 'not_end_client'];
  let next = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < toJudge.length) {
      const x = toJudge[next++];
      try {
        const user = ['signal_source: google_maps', 'raw_signal:', x.c.raw_signal, '', `business_name: ${x.c.business_name}`, `phone: ${x.c.phone}`, `email: ${x.c.email}`, `website: ${x.c.website}`, `city: ${x.c.city}`,
          `digital_readiness: ${x.c.readiness}`, `review_count: ${x.c.review_count}`, `rating: ${x.c.rating}`, `trait_volume: ${x.c.trait_volume} (computed, copy it)`,
          `booking_platform: ${x.c.booking_platform || 'none'}`, `run_country: ${x.l.phone_country || 'US'}`].join('\n');
        const r = await openai.chat.completions.create({ model: process.env.LEADGEN_QUALIFY_MODEL || 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] });
        const ai = JSON.parse(r.choices[0].message.content || '{}');
        const reason = REJECTS.includes(ai.reject_reason) ? ai.reject_reason : null;
        const score = Math.min(Number(ai.lead_score) || 0, x.c.trait_volume + 1);
        const patch = {
          lead_score: score, pain_point_bucket: ai.pain_point_bucket || null, ai_draft_subject: null, ai_draft_message: null,
          qualification: { ...(x.l.qualification || {}), ...x.facts, vertical: ai.vertical || (x.l.qualification || {}).vertical || null, trait_owner_decides: ai.trait_owner_decides ?? null, trait_weak_web: ai.trait_weak_web ?? null, reasoning: ai.reasoning || null, rescored_at: new Date().toISOString().slice(0, 10), rescored_by: 'native rules' },
        };
        if (reason) { Object.assign(patch, { stage: 'lost', lost_reason: `Not a fit under the 2026-09-17 rules: ${reason.replace(/_/g, ' ')}`, review_status: 'approved' }); x.placeStatus = 'not_relevant'; out.judged_rejected++; } else out.judged_kept++;
        x.ai = ai; x.score = score;
        const { error: e } = await supabase.from('leads').update(patch).eq('id', x.l.id);
        if (e) throw new Error(e.message);
      } catch (e) { out.errors++; console.error(x.l.company_name, e.message); }
    }
  }));
  // 3. every old lead becomes a Places row
  const rows = places.map((x) => ({ ...require('../lib/leadgenNative').placeRowFor(x.c, { status: x.placeStatus, reason: x.action === 'quiet' ? 'too quiet (re-scored old lead)' : 're-scored old lead', ai: x.ai || null, leadScore: x.score ?? x.l.lead_score ?? null, leadId: x.l.id, runId: x.l.leadgen_run_id || null, vertical: x.l.vertical || null }) }));
  const saved = await native.savePlaces(rows, null);
  out.places = saved.saved;
  console.log('\nDONE', JSON.stringify(out, null, 1));
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
