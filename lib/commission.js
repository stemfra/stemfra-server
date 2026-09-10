// Commission-model config (P13). Stemfra's business model is a FLAT commission on
// ALL tenant income (no tiers, no setup fee, no minimum). Stored as a single
// key/value row in crm_settings (same pattern as billing_active_provider /
// billing_plans in lib/billing/index.js) so it's editable without a deploy.
//
// Full plan: stemfra_server/docs/COMMISSION_MODEL.md.
const supabase = require('../config/supabase'); // single-var import (repo convention)

const COMMISSION_DEFAULTS = {
  rate: 0.05, // 5% of tenant income
  basis: 'all', // online bookings + at-visit collected + memberships + orders
  currency: 'USD',
};

async function getCommissionConfig() {
  const { data } = await supabase
    .from('crm_settings')
    .select('value')
    .eq('key', 'commission')
    .maybeSingle();
  return { ...COMMISSION_DEFAULTS, ...(data?.value || {}) };
}

async function setCommissionConfig(patch) {
  const next = { ...(await getCommissionConfig()), ...(patch || {}) };
  const { error } = await supabase
    .from('crm_settings')
    .upsert({ key: 'commission', value: next }, { onConflict: 'key' });
  if (error) throw error;
  return next;
}

// Stemfra's receiving bank account for commission invoices (Airwallex Global Account).
// Stored in crm_settings (not committed to a repo) so the invoice layer can print it.
// This is our OWN receiving account (meant to appear on invoices we send), not a secret key.
//
// Per-currency (P31, 2026-09-10): the top-level fields are the USD account; other
// currencies live under `by_currency` ({ CAD: {...}, GBP: {...} }) and are chosen by
// the invoice's currency. A block only counts when it carries what a payer in that
// country actually needs (CAD: transit + institution; GBP: sort code); otherwise
// the USD details (SWIFT-reachable) are used so an invoice never prints a stub.
// `contact_email` (billing@stemfra.com) rides on every block: the payment-questions
// address on invoices/emails and the Interac Autodeposit address for Canada.
const BILLING_EMAIL = 'billing@stemfra.com';
const REQUIRED_BY_CURRENCY = {
  CAD: ['account_number', 'transit_number', 'institution_number'],
  GBP: ['account_number', 'sort_code'],
  EUR: ['iban'],
};
function bankComplete(block, currency) {
  const need = REQUIRED_BY_CURRENCY[currency] || ['account_number'];
  return !!block && need.every((k) => block[k]);
}
async function getCommissionBank({ currency } = {}) {
  const { data } = await supabase
    .from('crm_settings')
    .select('value')
    .eq('key', 'commission_bank')
    .maybeSingle();
  const all = data?.value || null;
  if (!all) return null;
  const { by_currency: byCur, ...usd } = all;
  const cur = String(currency || 'USD').toUpperCase();
  const contact_email = all.contact_email || BILLING_EMAIL;
  if (cur !== 'USD' && bankComplete(byCur?.[cur], cur)) {
    return { ...byCur[cur], currency: cur, contact_email, account_name: byCur[cur].account_name || usd.account_name };
  }
  return { ...usd, currency: 'USD', contact_email };
}

async function setCommissionBank(details) {
  const { error } = await supabase
    .from('crm_settings')
    .upsert({ key: 'commission_bank', value: details }, { onConflict: 'key' });
  if (error) throw error;
  return details;
}

module.exports = {
  getCommissionConfig, setCommissionConfig, COMMISSION_DEFAULTS,
  getCommissionBank, setCommissionBank, BILLING_EMAIL,
};
