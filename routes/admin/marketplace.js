/** Explicit staff review only. Never import CRM rows or automatically approve claims. */
const router=require('express').Router();
const db=require('../../config/supabase');
const {requireStaffRole,PLATFORM_OPS}=require('../../middleware/staffAuth');
const {CATEGORIES}=require('../../lib/marketplace');
router.use(requireStaffRole(...PLATFORM_OPS));
router.use((req,res,next)=>{res.set('Cache-Control','no-store');if(process.env.MARKETPLACE_ENABLED!=='true')return res.status(503).json({error:'Marketplace review is not enabled.'});next();});
router.get('/requests',async(req,res)=>{const {data,error}=await db.from('marketplace_requests').select('id,listing_id,kind,name,email,message,status,created_at').in('status',['pending','reviewing']).order('created_at').limit(100);if(error)return res.status(503).json({error:'Could not load requests.'});res.json({requests:data});});
router.patch('/requests/:id',async(req,res)=>{
 const {status,resolution}=req.body||{};
 if(!['reviewing','resolved','rejected'].includes(status)||typeof resolution!=='string'||resolution.trim().length<10||resolution.length>2000)return res.status(400).json({error:'Enter a review outcome and resolution note.'});
 // Resolving a claim is a record of review, never an automatic ownership transfer.
 const {data,error}=await db.from('marketplace_requests').update({status,resolution:resolution.trim(),reviewed_by:req.staffUser.id}).eq('id',req.params.id).select('id,status').maybeSingle();
 if(error)return res.status(503).json({error:'Could not record review.'});if(!data)return res.status(404).json({error:'Request not found.'});res.json({request:data});
});
router.post('/listings/:id/review',async(req,res)=>{
 const {action}=req.body||{};if(!['publish','suppress'].includes(action))return res.status(400).json({error:'Choose publish or suppress.'});
 const {data:row,error}=await db.from('marketplace_listings').select('id,status,category,source_license,source_label,checked_at,source_approved,claimed,booking_enabled,site_id').eq('id',req.params.id).maybeSingle();
 if(error)return res.status(503).json({error:'Could not load listing.'});if(!row)return res.status(404).json({error:'Listing not found.'});
 if(action==='publish'){
  if(row.status==='suppressed')return res.status(409).json({error:'Suppressed records require a separate reinstatement review and cannot be republished here.'});
  if(!CATEGORIES.includes(row.category)||!row.source_approved||!row.source_license||!row.source_label||!row.checked_at)return res.status(409).json({error:'Source eligibility and required public facts must be reviewed first.'});
  if(row.booking_enabled){const {data:site,error:siteError}=await db.from('sites').select('id,status').eq('id',row.site_id).maybeSingle();if(siteError||!row.claimed||site?.status!=='live')return res.status(409).json({error:'Online booking requires a claimed, linked live business.'});}
 }
 const {data,error:writeError}=await db.from('marketplace_listings').update({status:action==='publish'?'published':'suppressed',reviewed_by:req.staffUser.id,updated_at:new Date().toISOString()}).eq('id',row.id).eq('status',row.status).select('id,status').maybeSingle();
 if(writeError)return res.status(503).json({error:'Could not save review.'});if(!data)return res.status(409).json({error:'The listing changed. Reload before reviewing.'});res.json({listing:data});
});
module.exports=router;
