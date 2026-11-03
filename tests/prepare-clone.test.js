const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
function harness(){
 const source={id:'source',company_id:'source-company',template_id:'template',vertical_id:'vertical',metadata:{is_starter:true,nav_mode:'single'},currency:'USD',business_hours:{mon:{open:'09:00',close:'17:00'}}};
 const content={site_pages:[{id:'page',site_id:'source',title:{en:'Source Shop'}}],site_sections:[{id:'section',site_id:'source',page_id:'page',section_type:'hero',content:{title:'Source Shop'}}],site_service_categories:[{id:'category',site_id:'source',name:{en:'Hair'}}],site_services:[{id:'service',site_id:'source',category_id:'category',name:{en:'Cut'},photo_media_id:'old-media'}],site_team_members:[{id:'team',site_id:'source',name:'Original owner'}],site_team_service_links:[{id:'link',site_id:'source',team_member_id:'team',service_id:'service'}],site_availability_rules:[{id:'rule',site_id:'source',team_member_id:'team'}],site_testimonials:[],site_theme_settings:[{id:'theme',site_id:'source',accent_color:'#123456',metadata:{nav_mode:'single'}}]};
 let writes=0;
 const db={from(table){let filters={};const q={select(){return q},eq(k,v){filters[k]=v;return q},limit(){return q},single(){return q},maybeSingle(){return q},insert(){writes++;throw Error('Preparation wrote to database');},then(resolve,reject){let data;if(table==='sites')data=filters.subdomain?[]:source;else if(table==='companies')data={name:'Source Shop'};else data=content[table]||[];return Promise.resolve({data,error:null}).then(resolve,reject)}};return q;}};
 const mod={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../lib/provisionSite.js'),'utf8'),{module:mod,require:k=>k==='crypto'?require('crypto'):k==='../config/supabase'?db:k==='./localizeSiteMedia'?{scheduleLocalizeSiteMedia(){throw Error('Must not schedule media before commit');}}:k==='./verticalConfig'?{resolveVerticalSlug:s=>s,VERTICALS:{barbershops:{seedSite:'source'}}}:require(k),console});
 return {prepare:mod.exports.prepareClone,get writes(){return writes;},content};
}
test('prepared clone reuses source design and remaps every FK without database or media writes',async()=>{
 const h=harness();const out=await h.prepare({sourceSiteId:'source',siteId:'target',companyId:'company',contactId:'contact',displayName:'New Shop',overrides:{currency:'CAD',metadata:{cloned_from:'source',is_test:true}}});
 assert.equal(h.writes,0);assert.equal(out.site.currency,'CAD');assert.equal(out.site.template_id,'template');assert.equal(out.site.metadata.is_starter,undefined);assert.equal(out.site.metadata.nav_mode,'single');
 const rows=t=>out.rows.find(r=>r.table===t).records;
 assert.equal(rows('site_theme_settings')[0].accent_color,'#123456');
 assert.equal(rows('site_pages')[0].title.en,'New Shop');assert.equal(rows('site_sections')[0].page_id,rows('site_pages')[0].id);
 assert.equal(rows('site_services')[0].category_id,rows('site_service_categories')[0].id);assert.equal(rows('site_services')[0].photo_media_id,null);
 assert.equal(rows('site_team_service_links')[0].team_member_id,rows('site_team_members')[0].id);assert.equal(rows('site_team_service_links')[0].service_id,rows('site_services')[0].id);
 for(const group of out.rows)for(const row of group.records)assert.equal(row.site_id,'target');
 assert.equal(h.content.site_pages[0].title.en,'Source Shop');
});
