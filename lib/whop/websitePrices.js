const PRICES=Object.freeze({USD:29900,CAD:40000,GBP:22500,KES:3000000});
function price(currency='USD') {
 if(!Object.hasOwn(PRICES,currency))throw Error('unsupported_subscription_currency');
 const row=require('../managedWebsiteCatalogue').active(currency);
 return {version:row?.id,key:row?.plan_key || (currency==='USD'?'managed_website':`managed_website_${currency.toLowerCase()}`),currency,cents:row?.monthly_cents ?? PRICES[currency],label:'Managed website',credits:0};
}
function offers(cfg){return Object.keys(PRICES).map(currency=>price(currency)).filter(p=>cfg.plans[p.key]?.plan).map(({currency,cents,version})=>({currency,monthlyCents:cents,version}));}
module.exports={PRICES,price,offers};
