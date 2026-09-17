#!/usr/bin/env node
// One native lead-gen run from the command line, awaited to the end, with the
// per-candidate decisions printed. Default is a DRY RUN (scores, inserts nothing).
//   node scripts/leadgen-native-test.js --city Brooklyn --state "New York" --country US --vertical barbershop --max 10 [--apply]
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const supabase = require('../config/supabase');
const { startRun } = require('../lib/leadgenRun');

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
(async () => {
  const email = arg('as', 'peter@stemfra.com');
  const { data: user } = await supabase.from('profiles').select('id, email').eq('email', email).maybeSingle();
  if (!user) throw new Error(`no profile for ${email}`);
  const out = await startRun(user, {
    system: 'cold', engine: 'native', dry_run: !process.argv.includes('--apply'),
    vertical: arg('vertical', 'barbershop'), city: arg('city', 'Brooklyn'), state_name: arg('state', null),
    country: arg('country', 'US'), max_results: Number(arg('max', 10)), min_score: Number(arg('min', 7)),
  });
  console.log(out.status, out.json.message, '| run', out.runId);
  if (!out.done) return;
  const { message, summary } = await out.done;
  console.log('\n' + message + '\n');
  for (const d of summary.decisions || []) {
    console.log(`- [${d.stage}] ${d.name}: ${d.reason}` + (d.score != null ? ` | score ${d.score} (volume ${d.volume}, owner ${d.owner}, web ${d.web}) | ${d.reviews} reviews @ ${d.rating} | platform ${d.platform || 'none'}` : ''));
    if (d.why) console.log(`    why: ${d.why}`);
    if (d.draft) console.log(`    subject: ${d.subject}\n    draft: ${String(d.draft).replace(/\n/g, '\n           ')}`);
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
