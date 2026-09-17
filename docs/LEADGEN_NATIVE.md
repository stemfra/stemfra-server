# Native lead-gen (cold / Google Maps): build documentation

_P41. Built and proven 2026-09-17. Replaces the n8n "System B (Cold / Google Maps)" workflow as
the default engine. Companion docs: `LEADGEN.md` (endpoint contract, coverage ledger, batches,
readiness), `OUTREACH.md` (what happens to a lead after review), `GTM_PLAN_2026-09.md` §9 (who
we target and why)._

## 1. What it is

One staff action in the CRM ("Fetch Leads": vertical + country + state + city + how many places)
becomes a list of scored, drafted leads in the Review queue. The whole pipeline runs inside
`stemfra_server`, in the same process as the API. No workflow tool, no paste ritual, no secret
inside an export file. Everything a run decided is stored on the run, so "why is this shop not in
the CRM?" has an answer in the database.

Why we left n8n for this (Peter, 2026-09-17): the live workflow carried a subscription-era
scoring prompt for weeks and nobody could see it in git; it searched "<city>, USA" for every
country; it counted skipped duplicates as inserted; Apify's synchronous endpoint killed 100-place
runs at five minutes; and a failed node reported nothing.

## 2. The pipeline (one run)

```
CRM Fetch Leads ──POST /api/leadgen/trigger──▶ lib/leadgenRun.js startRun()
   │  validates, opens the leadgen_runs row (status requested), picks the engine
   ▼
lib/leadgenNative.js runNative()                      (background, same process)
 1 scrape        Apify Google Maps actor, ASYNC: start run → poll every 10 s → read dataset
 2 website gate  drop listings that own a real website (hasOwnSite)
 3 normalize     candidateOf(): v13 Google record, readiness, booking platform, review facts,
                 trait_volume (computed, not guessed)
 4 readiness     drop old_school (unclaimed listings)
 5 dedupe        one query: leads where source = google_maps and source_detail in (…)
 6 score+draft   OpenAI (JSON mode), 4 at a time; system prompt = prompts/leadgen-system.txt,
                 user prompt = the record + facts + the active A1 template from the DB
 7 keep?         is_relevant, lead_score ≥ min_score, has a phone or an email
 8 insert        one row per lead, review_status needs_review, leadgen_run_id stamped
 9 close         closeRun(): leadgen_runs status + counts + decisions, bell to the requester
```

A failure at any step closes the run as `failed` with the error text in `notes` and rings a
"Lead-gen run failed" bell. A run never stays `requested` silently.

## 3. Files

| File | Role |
|---|---|
| `lib/leadgenRun.js` | `startRun(user, body)`: validation, coverage row, engine choice; `closeRun()`: the ONE way a run ends (used by the native engine and by the n8n callback `POST /api/leadgen/run-complete`) |
| `lib/leadgenNative.js` | the pipeline; exports `runNative, configured, candidateOf, bookingPlatformOf, hasOwnSite, volumeOf, locationOf, systemPrompt` |
| `prompts/leadgen-system.txt` | the scoring + drafting rules. THE source of truth. The loader refuses to run if retired pricing strings appear in it |
| `lib/leadGoogleRefresh.js` | reused: `recordFromPlace` (the Google record the CRM info panel reads), `readinessOf` |
| `lib/leadgenBatch.js` | many runs back to back; works with either engine because it only watches the run row |
| `scripts/leadgen-native-test.js` | one run from the command line, awaited, decisions printed. Dry run by default |
| `routes/leadgen.js` | `/trigger`, `/run-complete`, `/batch*` |

## 4. The scoring rules in one page

We earn a share of bookings, so a busy shop is worth more than a quiet one. Three traits, 1 to 10:

- **trait_volume** (computed in code by `volumeOf(reviews, rating)`): 200+ reviews at 4.5+ = 9
  (10 from 400 reviews); 200+ at 4.3+ = 8; 75 to 199 at 4.3+ = 7 to 8; 25 to 74 at 4.0+ = 5 to 6;
  under 25 reviews = 2 to 3; any rating under 4.0 caps at 4.
- **trait_owner_decides** (model): owner-run, 1 to 15 staff, not a chain.
- **trait_weak_web** (model, from facts we pass): no website, or the website / Book button points
  at a booking platform, a link-in-bio, a social profile or a free-subdomain builder.

`lead_score` comes from the model but is clamped in code to `trait_volume + 1`. The draft follows
template A1 from the CRM's Template Manager, with the opening paragraph rewritten for the shop
(its real rating, review count and what its storefront is today). Drafts never name another
company's fees and never quote any price except "free to claim, flat 5%".

`booking_platform` is detected in code from the listing's website, booking links and services
link: booksy, fresha, vagaro, mindbody, square, styleseat, glossgenius, schedulicity, acuity,
setmore, thecut, boulevard, other. To add a platform, edit `PLATFORMS` and `NOT_OWN_SITE` in
`lib/leadgenNative.js`.

## 5. What lands in the database

`leads` row: the same columns the n8n insert wrote (contact_name, company_name, email, phone,
phone_country, currency, entity_type, template_slug, region, pain_point_bucket, lead_score,
suggested_channel, ai_draft_subject, ai_draft_message, source google_maps, stage new_lead,
review_status needs_review, service website, source_detail, raw_signal, readiness,
leadgen_run_id) plus `qualification`:

```
{ readiness_signals[], vertical, buying_trigger, booking_platform, review_count, rating,
  price_level, trait_volume, trait_affordability (= trait_volume, the key the CRM card reads),
  trait_owner_decides, trait_weak_web, reasoning, engine: "native" }
```

`leadgen_runs` row at close: `status` (completed | empty | failed), `leads_found`, `notes` (the
one-sentence summary), and `metadata`:

```
{ engine, model, dry_run, stopped_at, city, vertical,
  scraped, had_website, no_website, old_school, digital_ready, duplicates, new_candidates,
  scored, score_errors, not_relevant, below_score, no_contact, kept, inserted, not_saved,
  decisions: [ { name, stage, reason, reviews, rating, platform, score, volume, owner, web, why, lead_id } ] }
```

While the run works, `metadata.progress` holds `{stage, apify_run_id, location, at}`.

## 6. Debugging a run

1. **What happened to a shop?**
   `select d from leadgen_runs r, jsonb_array_elements(r.metadata->'decisions') d where r.id = '<run>'`
   Every scraped place has exactly one decision: `website_filter`, `normalize`, `readiness`,
   `dedupe`, `score` (not relevant / below score / no contact / scoring failed), `insert`
   (not saved + the database error) or `inserted`.
2. **Run stuck on `requested`?** Read `metadata.progress`. `scraping` + an `apify_run_id` = look
   at that run in the Apify console. The scrape gives up after 25 minutes
   (`LEADGEN_SCRAPE_TIMEOUT_MS`). A server restart mid-run loses the run (it lives in memory):
   mark the row failed and start it again; the batch runner resumes its queue on boot.
3. **Scores look wrong?** Volume is arithmetic (`volumeOf`), so check the review facts on the
   decision first. The other two traits and the draft come from the prompt file.
4. **Try a change safely:**
   `node scripts/leadgen-native-test.js --city Brooklyn --state "New York" --country US --vertical barbershop --max 10`
   scores and prints drafts, inserts nothing. Add `--apply` to insert. Each 10-place run costs
   about $0.25 of Apify and a few cents of OpenAI.
5. **Server log lines** are prefixed `[leadgen native]`.

## 6b. Progress and the one-run lock (2026-09-17)

While a run works, `metadata.progress` = `{stage: scraping | scoring | saving, done, total, ...}`
(scraping counts the Apify dataset's items, scoring counts finished candidates).
`GET /api/leadgen/active` (staff JWT) returns the run in progress or `{run: null}`. The CRM polls
it (`useActiveLeadgenRun`, 4 s while busy, 30 s idle): the menu-bar chip
`components/os/LeadgenProgressChip.jsx` shows "Fetching leads · Scoring 3 of 7" with a bar, and
every Fetch Leads button reads "Fetching…" and is disabled. The server enforces the same rule:
`startRun` answers 409 `run_in_progress` while a `requested` run under 35 minutes old exists,
unless the body carries `allow_parallel: true`. Proof runs: London barbershop (GB, 10 → 8
leads), Bronx barbershop from the CRM with the chip and the lock on screen.

## 7. Configuration

| Env | Meaning |
|---|---|
| `LEADGEN_ENGINE` | `native` (default) or `n8n`. A request may override with `{engine}`. If the native keys are missing and the n8n webhook is set, the run falls back to n8n |
| `APIFY_TOKEN` | Apify API token. **Production needs the GitHub secret `APIFY_TOKEN`** (deploy.yml passes it since 2026-09-17) |
| `OPENAI_API_KEY` | shared with the other server AI features |
| `LEADGEN_SCORING_MODEL` | scoring model, falls back to `LEADGEN_MODEL`, then gpt-4o |
| `LEADGEN_SCORE_CONCURRENCY` | parallel scoring calls, default 4 |
| `LEADGEN_SCRAPE_TIMEOUT_MS` | scrape patience, default 25 min |
| `N8N_LEADGEN_COLD_URL` | the fallback workflow (v16 import in `n8n-workflows/`, never commit the import files) |

Trigger body extras: `engine`, `dry_run: true` (scores, stores the decisions with the drafts on
the run, inserts nothing).

## 8. Rules (do not relearn these)

- Change the prompt in `prompts/leadgen-system.txt`, dry-run 10 places, read the drafts, then
  commit. Never edit scoring rules anywhere else.
- Facts are computed in code (review count, rating, platform, volume). The model judges only what
  needs judgment and writes the draft.
- Test with 10 places before any batch (Peter's rule, 2026-09-17).
- A deploy restarts the process: never push the server while a batch is running.
- No Twilio anywhere in this module. Apify, OpenAI and Supabase only.
- Proof runs 2026-09-17: Brooklyn barbershop (10 scraped → 5 leads, DB rows = summary) from the
  script; Queens beauty salon (10 scraped, 8 had a website, 1 duplicate → 1 lead, a GlossGenius
  storefront at 295 reviews, score 10) from the CRM button, bell received.

## 9. Open items

- Template A1's subject ("A faster booking page for …") and body were written for shops with a
  weak site; the new audience has none. Rewrite A1 in the Template Manager.
- Widen the gate to busy shops that own a weak site but book through a marketplace (decisions now
  carry reviews / rating / platform for the `website_filter` drops, so the size of that group can
  be measured from real runs before deciding).
- Phone-number dedupe (a shop listed twice on Maps under two URLs).
- Show `booking_platform`, reviews and rating on the CRM review card; rename its
  "Affordability" trait to "Volume".
- A CRM "Run details" view over `metadata.decisions`.
