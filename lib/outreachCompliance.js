// ─── Outreach compliance by market (P31, 2026-09-10) ─────────────────────────
//
// The US, Canada and the UK each have their own rules for a commercial email or
// text to a business. This module is the ONE place that knows them; the
// sequencer, the claim email and the Claim SMS ask it for the lines to append.
//
//   US  CAN-SPAM: identify the sender, give a working opt-out (honoured within
//       10 business days), include a valid physical postal address.
//   CA  CASL: consent (implied for a business that conspicuously published its
//       address, when the message concerns their business), sender name +
//       mailing address + a contact route, an unsubscribe mechanism that works
//       for 60 days and is honoured within 10 business days. Covers SMS too.
//   GB  PECR: a limited company or LLP ("corporate subscriber") may be emailed
//       without consent, with sender identity and an opt-out; a SOLE TRADER or
//       partnership counts as an individual and needs consent, so UK cold email
//       is for limited companies only (check Companies House in Review). Cold
//       calls must be screened against the CTPS/TPS.
//
// The rules are the same shape everywhere: say who we are, where we are, and
// how to stop. So the footer is universal; only the opt-out wording differs
// (email = reply "stop", SMS = reply STOP). The postal address comes from
// STEMFRA_MAILING_ADDRESS (the registered-agent / mailing address of Stemfra
// LLC); until it is set the identification line carries name + web only and
// the sequencer logs a warning once per boot. Deliverability rule respected:
// the footer is plain text, no links (docs/EMAIL_DELIVERABILITY.md).

const SENDER_NAME = 'Stemfra LLC';
const SENDER_WEB = 'stemfra.com';

const CA_REGIONS = new Set(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'CA', 'CANADA']);
const GB_REGIONS = new Set(['GB', 'UK', 'ENG', 'SCT', 'WLS', 'NIR', 'UNITED KINGDOM', 'ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND']);

let warnedOnce = false;

/** 'US' | 'CA' | 'GB' | null from `leads.region` (state / province / country code) or `phone_country`. */
function marketFor(lead) {
  const region = String(lead?.region || '').trim().toUpperCase();
  const pc = String(lead?.phone_country || '').trim().toUpperCase();
  if (CA_REGIONS.has(region) || pc === 'CA') return 'CA';
  if (GB_REGIONS.has(region) || pc === 'GB') return 'GB';
  if (region || pc === 'US') return 'US';
  return null;
}

function mailingAddress() {
  return String(process.env.STEMFRA_MAILING_ADDRESS || '').trim();
}

/** "Stemfra LLC, <address> · stemfra.com" (address omitted until configured). */
function identificationLine() {
  const addr = mailingAddress();
  if (!addr && !warnedOnce) {
    warnedOnce = true;
    console.warn('[outreachCompliance] STEMFRA_MAILING_ADDRESS is not set: outreach footers identify Stemfra by name + web only (CAN-SPAM / CASL want a postal address).');
  }
  return `${SENDER_NAME}${addr ? `, ${addr}` : ''} · ${SENDER_WEB}`;
}

const EMAIL_OPT_OUT = 'Reply "stop" and we will not email again.';

/**
 * Plain-text footer for a prospecting EMAIL (sequencer templates). Returns ''
 * when the body already carries an opt-out line AND the identification, so a
 * template that spells both out is not doubled.
 */
function emailFooter(lead, body = '') {
  const hasStop = /\bstop\b/i.test(body);
  const hasId = body.includes(SENDER_NAME);
  const lines = [];
  if (!hasId) lines.push(identificationLine());
  if (!hasStop) lines.push(EMAIL_OPT_OUT);
  return lines.length ? `\n\n${lines.join('\n')}` : '';
}

/** The "reason" line under the branded claim email: reason + identification. */
function reasonLine(reason) {
  return `${reason} ${identificationLine()}.`;
}

/**
 * Trailing line for the Claim SMS. Peter's US copy stays as is ("Enjoy! Reply
 * STOP to opt out."); Canada and the UK name the sender in the message, which
 * CASL requires of any commercial text and PECR expects.
 */
function smsSignOff(lead) {
  const m = marketFor(lead);
  if (m === 'CA' || m === 'GB') return 'Enjoy! From Stemfra (stemfra.com). Reply STOP to opt out.';
  return 'Enjoy! Reply STOP to opt out.';
}

/**
 * May we send this lead a cold / follow-up EMAIL? UK PECR: only a corporate
 * subscriber (limited company, LLP, plc) without consent; a sole trader or
 * partnership is an individual. `leads.entity_type` records what Companies
 * House shows (null = unchecked, treated as not allowed for GB). Everyone else
 * is allowed here; do_not_email / consent checks stay where they are.
 */
function emailAllowed(lead) {
  if (marketFor(lead) !== 'GB') return { ok: true };
  if (lead?.entity_type === 'company') return { ok: true };
  return { ok: false, reason: 'pecr_entity_type', message: lead?.entity_type
    ? `UK PECR: a ${lead.entity_type.replace('_', ' ')} counts as an individual, so no cold email without consent. Phone instead (CTPS-screened).`
    : 'UK PECR: confirm on Companies House that this business is a limited company (set Entity type on the lead) before emailing.' };
}

module.exports = { marketFor, identificationLine, emailFooter, reasonLine, smsSignOff, emailAllowed, SENDER_NAME };
