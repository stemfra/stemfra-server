// Agent budgets (P45, 2026-09-28): the spending ceiling for every AI agent.
//
// Under the commission model no tenant pays for usage, so an abused chat is
// Stemfra's cost. The per-minute limiters slow a caller down; this module
// decides when an agent stops calling the model for the day:
//
//   conversation  one chat may hold N visitor messages
//   ip            one visitor address may send N messages a day (per agent)
//   site          one tenant site may receive N messages a day
//   owner         one CMS owner may send Stacy N messages a day
//   global        the whole agent stops at N messages a day and staff are told
//
// Counters live in `agent_usage` (migration agent_usage_v1), bumped through
// the `agent_usage_bump` function, one round trip per message. Caps come from
// crm_settings key `agent_budget` (staff-tunable, re-read every minute) over
// the defaults below. A visitor address is stored as a salted hash, never raw.
//
// A blocked message is still ANSWERED: the caller gets `fallbackReply`, which
// points at the phone, the booking page or the contact form, so a real visitor
// who arrives during an attack is still served. The model is simply not called.
//
// If the counter cannot be read (database down), the guard lets the message
// through: the per-minute limiter still applies, and a chat that refuses every
// visitor because of our own outage is the worse failure.
const crypto = require('crypto');
const supabase = require('../config/supabase');

const DEFAULTS = {
  enabled: true,
  frontdesk: { conversation: 40, ip: 150, site: 300, global: 3000, max_chars: 1000 },
  concierge: { conversation: 40, ip: 100, global: 1500, max_chars: 1000 },
  stacy: { conversation: 120, owner: 200, site: 300, global: 2000, max_chars: 4000 },
  stored_messages: 200, // the most messages one conversation keeps in the database
};

let cache = { at: 0, value: DEFAULTS };
async function getBudget() {
  if (Date.now() - cache.at < 60_000) return cache.value;
  let value = DEFAULTS;
  try {
    const { data } = await supabase.from('crm_settings').select('value').eq('key', 'agent_budget').maybeSingle();
    const v = data?.value && typeof data.value === 'object' ? data.value : {};
    value = {
      ...DEFAULTS, ...v,
      frontdesk: { ...DEFAULTS.frontdesk, ...(v.frontdesk || {}) },
      concierge: { ...DEFAULTS.concierge, ...(v.concierge || {}) },
      stacy: { ...DEFAULTS.stacy, ...(v.stacy || {}) },
    };
  } catch (e) {
    console.error('[agentBudget] settings read failed, using defaults:', e.message);
  }
  cache = { at: Date.now(), value };
  return value;
}

const SALT = process.env.AGENT_USAGE_SALT || process.env.N8N_WEBHOOK_SECRET || 'stemfra-agent-usage';
const hashIp = (ip) => crypto.createHash('sha256').update(`${SALT}|${ip}`).digest('hex').slice(0, 32);

/** Trim a message to the agent's input cap. Returns { text, trimmed }. */
async function capInput(agent, message) {
  const b = await getBudget();
  const max = Number(b[agent]?.max_chars) || 1000;
  const text = String(message || '').trim();
  return text.length > max ? { text: text.slice(0, max), trimmed: true } : { text, trimmed: false };
}

/** The most recent `stored_messages` of a conversation (storage cap). */
async function capStored(messages) {
  const b = await getBudget();
  const max = Number(b.stored_messages) || 200;
  return Array.isArray(messages) && messages.length > max ? messages.slice(-max) : messages;
}

/**
 * Count this message and say whether the model may be called.
 * @param {object} a
 * @param {'frontdesk'|'concierge'|'stacy'} a.agent
 * @param {string} [a.siteId]
 * @param {string} [a.ip]        the caller's address (lib/clientIp)
 * @param {string} [a.ownerId]   the CMS owner's auth user id (Stacy)
 * @param {number} [a.turns]     visitor messages already in this conversation
 * @returns {Promise<{ok:boolean, reason?:string, counts?:object}>}
 */
async function guard({ agent, siteId, ip, ownerId, turns = 0 }) {
  const b = await getBudget();
  if (b.enabled === false) return { ok: true };
  const caps = b[agent] || {};

  if (caps.conversation && turns >= caps.conversation) {
    noteBlocked(agent, 'global', 'all');
    return { ok: false, reason: 'conversation' };
  }

  const scopes = [{ scope: 'global', key: 'all' }];
  if (siteId && caps.site) scopes.push({ scope: 'site', key: String(siteId) });
  if (ip && caps.ip) scopes.push({ scope: 'ip', key: hashIp(ip) });
  if (ownerId && caps.owner) scopes.push({ scope: 'owner', key: String(ownerId) });

  let counts;
  try {
    const { data, error } = await supabase.rpc('agent_usage_bump', { p_agent: agent, p_scopes: scopes });
    if (error) throw new Error(error.message);
    counts = data || {};
  } catch (e) {
    console.error(`[agentBudget] ${agent} counter failed, letting the message through:`, e.message);
    return { ok: true };
  }

  // Narrowest scope first, so the reason names what actually ran out.
  for (const scope of ['ip', 'owner', 'site', 'global']) {
    const cap = Number(caps[scope]);
    if (cap && Number(counts[scope]) > cap) {
      const key = scopes.find((s) => s.scope === scope)?.key;
      noteBlocked(agent, scope, key);
      if (scope === 'global' || scope === 'site') alertOnce(agent, scope, key, counts[scope], cap).catch(() => {});
      return { ok: false, reason: scope, counts };
    }
  }
  return { ok: true, counts };
}

