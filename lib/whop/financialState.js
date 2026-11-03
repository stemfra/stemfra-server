const db=require('../../config/supabase'),core=require('./core');
const EVENTS=new Set(['refund.created','refund.updated','dispute.created','dispute.updated','dispute_alert.created','resolution_center_case.created','resolution_center_case.updated']);
async function refresh(cfg,paymentId,eventId,store=db) {
 const payment=await cfg.client.payments.retrieve({id:paymentId});
 if(payment.id!==paymentId)throw Error('payment_id_mismatch');
 if(payment.account_id!==cfg.account)throw Error('wrong_whop_account');
 const charge=await store.from('billing_charges').select('id,site_id,provider,metadata').eq('provider','whop').eq('metadata->>whop_payment_id',payment.id).maybeSingle();
 if(charge.error)throw Error('financial_lookup_unavailable');
 if(!charge.data)throw Error('unbound_whop_payment');
 if(charge.data.metadata?.sandbox!==cfg.sandbox)throw Error('payment_environment_mismatch');
 const bound=await store.from('whop_checkout_intents').select('id').eq('site_id',charge.data.site_id).eq('membership_id',payment.membership_id).eq('sandbox',cfg.sandbox).eq('state','paid').maybeSingle();
 if(bound.error||!bound.data)throw Error('unbound_whop_payment');
 const state={status:payment.status,substatus:payment.substatus,updated_at:core.iso(payment.updated_at),
 refunded_amount:payment.refunded_amount?{amount:payment.refunded_amount.amount,currency:payment.refunded_amount.currency}:null,
 refund_review:!!payment.refunded_at||/refund|dispute|resolution/.test(payment.substatus||'')};
 const recorded=await store.rpc('whop_record_financial_state',{p_charge:charge.data.id,p_event:eventId,p_state:state});
 if(recorded.error)throw Error('financial_record_unavailable');
 return {...state,paymentId:payment.id,manageUrl:core.safeUrl(charge.data.metadata.whop_manage_url,cfg.sandbox)|| (cfg.sandbox?core.PORTAL.replace('whop.com','sandbox.whop.com'):core.PORTAL)};
}
async function receive(cfg,event,deliveryId,store=db){
 if(!EVENTS.has(event.type))return null;
 const kind=event.type.split('.')[0];
 const resource=await cfg.client[kind==='refund'?'refunds':kind==='dispute'?'disputes':kind==='resolution_center_case'?'resolutionCenterCases':'disputeAlerts'].retrieve({id:event.data.id});
 if((resource.account_id||resource.account?.id)!==cfg.account)throw Error('wrong_whop_account');
 const paymentId=resource.payment_id||resource.payment?.id;
 if(!paymentId)throw Error('unbound_whop_payment');
 const result=await refresh(cfg,paymentId,deliveryId,store);return {financial_state_recorded:true,payment_id:result.paymentId};
}
module.exports={refresh,receive,EVENTS};
