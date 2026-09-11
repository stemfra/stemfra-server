# Outreach System — templates, sequencing & voice-call rules

**The system of record for how Stemfra prospects clients by email + phone.**
Consolidates what was built across the 2026-06-29 arc (see
[WORK_2026-06-29.md](WORK_2026-06-29.md) §1/§P4 for the build narrative) so the
design is findable in one place. Companion docs: [LEADGEN.md](LEADGEN.md)
(server trigger/flow) and [stemfra-ops/docs/LEADGEN.md](../../stemfra-ops/docs/LEADGEN.md)
(CRM review queue). Indexed in the [docs hub](../../docs/README.md).

> **⚠ Deliverability rules (2026-09-03): read
> [EMAIL_DELIVERABILITY.md](EMAIL_DELIVERABILITY.md) before changing any
> template or send path.** Live A/B-tested: cold touch 1 = ONE link
> destination, link-free footer, no List-Unsubscribe header, opt-out =
> reply "stop"; branded/multi-link emails only as in-thread replies.

---

## 1. The Template Manager — the single source of truth for email copy

**CRM → Email Templates** (`stemfra-ops/src/pages/EmailTemplates.jsx`), backed by
the **`email_templates`** table. 29 active templates in two families:

- **Part A — outbound prospecting (A1–A20)**, by category:
  - *Prospecting*: A1 cold first-touch · A2 no-reply follow-up · A3 warm ·
    A4 formal intro · A5 referral ask · A6 mutual-contact intro · A7 met-in-person ·
    A8 insight share · A9 seasonal angle
  - *Discovery & qualification*: A10 demo offer · A11 pricing · A12 social proof ·
    A13 objection "already have a website" · A14 objection "no time"
  - *Closing*: A15 proposal sent · A16 ready to start · A17 final follow-up
  - *Re-engagement*: A18 reconnect · A19 new reason · A20 breakup
