const db = require('../../config/supabase');
const core = require('./core');
function cfg() { return core.config(); }
async function resumeHosted(siteId, userId, currency) {
  const c = cfg(), key = require("./websitePrices").price(currency).key;
    const { data, error } = await db.from('whop_checkout_intents').select('checkout_url')
      .eq('site_id', siteId).eq('requested_by', userId).eq('product', 'website')
      .eq('sandbox', c.sandbox).eq('state', 'pending').eq('plan_key', key).eq('acquisition_mode', 'checkout')
      .maybeSingle();
    if (error) throw error;
    if (!data?.checkout_url) throw new Error('no_hosted_checkout_pending');
    return { url: data.checkout_url };
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
module.exports = { resumeHosted, receive, processEvent, setCancellation };
