# Marketplace implementation and activation runbook

5 November2026. Local implementation only. Temporary Stemfra identity approved. Canonical decisions: [product plan](BEAUTY_WELLNESS_MARKETPLACE_PLAN_2026-11.md). Browser evidence: [platform acceptance](../../stemfra_platform/docs/marketplace/IMPLEMENTATION_2026-11-05.md).

## Implemented boundaries

`lib/marketplace.js`, `lib/marketplaceSite.js`, `routes/marketplace.js` and `routes/admin/marketplace.js` reuse existing API authentication, site ownership and PLATFORM_OPS checks. MARKETPLACE_ENABLED must equal true; default is false. Disabled public routes return503 before touching the database. No background jobs, CRM import, messages, provider requests or ownership transfers are introduced.

Public catalogue/detail serialize an explicit allowlist only. Public visibility requires published, owner_visible and source_approved. Detail hydration uses current active/published existing site content; unpublished linked sites return unavailable. Catalogue cards use their reviewed stored summary. Bookable requires a claimed, linked live site with booking_enabled. Marketplace customers book online and pay the business directly at the appointment. The marketplace does not collect card details, take deposits or process appointment payments on behalf of tenants. Tenant online checkout settings are excluded from marketplace profiles, and the shared booking form submits a reservation only. Package and gift purchase prompts are hidden on marketplace profiles. Business software subscriptions and standalone website settings are unchanged. Dedicated Smart Sites remain independent.

## Routes

- GET `/api/marketplace/listings`: reviewed beauty/wellness public catalogue, maximum1000. q/city are bounded literal filters.
- GET `/api/marketplace/listings/:slug`: approved profile, current linked-site public content.
- POST `/api/marketplace/listings/:slug/requests`: claim/correction/removal intake; validation, IP throttle and durable listing/email cooldown. No mail or automatic claim approval.
- GET/PUT `/api/marketplace/owner/:siteId`: existing CMS owner/staff authorization; PUT only changes owner_visible. Publication/booking escalation fields ignored.
- GET `/api/admin/marketplace/requests`, PATCH `/requests/:id`: existing staff role-gated private queue and review notes. Resolving a request records review, not ownership transfer.
- POST `/api/admin/marketplace/listings/:id/review`: source-gated publish or suppression, concurrency check. Suppressed records cannot be republished by this endpoint.

Confirm exact route paths in source before scripting. No credential should be placed in frontend variables or docs.

## Database and sourcing

Pending migration: `supabase/migrations/20261104223516_marketplace_public_directory.sql`. Generated using the CLI and tested in isolated PGlite, not applied remotely. Creates marketplace_listings and private marketplace_requests, category/publication/booking constraints, indexes, cooldown trigger, RLS and service_role-only table access. No seeds. Site deletion cascades its linked listing/requests; retain required audit records separately before destructive operations. Review data retention and operator policy before launch.

Before applying: verify the existing server/platform Supabase target and current schema/migration history; coordinate shared DB changes with Peter and the AI session. Preserve AI project separation. Review the migration diff, take the established backup and use the documented migration workflow. After application, run owner/staff/public negative and positive read/write checks against controlled test records before enabling.

CRM not-won leads are candidates only. Do not bulk-copy Google/Apify content into a public profile. Eligible source label, URL where available, checked date, license/provenance, source approval and reviewer are required before publication. No actual eligibility audit, importer, canonical source-key deduplication or durable suppression re-import ledger is supplied here. Keep ingestion disabled until those controls and correction/removal/ownership review policy are accepted. No fabricated ratings, contacts, team, availability or bookings.

## Frontend configuration

Marketplace public build variables are documented in `stemfra_templates/marketplace/.env.example`. Use VITE_SERVER_URL for a separate API origin, VITE_CMS_URL for owner access, VITE_MARKETPLACE_BRAND for public identity and VITE_MARKETPLACE_LIVE=true for live local adapter testing. Development defaults to labelled fixtures; production never falls back to fixtures. Preserve noindex until launch review.

CMS public branding uses exact allowlisted VITE_MARKETPLACE_CMS_HOSTS, VITE_MARKETPLACE_BRAND, VITE_MARKETPLACE_LOGO and VITE_MARKETPLACE_URL. Unknown hosts retain Stemfra. Hostname only chooses presentation; existing tenant/staff authorization controls access. Cloudflare extra hostnames, API CORS, Supabase redirect allowlists and actual two-origin password/Google/reset checks have not been configured or verified. Sessions remain separate per origin; no SSO promised.

## Acceptance and rollback

Passed11 isolated server/database tests, two platform route tests, three frontend builds, CMS typecheck, server syntax and whitespace checks. Desktop fixture acceptance is recorded in platform docs. A separate Chrome run verified local marketplace interactions at 390px.

Remaining before release: final name/domain and commercial matrix, eligible pilot data/claim policy, migration/configuration, real owner visibility/photo persistence, staff queue/review, live public availability and booking/email, both hosted branded auth journeys, mobile navigation/accessibility and routing. New Whop plans, entitlements and domain checkout are not activated. Existing managed website prices/payment recovery and independent AI are unchanged. No deployment or push occurred.

Rollback public exposure by setting MARKETPLACE_ENABLED=false and reverting the marketplace frontend release. Leave data intact for review; do not drop tables as routine rollback. Existing standalone websites/booking remain independent. Verify disabled response and no public projection after rollback. This pass has not exercised a hosted rollout or rollback.
