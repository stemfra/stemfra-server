const { price } = require('./whop/websitePrices');

function currencyForCountry() {
  return 'USD';
}
function regionalOffer() {
  const currency = currencyForCountry();
  return { currency, monthlyCents: price(currency).cents };
}

// Snapshot only the offer shown to new owners. This does not start a subscription.
function managedWebsiteAcceptance(currency = 'USD') {
  const offer = price(currency);
  return {
    catalogue_version: offer.version || null,
    product: 'managed_website',
    provider: 'whop',
    currency: offer.currency,
    monthly_amount_cents: offer.cents,
    billing_interval: 'month',
    commission_percent: 0,
    setup_fee_cents: 0,
    free_trial: false,
    taxes_included: false,
    currency_selected_at_checkout: false,
  };
}

module.exports = { managedWebsiteAcceptance, currencyForCountry, regionalOffer };
