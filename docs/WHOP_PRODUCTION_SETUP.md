## Local GitHub deployment access, 4 November 2026

The ignored `stemfra_server/.env` now contains `PERSONAL_ACCESS_TOKEN`, copied unchanged with Peter's explicit approval from the previously documented local source. Its value is never printed or committed. Use `node scripts/github.cjs <gh arguments>` from stemfra_server; the helper supplies GH_TOKEN only to the child command. Normal `gh auth status` may still report signed out, so check this documented token path before requesting `gh auth login`. Repository access and Actions secret operations have been verified. The token is local release tooling, not a production API environment variable or browser/client setting. See AGENTS.md.

The website rollout mapping uses encrypted Actions secret `MANAGED_WEBSITE_PURCHASE_ENABLED_PROD`, defaultfalse, matching the established token's verified Secrets permissions. Existing workflow admin configuration has been moved unchanged into encrypted `STEMFRA_ADMIN_SECRET`; this is not a credential rotation. No AI settings were changed.

Sandbox URL saved by Peter and refreshed/read back: `https://favor-parks-absolute-game.trycloudflare.com/api/whop/webhook`. First replay timed out at5seconds after reaching/verifying/queuing; retry succeeded200 in1.19seconds and hook became Active. Inbox original delivery stayed done/attempt1; sandbox charge count remained4, current paid test intent/subscription remain1 each. No charge or duplicate processing. Evidence [successful replay](evidence/website-sandbox-replay-2026-11-04.png). Refresh the existing sandbox browser tab first if unavailable/stale before declaring access blocked.

4 November release preparation: production deployment is authorized. Isolated website release excludes parallel AI changes. New sandbox tunnel is reachable at favor-parks-absolute-game.trycloudflare.com; existing webhook URL save and signed replay remain pending because API403/browser unavailable. See [temporary sandbox webhook runbook](WHOP_SANDBOX_WEBHOOK_RUNBOOK.md). Production rollout flag mapping prepared defaultfalse; GitHub command-line sign-in pending. No push/deploy yet. No stranded provisioning purchase found; pending unpaid checkouts left unchanged.

4 November follow-up: atomic recovery migration is now applied to website stemfra-ops with Peter approval; real-schema clone rollback and existing-site retry pass. Sandbox website webhook dashboard currently Failing at old tex-united-parallel-pat.trycloudflare.com destination, which fails DNS resolution. Logs include2November503 Synchronization unavailable and later3November200 queued/received successes. Restore/repoint isolated test receiver and verify controlled delivery before treating webhook acceptance as current. AI hook/settings untouched. No new payment, provider config change or application deployment.

Local follow-up, 4 November: validation and atomic provisioning recovery code pass focused checks. Apply and verify `20261103211506_atomic_paid_website_provisioning.sql` as a separately authorized release prerequisite before enabling new checkout. Migration is currently unapplied; legacy stranded purchases require review. No production configuration was changed.

## 2026-11-03: Managed website production billing activated

At Peter's explicit request, activated the tested configuration without repeating production payment tests. Set the five server Actions secrets WHOP_ENABLED_PROD, WHOP_WEBHOOK_QUEUE_ENABLED_PROD, WHOP_SAVED_CARD_ENABLED_PROD, WHOP_ACCESS_LIFECYCLE_ENABLED_PROD and WHOP_ACCESS_EMAILS_ENABLED_PROD to true. Existing main deployment run [41617152201](https://github.com/stemfra/stemfra-server/actions/runs/41617152201) succeeded at commit 522e00f89caea1332733f86e80b5a426d44f6f9b; public health returned HTTP 200. Read-only schema inspection confirmed the five required Whop RPC definitions exist; no migration or database mutation was run.

Production webhook hook_JtQVtNSnhJPQJ is now Active after saving and reloading its dashboard. Endpoint is https://api.stemfra.com/api/whop/webhook, dated API version 2026-10-15-1, all events selected, sub-account events off. Renewal reminders and duplicate invoice email remain disabled. AI remains held and Airwallex unchanged. No production charge, sample event, replay or email test was performed; first signed production delivery is unverified by request. This supersedes earlier paused-switch status, not the separate remaining marketing/CRM release review or local-only sign-in alert fix.

# Current production comparison, 4 November 2026

Read-only comparison of sandbox biz_JXJPD9Q4Ta5thq and production biz_3yEQNCgp1hy3wV. No checkout creation, payment, webhook event/replay, account setting change or deployment.

