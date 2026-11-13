const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
function harness(allowed = true) {
  const handlers = {}, rows = new Map(); let writes = 0;
  const router = { use(...args) { if (args[0] === '/:siteId') handlers.guard = args[1]; }, get(p, fn) { handlers.get = fn; }, put(p, fn) { handlers.put = fn; } };
  const db = { from() {
    let op = 'read', patch = {}, filters = {};
    const q = { select() { return q; }, eq(k, v) { filters[k] = v; return q; }, match(v) { Object.assign(filters, v); return q; }, update(v) { op = 'update'; patch = v; return q; },
      async upsert(keys) { const key = keys.site_id + keys.user_id; if (!rows.has(key)) rows.set(key, { ...keys, revision: 0, step: '1', business_draft: null }); return { error: null }; },
      async maybeSingle() { const row = rows.get(filters.site_id + filters.user_id); if (!row || (filters.revision !== undefined && row.revision !== filters.revision)) return { data: null, error: null }; if (op === 'update') { Object.assign(row, patch); writes++; } return { data: { ...row }, error: null }; } };
    return q;
  } };
  const mod = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../routes/cms/setupProgress.js'), 'utf8'), { module: mod, require: key => ({ express: { Router: () => router }, '../../config/supabase': db, '../../middleware/cmsAuth': { requireCmsAuth() {}, verifySiteOwnership: async () => allowed } })[key], Date, Set, Number, JSON });
  async function run(method, body, user = 'owner') {
    const req = { params: { siteId: 'site' }, cmsUser: { id: user }, body };
    const res = { code: 200, set() {}, status(c) { this.code = c; return this; }, json(v) { this.data = v; return this; } };
    let pass = false; await handlers.guard(req, res, () => { pass = true; }); if (pass) await handlers[method](req, res); return res;
  }
  return { run, rows, get writes() { return writes; } };
}
test('saved draft and stage survive a new request and remain user scoped', async () => {
  const h = harness(); const r = await h.run('put', { revision: 0, step: '2', business_draft: { country: 'CA', phone: 'draft' } });
  assert.equal(r.code, 200); assert.equal((await h.run('get')).data.step, '2'); assert.equal((await h.run('get')).data.business_draft.country, 'CA'); assert.equal((await h.run('get', null, 'other')).data.business_draft, null);
});
test('stale devices cannot overwrite a newer draft', async () => {
  const h = harness(); await h.run('put', { revision: 0, step: '2' });
  assert.equal((await h.run('put', { revision: 0, step: '1' })).code, 409); assert.equal(h.writes, 1);
});
test('invalid stage rejected and foreign site denied before writes', async () => {
  const h = harness(); assert.equal((await h.run('put', { revision: 0, step: '9' })).code, 400);
  const denied = harness(false); assert.equal((await denied.run('get')).code, 403); assert.equal(denied.rows.size, 0);
});
test('committing business details clears draft without dropping resume step', async () => {
  const h = harness(); await h.run('put', { revision: 0, business_draft: { email: 'draft' } });
  await h.run('put', { revision: 1, step: '2', business_draft: null });
  const r = await h.run('get'); assert.equal(r.data.business_draft, null); assert.equal(r.data.step, '2');
});
