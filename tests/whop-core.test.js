const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Webhook}=require('standardwebhooks');
const core=require('../lib/whop/core');
const now=new Date().toISOString(), end=new Date(Date.now()+86400000*30).toISOString();
function fixture(){
 const member={id:'mem_test',account:{id:'biz_test'},plan_id:'plan_test',metadata:{stemfra_order_id:'order',stemfra_product:'ai'},status:'active',billing_period_days:30,collection_method:'charge_automatically',renewal_price:{amount:'100.00',currency:'usd'},current_period_start:now,current_period_end:end,updated_at:now};
 const usd=amount=>({amount,currency:'usd'});
 const payment={id:'pay_test',account_id:'biz_test',plan_id:'plan_test',membership_id:'mem_test',status:'paid',substatus:'succeeded',subtotal:usd('100.00'),total:usd('107.00'),tax_amount:usd('7.00'),currency:'usd',paid_at:now,created_at:now,customer_email:'payer@example.test'};
 const cfg={account:'biz_test',sandbox:true,plans:{launch_starter:{plan:'plan_test',cents:10000,label:'Starter',credits:2000}},client:{payments:{retrieve:async()=>payment},memberships:{retrieve:async()=>member}}};
 return {member,payment,cfg};
}
test('native SDK money keeps gross tax and does not derive account identity from email',async()=>{
 const {cfg}=fixture(),s=await core.snapshot(cfg,{type:'payment.succeeded',data:{id:'pay_test'}});
 assert.equal(s.amount_cents,10700);assert.deepEqual(s.line_items.map(x=>x.cents),[10000,700]);assert.equal(s.order_id,'order');assert.equal(s.credits,2000);
});
test('wrong account, changed price and mismatched plans fail closed',async()=>{
 for(const change of [f=>f.payment.account_id='biz_other',f=>f.payment.subtotal.amount='1.00',f=>f.member.plan_id='plan_other']){
  const f=fixture();change(f);await assert.rejects(()=>core.snapshot(f.cfg,{type:'payment.succeeded',data:{id:'pay_test'}}));
 }
});
test('failed or refunded payment never grants paid state',async()=>{
 const f=fixture();f.payment.status='open';assert.equal((await core.snapshot(f.cfg,{type:'payment.failed',data:{id:'pay_test'}})).paid,false);
 f.payment.status='paid';f.payment.refunded_at=now;assert.equal((await core.snapshot(f.cfg,{type:'payment.succeeded',data:{id:'pay_test'}})).paid,false);
});
test('official verifier rejects tampering and stale signed bodies',()=>{
 const key='ws_test_secret',body=JSON.stringify({type:'payment.succeeded',data:{id:'pay_test'}}),id='delivery',date=new Date();
 const signer=new Webhook(Buffer.from(key).toString('base64'));
 const headers={'webhook-id':id,'webhook-timestamp':String(Math.floor(date.getTime()/1000)),'webhook-signature':signer.sign(id,date,body)};
 assert.equal(core.verify(body,headers,{secret:key}).type,'payment.succeeded');
 assert.throws(()=>core.verify(body+' ',headers,{secret:key}));
 const old=new Date(Date.now()-3600000);headers['webhook-timestamp']=String(Math.floor(old.getTime()/1000));headers['webhook-signature']=signer.sign(id,old,body);
 assert.throws(()=>core.verify(body,headers,{secret:key}));
});
test('checkout returns only a Whop HTTPS URL and sends server-owned metadata',async()=>{
 let args;
 const cfg={account:'biz_test',sandbox:true,plans:{launch_starter:{plan:'plan_test'}},client:{checkoutConfigurations:{create:async(...a)=>{args=a;return {id:'ch_test',purchase_url:'https://sandbox.whop.com/checkout/ch_test'};}}}};
 const result=await core.checkout(cfg,{id:'internal',plan_key:'launch_starter',product:'ai'},'https://ai.stemfra.com/app/billing');
 assert.equal(args[0].metadata.stemfra_order_id,'internal');assert.equal(args[1].idempotencyKey,'stemfra-checkout-internal');assert.match(result.url,/sandbox.whop.com/);
 cfg.client.checkoutConfigurations.create=async()=>({purchase_url:'https://evil.test/'});await assert.rejects(()=>core.checkout(cfg,{id:'x',plan_key:'launch_starter',product:'ai'},'https://ai.stemfra.com'));
});
test('sandbox never uses live product IDs by default',()=>{
 const cfg=core.config({WHOP_ENABLED:'true',WHOP_API_KEY:'test',WHOP_ACCOUNT_ID:'biz_test',WHOP_WEBHOOK_SECRET:'ws_test'});
 assert.equal(cfg.plans.launch_starter.plan,'');assert.equal(core.safeUrl('https://whop.com.evil.test/'),null);
});

