const test = require('node:test');
const assert = require('node:assert/strict');
const {regionalOffer, managedWebsiteAcceptance} = require('../lib/managedWebsiteOffer');
test('new subscriptions use USD in every billing country', () => {
  for (const [country,currency,amount] of [['GB','USD',29900],['CA','USD',29900],['US','USD',29900],['KE','USD',29900],['AT','USD',29900],['XX','USD',29900],['','USD',29900]]) {
    const offer=regionalOffer({headers:{'cf-ipcountry':country}});
    assert.deepEqual(offer,{currency,monthlyCents:amount});
    const acceptance=managedWebsiteAcceptance(offer.currency);
    assert.equal(acceptance.currency,currency);
    assert.equal(acceptance.monthly_amount_cents,amount);
    assert.equal(acceptance.currency_selected_at_checkout,false);
  }
});
test('unsupported acceptance currencies are rejected instead of recording mismatched terms',()=>{
  assert.throws(()=>managedWebsiteAcceptance('EUR'),/unsupported_subscription_currency/);
});
