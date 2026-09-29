# Billing input for the Stemfra AI session (read 2026-09-29 / 30)

_Asked by the Stemfra AI session, relayed by Peter. READ-ONLY: no code, config, Airwallex
object, email or deploy was changed; no secret is printed. The Airwallex API and dashboard were
NOT called: every live fact below comes from our own database and from unauthenticated probes
of api.stemfra.com._

Tags: **[code]** code-verified (file:line in `stemfra_server/`) · **[live]** live-verified,
read-only (database or production probe) · **[docs]** from docs, not re-verified.

## 0. Two findings to settle before any design

1. **The Stemfra AI billing tables are not in this database. [live]** Schema `stemfra_ai` in
   project `acxepovfklgthxmteqxr` holds 16 tables (connections, credentials,
   demo_business_hours, demo_services, executions, guardrail_events, kb_chunks, kb_documents,
   leads, messages, recipes, schema_migrations, sessions, tenant_users, tenants, tool_calls).
   There is no `billing_subscriptions`, `billing_charges` or credit ledger. Either the
   migration is unapplied or the tables live elsewhere. Everything in section C assumes they
   will exist in this project.
2. **The websites engine has never collected real money. [live]** All 37 rows of
   `public.billing_charges` belong to demo or test sites (29 paid, 8 void, all USD; none
   requested or due today). `recon_deposits` holds 2 rows, both of 2026-08-11 (1 ignored, 1 in
   review). Every `sites.currency` is USD (19 sites). The engine is built and partly armed, not
   proven on a customer payment. Stemfra AI may well be the first product to exercise it.

## A. Current live state

**1. Reconciliation.**
- `RECON_ENABLED=true` is in `deploy.yml:141` **[code]**. `RECONCILIATION.md:292` and the server
  `CLAUDE.md` still say it is not: out of date.
- `crm_settings.billing_recon` does NOT exist **[live]**, so the second gate (`enabled`,
  `dry_run`) has never been set from the CRM; the code's defaults apply (`lib/reconSweeper.js:13`).
  Treat the engine as NOT armed until Peter sets that row from the CRM Reconciliation tab.
- Webhook route is deployed: `POST /api/awx/webhook` without a signature answers 401 **[live]**.
  Whether Airwallex has delivered a `deposit.*` event since August is unknown (no ledger row
  after 2026-08-11).
- Auto-paid a real invoice: **no** **[live]**.

**2. Mirror and emails.**
- Mirror: `AIRWALLEX_MIRROR_ENABLED` is absent from deploy.yml, and the code treats absent as ON
  (`lib/airwallexBilling.js:20-26`); `AIRWALLEX_CLIENT_ID` + `AIRWALLEX_API_KEY` are in
  deploy.yml:151-152 **[code]**. 4 charges carry Airwallex mirror data, all void test rows
  **[live]**, so the mirror has run.
- Emails: `EMAIL_PROVIDER=resend` in deploy.yml:99 **[code]**; from-address
  `notifications@mail.stemfra.com` **[docs]**. From-name "Stemfra Billing".
  Reply-to `billing@stemfra.com` is set on THREE builders only: invoice, dunning, receipt
  (`lib/billingEmails.js:111,142,169`). "Payment returned" (`reconEngine.js:247`) and "receipt
  request" (`controllers/admin/reconController.js:112`) pass NO reply-to although their text
  says "reply to this email" **[code]**. A defect on our side.

**3. Card.** **[docs]**, not re-verified: Airwallex Payments (card acceptance on the hosted
invoice, which turns "View invoice online" into "Pay now") is pending Airwallex's approval and
depends on KYB trading history (`AIRWALLEX_INVOICING.md:27-29`). No date is recorded anywhere.
Saved cards, recurring card debit and payment consents all sit behind the same approval; our
code has no consent or mandate call. `ONLINE_PAYMENTS_ENABLED=false` in production
(deploy.yml:166). **Treat it as bank transfer only.** A "card on file at trial start" is not
possible today through Airwallex. The `invoice.paid` webhook is not handled and is REQUIRED the
day card goes live (`AIRWALLEX_INVOICING.md:270`). Peter reads the Payments status in the
Airwallex dashboard.

**4. Currencies.**
- Verified end to end with real money: **none** **[live]**.
- Bank details present: USD at the top level of `crm_settings.commission_bank`; `by_currency`
  holds **CAD and GBP** **[live]**. EUR, AUD, NZD, NGN have no block and fall back to the USD
  details (`lib/commission.js:50-74`) **[code]**.
