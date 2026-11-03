const db = require('../../config/supabase');
const {siteKind,isTestEmail} = require('../testData');
const {sendMail} = require('../mailer');
const {renderEmail} = require('../../templates/baseEmail');
function message(kind,name,url) {
 const restored=kind==='restored';
 const subject=restored?'Your website is back online':'Your website is suspended';
 const copy=restored?`${name} is back online. Website editing and operations are available again.`:`${name} is offline and website editing and operations are paused. Your content is safe. Open billing to update your payment method and reactivate your website.`;
 return {subject,text:`${copy}\n\nBilling: ${url}`,html:renderEmail({eyebrow:'Website status',heading:subject,paragraphs:[copy],cta:{label:restored?'Open billing':'Reactivate website',url}})};
}
async function drainAccessNotices() {
 if(process.env.WHOP_ACCESS_EMAILS_ENABLED!=='true'||process.env.WHOP_SANDBOX!=='false'||process.env.EMAIL_PROVIDER!=='resend') return {skipped:'disabled'};
 const rows=await db.from('whop_access_notices').select('*,site:sites(id,status,subdomain,metadata,company:companies(name),owner:contacts!sites_owner_contact_id_fkey(email))').eq('status','pending').order('created_at').limit(50);
 if(rows.error) throw new Error('notice_lookup_failed');
 for(const row of rows.data||[]) {
 const site=Array.isArray(row.site)?row.site[0]:row.site;
 const owner=Array.isArray(site?.owner)?site.owner[0]:site?.owner;
 if(!site||siteKind(site)!=='real'||!owner?.email||isTestEmail(owner.email)) {await db.from('whop_access_notices').update({status:'skipped'}).eq('id',row.id).eq('status','pending');continue;}
 if(row.kind==='suspended' ? site.status!=='suspended' : site.status!=='live') {await db.from('whop_access_notices').update({status:'skipped'}).eq('id',row.id).eq('status','pending');continue;}
 if(row.locked_until&&Date.parse(row.locked_until)>Date.now()) continue;
 if(row.first_attempt_at&&Date.now()-Date.parse(row.first_attempt_at)>23*3600000) {await db.from('whop_access_notices').update({status:'review'}).eq('id',row.id).eq('status','pending');continue;}
 const stamp=new Date().toISOString();
 let claim=db.from('whop_access_notices').update({first_attempt_at:row.first_attempt_at||stamp,locked_until:new Date(Date.now()+300000).toISOString(),attempts:row.attempts+1}).eq('id',row.id).eq('status','pending').eq('attempts',row.attempts);
 const claimed=await claim.select('id');if(claimed.error||!claimed.data?.length) continue;
 const company=Array.isArray(site.company)?site.company[0]:site.company;
 const url=new URL('/billing',process.env.CMS_URL||'https://cms.stemfra.com');
 url.searchParams.set('site',site.id);
 const mail=message(row.kind,company?.name||site.subdomain,url.href);
 const result=await sendMail({fromName:'Stemfra',to:owner.email,...mail,idempotencyKey:`whop-access-${row.id}`});
 if(result) {const ack=await db.from('whop_access_notices').update({status:'sent',sent_at:new Date().toISOString(),locked_until:null}).eq('id',row.id).eq('attempts',row.attempts+1).select('id');if(ack.error||!ack.data?.length)throw new Error('notice_ack_requires_review');}
 }
 return {processed:true};
}
module.exports={message,drainAccessNotices};
