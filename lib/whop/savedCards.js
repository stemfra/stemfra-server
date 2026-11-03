const db = require('../../config/supabase');
const core = require('./core');

async function ownerCards(userId) {
  const cfg = core.config();
  // Resolve through paid, owner-authorized website bindings, never email matching.
  const contact = await require('../../middleware/cmsAuth').resolveContactId(userId);
  if (!contact) return { cfg, cards: [] };
  const owned = await db.from('sites').select('id').eq('owner_contact_id', contact).is('deleted_at', null);
  if (owned.error) throw new Error('owner_sites_unavailable');
  if (!owned.data?.length) return { cfg, cards: [] };
  const intents = await db.from('whop_checkout_intents').select('membership_id')
    .in('site_id', owned.data.map(x => x.id)).eq('requested_by', userId).eq('sandbox', cfg.sandbox).eq('state', 'paid');
  if (intents.error) throw new Error('payment_binding_unavailable');
  const members = new Set();
  for (const intent of intents.data || []) {
    if (!intent.membership_id) continue;
    const member = await cfg.client.memberships.retrieve({ id: intent.membership_id });
    if (member.account?.id !== cfg.account) throw new Error('wrong_whop_account');
    const id = member.member_id || member.member?.id;
    if (id) members.add(id);
  }
  const cards = [];
  for (const memberId of members) {
    const result = await cfg.client.paymentMethods.list({ member_id: memberId, first: 100, expired: false, broken: false });
    for (const method of result.data || []) {
      if (!method.card || method.card.expired || !/^\d{4}$/.test(method.card.last4 || '')) continue;
      if (!cards.some(x => x.id === method.id)) cards.push({ id: method.id, memberId,
        brand: method.card.brand || 'Card', last4: method.card.last4 });
    }
  }
  return { cfg, cards };
}
async function list(userId) {
  const { cards } = await ownerCards(userId);
  return cards.map(({ memberId, ...card }) => card);
}
async function subscribe(siteId, userId, email, methodId, currency = 'USD') {
  if (process.env.WHOP_SAVED_CARD_ENABLED !== 'true') throw new Error('saved_card_unavailable');
  const { cfg, cards } = await ownerCards(userId);
  const card = cards.find(x => x.id === methodId);
  if (!card) throw new Error('saved_card_not_owned');
  const identity=await require('../billingProfile').resolveBillingIdentity(siteId);
  require('../managedWebsiteCatalogue').assertAvailable(identity?.profile?.country,identity?.profile?.state);
  const key=require('./websitePrices').price(currency).key;
  const offer = cfg.plans[key];
  if (!offer.plan) throw new Error('plan_not_configured');
  const prepared = await db.rpc('whop_prepare_checkout', { p_target: siteId, p_user: userId,
    p_key: key, p_plan: offer.plan, p_product: 'website', p_sandbox: cfg.sandbox, p_email: email });
  if (prepared.error) throw new Error(prepared.error.message);
  const intent = prepared.data;
  if (intent.acquisition_mode === 'pending') {
    const claimed = await db.from('whop_checkout_intents').update({ acquisition_mode: 'saved_card',
      member_id: card.memberId, payment_method_id: card.id }).eq('id', intent.id)
      .eq('acquisition_mode', 'pending').select('id').maybeSingle();
    if (claimed.error || !claimed.data) throw new Error('payment_already_pending');
  } else if (intent.acquisition_mode !== 'saved_card' || intent.member_id !== card.memberId || intent.payment_method_id !== card.id) {
    throw new Error('payment_already_pending');
  }
  if (Date.now() - Date.parse(intent.created_at) >= 23 * 3600000) throw new Error('payment_requires_review');
  const origin = process.env.WHOP_RETURN_ORIGIN || 'https://cms.stemfra.com';
  // Buyer is present: allow issuer authentication instead of off-session charging.
  const payment = await cfg.client.payments.create({ account_id: cfg.account, plan_id: offer.plan,
    member_id: card.memberId, payment_method_id: card.id, off_session: false,
    return_url: new URL('/billing?checkout=returned', origin).href,
    metadata: { stemfra_order_id: intent.id, stemfra_product: 'website' } },
    { idempotencyKey: `stemfra-saved-card-${intent.id}` });
  // Webhooks perform authoritative reconciliation. Never mark paid from this response.
  const saved = await db.from('whop_checkout_intents').update({ saved_payment_id: payment.id })
    .eq('id', intent.id).eq('payment_method_id', card.id);
  if (saved.error) throw new Error('payment_requires_review');
  return status(siteId, userId, payment.id);
}
async function status(siteId, userId, paymentId) {
  const cfg = core.config();
  const binding = await db.from('whop_checkout_intents').select('id').eq('site_id', siteId)
    .eq('requested_by', userId).eq('sandbox', cfg.sandbox).eq('saved_payment_id', paymentId).maybeSingle();
  if (binding.error || !binding.data) throw new Error('payment_not_owned');
  const state = await cfg.client.payments.retrieveStatus({ payment_id: paymentId });
  if (state.status === 'succeeded') {
    // Read repair uses a fresh provider payment, never a browser success claim.
    // The same transaction guards/idempotency apply as for signed webhooks.
    const snapshot = await core.snapshot(cfg, { type: 'payment.succeeded', data: { id: paymentId } });
    if (!snapshot || !snapshot.paid || snapshot.product !== 'website') throw new Error('payment_not_confirmed');
    const reconciled = await db.rpc('whop_reconcile', { p_event: `verified-payment-${paymentId}`,
      p_type: 'payment.succeeded', p_snapshot: snapshot, p_sandbox: cfg.sandbox });
    if (reconciled.error) throw new Error('payment_sync_pending');
  }
  let actionUrl = null;
  if (state.next_action?.type === 'redirect') {
    const url = new URL(state.next_action.data.url);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('invalid_authentication_url');
    actionUrl = url.href;
  }
  return { status: state.status, paymentId, actionUrl };
}
module.exports = { ownerCards, list, subscribe, status };