- Field names **[live]**: top level (USD) `account_name, account_number, account_type,
  ach_routing, fedwire_routing, swift, bank_name, bank_address, bank_city, bank_zip, country,
  currency, provider, contact_email, by_currency`. CAD: `account_name, account_number,
  account_type, transit_number, institution_number, interac_email, interac_confirmed_at,
  bank_name, bank_address, bank_city, bank_zip, country, currency, provider, created_on, note`.
  GBP: `account_name, account_number, sort_code, iban, swift, bank_name, bank_address,
  bank_city, bank_zip, country, currency, provider, created_on, note`.
- Currency choice **[code]**: commission uses `sites.currency`, set at signup by
  `defaultsForCountry` (`lib/localeDefaults.js:46`, called `lib/onboardSite.js:131`);
  subscription charges use `subscriptions.currency`; domain charges use
  `sub?.currency || 'USD'`, so a CAD tenant without a subscription is invoiced a domain in USD
  (a defect).
- Interac Autodeposit to billing@stemfra.com: confirmed by Peter per the handoff **[docs]**; an
  Interac deposit arrives with an EMPTY reference, so it can only match by amount.

## B. The lifecycle as built

**5. Functions** (`lib/billing/index.js`) **[code]**

| Function | Line | Effect | Email | Mirror |
|---|---|---|---|---|
| `openInitialCharge(sub,{planLabel,dueDays=7})` | 50 | insert `kind:'initial'`, `status:'due'` | none | no |
| `openRecurringCharge(sub,{planLabel,when,dueDays=7})` | 62 | insert `kind:'recurring'`, `status:'due'` | none | no |
| `markRequested(chargeId,{externalRef,by})` | 72 | `status:'requested'`, `requested_at/by` | `platformInvoice` | `mirrorInvoice` (create, lines, finalize) |
| `markPaid(chargeId,{by})` | 95 | `status:'paid'`, `paid_at/by` | `platformReceipt` | `markInvoicePaid`, then `onInitialChargePaid` |

- Statuses: `due`, `requested`, `paid`, `void`. A reversal puts a paid charge back to
  `requested` (`reconEngine.js:291`).
- **There is no void function and no void endpoint.** The only void write is inline in
  `commissionMeter.js:154`. `airwallexBilling.voidInvoice` (line 365) has NO caller, so a voided
  charge leaves its Airwallex invoice open. Stemfra AI needs a real void (trial cancelled after
  the invoice, plan change): it has to be built.
- Schedules **[code]**: commission meter every 12 h, meters the previous month on UTC days 1 to
  5, due = period end + 15 days (`commissionScheduler.js:25-44`, `commissionMeter.js:116`).
  Billing cycle sweeper every 6 h (`billingCycleSweeper.js:87`); recurring charges open only
  when `SUBSCRIPTION_BILLING_ENABLED=true` (absent in production, so OFF), one per UTC calendar
  month, due in 7 days.
- "Created" vs "requested": creating only writes a `due` row (nothing is sent). Requesting
  sends the invoice. Commission charges are requested BY HAND (`POST
  /api/admin/billing/charges/:id/requested`); domain purchase, domain renewal and owner publish
  request automatically.
- Dunning **[code]** (`billingCycleSweeper.js:59-74`): status `due` or `requested` past
  `due_date`, at most one reminder every 7 days per charge (`metadata.last_dunned_at`), **no
  maximum count**, one template (`platformDunning`), no env gate. It also reminds on `due`
  charges that were never requested, that is, for an invoice the owner never received.
- **Non-payment has no consequence in code.** Nothing suspends or unpublishes a site over a
  charge. For Stemfra AI the consequence (stop granting credits, pause the agent) has to be
  decided and built on the AI side.

**6. Invoice number and reference.** `INV-` + first 8 hex of the charge UUID, uppercase; the
reference is the bare 8 characters (`invoicePdf.js:21-27`, computed again in
`billingEmails.js:54`, `invoicePdf.js:188`, `reconEngine.js:61`) **[code]**. Matching: T1 =
reference contains the code, one hit, amount within tolerance; T2 = exact total, unique;
T2-near = one charge within tolerance (default 500 cents); anything ambiguous goes to review
(`reconEngine.js:116-196`). Eligible = same currency, charge created before the deposit.

Recommendation: **keep 8 hex characters and do not add a prefix.** A collision between two
open charges is improbable (16^8), and when it happens the matcher already sends it to review.
A letter prefix would make the code 9 characters; it fits the 10-character memo, but owners
retype it and the matcher's `contains` test gains nothing. What IS needed: compute the code in
ONE function, and give each open charge a `product` field so the review queue shows which
product a deposit belongs to. The real risk is not the reference but **amount matching**:
Stemfra AI prices are round and repeated ($29, $79, $199, $10). Two tenants owing $29 with no
reference typed is "T2 multi" and goes to review every time. Expect more manual review than the
websites product, above all for Interac (no reference at all).

