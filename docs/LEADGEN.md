# Lead-Gen Module — Server Side

> **What happens AFTER a lead lands** (templates, Mark's sends, the follow-up drip,
> read-gated voice calls) is documented in [OUTREACH.md](OUTREACH.md) — read it before
> touching send-outreach, the sequencer, or the Score & Draft prompt.

How `stemfra-server` brokers AI-scored lead-gen runs between the CRM and the
n8n workflow that does the actual scraping + scoring + DB insert.

**Live route:** `POST https://api.stemfra.com/api/leadgen/trigger`
**Source:** [`routes/leadgen.js`](../routes/leadgen.js)
**Mounted in:** [`index.js`](../index.js) as `app.use('/api/leadgen', leadgenRoutes)`

---

## What this server does (and does not do)

This server is a **thin, authenticated bridge** in front of n8n:

```
┌────────────────┐   Bearer JWT    ┌───────────────────┐  x-leadgen-secret  ┌────────────┐
│ crm.stemfra.com│ ─────────────▶ │ api.stemfra.com   │ ─────────────────▶ │ n8n.srv... │
│ (Fetch Leads UI)│                 │ /api/leadgen/trigger                  │ workflow   │
└────────────────┘                 └───────────────────┘                    └─────┬──────┘
                                                                                  │
                                                                                  │ scrape → score → insert
                                                                                  ▼
                                                                          ┌────────────┐
                                                                          │  Supabase  │
                                                                          │ leads table│
                                                                          │ review_status= 'needs_review'
                                                                          └────────────┘
```

What `routes/leadgen.js` is responsible for:

1. **Auth** — verifies the caller's Supabase JWT.
2. **Validation** — system ∈ {cold, warm}, vertical against an allow-list, city required, clamps max_results/min_score so a bad call can't waste an Apify/Claude run.
3. **Webhook URL selection** — picks `N8N_LEADGEN_COLD_URL` or `N8N_LEADGEN_WARM_URL` from env based on the `system` field.
4. **Search-query composition** — builds the human-readable Google Maps query from `city, state_name, country_name` so the scraper doesn't return Brooklyn IA when the user picked Brooklyn NY.
5. **Webhook firing** — POSTs the payload to n8n with the `x-leadgen-secret` header attached so n8n can verify the request actually came from us.
6. **Activity logging** — best-effort row in `activity_feed` so the run is auditable in the CRM's activity stream.
7. **Async-friendly response** — uses a 25 s AbortController so a slow n8n doesn't hang the HTTP request. A timed-out request returns `202 Accepted` because the workflow keeps running on n8n's side and writes leads when done.

What it does **not** do:

- Scraping. n8n handles Apify / direct Google Maps calls.
- AI scoring. n8n calls Claude (or whatever model) inside the workflow.
- Writing to the `leads` table. n8n inserts directly via the Supabase service-role credentials baked into its workflow.

---

## Endpoint contract

### Request

`POST /api/leadgen/trigger`

| Header | Value | Required |
|---|---|---|
| `Authorization` | `Bearer <supabase_access_token>` | ✓ |
| `Content-Type` | `application/json` | ✓ |

Body fields (all optional unless flagged):

| Field | Type | Default | Notes |
|---|---|---|---|
| `system` | `'cold' \| 'warm'` | `'cold'` | Selects which n8n webhook to fire. |
| `vertical` | string | `'barbershop'` | Must match the server-side `KNOWN_VERTICALS` allow-list. |
| `city` | string | `''` | **Required** for `system='cold'` (unless `search_query` is set explicitly). |
| `country` | string | `null` | ISO-2 (e.g. `'US'`). Sent through to n8n; not used to build the default query. |
| `country_name` | string | `null` | Human-readable (e.g. `'United States'`). Used in the default `search_query`. |
| `state_code` | string | `null` | e.g. `'NY'`. Fallback in the default `search_query` when `state_name` is empty. |
| `state_name` | string | `null` | e.g. `'New York'`. Preferred in the default `search_query`. |
| `max_results` | int | `30` | Clamped 1–100. |
| `min_score` | int | `5` | Clamped 1–10. The workflow drops leads scoring below this. |
| `search_query` | string | _(see below)_ | Override the default composed query. |

#### How `search_query` is composed when not passed

```
verticalText = vertical.replace('_', ' ')
stateSegment   = state_name   || state_code   || null
countrySegment = country_name || country      || null
segments       = [city, stateSegment, countrySegment].filter(Boolean)
search_query   = `${verticalText} in ${segments.join(', ')}`
```

