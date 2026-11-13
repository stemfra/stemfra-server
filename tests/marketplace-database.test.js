const {test}=require('node:test');const assert=require('node:assert/strict');const {PGlite}=require('@electric-sql/pglite');const fs=require('node:fs');const path=require('node:path');
test('directory migration enforces publication, booking and private request boundaries',async()=>{
 const db=new PGlite();try{
 await db.exec('create role anon;create role authenticated;create role service_role bypassrls;create table sites(id uuid primary key);');
 await db.exec(fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261104223516_marketplace_public_directory.sql'),'utf8'));
 const insert="insert into marketplace_listings(slug,name,category,source_label,source_license,checked_at) values ('example-room','Example room','Beauty salons','Test fixture','Test only',now()) returning id";
 const id=(await db.query(insert)).rows[0].id;
 await assert.rejects(db.query("update marketplace_listings set status='published' where id=$1",[id]),/check constraint/);
 await assert.rejects(db.query("update marketplace_listings set booking_enabled=true where id=$1",[id]),/check constraint/);
 await assert.rejects(db.exec("update marketplace_listings set category='CrossFit'"),/check constraint/);
 await db.exec('set role anon');await assert.rejects(db.exec('select * from marketplace_listings'),/permission denied/);await assert.rejects(db.exec('select * from marketplace_requests'),/permission denied/);await db.exec('reset role');
 await db.query("insert into marketplace_requests(listing_id,kind,name,email,message) values($1,'claim','Owner','owner@example.test','A fixture ownership request')",[id]);
 await assert.rejects(db.query("insert into marketplace_requests(listing_id,kind,name,email,message) values($1,'removal','Owner','OWNER@example.test','Another fixture request')",[id]),/Request cooldown/);
 assert.equal((await db.query('select claimed from marketplace_listings')).rows[0].claimed,false);
 }finally{await db.close();}
});
