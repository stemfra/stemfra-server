# Concierge refresh and assistant review, 26 October 2026

## Implemented locally

Chat context and native prompt now cover managed websites ($299/month, advertised 14-day trial), AI ($100/$200/$300 monthly; $1,000/$2,000/$3,000 annually; current seats/credits) and custom software (from $10,000/project). Current website trial wiring is still a preview; AI checkout remains disabled. No billing or entitlement changes.

Greeting and suggestions cover all three products. Server-owned links use /websites, /ai, /custom-software, /pricing, /templates, /contact and /docs. Removed Start free from chat buttons and budget fallback copy. Lead service classification accepts website, ai or custom_software, otherwise general; no test leads submitted. Existing call scheduler preserved.

Knowledge is a maintained server snapshot, not a dynamic cross-repository import. tests/concierge-offer.test.js compares AI prices/seats/credits with the marketing catalogue and verifies current offer constraints and destinations. Run from the workspace with `node --test stemfra_server/tests/concierge-offer.test.js`; the sibling marketing repository is required. Future offer changes must update the snapshot and parity checks together.

## Verification

- Server syntax checks passed; two offer/route regression checks passed.
- Marketing production build passed, prerendering 99 routes. Existing build warnings remain.
- Browser: new greeting, suggestions and pricing response; See pricing points to /pricing.
- Local endpoint: all three price sets and checkout limitations correct; retired commission question rejected; non-template business AI enquiry received /ai and /contact.
- No CRM lead writes, consultation bookings, SMS or voice calls were tested. No production verification or push.

## Help Center Copilot: review findings, not implemented

Sources: stemfra_client/src/app/docs/docsAssistantStore.js, DocsAssistantPanel.jsx, docs/data/{billing,account,gettingStarted,running,launch}.js.

1. Uses /api/concierge/send, so inherits new product pricing knowledge. It sends message/history only, not article content or current route. It is not an article-grounded support assistant today.
2. Panel renders CTA links but does not render book_call cards. Add a support mode with compatible contact actions, or implement the existing scheduler deliberately; do not silently return unusable cards.
3. Billing, account and getting-started articles still describe free websites and 5% commission with a $400 cap. Running/launch articles link to that guidance. Reconcile with actual existing-customer billing before rewriting: distinguish legacy accounts from the new advertised offer, without implying migration occurred.
4. Add current AI/custom-software help coverage and tested article references. Preserve product boundaries and actual available features.
5. Panel includes a voice telephone link. Do not change or test routing under the voice hold.

## Mark: read-only review findings

Sources: lib/conciergeContext.js buildVoiceKnowledge(), lib/voiceBrain.js.

- Voice knowledge still advertises free websites, commission, no monthly fees and start-free onboarding.
- Voice prompt explicitly forbids monthly pricing and uses the free/5% offer as the model answer.
- Call extraction instructs plan_discussed always null because it assumes plans are retired.
- Scope is website-only; needs three-product routing, current availability limits, and aligned follow-up descriptions.
- Update both voice knowledge and prompt together when voice work resumes; then separately review call summaries and CRM classification. Audit deployment/provider configuration at that time.
- buildVoiceKnowledge and voiceBrain were not changed; no Twilio or ElevenLabs calls/configuration/tests performed. Existing voice hold remains in force.

## Managed website browser walkthrough

26 October: tested category pricing selection, included features and getting started on localhost:5173. Pricing matched current context ($299/month, 14 days, no setup fee). Inclusions matched the context but rendered as a dense comma-separated paragraph. Pricing and getting-started answers exposed internal preview/checkout wording and emitted book_call, automatically opening the calendar without an explicit booking request. Confirmed client auto-opens on card.kind=book_call. No booking submitted. Corrections pending: structured website offer/inclusion cards, customer-facing next steps, and booking drawer only after explicit visitor intent or action.

Peter requested removal of preview/activation implementation wording. Website terms now describe available next steps; internal guardrails preserve truthful promises. Custom software pricing browser response matched $10,000 starting price, agreed scope/milestones and separately quoted ongoing services, but again auto-opened the calendar. Booking intent correction remains pending.

## 2026-10-26: Managed websites use template selection

Peter directed standard managed website onboarding to /templates, not consultation scheduling. Knowledge and prompt updated, CTA renamed Browse website templates. Scheduler instructions now require an explicit booking request or acceptance. Syntax and offer tests pass. Local only.


## 2026-10-26: General getting-started product choices

How do I get started? now returns a short three-product introduction with Browse websites (/templates), Custom Software (/custom-software), AI (/ai), in that order. General onboarding no longer routes solely to templates. Syntax and offer checks passed. Local only.

