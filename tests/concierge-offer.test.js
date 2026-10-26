const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { buildConciergeContext } = require('../lib/conciergeContext');
const ctx = buildConciergeContext();
test('AI offers match the marketing price catalogue', () => {
  const { LAUNCH_PLANS } = require('../../stemfra_client/src/app/data/aiLaunchPricing.json');
  assert.deepEqual(ctx.ai.plans.map(p => [p.name,p.monthly_usd,p.annual_usd,p.seats,p.monthly_credits]), LAUNCH_PLANS.map(p => [p.name,p.priceUsd,p.priceUsd*10,p.seats,p.credits]));
});
test('current offers preserve availability limits and safe destinations', () => {
  assert.equal(ctx.websites.price_usd_month, 299);
  assert.equal(ctx.websites.booking_commission, 0);
  assert.equal(ctx.websites.trial_days, 14);
  assert.doesNotMatch(ctx.websites.terms, /preview/);
  assert.match(ctx.websites.internal_guardrails, /Do not promise immediate trial activation/);
  assert.match(ctx.ai.terms, /checkout is disabled/);
  assert.equal(ctx.custom_software.starting_price_usd, 10000);
  const routes = fs.readFileSync(require('node:path').join(__dirname, '../../stemfra_client/src/app/routes.js'),'utf8');
  for (const path of Object.values(ctx.links)) assert.ok(routes.includes(`'${path}'`), path);
  assert.ok(!ctx.links.start_free);
});
