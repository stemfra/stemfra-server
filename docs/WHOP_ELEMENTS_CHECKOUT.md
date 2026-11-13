# Whop Elements checkout

## Managed website checkout status

Sandbox audit found two pending KES 30,000 Marketing records with no linked Whop checkout and no pending non-USD CMS intent. The existing CAD membership is active, with a CAD 400 recurring price and a 30-day period. Whop payment history showed the original CAD 452 paid charge, including tax, and no observed renewal. No checkout was resumed to email verification.

For the current post-payment route, see [Marketing checkout to CMS setup](#marketing-checkout-to-cms-setup). Earlier activation and hosted checkout notes below describe historical flows.

Stemfra's custom embedded checkout renders the checkout page on a Stemfra domain and mounts Whop's secure card fields inside it. Hosted checkout sends the buyer to a checkout page on Whop's domain. Both use Whop to process payment.

**Checkout standard, 10 November 2026.** Use custom Stemfra checkout or an embedded provider checkout on the product's page for new integrations. The local retirement removes buyer redirects to Whop-hosted checkout. Buyers can contact billing@stemfra.com when checkout is unavailable. Keep earlier payment records and reconcile ambiguous attempts before offering another payment. The production rollout below records the earlier deployed configuration. See the [Stemfra checkout standard](../../docs/STEMFRA_PAY_WHOP_RESEARCH.md#checkout-standard).

| Entry point | Accepted in Whop Sandbox | Production behavior in the current code |
| --- | --- | --- |
| Marketing Pricing | Custom embedded payment and first-time CMS activation passed. The Hostinger-style cart was also tested through real Stemfra email verification and CMS setup in the local sandbox. | Production supports the same cart and embedded card flow through `WHOP_WEBSITE_CUSTOM_PRODUCTION`. With the flag off, the API declines to start checkout and offers billing support. |
| CMS Billing | The Hostinger-style embedded card form returned to Billing for the same website and showed one paid charge and an active subscription. | Embedded new-card checkout is opt-in through `WHOP_CMS_CARD_CHECKOUT_PRODUCTION`. The deployment workflow defaults the switch to off. When new-card checkout is unavailable, Billing offers support. Pending hosted attempts go to support for review. |

Before a controlled real-card test, verify the live Whop account, plan and currency mappings, permanent HTTPS return URLs, and signed webhook delivery for the intended path. Confirm the payment, invoice, subscription, and CMS outcome independently. The sandbox successes do not establish live payment acceptance. An actual issuer challenge and return, failed renewal and recovery, expiry, and refunds remain separate acceptance checks.

## Whop Ads attribution

The original checkout browser’s stored visitor ID exactly matched Whop’s visitor ID on the paid USD 299.00 sandbox payment. The visitor Events query returned zero records. Browser-to-payment linkage is verified. Landing-event attribution and purchase reporting remain unverified.

Marketing loads the Whop Pixel after explicit opt-in and honors Global Privacy Control. React reports `page` on eligible funnel navigations and `view_content` on the barbers offer. Campaign and click parameters carry into checkout for the opted-in session. Pages with purchase and resume data are excluded. Whop owns purchase reporting. Stemfra sends neither a manual purchase nor an initiate checkout event.

Set `VITE_WHOP_ADS_ACCOUNT_ID` to `biz_3yEQNCgp1hy3wV` only in the approved production build. Local verification needs `VITE_WHOP_ADS_TEST_ACCOUNT_ID` for a separate test business. The installed Elements 1.9.0 has built-in Pixel identity linking, enabled for opted-in buyers. Its confirmation-token interface has no visitor ID parameter.

Local checks covered the production client build and a simulated Pixel script load, consent, GPC, duplicate router notifications, campaign carry, and exclusion of a resume key. Provider acceptance remains open. In a separate test business, compare the opted-in landing browser's `_wuid` with the retrieved custom checkout payment's `wuid` using payment read access and `member:basic:read`. Use Whop's event history to verify automatic checkout and exactly one attributed purchase with the provider-confirmed amount and currency. Check a decline, refresh and webhook retry. Record matching status without saving raw visitor identifiers in handoffs. If linkage fails, investigate Elements and Whop before considering any changes to reporting.

Sandbox readback confirmed the existing barbers checkout was paid for USD 299.00 and returned a non-empty payment `wuid`. A follow-up query found zero events for that visitor and zero account events matching `payment.completed,pixel.page` over seven days. Whop's public sandbox guide does not specify Ads purchase reporting support. The browser automation surface could not inspect browser storage. Inspect `_wuid` in the original tab using browser developer tools for a same-browser comparison. An original landing event is still needed to independently prove the ID at landing time. This run used a synthetic UTM marker and does not establish attribution to a real ad.

Marketing reads allowlisted attribution from the current URL via the React Router subscription, stores it in session storage after opt-in, and restores it on eligible checkout URLs. The checkout start request and normalized server payment snapshot do not store UTMs, click IDs, or the Pixel visitor ID. The server keeps its order and provider payment references for reconciliation.

## Marketing checkout to CMS setup

Pricing **Subscribe** and template **Start** enter the same custom Stemfra checkout. Template entry preserves the selected design for provisioning. After payment is confirmed, buyers verify their email on the marketing site. New buyers enter their business name and set their password there. The verification email’s **Resume setup** link also returns to marketing.

The post-checkout **Log in** button points to the purchased website’s protected CMS route, `/setup?site=<site-id>`, for both new and existing buyers. If signed out, the CMS sends the buyer to sign in and preserves the setup destination. The CMS checks access to the requested site before opening its onboarding. The normal custom checkout handoff no longer uses the legacy CMS activation screen. This does not change the signed-in CMS Billing checkout, which returns to Billing for the selected site.

**Local verification, 12 November 2026:** The existing signed-in Sorrel sandbox buyer opened the site-specific setup link. The browser showed “Preparing your setup…” and then Sorrel onboarding, with no dashboard in between. The signed-out sign-in-and-return path and the existing-account purchase path were not rerun for this update. No new payment was submitted.

## 13 November 2026 release and acceptance check

- The live `/api/website-purchase/config` returned all three switches enabled. The latest successful Hostinger run, [42837458990](https://github.com/stemfra/stemfra-server/actions/runs/42837458990), deployed `537917bf`, the release that preserves existing hosted checkout resumes. Local hosted fallback retirement was not part of that release.
- Public Marketing `/checkout` and CMS `/setup` returned HTTP 200. SSH verified Marketing main `cb1902d9` and CMS main `2248d70a`. Neither branch contains the latest site-specific checkout handoff. The release credential returned 404 for frontend deployment metadata, so the route responses do not prove exact frontend deployment commits.
- Locally, Marketing's `WebsiteCheckoutEntry` uses the cart component and its account handoff. `SandboxCartPayment` reads `VITE_WEBSITE_SANDBOX_API_URL`; the server gates the cart endpoints on sandbox mode. Production promotion needs a shared, provider-mode-aware cart flow verified with the same customer experience. No code or configuration change was made.
- All 17 focused purchase, catalogue and offer tests passed. The isolated sandbox API on port 4057 was not running, and a usable private paid purchase resume and buyer login were not available. The signed-out browser check remains open. Reuse the paid Sorrel purchase, confirm sign-in preserves the purchased site, and observe its setup before any Dashboard render. No new payment was submitted.


Stemfra's custom embedded checkout renders the checkout page on a Stemfra domain and mounts Whop's secure card fields inside it. Hosted checkout sends the buyer to a checkout page on Whop's domain. Both use Whop to process payment.

| Entry point | Accepted in Whop Sandbox | Production behavior in the current code |
| --- | --- | --- |
| Marketing Pricing | Custom embedded payment and first-time CMS activation passed. The Hostinger-style cart was also tested through real Stemfra email verification and CMS setup in the local sandbox. | Production supports the same cart and embedded card flow through `WHOP_WEBSITE_CUSTOM_PRODUCTION`. With the flag off, new purchases use Whop's hosted checkout. |
| CMS Billing | The Hostinger-style embedded card form returned to Billing for the same website and showed one paid charge and an active subscription. | Embedded new-card checkout is opt-in through `WHOP_CMS_CARD_CHECKOUT_PRODUCTION`. The deployment workflow defaults the switch to off. With the switch off, new-card checkout opens Whop's hosted page. |

Before a controlled real-card test, verify the live Whop account, plan and currency mappings, permanent HTTPS return URLs, and signed webhook delivery for the intended path. Confirm the payment, invoice, subscription, and CMS outcome independently. The sandbox successes do not establish live payment acceptance. An actual issuer challenge and return, failed renewal and recovery, expiry, and refunds remain separate acceptance checks.

## Live email acceptance from regular Pricing

On 9 November 2026, a fresh buyer started the custom checkout directly from the regular marketing Pricing page on localhost:5173. Whop confirmed sandbox payment `pay_sulyWPNnbD4m35` for USD 299.00 with USD 0.00 tax and no further action. No Whop email OTP appeared.

The standard Resend mailer accepted the Stemfra verification email. Peter confirmed receiving it in the real inbox, entered the code privately, set the first password and reached website setup. Readback verified one preview test site, one active Whop subscription and one paid billing record, with the purchase marked complete. The test used an isolated local CMS origin and the existing provider status verification path. The signed webhook was exercised in the preceding sandbox run.

The temporary marketing API override was removed after the run. The original embed remains available with the custom flag off.

## Production rollout, 10 November 2026

Marketing `d6c08e89` and CMS `5f4e4155` reached production. The API enabled `WHOP_WEBSITE_CUSTOM_PRODUCTION` and `WHOP_CMS_CARD_CHECKOUT_PRODUCTION` during [activation run 42837251137](https://github.com/stemfra/stemfra-server/actions/runs/42837251137). The public checkout configuration confirmed both enabled. The permanent return uses the originating marketing domain or the selected CMS website, as applicable. The HTTPS sandbox relay is for local tests.

In that deployment, turning a production switch off restored hosted checkout for new attempts. An existing payment must be checked before starting another attempt. The CMS compatibility update lets customers reopen an already-created hosted checkout without creating another provider session. The deployed fixes are API `537917bf` and CMS `2248d70a`.

The four regional prices and the unsigned webhook rejection were verified in production. Live payment, signed delivery from a live purchase, issuer challenge, and the resulting account activation or subscription update were outside this release verification.


## Marketing integration sandbox acceptance

Set `WHOP_WEBSITE_CUSTOM_SANDBOX=true` on the local API with `WHOP_SANDBOX=true` and website purchases enabled. Start a new purchase from the marketing development server. The custom form collects billing details, shows the provider's quote and mounts Whop's card fields. The server binds the quote and confirmation token to the purchase before creating an idempotent payment. Use `WHOP_WEBSITE_CUSTOM_RETURN_ORIGIN` for a different localhost marketing port. With the custom flag off, new sandbox purchases use the original embedded checkout. Production uses its separate `WHOP_WEBSITE_CUSTOM_PRODUCTION` switch.

On 9 November 2026, a synthetic first-time buyer completed Pricing → custom checkout → payment confirmation → CMS activation. Whop payment `pay_ET2pfVPLLch8og` was paid for USD 299.00 with USD 0.00 tax and an active automatic monthly membership. Whop returned no next action and the browser stayed on Stemfra through payment, with no Whop email OTP.

Whop's dashboard showed HTTP 200 for the real `payment.succeeded` delivery `msg_sxTQFWIZsdGeOhA0Mck2jQhm`. The dedicated receiver rejected an unsigned probe with HTTP 401. The durable inbox marked the signed event done on attempt one. The purchase reached complete after the buyer verified a genuine Stemfra email code through a local mail adapter and entered business details. Readback confirmed one preview test site, one active Whop subscription, and one paid billing record. The owner could sign in again and open setup on the allowed local CMS origin.

The test routed activation mail to a local capture and skipped live domain attachment and media localization. The website sandbox hook was paused with its temporary URL after testing and the tunnel stopped. A future signed delivery run needs a reachable sandbox receiver. Issuer challenge and non-card payment paths were outside this run.

## Verification on 9 November 2026

Local Pricing showed the USD 299 monthly offer and enabled Subscribe with no Billing market selector. Clean Cuts Billing details loaded separately. It showed the active managed-website subscription, renewal date, editable billing fields and a masked Visa. Manage subscription and the cancellation confirmation were exercised without a subscription change.

The public managed-website checkout config returned enabled. At the time of that check, production used hosted checkout. The 4 November hosted acceptance and signed sandbox delivery replay are recorded in server commit `22d7c7a` and the [sandbox webhook runbook](WHOP_SANDBOX_WEBHOOK_RUNBOOK.md). The replay used an existing event. The later embedded test reached CMS business-name entry. This session did not submit another checkout. For the original embed, the return after Whop sign-in, a fresh signed payment delivery, ACH suppression, and eligible wallets remain open. The custom embedded checkout has separate signed sandbox delivery evidence above.

## Original checkout paths, 5 November 2026

- **Embedded sandbox.** Local Pricing requests the detected regional offer without a market override and passes that same quote to Subscribe. The API maps GB to GBP, CA to CAD, KE to KES, and US, unknown and other supported countries to USD. The browser mounts Elements only in a development build with a sandbox configuration and sandbox checkout URL.
- **Hosted checkout.** The same start endpoint creates the purchase, binds the selected plan and design metadata, and returns the hosted URL. Production builds navigate to that URL when the embedded switch is off. Whop receives the configured HTTPS CMS activation return. The local sandbox can use the HTTPS relay described below when configured.
- **Embedded return.** The Elements completion event or provider redirect starts server verification. Confirmed payment shows the buyer email and Continue, with automatic navigation after ten seconds. Both actions pass the existing purchase ID and key plus the success hint and buyer email in the CMS URL fragment. The email hint can display while the CMS skeleton loads. Keep the fragment out of logs and screenshots.
- **CMS activation.** The CMS validates the purchase and uses the server-confirmed email to issue or resume its verification code. Verify email becomes available after payment confirmation and entry of a complete code. The business-name screen follows verification. Template and business type come from the stored purchase and matching provider metadata.

Browser acceptance reached CMS email verification for a returning guest and the business-name screen for a newly tested address. Peter reported no Whop email-code prompt in the latter run. An earlier attempt reached the Whop storefront after Whop verification. These observations do not establish when Whop prompts for a code. Signed webhook delivery, business provisioning and Billing remain separate acceptance checks.

## Managed website integration

The website Subscribe action opens checkout directly and sends the current regional quote, approved starter, business type and consent through the existing `POST /api/website-purchase/start` endpoint. The server creates the purchase and its Whop checkout configuration with order metadata. It returns a `sandboxCheckout` object only for sandbox configurations. That object contains the configuration ID and the existing CMS activation URL. Keep API keys on the server and keep purchase resume keys out of logs and screenshots.

The local marketing component lazy-loads `@whop/elements` and `@whop/elements-react`, pinned to 1.9.0. It requires a sandbox response and a sandbox Whop checkout URL before mounting the embed.

```jsx
<WhopElements elements={loadWhop()} environment="sandbox">
  <Checkout checkoutConfiguration={configurationId} returnUrl={returnUrl}>
    <CheckoutElement />
  </Checkout>
</WhopElements>
```

Use the ID returned by checkout configuration creation. Whop Elements rendered the same configuration that failed with `@whop/checkout/react`. The provider's Elements runtime loads from its CDN. When the configured CMS return uses HTTPS, the development build offers the same hosted sandbox checkout as a fallback. Whop rejects an HTTP redirect URL during configuration creation. For a localhost sandbox return, the server omits that field and passes the localhost return directly to Elements. The original development embed and production checkout have separate switches.

Whop Elements returns the same browser tab to the marketing checkout with the purchase ID and outcome. The purchase key, CMS activation link and configuration ID stay in same-tab session storage. The branded page checks the existing status endpoint before rendering the form or confirming payment. On a successful return it passes Whop's payment ID for provider verification, polls for up to 12 attempts and offers a manual recheck if confirmation is delayed. Verified payment shows the CMS setup link and triggers automatic navigation. Failed and canceled returns can reopen the same configuration when the server still reports pending. CMS keeps its existing OTP and owner checks. A fresh browser needs the existing CMS recovery link for an already-paid purchase.

## Reusing the pattern in Stemfra AI

1. Start with AI's own authenticated billing flow, catalogue, environment and order binding. Use the configuration ID created for that exact AI order. Keep website plans, return URLs, webhook settings and credentials separate.
2. Mount Elements after the existing subscription review. Use an AI-specific return URL and provide the billing support link if checkout is unavailable. Use a fixed sandbox environment in the first test.

2. Mount Elements after the existing subscription review. Use an AI-specific return URL and preserve the existing hosted fallback while validating. Use a fixed sandbox environment in the first test.
3. Treat the return as a signal to refresh AI billing. Use existing verified provider and signed-webhook logic for subscription state, invoice reconciliation and idempotent credit grants.
4. Verify the selected plan, amount and currency in the embed. Use a sandbox test account and test payment method. Check return, webhook delivery, one subscription and one credit grant, and repeat the status refresh without granting twice.
5. Check cancellation, failure and retry. Check mobile layout and any content security policy on the target host before planning production activation.

Official reference: [Whop Elements documentation](https://docs.whop.com/elements/latest).

## Local acceptance, 5 November 2026

- Local pricing opened the branded checkout directly for USD 299/month with the selected Rourke & Sloane query preserved in Back to pricing. The desktop browser reported two columns at 1664px. At 390px the layout settled to one column without horizontal page overflow. These were simulated viewport checks in the in-app browser.
- Whop rendered Card, ACH, Buyer Terms, Privacy Policy and Powered by Whop. Apple Pay and Google Pay did not appear in that browser on localhost. The browser checkout used the already-running API, which predates the scoped ACH override.
- The installed SDK accepts checkout-level payment method overrides. Fresh website sandbox configurations request that Whop disable `us_bank_account` while retaining default methods. Verify the effective provider configuration and actual form with a freshly started sandbox checkout before calling this accepted. Wallet verification requires an eligible browser/device and registered HTTPS domain. See [Whop's wallet domain instructions](https://whop.com/blog/embedded-checkout-for-platforms/).
- Marketing client/SSR build and 100-route prerender completed. A fabricated success return on the unpaid purchase displayed the confirmation spinner. The purchase still requires a completed sandbox submission and signed webhook, CMS OTP and Billing acceptance. Refresh and retry in this browser reuse the existing purchase reference. Treat the earlier hosted setup acceptance as a separate baseline.
- A fabricated success return timed out to Check again without exposing the CMS setup link. A simulated cancellation offered the same purchase again. Back to pricing preserved both the market and starter. Added a visible loading state while the Elements form initializes.

## Approved checkout layout

Local checkout uses a light gray summary column, top-aligned rounded cards, policy links at the bottom of the left column, and a circular shadowed X that returns to the saved origin. Processing occupies the right card. Client and SSR builds and 100-route prerender completed. The browser connection prevented fresh visual and navigation checks.

## Fresh sandbox submission

The current local pricing page opened a new USD299/month embedded checkout with Rourke & Sloane selected. Card and ACH appeared. One sandbox card submission showed Processing payment inside Whop and navigated to Whop Sandbox email verification. A completed payment, Stemfra return, signed webhook, and CMS acceptance require further verification. Check this attempt before retrying.

## Hosted verification return

After sandbox email verification Whop sent this test to its storefront. The server had omitted its redirect because the CMS destination used HTTP localhost. Configure `WHOP_WEBSITE_SANDBOX_RETURN_ORIGIN` to an approved HTTPS origin routing the sandbox return endpoint to the isolated API, with `WHOP_SANDBOX=true`. Fresh checkout configurations then send Whop to the relay, which redirects to the fixed localhost marketing checkout with only the order ID and optional provider hints. The purchase key stays in the original tab. Confirm the relay and provider return before making another test payment. Existing checkouts retain their original redirect.
## Custom card checkout sandbox test

On 9 November 2026, an isolated localhost form used Whop Payments Elements and CardElement against the managed-website sandbox plan. The test queried the sandbox for a fresh synthetic email before submission and found zero matching members. The server requested a payment quote for the test address, retrieved the browser confirmation token, and created the payment with that quote and an idempotency key.

Whop recorded payment `pay_qMAkCVvwdyvq7V` as paid, with status succeeded and billing reason subscription_create. The USD 299.00 total and USD 0.00 tax matched the quote. Membership `mem_gVSBli3x9OKqQt` was active on the intended plan with automatic monthly renewal. Whop returned no next action and the browser stayed on localhost without an email OTP.

The test page initially called the next-action method on the mounted Payments handle. The static method belongs to `useWhop().payments`. After correcting that and reloading, the page displayed success from the verified payment and membership without submitting again. The sandbox card did not require issuer verification, so the challenge path remains untested. The temporary harness did not exercise the marketing checkout, signed webhook delivery or CMS activation.
