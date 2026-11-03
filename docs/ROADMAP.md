## 2026-11-04: Website release prepared, access steps pending

Peter explicitly authorized restoring sandbox webhook delivery, production website deployment/hosted checks and reviewing stranded purchases, plus regenerating the journey image. Separate AI session is active; no AI code, project, webhook or rollout changed here. Prepared isolated website release worktrees under /tmp/stemfra-website-{server,platform,client}-release. Marketing release excludes AILaunchPricing.tsx/aiOffer.js and does not announce AI checkout. Removed two stale website free-CTA messages and an obsolete preview bank-transfer line; shared visual layout unchanged. Server workflow now maps MANAGED_WEBSITE_PURCHASE_ENABLED_PROD through a GitHub Variable, defaultfalse. No push/deployment yet.

Fresh read-only sandbox audit of all3 purchase records and5 website provider payments:0 provisioning-without-site records; two pending purchase IDs have no bound provider payment; completed purchase retains original paid payment/site. No record repair, new checkout, charge or tenant created. Four production plans freshly read: USD299/CAD400/GBP225/KES30000, zero initial/no trial, period30, correct production business. CMS target verified Cloudflare stemfra-cms/main with https://api.stemfra.com. All7 platform typechecks pass. Broader billing tests71/72 pass; only failure is AI transaction fixture workspace_environment_mismatch after parallel AI migration changes. Website-only transaction subtest passes; do not modify AI code to hide this failure. CMS and isolated marketing builds pass (existing warnings).

Existing website sandbox receiver PID29790/port4055 reused; new tunnel process session4704 forwards https://favor-parks-absolute-game.trycloudflare.com to it and public /health returns expected receiver text. Whop update API403, unchanged; browser connection unavailable. Peter asked asynchronously to save only this existing webhook URL with /api/whop/webhook, keeping signing secret/events/API pin. Signed replay and inbox/idempotency acceptance still pending. GitHub CLI signed out; asked Peter to sign in normally for deployment settings. Auto-review rejected saved Git credential extraction/reuse for API authentication; did not work around it. Existing SSH identities authenticate as stemfra-admin/peterspace. Remote main tips remain server522e00f, platform1b8c1a0, client3f318e2a. Do not imply authorization is missing: deployment is authorized, account access/acceptance are the blockers.

Added docs/WHOP_SANDBOX_WEBHOOK_RUNBOOK.md with temporary-host explanation, per-session health/update/replay procedure, diagnosis and production/AI boundaries. Regenerated editable SVG and PNG at docs/user-journeys/images/managed-website-signup-2026-11-04.*; inspected full image. It deliberately labels production release and fresh replay pending. No memory write.

## 2026-11-04: Website recovery migration applied and schema checked

Peter authorized the needed website database migration; parallel Stemfra AI work remains separate and untouched. Applied atomic_paid_website_provisioning only to verified stemfra-ops project acxepovfklgthxmteqxr. Readiness true; service_role execute true, anon/authenticated false. Existing completed paid test retry returned original site. Prepared the actual approved-starter clone in memory using existing paid test, exercised full creation against real schema inside an exception subtransaction, and deliberately rolled all probe writes back. Final purchase remains complete with original site ca4a2e63-12b1-43ab-97c2-213bb386c9e5. No new payment, lasting tenant, provider event, push or application deployment. Prior25 focused tests and CMS build/typecheck evidence retained. New function has fixed search_path/security invoker and no advisor finding; unrelated existing project advisories left unchanged.

Fresh Whop dashboard read: website sandbox hook_g7xlBRcIKALZr shows Failing at tex-united-parallel-pat.trycloudflare.com/api/whop/webhook. This hostname currently fails DNS resolution. Delivery history includes2November503 response {error: Synchronization unavailable}, failed replay, then later200 successes including3November payment.succeeded/membership.activated/payment.created with queued/received=true. Badge alone is not proof the latest successful event failed. Temporary destination must be restored/replaced and a controlled delivery checked before calling webhook testing current. No endpoint/test/replay/config changed. Separate AI hook remains disabled and untouched. Legacy stranded provisioning-without-site records still require manual review; no automatic adoption of uncertain old tenants. Local validation/recovery phase complete; hosted release and fresh webhook acceptance remain separate gates.

## 2026-11-04: Local setup validation, recovery transaction and phone styling

Required business phone/email/location/hours now validate before canonical saves or forward navigation; invalid private drafts remain recoverable. Existing paid test: empty phone blocked progression with inline error, then restored fictional +1 4165550123 and original email; Save & continue reached step2 with Setup saved. Phone control uses the existing 8px CMS radius on its outer border only, straight internal divider and outer chocolate focus ring; browser computed inner radius0/shadow none, outer radius8px, including red error state. Screenshot /tmp/stemfra-phone-radius-error.png.

New paid provisioning prepares the existing clone in memory and commits tenant/content/legal acceptance plus purchase site checkpoint in one locked database transaction. Isolated PostgreSQL tests cover rollback during creation, retry after lost response, duplicate requests, owner/scope denial and default preservation; 25 focused tests pass and CMS build passes. Migration 20261103211506_atomic_paid_website_provisioning.sql is LOCAL ONLY, not applied. New checkout creation fails closed without it. Legacy provisioning records already missing site_id still require operator review; do not claim those are automatically repaired. Real provider crash acceptance awaits authorized migration/release. No new payment, push or deployment; existing paid subscription checks remain dated evidence.

## 2026-11-04: Sandbox and production Whop compared read-only

Fresh provider reads confirm both website catalogues match USD299/CAD400/GBP225/KES30000, initial0, no trial, period30; correct separate accounts/products. Both products hidden. Production four plans visible; sandbox regional plans hidden except USD. Production description has approved domain/per-website terms, sandbox explicitly test-only. Existing paid sandbox checkout confirms all four metadata keys; isolated shared-core payload comparison produces identical metadata in production mode without provider writes. Metadata is per-checkout server data, not a Whop dashboard field/schema to add.

Hosted revised /api/website-purchase/config returns404. Deployment workflow lacks MANAGED_WEBSITE_PURCHASE_ENABLED mapping; production CMS_URL/return origin already canonical. Required future release work is Stemfra code/flag/hosted verification after validation and recovery gates, not product/plan recreation. Current webhook reads403 for both keys and browser attach timed out; native app access denied, so latest hook status/version not freshly confirmed. Retain3November activation evidence as dated only. No scopes expanded, checkout/event/payment/account change/push/deploy. Existing hard-coded admin secret in workflow flagged for encrypted configuration and rotation, value omitted. See stemfra_server/docs/WHOP_PRODUCTION_SETUP.md current comparison; contradictory older current-status section replaced.

## 2026-11-03: Existing paid signup journey completed locally; crash-recovery hold remains

Completed all four existing setup screens for Kenya Template Checkout Test using the already-paid sandbox purchase. Added only fictional Canadian phone +1 4165550123, retained existing test services/team/branding, finished personalized preview and entered Dashboard. Site ca4a2e63-12b1-43ab-97c2-213bb386c9e5 remains unpublished/test; readiness10/10, wizard dismissed=true, resume=preview, draft cleared. The dashboard's6/13 polish checklist is separate from signup.

Fresh Whop read-only check and CMS Billing confirm Active, Card, KES30,000/month, renewal December3,2026, provider period end15:02:16.706UTC (18:02 Moscow). Owner and selected template/business type match. One intent/one subscription retained; no new charge. Completed-purchase link now verifies the existing signed-in owner server-side and resumes the existing site without another OTP or provisioning. Actual new-tab recovery reached the same preview, OTP/completed timestamps unchanged. Added isolated post-site failure/retry and ownership tests;16 focused tests pass, CMS build/diff checks pass. Evidence /tmp/stemfra-journey-finished-preview.png and /tmp/stemfra-journey-active-kes.png.

Rewrote the approved journey document into a current acceptance matrix, preserving previous Whop evidence rather than repeating billing scenarios. OPEN: process crash while provisioning before site_id checkpoint still fails closed and requires operator recovery; do not claim automatic crash recovery or release-ready. Current paid test used an existing account, so no new password/account created. No payment, domain purchase, publishing, push or application deployment. Production payment-first remains disabled. See docs/user-journeys/managed-website-purchase-to-setup.md.

## 2026-11-03: Original signup layout reused; business search, private setup drafts and error notices updated

Comparison confirmed payment-first activation reused only the showcase and had independently rebuilt its frame/buttons. Old SignupPage and paid OTP/business details now share SignupFrame, ChocolateButton, label/input styles, progress bar, photo treatment, footer and ProvisioningOverlay. Old signup form/Google auth remain intact behind deliberate disabled payment-first configuration; config network failures now offer retry instead of silently opening legacy signup.

Added existing searchable CMS Select for business Country after Town/City. ISO country is saved in location.address_parts and Google-selected country is retained, independently of company billing identity and subscription currency. Country names normalize through the shared country list. Address suggestions query fresh leadgen_places through the owner-checked cache-only finder first, then Google Places. Typing never starts Apify. Fixed older finder reading nonexistent sites.country; country comes from current selection, saved business location then billing. Existing /use enrichment and Claim lead prefill retained. Browser Canada lookup returned Toronto suggestions; selecting a plain street suggestion filled 100 Queen Street West / Toronto, Ontario / M5H 2N2. Restored fictional 123 TEST STREET, UNIT 2 / TORONTO, ON / M5V 2T6 and saved. No real business was marked as a tenant in this test. A real CRM business match selection is not freshly accepted; controller fixtures cover database-first and provider fallback.

Peter requested database-backed setup resume and approved local API restart. Applied private site_setup_progress migration to verified Stemfra project acxepovfklgthxmteqxr. Per-user/site primary key, RLS enabled, anon/authenticated table privileges revoked, service-role access only; authenticated API verifies ownership on every read/write. Revision fencing rejects stale-device overwrites. Schema advisor's RLS/no-policy note is intentional for this server-only table; no policies granting public access were added. Generated types inspected; frontend uses authenticated API, not direct access to new table. Existing public theme metadata is not used for drafts. Existing completion checklist module preserved.

Business contact/address/country/hours/timezone drafts autosave after 600ms; Save & continue commits through the original workflow then clears the private draft. Other existing services/team/look mutations retain their existing save/blur semantics. Last-opened stage is persisted, and plain /setup resumes it after authenticated site resolution. Browser and database verified unsubmitted UNIT 3 draft survived refresh, restored UNIT 2 and saved, draft cleared and step2 persisted. Plain /setup returned to Services without a step in the URL. This proves server-backed resume in this browser, not a separate physical-device acceptance. Wait for Setup saved before closing; failed requests preserve the open form and display an error.

Reused Notice with an error tone and ActionButton inside the setup container; no loose red text above branding. Errors support Try again; cross-window revision conflicts show Reload and do not overwrite newer state. Browser two-window conflict triggered and recovered successfully. Evidence /tmp/stemfra-setup-error-notice.png and /tmp/stemfra-shared-otp-style.png. Nine focused country/progress tests, CMS build and diff checks pass (existing chunk/import warnings). Runtime API restarted with BACKGROUND_JOBS_ENABLED=false and sandbox preserved; endpoint unauthenticated401, health200. No new payment, OTP resend, domain purchase, production deployment or push. Full four-step completion remains open because phone is missing. Business-name screen shares the same compiled frame; no repeated paid provisioning was used to visually re-enter it.

## 2026-11-03: Provisioning overlay restored; setup country/search audit

Payment-first ActivatePurchasePage now reuses SignupPage's original ProvisioningOverlay (same layout, animated spinner and staged list), with Building your website / Preparing your setup because account verification is already complete. Older signup default stages unchanged. No repeat purchase or provisioning. Isolated browser preview failed to attach/time out; temporary preview file removed. Build/diff result recorded in continuation response.

Country audit: provider snapshot uses Whop payment.billing_address.country, not inferred card issuer country. Activation passes it to onboarding, selected marketing country fallback. Site defaults follow that country; owner contact is reused unchanged for existing accounts. Setup currently uses company billing country/contact fallback for phone and Google region; no editable business-country control. Saved location address_parts excludes country; Google selected country is not persisted. Human country names in contact fallback are not normalized here, so Google only applies region restriction when value is valid two-letter ISO. Current Google address component searches address plus business name directly; /use enriches selected business from leadgen_places; Claim token path separately prefills from lead raw_signal/phone. Older /find has database-first plus Apify fallback but still reads nonexistent sites.country; current wizard does not call useFindOnGoogle. No live Google/CRM matching test run in this audit.

Legacy SignupPage remains intact including Country and email/password/Google signup, selected by SignupEntryPage when payment-first config is false or request fails. New flow redirects /signup to marketing when enabled, then uses paid-email OTP activation, no Google signup button. Recommend explicit editable business Country after Town/City, persisted independently of billing and used for lookup. No country control or policy change made in this audit. Production unchanged.

## 2026-11-03: Paid activation and editable address persistence verified locally

Peter verified the fresh OTP. Submitted Kenya Template Checkout Test through the existing activation form. Purchase e4c09f5b-58b1-4be4-a52c-bbfb68fb6b71 now complete, sandbox=true, site ca4a2e63-12b1-43ab-97c2-213bb386c9e5, metadata.is_test=true. No new checkout or charge. Existing account required no password change. Browser reached the existing four-step setup.

Fresh Whop snapshot and company billing identity both contain Canadian test address 123 TEST STREET, TORONTO, ON, M5V 2T6, country CA, despite purchase selection KE/KES. Browser verified those defaults in the existing editable fields. Fixed city formatter accidentally swallowing ON inside TORONTO and country default reading a nonexistent site country instead of billing identity. Edited street to 123 TEST STREET, UNIT 2, saved through Save & continue, reached Services, returned and reloaded. Browser and read-only database both confirm structured address persisted; company billing identity still has original Whop street without UNIT 2. Screenshot /tmp/stemfra-paid-address-saved.png.

Final CMS typecheck and both repo diff checks pass; earlier CMS build passed before these two small corrections. Four-step completion remains pending: business phone is empty (readiness 9/10); no phone invented or Twilio action performed. Site service currency is CAD from the supplied Canadian billing country; paid offer is KES. This distinction needs explicit review before claiming complete regional onboarding. Full setup, billing UI/renewal and interrupted activation recovery are not freshly accepted. No domain purchase, push, deployment or production setting change; Whop production/sandbox tabs retained. Journey evidence in docs/user-journeys/managed-website-purchase-to-setup.md.

## 2026-11-03: Setup address defaults corrected locally; paid activation recovery pending

Fresh inspection confirmed SetupWizard ignored the saved billing address. It now waits for billing data and defaults empty/demo locations from the company billing identity (contact fallback), preserving user edits and all existing editable fields. Empty/demo email uses the contact email. Business address saves preserve existing billing identity. Service price input uses the actual currency symbol instead of a dollar fallback for KES.

CMS build passed with existing warnings; final CMS typecheck and both repository diff checks passed. Dev-server setup module HTTP200. Browser inventory contained no previous tabs. New local /activate-purchase renders the request for the email setup link because this browser has no saved purchase key. Asked Peter to open the existing paid purchase resume link. Purchase e4c09f5b-58b1-4be4-a52c-bbfb68fb6b71, actual editable prefill/persistence and all four setup steps remain unverified here. OTP refresh/resume and interrupted provisioning recovery remain open. No OTP resend, payment, provisioning, domain purchase, push or deployment. Production unchanged; journey not complete. See docs/user-journeys/README.md.

## 2026-11-03: Paid purchase OTP screen corrected locally

User completed the Kenya test payment and received the verification email. The activation status now returns the paid purchase email and existing code-send timestamp so refresh/cooldown does not hide the OTP input. Browser reload verified payment confirmation, email destination, eight-digit verification input, Verify email action and “Send verification code again”. CMS build passes with existing chunk warnings. OTP verification and final provisioning remain pending; no new email or payment submitted for this UI check. Production unchanged.

> 2026-11-03: Template/business metadata verified in actual Whop Kenya test checkout; 17/17 focused tests and both builds pass. Payment submission, OTP and final template provisioning acceptance remain pending. Local only; production unchanged.

> 2026-11-03: Payment-first managed-website onboarding is implemented locally behind MANAGED_WEBSITE_PURCHASE_ENABLED. Approved purchase table applied to shared Stemfra DB. 16/16 focused tests and CMS build pass; Kenya initial screen verified. Checkout-to-OTP/setup browser acceptance and interrupted provisioning recovery remain open. Production journey unchanged. See ../../docs/user-journeys/README.md.

## 2026-11-03: Managed website production billing activated

At Peter's explicit request, activated the tested configuration without repeating production payment tests. Set the five server Actions secrets WHOP_ENABLED_PROD, WHOP_WEBHOOK_QUEUE_ENABLED_PROD, WHOP_SAVED_CARD_ENABLED_PROD, WHOP_ACCESS_LIFECYCLE_ENABLED_PROD and WHOP_ACCESS_EMAILS_ENABLED_PROD to true. Existing main deployment run [41617152201](https://github.com/stemfra/stemfra-server/actions/runs/41617152201) succeeded at commit 522e00f89caea1332733f86e80b5a426d44f6f9b; public health returned HTTP 200. Read-only schema inspection confirmed the five required Whop RPC definitions exist; no migration or database mutation was run.

Production webhook hook_JtQVtNSnhJPQJ is now Active after saving and reloading its dashboard. Endpoint is https://api.stemfra.com/api/whop/webhook, dated API version 2026-10-15-1, all events selected, sub-account events off. Renewal reminders and duplicate invoice email remain disabled. AI remains held and Airwallex unchanged. No production charge, sample event, replay or email test was performed; first signed production delivery is unverified by request. This supersedes earlier paused-switch status, not the separate remaining marketing/CRM release review or local-only sign-in alert fix.

## 2026-11-03: Duplicate CMS sign-in alerts investigated; local fix

Read-only known-device records confirm two distinct browser device IDs first recorded 23 milliseconds apart at 09:17:21 UTC today, matching Peter's duplicate alerts. Yesterday has one device record. IP is notification metadata, not the device key. The unique owner/device database constraint exists; two tabs racing to initialize localStorage is the likely cause, not proven browser provenance. CMS now coordinates registration with a shared Web Lock, suppresses overlapping callbacks, uses the supplied auth session, and remembers registration only after an accepted, recorded response. Mocked concurrent-tab regression check passes without sending email. This auth fix is local and not deployed; production still has the previous behavior. Browsers without Web Locks retain the fallback registration path.

Hosted authenticated billing was checked after Peter signed in: Clean Cuts billing and paid invoice list are accessible. Existing test subscription remains sandbox data. Billing production signed-delivery verification and controlled activation remain pending; no real charge or domain purchase.

## 2026-11-03: Approved server and CMS release deployed

Peter explicitly approved push/deployment. Pushed server522e00f and platform CMS1b8c1a0. Server GitHub Actions run41608506864 completed success; hosted /health200, /api/public-config/managed-website-offer?country=CA200 with CAD400 proves new route is serving. First probes during rollout returned404; later exact route verified200. Hosted raw webhook route now503 while WHOP_ENABLED remains false; this is not signed-delivery acceptance. Cloudflare stemfra-cms deployment b970ffd3-95a7-4bbe-b7f0-0c4789a7a3b0 completed success at CMS commit1b8c1a0. Hosted /billing browser shows Sign in; asked Peter to sign into existing Clean Cuts account. No checkout/feature flag or webhook activation, real charge or domain purchase. Marketing/CRM release review, signed production delivery, hosted authenticated verification and controlled activation remain before sales-ready. AI remains held. Six template fallback edits still unstaged; sales economics document excluded.

## 2026-11-03: Managed website release commits prepared locally

Server billing release and CMS release are committed locally; no push or deployment. CMS commit 1b8c1a0 includes billing, regional signup/add-site UI, suspension billing-only routing and the previously approved spinner/reference-cache changes. Six tenant-template fallback edits remain unstaged. Server release includes Whop handlers, inbox/retry workers, lifecycle/domain coverage, catalogue/admin endpoints, migrations and production secret mapping; SALES_UNIT_ECONOMICS.md remains untracked and excluded. Full billing suite 58/58 passed, 60 JavaScript files passed syntax checks, CMS production build passed with existing chunk warnings. Production feature flags now use _PROD Secrets fallback false (token cannot access Variables); duplicate invoice/renewal mail pinned false; live provider endpoint pinned false sandbox. No flag secrets enabled. Push requires Peter's explicit approval under workspace rules. Then verify deployment, production database prerequisites, enable receiver and signed delivery before checkout activation. Marketing/CRM release dependency review remains before declaring sales-ready. AI held, no domain purchase or real charge.

## 2026-11-03: Production release configuration review

Production workflow now pins WHOP_SANDBOX=false because it consumes live _PROD secrets; checkout still defaults disabled. Corrected production setup documentation for encrypted settings, provider-native invoices, disabled renewal reminders and provider-returned dates. Release test run initially found one stale domain-allowance expectation excluding regional/catalogue-version prices. Updated the test to match current catalogue policy while checking expired/unpaid/unsupported/invalid-price rejection. Focused rerun 5/5 passed; complete billing release suite result recorded in /tmp/stemfra-billing-release-tests.log. No push/deployment or webhook activation in this pass. Hosted release and signed delivery remain outstanding.

## 2026-11-03: Production catalogue compared with sandbox; deployment secrets staged

Read-only provider comparison confirms production matches approved sandbox configuration: website USD299/CAD400/GBP225/KES30000 and AI Starter100/Growth200/Business300 USD, period30, initial0, no trial. Sandbox-only EUR100/NGN100 validation plans and duplicate Starter100 test plan are excluded; descriptions explicitly test-only. No approved production product needs deletion/recreation. Existing production IDs retained. AI remains held.

GitHub token permits Secrets but GET actions/variables returns403. Stored all six non-secret _PROD settings as encrypted server Actions secrets (account, four plans, return origin), alongside API/signing secrets already verified. Local deploy.yml now reads secrets.*_PROD for these six fields. Two production-staging tests and git diff --check pass. Changes uncommitted; automatic main-push deployment not triggered. Remaining: review/commit/release appropriate billing changes, configure feature switches, deploy, enable and verify signed webhook. Do not call ready for sales yet.

## 2026-11-03: Production webhook signing secret staged

Peter saved production webhook hook_JtQVtNSnhJPQJ and signing secret directly to ignored WHOP_WEBHOOK_SECRET_PROD. Presence verified without displaying value. Saved encrypted secret to stemfra/stemfra-server; GitHub metadata HTTP200 confirms name/update. Read-only production preflight passes account/four regional plans, zero initial fee and 30-day billing configuration; explicitly not launch-ready pending hosted delivery/tax/period verification. Browser webhook list confirms correct api.stemfra.com/api/whop/webhook endpoint, Disabled, 97 events. List labels API version v1; exact dated version shown in Peter's pre-save screenshot2026-10-15-1, not freshly reconfirmed in saved editor. No webhook enabled, deployment, push, payment or AI activation. Next production variables/workflow and hosted receiver delivery verification.

## 2026-11-03: Production key and GitHub access verified

Peter created the prepared production website key and saved it directly to WHOP_API_KEY_PROD. Read-only Whop API confirms all production website plans/account: USD299 plan_4Ai5KZN6ROwfM, CAD400 plan_jNXf8IBln3OL3, GBP225 plan_BSNqKQvN6Cpcw, KES30000 plan_Le54EmNGESKLe. All billing_period30, initial_price0. Saved these IDs and live account to ignored server .env _PROD staging keys; sandbox runtime unchanged. Peter identified PERSONAL_ACCESS_TOKEN in stemfra_ai/.env. GitHub secrets public-key access verified HTTP200 for stemfra-server and stemfra-ai. Saved WHOP_API_KEY_PROD encrypted to stemfra/stemfra-server using token privately. No AI credential copied or AI activation. Webhook form remains unsaved/paused and must recheck API version/event controls. No deployment or push. Remaining signing secret, production variables, separate AI staging, and hosted delivery checks.

## 2026-11-03: Production Whop account inspected and regional product prices saved

Fresh production browser audit of biz_3yEQNCgp1hy3wV found four hidden products, no active users/revenue: managed website plus three AI products. No disposable products identified and none removed. Managed website prod_F1Q8CzFvaFJLN now has saved USD299, CAD400, GBP225 and KES30000 recurring pricing options, all shown per month in Whop. Reopened editor confirms all four persisted. Description corrected to include domain registration/annual renewal up to US$30 while active. Product remains hidden; no payment or launch activation.

Production API-key inventory was empty. Prepared scoped website runtime key form (17 billing permissions), not submitted; user takeover requested to create and save directly to ignored server .env WHOP_API_KEY_PROD. GitHub CLI has no login and no obvious token env names in the two product env files; asked user for existing token location only. No GitHub secrets updated yet. Production webhook inventory empty; create form prepared with api.stemfra.com/api/whop/webhook and Enabled off, not saved. API-version dropdown/event selection did not reliably settle to intended selection; must explicitly recheck version2026-10-15-1 and billing event checkboxes before saving. Do not claim webhook configured or delivery verified. AI products retained, activation on hold. AI workflow still uses unsuffixed Whop keys and needs separate staging update. No push/deployment or new credentials created by agent.

## 2026-11-03: Regional simulation checks and native CAD document verified

Peter authorized GBP/KES simulation without card entry. No new previews, provider checkouts or payments were created. Read-only Whop retrieval confirms sandbox account biz_JXJPD9Q4Ta5thq: GBP plan_IlUqJh6zTZPwr is gbp225, KES plan_SyUAVoY8WdFhW is kes30000, both billing_period30, initial_price0, no trial. Catalogue plan_id is null for seeded rows and intentionally falls back to configured environment plan IDs; first direct null-ID read returned404, corrected to the same configured fallback used by runtime, no data change.

Ran existing focused tests with node --test --test-name-pattern='website regional snapshots|CMS regional prices' tests/whop-core.test.js tests/whop-transactions.test.js: 2 passed. They simulate regional provider snapshots with gross tax, wrong-currency rejection, database subscription/charge reconciliation and stale financial-event protection in isolated PGlite. Additional in-memory GBP/KES checkout simulation verifies selected plan, order/product metadata and return URL, with no provider write. These are simulations, not actual GBP/KES payment, webhook delivery, bank authorization or provider receipt acceptance. No AI tests executed.

CAD CMS invoice listing shows paid CA$452. Existing protected invoicePdf path successfully retrieved native Whop PDF, 23247 bytes, saved /tmp/stemfra-cad-whop-invoice.pdf. pypdf text extraction confirms CA$400 subtotal, CA$52 tax (13%), CA$452 total/paid, service Nov3-Dec3 2026 and next CA$400 due Dec3. PDF content verified; no new visual-layout certification. Browser invoice listing verified; native document access uses existing account/environment/site binding. No duplicate Stemfra invoice sent. Production credentials/webhook/plan setup and deployed verification remain; GBP/KES actual payment acceptance waived in favor of simulations by Peter for this pass. Existing old CAD checkout return failure remains historical and is not marked passed. No production activation, domain purchase, push or deployment.

## 2026-11-03: CAD payment reconciled automatically

Peter submitted CAD400 sandbox checkout ch_v8KU80WTWggUMvi and confirmed the Whop email arrived. Payment pay_Chua5zSunLsOiv: payment.created and payment.succeeded inbox rows are done on first attempt, no last_error. Subscription for Clean Cuts CAD Billing Test is active, CAD40000 cents, provider Whop, current_period_end 2026-12-03T00:39:47.480Z. Fresh CMS browser confirms CA$400/month, Active, Card, next renewal Dec 3, 2026, without clicking a manual payment-status check. Site remains unpublished. Screenshot /tmp/stemfra-cad-active.png.

Return redirect failed because this pre-existing checkout retained the expired gnu-asbestos-marina-setting quick-tunnel URL. Restored webhook processed payment independently. Opened localhost CMS billing for Peter; no repeat payment. New checkout return origin was already updated to the current tunnel. This proves CAD payment/webhook/CMS renewal, not successful old-checkout redirect or native CAD invoice/PDF acceptance. Remaining: CAD invoice/PDF verification, GBP/KES acceptance, then production configuration and deployment checks. No production activation/domain purchase/push.

> 2026-11-03: CAD400 sandbox checkout prepared on existing test site for Peter submission. Fixed setup gate blocking billing/invoices/details before setup completion; CMS build/browser pass. No payment submitted; regional provider acceptance remains open.

> 2026-11-03: Local pricing journey browser acceptance complete. Fixed signup draft country precedence, CRM PUT CORS blocker and duplicate marketing currency labels. Four market agreements/template/legacy redirect and existing-owner preference checked; 13 focused tests and CMS/marketing builds pass. Remaining regional provider payments, production setup and deployed Cloudflare verification stay open. See WHOP_BILLING.md current top block.

> 2026-11-03: CMS unresolved country-helper import corrected through existing package export. Full CMS build and live dev-module HTTP200 pass. Pricing/browser/provider acceptance and production setup remain open.

> 2026-11-03: Shared DB managed-website catalogue implemented with immutable price versions and admin CRM editor; Kenya KES restored. Private Whop-sourced availability policy prepared, disabled pending review. Code/API/DB checks pass; browser validation and remaining provider/production launch gates open. See WHOP_BILLING.md current top block.

> 2026-11-03: Legacy /start redirects to CMS signup with query preservation; internal links consolidated. New-site explanation/preview footer removed; blue/gold table statuses. CMS typecheck and marketing build pass; browser connection blocks visual confirmation.

> 2026-11-03: Sites table typography unified; business type moved below name. Signup journey audited: legacy /start remains a separate June 2026 flow; no routing change. CMS typecheck passes; browser confirmation blocked by tab attachment. See SESSION_HANDOFF.md.

> 2026-11-02: Additional-site pricing now inherits owner subscription/billing preferences before location; public signup follows selected country. Legacy /start terms corrected. New-site price card added, optional City removed, Sites column name-only. Eight tests, CMS typecheck, marketing build and browser checks pass. No production activation; remaining billing acceptance still pending.

> 2026-11-02: CMS agreements show one Cloudflare-based price: GB GBP225, CA CAD400, all others USD299. Matching acceptance snapshot and checkout default implemented; local tests/typecheck/browser USD pass. Production geo-header delivery and remaining regional checkout tests pending.

> 2026-11-02: Peter approved using Whop-returned subscription dates directly. Live test membership confirms Nov 2 to Dec 2; CMS already reads current_period_end. Separate calendar investigation hold superseded; other launch gates remain. Reminders stay off.

> 2026-11-02: Advance renewal reminders deferred by Peter; keep the reminder flag false at launch. Payment and suspension notices remain in scope. Billing cadence remains a separate pending decision. Three approved test emails accepted by provider, inbox confirmation pending.

> 2026-11-02: Eight production staging entries prepared; GitHub mapping documented,22localmanaged-billing checks pass. External provider/email acceptance and calendar-month answer remain pending. Production off,AIheld.

> 2026-11-02: CMS invoice management action clarified with official Whop icon and Manage billing label; calendar-month confirmation still blocks launch.

> 2026-11-02: Peter requires calendar-month confirmation before launch; Whop docs expose day-based periods, exact monthly behavior awaits provider clarification. Production secrets must be configured securely; production stays off.

> 2026-11-02 launch pass: four regional currencies approved and implemented, regional/financial migrations applied, CRM event review browser verified. Tests pass locally; cadence decision, actual remaining provider scenarios and production credentials/deployment still gated. AI on hold. See [billing evidence](WHOP_BILLING.md).

> 2026-11-02: Durable webhook inbox/retries applied and enabled locally; Whop replay200OK730ms, background verification done.15 focused tests pass. Pre-dispute refresh requirement recorded; dispute form and CRM queue-review UI still pending.

> 2026-11-02: Initial decline end-to-end acknowledgment verified200OK in2.25s. Earlier replay hit5s timeout although receiver finished later. Same-checkout recovery and durable webhook queue hardening pending.

> 2026-11-02: Actual initial decline handling fixed and receiver replay processed; provider dashboard acknowledgment Error still needs investigation. Test website remains unsubscribed, no paid invoice. 17 focused tests pass.

<!-- 2026-11-02 billing acceptance: separate unpublished failure-test preview and declined-card checkout prepared; user submission and actual webhook/recovery checks pending. No production activation. -->
## 2026-11-02: Suspended website billing-only mode and notices

Implemented owner CMS lock: replaces sidebar/TopBar/assistant/preview/tours with suspension banner, standard site switcher, sign-out and billing-only routes (subscription/invoices/details). Editing and own-customer Payments URLs redirect to billing. Reactivate links to existing Whop management page, avoiding duplicate subscription charge. Grace warning/date from paid-through, and background owner-context refresh every60s. Email links select the owned website via site query parameter.

API verifySiteOwnership rejects suspended owner operations by default; platform billing explicitly allowed; staff bypass remains audited. Applied whop_billing_only_mode migration: restrictive RLS on site-scoped operational tables and suspended site updates/deletes; existing ownership checks remain. Added atomic outbox trigger for billing suspension/restoration, service-only access. Status email worker uses production real-site checks, idempotency/claim, skips obsolete/test notices, ambiguous attempts to review; WHOP_ACCESS_EMAILS_ENABLED default off. No emails sent.

Browser test: temporarily suspended Clean Cuts Billing Test, /content redirected to /billing, no editing/publish/assistant controls, reactivation link present, invoices readable. Owner-role DB site services invisible/operablefalse. Restored test site live, existing active subscription/end unchanged; test outbox rows skipped. Screenshot /tmp/stemfra-billing-only.png. CMS and barbers typechecks passed; focused Whop suite29 passed. All six template typechecks passed. Neutral public unavailable page implemented in all six template App entry points locally, NOT deployed.

Auto-review rejected an additional company-wide RLS guard because shared company profiles could affect active websites. Proposal removed, not applied; shared profiles remain unchanged. Do not claim all shared business-profile writes are locked by this site-only restriction. Automatic lifecycle and email workers remain disabled pending actual provider failure-event/delivery acceptance.

## 2026-11-02: Access migration applied and scoped browser rehearsal passed

Peter approved apply/test. Stemfra project acxepovfklgthxmteqxr reverified, migration whop_access_lifecycle applied; anon/authenticated EXECUTE false, service_role true. Clean Cuts Billing Test only: simulated past_due six days kept live; seven days plus one second RPC suspended. Public address then rendered No live site found; owner CMS billing remained accessible with Payment needed/Manage. Simulated paid recovery RPC restored live. Restored original active status, Dec2 15:44:46.418Z end, cancel=false; removed simulated paid-through and site audit markers. No Whop charge/refund/email/domain purchase. Public recovery browser checked. Worker remains default-disabled; this is direct database rehearsal, not actual Whop failure/renewal-webhook acceptance. Existing historical paid-through fields remain unset until verified payment reconciliation; do not backfill from unpaid provider cycles. Also prevented unpublish from suspended status from converting a blocked site into a publicly renderable preview.

## 2026-11-02: Atomic Whop access lifecycle prepared, live rehearsal awaiting approval

Prepared migration 20261102_whop_access_lifecycle.sql replaces reconcile to extend whop_paid_through only after verified paid eligibility and preserve paid subscription end across unpaid period changes. Adds server-only whop_apply_site_access: locks subscription/site, compares verified membership timestamp, paid intent and sandbox/dataset boundary; seven-day past-due grace, cancellation at paid end, suspend only live sites, restore only billing-marked suspension. Unknown paid boundary/provider state requires review. Added accessLifecycle worker, default WHOP_ACCESS_LIFECYCLE_ENABLED off, behind existing background-job gate. No Cloudflare/domain/payment/email actions. Local atomic tests cover grace/suspend/restore/cancel/manual suspension/wrong account/environment/dataset; focused suite rerun. Database update and temporary Clean Cuts Billing Test expiry simulation requested; not applied yet. No live status changes in this turn.

## 2026-11-02: Publishing payment requirement removed at Peter request

Peter explicitly authorized removal of the publishing payment gate and testing with existing sandbox payment. publishSite now retains completeness/ownership/status checks but does not require paid subscription; readiness.required=false. Existing domain attachment remains, no domain purchase flow invoked. Focused publish test passes: incomplete blocked, complete publishes without subscription lookup. Domain purchase previously tested successfully per Peter, not freshly retested. This supersedes earlier pay-to-publish gate notes. Lifecycle suspension policy remains separate and not enforced yet.

## 2026-11-02: Billing lifecycle resumed, seven-day grace approved

All 22 existing focused Whop checks pass. Added transaction test proving failed first payment creates no subscription/charge, paid recovery activates once, renewal failure creates no paid invoice, and delayed failure cannot overwrite newer recovery. Three new access policy tests pass: seven-day grace from paid-period end on failed renewal, cancellation ends at paid expiry without grace, ambiguous provider state requires review. Existing publication gate does not take already-live sites offline; atomic suspension/recovery and public-path acceptance still required. No provider mutation, charge, email, migration or deployment in this continuation. Whop original PDF/billing identity wording remains a launch gate.

## 2026-11-02: CMS session cache boundaries

Added user-scoped 24h public industry/template query persistence and per-user website selection; clears query memory and previous account cache on sign-out/account changes, preserves token refresh. Private owner/site/billing data remain live because owner context drives access and publishing decisions. Display-only website shell cache remains outstanding. Later website/template/AI audit requested, not performed. Details: stemfra_platform/stemfra_cms/docs/SESSION_CACHE.md. Focused cache lifecycle checks passed; live logout not exercised.

## 2026-11-02: Shared CMS loading spinner

Extracted the existing Publish circular spinner into components/Spinner.tsx with accessible LoadingIndicator. Replaced 37 JSX plain Loading text states across 28 files; kept dropdown placeholder and isolated iframe preview text. Publish reuses the shared Spinner. Payments no longer calls useBillingPage/useBilling and waits only for owner/site settings, removing the unrelated billing request dependency. Existing isLoading checks retain cached content during ordinary query refetches. Full reload still requires authentication and owner/site fetches; no persistent private-data cache introduced.

## 2026-11-02: Currency menu clipping fixed

Payments SectionFrame opts into visible overflow so the existing z-20 currency menu can extend beyond the card. Header retains rounded top corners. Other settings cards retain existing overflow behavior. CMS typecheck passed.

## 2026-11-02: CMS booking currency dropdown

Replaced the five-currency native picker with the existing CMS searchable Select component and 51 currency options showing code, English name and localized symbol (ISO fallback). Preserved site-currency saving and unknown current values. CMS typecheck and scoped diff checks passed. Browser search, KES save/reload and restoration to USD verified on Clean Cuts Billing Test. This is booking currency, separate from Whop subscription pricing.

## 2026-11-02: Payment method label simplified

Changed the subscription summary payment-method value from Saved card in Whop to Card at Peter request. Header title and price use baseline alignment. No payment behavior changed.

## 2026-11-02: Subscription header baseline alignment

Changed subscription header alignment from center to baseline at Peter request so Managed website and monthly price share a text baseline. No billing behavior changed.

## 2026-11-02: Subscription card layout refined

Peter requested actions beneath status with a divider and better header use. Removed redundant Your plan label,moved monthly price to header right with wrapping on narrow screens,and placed existing Subscribe/Manage/Cancel controls below status/payment/renewal with a horizontal divider. Billing behavior unchanged. Browser desktop screenshot verified at /tmp/stemfra-subscription-layout.png.

## 2026-11-02: Compact subscription and provider-owned payment documents

Peter approved compact subscription management,Whop original PDF downloads,Stemfra reminder-only communication and retirement of duplicate paid-invoice emails. This supersedes earlier Stemfra invoice-email ownership for Whop subscriptions only. Removed CMS marketing description/benefits/feature expansion;kept plan,actual amount/currency,status,payment-method summary,renewal/access end and existing owner controls/saved-card flow. No pricing/reference redesign. Browser verified compact active view and primary Manage/Cancel controls; screenshot /tmp/stemfra-compact-subscription.png.

CMS and CRM PDF controllers now return original Whop PDF for actual Whop payment-backed charges via lib/whop/documents.js. Enforces explicit sandbox match,provider account,paid site/membership binding,HTTPS approved document host,PDF validation;unavailable provider document returns503,never silently substitutes Stemfra PDF. CMS history/drawer/search uses original pay_ reference;legacy/nonpayment documents retain historical local reference. Browser downloaded /Users/peterokeme/Downloads/invoice-56ca12c5.pdf through authenticated owner route;pypdf verifies Whop issuer/pay_fI56uyfWLONhAm and no INV-56CA12C5. Corrected Whop drawer payment-method label to Card on file. Airwallex custom software unchanged.

receiptMessage now refuses Whop before generating attachments/auth links;Whop receipt worker is a hard no-op even if its old flag is enabled. Previously sent emails and legacy outbox rows retained as audit;no retroactive edits/deletions/resends. Existing reconciliation may still create legacy outbox rows,but no sender consumes them. Reminder has branded HTML using existing base with website,renewal date,estimated amount,tax/automatic-charge note and Manage billing link;no invoice number or PDF. Reminder automation remains off pending acceptance/native-notice review. No email sent in this slice.

Checks:CMS typecheck passed;6 focused provider-PDF/worker/reminder tests passed. Download and UI manually verified. Original Whop PDF still says paid299 and dueDecember2;provider wording not rewritten. Provider correction remains a launch gate. CMS/company billing identity can differ from Whop document identity;provider billing-details synchronization remains to reconcile before launch. No new charge,shared migration,push/deploy or AI runtime change.

## 2026-11-02: Manage button matched to Publish; Whop PDF receipt verified

Peter requested Manage styled like purple Publish and same height as Cancel. Reused CMS primary button token/classes on the navigation anchor,preserving target. Browser confirms rgb99/102/241 background,white text and both actions38px height; screenshot /tmp/stemfra-manage-button.png. No new behavioral test needed for style-only change.

Whop SDK payments.generatePdf generates a short-lived PDF receipt link;successful API call for existing sandbox payment pay_fI56uyfWLONhAm verified this capability. Receipt number fI56uyfWLONhAm matches payment ID without pay_ prefix. Buyer billing portal required switching Whop account in current browser,so buyer self-service download navigation not verified. No receipt-download button added to CMS in this request. No charge or email sent.

## 2026-11-02: Saved-card payment accepted; automatic status refresh corrected

Peter clicked Confirm subscription and reports Whop email delivery. Provider read confirms pay_fI56uyfWLONhAm paid,member mber_SR0LMh08lPnCG,method payt_RfIhQXfmsiiHG,new membership mem_Pt1Xe82UwXKSmN,order ad56e15f-51d5-48d0-bd49-6dd3221fcd93. No second charge submitted by agent.

Found two defects:temporary sandbox receiver retained old core module in memory (saved_card_member_mismatch),and CMS checked status only once then required manual fallback. Restarted sandbox-only receiver on4055 with updated code(session95320). Fresh provider snapshot reconciled existing payment through guarded transaction,event verified-payment-pay_fI56uyfWLONhAm. Exactly new charge56ca12c5-95a7-42d5-96ff-94e01eebcf5b,USD299,paid,dueNov2,stored billing_snapshot present using owner/company billing fallback. New site subscription active through2026-12-02T15:44:46.418Z;original Clean Cuts membership remains independently active through14:16:41.299Z. No address source changed or historical invoice backfilled.

Added automatic buyer payment-status polling every2.5seconds for up to2minutes,billing query refresh,and provider-verified read repair for succeeded payments through the same idempotent reconciliation. Browser success never grants access. Pending saved payment is returned by owner-authorized billing read so reload resumes confirmation instead of inviting another purchase. Errors instruct do not repay;manual status button remains fallback. Next invoice now falls back to provider period end. Browser shows Manage/Cancel and Dec2renewal; screenshot /tmp/stemfra-saved-card-active.png. This verifies recovered payment/current UI,not a fresh automatic transition rehearsal. CMS typecheck and transaction tests passed;new read-repair authorization test added. No production payment,push/deploy. PDF/email acceptance for secondinvoice and fresh SCA/automatic transition remain pending.

## 2026-11-02: Saved-card option label simplified

Peter requested only the alternate-card label change. Changed CMS billing radio label from Use another card through Whop to Add new card. Payment behavior unchanged. Peter said he will click Confirm subscription; no payment outcome verified in this copy-only change.

## 2026-11-02: Saved-card selection and confirmation verified in browser

Completed unpublished test setup through existing flow,then opened /billing for Clean Cuts Billing Test. Actual API returned saved Visa4242;browser shows saved-card selection by default,Use another card through Whop,and Subscribe with saved card. Opened confirmation showing US$299/month plus applicable taxes,monthly renewal and independent other-site subscriptions. Stopped before Confirm subscription;Peter must perform final browser payment action. Screenshot /tmp/stemfra-saved-card-confirmation.png. No new payment submitted;actual saved-card payment/SCA/webhook/invoice acceptance remains pending. Latest CMS typecheck and14 focused core/saved-card/SQL tests passed. Shared migration already applied with approval;local sandbox flag enabled only,production not enabled.

## 2026-11-02: Approved saved-card migration applied and sandbox flag enabled

Peter approved applying the prepared database update and enabling local sandbox testing. Verified connected stemfra-ops project acxepovfklgthxmteqxr,inspected existing intent columns,applied whop_saved_cards successfully. Readback confirms existing intent remains acquisition_mode=checkout,count1;reconciliation EXECUTE remains anon=false,authenticated=false,service_role=true. Existing invoice/payment unchanged. Local .env WHOP_SAVED_CARD_ENABLED=true only after asserting WHOP_SANDBOX=true and BACKGROUND_JOBS_ENABLED=false;example default remainsfalse. No saved-card payment submitted.

CMS typecheck and14 focused saved-card/core/SQL tests passed. Owner-scoped query cache added to prevent account-switch card display reuse. Completed test site's setup using fictional business phone2025550123,email billing-test@example.test,address123TestStreet NewYork10001,existing sample services/team,AI Front desk leftNo. Site remains unpublished;setup preview page preparation in progress at last browser observation. Saved-card UI/first payment/SCA acceptance remains pending. No main-account enabling,push/deployment.

## 2026-11-02: Owner-approved saved-card subscription flow prepared

Peter selected saved-card purchases for additional websites, superseding the prior recommendation to require hosted checkout each time. One subscription per website remains. Read-only Whop sandbox check verified correct business/membership and saved Visa ending4242. No payment created. Official Payment Methods API permits member-scoped listing; Payments create supports member_id/payment_method_id,off_session=false and bank authentication next_action.

Prepared lib/whop/savedCards.js and owner-authorized routes: resolve member through existing owned-site paid checkout bindings and provider account verification,return only method ID/brand/last4,exclude expired cards,choose saved card or hosted checkout. New payment uses server-owned plan/order metadata,stable idempotency key,explicit user confirmation and buyer-present charging. Status endpoint binds payment to owner/site/environment; redirects only to HTTPS provider authentication actions. Webhooks remain authoritative for paid access. Pending payment modes prevent switching to another collection path; ambiguous attempts after23h require review.

Prepared migration 20261102163000_whop_saved_cards.sql (NOT APPLIED): adds acquisition mode,member/method/payment IDs; retains existing hosted checkout verification and supports member/card-bound first payment. Renewal permits replacement cards on the same member. Local transaction tests reject wrong member/method,accept direct first payment/replay and renewal card change;owner-card display test verifies account isolation and no fingerprint/member ID exposure. Migration approval requested before enabling WHOP_SAVED_CARD_ENABLED (defaultfalse). Hosted checkout remains available while disabled. CMS UI prepared but live visual/payment/SCA acceptance pending;second test site still in setup. No actual charge,push/deployment.

## 2026-11-02: Per-site subscription, renewal reminders and domain coverage fixes

Kept existing per-site Subscribe checkout and independent membership/renewal binding. Whop Create Payment API supports payment_method_id,so checkout-free repeat purchase is technically possible,but not implemented: creating a website never silently charges a saved card. Hosted checkout with explicit approval is the chosen recommendation; saved-card reuse still needs second-checkout acceptance. Per-site company billing identity remains separate from provider card storage.

Local changes: domainRenewalSweeper rechecks active USD299 Whop coverage each pass; included <=USD30 renewals skip customer invoices/dunning. Unknown/over-cap/inactive coverage or existing unpaid invoices requires staff review,not automatic new collection; registrar auto-renew is not disabled or exercised. Manage-domain response/UI exposes included coverage versus review. Existing non-Whop legacy path retained. CMS subscription explanation states each website has its own subscription/date and domain registration/annual renewal coverage.

Added whop/renewalReminders.js: 72-to-48-hour provider-date window,active/noncanceled real sites only,production checkout binding and fresh provider verification,atomic metadata claim,stable Resend idempotency key,cycle sent stamp and ambiguous retry cutoff. Hourly startup hook respects existing background-job gate; WHOP_RENEWAL_REMINDERS_ENABLED=false default. No real messages sent. Provider advance-reminder timing remains unverified; do not enable before notification review. No migration required.

Checks: CMS typecheck passed;13 prior Whop core/publication/transaction tests and6 new/domain allowance/reminder tests passed,including mocked send-once,canceled-provider/test-site exclusions. Browser second test site routes to existing setup until business details complete; second checkout/card reuse and changed billing/domain UI visual acceptance remain pending. No registrar operation,production payment,push/deployment. Airwallex custom software preserved. Regional allowance remains USD299-only until regional billing activation.

## 2026-11-02: Second test preview created; renewal and domain audit

Peter authorized accepting corrected terms and creating Clean Cuts Billing Test. Browser creation completed at setup; hosted readback confirms site fffd80d7-0bd0-40f7-b343-f35f8460e418, subdomain clean-cuts-billing-test, previewing, metadata.is_test=true. New fees acceptance contains USD29900/month,Whop,zero commission/setup,no trial,tax exclusive. No second checkout/payment yet.

Peter clarified domain policy: active website subscriptions cover domain registration AND renewal up to US$30. Audit finds registration allowance implemented for active USD299 Whop subscriptions, but domainRenewalSweeper still opens customer invoices at T-30 and flags unpaid renewals at T-7. Renewal inclusion is incomplete; regional eligibility and over-cap handling remain to reconcile. Do not buy/renew a domain during billing testing.

Three-day Stemfra pre-renewal reminder remains pending in roadmap; existing overdue bank-transfer dunning is a separate legacy path. Official Whop buyer terms confirm stored-method recurring charges; native advance reminder timing not verified by official documentation search. Keep agreed three-day reminder requirement until notification ownership is verified. Site company billing profiles override owner fallback,so identities are per business. Saved Whop card reuse across a second site is unverified; never equate shared email with authorized automatic subscription creation.

## 2026-11-02: Signup and additional-site offer corrected locally

During preparation for a second sandbox payment, found CMS signup/New site/Clone site copy and new-acceptance metadata still using free website/5% commission. Verified current marketing Fees policy specifies US$299/month plus applicable taxes, no setup fee, booking commission or free trial, monthly renewal through Whop. Corrected those forms, preserving controls/save flow, and removed free-website promises from signup preview headings. New onboarding/additional-site acceptance stamps share the Whop catalogue amount through lib/managedWebsiteOffer.js. Historical acceptance records remain intact; acceptance does not start a paid subscription.

CMS typecheck, server syntax/offer assertions and all13 focused Whop tests passed. Browser New site modal shows corrected terms. Prepared Clean Cuts Billing Test under existing test owner; agreement unchecked, no site creation/payment yet, pending action-time confirmation. Existing provision flow includes best-effort host attachment, not invoked here. Actual new-payment snapshot/PDF acceptance remains pending. Airwallex custom software unchanged; no push/deployment.

## 2026-11-02: Approved invoice snapshots migration applied; provider replay accepted

Peter approved the prepared snapshot update. Applied whop_invoice_snapshots successfully to stemfra-ops project acxepovfklgthxmteqxr. Readback verifies billing_snapshot and due_date writes present,security invoker retained,anon/authenticated EXECUTE false,service_role true. Existing issued invoice rows were not backfilled. Future newly reconciled payments capture saved Stemfra billing identity atomically;existing local tests verify profile edits/replays cannot overwrite it. Actual new-payment-to-snapshot-PDF/email acceptance remains pending.

Verified existing sandbox receiver health,then used Whop dashboard webhook log to replay original payment.succeeded for pay_49KXrcOmthsQ6n. Provider log shows Replay200OK;receiver log2026-11-02T15:05:01.088Z for original delivery msg_dRWJh2ShxB4gJ5i48E6m6GFp reports reconciled=true,duplicate=true. Hosted readback retains exactly1 Whop invoice for Clean Cuts,outbox sent/attempts1,and old invoice snapshot/due-date fields unchanged. No duplicate invoice or invoice email queued/sent. No new charge or production action performed. Automatic invoice sending remains off;Airwallex custom software untouched. Next:actual new sandbox payment snapshot acceptance,then failed payment/recovery and remaining register gates.

## 2026-11-02: Billing production-readiness register consolidated

Canonical current checklist:[Whop production setup and acceptance](WHOP_PRODUCTION_SETUP.md). Completed sandbox CMS payment/invoice/cancel/resume and provider/Stemfra email deliveries;CRM classification,advanced table and reporting verified locally. Snapshot migration prepared/tested but unapplied. Replay,failure/recovery/refund,service enforcement,regional/AI acceptance and main-account configuration remain open. Airwallex custom software and existing release holds remain. No push/deploy/live charge.

## 2026-11-02: Dataset-aware CRM billing and website Clients view completed locally

Canonical siteKind reused in billing payer/subscription feeds; no flags modified. Charge records now expose dataset and payment environment; missing site classification=unknown,Whop missing explicit environment=unknown. Website subscription read feed handles one-to-one relationship object or array,loads actual provider/metadata,verifies environment against paid checkout binding,excludes deleted sites. Current readback Clean Cuts=test/sandbox,Whop,Managed website,USD299,active,paid throughDecember2. Real account label remains a classification,not proof of payment.

CRM dataset selector defaults Real accounts,with Test/Demo/Internal/Unclassified/All options. Clients tab replaced hardcoded free5% commission presentation with actual plan/provider/monthly currency/paid-through/cancellation/status and owner CMS billing link. Link opens CMS billing under the current owner session; it does not impersonate or automatically switch website. Website-only coverage is stated; AI remains separate. Old staff Stripe website checkout now410 directs owner CMS;historical Stripe portal path remains separately unchanged. Manual provider selector excludes Whop and backend rejects setting nonmanual providers globally. Airwallex custom-project quote/milestone/invoice workflow preserved.

RevenueWidget now excludes nonreal,seeded,sandbox/unknown-environment charges,uses returned billingStatus for subscription count and groups money by currency. Legacy non-Whop provider records retain legacy environment for historical reporting,not newly verified production acceptance. Compliance default also excludes sandbox and Whop unknown environment alongside existing dataset/seed exclusion;preview includeDemo remains explicit. CRM PDF query now loads service period/metadata and does not add bank instructions for Whop.

Fresh checks: CRM build/lint passed(existing warnings);13 focused core/publish/SQL transaction tests passed. Read-only integration assertions against actual configured database passed for Clean Cuts classification/price/state,charge exclusion and manual provider list. Browser verified real default count1,Test count1,actual Clean Cuts row and matching test invoice counts. Local syntax/diff checks passed. No hosted schema/data mutation,push/deploy or additional payment/email send. Previous local invoice-email preparation remains off pending delivery acceptance. Remaining billing programme: invoice address snapshots,persisted due dates/CMS list consistency,invoice email inbox acceptance,webhook replay/failure/recovery/refund,grace/suspension,regional activation,AI acceptance and provider sync-health UI. This is not production-ready billing completion.

## 2026-11-02: Existing dataset policy rechecked for CRM billing advice

Read LAUNCH_PLAN task9,DEMOS.md,handoff August18/August20 and October12 context,and current lib/testData.js plus admin site/compliance/dashboard consumers. Canonical siteKind order: test(is_test),demo(is_starter),internal(metadata.internal),real otherwise. Specific tester emails and plus aliases auto-flag test; Clean Cuts is the historical test persona. Existing Sites badges/filter and staff mark-as-test must be reused. Seeded charge metadata.demo_seed is independently excluded by compliance. Fresh hosted nondeleted site counts:demo16,internal1,test1,real-classified1. A real-classified site is not proof of real customer/payment; prior no-paying-client statement is historical,not a fresh business verification.

The recent RevenueWidget sandbox-only exclusion is incomplete relative to existing policy. Recommended first next step: propagate canonical site kind to billing charge/subscription read models,reuse existing dataset filters,exclude test/demo/internal/demo_seed plus sandbox from production reporting,fail closed for unresolved site/payment classification. Keep account kind and payment environment separate; test accounts using production money remain test commercial metrics but require reconciliation/accounting retention. Audit compliance to additionally exclude sandbox charges on real-classified sites; current compliance only checks demo_seed and canonical site kind. Then update Clients actual subscription fields/count/provider actions,then email delivery/snapshots and replay/failure/regional acceptance. No classification flags or historical transactions changed in this advice pass.

## 2026-11-02: CRM billing update slice and management assessment

Peter reconfirmed provider boundary: Airwallex custom software; Whop Managed Websites and Stemfra AI. Implemented locally: CRM billing heading explains split,existing collection selector scoped Manual collection,Whop invoices Issued rather than unverified Sent,sandbox row labels,paid-date due fallback; RevenueWidget excludes metadata.sandbox=true charges from collected/outstanding/cycle totals. Browser verified Clean Cuts Issued/Paid/Sandbox,November2 due; dashboard collected now0 rather than sandbox299. Existing historical records and Airwallex custom-project flow preserved.

Whop Stemfra email builder now produces paid invoice subject/body,INV filename,Invoices link and no payment request; other-provider receipt template retained. Existing durable outbox/idempotency retained; cached old receipt payload is rejected for review rather than sent. Receipt/email worker remains off,no invoice email delivery claimed. CRM build/lint passed with existing warnings;13 focused billing tests passed;paid-invoice/existing-receipt template assertions and syntax/diff checks passed. No AI runtime edit,remote schema change,push/deploy.

Peter requested CRM management advice. Audit checked Billing.jsx,SpaceWidgets.jsx,subscription and billing controllers/routes,manual billing service,AIRWALLEX_INVOICING.md and CUSTOM_PROJECT_LINKS.md. Remaining current Clients tab still hardcodes free site5% commission and counts historical commission charges; subscriptions API remains Stripe-oriented and assumes relationship array,omits provider/membership/sandbox; RevenueWidget incorrectly reads x.status instead of returned billingStatus. Global provider selector still mutates one setting; do not use it to switch Whop/Airwallex across products. Staff subscription checkout/portal routes still Stripe-specific. Existing Whop manual-mark-paid/requested,plan-change and recurring-charge guards should be preserved. CRM PDF endpoint still lacks period/metadata fields. Custom-project native-currency quotes/milestones/invoice links already exist; Airwallex status reconciliation there remains separately pending/historical. Recommended next slice: provider-aware website subscription read model/Clients table and actions,then transaction sync health,invoice snapshots/delivery audit,environment/currency-safe reporting and exception handling. AI billing must be integrated through its separate authorized backend boundary,not assumed present in site-only subscriptions.

## 2026-11-02: Cancellation/reactivation and Whop lifecycle inbox delivery accepted

CMS Cancel flow submitted against Clean Cuts sandbox subscription, with sandbox-test feedback. Hosted readback confirmed status active,cancel_at_period_end=true,original paid end2026-12-02T14:16:41.299Z unchanged. CMS then Reactivate succeeded; hosted readback and actual Whop membership re-fetch both confirm active,cancel_at_period_end=false,same original paid end. Invoice count remains1,no second purchase/charge. Peter supplied inbox screenshots of Stemfra via Whop membership canceled and membership resumed emails. Resumed email keeps December2 billing date. This verifies provider mutation/reversal and both lifecycle email deliveries, not future service expiry/suspension.

CMS paid invoice PDF downloaded through authenticated owner UI. Found missing period/metadata in download query and blank due date. Local fixes: query now loads period_start/period_end/metadata; paid Whop PDF uses paid_at as due-date fallback. Downloaded again and asserted text, rendered with bundled pypdfium2 and visually checked: issue/dueNovember2,serviceNovember2-December2,full saved Stemfra billing address,paidUSD299,provider payment reference,manage link. Corrected download /Users/peterokeme/Downloads/invoice-2af6c1e0 (1).pdf. Syntax checks and git diff --check pass. Saved Stemfra address differs from fictional Whop checkout address; PDF currently reads live saved profile,not frozen issued snapshot. Invoice list due date remains blank because persisted due_date is null; local PDF fix is not persisted date repair.

CRM browser verified INV-2AF6C1E0 for Clean Cuts,USD299,PAID. Existing UI also shows SENT despite no verified Stemfra invoice-email send,legacy commission copy and collection-provider selector; dashboard includes sandbox299 in collected total. These require reconciliation/isolation before production readiness,not a claim CRM acceptance fully passes. CMS cancellation copy promises site offline at expiry,which full enforcement has not verified. No CRM/frontend edits yet. Email ownership decision unchanged: Stemfra invoice email only,Whop payment/lifecycle notifications; implementation still pending. Remaining: replay/failure/recovery/refund,invoice snapshots/persisted dates,email queue reconciliation,multicurrency activation,CRM stale copy/status/test isolation and full service enforcement. No push/deploy.

## 2026-11-02: Email ownership approved; next acceptance sequence

Peter approved Stemfra sends invoice emails, Whop sends payment-related emails. This is a product decision, not yet implemented: current sendInvoiceEmail delegates paid Whop charges to sendReceiptEmail, so it must be reconciled before enabling the existing receipt worker. Keep duplicate receipt sending off; pending outbox row requires deliberate handling. Stemfra invoice email must identify the payment as already paid and must not request another payment or compete with Whop recovery notices.

Peter reports Whop email Manage membership opens Whop sandbox billing, establishing provider management-link navigation for this test (not proof of cancellation). Next acceptance order: CMS paid invoice/PDF full billing address, issue/due dates and period; CRM matching paid record; in-app cancellation/reactivation with unchanged paid-period end and provider verification; replay/duplicate safety; failed payment/recovery; approved CAD/GBP/KES checkout and activation. Current application reconciliation is USD-only, so regional amount rendering is not regional activation acceptance. Refund lifecycle remains pending.

Tax research: current Whop Seller Terms distinguish Whop Collects and Remits (tax MoR in supported jurisdictions), Whop Calculates/You Remit, and You Handle Tax. Checkout tax appearing is not proof the account is configured for remittance. Exact account tax mode remains unverified. Test country/address can be selected directly in sandbox; no need to change seller business country or VPN location. Currency alone does not establish tax treatment.

## 2026-11-02: First Clean Cuts sandbox payment reconciled; Whop receipt delivered

Peter submitted final Subscribe. Fresh webhook log confirms signed deliveries processed, with one new paid charge for Clean Cuts. Hosted database readback: checkout ch_49CCBGGac1D4kXo state=paid,sandbox=true; subscription provider=whop,status=active,USD299,paid period through2026-12-02T14:16:41.299Z,cancel_at_period_end=false. Exactly one Whop invoice row found for this site:2af6c1e0-61b3-49c2-870b-152670eece78,paid,USD299,period2026-11-02 through2026-12-02,sandbox=true. This verifies first-payment account linking and persisted subscription/invoice reconciliation, not all lifecycle scenarios.

Peter reports CMS returned as subscribed and supplied inbox screenshot showing Stemfra via Whop order confirmation,USD299,Visa4242,renewalDecember2 and management link. This establishes receipt inbox delivery for this sandbox purchase. Stemfra receipt flag is off; outbox row pending,attempts0. No duplicate Stemfra receipt sent by this workflow. Peter suggested avoiding duplicate receipts but requested discussion; no email-policy/code change made. Decide receipt ownership and pending outbox handling before enabling any receipt worker.

Tax clarification: checkout initially defaulted to Austria with20% estimated tax. Agent changed to explicitly fictional US billing address for sandbox rehearsal; provider recalculated USD299 total. No plan/account tax setting disabled. This does not establish a general US tax exemption or production tax policy. Actual customers must provide accurate billing details. Pending: invoice/PDF full address/dates, CRM visible acceptance, cancellation/reactivation, replay, failure/recovery and refund acceptance. No live-money charge, push or deployment.

## 2026-11-02: Clean Cuts account-bound sandbox checkout ready for Peter submission

Peter signed in privately and authorized Clean Cuts test. CMS Subscribe successfully created account-bound sandbox checkout ch_49CCBGGac1D4kXo and navigated to sandbox.whop.com. Switched provider checkout from its existing different signed-in email to authorized eenglishwithpeter@gmail.com. Entered public sandbox4242 card,12/30,123 and fictional Clean Cuts Sandbox Test,123 Test Street,Suite4,New York,NY10001,US. Initial geo-default Austria displayed20% tax; selected fictional US test country and final visible total became USD299/month,USD299 due today. No real card used. Final Subscribe click rejected by automatic approval review as requiring user takeover for financial submission, including sandbox. Asked Peter to click Subscribe himself; no bypass or successful payment claimed. Browser tab11 retained for handoff. Next: inspect payment return and signed webhook reconciliation, subscription/invoice/PDF/CRM state. Local API4000 running with explicit Background jobs disabled startup confirmation; sandbox-only receiver4055 and existing tunnel remain required. No password supplied in chat or persisted by agent; no push/deploy.

## 2026-11-02: Visible CMS sandbox test prepared; Clean Cuts login pending

Peter authorized visible browser sandbox testing and selected existing Clean Cuts test account. Logged out of Marcus Argyle demo CMS and opened sign-in, test email prefilled; Peter must complete private sign-in. No password requested in chat. No card payment submitted.

Local ignored server .env now WHOP_ENABLED=true, WHOP_SANDBOX=true, BACKGROUND_JOBS_ENABLED=false, WHOP_RETURN_ORIGIN=https://switches-levy-growth-sec.trycloudflare.com. Production unchanged. Replaced log-only port4055 receiver with temporary /tmp/stemfra-whop-billing-receiver.cjs, which enforces sandbox account, calls existing lib/whop/service.receive, logs minimal results, accepts only webhook/health and HTTPS checkout return redirect to local CMS. Public health verified; unsigned webhook correctly401; return302 verified. No Twilio route exposed or called. Local API restart requested with BACKGROUND_JOBS_ENABLED=false. Hosted CMS migration already applied; AI untouched. Next: verify API startup, owner login/Clean Cuts selection, account-bound Subscribe, actual sandbox checkout and signed payment reconciliation, invoice/PDF/CRM/cancellation/failure acceptance. Temporary receiver remains needed while tunnel is in use. No push/deploy.

## 2026-11-02: Approved CMS Whop migration applied to hosted database

Peter explicitly approved application. Supabase apply_migration whop_billing_v1 succeeded on stemfra-ops project acxepovfklgthxmteqxr using the reviewed local SQL, including provider allowlist and subscription_status cast fixes. Readback confirms three security-invoker Whop functions executable by service_role only, not anon/authenticated. Post-migration security advisor reports informational RLS-without-policy notices for the intentionally server-only Whop tables; existing unrelated CRM/auth warnings remain outside this change. No payment, subscription activation, backend enablement, AI migration, push or deployment completed. Next: sandbox-only backend configuration, approved test-site/account binding and actual reconciliation receiver before card checkout. Prior entries recording migrations as unapplied are historical and superseded for CMS only.

## 2026-11-02: CMS sandbox E2E prerequisites audited; migration approval needed

Scope narrowed by Peter to CMS, marketing and CRM; those existing local apps opened and template tabs closed. CMS Billing displays Subscribe and Card; CRM is accessible but its session is locked. Fresh read-only Supabase check matched configured project acxepovfklgthxmteqxr (stemfra-ops). All three Whop tables and Whop functions absent. WHOP_ENABLED=false, sandbox=true, sandbox managed plan configured; return origin remains production default. Existing public tunnel routes to a log-only receiver, not application reconciliation.

Found two hosted-schema compatibility gaps in the draft CMS migration: subscriptions_provider_chk excludes whop, and subscriptions.status is public.subscription_status rather than text. Updated draft to preserve existing providers plus whop and cast normalized state to the actual enum. Transaction fixture now reproduces both hosted constraints. All13 focused core/publish/transaction tests passed, including existing sibling adapter checks; no AI files changed. No hosted migration, payment, environment enablement or backend restart performed. Shared hosted schema change needs Peter coordination/approval under workspace instructions before sandbox activation. Full checkout, signed delivery, invoice/address/receipt, cancellation, failure/recovery and refunds remain unverified. No push/deploy.

## 2026-11-02: Whop webhook configuration rechecked; signed test awaiting approval

Fresh checks: stemfra_server/.env has nonempty WHOP_WEBHOOK_SECRET and API key; WHOP_SANDBOX=true, WHOP_ENABLED=false, expected sandbox account biz_JXJPD9Q4Ta5thq. No secret value printed. Existing isolated receiver listens on127.0.0.1:4055; local health and https://switches-levy-growth-sec.trycloudflare.com/health returned successfully (public HTTP200). Receiver source dynamically reads the secret, verifies SDK signatures, and logs minimal event metadata only; it does not reconcile the database or activate subscriptions.

Browser access works in this session. Sandbox dashboard verified hook_g7xlBRcIKALZr active at the full expected /api/whop/webhook endpoint, API version2026-10-15-1, all96 events selected, sub-account events off. No settings changed. API listing with correct account_id was refused403 for missing developer:manage_webhook. Dashboard initially showed no deliveries. Signed payment.succeeded test submission was rejected by automatic approval review because trusted explicit authorization for that external event was absent; no successful delivery verified. Ask Peter to explicitly authorize that test before retrying. Do not bypass the rejection. Sandbox checkout/account/subscription/invoice E2E remains unverified. No migration, backend startup, production change, push or deployment performed. Existing uncommitted work preserved.

<!-- 2026-10-29 local update: CMS obsolete bank-transfer subscription UI removed; typecheck passed. Visual acceptance blocked by browser tool; Whop sandbox checkout remains whop_unavailable. Full lifecycle acceptance still pending. -->
## 2026-10-29: In-app Whop cancellation and reactivation implemented locally

CMS and AI now reuse their existing cancellation dialog (reasons/feedback), Cancel subscription and Reactivate controls for Whop. Owner guards remain in place. Backend requires a paid checkout binding in the configured environment, validates the provider account/product/plan/terms before mutation, sets cancel_at_period_end through the pinned SDK membership update, re-fetches the provider and reconciles through the existing transaction. No success response until the desired flag is confirmed; paid period must remain unchanged. Pending cancellation can be reversed before expiry; this is not a new purchase or refund. Manage billing remains the fallback. Feedback is retained locally. UI styling/classes/fields unchanged.

Verification: 13 focused node tests passed across core (both adapters), SQL transactions and publishing; CMS and AI web typechecks passed. AI server no-emit typecheck passed again after the final feedback persistence edit. Initial emitting server build was blocked by filesystem EPERM, not a TypeScript source diagnostic. Browser opened CMS Billing at5180 but billing data showed Failed to fetch (API offline); no cancellation UI acceptance or actual provider mutation verified. Frontends5180 and5184 started only; no backend jobs, hosted migration, production operation, push or deploy.

Remaining approved work: complete service-access/grace enforcement, refund request and staff approval/refund reconciliation, notification deduplication, approved multicurrency activation and sandbox E2E. No 30-day guarantee advertised. Custom-software Airwallex unchanged. Hosted migrations and HTTPS webhook acceptance remain pending; do not enable billing or describe this as production-ready.

## 2026-10-29: Managed website sandbox currency prices updated

Peter approved USD299, GBP225, CAD400 and KES30000. Existing variants under product prod_8yS3ag3xox3FJ were retrieved to verify product/currency, GBP/CAD/KES renewal prices PATCHed with native API date 2026-10-24, and all four retrieved/asserted successfully. USD299 was already correct. Initial fee0; existing billing_period30 retained (every 30 days, not newly verified calendar-month billing). USD visible; GBP/CAD/KES hidden direct-link test variants. EUR/NGN prior artificial test variants unchanged, outside selected launch currencies. No production account operations or payment. Backend still requires approved multicurrency validation before activation; checkout rendering/payment acceptance pending.

## 2026-10-29: Sales cost and regional pricing planning

[Sales economics](SALES_UNIT_ECONOMICS.md) records the Raiser base, commission scenarios and website contribution model. Commission terms and regional prices remain pending. Follow-up: timezone city aliases and older-browser global fallback identified by source inspection; not implemented. Whop acceptance status unchanged.

## 2026-10-27: Invoice email test blocked; defer to verified production account

Attempted authorized email delivery of sandbox invoice #00000003 (pay_uJSlG5nmpJB6pk) to Peter's nominated test recipient. POST /invoices/{id}/send returned HTTP400, code invoice_account_verification_required: Complete account verification before issuing an invoice. No email send or charge succeeded. Draft address creation/update, due date and recipient configuration were verified separately.

Peter requested recording this for later production-account testing. Pending: use the verified production account for one explicitly authorized test invoice/email; verify issue/send, actual inbox delivery, branding, full Bill to address, due date, PDF and hosted payment link. Do not charge, create a real recurring subscription or assume production test amounts without Peter's authorization. Provider send acceptance is not proof of inbox delivery. Sandbox limitation observed applies to this unverified sandbox account; it does not prove all Whop sandbox accounts cannot issue invoices. Re-check documented sandbox verification options before any claim that production is the only technical route.

Scope: managed websites and Stemfra AI subscriptions only. Custom software Airwallex billing remains unchanged. No production action performed.

## 2026-10-27: Subscription reminders, invoice addresses and suspension plan

Applies to managed websites and Stemfra AI. Peter requested these plans be retained in the roadmap. Planned work below is not implemented or production-verified. Airwallex remains for custom software.

| Work item | Planned behavior / acceptance | Status |
| --- | --- | --- |
| Renewal notice | One notice 3 days before actual provider renewal date, showing plan, expected amount, renewal date and Manage billing. Verify Whop native notices first and prevent duplicate Stemfra/provider emails. | Pending provider check and implementation |
| Renewal invoice | Date of issue and due date match the renewal date; show actual service-period dates. Mirror successful payments as paid Stemfra invoices without creating a second payable charge. Initial manual invoice deadlines are separate from renewal rules. | Pending lifecycle acceptance |
| Bill to | Full saved billing address, with business address fallback when available, including first invoice. Snapshot details for issued invoices; address edits affect future invoices. Preserve existing CMS/Airwallex PDF layout and editable fields. Verify Whop address propagation separately. | Native draft address create/update verified; app propagation and snapshots pending |
| Failed renewal | Immediate failure notice with payment-management link; final warning on day 3 stating day-7 suspension. Avoid duplicate provider recovery messages. | Pending |
| Grace period | Existing paid customers receive 7 days after failed renewal. First subscription activates only after successful payment, with no grace access. Define exact provider-time boundary and cancellation/refund handling before implementation. | Pending |
| Suspension and recovery | Day 7 unpaid: suspend service and notify; preserve website/data and billing access. Restore automatically only after verified successful payment. Audit public website, publishing, Front Desk, AI spending and background tasks so enforcement is consistent. Current local code only gates CMS publishing and expired AI credits, not this complete grace/suspension policy. | Pending design and tests |
| Sandbox acceptance | Test first payment, failure, reminders, day-3 warning, day-7 suspension, successful recovery, replay protection, address snapshots and invoice dates. Use isolated clock-controlled tests where possible. Verify actual email delivery separately. | Pending |

Verified sandbox evidence: current native invoice #00000003 (`pay_uJSlG5nmpJB6pk`) retained the updated full fictional address, due October 27, and Peter's authorized test recipient. It is still draft/unsent; delivery is not verified. Dashboard shows manual-invoice overdue reminders at 3, 7, 14, 30 and 60 days after due date. This is not evidence of pre-renewal notification or service suspension. Native invoice API requires Api-Version-Date >= 2026-10-24; older #00000001 is legacy, so its invoice-specific plan finding must not be generalized. See [Whop billing](WHOP_BILLING.md).

## 2026-10-27: First unsent sandbox invoice created and read back

Peter requested a test invoice. Created sandbox invoice `inv_erEXFZ6YdGyJGK`, number `#00000001`, for fictional Stemfra Sandbox Test Customer, reserved example.test email. Retrieved status=draft, collection_method=send_invoice, payment=null, buyer fee=false, no auto-finalization or due date. Existing sandbox Starter product `prod_Ot5Pmodh9rDRd`; returned current_plan `plan_DypvmKkOXE1iS` is a NEW invoice-specific renewal plan: USD100 every30days, initial/setup0, no trial. No invoice issued, email sent, payment method supplied or charge submitted. No PDF URL returned for this draft.

Important integration finding: invoice creation generated a separate plan ID instead of reusing the catalog Starter plan. The current subscription adapter intentionally allows only configured catalogue IDs and would not activate this invoice-derived plan. Keep this draft as a provider API test; invoice-first activation needs explicit binding/validation design before end-to-end use. Retrieved invoice shape includes current_plan and a fetch_invoice_token (secret); raw response retained only in private /tmp/stemfra-whop-draft-invoice.json, never docs/commits. No backend release flags changed.

Next: review the draft in sandbox Invoices; optionally test draft update/issue under a separately approved sandbox payment test, then implement reviewed database/webhook acceptance. Production untouched.

## 2026-10-27: Sandbox keys and four test plans verified

Peter entered sandbox Admin API keys privately in both ignored backend .env files. Both keys successfully read the sandbox business products and all four created plans; first-payment amounts were read back and match monthly amounts, setup fee 0, trial absent, 30-day renewal. Sandbox business: `biz_JXJPD9Q4Ta5thq`. Saved account/plan IDs into both ignored .env files; WHOP_SANDBOX=true and WHOP_ENABLED=false retained. Account-summary GET was refused for missing company:balance:read; not required for the integration, no extra balance permission requested. Keys were not printed or committed.

- Stemfra Managed Website: USD 299/month, product `prod_8yS3ag3xox3FJ`, plan `plan_GfckMwUyJrip0`.
- Stemfra AI Starter: USD 100/month, product `prod_Ot5Pmodh9rDRd`, plan `plan_QgIMigERZSz9S`.
- Stemfra AI Growth: USD 200/month, product `prod_SMKexX5hengSD`, plan `plan_gtnAkuiE4Vf70`.
- Stemfra AI Business: USD 300/month, product `prod_CqWiVEDSmz8fe`, plan `plan_Zw8nMEDBh0HrS`.

Products are hidden, variants buyable by sandbox checkout, no included apps/affiliates/welcome messages. Tested actual implemented checkout creation for Starter: sandbox checkout `ch_gHbJu3IU23CgnZw` created successfully, sandbox.whop.com URL. No payment/customer data submitted. This checkout is a transport probe without a local database intent and must not be used for activation testing. Whop rejects HTTP return URLs; HTTPS return origin is required. The successful probe used the existing AI HTTPS URL, without navigating or paying. Full local checkout/webhook testing needs a separately reachable HTTPS test API and app origin.

Remaining: reviewed SQL migrations, isolated acceptance target, reachable HTTPS webhook endpoints and their signing secrets, then a real sandbox payment/renewal/receipt test. No production provider changes, database migrations, push or deploy. No server processes started.

## 2026-10-27: Account-bound Whop billing implemented locally, sandbox acceptance pending

Final verification: marketing build/prerender passed 99 routes; AI web build/SEO passed 20 pages; AI server build, AI web/CMS typechecks and four repository diff checks passed. Whop core/transaction/route/publish tests pass (15 tests). Broader configured-database dashboard regression run: 59 passed, 8 failed, 1 skipped across dashboard plus Whop routes; failures are stranger-access 404 expectations receiving 403 from the current permission guard. Do not claim the full suite passes. This existing dashboard suite uses temporary rows in the configured database and runs cleanup; it is not a hermetic test. No Whop migration was applied, no provider transaction/email exercised. Both backend local env files contain no configured WHOP variable names.

Implemented owner-bound checkout, official SDK raw-body signature verification, provider re-fetch/validation, transactional replay-safe subscription/paid-invoice sync and durable branded receipt outbox in both independent backends. AI renewals grant monthly plan credits once and preserve top-ups; expired Whop periods block credit spending. CMS retains invoice history/PDF and adds paid Whop publishing gate behind WHOP_ENABLED. Manual subscription invoice opening is retired; Whop charges cannot be manually confirmed or opened through Airwallex. Public Subscribe now passes through Stemfra account/Billing before checkout. Airwallex remains custom-software only. Full design, limits and rollout checklist: stemfra_server/docs/WHOP_BILLING.md.

Local core/SQL transaction tests (8), Fastify route tests (6), AI server build and AI web typecheck pass. Hosted migration/provider sandbox/payment/email acceptance NOT performed. SQL drafts require review/application; credentials and flags require sandbox configuration before live use. No commit/push/deploy. Existing unrelated work preserved. Refund/dispute automation and manual Whop invoice-first API creation remain out of scope/pending verification. Do not claim production acceptance.

## 2026-10-27 P48 billing update: Whop preparation, local only

Peter superseded the trial/manual-subscription offer: monthly Whop managed website $299 and AI100/200/300, no free trials, included domain registration <=$30. Checkout UI and domain policy locally prepared; invoice history retained. Automatic authenticated payment binding, signed webhook reconciliation, invoice sync and AI credit grants remain pending. This is not P48 billing acceptance or a verified live release. See ../../docs/PAYMENT_LINKS.md and root SESSION_HANDOFF.md for fresh checks and limits. Airwallex reserved for custom software; historical entries below retain their dates.

## 2026-10-26: Concierge plan formatting and shared guidance

AI pricing follow-ups now render server-owned plan rows, with name above price, separate annual price/seats/credits and shared terms. Help Center supports the plan card too. Agent presentation intent supports contextual requests; browser verified the direct category-selection path. Marketing build (99 routes), two offer tests, plan-card assertions and syntax/diff checks passed. Mobile and Help Center visual checks remain unverified. Shared rules recorded in ../../docs/AI_CHAT_PRESENTATION.md and linked from AI AGENTS/handoff; AI runtime unchanged. Local only.

## 2026-10-26: Concierge offer reconciliation, local

Chat reconciled to current three-product marketing offers; tests/build/browser passed. Help Center article/support-mode reconciliation and Mark review follow-ups remain pending. See [review](CONCIERGE_REFRESH_2026-10-26.md). Billing activation and voice holds unchanged.

## 2026-10-26: Signup audit follow-up pending

See ../../docs/SIGNUP_FLOW_AUDIT_2026-10-26.md for email/Google signup findings, required-field and error-recovery gaps, old commission copy and verification limits. Review only; fixes and live acceptance remain pending. Existing launch/payment holds unchanged.

## 2026-10-26: Public marketing noindex correction, local

Removed the blanket noindex prop from OfferPreview shared Shell. Active /custom-software and /pricing were adding noindex after JavaScript rendered despite indexable prerendered HTML. Active /websites and /ai use separate components. Browser verified both corrected routes have no robots exclusion and retain their production canonical; /claim still has noindex. Production build passed (99 rendered routes); generated HTML checked for both public pages and Claim. Private Claim, NotFound and separate draft-component exclusions unchanged. Not pushed; Search Console screenshots show two noindex exclusions but do not identify their URLs, so attribution remains unconfirmed.

## 2026-10-22: Hero/pricing live; footer refinement local

Marketing 4156537c deployed successfully as Cloudflare b1147b2e. AI 7aee84d deployed as df91cbef. Public browser verified device hero, pricing seats and annual totals 1000/2000/3000 with mailto Contact support. Checkout unchanged/disabled. Follow-up footer: copyright moved to divider-separated bottom row with Terms/Privacy/Refunds, removing duplicate Legal column. Local build and desktop browser passed; footer not yet pushed/deployed.

## 2026-10-22: AI hero and marketing pricing reused locally

Copied marketing /ai split device hero, asset and responsive styles into AI homepage, preserving AI navigation and signed-in Dashboard CTA. Marketing AIPrice now reuses AI LaunchPricing cards, annual toggle, seats, comparison and FAQs. Refund link targets AI policy. scripts/sync-ai-pricing.mjs refreshes marketing component/public catalogue from sibling AI source; no runtime cross-repo dependency. Both builds passed; desktop browser checked hero and annual 1000/2000/3000 totals, seats and Contact support links. Mobile breakpoint CSS copied but not separately browser-verified. Checkout unchanged/disabled. Local only, not pushed or deployed.

> 21 October 2026: AI annual pricing presentation and AI policy sections drafted locally; desktop pricing/build verified. Checkout and release remain disabled. See current session handoff; commercial policy decisions and Paddle eligibility remain open.

## 2026-10-20 pending: Align agent knowledge with three products and approved pricing

Peter requested a pending audit of Mark calling context, marketing assistant/Concierge, Stacy and related copilots after the product/pricing changes. Confirmed initial evidence: lib/voiceBrain.js still instructs free website + 5% commission and no monthly plans; lib/conciergeBrain.js also states no monthly fee + 5%. Full context sources, CRM Copilot and Stacy not yet audited. Trace injected knowledge, prompts, product routing, CTA destinations and call summaries; use the maintained product/pricing catalogue and preserve tenant-specific business information. Verify Websites USD299/month, AI Starter/Growth/Business USD100/200/300, and custom software agreed quote handling against current approved sources. Cover trial limits and release/payment status without inventing policy. Add mocked representative pricing/product checks; no Twilio calls, email tests or payment activation. No prompt changes yet. Keep native-transport retirement and unused speed-to-lead cleanup tracked separately; retain enquiry arrival history and only mark engagement after an actual action.

## 2026-10-20: Front Desk native-only approved and implemented locally

Peter confirmed n8n Front Desk retirement. Removed webhook transport, mode fallback and webhook URL from deployment workflow. Native brain is unconditional and checks OpenAI configuration. Mocked native dispatch/output/error propagation and syntax checks passed; no live provider call, push or deployment. Historical n8n files retained as references, no external workflow deletion. Concierge unchanged. Argyle custom-domain CORS remains a separate unresolved issue.

2026-10-20 Front Desk production audit: confirmed custom-domain CORS gap and production n8n fallback versus local native transport. No fix or deployment performed. See [audit](FRONTDESK_PRODUCTION_AUDIT_2026-10-20.md).

## 20 October 2026: contact intake alignment, local implementation

Product forms, AI plan persistence, product-scoped duplicate matching and subscription forecasts implemented locally and checked. See [PRODUCT_LEAD_PRICING.md](PRODUCT_LEAD_PRICING.md). No deployment/live submission. Broader deal conversion, calculator and catalogue consolidation remain open.

## 2026-10-20: CRM Product dropdown local preview

Lead form now displays Websites, Custom Software and Stemfra AI. Website shows US$299/month, AI shows agreed plan prices with preferences recorded in Notes; custom fee/quote handling preserved. Browser dropdown inspected. No lead saved, no remote changes or push. Forecast logic and end-to-end product mapping remain unfinished; this is a presentation preview, not completed pricing integration.

## 2026-10-20: On-site AI subscription comparison

Marketing /ai#plans now presents Starter/Growth/Business with seven features plus four expandable items, unchanged prices/credits and coming-soon notice. Pricing overview Compare AI plans stays on marketing. Active FocusedAIHome and previous preview reuse the same comparison component. Desktop navigation/anchor and layout verified; production build passed before final heading-only CSS adjustment. No push or activation.

## 2026-10-20: Marketing AI offer links to subscription comparison

Kept one card per product. AI offer now starts at the agreed US$100 rather than historical $199, names Starter/Growth/Business and shared tools with differing credit allowances, and states coming soon. Pricing CTAs link to AI /pricing rather than signup, including the reused AI price section. Production build and desktop layout/link-target inspection passed. Local only, not pushed.

## 2026-10-20: Marketing About page updated locally

Applied the approved three-offering copy to stemfra_client/src/app/pages/About.jsx, including the documented Business Assistant scope. Preserved existing layout and refreshed STEM principles and contact CTA. Production build passed with 99 routes prerendered; desktop browser review passed. Mobile-specific visual review not performed. SEO description already covers all three offerings. No push, deployment, payment change or email test.

## 2026-10-16: Concise McMaster proposal and two-attachment email

Created McMaster-Nnerve-proposal-review-v4.docx as a one-page commercial proposal referring to unchanged Nnerve-project-scope-and-pricing.xlsx for detailed scope and exclusions. Exact Development/Delivery milestone headings and CAD 5,000 commencement/final acceptance retained. Key acceptance, commercial and pending ownership/support/tax/procurement terms retained. Email review-email-v4.txt introduces proposal and spreadsheet only, invites feedback before commercial invoice; removed earlier invoice-attachment claim. One-page DOCX rendered and visually checked. No send or invoice action.

## 2026-10-16: Nnerve scope workbook and exact milestone headings

Created outputs/mcmaster-nnerve/Nnerve-project-scope-and-pricing.xlsx by importing FreshAir Sampler SOP_Helmsley.xlsx and retaining single-sheet arrangement, widths, merges, row heights and visual formatting. Replaced content with Nnerve review scope, exclusions, verified repository technology and CAD 10,000 with two 5,000 milestones. Timeline and ongoing services remain unagreed. Rendered all populated sections and verified cached totals, merges, widths and no formula errors. Proposal review v3 and email v3 use exact requested headings 1st Milestone: Development and 2nd Milestone: Delivery; DOCX all three pages visually checked. Nothing sent or issued; previous drafts retained.

## 2026-10-16: McMaster proposal Development and Delivery revision

Created proposals/mcmaster/McMaster-Nnerve-proposal-review-v2.docx and review-email-v2.txt. Replaces Design-only phase with Development, then Delivery; interface design remains included within development. Explicit working-platform and acceptance/handover deliverables, eight-row included-features table and separate future-additions section. CAD 10,000 unchanged: CAD 5,000 at commencement and CAD 5,000 on final acceptance, not on entering phase 2. Removed instalment wording from new deliverables. Three-page render visually checked; text/table/payment checks passed. Prior drafts preserved. No invoice created/changed or email sent. Future review invoice must say Phase 1: Development; old voided/tax samples are not payable attachments. Email attachment wording requires a matching review invoice before use. Schedule, ownership, ongoing services, tax and procurement details remain for agreement. Paid activation holds unchanged.

## 2026-10-16: Nnerve McMaster proposal review draft

Peter clarified this is Nnerve itself, already under unpaid development, now proposed for a paid engagement to complete delivery. Confirmed CAD 10,000 total: CAD 5,000 at commencement and CAD 5,000 on final acceptance. Created proposals/mcmaster/McMaster-Nnerve-proposal-review-v1.docx and review-email-v1.txt. Client draft presents complete procurement scope without claiming no earlier work exists. Two phases Design and Development/testing/handover; core scope and future additions separated. Included/excluded details remain review proposals, not client acceptance. Dates, ownership, operating costs, support, tax and PO pending agreement. Three-page Word document rendered and all pages inspected after removing inherited title border. Email remains unsent with contact placeholder; attachment wording anticipates a separately prepared review invoice. Existing voided/tax-layout samples must not be sent as payable invoices. No new invoice or provider action.

## 2026-10-16: McMaster phases reviewed before proposal

Read Nnerve SESSION_HANDOFF, REQUIREMENTS and ROADMAP as reference, not fresh runtime verification. Existing scope covers candidate/professor/admin, ATS/intake/CCV, scoring, interviews/assessment/video and messaging, with advanced features and hardening still documented as unfinished. Existing invoice history records two 5,000 instalments; CAD and USD are comparison variants, not proof of signed currency or payment triggers. Recommended discussion structure: two commercial phases, Design and Development/testing/handover, with delivery checkpoints underneath. No proposal drafted or scope exclusions agreed. Added possible McMaster PO field and explicitly unverified supplied tax/procurement claims to invoice docs; PDFs/provider untouched.

## 2026-10-16: Invoice standards register approved

Peter approved the custom software layout, separate from CMS style. Added docs/INVOICE_STANDARDS.md mapping CMS, CRM Billing, separate CRM Accounting records, AI printable invoices, tenant/provider invoices, supplier documents and other charge triggers. Source inspection only, no runtime or live changes. Updated stale custom-software JSON wording/footer to approved project/phase format. CAD test void is user-reported, not re-verified. Paid activation holds unchanged.

## 2026-10-16: Local CAD tax sample

Peter reports CAD INV-CS-20261016-02 voided manually; not API-verified, and no API calls authorized for this task. Created invoices/mcMaster/INV-CS-20261013-04-CAD-tax-branded-sample-v1.pdf from approved layout using source invoices/INV-CS-20261013-04_plus_tax.pdf: source number/date and exact hyperlink, CAD 5,000 excl tax, 13% / CAD 650, total CAD 5,650. Current approved two-line product and department address retained, customer email omitted. Logo moved left 1.5pt (2 CSS px) from prior v3. Tax columns and subtotal/tax/total replace former untaxed table. Render inspected, one page, text/tax/link checks passed, no due display. Local presentation sample only, no invoice issued/sent, no tax applicability determination or live link verification. Source old description/address differ by intentional approved presentation updates. Paid activation holds unchanged.

## 2026-10-16: CAD logo spacing review v3

Created invoices/mcMaster/INV-CS-20261016-02-CAD-branded-review-v3.pdf. Moved logo 12.375 points right so visible mark-to-text gap is approximately 4.73 points, matching Stemfra/LLC word spacing. Render inspected; one-page/content/link checks passed. All other approved layout preserved. Legal name remains McMaster University; department remains address, separate lines on custom PDF. User screenshot of existing Airwallex invoice still displays customer email despite reported customer-record removal; no provider update inferred or performed. Nothing sent; activation hold unchanged.

## 2026-10-16: CAD logo review v2

Created invoices/mcMaster/INV-CS-20261016-02-CAD-branded-review-v2.pdf from approved v1. Added exact stemfra_client/public/stemfra_logo.png referenced by marketing index.html beside top-right Stemfra LLC. Removed McMaster email per Peter's reported customer update; retained separate department/street lines and all other layout. One-page render inspected; amount, hidden due date, billing contact and hosted hyperlink verified. Original files preserved. Local PDF only, no Airwallex mutation/send; prior CAD finalized/unpaid state not re-queried. Paid activation remains held.

## 2026-10-16: USD voided, CAD comparison finalized and custom template preserved

At Peter's explicit request, USD INV-CS-20261016-01 / inv_sgpdnj9f9hn9h2sxi3h voided via API and retrieved VOIDED/UNPAID. Created CAD INV-CS-20261016-02 / inv_sgpdd4sszhn9hq0qmq2, CAD 5,000, tax 0, finalized with due_at 2026-11-16T23:59:59+0000. CAD remains FINALIZED/UNPAID; no send/payment call. Automatic emails OFF confirmed by Peter earlier in session. CAD uses existing McMaster customer and project product, separate Phase 1: Design line description, CAD bank and Interac instructions. Recovery: output/invoices/custom-software-cad-20261016-state.json (private, signed links).

Official PDF invoices/mcMaster/INV-CS-20261016-02-CAD-airwallex.pdf downloaded/rendered/checked. Custom invoices/mcMaster/INV-CS-20261016-02-CAD-branded-review-v1.pdf was made by cloning supplied CAD final-review-v3 PDF resources/content, replacing ONLY three invoice/reference strings, invoice date and exact matching hosted hyperlink. Source layout/fonts/positions preserved, no due display, separate department line, table before bank, bordered footer. One page text/link checks and rendered inspection passed. User screenshots show provider output; present custom PDF prominently to avoid confusion. Originals untouched. CAD not voided yet; tax/proposal future work and AI activation holds remain.

## 2026-10-16: USD comparison finalized, custom PDF hides due date

Peter approved one calendar month after current date as Airwallex due date, hidden only on custom PDF. Updated existing INV-CS-20261016-01 / inv_sgpdnj9f9hn9h2sxi3h to due_at 2026-11-16T23:59:59+0000 and finalized through API. GET confirmed FINALIZED, USD 5,000. Automatic invoice emails OFF confirmed by Peter; no send/payment/void endpoint called. Invoice remains outstanding for later requested void. Do not treat it as voided or paid.

Downloaded official invoices/mcMaster/INV-CS-20261016-01-USD-airwallex.pdf. Official one-page PDF visibly shows Chemistry Department flattened alongside street, and the separate line description Phase 1: Design correctly below Academic recruitment platform. This corrects historical inference that no description renders: line_items.description works; price.description was the wrong field. Custom invoices/mcMaster/INV-CS-20261016-01-USD-branded-review-v1.pdf preserves approved v3 layout, updates date/number/reference and exact current hosted link, puts department on own line, omits due-date display. Both rendered and visually checked; custom text checks verify one page and no due-date/due-on wording, matching hyperlink. Original PDFs preserved. Invoice date now 16 Oct 2026. Recovery state output/invoices/custom-software-usd-no-due-20261016-state.json contains provider response and signed URLs, private. CAD/tax/proposal follow-ups pending. AI paid activation unchanged/held.

## 2026-10-16: Airwallex rejects finalization without due date

Peter confirmed automatic invoice emails OFF and authorized completing the USD comparison via API. Finalization of INV-CS-20261016-01 / inv_sgpdnj9f9hn9h2sxi3h returned HTTP 400: either due_at or days_until_due must be provided. Subsequent GET verified DRAFT / UNPAID, USD 5,000, no due fields and no PDF. No date substituted, email/send/payment/void call made. Draft creation supports omission but finalization does not in this live account/API. Customer Chemistry Department and separate Phase 1: Design line description remain saved. User decision needed on an actual due date/payment term before generating the provider PDF; a locally branded PDF can omit display but cannot remove underlying Airwallex terms. Do not retry finalization with invented terms. Void later remains requested, but currently draft lifecycle applies. Recovery state: output/invoices/custom-software-usd-no-due-20261016-state.json. AI paid activation unchanged/held.

## 2026-10-16: USD comparison draft populated after explicit approval

Peter explicitly approved the shared McMaster address update and new product. API verified Chemistry Department in customer street address, new product Academic recruitment platform (prd_sgpdwnkzthn9hdf0fjj), separate invoice-line description Phase 1: Design, quantity 1, USD 5,000, tax 0. INV-CS-20261016-01 / inv_sgpdnj9f9hn9h2sxi3h remains DRAFT; due_at and days_until_due absent; no PDF yet. No send, finalize, payment or void call. Prior approval-review blocker resolved by explicit user authorization. Separate line_items.description is supported and was used, unlike historical price.description; final PDF rendering still unverified. Pending confirmation that Airwallex automatic invoice emails remain OFF before finalization. User asked to void later, not now. Recovery state remains output/invoices/custom-software-usd-no-due-20261016-state.json. CAD/tax/proposal and AI activation holds unchanged.

## 2026-10-16: USD no-due-date API comparison draft, incomplete

Peter authorized creating a USD 5,000 comparison invoice through the existing Airwallex API, no customer send, void later. Retrieved previous inv_sgpdtxfmqhn6eply66d as VOIDED. Created INV-CS-20261016-01 / inv_sgpdnj9f9hn9h2sxi3h as DRAFT with both due_at and days_until_due omitted; neither field returned. No lines added yet, so current draft total is zero, not a completed USD 5,000 invoice. No finalization, send, payment or void performed. Recovery request/payload/response saved in output/invoices/custom-software-usd-no-due-20261016-state.json (private operational artifact).

Completion script was rejected by automatic approval review before execution because it also updated the shared customer's Chemistry Department address and created a new two-line product; those side effects need explicit approval. Existing product has superseded instalment wording. Do not retry that script without authorization. Provider email settings were OFF historically but not freshly verified; verify suppression before finalization. A draft with omitted due fields does not establish final PDF behavior. Latest invoice presentation guide is invoices/codex-invoice-instructions.txt with supplied v3 PDFs. CAD/tax/proposal work remains pending. AI paid activation remains held.

## 2026-10-15: Marketing SEO alignment started alongside AI email reuse

Peter authorized existing-page SEO updates without an additional copy-review gate, alongside ongoing AI work. No blog work, push or deployment. Marketing shared metadata now describes Websites, Custom Software and AI; Organization description follows that same source. Added distinct metadata for the three existing product preview routes and broadened About/Contact descriptions. Company homepage now uses the shared registry instead of a divergent runtime override. Existing product preview sitemap exclusion and release restrictions remain. Full marketing build passed: 96 prerendered routes, zero head-only fallbacks, existing chunk-size warning. Inspected generated Home/About/Contact titles/descriptions. Full visible content reconciliation, product OG images, release-time route registration and production indexing verification remain open.

Email reference inspection: CRM ReplyBox has Tiptap, AI suggestion/refinement, signature, attachments and Gmail-thread reply; Helen EmailComposerModal explicitly ports CRM's editor to SMTP with replyToMessageId. AI ProspectEmail already has drafting/refinement, saved drafts, selected mailbox, review and idempotent send, so do not rebuild those. Its current body remains plain text; rich formatting/attachment contracts and mailbox-aware ingestion need further dependency review before adapting reference components. CMS reference paths identified: stemfra_cms/src/lib/useSiteEmail.ts and useEmailConnector.ts. No new mail operation or transport test. Live email verification remains paused.

## Contact intake and CRM product alignment (2026-10-14)

**Status: planned; begin after marketing website updates are finished, per Peter.** Current findings are from scoped local source inspection; no remote records queried, test enquiries submitted, emails/Twilio sent or deployed behaviour verified. No application fixes applied yet.

### Agreed contact-form direction

Primary selector: General enquiry, Websites, Custom software, AI. Selecting Websites reveals a separate website-type selector using existing verticals, with labels such as Barbershop, Salon, CrossFit, Yoga, Massage studio and Day spa; omit the redundant website suffix. Preserve existing vertical deep links and support interest=custom/ai preselection. Hide website-specific fields for other products. Switching product must not leave a website vertical attached to a software or AI enquiry.

Display labels and stored values must be decoupled. Update frontend and server validation together, retain legacy subjects for older clients, and map product/vertical consistently into CRM records. Peter proposed this hierarchy on 2026-10-14; exact field/storage design remains to be reviewed before implementation.

### Findings to resolve

1. Contact.jsx only reads vertical query; custom/AI interest links open General. Subject options currently General plus website verticals; server has a fixed allowlist with legacy Software Development and AI Automation names.
2. Contact API writes leads directly. Its 30-day email-only dedup updates service on an existing open lead and can retain a previous website vertical. Preserve individual enquiry product/message/source history while linking to shared contact identity; define repeat-enquiry semantics first.
3. CRM taxonomy differs across API, lead editor (website/custom_build), and deals (software_development/ai_automation). Establish mappings without discarding legacy records.
4. Lead-to-deal conversion hardcodes a website title, service_type=other and annualValue; preserve product, currency and appropriate revenue model.
5. Lead valuation and editor retain website commission assumptions rather than current managed subscription, custom project fees and standalone AI recurring/usage terms. Reconcile forecasts, cards, filters, quotes and reporting with approved commercial terms.
6. Existing projects/tasks/milestones, quotes/proposals and accounting are reusable. Verify and fill enquiry-to-deal-to-delivery links for custom software. A CRM-to-standalone-AI workspace/subscription lifecycle was not established in inspected paths; historical AI-local leads are not proof of an ops CRM bridge. Keep separate project/database boundaries.
7. Contact submissions still invoke the n8n speed-to-lead hook, independently of native Front Desk. Inspect current deployed configuration and product-specific routing before modifying follow-up; do not exercise Twilio locally.
8. Notification failure can return500 after persistence; mailer false results can still be marked sent. Separate accepted enquiry from notification delivery, correct flags/retry behaviour and avoid misleading retry UX.
9. Security priority: GET /api/contact has no staff guard in inspected route/mount and selects website-source leads using the server Supabase client. Deployed exposure unverified; protect listing with existing staff/auth policy. Review payload logging and public-submit abuse controls alongside it.

### Implementation order and validation

After marketing is complete: confirm classification/data contract, address listing access and delivery reliability, update category/vertical form + API compatibility, then conversion/revenue/reporting and product lifecycle links. Reuse existing staff roles, quotes, projects and accounting. Coordinate shared schema/API/CRM changes with Peter; do not change AI tenant credentials or services implicitly.

Verify General, each website vertical, Custom software and AI; query preselection; product switching; server validation; repeated email across products; conversion with currency/value preservation; notification failure; authorized versus unauthorized listing. Use isolated/mocked side effects for local tests. Production validation/deployment requires its own authorization. Preserve release holds.

Evidence: client/src/app/pages/Contact.jsx; server/controllers/contactController.js; server/routes/contact.js; server/routes/speedToLead.js; server/lib/mailer.js; ops/src/hooks/useLeads.js; ops/src/lib/leadValue.js; ops/src/components/leads/LeadModal.jsx; ops/src/components/sales/DealModal.jsx; ops/src/hooks/useProjects.js; ops/docs/WORK_REPORT.md. Paths refer to their independent Stemfra repositories.

2026-10-14 Custom software dividers: top of How we work and bottom of Pricing now stretch full viewport width; centered content/side borders retained. Desktop visually verified, no horizontal overflow at 1440px. CSS-only change; build not rerun. Pricing discussion: Peter considering USD5,000 or USD7,000; recommended USD7,000 for current project scope, USD5,000 only for smaller defined tier. No price change authorized or applied; page still $10,000. Invoice docs confirm CAD5,000 first instalment against sample CAD10,000 project. No push.

2026-10-14 Custom software pricing/process redesigned: numbered three-step How we work section with fine rules and white framed spacing, plus two-column rounded pricing card inspired by marketing /ai. Existing $10,000 starting price, scope agreement and separately quoted hosting/support retained. Desktop/mobile browser verified; SPA build passed. Roadmap vibe-coding skill now explicitly draws on AI/platform/marketing/CRM architectures. No push or deployment.

## Planned: reusable vibe-coding skill (2026-10-14)

**Status: backlog, research and design later.** Peter requested a reusable skill inspired by prompt-driven builders. No skill implementation, framework migration, installation or deployment authorized by this entry.

Assessment of Gemini's supplied response:
- Useful principles: clarify requirements before generation, constrain architecture deliberately, reuse established components and integrate build/browser verification with targeted repair loops.
- Reject guarantees of zero errors. Constrained stacks and try/catch cannot prove correct business logic, security, responsive design, data ownership or successful deployment.
- Official [v0 documentation](https://v0.app/docs/full-stack-apps) says Next.js is the default, while other frameworks are supported. The claim that v0 is strictly Next.js is inaccurate.
- [Figma Make troubleshooting](https://help.figma.com/hc/en-us/articles/31304610458647-Troubleshoot-in-Figma-Make) documents generation failures; [plan mode](https://help.figma.com/hc/en-us/articles/40830441709719-Use-plan-mode-in-Figma-Make) supports structured planning. Design references inform generation; a deterministic absolute-coordinate compiler was not established by the checked documentation.
- [HighLevel AI Studio code editor](https://help.gohighlevel.com/support/solutions/articles/155000007652-code-editor-in-the-ai-studio) documents build/preview errors and AI-assisted repair, rather than guaranteed invisible recovery.
- [Base44 SDK client documentation](https://docs.base44.com/sdk-getting-started/client) shows preconfigured SDK/auth infrastructure in generated apps. Gemini's universal pre-generation Specification Matrix requirement was not verified. Proprietary system prompts and internal architecture remain unverified.

Architecture reference basis: draw from the existing Stemfra AI, websites platform, marketing and CRM architectures, including their different runtime/data/deployment boundaries. Inspect each current implementation before extracting reusable patterns; do not force them into one stack. Peter confirmed this direction on 2026-10-14.

Proposed skill scope when resumed:
1. Inspect existing repository instructions, journeys, architecture, components, dependencies, deployment target and known failures before proposing changes. Reuse working project decisions.
2. Turn the brief into routes, user roles, data ownership, integrations, key journeys, visual references and concrete acceptance criteria. Clarify consequential unknowns without slowing routine work.
3. Choose the simplest suitable architecture for new work; preserve the existing stack for changes. Provide explicit profiles for static sites, interactive apps and authenticated/data-backed systems. Single-file HTML is an option for bounded prototypes, not the default for Stemfra SaaS.
4. Use established design tokens/components and starter conventions. Build complete vertical journeys in small reviewable steps, distinguishing illustrative UI from live integrations.
5. Run relevant build/type/lint checks and browser checks at desktop/mobile sizes. Exercise important flows, permissions and failure states where relevant. Repair based on observed evidence and rerun affected checks with a bounded retry strategy.
6. Separate local completion, deployment and verified production behavior. Preserve secrets, rollback paths and existing release approval gates.
7. Evaluate the skill on representative tasks: a marketing site, an authenticated dashboard and a booking/integration flow. Record requirements met, visual fidelity, meaningful failures, repair cycles and deployment checks; do not use zero-errors marketing claims as success criteria.

Deliverable later: a portable SKILL.md with workflow, architecture decision guide, starter/reference templates and validation checklist. A skill coordinates tools and checks; it does not itself supply a hosted database, compiler or deployment infrastructure. Build and compare a first version before expanding it.

2026-10-14 Custom software copy refined at Peter request: hero description now lists websites, platforms, applications, automations and integrations for work/business/everyday needs using supplied wording; hero CTA Contact us; removed Software for your business requirements band; categories heading We build. Copy-only updates, no build rerun or push.

2026-10-14 Custom software marketing hero updated: full-width white section, existing heading/copy/project CTA on left, isolated iMac light dashboard mockup on right, full-width divider. Existing lower page content/pricing retained. Desktop and mobile browser visually checked; SPA build passed. No push or deployment.

2026-10-14 marketing /ai hero redesigned locally: full-width white hero with Your AI employee for everyday work, existing description and CTAs on left, generated tablet/phone on right. Full-width bottom divider transitions into original centered Front Desk/Leads task panel and remaining sections. Separate introductory banner removed per Peter refinement. Standalone stemfra_ai unchanged. SPA build passed before final divider CSS; desktop hero/divider visually verified and Leads tab changes tasks. No push; P48 release hold remains.

2026-10-14 AI product-section mockup: replaced floating browser frame with a realistic black landscape tablet body; added willowai.com in its address field at Peter request. Uses front-desk-tablet-v4.png; phone and Front Desk illustration retained. Desktop localhost browser visually checked. Asset/reference-only change; build not rerun, no push.

## Google Workspace agentic OAuth classification follow-up (2026-10-14)

**Status: pending inventory and review; no OAuth settings or credentials changed.** Project named in Peter's email: `stemfra-ops-494310`.

Findings checked:
- Google's [Managing OAuth clients documentation](https://support.google.com/cloud/answer/15549257?hl=en) describes the AI-powered agent classification and separate OAuth client IDs for mixed human and agent workflows. Classification grants no additional scopes or privileges; consent and verification still apply.
- [Workspace MCP setup documentation](https://developers.google.com/workspace/guides/configure-mcp-servers) describes Developer Preview access and API/MCP service enablement. Adopting MCP is a separate integration decision, not a required replacement for existing REST calls.
- Inspected server paths use REST: `lib/gmailOutreach.js` calls Gmail messages/send and thread/message endpoints; `lib/googleCalendar.js` calls Calendar v3 using service-account authentication. This was a scoped source inspection, not an exhaustive OAuth client inventory or verification of production configuration. REST usage alone does not establish whether a workflow is agentic.
- The email says classification opened October 12, MCP enforcement starts November 11, and existing-client classification becomes permanent November 12, 2026. These exact dates are email-supplied, not independently confirmed in the documentation reviewed. Pasted email authenticity and live client configuration remain unverified.

Recommended next review, before November 11 per the email:
1. Inventory clients in [Google Auth Platform](https://console.cloud.google.com/auth/clients?project=stemfra-ops-494310), map each to its deployed application, owner, scopes, and human/deterministic versus AI-initiated workflows. Include REST-only AI workflows and distinguish service-account paths from OAuth clients.
2. Keep ordinary sign-in and non-agent integrations separate. For mixed traffic, prepare dedicated agent client IDs; classify only verified AI clients after reviewing administrator access controls and potential consent/reconnection effects. Do not blindly toggle all clients or rotate working credentials.
3. Confirm the email deadlines in the console or with Google support. After the stated November 12 lock, changing classification requires a new client ID, so plan any migration and reconnection deliberately.
4. Evaluate Workspace MCP later against existing REST integrations and preview availability. No API migration, deployment, external configuration change or credential rotation is authorized by this roadmap entry.

2026-10-14 hero polish applied: transparent navy/mint phone v2 removes top Mira AI title, uses Mira AI assistant subtitle and Message... input. Confirmed alpha background; CSS drop-shadow on phone, softened tablet shadows with same offset/blur/opacity. Natural image proportions and side buttons preserved. Desktop visually verified. No push; CSS/asset change, build not rerun.

2026-10-14 phone edge refinement: removed independent height stretching and extra CSS shadow; widened crop to preserve original frame and side buttons, using natural image aspect ratio. Desktop browser visually checked. CSS-only change, no build rerun or push.

2026-10-14 hero AI phone theme updated to dark navy with mint accents at Peter request. Versioned asset mira-ai-navy-mint-phone-v1.png replaces blue/light variant; layout, subtitle and white outer background preserved. Browser visual check passed; image-only replacement, build not rerun. No push.

2026-10-14 approved blue Mira AI illustration installed in homepage hero: uses mira-ai-blue-phone-v1.png with subtitle Your AI assistant, replacing the real Front Desk screenshot experiment. Phone position and tablets preserved; blue distinguishes AI from purple dashboard. Desktop browser checked; SPA build passed. No push.

2026-10-14 hero Front Desk screenshot: replaced generated Mira AI phone crop with Peter-supplied actual Forge & Bell Front Desk conversation screenshot in an independent CSS phone frame. Existing device placement retained. Desktop browser visually checked and SPA build passed. Front Desk runtime unchanged; no push or deployment.

2026-10-14 Front Desk investigation paused at Peter request: Peter tested Forge & Bell locally at localhost:5176/?site=forge-and-bell and reports expected behavior. Supplied screenshots show free-intro availability, time selection and customer-details form; completed booking and general AI Q&A were not independently verified. No Front Desk code/configuration fix made. Native mode confirmed in local env; production cause remains unconfirmed. Recheck after next explicitly authorized production deployment, comparing deployed server/frontend versions and native-mode configuration if failure persists. No push authorized by this discussion. CrossFit dev server running on localhost:5176.

2026-10-14 hero artifact repair: removed duplicated tablet image and white masking workaround. Independent CSS tablet frames and isolated phone crop eliminate stale shadows and phone-edge overlap. Dashboard remains light and shifted up 8px. Desktop browser visually verified.

2026-10-14 hero position refinement: moved custom software tablet/dashboard down 2px from previous position, now 8px above original.

2026-10-14 hero adjustment: custom software tablet and dashboard lifted 10 CSS pixels using positioned image layers; phone remains foreground. Search label shortened to Search. Desktop preview checked; no Front Desk work.

2026-10-14 hero dashboard switched to light mode at Peter request: white cards/sidebar, pale grey workspace, dark text, purple/teal charts and green status accents. Layout and sample data preserved. Desktop browser visually verified.

2026-10-14 custom software hero: added native HTML/SVG dark navy admin dashboard overlay with summary metrics, revenue/expense chart, monthly orders and transaction table. Sample data is decorative, not live customer metrics. Preserved tablet/phone composition and ArcLight browser overlay. Desktop visually checked; SPA build passed. Front Desk remains deferred.

2026-10-14 Chrome reference refinement: reduced browser chrome from 13% to 7% of tablet screen height, scaled typography and controls to screen width, matched warm grey tab strip / white toolbar / grey omnibox. Display address remains forge-and-bell.com. Desktop browser screenshot verified. Front Desk investigation deferred at Peter request.

2026-10-14 hero browser polish: ArcLight screen bleed adjusted to hide edge gaps; added macOS traffic lights, Chrome-style tab and address bar displaying forge-and-bell.com at Peter request. Desktop browser visually checked. Live Forge & Bell Front Desk opens but informational quick reply reproduces Failed to fetch; cause not yet isolated. No deployment or external configuration changes.

2026-10-14 hero website screen now reuses original ArcLight / Forge & Bell hero-fold through useMockupMap, the same catalogue image source; API source verified. CSS screen layer clipped to exposed back-tablet area preserves foreground device placement and original raster. Copy 2 unchanged. Browser visual verification pending.

2026-10-14 hero refinement: image v4 restores approved website wording Move with confidence / Brighter days and lowers phone approximately 30 source pixels (about 20px at desktop display scale). DevicesHeroPreview uses v4; v3 and cards copy 2 preserved. Generated image visually checked; no layout code changes.

2026-10-13 approved overlapping-device hero implemented locally: new default homepage hero uses the selected two-tablet/lower-left Mira AI phone image on white. Explicit preview /?hero=devices; previous cards hero retained unchanged as copy 2 at /?hero=cards. Existing navbar, headline, Explore anchor and other hero variants preserved. npm run build passed including SSR and 96 prerendered routes; diff check passed. Browser automation timed out, so visual browser verification remains pending. No push or deployment.

## 2026-10-13: Billing follow-ups for later discussion

- **OPEN, deferred: billing contact on other invoice templates.** Peter approved carrying `For billing enquiries, contact billing@stemfra.com.` into the other invoice templates in future, including website maintenance/platform commission and custom domain purchase. The custom-software template already includes it. Review the existing generation paths and verify their rendered PDFs when implementing; no other templates or existing invoices changed in this documentation pass.
- **OPEN, consideration: Airwallex usage metering for Stemfra AI.** Peter supplied screenshots of Billing > Usage metering at `https://www.airwallex.com/app/billing/usage/meters`. They show Meters and Usage events tabs, aggregation fields, and sandbox/production setup choices; the displayed meter list is empty. The introductory UI mentions tokens, GB, API calls and usage tiers. This is screenshot evidence of the UI, not verification of API behavior, pricing, account eligibility or an existing Stemfra integration.
- Discuss whether AI needs usage-based billing at all, suitable billable units and allowances, event collection/reconciliation, limits and customer visibility, provider costs, and sandbox validation before implementation. Compare with the existing Paddle reapplication consideration. No provider selected by this note; the single starting-at-$199 offer remains unchanged.
- Documentation only: no meters, usage events, subscriptions, billing settings or external services created or changed.

2026-10-13 billing contact footer completed: reusable custom-software template now includes "For billing enquiries, contact billing@stemfra.com." Replacement official PDFs INV-CS-20261013-07 (CAD 5,000, Canadian bank) and INV-CS-20261013-08 (USD 5,000, US bank) downloaded before voiding; both retrieved VOIDED/UNPAID. Both one-page PDFs text/visually checked, no added tax, approved department separator and instalment description retained. Files: output/invoices/INV-CS-20261013-07.pdf and INV-CS-20261013-08.pdf. No email or payment API called. These are pre-void feedback copies.

2026-10-13 final feedback copies completed: INV-CS-20261013-05 CAD 5,000 (inv_sgpd7rc4zhn6eeiagcn) and INV-CS-20261013-06 USD 5,000 (inv_sgpdqls2zhn6eekrspk), no added tax at Peter request. Both official PDFs downloaded, text/visual checks passed, immediately voided and retrieved VOIDED/UNPAID. Department separator and Academic recruitment platform (Instalment 1 of 2) confirmed. PDFs output/invoices/INV-CS-20261013-05.pdf and -06.pdf are pre-void feedback copies. No email/payment API called. Peter reports no Canadian clients and revenue below CAD30k; this is user-reported, not independent determination of registration obligations.

2026-10-13 13-percent comparison completed: INV-CS-20261013-04 / inv_sgpd7rc4zhn6e3j79ez finalized, official PDF downloaded, immediately voided and retrieved VOIDED/UNPAID. CAD subtotal 5,000, tax 650, total 5,650; PDF visibly renders tax breakdown. Department moved to memo with hyphen separator; revised academic recruitment description applied. No send/payment call. McMaster Financial Affairs FAQ publishes HST 119035988RT0001 and AP self-assessment policy. CRA simplified-regime exclusion for registered customers verified, but Stemfra normal registration/business-in-Canada status not established; actual invoice tax decision remains conditional. Sources: https://financial-affairs.mcmaster.ca/resources/financial-affairs-faqs/accounting-faqs/ and https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/charge-collect/cross-border.html

2026-10-13 official comparison PDFs completed at Peter explicit authorization: INV-CS-20261013-02 (CAD) and INV-CS-20261013-03 (USD) finalized, official PDFs downloaded, immediately voided, then both retrieved as VOIDED/UNPAID. Files output/invoices/INV-CS-20261013-02.pdf and -03.pdf are pre-void official snapshots. One page each verified. Airwallex suppresses subtotal/zero-tax row despite explicit zero tax; department and street render on the same line. These provider limitations differ from local previews. No send or payment API called.

2026-10-13 USD comparison prepared: INV-CS-20261013-03 / inv_sgpdqls2zhn6d5xd6dn verified DRAFT, USD 5,000 total, tax 0. Reuses McMaster University/Department 10297 and Peter billing email; saved USD bank retrieved with ACH/Fedwire details. Local layout PDF output/pdf/custom-software-usd-layout-preview.pdf visually verified. CAD draft unchanged; both remain DRAFT, neither finalized or sent. PDFs are local comparison layouts, not provider-generated PDFs; actual contract/tax treatment still unconfirmed.

2026-10-13 tax-layout draft: INV-CS-20261013-02 / inv_sgpd7rc4zhn6czg49xw remains DRAFT, CAD 5,000 total, explicit default_tax_percent=0, total_tax_amount=0, automatic tax disabled for this sample only. Customer updated at Peter request to McMaster University, Department: 10297, 1280 Main Street West, Hamilton, Ontario L8S 4L8, Canada (official registrar address verified); Peter email retained. No finalize/send/payment call. No draft pdf_url returned; documented API preview is subscription-oriented, so earlier generic draft-PDF suggestion was incorrect. Locally authored layout preview at output/pdf/custom-software-tax-layout-preview.pdf visually verified; it is not an Airwallex-generated PDF and does not prove provider zero-tax-row rendering. Prior two invoices remain voided. Actual tax treatment remains unverified.

2026-10-13 invoice correction: replacement INV-CS-20261013-01 (inv_sgpd7rc4zhn6coicat2) uses original bank-label layout, CAD account, standard payment footer and no visible test wording. PDF visually verified. Original TEST-CS-CAD-20261013-01 and replacement are both VOIDED; replacement retrieved as VOIDED/UNPAID after Peter requested immediate cancellation. No payment recorded. Future review invoices must stay draft and use Airwallex preview; do not finalize without explicit approval. Saved replacement PDF is a pre-void layout snapshot, not a payable invoice.

2026-10-13 P31 invoice extension: custom software content template and Airwallex product created. CAD 5,000 sample TEST-CS-CAD-20261013-01 finalized/downloaded/visually checked; pending review then void. No automated CRM custom-software charge type added. See [runbook](CUSTOM_SOFTWARE_INVOICES.md).

# Stemfra — Roadmap & Pending Tasks (prioritized)

2026-10-13 academic hiring invoice proposal: read Nnerve handoff/requirements and both supplied Airwallex sample PDFs. Peter specifies two $5,000 instalments and requests proposed sample data before creation. P31 docs record CAD EFT/Interac details in commission_bank.by_currency.CAD (2026-09-10); exact live bank fields not queried or verified this turn. Airwallex current docs confirm Canadian Global Accounts receive CAD via EFT/Interac; currency choice/conversion remains unresolved. CRA guidance checked: threshold is aggregate applicable revenue, customer registration evidence matters, no-tax-collected is not automatically zero-rated. No invoice/customer/product API calls, emails, DB writes or tax settings changes. Next: confirm USD versus CAD and proposed instalment descriptions, then verify receiving account before API test creation.


2026-10-13 AI page polish DONE locally: security section precedes integrations on both homepages; workflow heading is Your workflow automation. Browser heading/order verification passed on both localhost pages; diff checks passed. Invoice discovery only: existing Airwallex mirror finalizes and normal markRequested emails client; custom software uses generic Stemfra services fallback. Academic hiring platform test invoice awaits agreed description, customer/amount/currency/milestone and sandbox versus live-test details. No Airwallex API call, invoice creation or email performed.


2026-10-13 AI homepage alignment and Connections icons DONE locally: standalone homepage now reuses the approved focused marketing content, animated workflow, cropped workspace illustration, integration assets, single starting-$199 offer and Get started signup CTA. Previous homepage is available at /?version=original. Product account-aware header and light footer remain local to AI; removed separate purple emblem and corrected section links. Connections uses Cal.com/Notion marks and full-colour PostgreSQL/Supabase assets; generic email/key icons retained. Connection availability and operations unchanged.

Security section retained on both homepages with bounded claims verified against vault crypto, dispatcher permissions/tool-call logging and review routes. Removed blanket model-training/audio-retention/every-action/digest claims from this section; no vendor policy audit or production security certification implied. No DB writes, seeding, provider calls, billing configuration or pushes. Legacy AI plan/onboarding/billing reconciliation with starting-$199 offer remains OPEN; Paddle remains a consideration only.

Validation: AI web typecheck passed; AI production build passed (12 workflow pages plus pricing prerender); marketing build passed (96 routes); diff checks passed. Desktop Connections icons, homepage workflow switch, asset loading and security layout checked. Browser viewport override stayed at 1280px, so fresh mobile verification remains unconfirmed. Preview: http://localhost:5184/#control. Screenshots /tmp/stemfra-ai-security-updated.png and /tmp/stemfra-ai-connections-updated.png.


2026-10-13 P48.3 integration grid polish: heading now Your tools and information are connected. Added local full-colour logo assets for Gmail, Zoho, Supabase, PostgreSQL and Google Maps; Cal.com uses its Simple Icons wordmark instead of calendar substitute, Notion enlarged. Generic source/file icons retained. Asset provenance in public/images/integrations/SOURCES.md. Browser checked all five assets loaded; build passed 96 routes and diff check passed. Local only, no push.

2026-10-13 P48.3 workflow polish: centre card now says AI with no separate AI logo. Right-side SVG endpoints stop at the 74% card boundary; alternative cards use opaque backgrounds. Browser visually verified, diff check passed. Local only.

2026-10-13 P48.3 connected workflow canvas implemented locally: central Stemfra AI hub, input/knowledge/tool cards, review/handoff/set-aside branches, animated path and floating request/result panel. Reuses task selector, pause/replay and reduced-motion support. Browser checked desktop, Leads result interaction and 390px layout (no horizontal overflow). Client build passed 96 routes and diff check passed. No runtime workflows or external services changed; no push.

2026-10-13 AI pricing CTA updated locally to Get started on /ai and main /pricing, linking to the existing AI /signup entry at localhost:5184. Source review confirms signup -> workspace creation and existing Setup surface; no account was created or onboarding submitted. Follow-up OPEN: reconcile the single starting-$199 offer with legacy AI plan/trial defaults, onboarding scope/usage confirmation and eventual billing provider before release. Existing onboarding is present; the revised commercial journey is not yet verified end to end. Client build passed (96 routes), diff checks passed, and /ai pricing label and signup destination were browser-verified.

2026-10-13 P48.3 AI visual refinement DONE locally: animated Front Desk/Leads workflow with step selection, pause/replay and reduced-motion handling; populated, cropped HTML workspace replaces raw screenshot without illustrative captions. AI employee positioning and reusable light footer applied to /ai. Peter chose a single AI offer starting at $199/month; /ai and main /pricing share aiOffer.js. Original AI app billing plans remain unchanged pending separate commercial/billing reconciliation, including Paddle consideration. No database seeding, worker runs, provider changes or push. Build passed 96 routes; desktop workflow/product switch/footer and 390px overflow checked.


2026-10-13 billing consideration from Peter: consider reapplying to Paddle and using it for **Stemfra AI** billing instead of Airwallex. This is an evaluation item, not a provider selection or authorization to apply, migrate, activate payments or change external services. Check approval eligibility, subscription/usage billing fit, tax/invoice handling and migration impact before a decision. Existing release/payment holds remain unchanged; Websites billing is outside this consideration.

2026-10-13 P48.3 restored three AI illustrations locally: reused original flow diagram and tools grid with focused Front Desk/Leads wording and source/setup clarification; original variant defaults preserved. Lavender CtaPanel replaces plain closing plans block with Get started. Desktop visual review, 390px overflow and build (96 routes) passed; no live integration tests or release changes.

2026-10-13 P48.3 AI focus and single navigation DONE locally: focused Front Desk/Leads homepage, shared-workspace illustration, consolidated controls and product FAQ; original preserved at /ai?version=original. Removed secondary navbar from focused page, retaining hero Get started. Main Login now uses AI on /ai, CMS on Websites/templates/solutions, and a two-product chooser on shared routes in DEV only. Build passed 96 routes; desktop/mobile chooser, Escape dismissal, route targets, AI tabs/FAQ and 390px overflow checked. Release hold unchanged; no push.

2026-10-13 P48.3 two-level AI navigation DONE locally: main Stemfra Header above original AI header; fixed offsets 80/145px and section scroll margin 165px. Main Login retains CMS; AI Sign in retains AI app. AI mobile menu label distinguished and sheet starts below both bars. Build passed 96 routes; desktop visual and mobile menu/390px overflow verified. No push.

2026-10-13 P48.3 original AI homepage copied locally at Peter request: /ai uses standalone HomePage, ui, chrome, sections, icons and vignettes plus public catalogue snapshot. Text, sections and animations retained. Product link adapter targets localhost:5184; home anchors target /ai. Separate auth remains in AI app (Sign in label). Scoped original fonts/radius tokens; global concierge hidden on this DEV route. Prior versions retained as ?version=adapted and ?version=previous. Build passed 96 routes; tabs, FAQ interaction, link targets and 390px overflow verified. Direct original-app browser comparison blocked by automatic review; source comparison performed. No push or release changes.

2026-10-13 P48.3 AI product homepage DONE locally for review: /ai now adapts standalone AI task tabs, role cards, workflows and review queue to the marketing site. Previous page retained at /ai?version=previous. AI page header login and product actions target localhost:5184 login/signup/pricing; other headers retain CMS default. Pricing amounts deferred to AI plans due existing combined-page inconsistency. All review URLs use localhost per Peter CORS instruction. Build passed 96 routes; diff check, role switching, previous variant and 390px overflow checked in browser. Illustrations are not live runtime activity; no AI API/workers tested, no push or release-gate changes.

2026-10-13 P48.3 illustrative card copy DONE locally: fitness footer now A FITNESS STUDIO / FOR YOU; assistant renamed Mira AI with M avatars. Browser text and diff checks passed. No push.

2026-10-13 P48.3 second-section CTA DONE locally: Explore products is the only action in homepage essence section; removed Contact us and down-arrow via optional nextHref, shared Websites defaults preserved. Current cards hero retained. Browser text and diff checks passed. No push.

2026-10-13 P48.3 hero simplification DONE locally: removed bottom service list/down arrow, single Explore CTA without arrow; assistant illustrative brand renamed Rivel AI with R avatars. Prior variants retained. Simplification browser-verified; assistant rename source-verified, browser recheck timed out in automatic approval. Diff check passed. No push.

2026-10-13 P48.3 Rivel copy DONE locally: replaced Stronger people with Move with confidence; retained Brighter days. Browser text verification and diff check passed. No push.

2026-10-13 P48.3 minor hero refinement DONE locally: desktop card height reduced from 62svh to 57svh (bounds 520-720px); redirect arrows removed from all three service captions, links preserved. Browser visual and diff checks passed. No push.

2026-10-13 P48.3 hero scale/portrait refinement DONE locally: larger viewport-relative desktop cards, wider layout and two-line heading; generated local monochrome Rivel fitness portrait replaces gym photo. Prompt provenance stored alongside image. Desktop/mobile visual review and 390px overflow check passed; build passed 96 routes and diff check passed. No push.

2026-10-13 P48.3 upright-card hero DONE locally for review: approved three-panel concept implemented as JSX/CSS, default homepage and ?hero=cards. Website, illustrative AI conversation and custom dashboard panels link to their offer pages; mobile cards scroll horizontally. Existing marketing fitness photo reused. Network and cinematic variants preserved. Build passed 96 routes; diff check passed; desktop/mobile browser review, image load, 390px overflow and Explore scroll destination (80px top) verified. Awaiting Peter feedback. No push or release changes.

2026-10-13 P48.3 alternate hero DONE locally for review: light editorial hero with animated three-branch SVG and clear offer copy is now the local default (?hero=network). Original retained at ?hero=cinematic; other finishes retained. Header accepts an explicit light-hero theme. Desktop visual checked, mobile layout/390px overflow checked, Explore hash navigation and original variant verified. Build passed 96 prerendered routes; diff check passed. Reduced-motion preference supported. No push or release-gate changes.

2026-10-12 local checkpoint: marketing preview committed as d56953ae. Final client build passed with 96 prerendered routes; committed diff whitespace check passed. P48.3 visual refinements saved locally; production release holds unchanged. No push.

2026-10-12 P48.3 homepage refinement DONE locally: Hero CTA shortened to Explore, still linking to #products; browser verified. amber abstract hero installed with separate frosted admin-dashboard backdrop; white trial reverted at Peter request. Previous dark workspace image reused for closing CTA. Homepage requirements wording changed to needs. Browser confirms copy; build passed 96 routes before closing-image/copy edits; final diff check passed. No push.

2026-10-12 P48.3 cinematic hero trial: generated dark workspace background saved as dark-workspace-hero-v1.png, installed as default homepage hero with lower-left copy and no heavy blur. Desktop browser reviewed; build passed 96 routes, diff check passed. User may choose white next. Nothing pushed.

2026-10-12 P48.3 deeper frost preview: homepage background switched to Front Desk v2; glass image blur increased from 25px to 55px with reduced brightness and saturation. Text and outer backdrop treatment preserved. Browser reviewed; diff check passed. Local only, nothing pushed.

2026-10-12 P48.3 darker glass preview: replaced the bright glass sheen with a 42-55% chocolate overlay, retaining the same static image and strong blur. Browser visually checked; diff check passed. Local only, nothing pushed.

2026-10-12 P48.3 hero finish: Peter selected strong frosted glass after reviewing three local options. Homepage defaults to glass; outer frosted backdrop remains, text stays sharp. Alternate local review URLs use ?hero=soft or ?hero=motion. Browser reviewed. No push or release changes.

2026-10-12 P48.3 static homepage hero DONE locally: one office/dashboard background replaces the three-slide rotation; headline Build, subtitle Websites, AI and custom software, single Explore products CTA. Shared hero hides controls and timer for one slide; Websites carousel defaults preserved. Browser reviewed; client build passed with 96 prerendered routes; diff check passed. Nothing pushed.

2026-10-12 P48.3 image fill fix DONE locally: all three homepage collection images use full-panel cover cropping, with a 3:2 stacked mobile frame. Desktop browser verified image and panel heights match at 610px for all three. Homepage wording remains unchanged pending copy review. Nothing pushed.

2026-10-12 P48.3 local homepage refinement DONE: reused Websites carousel and essence components with three-product imagery/copy; removed collection prices and last-panel border. Browser verified carousel control, price-free collection and zero-pixel gap/border before closing CTA. Build passed 96 routes before pointer-event control refinement; diff check passed. Tree concept rejected and remains unused. Nothing pushed.

> **P48.3 homepage simplification ✅ DONE locally 2026-10-12:** Our approach removed; browser verified. Wave/tree brand artwork generated for discussion only. No push.

> **P48.3 image corrections ✅ DONE locally 2026-10-12:** fictional Willow brand, physically supported office iMac with navy/teal dashboard, yoga website visual, no visible concept captions. Browser load and diff checks passed; no push.

> **P48.3 generated homepage imagery ✅ DONE locally 2026-10-12:** Front Desk and admin dashboard concept assets saved with prompts and integrated, labelled illustrative. Browser reviewed; no push.

> **P48.3 homepage collection ✅ DONE locally 2026-10-12 for review:** three equal visual panels replace repeated introductions; short hero and photographic CTA preserved. Software/AI illustrations labelled. Build and desktop checks passed; no push.

> **P48.3 homepage closing styling ✅ DONE locally 2026-10-12:** shared photographic CTA, browser and diff checked. Broader product presentation is proposal only; no release changes.

> **P48.3 footer alignment ✅ DONE locally 2026-10-12:** three current product links replace industry row in local preview; browser destinations and diff check verified. Production gate unchanged.

> **P48.3 Pricing closing CTA ✅ DONE locally 2026-10-12:** reused Websites photographic section with Explore products opening the existing selector. Build (96 routes) and browser checks passed. No push or billing changes.

> **P48.3 combined Pricing refinement ✅ DONE locally 2026-10-12:** three complete production-style white offer cards with translucent chocolate borders, ordered AI → Websites → Custom software with Fixed/Starting qualifiers and heading-only Pricing introduction, with proposed AI starting at $199/month, awaiting review and AI scope/cross-page reconciliation. No billing/release changes.

> **P48.3 marketing preview ✅ DONE locally 2026-10-12 for review:** homepage moved to Websites; FAQ and non-submitting signup copy updated. CMS, legal policies and actual trial/subscription lifecycle remain pending. Company homepage and three-offer Products menu ✅ DONE locally for review; Websites order is Pricing → Solutions → Getting started → shared FAQ. Inline Solutions and removal from local navigation ✅ DONE 2026-10-12. Chocolate pricing surface with white card and full-width section dividers ✅ DONE locally 2026-10-12.

> **P48.2 homepage/card refinement ✅ DONE locally 2026-10-12; P48.3 copy reconciliation in progress.** Approved homepage preview preserves layout and short hero; shared website card expands via View full plan; missing management heading added. Build and browser checks passed, awaiting Peter review. Production/release gates unchanged.

> **P48.2 heading refinement: ✅ DONE locally 2026-10-12, pending Peter review.** Page-name headings, no decorative eyebrows or trailing full stops, separate pricing cards. Build passed (96 routes); browser headings checked.

> **Current priority, Peter confirmed 2026-10-12: P48 revised managed-service plan.** P48.1 copy and $299 approved; P48.2 local page/navigation preview built, awaiting Peter visual review. Preserve the existing design and self-service onboarding. See the dated P48 plan below. Agreement on direction does not activate subscription billing or lift the Airwallex/AI/menu release hold.

> **Local development readiness: ✅ DONE 2026-10-12.** Business identity selected and onboarding committed locally; platform aggregate typecheck passes all seven apps; local API can disable background jobs for marketing preview. No release gate lifted.

> **Codex documentation transition: ✅ DONE 2026-10-12.** See [CODEX_ONBOARDING.md](CODEX_ONBOARDING.md) for local checks and entry points. No product item or release gate changed.

_Updated 2026-07-29 (full-project audit pass). Single cross-repo source of truth.
The order below IS the recommended build sequence. Per-feature detail lives in the
linked docs; this is "what's next and why."_

## 📌 WHERE WE STAND (2026-07-29 audit — read this before the per-arc detail)
_Verified against code + DB + env, not just doc claims._

### 📋 STATUS DISCIPLINE (Peter, 2026-09-07 — after a reconciliation found 5 stale claims)
Every session, in EVERY repo, before ending: (1) every ROADMAP arc or item you touched
gets an explicit mark on its own line: `✅ DONE <date> (<commit>)`, `⏸ PARKED <date>`,
`❌ DROPPED <date>`, or `🔜 NEXT`; an arc whose work shipped under another name (the
Visual Tour closed P15) gets `✅ CLOSED <date>` on its HEADER plus one line saying where
the work lives. (2) Things Peter does outside code (dashboard settings, verifications,
purchases) are recorded the moment he says so in chat as `✅ Peter confirmed <date>`; no
"⏳ Peter" line may outlive his confirmation. (3) The AGREED BUILD ORDER block carries a
dated status line that is rewritten, not appended, when an item closes. (4) The
SESSION_HANDOFF top block gets a "Status changes this session" list naming each mark.
(5) Numbers that appear in docs (step counts, video counts, tier counts) are re-read from
the code at the time of writing, never copied from an older doc. A reconciliation
(code vs ROADMAP) is due whenever a session inherits an arc it did not build.

### 🧾 RECONCILIATION 2026-09-07 (code vs this doc; Peter-confirmed where noted)
- Agreed build order: items 1 to 4 ✅ Peter confirmed 2026-09-07 (inbox parity, P23,
  template readiness audit, dashboard actions). Item 5 **P25 NOT started** (no
  Brandfetch / logo-builder code in server or CMS).
- **P15 ✅ CLOSED**: walkthroughs shipped natively as the Visual Tour
  (`stemfra_platform/docs/GUIDED_TOURS.md`); Supademo dropped entirely. The
  reconciliation engine listed there as "not built" shipped 2026-08-11 (webhook secret
  + RECON_ENABLED are in deploy.yml).
- **Onboarding as built**: the CMS **Setup wizard** = 4 steps (Your business, Your
  services, Opening hours, Your team; `stemfra_cms/src/components/onboarding/
  SetupWizard.tsx`, 2026-09-01). **Stacy's checklist** = 12 server steps
  (`lib/stacyOnboarding.js`) shown in 3 stages: "Make it yours" 6 · "Get found on
  Google" 4 · "Before you publish" 2. Older "10-step checklist" wording is stale.
- P18 NOT built (Stacy has only `clone`). P20 security page NOT built. P21: backups ✅,
  Supabase org still on the **free** plan (Management API, 2026-09-07). P26 NOT started.
- P24 IS pushed (origin/main 2026-08-31); handoff "local only" notes are stale.
- **P41 native lead-gen ✅ DONE + PUSHED 2026-09-17** (n8n cold lead-gen retired; every scraped
  place kept in `leadgen_places`; drafts on demand; provider tags + pitches). See P41.
- **Wildcard Worker LIVE 2026-09-16** (Peter: "go live"): `*.stemfra.com` A record + 10 bypass
  routes (setup script `--apply`), `stemfra-tenant-router` deployed with HOST_CACHE KV, verified
  from outside (clean-cuts/argyle → stemfra-barbers, ellaris-spa → stemfra-spa, lull → stemfra-massage,
  unknown host → 404, robots Allow, api/cms/crm/www bypass), `TENANT_WILDCARD_ROUTING=true` in
  deploy.yml. **Custom Hostnames (item 4b) ✅ LIVE 2026-09-16** (Cloudflare for SaaS ✅ Peter
  confirmed 2026-09-16): `lib/tenantHosts.js` (EVERY brand domain = a custom hostname on the
  stemfra.com zone, apex + www; a domain whose zone we run gets its DNS-only CNAME written for it;
  legacy Pages when off) behind `TENANT_CUSTOM_HOSTNAMES=true`, Worker redeployed with brand-host
  resolution + the `*/*` route, fallback origin `sites.stemfra.com` active, the two `.click`
  domains migrated and their Pages entries detached: every Pages project holds ZERO custom domains
  now. **BYO connect from the CMS ✅ VERIFIED the same night** (byo.calcs.click on clean-cuts:
  Connect → guided CNAME card → served on its own certificate in 40 s → activation sweeper + bell
  at 10 min; the card now refreshes itself on that bell, platform 10c2746). Design correction the
  same night: the first cut's per-zone Worker routes were RETIRED after `wrangler deploy` deleted
  them (2-minute outage on cleancutsbarber.click); never route the Worker on a tenant zone. KV
  write alert (bot subdomain scans) fixed in the Worker (no KV writes for unknown hosts, 1 h
  memory cache; Workers Paid $5/mo is the fallback). Pushed: server 1f7a580, platform 10c2746.
  Runbook DOMAINS.md §7. Earlier note kept below:
- Wildcard Worker was NOT live (2026-09-07, Cloudflare API; re-verified 2026-09-11: no `*` DNS,
  flag unset, remix-barbers attached as a Pages domain, 9/100 slots on stemfra-barbers; go-live
  ⏸ DEFERRED by Peter 2026-09-11): zero Worker routes on the
  stemfra.com zone, no `*` DNS record, `*.stemfra.com` hosts are per-site CNAMEs to the
  vertical Pages projects. The August domain tests (cleancutsbarber.click,
  argyleandsons.click) ran through the per-domain zone flow (Case 7), not the Worker.
- YouTube tutorials (plan + scripts: `stemfra_platform/docs/CMS_TUTORIAL_VIDEOS.md`;
  pipeline `scripts/tutorials/`, Playwright + ElevenLabs + ffmpeg, 4K masters; upload kit
  `stemfra_video/tutorials/UPLOAD.md`). STATUS 2026-09-08, per video:
  - ✅ Playlist 1, Getting started (1 to 10): MASTERS CUT + approved by Peter.
  - ✅ Playlist 2, Running your business (11 to 22): approved by Peter 2026-09-09, 4K
    MASTERS CUT + sent the same evening (video 19's silent stretch fixed first: the Stacy
    rail opened on Setup, so the chat sweep waited; the demo lead "Peter Okeme" renamed
    "Peter Space" for privacy). UPLOAD.md carries all 26 videos.
  - ⏸ Playlist 3, Your account (23 to 26): scripts written, SKIPPED for now (Peter
    2026-09-09); 27 (logo builder) waits for P25.
  - ✅ Playlist 4, Launch a new website (28 to 31): MASTERS CUT + approved (recorded on a
    fresh sign-up, account removed after).
  - ⏳ Playlist 5, By business type (32 to 37, DECIDED 2026-09-08): not written.
  - 🎬 YOUTUBE UPLOAD started 2026-09-09: 14 of 26 up (28 to 31 + 01 to 10), daily limits hit;
    rest + thumbnails 06 to 22 + video 07 description fix on 2026-09-10 per
    `stemfra_video/youtube/TOMORROW.md`. Three playlists, Manual order, straight to Public.
    Advanced features (clickable links, chapters) wait on channel history (no ID route offered).
    AGREED 2026-09-09: upload as Unlisted, flip Public once prod matches the footage.
  - Two CMS fixes fell out of the launch review: full sidebar always on new sites
    (getting-started mode reversed), no dashboard flash before the setup wizard. ✅ PUSHED
    2026-09-09 (Peter lifted the hold: platform `36375d8`, server `d85de2e`) together with
    the editor-reset fix (video 10) and the whole tutorial pipeline.
  - Script lessons 2026-09-09 (all fixed in `videos/*.mjs`): exact-text `text-is()` for
    Day/Week toggles (has-text("day") matched "Today"); the Inbox is now the Gmail-style
    reading pane (icon toolbar aria-labels + "Suggested reply" card, video 12 rewritten);
    the live site opens Argyle's promo popup, dismiss it before pointing at anything (18);
    editor fields are `main textarea`, never inside the row's data-tour (19, as 4).
- FIRST AD (DECIDED 2026-09-08): a 30s product montage in the Base44 register, cut with
  the tutorial recorder from the six demo sites + the CMS; plan + beat sheet in
  `stemfra_platform/docs/PRODUCT_MONTAGE_AD.md`. ⏳ Not started (after the tutorial upload).
- Consequence of the Worker not being live: the "PREREQ for the self-serve funnel"
  line above still holds (Pages caps custom domains per project; every provisioned
  site burns a slot). Deploy steps unchanged: deploy platform → `setup-tenant-wildcard.js
  --apply` → `wrangler deploy` → verify → `TENANT_WILDCARD_ROUTING=true` in deploy.yml.
- CMS walk 2026-09-07 (demo owner, argyle-and-sons), small open items: (a) the
  Dashboard paints a "Your site / Preview / Publish" placeholder before the owner
  context loads (needs a skeleton state); (b) em-dashes survive in a few user-facing
  strings (Profile subtitle, Stacy "Setup" label, Published tooltip, staff banner, the
  "Payment confirmed" notification text) against the house rule; (c) Stacy opens on
  Chat, not Setup, once a site's checklist is complete (expected; record tutorial
  footage of the checklist on a fresh account).

### 🥇 AGREED BUILD ORDER (Peter, 2026-09-01 — cold calls + REAL-CLIENT ONBOARDING START 2026-09-02)
After the wellness About/Contact visual pass closes and the push hold lifts, prioritize the
surfaces that touch new-client onboarding, in THIS order:
1. **Inbox parity upgrades** (CMS enquiries + CRM Gmail to the Helen standard — see the parity
   checklist block below).
2. **P23** CRM call workspace + lead-gen monitoring (copilot part already built).
3. **Template readiness audit** (every image/text CMS-editable, per theme; yoga Sanctuary is the
   done model).
4. **Peter's dashboard actions** (Supabase auth-email SMTP + paste the 4 branded templates;
   CMS-origin redirect allowlist for magic links). ✅ Peter confirmed 2026-09-09.
5. **P25** logo toolkit (Brandfetch import + SVG builder). Phase 2 (SVG builder) ✅ DONE
   2026-09-11 (platform, pushed); phase 1 (Brandfetch) ⏳ Peter: API key.
Then the rest of the queue (P20 security, P21 items 2–3, P18, P22, **P26** agent
inventory + archetype system, launch-plan tasks as they come due).
**Status 2026-09-11 (rewritten, not appended):** items 1 to 5 closed except P25 phase 1
(key). Built alongside, all pushed 2026-09-11: P33 A/B/C + Section styles + Auto remix, P31
addendum (markets + `leads.vertical`), P34 lead text conversations + consent provenance, P35
Claim page. Later the same day (all PUSHED by night): P34 follow-ups (composer, Not relevant,
ConsentGate, transcripts, notes, Do not call, one Leads toolbar, name rule), P36 walk-ins
without commission, `leads.readiness` (n8n pastes deferred), dialer 12100 fix, survey doc.
**Status 2026-09-21 (rewritten):** wildcard Worker + Custom Hostnames ✅ LIVE 2026-09-16; P41
native lead-gen ✅ DONE 2026-09-17; price ✅ DECIDED 2026-09-17 (5% capped at $400, terms
confirmed, build ⏸ ON HOLD by Peter); no more Apify runs for now, the current pool is being
called. 🔜 NEXT: P37 custom-build verticals (scope the offer + first scrape), then P32 phase 2
(needs the P30 service account). Peter began US sales calls 2026-09-11 (Neil's Barbershop call =
the source of P36, P37 and the transcripts).

**Current order 2026-10-12:** Peter approved the journey-review recommendations and requested a roadmap plan. P48.1 service scope/copy → P48.2 additive local previews → P48.3 journey reconciliation → P48.4 billing/entitlements → P48.5 validation and gated release → P48.6 first-cohort measurement. This takes immediate priority over the older NEXT list; P37/P32 and other unfinished work remain pending. P47 product evidence is integrated into P48.2; no scraping or outreach is authorized by this plan.

### 🚀 ACTIVE ARC (2026-08-18): LAUNCH — phased, barbershop first → **[`LAUNCH_PLAN.md`](LAUNCH_PLAN.md)**
Peter's 10 launch tasks (VSL video · 3-contact prospecting sequence · Stacy+routes refresh ·
CMS tour re-walk · legal pages · lead-gen city/state coverage in the CRM · Mark voice refresh ·
end-to-end barbershop via UI · demo/test-data isolation · release checklist) + the release
checklist + the marketing-funnel discussion live THERE. Read it after this block.
- **PENDING (Peter, dashboard) — do AFTER the launch tasks:** Supabase auth-email SMTP (Part A)
  + paste the 4 branded templates (Part B) per `SUPABASE_AUTH_EMAILS.md`. The HTML exports in
  `docs/supabase-auth-templates/` were regenerated 2026-08-18 (they were stale from Jul 13, pre-
  redesign) and are em-dash-free; nothing to regenerate, just paste when ready.
- **PREREQ for the self-serve funnel:** the `*.stemfra.com` wildcard Worker (item "Domain routing
  at scale" below, agreed 2026-08-07, still PENDING) — Pages caps 100 custom domains/project and
  every provisioned site burns a slot.
- Suspended until approval (NOT launch): Airwallex `invoice.paid` webhook + tax-aware ledger.

_Previous active arc = **P13 commission model** (`docs/COMMISSION_MODEL.md`), shipped; theme-polish arc below closed 2026-09-09 (core four 2026-08-17, wellness 2026-09-09)._

### 📞 Cold-call + call-rails arc — ✅ DONE 2026-09-05 (real-client onboarding)
The channel that makes cold outreach work, plus the CRM surfaces reps use on a call.
- **Deliverability locked** (`docs/EMAIL_DELIVERABILITY.md`, A/B-proven incl. a never-contacted
  mailbox): what sends us to Gmail Promotions is **link count + the List-Unsubscribe header**, NOT
  the branded design/subject/pixel. Cold touch 1 = ONE link + link-free footer + no bulk header +
  reply-"stop" opt-out; branded/multi-link touches only as in-thread "Re:" replies (`lib/claimSend.js`
  threads them; `lib/gmailOutreach.js` `sendAsRep({threadId,inReplyTo})`+`getReplyRefs`). Touch-1
  subject rotates "Quick question about {biz}" / "{biz}, this website is for you".
- **No-website email enrichment** (`docs/EMAIL_ENRICHMENT.md`, pilot done): the GBP registration
  email is unobtainable; Maps "email extractor" actors are website-crawlers (useless here). Working
  path = Facebook-page match + `apify~facebook-page-contact-information` (phone/address-verified);
  Outscraper is the turnkey version (first 500 records free — pilot: 1/67 emails; realistic 1-5% per
  pass). **SMS is the structural channel; email is a bonus trickle.** Apify token = the STEMFRA ADMIN
  account (`.env APIFY_TOKEN`); `OUTSCRAPER_API_KEY` set. Apollo evaluated + skipped (no local coverage).
- **Voice usable end-to-end** (ops): in-browser dialer + manual keypad + DTMF (voicemail menus),
  recording ON by default, Send-Claim consent-gated SMS during a call, themed audio playback in the
  Call Log / activity feed / drawer Activity panel + Conversation Activity tab. Mark's coexistence
  knowledge sharpened (`lib/conciergeContext.js`: Mindbody/Wodify link-out works today, embed depends
  on their settings, no two-way sync). Full CRM detail: `stemfra-ops/CLAUDE.md` "Lead Pipeline + Voice arc".
- **CRM parity** (ops `docs/CRM_IA_PROPOSAL.md`): advanced filters + saved/team views, per-stage
  rotting + follow-up-state cards, forecast value, entity-shaped sidebar (Leads·Deals·Contacts·
  Companies·Activities·Sales Dashboard) + Convert-to-Deal.

### 🔐 CRM role-based privilege hardening — STAGES 1+2 ✅ DONE 2026-09-03; stages 3-4 queued
**DONE (server commits incl. the migration record `docs/migrations/crm_role_rls_hardening_v1.sql`):**
the policy audit found ~25 CRM tables readable/WRITABLE by ANY authenticated user (every
tenant owner/member shares the auth project) via `qual true` / `auth.uid() IS NOT NULL`
policies — a live exposure, closed the same day. Now: staff-wide tables gate on
`is_stemfra_staff()`; income/expenses/invoices on `has_crm_role('super_admin','admin',
'manager','finance')`; pricing config/quotes/proposals on super_admin/admin; profiles
select = self-or-staff, updates super_admin (+ a trigger blocking role/is_active
self-escalation — verified: dev/admin self-promote → 400). CMS owner flows preserved
(contacts self-read + companies owner-read policies; both owner writes were already
server-mediated). **`sales_manager` role live end-to-end** (profiles CHECK + ops
lib/roles.js areas: sales + tenant sites/bookings/payments + mockups, no finance/pricing;
server PLATFORM_OPS includes it). Two-sided verification passed (tenant blocked from
CRM+finance, own contact/companies intact; staff working).
**Stage 3 (queued):** Team page → Google-Workspace-grade user management (per-user
panel: role picker w/ privilege descriptions, reset password, rename,
activate/deactivate, per-row actions — ref Peter's Workspace shots 2026-09-03).
**Stage 3 ✅ DONE 2026-09-03 (ops 0861d5e):** Team page "Roles and privileges" panel
(Workspace-style: per-role rows w/ icon + description + "Grants: …" + Assigned state;
roleGrants/AREA_LABELS in lib/roles.js). NOTE: Workspace's "Reset password" has no
equivalent — staff auth is Google-managed by design.
**Stage 4 — Amo-CRM parity (Peter's field experience, 2026-09-03):**
(a) **Call coaching workspace ✅ DONE 2026-09-03 (ops 55f31ad, verified live incl.
recording playback)** — /calls "Call Log" page: rep/direction/search filters, inline
player via the authenticated recording proxy, per-row shareable deep link
(/calls?call=<id>) for the supervisor-shares-a-great-call workflow.
(b) **Per-rep attribution ✅ ALREADY EXISTED** (useAssignLead + LeadModal Assigned To
picker + my-leads filter) — verified 2026-09-03, not rebuilt.
(c) **Targets/KPIs ✅ DONE 2026-09-03 (ops 65d14b5 + server 7c0214c, verified live)** —
/performance: "My month" scorecard (won vs target, revenue attainment bar, open
pipeline, follow-ups due) + team leaderboard w/ inline target editing
(super_admin/admin/manager); sales_targets table + leads.won_at attribution.
NOTE deferred within 4c: "their tenants'" sales on the scoped view needs a
sites→account-manager link (no such attribution exists yet) — add
sites.metadata.account_manager when the first sales manager onboards tenants.
(d) **Country filter on leads (queued)** + (later, if multi-national) multiple
pipelines per country/segment — today leads carry city/state and one stage flow.
(e) **Duplicate lead detection + merge (queued 2026-09-03, Peter's Amo-CRM ask):**
match duplicates by phone/email/company-name; a rep can DELETE one after checking or
MERGE (union of fields, keep whichever side has data); if both are assigned, the
FIRST-assigned rep keeps the lead. Surface as a Duplicates indicator/review flow on
the Lead Pipeline.
(f) **Mass-email "send as Mark" server rail (idea, 2026-09-03):** the MassEmailModal
sends via the rep's browser Gmail token; the gmailOutreach service-account rail
(domain-wide delegation) can send as any @stemfra.com rep with no sign-in — a server
endpoint would let repless/dev sessions blast too. Smoke-tested live: a
mass-email-shaped send as mark@stemfra.com with ledger row + prod pixel delivered.

### 🔐 SUPERSEDED by the block above — original queue note (Peter, 2026-09-03)
Stemfra will soon onboard **Sales managers**, who must have RESTRICTED CRM access.
Today every active staff role shares full CRM-data access via the blanket
`is_stemfra_staff()` RLS policies; the functional roles (sales/finance/support/member)
are only restricted at the UI layer (sidebar + AppLayout route guard) — a determined
staffer could query out-of-scope data directly. This elevates the long-parked
"per-role RLS data hardening" item (full spec in `stemfra-ops/CLAUDE.md`, STAFF-ONLY
model section) from parked → queued: role-scoped RLS per table/domain via a
`has_crm_role(variadic roles)` SQL helper — sales → leads/contacts/deals only;
finance → income/expenses/invoices/pricing; `profiles` writes → super_admin;
platform `site_*` admin reads → super_admin/admin/manager/support. Keep
`lib/roles.js` areas + the server `PLATFORM_ADMIN`/`PLATFORM_OPS` sets + the new RLS
policies in sync (3-place rule). **Build BEFORE the first sales-manager account is
created.**

### 📥 Inbox parity upgrades (queued 2026-08-29, Peter) — ✅ COMPLETE 2026-09-03 (pending Peter's CRM live pass)
_All checklist items now shipped: thread anatomy + sanitized HTML + suggest/refine +
composer + threading landed 2026-08-31; the final slices landed 2026-09-03 (commits
server 3b6cabc + platform f197db5 + stemfra-ops a31798c, LOCAL): CMS composer
attachments (25MB, both transports, live-verified e2e) + owner signature
(Settings → Notifications → Reply sending), CRM /inbox Archived tab +
restore/delete + ReplyBox attachments (build-clean; live pass needs Peter's
Google login). Original checklist below for reference._
The Helen lead-gen CRM's inbox (repo `stemfra/client-helen-leadgen`, see its
`SESSION_HANDOFF.md`) is now the REFERENCE inbox across all builds. Upgrade the
CMS enquiries inbox and the CRM Gmail inbox to that standard when their arcs
next open. The parity checklist (all live-verified in the Helen build):
Gmail-style thread anatomy (subject once, collapsed rows, latest expanded,
quoted tails behind a ··· toggle) · sanitized-HTML message rendering (server
allowlist, one trust level) · AI suggested-reply pill under the last inbound
message (click opens the composer prefilled) · Tiptap rich-text composer with
attachments (25MB), signature auto-append, and refine chips (Simplify/Shorten/
Lengthen/Warmer/Professional, server-whitelisted, Cmd+Z undo) · archive/
restore/delete with an Archived tab · outbound message-id storage +
In-Reply-To threading + thread-priority reply matching. The same task for the
stemfra_ai Front Desk inbox is relayed via its own handoff (parallel-session
boundary; do not edit that repo from here).
SECURITY POSTURE for the sanitized-HTML item (the XSS-sensitive one; the
stemfra_ai session correctly flagged it for an advisor pass): copy the
reference implementation `client-helen-leadgen/.../server/lib/emailHtml.js`.
Sanitize at INGEST with a server-side allowlist and store ONLY sanitized HTML
(never sanitize client-side at render time); pass your own outbound HTML
through the same filter (one trust level); strip scripts/event handlers/
iframes/javascript: URLs; force links to rel=noopener target=_blank; limit
inline styles to text formatting; cap stored size. For MULTI-TENANT
dashboards add: block or click-to-load remote images (tracking pixels leak
the reader's IP and open-time; the Helen build allows https images as a
single-operator trade-off).

### 🎨 Theme polish — About Us + Contact page review (✅ CLOSED 2026-09-09; started 2026-08-13)
_All six verticals reviewed and confirmed by Peter. Massage + spa closed 2026-09-09 (Escape ·
Umbra · Reverie · Ellaris · Lumora · Respira, rulings (a) to (f) below). Platform commits local
(391336e, f4d7df4, b18a351, d2f7b5a), push hold. Closing this arc releases the **P25 logo
toolkit** build trigger (agreed build order item 5)._
A cross-vertical walkthrough with Peter: review the **About Us** and **Contact** pages of
every active theme, **vertical by vertical, default theme (★) first**, then the next theme
after Peter's review, until the vertical is done, then the next vertical. Open each theme
in the browser theme-by-theme (repoint a demo site to the theme via the CMS picker — zero
data migration — or use the theme's own demo site). **Document + commit each change; do NOT
push to GitHub until Peter confirms.**

Review order + checklist (default ★ first; tick a theme once its About + Contact are approved):
- ✅ **barbers** — DONE (Peter, 2026-08-17: fine as-is now that chrome is CMS-editable; titles/text tuned from the CMS)
- ✅ **salons** — DONE (2026-08-17, same call)
- ✅ **crossfit** — DONE (2026-08-17, same call)
- ✅ **yoga** — DONE (2026-08-17, same call)
- ✅ **massage** — DONE 2026-09-09: Escape (on lull) · Umbra (on umbra) · Reverie (on reveline), all Peter confirmed
- ✅ **spa** — DONE 2026-09-09: Ellaris (on ellaris-spa) · Lumora (on vela) · Respira (on aurea), all Peter confirmed
- Rulings from the Reverie/Respira review (2026-09-09): (a) **wellness nav "About" → the `/about`
  page** (was the home `#about` anchor); Services + Team stay home anchors (their home sections
  ARE the full menu/team). The home **"Short introduction"** section (CMS label) is an intro note
  under the hero, NOT an About section: its tagline-style headline stays ("Peace, at last",
  "Creating Serene Spaces", "A Holistic Wellness Experience", "Rejuvenate your body & mind"), no
  link, no scroll target needed. Platform commit local. (b) Reveline home services heading
  "Our massages" → "Services" (data; the other five demos already read "Services"). (c) Featured
  services trimmed to 4 per wellness demo (was 12 to 15 of ~20, so the Reverie category-showcase
  showed "Most popular" on most cards); data only. (d) **Home services teaser** (Umbra as the
  reference): the default ServiceMenu gained `max_items` (featured-first flat grid) + a CTA to
  the full menu; CMS ServiceGridSectionEditor gained "Button link" + "Show at most"; Reveline
  home = 4 services + "View all services" → /services (2 featured so the badge reads as a
  highlight). (e) **"Services", not "treatments"** (Peter: spa/massage sites say services):
  wellness home anchors renamed `#treatments`/`#therapists` → `#services`/`#team`, footer
  "Treatments/Browse treatments" → "Services/Browse services", catalog group label
  "Treatments" → "Services", every wellness demo's services CTA → "View all services".
  (f) **Occasion tiles ("Find your massage" / "Find your escape")** exist on Reverie (reveline,
  6 tiles) and Respira (aurea, 8 tiles) only; Escape (lull) has the category-card row instead;
  Umbra/Ellaris/Lumora have none. Nine mismatched clone photos replaced via the Unsplash →
  Cloudinary import (site_media rows with `metadata.purpose`): reveline For two / Recovery &
  sport / Prenatal care / Gift; aurea Spa for two / Mum-to-be / A full day / For a group / Gift.
  Peter (evening): reveline "For two" → the couples-on-two-tables photo he chose himself for the
  Couples Massage service (same asset on lull/umbra/reveline), delivered as a Cloudinary
  `c_fill,ar_3:4,g_faces` crop so both guests stay in the portrait tile; the Unsplash import
  YgmDZXzl5Z8 was destroyed + its site_media row removed. RULE: occasion tiles reuse the photos
  Peter picked for the matching service/category before importing anything new. Then "do the
  same for the other eight": reveline Recovery & sport ← lull Stretch Therapy, Prenatal care ←
  reveline Prenatal Massage, Gift ← lull Aromatherapy still life; aurea Spa for two ← lull
  Couples Ritual (g_faces), Mum-to-be ← aurea Prenatal Massage, A full day ← lull Four Hands,
  Gift ← aurea's own gift-band photo. Lull assets were CLONED into the reveline/aurea folders
  (site_media rows with `metadata.copied_from`), the 7 Unsplash imports destroyed. Aurea "For a
  group" KEPT its Unsplash photo (no group shot among Peter's picks; flagged). Finding: the lull
  photos dated 2026-07-09 (Deep Tissue, Sports Recovery, Hot Stone, Full Body & Foot) are yoga
  clone leftovers (meditation, yoga class), Peter's real picks are the 2026-07-13/15 uploads.
  Those four SERVICE photos fixed the same evening on lull + umbra: Deep Tissue ← umbra's
  top-down back shot (3db40761), Sports Recovery ← the marble-table stretch (f8f725a9), Full
  Body & Foot ← the sunny shoulders shot (514a01bf), all Peter's 2026-07-13 umbra uploads
  (cloned into the lull folder); lull Hot Stone Ritual ← lull's 2026-09-02 hot-stone upload;
  umbra's Hot Stone photo was already real. NOT touched: reveline Sports Recovery still shows a
  facial (f4953cfb) and aurea Sports Recovery the same photo; swap when Peter asks.
  ✅ DONE 2026-09-09 (Peter: "Go ahead with the carousel and the anchors"): OccasionGrid becomes
  a scroll-snap row with Previous/Next arrows below when >4 tiles (grid unchanged at ≤4); tiles
  deep-link to `/services#<category-slug>` (massage catalog groups carry `id={slug}` +
  `useCategoryHashScroll`; category-showcase section ids = bare slug; reveline tiles → #massage
  / #couples / #bodywork-rituals / gift page). Platform commit d2f7b5a (local, push hold).
- boutique_gyms (Facility ★ / Signal) exist in the catalog but the app (`stemfra_gyms`) is deferred — skip unless asked.

_2026-08-17 (Peter): About/Contact for barbers · salons · crossfit · yoga marked DONE — now that every part
of those pages is CMS-editable, Peter will adjust titles/text from the dashboard. The review now focuses ONLY
on **massage + spa**, whose About/Contact pages got the least attention._

**Logistics:** some themes have no live demo site (e.g. `respira-spa`/`lumora-spa` are not in
the DB — only `ellaris-spa` is live). Repoint an existing demo site to the theme, or recreate
the demo, before reviewing that theme.

**🔍 Sub-arc — Hardcoded-content audit (precursor to the About/Contact review; Peter, 2026-08-14):**
Before reviewing About + Contact for each theme, **audit that theme's app + variants for text/images/
content that a tenant CANNOT edit in the CMS** (hardcoded strings, fallback-default literals, hardcoded
image URLs, hardcoded nav/footer/chip arrays). Document per vertical, then decide what to make editable —
exactly the barbers pass below. **Process per vertical:** scan → present the list → Peter picks which to
make editable → build (current text = defaults so nothing changes until edited) → then the About/Contact review.
- ✅ **barbers DONE** — audit produced (Layout/pages/lib + barbers-used archetype variants). Peter's call:
  make editable everything EXCEPT nav labels + footer legal links; skip generic UI chrome (forms/booking).
  Shipped in 2 phases → `metadata.labels` (header CTA, footer heading/copyright/texture image, team-years
  label, featured badge, chat chips) via a new CMS **"Buttons & labels"** panel (Settings → Style) +
  section content (home location button, contact Visit/Phone labels, review-panel captions). All default
  to current text. **Standing decision:** nav labels + footer legal links stay hardcoded; UI chrome (section D) untouched.
- ✅ **All 5 remaining verticals SCANNED (2026-08-14)** — salons · crossfit · yoga · massage · spa.
  Consolidated findings + per-vertical make-editable recommendations documented in
  **[`docs/HARDCODED_AUDIT.md`](HARDCODED_AUDIT.md)**. Includes a **cross-cutting bug list**
  (wrong-vertical clone leftovers: 'Lila Studio'/'Calm Roots Massage'/'Massage Studio' brand leaks,
  "Switching to another gym" on yoga, "Est. 2019/Serving Austin" on massage, yoga BookPage leftovers
  on massage+spa, "Sukhasana"/"Serenity Spa" footer labels) — fix those regardless of the editability decision.
- ✅ **make-editable pass DONE for ALL 5 remaining verticals (2026-08-17, local only, not pushed)** —
  salons · crossfit · yoga · massage · spa. The barbershop-only "Buttons & labels" panel was refactored into
  ONE **vertical-aware, config-driven** component (`stemfra_cms/.../ButtonsLabelsSection.tsx`: `VERTICAL_FIELDS`
  keyed by template-slug prefix; per-field `kind:'image'` + `when(av)` gating). Each vertical's chrome labels
  (header CTA · footer description/column-headings/copyright/accent photo+caption · chat chips · home team/
  location/hero-gift CTAs, per the audit) now write to `site_theme_settings.metadata.labels`, and each template
  Layout/HomePage reads them with current text as the default (blank = unchanged). Standing decision honoured:
  nav labels + footer legal links + forms stay hardcoded. Verified per vertical (typecheck + template render +
  CMS panel field set); the write loop is the proven barbers `useUpsertThemeSettings` path. See SESSION_HANDOFF
  2026-08-17. **NEXT in this arc: the per-vertical About/Contact page review (default theme first).**

**Done in this arc so far:**
- ✅ **Grey→colour-on-hover removed repo-wide** (`group-hover:grayscale-0` / `hover:grayscale-0`)
  from all 6 archetypes that had it: TeamGrid `BwPortraits`/`Editorial`/`Carousel`/`BlackFly`,
  `GalleryMasonry`, `MembershipRuledGrid`. Photos stay B&W; other hovers (e.g. `group-hover:scale-105`) kept.
- ✅ **Spa home Team → marquee** (Ellaris `bw-portraits` + Respira `soft-tiles` via the new shared
  `TeamGrid/TeamMarquee`: scroll-snap cards + arrows BELOW + "View All"; the `/teachers` page stays a
  grid). Lumora already used `soft-carousel`. **Note (Peter): do NOT move arrows below on themes that
  already have carousels — only the newly-converted spa grids get arrows-below.**
- ✅ **Ellaris services** "Read More" moved off the photo into the text row (outlined, on the price line).
- ✅ **Gift-cert tiers clickable → pre-filled enquiry** (`/contact?gift=<tier>` → ContactForm `initialMessage`) on spa/massage/salons.
- ✅ **Phone picker: full ISO country list + dynamic default from business country.** The
  full list was already there (Intl.DisplayNames names every country). Added the dynamic
  default: new `countryFromTimeZone(tz)` (IANA zone → ISO country; `sites.time_zone` is the
  reliable signal, not the free-text address) so a US shop shows +1, Nigeria +234, Russia +7.
  Threaded `defaultCountry` PhoneField → ContactForm → all 6 template ContactPages. Verified
  barbers (argyle/America_New_York → US +1). All CMS phone pickers already share PhoneField,
  so the full list applies everywhere; the dynamic default is contact-form only for now.
- ✅ **On-map Google-style info card (Maps Option B)** — see task 13 below. Card on the Mapbox
  tiles (name/address + Directions + Open in Maps), rating row coded but data-gated (no Places
  call yet); future live-Google-rating is documented under task 13.
  ✅ **Map-tile regression FIXED** — the card wrapper set the mapbox container to `absolute
  inset-0`, but mapbox-gl.css forces `.mapboxgl-map{position:relative}` → `inset-0` gave 0 height →
  tiles clipped to nothing. Now an in-flow `h-full w-full` block (LocationMap.tsx). Verified DOM.
- ✅ **CMS IA (Peter): Style / SEO / Front desk moved from the Account group to the Website group**
  in the sidebar (they're website-presentation concerns). Account keeps Publish/Domain/Social.
  Route paths unchanged, so Stacy + the tour (URL/`data-tour`-driven) are unaffected. `Sidebar.tsx`.
- ✅ **Global search: "address" (+ location/map/directions/phone) is now searchable** → "Business
  address & location" (Home Location section) + "Billing details". Added a `keywords` field to the
  search index (`GlobalSearch.tsx`).
- ✅ **Phone default now = business country from the ADDRESS (billing first, then location), not
  timezone.** Location section gained a structured `country` (ISO-2) with a CMS Country dropdown
  that syncs from the billing address; `useBusinessLocation` (6 templates) exposes it; ContactPages
  use `loc.country || countryFromTimeZone(...)`. PhoneField now follows a late-async defaultCountry.
  Verified: argyle contact → 🇬🇧 +44 with location country=GB (overriding US timezone), then 🇺🇸 +1.


**Genuinely OPEN engineering tasks:**
1. ✅ **Task 59 — CRM Site Monitor DONE (2026-07-29, verified in-browser).** Observe-only
   per-site activity/performance: server `GET /api/admin/sites/monitor`
   (`controllers/admin/siteMonitorController.js`, PLATFORM_OPS; window metrics bookings/
   revenue/leads/chats/subscribers + all-time + lastActiveAt from booking/lead/chat/
   site_activity; JS aggregation over capped fetches — move to SQL group-by at scale) +
   CRM `/site-monitor` (`pages/SiteMonitor.jsx` + `useSiteMonitor`): window presets +
   custom range, "Inactive > 1 year" filter, sort, totals strip, freshness tints, manual
   Nudge (mailto) + open-site. No automatic dormancy actions, by design.
2. **Task 56 — Public Docs / Help Center: ✅ BUILT 2026-07-29, PUSHED 2026-08-03.**
   Live in `stemfra_client` at `/docs` + `/docs/:category` + `/docs/:category/:slug`.
   Structured-block content in `src/app/docs/data/{gettingStarted,domains,payments,
   bookings,billing,account}.js` (6 categories / **26** articles — 25 → 24 with the link-out reversal, +2 GBP/review-link articles 2026-08-04) + `index.js` registry;
   components in `src/app/docs/` (DocsLayout/Sidebar/Toc/Blocks/Hub/Category/Article),
   all on WHITE canvas (Peter's call). Wired into routes.js (+ PRERENDER_PATHS via
   `docsPaths()`), seo.js (`seoForDocs`), Footer ("Help Center" link) + FAQ cross-link.
   Truth rules held (no tiers/SMS/auto-debit/voice; commission framing throughout).
   Verified: `npm run build` prerenders 50 routes (33 docs as of 2026-08-04; was 48/31) + sitemap; browser walk
   of hub + Stripe article (images/table/callout/TOC render); all 10 internal links
   resolve; `grep -R "—" src/app/docs` clean. Spec: `stemfra_client/docs/DOCS_CENTER_SPEC.md`.
   ✅ Follow-up DONE (2026-07-29, committed not pushed): `stemfra_client/src/app/pages/
   FAQ.jsx` + `stemfra_platform/docs/STRIPE_ONBOARDING.md` rewritten to the commission
   model (free website, no setup/monthly fee, flat 5% on sales billed separately by
   invoice; card money still flows to the tenant's own Stripe/bank) + em-dashes cleaned.
3. **Task 57 — domain policy:** ✅ onboarding "Do you already have a website domain?"
   question DONE (2026-07-29, verified UI + persistence) — signup step 1 cards (Not yet /
   Yes I own one + optional domain input); answer normalized (lowercase, proto/www/path
   stripped) into `sites.metadata.onboarding.domain {has_domain, domain}` for the
   Settings → Domain card + staff to act on post-signup. Subdomain default + BYO connect
   + CMS search/buy UI were already DONE.
   ✅ **DOMAIN BUY-THROUGH-US IS LIVE END-TO-END (superseded the 2026-08-04 audit
   note; re-verified against code 2026-08-18).** First real purchase
   `argyleandsons.click` on 2026-08-10 (Porkbun order 11293757). Both audit gaps
   were FIXED in `controllers/cms/domainController.js registerOwn`: (a) the retired
   `subscriptions.status='active'` gate is gone — the subscription row is now
   OPTIONAL (commission-era tenants have none; the invoice rides `billing_charges`
   with `subscription_id` nullable); (b) "front-then-bill vs collect-first" is now
   the deliberate **prepaid-float model** in `docs/DOMAINS.md`: INSTANT purchase while
   the Porkbun balance is ≥ $30 (buy → wire DNS/SSL/email → invoice after), auto-
   flipping to INVOICE-FIRST below the threshold (invoice → staff register after
   payment). Shared orchestrator `lib/domainPurchase.js purchaseAndWire()` used by
   both the owner and staff paths. Safe to demo. **Genuinely remaining:** nothing
   blocking; year-2 renewal billing sweeper + transfers/DNS-record visibility deferred.
4. ✅ **P12 Wave 2 Task 9 — owner SMS alerts — DONE 2026-08-06** (A2P campaign
   approved 2026-08-03, Peter confirmed via the Twilio email). `lib/ownerSmsAlerts.js`
   (consent-gated on `cms_notification_prefs.prefs.sms` from the SmsAlertsCard;
   `OWNER_SMS_ALERTS_ENABLED=false` kill switch) wired alongside the owner emails
   under the same per-event prefs: new booking / cancellation / reschedule /
   website lead / chat lead / chat escalation / membership signup. Inbound
   STOP flips the consent record (`routes/twilio.js` sms-inbound). Verified
   end-to-end: a real forge-and-bell booking produced a DELIVERED alert on the
   approved campaign; all fixtures + the seeded test consent cleaned.
   ⚠ Remaining Peter action: opt in for real via CMS → Settings → Notifications
   SmsAlertsCard (no consent rows exist yet; nothing sends until owners opt in).
   Re-checked 2026-09-24: still 1 prefs row with an `sms` key and 0 consents; code is done,
   this is only Peter's own test-tenant opt-in (low priority).
5. **P10 case 42 "Remix" R2/R3** (AI theme composer engine) — R1 registry done; rest pending.
6. **P10 case 1 remainder** — task videos + a "What's new" channel (guidance polish shipped).
7. **VSL production** (P12 "Last") — deliberately last.
8. **Memberships: Mindbody-parity items** (2026-08-10 comparison vs their
   Membership Settings screen; Peter asked what we miss). We already have what
   they lack for our model: pay-at-venue renewals collection, per-member
   pause/suspend/cancel, MRR reporting. Worth adding LATER, in order:
   (a) **member perks / discount %** on a plan (e.g. "members save 10% on
   services") — store on the site_products row, show on the site tiers and at
   owner collection time; cheap once membership tiers render beyond crossfit.
   (b) **members-only booking** — per-service "members only" flag gating the
   public booking flow behind member sign-in; pairs with the existing
   magic-link member accounts, needs member context in BookingForm.
   (c) plan sort order in the CMS if plan lists grow. SKIPPED deliberately:
   membership icons, self-sign-in restrictions and non-member purchase toggles
   (tied to Mindbody's commerce model, N/A under pay-at-venue).
9. **Airwallex HYBRID invoicing — SHIPPED 2026-08-12** (branded email carries the
   canonical Airwallex invoice: link + PDF; see `docs/AIRWALLEX_INVOICING.md`).
   **Remaining near-term tasks** (all in that doc §9): (a) **tax-aware ledger +
   recon-on-total** — add `tax_cents` etc.; recon matches `amount_cents +
   tax_cents`; defaults to 0 (no behavior change now), build before we register
   for sales tax anywhere; (b) **`invoice.paid` webhook** — REQUIRED when
   Airwallex Payments/card goes live (a hosted-link card payment must flip our
   `billing_charges`; today we only handle `deposit.*`); (c) confirm Airwallex
   tax filing-partner vs manual filing; (d) optional `pay.stemfra.com` custom
   domain ($10/mo Beta). Also queued: (optional) final live e2e via `markRequested`
   on a demo site; the Airwallex-email observation experiment.
8. ✅ **Front Desk widget rollout to all 6 verticals — DONE 2026-07-31.** This entry
   was written 2026-07-29, two days before the rollout landed, and stayed stale.
   **Re-verified independently 2026-08-03**, not taken from the doc's own claim:
   `logoUrl` + `suggestions` passed in all 6 Layouts; `memberToken` in
   crossfit/massage/spa (the only three with a member portal); the "Chat assistant"
   privacy clause present on **18/18** live+previewing sites (SQL over
   site_pages/site_sections); `metadata.classes` + `expires_days` on **3/3** active
   class packs (only lila-studio sells them, so nothing else was in scope).
   **BUILD IS COMPLETE — nothing left to code (re-confirmed 2026-08-18).** What
   `stemfra_platform/docs/FRONTDESK.md` §9 still lists are LIVE-VERIFICATION items that
   cannot be driven from a dev machine (a real agent turn needs the prod n8n host,
   which is unproxied and unreachable from a laptop; the workflow itself is live and
   its Build Prompt node was diffed against the repo file 2026-08-03 — matches).
   → **Fold into the LAUNCH TEST (Peter, 2026-08-18)**, not the roadmap: (a) member
   reschedule/cancel through a real signed-in chat (crossfit/massage/spa); (b) a
   multi-line slot card (needs a site that sets locations); (c) one human Shift+Enter
   keypress + a paste. (Lira Yoga's 6 stale service rows were deactivated 2026-08-03,
   FRONTDESK.md §9 #11.)

9. ✅ **BOOKABILITY HYGIENE CLOSED 2026-08-04 (Peter approved all groups).** Data:
   Group B — 30 priced massage/spa modalities flipped bookable + 96 staff links
   (lull/reveline/umbra/vela/aurea, the ellaris verdict applied); Group C —
   "Couples Massage (at home)" reclassified class→appointment + 16 links on all
   6 wellness sites (it was dead-ending everywhere, ellaris included); Group D —
   wildflower's Vinyasa Flow priced $24 + 16 daily 09:15 sessions seeded (lila's
   shape). Post-fix sweep: the ONLY remaining findings are crossfit's 24 group
   Programs = Group A, deliberate display-only. **Durable fix shipped:** Services
   page bookability badges (amber "Display only" stated neutrally; red "No staff
   linked" / "No upcoming sessions") — owners now see their own gaps; no more
   sweeps. Verified live: forge shows exactly 6 amber, 0 red.
   ─ Original record: **Front Desk sweep — COMPLETE 2026-08-01 across all 6 verticals** (4/4 starters
   each + visual pass). Fixes committed: details form now requires name, email AND
   phone, enforced server-side in `detailsCard()`/`hasContact` so BOTH the
   appointment and class branches get it (`2d7986c`, `9da0e8d`); "First time here"
   returns a real first-visit answer plus the services list instead of an empty
   welcome, and a trailing "tap any day for details" is stripped when no row in the
   card is tappable (`4e6470b`); message-avatar frame reduced to a hairline
   (`6b97bf6`). **Still open from the sweep:**
   - **Bookability data hygiene (NOT a bulk fix — needs per-vertical rules).** A
     cross-site query found 11 live/previewing sites with services that are ACTIVE
     but `bookable=false` (so they render as dead rows in the chat menu) and/or
     `bookable=true` with ZERO team links (so they dead-end at availability).
     ⚠ **Some of this is deliberate**: on crossfit (forge-and-bell, ironclad-athletics,
     212-strength-co, blackfly-barbell, aurea) the 6 non-bookable rows are the group
     PROGRAMS, intentionally kept out of the 1-on-1 wizard per the appointments-vs-
     classes model in `stemfra_platform/CLAUDE.md`. And "bookable with no staff" is
     fine for CLASS bookings, where the calendar comes from scheduled sessions rather
     than staff availability (lila-studio's 5 are likely this). So the task is to
     decide the rule per vertical, then fix only what is genuinely wrong.
     **Queued for this task (found 2026-08-03):** `wildflower-yoga-pilates` →
     **"Vinyasa Flow"** is `bookable=true` with `price_cents=0` and ZERO
     `site_class_sessions`, so it renders priceless next to a `$30` row in the chat
     list and dead-ends at availability if tapped. Surfaced when the site's 6 stale
     rows were deactivated (FRONTDESK.md §9 #11). Deliberately NOT bundled with that
     cleanup: this is a content call (seed sessions + a price, or deactivate), and it
     is the same "bookable with nothing behind it" rule this task exists to decide.
     ⚠ Note wildflower now shows only 2 services, one of them this broken row — check
     it before using that site in a demo.
     **Already fixed: ellaris-spa only**, where it was an unambiguous within-site
     inconsistency (6 massage modalities non-bookable while the site's other massages
     were bookable with the same 4 therapists; plus "Couples Massage (at home)" marked
     bookable with no staff). Now 17/17 bookable, min 4 staff. Revert by setting those
     6 back to `bookable=false` and deleting their `site_team_service_links`.
   - **The durable fix worth considering**: surface this in the CMS (warn when a
     service is active but unbookable, or bookable with nothing behind it) so owners
     see it, instead of relying on a sweep to catch it.
   - ✅ **Doc-vs-DB drift FIXED 2026-08-03**: the canonical mapping now lives in
     `stemfra_platform/CLAUDE.md` ("SUBDOMAIN ≠ BRAND NAME" table) + the massage/spa
     reference. Rule: identify fixtures by SUBDOMAIN (maison-lune = Maison Solène,
     lila-studio = Lira Yoga, `lull` = Lull Massage; the whole wellness demo fleet
     was renamed — calm-roots-massage/zen-haven/reverie-massage/respira-spa/lumora-spa
     are all DEAD subdomains).
   - **Never exercised**: member reschedule/cancel through a real signed-in chat on
     the member-portal verticals (crossfit/massage/spa).

10. ✅ **Tier-system residue — CLEANED 2026-08-04 (the parts that were residue).**
    Done: SignupPage no longer records a fabricated `tier: 'growth'` on every
    commission-era signup (nothing links `?plan=` any more — verified before
    cutting; the server still accepts-and-nulls the field for back-compat);
    dead `useChangePlan` + `PlanOption` + the unused availablePlans/currentTier/
    canChangePlan fields removed from `stemfra_cms/src/lib/billing.ts` (CMS
    typecheck clean); `SMSModal.jsx`/`SMSThread.jsx` DELETED from stemfra-ops
    (zero imports; ops build clean; ConversationPanel comments updated).
    ⚠ **Deliberately KEPT — this is the important finding:** the tier-shaped
    `/api/plans` catalog and the CRM `OfferEditor` are NOT residue. They are the
    live implementation of "everyone gets everything": `Pricing.jsx` and the CMS
    BillingPage render the UNION of live features across the catalog tiers, and
    OfferEditor is the no-deploy switch for feature statuses (live/gated/soon).
    Deleting them would remove real capability. The only remaining cosmetic item
    is `Pricing.jsx:36`'s own TODO (reshape the catalog from tiers to a flat
    feature list — a 4-consumer refactor with zero behavior change; do it only
    when touching the catalog anyway).

11. ✅ **Reassign a booking to a different team member — SHIPPED 2026-08-05**
    (verified live on forge-and-bell). Built exactly as proposed below: a "Change"
    control next to "with {staff}" in `BookingDetailModal` (confirmed + future +
    assigned bookings only) opens `ChangeStaffDialog` — qualified staff only
    (via `site_team_service_links`), anyone already booked at that time shown
    greyed out "Busy at this time"; `validateStaffAssignment` re-checks at save.
    A same-time swap keeps the reminder stamps (`useRescheduleBooking` gained
    `timeChanged` gating) and audits as `staff_reassigned`; the customer still
    gets the update email. The calendar drag path (`handleEventDrop`) now runs
    the same guard (qualification on cross-column drops + conflict always) and
    labels a pure column swap "Staff reassigned"/"Appointment reassigned".
    **Bonus fix:** the reschedule audit had NEVER landed — it wrote to the CRM's
    `activity_feed`, whose entity_type CHECK rejects `site_booking` (the
    [[feedback_audit_use_site_activity]] trap), and owners have no INSERT policy
    on `site_activity` anyway. New `POST /api/cms/activity` (allowlisted actions,
    ownership-checked, service-role `logSiteActivity`) + client
    `logBookingActivity` in `bookingNotify.ts`; reschedule/reassign audits now
    actually persist. Front Desk chat swap remains a possible follow-up.
    Original scope: Real
    scenario: a customer books Barber A, A calls in sick, the manager offers Barber
    B, B does the cut. **The capability half-exists**: dragging an appointment
    across staff columns in the Bookings calendar DAY view sets `newTeamMemberId`
    and updates `site_bookings.team_member_id` (`BookingsCalendarPage.tsx`
    `handleEventDrop`), and writes an `activity_feed` row. Attribution downstream is
    correct, because the team member is a live FK (only the service NAME is
    snapshotted). **Gaps:**
    - No staff picker in `BookingDetailModal` — the place a manager actually looks.
      Its pencil edits date/time only, so the feature is undiscoverable.
    - Drag works in DAY view only, and drag is the wrong interaction for a manager
      standing at the counter on a phone.
    - `handleEventDrop` runs NO guard: it does not check the target is linked to
      that service (`site_team_service_links`) and does not run the conflict check
      (`useBookingConflicts` is wired to the reschedule dialog, not the drop). So a
      service can be assigned to someone who does not offer it, or double-booked.
    - It reuses the reschedule mutation, so a same-time swap needlessly resets
      `reminder_24h_sent_at`/`reminder_2h_sent_at` and logs the reason as "Moved on
      calendar", which is wrong for a swap where nothing moved.
    - The Front Desk chat cannot do it (member reschedule/cancel exist; swap does not).
    **Proposed:** a "Change barber" control in `BookingDetailModal` reusing
    `useRescheduleBooking` with `newTeamMemberId` and the unchanged start time,
    offering only qualified + free staff, reason "Staff reassigned", no reminder
    reset. Apply the same qualification/conflict guard to the existing drag path.

12. ✅ **Clients page v2 — SHIPPED 2026-08-04** (revenue column + sortable headers +
    open numeric filters; loyalty SEGMENTS dropped by Peter's call — thresholds
    don't transfer across verticals, the owner filters by number instead. A
    per-client profile view + a dashboard Top-clients card remain optional
    follow-ups). Original scope: Today's Customers page is a directory (visits, last
    visit, tags, notes, opt-outs, CSV, suspend) with NO revenue view. Build:
    per-client lifetime revenue (sum of paid `site_bookings.amount_cents` + the
    at-visit `metadata.collected` amounts) + visit cadence on the list and a
    per-client profile; derived segments VIP / regular / new / lapsed (spend +
    recency); a "Top clients" dashboard card. The lifecycle emails (win-back,
    birthday w/ discount) already ACT on loyalty — this adds the insight layer
    that tells the owner who deserves the holiday bonus. **Design reference
    (Peter): the Idometrics admin Users table** (`/Volumes/Peter Drive/peters
    macbook air/Desktop/idometrics/May 2026 ido/ido-admin`, `app/(main)/users/`):
    generic `columns` config with multi-field cells + custom renderers, a Profile
    cell (avatar + name + email) linking to a per-user view page, status badges,
    a status filter dropdown, per-row actions. Sidebar already says "Clients".

13. ✅ **Mapbox location maps — CORE SHIPPED 2026-08-04** (LocationMap archetype:
    dynamic-import mapbox-gl, address geocoding, --site-accent marker; wired into
    BOTH map-showing variants — Default/streets + DarkPanel/dark — with the
    Google-embed fallback kept, so no-token sites are untouched. Verified live on
    argyle/Classic NYC. Token in each template's .env.local (gitignored).
    ✅ **RESOLVED (verified 2026-08-18): NO per-Pages action needed.** The token is
    served by the SERVER — `GET /api/public-config` (`routes/publicConfig.js`, mounted
    in index.js) returns `MAPBOX_PUBLIC_TOKEN` from `deploy.yml`, and `LocationMap`
    fetches it at runtime (the build-time `VITE_MAPBOX_TOKEN` is only an override).
    Prod confirmed returning a `pk.` token. One source of record; rotating it reaches
    every site on the next fetch, no Pages rebuilds. (An earlier version of this line
    said "add to 6 CF Pages projects" and outlived the 2026-08-04 fix.) Optional
    hardening still stands: restrict the token to *.stemfra.com + localhost in Mapbox.)
    ✅ **On-map info card SHIPPED 2026-08-13** (Option B, Peter's call): a
    Google-Maps-style overlay card on the tiles — business name + address +
    **Directions** (accent-filled, Google Maps dir link) + **Open in Maps**
    (outline, Google Maps search link), bottom-left, cleaner than Google's own.
    Built into `LocationMap` (`MapInfoCard`), so BOTH map variants get it free;
    `name` threaded from LocationCardDefault + LocationCardDarkPanel. Verified via
    DOM on argyle (name + both hrefs correct). **Rating row is coded but
    data-gated** — `LocationMap` accepts `rating`/`reviewCount` and renders the
    star row ONLY when passed; nothing passes them yet, so there is NO paid Places
    call and no owner false-claim.
    🟡 **FUTURE (Peter agreed 2026-08-13): live Google rating on the card.** Wire
    Google Places API (Place Details → rating + user_ratings_total) so the star
    row lights up with the REAL Google rating. Needs: a server endpoint (key stays
    server-side, we already hold a Places key from AddressAutocomplete), a per-site
    Google Place ID resolved once from the address (the "Google Business Profile
    linkage"), 24h caching to bound API cost, and reading Google's Places docs
    first (standing "third-party docs first" rule). Deferred now purely to avoid
    the per-pageview API cost; the card layout already reserves the slot, so
    lighting it up is just passing the two props.) Original:** Pattern + credentials come from unekride:
    `unekride-customer-mobile/components/BookingMap.web.tsx` (mapbox-gl in the
    browser, PUBLIC token — safe to ship; style URLs streets-v12 / dark-v11 with
    a theme hot-swap). Token lives in
    `/Users/peterokeme/Documents/SAAS/unekride/unekride-customer-mobile/.env`
    (`EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN`; there is NO unekride-server dir — the
    mobile app is the only Mapbox consumer). Build: a Mapbox variant of
    `LocationCard` themed via `--site-*` (light/dark style per theme register),
    token as `VITE_MAPBOX_TOKEN` in the template apps, keep the current
    placeholder-behind-iframe fallback pattern. No server work (public token).

14. **Help Center: CMS how-to docs (Peter, 2026-08-04 — list to be agreed).**
    First articles: "Manage your Team" + "Manage your Services" — add / edit /
    reorder / photos / team-service linking / delete, every control on those
    pages, barbershop as the worked example. Proposed full list for discussion
    (mirrors what owners actually touch): Bookings calendar (statuses,
    reschedule, mark collected) · Pages & sections editing + live preview ·
    Media library · Promotions · Blog · Automated emails + review link ·
    Front Desk on/off + what it does · Reports · Billing (invoice → receipt) ·
    Clients page. Rule from the GBP articles: point at real product surfaces,
    embed videos only where a third-party UI is the confusing part — our own
    CMS should be documented with our own screenshots.
    **SUPERSEDED 2026-09-09 by Help Center v2** (`stemfra_client/docs/DOCS_CENTER_V2.md`,
    agreed with Peter after studying Namecheap's knowledgebase): one article per
    tutorial video, question-style titles, the video embedded FIRST then the steps,
    a screenshot with a green arrow/box on every UI step, generated by a `shot` hook
    in the tutorial recorder so they regenerate when the CMS changes; Updated date
    rendered; old slugs redirect. ⏳ Step 1 (14 articles for playlists 1 + 4) starts
    after the YouTube upload supplies the video ids.

**DEPLOY/OPS GAPS (audit 2026-07-29; re-verified 2026-08-03):**
- ✅ **`PAYMENT_CREDENTIALS_KEK` is now in `deploy.yml`** (line 136, from the GitHub
  secret). Verified 2026-08-03. The P12 direct-keys payment system is no longer
  silently disabled in prod.
- ✅ **`COMMISSION_SCHEDULER_ENABLED=false` is now in `deploy.yml`** (line 137) —
  still intentionally OFF pre-launch (manual `/commission/run` works). **Flip to
  `true` at launch or invoicing will not run.** This is the one to remember.
- ✅ **The uncommitted surface is CLOSED.** Committed 2026-07-29 and **pushed
  2026-08-03** (server `b28363a`→`737ed5b`, platform `→3d3857d`, client
  `→3fcc07b2`; ops and business had nothing outstanding). All repos are at zero
  ahead, zero dirty, so a rebuild from `main` now ships everything.
  ⚠ The push also put `stemfra.com/sms-consent` live for the first time; it had
  been 404 in production the whole time the A2P arc was "done" locally. Worth
  remembering as a class of bug: local-done is not shipped.
- Per-tenant Stripe webhook (`/api/stripe/webhook/:siteId`) deliberately deferred
  (redirect-verify + sweeper covers one-time charges — see P12_PLAN); the stored per-site
  webhook secret is currently written but never read.

**Waiting on EXTERNAL (no code blocked behind them except as noted):**
- **A2P 10DLC** — campaign v2 resubmitted 2026-07-26, vetting typically ≤5 days → unlocks
  Wave 2 Task 9 (SMS alerts).
- **Airwallex card KYB** — unlocks Batch 2b auto-debit; activates with trading history.
  Manual bank-transfer invoicing loop is COMPLETE and is the live collection path.
- **Stripe (Stemfra's own) verification** — NOT blocking anything current (commission model
  collects by invoice; tenant card payments use the tenants' OWN keys). Only gates the
  dormant Connect/System-B path + platform auto-debit alternatives.
- ~~Porkbun account~~ ✅ verified + funded; CMS domain search tested live. First real
  purchase still untested (deliberate).
- ~~Cloudflare API token scopes~~ ✅ done — full domain-zone + Email Routing + Resend
  workflow shipped and tested (prod deploy.yml carries EMAIL_PROVIDER=resend + keys).

## ✅ Done this session (2026-06-28/29)
- 9 demo sites (one per active theme, 4 verticals), owner `peechizzy@gmail.com`
  ("Marcus Argyle"); `demo_link` map + send-outreach wiring.
- Email open-tracking (pixel + endpoint); Mark outreach (send as `mark@`, reply sweeper).
- `provisionSite` vertical-alias fix; `boutique_gyms` vertical deactivated.
- **Pricing page honesty pass** — removed "— 2 months free" from the Annual
  toggle; **trimmed all 3 tiers + the core strip to features that ship today**
  (payment/membership/voice features gated → documented in `docs/OFFER_TIERS.md`,
  re-add as they land). ⚠ **Pro is now thin** — see P6.1 (product decision pending).

## ⚙️ Operational / parallel (Peter — not code) — ⚠ HISTORICAL (2026-06-29); superseded by the "WHERE WE STAND" block above
- **Start Stripe application NOW with EIN + passport** (ITIN likely isn't the gate); confirm EIN on file.
- ITIN application (~3–4 mo) — for tax filing, tracked separately.
- Lemon Squeezy / Paddle — evaluate only **if/when approved**; not required (Payoneer interim → Stripe target).
- **Stripe Tax** — enable at first out-of-state US **nexus** (event-driven; not now). Monitor revenue-by-state; CPA at the inflection.
- **When Stripe verifies** → flip System A to Stripe Billing + activate **System B** Connect (Phase 0/1 already in code).

---

## P0 — Revenue: collect from the first clients  ✅ DONE (2026-06-29, deployed)
_Interim = Payoneer Request-a-Payment ($1,199 first, then $199). All 5 verified + shipped:
schema + `billing_charges` ledger · server provider layer + Payoneer + `/api/admin/billing/*` ·
CRM `/billing` (selector + Due-this-cycle + Copy-request + Mark Paid + Start billing) ·
monthly cycle opener (idempotent) · KYC `leads.first_name/last_name` + `contacts.state`.
Plan catalog is DB-driven (`crm_settings.billing_plans`). Full write-up: a memory + this file._

1. **Billing schema** (batch 1, additive): `subscriptions.provider` +
   **`billing_charges`** ledger (`line_items` jsonb, `kind` initial|recurring,
   amount, currency, due_date, status, provider, external_ref, requested/paid
   at+by) + `crm_settings.billing_active_provider`. First charge =
   `[Setup $1,000, Tier month-1]` = **$1,199**; then **$199**.
2. **Server** `lib/billing/` provider interface + **Payoneer** provider +
   `/api/admin/billing/*` (list / mark-requested / mark-paid / open-cycle / provider).
3. **CRM `/billing`**: active-method selector + per-client charges + **"Copy
   request details"** (Name/Email/Country/State/amount/currency/due/desc, paste
   into Payoneer) + Mark Requested/Paid + **"Due this cycle"** list.
4. **Monthly cycle opener** (background task or manual button).
5. **#1 KYC**: `leads.first_name/last_name` + billing-contact **`state`** (needed
   for the Payoneer payer + KYB). Store first/last directly through
   contactController + CRM Add-Lead + onboarding.
   - Billing reads tier/setup amounts from DB `verticals` → first consumer of the
     pricing single-source (down-payment on #5).

## P1 — Scale the motion: onboarding + client-facing billing  ✅ DONE (2026-06-29)
_CMS client Billing · self-serve CMS `/signup` (KYC + 2 questions, prefilled from
pricing) · onboarding backend (+ created_by FK fix) · Booking & Payments setting +
agent/template gating + CRM visibility. Remaining sub-item: an optional Q2
payment-LINK URL field (PayPal.me/Square) — onboarding already captures the
payment answer; deferred as low priority._

6. ✅ **Onboarding redesign** (Squarespace-referenced — see SQUARESPACE_REFERENCE.md).
   **Entry point (decided 2026-06-29): onboarding lives in the CMS, not
   stemfra_client.** Marketing pricing "Start for free" on a plan → redirect to the
   CMS carrying plan + vertical → CMS signup → guided onboarding (Squarespace/
   Mindbody pattern). Reuse onboardCustomer/provisionSite + Stacy checklist.
   Capture KYC fields + **"How do you currently receive payments?"** (Stripe/PayPal/
   Square/cash/other/none) → informs Connect type (Standard vs Express) + which
   System-B integrations to add; feeds payer data (incl. `contacts.state`) into P0.
7. ✅ **CMS client Billing section** (DONE 2026-06-29) — Account → Billing: subscription
   + charge history + editable billing contact. `/api/cms/billing`.
8. ⛔ **Payment/booking-provider setting (#3) — REVERSED 2026-07-29 (Peter's call).**
   The external "link-out to Mindbody/Vagaro/etc." booking option was REMOVED so
   Stemfra's own native booking is the ONLY booking system. Gone: the `link_out`
   radio + provider dropdown + URL field in CMS `BookingSection.tsx`, the
   `bookingProviders.ts` catalog, the server `/api/cms/payments/booking-mode`
   endpoint + `getBookingMode`/`setBookingMode`, the Front Desk `link_out`
   deflection, the template CTA `link_out` branch, and the Help Center article.
   RETAINED: `consultation_form` ("no online booking" → phone/contact). The DB
   `booking_mode` enum still carries the unused `link_out` value (not dropped).
   The only competitor stance now on record is "no API integration" (unchanged).
   _Historical (superseded):_ DONE: CMS "Booking & payments"
   (provider + URL), Front Desk agent gate, all 4 template Book CTAs, CRM
   visibility. (Optional Q2 payment-link URL field still pending — see note above.)
   _Original spec:_ Where the client picks how THEY take
   payment/bookings + the redirect URL their site links to (e.g. a Mindbody URL).
   Today's `PaymentsSection` only has in-person `payment_methods` + `payment_message`
   (wired) + Stripe Connect; there's NO curated provider + redirect-URL field. Build:
   a **curated dropdown** (Stemfra native · Mindbody · Wodify · Vagaro · Booksy ·
   Fresha · GlossGenius · Acuity · Square Appts · Calendly · Schedulicity · PayPal ·
   Stripe link · **Other**+custom) + a **redirect/booking URL** field, stored on the
   site, used by the template Book/Pay CTA, and **visible to both client (CMS) +
   staff (CRM)**. Onboarding's "how do you receive payments?" seeds the initial value.

**Deferred (post-roadmap, per Peter 2026-06-29):** demo-site preview links on the
Products + Templates pages; display ALL themes per vertical on pricing/templates.

## P2 — Polish what we sell  ✅ mostly DONE (2026-06-29)
8. ✅ **#2 Favicon** — neutral theme-tinted data-URI default in all 4 template
   `index.html` (SiteHead still overrides with a site's own).
9. ✅ **#3 Link-unfurl OG** — stopgap (neutral static `<title>`) DONE + per-host OG
   edge function BUILT (`functions/_middleware.ts` in all 4 templates: host→site→
   HTMLRewriter title+OG). **Deploy step (Peter):** add `SUPABASE_URL` +
   `SUPABASE_ANON_KEY` to each template Pages project's env; verify on deploy
   (edge-only runtime — couldn't be locally verified).
10. ✅ **#8 Marketing contact form email dedup** — re-submit updates the open lead.

## P3 — Maintainability before scaling verticals  ✅ main items DONE (2026-06-29)
_`lib/verticalConfig.js` is the single source (aliases/project/seed/leadgen) — all
consumers refactored, behavior verified. `boutique_gym` out of lead-gen (#6).
Pricing single-source: `/api/plans` (DB catalog) → marketing pricing page.
Remaining (lower, item 14): demo_sites table + SUBJECT_TO_SERVICE/KNOWN_TEMPLATE_SLUGS → DB._

11. ✅ **#4 `verticalConfig` consolidation** — `VERTICAL_PROJECT` (3 copies),
    `SEED_SOURCE_BY_VERTICAL`, `VERTICAL_ALIASES` (2 copies), `KNOWN_VERTICALS`
    vs `LEADGEN_VERTICALS` → one source imported everywhere.
12. **#5 Pricing single-source** — DB `verticals` → client (stop `verticals.js`
    drift); sync Stripe products. (Partly begun in P0.)
13. **#6 boutique_gym** out of `KNOWN_VERTICALS` + `LEADGEN_VERTICALS` (vertical already inactive).
14. Demo links → `demo_sites` table; `SUBJECT_TO_SERVICE` / `KNOWN_TEMPLATE_SLUGS` → DB. _(lower)_

## P4 — Growth levers (lead-gen)  ✅ DONE (2026-06-29)
18. **Run feedback at every exit** ⏸ ON THE ROADMAP, finalise later (Peter, 2026-09-14)
    (Peter's rule 2026-09-13: a run that stops early must say so). Server ✅ BUILT + VERIFIED 2026-09-13: `POST /api/leadgen/run-complete` closes
    `leadgen_runs` (completed | empty, counts, sentence) and bells the requester (kind
    `leadgen_run`, CRM tray icon); `/trigger` relays the sentence when n8n answers within 25 s.
    n8n v14 paste written (`leadgen-run-feedback-v14.paste.md`: Run Summary node, If gates at
    website filter / dedupe / score, link-in-bio + booking-page URLs = no website,
    `leadgen_run_id` stamped so Coverage counts stop reading 0). ✅ LIVE, Peter confirmed
    2026-09-15: imported from Peter's export as `n8n-workflows/leadgen-v14-2026-09-15.import.json`
    (a script applied the ten steps), v13 unpublished; proven on a Yonkers run (3 scraped, 3
    inserted with the run id, run row completed, bell rang). Native port = P41.
17. ✅ **Outbound auto-call guardrails** — `lib/callGuardrails.js` (DNC + pan-US safe
    window + daily cap), reply sweeper + manual Call-with-AI gated.
16. ✅ **Follow-up sequencer + reply-classification** — `lib/outreachSequencer.js`:
    A1→A2(+7d)→**read-gated call**(+8d)→A8(+14d)→A20(+21d), DB-driven cadence, stops on
    reply/opt-out/signup; CRM "Auto follow-up" toggle. Reply classifier (unsubscribe→
    DNC+do_not_email / declined / interested). Off by default.
15. ✅ **#7 template-fill merge** — `outreachSequencer.renderMergeFields` fills
    first_name/business_name/demo_link/start_free_link/sender_* (+strips unknowns);
    send-outreach already fills the links. _(n8n-side drafting still inlines values.)_

## P5 — Hardening + platform roadmap
18. Voice hardening — Twilio signature validation + WS auth.
19. Per-role RLS data hardening (stemfra-ops) — role-scoped policies vs blanket `is_stemfra_staff()`.
20. Stacy ~~S3 (act)~~ ✅ S3 DONE (clone action, 2026-07-01 — see server CLAUDE.md) + **S4** (RAG + insights, still open).
21. **Ledger** agent (Agent 6).
22. Dynamic CORS (query live custom domains) — deferred.

## P6 — Offer maintainability + site lifecycle (NEW, queued 2026-06-29)
_Raised by Peter while reviewing the pricing page + CMS Sites page. 23 + 24 SHIPPED
this session; 25–27 still pending._

23. ✅ **Pro-tier product decision — DONE: marked "Coming soon" / waitlist.** After
    the honesty trim Pro's deliverable delta over Growth was just SMS reminders +
    priority support (headline AI Voice Receptionist + custom email + promo codes
    are 🟡/🔴). Decision: sell **Essential + Growth** now; Pro renders as a
    **"Coming soon" waitlist card** (pill + "Join the waitlist" → `/contact?interest=pro-waitlist`),
    still listing its aspirational features. Flip `coming_soon` off in the catalog
    when voice-booking ships. (`verticals.js` flag + Pricing.jsx render + DB catalog.)
24. ✅ **Server-driven offer/tier data — DONE.** The DB plan catalog
    (`crm_settings.billing_plans`) now carries the **full offer**: per-tier
    `label/promise/featured/badge/coming_soon/order` + `features[]` (each
    `{text,status}`) + a `core_platform[]` strip, alongside the prices the billing
    engine already read. `status` = **live / gated / soon**; the marketing page
    shows only `live` on a live tier (gated/soon kept for re-add, shown on a
    coming-soon tier). Surface: `GET/PUT /api/admin/billing/plans` (PLATFORM_ADMIN,
    `billing.setPlans` validates money fields) + public `GET /api/plans`. The
    marketing pricing page consumes it (`mergeTiers`/`mergeCore`, `verticals.js`
    = fallback). **CRM editor**: `/billing/plans` (`pages/OfferEditor.jsx`, linked
    from the Billing header) — edit names/prices/promises/badges/coming-soon +
    add/remove/reorder features with a live/gated/soon status, no deploy. Kills the
    `verticals.js`↔DB drift (subsumes P3 item 12). _Annual discount is in the
    catalog (`annual_discount_months`) but the page still reads the local constant —
    minor follow-up to thread it through `annualPrice()`._
25. ✅ **CMS plan upgrade/downgrade — DONE (2026-06-29).** Owner self-serve
    upgrade/downgrade from CMS Account → Billing ("Change plan" card). Server:
    `billing.changeSubscriptionPlan` + `POST /api/cms/billing/change-plan`
    (requireCmsAuth + ownership + status guard active/past_due; rejects coming-soon
    tiers), tier list surfaced via `getBilling` (`availablePlans`/`currentTier`/
    `canChangePlan`). New monthly rate takes effect **next cycle** (the cycle opener
    reads `monthly_amount_cents`); tier entitlement (`metadata.tier`) flips
    immediately; `plan_history` trail + `site_activity` audit so staff request the
    new amount. No mid-cycle proration under manual Payoneer — Stripe will add real
    proration when it's the active provider. CMS: `useChangePlan` + `ChangePlanCard`
    (confirm step). Verified: routes 401-gated, CMS `tsc --noEmit` clean.
    ⚠ **2026-08-04 audit: the UI half of this no longer exists.** `ChangePlanCard`
    was removed with the tier retirement (P13 — no tiers to change between);
    `useChangePlan` survives in `stemfra_cms/src/lib/billing.ts` with ZERO callers
    (dead code, cleanup candidate). The entry stays ✅ as history; do not go looking
    for the card.
26. ✅ **Site deletion + lifecycle cleanup — DONE (2026-06-29).** Policy (Peter):
    **both** staff + owner can delete · **90-day** grace · **block on unpaid +
    cancel sub** · export deferred to v2. Built: schema (`sites.deleted_at`/
    `deletion_reason`/`deletion_initiated_by` + partial index, no enum change);
    `deleteSiteCascade` extended to all **26** site-scoped tables + best-effort mode
    (also fixes the rollback-orphan gap); `lib/siteDeletion.js`
    (`softDeleteSite` → detach CF host + cancel billing + stamp + audit;
    `restoreSite`; `hardPurgeSite` → Cloudinary destroy + full cascade);
    `lib/siteDeletionSweeper.js` (purges past the 90-day grace, started in index.js).
    Endpoints: staff `POST /api/admin/sites/:id/{delete,restore}` (+ `?deleted=true`
    list + `force` past unpaid); owner `POST /api/cms/sites/:id/{delete,restore}`.
    UI: CRM Sites Active/Deleted tabs + delete modal (type-DELETE, force-on-unpaid)
    + Restore; CMS Sites delete modal + owner-context hides deleted. Verified:
    routes 401-gated, all files parse/typecheck clean, schema applied (0 sites
    flagged). Spec: `docs/SITE_DELETION.md`. _(Not E2E-run against a live site —
    detach/purge hit real CF/Cloudinary; logic mirrors the proven detach + rollback
    paths.)_
27. ✅ **Domain registrar — v1 BUILT 2026-06-29 (Porkbun, staff-mediated), inert
    until keys.** `lib/registrar/{porkbun,index}.js` + `/api/admin/domains/*`
    (healthcheck/search/requirements/register; `confirm`-gated, dryRun otherwise) +
    CRM Sites Domain modal "Buy a domain" tab. Real buy → register → Porkbun DNS
    (apex ALIAS + www CNAME → `{project}.pages.dev`) → `attachCustomDomain` to Pages
    → `sites.custom_domain` → bill client retail via `billing_charges` 'adjustment'
    → audit. Verified: module chain loads, `isConfigured()=false`, retail markup
    ($11.08→$18.08); routes added (server was down at test time — unrelated to my
    code, all files `node --check`/esbuild clean). **Blocked on Peter:** Porkbun
    account + **funded balance** + API keys (`docs/DOMAINS.md` checklist). **Needs
    live verification:** apex ALIAS ↔ Cloudflare Pages custom-domain validation.
    **v2 deferred:** customer self-serve CMS buy · `site_domain_purchases` table +
    renewal/expiry sweeper · `check_domain_availability_and_price` as search backend.

## P7 — Marketing funnel: theme galleries (NEW, 2026-06-30)
_Marketing site (`stemfra_client`). Per-vertical theme pages drive the buy path:
Products/Discover → `/themes/:vertical` → pick a theme → pricing → onboarding.
Done this session unless noted._

28. ✅ **Per-vertical theme gallery** — new route `/themes/:vertical` +
    `ThemeGallery.jsx` + `data/themes.js` (9 live demos mapped per vertical, synced
    to `provision-demos.js`). Each theme card: screenshot → "Preview live ↗" (opens
    the real demo) + **"Select this theme"** → `/pricing?vertical=&theme=`. "Discover"
    (BrowseDrawer) + the Templates page tiles now route here (were dead-ending at the
    contact form). Pricing page reads `?vertical=&theme=`, shows a "Selected theme"
    chip, and threads both into every "Start for free" CTA → CMS `/signup?plan=&vertical=&theme=`.
    Yoga is `comingSoon` (renders a muted card) until its mockup lands.
29. **High-res, content-edited theme screenshots (PENDING — Peter).** v1 uses
    WordPress mShots auto-screenshots (grey placeholder on first load → not
    production-grade). Peter will edit each demo's content/images for uniqueness, then
    share hi-res shots. Plan: capture the 9 live demos (full-page or hero), upload to
    Cloudinary, set `screenshot` on each theme in `data/themes.js` (one field per
    theme, no page edits). Flip yoga's `comingSoon` off once its shot is in.
30. ✅ **Onboarding CONSUMES the `theme` param (2026-07-02) — via Starter clone, not
    `templateSlug`.** Both marketing entry points now provision the *exact previewed
    site*: the Themes Gallery already links `/signup?starter=<subdomain>` (→ clone that
    Starter), and the Pricing path carries `/signup?theme=<key>` — `SignupPage` now maps
    the key → the same demo subdomain via a `THEME_STARTERS` map (9 entries: `manhattan`
    →`rourke-sloane`, `sorrel`→`linden-lark`, …) and threads it as `starterId`. **Chose
    clone-the-Starter over the originally-planned `provisionSite({templateSlug})`:** the
    9 theme demos are complete, correctly-templated preview sites (24–37 sections), so
    cloning gives the customer precisely what they previewed (renamed to their brand),
    not the generic vertical fixture on that template. Server side needed no change —
    `onboardCustomer({starterId})` → `getApprovedStarter` (reads `sites.metadata.is_starter`,
    already flagged on the 9 demos + 4 fixtures) → `cloneSite`. Harmless when neither
    param is present (falls back to vertical default). Not blocked on `stemfra_client`.

## P8 — Pricing V3 + feature backlog (NEW, 2026-06-30)
_Full design history + tier maps + research: `stemfra_pricing_system/TIER_VERSIONS.md`
(co-located with the Squarespace/Mindbody/Wodify competitor analysis). V3 = "generous
core + growth tiers." When adopted, mirror into `crm_settings.billing_plans`._

31. ✅ **RESOLVED P6.1 (Pro was thin).** Decision (Peter): **drop the AI Voice
    Receptionist from the CLIENT tiers** — SMBs don't need it, Front Desk (chat)
    covers them. Pro re-anchors on SMS reminders + 2-way texting + marketing + custom
    email + phone support. **Stemfra keeps its own voice agent** for internal use
    (concierge/front desk), per the AI-agents roadmap — just not sold to clients.
32. **Un-gate Table 2 (built-but-gated) the moment Stripe Connect is live** — card
    payments at booking, memberships/packs/drop-ins, member accounts, refund/pause/
    cancel tools, accelerated payouts. All built + verified (System B); un-gate = a
    CRM `billing_plans` status flip, no deploy. **Biggest "tiers feel full" win.**
33. ✅ **"Start for free" CTA is intentional, KEEP it** (decided 2026-06-30). It's the
    point of building **Stacy** — AI-guided self-serve onboarding ("free to experience,
    pay to publish") means fewer support staff. Squarespace's model; Squarespace (a
    website builder) is our real category — Mindbody/Wodify (high-touch booking
    software) aren't, so we don't copy their demo-first funnel. The earlier
    "demo/discovery-call first" stance is retired (offer doc + TIER_VERSIONS.md updated).
    Last-mile ✅ done (P7.30): SignupPage consumes the `theme`/`starter` param so
    onboarding clones the chosen theme's previewed site.
34. **Custom business email** — ship **Cloudflare Email Routing (free forwarding)** as
    the Pro perk ($0, reuses our DNS); Google Workspace (~$8/user retail, ~$3 reseller)
    as a later paid add-on. (Research in TIER_VERSIONS.md §A.)
35. **Unified inbox + 2-way texting (owner↔client)** — Pro-only; reuses CRM Twilio
    rails. Needs per-tenant A2P 10DLC registration templated into onboarding first;
    pair with SMS reminders. Not a launch blocker. (Research §B.)
36. **Table-3 nice-to-haves added to backlog** (priority order): pageview/traffic
    analytics (ad-spend) · at-risk/churn alerts · lead conversion board (pipeline) ·
    advanced/custom report builder. Lower: POS (Stripe Terminal) · Mailchimp/Zapier ·
    MCP/API access · announcement bar/promo pop-up · media library.
    **Parked until client demand:** sell courses / on-demand content (Peter's call).
    **Excluded:** branded app · physical eCommerce · marketplace · deep fitness
    hardware · payroll · family groups · pick-a-spot.

---
_Conventions: additive schema only (regen types after); propose → ship in focused
batches → verify; keep this file current as items land._


## P9 — Wellness verticals + Marketing Mockups follow-ups (NEW, 2026-07-04)

Session log: `docs/WORK_2026-07-04.md`. Everything below is queued from the 2026-07-03/04 session (all work UNCOMMITTED as of writing — commit pass needed first).

**Marketing Mockups → production (the tool is feature-complete locally):**
- [ ] Commit the arc across `stemfra_server` / `stemfra-ops` / `stemfra_client` (+ platform changes)
- [ ] Server Docker image: enable Playwright captures in prod — the current `node:22-alpine` base is NOT a supported Playwright platform (musl); move the runtime stage to a debian-based image (or `mcr.microsoft.com/playwright`) + `npx playwright install --with-deps chromium`, then drop the `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` guard from the Dockerfile. (`sharp` works on alpine; `MOCKUP_RENDER_URL` defaults to crm.stemfra.com in prod.)
- [ ] Flip `stemfra-ops/.env` `VITE_STEMFRA_SERVER_URL` back to prod; deploy CRM + marketing site

**Massage vertical (Escape theme v1 + structure pass done; seed = calm-roots-massage):**
- [ ] Peter's real-browser walk of :5181 (the completeness-gate visual half)
- [ ] Remaining Escape 🟡 fidelity: `facility_highlights:process-steps` · `service_menu:diamond-split` · `single-rate-panel` pricing · per-section `backgrounds` painting (dark/white bands — benefits every theme)
- [ ] Confirm massage/spa pricing placeholders (massage $1200/79 · spa $1500/99 — set by Claude, unconfirmed)
- [x] ~~Create the Cloudflare Pages project `stemfra-massage`~~ DONE — verified 2026-07-10: all 7 Pages projects (4 templates + CMS + massage + spa) exist, env vars complete, latest deploys green (repo pushed 2026-07-07).
- [ ] Teach the n8n lead-gen workflow the 'massage' vertical (3-place sync: CRM + server done)
- [ ] Marketing site wiring for massage (themes.js gallery entry, pricing page, demo site + Starter flag) — after the theme walk
- [ ] **Spa vertical**: clone from the COMPLETED massage (app copy on :5182 + seed via onboardCustomer + reactivate the parked `spa`/`spa-classic` DB rows re-sourced from massage)

---

## 📌 Status refresh (2026-07-10)

**Peter's dispositions on the open list:**
- Porkbun: verification DONE — only **funding the prepaid balance** remains.
- Wellness pricing: **uniform 3-tier pricing for ALL verticals** (no per-vertical prices). ✅ DB `verticals` rows aligned 2026-07-10 (`build_price_cents=100000`, `monthly_price_cents=9900` fleet-wide — these feed publishController + admin Stripe checkout, so the legacy $750/49-style numbers would have billed wrong). Deeper follow-up: the publish flow should eventually read the chosen TIER's price from `crm_settings.billing_plans`, not the vertical row.
- ✅ Yoga un-flagged (theme card + drawer "Soon" badge removed; Wren Yoga card live w/ hero-fold).
- ✅ Annual discount threaded: Pricing.jsx now uses catalog `annual_discount_months` (verticals.js constant = fallback only).
- ~~Template Pages env~~ VERIFIED 2026-07-10 via CF API: all 7 projects carry VITE_SUPABASE_URL/ANON_KEY/SERVER_URL + NODE_VERSION — nothing to rectify.
- CRM `.env` stays on the dev endpoint during development (flip at deploy time only).

**P9 corrections (stale):** spa vertical DONE (3 themes: Ellaris default · Lumora · Respira); massage walk + marketing wiring DONE (themes.js/pricing/products/Starters all carry massage+spa); what remains from P9 = commit pass · Docker/Playwright base · CF Pages projects for massage+spa · n8n massage(+spa) vertical · Escape 🟡 fidelity variants.

## P10 — New planned arcs (2026-07-10, PLANNING AGREED — build order TBD with Peter)
_Peter's cases #1–#11 (#8 beta-test done; #10 = the standing pending list above). **Full Q&A + agreed plans: `docs/P10_CASES.md`.** Build order agreed: 40 → 38 → 39 → 43+45 → 37 → 42-R1 → 41._

37. **CMS ease-of-use program** (case 1) — honest score ~6.5/10 today. Plan: (a) plain-language + guidance polish pass in-product; (b) click-to-edit live preview (the parked Phase B postMessage bridge); (c) 5–10 short task videos + docs AFTER the UI stabilizes; (d) NO Squarespace-style version branding — use the existing notification system (`broadcast_announcement`) as an in-app "What's new" channel + a changelog page; (e) usability sessions with 2–3 founding-cohort owners.
38. **CMS Theme studio + plans display** (case 2) — upgrade Settings→Style themes grid to the marketing-gallery register (hero-fold mockups via `GET /api/marketing/mockups`, brand/city, Preview → demo, Switch stays); tier cards in Account→Billing "Change plan" rendered from `/api/plans` (same catalog as marketing).
39. **Promo banners/popups catalog** (case 3) — `site_promotions` schema + ~10 token-driven banner archetypes (overlay popups + inline bands + top bar) + template `PromotionHost` (frequency-capped, a11y) + CMS Promotions editor with visual style picker. v1 display-only; v2 ties into promo codes when payments land.
40. **Staff mode in the CMS** (case 4) — NOT a separate admin CMS: @stemfra.com Google auth recognized in the existing CMS → all-sites picker (staff RLS already grants data access) → "Editing as Stemfra staff" banner + `site_activity` audit on every write + server-side staff bypass of `verifySiteOwnership` (logged). CRM keeps ops; CMS becomes the shared content-editing surface.
41. **CMS mobile** (case 5) — ladder: (1) responsive polish + PWA (installable, web-push via the existing notification system) NOW-ish; (2) store wrapper (Capacitor) when store presence matters; (3) native = parked until client demand.
42. **Website "Remix" AI theme composer** (case 6) — **R1 + R3 BUILT 2026-09-11 (platform 57c44c4, local)**: `packages/site-data/src/variantRegistry.ts` = the registry for hero (12), reviews (9) and services (10) variants with register / required + preferred content / header chrome / origin theme; `eligibleVariants()` applies the rules (a dark variant is not offered on a light theme, a variant whose content keys are missing is not offered, a light hero forces a solid header). CMS Settings → Style → **Section styles** (was Hero & navbar) offers the eligible variants per surface with a line sketch, a note ("works best with a background video") and "From <theme>", saves per SITE to `metadata.presentation.<surface>` (never the template; every app already resolves it via `resolvePresentation`), "n not offered" reveals the rest greyed with the reason. Verified on Remix Barbers: hero → Centered headline (Manhattan), services → Photo menu, reviews → Review cards, all rendering on the dev server. Peter's review (same day, platform 221962f + 91ca5ff): the card is now Billing-style TABS in page order (Navbar, Hero, Services, Team, Reviews, Footer; a dot marks an unsaved tab; one Save), and the registry gained `team_grid` (9) and `footer` (9). Count for Remix Barbers on Classic NYC (multiplication principle, one pick per factor): navbar 2 × hero 10 × services 10 × team 8 × reviews 8 × footer 9 = **115,200 layouts**; × 17 palette choices per seed = 1,958,400. **NEXT (Peter's ask): "Auto" Remix** = deal three complete bundles (all six surfaces + a Remix palette seeded from the logo) sampled from the eligible sets with a coherence deny-list (no two carousels stacked, no double giant wordmark), family-weighted toward the theme's own variants; Shuffle deals three more; Apply is explicit. **R2 Auto remix BUILT 2026-09-11 (platform d10714b, local)**: `site-data/autoRemix.ts` deals three complete bundles (hero, services, team, reviews, footer + a Remix palette from the accent) by seeded weighted sampling over the eligible sets (theme's own variant ×3, same origin family ×2, other ×1, soft-note ×0.5), a coherence deny-list (stacked carousels, carousel over marquee, double giant wordmarks), never the all-defaults bundle; `remixSpace()` reports the size. CMS: the "Auto remix" strip at the top of Section styles ("Deal three looks" / Shuffle, bundle cards with palette swatch + AA badge, "Apply this look" = one save of presentation ×5 + colours). Verified on Remix Barbers: 57,600 sampled layouts (the five surfaces; navbar is not dealt), Look 2 applied (Centered headline · Photo menu · Portrait grid · Review cards · Dark columns · Warm neutrals) and rendering on the dev server. **CRM "Remix space" page (stemfra-ops 4258b2f, local; server 86f4fc7 exposes `archetype_variants` on the admin templates list)** = the truth table per theme: navbar + five surfaces, registered / eligible on the theme's register / baseline (nothing beyond services, team, reviews, a hero photo) / gated on content / off register / the theme's default, and the products (layouts, and × 17 palettes). Reads `src/lib/variantRegistry.ts`, a COPY of the platform registry (re-copy when a style is added; header says how). Still R1-lite: sketches, not captured previews. Original plan: R1 machine-readable **variant registry** (archetype→variants→content keys) + per-variant preview captures (extend the mockup pipeline) + a visual component browser; R2 remix engine (LLM picks arrangement/variants/palette/fonts within compatibility rules → writes an inactive `templates` row → theme-audit validates → human approves); R3 owner-facing per-section "swap the look" picker. Internal catalog-velocity tool FIRST (distinctness standard still gates what ships).
43. **Domain → Cloudflare zone automation** (case 7) — today: registered + DNS at Porkbun, CF only validates the Pages custom domain. Target: keep registration at Porkbun, **move DNS to a CF zone** at purchase (create zone via CF API → set nameservers via Porkbun API) for proxy/SSL/WAF + programmatic DNS (synergy w/ email routing #34 + Workspace #45). Full registrar transfer to CF = optional ≥60 days post-registration (ICANN lock), not v1. BYO-domain users keep ownership (connect-only, as today).
44. **Email template suite + auth security** (case 9) — unified branded base template (header/footer) across ALL transactional mail (billing request/receipt, booking, welcome); customize Supabase Auth templates (OTP/magic-link) + wire custom SMTP for brand consistency; **new-device/location login alerts** (capture login events → email w/ "this was me / secure account"); 2FA TOTP already live in CMS → add recovery codes + staff enforcement; email-approved-login gate = later phase.
45. **Customer professional email** (case 11) — ladder: (1) **Cloudflare Email Routing forwarding as the Pro perk** ($0 COGS, needs #43's CF-zone DNS); (2) Google Workspace referral/assisted setup (client pays Google); (3) full Workspace resale via a distributor (Pax8/Sherweb, ~$3–4 wholesale vs $7–8 retail) only at volume — needs reseller onboarding, provisioning via Reseller API, billing + support burden.

## P11 — Voice agent maturation (NEW, 2026-07-21 — baseline scored, phased plan agreed)

_Benchmarked "Mark" against the Retell (customer-support) and Thoughtly (outbound-sales)
2026 evaluations. **Baseline: ✓ 7 · ◐ 15 · ✗ 16** — strong conversational core (barge-in,
grounded answers, 60-msg memory + caller-ID after the 2026-07-21 fixes), thin around the
call (actions, escalation, dispositions, multichannel, analytics, compliance).
**Full scorecard + phased roadmap: `docs/VOICE_AGENT.md`** — re-score there as we improve._

46. ✅ **Phase 0 — correctness** (DONE 2026-07-21): support-intent routing (support calls currently file as
    SALES LEADS — wrong queue), transcript persistence, structured dispositions v1,
    outbound updates the source lead (no dup inserts).
47. ✅ **Phase 1 — sales quick wins** (DONE 2026-07-21, verified): sub-60s reply-triggered calling (5–10× stat), live
    transfer + staff summary, post-call recap email/SMS (new chocolate templates),
    voicemail detection/drop, qualification schema.
48. ✅ **Phase 2 — support abilities** (DONE 2026-07-22): caller-ID→account identification, account context via
    Stacy's `buildSiteContext`, safe action tools (password-reset email, support ticket,
    callback) via the Front Desk server-orchestrated tool-loop pattern.
49. ~~Phase 3 — tenant voice~~ **RETIRED 2026-07-27 by the P13 pivot** (see the
    "Confirmed 2026-07-27" block below: tenant Voice dropped on cost; Front Desk chat
    covers tenants; Stemfra keeps its own "Mark"). The retirement was announced there
    but this line was never struck — a 2026-08-04 audit found three places still
    treating Phase 3 as live (here, Wave 3, the P12 arc header). Struck now.
50. **Phase 4 — scale**: CRM call analytics (measure the 40–70% resolution benchmark),
    DNC/TCPA machinery before colder outbound, premium voice, load testing.

## P12 — Payments pivot + acquisition funnel (NEW, 2026-07-22 — AGREED, supersedes P11 ordering)

_Peter + Claude planning session (Fable). **Full agreed plan: `docs/P12_PLAN.md`**;
A2P answers: `docs/A2P_REGISTRATION.md`. Key decisions: tenant payments pivot to
DIRECT per-site Stripe keys (restricted keys, encrypted; Connect code dormant, not
deleted) — unblocks deposits-at-booking NOW, independent of Stemfra's own Stripe
verification; the Kai-Stone-style funnel (VSL → 45-min setup call on OUR OWN
booking system → pay-and-publish); ONE SMS program only (Stemfra → owners+staff
with the customer's contact details — NO tenant→end-customer SMS); Mindbody hard
line ~~with an external-booking-URL escape hatch~~ (escape hatch REMOVED 2026-07-29
— native booking only, see the top block). **Resequencing note is historical: Voice
Phase 3 was RETIRED 2026-07-27 (P13), so "Phase 3 scope grows to include
browser-voice" no longer applies. VSL production is still deliberately LAST.**_

51. **Wave 1** — payments pivot build (`site_payment_credentials` + AES-256-GCM,
    `getStripeForSite`, redirect-verify Checkout, ~~per-tenant webhooks
    `/api/stripe/webhook/:siteId`~~ (deferred — never built; the flat webhook + sweeper
    covers it, see the deploy-gaps block), CMS/onboarding key capture,
    ~~external-booking-URL option~~ (built then REMOVED 2026-07-29 — native only))
    · Mark Phase 1.5 (call-reason modal + activity-feed-enriched context)
    · Stacy "Prefer to talk?" tier A · **Peter: submit A2P registration** (lead time).
52. **Wave 2** — setup-call booking on the internal Stemfra site (dogfood; reminder
    sweeper free) · pay-and-publish automation (billing_charges paid + checklist →
    auto-publish → domain step) · owner+staff SMS alerts (post-A2P-approval) ·
    **Case 2 tenant email redesign** (pre-existing) · switcher messaging (A13 upgrade).
53. **Wave 3** — tenant blog completeness (massage+spa finish, per-theme audit,
    rollout decision) · ~~Voice Phase 3 (tenant voice + browser-voice)~~ ❌ RETIRED (Peter, final 2026-08-04: no tenant voice agent, ever — Mark stays Stemfra-internal only; struck everywhere to prevent the mistake recurring)
    · Square adapter on first real demand (GoCardless trigger noted).
54. **Wave 4** — **Voice Phase 4** (analytics, DNC/TCPA, premium voice — scoped to
    Stemfra's OWN agent "Mark" only; the tenant half died with Phase 3).
55. **Last** — VSL production (Peter's voice over a demo-site screen-share; script
    `docs/SALES_SCRIPT_TEMPLATES.md` §1; Cloudinary hosting, `{{vsl_link}}` template
    variable, click tracking, Mark call-flow mention).

## P13 — Commission model + domain policy + public Docs (NEW, 2026-07-27)

_Strategy session (Peter + Claude). **Authoritative plan doc: `docs/COMMISSION_MODEL.md`**
(incl. a full prior-pending-tasks reconciliation with status marks). Full narrative +
diagrams also on the **Business Model page** in `stemfra_business` (`/business-model` →
Marketplace, Unit economics, Airwallex email). Decisions below are AGREED; the
non-external-dependency items can start now._

**Commission model — REPLACES the subscription model (not a co-model):**
- The subscription offer ($1k build + $/mo) is **retired**. The business model is
  **free site + 5% commission on ALL sales (unified)** — online bookings + at-visit
  sales the tenant marks "collected" in the CMS (Reports v2, already built) = our source
  of truth for total GMV. We are **pre-launch (no live paying subscribers)**, so there is
  no revenue to bridge — the first tenants onboard directly onto commission.
- Commission is collected by a **monthly metered INVOICE** paid to Stemfra's **Airwallex
  Global Account** (US bank; details in `crm_settings.commission_bank`) + tenant **receipt
  upload** (source-of-funds). **No setup fee, no minimum, no dormancy fee.** Processing fee
  shown SEPARATELY (Etsy-style). (UPDATED 2026-07-27 after the Airwallex call — see below.)
- **Marketplace / auto-split is SHELVED** — Harry Raj confirmed it is white-labelling
  Airwallex at **~$20–25k/mo** for high-volume platforms; not viable now. Stripe Connect /
  Adyen carry the same platform cost. **The drafted Platforms email is retired.**
- **Card processing + AUTO-DEBIT invoices come later** — our card KYB was declined only for
  **no business activity yet**; it unlocks as we invoice + collect. Then collection automates.
- **Offline/cash is STILL commissioned** (unified basis) via the CMS "Mark as collected"
  flow — no POS hardware from us. Since there is no split, **one monthly invoice covers ALL
  income** (online + offline); the earlier online/offline collection split is moot.
- **Revenue turns on when we start invoicing** (buildable NOW — no external gate). Pilot
  tenants run free-to-experience until invoicing is wired; that is intentional, not a gap.
- **Existing billing infra is REPURPOSED, not deleted:** the `billing_charges` ledger
  + `lib/billing/` provider layer serve commission billing; the subscription-specific
  OFFER (pricing tiers, "pick a plan") is what goes away. Downstream shifts required:
  marketing pricing page, `crm_settings.billing_plans`, onboarding plan-selection,
  CMS billing section, and tier-based feature gating all move from subscription to
  commission framing.

**Confirmed 2026-07-27:**
- **Option A — truly FLAT: no tiers.** Every tenant gets every feature; we monetize
  purely on booking volume via the uniform 5%. The Essential/Growth/Pro tier system
  (P8) is **retired** — feature gating by tier goes away (features become universally
  on; a few may become optional paid add-ons later, but NOT tiered subscriptions).
- **Tenant Voice assistant RETIRED** (cost). Front Desk **chat** (Agent 2) covers
  tenants. **Stemfra keeps its OWN voice agent "Mark"** (Agent 3) for internal
  lead-gen / concierge / support. → **P11 item 49 (Phase 3 tenant voice) is dropped**;
  P12 Wave 3's "Voice Phase 3" line is removed. (Consistent with P8 item 31, now final.)
- **Subscription model PRESERVED IN DOCUMENTATION ONLY** — retired from the live offer,
  but keep the design/infra notes intact in case we revive a subscription/hybrid option
  later (the `billing_charges` + provider layer already supports it).
- Etsy lessons applied: separate platform-fee vs processing-fee lines; attribution
  (charge more / only on customers WE bring — Offsite-Ads model) as a later refinement.

**Domain = the customer's responsibility → Stemfra fronts $0** (this is what makes
"no setup fee" financially safe; a dormant tenant then costs ~$0 marginal):
- **Free `*.stemfra.com` subdomain** (default) · **BYO connect-only** (just point
  DNS — no transfer, no 60-day rule) · **buy-through-us COLLECT-FIRST** (charge the
  client, then Porkbun — never front) · or self-serve at **Cloudflare Registrar
  (at-cost)** / Porkbun. Managed domains already auto-provision a CF zone (Case 7).
- **Connect vs transfer clarity** (from CF docs): a tenant only needs to POINT DNS
  to launch; a full registrar transfer to Cloudflare is OPTIONAL (at-cost renewals;
  60-day rule + EPP code + ~5 days). Shopify/Wix/Squarespace domains block NS changes
  → intermediate registrar first. Document both; default to connect-only.
- **Onboarding gains "Do you already have a domain?"** → No = subdomain + buy-later;
  Yes = capture + connect (offer transfer docs).
- **NO automatic dormancy sweep** (decided 2026-07-27). New businesses can take
  up to ~8 months to rank on Google; if dormant sites cost ~$0 we KEEP them. Instead,
  a **CRM Activity / Performance monitor** (observe-only): per-site activity metrics
  (bookings, visits, last-active) with month / date-range / "inactive > 1 year"
  filters and **manual** staff actions (pause, nudge, etc.). No `siteDeletionSweeper`
  auto-purge for dormancy. (The 90-day lifecycle from item 26 remains for
  owner/staff-INITIATED deletion only.)

New tasks:
56. **Public Docs / Help Center** — ✅ DONE 2026-07-29, pushed 2026-08-03 (see
    the top-status block for the file map + verification + the FAQ/STRIPE_ONBOARDING
    follow-up). Shipped as a structured-block help center at `stemfra.com/docs` on a
    WHITE canvas: 6 categories / **26** articles (Getting started · Domains · Payments &
    Stripe · Bookings · Billing & commission · Account; was 25 until the external-booking
    article was removed), each article with per-section sources, prerendered + in the
    sitemap, linked from the Footer + FAQ. Truth rules held (no tiers/SMS/auto-debit/voice).
    ⚠ 2026-08-04 audit correction: "Search + feedback widget intentionally skipped" is
    FALSE — `DocsSearch.jsx` shipped (wired into DocsHeader), and a full docs AI
    assistant shipped too (`DocsAssistantLauncher/Panel.jsx` + `docsAssistantStore.js`,
    mounted in DocsLayout) that no doc had recorded. Feedback widget alone is unshipped.
    Still ties into P10 case-1 task videos when those land.
57. **Domain policy build** — free-subdomain default + BYO connect + the onboarding
    "have a domain?" question + buy-through-us COLLECT-FIRST. Tiers 1+2 (subdomain +
    BYO) need no external approval — build now; collect-first buy waits on a card/
    payment provider.
58. **Commission engine — ✅ Batch 1 + Batch 2a COMPLETE (audited 2026-07-29).** Core meter
    shipped 2026-07-27; **monthly scheduler DONE 2026-07-28** (`lib/commissionScheduler.js`,
    env-gated OFF via `COMMISSION_SCHEDULER_ENABLED` — arm at launch, incl. deploy.yml);
    **Batch 2a manual invoicing loop DONE 2026-07-28** (invoice PDF w/ Airwallex bank block ·
    CMS `/billing/invoices` w/ per-field copy + receipt upload incl. PDF · CRM compliance
    packet: invoice PDF + bookings CSV + receipt badge → mark paid); **marketing/legal
    commission shift DONE 2026-07-29** (pricing page, /fees policy, Terms/Refund, signup
    acceptance persistence). **Remaining: Batch 2b auto-debit only** (blocked on Airwallex
    card KYB). Details: COMMISSION_MODEL.md §7b.
59. ✅ **CRM Activity / Performance monitor — DONE 2026-07-29** (see the WHERE WE STAND
    block, item 1, for the build record). Observe-only per-site metrics + window/date-range/
    inactive filters + manual nudge; no automatic dormancy purge. "Visits" metric is out of
    scope until site analytics ship (parked) — activity = bookings/leads/chats/audit events.
60. ✅ **Adjust-booking at delivery — DONE + verified (2026-07-28).** "Adjust service or
    price" control in `BookingDetailModal` (service swap / custom name / price / duration,
    with a reason) → **server endpoint** `PATCH /api/cms/bookings/:id/adjust`
    (`controllers/cms/bookingsController.js`, requireCmsAuth + verifySiteOwnership) updates
    `service_name_snapshot` + `amount_cents` + `duration_minutes` (recomputes `ends_at`) and
    **audits to `site_activity`** (`booking_adjusted`, before/after + reason + actor). Client
    call in `lib/bookingNotify.ts adjustBooking`. Server-side (not client) BECAUSE owners
    can't write `site_activity` via RLS. Verified end-to-end: $36→$60 update + audit row with
    the correct after-amount, note, and actor. **Matters for commission** (the meter reads
    `amount_cents`). _Remaining sub-item:_ ADD-a-service (a second `site_bookings` row sharing
    `group_id`, salon multi-service pattern) — deferred; swap + price override cover the
    common "facial → nails on arrival" case.

**Payment norms by vertical (Peter's study, 2026-07-28 — validates unified commission):**
- **Beauty & wellness (barber / salon / massage / spa):** pay **in-person at the POS AFTER
  service**, card often only held for no-show; **tip chosen at the terminal**. → mostly
  OFFLINE → commission relies on the CMS **"mark as collected"** flow; the final service/price
  is set at checkout (hence task 60). **Tips are NOT commissioned** (not service revenue).
- **Fitness (yoga / CrossFit):** **online / recurring BEFORE service** (memberships auto-billed,
  drop-ins/packs prepaid). → mostly ONLINE + memberships → captured automatically by the meter.
- Net: the **unified** commission basis (online + at-visit-collected + memberships + orders) is
  correct — beauty leans offline-marked-collected, fitness leans online/recurring.

## P14 — Memberships & pay-at-venue (NEW, 2026-08-05 — plan agreed, executor arc)

**Plan doc (the source of truth for this arc): [`MEMBERSHIPS_PAY_AT_VENUE_PLAN.md`](MEMBERSHIPS_PAY_AT_VENUE_PLAN.md).**
Decisions in COMMISSION_MODEL §2b (2026-08-05, Peter): online payments SUSPENDED
(pipeline dormant, kept for future deposits), no Stripe-level fees ever, 5% via
invoice only; memberships = sign-up online / chat → agreement + payment at the
venue → owner confirms in the CMS (the confirmation advances the period AND is
the commissionable event). Research basis: membership checkout was stranded on
un-migrated Connect (non-functional in prod), 1 of 6 templates had a purchase
surface, zero membership↔booking linkage, meter used an MRR estimate.
Phases: A signup+activation (server/CMS/crossfit) · B monthly Renewals
confirm-all + meter on collected cash · C Front Desk chat signup (n8n paste via
Peter) · D booking online-payment kill-switch + CMS quiet state + zero fees ·
E member lifecycle (portal v2 with renew-by/visits/payments, renewal reminder
sweeper T-7/T-0 + 14d grace, owner digest, yoga surface + member area).
Out of scope: credits/entitlement ledger, Stripe repairs, deposits, massage/spa
real-plan tiers, the Display-only UX rework (separate task). Executor: Opus 4.8
per ADVISOR_STRATEGY; commits only, NO push without Peter.

## P15 — Video/demos arc + CMS UI polish (NEW, 2026-08-07) — ✅ CLOSED 2026-09-07

**Closed (Peter confirmed 2026-09-07): the walkthroughs shipped NATIVELY as the Visual
Tour (`stemfra_platform/docs/GUIDED_TOURS.md`, 2026-08-08 to 08-18); Supademo is dropped
entirely. Item 1b (reconciliation engine) shipped 2026-08-11. Still open from this block,
tracked as ordinary follow-ups: phone validation (item 1), the CMS dashboard analytics
upgrade (item 2), the wildcard Worker deploy + Custom Hostnames (items 6a/6b). The YouTube
tutorial series is planned in `stemfra_platform/docs/CMS_TUTORIAL_VIDEOS.md`. Text below
kept for history.**

**Video/demos plan doc (historical): [`P15_VIDEO_DEMOS_PLAN.md`](P15_VIDEO_DEMOS_PLAN.md).**
Phase 0a (Stacy onboarding fixes + update_contact do-it-for-me) DONE + live-verified
2026-08-07; the CMS UI-polish pass shipped alongside it (form kit `components/form/`,
violet PrimaryButton standardization, refined Select dropdown + category creation,
CMS boot spinner, card active states, FAQ+legal onboarding steps).

**Pending (queued after the UI pass, agreed with Peter 2026-08-07):**
1. **Phone validation + Google address autocomplete slice** —
   ✅ **Address autocomplete DONE 2026-08-11** (verified live): Google Places
   `PlaceAutocompleteElement` on the Location editor's Street-address field
   (`stemfra_cms` `lib/googleMaps.ts` + `components/AddressAutocomplete.tsx`);
   project **stemfra-maps** + referrer-restricted key set up; `VITE_GOOGLE_MAPS_KEY`
   in CMS `.env.local`. ⚠ PROD: set that env var in the CMS Cloudflare Pages
   build env (see SESSION_HANDOFF). **STILL PENDING:** libphonenumber phone
   validation with the tenant's country (known from onboarding), resolved-number
   echo (PhoneField's showResolved pattern), parallel `phone_e164` in location_map
   content for tel: hrefs; and later a "Business location/country" setting under
   Billing that drives formatting app-wide (the Google-account model) — which
   should also feed the autocomplete's country bias (currently hardcoded 'us').
1b. **Billing Reconciliation Engine (AGREED 2026-08-11, spec written, NOT built)**
   — auto-match Airwallex deposits against unpaid `billing_charges` so invoices
   confirm themselves (webhook-primary `deposit.settled` + CRM-adjustable sweep
   backstop; T1 reference / T2 unique-amount auto-pay; ambiguous → CRM review
   queue; `deposit.reversed` un-pays; receipt upload hidden by default, CRM
   re-enables per invoice for disputes). Full spec + pinned Airwallex API facts:
   **[`RECONCILIATION.md`](RECONCILIATION.md)**. Build order R1 dry-run engine →
   R2 webhook (PETER: dashboard registration + secret) → R3 CRM → R4 CMS.
2. **Dashboard analytics upgrade** — Airwallex-inspired: a richer balance/revenue
   chart block on the CMS dashboard (inspiration screenshot 2026-08-07).
3. **Supademo 30-second pilot workflow** — then Phases A/B per the plan doc;
   Growth-trial window is ticking (14 days from ~2026-08-06).
5. **Live Porkbun purchase + connect test (Peter + Claude, 2026-08-07):** buy a
   real domain through the CMS Porkbun flow and walk the new 3-step connect
   card end to end against Cloudflare (first real registration; Porkbun
   account email/phone verification + funded balance are prerequisites).
6. **Domain scale infra — (a) wildcard Worker ✅ LIVE 2026-09-16 (built 2026-08-18; was awaiting deploy
   (Peter deferred the go-live on 2026-09-11 to start sales calls; still NOT live, no wildcard
   DNS, `TENANT_WILDCARD_ROUTING` unset; remix-barbers was attached the old way, stemfra-barbers
   holds 9 of 100 custom-domain slots); (b) Custom Hostnames still pending.** The `*.stemfra.com` tenant-router Worker
   lives at `stemfra_platform/workers/tenant-router/` (README = runbook + rollout +
   rollback). Verified locally against real Supabase + Pages origins (barbers →
   stemfra-barbers, spa → stemfra-spa, unknown → branded noindex 404, infra hosts
   pass through). Also shipped: `functions/robots.txt.ts` + `sitemap.xml.ts` honor
   `X-Forwarded-Host`; `attachSiteDomain` gained `TENANT_WILDCARD_ROUTING=true`
   (skips per-subdomain Pages attach); `stemfra_server/scripts/setup-tenant-wildcard.js`
   (dry-run-default: wildcard A record + no-worker bypass routes for the 6 non-tenant
   hosts api/cms/crm/www/bazeride/blazeride — dry-run verified). **Peter actions to go
   live (in order):** deploy platform → run the setup script `--apply` → `wrangler
   deploy` with a Workers-scoped token → verify → flip `TENANT_WILDCARD_ROUTING=true`
   in deploy.yml. Full architecture + triggers in item 4 below.
4. **Domain routing at scale (AGREED direction 2026-08-07; build BEFORE the
   self-serve funnel launches):** our BYO connect flow already implements the
   "Cloudflare for SaaS" pattern via Pages custom domains (owner keeps
   registrar + renewals, one CNAME, auto SSL; transfers permanently out of
   scope: CF Registrar inbound transfers are dashboard-only). BUT the limit is
   sharper than first noted: **Pages caps custom domains per project at
   100 (Free) / 250 (Pro) / 500 (Business+), and attachSiteDomain attaches
   EVERY site's {subdomain}.stemfra.com as a Pages custom domain — so the cap
   counts ALL sites per vertical, not just BYO tenants.** Verified against CF
   Pages limits docs 2026-08-07. The 1M-user architecture (Render provably
   runs the same stack: their wildcard flow sets _cf-custom-hostname records,
   i.e. resold Cloudflare for SaaS):
   (a) subdomains: ONE wildcard *.stemfra.com DNS record -> a Cloudflare
   WORKER that resolves host -> vertical -> serves that vertical's bundle;
   new site = DB row only, no per-site attach, unlimited subdomains;
   (b) custom domains: Cloudflare for SaaS Custom Hostnames on the
   stemfra.com zone (fallback origin = the Worker), API-automated, auto-SSL,
   ~$0.10/hostname/mo after 100 (paying tenants only, scales linearly);
   **✅ DONE 2026-09-16 (server 7478238 + follow-up; `lib/tenantHosts.js`,
   `lib/cloudflareCustomHostnames.js`, `scripts/setup-custom-hostnames.js`,
   Worker brand-host resolution; registered domains use a Worker route on their
   own zone instead). Cloudflare for SaaS ✅ Peter confirmed 2026-09-16; runbook
   run, `.click` domains migrated, Pages slots at zero. DOMAINS.md §7.**
   (c) incremental migration: keep Pages builds, front with the Worker, swap
   the attach calls Pages API -> Custom Hostnames API in attachSiteDomain +
   cms/domainController.
   Near-term (separate small slice): DomainSection redesign on Render's
   3-step model (Add domain -> Configure DNS w/ per-provider instructions ->
   Verify button; render.com/docs/custom-domains is the reference).

## P16 — Interactive onboarding + What's New + Support system — ✅ CLOSED 2026-09-01 (items 2+3 shipped; item 1 DROPPED by Peter)

_Added 2026-09-07: the onboarding that DID ship the same day is the 4-step **Setup
wizard** (`stemfra_cms/src/components/onboarding/SetupWizard.tsx`, mounted in
CmsLayout, dev override `?setupWizard=1`) which took the business / contact / hours /
headline steps out of Stacy's list; Stacy now shows 12 steps in 3 stages (see the
reconciliation block at the top)._

Context: the native CMS walkthrough (P15) shipped 2026-08-08 (10 spotlight steps,
Jessica voice @ 0.95, docs in P15_VIDEO_DEMOS_PLAN.md). Peter's goal: the setup
call must become optional/minimal; Stacy + interactive tours carry onboarding.

1. ❌ **Interactive "do-it" tour steps** — DROPPED (Peter, 2026-09-01): the
   existing "Take a quick tour" (Dashboard) + per-page "Take a tour" already
   serve the goal. Video strategy instead: several VSL videos uploaded to
   YouTube + dedicated YouTube-ad promo videos, created later (see the VSL
   item in LAUNCH_PLAN / P15).
2. **What's New channel** (absorbs the parked P10 case-1 "What's new" item):
   feature announcements via the existing broadcast_announcement rail + a
   What's New surface in the CMS; each entry can carry a "Show me" hook that
   launches a mini-tour of the new feature.
3. ✅ **Support system CORE SHIPPED 2026-08-09** (server 2881147 + platform e9a7cc8):
   support_requests table (service-role RLS) + /api/cms/support (create/list +
   call-config) + CMS /support page (category dropdown, ticket list, schedule-a-
   call). The dogfood proposal was validated LIVE: internal site 'stemfra-support'
   (5 call services = the categories, support team member, Mon-Fri 9-17 ET) takes
   REAL site_bookings through the public engine — a test call booked from the CMS
   confirmed end to end, then cancelled. CRM ticket view + staff book-on-behalf SHIPPED
   2026-08-09 (server ab06700 + ops 35489ae: CRM /support page — cross-site
   ticket table w/ status triage, Book-call modal prefilled from the ticket,
   real booking verified + cancelled). Concierge booking hook SHIPPED 2026-08-09
   (server 145cdde + client 5c938dbb: 'Consultation call' sales service on the
   support site, public /api/concierge/call-config, widget inline scheduler via
   a local starter + agent cta 'book_call'; ⚠ PETER PASTE: the updated
   n8n-workflows/concierge-build-prompt.js into the Concierge Build Prompt node
   so the AGENT can offer booking — the widget starter works without it).
   REMAINING:
   ticket ack email to the owner; support-calendar staffing (who answers).
   ─ Original design: CMS Support surface
   with category dropdown (General / Domain / Email / Payments / Accounts) →
   ticket + email + CRM visibility; optional "schedule a call" per category.
   Proposal to validate: DOGFOOD our own booking engine — a Stemfra-internal
   site whose services are the call types and whose team is support staff, so
   owner-side CMS, marketing Concierge, AND CRM staff all book through the
   same site_bookings rails (CRM books on behalf of a client who stalled).
4. ✅ **Marketing booking page CONSOLIDATED onto the support engine 2026-08-09**
   (client 2a59c471): /book-a-call keeps its hero + two-step calendar design but
   books the sales Consultation call through the public /api/site-bookings flow
   (coordinates via /api/concierge/call-config) — one support calendar, Meet +
   host free/busy, visitor-timezone slots + picker, duration from config (30
   min). Business name/vertical/notes ride in customer_notes → Meet event
   description. ⚠ RETIRE /api/setup-call server-side once this deploys clean
   (client no longer calls it).
5. ✅ **Concierge widget rebuilt on the Front Desk architecture 2026-08-09**
   (client a68cef5e, all three phases in one arc per Peter): docked booking
   drawer (month grid greyed by real availability — closes the Calendly
   month-hints gap for Stemfra calls — visitor-tz slots + zone picker, details
   step, in-thread receipt), options drawer for 5+ quick replies, Chat options
   menu (Start over) + minimize chevron, seeded AI-identity disclosure,
   Claude-style rewind, auto-grow composer (touch-aware Enter, IME guard),
   emoji picker (code-split), linkified paths, privacy footer link. Shared tz
   helpers in stemfra_client src/app/lib/timezone.js.
6. **Tour types settled 2026-08-09 (platform 21200c7)**: main walkthrough is
   fully PASSIVE (Next auto-navigates; no do-it steps); do-it mechanics live
   only in Stacy checklist mini-tours (guided editing = mini-tour + Stacy
   drafting). Mini-tour instruction label restyled (hand-pointer icon, default
   cursor) so it cannot be read as a button.

## P17 — Platform subscriptions & expense receipts (CRM + n8n) (queued 2026-08-11; **v1 BUILT IN THE CRM 2026-08-31**)

**STATUS 2026-08-31: v1 shipped (in-CRM, no n8n — supersedes item 2's
planned n8n harvester, per the P22 note).** `lib/expenseScan.js` (read-only
IMAP over admin@stemfra.com [existing app password] + peter.space.io@gmail.com
[app password reused from the leadgen build; env EXPENSE_MB2_*]; 120-day
window, subject heuristics -> full parse of candidates only; amount/vendor
best-effort; PDF/image attachments archived to Cloudinary
`stemfra_assets/expense-receipts` — chosen over Google Drive so the CRM UI
owns the copies; a periodic Drive export for the accountant can come later)
-> `expense_receipts` table (message-id dedupe, staff RLS) -> CRM page
**Finance -> Expense Receipts** (`/expense-receipts`): include/EXCLUDE
toggle (personal spend never counts — Peter's Figma/Atlassian case),
editable renewal dates driving a "renewing within 7 days" alert banner,
month total, receipt links, on-demand Scan. Live-verified: 85 receipts
harvested (43 admin@ + 42 peter.space.io), Figma excluded, Anthropic PDF
archived. NEXT: periodic auto-scan (interval sweeper), email reminders for
due-soon renewals, push into `expenses` for the Compliance books, vendor
grouping/registry view (item 1 below).
**v1.1 same day (Peter's review):** N mailboxes via EXPENSE_MB2..MB9 env
pairs (⚠ PETER ACTION: create an app password for peter.okeme@gmail.com
— it holds the Northwest Registered Agent incorporation invoice — and
hand it over for EXPENSE_MB3_*); failure/decline notices SKIPPED at scan
entirely (never shown: not submittable for tax anyway); same-vendor +
same-amount + same-day twins auto-excluded at scan ("duplicate?" chip);
receipts stored as ORIGINAL PDFs, full quality, all pages (the earlier
page-1 JPG conversion is dropped; ⚠ PETER ACTION: Cloudinary console →
Settings → Security → check "Allow delivery of PDF and ZIP files", else
Open links 401; the restriction also lifts on any paid Cloudinary plan);
header All checkbox (bulk include/exclude) + search +
date range + sortable columns + pagination (tablekit) + Export menu
(xlsx/CSV, included-only, duplicate twins by vendor+amount+day dropped
and chip-flagged in the table).
**v2 idea, AI classification layer (Peter, 2026-08-31):** run each
candidate email through one cheap LLM pass at scan time to (a) verdict
receipt vs failure vs marketing noise (replaces the regex), (b) category
(software / infrastructure / telecom / fees / professional services),
(c) business-vs-personal guess with confidence (auto-untick personal
vendors like Figma), (d) vendor normalization ("Google Payments" and
"The Google Workspace Team" are one vendor), (e) renewal cadence
(monthly/yearly) for a real renews_on instead of the +1 month guess.
Back-office AI = OpenAI per the 2026-06-26 decision; category column +
export follow.
**v1.2 additions (2026-08-31): manual entry + receipt upload.** "Add
expense" (account='manual') + per-row receipt attach/replace (PDF/image,
Cloudinary originals) + delete for manual rows only. Covers dashboard-only
invoices (Northwest Registered Agent bills the card as "Corporate Filings
LLC"; the invoice never arrives by email). DECISION: the peter.okeme@
gmail.com app password (EXPENSE_MB3) is SKIPPED for now, manual entry
covers its only subscription; revisit if more billing lands there.
**Airwallex card feed (recorded, not built): the P17 v2 direction.** Most
subscriptions now charge the AWX debit card, so the authoritative expense
LEDGER should be the Airwallex issuing/transactions API (catches every
charge, even without an email receipt), with the email scan ATTACHING
receipts to matching transactions (vendor+amount+day, the dup-detection
matcher) and manual entry covering other cards + dashboard invoices. A
mini recon engine for spend, mirroring lib/reconEngine.js for deposits.
Combination beats either source alone: card feed = completeness, email =
documentation, manual = the tail.
**Related idea recorded (Peter): Gmail-style MULTI-ACCOUNT sign-in**
(switch between logged-in accounts / add another, the Google account
menu pattern) for the Stemfra AI dashboard and the Lead-Gen CRM — an
account-model feature for their auth layer; flag to the stemfra_ai
session for their side.

Not previously in the roadmap (confirmed 2026-08-11 — this is a genuinely new
item, not a rediscovery of an existing one). Goal: give Stemfra staff a single
place to see every recurring third-party bill the platform itself pays, with
the receipts automatically collected as accounting evidence.

1. **CRM subscriptions registry (stemfra-ops)** — a new page listing every
   third-party integration/subscription Stemfra pays for to run the platform
   (Twilio, Cloudinary, ElevenLabs, Airwallex, Hostinger, Supabase, OpenAI,
   Porkbun, Resend, Google Workspace, etc.): vendor, plan/tier, monthly cost,
   billing cadence, renewal date, and the receipt(s) matched to it. A manual
   "Add subscription" button covers anything not yet auto-discovered. This is
   platform OPEX bookkeeping — distinct from `subscriptions`/`site_subscriptions`
   (client-facing billing, System A/B) and from `expenses` (already used by the
   Compliance Engine's books view) — likely backed by its own table rather than
   overloading either.
2. **n8n AI receipt-harvester workflow** — fetches receipts from the three
   Gmail accounts `peter.space.io@gmail.com`, `support@stemfra.com`,
   `peter@stemfra.com`, auto-matches each receipt to a subscription row (vendor
   name + amount + cadence heuristics), and lands unmatched or ambiguous
   receipts in a **review queue** modeled on the Lead-Gen `needs_review` flow
   (see [[leadgen_module_architecture]]) rather than auto-filing them blind.
   Each receipt gets a **"not a Stemfra expense — exclude"** toggle so a
   personal purchase in the same inbox never gets counted as platform OPEX.
   Dedupe by Gmail message-id so re-runs never double-count a receipt.
3. **Google Drive archive** — matched (and confirmed) receipts are copied into
   a Drive folder on the `support@stemfra.com` account, for accounting
   evidence of business expenses (feeds the same P&L instinct as the
   Compliance Engine's books view, but for what Stemfra spends, not what it
   earns).

Per the standing rule, n8n changes are drafted as workflow/node code and
handed to Peter to paste into n8n directly (state checked via Peter or the
n8n Executions tab) — never curl the webhook to test it live. This item is
documentation only; nothing has been built yet.

## P18 — Stacy image upload → placement (POST-LAUNCH, agreed 2026-08-20)

Peter's ask: a paperclip in Stacy's composer so tenants upload images IN the chat,
and Stacy places them in the right slot from the conversation ("use this as my
hero image"). Design agreed in review (2026-08-20); build AFTER the launch.

1. **S3a — paperclip upload**: composer attach → existing `site-uploads` endpoint →
   the site's Media library (same Cloudinary folder); the upload renders as a
   thumbnail message in the thread.
2. **S3b — `set_image` action (focused field)**: new Stacy action
   `{type:'set_image', target, assetId}`; easiest first target = the focused image
   field (the `stacyTarget` mechanism that powers "Use in Headline"). Confirm card
   (preview + target + Apply), like the update_contact card — never silent.
3. **S3c — conversational targeting**: "put this on the About page" → target from
   the CMS map (hero | service:<id> | team:<id> | gallery | logo | about); same
   confirm card. Enforce per-slot specs (hero ≥1600px wide, logo PNG/SVG) and log
   `site_activity`.
4. **S3d — bulk**: "here are 6 gallery photos" → multi-upload → gallery reorder card.

## P19 — Multi-site (second business) gaps (agreed 2026-08-20, Peter: all important) — ✅ ALL FOUR DONE 2026-09-01

Found while walking "+ New site" during the final E2E test. Each site already has its
own `companies` row, so two businesses under one owner ARE modeled; these close the rest:

1. ✅ **Per-business billing details.** (2026-09-01: `companies.billing_profile` jsonb + backfill migration `p19_company_billing_profile` [18/20 companies]; `lib/billingProfile.js` `resolveBillingIdentity` [company-over-contact per-field merge] + `saveCompanyBillingProfile` [contact prefill]; consumers switched: cms billingController [GET returns `billingIdentity`, PATCH /contact with `siteId` writes the company profile, invoice PDF bill-to], admin invoice, billingEmails attachment, siteCompleteness billing gate; CMS BillingPage details tab edits per business + LocationSectionEditor "use my billing address" reads the identity. Airwallex payer/awx_customer_id deliberately stays contact-level.) Today `contacts.billing_profile` = ONE billing
   name/address per LOGIN, shared by every site; a barbershop + a CrossFit club need
   distinct invoice identities. Move/duplicate the billing profile to the COMPANY level
   (prefill from the owner's existing details; editable per site at Account → Billing →
   Billing details); invoices/commission statements + the publish gate read the site's
   company profile. Touches: billingController (contact → company), invoicePdf,
   BillingPage details tab, siteCompleteness `billing_details`, CRM billing views.
2. ✅ **Fees-policy acceptance for site #2.** (2026-09-01: `stampNewSite` in cms sitesController stamps `metadata.onboarding.fees_policy` [onboardSite shape] + a `legal_acceptances` fees row on createSite/cloneOwnSite when the modal's confirm line is ticked; NewSiteModal + CloneSiteModal gained the required "same terms: free website, 5% commission" checkbox. Stacy's clone card sends no acceptance so nothing is fabricated.) Signup stamps `metadata.onboarding.fees_policy`;
   `POST /api/cms/sites` (+ /clone) never does — the second business has no recorded 5%
   acceptance. Add a confirm line to NewSiteModal ("Free website + 5% commission, same
   as your other sites") and stamp server-side (same shape as onboardSite).
3. ✅ **`is_test` inheritance.** (2026-09-01: same `stampNewSite` — flags when `isTestEmail(owner email)` OR every existing sibling site is already test; best-effort, never fails the provision.) A new/cloned site by a TEST owner is not flagged
   `is_test` (flag comes from the signup email only) → escapes Clean up test data +
   pollutes KPIs. In createSite/cloneSiteEndpoint: flag when `isTestEmail(owner.email)`
   or when all the owner's existing sites are test.
4. ✅ **Theme selection at creation.** (2026-09-01: NewSiteModal theme cards [per-vertical active templates, color swatches, default preselected, resets on vertical change] → `templateSlug` through `POST /api/cms/sites` → provisionSite's existing `templateSlug` param; cross-vertical slugs rejected by resolveTemplate.) NewSiteModal offers vertical only; owner lands on
   the default theme and must find Website → Style → Themes. Add a theme step (the
   vertical's template cards, like the Claim funnel's Starter pick) to the modal.

## P20 — Security posture / compliance readiness (queued 2026-08-20)

Peter's Q: do we need SOC 2 / ISO 27001? Answer: those are ORG certifications
(auditor, 6–12 months, $20k+), not features — and our infra already carries them
(Supabase SOC 2 Type II · Cloudflare ISO 27001/SOC 2 · Stripe PCI DSS L1 ·
Twilio/Google). For local-business tenants, provider inheritance + honest
practices is the norm; pursue Stemfra's own SOC 2 only when bigger customers
send security questionnaires. What to actually do, in order:
1. Publish a marketing **Security page** (data handling, per-tenant RLS isolation,
   encryption in transit/at rest, subprocessor list — reuse Privacy §5a).
2. **Staff account hardening**: require MFA (CMS TOTP already built) for
   @stemfra.com staff; least-privilege CRM roles = the parked "Per-role RLS data
   hardening" item (that's the real internal gap — all staff share full data RLS).
3. Backups/incident basics: confirm Supabase PITR tier, a security@stemfra.com
   contact, and a one-page incident-response note.
4. LATER: SOC 2 readiness (vendor like Vanta/Drata) when enterprise/chain deals
   need it.

## P21 — Data safety before the first client (queued 2026-08-27)

The production Supabase org runs the FREE plan (no backups, 500MB cap). Peter's
call: upgrade to Pro once real clients arrive (~first 10); Claude's standing rec
is to treat the FIRST paying client as the trigger. Until then:
1. ✅ **Nightly backup sweeper — DONE 2026-09-01** (`lib/backupSweeper.js` +
   `routes/admin/backups.js` + the `stemfra_backups` compose volume). ⚠ **It never
   produced a dump in production until 2026-09-14**: every night since Sep 1 the failure
   email read "EACCES: permission denied, mkdir '/app/backups/<date>'". Cause: the host
   bind mount `./backups` was created by Docker as root while the container runs as
   `USER node`. Fix (LOCAL, push hold): Dockerfile creates `/app/backups` owned by node
   and compose mounts a NAMED volume there, which inherits that ownership. After the
   deploy the next 07:00 UTC sweep (or the boot catch-up, since the newest dump is
   older than 26 h) should send no error mail; confirm with `GET /api/admin/backups`.
   ✅ VERIFIED 2026-09-15 via `GET /api/admin/backups` on production: boot catch-up dump
   2026-09-14 08:05 UTC (3,672 rows, 0 errors) and the scheduled 2026-09-15 07:00 UTC dump
   (30 tables, 3,779 rows, 429 KB, 0 errors). The 07:00 mail on the 14th predated the deploy.
   The empty root-owned `./backups` folder on the VPS can be deleted. Nightly at
   BACKUP_HOUR_UTC (default 7 ≈ 2-3am ET) it streams 30 business-critical
   tables to gzip JSON (per-night dir + manifest), rolling 7-day retention,
   boot catch-up when the newest dump is >26h old, failure email to
   NOTIFY_EMAIL, `POST /api/admin/backups/run` + `GET /api/admin/backups`
   (PLATFORM_ADMIN), manual `scripts/backup-now.js`. ON by default
   (BACKUP_ENABLED=false kills). Verified: full prod dump 3,174 rows / 0.4MB /
   0 errors, every file re-parses as valid JSON (argyle + 116 bookings
   present), retention prune exercised. Restore = manual by design (header
   comment documents FK order).
2. **Supabase MFA for admin@'s dashboard login** (Team page showed MFA
   Disabled for both owners) — same hygiene bucket as the Cloudflare TOTP done
   2026-08-27.
3. **Pro upgrade** (~$25/mo) at the first paying client; consider the PITR
   add-on once revenue justifies.

## P22 — Expense Tracker AI (PRODUCT sketch, recorded 2026-08-31)

The sellable, tenant-facing sibling of P17 (which stays the internal OPEX
version and becomes the dogfood). Origin: while building the Helen Lead-Gen
CRM's telephony arc, Peter asked for a live case study — a read-only IMAP
scan of his connected Gmail (546 August messages) surfaced 8 real expense
documents with a plain subject filter (Anthropic x2, ElevenLabs, Cloudflare,
Atlassian, Figma x2, Tello). Proof: the hard plumbing (mailbox connect,
vaulted credentials, sync) ALREADY exists in the lead-gen CRM; the product
is the extraction + books layer on top.

Product shape (v0 sketch):
1. **Connect mailboxes — PLURAL, a core requirement (Peter 2026-08-31):**
   a business's subscriptions scatter across addresses (Peter's own case:
   peter.space.io@gmail.com, admin@stemfra.com, peter@stemfra.com). The
   account model is one workspace -> N linked mailboxes from day one; the
   lead-gen CRM's single `email_account` key generalizes to a list. Reuse
   the same app-password flow + docs page now, the stemfra_ai OAuth broker
   at product scale.
2. **Harvest**: scheduled scan per mailbox (subject/sender heuristics find
   candidates cheaply — measured 546 -> 8 with zero AI cost), then the LLM
   opens only the candidates and extracts vendor / amount / currency /
   date / cadence / last4. Dedupe by message-id AND by vendor+amount+period
   (a Figma "renewal reminder" and its receipt must not double-count).
3. **Books**: monthly expense P&L by category, renewal calendar with
   upcoming-charge warnings, "not a business expense — exclude" toggle
   (P17's rule), CSV/Excel export (the lead-gen CRM's SheetJS exporter
   ports straight over).
4. **Metering/pricing**: AI extraction runs through the same aiMeter
   25%-markup pattern; candidate-filtering-first keeps unit cost tiny.
   Could ship as a module inside the CRMs or a standalone product under
   the Stemfra AI umbrella (the Google-style multi-product launcher idea,
   recorded in the lead-gen plan doc).

Build trigger: after the Helen handoff + billing arc; P17's n8n harvester
can be superseded by this product's engine (build once, use internally
first — the platform is customer #1).

## P24 — CMS lead-reply email: dual mode — ✅ BUILT + VERIFIED 2026-08-31 (local commits, not pushed)

Option B (platform Resend, business display name, reply-to = owner) had
already shipped 2026-08-07 (replyToLead + the CMS ReplyComposer). This
session added the remaining delta, verified live in the CMS as
Marcus/argyle:
- **Gmail connector, test-before-store**: `site_email_connectors`
  (server-only RLS) + `lib/tenantGmail.js` (real SMTP login check BEFORE
  storing; app password AES-256-GCM encrypted with a key derived from
  the server secret; decrypted only at send) + `/api/cms/email-connector`
  + CMS Settings, Notifications, "Reply sending" section (default card,
  connect form, Connected/Disconnect). Wrong password rejected with
  guidance; real admin@stemfra.com app password accepted, then
  disconnected to leave the demo clean.
- **replyToLead dual mode**: connector present sends via the owner's own
  Gmail; otherwise the platform path. Reply metadata records `via`.
- **Composer register**: ReplyComposer gained the leadgen typography set
  (light-theme ReplyToolbar: 10 email-safe fonts, TT sizes, link
  popover, underline) + a mode-aware footer.
- Sync kept: settingsSections + sectionIcons + server lib/cmsRoutes.js
  `replySending`. CMS tiptap aligned at 3.30.6 (a nested dual
  @tiptap/core broke typecheck).

Original decision text (kept for context):

Tenants replying to site leads from the CMS get REAL sending (replacing
the mailto link): **default = Option B** (platform Resend from
notifications@mail.stemfra.com with the owner's address as reply-to; zero
setup) **plus an optional Gmail connector** (app-password only, Gmail
only for now — the leadgen CRM's connect/vault/test-before-store model
ported to the CMS) for tenants who want to send AS their own address.
Composer = the leadgen RichToolbar register. Build after the CRM email
arc (P23-adjacent slices: ops AI-assist chips, staff signatures, ops
inbox).

## P23 — CRM call workspace + side Copilot + Lead-Gen monitoring (recorded 2026-08-31, Peter)

Three stemfra-CRM (stemfra-ops) items agreed while building the Helen
Lead-Gen CRM's telephony arc:

2 (of the P23 list). **Side Copilot: ✅ BUILT + VERIFIED 2026-08-31** (local
   commits, not pushed). The Helen Lead-Gen copilot ported: server
   `/api/admin/copilot` (routes/admin/copilot.js + lib/crmCopilotContext.js
   live snapshot of sales pipeline + tenant sites + billing + expenses;
   `crm_copilot_conversations` table, per-staff), CRM `components/copilot/`
   CopilotPanel (docked resizable right rail, Chat|History, markdown,
   link chips, rewind) + TopBar Copilot launcher. Whitelisted
   confirm-before-act actions: set_stage, email_lead (opens the composer),
   scan_expenses. Verified live: grounded pipeline answer (63 leads, 11
   contacts) + the scan action end-to-end with the honest "Done" note.

1. **Persistent call widget: ✅ BUILT IN THE LEAD-GEN CRM 2026-08-31** (CallDock,
   per the build-there-first plan; port back here when browser calling lands —
   the ops CRM's existing CallWidget already covers its Twilio Voice SDK flow).
   Original spec: Replace the
   modal-style call UX with a floating, page-independent widget (the
   Front Desk launcher pattern from tenant sites): active call docks to a
   corner and survives navigation, so staff can edit a contact, draft a
   note, or add a calendar event (e.g. the prospect agrees to a Zoom/Meet
   mid-call) WHILE talking — the bank-agent mental model. Same pattern
   ships in the Lead-Gen CRM (design recorded in its docs/TELEPHONY.md
   §4b); build there first on the smaller surface, port back here where
   the Twilio Voice JS SDK (browser audio) already exists.
2. **Side Copilot for the stemfra CRM.** A docked side-panel copilot like
   the Lead-Gen CRM's Copilot and Stacy in the CMS — staff-facing,
   context = the open record + CRM data. Reuse the Lead-Gen copilot's
   panel UX + the aiMeter metering pattern.
3. **Lead-Gen product monitoring: ✅ BUILT + VERIFIED 2026-08-31** (local
   commits, not pushed). leads-api `GET /api/ops/monitor` (routes/ops.js,
   `x-ops-secret` = OPS_MONITOR_SECRET, service-to-service) → stemfra_server
   proxy `/api/admin/leadgen-monitor` (LEADGEN_API_URL + LEADGEN_OPS_SECRET
   env; requireStaffAuth) → CRM page /leadgen-monitor (Platform sidebar,
   Radar icon): summary cards + per-tenant table (health Active/Quiet/New,
   members, leads/enriched/contacted, inbox connected + emails/awaiting,
   number/compliance, AI calls + billed, last activity), search +
   pagination, 5-min auto-refresh. Verified live: 3 tenants, Helen Active
   with inbox connected. ⚠ AT PUSH TIME add OPS_MONITOR_SECRET to the
   Helen deploy env AND LEADGEN_API_URL + LEADGEN_OPS_SECRET to
   stemfra_server deploy.yml (public hostname, never loopback).
   Original spec: A surface
   showing per-tenant health of the Lead-Gen product (Helen first):
   plan/usage (the /api/usage/summary payload), lookups run + spend,
   emails sent, last inbox sync, telephony state, last activity.
   Mechanism: leads-api exposes a staff endpoint guarded by a shared
   secret (the STEMFRA_ADMIN_SECRET service-to-service pattern; public
   hostname, never loopback), proxied by stemfra_server for the CRM page.
   Start read-only; actions (suspend, top-up) come with the billing arc.

Sequencing: after the Helen handoff. Item 3 is small and first (it aids
the pilot itself); 1 and 2 ride with the Lead-Gen telephony T5/T6 arc.

## P25 — Tenant logo toolkit (recorded 2026-09-01, agreed with Peter)

Where client logos come from. Context: there is no "Unsplash for logos" —
stock APIs work because photos are generic; a logo is an identity mark, so
the toolkit has an import track and a creation track:

1. **Import an existing brand (small, ship first)**: a "Find your logo"
   action in CMS Settings → Style → Branding — Brandfetch (or Logo.dev)
   lookup by the business's domain/website → preview → import through the
   existing upload pipeline (Cloudinary subdomain folder + site_media row
   with provenance metadata, exactly like the Unsplash stock-photo imports).
   Server-proxied key (`/api/cms/brand-logo/*`, key stays server-side, same
   pattern as stockPhotosController). Free tiers cover our volume.
2. **SVG logo builder (the main build)**: for clients WITHOUT a logo — an
   in-CMS wordmark/monogram generator: business name + a Google Font picker
   (families already load dynamically per theme) + optional icon from the
   Iconify corpus (200k+ open-source icons, free API — server-proxied like
   Unsplash) + colors seeded from the active theme palette → composed
   vector SVG in 3 lockups (wordmark / icon+wordmark / monogram badge) →
   saved as the site logo via the existing branding flow (favicon derived
   from the monogram). Zero per-use cost, deterministic, always on-theme.
   Precedent: the boot-loader letter-monogram pattern, scaled up.
3. **AI generation deliberately SKIPPED** — not for cost (gpt-image runs
   ~$0.02–0.19/image; a whole session is under $1) but for quality: raster
   output, mangled in-logo text, inconsistent marks that undercut the
   polished-site positioning. Revisit only as an optional "ideas" garnish
   after 1+2 exist.

Integration points: BrandingSection (upload stays the default path), the
Stacy onboarding "logo" step deep-links the builder, publish-checklist logo
gate counts a built logo. Build trigger: after the wellness theme-polish
arc closes. ✅ Trigger met 2026-09-09 (arc closed).
**Phase 1 ✅ BUILT 2026-09-10 (local, push hold)**: server `/api/cms/brand-logo` (`lookup` = Brandfetch
when `BRANDFETCH_API_KEY` is set, else the website's own apple-touch-icon / rel=icon ≥64px /
og:image, plus Google's 256px favicon service as the last resort; `import` = Cloudinary into the
site folder, SVG kept, rasters capped WebP, `site_media` row with `metadata.source =
brand-logo:<source>` + `imported_from`), CMS `LogoFinder` inside Branding (domain prefilled from
`custom_domain`; "Use as logo" / "Favicon" feed the existing upload fields, so Save / Discard /
cleanup behave like an upload). Verified on Argyle with stemfra.com (2 candidates, import → logo
field → Discard cleaned up). ⏳ Peter: a Brandfetch key (free) as the `BRANDFETCH_API_KEY` secret
for typed SVG logos; Logo.dev is the alternative.
**Phase 2 ✅ BUILT 2026-09-11 (platform, pushed 064346d)**: the SVG builder inside Branding ("Build a logo",
`stemfra_cms/src/components/settings/LogoBuilder.tsx` + `lib/logoCompose.ts`). Business name (prefilled)
+ optional tagline, a Google Font (the theme's display font first, then 16 logo faces; Bold / Regular /
UPPERCASE), an optional icon from the Iconify corpus (search + grid), ink + accent seeded from the theme,
three lockups (wordmark · icon + wordmark · badge + wordmark with rounded / circle / no-fill badge and the
initials when no icon). The text is converted to OUTLINES in the browser (`opentype.js`, new CMS dep) from
the font's TrueType file, so the saved SVG carries no font and renders identically anywhere (~30 KB).
Favicon = the badge alone, rasterised by Cloudinary to a 256 px PNG. Server (`brandLogoController`):
`GET /icons?q=` and `GET /icon?name=` proxy Iconify, `GET /font?family=&weight=` resolves the TTF URL from
Google Fonts (empty User-Agent → TrueType; falls back to 400 for single-weight faces), `POST /build`
validates the SVG (no script / foreignObject / image / handlers, 400 KB cap) and stores it like an
import (`site_media` `metadata.source = brand-logo:builder` + the builder params for a later rebuild);
`/api/cms/brand-logo` carries a 600 KB JSON limit ahead of the global 10 KB. Verified headlessly (real
Playfair Display TTF + mdi:content-cut, all lockups + favicons rasterised by Chromium) and ✅ walked in the
CMS with Peter watching 2026-09-11 (Argyle: tagline, icon search, badge lockup, Use as logo → SVG in the
field, Use as favicon → PNG, Discard deleted both session assets). Fix on the way: Iconify alias chains
(`mdi:scissors` → `content-cut`) are followed server-side. ✅ Follow-ups done 2026-09-11: `CMS_ROUTES.logoBuilder`
(`/settings/style#branding-build`, the anchor scrolls to AND opens the builder, clearing the sticky top bar);
Stacy's pending "Add your logo" step and the publish checklist's Logo item route there with hints naming
upload / find / build, and Stacy's guidance walks the owner through the builder. A built logo counts in both
because saving it sets `logo_url`, the signal they already read. Verified in the CMS (deep link opens the builder).
**P25 COMPLETE** (phase 3, AI generation, stays deliberately skipped).

## P26 — AI agent inventory + agent archetype system (recorded 2026-09-02, Peter)

Goal: stop rebuilding agent/chat UX from scratch and stop re-discovering what
each agent can do. Two deliverables, mirroring what the theme system did for
tenant websites:

1. **Capability inventory doc** — ONE reference documenting every AI agent and
   chat surface across the repos: Concierge (marketing), Front Desk (tenant
   sites), the Stemfra AI runtime's agents, Stacy (CMS), the CRM call/side
   Copilots, email-assist (suggest/refine/draft), lead-gen agents, and Mark
   (voice). Per agent: where it lives, transport (n8n / native / runtime),
   contract shape (reply/handoff/action/card/quick_replies/lead/booking),
   tools it can invoke, persistence, and its UI surface.
2. **Agent ARCHETYPE layer** — reusable pieces the way packages/archetypes
   serves the templates, so a pattern reviewed once (booking panel, confirm
   cards, chips, link rows, refine bar, composer, receipt cards, tz picker)
   is PORTED, not re-invented. Covers both UI components and the server-side
   contract conventions (context builder → hard-rule prompt → structured
   JSON → server grounding/whitelist → confirm-before-act).

Why: the 2026-09-02 lesson — Stacy's booking flow was built conversationally
before Peter pointed at the Concierge's already-reviewed BookingPanel; the
timezone picker then had to be ported by hand. The inventory + archetype layer
makes "check similar works first" a lookup instead of an archaeology dig.
Timing: after the current onboarding-facing queue (inbox parity, P23,
template audit, P25); pairs naturally with the Stacy native-mode migration.

## P27 — Claim prefill from scraped business data (proposed 2026-09-09, Peter's ask)

_2026-09-22: P27 is now the prerequisite for the "see your shop on its own website in 60
seconds" ad funnel (`docs/AD_FUNNEL_2026-09.md`, agreed with Peter). Until it ships the ads say
"see a live site built for a shop like yours"._

Peter, looking at Fresha's unclaimed-venue page for GD Barbershop (name, address, hours,
map, "Suggest an update"): if we already scrape a business, the claim link should land the
owner on a site that already knows them, so the setup wizard is a confirm-or-edit, not a
form. "This people already know me" is the feeling to create.

**Where we stand (verified in code 2026-09-09):** the n8n Google Maps run uses the Apify
actor `compass~crawler-google-places`, which returns name, address, phone, website, rating,
review count, opening hours, category and photos. Only `company_name`, `phone`, `region`
(state) reach the `leads` table; `qualification` is empty on stored leads and the prompt
uses `website` for scoring only. `lib/claimOffer.js` prefills nothing but the business name.
So the data is fetched and thrown away.

**Build (small, three steps):**
1. Ingest: keep the scraper snapshot on the lead (`leads.qualification.scraped` or a new
   `scraped` jsonb): address, city, state, zip, phone, website, opening hours, rating,
   review count, category, place id, up to 3 photo URLs. n8n Build Prompt + the
   `/api/leadgen/ingest` payload carry it through.
2. Claim → provision: when the claim link provisions the site, write the snapshot into the
   real fields: company name, `sites.business_hours` (from opening hours), the home
   `location_map` section (address, phone), `sites.time_zone` from the state, the GBP
   place id onto `metadata.gbp` (so video 22's "Yes, I have one" is pre-answered), the
   scraped website as the "already have a domain?" hint in sign-up.
3. Wizard step 1 shows those values prefilled with "Is this right?" instead of blanks.
   Reviews: show the rating + count as a badge only; never copy review text (Google ToS).

Not started. Trigger: after the theme polish arc (this week) and the YouTube upload.
**Decisions 2026-09-13 (Peter, during P39):** (1) the prefill snapshot is `raw_signal` in the
n8n Normalize node, now specified in `n8n-workflows/leadgen-normalize-v13.paste.md`: address
parts, phone, website, place id + cid, location, category, rating + count + distribution,
opening hours, price band, description, claimed flag, socials, booking links (facts only; no
review text, no photo URLs). ✅ v13 LIVE in n8n (Peter pasted 2026-09-13; a Staten Island
3-result fetch stored two leads with a valid 35-key snapshot, place id, 7 hours entries and
`readiness` = modern). Socials in the snapshot now also carry youtube / twitter / linkedin /
pinterest. (2) At claim → provision: phone, address and hours pre-fill the site
(hours from Google when present, else the template's week); the wizard shows them as
confirm-or-edit. (3) **Reviews by default = Google's, shown LIVE** via the Places API with
attribution against the stored place id (a "Reviews from Google" block on the site), never
copied into `site_testimonials`; the owner's own testimonials sit beside them. This is the
compliant way to "use their reviews by default" and it needs a Places API key on the server
(the same key P38 stage 2 needs). Today `raw_signal` still holds only title + city.

## P28 — Sales hours + "callable now" lead filter (decided 2026-09-10, Peter)

Reps work from Nigeria (WAT, no DST); the target is the prospect's 11 AM to 4 PM local.
Full analysis + tables: **`stemfra-ops/docs/SALES_HOURS.md`**. Decisions: first hires on the
America shift (4 PM to midnight WAT, or 2 to 10 with a 4 to 10 calling core); a 12 to 8 PM
squad for UK/Europe + US East when those lead lists exist; Australia dropped (night shift).
CRM build to follow: a **"Callable now" facet** in `components/leads/leadFilters.js` (region →
prospect local time, show only 11 to 4 local) + the same check as a dialer warning. Not
started; build when the sales managers start (hiring in 1 to 2 weeks per 2026-09-05).

## P29 — Staff working-time monitor + CRM idle lock (proposed 2026-09-10, Peter)

Goal: know that sales staff work at least 7 of 8 hours per shift unless a superior excused
them, and lock the CRM after 45 minutes of inactivity (the per-device Mac lock screen cannot
be set on staff machines; the CRM lock is what we control). Design in
`stemfra-ops/docs/SALES_HOURS.md` ("Working-time monitor"). Four parts, in build order:
(1) activity clock: the presence heartbeat gains `idle` (5 min without input; a live call is
always active) → `work_sessions` + a per-person per-day rollup (active/idle minutes, first +
last seen, calls, emails); no screenshots, no keylogging; (2) CRM lock overlay after 45 min
idle (avatar lock screen, unlock = Google re-sign-in, windows restored from the persisted
workspace session; time after idle start never counts); (3) shift-aware targets per rep
(target 7h active inside the shift; green/amber/red) + `staff_absences` (request → manager
approval, excused hours count) + a Team → Hours tab; (4) bell notification to managers at
shift end for unexcused red days + a weekly summary. **DECIDED 2026-09-10:** clock stop 5
min, lock 45 min, both super_admin-adjustable in Settings → Work time (`crm_settings.
work_time`, ranges 5 to 10 / 15 to 240) with a lock mode + daily target; unlock = lock-screen
PIN (Google fallback; `tap` mode available, not default); managers+ see the team. Build plan
(5 phases, ~4 days) in `SALES_HOURS.md`. **Phase 1 ✅ BUILT 2026-09-10** (migration
`work_time_v1.sql` applied; server `lib/workTime.js` + `routes/workTime.js`; CRM idle clock,
Settings → Work time, My hours widget; verified live). **Phase 2 ✅ BUILT 2026-09-10** (lock
overlay over both shells after `lock_minutes` idle or from the user menu, PIN in
`staff_lock_pins` via scrypt, 5-try lockout, Google fallback, Settings → Security PIN card;
migration `work_time_v2_lock_pin.sql`; verified live). **Phase 3 ✅ BUILT 2026-09-10**
(`staff_absences` + approval endpoints + `crm_notify` bells; Activities → **Hours** tab with
team/own scope, per-day rows, requests card, per-rep shift editor; migration
`work_time_v3_absences.sql`; verified live). **Phase 4 ✅ BUILT 2026-09-10** (shift-end close
+ frozen status, `work_day_short` bells to team roles + the person for tracked roles on work
days, Monday 09:00 `work_week` bell + branded email; settings gained work days / tracked
roles / weekly switch; migration `work_time_v4_alerts.sql`). **Phase 5 ✅ BUILT 2026-09-10**
(`lib/leadTimezone.js` region → zone, "Callable now" preset + Local time facet, dialer guard
modal + local-time chip; CRM only). **P29 COMPLETE, all five phases.** CRM pushed; server
commits local (hold). Follow-ups: P28's "callable now" is delivered by this phase.

## P30 — Staff email audit (proposed 2026-09-10, Peter; super_admin only)

Goal: keep company mailboxes (@stemfra.com) for Stemfra business; catch personal or
unauthorised use before it becomes a legal problem. Design discussed 2026-09-10:
- **Access = Google Workspace domain-wide delegation** (a service account authorised ONCE by
  the Workspace admin for `gmail.readonly` + `gmail.settings.basic`), NOT per-person OAuth
  like mark@'s outreach token: covers every staff mailbox incl. new hires, revocable in one
  place, no consent dance per rep. Peter action at build time (Admin console).
- **Weekly sweep** (server sweeper, Sunday night): per mailbox, list the week's SENT mail +
  metadata only (to, subject, size, attachments, external domains) + the mailbox's
  forwarding rules, filters and delegates (the real exfiltration vectors). Candidates =
  external recipients that are not a CRM lead / contact / tenant / vendor, personal domains
  (gmail, yahoo…), bulk BCC, attachments, auto-forward to outside. Only candidates go to the
  AI classifier (business / personal / suspicious, with a one-line reason); bodies are never
  stored, flags keep message id + ≤200-char snippet. Tables `email_audit_runs` +
  `email_audit_flags`, super_admin RLS + server endpoints.
- **CRM surface**: Compliance → Email audit tab (super_admin): runs, flags per person,
  Reviewed / Dismiss / Escalate, weekly digest to super_admin. Never visible to managers.
- **Policy first** (legal): an Acceptable Use Policy every staff member accepts at first
  login (reuse the `legal_acceptances` ledger pattern) + a standing notice in Settings that
  company mail is audited; monitoring of company-owned accounts with notice is lawful (US)
  and NDPA-compatible (Nigeria) when scoped to business purpose. Use Workspace's own tools
  too (audit log, DLP rules; Vault needs Business Plus).
**DECIDED 2026-09-10 (Peter agrees with the recommendation):** domain-wide delegation, weekly
sweep, sent mail + mailbox settings only in v1, flags visible to super_admin only, Acceptable
Use Policy accepted at first login before the first sweep. Not started; after P29.

## P31 — Markets: US + Canada + UK first, EU later (discussed 2026-09-10)

Peter opened Airwallex Global Accounts for **Canada (CAD)** and the **UK (GBP)** next to the
USD ones (2026-09-10) and proposes selling in the US, Canada and the UK first, Europe later.
Recommendation given the same day: agree. Rationale: one language, one sales script, one
shift (the America shift covers the US + Canada; the UK rides the 2 PM WAT hours), no VAT
per member state, Airwallex collection in place. EU later needs only ONE EUR SEPA Global
Account (Airwallex's EU entity is Dutch; a NL or DE SEPA IBAN serves every Eurozone customer),
plus Denmark (DKK) / a SEK account only if the Nordics come in. First EU markets when they do:
Ireland (English, EUR), Netherlands (English-fluent), Germany (largest), then the Nordics.
**Follow-ups before the first non-US client:**
- ✅ 2026-09-10 **per-currency bank details + billing@stemfra.com**: `crm_settings.
  commission_bank` gained `contact_email` + `by_currency.{CAD,GBP}`; `getCommissionBank({
  currency })` picks the block by the invoice currency and falls back to USD when a block is
  incomplete (CAD needs transit + institution, GBP a sort code, EUR an IBAN). The invoice
  PDF, the Airwallex invoice memo and the new CMS "Pay by bank transfer" panel print the CAD
  rows + the Interac Autodeposit address; invoice / reminder / receipt emails carry
  `replyTo: billing@stemfra.com`; every surface says "Questions? billing@stemfra.com".
  Peter created the mailbox, registered it on the Airwallex CAD account and confirmed the
  Interac Autodeposit registration (2026-09-10): e-Transfers to billing@stemfra.com now land
  in the CAD wallet automatically. ✅ Both blocks complete from Peter's full
  Airwallex details (2026-09-10 evening): CAD (EFT + Interac + bank address) and GBP (sort
  code + IBAN + SWIFT + bank address); test invoices rendered per currency.
- ✅ 2026-09-10 **Section 1 of the GBP/CAD platform plan** (Peter: "go ahead with all of
  section 1 in that order"):
  1. Commission invoices follow the site currency (`commissionMeter` charges
     `sites.currency`; `getCommissionBank({currency})` picks the bank block). Server ea60140.
  2. Signup country → site currency / locale / time zone (`lib/localeDefaults.js`
     `defaultsForCountry` + `siteOverrides` on `provisionSite`/`cloneSite`, via
     `onboardSite`); the CMS `/signup` and the stemfra.com Start form gained Country +
     State/Province (`stemfra_cms/src/lib/regions.ts`, `stemfra_client/src/app/data/regions.js`).
     Platform 4b1b6d3, client 6d19739f (both on the push hold).
  3. Compliance engine for Canada + UK: CRM `complianceCatalog.js` (`CA_PROVINCES` rates +
     thresholds, `UK`, `intlCategoryTax`, `resolveJurisdiction` scopes `ca`/`gb`,
     `thresholdFor` in CAD/GBP + `thresholdLabel`, CA/UK quarterly returns gated by
     `registeredIn`, checklist + open items); `Compliance.jsx` Tenants-by-location, Tax
     rates (Canada per province, UK one row), nexus cell, Calendar; server `lib/geo.js`
     (`CA-XX` / `GB`), `lib/taxThresholds.js`, `nexusSweeper` alerts on CA/GB too. Doc
     `COMPLIANCE_ENGINE.md` §3b.
  4. CASL / PECR outreach: `lib/outreachCompliance.js` (market from `leads.region`,
     identification + opt-out footer on sequencer emails and the claim email, Stemfra
     named in the Claim SMS for CA/UK leads) + `docs/OUTREACH.md` §6 (the three-market
     rules table, UK sole-trader + CTPS prerequisites). ⏳ Peter: set
     `STEMFRA_MAILING_ADDRESS` (.env + deploy.yml) and buy a TPS/CTPS licence before UK
     calling.
  5. Recon for CAD/GBP verified by reading: `fetchDeposits` has no currency filter (all
     Global Accounts' deposits come back), `matchDeposit` pairs a deposit with charges of
     the SAME currency, an empty Interac reference falls to T2 exact-amount matching, and
     the 8-char reference fits EFT, Interac and Faster Payments memos. Untested against a
     real CAD/GBP deposit: verify on the first one (dry-run sweep, then arm).
- 🟡 **Twilio numbers for the UK and Canada.** 2026-09-10 evening: Peter bought UK mobile
  **+44 7723 497148** (bundle approved instantly from the account profile; SMS to UK handsets
  only). Decision the same evening: TWO lines per market like the US, a staff line (reps' calls +
  Claim SMS + owner alerts, inbound rings the reps) and Mark's line (his calls + in-call texts,
  inbound = concierge); `config/twilio.js` `staffLine`/`markLine`. This first number = the STAFF
  line: set its Voice URL to `/api/twilio/inbound-voice`, SMS to `/api/twilio/sms-inbound`, secret
  `TWILIO_PHONE_NUMBER_GB`. ✅ Mark's UK mobile **+44 7449 911044** bought the same evening (Voice →
  concierge, SMS → sms-inbound), secret `VOICE_PHONE_NUMBER_GB`. All four numbers' webhooks
  verified from the Active Numbers page 2026-09-10; both US numbers stay on the 10DLC Messaging
  Service, the UK ones on plain webhooks (UK mobiles text UK handsets only). ✅ Verified 2026-09-24:
  all four numbers are in `config/twilio.js` `KNOWN_LINE_LOCATIONS`, deploy.yml carries the four
  secrets, and the UK Mark line has received inbound texts on production (Sep 11, 17, 18). Only
  the GitHub secret VALUES are unseen from a session (no outbound from a GB/CA line yet): confirm
  once from a UK lead's Call widget ("Your number shows as +44…").
  ✅ Canada bought the same evening: staff **+1 365 361 5576** (inbound-voice + sms-inbound,
  `TWILIO_PHONE_NUMBER_CA`) and Mark **+1 365 696 5918** (concierge + sms-inbound,
  `VOICE_PHONE_NUMBER_CA`), Markham ON (Twilio has no 416/647 inventory). No emergency address
  on any number (must be in-country; nothing dials emergency services and the CRM dialer now
  refuses 911/999/112). A verified toll-free for Canadian A2P texts only if the Messages Log
  shows 30007 filtering. ✅ 2026-09-10 late: all four market secrets + `STEMFRA_MAILING_ADDRESS` set and
  deployed (deploy.yml 1048e21 carries the address); TwiML app needs nothing (one app, caller ID per
  call). Twilio setup for the three markets is COMPLETE; no test send by design. The 10DLC Messaging
  Service defers to the sender's webhook (verified), so the per-number sms-inbound URLs apply. Original advice:
  one UK
  number for caller ID (local geographic numbers need a UK address; a UK **mobile** or
  toll-free number accepts a non-UK address, and international long codes cannot text
  UK handsets, so the mobile number is the practical pick for calls + Claim SMS); one
  Canadian local number (Toronto) for caller ID, with the Claim SMS to Canada sent from a
  **verified toll-free** number (Canadian carriers filter A2P on long codes; US 10DLC does
  not cover Canada). The 2026-09-08 account restriction was lifted 2026-09-09 (Peter), so the
  numbers can be bought any time, through the Console, never a script.
- ✅ 2026-09-10 (later) **Section 2** (Peter: "go ahead with section 2"):
  - Leads: `lib/leadCountry.js` `countryForLead` (phone_country → region's country → US) feeds
    `leadgenCall.toE164` (now libphonenumber in that country, so a UK "020 7946 0000" becomes
    +44…) and every caller (sequencer, sweepers, Claim SMS). CRM Add/Edit Lead Region select =
    US states + Canadian provinces + United Kingdom as CODES (the scraper's field), and a new
    lead's phone country + currency follow the region. n8n system prompt gained the
    region/phone_country rule (Peter pastes `n8n-workflows/leadgen-system-prompt.txt`).
  - Per-market senders: `config/twilio.js` `smsFrom(country)` / `voiceFrom(country)` read
    `TWILIO_PHONE_NUMBER_GB|CA` and `VOICE_PHONE_NUMBER_GB|CA` (blank = today's numbers); the
    Claim SMS and Mark's outbound calls use them. Env documented in `.env.example` +
    deploy.yml. ✅ Peter confirmed 2026-09-10 (numbers bought, webhooks pointed); code + prod
    inbound verified 2026-09-24 (see section 2 above).
  - Tenant websites: ONE money formatter, `formatMoney` in `@stemfra/site-data`
    (`narrowSymbol`, cents only when non-zero); every archetype and template page that
    rendered `$` literals or `en-US` currency now formats in the site's currency (CAD reads
    "$45" at home, GBP "£45"). Hero overlay-booking + the multi-service form gained a
    `currency` prop. All 9 workspaces typecheck clean. The State/ZIP claim was wrong: the
    forms have no address fields, and the CMS billing form already says "Postal / ZIP code"
    with a country-aware LocationPicker; PhoneField was already country-aware.
  - CRM money: Client Bookings / Client Payments rows carry `currency` from the site (server
    `operationsController`); the Compliance registry rows carry the jurisdiction's currency.
    Books stays USD (mixed-currency P&L needs an FX view: open item).
  - Domains: `.co.uk` + `.uk` added to the suggestion list. `.ca` deliberately NOT: CIRA needs a
    Canadian-presence registrant and Stemfra LLC is the Porkbun registrant.
  - Section 3 checks: no "USD" wording on the stemfra.com Terms/Fees pages (grep clean).
- ✅ 2026-09-10 (night) **Section 3 + the section-2 leftovers** ("go ahead with section 3 and
  treat everything still open"):
  - Checks: sales hours cover CA + UK (SALES_HOURS.md); `pricing_countries` carries CA = CAD /
    HST 13, GB = GBP / VAT 20 (verified in the DB); Terms/Fees pages have no USD wording. Twilio
    voice geo-permissions for GB + CA are a Console setting Peter confirms (both are in
    Twilio's default-enabled low-risk set).
  - FX view for Books: `getBooks` now returns one revenue row per month AND currency plus
    `revenueTotalsByCurrency`; the CRM Books tab shows an "FX rates to USD" card (rates typed +
    dated in `compliance_settings.fx_rates`, USD per unit) and USD-equivalent totals; USD-only
    years render exactly as before.
  - UK sole-trader gate: `leads.entity_type` (migration `leads_entity_type_v1`, applied) +
    `outreachCompliance.emailAllowed(lead)`: a GB lead gets email only when entity_type =
    company; the sequencer logs `lead_followup_skipped` (reason `pecr_entity_type`), the claim
    send and `/send-outreach` refuse with the reason. CRM: Entity type select (with a Companies
    House search link) on the lead form when region = GB, and an Entity fact in the drawer.
  - Airwallex mirror: verified by reading that invoice lines use inline FLAT prices in the
    invoice's currency (`flat_amount` + the product as a label), so no per-currency product
    prices are needed. Confirm on the first CAD mirror.
  - Tenant SMS sender by destination: `config/twilio.js` `smsFromForNumber(to)` picks the market
    number from the recipient's country; owner booking alerts, the SMS-consent confirmation,
    CRM texts and Mark's in-call text use it. Blank market numbers = today's behaviour.
- Interac Autodeposit: the CAD account carries an Airwallex-generated e-transfer address;
  register a Stemfra address (e.g. billing@stemfra.com) when Canadian invoicing goes live
  (see the handoff note). Recipient name shows "Airwallex (Canada) International" either way.

**P31 addendum, 2026-09-11 (CRM 90b7e68 + server 004600c, local):** Leads page country pills (All / US / Canada / UK, no counts) left of the search + a Verticals chip mirroring the Filters facet + Group by Country + mass-email mixed-country guard. Root cause of "The Barber Box" in the Vertical facet: it read the legacy 16-box `template_slug`; fixed at the source with **`leads.vertical`** (migration applied + trigger, `lib/leadVertical.js`, `stemfra-ops/src/lib/leadCountry.js`). **Live bug found and fixed**: the marketing contact form's "<Vertical> website" subjects were rejected server-side ("Invalid subject selected"), so only "General" enquiries ever reached the CRM; the six subjects are accepted now (service 'website' + vertical). Ships with the next server push.

## P32 — Staff handover + offboarding (Peter's ask 2026-09-10, recorded before P25)

When a rep leaves, a successor takes their clients: the clients are told, correspondence
moves, the old mailbox is forwarded, then retired. Today the CRM can only deactivate the
profile (Team page, super_admin) and every ownership change is manual. There is no system
administrator; the proposal is to give super_admin the buttons instead of hiring one.

**What we already have to build on:** staff identity = Google Workspace `@stemfra.com`
(CRM entry gate); `lib/gmailOutreach.js sendAsRep` already impersonates ANY staff mailbox via
the service account's domain-wide delegation (mark@ is just the default); P30 planned the same
delegation for the mailbox audit; ownership lives on `leads.assigned_to` (+ contacts / deals
owners); Email Templates manager for the copy.

**Phase 1 ✅ BUILT 2026-09-10 (same evening; server + CRM pushed): "Hand over" wizard on the Team page** (super_admin / admin). Template H1 seeded in `email_templates`.
Pick leaver → successor → (a) bulk reassign leads, contacts, companies, deals, open
follow-ups and scheduled outreach (`assigned_to` / `outreach_sent_by`), logged to the feed;
(b) client introduction email from the SUCCESSOR's mailbox via `sendAsRep` (new template
"New account manager", merge fields old/new name, phone, email; per-client include/exclude
list, human-paced sends, only relationships past first contact); (c) deactivate the profile
(login blocked, presence offline, lock PIN + saved views cleared, work-time history kept);
(d) a checklist of the Workspace steps still done by hand (forward mail, suspend, alias).
**Phase 2: Workspace automation** (Admin SDK Directory + Gmail settings scopes on the P30
service account): suspend / force sign-out / temporary password with change-at-next-login,
mail forwarding to the successor (same-domain forwarding needs no verification), old address
added as an ALIAS on the successor for 90 days (aliases are free), then delete with Drive +
Calendar transfer. Onboarding mirror: create the Workspace user + CRM profile + role + shift.
**Phase 3: "Your account manager" on the tenant side**: `sites.account_manager_id` (staff
profile), shown in the CMS support panel and signed in tenant emails, so correspondence
switches with one field. Passwords are never stored by us: Workspace owns auth, 2-step
verification enforced there; the CRM only ever sets a temporary password through the API.
**Advice given:** do NOT hand a used mailbox to a new hire (privacy, stale threads, no
saving: Workspace bills per seat, so delete + create costs the same); alias-then-delete is
the standard.

## P33 — Colour visibility test tool + Remix validator (Peter's ask 2026-09-10, Figma shots)

Figma's picker shows the contrast ratio, an AA/AAA badge and a boundary curve in the picker
where the pair stops passing. We need the same in the CMS for theme palettes, in the real
pairings the templates render, and as the gate for the coming Remix (palette variations).

**A ✅ + B ✅ BUILT 2026-09-10 night** (platform commit, local): `contrast.ts` (ratio, levels, `paletteReport` over 8 real pairings, `onColor` now flips the ink only when the threshold's pick is under 3:1, `nearestPassingShade`, `passMap`), `npm run check:palettes` in the CMS (esbuild-bundled; body text gates, accent pairs warn: 11 curated accents sat under 3:1 as eyebrow/link text, none unreadable; RESOLVED 2026-09-10 on Peter's word (option 1, fix the data): four accents darkened one step (Graphite & Gold, Fresh Teal, Optimism Blue, Rose Gold) and five palettes gained a lighter `pop` for the deep band (Slate & Sand, Indigo Ink, Soft Sky, Heritage, Midnight & Blush; `ColorPalette.pop` written to `color_extras.pop`, which the resolver already maps to `--site-pop`), so every curated palette now reads AA and the check reports zero warnings), CMS Brand colours = live matrix + Fix nudges + Figma-style pass maps on the primary/accent/text pickers + Save gate on body text, palette cards carry AA / Review badges. ✅ Verified in the CMS on Argyle (Peter signed in): matrix, Fix moved the accent to a passing shade, Save gate, Discard. Then the **Figma-style picker** (`ContrastPicker.tsx`, Peter's shots): smooth saturation/value plane, hue slider, hex, live ratio + ✓/⊘ AA badge, the AA boundary curve with the failing side stippled; opens from the primary/accent/text swatches. **CRM Templates page** got a Contrast column (AA / Review n / Unreadable, weak pairs on hover) from a TypeScript copy of the module (`src/lib/contrast.ts`; the CRM now accepts .ts files, tsconfig added, no conversion of the .jsx app: Peter's decision 2026-09-10). No library needed. Then (Peter's review, late 2026-09-10): **Undo + Revert** in the picker (per-picker history, Revert = last saved colour), **Fix all** in the visibility check (iterative, re-scores after each move), the boundary curve is now a sub-pixel bezier with a fine dot grid on the failing side; every pass/fail boundary is drawn (the accent is checked against light AND dark surfaces, so it passes in a band with two curves); the picker was restyled (icon Undo / Revert + Done in a footer, hue thumb, flips above the trigger near the viewport bottom) and every visibility-check row's swatch opens it for that row's adjustable colour (rows set by the palette say so); the WCAG footnote moved to COLOR_GUIDE.md. **Claude Design pass (2026-09-10 night)**: Peter had Claude Design produce "Colour picker with a built-in contrast checker" (8 artboards + spec 1h); the picker now implements that spec: popover 300 / r14 / #E7E2DA, plane 272×212 r10, hue bar 272×12 with the ⌀16 dot thumb, swatch 26 r7 + hex h26, one pattern per surface (dot grid pitch 7 / 30° hatch pitch 7 / ±45° cross pitch 8, ink rgba(26,18,14,.22) on light regions and rgba(255,255,255,.30) on dark), curves halo rgba(20,14,10,.34) 3px then colour 1.25px in white / #FFD166 / #7CD9F5, ring ⌀15 2.5px white, a hollow ⌀12 marker on the nearest colour that passes everywhere (click to snap), READS ON legend with pattern + curve chips and per-surface ratios, footer undo / history icons + Done 28h. Closed swatch carries the ✓ AA / ⊘ AA badge inline in the hex field and a verdict note ("Too dark on the deep band. 2.01 : 1 against #3A2E22"). Visibility table: "n of m pairings do not meet their rule", rule sub-labels, spec badge fills, Fix all (n). Verified on Argyle. The handoff bundle (README spec + `Picker.dc.html` prototype) lives at `stemfra_platform/docs/design/colour-contrast-picker/`; the picker ports its `solveV` + `draw()` (per-column bisection, Path2D clip + rotated pattern tiles, halo strokes), its suggestion rule, tokens and type (JetBrains Mono loaded for figures); closed swatch = button with chip + hex + pill (1a); table per 1f. **Transcription pass (2026-09-10, Peter: "not the same code as the Claude Design")**: `ContrastPicker.tsx` rewritten as a line-for-line transcription of `Picker.dc.html` (its `Picker` class with the prototype's methods and template, inline styles and SVGs verbatim; the DC runtime bits `sc-if`/`sc-for`/`{{ }}`/`style-hover` become conditionals, map, JSX and a hover class; a thin `ContrastPicker` host adds open/anchor/flip + Done). Verified in the CMS (plane, hue, hex, Undo, Revert, Done). Rule for future handoffs: ask Claude Design to export a React/TSX component (or a vanilla web component, as the CRM clock was), not a `.dc.html` runtime component. **Docked rail (2026-09-10, Peter's suggestion, agreed)**: the picker is no longer a popover; `ColorPickerRail.tsx` (store `lib/colorPickerRail.ts`, mounted in `CmsLayout`) docks it in the right-rail slot like Stacy (rail sits to Stacy's left; the live-preview drawer and the Stacy launcher offset by its width), stays fixed while the visibility check scrolls, and its header names the colour being edited. The active field's swatch and its visibility rows carry a ring; every adjustable row is hover-able and clickable and re-targets the rail (the clicked surface leads the READS ON legend); palette-set rows get a tooltip instead. Verified in the CMS with Stacy open. Colour rules for Remix recorded from Kole Jain's video → `stemfra_platform/docs/COLOR_GUIDE.md` (7 mistakes → theme rules, minimums, the Remix recipe).
**A. Shared contrast module** `packages/site-data/src/contrast.ts`: WCAG 2.x relative
luminance + contrast ratio, pass levels (body 4.5, large text 3, UI 3, AAA 7), and
`paletteReport(tokens)` = the theme's REAL pairings (text/background, text/paper,
muted/background, on-accent/accent, on-deep/deep, on-band, accent-as-link/background,
hairlines) with ratio + pass/fail. `resolveTheme`'s derived on-* tokens must switch to this
module so the checker and the runtime agree. A test validates every curated palette in
`stemfra_cms/src/lib/colorPalettes.ts` at build time.
**B. CMS panel** (Settings → Style, under Brand colours + Colour palette): a live matrix of
those pairings with ratio chips and AA/AAA badges, the picker gains Figma's boundary curve
(for the chosen foreground, compute the AA boundary across the saturation/value plane) and a
"fix it" nudge (nearest passing shade). Failing pairs block Save with an explanation, not a
hard error. CRM Templates page gets the same report per theme for staff QA.
**C. Remix ✅ BUILT 2026-09-11 (platform 16c7b41, local, push hold)**: `packages/site-data/src/remix.ts`
`remixPalette(seedHex, register)` implements the colour-guide recipe (§3 of `docs/COLOR_GUIDE.md`):
button-safe accent, neutrals as visible tints of one hue (seed-tinted / cool / warm, 20-26% saturation at
96.5% lightness, since 5% reads as white), a "Deeper accent" when the seed is too faint as link text
(else "Muted accent"), a complementary accent, and a `pop` for the deep band; every candidate scored with
`paletteVerdict`, body-text failures dropped, AA first, always 3-5 cards. CMS: a **Remix row** at the top
of Colour palette (seed = the accent in use, "From my logo" = the logo's dominant colour sampled on a
canvas via `lib/logoColor.ts`, or a typed hex); candidates render as palette cards with the AA / Review
badge and a one-line note, and save exactly like a curated palette (`remix:<id>` choice). Test tenant:
**Remix Barbers** (cloned from Argyle via the CMS Duplicate flow, owner peechizzy, previewing). Verified
there: 5 candidates from #C97C4A (Deeper + Complementary AA, three Review), "From my logo" seeded #D1814D
from the cloned logo mark, "Deeper accent" applied → Brand colours #221B16 / #CB7035 / #F8F6F4, visibility
check Passed on all 8. Headless sweep of 9 seeds × 2 registers: 5 candidates each, never a body failure.
Not built (deliberate): AI, per-section colours, dark-mode inversion. **Walk findings 2026-09-11 (both fixed, local)**: the "theme reverts on inner pages" Peter saw is the DEV `?site=` preview param being dropped by in-site links (now remembered per browser session in every template's `siteResolution.ts`, platform 4baace9; production resolves by hostname on every page, verified on `remix-barbers.stemfra.com`); and clones kept the source brand name inside content, so `cloneContent` now rewrites it for clones and Starter-provisioned tenants (server ad612ad, Remix Barbers repaired; no real tenant was affected).

## P34 — Lead text conversations in the drawer (Peter's ask 2026-09-11, amoCRM parity)

Peter's ask: a chat window on the lead sidebar to text a lead with his four amoCRM scripts
(#1 missed you on the phone, #2 website built for you, #3 free booking website, #4 voicemail
script), reply notifications for the assigned rep, plain texts without a template too.

**✅ BUILT + PUSHED 2026-09-11 (server fa2b0d2, CRM b5a9a43).** Server: `POST /api/twilio/sms/send`
merges `{{first_name}} {{business_name}} {{rep_name}} {{demo_link}} {{claim_link}}` from the
lead, appends the CA/UK sign-off, stores the merged text; `POST /sms-inbound` bells the lead's
`assigned_to` (`crm_notify` kind `sms_reply`, route `/leads?lead=<id>`). Migration
`docs/migrations/sms_templates_v1.sql` (applied): `email_templates.channel` (email | sms |
voicemail) with S1/S2/S3 + V1 seeded, `sms_messages.read_at`. CRM: drawer **Messages** button
(unread badge) → second-layer panel hosting `ConversationPanel` (consent gate: `sms_consent_at`
or an inbound text, otherwise locked with the reason; **Templates ▾** picker with client-side
merge; marks the thread read on open); `hooks/useSmsInbox.js` (unread map, mark-read, threads);
Email Templates page → **Templates** with Outbound / Lifecycle / SMS / Voicemail tabs (subject
hidden off email); Inbox **Texts** tab (works without Gmail); lead card unread chip. Verified in
the CRM. Not test-sent (Twilio production-only rule). Compliance stands: no cold texts, consent
only from Send Claim during a call or an inbound message.

**Not built:** MMS, scheduled texts, per-rep sender numbers, a text sequencer (cold SMS is
prohibited anyway).

**Follow-ups same day (Peter's review):** composer sized like the email ReplyBox (120 to 320px,
Enter = new line, Cmd/Ctrl+Enter sends); **Not relevant** tag for texts meant for a recycled
number's previous holder (`sms_ignored_numbers` + `sms_messages.dismissed_at`, migration
`sms_ignored_numbers_v1.sql` applied; the webhook files future texts dismissed with no bell; Inbox
→ Texts hides them behind "Show not relevant (n)" with Restore; threads tied to a lead or contact
cannot be dismissed). First real case: TM Legal (Blackpool debt collector) texting "saeid" on our
UK line, 2026-09-11. **Unlock after a call (Peter's question "how do we unlock the text field?"):**
`ConsentGate` in the Messages panel offers "Owner agreed on the call" once a call is in the timeline;
a confirm card names the owner + the call time, then stamps `sms_consent_at` with provenance
(`lead_sms_consent_v2`: source verbal_call | send_claim | inbound_text | form, by, note with the call
SID) and logs it. Research behind the gate (Twilio policy, CTIA, TCPA, PECR, CASL, how Kommo /
monday / HubSpot handle it) is in `docs/OUTREACH.md` §6b. Verified in the CRM (confirm card, Cancel);
not stamped on a real lead.

**Do not call (2026-09-11, Peter's ask during the first calling shift) ✅ BUILT (CRM, local, push
after Peter's shift):** `leads.do_not_call` / `do_not_email` finally have a UI (drawer button with
confirm + "also stop emails", red pills, dialer refusal, Send Claim / outreach hidden, composer
locked, "Contact rules" facet, "Callable now" excludes DNC + unreachable, activity row as the
internal do-not-call list). Server enforcement was already in place. Same slice: the Leads Table
view shares the Pipeline toolbar (country, verticals, search, Filters, presets, saved views).

**Call transcripts + lead notes (2026-09-11, Peter's asks on the first calling shift) ✅ BUILT
(local, push after the shift):** every recorded CRM call is transcribed and summarised on the
server after the recording lands (`lib/callTranscripts.js`, OpenAI; migration
`call_transcripts_v1` applied), shown under the recording in the drawer's Activity panel
(Transcribe button backfills older calls); the drawer's Notes section gained Add note (stamped)
and Edit. Also fixed the same evening: the `<Dial action>` "application error" voice. Next
ideas from this: a "Calls" insights page that aggregates the summaries' questions and
objections across reps (feeds the call script and the FAQ), and "Add to notes" from a summary.

## P39 — Onboarding v2: the five-minute setup (Peter's ideas 2026-09-13, agreed; in progress)

From the Neil call and the YouTube Studio comparison: a new owner should finish without
Stacy, with the site ready to publish when the dashboard opens. Agreed pieces, in build order:
(a) **services as a tick list** ✅ BUILT 2026-09-13 (revised same evening, Peter: the tick list
is the SEED SITE's own services, not a second hand-written catalogue, which produced "Kids'
haircut" beside the seed's "Children's haircut"; `lib/serviceCatalog.js` now reads the seed,
verified on Remix Barbers, 7 rows all ticked with demo prices): per-vertical curated catalogue
(`lib/serviceCatalog.js`, 15 to 21 items per vertical, fitness ones as classes), served by
`GET /api/cms/service-catalog?siteId=` with "others in your trade also offer" from
`service_suggestions` (migration applied; every custom name an owner adds is recorded via
`POST /suggest`); wizard step 2 = tick + price + minutes in place, sample services that are not
in the catalogue under "Other services on your site", "Add your own" at the bottom. Verified on
Remix Barbers (tick creates the row with price, add-your-own records the suggestion, test rows
removed). Same day: the wizard is a fixed panel, only the card body scrolls (YouTube modal).
Peter's refinement (same day): ONE list, no "other services" group and no community chips
for owners; the suggestions are for STAFF to review and promote into the curated file so the
onboarding list stays short. 🔜 A small CRM view over `service_suggestions` (name, vertical,
count, first seen) with a "promote" note is the follow-up; until then read the table by SQL.
(b) **team optional + empty-team hiding** ✅ BUILT 2026-09-13 (LOCAL, push hold), verified on
Remix Barbers: wizard step 4 offers "Just me" / "Me and my team"; "Just me" calls
`POST /api/cms/team/solo` (`routes/cms/team.js`), which replaces the sample people with ONE
bookable owner record (name from the owner's contact, `is_owner`, `metadata.solo = true`),
links it to every service and writes weekly availability from the business hours (verified: 7
links, 6 days, Sunday closed, slots computed by the engine). `@stemfra/site-data` `useTeam`
now returns the DISPLAY team (empty for a solo shop, `visibleTeam` / `isSoloShop` in
`team.ts`); BookPages pass `{ includeSolo: true }` and `soloShop` so `BookingForm` and
`MultiServiceBookingForm` skip the "choose your barber / stylist" step (indicator shows 4 or 3
steps, Back returns to services). All six HomePages skip `team_grid` and all six Layouts drop
the Team / Barbers / Stylists / Teachers / Coaches nav (crossfit footer too) when the display
team is empty. The moment a second person is added in the CMS, everyone (owner included)
renders as a normal team; `siteCompleteness` unchanged. Not done: the booking-page intro copy
still says "pick a barber" on a solo site (slice (c) rewrites page copy).
**Added 2026-09-14 (Peter's three asks):** (f) **"Find my business on Google"** ✅ BUILT + VERIFIED
on Remix Barbers: a tab on wizard step 1; the owner types the name and city, the server runs
one Apify Google Maps search (`lib/googlePlacesFinder.js`, `POST /api/cms/google-profile/find`,
about 50 s, a fraction of a cent) and lists candidates with address, phone and rating; "Use
this" fills name, location name, address and phone into the form and `POST /use` stores the
business hours (Google's "10 AM to 8 PM" rows converted, verified on Neil's Barbershop: Mon
to Thu 9 to 20, Fri 9 to 22:30, Sat 8 to 22:30, Sun 11 to 15), any social links Google lists,
and the facts snapshot under `site_theme_settings.metadata.gbp` (has_profile, profile_url,
place_id, snapshot) for slice (c) and the GBP page. Built for ads traffic (Peter: "big win").
(g) **Quick remix on the Publish page** ✅ BUILT + VERIFIED: `QuickRemix.tsx` above the Publish
checklist (the page the wizard lands on): seven curated palettes for the theme's register plus
"Theme", and "Show me three looks" (the auto remix bundles); one tap applies, writing exactly what
Colour palette and Section styles write. (h) **Claim → CMS signup**: VERIFIED 2026-09-14 that
the marketing Claim button already lands on `cms.stemfra.com/signup?starter=…&claim=…`
(`lib/claimOffer.js`, clicked live); no /start hop exists in the current code. If Peter saw
/start, it was an older deploy of the marketing site or another entry link; report the URL.
(i) **Listing panel beside the form** ✅ BUILT + VERIFIED 2026-09-14 (Peter, from Facebook's
"Desktop preview" while creating the Stemfra page, laid out like Fresha's listing):
`ListingCard.tsx` on the right of every wizard step (lg and up) shows name, category, rating
from the Google snapshot, phone, address with Get directions, Book now / Call pills, services
with prices, opening times, team ("Just you" for a solo shop) and the readiness ring (7/10);
it reads what is being typed through `lib/wizardDraft.ts` (verified: typing a name changes the
card at once). Meant to be reused by the P38 unclaimed listing and the GBP card. Same day:
Publish page cards now sit with the settings pages' 16 px gap (Peter's design-system note).
(j) **Stage 5 "Your look"** ✅ BUILT + VERIFIED 2026-09-14 (Facebook's "Customise your Page":
profile picture, cover photo, action button): logo upload + "Find your logo" (the Branding
pieces reused), cover photo = the home hero image (saved into the hero section), booking
button label with per-vertical presets (writes `metadata.labels.book_cta`, the same key as
Buttons & labels). `logo` is a recommended readiness key, so the stage shows as done when a
logo exists but never forces the wizard open. Complete = "Finish & preview" → the Publish page
(Remix + checklist). Hours step gained "Apply Monday to Tuesday through Friday". The listing
card shows the logo badge and the chosen button label. Goal stated by Peter: the whole site
set up from these screens, like Facebook. Still for slice (c): AI copy, favicon from the
builder when none, Google hours rule on the hours step.
**Same evening, Peter's restructure (Facebook's first page carries contact, address AND hours):
the wizard is FOUR stages** ✅ BUILT + VERIFIED: Your business (name, location, address, phone,
email, opening hours as two cards "Open at set hours" with the week summary and an Edit popup
[HoursEditor + time zone + "Apply Monday to Tue–Fri"] or "Always open"), Your services, Your
team, Your look. The separate hours stage is gone. "Your look" lost the website logo finder
(Peter: not needed here); it now has drag-and-drop upload plus the logo and favicon BUILDER
inline, and the cover photo picker offers Stock photos when enabled. Logo and cover are
optional (Replace / Remove, no Skip needed: the theme defaults stay).
**Later that night (Peter's shots of Facebook's first page):** ✅ BUILT + VERIFIED: (1) no
re-typing: the finder runs by itself when step 1 opens, with the business name plus the state
and country the owner gave at signup (`contacts.state/country` now in the owner context); a
site with a stored Google match opens straight on "Enter details"; (2) the address is every
standard line (Street, City, State / Province, Postcode; an autocomplete pick fills all four;
the Location section keeps the single `address` string for the templates and gains
`address_parts`); (3) actions are real buttons in the primary register (Edit hours, Search
Google, Use this, Use these hours), not underlined text. Honest note: the video frames were
never extracted (yt-dlp 403); the UI details came from Peter's screenshots.
**Then Peter's correction (match Facebook's panel field for field, minus Website)** ✅ BUILT +
VERIFIED: step 1 has no business-name field (signup gave it; the listing card shows it) and
three headed groups. Contact: Phone via the SHARED `PhoneField` (flags, every country,
libphonenumber; Peter 2026-09-14: "use what we already have", it was already in SmsAlertsCard
and the template forms) and Email address. Step copy per Peter: "Tell us about your business."
/ "...your services. You can edit or add more." / "...your team." / "Let us customise your
brand. Add a logo, pick a cover photo, and choose what the booking button says."
**Team step (Peter, same night)**: no "Just me / Me and my team" choice any more; a plain
"Team" list (names + Add) in the Hours-section register. Rule: **a team of one IS the solo
case** (`isSoloShop` / `visibleTeam` in site-data now treat a single active member as
solo, whoever that one is; the older `metadata.solo` flag still counts). "Save & continue"
calls `POST /api/cms/team/defaults`, which links every active member to all services and
gives them the business hours as availability where they have none, so a name typed in the
wizard is bookable at once. Side effect to know: any existing site with exactly one active
team member now hides its team section and skips the booking picker.
**Business finder + launch screen (Peter, 2026-09-14, later)**: the Address field's dropdown
lists the businesses Google Places knows under the signup name as the owner types (instant,
store icon, green "Match" tag on the exact name; a pick fills phone/address/hours + snapshot
via `/use` with no Apify wait); the grey box is "Business finder" with "Find my business" =
the Apify search as fallback. "Make it yours" is "Branding". **Finish & preview** opens the
launch screen: the whole site in a frame, Dashboard left / Publish right; Publish plays the
checklist (configuring → building → deploying → live) around the real publish call, then the
🎁 "your site is now live" card with the address to copy, View and share links; missing
required items show with Fix links. VERIFIED on Remix Barbers end to end (published, then
returned to preview). "External URL" badge removed from image/video fields; listing cover
twice as tall. LOCAL, push hold. **Then (same day, Peter "do as you recommend")**: the wizard
is the basic update path too: `?setupWizard=1` opens it on live sites, Dashboard quick
action "Update your website" (replaced the tour), Stacy row "Run the setup wizard" (last,
auto-done via `setup_wizard_dismissed`); Team step rows = photo + name + role + optional
email; Pronouns field removed from the team editors (never rendered). **Setup progress badge**
(Peter's idea, same day): the checklist moved out of Stacy into a top-bar ring + count with a
dropdown (To do / Done tabs, stages, the same row actions); Dashboard "Finish setup (6/13)"
quick action + Setup card open it; Stacy = chat + history only. BUILT + VERIFIED, LOCAL.
**Top-bar Publish = the action** (Peter, same day): "Publish" runs the shared PublishFlow
(checklist → live card; not ready → the Publish page shows what is left), "Published" +
menu Publish / Unpublish (confirm) + Open live site last; "Publish settings" item gone; the
Publish page button and the wizard use the same flow. VERIFIED (published + unpublished
Remix Barbers from the bar), LOCAL. **Walk-through on a fresh tenant (harbor-lane-barbers,
2026-09-14)**: fixed wizard closing after stage 1, demo contact prefill, service order, listing
copy. Open: /signup has no industry picker (direct visitors default to barbers); builder
wordmark + brand text both in the header (dark headers need a light ink or brand display =
logo); hero copy still the demo's (slice c); "remove all sample people" affordance. Location: Address, Town/City (the state
rides inside it, "New York, NY"), Postcode; the Google lookup is a button inside the section
with the suggestions inline (it also runs once on open from the signup's name + state; a
stored match shows "Matched to your Google listing"). Hours: two radios, "Always open" and
"Open at selected hours" (the second opens the Selected hours popup); no hours summary in
the form, the listing card carries it. Listing panel widened to 380 px.
(c) the "finish" job ✅ BUILT 2026-09-15 (LOCAL, push hold; server `lib/siteCopy.js`,
`POST /api/cms/site-copy/draft`, CMS `lib/useSiteCopy.ts`): one GPT call rewrites the
sections still carrying the demo's words (home hero / intro / story / menu blurbs / team
intro, About, Services and Book intros, the FAQ, the team page intro), writes service
descriptions still equal to the seed's, and the page titles + descriptions for home,
services, about; the demo CLAIM sections (awards, stats band, partner logos, cloned
reviews) are hidden until the owner adds real ones; the composed monogram becomes the
favicon when the tab icon is still the demo's. Only text the owner never touched is
rewritten (text-only sample detection, brand-masked, positional match against the seed);
a second run is a no-op. Verified on the throwaway barbers tenant: 12 sections, 7 services,
3 pages, 5 sections hidden, about 45 s. Hours rule (Google hours prefill) shipped with the
finder on 2026-09-14. Not done: an owner-facing "written for you" badge in the page editors.
(d) the honest finishing screen ✅ BUILT 2026-09-15 (typechecks; not walked in the browser
yet): `LaunchScreen` runs the finish job on mount for a site that is not live, plays a
ticking list (headline, services, FAQ, pages) in the frame area, mounts the frame after,
and shows a dismissible "Written for you" note. Lands on the launch screen, not the
dashboard (Peter's 2026-09-14 flow). (e) the stepper redesign (no photo above the form), billing
moved to publish time, custom domain out of onboarding, Stacy's checklist becomes optional.
Required fields stay required (Peter, 2026-09-01).

**(j, evening 2026-09-14) Branding step final shape + logo recommendations ✅ BUILT + VERIFIED
(LOCAL, push hold):** dense "Add a logo" tile first; "See recommendations" dropdown = three
logos composed in the background from step 1 (`stemfra_cms/src/lib/logoSuggestions.ts`), ink
radio rows, a pick saves logo + favicon; booking-button section REMOVED (template default);
"AI Front desk" Yes / No. **Adaptive logos:** composed wordmarks `currentColor`, inlined by
`BrandLockup` in every header/footer, 18 px tall (Peter's pick). Also that evening: number-only
price/minutes, team edit popup, Fix-reopens-the-step, billing seeded from step 1 (no billing
step in a free signup), signup draft survives refresh, focus ring for buttons. Full list in the
root handoff's 2026-09-14 evening bullet. Round-3 walk reached PUBLISH → live card → dashboard
on `harbor-lane-barbers-2` (throwaway, to purge).

**(k) Owner lifecycle emails (Peter, 2026-09-14, agreed).** Audit that day: signup sent NOTHING,
publish only rings the in-app bell, and no account-security event emails an owner (Facebook's
"was this you" mails were the reference). Order agreed:
1. **Registration successful** ✅ BUILT 2026-09-14 (LOCAL, push hold): `templates/transactionalEmails.js`
   `ownerWelcome` + `lib/ownerWelcome.js`, sent fire-and-forget from BOTH signup paths after
   provisioning; subject "Registration successful", "Hi <first last>,", Peter's paragraph, site +
   sign-in rows, "Configure your website" = CMS magic link to /setup, ghost "Open your dashboard".
   Preview `/dev/preview/owner-welcome`. Test copy delivered to Peter's inbox 2026-09-14.
2. ✅ **"Your website is live"** BUILT 2026-09-15 (LOCAL, push hold): `lib/siteLifecycleEmails.js`
   fired from `publishSite` / `unpublishSite` (owner path passes `actorName: 'owner'`, staff
   and scripts are named as Stemfra support in the unpublish twin); subject "<Business> is
   live", rows + "Tell your clients" (magic link to /customers?import=1, where the import ends
   in the website announcement), social links second, buttons Website / Dashboard (Peter).
   Demo sites and test mailboxes skipped. Previews `/dev/preview/site-live` and
   `/site-unpublished?staff=1`; test copies delivered to Peter's inbox.
3. ✅ **Account security slice** BUILT + VERIFIED 2026-09-15 (LOCAL, push hold): one template
   `accountSecurity` (five events: password_changed, email_changed, mfa_enabled, mfa_disabled,
   new_device; rows When / Device / Network / Account; "This wasn't me" → /profile/security;
   preview `/dev/preview/account-security?kind=`). `lib/securityEvents.js`: email (test mailboxes
   skipped) + a `security` bell row on every site the owner runs (the locked category).
   Endpoints `POST /api/cms/security/event` (the CMS reports password + 2FA changes, which happen
   directly against Supabase Auth) and `POST /api/cms/security/session` (device id from
   localStorage on every sign-in; `cms_known_devices`, migration applied; the FIRST device an
   account records is silent, later unknown devices notify). CMS: `lib/securityEvents.ts`, hooks
   in `auth.tsx` + `ProfilePage.tsx`. Verified: device 1 silent, device 1 again known, device 2
   notified (Safari on iPhone), bells landed; a test copy delivered to Peter's inbox. Not wired:
   sign-in email change (the CMS has no email-change flow yet; the template already covers it).
4. Later: billing details changed, domain connected/bought, site unpublished/deleted, team member
   removed. Email verification at signup stays OFF on purpose (free flow, short).

## P48 — Product menu (what we make vs who it is for) + AI products priced by subscription (Peter, 2026-09-29; menu, Custom and the Stemfra AI button DECIDED the same day; NOT built)

### Revised plan: managed websites, Custom Software and AI (2026-10-12)

**✅ Peter confirmed 2026-10-12:** agrees with the browser/source journey-review recommendations; requested this phased plan before continuing. The older September design decisions below are historical where they conflict with this plan. Their release hold remains active.

**Outcome:** clearly position a $299/month managed website offer alongside custom software and the separate Stemfra AI product, using the existing premium design, working website catalogue and self-service CMS. Do not rebuild the marketing site or turn onboarding into a required sales meeting.

**✅ Peter confirmed 2026-10-12, commercial baseline:** same existing website offer at $299/month instead of 5% commission; 14 days free; no card required; bank-transfer invoices using the existing Stemfra/Airwallex hybrid. Existing Front Desk, Stacy, routine setup assistance and ongoing content updates stay included. No new arbitrary assisted-edit quota or feature removal. $299 is the working price Peter asked to record; he requested a comparison with $200 before final public copy approval, so willingness to pay remains unvalidated.

Trial starts when the workspace is successfully created, with the end date visible. Before expiry, invite explicit continuation at $299/month; issue the first invoice after that choice, with the paid period beginning on payment confirmation. No automatic card charge or unexpected debt on trial expiry. Recommend a short transfer-processing grace period and 30-day recovery retention; exact durations/operational handling need definition. Renewals invoice in advance. Cancellation stops future renewals and service continues through the paid period; no cancellation fee or required call. Document supported exports, domain ownership/transfer and retention, without promising platform source-code export. Coming-soon features remain labeled as such.

Reuse billing_charges, Airwallex OUT_OF_BAND mirror, branded invoice/reminder/receipt emails, provider PDF with Stemfra PDF fallback, and deposit reconciliation. Verify current reconciliation gates and an authorized payment lifecycle before launch; dated audit findings are not fresh production checks. Preserve invoice-specific payment references because multiple $299 invoices cannot be uniquely matched by amount alone. AI/card/menu release holds remain; website bank-transfer terms do not lift them.

**Preserve:** short hero; Products sidebar; Solutions selector; existing ready-made website previews and starter selection; Contact/Login; CMS setup, editing and Remix; AI homepage design and role-led journey. Customer copy calls the catalogue websites, not empty templates. No new claims of customers, results or integrations without evidence.

| Phase | Status | Deliverable and completion gate |
|---|---|---|
| P48.0 Existing journey review | ✅ DONE 2026-10-12 (browser/source review; no implementation commit) | Principal marketing paths, two signup routes, demo-owner CMS setup/editor/Remix/import/billing/support, AI home/role/signup/pricing reviewed. No completed account, booking, payment or AI execution claimed. |
| P48.1 Define offer and copy | ✅ DONE 2026-10-12: copy and $299 approved; operational billing details tracked in P48.4 | Same offer, $299/month, 14-day trial and bank-transfer invoices recorded. Draft Websites, Custom Software and AI copy for Peter before coding. Final price, scope units and operational details below remain to confirm. Reuse existing FAQ topics. Gate: reviewed scope and copy; no application edits in this phase. |
| P48.2 Additive local previews | 🔜 NEXT: Peter visual review; local preview built 2026-10-12, uncommitted | Add Websites, Custom Software and AI introduction routes in marketing; reuse existing components and AI presentation. Preview concise navigation labels Websites / Custom Software / AI while retaining access to Products/Solutions, Contact/Login and the current homepage. Incorporate selected real, clearly labeled demo screenshots from P47. Add pricing-summary treatment with accurate units and readiness. Gate: Peter's desktop/mobile browser review of reversible local changes before replacing existing surfaces. No production release. |
| P48.3 Reconcile the full journey | Pending preview review | Converge homepage and catalogue signup on the chosen CMS journey, preserving starter/claim/attribution context. Align homepage, About, pricing, FAQ, help, signup and CMS wording with self-service plus optional support. Preserve custom enquiry intent through Contact. Resolve coexistence/replacement and domain wording, replace misleading customer/two-tap claims, update stale setup instructions. Investigate the demo calendar observation before diagnosing or fixing availability. Gate: reviewed route/content matrix and browser walkthrough; tests for changed signup/context behavior. |
| P48.4 Billing and entitlements | Pending final commercial terms and scoped billing design | Audit reusable subscription/cancellation code first. Implement the agreed website subscription, billing start, invoices, payment failures, cancellation/service end, export/retention and optional add-on entitlements across server/CMS. Keep website billing separate from AI credits. Reconcile CRM/business-plan/sales materials with the final offer. Specify transition rules before replacing commission; do not assume demo rows are customers. Gate: lifecycle tests, provider readiness and agreed customer terms; shared-service/schema changes scoped with Peter. |
| P48.5 Validate and release | Held for existing release gates | Validate approved signup→setup→publish→booking and subscribe→cancel paths using designated test data; check responsive pages, links, route prerendering, pricing consistency and relevant builds/typechecks. Keep external-effect tests separately authorized. Confirm AI is ready for cold visitors and links back. Release only after applicable Airwallex/card gates and explicit push/deployment authorization. Record deployed evidence separately from local checks. |
| P48.6 Measure first cohort | Pending release | Track website-preview→signup→setup→publish→paid conversion, support minutes per business, assisted-edit demand, gross margin, cancellation reasons and add-on uptake. Use the first paying cohort to adjust packaging; no invented traction or volume targets. |

**P48.1 decision sheet, to make the offer concrete:**
- Price basis: $299/month is the agreed direction. Define currency, per-site/location coverage, taxes, extra locations and whether a setup fee exists. Use a fixed price rather than “from” if the stated scope is fully covered.
- Setup: selected working website, business/services/team/branding wizard and existing included assistance. No setup fee. Trial/payment timing follows the confirmed baseline above; clarify supported migration work without quietly reducing the existing offer.
- Ongoing service: preserve existing included features, owner edits, routine assisted content changes, hosting/SSL, maintenance and product updates. Bound requests by nature and turnaround, not a new arbitrary monthly quota. Bespoke redesign, new functionality and custom integrations are separately scoped; do not promise unlimited staff work.
- Support: channels, hours/time zone and response target. Distinguish first response from resolution. Keep calls optional and ensure commitments can scale.
- Cancellation: notice method, end-of-paid-period behavior, refunds, exports, retention/deletion, domain ownership/transfer and hosted-site/code rights. Do not promise portability beyond what can be delivered.
- Add-ons: existing customer-facing Front Desk remains included, as does Stacy owner assistance. Standalone AI and additional automation can be separate offers; no automatic move of current features behind an add-on. No ElevenLabs implementation, configuration or calls until Peter confirms.
- Other offers: Peter approved a $10,000 custom-software starting price on 2026-10-12. Local offer and Pricing previews now display it, with final scope and price agreed before development; hosting/maintenance are separately quoted where required. AI pricing sections also added locally. Marketing build passed (96 routes); browser validation pending automatic permission-check recovery. AI remains its own $29/$79/$199 credit product as recorded in its canonical pricing source; a $299 managed automation service would be a separate explicitly scoped offer, not an automatic price replacement.

**Review findings to retain:** CMS provides four-stage setup and live listing preview, page editing and Remix; FAQ already covers setup/changes/support/cancellation. Marketing `/start` differs from CMS starter signup. Pricing coexistence language conflicts with FAQ replacement language. Custom pricing passes `interest=custom` but Contact reads `vertical`. Public demo booking reached the calendar with all October dates disabled for the selected barber; cause and completion were not verified. Screenshots in `/tmp/stemfra-journey-review/` are review evidence, not final production assets.

**Boundaries:** all implementation starts locally; no push, deployment, remote migrations, outreach or charge activation implied. API background jobs remain disabled for local previews. Twilio remains production-only; ElevenLabs remains on hold. AI and Platform stay independent products/repositories; preserve AI milestone and card-payment gates. Root workspace docs remain unversioned.

### September decisions and standing release gate

**RELEASE GATE (Peter, 2026-09-30): everything about Stemfra AI on stemfra.com (the two AI
entries in Products, the "Stemfra AI" navbar button, AI pricing, the AI menu images of P47) is
HELD until CARD PAYMENT is live.** Reason: Stemfra AI sells subscriptions and balance top-ups,
which need a card; bank transfer cannot carry them. The items stay documented here and ship
together on that day. **Corrected by Peter the same day: the WHOLE menu change is held too**
(Products / Solutions split, Custom as the seventh Solutions entry, the menu images): a
Products menu with only "Websites and booking" in it is not worth shipping alone. **The one
piece cleared to ship now: the Custom switch on the pricing card.** **Card = Airwallex**
(Peter, 2026-09-30): Stemfra's Airwallex account manager is working on the Payments approval
and an update is expected within the week; Stripe is not being pursued. Also OPEN, not
decided: whether the WEBSITES price stays commission (5%, cap $400) or moves to a
subscription; discussion in `docs/research/PRODUCT_MENU_AND_AI_PRICING_2026-09-29.md` §6.
Card options and what is open:
`docs/STEMFRA_AI_BILLING_INPUT_2026-09.md` section D (Airwallex Payments unapproved, no date;
a dormant Stripe subscription checkout on Stemfra's own account exists in code; the state of
the Stripe account is unverified, Peter to read).

**DECIDED by Peter 2026-09-29 (build list, stemfra_client, nothing started):**

1. **Menu**: Products = what Stemfra makes (Websites and booking, AI Front desk, AI Leads);
   Solutions = who it is for (the six business types + Custom as the seventh). Header today:
   Home, Pricing, About, FAQ, Contact, Login.
2. **"Stemfra AI" button in the navbar** (label decided: "Stemfra AI"), set apart on the right
   the way Vagaro sets "For Business" apart; links to ai.stemfra.com in a NEW TAB so the
   free-website funnel stays open. The two AI entries in Products link to the same site.
   NOT "For Business": Vagaro's label switches audience (clients vs owners), ours names a
   second product for the same audience. No top banner for now.
   **Gate before it ships**: the Stemfra AI session confirms ai.stemfra.com is ready for cold
   visitors (what it is, pricing, a sign-up path) and carries a link back to stemfra.com.
   Checked 2026-09-29: the page is public, title "Stemfra AI: hire the workflow"; its content
   was not read (browser-rendered).
3. **Custom** is introduced the way Vagaro introduces multi-location: a two-way switch on the
   pricing card, the second side replaces the price with a line about custom builds and a
   contact action (`/contact?interest=custom`, the existing `CustomCard` target).
4. The websites offer is unchanged, Front desk included. Stemfra AI's embeddable Front desk and
   Leads carry their OWN pricing, owned by the Stemfra AI session (no 5% there).
5. Items 1 to 3 ship together as one header + pricing change.

Still open: support bot and internal copilot as products (not until each has a page, a price
and a way to buy); how the $400 cap applies to an owner with several sites.

Background (as first recorded):

Peter's direction: Stemfra should be seen as more than websites for six verticals. Products
would hold Websites and AI; the AI agents (Front desk / AI receptionist first, Leads second: the
two products the Stemfra AI session is building) get a price each on the pricing page, as
subscriptions, not commission; Custom builds become a visible door. Research and the six open
decisions: `docs/research/PRODUCT_MENU_AND_AI_PRICING_2026-09-29.md`. Headline findings: every
competitor separates features from business types in its menu; every AI agent in the category is
a subscription with a usage allowance (GlossGenius Reception $50/month for 100 minutes + 200
texts, Goodcall $79 to $249 per agent, Intercom $0.99 per outcome), none a commission; the
website price (5%, cap $400, decided 2026-09-17) is a separate question and is NOT reopened by
this item unless Peter says so. Depends on: feature pages that do not exist yet, P47
(screenshots), the unit cost of a voice minute (unmeasured).

## P47 — Show the product on stemfra.com: real screenshots of the CMS, the booking flow and the Front desk (Peter, 2026-09-29; recorded, not started)

**🔜 NEXT within P48.2 (2026-10-12):** reuse the journey-review captures as references, then prepare selected labeled demo screenshots for the approved page previews. Final assets and insertion are not done. The older menu arrangement below is subject to P48's October preview review; AI release restrictions remain.

Peter: "We also need to show CMS demo screenshots like Vagaro did… the booking page and dashboard
and Front desk." The competitor survey found the same gap: GlossGenius, Booksy, Mindbody and Vagaro
all show the product within the first two screens of their home page; ours shows none. The new
hero line promises online booking and an AI receptionist, and nothing on the page shows either.

What to show (real screens of a demo site, never a drawn mock; the numbers on a dashboard shot
come from the seeded demo data and are labelled as a demo where a figure could read as a claim):
1. **The booking flow** on a phone: service, person, time, confirmation.
2. **The CMS dashboard**: bookings today, the 30-day chart, upcoming bookings.
3. **The Front desk chat** on a tenant site: a question answered, a booking card.
4. Optional: the setup wizard's listing preview, the Bookings calendar, the Reports page.

**Products menu images, AGREED by Peter 2026-09-29 (not built).** The Products drawer
(`stemfra_client` `BrowseDrawer.jsx`) keeps its design; its three entries (P48) each get one
real screenshot in a device frame, demo data only (Argyle & Sons), same dark warm backdrop:
- **Websites and booking**: a tenant site on a tablet with a phone beside it showing the booking
  step. The tablet mockup exists; the phone frame is to capture.
- **AI Front desk**: the chat widget open on a tenant site, mid-conversation, with the time-slot
  chips and the booking confirmation card.
- **AI Leads**: the leads table of the Stemfra AI dashboard with scored leads and one drafted
  message open. Depends on the Stemfra AI session having that screen; no stand-in from the CRM.
- Solutions menu: unchanged photos; Custom (the seventh entry) gets a collage of three
  different screens.
First raw captures (not framed, not final): `docs/research/shots-2026-09-29/menu-candidates/`.
A first-visit promotion popup on the demo site covers the chat launcher: close it before
capturing.

How: the CRM's Marketing Mockups studio already renders device-framed WebP from a live page
(`stemfra-ops/docs/MARKETING_MOCKUPS.md`), and the tutorial recorder already signs in to the CMS
headlessly (`scripts/tutorials/`). Store the results as `marketing_assets` slots so the page
hides a surface whose slot is empty. Where: a product band on the home page between the
"marketplace" paragraph and the catalogue, and on each future product page (P48).
Context: `docs/research/COMPETITOR_SITES_2026-09-29.md`.

## P46 — Cookie consent on stemfra.com and the tenant sites (Peter, 2026-09-29; recorded, not started)

Peter noticed that every competitor site opens with a cookie permission banner and asked that it
be noted for Stemfra. Checked the same day: the marketing site loads no analytics or advertising
script, and the tenant sites write one functional localStorage entry (the boot loader theme
cache), so nothing today requires consent. It becomes required the day any of these goes live,
and all are planned: the Meta pixel, the TikTok pixel, any analytics cookie, the owner-facing
traffic analytics if it uses a cookie. UK and EU visitors need opt-in before non-essential
cookies (PECR / GDPR); several US states need a visible opt-out.

Build, in order:
1. **One consent component** in `@stemfra/archetypes` (tenant sites) and its twin in
   `stemfra_client`: Accept / Reject with equal weight, a "Cookie settings" link in the footer,
   the choice stored first-party, no non-essential script loaded before a yes.
2. **A loader gate**: every pixel or analytics script goes through one `loadIfConsented(kind)`
   helper, never a bare script tag.
3. **Privacy policy**: a cookie section naming each cookie, its purpose and its life; bump the
   version in `lib/legalDocs.js` with the page's "Last updated" line.
4. **Tenant sites**: the owner's own pixels (a future CMS field) load through the same gate, and
   the banner carries the tenant's brand, not ours.
5. Theme the banner with the site tokens; verify it does not cover the booking button on mobile.

Rule until then: no pixel and no analytics cookie ships on any Stemfra surface before item 1 and 2.
Context: `docs/research/COMPETITOR_SITES_2026-09-29.md`.

## P45 — Agent abuse and spend protection (Peter's question 2026-09-28; audit done, build started)

Peter: "How are we protecting our AI front desk and other agents against bots or continuous use
that can drain AI credits quickly, or a cyber attack, especially as we are not metering tenants?"
Under the commission model no tenant pays for usage, so every abused message is Stemfra's cost.
OWASP calls the risk LLM10 Unbounded Consumption ("denial of wallet"); its mitigation is rate
limits + input caps + per-user quotas + monitoring together.

**Audit of the code, 2026-09-28 (verified by reading, not from docs):**

| Surface | Guard today | Gap |
|---|---|---|
| Front desk chat (`/api/site-chat`) | 20 msgs/min per IP+site (in memory), 12-message history, `max_tokens` 900, 10 KB body | IP read from the FIRST `x-forwarded-for` value (caller-controlled: a rotating header is never limited); no daily ceiling (28,800 msgs/day per address per site, about $290/day at ~1 cent a message on GPT-4o, estimate); no bot check; limits reset on restart |
| Concierge (`/api/concierge`) | same limiter, per IP | same gaps |
| Stacy (`/api/cms/assistant`) | owner JWT + site ownership | no rate limit at all; accounts are free to create |
| Mark inbound (`/api/voice`) | `max_tokens` 90 per turn | no maximum call length, no per-caller cap (outbound has a daily cap) |
| Sign-up, lead forms, newsletter, claim | per-IP limiters | same spoofable IP source |
| `agent_conversations.messages` | none | grows without bound per conversation |

**Build list, in order of value for effort:**

1. **One trusted client-IP helper** (`lib/clientIp.js`): `cf-connecting-ip` first (set by
   Cloudflare, not by the caller), then the LAST hop of `x-forwarded-for`, then the socket. Every
   limiter uses it.
2. **Budgets in the database** (`lib/agentBudget.js` + table `agent_usage`): per conversation
   (40 messages), per site per day (300), per IP per day (150), and a global daily circuit breaker
   with a staff alert. Past a cap the chat stops calling the model and answers with the contact
   path (phone, contact page), so the visitor is still served. Caps in `crm_settings.agent_budget`
   so staff can tune them without a deploy.
3. **Cloudflare Turnstile, invisible, on the first message** of a public chat (free, no request
   cap). Server verifies the token once per conversation. Needs a site key + secret (Peter,
   Cloudflare dashboard). Built behind env so it is off until the keys exist.
4. **OpenAI: a hard monthly budget + one key per agent** (front desk, concierge, Stacy, Mark,
   back office), so one drained agent cannot take the others down. Peter, OpenAI dashboard;
   the server already reads a key per call site, so this is env only.
5. **One Cloudflare rate rule** on `/api/site-chat/*` and `/api/concierge/*` as the layer in front
   of ours. Peter, Cloudflare dashboard.
6. **Cheaper model for the front desk.** The Stemfra AI session's bake-off (2026-09-18) cleared
   lower-cost models; decision + a live comparison on real front desk transcripts before switching.
7. **Stacy limits** (per owner per hour and per day) **and a maximum call length for Mark**
   (Twilio `timeLimit`) plus a per-caller daily cap.
8. **Input cap** (1,000 characters a message) and a **conversation size cap** in storage.

**Status 2026-09-28, PUSHED + LIVE 2026-09-29 (server d3c9b16; verified in production: the rotating-header test through Cloudflare is 30 x 200 then 5 x 429, the new routes answer, health green):**

- ✅ **1 BUILT + VERIFIED.** `lib/clientIp.js`; every limiter and consent stamp uses it
  (site chat, concierge, sign-up, setup call, claim, SMS consent, security events). Forwarded
  headers are trusted in production only (`TRUST_FORWARDED` overrides). Proof on the local server:
  35 requests with a rotating `x-forwarded-for` + `cf-connecting-ip` were 35 x 200 before, and
  30 x 200 then 5 x 429 after.
- ✅ **2 BUILT + VERIFIED.** Migration `agent_usage_v1` APPLIED (table `agent_usage`, function
  `agent_usage_bump`, service role writes, staff read). `lib/agentBudget.js`: `guard`, `capInput`,
  `capStored`, `fallbackReply`; defaults front desk 40 per chat / 150 per address / 300 per site /
  3,000 a day, concierge 40 / 100 / 1,500, Stacy 120 per chat / 200 per owner / 300 per site /
  2,000; overrides in `crm_settings.agent_budget` (re-read every minute). A site or global cap
  rings every admin's bell and emails `NOTIFY_EMAIL`, once a day per cap. Wired into
  `siteChatController.send`, `conciergeController.send`, `assistantController.send`. Verified:
  `scripts/agent-budget-test.js` (4th message from one address blocked at cap 3, a 5-message chat
  blocked, counters written and removed) and two real front desk messages with the address cap at
  1 (first answered by the model, second by the fallback, nothing stored for the second).
- ✅ **7 BUILT, NOT YET EXERCISED ON A CALL** (Twilio runs from production only): Stacy = 20 a
  minute per owner + the daily budget; Mark = `VOICE_MAX_CALL_MINUTES` (20) closing line +
  scheduled hangup, and `VOICE_MAX_CALLS_PER_NUMBER` (10 a day, in memory) answered with a spoken
  line and a hangup. First production call after the deploy is the check.
- ✅ **8 BUILT + VERIFIED.** Input cap per message (1,000 characters; Stacy 4,000; the
  concierge's client-sent history is cut the same way); a conversation stores its latest 200
  messages.
- ⏳ **3 Turnstile**: not started; needs the site key + secret (Peter), then the server check and
  the two widgets (`FrontDeskChat` archetype, the concierge widget in stemfra_client).
- ⏳ **4 OpenAI budget + one key per agent** and **5 the Cloudflare rate rule**: Peter, dashboards.
- ⏳ **6 cheaper front desk model**: decision + a transcript comparison first.
- ➕ **9 (found while building) Lock the origin to Cloudflare.** A caller who reaches the VPS
  without passing Cloudflare can write `cf-connecting-ip` himself. Firewall rule on the VPS:
  accept 443 only from Cloudflare's published ranges. Infra, Peter + Hostinger panel.

**WAITING ON PETER (recorded 2026-09-29 at his request; each is a dashboard walk, one action
at a time; mark "Peter confirmed <date>" when done):**

| # | Action | Where | What it unlocks | Status |
|---|---|---|---|---|
| A | Create a Turnstile widget (mode: invisible) for stemfra.com + `*.stemfra.com` + tenant domains; hand over the site key and the secret | Cloudflare dashboard → Turnstile | Build item 3: the server check + the two chat widgets. Secret goes to `.env` + the Actions secrets + `deploy.yml` | ⏳ not started |
| B | Set a hard monthly budget on the OpenAI organisation, then create one project key per agent (front desk, concierge, Stacy, Mark, back office) | platform.openai.com → Settings → Limits, and Projects → API keys | Build item 4: one drained agent cannot stop the others; per-agent spend becomes visible. Code change is env only | ⏳ not started |
| C | One rate limiting rule: path starts with `/api/site-chat/` or `/api/concierge/`, per IP, block for 1 minute past the threshold | Cloudflare dashboard → stemfra.com zone → Security → WAF → Rate limiting rules | Build item 5: abuse is stopped at the edge before it reaches the VPS | ⏳ not started |
| D | Firewall on the VPS: accept 443 (and 80) only from Cloudflare's published IP ranges; keep SSH as it is | Hostinger panel → VPS → Firewall (ranges: cloudflare.com/ips) | Build item 9: nobody can reach the origin directly and write `cf-connecting-ip` himself | ⏳ not started |
| E | Decide the front desk model after a side by side on real transcripts (the AI session's bake-off of 2026-09-18 is the starting evidence) | Discussion, then `FRONTDESK_MODEL` in `deploy.yml` | Build item 6: the cost of every message, abused or not, drops several times | ⏳ not started |

Order suggested: B first (it caps the worst case today, five minutes), then C, D, A, E.

Sources: OWASP LLM10 (genai.owasp.org/llmrisk/llm102025-unbounded-consumption/, verified),
Cloudflare "Stop malicious bots" (developers.cloudflare.com, verified), Turnstile pricing
(prosopo.io, third-party).

## P44 — CRM serves both products: websites + Stemfra AI (Peter, 2026-09-24; recorded, not started)

The CRM stays the one sales and operations surface for the company (leads, deals, billing,
compliance, team); the Stemfra AI dashboard at ai.stemfra.com stays the tenant's surface
(workspaces, usage, review queue). Two facts shape the join: the CRM's database is the platform's
Supabase project and Stemfra AI's is a different project, so the CRM never queries AI tables
directly; and the platform's staff JWTs come from a different auth project than the AI server
verifies. Every link is therefore an API call in one direction: provisioning and reads from the
CRM into the AI server's admin API, lead capture from the AI side into the CRM. Context:
`docs/STEMFRA_AI_POSITIONING_2026-09.md` (§3e catalogue, §3g dashboard) and
`docs/STEMFRA_AI_CONSOLIDATION_PLAN_2026-09.md` (§W1, §W5). Order = leverage; 1 to 4 make an AI
lead sellable, 5 to 9 make it deliverable and billable.

1. **Product dimension on leads.** `leads.product` = `websites | ai` (default `websites` for every
   existing row) and, for AI leads, `leads.recipe` from the catalogue slug list (front_desk,
   lead_finding, inbox, reports, knowledge, documents, integrations). A product pill beside the
   country pills; filters, presets and Table columns through the existing helper pattern
   (`stemfra-ops/src/lib/leadFilters` + `leadTable`). `vertical` stays for websites leads only.
2. **Lead value per product.** `stemfra-ops/src/lib/leadValue.js` prices everything as capped 5% of
   estimated sales. An AI lead = build fee + 12 months of run fee from the Recipe's plan row (item
   8). One branch in that file; every KPI, card and leaderboard follows.
3. **Scripts and templates per product.** Pipeline stages stay. `call_scripts` and `email_templates`
   gain `product` (default `websites`); the AI family gets its own script rows (discovery call for
   an automation build, not the provider-switch script) and an outreach family with the same
   compliance footer. The Template Manager filters by the lead's product.
4. **Inbound from ai.stemfra.com.** The workflow-page intake forms and the questionnaire's first
   step post into the CRM as leads with `product = ai` and the recipe set, through the existing
   `stemfra_crm` connector path in the AI runtime (same endpoint the Front Desk uses to capture
   leads). Source `ai_site`. No new intake endpoint.
5. **Hiring-signal leads land in the CRM.** The AI side's hiring-signal pool (consolidation plan
   §W3) writes its scored companies as CRM leads for Stemfra's own reps: source `hiring_signal`,
   rationale + drafted messages in the outreach draft section, `product = ai`. That is the Leads
   app, not a new app.
6. **Won → provision.** When an AI deal is won, the CRM calls the AI server's admin API to create
   the workspace and set `workspace_products`, the way Provision creates a site today. The AI
   server must accept a staff call: a second issuer (the platform project's JWKS) verified next to
   its own, with an allowlist of staff roles. Preferred over a shared service token because the AI
   server already verifies JWTs this way for its own project. Raised with the AI session through
   Peter (its repo, its change).
7. **Read-only "AI workspaces" page** under Platform in the CRM, fed by that same admin API:
   tenant, active recipes, usage, spend, last activity, open review items. No writes from the CRM
   into AI data.
8. **Billing on System A.** An AI client = a one-off build charge + a monthly run subscription on
   the same `billing_charges` ledger, same invoice PDF, same reconciliation engine. The plan
   catalog gets one plan row per Recipe with `build_cents` + `run_cents_monthly`; commission
   fields stay null for AI plans.
9. **Custom Pricing quotes** gain Recipe templates, so a scoped build quote for an AI workflow comes
   from the same quote tool the custom website builds use (P37).

**Idea recorded, not scoped (Peter, 2026-09-24, from Relevance AI's home page):** a live "what our
agents are doing" board in the CRM: a table or moving cards of requests passing through the AI
agents as they arrive and complete (task, run by, model, outcome, cost). Peter's own caveat: at
volume the stream moves too fast to read. Shape that survives volume: four aggregate counters
(tasks today, spend today, average cost per task, share reviewed OK) over a rolling window of the
last 20 events that only ticks when something new lands, plus a per-tenant filter; the AI server
already meters every dispatcher call, so the data source is its `executions` table exposed through
the same admin API as item 7 (polling every 10 s, not a socket, for v1). Belongs after item 7.

## P43 — Pre-invoice review (from the Gemini evaluation, 2026-09-22; recorded)

The 24-hour auto-collect rule (P13) bills 5% on a booking the owner forgot to mark as a no-show,
and the owner only finds out on the invoice. Before each monthly statement: a bell + email three
days ahead listing the bookings about to be billed with one-tap "did not happen" per row, and the
same list on the CMS billing page. Cuts disputes and the "audit your invoice" feeling that a
subscription tool never causes. Small: the meter already knows the rows. Source:
`docs/GEMINI_EVALUATION_2026-09-22.md`.
**✅ BUILT 2026-09-24 (server + CMS, LOCAL, built with the cap):** `lib/preInvoiceReview.js`:
`listReviewBookings(siteId)` = this month's bookings the auto-collect rule marked collected
(`metadata.auto_collected`, at-visit, not owner-entered) with totals at 5%; `sweepOnce` runs in the
last 3 days of the month (twice a day, `PRE_INVOICE_REVIEW_ENABLED=false` to stop; skips demo/test
sites), one bell (`cms_notifications` type `pre_invoice_review`, billing) + one email per site per
month (`ownerPreInvoiceReview`, magic link to /billing/invoices). `GET /api/cms/billing` now returns
`preInvoice`; the CMS Invoices page shows the "N bookings are about to be billed" card with a "Did
not happen" button per row (the Bookings page's no-show write, so the customer still gets the
"we missed you" note) and refreshes. Verified: dry-run list + sweep on the DB (window logic, 18
sites, 0 auto-collected rows today because the sweeper skips demo sites), email template render,
CMS tsc clean. Not verified visually (no auto-collected booking exists to show the card).

## P42 — Wizard intro slides per vertical (Peter, 2026-09-16; parked, no change today)

The `/setup` intro ("Let's set up <name>", Start) rotates the same four slides for every
business. The vertical is known by then, so the slides should show that vertical only.
Recommendation (Claude): reuse the vertical's DEFAULT DEMO SITE gallery photos, the ones
already localised on Cloudinary and curated per theme (barbers → argyle-and-sons, salons →
maison-lune, crossfit → forge-and-bell, yoga → wildflower-yoga-pilates, massage → lull,
spa → ellaris-spa; the `templates.is_default` demo of the site's vertical), falling back to
the marketing `solutions.<vertical>.hero.photo` slot, then the current stock photos. Wins:
zero new assets to shoot or licence, the photos are the same register the owner's site will
carry, one query (`site_media` of the demo, or the gallery section's images) and the slide
set follows the demo when it is refreshed. Alternative rejected: a new hand-picked set per
vertical (six more asset slots to maintain in Marketing → Site imagery). Where:
`stemfra_cms/src/components/onboarding/SetupWizard.tsx` `SLIDES` (the services slide
already reads the solutions photo; the other three are fixed Unsplash URLs).

## P41 — Native lead-gen (port the n8n System B workflow into the server; agreed 2026-09-15)

Peter's call after the v14 import: the workflow is glue (webhook → Apify → website gate →
normalize → Supabase dedupe → prompt → GPT → parse → insert → respond) and every piece
already exists in the server (`lib/googlePlacesFinder.js` runs Apify, the OpenAI client from
the lead drafts, `POST /api/leadgen/run-complete`, and the v13 normalize / build-prompt /
parse code, which are JavaScript files in `n8n-workflows/`). Helen's CRM already runs
lead-gen natively. Build `lib/leadgenRun.js` behind `POST /api/leadgen/trigger` (same
request, same `leadgen_runs` row, same bell), reusing those modules verbatim; keep v14 on
n8n as the fallback until three real runs match it (counts, readiness tiers, drafts). Lives
in the stemfra server next to the CRM routes, NOT in the Stemfra AI runtime. Wins: no paste
ritual, code in git with tests, progress from inside the run, the Supabase key out of
workflow exports (the n8n export writes it in plain text). Stacy / Front desk / Concierge
stay on n8n for now.

**✅ DONE 2026-09-17, PUSHED the same day (Peter: "push everything").** Full doc
`docs/LEADGEN_NATIVE.md`. What shipped:
- `lib/leadgenNative.js`: async Apify scrape (no 5-minute limit), every scraped place KEPT in
  `leadgen_places` with a status, free gates in code (own site → old-school → too quiet →
  duplicate), judging on gpt-4o-mini with NO draft, relevance decided in code from a named
  `reject_reason`, vendor emails dropped, per-place decisions on the run row, live progress.
- Drafts on demand (`POST /api/leadgen/draft`; Review card + queue buttons), Places app in the CRM
  (`/lead-places`, promote by hand), `rejudgePlaces()` to re-apply new rules to kept data for free.
- One run at a time (409), menu-bar progress chip, Fetch Leads locked while a run works.
- Booking-provider tag on the lead card + drawer; one call script per provider (Booksy, Fresha,
  Mindbody, Vagaro, other) opens by default (`call_scripts.platform`).
- **n8n cold lead-gen RETIRED** after the 100-place proof (Houston: 100 places, 3.4 min, DB =
  summary, 20 leads + 14 recovered by re-judging). `APIFY_TOKEN` secret ✅ Peter confirmed 2026-09-17.
- Targeting re-based the same day: busy shops (200+ reviews, 4.5+) without their own storefront;
  quiet shops are dropped (`GTM_PLAN_2026-09.md` §9). Owner-sourcing playbook:
  `docs/OWNER_SOURCING_2026-09.md`.

**🔜 Follow-ups (not started):** rewrite template A1 (subject + body assume a weak site; the new
audience has none) · a "Re-judge" action in the Places app · widen the gate to busy shops that own a
weak site but book through a marketplace (Places data: 7 of 8 busy Brooklyn salons own a site, 3 of
them book on Vagaro / Fresha / Booksy) · phone-number dedupe · Toronto + London batches (nothing
valid came from the n8n ones: it searched "<city>, USA") · CRM "Run details" view over the decisions.

**🔎 REVIEW (Peter, 2026-09-17): the CRM's pipeline value is built on assumptions that today's
business work puts in doubt.** `stemfra-ops/src/lib/leadValue.js` values every lead as monthly
sales × 5% × 12, with placeholder monthly sales per vertical (barbershop $8,000, default $8,000)
and 100% of a shop's sales flowing through the site. Against that: the agreed planning share is
10% of a shop's sales in year one (20% target); the new target is busy shops, whose sales are far
higher than $8,000; the $400 a month cap (DECIDED 2026-09-17) bounds every lead at $4,800 a year; and review count + rating are now on every lead and could drive the estimate. The price shape is now decided, so re-base it from the Master Plan v3
assumptions and label the card "estimated". (Fixed the same day: the Leads page cards counted
leads still in Review and test leads, 261 against a board of 70; they now count what the board
shows.)

**PRICING DECIDED 2026-09-17 (Peter): 5% of bookings, capped at $400 a month.** Supersedes "no
cap for now" (2026-09-16). 🔜 BUILD (not started): (1) `lib/commissionMeter.js` caps each site's
monthly commission at 40,000 cents and shows the cap line on the statement + invoice; (2) public
copy: Fees page, Pricing (headline offer card + FAQ "Is 5% more than I pay now?"), Claim page,
claim email line "We only earn 5%…", Help Center `billing/commission-explained`; (3) A1 / A1b and
the five provider call scripts (remove "do not promise a cap"); (4) CRM `lib/leadValue.js`: a
lead's yearly value is bounded at $4,800; (5) decks + Master Plan v3. **Terms ✅ Peter confirmed
2026-09-17:** the cap is PER LOCATION (site); at-visit sales count toward the cap, and only sales
from bookings made through our website count at all (walk-ins and owner-entered bookings carry no
commission, P36, so they never touch the cap). Still to set: currency equivalents for CAD / GBP.
**Status 2026-09-22 (rewritten):** Peter lifted the hold on the PUBLIC copy. (2) ✅ DONE 2026-09-22
(client `a9bbd5c5`, LOCAL): Home "How it works", Pricing sub-line + offer card, FAQ (three answers,
"Is 5% more than I pay now?" rewritten around the cap), About, Start (consent line + footnote), Claim
chips, the six Solutions FAQs, Fees policy (new "Monthly cap" paragraph, version 2026-09-22), Terms
(cap sentence, version 2026-09-22, STEMfra casing fixed), Help Center (what-is-stemfra +
commission-explained with a "$400 monthly cap" section, invoice bullet); concierge chat knowledge
(server `6356a74`).
**Status 2026-09-24 (rewritten):** (1) ✅ DONE 2026-09-24 (server, LOCAL): `COMMISSION_DEFAULTS.capCents
= 40000` (overridable in `crm_settings.commission`), `meterSiteCommission` bills `min(5% of GMV,
cap)` per site per month in the site's currency and stores `uncapped_cents / cap_cents /
cap_applied` on the line item + `metadata.cap_applied`; the invoice PDF prints the stream lines at
the uncapped 5% plus a negative "Monthly cap applied: never more than $400.00 a month" line so the
parts sum to the total (legacy rows render unchanged). Dry-run on the forge-and-bell fixture + a
synthetic capped month verified. (2) claim EMAIL line ✅ DONE 2026-09-24 ("…never more than $400 a
month"). (3) the three provider call scripts (On Fresha / Mindbody / Vagaro) ✅ DONE 2026-09-24
(DB): "Do not promise a cap." → "The cap is real and you can say it: never more than $400 a month
per location, and only bookings made through the website count." A1 / A1b carry no cap line yet
(wording is Peter's call; they never mentioned a cap, so nothing false is out). (4) ✅ DONE
2026-09-24 (CRM `leadValue.js` `COMMISSION_CAP = 400`, monthly commission bounded, so yearly value
≤ $4,800). (5) decks + Master Plan v3: not started. CAD / GBP equivalents still unset (the cap is
"400" in the site's currency until Peter decides).
**Flat plan UNDER CONSIDERATION, not effective (Peter, 2026-09-24):** a flat monthly subscription
beside the 5% plan as a second option for tenants. Research + recommended shape (flat at or above
the cap, "Pay as you go" / "Flat rate" naming, test in call scripts first) in
`PRICING_COMPETITORS.md` §2b. Nothing on the pages, in billing or in the scripts until decided.

## P40 — AI auto-draft SMS replies + Auto mode (Peter's ask 2026-09-15, recorded)

The CRM sends and receives texts through the production server's Twilio rails, and the
email side already drafts replies from our data (P24 `suggestReply` / `refineReply` on
leads, the CRM's "Suggested reply" card). Do the same for SMS: when a lead or client texts
back, draft the reply from the database (lead, business, offer, call notes) plus the SMS
history of that number, and offer it in the Texts panel one tap away. Then an **Auto mode**
per line or per conversation: **Auto** sends the drafted reply itself, **Off-hours** sends
only outside the sales hours (P28 `crm_settings.work_time`) or when no manager is online
(presence), **Off** drafts only. Every automatic send is logged as sent by "Auto (Stemfra)"
with the draft kept, STOP handling stays first, and a reply that needs a human (pricing
negotiation, complaint, unknown question) is left as a draft and bells the assigned rep.
Same context builder as the email drafts so the two never disagree. Not started; scope
after the onboarding arc closes.

## Pricing justification (Peter, 2026-09-15, to discuss)

_The full competitor table behind this block: `docs/PRICING_COMPETITORS.md` (saved 2026-09-16)._

**Decisions 2026-09-16 (Peter, after the Neil's Barbershop transcript):**
- **Flat 5% stays, NO cap for now.** A monthly cap was proposed (5%, never more than $X) and
  deferred: first sign clients and learn what they are comfortable with; a cap also gives
  away Stemfra revenue on exactly the shops that book the most. Revisit with real tenants.
- **The offer's story is win-back first, then new clients.** The pitch leads with the clients
  an owner already has: import the client list, win back the ones who stopped coming, ask
  every visit for a review; the rising rating and review count lift the Google Maps listing,
  and the new clients follow organically. Every win-back booking runs through the site's
  booking link, so it is commissionable even in a walk-in shop. The public review count is
  the proof loop (visible on Google, no tracked number needed). Pricing-page and script copy
  follow this story (CLIENT_GROWTH_OFFER.md is the base).
- **Target audience = owners who already act online** (readiness modern / middle); old-school
  listings are excluded at lead-gen (see LEADGEN.md); the company works remotely, no visits.
- Performance fee on Stemfra-sourced bookings stays an open idea for later, not for launch.
- **Go-to-market plan written**: `docs/GTM_PLAN_2026-09.md` (channels, funnel arithmetic, the
  $300 Facebook pilot with two prerequisites: funnel conversion tracking + a frictionless
  "See my site" claim flow; revenue per client re-based on outside benchmarks).

Commission stays at **5%** (the 2026-09-15 competitor read: mainstream tools land at 2.7 to
3.5% all-in for an established shop, 5% is the ceiling only Mindbody / Mangomint /
Boulevard / WellnessLiving reach, and nobody charges 10% on repeat clients; a 10% flat rate
was rejected). Next discussion: how the price is justified by what is delivered, which is
not a generic website: an agency charges thousands to build the same site, and the offer
adds booking, reminders, reviews, win-back, memberships, the marketplace listing and the AI
Front desk. Write that argument for the pricing page and the sales script, and consider a
performance fee (higher only on Stemfra-sourced bookings) as the growth lever instead of a
higher flat rate.

## P38 — Stemfra marketplace + claimable listings (proposed 2026-09-12, Peter; staging agreed)

> **Design base (Peter, 2026-09-14):** the marketplace listing card starts from the wizard's
> `ListingCard` (`stemfra_cms/src/components/onboarding/ListingCard.tsx`: cover, logo disc,
> name + category, phone + address, Book / Call / directions pill, services with prices,
> opening times, team, readiness ring). Reuse it, do not draw a second card.

Peter's idea: a Fresha-style public marketplace of local businesses with two things Fresha
does not have, a **Claim** button on businesses that have not signed up (a free website from
us) and a **booking-only** tier for shops that want a booking page, not a site. Built as an
extension of the claim funnel, never as a second product. **The data-source decision comes
first and decides the legal position:**

- **What Fresha actually does (corrected 2026-09-12 after Peter found Neil's Barbershop on
  fresha.com):** Fresha DOES publish pages for businesses that never signed up. Anatomy of an
  unclaimed page: name, address, "Show number" (phone behind a click), Get directions, a
  Mapbox map, opening times, a service list by category with NO prices, a clearly generic
  stock photo (not the shop's), buttons "Call to book" and "Website", a "Suggest an update"
  box ("This page uses publicly available information to help people discover this venue.
  The business is not currently affiliated with or partnered with Fresha, get in touch with us
  to update the information") and a "Book online with venues nearby" strip of real partners.
  No reviews, no owner photos, no booking, no "verified" badge. Partner pages (Pall Mall
  Barbers) are the full Airbnb-style listing with photos, prices, team, reviews and Book now.
  Marketplace commission applies to NEW clients only. So the Fresha approach IS the
  facts-only unclaimed page plus a disclosure, and stage 2 below follows it exactly.
- **Data rules for us (the part Fresha does not tell you):** the legal position rests on
  WHERE the facts come from, not on what is shown. The Apify Google Maps scrape stays an
  internal outreach list and is never published (Google's terms forbid redistribution).
  Public pages take their facts from a licensed or open source: **Foursquare Open Source
  Places** (100M+ POIs, Apache 2.0, names, addresses, categories) and **OpenStreetMap**
  (ODbL, attribution) for the base list, the Google Places API (attribution, 30-day cache
  rule) only to refresh hours if needed. Show facts only: name, address, hours, category,
  service names without prices, map (Mapbox or OSM tiles), phone behind "Show number".
  Never reviews, never the business's photos, never a booking form, never "verified". A
  stock image clearly styled as generic. The disclosure box word for word in spirit, with
  "Suggest an update" and a one-click removal. UK: a privacy notice and a legitimate-interest
  note because sole traders are people; the same directory model Yelp runs in the UK.

**Staging (agreed):**
1. **Directory of claimed sites** (small): public city and vertical pages on stemfra.com
   listing only published Stemfra sites, with "Get listed free". Own data, zero exposure,
   makes "no marketplace fee, 5% only through your site" concrete on calls.
2. **Unclaimed listings, facts only, the Fresha page with one change**: the visitor keeps
   "Call to book" and "Get directions" (the page must be useful to a customer, that is what
   makes it a directory and not a solicitation), and an owner strip replaces Fresha's
   "Website" button: "Are you the owner? Claim your free website" → the existing claim token
   flow. The disclosure box, "Suggest an update" and removal sit under the services. Facts
   from the open sources above, never from the scrape. This is where Neil finds himself and
   the call becomes "you are already on Stemfra, claim it".
3. **Booking-only tier**: a claimed listing that keeps the marketplace page as its only web
   presence with the booking engine on, same 5%. A one-page theme, not new tech.
4. Consumer marketing of the marketplace last, city by city, once one city is dense.
Not started. Prerequisite for stage 2: a Places API key on the server and a written
data-licence note in `docs/NICHE_SATURATION_2026-09.md`'s successor doc.

## P37 — Custom-build verticals (Peter's pick, 2026-09-11 night; 🔜 NEXT to scope)

Agency-priced custom builds (build fee 3,000 to 8,000 by scope + optional care plan 150 to
500 a month, market ranges in `docs/NICHE_SATURATION_2026-09.md` §6) for four segments Peter
chose from the survey: **(1) accountants, bookkeepers, CPAs; (2) consulting firms, engineering
consultancies, architects; (3) small manufacturers and fabrication shops; (4) private schools,
event venues, auto body shops.** These are credibility sites (portfolio or capability pages,
service pages, quote or intake forms) sold with the Front Desk as the hook ("calls answered and
quoted 24/7"), not the 5% booking product. Sourcing: the same Google Maps scrape with the
category switched and a "no website + 20 or more reviews" filter for (1), (3), (4); (2) is
mostly a LinkedIn list because consultancies rarely hold a Maps listing. Not started; first
step is a one-page offer + a lead-gen run per segment (needs the n8n vertical allow-list to
accept non-booking categories and a `service = 'custom'` path in Parse) and a Custom Pricing
quote template per segment. Remodelers and custom builders (the survey's top pick) are noted
as a later addition if Peter wants a fifth.

## P36 — Walk-ins block the calendar but carry no commission (Peter's rule, 2026-09-11)

From the Neil's Barbershop call ("what if someone walks in and someone else booked
online?"). Peter's rule: the shop enters the walk-in in the CMS calendar so the availability
engine blocks the slot, and Stemfra takes NO commission on it, because it did not come
through our software. Fair to owners, and fraud-proof if the origin is set by whoever
CREATED the booking, never edited: website / chat (Front Desk) / voice agent = online,
commissionable; owner-created in the CMS (walk-in or phone taken by a human) = not.
**As built today (verified 2026-09-11):** the CMS manual booking (`queries.ts` "Manual
(owner-created) booking") inserts with `payment_status='none'` and no origin; the reports
model counts any confirmed/completed priced booking with `payment_status='none'` as
at-visit, and `bookingAutoCollectSweeper` marks it collected after 24 h, so walk-ins ARE
commissioned right now. **Build:** `metadata.source` set at creation (`web`, `chat`,
`voice`, `owner_walk_in`, `owner_phone`; the CMS form asks "How did they book?" with
walk-in default), reports + `commissionMeter` + the sweeper exclude `owner_*` from the
basis (still shown in the calendar and Reports as "walk-in, no commission"), the Fees page
and the concierge context say so in one sentence, and a monthly ratio in the CRM billing
view (walk-ins vs online per tenant) as the sanity check.
**✅ BUILT 2026-09-11 (server + CMS + client, local):** `site_bookings.source` (migration
applied; 355 existing rows are NULL = web, none were owner-made), `source` param on the three
booking cores (chat passes `chat`), CMS New booking asks "How did they book?" (Walked in /
Called us → `owner_walk_in` / `owner_phone`), Reports classify `walkIn` (own row "Walk-ins and
phone bookings you entered … no Stemfra commission", excluded from totals), meter excludes them
(line item `walk_in_cents` for transparency), auto-collect sweeper skips them, Fees page bullet +
concierge sentence. The CRM billing ratio is deferred (reads the line item when the first
statement exists). Voice-agent bookings pass `voice` once that agent books (not built).

**Readiness tier (decided 2026-09-11 with Peter, NOT a filter yet):** no founding-year data
exists in the Google record (81 fields, none is an opening date) and public registries miss
sole traders, so business age stays a qualifying QUESTION on the call plus the first-review
date as a soft floor (Neil's: first review 14 March 2016, 64 reviews, zero owner replies,
unclaimed listing, no website, no booking link, no socials). The scrape already carries the
direct signals of tech literacy; the "digital readiness" score (claimed listing, website,
booking link, socials, owner description/posts, owner photos, owner replies to reviews,
recent reviews) → Modern / Middle / Old school is parked until Peter wants it in n8n.
**✅ DECIDED + BUILT 2026-09-11 (Peter: "go with your recommendation"):** scored ten Bronx
barbershop leads live (Apify, from the server token): claimed 7/10, socials 0/10 (the scraper
only reads socials off a website and our pool has none), first review 2012 to 2019 for all ten
(a six-year cut would empty the pool). Final rule: old_school = unclaimed listing; middle =
claimed only; modern = claimed + owner description/post, 20+ photos, booking link or social.
Owner replies and recency are NOT factors (Peter). `leads.readiness` column (applied), n8n
v13 pastes (`leadgen-normalize-v13.paste.md`, build-prompt, parse, insert; ✅ PASTED + LIVE,
Peter confirmed 2026-09-13, verified by the Staten Island run: two "modern" leads with clean
signals; the first v13 lead, House of Fadez, was repaired by hand after a stray `=`), CRM
Readiness facet + pills (card, drawer with the signals as tooltip). Ortiz
Barbershop matched an empty listing (0 reviews, 0 photos): re-check that lead.

## P35 — Claim page without personalisation (Peter's ask 2026-09-11, agreed)

`stemfra.com/claim/<token>` showed "<Business>, your website is ready", "Reserved for <Business>.
Claim within N days" and "Congratulations <First name>". The exposure was in the claims around the
name, not the name itself: a limited-time claim that is not real (UK CPRs banned practice / FTC
deceptive urgency) and a trade name next to "your website is ready". **✅ BUILT 2026-09-11 (client,
local, push hold):** one page for everyone (the token-less copy: "Free website with booking built
in. Free to claim, free to publish." + "Your website is ready to claim"), no name, no first name, no
countdown; the token stays for attribution events, unsubscribe and the signup prefill (name and
details appear on the signup form only after the owner clicks Claim). PUSHED 2026-09-11 (client 18acfd84). Server offer unchanged
(fields kept for the prefill). No email template said "your website is ready", so no wording pass
was needed; S3 ("We built this website to help {{business_name}}") goes only to consented numbers.

## Ideas from the YouTube Studio upload flow (Peter, 2026-09-12, while uploading playlist 2)
**✅ BUILT 2026-09-12 (Peter: "let us do it and see"; platform + server, local):** (1) "+ New
site" gained **Start from: the sample site / one of my sites** with tick boxes (brand and theme
· services and prices · team · opening hours · pages and reviews); the server provisions from
the seed as before, then `copySiteParts` (lib/provisionSite) replaces the ticked parts with
copies from the owner's site (ownership verified, brand text renamed, unticked parts keep the
demo). (2) The top-bar pill now names the state, **Unlisted** or **Published**, with "n of m to
go" or "ready to publish" beside it and a plain-language tooltip; the Publish page badge and
subtitle say Unlisted / Public with the one-sentence meaning (previewing sites are noindex via
PreviewRibbon, so "unlisted" is true). Typecheck clean; browser walk pending Peter's CMS sign-in.
Not done on purpose: skippable required fields.
- **"Reuse details" for a second site.** YouTube's reuse = pick a previous video, then tick
  which fields to copy (title, description, playlist, tags, language, category). Our "+ New
  site" always seeds from the vertical's demo and the only copy-from-existing path is the
  staff clone in the CRM (all or nothing). For a multi-location owner (video 26) a "Start
  from one of my sites" option with tick boxes (brand: name, logo, colours, theme · team ·
  services and prices · opening hours · policies and legal · notification preferences ·
  Google profile and review link · About and FAQ) is the same pattern; the parts not ticked
  come from the demo seed. Small: `POST /api/cms/sites` gains `copy_from` + `parts[]` over
  `cloneSite`'s renamer. Not started; do when the first multi-location owner asks.
- **One launch stepper.** YouTube: Details → Video elements → Checks → Visibility, in one
  modal, checks running in the background with a footer "Checks complete", Next never
  blocked, Save as draft at every step. Ours is three surfaces: the 4-step Setup wizard →
  Stacy's 12-step checklist → the Publish page. Worth borrowing: the always-visible footer
  status (our completeness score as "Ready to publish: 9 of 12"), and "Unlisted" as a named
  state (our previewing subdomain). Not worth borrowing: skippable required fields (Peter's
  2026-09-01 rule stands). Not started.

## Deferred one-offs (kept pending per Peter 2026-08-09)
- ~~First YouTube tutorial script~~ ✅ SUPERSEDED 2026-09-07 by the 29-video series
  plan + two full scripts in `stemfra_platform/docs/CMS_TUTORIAL_VIDEOS.md`.
- ~~Supademo pilot step-order fix~~ ❌ DROPPED 2026-09-07 (Supademo no longer used).
- ELEVENLABS_API_KEY into deploy.yml env block + GitHub secret AT PROD PUSH
  (deploys wipe unlisted vars).

## 2026-10-15: Broader Luna migration, email verification suspended

Peter authorized the broader Stemfra model migration after AI validation and explicitly suspended live email verification. No more SMTP probes or sends until resumed. Earlier authorized Gmail test failed before authentication (unreachable/refused SMTP connections); password validity and delivery remain unverified. No email was sent.

Local shared API chat defaults and controller defaults now use gpt-6-luna, including Stacy, Front Desk, Concierge, business/email assistance, lead qualification/drafting, website copy/quality, import mapping, transcript summarization and the text-only voice brain. Shared OpenAI client translates max_tokens to max_completion_tokens and forces reasoning_effort=none for exact Luna; streaming/tool/JSON contracts remain intact. Deployment workflow pins and existing local model overrides updated; no push or deployment. Transcription, embeddings, specialist audio/image models and archived n8n workflows unchanged. No Twilio/ElevenLabs or operational rescore executed.

Helen migration applied separately with the same request adapter, defaults, deployment pin and standard-token estimated rate (10/50 cents per million input/output; existing meter does not separately price caching or long-context tiers). AI runtime default changed to Luna; explicit DeepInfra background and tenant provider overrides remain authoritative.

Checks: 3 adapter regression tests per shared API/Helen (6), 8 AI adapter/fallback tests, AI runtime build, syntax checks for 25 shared API/Helen runtime files plus rescore script, whitespace checks. Synthetic live JSON and tool-call validation succeeded with each repository's own existing OpenAI key (combined two-request elapsed times 7.020s shared API, 14.482s Helen; not benchmarks). No tool execution or customer prompts. These checks do not certify every workflow or production rollout. Six-step AI engineering remains open; next owner-history pagination and unified server-side prospect pagination, then mailbox engineering with mocks while live verification is suspended.

### 20 October 2026: CRM custom project linking
McMaster lead now links to a native CAD proposal snapshot, project, two milestones and a reference to the already-issued invoice. UI local, shared database migration applied; Airwallex not changed. Payment status remains dated, not live sync. No payment/webhook release gate lifted. See ../../stemfra-ops/docs/CUSTOM_PROJECT_LINKS.md.
