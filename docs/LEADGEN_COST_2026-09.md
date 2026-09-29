# What one lead cost us: past lead-gen runs (read 2026-09-29)

_Asked by the Stemfra AI session (pricing of its Leads product in credits), relayed by Peter.
READ-ONLY: nothing was run, scraped, sent or called. Sources: the platform database
(`leadgen_runs`, `leads`, `leadgen_places`, `calls`, `sms_messages`) and the Apify account's own
history through its API (`/users/me`, `/users/me/usage/monthly`, `/actor-runs`, run detail
`usageTotalUsd` + `chargedEventCounts` + `pricingInfo`). No key is printed here._

## Headline

| Figure | Value | Basis |
|---|---|---|
| Cost per raw place (lead-gen settings) | **$0.0075** | measured: $9.31 for 1,248 places |
| Cost per raw place (plain, no add-ons) | **$0.0041** | measured: $0.64 for 155 places |
| Cost per kept lead, Apify only | **$0.034** | measured: $9.31 / 271 leads |
| Cost per kept lead, Apify + AI | **about $0.05** | AI part is an ESTIMATE ($3 to $4.50) |
| Cost per lead with an email | **about $1.25** | 11 leads with an email; none verified |
| Cost per lead with a verified email | **not available** | no verification was ever bought |
| Cost per contacted lead | **about $0.90** | 15 contacted; data cost only, no labour or telephony |
| Kept out of scraped | **21.7%** | 271 of 1,248 |

## 1. Runs by type

| Run type | Runs | Dates | Places paid for | Apify USD | Per place |
|---|---|---|---|---|---|
| Google Maps lead-gen through n8n (v14 / v15), contacts on | 12 | 2026-09-12 to 09-16 | 675 | 5.251 | 0.0078 |
| Google Maps lead-gen native (`lib/leadgenNative.js`), contacts on | 15 | 2026-09-17 to 09-24 | 573 | 4.055 | 0.0071 |
| **Lead-gen total** | **27** | | **1,248** | **9.306** | **0.0075** |
| Lead record refresh sweep (`leadGoogleRefresh`, 4 places a search, no add-ons) | 73 | 2026-09-15 | 155 | 0.635 | 0.0041 |
| Wizard finder (`googlePlacesFinder`) | 2 | 2026-09-14 to 09-16 | 1 | 0.004 | 0.0044 |
| Experiments with reviews and images on | 5 | 2026-09-11 | 32 | 0.786 | 0.0246 |
| LinkedIn jobs scraper (hiring signals; not started by this session) | 22 | 2026-09-24 to 09-29 | 565 results | 0.566 | 0.0010 |
| Construction | 0 | | | | no run exists |
| Google Places API | 0 | | | | never used |

- All 129 runs in the account's history succeeded except 2. The history starts 2026-09-11.
- **The 70 leads of 2026-08-20** (n8n runs 594 / 595) have NO run in the Apify history. The
  billing cycle 2026-08-16 to 09-15 totals $1.695, of which $1.55 belongs to the runs of 09-11
  to 09-15, so at most $0.14 was spent on this account before 09-11. Either those runs were
  billed to another Apify login inside n8n or the history no longer holds them. Unknown; they
  are left out of every figure. Peter can read the n8n Executions for runs 594 / 595.
- `googlePlacesFinder.js` does not call Google: it runs the same Apify actor with every add-on
  off. There is no Google Places API spend.
- "n8n split funnel" is the outreach routing after a lead exists (email leads to Claim emails,
  phone leads to calls); it scrapes nothing and has no data cost of its own.

## 2. Apify plan and prices paid

Plan **STARTER**: $19 a month, $19 of credit, monthly ceiling $19. Usage by cycle: 07-16 to
08-15 $0.00 · 08-16 to 09-15 $1.70 · 09-16 to 10-15 $9.75 so far. Every dollar so far sat inside
the credit, so the cash cost was the $19 subscription.

Prices charged per event on our runs (actor `compass/crawler-google-places`, pay per event):

| Event | USD | Our count | Our spend |
|---|---|---|---|
| place-scraped | 0.004 | 1,436 | 5.74 |
| place-details-scraped | 0.002 | 1,280 | 2.56 |
| filter-applied (one filter: skip closed places) | 0.001 | 1,248 | 1.25 |
| contact-details-scraped | 0.002 | 699 | 1.40 |
| review-scraped | 0.0005 | 982 | 0.49 |
| image-scraped | 0.0005 | 206 | 0.10 |
| apify-actor-start | 0.00005 | 438 | 0.02 |
| lead-scraped / lead-email-verified / social-profile-scraped | 0.10 each | 0 | 0 |

