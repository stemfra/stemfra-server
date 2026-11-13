# Website service tiers

Current brand/scope and delivery authority: [beauty/wellness marketplace plan](BEAUTY_WELLNESS_MARKETPLACE_PLAN_2026-11.md). Marketplace is a new brand under Stemfra; Smart Site is its offering, with a shared CMS and beauty/wellness-only marketplace scope. Historical wording below does not activate prices.

Discussion recorded 4 November 2026. Status: agreed product direction for planning, not authorization to implement, change prices, configure Whop or deploy.

## Proposed offer structure

Peter agreed with the four-offer recommendation below. USD amounts are proposed monthly prices, pending packaging and cost validation. Preserve the supplied $20 and $50 figures; do not silently convert to $19/$49.

| Working plan name | Proposed USD/month | Product distinction |
|---|---:|---|
| Marketplace | 20 | Business profile within Stemfra, booking and essential business management. Value must stand on the booking tool, not a promise of marketplace traffic. |
| Smart Site | 50 | Dedicated one-page business website, its own address and branding, without competitor listings beside it. |
| Managed Website | 199 | Productized full website using an available Stemfra theme, managed setup and software maintenance, without AI Front Desk. |
| Managed Website + AI | 299 | Managed Website plus AI Front Desk, subject to a defined allowance and cost validation. |

Descriptive names were preferred over Basic/Standard/Business because website format is the main distinction. Final labels and whether Marketplace appears separately from the three website comparison cards remain to confirm. Higher plans should include an optional marketplace listing; owner opt-out was recommended. Booking, clients and essential email notifications should be consistent, with upgrade continuity. These are packaging directions, not claims that all features are released.

Peter clarified that his earlier phrase “custom website” referred to the existing managed themed website. It does not mean bespoke custom software or a separate custom-development service.

## Managed updates: confirmed scope

Peter explicitly confirmed that these are productized websites. Managed updates cover software packages/dependencies and security packages/patches. They do not cover redesign, bespoke customization beyond the theme or changes to the theme’s capabilities.

Existing supported theme settings and owner content editing remain part of using the product. The commercial/support document should distinguish ordinary defect correction and compatibility maintenance from new feature requests; the exclusion above must not be interpreted as permission to leave security or existing-functionality defects unresolved. Response targets and the precise maintenance policy remain to define.

Do not advertise unlimited design changes or bespoke development as part of either managed subscription. Requests beyond supported theme capabilities need a separate assessment and agreement, not an implied subscription entitlement.

## Other directions carried forward

- Default Stemfra address; optional custom-domain registration purchased separately at the quoted price, without a fixed domain-price cap. Previous planning requires exact-price authorization and successful payment before registration; renewal, transfer and cancellation terms still need definition.
- No AI Front Desk on the current simplified Marketplace/Smart-site direction. AI premium applies to the full managed website offer; independent Stemfra AI remains a separate product/billing boundary.
- Email alerts remain the baseline. SMS inclusion, allowance and pricing are undecided. Do not enable or test Twilio as part of this planning.
- Marketplace should not promise new customers or guaranteed traffic before there is evidence of consumer demand.
- Standalone Smart-sites remain independent business destinations even when an owner chooses marketplace discovery.

## Decisions required before implementation

1. **Entitlement matrix:** exact pages, supported theme controls, booking/clients/team features, email, support, CMS sections and publish rights per plan. Decide per-business/location pricing and included bookable staff; avoid accidental unlimited high-cost usage.
2. **Marketplace offer:** paid booking tools versus paid discovery, whether a free non-bookable listing exists, opt-in/out, ranking/sponsored-placement policy, and no unapproved commission promise. Licensed public-directory data and owner consent/claim rules remain separate P38 gates.
3. **Upgrade/downgrade lifecycle:** one business record, retained bookings/clients, profile-to-Smart-site-to-full-theme mapping, domain continuity, proration, billing-cycle timing, cancellation/nonpayment, retained data and restoration. Define what happens to unsupported content and AI history on downgrade.
4. **Unit economics:** payment fees, hosting/storage, email, security maintenance, onboarding and support time per business. AI allowance, overage/limit behavior and cost of the extra $100 must be established from measured costs. No margin claim yet.
5. **Managed-service policy:** setup responsibility, content import, customer editing, maintenance/bugfix scope, support channel and response targets. Bespoke design/theme capabilities excluded as confirmed above.
6. **Domains:** included address, custom-domain purchase/renewal billing, ownership, failed registration/refund, transfer-out and downgrade handling. Registration is distinct from connecting an already-owned domain.
7. **Regional pricing and checkout:** decide CAD/GBP/KES equivalents, tax display and monthly/annual options. Trace approved changes through catalogue, Whop plan metadata, signup, entitlements, billing, invoices, CRM and recovery. Reuse the payment-first journey; no new duplicate signup logic.
8. **Release and migration:** distinguish currently released $299 managed offer from these proposed packages. Existing demo/test subscriptions must not be silently remapped. Complete Marketplace/Smart-site live inventory, booking/CMS acceptance and routing before selling those products. Pilot demand and support cost before permanent price commitments.

Recommended next artifact: one feature/entitlement comparison matrix plus the upgrade/downgrade rules. Approve those before any catalogue, UI, database or provider work.

## Evidence and limits

Basis: Peter’s pricing discussion and explicit managed-maintenance clarification in this chat, existing marketplace/Smart-site implementation docs, current roadmap/launch status. Prior competitor reference checks: https://biz.booksy.com/pricing and https://glossgenius.com/pricing; their prices were context, not a basis for claiming feature parity or profitability. This note does not reverify vendor prices.

Current marketplace is a local sample-data preview with internal business profiles, not a live directory or released subscription. Current Smart-site has separate live-data adapter and outstanding release gates. See [marketplace](../../stemfra_platform/docs/marketplace/README.md), [Smart-site](../../stemfra_platform/docs/smart-site/README.md) and [managed purchase journey](../../docs/user-journeys/managed-website-purchase-to-setup.md).

Documentation-only change. No application code, price catalogue, subscription, database, Whop configuration, payment, deployment or customer communication changed.