- **Part B — tenant lifecycle (B1–B9)**: booking confirmation, day-before
  reminder, welcome, post-visit thank-you, win-back, rebooking nudge,
  review request, seasonal promo, anniversary. *(These are the seed material
  for Case 9's branded transactional-mail suite.)*

Templates carry **merge fields**. Two kinds — this distinction is load-bearing:
- `{{demo_link}}` and `{{start_free_link}}` are resolved **at send time** by the
  server (`lib/demoLinks.js fillOutreachLinks` — vertical → flagship demo URL +
  the self-serve pricing CTA). Drafts must keep them LITERAL.
- Everything else (`{{first_name}}`, `{{business_name}}`, `{{setup_fee}}`, …) is
  rendered by the **sequencer** for template sends, but NOT by `send-outreach`
  for the AI-drafted first email — the drafting agent substitutes real values.

The CRM page has AI refine presets (Shorten / Warmer / More direct / Fix grammar)
via `POST /api/leadgen/refine-template` (`lib/leadgenDraft.js`, GPT).

## 2. Who sends, and how

- All prospecting email goes out **as `mark@stemfra.com`** (Google service
  account with domain-wide delegation — `lib/gmailOutreach.js sendAsRep`).
  Real-inbox deliverability; replies land in Mark's actual mailbox.
- Every send carries a **1×1 open-tracking pixel**
  (`GET /api/leadgen/o/:token.gif` → `leads.outreach_opened_at/open_count`).
- The **reply sweeper** (`lib/outreachReplySweeper.js`) reads Mark's inbox;
  `lib/replyClassify.js` classifies: **unsubscribe** → `do_not_email` +
  `do_not_call` · **"no thanks"** → declined (stage lost) · **interested** →
  warm + a (guardrailed) call.
- A **Mark signature is auto-appended** when the body lacks his email — drafts
  and templates should not include their own signature block.

## 3. The agreed cadence (LAUNCH, 2026-08-19: max 3 contacts, then stop)

DB-driven — `crm_settings.leadgen_sequence` (tune in the DB/CRM, no deploy):

| Step | Day | What | Gate |
|---|---|---|---|
| 1 | 0 | **Claim touch 1** — the branded "Built for you" email (`lib/claimSend.js`, `templates/transactionalEmails.js prospectClaimEmail`), sent by `send-outreach` in mode `claim` (default; `crm_settings.leadgen_first_touch.mode`; `draft` = the old AI plain text) | Reviewer approves in the CRM Review Queue |
| 2 | +7 | **Mark's call** (`lib/leadgenCall.js`) | **read-gated**: only if touch 1 was OPENED and they haven't signed up |
| 3 | +14 | **Claim touch 2** — "Did you forget your website?" (same asset, ghost See-it-live) — step kind `claim_email` `{touch:2}` | still `outreach_status='sent'` |

**Send window (2026-08-19):** `crm_settings.leadgen_send_window {enabled, local_hour}` (CRM Review Queue → "Send at the recipient's local time", default ON at 11:00). Approving queues touch 1 as `outreach_status='scheduled'` + `outreach_scheduled_for` = the next local hour in the lead's US-state timezone (`lib/leadTimezone.js`); the sequencer sends it when due (independent of the drip master switch), and drip emails only go out inside the window. Calls keep their own 12:00–18:00 ET guardrail. The sweeper runs in PRODUCTION only (`OUTREACH_SWEEPER_DEV=true` opts a dev box in) so two servers on one DB never double-send.

Campaign window 21 days · 200 emails/day cap. Stops automatically on reply, bounce,
opt-out (one-click unsubscribe link + `List-Unsubscribe` headers → `do_not_email`), or
signup (a `contacts` row exists for the email; the Claim page signup also marks the
lead `won` via its token). Driven by `lib/outreachSequencer.js` (started from
index.js). The former A1→A2→call→A8→A20 drip is one settings change away
(`kind:'email'` steps with template codes); A2/A8/A20 stay in the Template Manager
for Mark's manual sends.

Every touch links to the prospect's **Claim page** `stemfra.com/claim/<claim_token>`
(`leads.claim_token`, a per-lead UUID) and is measured first-party in
`marketing_events` (email_sent_touch1/2, email_open, claim_page_view,
claim_cta_click, claim_see_live_click, signup_start, signup_complete, unsubscribe).
CRM: Lead Pipeline → **Funnel** tab (`GET /api/leadgen/funnel`).

**Voice-call guardrails** (`lib/callGuardrails.js canAutoCall`): never on
`do_not_call` · pan-US safe window **12:00–18:00 ET** · daily cap
`crm_settings.leadgen_daily_call_cap` (50).

**Master switches — all OFF by default** (`crm_settings`): `leadgen_auto_send`,
`leadgen_auto_call`, `leadgen_sequencer`. Until flipped in the CRM, everything
is reviewer-driven.

## 4. How Lead-Gen System B feeds this

The n8n workflow (*Stemfra Lead-Gen — System B v11*) scores each scraped
candidate and drafts `draft_subject`/`draft_message` → stored as
`leads.ai_draft_*` → reviewed (optionally refined via `refine-draft`) →
**`send-outreach` sends that draft as step 1**. Steps 2–5 never touch the
agent — the sequencer sends the literal A2/A8/A20 templates.

**A1 injection (2026-07-10):** `/api/leadgen/trigger` now fetches the active A1
template and passes it in the webhook payload (`template_a1`); the workflow's
Build Prompt node (`n8n-workflows/leadgen-build-prompt.js`) appends it to every
candidate prompt with the rules above (keep `{{demo_link}}`/`{{start_free_link}}`
literal, substitute real values elsewhere, omit the signature). **Editing A1 in
the CRM retunes the agent on the next run** — the Template Manager is genuinely
the single source of truth for the first email's structure. n8n paste files:
`leadgen-build-prompt.js` (Build Prompt node) + `leadgen-system-prompt.txt`
(Score & Draft (Agent) system prompt).

## 5. File map

| Piece | Where |
|---|---|
| Template Manager UI | `stemfra-ops/src/pages/EmailTemplates.jsx` + `hooks/useEmailTemplates.js` |
| Templates data | `email_templates` table (codes A1–A20, B1–B9) |
| Send as Mark + read replies | `stemfra_server/lib/gmailOutreach.js` |
| First-email send | `POST /api/leadgen/send-outreach` (routes/leadgen.js) |
| Drip engine | `stemfra_server/lib/outreachSequencer.js` |
| Voice call + guardrails | `lib/leadgenCall.js` + `lib/callGuardrails.js` (+ `lib/voiceBrain.js`) |
| Reply sweep + classify | `lib/outreachReplySweeper.js` + `lib/replyClassify.js` |
| Draft/template AI refine | `lib/leadgenDraft.js` (`refine-draft`, `refine-template`) |
| Demo/pricing links | `lib/demoLinks.js` (`{{demo_link}}`, `{{start_free_link}}`) |
| Cadence + switches | `crm_settings`: `leadgen_sequence`, `leadgen_auto_send`, `leadgen_auto_call`, `leadgen_sequencer`, `leadgen_daily_call_cap` |
| n8n paste files | `n8n-workflows/leadgen-build-prompt.js` + `leadgen-system-prompt.txt` |

## 6. Canada + UK outreach rules (CASL / PECR, P31, 2026-09-10)

One module knows the three markets: **`lib/outreachCompliance.js`**
(`marketFor(lead)` from `leads.region` / `phone_country`, `emailFooter`,
`reasonLine`, `smsSignOff`). The sequencer (`sendEmailStep`), the branded claim
email (`claimSend` → `prospectClaimEmail senderIdentification`) and the Claim
SMS (`POST /api/twilio/claim-sms`) all append from it. Plain text, no links, so
the deliverability rules above still hold.

| | Email (cold, B2B) | SMS | Phone |
|---|---|---|---|
| **US** (CAN-SPAM, TCPA) | Sender identity + postal address + opt-out honoured in 10 business days. | Consent first (the Claim SMS records verbal consent); STOP honoured. | 10DLC number; internal do-not-call list. |
| **Canada** (CASL, CRTC rules) | Implied consent when the business conspicuously published its address and the message concerns their business (our scraped listings qualify; keep the source). Footer = "Stemfra LLC, <address> · stemfra.com" + reply-stop; unsubscribe must work for 60 days and be honoured within 10 business days. | SMS is a "commercial electronic message" too: the Claim SMS names Stemfra + STOP for Canadian leads. Needs the same consent as email (the call gives express consent). | B2B calls are exempt from the National DNCL but the Unsolicited Telecommunications Rules apply: identify yourself and the purpose, respect the internal do-not-call list, call 9:00 to 21:30 weekdays / 10:00 to 18:00 weekends in the prospect's local time (CallGuard's 11 to 4 window sits inside). |
| **UK** (PECR, ICO) | Only **corporate subscribers** (Ltd / LLP / plc) may be emailed without consent; a **sole trader or partnership is an individual** and needs consent, which cold email does not have. Most barbershops and small salons are sole traders: in Review, check Companies House and route non-companies to phone, not email. Identity + opt-out in every message (the footer). | Same corporate-vs-individual split; the Claim SMS is consent-based (recorded on the call), so it is fine for both. | Cold B2B calls are allowed but must be **screened against the CTPS** (Corporate Telephone Preference Service) and the TPS for sole traders, with a monthly re-screen; identify the caller and offer an opt-out. We have no TPS/CTPS licence yet: obtain one (paid, from the TPS) before the first UK calling shift. |

