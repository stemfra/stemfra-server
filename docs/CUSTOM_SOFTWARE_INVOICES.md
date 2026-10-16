## McMaster procurement note pending verification (16 October 2026)

Peter requested that the custom invoice may need a Purchase Order (PO) field. Reserve a header field labelled Purchase Order Number for a customer-supplied value in a future revision; do not invent a number or alter the approved PDFs yet. Confirm the requirement, actual PO and submission instructions with McMaster before issuing.

Peter supplied third-party advice asserting all invoices require a PO, suggesting a 10-digit pattern, supplier onboarding via Mosaic, submission to appoinvo@mcmaster.ca, zero GST/HST and the phrase "Non-resident of Canada: Exempt from GST/HST." These are unverified supplied claims, not adopted tax or procurement rules. Do not automatically apply the tax conclusion or exemption phrase. The 13% document is a layout sample only; actual tax treatment and registration status remain unresolved. No invoice email is authorized. Customer record changes do not update older invoice snapshots.

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

2026-10-13 deferred follow-up: Peter wants the approved billing-contact footer sentence carried into the other invoice templates in future (website maintenance/platform commission and custom domain purchase). Tracked in ROADMAP.md under Billing follow-ups for later discussion; not implemented for those templates yet.

2026-10-13 billing contact footer completed: reusable custom-software template now includes "For billing enquiries, contact billing@stemfra.com." Replacement official PDFs INV-CS-20261013-07 (CAD 5,000, Canadian bank) and INV-CS-20261013-08 (USD 5,000, US bank) downloaded before voiding; both retrieved VOIDED/UNPAID. Both one-page PDFs text/visually checked, no added tax, approved department separator and instalment description retained. Files: output/invoices/INV-CS-20261013-07.pdf and INV-CS-20261013-08.pdf. No email or payment API called. These are pre-void feedback copies.

2026-10-13 final feedback copies completed: INV-CS-20261013-05 CAD 5,000 (inv_sgpd7rc4zhn6eeiagcn) and INV-CS-20261013-06 USD 5,000 (inv_sgpdqls2zhn6eekrspk), no added tax at Peter request. Both official PDFs downloaded, text/visual checks passed, immediately voided and retrieved VOIDED/UNPAID. Department separator and Academic recruitment platform (Instalment 1 of 2) confirmed. PDFs output/invoices/INV-CS-20261013-05.pdf and -06.pdf are pre-void feedback copies. No email/payment API called. Peter reports no Canadian clients and revenue below CAD30k; this is user-reported, not independent determination of registration obligations.

2026-10-13 13-percent comparison completed: INV-CS-20261013-04 / inv_sgpd7rc4zhn6e3j79ez finalized, official PDF downloaded, immediately voided and retrieved VOIDED/UNPAID. CAD subtotal 5,000, tax 650, total 5,650; PDF visibly renders tax breakdown. Department moved to memo with hyphen separator; revised academic recruitment description applied. No send/payment call. McMaster Financial Affairs FAQ publishes HST 119035988RT0001 and AP self-assessment policy. CRA simplified-regime exclusion for registered customers verified, but Stemfra normal registration/business-in-Canada status not established; actual invoice tax decision remains conditional. Sources: https://financial-affairs.mcmaster.ca/resources/financial-affairs-faqs/accounting-faqs/ and https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/digital-economy-gsthst/charge-collect/cross-border.html

2026-10-13 local separator previews: Department 10297 moved out of address into memo above hyphen separator; description changed to Custom software development: Academic recruitment platform (Instalment 1 of 2). CAD/USD PDFs in output/pdf/custom-software-{cad,usd}-separator-preview.pdf visually checked. Local layouts only, no Airwallex calls; invoices remain voided.

2026-10-13 official comparison PDFs completed at Peter explicit authorization: INV-CS-20261013-02 (CAD) and INV-CS-20261013-03 (USD) finalized, official PDFs downloaded, immediately voided, then both retrieved as VOIDED/UNPAID. Files output/invoices/INV-CS-20261013-02.pdf and -03.pdf are pre-void official snapshots. One page each verified. Airwallex suppresses subtotal/zero-tax row despite explicit zero tax; department and street render on the same line. These provider limitations differ from local previews. No send or payment API called.

