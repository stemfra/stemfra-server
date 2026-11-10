const db = require('../../config/supabase');
const core = require('./core');
function cfg() { return core.config(); }
async function prepare(siteId, userId, email, currency = 'USD') {
  const identity=await require('../billingProfile').resolveBillingIdentity(siteId);
  require('../managedWebsiteCatalogue').assertAvailable(identity?.profile?.country,identity?.profile?.state);
  const c = cfg(), key = require('./websitePrices').price(currency).key, offer = c.plans[key];
  if (!offer.plan) throw new Error('plan_not_configured');
  const { data, error } = await db.rpc('whop_prepare_checkout', { p_target: siteId, p_user: userId,
    p_key: key, p_plan: offer.plan, p_product: 'website', p_sandbox: c.sandbox, p_email: email });
  if (error) throw new Error(error.message);
  if (data.acquisition_mode === 'saved_card') throw new Error('saved_card_payment_pending');
  if (data.checkout_url) return { url: data.checkout_url };
  if (data.checkout_id) throw new Error('checkout_already_pending');
  if (data.acquisition_mode === 'pending') {
    const claim = await db.from('whop_checkout_intents').update({ acquisition_mode: 'checkout' })
      .eq('id', data.id).eq('acquisition_mode', 'pending').select('id').maybeSingle();
    if (claim.error || !claim.data) throw new Error('checkout_already_pending');
  }
  const origin = process.env.WHOP_RETURN_ORIGIN || 'https://cms.stemfra.com';
  const returnUrl = new URL('/billing?checkout=returned', origin);
  returnUrl.searchParams.set('site', siteId);
  const result = await core.checkout(c, data, returnUrl.href);
  const saved = await db.from('whop_checkout_intents').update({ checkout_id: result.checkoutId, checkout_url: result.url }).eq('id', data.id);
  if (saved.error) throw new Error('checkout_save_failed');
  return { url: result.url };
}
async function receive(raw, headers) {
  const c = cfg();
  let event;
  try { event = core.verify(raw, headers, c); } catch { const error = new Error('invalid_signature'); error.status = 401; throw error; }
  if (process.env.WHOP_WEBHOOK_QUEUE_ENABLED === 'true') {
    return require('./webhookInbox').enqueue(db, c, event, headers['webhook-id']);
  }
  return processEvent(c, event, headers['webhook-id']);
}
async function processEvent(c, event, deliveryId) {
  const financial = await require('./financialState').receive(c,event,deliveryId);
  if(financial) return financial;
  const snapshot = await core.snapshot(c, event);
  if (!snapshot || snapshot.product !== 'website') return { ignored: true };
  if (process.env.MANAGED_WEBSITE_PURCHASE_ENABLED === 'true'
    && await require('../managedWebsitePurchaseService').receive(c, snapshot)) return { purchase_saved: true };
  if (snapshot.initial_failure) return require('./initialFailure')(db, snapshot, deliveryId, c.sandbox);
  const { data, error } = await db.rpc('whop_reconcile', { p_event: deliveryId, p_type: event.type, p_snapshot: snapshot, p_sandbox: c.sandbox });
  if (error) throw new Error(error.message);
  return data;
}
async function setCancellation(siteId, sub, cancel, feedback = {}) {
  const c = cfg(), membershipId = sub.metadata?.whop_membership_id;
  const binding = await db.from('whop_checkout_intents').select('id').eq('site_id', siteId)
    .eq('membership_id', membershipId).eq('sandbox', c.sandbox).eq('state', 'paid').maybeSingle();
  if (binding.error || !binding.data) throw new Error('unbound_whop_membership');
  const state = await core.setCancellation(c, membershipId, cancel, 'website');
  const result = await db.rpc('whop_reconcile', { p_event: `owner-${require('node:crypto').randomUUID()}`,
    p_type: 'membership.updated', p_snapshot: state, p_sandbox: c.sandbox });
  if (result.error) throw new Error('synchronization_unavailable');
  const saved = await db.from('subscriptions').select('*').eq('site_id', siteId).single();
  if (saved.error || saved.data?.cancel_at_period_end !== cancel) throw new Error('synchronization_unavailable');
  const recorded = await db.from('subscriptions').update({ metadata: { ...saved.data.metadata,
    cancel_reasons: cancel ? feedback.reasons || null : null,
    cancel_feedback: cancel ? feedback.feedback || null : null } }).eq('id', saved.data.id)
    .eq('cancel_at_period_end', cancel).select('*').single();
  if (recorded.error) throw new Error('synchronization_unavailable');
  return recorded.data;
}
module.exports = { prepare, receive, processEvent, setCancellation };
