const {test}=require('node:test');
const assert=require('node:assert/strict');
test('Whop PDF requires matching environment/account/site binding and returns provider bytes',async()=>{
 const dbPath=require.resolve('../config/supabase'),saved=require.cache[dbPath];
 const core=require('../lib/whop/core'),oldConfig=core.config,oldFetch=global.fetch;
 let account='biz_ours',bound=true,downloads=0;
 try{
 require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{from(){return {select(){return this},eq(){return this},async maybeSingle(){return {data:bound?{id:'intent'}:null}}}}}};
 core.config=()=>({sandbox:true,account:'biz_ours',client:{payments:{retrieve:async()=>({account_id:account,membership_id:'mem_owned'}),generatePdf:async()=>({url:'https://assets.whop.com/provider.pdf'})}}});
 global.fetch=async()=>{downloads++;return {ok:true,arrayBuffer:async()=>Buffer.from('%PDF-provider-original')}};
 delete require.cache[require.resolve('../lib/whop/documents')];const {invoicePdf}=require('../lib/whop/documents');
 const charge={provider:'whop',site_id:'owned',metadata:{sandbox:true,whop_payment_id:'pay_owned'}};
 assert.equal((await invoicePdf(charge)).data.toString(),'%PDF-provider-original');
 await assert.rejects(()=>invoicePdf({...charge,metadata:{...charge.metadata,sandbox:false}}),/unavailable/);
 account='biz_other';await assert.rejects(()=>invoicePdf(charge),/wrong_whop_account/);
 account='biz_ours';bound=false;await assert.rejects(()=>invoicePdf(charge),/unbound/);assert.equal(downloads,1);
 }finally{core.config=oldConfig;global.fetch=oldFetch;if(saved)require.cache[dbPath]=saved;else delete require.cache[dbPath];}
});
test('Whop duplicate invoice email worker stays retired even when old flag is enabled',async()=>{
 const old=process.env.WHOP_RECEIPT_EMAIL_ENABLED;process.env.WHOP_RECEIPT_EMAIL_ENABLED='true';
 try{assert.deepEqual(await require('../lib/whop/receipts').drainReceipts(),{skipped:'whop_owns_payment_documents'});}
 finally{if(old===undefined)delete process.env.WHOP_RECEIPT_EMAIL_ENABLED;else process.env.WHOP_RECEIPT_EMAIL_ENABLED=old;}
});
test('renewal reminder contains amount/date and no invoice number or attachment',()=>{
 const {platformRenewalReminder}=require('../templates/transactionalEmails');
 const message=platformRenewalReminder({businessName:'Test website',amountLabel:'$299.00',renewalLabel:'2026-12-02',dashboardUrl:'https://cms.stemfra.com/billing'});
 assert.match(message,/299\.00/);assert.match(message,/2026-12-02/);assert.doesNotMatch(message,/INV-|invoice number|attached/i);assert.equal(message.attachments,undefined);
});
