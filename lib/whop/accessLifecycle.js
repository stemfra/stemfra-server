const db = require('../../config/supabase');
const core = require('./core');
const { siteKind } = require('../testData');
let running = false;
async function sweepOnce({ dryRun = true } = {}) {
 if (process.env.WHOP_ACCESS_LIFECYCLE_ENABLED !== 'true') return { skipped: 'disabled' };
 const cfg = core.config();
 const rows = await db.from('subscriptions').select('site_id,metadata,site:sites(id,status,metadata,deleted_at)').eq('provider','whop');
 if (rows.error) throw new Error('access_lookup_failed');
 const actions=[];
 for(const sub of rows.data||[]) {
  const site=Array.isArray(sub.site)?sub.site[0]:sub.site;
  if(!site||site.deleted_at||(cfg.sandbox ? siteKind(site)!=='test' : siteKind(site)!=='real')) continue;
  const membership=sub.metadata?.whop_membership_id;
  if(!membership) continue;
  const binding=await db.from('whop_checkout_intents').select('id').eq('site_id',site.id).eq('membership_id',membership).eq('sandbox',cfg.sandbox).eq('state','paid').maybeSingle();
  if(binding.error||!binding.data) continue;
  try {
   const state=await core.snapshot(cfg,{type:'membership.updated',data:{id:membership}});
   if(!state||state.product!=='website') throw new Error('membership_mismatch');
   if(dryRun){actions.push({siteId:site.id,action:'verified_no_change'});continue;}
   const reconciled=await db.rpc('whop_reconcile',{p_event:`access-${require('node:crypto').randomUUID()}`,p_type:'membership.updated',p_snapshot:state,p_sandbox:cfg.sandbox});
   if(reconciled.error) throw new Error('access_reconcile_failed');
   const result=await db.rpc('whop_apply_site_access',{p_site:site.id,p_membership:membership,p_updated:state.updated_at,p_sandbox:cfg.sandbox});
   if(result.error) throw new Error('access_transition_failed');
   actions.push({siteId:site.id,...result.data});
  }catch { actions.push({siteId:site.id,action:'review_provider_unavailable'}); }
 }
 if (!dryRun) await require('./accessNotices').drainAccessNotices();
 return {actions};
}
function startAccessLifecycleSweeper() {
 if(process.env.WHOP_ACCESS_LIFECYCLE_ENABLED!=='true') return;
 const run=async()=>{if(running)return;running=true;try{await sweepOnce({dryRun:false});}catch{console.error('[whop] access lifecycle requires review');}finally{running=false;}};
 const timer=setInterval(run,60_000);timer.unref();void run();return timer;
}
module.exports={sweepOnce,startAccessLifecycleSweeper};
