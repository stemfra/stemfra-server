// Read-only production preparation check. Never creates a checkout or a charge.
const path=require('node:path');
require('dotenv').config({path:path.resolve(__dirname,'../.env'),quiet:true});
const core=require('../lib/whop/core');
const {price}=require('../lib/whop/websitePrices');
function stagingConfig(env){
 const names=['WHOP_ACCOUNT_ID','WHOP_API_KEY','WHOP_WEBHOOK_SECRET','WHOP_PLAN_MANAGED_WEBSITE','WHOP_PLAN_MANAGED_WEBSITE_CAD','WHOP_PLAN_MANAGED_WEBSITE_GBP','WHOP_PLAN_MANAGED_WEBSITE_KES','WHOP_RETURN_ORIGIN'];
 const missing=names.filter(k=>!env[k+'_PROD']?.trim()).map(k=>k+'_PROD');
 if(missing.length)return {missing};
 const mapped=Object.fromEntries(names.map(k=>[k,env[k+'_PROD'].trim()]));
 if(mapped.WHOP_RETURN_ORIGIN!=='https://cms.stemfra.com')throw Error('Production return origin must be https://cms.stemfra.com');
 const plans=names.filter(k=>k.startsWith('WHOP_PLAN_')).map(k=>mapped[k]);
 if(new Set(plans).size!==4)throw Error('Each currency must use its own verified production plan.');
 return {mapped:{...mapped,WHOP_ENABLED:'true',WHOP_SANDBOX:'false'}};
}
async function check(env=process.env){
 const staging=stagingConfig(env);
 if(staging.missing)return {ready:false,missing:staging.missing};
 const cfg=core.config(staging.mapped),offers=[];
 for(const currency of ['USD','CAD','GBP','KES']){
  const expected=price(currency),plan=await cfg.client.plans.retrieve({id:cfg.plans[expected.key].plan});
  if(plan.account?.id!==cfg.account)throw Error(`${currency}: plan belongs to a different account.`);
  if(plan.currency!==currency.toLowerCase()||Math.round(plan.renewal_price*100)!==expected.cents||plan.initial_price!==0||plan.trial_period_days)throw Error(`${currency}: plan price, currency, setup fee or trial differs from the approved offer.`);
  if(plan.billing_period!==30)throw Error(`${currency}: billing period requires review.`);
  offers.push({currency,price:expected.cents/100,billingPeriodDays:plan.billing_period});
 }
 return {ready:false,accountVerified:true,offers,remaining:['Verify the provider-returned subscription period dates in the hosted CMS.','Webhook signing, delivery, tax settings and hosted configuration must be verified separately.'],note:'Read-only checks passed. Production was not enabled.'};
}
if(require.main===module)check().then(result=>{console.log(JSON.stringify(result,null,2));if(!result.accountVerified)process.exitCode=1;}).catch(()=>{console.error('Production verification failed. Check credentials, account, plan configuration and network access. Secret values are not logged.');process.exitCode=1;});
module.exports={stagingConfig,check};
