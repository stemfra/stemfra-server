// ─── Twilio configuration + startup validation ──────────────────────────────
//
// Validates Twilio environment variables at module-load time and exports a
// pre-configured Twilio REST client plus phase-awareness helpers.
//
// Two tiers:
//
//   Phase 1 (REQUIRED — server fails fast if missing):
//     TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
//     These are needed for outbound SMS, status webhooks, and webhook
//     signature validation. Without them the SMS module can't function.
//
//   Phase 2 (OPTIONAL — warns and continues if missing):
//     TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_TWIML_APP_SID
//     These gate the Voice SDK token endpoint only. The /api/twilio/token
//     route checks isVoiceConfigured() and returns 503 instead of crashing.

const twilio = require('twilio');

const REQUIRED_VARS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

const PHASE_2_VARS = [
  'TWILIO_API_KEY_SID',
  'TWILIO_API_KEY_SECRET',
  'TWILIO_TWIML_APP_SID',
];

// ─── Required (Phase 1) — fail fast ──────────────────────────────────────────
const missingRequired = REQUIRED_VARS.filter(v => !process.env[v]);
if (missingRequired.length > 0) {
  console.error(
    `✗ Twilio is not configured. Missing required environment variable(s): ${missingRequired.join(', ')}.\n` +
    `   These are required for SMS to function. Set them in .env (local) or in\n` +
    `   .github/workflows/deploy.yml → environment-variables (production) and redeploy.`
  );
  process.exit(1);
}

// ─── Phase 2 — warn and continue ─────────────────────────────────────────────
const missingPhase2 = PHASE_2_VARS.filter(v => !process.env[v]);
if (missingPhase2.length > 0) {
  console.warn(
    `⚠ Twilio Voice SDK not configured (Phase 2). Missing: ${missingPhase2.join(', ')}.\n` +
    `   /api/twilio/token will return 503 until these are set. SMS still works.`
  );
}

const accountSid    = process.env.TWILIO_ACCOUNT_SID;
const authToken     = process.env.TWILIO_AUTH_TOKEN;
const apiKeySid     = process.env.TWILIO_API_KEY_SID    || null;
const apiKeySecret  = process.env.TWILIO_API_KEY_SECRET || null;
const twilioFrom    = process.env.TWILIO_PHONE_NUMBER;

