const {test}=require('node:test');const assert=require('node:assert/strict');
test('service status emails contain reactivation link and no duplicate payment receipt',async()=>{
 const targets=['../config/supabase','../lib/mailer','../lib/testData'];const previous=targets.map(p=>require.cache[require.resolve(p)]);
 try{
 const values=[{}, {sendMail:async()=>{throw new Error('must not send')}}, {siteKind:()=> 'test',isTestEmail:()=>true}];
 targets.forEach((p,i)=>{const id=require.resolve(p);require.cache[id]={id,filename:id,loaded:true,exports:values[i]};});
 delete require.cache[require.resolve('../lib/whop/accessNotices')];
 const {message,drainAccessNotices}=require('../lib/whop/accessNotices');
 for(const kind of ['suspended','restored']){
 const mail=message(kind,'Cuts <script>','https://cms.stemfra.com/billing?site=test');
 assert.match(mail.text,/billing\?site=test/);assert.match(mail.html,/&lt;script&gt;/);assert(!mail.html.includes('<script>'));
 assert(!/invoice number|amount paid|receipt number/i.test(mail.text));
 assert.match(mail.html,kind==='suspended'?/Reactivate website/:/Open billing/);
 }
 const old=process.env.WHOP_ACCESS_EMAILS_ENABLED;delete process.env.WHOP_ACCESS_EMAILS_ENABLED;
 try{assert.deepEqual(await drainAccessNotices(),{skipped:'disabled'});}finally{if(old!==undefined)process.env.WHOP_ACCESS_EMAILS_ENABLED=old;}
 }finally{targets.forEach((p,i)=>{const id=require.resolve(p);if(previous[i])require.cache[id]=previous[i];else delete require.cache[id];});delete require.cache[require.resolve('../lib/whop/accessNotices')];}
});
