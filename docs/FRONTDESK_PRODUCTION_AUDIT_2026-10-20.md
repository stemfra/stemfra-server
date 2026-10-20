# Front Desk production audit, 20 October 2026

Read-only configuration investigation. No runtime configuration, application code or deployments changed. Browser/HTTP chat probes were made; they may create chat history. No bookings, calls or emails were requested.

## Confirmed findings

- Argyle custom domain: production chat bundle targets https://api.stemfra.com. POST preflight for https://argyleandsons.click returns no Access-Control-Allow-Origin. Server index.js accepts stemfra.com and selected Pages domains but does not resolve tenant custom domains. Browser cannot send this request successfully.
- Vesper: same production API URL, valid preflight. Browser reproduces Failed to fetch; direct chat request returned Cloudflare 502. Hostinger server logs contain `site-chat.send` n8n workflow HTTP 500 errors. The exact failing n8n node was not inspected.
- Server local FRONTDESK_MODE=native; production omits FRONTDESK_MODE and therefore selects n8n. FRONTDESK_MODEL and OPENAI_API_KEY match local production values. CONCIERGE_MODE is also native locally and absent in production; no Concierge functional test performed.
- This difference originated in the September 2 handoff: native Front Desk/Concierge were local trials pending migration approval. The workflow still omits both switches. These are nonsecret deployment settings, not missing GitHub API-key secrets.
- Hostinger server and separate AI Docker projects report running. Running status does not prove chat correctness. This widget is handled by stemfra_server, not the separate Stemfra AI application.

## Cloudflare Pages comparison

Production settings checked for barbers, salons, spa, massage, crossfit, yoga and CMS. Supabase URL and anonymous key match local values for all. Template VITE_SERVER_URL differs as expected between local development and production API. VITE_DEV_SITE_SUBDOMAIN is local-only by design; NODE_VERSION is production-only. CMS Google Maps key matches; CMS has production-only VITE_SERVER_URL and NODE_VERSION. No missing frontend chat setting was identified. Public Argyle and Vesper bundles both use the correct production API.

## Server environment comparison

Names and equality only. No values or hashes retained. Comparison uses local .env and Hostinger Docker project environment, not a process-level environment dump. Google service-account private key differs only in newline encoding and matches after normalization. Other differing settings need context-specific review; they are not evidence of a Front Desk failure. Local-only operational credentials and dev/test settings should not be copied wholesale to production.