// Best effort: how many messages were refused (the size of an attack).
// Rows with agent "<agent>:blocked" count the refusals per scope.
function noteBlocked(agent, scope, key) {
  if (!key) return;
  supabase.rpc('agent_usage_bump', { p_agent: `${agent}:blocked`, p_scopes: [{ scope, key }] })
    .then(({ error }) => { if (error) console.error('[agentBudget] blocked counter:', error.message); })
    .catch(() => {});
}

// One alert per agent + scope + key per day: a bell for every admin and an
// email to the notify address. The row's alerted_at is the latch.
async function alertOnce(agent, scope, key, count, cap) {
  const day = new Date().toISOString().slice(0, 10);
  const { data: latched } = await supabase.from('agent_usage')
    .update({ alerted_at: new Date().toISOString() })
    .eq('day', day).eq('agent', agent).eq('scope', scope).eq('scope_key', key).is('alerted_at', null)
    .select('day');
  if (!latched || !latched.length) return; // already alerted today

  let where = 'across all sites';
  if (scope === 'site') {
    const { data: site } = await supabase.from('sites').select('subdomain, company:companies(name)').eq('id', key).maybeSingle();
    where = `on ${site?.company?.name || site?.subdomain || key}`;
  }
  const label = { frontdesk: 'Front desk chat', concierge: 'Concierge chat', stacy: 'Stacy' }[agent] || agent;
  const title = `${label} hit its daily cap ${where}`;
  const body = `${count} messages today, cap ${cap}. The agent now answers with the contact path instead of calling the model until midnight UTC. If this is real demand, raise the cap in crm_settings.agent_budget; if it is abuse, the counters in agent_usage show the size.`;
  console.warn(`[agentBudget] ${title}: ${count}/${cap}`);

  try {
    const { data: admins } = await supabase.from('profiles').select('id').in('role', ['super_admin', 'admin']).eq('is_active', true);
    for (const a of admins || []) {
      await supabase.rpc('crm_notify', {
        p_user: a.id, p_kind: 'agent_budget', p_title: title, p_body: body,
        p_route: '/settings', p_entity_type: 'agent_usage', p_entity_id: `${day}:${agent}:${scope}`,
      });
    }
  } catch (e) { console.error('[agentBudget] bell failed:', e.message); }

  try {
    const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER;
    if (to) {
      const { sendMail } = require('./mailer');
      await sendMail({ fromName: 'Stemfra alerts', to, subject: title, text: body, html: `<p>${body}</p>` });
    }
  } catch (e) { console.error('[agentBudget] email failed:', e.message); }
}

/**
 * What the visitor reads when the model is not called. Plain, useful, and
 * never an error: it names the ways to reach the business.
 */
function fallbackReply({ agent, reason, business, phone, bookingUrl } = {}) {
  if (agent === 'stacy') {
    return reason === 'conversation'
      ? 'This chat has reached its length limit. Start a new chat from the three dots above and I will pick up from there.'
      : 'You have reached today’s limit for questions to me. It resets at midnight UTC. The Docs link in the top bar and the Support page still work, and a person at Stemfra can help on the phone.';
  }
  if (agent === 'concierge') {
    return reason === 'conversation'
      ? 'We have covered a lot here. To keep going, start for free at stemfra.com/start, or book a call with us from the Contact page.'
      : 'Our chat is busy right now. You can start for free at stemfra.com/start, or reach a person through the Contact page.';
  }
  const name = business || 'us';
  const ways = [phone ? `call ${phone}` : null, bookingUrl ? 'use the Book button on this page' : null, 'send a message from the Contact page'].filter(Boolean);
  const list = ways.length > 1 ? `${ways.slice(0, -1).join(', ')} or ${ways[ways.length - 1]}` : ways[0];
  return reason === 'conversation'
    ? `We have covered a lot in this chat. To go further with ${name}, you can ${list}.`
    : `The chat is taking a short break. To reach ${name} now, you can ${list}.`;
}

module.exports = { guard, capInput, capStored, fallbackReply, getBudget, hashIp, DEFAULTS };
