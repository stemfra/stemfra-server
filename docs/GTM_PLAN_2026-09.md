# Go-to-market plan, September 2026 (working doc)

_Written 2026-09-16 from the day's decisions with Peter, after the Neil's Barbershop call
transcript, the first big lead-gen batch and the channel comparison. This is the marketing
half of Master Plan v3 (stemfra_business); the pricing decisions live in ROADMAP.md
"Pricing justification". Figures marked "estimate" are to be replaced by the measured
numbers from the first paid pilot and the first signed clients._

## 1. Who we sell to

Owners who already act online: a claimed Google profile, a booking app they pay for
(Booksy, Fresha, Square, Vagaro), or an active Instagram. In the CRM that is readiness
`modern` or `middle`. Unclaimed listings (`old_school`) never enter the CRM (lead-gen gate +
DB trigger, 2026-09-16). Stemfra works remotely: no visits, no in-person setup, so a client
who needs one is not a client.

Why: the transcript. The owner argued against "a website" for ten minutes, accepted
"$2.50 on a $50 cut" in one sentence, and said "send me one client and I might go for it".
Price was never the objection; the product framing was. He will not log into anything.

## 2. The offer and its story (no cap, flat 5%)

Free website, no setup fee, no monthly fee, flat 5% on bookings through the site. A monthly
cap was proposed and DEFERRED (learn from real clients first; a cap gives away revenue on the
busiest shops). The pitch leads with the clients they already have:

1. Import your client list (we do it, from Booksy, Fresha, Square or a spreadsheet).
2. Win back the ones who stopped coming, automated, in your name, with your booking link.
3. Ask every visit for a review; rating and review count lift the Maps listing.
4. New clients find you and book. 5% of what gets booked, nothing else.

Every win-back booking runs through the booking link, so it is commissionable even in a
walk-in shop. The public review count is the proof loop (no tracked number needed).
Speak the price per cut, never per month. Opener for vendor fatigue: "I am not selling
you anything, it is already built, here is the picture, it costs nothing until a customer
comes."

## 3. Funnel arithmetic (Peter's 5% rule)

100 leads reached → 20 prospects → 5 closes. So 100 clients need ~2,000 reached leads.

| Way of reaching | Reach rate | Leads needed for 2,000 conversations | Effort |
|---|---|---|---|
| Cold call, single attempt (measured, August cohort) | 3% | ~66,000 | ~40 rep-months |
| Full sequence (2 calls, claim email, text after consent) | ~20% (estimate) | ~10,000 (≈ 20 batches like 2026-09-16) | ~8 rep-months |
| Inbound (ads, search, marketplace, referrals) | the lead comes to us | 2,000 enquiries / signups | automation + closing calls |

The close rate on reached leads (5%) is the number to move: one point = 20 clients per
2,000 conversations. The claim page, the screenshot text and the win-back story move it;
dial volume does not.

## 4. Channel comparison: outbound vs Facebook vs Google

The reason to run paid ads, in Peter's words: whoever clicks either has a need or found
something interesting. A click is intent; a cold dial is not. Facebook sells the click
(link ads to the claim page), impressions are cheap, so reaching 5,000 owners is trivial
where reaching 5,000 by phone is a quarter of a rep's year.

