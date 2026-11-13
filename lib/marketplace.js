/** Curated public projection. No CRM joins, implicit publication or ownership grants. */
const {hydrateMarketplaceSite}=require('./marketplaceSite');
const CATEGORIES = ['Barbershops', 'Beauty salons', 'Hair salons', 'Nails', 'Brows & lashes', 'Massage', 'Spa'];
const PUBLIC_FIELDS = 'id,slug,site_id,name,category,city,country,address,phone,website,image_url,source_label,source_url,checked_at,claimed,booking_enabled,profile,updated_at';
const text = (value, max = 300) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
function validateRequest(body) {
  const kind = text(body.kind, 30), name = text(body.name, 120), email = text(body.email, 254), message = text(body.message, 2000);
  if (!['claim', 'correction', 'removal'].includes(kind) || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10) return null;
  return { kind, name, email: email.toLowerCase(), message };
}
function publicHours(raw){const result={};for(const day of ['mon','tue','wed','thu','fri','sat','sun']){const h=raw?.[day];if(h&&typeof h==='object')result[day]={...(['open','close'].reduce((a,key)=>({...a,[key]:text(h[key],8)}),{})),closed:h.closed===true};}return result;}
function publicProfile(profile) {
  const p=profile && typeof profile==='object'?profile:{};
  const b=p.business||{};
  const services=Array.isArray(p.services)?p.services.slice(0,300).map(s=>({id:text(s.id,100),name:text(s.name,200),description:text(s.description,1500),priceLabel:text(s.priceLabel,80),durationMinutes:Number.isFinite(s.durationMinutes)?Math.max(0,s.durationMinutes):0,category:text(s.category,100),featured:s.featured===true})):[];
  const team=Array.isArray(p.team)?p.team.slice(0,100).map(t=>({id:text(t.id,100),name:text(t.name,150),role:text(t.role,150),photoUrl:safeUrl(t.photoUrl)})):[];
  const testimonials=Array.isArray(p.testimonials)?p.testimonials.slice(0,100).filter(t=>Number.isFinite(t.rating)&&t.rating>=1&&t.rating<=5).map(t=>({id:text(t.id,100),author_name:text(t.author_name,150),quote:{en:text(typeof t.quote==='string'?t.quote:t.quote?.en,3000)},rating:t.rating})):[];
  const social={};for(const key of ['instagram','facebook','youtube','tiktok','twitter']){const value=text(p.social?.[key],200);social[key]=value.includes(':')?safeUrl(value):value;}
  const serviceTeam={};for(const s of services)serviceTeam[s.id]=(Array.isArray(p.serviceTeam?.[s.id])?p.serviceTeam[s.id]:[]).filter(id=>team.some(t=>t.id===id));
  return {business:{name:text(b.name,200),category:text(b.category,100),address:text(b.address,500),phone:text(b.phone,80),email:text(b.email,254),about:text(b.about,5000)},services,team,serviceTeam,
    heroPhotos:Array.isArray(p.heroPhotos)?p.heroPhotos.slice(0,3).filter(x=>Array.isArray(x)&&safeUrl(x[0])).map(x=>[safeUrl(x[0]),text(x[1],200)]):[],
    businessHours:publicHours(p.businessHours),
    photos:Array.isArray(p.photos)?p.photos.slice(0,50).filter(x=>Array.isArray(x)&&safeUrl(x[0])).map(x=>[safeUrl(x[0]),text(x[1],200)]):[],
    hours:Array.isArray(p.hours)?p.hours.slice(0,14).filter(Array.isArray).map(x=>[text(x[0],80),text(x[1],100)]):[],
    reviews:testimonials.map(t=>({id:t.id,name:t.author_name,quote:t.quote.en})),testimonials,social,soloShop:p.soloShop===true};
}
function publicListing(row) {
  // Deliberately whitelist every public field, even if the DB query changes later.
  return { id: row.id, slug: row.slug, siteId: row.site_id, name: row.name, category: row.category,
    city: row.city, country: row.country, address: row.address, phone: row.phone,
    website: safeUrl(row.website), imageUrl: safeUrl(row.image_url), sourceLabel: row.source_label,
    sourceUrl: safeUrl(row.source_url), checkedAt: row.checked_at, claimed: row.claimed,
    bookable: !!(row.claimed && row.booking_enabled && row.site_id), profile: row.claimed ? publicProfile(row.profile) : null };
}
function createMarketplaceRouter({db, enabled, auth, owns}) {
  const router = require('express').Router();
  const intake=new Map();
  router.use((req,res,next)=>{if(req.method!=='POST')return next();const now=Date.now();for(const [key,value] of intake)if(value.until<now)intake.delete(key);const key=req.ip;const hit=intake.get(key)||{count:0,until:now+300000};if(hit.count>=10||intake.size>=10000)return res.status(429).json({error:'Too many requests. Please try again later.'});hit.count++;intake.set(key,hit);next();});
  router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); if (!enabled()) return res.status(503).json({error:'The marketplace is not available yet.'}); next(); });
  router.get('/listings', async (req, res) => {
    try {
      // Filtering a bounded curated catalogue avoids interpolating PostgREST filter syntax.
      const {data, error} = await db.from('marketplace_listings').select(PUBLIC_FIELDS).eq('status','published').eq('owner_visible',true).eq('source_approved',true).order('name').limit(1000);
      if (error) throw error;
      const q = text(req.query.q,100).toLowerCase(), city = text(req.query.city,100).toLowerCase(), category = text(req.query.category,80);
      const listings = (data || []).filter(r=>CATEGORIES.includes(r.category) && (!category||r.category===category) && `${r.name} ${r.category}`.toLowerCase().includes(q) && r.city.toLowerCase().includes(city)).map(publicListing);
      res.json({listings,categories:CATEGORIES});
    } catch { res.status(503).json({error:'Could not load businesses. Please try again.'}); }
  });
  router.get('/listings/:slug', async (req,res)=> {
    try {
      const {data,error}=await db.from('marketplace_listings').select(PUBLIC_FIELDS).eq('slug',req.params.slug).eq('status','published').eq('owner_visible',true).eq('source_approved',true).maybeSingle();
      if(error) throw error;
      if(!data||!CATEGORIES.includes(data.category)) return res.status(404).json({error:'Business not found.'});
      const current=await hydrateMarketplaceSite(db,data);if(!current)return res.status(404).json({error:'Business is not currently available.'});
      res.json({listing:publicListing(current)});
    } catch {res.status(503).json({error:'Could not load this business.'});}
  });
  // DB enforces a per-listing/email cooldown; never reveals existing request details.
  router.post('/listings/:slug/requests', async (req,res)=> {
    const input=validateRequest(req.body||{});
    if(!input) return res.status(400).json({error:'Enter your name, a valid email and at least 10 characters about your request.'});
    try {
      const {data:listing,error}=await db.from('marketplace_listings').select('id,claimed').eq('slug',req.params.slug).eq('status','published').eq('source_approved',true).eq('owner_visible',true).maybeSingle();
      if(error) throw error;
      if(!listing) return res.status(404).json({error:'Business not found.'});
      if(input.kind==='claim'&&listing.claimed) return res.status(409).json({error:'This profile is already claimed. Sign in or contact support.'});
      const result=await db.from('marketplace_requests').insert({listing_id:listing.id,...input});
      if(result.error?.code==='P0001') return res.status(429).json({error:'A request was recently received. Please wait before trying again.'});
      if(result.error) throw result.error;
      // Request intake only. No ownership, publication, billing or email side effect.
      res.status(202).json({message:'Request received for review. This does not transfer ownership or change the listing.'});
    } catch {res.status(503).json({error:'Could not send your request. Please try again.'});}
  });
  router.get('/owner/:siteId',auth,async(req,res)=> {
    try {
      if(!await owns(req.cmsUser.id,req.params.siteId)) return res.status(403).json({error:'Not your site.'});
      const {data,error}=await db.from('marketplace_listings').select('slug,name,status,owner_visible,claimed,booking_enabled,updated_at').eq('site_id',req.params.siteId).maybeSingle();
      if(error) throw error; res.json({listing:data});
    } catch {res.status(503).json({error:'Could not load marketplace settings.'});}
  });
  router.put('/owner/:siteId',auth,async(req,res)=> {
    if(typeof req.body?.visible!=='boolean') return res.status(400).json({error:'Choose listing visibility.'});
    try {
      if(!await owns(req.cmsUser.id,req.params.siteId)) return res.status(403).json({error:'Not your site.'});
      // Owners can opt out/in an already reviewed listing, never grant publication or booking.
      const {data,error}=await db.from('marketplace_listings').update({owner_visible:req.body.visible,updated_at:new Date().toISOString()}).eq('site_id',req.params.siteId).select('slug,status,owner_visible').maybeSingle();
      if(error) throw error; if(!data) return res.status(404).json({error:'A reviewed listing has not been created for this business yet.'});
      res.json({listing:data});
    } catch {res.status(503).json({error:'Could not save listing visibility.'});}
  });
  return router;
}
module.exports={CATEGORIES,PUBLIC_FIELDS,publicProfile,publicListing,validateRequest,createMarketplaceRouter};
