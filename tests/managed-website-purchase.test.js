const test = require('node:test');
const assert = require('node:assert/strict');
const { createService, digest } = require('../lib/managedWebsitePurchase');
function fixture(options = {}) {
  const rows = new Map(), calls = { onboard: 0, mail: 0, reconcile: 0 };
  function from(table) {
    let filters = [], patch, insert, one = false;
    const q = {
      select() { return q; }, eq(k,v) { filters.push(r=>r[k]===v); return q; },
      in(k,v) { filters.push(r=>v.includes(r[k])); return q; },
      or() { filters.push(r=>!r.otp_sent_at || Date.parse(r.otp_sent_at)<Date.now()-60000); return q; },
      insert(r) { insert=r; return q; }, upsert(r) { insert=r; return q; },
      update(p) { patch=p; return q; }, maybeSingle() { one=true; return q; }, single() { one=true; return q; },
      then(resolve,reject) { return Promise.resolve().then(()=>{
        if (table!=='managed_website_purchases') return {data:null,error:null};
        if(insert) { rows.set(insert.id,{state:'pending',...insert}); return {data:null,error:null}; }
        const matches=[...rows.values()].filter(r=>filters.every(f=>f(r)));
        if(patch) matches.forEach(r=>Object.assign(r,patch));
        return {data:one?matches[0]||null:matches,error:null};
      }).then(resolve,reject); }
    }; return q;
  }
  const cfg={sandbox:true,plans:{kenya:{plan:'plan_kenya',currency:'KES',cents:3000000}}};
  let snapshot;
  const db={from,rpc:async(name)=>{if(name==='paid_website_provisioning_ready')return options.missingReady ? {data:null,error:{code:'42883'}} : {data:true,error:null};calls.reconcile++;return {error:null};},auth:{admin:{
    createUser:async()=>({data:{user:{id:'owner'}},error:null}),
    generateLink:async()=>({data:{user:{id:'owner'},properties:{email_otp:'123456'}},error:null})
  }}};
  const service=createService({db,core:{checkout:async()=>({checkoutId:'ch_test',url:'https://sandbox.whop.com/checkout/test'}),snapshot:async()=>snapshot},
    provision:async(p)=>{calls.onboard++;if(options.failPrepare){options.failPrepare=false;throw Error('interrupted preparation');}Object.assign(rows.get(p.id),{state:'provisioning',site_id:'site'});return {site:{siteId:'site'}};},mail:async()=>{calls.mail++;return true;},saveBilling:async()=>{if(options.failBilling){options.failBilling=false;throw Error('temporary billing save failure');}},attach:async()=>{}});
  const paid=id=>({order_id:id,checkout_id:'ch_test',plan_id:'plan_kenya',currency:'KES',monthly_cents:3000000,
    business_type:'barbershops',paid:true,status:'active',period_end:new Date(Date.now()+86400000).toISOString(),customer_email:'owner@example.com',payment_id:'pay_test'});
  return {service,cfg,rows,calls,paid,setSnapshot:s=>snapshot=s};
}
test('Kenya checkout stores only a hashed capability and does not create an account/site before payment',async()=>{
 const f=fixture(), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 assert.equal(f.rows.get(p.id).secret_hash,digest(p.key));assert.notEqual(f.rows.get(p.id).secret_hash,p.key);
 assert.equal(f.calls.onboard,0);assert.equal(f.calls.mail,0);
 await assert.rejects(f.service.load(p.id,'0'.repeat(64)),{status:404});
 await assert.rejects(f.service.sendCode(f.rows.get(p.id),p.key),{status:409});
});
test('provider bindings reject another checkout, amount, currency and expired membership',async()=>{
 const f=fixture(), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 for(const patch of [{checkout_id:'ch_other'},{monthly_cents:29900},{currency:'USD'},{period_end:'invalid'},{status:'canceled'}])
  await assert.rejects(f.service.receive(f.cfg,{...f.paid(p.id),...patch}));
 assert.equal(f.rows.get(p.id).state,'pending');
 f.setSnapshot(f.paid('someone-else'));await assert.rejects(f.service.refresh(f.rows.get(p.id),f.cfg,'pay_test'));
});
test('paid purchase verifies its email, rate limits OTP and provisions exactly once on sequential retry',async()=>{
 const f=fixture(), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 await f.service.receive(f.cfg,f.paid(p.id));const row=f.rows.get(p.id);
 await f.service.sendCode(row,p.key);assert.equal(f.calls.mail,1);
 await assert.rejects(f.service.sendCode(row,p.key),{status:429});
 await assert.rejects(f.service.complete(row,{id:'attacker',email:'owner@example.com',email_confirmed_at:'now'},f.cfg,'Business'),{status:403});
 const user={id:'owner',email:'owner@example.com',email_confirmed_at:'now'};
 await f.service.complete(row,user,f.cfg,'Business');await f.service.complete(row,user,f.cfg,'Business');
 assert.equal(f.calls.onboard,1);assert.equal(f.calls.reconcile,1);assert.equal(row.state,'complete');
});
test('a legacy non-atomic provisioning record without a site remains fenced',async()=>{
 const f=fixture(), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 await f.service.receive(f.cfg,f.paid(p.id));const row=f.rows.get(p.id);row.auth_user_id='owner';row.state='provisioning';
 await assert.rejects(f.service.complete(row,{id:'owner',email:'owner@example.com',email_confirmed_at:'now'},f.cfg,'Business'),{status:409});
 assert.equal(f.calls.onboard,0);
});

