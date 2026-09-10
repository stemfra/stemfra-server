// ─── Staff handover (P32 phase 1, 2026-09-10) ────────────────────────────────
//
// When a rep leaves, a successor takes their book: every lead and deal is
// reassigned, the clients past first contact get an introduction email FROM
// THE SUCCESSOR'S OWN MAILBOX (domain-wide delegation, the same path Mark's
// outreach uses), and the leaver's profile is deactivated. The Workspace steps
// (forward mail, suspend, alias, delete) stay manual until phase 2 wires the
// Admin SDK; the response carries that checklist so nothing is forgotten.
//
// Contacts / companies / projects only carry `created_by` (authorship), so they
// are not reassigned; ownership in this CRM lives on leads and deals.
const supabase = require('../../config/supabase');
const gmail = require('../../lib/gmailOutreach');
const { logActivity } = require('../../lib/activity');
const { emailAllowed, emailFooter } = require('../../lib/outreachCompliance');

const TEMPLATE_CODE = 'H1';
// Stages where a real relationship exists and a "your new account manager" note
// makes sense. New leads never spoken to, and lost ones, are reassigned silently.
const NOTIFY_STAGES = ['contacted', 'discovery_call', 'proposal_sent', 'negotiation', 'won'];
const SEND_GAP_MS = 1500;

async function profileById(id) {
  const { data, error } = await supabase.from('profiles').select('id, full_name, email, phone, role, is_active').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

function firstName(lead) {
  const raw = String(lead.first_name || '').trim() || String(lead.contact_name || '').trim().split(/\s+/)[0] || '';
  return /^owner$/i.test(raw) || raw.includes('—') ? '' : raw;
}

function render(text, { lead, from, to }) {
  const first = firstName(lead) || 'there';
  return String(text || '')
    .replace(/\{\{\s*first_name\s*\}\}/g, first)
    .replace(/\{\{\s*business_name\s*\}\}/g, lead.company_name || 'your business')
    .replace(/\{\{\s*old_manager\s*\}\}/g, from.full_name || from.email)
    .replace(/\{\{\s*new_manager\s*\}\}/g, to.full_name || to.email)
    .replace(/\{\{\s*sender_name\s*\}\}/g, to.full_name || to.email)
    .replace(/\{\{\s*sender_phone\s*\}\}/g, to.phone || process.env.TWILIO_PHONE_NUMBER || '')
    .replace(/\{\{\s*sender_email\s*\}\}/g, to.email)
    .replace(/\{\{[^}]+\}\}/g, '')
    .trim();
}

async function loadBook(fromId) {
  const [{ data: leads, error: e1 }, { data: deals, error: e2 }, { data: sentBy, error: e3 }] = await Promise.all([
    supabase.from('leads').select('id, first_name, contact_name, company_name, email, stage, region, entity_type, do_not_email, is_test').eq('assigned_to', fromId).order('company_name'),
    supabase.from('deals').select('id, stage').eq('assigned_to', fromId),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('outreach_sent_by', fromId),
  ]);
  if (e1) throw e1; if (e2) throw e2; if (e3) throw e3;
  const clients = (leads || []).filter((l) => l.email && !l.do_not_email && !l.is_test && NOTIFY_STAGES.includes(l.stage))
    .map((l) => ({ id: l.id, name: [l.first_name, l.contact_name].filter(Boolean)[0] || null, company: l.company_name, email: l.email, stage: l.stage, emailAllowed: emailAllowed(l).ok }));
  return { leads: leads || [], deals: deals || [], outreachSentByCount: sentBy?.length ?? 0, clients };
}

function checklist(from, to) {
  return [
    `Google Admin → Users → ${from.email}: turn on email forwarding (Gmail routing) to ${to.email} so open conversations keep flowing.`,
    `Google Admin → Users → ${from.email}: Suspend the user (blocks sign-in everywhere, keeps the mailbox).`,
    `Google Admin → Users → ${to.email} → Alternate emails: add ${from.email} as an alias for 90 days (free), so clients who reply to the old address reach ${to.full_name || to.email}.`,
    `After 90 days: delete ${from.email} with Drive + Calendar transferred to ${to.email}. Do not rename the account for a new hire (per-seat billing, stale threads).`,
    'Twilio / other tools: no per-person credentials exist (all calls and texts run through the platform), nothing to revoke there.',
  ];
}

