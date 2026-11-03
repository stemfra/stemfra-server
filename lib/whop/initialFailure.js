// Acknowledge only a provider-verified, locally bound failed first checkout.
// Keep the intent reusable; never bind a nonexistent membership or create access.
module.exports = async function recordInitialFailure(db, snapshot, eventId, sandbox) {
  if (!snapshot.order_id || !snapshot.checkout_id) throw new Error('unbound_failed_checkout');
  const { data: intent, error } = await db.from('whop_checkout_intents')
    .select('id,site_id,product,plan_id,sandbox,checkout_id,acquisition_mode')
    .eq('id', snapshot.order_id).maybeSingle();
  if (error) throw new Error('failed_checkout_lookup_unavailable');
  if (!intent || intent.product !== snapshot.product || intent.plan_id !== snapshot.plan_id
    || intent.sandbox !== sandbox || intent.checkout_id !== snapshot.checkout_id
    || intent.acquisition_mode !== 'checkout') throw new Error('failed_checkout_binding_mismatch');
  const saved = await db.from('whop_events').upsert({ id: eventId, event_type: 'payment.failed' },
    { onConflict: 'id', ignoreDuplicates: true });
  if (saved.error) throw new Error('failed_checkout_record_unavailable');
  return { initial_payment_failed: true, target_id: intent.site_id, new_payment: false };
};