2026-10-13 USD comparison prepared: INV-CS-20261013-03 / inv_sgpdqls2zhn6d5xd6dn verified DRAFT, USD 5,000 total, tax 0. Reuses McMaster University/Department 10297 and Peter billing email; saved USD bank retrieved with ACH/Fedwire details. Local layout PDF output/pdf/custom-software-usd-layout-preview.pdf visually verified. CAD draft unchanged; both remain DRAFT, neither finalized or sent. PDFs are local comparison layouts, not provider-generated PDFs; actual contract/tax treatment still unconfirmed.

2026-10-13 tax-layout draft: INV-CS-20261013-02 / inv_sgpd7rc4zhn6czg49xw remains DRAFT, CAD 5,000 total, explicit default_tax_percent=0, total_tax_amount=0, automatic tax disabled for this sample only. Customer updated at Peter request to McMaster University, Department: 10297, 1280 Main Street West, Hamilton, Ontario L8S 4L8, Canada (official registrar address verified); Peter email retained. No finalize/send/payment call. No draft pdf_url returned; documented API preview is subscription-oriented, so earlier generic draft-PDF suggestion was incorrect. Locally authored layout preview at output/pdf/custom-software-tax-layout-preview.pdf visually verified; it is not an Airwallex-generated PDF and does not prove provider zero-tax-row rendering. Prior two invoices remain voided. Actual tax treatment remains unverified.

2026-10-13 invoice correction: replacement INV-CS-20261013-01 (inv_sgpd7rc4zhn6coicat2) uses original bank-label layout, CAD account, standard payment footer and no visible test wording. PDF visually verified. Original TEST-CS-CAD-20261013-01 and replacement are both VOIDED; replacement retrieved as VOIDED/UNPAID after Peter requested immediate cancellation. No payment recorded. Future review invoices must stay draft and use Airwallex preview; do not finalize without explicit approval. Saved replacement PDF is a pre-void layout snapshot, not a payable invoice.

# Custom software invoices

Reusable content template: [custom-software-invoice.json](templates/custom-software-invoice.json).

Use the customer's legal entity as Bill To. Project scope belongs in the description/notes, with the instalment number, project total and milestone. Optional purchase order, Fund, Department and Project codes must come from the customer. Never reuse another customer's procurement codes.

## Airwallex layout and operation

- Product: Custom software development. Product description is internal; price description was not rendered on the sample PDF.
- Memo: maximum 500 characters. Put test notice (for samples), project/instalment and currency-matched receiving details here.
- Footer: project scope and applicable notes. Do not describe an unverified tax treatment as zero-rated.
- OUT_OF_BAND collection. Validate currency, total, bank details and customer before finalizing. Finalization creates the PDF and locks editing.
- Persist request UUIDs and returned IDs before proceeding to each subsequent operation. After an unknown response, inspect the existing object/request rather than creating another invoice.
- Normal Stemfra markRequested also emails and creates ledger state. This standalone test used Airwallex directly; no website tenant or billing charge was manufactured.
- This is a reusable content template and Airwallex product, not a new automated CRM billing type. Existing maintenance/domain/commission flows are unchanged.

## Verified test, 2026-10-13

Invoice TEST-CS-CAD-20261013-01, Airwallex ID inv_sgpdtxfmqhn6cfrp6jf. FINALIZED / UNPAID, CAD 5,000, instalment 1 of 2 against a sample CAD 10,000 project fee. Due 2026-10-20. Sample customer Argyle & Sons - TEST Canada, fictional Toronto address, Peter-authorized email eenglishwithpeter@gmail.com. No manual email/send API called; provider automatic email delivery was not inspected.

CAD bank read successfully from configured server project crm_settings.commission_bank.by_currency.CAD. Digital Commerce Bank, account holder Stemfra LLC; actual account fields stay in settings/PDF, not this document. Supabase connector inventory failed; read used the existing server configuration for acxepovfklgthxmteqxr instead. No database writes.

Downloaded PDF: workspace output/invoices/TEST-CS-CAD-20261013-01.pdf. Single page visually inspected; amount, currency, sample notice, bank fields, recipient and project scope verified. Local recovery state is output/invoices/custom-software-test-state.json (contains signed URLs; do not commit). One-off operation script /tmp/stemfra-custom-invoice.cjs. No payment initiated.

Pending: Peter reviews PDF, then void the unpaid test using POST /api/v1/billing/invoices/inv_sgpdtxfmqhn6cfrp6jf/void with a persisted request_id. Retrieve afterward to confirm VOIDED. Do not mark paid. No second instalment invoice has been created. Actual client legal name, procurement codes, contract currency, milestone terms and tax treatment remain to be confirmed before a real invoice.
