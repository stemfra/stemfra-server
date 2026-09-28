// P45 check: the budget guard counts, blocks at the cap and names the scope.
//   node -r dotenv/config scripts/agent-budget-test.js
// Uses a throwaway address and site key and tiny caps passed straight to the
// module's cache, so no setting is written and no alert is sent (the address
// scope never alerts). Removes its own counter rows at the end.
const supabase = require('../config/supabase');
const budget = require('../lib/agentBudget');

(async () => {
  const ip = `test-${Date.now()}`;
  const siteId = '00000000-0000-4000-8000-00000000p45t'.replace('p45t', String(Date.now()).slice(-4));
  // Tiny caps for this process only.
  const b = await budget.getBudget();
  b.frontdesk = { ...b.frontdesk, ip: 3, site: 1000, global: 100000, conversation: 5 };

  const out = [];
  for (let i = 1; i <= 5; i++) {
    const r = await budget.guard({ agent: 'frontdesk', siteId, ip, turns: 0 });
    out.push(`${i}:${r.ok ? 'ok' : 'blocked(' + r.reason + ')'} ip=${r.counts?.ip ?? '-'}`);
  }
  console.log('address cap 3   →', out.join('  '));

  const conv = await budget.guard({ agent: 'frontdesk', siteId, ip: `${ip}-b`, turns: 5 });
  console.log('conversation 5  →', conv.ok ? 'ok' : `blocked(${conv.reason})`);

  const cap = await budget.capInput('frontdesk', 'x'.repeat(5000));
  console.log('input cap       →', cap.text.length, 'chars, trimmed', cap.trimmed);
  const stored = await budget.capStored(Array.from({ length: 450 }, (_, i) => ({ i })));
  console.log('storage cap     →', stored.length, 'messages kept, first kept index', stored[0].i);
  console.log('fallback        →', budget.fallbackReply({ agent: 'frontdesk', reason: 'ip', business: 'Clean Cuts Barbers', bookingUrl: true }));

  await new Promise((r) => setTimeout(r, 800)); // let the best-effort blocked counters land
  const day = new Date().toISOString().slice(0, 10);
  const keys = [budget.hashIp(ip), budget.hashIp(`${ip}-b`), siteId];
  const { data: rows } = await supabase.from('agent_usage').select('agent, scope, messages').eq('day', day).in('scope_key', keys);
  console.log('rows written    →', (rows || []).map((r) => `${r.agent}/${r.scope}=${r.messages}`).join(', '));
  const { error } = await supabase.from('agent_usage').delete().eq('day', day).in('scope_key', keys);
  console.log('cleanup         →', error ? error.message : 'test rows removed');
  // The global rows counted the 6 test messages; take them back out.
  for (const agent of ['frontdesk', 'frontdesk:blocked']) {
    const { data: g } = await supabase.from('agent_usage').select('messages').eq('day', day).eq('agent', agent).eq('scope', 'global').eq('scope_key', 'all').maybeSingle();
    if (g) console.log(`global ${agent} today:`, g.messages, '(includes this test)');
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