| Configuration | Sandbox | Production | Assessment |
| --- | --- | --- | --- |
| Website recurring prices | USD299 / CAD400 / GBP225 / KES30000 | Same | Fresh provider reads match approved regional prices and the correct accounts. Existing plan IDs retained. |
| Initial fee / trial | 0 / none | 0 / none | Match. |
| Plan billing period | 30 days | 30 days | Match. Display actual provider-returned period dates; this is not a claim about all calendar-boundary behavior. |
| Product | Stemfra Managed Website, hidden | Stemfra Managed Website, hidden | Same visibility; production description correctly includes per-website billing, no setup fee/trial/commission and domain allowance up to US$30 while active. Sandbox description is explicitly test-only. |
| Plan visibility | USD visible; CAD/GBP/KES hidden | All four visible | Intentional-looking test/production difference, not a price or metadata blocker. No visibility change made or required for the current direct checkout integration. |
| Checkout metadata | Actual existing paid checkout contains all four keys below | New production payload uses the same shared sender | No metadata schema or product/dashboard configuration is required. No production checkout was created to test it. |
| Return destination | Existing test checkout has a temporary HTTPS tunnel, /activate-purchase | Workflow pins CMS_URL and WHOP_RETURN_ORIGIN to https://cms.stemfra.com | Keep production origin; do not copy sandbox tunnel settings. |
| Revised purchase endpoint | Local enabled test route | Hosted /api/website-purchase/config HTTP404 | New flow is not deployed. Existing managed-website billing activation is separate. |
| Revised purchase rollout flag | Local MANAGED_WEBSITE_PURCHASE_ENABLED=true | No deployment workflow mapping for this flag | Before an approved release, add explicit _PROD mapping defaultfalse, then enable only after acceptance gates. Not changed in this comparison. |
| Webhook current settings | API read403 | API read403 | Current keys cannot inspect webhook configuration. Browser attachment timed out; native app access was denied. No permissions expanded. |

## Checkout metadata and production updates

The shared server core.checkout creates checkout configurations with server-owned metadata:

- stemfra_order_id: durable purchase ID.
- stemfra_product: website.
- stemfra_template_id: selected approved source/template ID when present.
- stemfra_business_type: selected canonical business type when present.

Actual sandbox checkout ch_dcR3DODdh2rYMNd has all four. Existing local purchase reconciliation checks template/type against its saved record. An isolated fixture passed through both sandbox and production branches and produced identical metadata; no provider write occurred. Whop's installed SDK CheckoutConfiguration type documents that metadata is copied to payments and memberships. It is per-checkout data, not a product field to configure manually. Static product links do not run Stemfra's anonymous-purchase creation/binding path.

Required Stemfra release work: resolve setup validation and automatic pre-site crash recovery; prepare/release server, CMS and marketing together; add the explicit purchase feature flag mapping defaultfalse; verify hosted config/routes and canonical production return. Existing purchase and private progress tables are already applied to the shared Stemfra project with server-only access; do not blindly rerun migrations. Recheck prerequisites before release.

There is no evidence requiring new Whop products/plans or another API key solely for the added metadata. Production plan retrieval succeeded using the existing key. Checkout-write permission and provider propagation have not been freshly exercised in production because no new checkout/payment was requested.

Webhook evidence is dated, not refreshed: on3November production hook_JtQVtNSnhJPQJ was recorded active at https://api.stemfra.com/api/whop/webhook with API date2026-10-15-1 and all events. Sandbox hook_g7xlBRcIKALZr used the isolated local receiver/tunnel. Before release, recheck these through the signed-in dashboard; do not assume an API403 means the hook is disabled. No new event type is needed just because metadata gained fields. No signed production delivery was sent/verified in this comparison.

Existing production billing activation recorded above remains historical evidence. Duplicate invoice mail and advance renewal reminders remain disabled by workflow; AI and Airwallex are outside this rollout. Tax-account configuration was not changed or certified in this comparison.

Separate release finding: deployment workflow contains an existing hard-coded admin secret. Its value is not reproduced here; move it to encrypted configuration and rotate it before release. No credential change was attempted during this read-only comparison.

## Historical preparation notes

## 2026-11-02: Calendar-month confirmation required before launch

