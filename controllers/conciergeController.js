// Concierge (Agent 1) — the chat on Stemfra's OWN marketing site. PUBLIC, single
// "tenant" (Stemfra itself), so unlike Front Desk there's no siteId and we keep it
// STATELESS server-side: the widget holds the conversation and sends recent `history`
// each turn (a marketing chat doesn't need DB-persisted threads, and it avoids the
// NOT NULL agent_conversations.site_id). Answers from Stemfra product knowledge,
// guides visitors to self-serve onboarding, and captures a lead to the CRM `leads`
// table when a human follow-up is wanted.
const supabase = require('../config/supabase');
const { DateTime } = require('luxon');
const { buildConciergeContext } = require('../lib/conciergeContext');
const conciergeBrain = require('../lib/conciergeBrain');
const { buildAiPlanResponse } = require('../lib/conciergePresentation');
const { clientIp } = require('../lib/clientIp');
const agentBudget = require('../lib/agentBudget');

let fireSpeedToLead = null;
try { ({ fireSpeedToLead } = require('../routes/speedToLead')); } catch { /* optional */ }

const CONCIERGE_MODEL = process.env.CONCIERGE_MODEL || 'gpt-6-luna';
const EMAIL_RE = /^\S+@\S+\.\S+$/;

// CTA buttons the agent may surface (keys → server-controlled label + internal path,
// so the model can't inject arbitrary URLs).
const CTA_LINKS = buildConciergeContext().links;
const CTA_LABELS = { websites: 'Explore websites', ai: 'Explore Stemfra AI', software: 'Custom software', pricing: 'See pricing', examples: 'Browse website templates', help: 'Help Center', contact: 'Talk to us' };

// P16.4a: the agent may also request cta key 'book_call' — instead of a link it
// opens the widget's inline booking card (a REAL booking on the internal
// stemfra-support site through the public booking engine).
const SUPPORT_SUBDOMAIN = 'stemfra-support';

// Per-IP in-memory rate limit (public endpoint + LLM cost protection; per-instance).
const hits = new Map();
function rateLimited(key, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > limit;
}

// Write a marketing lead to the CRM `leads` table + kick off speed-to-lead.
async function captureLead(lead) {
  const email = typeof lead.email === 'string' && EMAIL_RE.test(lead.email.trim()) ? lead.email.trim().toLowerCase() : null;
  const name = typeof lead.name === 'string' && lead.name.trim() ? lead.name.trim() : null;
  if (!name && !email) return; // need at least a name or an email to be useful

  const notes = [
    lead.summary && String(lead.summary).trim(),
    lead.vertical ? `Business type: ${lead.vertical}` : '',
    lead.wants_call ? 'Requested a call / human follow-up.' : '',
    '— Captured by the website Concierge chat.',
  ].filter(Boolean).join('\n');

  const { data: row, error } = await supabase.from('leads').insert([{
    contact_name: name || email,
    company_name: typeof lead.company === 'string' && lead.company.trim() ? lead.company.trim() : null,
    email,
    service: ['website', 'ai', 'custom_software'].includes(lead.product) ? lead.product : 'general',
    stage: 'new_lead',
    source: 'website_chat',
    lead_source: 'website_chat',
    notes,
    last_activity_at: new Date().toISOString(),
  }]).select('id').single();
  if (error) { console.error('[concierge] lead insert failed:', error.message); return; }

  if (fireSpeedToLead) {
    fireSpeedToLead(row.id, { source: 'website_chat' })
      .then(r => { if (r && !r.ok) console.warn('[concierge] speed-to-lead not started:', r.reason); })
      .catch(e => console.error('[concierge] speed-to-lead error:', e.message));
  }
}

