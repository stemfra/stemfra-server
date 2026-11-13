# Beauty and wellness marketplace: product and delivery plan

## Future StemfraPay policy

Approved 5 November 2026. Pay at venue is available by default. An individual or business must complete the applicable Whop verification before enabling Pay online. Once enabled, customers can choose either payment option. Tenant online payments are planned. The current marketplace booking flow uses Pay at venue.


Recorded 4 November 2026. Updated 5 November: Peter subsequently authorized local implementation and temporary Stemfra identity. The local build is implemented and tested as recorded in [acceptance](../../stemfra_platform/docs/marketplace/IMPLEMENTATION_2026-11-05.md). This canonical plan does not activate prices, public inventory, domains or deployment. Seven release phases remain subject to their acceptance gates.

## Direction and precedence

Stemfra is the parent company. A new, independently named beauty and wellness brand will provide the marketplace and its business tools. Smart Site is a dedicated website offering within that brand. Managed themed websites remain a Stemfra offering; Stemfra AI remains a separate product. Brand name and domain are undecided.

This supersedes historical P38 assumptions that the marketplace must remain only a Stemfra claim-funnel extension, include fitness, or use the old free/commission offer. It preserves P38's source-rights, correction/removal and release gates. Existing deployed prices and customer entitlements remain unchanged. The [tier discussion](WEBSITE_SERVICE_TIERS_2026-11.md) remains the commercial input, subject to the scope below.

Beauty and wellness is the new brand's scope: initially barbers, beauty/hair salons, massage and spas, with the precise category list to be agreed. Yoga, CrossFit and other fitness categories are excluded from this brand. Existing Stemfra fitness websites remain supported. The current local marketplace excludes fitness fixtures. Existing Stemfra fitness products remain unchanged.

## Current baseline versus planned work

Local platform previews already contain a marketplace homepage, internal `/business/:id` profiles reusing SmartSiteView, and a reduced CMS view. Sample profiles are explicitly illustrative; preview booking does not submit reservations. These do not establish a live directory, live marketplace booking, branded domain access or subscription entitlements. See [marketplace implementation](../../stemfra_platform/docs/marketplace/README.md) and [Smart Site gates](../../stemfra_platform/docs/smart-site/README.md).

Existing managed-website signup and billing work must be reused. Do not rebuild payment recovery or transfer the existing website test purchase to the AI product. Hosted checks from earlier dated records are historical evidence, not acceptance of this new marketplace plan.

## Product structure and pricing decisions

| Offering | Proposed USD/month | Intended scope |
|---|---:|---|
| Marketplace | 20 | Claimed business profile, direct booking and essential business management within the new brand. |
| Smart Site | 50 | Marketplace capabilities plus a dedicated one-page business website without competing listings beside it. |
| Managed Website | 199 | Supported full website theme, existing CMS and booking capabilities; AI Front Desk excluded. |
| Managed Website + AI | 299 | Managed website plus the separately defined included Front Desk capability and allowance. |

These are working names and proposed prices, not a published catalogue. Resolve costs, regional prices, taxes, staff/location limits, support, payment fees and AI usage before activation. Marketplace exposure is available to higher offerings with owner visibility controls; listing is not a guarantee of traffic or new customers. A paid business must receive useful booking tools even before consumer demand grows.

Managed updates mean dependency/package updates, security patches and supported product maintenance. They do not include redesign, bespoke customization beyond supported theme settings, or adding theme capabilities. Existing content editing and supported settings remain available. Defect correction is distinct from a custom design request. “Custom website” in this discussion meant this managed themed product, not bespoke software.

## One CMS, multiple branded addresses

Use one CMS build and the existing server/platform Supabase database, served through `cms.stemfra.com` and a future address such as `business.<new-brand-domain>`. The latter is a placeholder. Both addresses manage the same authorized business records, bookings, clients and subscription state; do not duplicate tenants or accounts.

An explicit hostname configuration selects logo, favicon, page title, sign-in branding, website return link and support links. Unknown hostnames must not select an arbitrary brand. **Hostname changes presentation; authenticated roles and subscription entitlements determine access.** A user cannot unlock the main CMS merely by visiting its address. Preserve current owner/staff boundaries and Stemfra team access.

Marketplace and Smart Site owner login links lead to the new branded CMS address. Stemfra marketing login leads to the Stemfra address. Consumer booking/account access remains distinct from owner/staff privileges. Decide how an owner with products under both brands switches businesses without duplicate accounts.

The current CMS stores sessions per browser origin. Sharing a database and credentials does not automatically share login sessions between unrelated domains. Initial delivery may require sign-in on each address; seamless cross-domain SSO is a separate decision. Configure and test Google OAuth, password reset, verification/resume links, redirect allowlists, API origins, preview links and email branding for both addresses. Never accept arbitrary caller-supplied return URLs.