Peter explicitly selected confirm calendar-month billing first; do not switch the offer to every30days or enable production. Production credentials still need secure configuration. Fresh current Whop documentation https://docs.whop.com/api-reference/beta/variants/variant defines billing_period as number of days,30monthly/365annual; current CreateVariant likewise numericdayperiod. Installed SDK2.6.0 Plan billing_period has same contract and no calendar anchor/month interval found in plan/membership request definitions. This supports day-based configuration but does NOT establish whether Whop internally special-cases30 to calendar months. Provider clarification still required: same day each calendar month, January31/February handling, DST/timezone, applicable API field/account setting and effect on existing subscriptions. Do not send support messages without Peter authorizing the destination/message.

Secure setup path verified in server .github/workflows/deploy.yml: WHOP_API_KEY and WHOP_WEBHOOK_SECRET use GitHub Secrets, public account/4plan IDs and flags use GitHub Variables. User enters actual secrets directly in authorized provider/deployment secret UIs; never chat, frontend, source, documentation or printed command output. No credentials created, secret access expanded, plan updated, charge or deployment performed. Existing sandbox settings preserved.

> Current launch scope, 2 November: Managed Websites only. USD299/CAD400/GBP225/KES30000 approved. Runtime and regional reconciliation implemented and locally tested; provider plan reads verified four prices, all fixed30days. Do not equate this with calendar-month billing. Production credentials and remaining provider acceptance are not complete. AI stays on hold. See latest WHOP_BILLING.md block for the consolidated remaining gates.

> 2026-11-02: Durable webhook inbox/retries applied and enabled locally; Whop replay200OK730ms, background verification done.15 focused tests pass. Pre-dispute refresh requirement recorded; dispute form and CRM queue-review UI still pending.

> 2026-11-02: Initial decline end-to-end acknowledgment verified200OK in2.25s. Earlier replay hit5s timeout although receiver finished later. Same-checkout recovery and durable webhook queue hardening pending.

> 2026-11-02: Actual initial decline handling fixed and receiver replay processed; provider dashboard acknowledgment Error still needs investigation. Test website remains unsubscribed, no paid invoice. 17 focused tests pass.

> Declined first-payment test prepared on separate unpublished test website; no payment submitted, actual failure/recovery webhook acceptance pending. Temporary receiver connection restored, recheck next session.

> Billing-only mode implemented and test-rehearsed: owner editing locked, billing/switch/signout accessible, service status notices queued atomically with sending disabled. Neutral unavailable template page local only, not deployed. Shared company profile guard rejected by auto-review and removed; shared profiles unchanged. Actual provider failure and email delivery acceptance remain open.

> Applied and rehearsed: access lifecycle migration, service-only permissions, test-site day6 live/day7 suspension/public unavailable/CMS available/recovery live. Original values restored. Direct SQL simulation only; actual failed-renewal provider event and scheduled worker acceptance remain pending, worker disabled. Suspended public fallback currently says No live site found; polished suspended-page treatment is deferred.

> Access lifecycle implementation prepared: server-only atomic status transition and paid-through tracking; default-disabled worker. Local timing/account/environment tests pass. Migration and test-site browser expiry/recovery rehearsal await approval. No live enforcement yet.

> 2 November policy update: Peter removed payment as a publishing prerequisite. Completeness and ownership checks remain. Paid-subscription expiry/suspension is a separate unfinished lifecycle rule. Do not purchase domains during this rehearsal; prior domain purchase success is user-reported.

> Current 2 November status: USD first and saved-card second-site payments, cancel/resume, Whop emails and original PDF verified. Duplicate Stemfra paid-invoice mail is retired. Seven-day failed-renewal grace approved; cancelled subscriptions end at paid expiry. Access enforcement, live failure/renewal/refund scenarios, regional activation and AI acceptance remain open. Older evidence below is dated.

# Whop billing: production setup and acceptance

Last updated: 2 November 2026. This is a preparation checklist, not authorization to enable production payments.

Read this together with [current billing implementation and evidence](WHOP_BILLING.md), [the roadmap](ROADMAP.md), and [the workspace handoff](../../SESSION_HANDOFF.md). Dated historical entries describe their date, not the current release state.

## Provider and product boundaries

| Product | Collection provider | Boundary |
| --- | --- | --- |
| Managed Websites | Whop | Owner-bound CMS checkout; website API and public schema |
| Stemfra AI subscriptions | Whop | Separate AI API, tenant ownership, database schema/project and webhook |
| Custom software | Airwallex | Existing project quotes, milestones, invoice references and reconciliation |
| A tenant's own customer payments | Existing tenant payment integration | Separate from the subscriptions above |

