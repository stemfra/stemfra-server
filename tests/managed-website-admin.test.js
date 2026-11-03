const {test}=require('node:test');
const assert=require('node:assert/strict');
test('admin activates only a matching new provider plan and records the actor atomically',async()=>{
 const path=require.resolve('../config/supabase'),saved=require.cache[path];
 const catalogue=require('../lib/managedWebsiteCatalogue'),core=require('../lib/whop/core');
 const oldRead=catalogue.read,oldConfig=core.config;let writes=[],bad={},stale=false;
 const row={id:'version',active:true,currency:'USD',plan_key:'managed_website'};
 try{
  require.cache[path]={id:path,filename:path,loaded:true,exports:{rpc:async(name,args)=>{writes.push({name,args});return {data:'new-version'}}}};
  catalogue.read=async()=>({rows:stale?[]:[row]});
  core.config=()=>({account:'biz_owner',plans:{managed_website:{plan:'plan_existing'}},client:{plans:{retrieve:async()=>({account:{id:'biz_owner'},currency:'usd',renewal_price:301,initial_price:0,trial_period_days:null,billing_period:30,...bad})}}});
  delete require.cache[require.resolve('../controllers/admin/managedWebsiteCatalogueController')];
  const controller=require('../controllers/admin/managedWebsiteCatalogueController');
  const request={body:{id:'version',monthly_cents:30100,plan_id:'plan_new'},staffUser:{id:'admin-actor'}};
  async function call(){let status=200,body;await controller.save(request,{status(n){status=n;return this},json(b){body=b}});return {status,body};}
  for(const invalid of [{account:{id:'biz_other'}},{currency:'cad'},{renewal_price:302},{initial_price:1},{trial_period_days:7},{billing_period:7}]){bad=invalid;assert.equal((await call()).status,400);assert.equal(writes.length,0);}
  bad={};stale=true;assert.equal((await call()).status,409);stale=false;
  request.body.plan_id='plan_existing';assert.equal((await call()).status,409);request.body.plan_id='plan_new';
  assert.deepEqual(await call(),{status:200,body:{saved:true}});
  assert.deepEqual(writes,[{name:'publish_managed_website_price',args:{p_id:'version',p_cents:30100,p_plan:'plan_new',p_user:'admin-actor'}}]);
 }finally{catalogue.read=oldRead;core.config=oldConfig;if(saved)require.cache[path]=saved;else delete require.cache[path];delete require.cache[require.resolve('../controllers/admin/managedWebsiteCatalogueController')];}
});
