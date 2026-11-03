const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseOffer, ownerSubscriptionOffer} = require('../lib/ownerSubscriptionOffer');
const base = {siteId:'site_a',sites:[{id:'site_a'}],subscriptions:[],contact:{country:'United States'},req:{headers:{'cf-ipcountry':'AT'}}};
test('existing paid subscription currency wins over billing address and travel location',()=>{
 assert.deepEqual(chooseOffer({...base,subscriptions:[{site_id:'site_a',currency:'CAD'}],billingCountry:'United Kingdom'}),{currency:'CAD',monthlyCents:40000,source:'subscription',version:undefined});
});
test('single owner subscription preference applies to additional unpaid previews',()=>{
 assert.equal(chooseOffer({...base,subscriptions:[{site_id:'other',currency:'GBP'}]}).currency,'GBP');
});
test('mixed owner subscriptions use selected business billing country, never arbitrary first row',()=>{
 const mixed=[{site_id:'other1',currency:'GBP'},{site_id:'other2',currency:'CAD'}];
 assert.equal(chooseOffer({...base,subscriptions:mixed,billingCountry:'Canada'}).currency,'CAD');
 assert.equal(chooseOffer({...base,subscriptions:mixed.reverse(),billingCountry:'Canada'}).currency,'CAD');
});
test('saved billing country is used without a subscription and before current IP',()=>{
 assert.equal(chooseOffer({...base,contact:{country:'United Kingdom'},req:{headers:{'cf-ipcountry':'CA'}}}).currency,'GBP');
 assert.equal(chooseOffer({...base,contact:{billing_profile:{country:'Canada'}}}).currency,'CAD');
});
test('saved acceptance or visitor location only supplies a missing billing preference',()=>{
 assert.equal(chooseOffer({...base,contact:{},sites:[{id:'site_a',metadata:{onboarding:{fees_policy:{currency:'KES'}}}}]}).currency,'KES');
 assert.equal(chooseOffer({...base,contact:{},req:{headers:{'cf-ipcountry':'CA'}}}).currency,'CAD');
 assert.equal(chooseOffer({...base,contact:{}}).currency,'USD');
});
test('owner resolver rejects foreign website before reading subscriptions',async()=>{
 const tables=[];
 const store={from(table){tables.push(table);const q={select:()=>q,eq:()=>q,is:()=>q,maybeSingle:async()=>({data:{id:'owner'}}),order:async()=>({data:[{id:'owned'}]})};return q;}};
 await assert.rejects(ownerSubscriptionOffer('user','foreign',base.req,store), /Not your site/);
 assert.deepEqual(tables,['contacts','sites']);
});
