# Go-to-market plan, September 2026 (working doc)

_Written 2026-09-16 from the day's decisions with Peter, after the Neil's Barbershop call
transcript, the first big lead-gen batch and the channel comparison. This is the marketing
half of Master Plan v3 (stemfra_business); the pricing decisions live in ROADMAP.md
"Pricing justification". Figures marked "estimate" are to be replaced by the measured
numbers from the first paid pilot and the first signed clients._

> **Where this plan stands (2026-09-17).** Written on the 16th and extended on the 17th, so later
> sections overrule earlier ones. Current truth: price = **5% of bookings, capped at $400 a month**
> (section 11); target = busy, established shops WITHOUT their own website, old-school listings and
> shops that own a site are out (sections 9, 11); what we sell = "your clients see only you", your
> brand, room to grow, price last; a switch, never coexistence (section 10); leads go straight to
> the pipeline and calling is the engine (247 of 248 New Leads have a phone, 13 an email); no more
> scraping until the current pool is called. Figures from our own data:
> `MARKET_RESEARCH_PROVIDERS_2026-09.md` sections 1a and 1b.

## 1. Who we sell to

Owners who already act online: a claimed Google profile, a booking app they pay for
(Booksy, Fresha, Square, Vagaro), or an active Instagram. In the CRM that is readiness
`modern` or `middle`. Unclaimed listings (`old_school`) never enter the CRM (lead-gen gate +
DB trigger, 2026-09-16). Stemfra works remotely: no visits, no in-person setup, so a client
who needs one is not a client.

Why: the transcript. The owner argued against "a website" for ten minutes, accepted
"$2.50 on a $50 cut" in one sentence, and said "send me one client and I might go for it".
Price was never the objection; the product framing was. He will not log into anything.

## 2. The offer and its story (5%, capped at $400 a month since 2026-09-17)

Free website, no setup fee, no monthly fee, flat 5% on bookings through the site, never more
than $400 a month. (On 2026-09-16 the cap was proposed and deferred; on 2026-09-17 Peter decided
it at $400 after the provider research showed an uncapped 5% was the one number a busy owner
could not accept.) The pitch leads with the clients they already have:

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
website" gate. (The option of also admitting busy shops that own a weak site but book through a
marketplace was CLOSED on 2026-09-17: they already pay for a site, they are not our target.)

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

**The uncomfortable comparison, and its answer.** Their fees are ONE-TIME on a new client (Booksy
30%, Fresha 20%) plus about $30 to $150 a month; ours is 5% of every booking through the site,
existing clients included. Uncapped, a shop booking $25,000 a month would have paid us $1,250
against well under $200 on Booksy, and the bigger the shop the worse we compared. **Answered on
2026-09-17 by the $400 cap:** that shop now pays $400 (1.6%), with the website and the growth tools
included. Tables: `MARKET_RESEARCH_PROVIDERS_2026-09.md` section 1a, `PRICING_COMPETITORS.md`.

**Coexistence: decided against (see section 10).** We sell a switch made easy, never a second
system beside their current one.

## 10. What we sell (Peter, 2026-09-17, after the Gemini research)

Not "a website". We sell **the shop's own branded place to be booked**, in this order:

1. **Your clients see only you.** On Booksy, Fresha and the other marketplaces a shop's page sits
   next to other shops, often cheaper ones, inside the same app. Every visit to rebook is a chance
   to reconsider. On their own site there is nobody else. This is the headline for any shop on a
   marketplace. (Evidence: marketplace design, Trustpilot summaries. "They push competitor
   discounts to my clients" has no first-hand source yet: ask it as a question, never state it.)
2. **A personalised, branded experience.** Their name, their address, their look, their photos,
   their voice, from the Google listing to the confirmation text. A marketplace page looks like
   every other page on that marketplace.
3. **It grows with them.** Whole team, more locations, memberships, classes, the AI front desk,
   reminders, win-back and reviews, with nothing per seat and no add-on price list.
4. **Cost** comes last: free to claim, flat 5% of bookings, never more than $400 a month, no payment fees
   from us on top of theirs because clients pay at the venue.

**No coexistence (decided 2026-09-17).** We do not offer to run next to another booking tool: the
owner would pay twice. We offer a SWITCH that we make easy, in two steps: (1) they send or export
their client list and we upload it; (2) they replace the website and the booking link on their
Google Business Profile with the new ones. The "Coexistence is unresolved" note in section 9 is
closed by this decision. Every call script says it this way; the old "keep Fresha" lines are gone.
This replaces the earlier "incremental, coexist" idea in the provider-switching notes.

## Sources (kept for every section above)

- Peter's Gemini (Google AI mode) research thread: https://share.google/aimode/IYx0PoDAqg9H74ZjR
- Mindbody, 4 operational pain points: https://www.mindbodyonline.com/business/education/blog/4-operational-pain-points
- Mindbody contracts + cancellation (12 / 24 / 36 months, auto-renew): https://www.mindbodyonline.com/business/education/blog/mindbody-contracts-cancellation-data
- Booksy pricing + Boost: https://biz.booksy.com/pricing · https://biz.booksy.com/features/boost · https://support.booksy.com/hc/en-us/articles/16486248108946-How-does-Boost-pricing-work · https://support.booksy.com/hc/en-us/articles/16485524178066-How-do-I-prevent-being-charged-for-Boost · https://support.booksy.com/hc/en-us/articles/16486241050514-How-do-I-claim-a-client-on-Boost
- Fresha pricing + payments: https://www.fresha.com/pricing · https://www.fresha.com/help-center/knowledge-base/payments/620-set-up-fresha-payments
- Vagaro pricing + client accounts: https://www.vagaro.com/pro/pricing · https://support.vagaro.com/hc/en-us/articles/22781768988187-Vagaro-Plans-Pricing-and-Premium-Features · https://support.vagaro.com/hc/en-us/articles/115003521813-Book-a-Service-Appointment-for-Customers-of-a-Vagaro-Business · https://glossgenius.com/blog/vagaro-cost
- Mindbody pricing + marketplace fee: https://www.mindbodyonline.com/business/pricing · https://gymdesk.com/blog/mindbody-fees
- Review pages read: https://www.trustpilot.com/review/booksy.com · https://www.capterra.com/p/142741/Booksy/reviews · https://www.trustpilot.com/review/fresha.com · https://www.softwareadvice.com/retail/shedul-profile/reviews/ · https://www.trustpilot.com/review/mindbodyonline.com · https://www.capterra.com/p/40229/MINDBODY/reviews/ · https://www.bbb.org/us/ca/san-luis-obispo/profile/computer-software-developers/mindbody-inc-1236-5002899/complaints · https://www.trustpilot.com/review/vagaro.com · https://www.capterra.com/p/153752/Vagaro/reviews/ · https://www.bbb.org/us/il/chicago/profile/marketing-consultant/booksy-inc-0654-1000106496/complaints
- Competitor roundups (biased, used as leads only): https://www.setora.co.uk/blog/booksy-boost-commission-explained · https://www.setora.co.uk/blog/fresha-commission-fees-explained · https://www.timetailor.com/timetailor-alternatives/fresha-reddit-reviews · https://sorttheclicks.com/fresha-reviews-reddit/ · https://vibefam.com/mindbody-reviews-reddit-2026/ · https://glossgenius.com/blog/booksy-alternatives
- Full provider landscape with sources: `MARKET_RESEARCH_PROVIDERS_2026-09.md`. Where reps find owners: `OWNER_SOURCING_2026-09.md`.

## 11. Decisions 2026-09-17 (Peter)

- **PRICE: a flat 5% of bookings, never more than $400 a month (decided).** Rationale: owners
  already pay $200 to $400 a month for software (Neil's call), $200 would be too low for us, and an
  uncapped 5% was the one number a busy owner could not accept. Say it as an advantage: free to
  claim, nothing in a quiet month, never more than $400 in a busy one, everything included, no
  contract. Assumed terms, to confirm: per location; at-visit sales marked collected count toward
  the cap. Still to carry through: commission meter, Fees, Pricing, FAQ, claim email, A1 / A1b,
  call scripts, decks, Master Plan v3.

- **Busy shops that already own a website stay OUT of the target**, even when they book through a
  marketplace: they already pay for a site. The gate stays as built (no own storefront). The
  "wider gate" option raised in section 9 and in the SWOT is closed; those places remain in Places
  as market data only. Consequence to remember: salons qualify far less often than barbers (own
  website: London salons 65%, Toronto salons 56%, London barbers 22%, Toronto barbers 45%).
- **No more Apify runs from the CRM for now.** Call the leads we have (New Lead: 157 US, 35 Canada,
  58 UK after the 2026-09-17 runs and the re-score), then decide the strategy from the results.
  Track per call: reached / interested / objection / the provider they use / renewal month.
- Default lead-gen settings: 100 places, minimum score 7; qualified leads go straight to the
  pipeline; outreach is drafted and sent deliberately (one lead or a filtered selection).
