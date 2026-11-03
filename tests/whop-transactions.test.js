const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const {PGlite}=require('@electric-sql/pglite');
const root=path.resolve(__dirname,'../..');
const tenant='11111111-1111-4111-8111-111111111111', user='22222222-2222-4222-8222-222222222222';
async function setup(ai){
 const db=new PGlite();const s=ai?'stemfra_ai':'public',t=ai?'tenant_id':'site_id';
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create role stemfra_ai_runtime;
 ${ai?'create schema stemfra_ai;':''}
 create table ${s}.${ai?'tenants':'sites'}(id uuid primary key);
 insert into ${s}.${ai?'tenants':'sites'} values('${tenant}');
 create table ${s}.${ai?'billing_subscriptions':'subscriptions'}(id uuid primary key default gen_random_uuid(),${t} uuid unique,provider text,status text,currency text,started_at timestamptz,current_period_end timestamptz,cancel_at_period_end boolean,canceled_at timestamptz,metadata jsonb,${ai?'plan_key text,plan_label text,amount_cents integer,billing_interval text':'build_amount_cents integer,monthly_amount_cents integer'});
 create table ${s}.billing_charges(id uuid primary key default gen_random_uuid(),${t} uuid,subscription_id uuid,kind text,line_items jsonb,amount_cents integer,currency text,status text,paid_at timestamptz,period_start date,period_end date,metadata jsonb${ai?'':',provider text'});
 `);
 if(!ai) await db.exec(`
 create type public.subscription_status as enum ('pending','active','past_due','canceled','expired','renewal_due');
 alter table public.subscriptions alter column status type public.subscription_status using status::public.subscription_status;
 alter table public.subscriptions add constraint subscriptions_provider_chk
 check (provider in ('airwallex','payoneer','stripe','lemonsqueezy','paddle','manual'));
 `);
 if(ai){
 await db.exec(`create table stemfra_ai.credit_wallets(tenant_id uuid primary key,plan_credits integer not null default 0,topup_credits integer not null default 0,low_notified_at timestamptz);
 create table stemfra_ai.credit_ledger(id uuid primary key default gen_random_uuid(),tenant_id uuid,kind text,ref text,job_key text,plan_delta integer,topup_delta integer,metadata jsonb,unique(tenant_id,kind,ref));`);
 const credits=fs.readFileSync(path.join(root,'stemfra_ai/db/migrations/0021_credits.sql'),'utf8');
 await db.exec(credits.slice(credits.indexOf('create or replace function stemfra_ai.grant_credits('),credits.indexOf('-- ─── charge_credits')));
 }
 await db.exec(fs.readFileSync(path.join(root,ai?'stemfra_ai/db/migrations/0027_whop_billing.sql':'stemfra_server/docs/migrations/whop_billing_v1.sql'),'utf8'));
 if(!ai){
 await db.exec(`alter table public.billing_charges add column due_date date;
 create table public.contacts(id uuid primary key,first_name text,last_name text,country text,state text,email text,billing_profile jsonb);
 create table public.companies(id uuid primary key,billing_profile jsonb);
 alter table public.sites add column owner_contact_id uuid,add column company_id uuid;
 insert into public.contacts values('${user}','Test','Owner','United States','NY','owner@example.test','{"line1":"Original Street","city":"New York","postal_code":"10001"}');
 update public.sites set owner_contact_id='${user}';`);
 await db.exec(fs.readFileSync(path.join(root,'stemfra_server/docs/migrations/20261102145423_whop_invoice_snapshots.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(root,'stemfra_server/docs/migrations/20261102163000_whop_saved_cards.sql'),'utf8'));
 await db.exec(`alter table public.sites add column status text default 'live',add column metadata jsonb default '{"is_test":true}',add column deleted_at timestamptz;`);
 await db.exec(fs.readFileSync(path.join(root,'stemfra_server/docs/migrations/20261102_whop_access_lifecycle.sql'),'utf8'));
 }
 if(!ai){await db.exec('create table public.whop_webhook_inbox(id uuid primary key)');await db.exec(fs.readFileSync(path.join(root,'stemfra_server/docs/migrations/20261102200000_whop_regional_prices.sql'),'utf8'));await db.exec(fs.readFileSync(path.join(root,'stemfra_server/docs/migrations/20261102201000_whop_financial_state.sql'),'utf8'));}
 const key=ai?'launch_starter':'managed_website';const product=ai?'ai':'website';
 const prep=await db.query(`select ${s}.whop_prepare_checkout($1,$2,$3,'plan_test',$4,true,'owner@example.test') as i`,[tenant,user,key,product]);
 const i=prep.rows[0].i;
 await db.query(`update ${s}.whop_checkout_intents set checkout_id='ch_test' where id=$1`,[i.id]);
 const start=new Date(Date.now()-60000).toISOString(),end=new Date(Date.now()+86400000*30).toISOString();
 const snapshot={currency:'USD',order_id:i.id,product,plan_key:key,plan_id:'plan_test',label:ai?'Starter':'Managed website',monthly_cents:ai?10000:29900,credits:ai?2000:0,membership_id:'mem_test',checkout_id:'ch_test',payment_id:'pay_first',paid:true,amount_cents:ai?10000:29900,line_items:[{label:'Subscription',cents:ai?10000:29900}],paid_at:new Date().toISOString(),payment_created_at:new Date().toISOString(),period_start:start,period_end:end,updated_at:start,status:'active',cancel_at_period_end:false,manage_url:'https://whop.com/@me/settings/orders/'};
 const apply=(id,m=snapshot)=>db.query(`select ${s}.whop_reconcile($1,'payment.succeeded',$2::jsonb,true) as result`,[id,JSON.stringify(m)]);
 return {db,s,t,key,product,snapshot,apply};
}
for(const ai of [false,true])test(`${ai?'AI':'CMS'} transaction is atomic, replay-safe and preserves current membership`,async()=>{
 const f=await setup(ai);const {db,s,snapshot,apply}=f;
 try{
  await assert.rejects(()=>apply('bad',{...snapshot,plan_id:'plan_other'}));
  assert.equal((await db.query(`select count(*)::int as n from ${s}.whop_events`)).rows[0].n,0);
  await apply('first');
  if(!ai) await db.exec(`update public.contacts set billing_profile='{"line1":"Changed Street"}'`);
  await apply('first');await apply('redelivery');
  if(!ai){
   const invoice=(await db.query(`select metadata,due_date::text from public.billing_charges`)).rows[0];
   assert.equal(invoice.metadata.billing_snapshot.profile.line1,'Original Street');
   assert.equal(invoice.due_date,snapshot.paid_at.slice(0,10));
   assert.equal(invoice.metadata.invoice_issued_at,snapshot.paid_at);
  }
  await db.exec('set role anon');
  await assert.rejects(()=>db.query(`select * from ${s}.whop_checkout_intents`));
  await assert.rejects(()=>db.query(`select ${s}.whop_claim_receipt()`));
  await db.exec('reset role');
  assert.equal((await db.query(`select count(*)::int as n from ${s}.billing_charges`)).rows[0].n,1);
  assert.equal((await db.query(`select count(*)::int as n from ${s}.whop_receipt_outbox`)).rows[0].n,1);
  await assert.rejects(()=>db.query(`select ${s}.whop_prepare_checkout($1,$2,$3,'plan_test',$4,true,'owner@example.test')`,[tenant,user,f.key,f.product]));
  const futureStart=new Date(Date.now()-30000).toISOString(),futureEnd=new Date(Date.now()+86400000*60).toISOString();
  const claim=await db.query(`select ${s}.whop_claim_receipt() as id`);assert.ok(claim.rows[0].id);
  assert.equal((await db.query(`select ${s}.whop_claim_receipt() as id`)).rows[0].id,null);
  if(ai)await db.query(`update ${s}.credit_wallets set plan_credits=123,topup_credits=88 where tenant_id=$1`,[tenant]);
  const renewal={...snapshot,payment_id:'pay_renewal',checkout_id:null,period_start:futureStart,period_end:futureEnd,updated_at:futureStart,payment_created_at:futureStart,paid_at:futureStart};
  await apply('renewal',renewal);await apply('renewal-again',renewal);
  await apply('old-delivery',{...snapshot,payment_id:'pay_old'});
  assert.equal(Date.parse((await db.query(`select current_period_end::text as ending from ${s}.${ai?'billing_subscriptions':'subscriptions'}`)).rows[0].ending),Date.parse(futureEnd));
  if(ai){const w=(await db.query(`select * from ${s}.credit_wallets`)).rows[0];assert.equal(w.plan_credits,2000);assert.equal(w.topup_credits,88);
    await db.query(`update ${s}.billing_subscriptions set current_period_end=now()-interval '1 second' where tenant_id=$1`,[tenant]);
    assert.equal((await db.query(`select ${s}.charge_credits($1,'standard_reply',1,'expired-access') as result`,[tenant])).rows[0].result,'inactive');
  }
  await apply('cancel',{...renewal,paid:false,payment_id:null,status:'cancelled',updated_at:new Date(Date.now()+86400000*31).toISOString()});
  assert.equal((await db.query(`select status from ${s}.${ai?'billing_subscriptions':'subscriptions'}`)).rows[0].status,ai?'cancelled':'canceled');
 }finally{await db.close();}
});

test('saved-card binding rejects another member/method and accepts renewal card changes',async()=>{
 const {db,snapshot,apply}=await setup(false);
 try {
  await db.exec("update public.whop_checkout_intents set checkout_id=null,acquisition_mode='saved_card',member_id='mber_owner',payment_method_id='payt_owner'");
  const direct={...snapshot,checkout_id:null,member_id:'mber_owner',payment_method_id:'payt_owner'};
  await assert.rejects(()=>apply('wrong-member',{...direct,member_id:'mber_other'}));
  await assert.rejects(()=>apply('wrong-card',{...direct,payment_method_id:'payt_other'}));
  await apply('direct',direct);await apply('direct-again',direct);
  assert.equal((await db.query('select count(*)::int as n from public.billing_charges')).rows[0].n,1);
  await apply('renewed-card',{...direct,payment_id:'pay_new_card',payment_method_id:'payt_replacement'});
  assert.equal((await db.query('select count(*)::int as n from public.billing_charges')).rows[0].n,2);
 }finally{await db.close();}
});

test('website payment failure, recovery and stale failure preserve paid accounting',async()=>{
 const {db,snapshot,apply}=await setup(false);
 try{
 const failure={...snapshot,paid:false,amount_cents:0,line_items:[],paid_at:null,status:'past_due'};
 await apply('first-failure',failure);
 assert.equal((await db.query('select count(*)::int n from public.subscriptions')).rows[0].n,0);
 assert.equal((await db.query('select count(*)::int n from public.billing_charges')).rows[0].n,0);
 assert.equal((await db.query('select state from public.whop_checkout_intents')).rows[0].state,'pending');
 await apply('first-recovery',snapshot);
 const failedAt=new Date(Date.now()+1000).toISOString();
 await apply('renewal-failure',{...failure,payment_id:'pay_failed',updated_at:failedAt});
 assert.equal((await db.query('select status from public.subscriptions')).rows[0].status,'past_due');
 assert.equal((await db.query('select count(*)::int n from public.billing_charges')).rows[0].n,1);
 const recovery={...snapshot,payment_id:'pay_recovery',updated_at:new Date(Date.now()+2000).toISOString()};
 await apply('renewal-recovery',recovery);await apply('renewal-replay',recovery);
 await apply('stale-failure',{...failure,payment_id:'pay_failed',updated_at:failedAt});
 assert.equal((await db.query('select status from public.subscriptions')).rows[0].status,'active');
 assert.equal((await db.query('select count(*)::int n from public.billing_charges')).rows[0].n,2);
 }finally{await db.close();}
});

test('site access grace, suspension, recovery and account bindings are atomic',async()=>{
 const {db,snapshot,apply}=await setup(false);
 try {
 await apply('paid-access');
 const access=()=>db.query(`select public.whop_apply_site_access($1,'mem_test',$2,true) result`,[tenant,snapshot.updated_at]);
 const status=async()=>(await db.query('select status from public.sites')).rows[0].status;
 await db.query(`update public.subscriptions set status='past_due',metadata=metadata||jsonb_build_object('whop_paid_through',now()-interval '6 days')`);
 await access();assert.equal(await status(),'live');
 await db.query(`update public.subscriptions set metadata=metadata||jsonb_build_object('whop_paid_through',now()-interval '7 days 1 second')`);
 assert.equal((await access()).rows[0].result.action,'suspended');assert.equal(await status(),'suspended');
 // Repeat is harmless, and stale provider snapshots cannot mutate status.
 assert.equal((await access()).rows[0].result.action,'unchanged');
 assert.equal((await db.query(`select public.whop_apply_site_access($1,'mem_wrong',$2,true) result`,[tenant,snapshot.updated_at])).rows[0].result.action,'stale_or_unbound');
 await db.query(`update public.subscriptions set status='active',metadata=metadata||jsonb_build_object('whop_paid_through',now()+interval '30 days')`);
 assert.equal((await access()).rows[0].result.action,'restored');assert.equal(await status(),'live');
 // Scheduled cancellation gets no seven-day extension.
 await db.query(`update public.subscriptions set cancel_at_period_end=true,metadata=metadata||jsonb_build_object('whop_paid_through',now()-interval '1 second')`);
 assert.equal((await access()).rows[0].result.action,'suspended');
 // A staff/manual suspension is never automatically undone.
 await db.query(`update public.sites set metadata=metadata-'whop_access'`);
 await db.query(`update public.subscriptions set cancel_at_period_end=false,metadata=metadata||jsonb_build_object('whop_paid_through',now()+interval '30 days')`);
 assert.equal((await access()).rows[0].result.action,'unchanged');assert.equal(await status(),'suspended');
 // Environment mismatch and real/demo sites cannot be touched by sandbox worker.
 assert.equal((await db.query(`select public.whop_apply_site_access($1,'mem_test',$2,false) result`,[tenant,snapshot.updated_at])).rows[0].result.action,'unbound');
 await db.query(`update public.sites set metadata='{}'`);
 assert.equal((await access()).rows[0].result.action,'excluded');
 }finally{await db.close();}
});

test('CMS regional prices bind currency and preserve provider financial history',async()=>{
 const {db,snapshot,apply}=await setup(false);
 try{
  await assert.rejects(()=>apply('wrong-currency',{...snapshot,currency:'CAD',monthly_cents:40000}));
  for(const [currency,key,cents]of [['CAD','managed_website_cad',40000],['GBP','managed_website_gbp',22500],['KES','managed_website_kes',3000000]]){
   await db.query('update public.whop_checkout_intents set plan_key=$1',[key]);
   const m={...snapshot,plan_key:key,currency,monthly_cents:cents,amount_cents:cents,payment_id:`pay_${currency}`};
   await apply(`regional-${currency}`,m);
   const sub=(await db.query('select currency,monthly_amount_cents from public.subscriptions')).rows[0];
   assert.equal(sub.currency,currency);assert.equal(sub.monthly_amount_cents,cents);
   const charge=(await db.query('select id,currency from public.billing_charges where metadata->>\'whop_payment_id\'=$1',[m.payment_id])).rows[0];
   assert.equal(charge.currency,currency);
   await db.query('select public.whop_record_financial_state($1,$2,$3)',[charge.id,`refund-${currency}`,JSON.stringify({updated_at:'2026-11-02T22:00:00Z',substatus:'refunded',refund_review:true})]);
   await db.query('select public.whop_record_financial_state($1,$2,$3)',[charge.id,`stale-${currency}`,JSON.stringify({updated_at:'2026-11-02T21:00:00Z',substatus:'succeeded'})]);
   const after=(await db.query('select status,metadata from public.billing_charges where id=$1',[charge.id])).rows[0];assert.equal(after.status,'paid');assert.equal(after.metadata.whop_financial.substatus,'refunded');
  }
 }finally{await db.close();}
});
