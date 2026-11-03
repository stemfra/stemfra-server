const {test}=require('node:test');const assert=require('node:assert/strict');
const record=require('../lib/whop/initialFailure');
test('failed checkout records only event, preserves intent and rejects mismatched bindings',async()=>{
 const intent={id:'order',site_id:'site',product:'website',plan_id:'plan',sandbox:true,checkout_id:'ch',acquisition_mode:'checkout'};
 const snapshot={order_id:'order',checkout_id:'ch',product:'website',plan_id:'plan'};
 const writes=[];const db={from(table){if(table==='whop_checkout_intents')return {select(){return this;},eq(){return this;},async maybeSingle(){return {data:intent};}};assert.equal(table,'whop_events');return {async upsert(row,opts){writes.push(row);assert.equal(opts.ignoreDuplicates,true);return {};}};}};
 assert.equal((await record(db,snapshot,'event',true)).initial_payment_failed,true);assert.equal(writes.length,1);
 for(const patch of [{sandbox:false},{plan_id:'other'},{checkout_id:'other'},{product:'ai'},{acquisition_mode:'saved_card'}]){
  const previous={...intent};Object.assign(intent,patch);await assert.rejects(()=>record(db,snapshot,'event',true));Object.assign(intent,previous);
 }
 assert.equal(writes.length,1);
});
