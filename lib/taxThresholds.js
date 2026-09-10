// US economic-nexus thresholds — the sales/transaction levels at which Stemfra
// would have to register + collect in a state. Server-side copy of the numbers
// the CRM shows (stemfra-ops complianceCatalog THRESHOLD_OVERRIDE) — kept here
// so the nexus sweeper can flag jurisdictions approaching a threshold WITHOUT
// pulling in the full client-side taxability catalog. Only the threshold
// NUMBERS live here; the taxability/rate logic stays in the CRM. Confirm with
// the CPA; update when a state changes its thresholds.
const DEFAULT_THRESHOLD = { salesUsd: 100000, txns: 200 };
const THRESHOLD_OVERRIDE = {
  'US-CA': { salesUsd: 500000, txns: null },
  'US-TX': { salesUsd: 500000, txns: null },
  'US-NY': { salesUsd: 500000, txns: 100 },
  'US-TN': { salesUsd: 100000, txns: null },
  'US-WA': { salesUsd: 100000, txns: null },
};

// P31 (2026-09-10): Canada = the federal simplified GST/HST regime, CAD 30,000
// of sales to customers without a GST number in 12 months (Canadian tenants are
// billed in CAD, so the cents compare directly). UK = no threshold for a
// non-established supplier; the first sale is the trigger to confirm the B2B
// reverse-charge evidence or register, so it reads 100% at once.
const CA_FEDERAL_THRESHOLD_CAD = 30000;

function thresholdFor(jurisdiction) {
  if (/^CA-/.test(jurisdiction)) return { sales: CA_FEDERAL_THRESHOLD_CAD, currency: 'CAD', txns: null };
  if (jurisdiction === 'GB') return { sales: 0, currency: 'GBP', txns: null, firstSale: true };
  const t = THRESHOLD_OVERRIDE[jurisdiction] || DEFAULT_THRESHOLD;
  return { ...t, sales: t.salesUsd, currency: 'USD' };
}

// Fraction (0..) of the nearer prong (sales or transaction count) reached.
function nexusPct(jurisdiction, billedCents, invoiceCount) {
  const t = thresholdFor(jurisdiction);
  const salesPct = t.firstSale ? (billedCents > 0 ? 1 : 0) : t.sales ? (billedCents / 100) / t.sales : 0;
  const txnPct = t.txns ? invoiceCount / t.txns : 0;
  return Math.max(salesPct, txnPct);
}

module.exports = { DEFAULT_THRESHOLD, THRESHOLD_OVERRIDE, CA_FEDERAL_THRESHOLD_CAD, thresholdFor, nexusPct };
