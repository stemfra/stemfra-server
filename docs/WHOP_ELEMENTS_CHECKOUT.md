# Whop Elements checkout

## Managed website checkout status

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
