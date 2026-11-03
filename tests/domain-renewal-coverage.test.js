const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Whop renewal inclusion and exception paths never create customer invoices',async()=>{
 const deps=['../config/supabase','../lib/registrar','../lib/billing','../lib/mailer','../lib/billingEmails','../lib/activity'];
 const saved=deps.map(p=>require.cache[require.resolve(p)]);
 let price=2000;
 const end=new Date(Date.now()+5*86400000).toISOString();
 const sub={provider:'whop',status:'active',currency:'USD',monthly_amount_cents:29900,current_period_end:end};
 const db={from(table){return {select(){return this},in(){return Promise.resolve({data:[{id:'s',custom_domain:'test.com'}]})},eq(){return this},contains(){return this},async maybeSingle(){return {data:table==='subscriptions'?sub:table==='sites'?{metadata:{}}:null}},insert(){throw Error('unexpected invoice')}}}};
 const stubs=[db,{active:()=>({isConfigured:()=>true,listDomains:async()=>[{domain:'test.com',expireDate:end,autoRenew:true}],getPricing:async()=>({com:{renewal:price/100}}),retailCents:x=>x})},{},{sendMail:async()=>{throw Error('unexpected mail')}},{sendDunningEmail:async()=>{throw Error('unexpected dunning')}},{logSiteActivity:()=>{}}];
 try{
 deps.forEach((p,i)=>require.cache[require.resolve(p)]={id:require.resolve(p),filename:require.resolve(p),loaded:true,exports:stubs[i]});
 delete require.cache[require.resolve('../lib/domainRenewalSweeper')];const {sweepOnce}=require('../lib/domainRenewalSweeper');
 assert.equal((await sweepOnce({dryRun:true})).actions[0].action,'renewal-included');
 price=3001;assert.equal((await sweepOnce({dryRun:true})).actions[0].action,'renewal-review-required');
 sub.status='past_due';price=1000;assert.equal((await sweepOnce({dryRun:true})).actions[0].action,'renewal-review-required');
 }finally{deps.forEach((p,i)=>{if(saved[i])require.cache[require.resolve(p)]=saved[i];else delete require.cache[require.resolve(p)]});}
});
