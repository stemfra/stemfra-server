const db = require('../../config/supabase');
const core = require('./core');
const { createHash } = require('node:crypto');
const { mutateCompanyBillingProfile } = require('../billingProfile');
const addressKeys = ['line1', 'line2', 'city', 'state', 'postal_code', 'country'];
const regions = new Intl.DisplayNames(['en'], { type: 'region' });

// The preview runs on a single local API. Keep provider assignment and the
// subsequent CMS write ordered for each site.
const updating = new Set();
async function serialize(siteId, work) {
  if (updating.has(siteId)) throw new Error('card_update_in_progress');
  updating.add(siteId);
  try { return await work(); } finally { updating.delete(siteId); }
}

async function ownerCards(userId, siteId) {
  const cfg = core.config();
  // Resolve through paid, owner-authorized website bindings, never email matching.
  const contact = await require('../../middleware/cmsAuth').resolveContactId(userId);
  if (!contact) return { cfg, cards: [] };
  const owned = await db.from('sites').select('id').eq('owner_contact_id', contact).is('deleted_at', null);
  if (owned.error) throw new Error('owner_sites_unavailable');
  if (!owned.data?.length) return { cfg, cards: [] };
  if (siteId && !owned.data.some(site => site.id === siteId)) return { cfg, cards: [] };
  const intents = await db.from('whop_checkout_intents').select('membership_id')
    .in('site_id', owned.data.filter(site => !siteId || site.id === siteId).map(site => site.id)).eq('requested_by', userId).eq('sandbox', cfg.sandbox).eq('state', 'paid');
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
async function list(userId, siteId) {
  const { cards } = await ownerCards(userId, siteId);
  return cards.map(({ memberId, ...card }) => card);
}
async function setupBinding(siteId, userId) {
  const cfg = core.config();
  if (!cfg.sandbox || process.env.WHOP_SAVED_CARD_ENABLED !== 'true') throw new Error('card_change_unavailable');
  const subscription = await db.from('subscriptions').select('metadata,currency,provider,status').eq('site_id', siteId).maybeSingle();
  const membershipId = subscription.data?.metadata?.whop_membership_id;
  if (subscription.error || !membershipId || subscription.data.provider !== 'whop' ||
      subscription.data.status !== 'active') throw new Error('unbound_whop_membership');
  const binding = await db.from('whop_checkout_intents').select('receipt_email').eq('site_id', siteId)
    .eq('requested_by', userId).eq('product', 'website')
    .eq('membership_id', membershipId).eq('sandbox', true).eq('state', 'paid').maybeSingle();
  if (binding.error || !binding.data) throw new Error('unbound_whop_membership');
  const membership = await cfg.client.memberships.retrieve({ id: membershipId });
  if (membership.account?.id !== cfg.account || membership.status !== 'active') throw new Error('card_change_unavailable');
  const memberId = membership.member_id || membership.member?.id;
  if (!memberId) throw new Error('unbound_whop_member');
  return { cfg, membershipId, memberId, receiptEmail: binding.data.receipt_email,
    currency: subscription.data.currency?.toLowerCase(),
    scope: [siteId, cfg.account, membershipId, memberId].join(':') };
}
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
async function setupBuyer(binding) {
  const member = await binding.cfg.client.members.retrieve({ id: binding.memberId });
  if (member.id !== binding.memberId || member.account_id !== binding.cfg.account) throw new Error('wrong_whop_member');
  const email = normalizeEmail(member.email || binding.receiptEmail);
  if (!email || !binding.currency) throw new Error('missing_whop_buyer');
  return email;
}
async function setupConfig(siteId, userId) {
  const binding = await setupBinding(siteId, userId);
  const [email, record] = await Promise.all([setupBuyer(binding), cardProfile(siteId, binding.scope)]);
  return { accountId: binding.cfg.account, currency: binding.currency, email,
    defaultMethodId: record.defaultMethodId || null };
}
async function updateCardProfile(siteId, scope, change) {
  return mutateCompanyBillingProfile(siteId, (raw, fallback) => {
    const records = raw.whop_sandbox_cards || {};
    const { record, address } = change(records[scope] || {});
    const billingAddress = address ? { ...address, country: regions.of(address.country) } : {};
    return { ...fallback, ...raw, ...billingAddress, whop_sandbox_cards: { ...records, [scope]: record } };
  });
}
async function cardProfile(siteId, scope) {
  const { data, error } = await db.from('sites').select('company:companies(billing_profile)').eq('id', siteId).single();
  if (error || !data?.company) throw new Error('missing_card_profile');
  return data.company.billing_profile?.whop_sandbox_cards?.[scope] || {};
}
async function saveCard(siteId, userId, tokenId) {
  return serialize(siteId, async () => {
    const binding = await setupBinding(siteId, userId);
    const { cfg, memberId, currency, scope } = binding;
    const hash = createHash('sha256').update(tokenId).digest('hex');
    const record = await cardProfile(siteId, scope);
    if (record.lastSaved?.hash === hash) return { status: 'succeeded' };
    let pending = record.pending?.hash === hash ? record.pending : null;
    const email = await setupBuyer(binding);
    if (!pending) {
      const token = await cfg.client.confirmationTokens.retrieve({ id: tokenId, account_id: cfg.account });
      if (token.id !== tokenId || token.status !== 'pending' ||
          normalizeEmail(token.billing_details?.email) !== email) throw new Error('invalid_card_token');
      const address = Object.fromEntries(addressKeys.map(key => [key, token.billing_address?.[key]?.trim() || null]));
      if (!address.line1 || !address.city || !/^[A-Z]{2}$/.test(address.country || '') ||
          Object.values(address).some(value => value && value.length > 200)) throw new Error('invalid_card_address');
      pending = { hash, address };
      await updateCardProfile(siteId, scope, current => ({ record: { ...current, pending } }));
    }
    const setup = pending.setupId ? await cfg.client.setupIntents.retrieve({ id: pending.setupId })
      : await cfg.client.setupIntents.create({ account_id: cfg.account, confirmation_token: tokenId, email, currency },
        { idempotencyKey: `stemfra-cms-setup-${hash}` });
    if (setup.account_id !== cfg.account) throw new Error('wrong_whop_account');
    if (setup.status === 'processing') {
      pending = { ...pending, setupId: setup.id };
      if (!record.pending?.setupId) {
        await updateCardProfile(siteId, scope, current => ({ record: { ...current, pending } }));
      }
      return { status: 'processing' };
    }
    if (setup.status !== 'succeeded' || setup.member_id !== memberId || setup.payment_method_type !== 'card' ||
        !/^payt_[a-z0-9]+$/i.test(setup.payment_method_id || '')) {
      await updateCardProfile(siteId, scope, current => ({ record: { ...current, pending: null } }));
      throw new Error(setup.status === 'requires_action' ? 'card_requires_authentication' : 'card_setup_unconfirmed');
    }
    const methodId = setup.payment_method_id;
    await updateCardProfile(siteId, scope, current => ({ record: { ...current, pending: null, lastSaved: { hash },
      addresses: { ...current.addresses, [methodId]: pending.address } },
      address: current.defaultMethodId === methodId ? pending.address : undefined }));
    return { status: 'succeeded' };
  });
}
async function changeRenewalCard(siteId, userId, methodId) {
  return serialize(siteId, async () => {
    const { cfg, membershipId, memberId, scope } = await setupBinding(siteId, userId);
    const { cards } = await ownerCards(userId, siteId);
    if (!cards.some(card => card.memberId === memberId && card.id === methodId)) throw new Error('saved_card_not_owned');
    await cardProfile(siteId, scope);
    const updated = await cfg.client.memberships.update({ id: membershipId, payment_method_id: methodId });
    if (updated?.id !== membershipId) throw new Error('card_change_unconfirmed');
    try {
      await updateCardProfile(siteId, scope, record => ({ record: { ...record, defaultMethodId: methodId },
        address: record.addresses?.[methodId] }));
    } catch {
      throw new Error('card_updated_address_pending');
    }
  });
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
  const returnUrl = new URL('/billing?checkout=returned', origin);
  returnUrl.searchParams.set('site', siteId);
  // Buyer is present: allow issuer authentication instead of off-session charging.
  const payment = await cfg.client.payments.create({ account_id: cfg.account, plan_id: offer.plan,
    member_id: card.memberId, payment_method_id: card.id, off_session: false,
    return_url: returnUrl.href,
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
  const binding = await db.from('whop_checkout_intents').select('id,acquisition_mode,checkout_id,checkout_url').eq('site_id', siteId)
    .eq('requested_by', userId).eq('sandbox', cfg.sandbox).eq('saved_payment_id', paymentId).maybeSingle();
  if (binding.error || !binding.data) throw new Error('payment_not_owned');
  const state = await cfg.client.payments.retrieveStatus({ payment_id: paymentId });
  if (state.status === 'succeeded') {
    // Read repair uses a fresh provider payment, never a browser success claim.
    // The same transaction guards/idempotency apply as for signed webhooks.
    const snapshot = await core.snapshot(cfg, { type: 'payment.succeeded', data: { id: paymentId } });
    if (!snapshot || !snapshot.paid || snapshot.product !== 'website') throw new Error('payment_not_confirmed');
    if (require('./cmsCardCheckout').isCustom(binding.data) && snapshot.order_id !== binding.data.id) {
      throw new Error('payment_not_confirmed');
    }
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
module.exports = { ownerCards, list, subscribe, status, changeRenewalCard, setupConfig, saveCard };
