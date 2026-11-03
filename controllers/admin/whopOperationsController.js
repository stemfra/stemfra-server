const db=require('../../config/supabase'),core=require('../../lib/whop/core');
async function list(req,res){try{
 const cfg=core.config();
 const result=await db.from('whop_webhook_inbox').select('id,event_type,resource_id,status,attempts,next_attempt_at,last_error,created_at,completed_at')
 .eq('account_id',cfg.account).eq('sandbox',cfg.sandbox).order('created_at',{ascending:false}).limit(500);
 if(result.error)throw Error('Event history unavailable');
 const finance=await db.from('billing_charges').select('id,site_id,currency,amount_cents,metadata,site:sites(subdomain,metadata)').eq('provider','whop').eq('metadata->>sandbox',String(cfg.sandbox)).eq('metadata->whop_financial->>refund_review','true').order('created_at',{ascending:false}).limit(500);
 if(finance.error)throw Error('Payment exceptions unavailable');
 res.json({environment:cfg.sandbox?'sandbox':'production',events:result.data,financial:finance.data});
 }catch{res.status(503).json({error:'Payment activity is temporarily unavailable.'});}}
async function retry(req,res){try{
 const cfg=core.config();
 const result=await db.from('whop_webhook_inbox').update({last_retry_by:req.staffUser.id,last_retry_at:new Date().toISOString(),status:'pending',attempts:0,next_attempt_at:new Date().toISOString(),last_error:'staff_retry',locked_until:null,claim_token:null})
 .eq('id',req.params.id).eq('account_id',cfg.account).eq('sandbox',cfg.sandbox).eq('status','review').select('id');
 if(result.error)throw Error('retry unavailable');
 if(!result.data?.length)return res.status(409).json({error:'This event is not awaiting review.'});
 res.json({queued:true});}catch{res.status(503).json({error:'Could not queue verification.'});}}
module.exports={list,retry};
