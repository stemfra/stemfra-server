// No network, credentials, email or database writes. Controller dependencies are mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const pricing = require('../../config/productPricing.json');
async function exercise(body, existing = null, mailFails = false) {
  const writes = [], filters = [];
  const db = { from() {
    let write;
    const q = {
      select(){return q}, eq(k,v){filters.push([k,v]);return q}, not(){return q}, gte(){return q}, order(){return q}, limit(){return q},
      maybeSingle: async()=>({data:existing}),
      insert(v){write=v[0];writes.push(write);return q}, update(v){write=v;writes.push(write);return q},
      single: async()=>({data:{id:'mock-lead',created_at:'2026-10-20',...write}}),
      then(resolve){return Promise.resolve({data:null}).then(resolve)},
    }; return q;
  }};
  const module = {exports:{}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../controllers/contactController.js'),'utf8'), {
    module, console:{log(){},warn(){},error(){}}, process:{env:{}}, Date,
    require(name) {
      if(name.includes('productPricing'))return pricing;
      if(name.includes('supabase'))return db;
      if(name.includes('mailer'))return {sendMail:async()=>{if(mailFails)throw Error('mock failure');return false}};
      if(name.includes('Email'))return ()=>({subject:'mock',html:'mock',text:'mock'});
      if(name.includes('speedToLead'))return {fireSpeedToLead:async()=>({ok:true})};
      if(name.includes('leadVertical'))return {normalise:()=>null};
      throw Error(name);
    }
  });
  let status, result;
  const res={status(n){status=n;return res},json(x){result=x;return res}};
  await module.exports.submitContact({body:{firstName:'Test',lastName:'Person',email:'test@example.invalid',message:'Test enquiry',...body}},res);
  return {status,result,writes,filters};
}
(async()=>{
  for(const [subject,service] of [['Managed websites','website'],['Custom software','custom_build'],['Stemfra AI','ai_automation']]){
    const r=await exercise({subject});assert.equal(r.status,201);assert.equal(r.writes[0].service,service);assert.ok(r.filters.some(([k,v])=>k==='service'&&v===service));
  }
  for(const plan of pricing.aiPlans){const r=await exercise({subject:'Stemfra AI',aiPlan:plan.id});assert.equal(r.writes[0].qualification.ai_plan,plan.id);assert.equal(r.writes[0].vertical,null)}
  assert.equal((await exercise({subject:'Stemfra AI',aiPlan:'invalid'})).status,400);
  assert.equal((await exercise({subject:'Custom software',aiPlan:'growth'})).status,400);
  const repeat=await exercise({subject:'Stemfra AI',aiPlan:'business'},{id:'old',notes:'earlier',qualification:{keep:true,ai_plan:'starter'}});
  assert.equal(repeat.writes[0].qualification.keep,true);assert.equal(repeat.writes[0].qualification.ai_plan,'business');assert.match(repeat.writes[0].notes,/earlier/);
  const fail=await exercise({subject:'Barbershops website'},null,true);assert.equal(fail.status,201);assert.equal(fail.writes[0].vertical,'barbershop');assert.equal(fail.writes.length,1);
  console.log('Contact product checks passed: products, plans, dedup scope, preserved qualification, verticals, notification failures.');
})();