| | Outbound (scrape, sequence, call) | Facebook / Instagram link ads → claim page | Google Search → claim page |
|---|---|---|---|
| Who we reach | lists we choose, digital-ready after the gate | owners who saw the ad and clicked (self-selected) | owners searching "free website for barbershop" |
| Cost per click | n/a | $0.35 (Peter's experience) to $0.70 (2025 traffic-campaign average) | $3 to $5 |
| Click → signup | n/a | 20% with a frictionless page (Peter) · 8% cautious · 4% median landing page | 5 to 8% |
| Cost per signup | cents + rep time | $1.75 to $9 | $50 to $90 |
| Cost per active client (30% of signups) | ~$100 | **~$6 to $30** | ~$170 to $300 |
| 100 clients | ~$8k + 12 rep-months | ~$600 to $3,000 | ~$17k to $30k |
| Scales with | reps | budget | search volume (small) |
| Risk | 3% pickup, rep capacity | wrong clicks (customers, not owners); page friction | low volume |

Benchmarks: Facebook traffic CPC $0.70 / CTR 1.71% (WordStream 2025); landing pages median
4.3%, top quartile 11.7% (Unbounce 2025, 44k pages); paid social ~12% (Landerlab); Meta
instant forms convert 8 to 12% of clicks but their leads book 15 to 30% vs 30 to 50% for
landing-page leads (LeadsuiteNow, Till). Peter's own campaigns: $0.35 clicks, 20% signups on
a frictionless page.

**Decision:** paid social becomes the primary acquisition channel to test; outbound stays
the base for the reps (the lead-gen batches feed it); Google Search a small second paid
test. Do not decide on estimates: run the pilot in §5 and replace every figure with ours.

## 5. The pilot (first thing after the lead-gen batch)

Prerequisites (build first, both small):
1. Conversion tracking on the claim page and the signup (the parked site-analytics item,
   scoped to our own funnel: click → claim view → signup → published → first booking), with
   the Meta pixel / Conversions API and a UTM per ad.
2. A frictionless claim flow: "See my site" shows the preview first, the account comes
   after (the claim-token prefill already exists; today the form asks name, email, password
   and terms before the owner sees anything).

Then: $300 on Facebook / Instagram link ads in ONE city (New York, where the batch found
the beauty gap), the finished-site screenshot as creative, "$2.50 on a $50 cut, your
website is already built" as the line, claim page as the landing page; $100 on Google
Search for "free website for barbershop" in the same city. Four weeks or until 400 clicks.
Measure: CPC, click → signup, signup → published, published → first booking, cost per
active client. Compare against outbound's ~$100. Put the money where the client is cheapest.

## 6. Revenue per client (re-based, 2026-09-16)

Commission = 5% × the share of a shop's sales that goes through Stemfra. Peter's rule: we
may drive no more than ~20% of a shop's sales; assume 10% in year one, 20% as the target.
Benchmarks per location (outside sources, 2026-09-16): barbershop $100k to $200k a year
(small shop), hair salon median ~$320k, CrossFit box median ~$950k, yoga studio ~$13k a
month, massage practice $50k to $90k a year, day spa $200k to $500k (3 to 6 rooms).

| Vertical | Monthly sales (low end) | 5% of 10% | 5% of 20% |
|---|---|---|---|
| Barbershop | $8k | $40 | $80 |
| Hair salon | $21k | $105 | $210 |
| CrossFit box | $43k | $215 | $430 |
| Yoga studio | $13k | $65 | $130 |
| Massage practice | $4k | $20 | $40 |
| Day spa | $17k | $85 | $170 |

100 clients weighted to barbers and salons ≈ $8k a month at 10%, ≈ $16k at 20%. The CRM
placeholders for salon ($12k) and CrossFit ($15k) understate the benchmarks; raise them.

## 7. KPIs (weekly)

Shops that said yes · shops with a first booking · click → signup rate · cost per active
client by channel · share of each shop's sales through Stemfra · reviews gained per shop.

## 8. Lead-gen findings feeding this plan (2026-09-16 batch, per 100 places)

New York: barbershops 24 had a website / 30 old-school / 26 leads; salons 19 / 43 / 32;
CrossFit 87 / 5 / 2; yoga 92 / 0 / 6; massage 39 / 8 / 47; spa (60 places) 37 / 0 / 16.
Fitness in New York is saturated with websites (the wedge barely applies); beauty and
massage carry the gap. Toronto and London are appended when their runs close.

## 9. Who to target, re-based (2026-09-17, from Peter's Gemini research + our own verification)

**Correction to our earlier classification.** We were qualifying on "no website" alone and
treating low review counts as neutral. On a commission model the prospect's SALES VOLUME is the
whole value of the account, so the rubric is now volume first: 200+ Google reviews at 4.5+ is
the top band, under 25 reviews is a drop. Second signal: the listing's website or Book button
points at a booking marketplace (the shop rents its storefront). n8n v16 scores this way and
stores `booking_platform`, `review_count`, `rating`, `price_level` on `leads.qualification`.

**Supply check (our own data, 2026-09-16 New York, 600 places scraped, 129 leads kept):** 6 leads
have 200+ reviews at 4.5+, 21 have 75 to 199, 34 have 25 to 74, 63 have under 25. Only 6 sit on a
booking platform. So the ideal lead is about 1% of scraped places under the current "no real
website" gate. OPEN DECISION: also admit busy shops that have their own (weak) site but book
through a marketplace; that is a different pitch (replace the site, keep or move the booking).

**Verified owner complaints (research 2026-09-17; use in CALLS and ADS as questions, never as
claims in cold email; re-check a number before quoting it):**

| Platform | Documented terms | Best-evidenced owner complaint |
|---|---|---|
| Booksy | $29.99/mo + $20/mo per extra staff; Boost = one-time 30% of a new client's first visit (help centre: $10 min, $100 max), opt-in | Boost fee charged on clients the shop says it already had; clients see other shops in the app |
| Fresha | Free plan ended; $19.95/mo solo or $14.95 per team member; 20% one-time new-client fee ($6 min); paid add-ons | End of "free forever", fee on the salon's own clients, slow support, payout holds (minority) |
| Mindbody | 12, 24 or 36 month auto-renewing terms, 30 days' notice; from $79/mo per location | Cannot cancel, renewals, price rises, dated UX (104 BBB complaints in 3 years) |
| Vagaro | $30/mo base, about $10 per extra calendar, add-ons (site $20, forms $10, text marketing from $20, branded app $100) | Add-on creep to $100 to $200/mo; clients must create a Vagaro account to book |

Sources: biz.booksy.com/pricing, biz.booksy.com/features/boost, fresha.com/pricing,
mindbodyonline.com/business/education/blog/mindbody-contracts-cancellation-data,
vagaro.com/pro/pricing, Trustpilot / Capterra / Software Advice / BBB review pages for each.
NOT verified: any Reddit thread (blocked), "Booksy pushes competitor discounts", Mindbody's
"30 to 50% termination penalty" and its $139 to $599 tiers.

**The uncomfortable comparison (must be answered before we pitch busy shops).** Their fees are
ONE-TIME on a new client (Booksy 30%, Fresha 20%) plus about $30 to $150 a month. Ours is 5% of
EVERY booking through the site, existing clients included, with no cap. A shop booking $25,000 a
month through us pays $1,250; on Booksy it pays well under $200. The bigger the shop, the worse
we compare, which is exactly the shop the new rubric targets. Options: a monthly cap, a lower
rate above a threshold, or 5% only on bookings the site's growth tools produce (win-back,
review-driven, new clients). Peter deferred the cap on 2026-09-16; this data reopens it.

**Coexistence is unresolved.** "Keep Booksy for the calendar, own the storefront" only earns us
commission if the booking is made in OUR engine. Two calendars means double-booking risk. Until
there is a calendar sync or a clean import-and-switch path, the honest pitch is a switch with
done-for-you migration, not a hybrid.
