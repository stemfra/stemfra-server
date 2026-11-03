const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function harness({ allowed = true, saved = 'CA', billing = 'United Kingdom', matches = [] } = {}) {
  const calls = [];
  const chain = { select() { return this; }, eq() { return this; }, limit() { return this; }, async maybeSingle() { return { data: { content: { address_parts: { country: saved } } } }; } };
  const mod = { exports: {} };
  const lookup = { async placesByName(input) { calls.push(['cache', input]); return matches; }, isFresh: row => row.fresh, candidateFromPlaceRow: row => row };
  const requires = {
    '../../config/supabase': { from: () => chain },
    '../../middleware/cmsAuth': { verifySiteOwnership: async () => allowed ? {} : null },
    '../../lib/placesLookup': lookup,
    '../../lib/googlePlacesFinder': { async findBusiness(input) { calls.push(['provider', input]); return []; } },
    '../../lib/billingProfile': { resolveBillingIdentity: async () => ({ profile: { country: billing } }) },
    '../../lib/geo': require('../lib/geo'),
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../controllers/cms/googleProfileController.js'), 'utf8'), { module: mod, exports: mod.exports, require: key => { if (!(key in requires)) throw Error(key); return requires[key]; }, console });
  async function run(body = {}) {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await mod.exports.find({ cmsUser: { id: 'owner' }, body: { siteId: 'site', name: 'Test Shop', where: 'Toronto', ...body } }, res);
    return res;
  }
  return { calls, run };
}
test('lookup uses saved business country before billing country', async () => {
  const h = harness(); await h.run(); assert.equal(h.calls[0][1].country, 'CA'); assert.equal(h.calls[1][1].country, 'CA');
});
test('unsaved selection is normalized and cache-only typing never invokes provider', async () => {
  const h = harness(); const res = await h.run({ country: 'United Kingdom', cachedOnly: true });
  assert.equal(res.code, 200); assert.equal(h.calls.length, 1); assert.equal(h.calls[0][1].country, 'GB');
});
test('fresh local matches avoid provider; stale local matches do not', async () => {
  const h = harness({ matches: [{ fresh: true }] }); await h.run(); assert.equal(h.calls.length, 1);
  const stale = harness({ matches: [{ fresh: false }] }); await stale.run(); assert.equal(stale.calls[1][0], 'provider');
});
test('foreign site lookup is blocked before database or provider access', async () => {
  const h = harness({ allowed: false }); assert.equal((await h.run()).code, 403); assert.equal(h.calls.length, 0);
});
test('missing country does not silently search the United States', async () => {
  const h = harness({ saved: '', billing: '' }); assert.equal((await h.run()).code, 400); assert.equal(h.calls.length, 0);
});
