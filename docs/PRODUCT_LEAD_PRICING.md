# Product lead intake and forecast pricing

Local implementation, 20 October 2026. Not deployed and no live form submitted.

## Product fields

| Product | Stored service | Pricing | Product-only fields |
|---|---|---|---|
| Websites | `website` | US$299/month | Website type (`vertical`), Switcher prompt |
| Stemfra AI | `ai_automation` | Starter $100, Growth $200, Business $300/month, USD | Optional `qualification.ai_plan`: `starter`, `growth`, `business` |
| Custom Software | `custom_build` | Editable project fee and currency; linked quote takes precedence | Project fee, currency |

Contact, company, source, region, assignee, stage, probability, follow-up and notes remain shared. Website type is cleared from non-website submissions. A subscription product cannot save a stale custom project fee. Existing other qualification keys are preserved. An unselected AI plan has no forecast value; no plan is silently selected. An enquiry never activates billing.

Marketing contact has the same products, optional website type and optional AI plan, with product-specific requirements wording. Legacy vertical links still preselect Websites and the right website type. The API validates plan identifiers and deduplicates recent open enquiries by email **and product**, so an AI enquiry does not overwrite a website opportunity. Repeat notes retain the submitted plan. Generic enquiries remain supported.

The API now protects the internal contact listing with staff authentication. Notification failures after a successful save do not turn the saved enquiry into a submission failure. Notification flags are only set on a successful mail result.

## Price maintenance

Canonical intake/forecast amounts: `stemfra_server/config/productPricing.json`.
Run `node scripts/sync-product-pricing.cjs` from the server repository after changing it. Commit the generated copies in CRM `src/lib/productPricing.json` and marketing `src/app/data/productPricing.json`. Run with `--check` to detect drift. Deploy the repositories together after review.

These copies feed the CRM form/lead forecast and marketing contact form. This is **not yet a workspace-wide billing price catalogue**: other marketing pricing display data, the AI runtime billing catalogue, Business projections and historical billing use their existing sources and need coordinated review for future price changes. Do not modify issued invoices, accepted quotes or active subscriptions through this configuration.

Lead annual forecast is 12 times the monthly subscription or the custom project fee. Existing website prospect forecasts use $299/month irrespective of historical commission estimates. The compatibility function `monthlyCommission` now delegates to monthly subscription pricing; historical commission constants remain for legacy consumers. Quotes only override custom software fees. Missing AI plans contribute zero, not a guessed tier.

## Verification and remaining scope

- CRM and marketing production builds passed, with existing build warnings.
- Browser checked website, AI plan selection and custom software form variants. No form submitted.
- `node scripts/checks/contact-products.cjs` (server): mocked persistence, product filtering, plan validation, qualification preservation, website vertical and notification failure cases.
- `node scripts/check-product-values.cjs` (CRM): recurring totals, missing plan, custom fee/quote precedence and currencies.
- No migration, provider call, Twilio action, email test, Airwallex change or push.
- Remaining broader work: legacy Lead Value calculator and other commission copy, product-aware conversion to Deals, Business projections, FAQ/Help Center, full catalogue consolidation and deployed intake verification. Do not describe those as completed by this change.
