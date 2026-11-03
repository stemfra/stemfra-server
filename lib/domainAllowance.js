// Managed website registration and annual renewal allowance (confirmed 2 November 2026).
const DOMAIN_CAP_CENTS = 3000;
function domainAllowance(subscription, retailCents) {
  const eligible = subscription?.provider === 'whop' && subscription.status === 'active'
    && Date.parse(subscription.current_period_end || '') > Date.now()
    && Object.hasOwn(require('./whop/websitePrices').PRICES,subscription.currency)
    && Number.isSafeInteger(subscription.monthly_amount_cents) && subscription.monthly_amount_cents > 0;
  return { eligible, capCents: DOMAIN_CAP_CENTS,
    included: eligible && Number.isSafeInteger(retailCents) && retailCents > 0 && retailCents <= DOMAIN_CAP_CENTS };
}
module.exports = { domainAllowance, DOMAIN_CAP_CENTS };