## Business experience and data continuity

Reuse the current four setup steps and established editing components: business/contact/location/hours; services/prices/durations; team; look/photos. Keep Bookings, Clients, essential settings, Billing and notifications. The reduced experience has no Stacy, AI Front Desk, enquiry Inbox or public contact form. Contact details remain useful quick actions. Email alerts are the baseline; SMS inclusion, allowance and price remain undecided. No SMS tests or sends are authorized here.

One business/location should have one canonical identity across its marketplace profile, Smart Site and managed website. Upgrades keep bookings, clients, staff, services and ownership. Define effective dates, proration and downgrade effects before implementation. Hide unsupported features without silently deleting retained data. Preserve access to invoices, exports and subscription recovery. Decide multi-location and staff limits explicitly.

## Public directory and CRM candidate pipeline

Peter proposes an initial directory of unclaimed beauty/wellness businesses, including candidates from CRM leads not yet won. This can seed useful discovery, but **sales stage is not publication permission and is not evidence that a business is unregistered**. There has been no live CRM eligibility/count audit for this plan.

The native lead source includes Apify/Google Maps (`lib/leadgenNative.js`, `signal_source: google_maps`); other CRM sources may differ. Existing P38 policy keeps these scraped records internal for outreach. Do not export the CRM table or publish Google/Apify business data, reviews or photos as a directory. A disclaimer does not supply reuse rights. A candidate may be independently matched to a source eligible for the intended publication; matching must not simply relabel scraped fields as open data.

Proposed pipeline:

1. Select a small launch geography and eligible categories. Identify candidate businesses, excluding existing claimed/customer records, closed businesses, suppressions/removal requests and fitness.
2. Audit source and permitted reuse at field level. Separate owner-provided/publication-authorized facts, licensed/open data and restricted/internal-only data. Keep source URL, license/version, attribution requirements, date checked and reviewer.
3. Independently verify public identity, location and business contact channels. Deduplicate by business/location, not only name. Never publish personal lead notes, private contact details, CRM scores, sales stages or outreach history.
4. Create a public projection containing only approved fields. Maintain eligibility, freshness, provenance and suppression records separately from private CRM access. No direct public CRM query or service-role credentials in the browser.
5. Review a small unpublished batch, including source attribution and missing/stale data. Only publish after the source policy and pilot batch are approved in a later implementation/release step.
6. Provide visible correction/removal requests, owner claim and operational review. Suppress removed records from future imports; schedule freshness checks and retire closed/inaccurate profiles.

Potential source options include Foursquare **OS Places** under its Apache 2.0 notice obligations, or OpenStreetMap with applicable ODbL/attribution obligations. These are not blanket permissions for every provider API, photo or review. Confirm the exact dataset, field, territory and display obligations before ingesting. Review personal-data handling for sole traders and local requirements before launch.

### Profile states and honest actions

Keep separate states for public-source eligibility, published visibility, ownership claim, account registration, subscription and online-booking activation. A CRM “won” flag must not grant ownership or enable booking. A subscription alone must not advertise availability before booking configuration is ready.

Unclaimed directory profiles can show approved address, phone, official website, source/date and direct contact/directions. They must not show invented prices, reviews, staff, availability, “verified” badges or a working Book now action. Clearly distinguish them in search from businesses accepting online booking. Use permitted imagery only; illustrative category imagery must not imply it depicts that business.

Working disclosure, to adapt once the brand/source is chosen:

> This profile has not been claimed by the business. Details come from [source] and were last checked on [date]. Online booking through [Brand] is not available. Contact the business directly to book.

Place “Claim this business”, “Suggest a correction” and “Request removal” alongside this information. Do not imply a partnership or business endorsement. Ownership verification must establish authority through a reviewed mechanism; do not trust possession of a listing URL or an arbitrary supplied email. Resolve duplicate claims and disputed ownership. Claiming and choosing a paid package are separate explicit steps; never charge merely for correcting or removing public information.

## Consumer discovery and booking

Retain the approved service-first business page, clear price/duration, team selection and native shared booking flow. Preserve current booking validation and server-side availability/tenant checks. No AI interaction is needed for this quick-action product.

Search needs category/location relevance, transparent bookable versus directory status, empty/error states and no fabricated popularity. Define profile URLs, canonical SEO rules for dedicated websites versus marketplace profiles and owner unlisting behavior. Marketplace unlisting must not disable the owner's standalone website. Ranking and any promoted placement need a separate policy.

## Subscriptions, payments and domains

Whop can support the different business products, but product/plan identifiers, environment, entitlements and webhook routing stay explicit. Reuse trusted server-side mapping and existing idempotent purchase/recovery behavior. Define metadata for business/location, product family, plan, brand and environment; do not authorize ownership or price from client metadata. Brand determines receipt/return context, not which tenant receives entitlement.