Do not change the global manual collection provider to Whop. Do not retire Airwallex custom software billing, historical invoices or project milestones. The CRM website subscription feed does not currently aggregate AI tenants.

## Commercial decisions

- Managed Website: USD299, CAD400, GBP225 or KES30000, monthly.
- AI: Starter USD100, Growth USD200, Business USD300, monthly.
- No free trials, setup fee or booking commission for the current subscription offer. Retain historical invoices as historical records.
- Peter confirmed 2 November: active website subscriptions cover domain registration and renewal up to USD30. Registration allowance exists for USD299 Whop subscriptions; renewal worker now skips customer invoices for covered USD299 subscriptions and routes exceptions to staff review locally. Regional eligibility now follows the approved four prices. Over-cap requests retain staff review; no domain purchase in this rehearsal.
- A 30-day money-back guarantee is not approved for advertising.
- Calendar-month versus fixed-day cadence must be checked in each actual plan. The accepted USD sandbox purchase ran November2 to December2; that does not validate every future cycle or regional plan.
- Runtime validates all four approved currency/price pairs. Actual regional payment and document acceptance remains required.

## Sandbox evidence register

| Scenario | Evidence and result | Remaining limit |
| --- | --- | --- |
| Owner-bound first payment | Clean Cuts CMS Subscribe created checkout `ch_49CCBGGac1D4kXo`; Peter submitted public test card4242; verified sandbox webhook and database reconciliation | Fake money only |
| Subscription | Membership `mem_SebfUADtizz3Ij`; active USD299; paid through 2December2026 at14:16:41.299UTC; current cancellation flag false | No actual renewal charge tested |
| Paid invoice | `INV-2AF6C1E0`, charge `2af6c1e0-61b3-49c2-870b-152670eece78`, payment `pay_49KXrcOmthsQ6n`; one paid USD299 invoice | Existing row predates billing snapshots |
| Whop receipt | Peter supplied delivered order-confirmation screenshot with amount, renewal and management link | Does not establish production deliverability |
| Cancel and resume | CMS actions changed provider flag true then false; paid end unchanged; invoice count remained one; actual provider readback matched | Expiry/access suspension not tested |
| Whop lifecycle emails | Peter supplied delivered cancellation and resumption screenshots | Failure/recovery/refund emails not accepted yet |
| Stemfra invoice email | One controlled outbox send accepted; status sent, attempts1, sent_at 2026-11-02T14:52:39.958Z; subject Your Stemfra invoice INV-2AF6C1E0; attached INV-2AF6C1E0.pdf; Peter confirmed inbox and PDF | Automatic invoice sending remains disabled |
| Invoice PDF | Owner download and rendered inspection verified full saved Stemfra address, issue/due November2, service November2–December2, paid total and provider reference | Older invoices still use live saved address; CMS list persisted due date remains pending |
| Webhook security | Existing tunnel reached sandbox-only receiver; unsigned request rejected401; real signed events reconciled | Original successful payment replay accepted200,duplicate=true;invoice count1,email attempts1 unchanged. Outage recovery remains pending |
| CRM | Canonical datasets, actual website subscription fields, environment, provider, currency-separated reporting; test/sandbox excluded from commercial totals | Staff sync-health/exception UI and AI aggregation pending |
| Advanced Clients table | Reuses CRM tablekit search, filters, row menu and pagination, sortable-header pattern from LeadTable; separate fields; amount aligned; both pages of19 accounts checked | No new bespoke table system introduced |

The PDF uses the customer's saved Stemfra billing address. It is not currently proof of synchronization with the separately entered fictional Whop checkout address.

## Dataset rules

Reuse `lib/testData.js`; never invent a second account classifier:

1. `metadata.is_test === true`: test.
2. Otherwise `metadata.is_starter === true`: demo.
3. Otherwise `metadata.internal === true`: internal.
4. Otherwise: real-classified, which alone does not establish a paying customer.

Record account kind separately from payment environment. Exclude nonreal accounts, seeded charges (`demo_seed`), sandbox and unresolved environments from commercial reporting. A real-money payment by a test account remains an accounting transaction even when excluded from customer traction. Keep test/demo records filterable; do not delete or relabel Clean Cuts to make a dashboard look live.