A lead-gen place therefore costs 0.004 + 0.002 + 0.001 = $0.007, plus $0.002 when the place has
a website for the contact scrape to read.

## 3. From places to leads (database)

| Stage | n8n runs (09-13 to 09-16) | Native runs (09-17) | Total |
|---|---|---|---|
| Runs recorded in `leadgen_runs` | 8 completed or empty + 4 failed | 10 real + 4 dry | 26 |
| Places scraped (run metadata) | 566 | 558 | 1,124 |
| New candidates after website, readiness and dedupe gates | 250 | 203 | 453 |
| Scored by the model | 250 | 203 | 453 |
| Kept | 198 | 152 (18 in dry runs) | 350 |
| Inserted as leads | 132 | 134 | 266 |

- Apify billed 1,248 places against 1,124 in run metadata: the difference is the four n8n runs
  that failed AFTER the scrape on 09-16 (paid, no lead) and one run on 09-24.
- Leads in the table from these runs: **271** with a run id (273 created since 09-13).
  With a phone: practically all (340 of 341 over all time). **With an email: 11** (14 of 341 over
  all time). Drafted outreach: 24. Marked lost after review: 65.
- **Contacted: 15** of the leads created since 09-13 (32 of all 343 Google Maps leads): 26 leads
  called, 6 emailed, 1 texted.

## 4. AI spend (ESTIMATE, not measured)

Neither engine stored token counts. Estimate from the prompt size (system prompt 5,683
characters, about 1,450 tokens, plus the place record) at the OpenAI list prices of 2026-09-29:

| Step | Model | Calls | Per call | USD |
|---|---|---|---|---|
| n8n scoring + first draft | gpt-4o | 250 | about $0.011 | about 2.75 |
| Native qualify | gpt-4o-mini | 203 | about $0.0005 | about 0.10 |
| Native scoring | gpt-4o | up to 203 | about $0.0085 | up to 1.73 |
| Drafts on demand | gpt-4o | 24 | about $0.01 | about 0.25 |

Total: $3 to $4.50. To replace the estimate, read the OpenAI usage page for 09-13 to 09-17
(Peter), or log `usage` from the chat response in `chatJson` (a three-line change, not made).

## 5. Other paid enrichment

None. No email finder, no verification service, no Apify lead or social add-on.

## 6. What surprised us

1. **Data is the cheap part.** A kept lead costs about five cents. The real cost of a contacted
   lead is the person and the phone line, which this table does not hold.
2. **Emails are almost absent by design.** We look for shops WITHOUT their own website, and
   Apify's contact scrape reads websites. We paid $1.40 for 699 contact scrapes and ended with
   11 emails. For Stemfra AI's Leads, whose customers want email addresses, the mix is the
   reverse: budget the $0.10 lead and $0.10 verification events, which are 25 times the price
   of a place.
3. **Reviews are the expensive switch.** Ten places with reviews on cost $0.50: 886 reviews at
   $0.0005 each, five cents a place against 0.7 cents.
4. **Every filter is a per-place charge.** "Skip closed places" alone added $1.25 (13% of spend).
5. **Failed runs still bill.** Four n8n runs failed after the scrape; about 100 places paid for
   nothing. The native engine now keeps every place (`leadgen_places`), so a rerun costs AI only.
6. **The plain search is $0.0041 a place**, not the advertised "from $1.50 per 1,000": that
   price belongs to higher plans. Starter pays $4 per 1,000.
7. **Four in five places are discarded** (own website, not digital-ready, duplicate, too quiet).
   A credit price per KEPT lead must carry about 4.6 scraped places.

## 7. For the credit price (inputs, not a recommendation)

- Local business lead, phone only: data $0.035 + AI $0.015 = about $0.05 cost.
- Same with reviews read: about $0.10.
- With a found and verified email (Apify lead + verification events): add $0.20 per lead
  attempted, so $0.25 to $0.30 before misses.
- LinkedIn hiring signal: $0.001 per result before filtering and AI.

## Sources

- Database: project `acxepovfklgthxmteqxr`, queries on `leadgen_runs` (metadata counts),
  `leads` (source `google_maps`, not test), `calls`, `sms_messages`, read 2026-09-29.
- Apify API, account of `APIFY_TOKEN` in `stemfra_server/.env`, read 2026-09-29.
- OpenAI prices: `stemfra_ai/docs/research/COMPETITORS.md` "Unit costs we pay" (2026-09-29).
- Code: `lib/leadgenNative.js` (input: contacts on, skip closed, detail page on),
  `lib/googlePlacesFinder.js` (all add-ons off), `prompts/leadgen-system.txt`.
