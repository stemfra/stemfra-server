const { AsyncLocalStorage } = require('node:async_hooks');
const scope = new AsyncLocalStorage();
const currencies = ['USD','CAD','GBP','KES'];
async function read(store = require('../config/supabase')) {
 const [prices, availability] = await Promise.all([
  store.from('managed_website_prices').select('*').order('created_at'),
  store.from('managed_website_availability').select('*').eq('id',true).single(),
 ]);
 if(prices.error || availability.error || !prices.data?.length) throw Error('pricing_unavailable');
 const sandbox = process.env.WHOP_SANDBOX !== 'false';
 const rows = prices.data.filter(p=>p.sandbox===sandbox);
 if(currencies.some(c=>rows.filter(p=>p.currency===c&&p.active).length!==1)) throw Error('pricing_unavailable');
 return {rows,availability:availability.data};
}
function current(){return scope.getStore();}
async function middleware(req,res,next){
 try {const data=await read();scope.run(data,()=>next());}
 catch {res.status(503).json({error:'Pricing is temporarily unavailable. Please try again.'});}
}
function active(currency){return current()?.rows.find(p=>p.currency===currency&&p.active);}
function configure(cfg,data=current()) {
 if(!data)return cfg;
 for(const p of data.rows.filter(p=>p.sandbox===cfg.sandbox)){
  const baseKey=p.currency==='USD'?'managed_website':`managed_website_${p.currency.toLowerCase()}`;
  cfg.plans[p.plan_key]={key:p.plan_key,currency:p.currency,cents:p.monthly_cents,label:'Managed website',credits:0,
   plan:p.plan_id||cfg.plans[baseKey]?.plan||''};
 }
 return cfg;
}
function iso(value){
 const mapped=require('./geo').countryIso(value);if(mapped)return mapped;
 try {const names=new Intl.DisplayNames(['en'],{type:'region'});for(let a=65;a<=90;a++)for(let b=65;b<=90;b++){
  const code=String.fromCharCode(a,b);if(names.of(code)?.toLowerCase()===String(value).toLowerCase())return code;
 }}catch{}return null;
}
function available(country,region,policy=current()?.availability){
 if(!policy?.enabled)return true;
 const code=iso(country);const reg=String(region||'').trim().toLowerCase();
 return !(policy.policy.countries||[]).includes(code)&&!(policy.policy.regions||[]).some(r=>r.country===code&&String(r.region).toLowerCase()===reg);
}
function assertAvailable(country,region){if(!available(country,region))throw Object.assign(Error('Service is currently unavailable in your region.'),{status:403});}
function requestGate(req,res,next){
 try{assertAvailable(req.headers['cf-ipcountry'],req.headers['cf-region']);assertAvailable(req.body?.country,req.body?.state);next();}
 catch(e){res.status(403).json({error:e.message});}
}
function quoteGate(req,res,next){
 const currency=req.body?.subscriptionCurrency||req.body?.currency;
 const row=active(currency);
 if(!row||req.body?.pricingVersion!==row.id)return res.status(409).json({error:"The subscription price has changed. Reload billing and review the current price before continuing."});
 next();
}
module.exports={quoteGate,read,current,middleware,active,configure,scope,iso,available,assertAvailable,requestGate,currencies};
