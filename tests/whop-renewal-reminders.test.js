const { test } = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../config/supabase');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {} };
const { reminderDue, sweepOnce } = require('../lib/whop/renewalReminders');
const now = Date.now();
const sub = { provider: 'whop', status: 'active', current_period_end: new Date(now + 3 * 86400000).toISOString() };
test('renewal reminder follows provider date and skips cancellation, overdue and other providers', () => {
 assert.equal(reminderDue(sub, now), true);
 for (const patch of [{cancel_at_period_end:true},{provider:'airwallex'},{status:'past_due'},
 {current_period_end:new Date(now+4*86400000).toISOString()},
 {current_period_end:new Date(now+2*86400000).toISOString()}, {current_period_end:null}])
 assert.equal(reminderDue({...sub,...patch},now),false);
});
test('automatic renewal mail is off by default without database access', async () => {
 const old = process.env.WHOP_RENEWAL_REMINDERS_ENABLED;
 delete process.env.WHOP_RENEWAL_REMINDERS_ENABLED;
 try { assert.deepEqual(await sweepOnce({dryRun:false}), {skipped:'disabled'}); }
 finally { if(old!==undefined) process.env.WHOP_RENEWAL_REMINDERS_ENABLED=old; }
});
test('reminder sends once, excludes test sites and rechecks provider cancellation', async () => {
 const db=require('../config/supabase');
 const core=require('../lib/whop/core');
 const mailer=require('../lib/mailer');
 // Reload so the destructured mailer is the controlled test transport.
 let sends=0, testSite=false, canceled=false;
 const current={id:'sub',site_id:'site',...sub,currency:'USD',monthly_amount_cents:29900,metadata:{whop_membership_id:'mem_test'}};
 db.from=(table)=>{
  let patch, expected;
  const q={select(){return this},eq(k,v){if(k==='metadata')expected=JSON.parse(v);return this},update(v){patch=v;return this},
   async maybeSingle(){return {data:table==='sites'?{id:'site',subdomain:'example',metadata:{is_test:testSite},owner:{email:'owner@example.test'}}:{id:'binding'}}},
   then(resolve){if(patch){if(JSON.stringify(expected)!==JSON.stringify(current.metadata))return Promise.resolve({data:[]}).then(resolve);current.metadata=patch.metadata;return Promise.resolve({data:[{id:current.id}]}).then(resolve)}return Promise.resolve({data:[current]}).then(resolve)}};
  return q;
 };
 const oldConfig=core.config, oldSnapshot=core.snapshot, oldMail=mailer.sendMail;
 const envKeys=['WHOP_RENEWAL_REMINDERS_ENABLED','WHOP_SANDBOX','EMAIL_PROVIDER','RESEND_API_KEY'];
 const oldEnv=envKeys.map(k=>process.env[k]);
 try{
 Object.assign(process.env,{WHOP_RENEWAL_REMINDERS_ENABLED:'true',WHOP_SANDBOX:'false',EMAIL_PROVIDER:'resend',RESEND_API_KEY:'test'});
 core.config=()=>({});core.snapshot=async()=>({product:'website',status:'active',cancel_at_period_end:canceled,period_end:current.current_period_end});
 mailer.sendMail=async(message)=>{assert.match(message.text,/No manual payment/);assert.ok(message.idempotencyKey);sends++;return {ok:true}};
 delete require.cache[require.resolve('../lib/whop/renewalReminders')];const worker=require('../lib/whop/renewalReminders');
 testSite=true;await worker.sweepOnce({dryRun:false});assert.equal(sends,0);
 testSite=false;canceled=true;await worker.sweepOnce({dryRun:false});assert.equal(sends,0);
 canceled=false;await worker.sweepOnce({dryRun:false});assert.equal(sends,1);
 await worker.sweepOnce({dryRun:false});assert.equal(sends,1);
 }finally{core.config=oldConfig;core.snapshot=oldSnapshot;mailer.sendMail=oldMail;envKeys.forEach((k,i)=>{if(oldEnv[i]===undefined)delete process.env[k];else process.env[k]=oldEnv[i]});}
});
