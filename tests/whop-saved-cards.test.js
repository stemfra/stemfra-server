const {test}=require('node:test');
const assert=require('node:assert/strict');
test('saved card display comes from owned paid bindings and never exposes fingerprint/member ID',async()=>{
 const paths=['../config/supabase','../middleware/cmsAuth'];const saved=paths.map(p=>require.cache[require.resolve(p)]);
 const core=require('../lib/whop/core');const old=core.config;let wrongAccount=false,cardOwner;
 const db={from(table){return {select(){return this},eq(){return this},is(){return this},in(){return this},then(resolve){return Promise.resolve({data:table==='sites'?[{id:'owned'}]:[{membership_id:'mem_owned'}]}).then(resolve)}}}};
 try{
 paths.forEach((p,i)=>require.cache[require.resolve(p)]={id:require.resolve(p),filename:require.resolve(p),loaded:true,exports:i?{resolveContactId:async()=> 'contact'}:db});
 core.config=()=>({account:'biz_ours',sandbox:true,client:{memberships:{retrieve:async()=>({account:{id:wrongAccount?'biz_other':'biz_ours'},member_id:'mber_owned'})},paymentMethods:{list:async(args)=>{cardOwner=args.member_id;return {data:[{id:'payt_card',card:{brand:'visa',last4:'4242',fingerprint:'private'}},{id:'expired',card:{brand:'visa',last4:'1234',expired:true}}]}}}}});
 delete require.cache[require.resolve('../lib/whop/savedCards')];const service=require('../lib/whop/savedCards');
 assert.deepEqual(await service.list('owner'),[{id:'payt_card',brand:'visa',last4:'4242'}]);assert.equal(cardOwner,'mber_owned');
 wrongAccount=true;await assert.rejects(()=>service.list('owner'),/wrong_whop_account/);
 }finally{core.config=old;paths.forEach((p,i)=>{if(saved[i])require.cache[require.resolve(p)]=saved[i];else delete require.cache[require.resolve(p)]});}
});
test('successful status performs verified read repair; browser status cannot grant access',async()=>{
 const dbPath=require.resolve('../config/supabase');const saved=require.cache[dbPath];
 const core=require('../lib/whop/core');const oldConfig=core.config,oldSnapshot=core.snapshot;
 let providerStatus='processing',snapshotReads=0,reconciles=0,owned=true;
 const db={from(){return {select(){return this},eq(){return this},async maybeSingle(){return {data:owned?{id:'intent'}:null}}}},async rpc(name,args){assert.equal(name,'whop_reconcile');assert.equal(args.p_snapshot.paid,true);reconciles++;return {data:{}}}};
 try{
 require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:db};
 core.config=()=>({sandbox:true,client:{payments:{retrieveStatus:async()=>({status:providerStatus})}}});
 core.snapshot=async()=>{snapshotReads++;return {paid:true,product:'website'}};
 delete require.cache[require.resolve('../lib/whop/savedCards')];const {status}=require('../lib/whop/savedCards');
 await status('site','owner','pay_existing');assert.equal(reconciles,0);
 providerStatus='succeeded';await status('site','owner','pay_existing');assert.equal(snapshotReads,1);assert.equal(reconciles,1);
 owned=false;await assert.rejects(()=>status('site','other','pay_existing'),/payment_not_owned/);assert.equal(reconciles,1);
 }finally{core.config=oldConfig;core.snapshot=oldSnapshot;if(saved)require.cache[dbPath]=saved;else delete require.cache[dbPath];}
});
