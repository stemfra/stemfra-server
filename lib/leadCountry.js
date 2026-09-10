// ─── Which country a lead is in (P31 section 2, 2026-09-10) ──────────────────
// Scraped leads carry `region` (a US state code, a Canadian province code or
// GB) and usually NO `phone_country`, so every phone normalisation defaulted
// to +1 and a UK number like 020 7946 0000 became +12079460000. This is the
// one place that turns a lead into an ISO-2 country for phone parsing, the
// sender number and the compliance footer. Order: explicit phone_country →
// the region's country → US.
const { marketFor } = require('./outreachCompliance');

function countryForLead(lead) {
  const pc = String(lead?.phone_country || '').trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(pc)) return pc;
  return marketFor(lead) || 'US';
}

module.exports = { countryForLead };
