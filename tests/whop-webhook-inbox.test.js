const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');const {retryPlan,drain}=require('../lib/whop/webhookInbox');
test('retries temporary errors with bounded delays, sends validation to review',()=>{
 assert.equal(retryPlan(1,{statusCode:503}).delay,5);assert.equal(retryPlan(2,{statusCode:404}).delay,15);
 assert.equal(retryPlan(8,{statusCode:503}).status,'review');assert.equal(retryPlan(1,{message:'wrong_whop_account'}).status,'review');
 assert.equal(retryPlan(1,{statusCode:401}).status,'review');
});
test('inbox deduplicates, scopes claims, recovers leases and fences old workers',async()=>{
 const db=new PGlite();await db.exec('create role anon;create role authenticated;create role service_role;');
 await db.exec(fs.readFileSync('docs/migrations/20261102181500_whop_webhook_inbox.sql','utf8'));
 await db.exec("insert into whop_webhook_inbox(delivery_id,account_id,sandbox,event_type,resource_id) values('event','biz',true,'payment.failed','pay') on conflict do nothing;");
 assert.equal((await db.query("select * from whop_claim_webhook('other',true)")).rows.length,0);
 const first=(await db.query("select * from whop_claim_webhook('biz',true)")).rows[0];assert.equal(first.attempts,1);
 assert.equal((await db.query("select * from whop_claim_webhook('biz',true)")).rows.length,0);
 await db.exec("update whop_webhook_inbox set locked_until=now()-interval '1 second'");
 const second=(await db.query("select * from whop_claim_webhook('biz',true)")).rows[0];assert.notEqual(first.claim_token,second.claim_token);
 assert.equal((await db.query('update whop_webhook_inbox set status=\'done\' where claim_token=$1 returning id',[first.claim_token])).rows.length,0);
 await db.exec("update whop_webhook_inbox set attempts=8,locked_until=now()-interval '1 second'");
 await db.query("select * from whop_claim_webhook('biz',true)");assert.equal((await db.query('select status from whop_webhook_inbox')).rows[0].status,'review');
 assert.equal((await db.query("select has_table_privilege('authenticated','whop_webhook_inbox','SELECT') allowed")).rows[0].allowed,false);await db.close();
});
test('worker stores retry state rather than concluding payment failed on timeout',async()=>{
 let patch;let claims=0;const db={rpc:async()=>({data:claims++?[]:[{id:'row',claim_token:'token',attempts:1,event_type:'payment.failed',resource_id:'pay',delivery_id:'delivery'}]}),from:()=>({update(p){patch=p;return this;},eq(){return this;},then(resolve){return Promise.resolve({}).then(resolve);}})};
 await drain(db,{account:'biz',sandbox:true},async()=>{throw Object.assign(Error('timeout'),{statusCode:503});},{now:()=>0});
 assert.equal(patch.status,'pending');assert.equal(patch.next_attempt_at,'1970-01-01T00:00:05.000Z');
});