Legacy non-Whop transactions are identified as legacy, not newly verified production payments. Monetary totals are grouped by currency. Explicit compliance preview may include test data; default reporting must not.

## Email ownership

- Historical invoice-email experiment is retired. Whop supplies the original invoice/PDF; Stemfra does not send a duplicate.
- Whop sends receipts, payment and subscription notifications. Receipt, cancellation and resumption inbox delivery were accepted in sandbox.
- Removed the sentence about Whop sending notifications from both HTML and plain-text invoice templates at Peter's request. Do not send a replacement merely to correct that sentence in the already-delivered test email.
- Preserve Airwallex's separate existing branded invoice/receipt flow for custom software.
- Existing worker/table/config names still say receipt: `whop_receipt_outbox`, `lib/whop/receipts.js`, `WHOP_RECEIPT_EMAIL_ENABLED`. Their Whop message now contains an invoice. Names are compatibility identifiers, not a decision to send duplicate receipts.
- Preserve outbox locking, frozen payloads, stable idempotency keys and retry limits. Cached legacy receipt payloads are refused for review. Do not replace keys and resend historical delivered records.
- Before automatic sending, validate recipients, correct production links and provider-native notices, and verify one send per invoice.

## Database rollout register

| Target | Change | State |
| --- | --- | --- |
| Website/CMS, project `acxepovfklgthxmteqxr` (stemfra-ops) | [whop_billing_v1.sql](migrations/whop_billing_v1.sql) | Applied with Peter's explicit approval, 2November2026; tables/RLS/server-only function permissions read back |
| Website/CMS | [invoice snapshot function update](migrations/20261102145423_whop_invoice_snapshots.sql) | Applied with Peter approval on 2November2026; server-only permissions verified. Two local transaction tests pass. Actual newly collected invoice snapshot/PDF/email acceptance remains pending |
| AI | `stemfra_ai/db/migrations/0027_whop_billing.sql` | Previously recorded unapplied; no application in this run. Recheck actual AI project before proceeding |

The first migration also permits Whop in the subscription provider constraint and uses the actual subscription-status enum. The snapshot update applies to future invoices; do not invent/backfill historical billing identities. Review and coordinate any further shared database change with Peter.

## Temporary local setup

- CMS5180, marketing5173, CRM5178, website API4000.
- Website API locally enabled for Whop sandbox; `BACKGROUND_JOBS_ENABLED=false`. Startup confirmed jobs disabled.
- Existing public tunnel: `https://switches-levy-growth-sec.trycloudflare.com`.
- Receiver: `/tmp/stemfra-whop-billing-receiver.cjs`, loopback4055. It calls the actual website billing reconciliation service, enforces the sandbox account, exposes only webhook/health and checkout return redirect. It does not expose Twilio routes.
- Webhook path `/api/whop/webhook`; checkout return redirects to local CMS.
- Minimal log `/tmp/stemfra-whop-events.jsonl`; no payload/secret dump.
- Sandbox business `biz_JXJPD9Q4Ta5thq`; webhook `hook_g7xlBRcIKALZr`.
- Dashboard verified enabled, version `2026-10-15-1`, all96 events selected for sandbox. Sub-account events off. API key lacks `developer:manage_webhook`; dashboard was used.
- Automatic invoice flag stays off. One-message send temporarily enabled only inside its test process.
- Temporary processes and tunnel are not production infrastructure. Recheck availability before each resumed test.

## Finish sandbox before production configuration

- [x] Apply reviewed snapshot migration with approval and verify hosted function permissions.
- [ ] Verify future invoice immutability and persisted due date through an actual new payment, PDF, CRM and email paths.
- [x] Replay original successful provider delivery: duplicate=true,invoice count1 and sent-email attempts1 unchanged. New-event-ID duplicate payment fixtures also pass locally.
- [ ] Test delayed/out-of-order events and temporary receiver/database/provider failure with recovery.
- [ ] Test failed first payment without paid activation.
- [ ] Test failed renewal, notices, explicit grace boundary, suspension and recovery. Reconcile dated seven-day plan against the final agreed policy before enabling it.
- [ ] Verify cancellation at actual paid-period expiry across access paths. Current dialog promises website offline; full enforcement is not accepted.
- [ ] Test refunds and disputes, credit-note/accounting/access effects; cancellation is not a refund.
- [ ] Complete CAD/GBP/KES validation and account activation, not just provider price creation. EUR/NGN placeholders are not launch prices.
- [ ] Repeat account linking, entitlements/credits, invoice, email and lifecycle acceptance in the separate AI runtime.
- [x] Retire duplicate Stemfra Whop paid-invoice mail; provider owns original payment documents. Three-day reminder delivery and recovery notification acceptance remain open.
- [ ] Add operational visibility for pending/failed events and controlled reconciliation retries.