Examples:

| Input | Resulting `search_query` |
|---|---|
| Brooklyn / NY / US (full names) | `barbershop in Brooklyn, New York, United States` |
| Brooklyn / NY / US (no state name) | `barbershop in Brooklyn, NY, United States` |
| Lagos / NG (country has no states) | `barbershop in Lagos, Nigeria` |
| Brooklyn only (legacy / no geo enrichment) | `barbershop in Brooklyn` |

### Responses

| Status | When | Body |
|---|---|---|
| `202 Accepted` | n8n ack'd the run, OR n8n didn't respond within 25 s (run still in progress) | `{ success: true, message: "Lead-gen cold run started for barbershop in Brooklyn. New leads will appear in the review queue shortly." }` |
| `400 Bad Request` | Validation failed | `{ success: false, message: "..." }` |
| `401 Unauthorized` | No or invalid Bearer JWT | `{ success: false, message: "Unauthorized" }` |
| `502 Bad Gateway` | n8n returned non-2xx | `{ success: false, message: "Lead-gen workflow could not be started (n8n responded NNN)." }` |
| `503 Service Unavailable` | `N8N_LEADGEN_COLD_URL` (or warm) not set | `{ success: false, message: "Lead-gen (cold) is not configured on the server yet." }` |

---

## Environment variables

Source of truth: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — the Hostinger deploy action REPLACES the project env each time, so anything not listed there gets wiped.

| Var | Source | Notes |
|---|---|---|
| `N8N_LEADGEN_COLD_URL` | Hardcoded in `deploy.yml` | `https://n8n.srv1555257.hstgr.cloud/webhook/leadgen-cold`. **Public host, not loopback** — see Docker container gotcha below. |
| `N8N_LEADGEN_WARM_URL` | Hardcoded in `deploy.yml` | `https://n8n.srv1555257.hstgr.cloud/webhook/leadgen-warm`. Workflow may not exist yet — that's fine, the endpoint returns 503 for `system='warm'` until n8n responds 2xx. |
| `N8N_WEBHOOK_SECRET` | GitHub Secret | Sent as `x-leadgen-secret` header. **The n8n workflow MUST verify it** now that n8n's endpoint is publicly reachable. |

---

## ⚠ Docker container loopback gotcha

This bit us once and is worth remembering. The first iteration of the env config had:

```
N8N_LEADGEN_COLD_URL=http://127.0.0.1:5678/webhook/leadgen-cold
```

This **does not work**. From inside the `stemfra-server` container, `127.0.0.1` resolves to the container itself, not the host's `127.0.0.1` where n8n is listening on `:5678`. The route returned `500 fetch failed` on every triggered run.

**Three correct options**, in order of preference:

1. **Public n8n hostname** (what we use now): `https://n8n.srv1555257.hstgr.cloud/webhook/...` — traverses Traefik on the VPS and reaches the n8n container's port the normal way. Authenticity is gated by the `x-leadgen-secret` header which the n8n workflow verifies.
2. **Docker Compose service name** — if `stemfra-server` and `n8n` were in the same compose file, we could use `http://n8n:5678/webhook/...`. They're not (n8n owns Traefik, runs in its own compose project), so this isn't available without restructuring.
3. **Docker host gateway** — `http://host.docker.internal:5678` works on macOS/Windows but is unreliable on Linux without `--add-host`. Not worth the fragility.

If you ever see `fetch failed` from `/api/leadgen/trigger`, check that the URL in the prod env is the public hostname, not loopback. (See the cross-repo memory note `docker_container_loopback_gotcha.md`.)

---

## n8n contract expectations

The n8n workflow must:

1. **Verify the `x-leadgen-secret` header** matches its own configured secret. Reject otherwise (any non-2xx status; the server logs and surfaces it as a 502 to the client).
2. **Be Active / Published** in the n8n editor — the production webhook path (`/webhook/leadgen-cold`) only responds when the workflow is activated. The test path (`/webhook-test/...`) is for editor-side runs and won't be hit by this server.
3. **Use the production webhook path** — `path` attribute on the Webhook Trigger node must match `leadgen-cold` (or `leadgen-warm`).
4. **Write back to Supabase `leads`** with `review_status='needs_review'` so the rows show up in the CRM Review Queue.

The payload n8n receives is:

```json
{
  "system":       "cold",
  "vertical":     "barbershop",
  "city":         "Brooklyn",
  "country":      "US",
  "country_name": "United States",
  "state_code":   "NY",
  "state_name":   "New York",
  "search_query": "barbershop in Brooklyn, New York, United States",
  "max_results":  30,
  "min_score":    5,
  "triggered_by": "<supabase user uuid>",
  "triggered_at": "2026-05-22T17:30:00.000Z"
}
```

---

## Verifying a deploy

```bash
# 1. /health responds
curl -s --max-time 6 https://api.stemfra.com/health

# 2. Route is mounted + gating on auth (NOT 503 → env vars are set;
#    NOT 404 → route is mounted; NOT 500 → app didn't crash)
curl -i -X POST https://api.stemfra.com/api/leadgen/trigger \
  -H 'Content-Type: application/json' \
  -d '{"vertical":"barbershop","city":"Brooklyn"}'
# Expect: HTTP/2 401  {"success":false,"message":"Unauthorized"}
```

For a real end-to-end test, kick off a run from `crm.stemfra.com` (Lead Pipeline → Fetch Leads). The new leads appear in the Review Queue tab as n8n finishes its scrape.

---

## Coverage ledger (`leadgen_runs`, 2026-08-18, launch task #6)

Every triggered run writes ONE `leadgen_runs` row BEFORE the webhook fires
(system, vertical, country/state/city, search_query, max_results, min_score,
requested_by, status `requested` → `failed` when n8n rejects). The row's id rides
on the n8n payload as **`run_id`**.

**⚠ n8n change (Peter pastes):** in the cold + warm workflows' Supabase insert
node, add the column `leadgen_run_id` = `{{ $('Webhook').item.json.body.run_id }}`
(the trigger payload). That is what links each scraped lead to the run, so the
CRM Coverage tab can derive found / approved / contacted / won per city without
any double entry. Until the paste, runs still record coverage; counts read 0.

Endpoints (staff JWT): `GET /api/leadgen/coverage?vertical=&country=&days=` →
`{ runs, areas, states }` (areas = vertical·country·state·city rollup, states =
per-state rollup); `POST /api/leadgen/runs` (log a manual sweep: vertical +
state and/or city, optional leads_found/notes/requested_at); `PATCH
/api/leadgen/runs/:id` (status/notes/leads_found). CRM: Lead Pipeline →
**Coverage** tab (`stemfra-ops/src/components/leadgen/Coverage.jsx`).

(The former `activity_feed` 'leadgen_run' insert never landed: the table's
`entity_type` CHECK rejected it silently for two months. Removed.)

## Files touched by this module

| Path | What |
|---|---|
| `routes/leadgen.js` | The endpoint itself + validation + n8n bridge |
| `index.js` | Mounts the router at `/api/leadgen` |
| `.github/workflows/deploy.yml` | Injects the three env vars |
| `.env.example` | Documents the same vars for local dev |

## Run feedback at every exit (v14, 2026-09-13)

