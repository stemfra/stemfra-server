const {test}=require('node:test');
const assert=require('node:assert/strict');
const {publicListing,validateRequest,CATEGORIES,createMarketplaceRouter}=require('../lib/marketplace');
test('public projection excludes private provenance, notes and unclaimed profile data',()=>{
 const p=publicListing({id:'x',claimed:false,booking_enabled:true,site_id:null,profile:{private:'secret'},source_license:'internal',notes:'private',website:'javascript:alert(1)'});
 assert.equal(p.profile,null); assert.equal(p.bookable,false);assert.equal(p.website,'');assert.equal(p.notes,undefined);assert.equal(p.source_license,undefined);
 assert.ok(!CATEGORIES.includes('CrossFit'));assert.ok(!CATEGORIES.includes('Yoga & Pilates'));
});
test('intake validates and bounds user content without granting claims',()=>{
 assert.equal(validateRequest({kind:'claim',name:'Owner',email:'bad',message:'1234567890'}),null);
 assert.equal(validateRequest({kind:'approve',name:'Owner',email:'a@b.com',message:'1234567890'}),null);
 const r=validateRequest({kind:'claim',name:' Owner ',email:'A@B.COM',message:'I am the business owner.',claimed:true});
 assert.deepEqual(r,{kind:'claim',name:'Owner',email:'a@b.com',message:'I am the business owner.'});
});
test('disabled feature never touches the shared database',async()=>{
 const express=require('express'); const app=express();let touched=false;
 app.use(createMarketplaceRouter({db:{from(){touched=true;throw Error();}},enabled:()=>false,auth:(req,res,next)=>next(),owns:async()=>false}));
 const server=app.listen(0);try{const r=await fetch(`http://localhost:${server.address().port}/listings`);assert.equal(r.status,503);assert.equal(touched,false);}finally{server.close();}
});
function database(rows){
 const calls=[];return {calls,from(table){const state={table};calls.push(state);const q={select(){return q;},eq(k,v){(state.filters||=[]).push([k,v]);return q;},order(){return q;},limit(){return q;},maybeSingle(){return Promise.resolve({data:rows[table]?.[0]||null});},insert(value){state.insert=value;return Promise.resolve({data:null,error:null});},update(value){state.update=value;return q;},then(resolve,reject){return Promise.resolve({data:rows[table]||[],error:null}).then(resolve,reject);}};return q;}};
}
async function withApi(db,auth,owns,run){const express=require('express'),app=express();app.use(express.json());app.use(createMarketplaceRouter({db,enabled:()=>true,auth,owns}));const server=app.listen(0);try{await run(`http://localhost:${server.address().port}`);}finally{server.close();}}
test('public catalogue is scoped and does not serialize private fields',async()=>{
 const db=database({marketplace_listings:[{id:'one',slug:'test',name:'Test beauty',city:'London',category:'Beauty salons',claimed:false,profile:{secret:'private'},source_license:'internal'}]});
 await withApi(db,()=>{},async()=>false,async base=>{const r=await fetch(base+'/listings?q=beauty&city=london');const b=await r.json();assert.equal(b.listings.length,1);assert.equal(b.listings[0].profile,null);assert.equal(b.listings[0].source_license,undefined);assert.deepEqual(db.calls[0].filters,[['status','published'],['owner_visible',true],['source_approved',true]]);});
});
test('owner route denies anonymous and unrelated owners before querying listings',async()=>{
 const db=database({});await withApi(db,(req,res)=>res.status(401).json({error:'Sign in'}),async()=>true,async base=>{assert.equal((await fetch(base+'/owner/site')).status,401);});
 await withApi(db,(req,res,next)=>{req.cmsUser={id:'other'};next();},async()=>false,async base=>{assert.equal((await fetch(base+'/owner/site')).status,403);assert.equal((await fetch(base+'/owner/site',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({visible:true,status:'published'})})).status,403);});assert.equal(db.calls.length,0);
});
test('claim intake refuses an already claimed business without changing ownership',async()=>{
 const db=database({marketplace_listings:[{id:'one',claimed:true}]});await withApi(db,()=>{},async()=>false,async base=>{const r=await fetch(base+'/listings/test/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'claim',name:'Owner',email:'owner@example.test',message:'I own this business.'})});assert.equal(r.status,409);assert.equal(db.calls.some(c=>c.insert||c.update),false);});
});
test('public profile strips arbitrary nested keys and refuses non-web image URLs',()=>{
 const p=publicListing({claimed:true,profile:{business:{name:'Test',internal_notes:'private'},services:[{id:'one',name:'Service',private_margin:100}],photos:[['javascript:alert(1)','no']],testimonials:[],serviceTeam:{one:[]}}}).profile;
 assert.equal(p.business.internal_notes,undefined);assert.equal(p.services[0].private_margin,undefined);assert.deepEqual(p.photos,[]);
});
test('unpublished linked sites cannot be hydrated through marketplace detail',async()=>{
 const db=database({sites:[{id:'site',status:'previewing'}]});const {hydrateMarketplaceSite}=require('../lib/marketplaceSite');assert.equal(await hydrateMarketplaceSite(db,{claimed:true,site_id:'site'}),null);assert.equal(db.calls.length,1);
});
test('owner visibility save ignores publication and booking escalation fields',async()=>{
 const db=database({marketplace_listings:[{slug:'test',status:'draft',owner_visible:false}]});
 await withApi(db,(req,res,next)=>{req.cmsUser={id:'owner'};next();},async()=>true,async base=>{
 const r=await fetch(base+'/owner/site',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({visible:false,status:'published',booking_enabled:true})});assert.equal(r.status,200);const patch=db.calls.find(c=>c.update).update;assert.deepEqual(Object.keys(patch).sort(),['owner_visible','updated_at']);assert.equal(patch.owner_visible,false);
 });
});
test('linked profiles read current active site content, not a stale catalogue snapshot',async()=>{
 const db=database({sites:[{id:'site',status:'live',currency:'CAD',business_hours:{mon:{open:'09:00',close:'17:00',closed:false}},payments_enabled:true,payment_collection:'online'}],site_services:[{id:'svc',name:{en:'Current haircut'},description:{en:'Current description'},price_cents:4000,duration_minutes:60}],site_service_categories:[],site_team_members:[{id:'member',name:'Example',role:{en:'Barber'},metadata:{private:'never public'}}],site_team_service_links:[{service_id:'svc',team_member_id:'member'}],site_theme_settings:[{metadata:{smart_site:{about:'Current about'}}}],site_pages:[{id:'home'}],site_sections:[{section_type:'location_map',content:{address:'Current address'}}],site_testimonials:[]});
 const {hydrateMarketplaceSite}=require('../lib/marketplaceSite');const current=await hydrateMarketplaceSite(db,{site_id:'site',claimed:true,name:'Reviewed identity',category:'Barbershops',profile:{business:{about:'Stale'},paymentEnabled:true,paymentCollection:'online'}});
 const p=publicListing(current).profile;assert.equal(p.services[0].name,'Current haircut');assert.equal(p.business.about,'Current about');assert.equal(p.business.address,'Current address');assert.equal(p.team[0].metadata,undefined);assert.equal(current.profile.paymentEnabled,undefined);assert.equal(p.paymentCollection,undefined);assert.equal(publicListing({claimed:true,profile:{paymentEnabled:true,paymentCollection:'online'}}).profile.paymentEnabled,undefined);assert.deepEqual(p.serviceTeam.svc,['member']);
});
