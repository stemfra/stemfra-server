const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../lib/whop/core');

test('CMS card checkout quotes the owned site and binds confirmation to that quote and one provider payment', async t => {
  const dbPath = require.resolve('../config/supabase');
  const billingPath = require.resolve('../lib/billingProfile');
  const modulePath = require.resolve('../lib/whop/cmsCardCheckout');
  const originals = [dbPath, billingPath, modulePath].map(path => require.cache[path]);
  const env = { ...process.env };
  const realConfig = core.config, realCheckout = core.checkout;
  t.after(() => {
    [dbPath, billingPath, modulePath].forEach((path, i) => { if (originals[i]) require.cache[path] = originals[i]; else delete require.cache[path]; });
    for (const key of ['WHOP_CMS_CARD_CHECKOUT_SANDBOX', 'WHOP_CMS_CARD_CHECKOUT_PRODUCTION', 'WHOP_CMS_SANDBOX_RETURN_ORIGIN']) {
      if (env[key] === undefined) delete process.env[key]; else process.env[key] = env[key];
    }
    core.config = realConfig; core.checkout = realCheckout;
  });
  process.env.WHOP_CMS_CARD_CHECKOUT_SANDBOX = 'true';
  process.env.WHOP_CMS_CARD_CHECKOUT_PRODUCTION = 'false';
  process.env.WHOP_CMS_SANDBOX_RETURN_ORIGIN = 'https://relay.example.test';
  let intent = { id: 'order', site_id: 'site', requested_by: 'owner', state: 'pending', product: 'website',
    sandbox: true, acquisition_mode: 'pending', plan_id: 'plan_test', plan_key: 'managed_website',
    created_at: new Date().toISOString() };
  const db = {
    async rpc(name, input) { assert.equal(name, 'whop_prepare_checkout'); assert.equal(input.p_target, 'site'); return { data: { ...intent } }; },
    from(table) {
      assert.equal(table, 'whop_checkout_intents');
      const filters = {};
      let patch;
      const read = () => Object.entries(filters).every(([key, value]) => intent[key] === value);
      return {
        update(value) { patch = value; return this; },
        select() { return this; },
        eq(key, value) { filters[key] = value; return this; },
        async maybeSingle() { if (!read()) return { data: null }; if (patch) Object.assign(intent, patch); return { data: { ...intent } }; },
        then(resolve) { if (read() && patch) Object.assign(intent, patch); return Promise.resolve({}).then(resolve); },
      };
    },
  };
  let street = '10 Test Avenue', tokenAddress, paymentCalls = 0;
  const profile = { first_name: 'Test', last_name: 'Buyer', billing_email: 'sandbox@example.test', country: 'United States', state: 'NY', city: 'Brooklyn', postal_code: '11238' };
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
  require.cache[billingPath] = { id: billingPath, filename: billingPath, loaded: true, exports: { resolveBillingIdentity: async () => ({ profile: { ...profile, line1: street } }) } };
  core.checkout = async (_cfg, _intent, back) => {
    assert.equal(new URL(back).searchParams.get('site'), 'site');
    return { checkoutId: 'ch_internal', url: 'https://sandbox.whop.com/checkout/ch_internal' };
  };
  core.config = () => ({ sandbox: true, account: 'biz_test', secret: 'test-key',
    plans: { managed_website: { plan: 'plan_test', currency: 'USD', cents: 29900 } }, client: {
      paymentQuotes: { create: async input => {
        assert.deepEqual(input.line_items, [{ plan_id: 'plan_test', quantity: 1 }]);
        assert.equal(input.address.country, 'US');
        tokenAddress = input.address;
        return { id: 'pq_owned', total: { amount: '303.00', currency: 'usd' }, tax_amount: { amount: '4.00', currency: 'usd' } };
      } },
      confirmationTokens: { retrieve: async input => {
        assert.equal(input.account_id, 'biz_test');
        return { billing_address: tokenAddress, billing_details: { email: 'sandbox@example.test' } };
      } },
      payments: { create: async (input, options) => {
        paymentCalls++;
        assert.equal(input.metadata.stemfra_order_id, intent.id);
        assert.equal(input.quote_id, 'pq_owned');
        assert.equal(new URL(input.return_url).searchParams.get('site'), 'site');
        assert.equal(options.idempotencyKey, 'stemfra-cms-card-order');
        return { id: 'pay_owned' };
      } },
    },
  });
  delete require.cache[modulePath];
  const checkout = require(modulePath);
  assert.equal(checkout.enabled(false), false);
  const quote = await checkout.quote('site', 'owner', 'login@example.test', 'USD');
  assert.equal(quote.total.amount, '303.00');
  assert.equal(intent.checkout_id, 'ch_internal');
  assert.equal(intent.checkout_url, undefined);
  const input = { token: 'ctok_owned', quoteId: quote.id, quoteProof: quote.proof, expires: quote.expires };
  await assert.rejects(checkout.confirm('site', 'other', 'login@example.test', 'USD', input), /already has a payment attempt/);
  await assert.rejects(checkout.confirm('site', 'owner', 'login@example.test', 'USD', { ...input, quoteId: 'pq_other' }), /Billing details changed/);
  street = 'Other street';
  await assert.rejects(checkout.confirm('site', 'owner', 'login@example.test', 'USD', input), /Billing details changed/);
  street = '10 Test Avenue';
  assert.equal(paymentCalls, 0);
  assert.equal((await checkout.confirm('site', 'owner', 'login@example.test', 'USD', input)).paymentId, 'pay_owned');
  await assert.rejects(checkout.confirm('site', 'owner', 'login@example.test', 'USD', input), /already has a payment attempt/);
  assert.equal(paymentCalls, 1);
  assert.equal(intent.saved_payment_id, 'pay_owned');
});