## Production account setup sequence

1. Confirm sandbox acceptance and release gates with Peter. Existing Airwallex card/whole-menu release holds are not silently removed by Whop implementation.
2. Peter supplies production secrets privately. Verify the connected Whop business, account ID and ownership. Never print, email or commit keys/secrets.
3. Verify the production offers, currencies, first/renewal amounts, cadence, no trials/setup, tax configuration and available payment methods. Do not reuse sandbox product/plan IDs.
4. Confirm the actual tax mode: Whop Collects and Remits, Whop Calculates/You Remit, or You Handle Tax. Tax appearing at checkout alone does not establish remittance responsibility. Review supported jurisdictions and inclusive/exclusive display in the actual account.
5. Review required permissions and event types against tested behavior. Sandbox all-events permission is not the production default. Use required payment and membership lifecycle events; decide refund/dispute event handling after acceptance. If webhook management remains dashboard-only, document the owner procedure.
6. Keep SDK and webhook API version aligned at `2026-10-15-1` with installed `@whop/sdk`2.6.0 until a tested coordinated upgrade. Newer plan/variant naming is a compatibility change, not a dashboard-only version switch.
7. Configure each API independently using the variables below. Verify each database target before migrations. A schema name is not proof of a separate project. Website and AI webhook signing secrets/endpoints must be independently correct.
8. Configure permanent HTTPS webhook URLs on the deployed APIs, real application return origins, production mail settings and observable webhook recovery. Never use the temporary tunnel in production.
9. Deploy reviewed APIs before opening customer checkout. Respect each repository's deployment mechanism and background-job policy. Verify hosted routes separately from Git push success.
10. Enable billing only after provider/database/URL verification. Keep duplicate Whop invoice email disabled;review and accept renewal reminders separately. Keep old subscription collection/reminders from duplicating Whop. Leave Airwallex custom software collection intact.
11. Obtain explicit authorization for the precise live test product/amount/recipient before charging. A separate USD5 website test product was proposed, not yet accepted or charged. Sandbox card4242 must never be used on live checkout.
12. Verify actual charge, payment-to-account activation, paid invoice/PDF/email, management/cancellation, reconciliation and settlement evidence. Fake-money success does not prove live settlement or refunds.
13. If a gate fails, stop opening new checkout while preserving existing paid access, invoice history and provider reconciliation; do not blindly disable webhooks or erase billing records. Diagnose and reconcile before retrying.

### Configuration register (values are secrets unless public identifiers/URLs)

| Variable | Production requirement |
| --- | --- |
| `WHOP_ENABLED` | Enable deliberately after deployment/configuration checks |
| `WHOP_SANDBOX` | Explicitly `false`; never rely on default |
| `WHOP_ACCOUNT_ID` | Verified production business/account ID |
| `WHOP_API_KEY` | Production key for the correct account with tested permissions |
| `WHOP_WEBHOOK_SECRET` | Exact signing secret for that API's permanent production webhook |
| `WHOP_PLAN_MANAGED_WEBSITE` | Verified production USD website plan; also set _CAD, _GBP and _KES plans after independent production verification |
| `WHOP_PLAN_LAUNCH_STARTER` | Verified AI Starter production plan |
| `WHOP_PLAN_LAUNCH_GROWTH` | Verified AI Growth production plan |
| `WHOP_PLAN_LAUNCH_BUSINESS` | Verified AI Business production plan |
| `WHOP_RETURN_ORIGIN` | Correct production CMS or AI application origin for that runtime |
| `WHOP_RECEIPT_EMAIL_ENABLED` | Keep false. Duplicate Stemfra Whop invoice mail is retired; use original Whop documents |
| `EMAIL_PROVIDER`, `RESEND_API_KEY`, sender configuration | Verified invoice sender and delivery; website path expects Resend |
| `CMS_PUBLIC_URL` | Correct public origin for owner invoice/magic links |
| `BACKGROUND_JOBS_ENABLED` | Follow deployed operational policy; local testing stays false |

Production links supplied by Peter, not verified in the main account during this run:

