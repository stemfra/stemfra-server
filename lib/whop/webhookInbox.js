const DELAYS = [5, 15, 60, 300, 900, 3600, 10800];
function retryPlan(attempt, error) {
 const code=error.statusCode;
 const transient=code===undefined || [404,408,409,425,429].includes(code) || code>=500;
 const validation=/^(wrong_|unsupported_|.*_mismatch$|unbound_|different_current_|membership_already_bound|payment_period_requires_review)/.test(error.message||'');
 const retry=transient&&!validation&&attempt<8;
 return {status:retry?'pending':'review',delay:DELAYS[Math.max(0,attempt-1)]||10800,
  last_error:validation?'validation_requires_review':code?`provider_http_${code}`:'verification_unavailable'};
}
async function enqueue(db,cfg,event,deliveryId) {
 const result=await db.from('whop_webhook_inbox').upsert({delivery_id:deliveryId,account_id:cfg.account,
 sandbox:cfg.sandbox,event_type:event.type,resource_id:event.data.id},
 {onConflict:'account_id,sandbox,delivery_id',ignoreDuplicates:true});
 if(result.error)throw new Error('webhook_storage_unavailable');
 return {queued:true};
}
async function drain(db,cfg,processEvent,{limit=10,now=()=>Date.now()}={}) {
 let count=0;
 while(count<limit){
  const claimed=await db.rpc('whop_claim_webhook',{p_account:cfg.account,p_sandbox:cfg.sandbox});
  if(claimed.error)throw new Error('webhook_claim_unavailable');
  const row=claimed.data?.[0];if(!row)break;
  let patch;
  try{await processEvent(cfg,{type:row.event_type,data:{id:row.resource_id}},row.delivery_id);
   patch={status:'done',completed_at:new Date(now()).toISOString(),last_error:null};
  }catch(error){const plan=retryPlan(row.attempts,error);patch={status:plan.status,last_error:plan.last_error,
   next_attempt_at:new Date(now()+plan.delay*1000).toISOString()};}
  const saved=await db.from('whop_webhook_inbox').update({...patch,locked_until:null,claim_token:null})
   .eq('id',row.id).eq('claim_token',row.claim_token);
  if(saved.error)throw new Error('webhook_result_unavailable');
  count++;
 }
 return {processed:count};
}
let running=false;
function start(){
 if(process.env.WHOP_WEBHOOK_QUEUE_ENABLED!=='true')return;
 const run=async()=>{if(running)return;running=true;try{
  const core=require('./core');await drain(require('../../config/supabase'),core.config(),require('./service').processEvent);
 }catch{console.error('[whop] webhook queue temporarily unavailable');}finally{running=false;}};
 const timer=setInterval(run,5000);timer.unref();void run();return timer;
}
module.exports={enqueue,drain,start,retryPlan};
