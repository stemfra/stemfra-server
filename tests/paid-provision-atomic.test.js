const {test}=require('node:test');const assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');const fs=require('node:fs');const path=require('node:path');const {randomUUID}=require('node:crypto');
const migration=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261103211506_atomic_paid_website_provisioning.sql'),'utf8');
async function fixture(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create table companies(id uuid primary key,name text not null);
 create table contacts(id uuid primary key,auth_user_id uuid unique,company_id uuid references companies);
 create table sites(id uuid primary key,company_id uuid references companies,owner_contact_id uuid references contacts,template_id uuid,subdomain text unique,status text,metadata jsonb);
 create table site_pages(id uuid primary key,site_id uuid references sites,title text,created_at timestamptz not null default now());
 create table site_sections(id uuid primary key,site_id uuid references sites,page_id uuid references site_pages,content jsonb check(content->>'crash' is null));
 create table leads(id uuid primary key,stage text,won_at timestamptz,outreach_status text,engagement_status text,contact_id uuid,last_activity_at timestamptz);
 create table marketing_events(id uuid default gen_random_uuid(),lead_id uuid,event text,ip text,user_agent text,metadata jsonb);
 create table managed_website_purchases(id uuid primary key,auth_user_id uuid,site_id uuid references sites,state text,selection jsonb,snapshot jsonb,currency text,monthly_cents integer);
 `);
 const source=randomUUID(),template=randomUUID(),purchase=randomUUID(),user=randomUUID();
 await db.query(`insert into sites(id,template_id) values($1,$2)`,[source,template]);
 await db.query(`insert into managed_website_purchases values($1,$2,null,'paid',$3,$4,'KES',3000000)`,[purchase,user,{starterId:source},{paid:true,status:'active',currency:'KES',monthly_cents:3000000,period_end:'2099-01-01T00:00:00Z'}]);
 await db.exec(migration);
 function plan(){const co=randomUUID(),ct=randomUUID(),site=randomUUID(),page=randomUUID();return [
 {table:'companies',records:[{id:co,name:'Fictional test'}]},
 {table:'contacts',records:[{id:ct,auth_user_id:user,company_id:co}]},
 {table:'sites',records:[{id:site,company_id:co,owner_contact_id:ct,template_id:template,subdomain:'test-'+site,status:'previewing',metadata:{cloned_from:source}}]},
 {table:'site_pages',records:[{id:page,site_id:site,title:'Home'}]},
 {table:'site_sections',records:[{id:randomUUID(),site_id:site,page_id:page,content:{heading:'Prepared from reference'}}]}];}
 const run=(rows,owner=user)=>db.query('select provision_paid_website($1,$2,$3,$4,null) as site',[purchase,owner,source,rows]);
 const count=async table=>Number((await db.query(`select count(*) as n from ${table}`)).rows[0].n);
 return {db,plan,run,count,purchase,user,source};
}
test('crashes before site creation and during cloning leave no partial tenant and retry succeeds',async()=>{
 const f=await fixture();try{
 for(const phase of ['company','clone']){const rows=f.plan();if(phase==='company')rows[0].records[0].name=null;else rows[4].records[0].content.crash='injected';
 await assert.rejects(f.run(rows));assert.equal(await f.count('companies'),0);assert.equal(await f.count('contacts'),0);assert.equal(await f.count('sites'),1);
 assert.equal((await f.db.query('select state,site_id from managed_website_purchases')).rows[0].state,'paid');}
 const r=await f.run(f.plan());assert.ok(r.rows[0].site);assert.equal(await f.count('companies'),1);assert.equal(await f.count('site_sections'),1);
 assert.ok((await f.db.query('select created_at from site_pages')).rows[0].created_at);
 }finally{await f.db.close();}
});
test('lost response after commit and competing retries return one checkpoint, preserving content',async()=>{
 const f=await fixture();try{
 const first=(await f.run(f.plan())).rows[0].site;
 await f.db.query(`update site_sections set content='{"owner_edit":true}'`);
 const results=await Promise.all([f.run(f.plan()),f.run(f.plan())]);
 assert.deepEqual(results.map(r=>r.rows[0].site),[first,first]);assert.equal(await f.count('sites'),2);assert.equal(await f.count('contacts'),1);assert.equal(await f.count('companies'),1);
 assert.equal((await f.db.query('select content from site_sections')).rows[0].content.owner_edit,true);
 assert.equal((await f.db.query('select state from managed_website_purchases')).rows[0].state,'provisioning');
 }finally{await f.db.close();}
});
test('unpaid/foreign-owner/foreign-site rows cannot create a tenant; client execute is revoked',async()=>{
 const f=await fixture();try{
 await assert.rejects(f.run(f.plan(),randomUUID()),/purchase_owner_mismatch/);
 const rows=f.plan();rows[3].records[0].site_id=f.source;await assert.rejects(f.run(rows),/clone_scope_mismatch/);
 await f.db.query(`update managed_website_purchases set snapshot=snapshot-'paid'`);await assert.rejects(f.run(f.plan()),/purchase_not_paid/);
 assert.equal(await f.count('companies'),0);
 const perms=(await f.db.query(`select has_function_privilege('anon','provision_paid_website(uuid,uuid,uuid,jsonb,uuid)','execute') as anon,has_function_privilege('authenticated','provision_paid_website(uuid,uuid,uuid,jsonb,uuid)','execute') as client`)).rows[0];assert.deepEqual(perms,{anon:false,client:false});
 }finally{await f.db.close();}
});