test('a paid checkout cannot substitute the selected template or business type', async()=>{
 const f=fixture(), p=await f.service.start({planKey:'kenya',vertical:'barbershops',starterId:'approved-template'},f.cfg);
 for(const patch of [{template_id:'other-template'},{template_id:'approved-template',business_type:'salons'}])
  await assert.rejects(f.service.receive(f.cfg,{...f.paid(p.id),...patch}));
 await f.service.receive(f.cfg,{...f.paid(p.id),template_id:'approved-template'});
 assert.equal(f.rows.get(p.id).state,'paid');
});

 test('purchase recovery trusts only the confirmed provider-bound account', () => {
  const { isPurchaseOwner } = require('../lib/managedWebsitePurchase');
  const p = { auth_user_id: 'owner', snapshot: { customer_email: 'Owner@example.com' } };
  assert.equal(isPurchaseOwner(p, { id: 'owner', email: 'owner@example.com', email_confirmed_at: 'now' }), true);
  for (const u of [null, { id: 'owner', email: 'owner@example.com' }, { id: 'other', email: 'owner@example.com', email_confirmed_at: 'now' }, { id: 'owner', email: 'other@example.com', email_confirmed_at: 'now' }]) assert.equal(isPurchaseOwner(p, u), false);
 });

test('interruption after the site checkpoint resumes the same site without onboarding twice', async () => {
 const f=fixture({failBilling:true}), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 await f.service.receive(f.cfg,f.paid(p.id)); const row=f.rows.get(p.id); row.auth_user_id='owner';
 const user={id:'owner',email:'owner@example.com',email_confirmed_at:'now'};
 await assert.rejects(f.service.complete(row,user,f.cfg,'Business'),/temporary billing save failure/);
 assert.equal(row.site_id,'site'); assert.equal(row.state,'provisioning');
 await f.service.complete(row,user,f.cfg,'Business');
 assert.equal(row.state,'complete'); assert.equal(f.calls.onboard,1); assert.equal(f.calls.reconcile,1);
});

test('missing atomic provisioning migration blocks checkout before any purchase/account/provider write', async () => {
 const f=fixture({missingReady:true});
 await assert.rejects(f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg),{status:503});
 assert.equal(f.rows.size,0); assert.equal(f.calls.onboard,0); assert.equal(f.calls.mail,0);
});

test('an interruption preparing the atomic clone leaves the paid purchase retryable', async () => {
 const f=fixture({failPrepare:true}), p=await f.service.start({planKey:'kenya',vertical:'barbershops'},f.cfg);
 await f.service.receive(f.cfg,f.paid(p.id));const row=f.rows.get(p.id);row.auth_user_id='owner';
 const user={id:'owner',email:'owner@example.com',email_confirmed_at:'now'};
 await assert.rejects(f.service.complete(row,user,f.cfg,'Business'),/interrupted preparation/);
 assert.equal(row.state,'paid');assert.equal(row.site_id,undefined);
 await f.service.complete(row,user,f.cfg,'Business');assert.equal(row.state,'complete');assert.equal(f.calls.reconcile,1);
});
