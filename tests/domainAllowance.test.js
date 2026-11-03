const {test} = require('node:test');
const assert = require('node:assert/strict');
const {domainAllowance} = require('../lib/domainAllowance');
const active = {provider:'whop',status:'active',currency:'USD',monthly_amount_cents:29900,current_period_end:new Date(Date.now()+86400000).toISOString()};
test('included registration respects the $30 boundary and rejects unknown prices',()=>{
  for (const amount of [1,1500,3000]) assert.equal(domainAllowance(active,amount).included,true);
  for (const amount of [null,0,-1,3001,NaN,Infinity,12.5]) assert.equal(domainAllowance(active,amount).included,false);
});
test('unpaid, other provider and invalid subscription prices do not spend the allowance',()=>{
  for (const patch of [{current_period_end:null},{current_period_end:'2020-01-01'},{status:'past_due'},{status:'cancelled'},{provider:'airwallex'},{currency:'EUR'},{monthly_amount_cents:0},{monthly_amount_cents:-1},{monthly_amount_cents:12.5}]) assert.equal(domainAllowance({...active,...patch},1000).included,false);
  assert.equal(domainAllowance(null,1000).included,false);
});

test('active catalogue currencies retain the allowance across price versions',()=>{
  for (const [currency,monthly_amount_cents] of [['USD',29900],['CAD',40000],['GBP',22500],['KES',3000000],['USD',31000]]) {
    assert.equal(domainAllowance({...active,currency,monthly_amount_cents},3000).included,true);
  }
});