// POST /api/concierge/send  { message, history?: [{role, content}] }
async function send(req, res) {
  try {
    const { history } = req.body || {};
    let { message } = req.body || {};
    if (!message || !String(message).trim()) return res.status(400).json({ error: 'message is required.' });

    const ip = clientIp(req); // never the caller-written first x-forwarded-for value (P45)
    if (rateLimited(ip)) return res.status(429).json({ error: 'Too many messages. Please slow down a moment.' });

    if (!conciergeBrain.isConfigured()) {
      return res.status(503).json({ error: 'The assistant is not configured yet.' });
    }

    const context = buildConciergeContext();
    const today = DateTime.now().setZone('America/New_York').toFormat("yyyy-MM-dd '('cccc')'");
    // History comes from the widget (this chat is stateless), so each entry is
    // cut to the input cap too: a caller cannot pad the prompt through it (P45).
    const maxChars = (await agentBudget.getBudget()).concierge.max_chars || 1000;
    const hist = Array.isArray(history)
      ? history.slice(-12).filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content.slice(0, maxChars) }))
      : [];

    // Budget (P45): this address and the whole agent, per day. The length of
    // the chat is the widget's own count, so it is a courtesy cap, not a guard.
    const budget = await agentBudget.guard({
      agent: 'concierge', ip,
      turns: Array.isArray(history) ? history.filter(m => m && m.role === 'user').length : 0,
    });
    if (!budget.ok) {
      return res.json({
        reply: agentBudget.fallbackReply({ agent: 'concierge', reason: budget.reason }),
        quick_replies: [],
        card: { kind: 'cta', actions: ['pricing', 'contact'].filter(k => CTA_LINKS[k]).map(k => ({ label: CTA_LABELS[k], href: CTA_LINKS[k] })) },
        limited: budget.reason,
      });
    }
    message = (await agentBudget.capInput('concierge', message)).text;

    // The general starter question offers every product, not just website onboarding.
    if (/^how do i get started[?.!]*$/i.test(String(message).trim())) {
      return res.json({
        reply: 'We offer three products: managed websites, Custom Software and AI. You can start by choosing any one of them.',
        quick_replies: [],
        card: { kind: 'cta', actions: [
          { label: 'Browse websites', href: context.links.examples },
          { label: 'Custom Software', href: context.links.software },
          { label: 'AI', href: context.links.ai },
        ] },
      });
    }

    // Broad pricing questions use a structured overview, not a model-written price list.
    if (/^(how does pricing work|what (?:are|is) (?:your |the )?(?:prices|pricing)|show (?:me )?(?:your )?(?:prices|pricing)|pricing)[?.!]*$/i.test(String(message).trim())) {
      return res.json({
        reply: 'We have three product categories, each with its own pricing. Select one to see the details.',
        quick_replies: [],
        card: { kind: 'cta', layout: 'product_pricing', actions: [
          { label: 'Managed websites', price: `$${context.websites.price_usd_month}/month`, href: context.links.websites, question: 'Tell me about managed website pricing and the trial.' },
          { label: 'Stemfra AI', price: `From $${context.ai.plans[0].monthly_usd}/month`, href: context.links.ai, question: 'Show me the Stemfra AI plans and pricing.' },
          { label: 'Custom software', price: `From $${context.custom_software.starting_price_usd.toLocaleString('en-US')}/project`, href: context.links.software, question: 'Tell me about custom software pricing.' },
        ] },
      });
    }

    if (/^show me the stemfra ai plans and pricing[.!?]*$/i.test(String(message).trim())) {
      return res.json(buildAiPlanResponse(context));
    }

    let reply = '', lead = null, quickReplies = [], ctaKeys = [], wantsBooking = false;
    try {
      const data = await conciergeBrain.runConcierge({ message: String(message).trim(), history: hist, context, today, model: CONCIERGE_MODEL });
      if (data.presentation === 'ai_plans' && !data.lead && !data.cta?.includes('book_call')) {
        return res.json(buildAiPlanResponse(context));
      }
      reply = data.reply ?? data.output ?? '';
      if (data.lead && typeof data.lead === 'object') lead = data.lead;
      if (Array.isArray(data.quick_replies)) quickReplies = data.quick_replies.filter(s => typeof s === 'string' && s.trim()).slice(0, 6);
      if (Array.isArray(data.cta)) {
        wantsBooking = data.cta.includes('book_call');
        ctaKeys = data.cta.filter(k => CTA_LINKS[k]);
      }
    } catch (e) {
      console.error(`[concierge.send] native error:`, e.message);
      return res.status(502).json({ error: 'The assistant could not respond right now. Please try again.' });
    }

    if (lead) captureLead(lead).catch(e => console.error('[concierge] captureLead error:', e.message));

    // Build a CTA card from the agent's requested link keys (server-controlled
    // hrefs). 'book_call' is special: it opens the widget's inline booking
    // card instead of following a link, and supersedes everything else.
    let card = null;
    if (wantsBooking) {
      card = { kind: 'book_call' };
      quickReplies = [];
    } else if (ctaKeys.length) {
      card = { kind: 'cta', actions: ctaKeys.map(k => ({ label: CTA_LABELS[k], href: CTA_LINKS[k] })) };
      quickReplies = []; // a CTA card supersedes chips
    }

    res.json({ reply, quick_replies: quickReplies, card });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/concierge/call-config — PUBLIC coordinates for booking a
// consultation call: the internal support site + its 'sales' service only
// (support-category services stay owner/staff-facing). The widget books
// through the public booking endpoints with these.
async function callConfig(req, res) {
  try {
    const ip = clientIp(req);
    if (rateLimited(`cfg:${ip}`, 30)) return res.status(429).json({ error: 'Too many requests.' });

    const { data: site } = await supabase
      .from('sites')
      .select('id, time_zone')
      .eq('subdomain', SUPPORT_SUBDOMAIN)
      .single();
    if (!site) return res.status(503).json({ error: 'Calls are not available right now.' });

    const [{ data: team }, { data: services }] = await Promise.all([
      supabase.from('site_team_members').select('id').eq('site_id', site.id).eq('is_active', true).limit(1),
      supabase.from('site_services').select('id, name, duration_minutes, metadata').eq('site_id', site.id).eq('is_active', true),
    ]);
    const sales = (services ?? []).find(s => s.metadata?.support_category === 'sales');
    if (!team?.length || !sales) return res.status(503).json({ error: 'Calls are not available right now.' });

    return res.json({
      // Team out-of-office → the booking page shows the notice (slots inside are hidden by the engine).
      outOfOffice: await (async () => { const o = require('../lib/outOfOffice'); const p = await o.currentOrNext(); return p ? { from: p.from, to: p.to, note: p.note || null, label: o.describe(p) } : null; })(),
      siteId: site.id,
      timeZone: site.time_zone,
      teamMemberId: team[0].id,
      service: { id: sales.id, name: sales.name?.en ?? 'Consultation call', durationMinutes: sales.duration_minutes },
    });
  } catch (err) {
    console.error('[concierge] call-config failed:', err);
    return res.status(500).json({ error: 'Could not load the call schedule.' });
  }
}

module.exports = { send, callConfig };
