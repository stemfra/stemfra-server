/** Read only existing public site fields after the directory publication gate passes. */
const en=value=>typeof value==='string'?value:(value?.en||'');
async function hydrateMarketplaceSite(db,row){
 if(!row.claimed||!row.site_id)return row;
 const siteResult=await db.from('sites').select('id,status,currency,business_hours').eq('id',row.site_id).maybeSingle();
 if(siteResult.error)throw siteResult.error;
 const site=siteResult.data;
 if(!site||site.status!=='live')return null; // A removed/unpublished site cannot remain bookable through a stale projection.
 const queries=[
 db.from('site_services').select('id,name,description,price_cents,duration_minutes,category_id').eq('site_id',site.id).eq('is_active',true).order('display_order'),
 db.from('site_service_categories').select('id,name').eq('site_id',site.id).eq('is_visible',true),
 db.from('site_team_members').select('id,name,role,photo_url,metadata').eq('site_id',site.id).eq('is_active',true).order('display_order'),
 db.from('site_team_service_links').select('service_id,team_member_id').eq('site_id',site.id),
 db.from('site_theme_settings').select('metadata,instagram_handle,facebook_handle,youtube_handle,tiktok_handle,twitter_handle').eq('site_id',site.id).maybeSingle(),
 db.from('site_pages').select('id').eq('site_id',site.id).eq('slug','home').eq('is_published',true).maybeSingle(),
 db.from('site_testimonials').select('id,author_name,quote,rating').eq('site_id',site.id).eq('is_visible',true).order('display_order'),
 ];
 const results=await Promise.all(queries);for(const result of results)if(result.error)throw result.error;
 const [services,categories,team,links,theme,page,testimonials]=results.map(x=>x.data);
 const sections=page?await db.from('site_sections').select('section_type,content').eq('site_id',site.id).eq('page_id',page.id).eq('is_visible',true):{data:[]};if(sections.error)throw sections.error;
 const content=type=>sections.data.find(s=>s.section_type===type)?.content||{};
 const location=content('location_map'),hero=content('hero'),story=content('rich_text'),smart=theme?.metadata?.smart_site||{};
 const photos=[hero.image_url,...(Array.isArray(smart.gallery)?smart.gallery:[])].filter((x,i,a)=>typeof x==='string'&&a.indexOf(x)===i).map(url=>[url,row.name]);
 const serviceTeam={};for(const link of links)(serviceTeam[link.service_id]||=[]).push(link.team_member_id);
 const profile={business:{name:row.name,category:row.category,address:location.address||row.address,phone:location.phone||row.phone,email:location.email||'',about:smart.about||en(story.body_i18n)||en(story.body)||''},
 services:services.map(s=>({id:s.id,name:en(s.name),description:en(s.description),priceLabel:s.price_cents==null?'Price on request':new Intl.NumberFormat('en',{style:'currency',currency:site.currency,maximumFractionDigits:0}).format(s.price_cents/100),durationMinutes:s.duration_minutes||0,category:en(categories.find(c=>c.id===s.category_id)?.name),featured:true})),
 team:team.map(t=>({id:t.id,name:t.name,role:en(t.role),photoUrl:t.photo_url})),soloShop:team.length===1||(team.length>0&&team.every(t=>t.metadata?.solo===true)),serviceTeam,photos,
 heroPhotos:(Array.isArray(smart.featured_photos)?smart.featured_photos:[]).map(url=>photos.find(p=>p[0]===url)).filter(Boolean),
 hours:[],businessHours:site.business_hours,testimonials,
 social:{instagram:theme?.instagram_handle,facebook:theme?.facebook_handle,youtube:theme?.youtube_handle,tiktok:theme?.tiktok_handle,twitter:theme?.twitter_handle}};
 return {...row,profile};
}
module.exports={hydrateMarketplaceSite};
