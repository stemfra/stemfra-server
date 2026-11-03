const test = require('node:test');
const assert = require('node:assert/strict');
const {regionalOffer, managedWebsiteAcceptance} = require('../lib/managedWebsiteOffer');
test('regional subscription prices use UK, Canada and Kenya with USD fallback', () => {
  for (const [country,currency,amount] of [['GB','GBP',22500],['CA','CAD',40000],['US','USD',29900],['KE','KES',3000000],['AT','USD',29900],['XX','USD',29900],['','USD',29900]]) {
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
