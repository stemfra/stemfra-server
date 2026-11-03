const { price, PRICES } = require('./whop/websitePrices');
const { currencyForCountry, regionalOffer } = require('./managedWebsiteOffer');

// The selected site's paid currency wins over travel/VPN location. With several
// businesses, never pick an arbitrary sibling's currency when they disagree.
function chooseOffer({ siteId, sites, subscriptions, billingCountry, contact, req }) {
  const usable = subscriptions.filter(s => Object.hasOwn(PRICES, s.currency));
  const selected = usable.find(s => s.site_id === siteId);
  let currency = selected?.currency;
  let source = currency ? 'subscription' : null;
  if (!currency) {
    const currencies = [...new Set(usable.map(s => s.currency))];
    if (currencies.length === 1) { currency = currencies[0]; source = 'owner_subscription'; }
  }
  const country = billingCountry || contact?.billing_profile?.country || contact?.country;
  if (!currency && country) { currency = currencyForCountry(country); source = 'billing_country'; }
  const accepted = sites.find(s => s.id === siteId)?.metadata?.onboarding?.fees_policy?.currency;
  if (!currency && Object.hasOwn(PRICES, accepted)) { currency = accepted; source = 'accepted_offer'; }
  if (!currency) { currency = regionalOffer(req).currency; source = 'location'; }
  return { currency, monthlyCents: price(currency).cents, version: price(currency).version, source };
}
async function ownerSubscriptionOffer(userId, siteId, req, store = require('../config/supabase')) {
  const contactResult = await store.from('contacts').select('id, country, billing_profile').eq('auth_user_id', userId).maybeSingle();
  if (contactResult.error) throw new Error('billing_preference_unavailable');
  const contact = contactResult.data;
  if (!contact) throw Object.assign(new Error('owner_required'), { status: 403 });
  const owned = await store.from('sites').select('id, metadata').eq('owner_contact_id', contact.id).is('deleted_at', null).order('created_at', { ascending: true });
  if (owned.error) throw new Error('billing_preference_unavailable');
  const sites = owned.data || [];
  if (siteId && !sites.some(s => s.id === siteId)) throw Object.assign(new Error('Not your site'), { status: 403 });
  const selectedId = siteId || sites[0]?.id;
  const subscriptions = sites.length ? await store.from('subscriptions').select('site_id, currency').in('site_id', sites.map(s => s.id)).eq('provider', 'whop').in('status', ['active', 'past_due']) : { data: [] };
  if (subscriptions.error) throw new Error('billing_preference_unavailable');
  // Only paid, owner-bound memberships from the current environment can supply
  // a recurring currency. Test records cannot set a production default.
  const bindings = sites.length ? await store.from('whop_checkout_intents').select('site_id').in('site_id', sites.map(s => s.id)).eq('requested_by', userId).eq('sandbox', process.env.WHOP_SANDBOX !== 'false').eq('state', 'paid') : { data: [] };
  if (bindings.error) throw new Error('billing_preference_unavailable');
  let billingCountry = null;
  if (selectedId) {
    const identity = await require('./billingProfile').resolveBillingIdentity(selectedId);
    billingCountry = identity?.profile?.country;
  }
  const boundSites = new Set((bindings.data || []).map(s => s.site_id));
  return chooseOffer({ siteId: selectedId, sites, subscriptions: (subscriptions.data || []).filter(s => boundSites.has(s.site_id)), billingCountry, contact, req });
}
module.exports = { ownerSubscriptionOffer, chooseOffer };