**7. Airwallex products.** Looked up by name, id cached in `crm_settings.airwallex_billing`
(`airwallexBilling.js:59-97`) **[code]**: "Domain registration", "Platform commission",
"Stemfra services" (the fallback, created by code). Cached today: `product_id` and
`domain_product_id`; `commission_product_id` is NOT cached, so a commission invoice has never
been mirrored **[live]**. To add: "Stemfra AI plan (monthly)" and "Stemfra AI credits top-up",
created by Peter in the dashboard (names exactly as in code), plus a `product` to name mapping
in `productIdFor`. Tax category: none is sent today; choose the dashboard's software /
digital services category and have the accountant confirm.

**8. Billing customer** (`ensureBillingCustomer`, `airwallexBilling.js:181`) **[code]**: name
(company, else email), email, phone (only if valid), nickname, `default_billing_currency`,
`type:'BUSINESS'`, address (line1, line2, city, postal_code, state, country as ISO-2),
metadata. The id is cached per owner contact. The AI billing profile covers the address and
name. **Missing: email, phone, currency**, and a place to cache the Airwallex customer id.
The country map covers only US, CA, GB, AU, NG (lines 140-143): any other country sends no
country. Stemfra AI sells to all service businesses, so that map must grow first. `tax_type`
and `tax_id` are not sent by our code.

**9. Tax.** 0% everywhere: no code writes `tax_cents`, `tax_rate` or `tax_jurisdiction`
**[code]**. Same LLC, so Stemfra AI revenue DOES count toward nexus and must feed the Compliance
Engine. It reads `billing_charges` with status requested or paid, joins `sites` to `contacts`
for country and state, sums `amount_cents`, excludes demo and test
(`complianceController.js:28-65`). A charge without a site row is DROPPED (line 55), so AI
charges need their own branch: expose per charge `amount_cents, currency, status, paid_at,
country, state, is_test`. Known defects: the PDF reads `metadata.tax_cents` while recon reads
the `tax_cents` column, and the PDF total ignores tax; they will disagree the day tax is not
zero.

**10. Amounts.** Integer cents; Airwallex receives cents / 100. $0 guard in `markRequested`,
the invoice email, the meter and dunning. No minimum invoice amount. No proration anywhere.
Recommendation for Stemfra AI: no proration in version 1. Upgrade = takes effect now, the new
price from the next cycle, the difference in credits granted at once (or sold as a top-up).
Downgrade = from the next cycle. It keeps every invoice a round number, which the matcher needs.

## C. Recommendation

**11. Architecture: (b), an internal API on stemfra_server, with Stemfra AI keeping its own
tables.** Not (a).

Why not (a): `.from('billing_charges')` appears 51 times in 17 files with no data-access layer
and no schema qualifier **[code]**; the engine joins `sites`, `contacts`, `companies` and
`subscriptions`, none of which a Stemfra AI tenant has. Teaching all of that to read a second
schema touches the money path of the live product and breaks the isolation rule both sessions
work under. Why not (c): one Airwallex account, one bank account and one deposit stream cannot
have two matchers; a deposit must be claimed by exactly one engine.

Shape of (b): stemfra_server owns everything that touches Airwallex, the bank and the mailbox.
Stemfra AI owns its charges, subscriptions and credits and calls the server.

Contract (all `POST`, JSON, header `x-stemfra-ai-secret`, public hostname
`https://api.stemfra.com`, timing-safe compare, fails closed when the secret is unset):

| Endpoint | Body | Does |
|---|---|---|
| `/api/internal/billing/invoices` | `{product:'stemfra_ai', external_id, kind:'plan'|'topup', amount_cents, currency, due_date, period_start, period_end, line_items, customer:{name,email,phone,company,address,country,state}, is_test}` | registers the invoice, mirrors it, sends the invoice email, returns `{invoice_number, reference, hosted_url, pdf_url}` |
| `/api/internal/billing/invoices/:external_id/void` | `{reason}` | voids ours and Airwallex's |
| `/api/internal/billing/invoices/:external_id/claim` | none | the owner's "I have paid": one targeted deposit check |
| `GET /api/internal/billing/invoices/:external_id` | | status, for repair after a missed callback |

Our side, in order:
1. Migration: `billing_charges.product text default 'websites'`, `external_id text`, unique
   `(product, external_id)`, `site_id` already nullable to confirm; a `billing_customers` table
   (or reuse of `contacts`) for non-site customers.
2. `lib/billing`: one `chargeCode()`; a real `voidCharge()` wired to `voidInvoice`; customer
   and product resolution by `product`.
3. `routes/internal/billing.js` + the secret check (model: `staffGuard`,
   `controllers/platformBillingController.js:19-33`).
