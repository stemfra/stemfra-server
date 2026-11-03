const {test}=require('node:test');const assert=require('node:assert/strict');
const {PGlite}=require('@electric-sql/pglite');const fs=require('node:fs');const path=require('node:path');
test('suspended website data is locked while billing remains available; lifecycle notices queue once',async()=>{
 const db=new PGlite();const id='11111111-1111-4111-8111-111111111111';
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create function public.is_stemfra_staff() returns boolean language sql as 'select false';
 create table companies(id uuid primary key,name text);
 create table sites(id uuid primary key,status text,deleted_at timestamptz,metadata jsonb default '{}',company_id uuid);
 create table site_services(id int primary key,site_id uuid,name text);
 create table billing_charges(id int,site_id uuid);
 alter table sites enable row level security;alter table site_services enable row level security;alter table billing_charges enable row level security;
 grant usage on schema public to authenticated;grant all on sites,site_services,billing_charges to authenticated;
 create policy owner_all on sites for all to authenticated using(true) with check(true);
 create policy owner_all on site_services for all to authenticated using(true) with check(true);
 create policy owner_all on billing_charges for all to authenticated using(true) with check(true);
 insert into companies values('${id}','Original');
 alter table companies enable row level security; grant all on companies to authenticated; create policy owner_all on companies for all to authenticated using(true) with check(true);
 insert into sites values('${id}','live',null,'{}','${id}');insert into site_services values(1,'${id}','Haircut');insert into billing_charges values(1,'${id}');`);
 await db.exec(fs.readFileSync(path.join(__dirname,'../docs/migrations/20261102_whop_billing_only.sql'),'utf8'));
 await db.exec(`update sites set status='suspended',metadata='{"whop_access":{"membership":"mem_test","suspended_at":"2026-11-02T10:00:00Z"}}';set role authenticated;`);
 assert.equal((await db.query('select * from site_services')).rows.length,0);
 assert.equal((await db.query('select * from billing_charges')).rows.length,1);
 assert.equal((await db.query("update sites set status='live' returning id")).rows.length,0);
 await assert.rejects(db.exec(`insert into site_services values(2,'${id}','Other')`),/row-level security/);
 await db.exec('reset role');
 assert.equal((await db.query('select count(*)::int n from whop_access_notices')).rows[0].n,1);
 await db.exec(`update sites set status='live',metadata='{"whop_restored_at":"2026-11-02T11:00:00Z"}';update sites set status='live';`);
 assert.deepEqual((await db.query('select kind from whop_access_notices order by kind')).rows.map(r=>r.kind),['restored','suspended']);
 await db.exec('set role authenticated');assert.equal((await db.query('select * from site_services')).rows.length,1);
 }finally{await db.close();}
});
