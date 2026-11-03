const test=require('node:test');
const assert=require('node:assert/strict');
const catalogue=require('../lib/managedWebsiteCatalogue');
const {price}=require('../lib/whop/websitePrices');
const row=(id,cents)=>({id,sandbox:true,currency:'USD',monthly_cents:cents,plan_key:`managed_website_usd_${id}`,plan_id:`plan_${id}`,active:true});
test('concurrent quotes retain their own catalogue version',async()=>{
 await Promise.all([['first',30100],['second',30200]].map(([id,cents])=>catalogue.scope.run({rows:[row(id,cents)]},async()=>{
  await new Promise(resolve=>setImmediate(resolve));assert.equal(price('USD').version,id);
  assert.equal(require('../lib/managedWebsiteOffer').managedWebsiteAcceptance('USD').monthly_amount_cents,cents);
 })));
});
test('provider verification retains historical prices',()=>{
 const old={...row('old',29900),active:false},current=row('new',30100);
 const cfg=catalogue.configure({sandbox:true,plans:{}},{rows:[old,current]});
 assert.equal(cfg.plans[old.plan_key].cents,29900);assert.equal(cfg.plans[current.plan_key].cents,30100);
});
test('stale or missing versions cannot submit subscriptions',()=>catalogue.scope.run({rows:[row('current',30100)]},()=>{
 for(const pricingVersion of [undefined,'stale']){
  let status;const res={status(n){status=n;return this},json(body){assert.match(body.error,/price has changed/)}};
  catalogue.quoteGate({body:{currency:'USD',pricingVersion}},res,()=>assert.fail('stale quote accepted'));assert.equal(status,409);
 }
 let passed=false;catalogue.quoteGate({body:{currency:'USD',pricingVersion:'current'}},{},()=>passed=true);assert.equal(passed,true);
}));
test('private availability policy requires activation and supports jurisdiction rules',()=>{
 const policy={enabled:false,policy:{countries:['ZZ'],regions:[{country:'XY',region:'Restricted test region'}]}};
 assert.equal(catalogue.available('ZZ','',policy),true);policy.enabled=true;
 assert.equal(catalogue.available('ZZ','',policy),false);assert.equal(catalogue.available('XY','RESTRICTED TEST REGION',policy),false);
 assert.equal(catalogue.available('XY','Other',policy),true);
});