// ─── Two lines per market (P31, Peter 2026-09-10) ────────────────────────────
// A prospect expects the text to come from the number that just called them,
// and a callback to reach whoever called. So each market has TWO identities:
//   STAFF line  = TWILIO_PHONE_NUMBER[_GB|_CA]: the reps' CRM dialer caller ID,
//                 the Claim SMS, owner alerts, consent confirmations; its
//                 inbound Voice URL is /api/twilio/inbound-voice (rings the
//                 reps), inbound SMS /api/twilio/sms-inbound.
//   MARK line   = VOICE_PHONE_NUMBER[_GB|_CA]: Mark's outbound calls AND the
//                 texts he sends in-call; its inbound Voice URL is
//                 /api/voice/concierge/incoming (Mark answers).
// A market with no number configured falls back to the US lines. Never point
// one number at both roles: a lead a rep called would then call back into Mark.
const MARKET_LINES = {
  staff: { GB: process.env.TWILIO_PHONE_NUMBER_GB, CA: process.env.TWILIO_PHONE_NUMBER_CA },
  mark:  { GB: process.env.VOICE_PHONE_NUMBER_GB,  CA: process.env.VOICE_PHONE_NUMBER_CA },
};
const countryOf = (to) => {
  try {
    const { parsePhoneNumber } = require('libphonenumber-js');
    const parsed = parsePhoneNumber(String(to || ''));
    return parsed && parsed.country;
  } catch { return null; }
};
const staffLine = (country) => MARKET_LINES.staff[String(country || '').toUpperCase()] || twilioFrom;
const markLine  = (country) => MARKET_LINES.mark[String(country || '').toUpperCase()] || process.env.VOICE_PHONE_NUMBER || twilioFrom;
const staffLineForNumber = (to) => staffLine(countryOf(to));
const markLineForNumber  = (to) => markLine(countryOf(to));
// Older names kept for the call sites: smsFrom = the staff line, voiceFrom = Mark's line.
const smsFrom   = staffLine;
const smsFromForNumber = staffLineForNumber;
const voiceFrom = markLine;
const voiceFromForNumber = markLineForNumber;
// ─── Where our numbers appear to be (Peter, 2026-09-15) ──────────────────────
// A first call shows the prospect the CITY of the caller's number, so a rep
// who says "I'm in Brooklyn" while the phone reads "Dover, DE" loses the call.
// The CRM shows the rep what the prospect sees. Exact localities come from
// TWILIO_LINE_LOCATIONS (JSON: { "+1302…": "Dover, Delaware" }, read from the
// Twilio Console); without an entry the area code gives the state / province,
// and a UK mobile just reads "United Kingdom".
const NANP_AREA = {
  302: 'Delaware', 667: 'Maryland', 410: 'Maryland', 443: 'Maryland', 212: 'New York', 646: 'New York', 917: 'New York',
  718: 'New York', 347: 'New York', 929: 'New York', 201: 'New Jersey', 973: 'New Jersey', 215: 'Pennsylvania', 267: 'Pennsylvania',
  305: 'Florida', 786: 'Florida', 407: 'Florida', 813: 'Florida', 404: 'Georgia', 470: 'Georgia', 312: 'Illinois', 773: 'Illinois',
  213: 'California', 310: 'California', 415: 'California', 424: 'California', 619: 'California', 818: 'California',
  206: 'Washington', 512: 'Texas', 713: 'Texas', 214: 'Texas', 469: 'Texas', 602: 'Arizona', 702: 'Nevada', 303: 'Colorado',
  416: 'Ontario', 647: 'Ontario', 437: 'Ontario', 905: 'Ontario', 365: 'Ontario', 613: 'Ontario', 514: 'Quebec', 438: 'Quebec', 604: 'British Columbia',
  778: 'British Columbia', 403: 'Alberta', 587: 'Alberta', 780: 'Alberta', 204: 'Manitoba', 902: 'Nova Scotia',
};
// Our six lines as the Twilio Console lists them (Peter's screenshot, 2026-09-15).
const KNOWN_LINE_LOCATIONS = {
  '+13025277810': 'Felton, Delaware',       // US staff line (the reps' caller ID)
  '+16672205540': 'Greensboro, Maryland',   // US Mark line
  '+13653615576': 'Markham, Ontario',       // CA staff line
  '+13656965918': 'Markham, Ontario',       // CA Mark line
  '+447723497148': 'United Kingdom (mobile)', // GB staff line
  '+447449911044': 'United Kingdom (mobile)', // GB Mark line
};
let lineLocationOverrides = { ...KNOWN_LINE_LOCATIONS };
try { Object.assign(lineLocationOverrides, JSON.parse(process.env.TWILIO_LINE_LOCATIONS || '{}')); } catch { /* keep the known map */ }
function lineLocation(number) {
  const n = String(number || '');
  if (!n) return null;
  if (lineLocationOverrides[n]) return lineLocationOverrides[n];
  try {
    const { parsePhoneNumber } = require('libphonenumber-js');
    const p = parsePhoneNumber(n);
    if (!p) return null;
    if (p.country === 'US' || p.country === 'CA') {
      const area = Number(String(p.nationalNumber).slice(0, 3));
      const region = NANP_AREA[area];
      return region ? `${region}, ${p.country === 'CA' ? 'Canada' : 'United States'}` : (p.country === 'CA' ? 'Canada' : 'United States');
    }
    if (p.country === 'GB' || String(p.countryCallingCode) === '44') return /^7/.test(String(p.nationalNumber)) ? 'United Kingdom (mobile)' : 'United Kingdom';
    return p.country || null;
  } catch { return null; }
}
const twimlAppSid   = process.env.TWILIO_TWIML_APP_SID  || null;
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://api.stemfra.com';

const twilioClient = twilio(accountSid, authToken);

/** True only when all Phase 2 vars are set — i.e. /token can mint Voice tokens. */
function isVoiceConfigured() {
  return Boolean(apiKeySid && apiKeySecret && twimlAppSid);
}

module.exports = {
  lineLocation,
  twilioClient,
  twilio,        // re-exported so routes can use twilio.jwt, twilio.twiml, etc.
  accountSid,
  authToken,
  apiKeySid,
  apiKeySecret,
  twilioFrom,
  smsFrom,
  smsFromForNumber,
  voiceFrom,
  voiceFromForNumber,
  staffLine,
  markLine,
  staffLineForNumber,
  markLineForNumber,
  twimlAppSid,
  publicBaseUrl,
  isVoiceConfigured,
};