Avoid duplicate subscriptions when a business upgrades. Test failed/canceled checkout, delayed/replayed webhook, renewals, failed renewal, cancellation, reactivation, refunds and interrupted setup with approved existing fixtures where possible. Marketplace customers book online and pay the business directly at the appointment. The marketplace does not collect card details, take deposits or process appointment payments on behalf of tenants. Tenant online checkout settings are excluded from marketplace profiles, and the shared booking form submits a reservation only. Package and gift purchase prompts are hidden on marketplace profiles. Business software subscriptions and standalone website settings are unchanged.

A default hosted subdomain is included; decide whether new-brand Smart Sites use that brand's domain or Stemfra's domain. Optional custom-domain purchases are separately quoted with exact total and renewal terms, explicitly authorized before charging a saved card, then registered after confirmed payment. No price cap was agreed. Define failed registration/refund, renewal, expiry, transfer, ownership and existing-domain connection. Do not register or charge under this plan.

## Delivery sequence and acceptance gates

| Phase | Deliverables | Gate before progressing |
|---|---|---|
| 1. Commercial and brand decisions | Name/domain shortlist, launch geography/categories, package matrix, unit economics, SMS decision, claim/source policy | Peter approves scope and prices; source eligibility established. |
| 2. Shared data foundation | Canonical identity/public projection/provenance/suppression design; entitlement and migration proposal | Tenant/private-data review, dedup strategy, backup/rollback and explicit migration authorization. |
| 3. Branded CMS access | Hostname branding, reduced/main entitlement views, both-domain login/reset/Google/return journeys | Browser acceptance on both domains and owner/staff isolation; no hostname privilege escalation. |
| 4. Curated directory and claims | Reviewed unpublished pilot, disclosures, corrections/removal, claim verification and operational queue | Approved source attribution and batch; disputed/duplicate claim and suppression checks pass. |
| 5. Live booking integration | Published owner-authorized profiles, native availability, booking/client records and email alerts | End-to-end reservation/change/cancel, timezone, staff/service eligibility, concurrency and failure checks. |
| 6. Package lifecycle | Approved regional catalogue, Whop mapping, upgrades/downgrades/recovery, optional-domain flow | No duplicate charge/site; replay-safe entitlements; provider separation and hosted recovery verified. |
| 7. Controlled launch | Small geography/business cohort, monitoring, support and rollback runbook | Explicit release approval, hosted checks, source freshness/correction response process and measured costs. |

Phases can be developed in scoped increments, but billing activation depends on phases 1 and 2, and public launch depends on all relevant gates. Preserve existing managed-website releases and independent AI holds. Do not publish seed inventory just to increase a visible count.

Acceptance must cover direct URL reload, mobile layout, branded links/emails, cross-device saved setup, role/tenant isolation, directory versus bookable status, removal persistence after reimport, ownership disputes, listing opt-out, billing transitions and continuity of business data. Record evidence separately for local implementation, provider verification and hosted release. Builds alone do not close these gates.

## Decisions still required

- New brand name/domain and consumer versus owner addresses; default Smart Site domain.
- Initial geography, detailed beauty/wellness taxonomy and directory source/dataset budget.
- Final price/currency matrix, plan limits, support scope, AI allowance and SMS economics.
- Whether unclaimed listings are indexed immediately after review; ranking/promoted placement policy.
- Ownership verification, correction/removal service targets and who handles disputed claims.
- Consumer account requirements and cancellation/no-show rules. Marketplace appointment payment is in person.
- Brand shown to owners with both products; initial separate-domain login versus later SSO.
- Pilot cohort, migration scope, launch metrics and release owner.

## Evidence and references

Repository evidence: P38 in ROADMAP.md (historical directory sourcing rules); lib/leadgenNative.js (Google Maps/Apify ingestion); platform CMS src/lib/supabase.ts (per-origin local storage); LoginPage.tsx and ForgotPasswordPage.tsx (origin-based redirects); current marketplace and Smart Site docs linked above. No live CRM publication eligibility audit was performed.

Provider references for implementation review:

- [Google Maps Platform terms](https://cloud.google.com/maps-platform/terms): review current product/region restrictions; never assume scraped facts can be republished.
- [Foursquare OS Places notice](https://opensource.foursquare.com/places-notice-txt/): dataset license and required notices, not a license to all Foursquare content.
- [OpenStreetMap copyright](https://www.openstreetmap.org/copyright): attribution and ODbL obligations.
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
- [Fresha online presence documentation](https://www.fresha.com/help-center/knowledge-base/online-presence) and [dated local survey](../../stemfra_platform/docs/smart-site/FRESHA_SURVEY_2026-11-04.md): competitor context, not an entitlement to reuse their listings or a current claim about their internal CMS.
