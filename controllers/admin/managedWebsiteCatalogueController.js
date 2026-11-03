const db=require('../../config/supabase');
const catalogue=require('../../lib/managedWebsiteCatalogue');
async function get(req,res){
 try{const data=await catalogue.read();const cfg=(()=>{try{return require('../../lib/whop/core').config();}catch{return null;}})();
 res.set('Cache-Control','no-store');res.json({sandbox:process.env.WHOP_SANDBOX!=='false',prices:data.rows.filter(p=>p.active).map(p=>({...p,plan_id:p.plan_id||cfg?.plans[p.plan_key]?.plan||''})),availability:data.availability});
 }catch{res.status(503).json({error:'Catalogue unavailable.'});}
}
async function save(req,res){
 try{
 const {id,monthly_cents,plan_id}=req.body||{};
 if(!Number.isSafeInteger(monthly_cents)||monthly_cents<=0||monthly_cents>100000000||typeof plan_id!=='string'||!/^plan_[a-zA-Z0-9]+$/.test(plan_id))return res.status(400).json({error:'Enter a valid amount and Whop plan ID.'});
 const data=await catalogue.read(), row=data.rows.find(p=>p.id===id&&p.active);
 if(!row)return res.status(409).json({error:'The price has changed. Reload the catalogue.'});
 const cfg=require('../../lib/whop/core').config();
 if(data.rows.some(p=>p.plan_id===plan_id)||Object.entries(cfg.plans).some(([key,p])=>p.plan===plan_id))return res.status(409).json({error:'Use a new Whop plan for a new price version.'});
 // Do not mutate provider plans or existing subscriptions. Read and verify only.
 const plan=await cfg.client.plans.retrieve({id:plan_id});
 if(plan.account?.id!==cfg.account||plan.currency!==row.currency.toLowerCase()||Math.round(plan.renewal_price*100)!==monthly_cents||plan.initial_price!==0||plan.trial_period_days||plan.billing_period!==30) return res.status(400).json({error:'Whop plan must match this account, currency, monthly amount, no setup fee and no trial.'});
 const result=await db.rpc('publish_managed_website_price',{p_id:id,p_cents:monthly_cents,p_plan:plan_id,p_user:req.staffUser.id});
 if(result.error)throw result.error;
 res.json({saved:true});
 }catch{res.status(409).json({error:'Could not activate this price. Check the plan or reload before trying again.'});}
}
async function availability(req,res){
 const {enabled,countries,regions,source_url}=req.body||{};
 if(typeof enabled!=='boolean'||!Array.isArray(countries)||countries.length>250||countries.some(c=>!/^\p{Lu}{2}$/u.test(c))||!Array.isArray(regions)||regions.length>100||regions.some(r=>!r||!/^\p{Lu}{2}$/u.test(r.country)||typeof r.region!=='string'||!r.region.trim()||r.region.length>100)||typeof source_url!=='string'||!source_url.startsWith('https://docs.whop.com/'))return res.status(400).json({error:'Review the private availability policy fields.'});
 const result=await db.from('managed_website_availability').update({enabled,policy:{countries:[...new Set(countries)],regions},source_url,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString(),updated_by:req.staffUser.id}).eq('id',true);
 if(result.error)return res.status(503).json({error:'Could not save availability policy.'});
 res.json({saved:true});
}
module.exports={get,save,availability};