// GET /api/admin/handover/preview?from=&to=
async function preview(req, res) {
  try {
    const from = await profileById(req.query.from);
    const to = req.query.to ? await profileById(req.query.to) : null;
    if (!from) return res.status(404).json({ error: 'Leaving member not found' });
    const book = await loadBook(from.id);
    const { data: tpl } = await supabase.from('email_templates').select('code, subject, body').eq('code', TEMPLATE_CODE).eq('is_active', true).maybeSingle();
    const sample = book.clients[0];
    const previewMail = tpl && to && sample
      ? { subject: render(tpl.subject, { lead: sample, from, to }), body: render(tpl.body, { lead: sample, from, to }) + emailFooter({}, '') }
      : null;
    res.json({
      from: { id: from.id, name: from.full_name, email: from.email, is_active: from.is_active },
      to: to ? { id: to.id, name: to.full_name, email: to.email } : null,
      counts: { leads: book.leads.length, deals: book.deals.length, outreachSentBy: book.outreachSentByCount, clients: book.clients.length },
      clients: book.clients,
      template: tpl ? { code: tpl.code, subject: tpl.subject } : null,
      previewMail,
      checklist: to ? checklist(from, to) : [],
      mailConfigured: gmail.isConfigured(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// POST /api/admin/handover/run { from, to, notifyLeadIds: [], deactivate: true }
async function run(req, res) {
  try {
    const { from: fromId, to: toId, notifyLeadIds = [], deactivate = true } = req.body || {};
    if (!fromId || !toId || fromId === toId) return res.status(400).json({ error: 'from and to must be two different members' });
    const [from, to] = await Promise.all([profileById(fromId), profileById(toId)]);
    if (!from || !to) return res.status(404).json({ error: 'Member not found' });
    if (to.is_active === false) return res.status(400).json({ error: 'The successor must be an active member' });
    const actor = req.staffUser;
    const book = await loadBook(from.id);
    const nowIso = new Date().toISOString();

    // 1. Reassign ownership (leads, deals, and the outreach sender so follow-ups thread from the successor).
    const { error: r1 } = await supabase.from('leads').update({ assigned_to: to.id, last_activity_at: nowIso }).eq('assigned_to', from.id);
    if (r1) throw r1;
    const { error: r2 } = await supabase.from('leads').update({ outreach_sent_by: to.id }).eq('outreach_sent_by', from.id);
    if (r2) throw r2;
    const { error: r3 } = await supabase.from('deals').update({ assigned_to: to.id }).eq('assigned_to', from.id);
    if (r3) throw r3;
    for (const l of book.leads) {
      await logActivity({ action: 'lead_reassigned', entityType: 'lead', entityId: l.id, actorId: actor?.id, actorName: actor?.full_name || actor?.email, entityName: l.company_name, details: { from: from.email, to: to.email, reason: 'handover' } });
    }
    for (const d of book.deals) {
      await logActivity({ action: 'deal_reassigned', entityType: 'deal', entityId: d.id, actorId: actor?.id, actorName: actor?.full_name || actor?.email, details: { from: from.email, to: to.email, reason: 'handover' } });
    }

    // 2. Introduction emails from the successor's own mailbox.
    const sent = []; const skipped = [];
    const wanted = new Set(notifyLeadIds);
    const targets = book.clients.filter((c) => wanted.has(c.id));
    if (targets.length) {
      const { data: tpl } = await supabase.from('email_templates').select('subject, body').eq('code', TEMPLATE_CODE).eq('is_active', true).maybeSingle();
      if (!tpl) return res.status(400).json({ error: `Email template ${TEMPLATE_CODE} is missing or inactive` });
      if (!gmail.isConfigured()) return res.status(503).json({ error: 'Google Workspace sending is not configured on this server' });
      for (const c of targets) {
        const lead = book.leads.find((l) => l.id === c.id);
        const gate = emailAllowed(lead);
        if (!gate.ok) { skipped.push({ id: c.id, reason: gate.message }); continue; }
        try {
          const body = render(tpl.body, { lead, from, to }) + `\n\n${to.full_name || ''}\nStemfra\n${to.phone || ''} · ${to.email}`.replace(/\n +/g, '\n');
          const text = body + emailFooter(lead, body);
          await gmail.sendAsRep({ repEmail: to.email, repName: to.full_name, to: lead.email, subject: render(tpl.subject, { lead, from, to }), text });
          sent.push(c.id);
          await logActivity({ action: 'handover_intro_email', entityType: 'lead', entityId: lead.id, actorId: actor?.id, actorName: actor?.full_name || actor?.email, entityName: lead.company_name, details: { from: from.email, to: to.email, template: TEMPLATE_CODE } });
        } catch (e) {
          skipped.push({ id: c.id, reason: e.message });
        }
        await new Promise((r) => setTimeout(r, SEND_GAP_MS));
      }
    }

    // 3. Deactivate the leaver in the CRM (login gate reads is_active; presence off; lock PIN gone).
    if (deactivate) {
      await supabase.from('profiles').update({ is_active: false }).eq('id', from.id);
      await supabase.from('user_presence').update({ is_online: false, updated_at: nowIso }).eq('user_id', from.id);
      await supabase.from('staff_lock_pins').delete().eq('user_id', from.id);
    }

    res.json({
      ok: true,
      reassigned: { leads: book.leads.length, deals: book.deals.length, outreachSentBy: book.outreachSentByCount },
      emails: { sent: sent.length, skipped },
      deactivated: !!deactivate,
      checklist: checklist(from, to),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { preview, run, TEMPLATE_CODE, NOTIFY_STAGES };