4. Emails: Stemfra AI variants of invoice, receipt, dunning, payment returned (brand line,
   links to the AI dashboard); reply-to added to the two builders that lack it.
5. Recon: open charges of both products in one list (they already are, same table); the paid
   hook in item 12.
6. Dunning: skip `due` rows never requested; add a maximum count.
7. Compliance: a branch for charges without a site.
8. Env: `STEMFRA_AI_BILLING_SECRET`, `STEMFRA_AI_CALLBACK_URL` in `.env` and deploy.yml.
9. Peter: the two Airwallex products, the `billing_recon` row, the dunning rules.

**12. How Stemfra AI learns of a payment.** The server calls a Stemfra AI endpoint (`POST
{STEMFRA_AI_CALLBACK_URL}` with `{external_id, status:'paid'|'returned'|'void', paid_at,
amount_cents, currency}`, same secret, retried with backoff), and Stemfra AI sets its own row
to paid, which fires its existing trigger. The server does NOT write into `stemfra_ai.*`:
credits are money, and a second writer into another product's ledger is where double grants
come from. The callback must be idempotent on `external_id`, and must handle `returned`: a
reversed payment has to take the credits back or block the account. The status `GET` above is
the repair path.

**13. CRM.** Yes: one Billing page and one review queue, with a Product column and filter.
Because the charges share a table under (b), it needs the column in the list endpoint
(`controllers/admin/billingController.js`) and the CRM table, plus the customer name for rows
without a site. A reviewer who cannot see both products' open invoices side by side cannot
resolve a $29 deposit.

**14. Not in the docs.**
- An Interac e-Transfer carries no reference; with round repeated prices, Canadian payments
  will mostly need a person. Print the reference on the invoice anyway and ask for it in the
  message field.
- The reference must stay at or under 10 characters for US bank memos.
- Deposits arrive net of intermediary fees; the 500-cent tolerance exists for that. On a $10
  top-up, 500 cents is half the invoice: the tolerance should be a percentage with a ceiling,
  or top-ups get matched to the wrong invoice.
- Invoices and receipts are transactional mail (not covered by CASL / PECR consent rules), but
  a marketing line inside one makes it commercial. Keep billing mail free of promotion.
  Trial-ending reminders are safest written as account notices.
- A day-15 automatic conversion with bank transfer is an invoice, not a charge: nothing is
  collected until the owner pays. Decide what the account may do between day 15 and payment.
  The signup must state the conversion, the price and how to cancel (US state automatic
  renewal laws, UK consumer rules); confirm the wording with counsel.
- Same LLC, so Stemfra AI sales count toward the economic nexus thresholds from the first
  dollar, and UK VAT on digital services to UK consumers has no threshold for a non-UK seller.
  B2B status (a company name, a tax id) matters; collect it at checkout.
- Airwallex KYB was approved for the websites business description. A second product line may
  need declaring to Airwallex; Peter asks his account contact before the first AI invoice.
- Resend: one sending domain (`mail.stemfra.com`) carries both products, so a complaint spike
  from one hurts the other. A separate subdomain for Stemfra AI mail is cheap insurance.
- Docker: a new env var goes in `deploy.yml`; the server's compose file reads `.env` and lists
  nothing explicitly (unlike stemfra_ai's).

## Docs now out of date

1. `RECONCILIATION.md:292` + server `CLAUDE.md`: `RECON_ENABLED` IS in deploy.yml.
2. `airwallexBilling.js:10-12` header: void is NOT wired.
3. `AIRWALLEX_INVOICING.md` §8: the PDF does not total amount + tax.
4. `AIRWALLEX_INVOICING.md` §7: the meter no longer creates $0 charges (since 2026-09-16).
5. `AIRWALLEX_INVOICING.md:75`: dunning also covers charges never requested.
6. `AIRWALLEX_INVOICING.md:157-160`: number and reference differ when `metadata.invoice_ref`
   is set.
7. The PDF download endpoints (`controllers/admin/billingController.js:74`,
   `controllers/cms/billingController.js:198`) omit `metadata` and the period, so a downloaded
   PDF can differ from the emailed one.
8. `BILLING_AND_PAYMENTS.md` (platform) covers tenant payments (Stripe Connect), not this
   ledger.

## Sources

- Code: `stemfra_server/` at commit a2322ca, files and lines as cited.
- Database: project `acxepovfklgthxmteqxr`, read 2026-09-29: `billing_charges`,
  `recon_deposits`, `crm_settings` (key names and field names only), `sites`, schema
  `stemfra_ai` table list.
- Production probes, no credentials: `/health` 200, `POST /api/awx/webhook` 401,
  `/api/admin/recon/settings` 401.
- Docs: `AIRWALLEX_INVOICING.md`, `RECONCILIATION.md`, `SESSION_HANDOFF.md`.