for (const path of ['../lib/whop/core', '../../stemfra_ai/packages/server/src/whop/core.cjs']) {
 test(`${path}: cancellation preserves paid period, retries safely and reverses`, async () => {
  const adapter = require(path), f = fixture(); let calls = 0;
  f.cfg.client.memberships.update = async args => { calls++; assert.equal(args.id, f.member.id); f.member.cancel_at_period_end = args.cancel_at_period_end; };
  const result = await adapter.setCancellation(f.cfg, f.member.id, true, 'ai');
  assert.equal(result.cancel_at_period_end, true); assert.equal(result.period_end, end);
  await adapter.setCancellation(f.cfg, f.member.id, true, 'ai'); assert.equal(calls, 1);
  await adapter.setCancellation(f.cfg, f.member.id, false, 'ai'); assert.equal(calls, 2);
 });
 test(`${path}: rejects wrong account/product, expired period and unconfirmed provider change`, async () => {
  const adapter = require(path);
  for (const change of [f=>f.member.account.id='other', f=>f.member.current_period_end='2020-01-01', f=>f.member.status='expired']) {
   const f=fixture(); let called=false; f.cfg.client.memberships.update=async()=>{called=true;}; change(f);
   await assert.rejects(()=>adapter.setCancellation(f.cfg,f.member.id,true,'ai')); assert.equal(called,false);
  }
  const f=fixture(); f.cfg.client.memberships.update=async()=>{};
  await assert.rejects(()=>adapter.setCancellation(f.cfg,f.member.id,true,'website'));
  await assert.rejects(()=>adapter.setCancellation(f.cfg,f.member.id,true,'ai'),/not_confirmed/);
 });
}

test('only a verified declined first checkout tolerates a missing membership', async()=>{
 const f=fixture();Object.assign(f.payment,{status:'open',substatus:'failed',billing_reason:'subscription_create',checkout_configuration_id:'ch_test',metadata:{stemfra_product:'ai',stemfra_order_id:'order'}});
 f.cfg.client.memberships.retrieve=async()=>{throw Object.assign(new Error('missing'),{statusCode:404});};
 const event={type:'payment.failed',data:{id:'pay_test'}};
 assert.equal((await core.snapshot(f.cfg,event)).initial_failure,true);
 for(const patch of [{billing_reason:'subscription_cycle'},{status:'paid'},{account_id:'other'}]){
  const previous={...f.payment};Object.assign(f.payment,patch);await assert.rejects(()=>core.snapshot(f.cfg,event));Object.assign(f.payment,previous);
 }
 f.cfg.client.memberships.retrieve=async()=>{throw Object.assign(new Error('unavailable'),{statusCode:503});};
 await assert.rejects(()=>core.snapshot(f.cfg,event));
});

test('website regional snapshots retain exact currency and gross tax',async()=>{
 for(const currency of ['USD','CAD','GBP','KES']){
  const offer=require('../lib/whop/websitePrices').price(currency),f=fixture(),money=cents=>({amount:(cents/100).toFixed(2),currency:currency.toLowerCase()});
  f.member.metadata.stemfra_product='website';f.member.renewal_price=money(offer.cents);f.cfg.plans={[offer.key]:{...offer,plan:'plan_test'}};
  Object.assign(f.payment,{currency:currency.toLowerCase(),subtotal:money(offer.cents),tax_amount:money(100),total:money(offer.cents+100)});
  const result=await core.snapshot(f.cfg,{type:'payment.succeeded',data:{id:'pay_test'}});assert.equal(result.currency,currency);assert.equal(result.amount_cents,offer.cents+100);
  f.payment.total.currency='jpy';await assert.rejects(()=>core.snapshot(f.cfg,{type:'payment.succeeded',data:{id:'pay_test'}}));
 }
});
