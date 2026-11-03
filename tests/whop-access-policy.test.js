const {test}=require('node:test');
const assert=require('node:assert/strict');
const {accessPolicy,GRACE_MS}=require('../lib/whop/accessPolicy');
const end=Date.parse('2026-12-02T15:44:46.418Z');
const base={status:'past_due',period_end:new Date(end).toISOString(),cancel_at_period_end:false};
test('failed renewal keeps paid access, then exactly seven days grace, then suspension',()=>{
 assert.equal(accessPolicy(base,end-1).state,'paid');
 assert.equal(accessPolicy(base,end).state,'grace');
 assert.equal(accessPolicy(base,end+GRACE_MS-1).state,'grace');
 assert.equal(accessPolicy(base,end+GRACE_MS).state,'suspend');
});
test('cancellation expires at paid end, without renewal-failure grace',()=>{
 for(const change of [{cancel_at_period_end:true},{status:'cancelled'}]){
  assert.equal(accessPolicy({...base,...change},end-1).state,'paid');
  assert.equal(accessPolicy({...base,...change},end).state,'suspend');
 }
});
test('paid recovery restores access; ambiguous or invalid provider state requires review',()=>{
 assert.equal(accessPolicy({...base,status:'active',period_end:new Date(end+GRACE_MS*4).toISOString()},end+GRACE_MS).state,'paid');
 assert.equal(accessPolicy({...base,status:'active'},end).state,'review');
 assert.equal(accessPolicy({...base,period_end:null},end).state,'review');
 assert.equal(accessPolicy({...base,status:'unknown'},end).state,'review');
});
