const {test}=require('node:test');
const assert=require('node:assert/strict');
test('publishing requires completeness but no payment and never buys a domain',async()=>{
 const mocks={
 '../config/supabase':{from(table){assert.equal(table,'sites');return query;}},
 '../lib/siteCompleteness':{evaluateCompleteness:async()=>({ready})},
 '../lib/attachSiteDomain':{attachSiteDomain:async()=>{attached++;return {}; }},
 '../lib/activity':{logSiteActivity:async()=>{}},
 '../lib/siteLifecycleEmails':{sendSiteLiveEmail:async()=>{}},
 };
 let ready=false,attached=0,updated=false,status='previewing';
 const query={select(){return this},eq(){return this},async single(){return {data:{id:'site',status,subdomain:'test'}}},update(value){assert.equal(value.status,'live');updated=true;return this;},then(resolve){return Promise.resolve({error:null}).then(resolve);}};
 const saved=Object.keys(mocks).map(p=>[require.resolve(p),require.cache[require.resolve(p)]]);
 try{
 for(const [p,exports] of Object.entries(mocks)){const id=require.resolve(p);require.cache[id]={id,filename:id,loaded:true,exports};}
 delete require.cache[require.resolve('../lib/sitePublish')];const {publishSite,unpublishSite}=require('../lib/sitePublish');
 await assert.rejects(publishSite('site'),e=>e.code==='not_ready');assert.equal(attached,0);assert.equal(updated,false);
 ready=true;assert.equal((await publishSite('site')).status,'live');assert.equal(attached,1);assert.equal(updated,true);
 status='suspended';updated=false;await assert.rejects(unpublishSite('site'),e=>e.code==='bad_state');assert.equal(updated,false);
 }finally{for(const [id,old] of saved){if(old)require.cache[id]=old;else delete require.cache[id];}delete require.cache[require.resolve('../lib/sitePublish')];}
});