| Offer | Supplied checkout link |
| --- | --- |
| Managed Website | https://whop.com/checkout/plan_4Ai5KZN6ROwfM |
| AI Starter | https://whop.com/checkout/plan_GxLYUzXIgyZk2 |
| AI Growth | https://whop.com/checkout/plan_mAP5O5oJ6RVNk |
| AI Business | https://whop.com/checkout/plan_5Ev5UVXJTVLMQ |

Public links identify offers. Application activation still requires an authenticated, owner-bound checkout intent and verified provider events; static links alone do not establish tenant ownership.

## Validation and release limits

Recorded local checks: CRM lint/build passed with existing warnings;13 focused Whop core/publish/transaction tests passed before the snapshot change; the two transaction tests passed again with the snapshot migration. Browser verified owner checkout/invoice/cancel/resume, CRM classification, search, pagination and amount alignment. Mail provider accepted one invoice send, and Peter confirmed inbox and attached PDF. Snapshot migration was applied with approval; actual new-invoice snapshot acceptance remains pending. No commits, pushes or deployment were performed in this run; no production Whop charge, settlement or refund was tested.

## Production credentials staged on 2 November

The server `.env` (Git-ignored) now contains blank production staging entries. Peter fills these locally. They are not read by the running test receiver and do not activate production. Do not paste secret values into chat. Never copy the entire `.env` into GitHub or logs.

| Local staging name | GitHub destination | Runtime name after deployment |
| --- | --- | --- |
| WHOP_API_KEY_PROD | Secret WHOP_API_KEY_PROD | WHOP_API_KEY |
| WHOP_WEBHOOK_SECRET_PROD | Secret WHOP_WEBHOOK_SECRET_PROD | WHOP_WEBHOOK_SECRET |
| WHOP_ACCOUNT_ID_PROD | Secret WHOP_ACCOUNT_ID_PROD | WHOP_ACCOUNT_ID |
| WHOP_PLAN_MANAGED_WEBSITE_PROD | Secret WHOP_PLAN_MANAGED_WEBSITE_PROD | WHOP_PLAN_MANAGED_WEBSITE |
| WHOP_PLAN_MANAGED_WEBSITE_CAD_PROD | Secret WHOP_PLAN_MANAGED_WEBSITE_CAD_PROD | WHOP_PLAN_MANAGED_WEBSITE_CAD |
| WHOP_PLAN_MANAGED_WEBSITE_GBP_PROD | Secret WHOP_PLAN_MANAGED_WEBSITE_GBP_PROD | WHOP_PLAN_MANAGED_WEBSITE_GBP |
| WHOP_PLAN_MANAGED_WEBSITE_KES_PROD | Secret WHOP_PLAN_MANAGED_WEBSITE_KES_PROD | WHOP_PLAN_MANAGED_WEBSITE_KES |
| WHOP_RETURN_ORIGIN_PROD | Secret WHOP_RETURN_ORIGIN_PROD | WHOP_RETURN_ORIGIN |

Return origin is https://cms.stemfra.com. All account/plan IDs require production verification. Deployment workflow now maps these suffixed inputs to the existing unsuffixed runtime contract. Test `.env` credentials and flags stay unchanged. The read-only `node scripts/checkWhopProduction.js` reports missing staging names, then checks four account-bound prices; it does not create checkout, charge, change plans, register hooks or enable billing. Passing plan checks does not resolve calendar cadence, tax mode, webhook signature/delivery or hosted checks.

Existing GitHub Variables also required at release: WHOP_ENABLED, WHOP_SANDBOX, WHOP_WEBHOOK_QUEUE_ENABLED, WHOP_SAVED_CARD_ENABLED, WHOP_ACCESS_LIFECYCLE_ENABLED, WHOP_ACCESS_EMAILS_ENABLED, WHOP_RENEWAL_REMINDERS_ENABLED. Keep WHOP_ENABLED false until accepted. WHOP_RECEIPT_EMAIL_ENABLED remains false because duplicate Stemfra Whop invoice emails are retired. Existing Resend credentials are reused for service notices; no new frontend secrets.


### Renewal reminder launch policy, 2026-11-02

Peter deferred advance renewal reminders. Set WHOP_RENEWAL_REMINDERS_ENABLED=false at launch and leave it disabled until explicitly revisited. This does not disable Whop payment notices or the separate Stemfra suspension/restoration notices. The billing interval must still be described accurately; reminder deferral does not change provider cadence.