| Key | Local | Production | Comparison |
| --- | --- | --- | --- |
| AIRWALLEX_API_KEY | Present | Present | Matches |
| AIRWALLEX_CLIENT_ID | Present | Present | Matches |
| AIRWALLEX_WEBHOOK_SECRET | Present | Present | Matches |
| APIFY_TOKEN | Present | Present | Matches |
| API_HOST | Present | Present | Matches |
| BRANDFETCH_API_KEY | Absent | Present | Not comparable |
| CLIENT_URL | Present | Present | Differs; review context |
| CLOUDFLARE_ACCOUNT_ID | Present | Present | Matches |
| CLOUDFLARE_API_TOKEN | Present | Present | Matches |
| CLOUDFLARE_ZONE_ID | Present | Present | Matches |
| CLOUDINARY_API_KEY | Present | Present | Matches |
| CLOUDINARY_API_SECRET | Present | Present | Matches |
| CLOUDINARY_CLOUD_NAME | Present | Present | Matches |
| CMS_URL | Absent | Present | Not comparable |
| COMMISSION_SCHEDULER_ENABLED | Present | Present | Differs; review context |
| CONCIERGE_MODE | Present | Absent | Not comparable |
| CONCIERGE_MODEL | Present | Present | Matches |
| CONCIERGE_N8N_URL | Present | Present | Matches |
| DOMAIN_REGISTRAR | Present | Present | Matches |
| ELEVENLABS_API_KEY | Present | Present | Matches |
| EMAIL_PROVIDER | Present | Present | Matches |
| EXPENSE_MB2_PASS | Present | Present | Matches |
| EXPENSE_MB2_USER | Present | Present | Matches |
| FRONTDESK_MODE | Present | Absent | Not comparable |
| FRONTDESK_MODEL | Present | Present | Matches |
| FRONTDESK_N8N_URL | Present | Present | Matches |
| GITHUB_BRANCH | Present | Present | Matches |
| GITHUB_REPO | Present | Absent | Not comparable |
| GITHUB_REPO_ID_CLOUDFLARE | Present | Present | Differs; review context |
| GITHUB_REPO_NAME_CLOUDFLARE | Present | Present | Matches |
| GITHUB_REPO_OWNER | Present | Present | Matches |
| GITHUB_REPO_OWNER_ID_CLOUDFLARE | Present | Present | Matches |
| GMAIL_APP_NAME | Present | Absent | Not comparable |
| GMAIL_APP_PASSWORD | Present | Present | Matches |
| GMAIL_USER | Present | Present | Matches |
| GOOGLE_SA_CLIENT_EMAIL | Present | Present | Matches |
| GOOGLE_SA_PRIVATE_KEY | Present | Present | Differs; review context |
| HOSTINGER_API_KEY | Present | Absent | Not comparable |
| HOSTINGER_VM_ID | Present | Absent | Not comparable |
| INBOUND_REPLY_DOMAIN | Present | Present | Matches |
| LAUNCH_EMAIL | Present | Absent | Not comparable |
| LAUNCH_PASSWORD | Present | Absent | Not comparable |
| LEADGEN_API_URL | Present | Present | Differs; review context |
| LEADGEN_MODEL | Absent | Present | Not comparable |
| LEADGEN_OPS_SECRET | Present | Present | Matches |
| LOGO_URL | Present | Present | Matches |
| MAPBOX_PUBLIC_TOKEN | Present | Present | Matches |
| MARK_EMAIL | Absent | Present | Not comparable |
| MOCKUP_RENDER_URL | Absent | Present | Not comparable |
| N8N_LEADGEN_COLD_URL | Present | Present | Matches |
| N8N_WEBHOOK_SECRET | Present | Present | Matches |
| NODE_ENV | Present | Present | Differs; review context |
| NOTIFY_EMAIL | Present | Present | Matches |
| ONLINE_PAYMENTS_ENABLED | Absent | Present | Not comparable |
| OPENAI_API_KEY | Present | Present | Matches |
| OUTSCRAPER_API_KEY | Present | Absent | Not comparable |
| PAYMENT_CREDENTIALS_KEK | Present | Present | Matches |
| PLATFORM_BILLING_RETURN_URL | Absent | Present | Not comparable |
| PORKBUN_API_KEY | Present | Present | Matches |
| PORKBUN_SECRET_API_KEY | Present | Present | Matches |
| PORT | Present | Present | Matches |
| PUBLIC_BASE_URL | Present | Present | Differs; review context |
| RECON_ENABLED | Absent | Present | Not comparable |
| RESEND_API_KEY | Present | Present | Matches |
| RESEND_FROM_ADDRESS | Present | Present | Matches |
| RESEND_FROM_DOMAIN | Present | Present | Matches |
| RESEND_INBOUND_SECRET | Present | Present | Matches |
| SETUP_CALL_ATTENDEES | Present | Absent | Not comparable |
| SETUP_CALL_BUSY_EMAILS | Present | Absent | Not comparable |
| SETUP_CALL_HOST_EMAIL | Present | Absent | Not comparable |
| STACY_MODE | Present | Present | Matches |
| STACY_MODEL | Present | Present | Matches |
| STACY_N8N_URL | Present | Present | Matches |
| STAFF_TRANSFER_PHONE | Present | Absent | Not comparable |
| STEMFRA_ADMIN_SECRET | Absent | Present | Not comparable |
| STEMFRA_MAILING_ADDRESS | Absent | Present | Not comparable |
| STRIPE_APPLICATION_FEE_BPS | Present | Present | Differs; review context |
| STRIPE_PROCESSING_FIXED_CENTS | Absent | Present | Not comparable |
| STRIPE_PROCESSING_PCT_BPS | Absent | Present | Not comparable |
| STRIPE_PUBLISHABLE_KEY | Present | Present | Matches |
| STRIPE_SECRET_KEY | Present | Present | Matches |
| STRIPE_SUBSCRIPTION_APP_FEE_PCT | Absent | Present | Not comparable |
| STRIPE_WEBHOOK_SECRET | Present | Present | Matches |
| SUPABASE_ACCESS_TOKEN | Present | Absent | Not comparable |
| SUPABASE_SECRET_KEY | Present | Present | Matches |
| SUPABASE_URL | Present | Present | Matches |
| TENANT_CUSTOM_HOSTNAMES | Present | Present | Matches |
| TENANT_WILDCARD_ROUTING | Present | Present | Matches |
| TWILIO_ACCOUNT_SID | Present | Present | Matches |
| TWILIO_API_KEY_SECRET | Present | Present | Matches |
| TWILIO_API_KEY_SID | Present | Present | Matches |
| TWILIO_AUTH_TOKEN | Present | Present | Matches |
| TWILIO_PHONE_NUMBER | Present | Present | Matches |
| TWILIO_PHONE_NUMBER_CA | Absent | Present | Not comparable |
| TWILIO_PHONE_NUMBER_GB | Absent | Present | Not comparable |
| TWILIO_TWIML_APP_SID | Present | Present | Matches |
| UNSPLASH_ACCESS_KEY | Present | Present | Matches |
| VOICE_MODEL | Present | Present | Matches |
| VOICE_PHONE_NUMBER | Present | Present | Matches |
| VOICE_PHONE_NUMBER_CA | Absent | Present | Not comparable |
| VOICE_PHONE_NUMBER_GB | Absent | Present | Not comparable |

## Recommended next action, not executed

Review and authorize moving Front Desk to its existing native transport through .github/workflows/deploy.yml (production source of truth), keeping the existing model/key. Treat Concierge separately. Fix CORS using verified active tenant custom domains, not unrestricted origin reflection. Then deploy and verify both domains. If retaining n8n, inspect and repair the failing workflow instead. Changes directly in Hostinger alone would be overwritten by the next workflow deployment.

No secret addition was established as necessary for these two failures. GitHub encrypted secret values were not retrieved; the deployed runtime settings were compared instead.
