# Whop website sandbox webhook

This receiver is for managed-website tests. Stemfra AI has its own receiver, webhook and signing secret. Do not update one product's webhook to the other product's address.

## Why the temporary address can fail

Whop must send webhooks to a public HTTPS endpoint. It cannot reach a developer's localhost address. A temporary Cloudflare tunnel forwards that public endpoint to the local sandbox receiver. Checkout return URLs can also use a tunnel when HTTPS is needed, but a return page and a webhook receiver are separate destinations.

A `trycloudflare.com` address is temporary. When the tunnel stops, the machine sleeps, or the tunnel is replaced, its old address may no longer resolve or reach the receiver. Whop retains the configured address until it is edited. A Failing badge therefore does not by itself prove that the payment or subscription failed.

The retired website endpoint `tex-united-parallel-pat.trycloudflare.com` failed DNS resolution on 4 November 2026. Its history included earlier HTTP503 responses with `Synchronization unavailable`, followed by successful HTTP200 deliveries. Diagnose the individual delivery response as well as current reachability.

## Before resuming a local test

1. Check which process owns website receiver port4055. Reuse the intended sandbox receiver; do not restart an occupied port blindly. Confirm sandbox account `biz_JXJPD9Q4Ta5thq`, sandbox credentials and the correct website signing secret privately. Do not enable unrelated background jobs.
2. Start a temporary tunnel to `http://127.0.0.1:4055`. Read the newly assigned HTTPS origin from its log. Keep the receiver and tunnel running during the test.
3. Confirm the public `/health` route reaches the website sandbox receiver. This is a reachability check, not signed webhook acceptance.
4. In Whop **sandbox**, open Developer → Webhooks → **Stemfra sandbox test** (`hook_g7xlBRcIKALZr`). Update only its URL to the new origin plus `/api/whop/webhook`. Keep the existing signing secret, event selection, API date `2026-10-15-1` and sub-account setting. Do not create duplicate webhooks or change the AI webhook.
5. Save, reopen and verify the actual URL. If the API returns403, use the authorized dashboard; do not expand API permissions merely to edit this URL.
6. Replay one known delivery for an existing website sandbox purchase. Do not make another payment. Confirm signature verification, a fast HTTP200 response, and successful durable inbox processing. HTTP200 queued alone does not prove downstream reconciliation completed.
7. Confirm the replay did not add a second subscription, invoice, receipt email or site. Record the provider delivery ID, response, inbox result and date without secrets or private payment data.

## Diagnose a failing delivery

| Observation | Check |
| --- | --- |
| Hostname cannot resolve | The temporary tunnel address has expired. Start a reachable tunnel and update this sandbox webhook URL. |
| Cloudflare502/connection error | Tunnel is reachable but its local receiver is stopped, on a different port, or unavailable. |
| HTTP401 | Verify the exact signing secret and raw-body verification. Do not disable signature checks. |
| HTTP503 synchronization error | Inspect receiver logs and database/provider reconciliation. Repair the underlying failure, then replay the existing delivery. |
| HTTP200 queued | Inspect the durable inbox for done/retry/review. Preserve idempotency. |
| Old failures remain in history | Confirm a new controlled delivery and its downstream result; do not assume every historical failure is still current. |

For repeated development, prefer a named, access-controlled development tunnel with a stable hostname when it is deliberately configured. Until then, check the temporary URL at the start of every session. Production must use the permanent `https://api.stemfra.com/api/whop/webhook` endpoint, never a development tunnel. Updating a webhook does not update previously created checkout return URLs.

If the browser connection or required account access is unavailable, leave configuration unchanged and record the blocker. Do not describe delivery as verified until the signed provider event and database result are both checked.
