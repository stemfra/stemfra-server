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
const twimlAppSid   = process.env.TWILIO_TWIML_APP_SID  || null;
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://api.stemfra.com';

const twilioClient = twilio(accountSid, authToken);

/** True only when all Phase 2 vars are set — i.e. /token can mint Voice tokens. */
function isVoiceConfigured() {
  return Boolean(apiKeySid && apiKeySecret && twimlAppSid);
}

module.exports = {
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