Prerequisites before the first Canadian or UK sequence:
- Set `STEMFRA_MAILING_ADDRESS` (the LLC's mailing / registered-agent address) in
  `.env` + `deploy.yml`; until then the footer identifies Stemfra by name + web
  only and the server logs one warning at boot. CAN-SPAM wants the address too,
  so this closes a US gap as well.
- A TPS/CTPS subscription for UK call screening.
- UK email leads: set **Entity type** on the lead (Companies House link on the
  form). `emailAllowed()` refuses email to a GB lead unless it is a limited
  company; the sequencer logs the skip, Send Claim explains it.
- Twilio numbers per market: see ROADMAP P31 ("Twilio numbers for the UK and
  Canada").

### 6b. SMS consent: what the rules actually say (research 2026-09-11, Peter's question)

Question: does a personalised one-to-one text from a rep need consent, or only bulk marketing?
Answer for our lines: **consent first, personalisation changes nothing.** What matters is who
sends (an A2P 10DLC number through Twilio) and whether the recipient asked for it.

| Source | What it says | Effect on us |
|---|---|---|
| [Twilio Messaging Policy](https://www.twilio.com/en-us/legal/messaging-policy) | Prior express consent for every message, no B2B carve-out; consent per subject matter; keep proof of every consent. If someone texts you first, you may reply in that exchange (that does not cover ongoing outreach). | Our numbers are Twilio's, so this binds us before any law does. Verbal consent is fine if documented: Twilio's toll-free verification even asks for the verbal consent script (error 30511). |
| [CTIA Messaging Principles](https://www.twilio.com/en-us/blog/ctia-messaging-principles-and-best-practices) (carrier rulebook) | Conversational (they text first) needs nothing more; informational (they gave the number and asked) needs express consent; promotional needs express **written** consent. Accepted opt-in mechanisms include a keyword text, a web form, a button, and opt-in over the phone. Carriers filter or shut down senders without proof. | A recorded call where the owner says "yes, text me the link" is an opt-in over the phone. Keep the recording, the time, the rep. |
| TCPA (US) via [ActiveProspect](https://activeprospect.com/blog/tcpa-text-messages/), [Infobip](https://www.infobip.com/blog/tcpa-compliance-sms) | Applies to mobile numbers even when the owner is a business; marketing texts want prior express written consent; USD 500 to 1,500 per text. After Facebook v. Duguid a rep typing one text by hand is arguably not an autodialer, but that defence is litigated case by case and does nothing about Twilio's policy. | Do not rely on the "B2B" or "manual" arguments; rely on recorded consent. |
| [ICO PECR guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/electronic-mail-marketing/) (UK) | Texts to companies (Ltd, LLP) need no consent; sole traders and partnerships are individuals and need consent (or the soft opt-in, which needs a prior purchase). | Same split as our email gate (`entity_type`). Twilio's consent rule still applies on top. |
| CASL (Canada) via [CRTC FAQ](https://crtc.gc.ca/eng/com500/faq500.htm) | A text is a commercial electronic message. Implied consent exists when the business conspicuously published the number, did not say "no unsolicited messages", and the text concerns their business. | Real implied-consent path for scraped listings, but again Twilio's policy sits on top; the Claim SMS names Stemfra + STOP for Canada. |

How the CRMs Peter named handle it:
- **Kommo (amoCRM) + Twilio** ([integration page](https://www.kommo.com/integrations/twilio-sms/)): text any lead from the card, templates, mass actions, Salesbot triggers. No consent check anywhere; compliance is the customer's problem, and Twilio filters or suspends the customer, not Kommo.
- **monday.com + Twilio** ([Twilio's tutorial](https://www.twilio.com/en-us/blog/developers/tutorials/integrations/twilio-monday-com-integration-sms-messaging)): an automation recipe, same story, no consent model.
- **HubSpot SMS** ([knowledge base](https://knowledge.hubspot.com/sms/create-and-send-sms-messages)): the strict one. A contact needs an explicit opt-in on the SMS subscription type before any send: a keyword text, a form checkbox, or a rep manually marking consent "if they have given express and verifiable consent". That manual mark is exactly our "Owner agreed on the call".

Our model, therefore: the composer stays locked until (a) Send Claim during a call, (b) "Owner agreed on the call" recorded against a call in the timeline, or (c) the owner texted us first. Consent carries provenance (`leads.sms_consent_source / _by / _note`, migration `lead_sms_consent_v2.sql`) so we can answer a carrier escalation within Twilio's 24 hours. Cold texts and text sequences stay off the table.

## 7. Open items

- **Case 9** (P10) reworks the transactional side: one branded base template,
  migrate all system mail, Supabase auth emails via our SMTP — the B-family
  templates are its seed material.
- The B1–B9 tenant-lifecycle templates exist as copy but are **not yet wired**
  to automated tenant sends (booking confirmations use their own hardcoded
  mail today).
- Warm-track (`N8N_LEADGEN_WARM_URL`) workflow: same contract, separate n8n flow.
- UK sole-trader detection is manual (Companies House link on the lead form → `leads.entity_type`); the gate is automatic. A Companies House API lookup by name is the next step when UK volume justifies it.
