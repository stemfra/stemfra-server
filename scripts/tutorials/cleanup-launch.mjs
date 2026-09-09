// Targeted cleanup for the tutorial launch set (videos 28 to 31): removes ONLY
// the account the recorder signed up as LAUNCH_EMAIL (its sites, media, host,
// company when orphaned, contact, auth user, legal acceptances). Deliberately
// NOT scripts/cleanup-test-data.js, which purges EVERY test-flagged site and
// would take Peter's standing Clean Cuts test tenant with it.
//   node -r dotenv/config scripts/tutorials/cleanup-launch.mjs          # dry run
//   node -r dotenv/config scripts/tutorials/cleanup-launch.mjs --apply
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const supabase = require('../../config/supabase');
const { hardPurgeSite } = require('../../lib/siteDeletion');
const { detachSiteDomain } = require('../../lib/attachSiteDomain');

const email = (process.env.LAUNCH_EMAIL || '').trim().toLowerCase();
if (!email) { console.error('LAUNCH_EMAIL is not set'); process.exit(1); }
const apply = process.argv.includes('--apply');

const { data: contacts } = await supabase.from('contacts').select('id, email, auth_user_id').ilike('email', email);
const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000 });
const authUsers = (users?.users || []).filter((u) => (u.email || '').toLowerCase() === email);
const contactIds = (contacts || []).map((c) => c.id);
const { data: sites } = contactIds.length
  ? await supabase.from('sites').select('id, subdomain, status, metadata, company:companies(name)').in('owner_contact_id', contactIds).is('deleted_at', null)
  : { data: [] };

console.log(apply ? 'APPLY' : 'DRY RUN (add --apply)', `for ${email}`);
console.log(`contacts: ${contactIds.length}, auth users: ${authUsers.length}, sites: ${(sites || []).length}`);
for (const s of sites || []) console.log(`  - ${s.subdomain} (${s.status}) ${s.company?.name || ''} test=${s.metadata?.is_test === true}`);
if (!apply) process.exit(0);

for (const s of sites || []) {
  try { await detachSiteDomain(s.id); } catch (e) { console.log('  detach:', e.message); }
  try { await hardPurgeSite(s.id); console.log(`  purged ${s.subdomain}`); } catch (e) { console.log('  purge:', e.message); }
}
for (const c of contacts || []) {
  const { count } = await supabase.from('sites').select('id', { count: 'exact', head: true }).eq('owner_contact_id', c.id);
  if (count) { console.log(`  contact ${c.id} kept (owns ${count} site(s))`); continue; }
  const { error } = await supabase.from('contacts').delete().eq('id', c.id);
  console.log(`  contact ${c.id} ${error ? error.message : 'deleted'}`);
}
for (const u of authUsers) {
  const { error } = await supabase.auth.admin.deleteUser(u.id);
  console.log(`  auth user ${u.id} ${error ? error.message : 'deleted'}`);
}
const { error: laErr, count } = await supabase.from('legal_acceptances').delete({ count: 'exact' }).ilike('email', email);
console.log(`  legal acceptances ${laErr ? laErr.message : `${count ?? 0} deleted`}`);
console.log('done');