Peter's rule: a run must report back whenever it stops, not only when a lead lands
(execution 615 scraped 3 Manhattan places, dropped all 3 at the website filter and the
CRM heard nothing). v14 ends every path in a **Run Summary** Code node: the no-website
gate, the dedupe check and the score gate became If nodes whose "nothing left" branches
lead there, and Insert Lead leads there too. The node builds one sentence
("Manhattan: 3 places scraped, 3 had a website, 0 new leads.") plus counts
(`scraped, no_website, had_website, new_candidates, duplicates, scored, kept, below_score,
inserted, stopped_at`), POSTs it to `POST /api/leadgen/run-complete` (secret header) and
returns it as the webhook response. The server closes `leadgen_runs` (status completed |
empty, `leads_found`, `notes`, `metadata`) and bells the requester (kind `leadgen_run`,
route `/leads`), except when the same summary already came back through `/trigger`
inside its 25 s wait (fast early exits: the Fetch Leads toast then carries the sentence).
Also in v14: link-in-bio and booking-only URLs in `website` (linktr.ee, instagram.com,
facebook.com, booksy.com, vagaro.com, square.site …) count as **no website**, so those
shops are kept as prospects; and Insert Lead stamps `leads.leadgen_run_id` (it was null on
every lead until now, so the Coverage page's per-run counts were always 0). Paste:
`n8n-workflows/leadgen-run-feedback-v14.paste.md`. Server verified 2026-09-13 with a
callback for the Manhattan run (row closed as empty, bell delivered); the n8n side is
Peter's paste (⏳).

## Batch runs (2026-09-16, Peter: "generate 1,000 leads across US, UK and CA")

One trigger = one city × one vertical, at most 100 places, so a big pull is dozens of
runs. `lib/leadgenBatch.js` runs them back to back ON THE SERVER: `POST /api/leadgen/batch
{ runs: [<the same fields a single trigger takes>], pace_seconds? }` (staff JWT) starts a
queue; each run goes through `lib/leadgenRun.js startRun` (the trigger's body, lifted out so
no HTTP hop or short-lived browser token is involved), then the queue waits for n8n's
`/run-complete` to close the `leadgen_runs` row (poll every 15 s, up to
`LEADGEN_BATCH_RUN_TIMEOUT_MS`, default 12 min) before the next one; a short run that
answered its summary inline is counted at once. One batch per process (in-memory state;
the `leadgen_runs` rows are the durable record). `GET /batch/status` = progress
(current run, done/total, inserted so far, per-run status); `POST /batch/cancel` stops
after the current run. When the queue ends the requester gets ONE bell: "Lead-gen batch
done: N new leads from M runs · US: a · CA: b · GB: c". Plans live in
`scripts/leadgen-batch-plans/*.json` (the first: New York, Toronto, London × six
verticals, 100 places each, min_score 5). Run it against production
(`https://api.stemfra.com/api/leadgen/batch`) so a closed laptop cannot interrupt it; the
scoring agent is the slow part (a 100-place run takes minutes), so 18 runs is on the order
of an hour. Old-school listings never enter the CRM (section below), so the counts in the
bell are digital-ready leads only.

## Digital readiness (2026-09-11; LIVE in n8n 2026-09-13, Peter pasted v13, verified on a Staten Island run)

Paste rule learned that day: n8n Set / HTTP body fields in **Expression** mode take the value
WITHOUT a leading `=` (n8n adds it); a pasted `=` becomes literal text (`raw_signal` stored as
`={"title"…`, `readiness` null). The paste files no longer carry the `=`.

`leads.readiness` = `modern` | `middle` | `old_school`, computed ONCE at ingest in the n8n
"Normalize Candidate" Set node (v13 pastes in `n8n-workflows/leadgen-*-v13.paste.*`) from the
Google Maps record: old_school = the owner never claimed the listing; middle = claimed, nothing
else; modern = claimed + one sign of life (owner description or post, 20+ photos, a booking
link, a social profile). The signals that fired are in `qualification.readiness_signals` (the
CRM drawer shows them as the pill's tooltip). Not factors, by Peter's rule: owner replies to
reviews, review recency, business age (age is a call question; the first-review date needs the
paid reviews fetch). The scoring agent sees `digital_readiness:` in its prompt. The CRM filters
on the Readiness facet.

**Old-school listings are NOT a match (Peter, 2026-09-16, after the Neil's Barbershop call and
the remote-team decision: Stemfra's products are for owners who already act online; nobody can
visit a shop to set it up).** They never enter the CRM: the workflow's `Digital-ready?` If node
drops them right after Normalize Candidate and the run summary reports "N old-school listings
skipped" (`n8n-workflows/leadgen-readiness-gate-v15.paste.md`, Peter pastes; summary key
`old_school`, `stopped_at: 'readiness'` when nothing passes). Backstop: DB trigger
`leads_reject_old_school` (migration `leads_reject_old_school_v1.sql`, applied 2026-09-16)
silently rejects a `google_maps` insert with `readiness = 'old_school'`. The 19 old-school leads
already in the CRM were set to `stage = lost` with the reason on 2026-09-16 (kept, not deleted,
so their calls and history stay attached). The earlier "done-for-you track" wording is retired;
old-school shops will meet Stemfra through the marketplace's facts-only listings (P38), never
through a rep's time.

## v16 (2026-09-17): volume-first scoring, markets, booking platform

Audit of the live workflow found a subscription-era system prompt (retired pricing, "not
US-based" hard reject), an Apify location hardcoded to "<city>, USA", and an insert count that
included ignored duplicates. `n8n-workflows/make-v16.js` builds the corrected import from v15
(both files carry live secrets: never commit or share). Prompt source of truth:
`n8n-workflows/leadgen-system-prompt.txt` (the build refuses to run if retired pricing strings
are present). New on `leads.qualification`: `booking_platform`, `review_count`, `rating`,
`price_level`, `trait_volume` (`trait_affordability` mirrors it for the CRM card). New
`pain_point_bucket` value `marketplace_only`. Run Summary adds `not_saved`. Rule: before a new
import ships, read EVERY node, not only the changed ones, and test with max_results 10 first.
