const { test } = require('node:test');
const assert = require('node:assert/strict');
const { customerIdentityPatch, repairCustomerIdentity } = require('../lib/customerSiteIdentity');
const source = { instagram_handle: 'demo', facebook_handle: 'demo-fb', copyright_year: 2024, footer_text: { en: 'Demo in NYC' }, primary_color: '#123456', metadata: { archetype_variants: { footer: 'textured-columns' }, seo: { default_title: 'Demo | NYC', default_description: 'Grooming in Manhattan.' }, labels: { footer_copyright: 'Demo 2024', book_cta: 'Book a Cut' } } };
const args = { source, sourceName: 'Demo', companyName: 'Customer', city: 'Toronto', year: 2026 };
test('fresh customer retains design but gets its own identity and no guessed socials', () => {
 const theme = structuredClone(source), before = structuredClone(theme);
 const patched = { ...theme, ...customerIdentityPatch({ ...args, theme, fresh: true }) };
 assert.equal(patched.primary_color, source.primary_color);
 assert.deepEqual(patched.metadata.archetype_variants, source.metadata.archetype_variants);
 assert.equal(patched.metadata.labels.book_cta, 'Book a Cut');
 assert.equal(patched.metadata.labels.footer_copyright, undefined);
 assert.equal(patched.metadata.seo.default_description, 'Customer in Toronto.');
 assert.equal(patched.metadata.seo.default_title, 'Customer');
 assert.equal(patched.instagram_handle, null); assert.equal(patched.facebook_handle, null);
 assert.equal(patched.footer_text, null); assert.equal(patched.copyright_year, 2026);
 assert.deepEqual(theme, before);
});
test('existing sample values repair independently while owner values survive', () => {
 const theme = structuredClone(source);theme.instagram_handle = 'customer-own';theme.metadata.seo.default_title = 'Our own title';theme.metadata.labels.footer_copyright = 'Owner copyright';
 const patch = customerIdentityPatch({ ...args, theme });
 assert.equal(patch.instagram_handle, undefined);assert.equal(patch.facebook_handle, null);
 assert.equal(patch.metadata.seo.default_title, 'Our own title');assert.equal(patch.metadata.labels.footer_copyright, 'Owner copyright');
 assert.equal(patch.metadata.seo.default_description, 'Customer in Toronto.');
});
test('brand-renamed sample footer is recognized; current year is not invented as founding date', () => {
 const theme = { ...source, footer_text: { en: 'Customer in NYC' }, metadata: { ...source.metadata, seo: { default_title: 'Customer | NYC', default_description: 'Grooming in Manhattan.' } } };
 const patch = customerIdentityPatch({ ...args, theme }); assert.equal(patch.footer_text,null);assert.equal(patch.metadata.seo.default_title,'Customer');
});
test('saved generated description follows location but later custom copy is preserved', () => {
 const theme = { ...source, ...customerIdentityPatch({ ...args, theme: source, fresh: true }) };
 assert.deepEqual(customerIdentityPatch({ ...args, theme }), {});
 const next = customerIdentityPatch({ ...args, theme, city: 'Ottawa' });assert.equal(next.metadata.seo.default_description, 'Customer in Ottawa.');
 theme.metadata.seo.default_description = 'Owner written description';
 assert.equal(customerIdentityPatch({ ...args, theme, city: 'Ottawa' }).metadata?.seo?.default_description, undefined);
});
test('missing location uses only supplied business name; no source URLs copied into empty theme', () => {
 const patch = customerIdentityPatch({ ...args, theme: {}, city: null, fresh: true });assert.equal(patch.metadata.seo.default_description, 'Customer.');assert.equal(patch.instagram_handle, undefined);
});
test('repair fails safely when a concurrent owner update defeats revision fence', async () => {
 let fence;
 const db = { from(table) { let mutation = false;const q = { select(){return mutation ? Promise.resolve({data:[]}) : q;},eq(key,value){if(mutation&&key==='updated_at')fence=value;return q;},maybeSingle(){return Promise.resolve({data:table==='sites'?{company:{name:'Demo'}}:{...source,updated_at:'version-one'}});},update(){mutation=true;return q;}};return q;}};
 await assert.rejects(repairCustomerIdentity(db,{siteId:'customer',sourceSiteId:'source',companyName:'Customer'}),/another window/);assert.equal(fence,'version-one');
});
test('source demo itself is never repaired', async () => {
 const db = { from(){throw Error('Source must remain untouched');} };
 assert.equal(await repairCustomerIdentity(db,{siteId:'source',sourceSiteId:'source',companyName:'Demo'}),false);
});
