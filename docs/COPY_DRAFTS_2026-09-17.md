# Copy drafts for approval: outreach A1 + marketing site (2026-09-17)

_**Status 2026-09-17: section 1 (A1) APPROVED by Peter and LIVE** in the Template Manager: version A = code `A1` (shop on a booking platform), version B = new code `A1b` (no storefront); `draftForLead` picks by `booking_platform`; the draft cap is 190 words; the "other shops next to yours" line is only written for real marketplaces (Booksy, Fresha, Vagaro, Mindbody, StyleSeat, theCut, Schedulicity). **Section 2 (site copy) APPROVED by Peter 2026-09-17 and applied in `stemfra_client`** (hero blurbs, the marketplace band in `HeroEssence`, Solutions headlines, the "Only you" problems tab replacing the stale Card payments tab, "Pay at the venue" feature, Pricing headline + offer card + trust row, three FAQ answers, Claim page, and every "runs alongside your current system" line removed: 8 places). Not applied: a separate Home "Switching" strip (the two steps now live in the FAQ, the Solutions FAQs, the Pricing core-platform card and the Claim page). Original note:_

_Drafts only. Nothing here is live until Peter approves: A1 is edited in the CRM Template
Manager (the lead-gen drafts follow it on the next run), the site copy lives in
`stemfra_client`. Basis: `GTM_PLAN_2026-09.md` section 10 (what we sell, in order: clients see
only you · a personalised branded experience · it grows with you · cost last; a switch, never
coexistence). House style: no em-dash, "Stemfra" sentence case, no claims about another
company's fees, no promised rankings or booking numbers._

## 1. Outreach template A1

Today's A1 ("A faster booking page for {{business_name}}") tells the owner their site is slow
or hard to update. The new audience has no site of its own, or a marketplace page. Two versions:
the lead-gen draft rewrites paragraph one per shop from the Google record (rating, review
count, where the Book button goes), so paragraph one below is the fallback wording.

### A1, version A (shop on a marketplace or booking tool)

**Subject:** {{business_name}}: your clients should only see you

Hi {{first_name}},

I was looking at {{vertical}}s in {{city}} and {{business_name}} stood out. Reviews like yours take years to earn. One thing I noticed: when someone looks you up and taps Book, they land on a marketplace page, where other shops sit a tap away from yours.

Stemfra gives {{business_name}} its own place to be booked: your name, your address, your look, and nobody else on the page. It brings back clients who have gone quiet and asks every visit for a Google review. Your whole team is included.

Switching is two steps. You send us your client list and we load it for you. Then you swap the booking link on your Google profile. It is free to claim, with no monthly plan: we earn a flat 5% of what is booked through the site.

Here is a live {{vertical}} site so you can see what yours would look like: {{demo_link}}. When you are ready, start free at {{start_free_link}}. If you would rather talk it through first, reply to this email or call me on {{sender_phone}}.

{{sender_name}}
Stemfra
{{sender_phone}} · {{sender_email}}

### A1, version B (no website at all, or Instagram only)

**Subject:** {{business_name}} deserves its own front door

Hi {{first_name}},

I was looking at {{vertical}}s in {{city}} and {{business_name}} stood out. Reviews like yours take years to earn. One thing I noticed: people who search for you by name have nowhere of yours to land, so the booking starts with a phone call or a message.

Stemfra gives {{business_name}} its own place to be booked: your name, your address, your look, with online booking that works while you are with a client. It brings back clients who have gone quiet and asks every visit for a Google review. Your whole team is included.

We set it up for you, including your client list if you have one. It is free to claim, with no monthly plan: we earn a flat 5% of what is booked through the site.

Here is a live {{vertical}} site so you can see what yours would look like: {{demo_link}}. When you are ready, start free at {{start_free_link}}. If you would rather talk it through first, reply to this email or call me on {{sender_phone}}.

{{sender_name}}
Stemfra
{{sender_phone}} · {{sender_email}}

**Notes for the decision**
- Both keep the two merge links the current A1 has. `EMAIL_DELIVERABILITY.md` says a cold email
  lands best with ONE link. If A1 is ever sent as written (today the send is the branded Claim
  email and the draft is call context), drop `{{start_free_link}}` and keep the demo link.
- Word count: A about 165, B about 150 (the current A1 is about 110). The lead-gen draft prompt
  caps at 120 words, so either shorten or raise the cap to 170. Recommendation: raise it; the
  switch paragraph is the part that answers "how hard is this?".
- The Template Manager holds ONE A1. Options: (a) store version A as A1 and let the draft prompt
  swap paragraph one and the switch paragraph when the shop has no booking tool (it already
  rewrites paragraph one); (b) add a second template code, A1b, and have lead-gen pick by
  `booking_platform`. Recommendation: (b), it is explicit and both stay editable in the CRM.
- "5% of what is booked through the site": the commission doc says 5% of ALL sales through the
  site incl. at-visit sales marked collected. The email stays with the simpler phrase; the Fees
  page carries the detail. **The cap IS decided (2026-09-17: $400 a month): add "never more than $400 a month" to A1, A1b, the claim email line and the site copy when the cap is built into billing (ROADMAP "PRICING DECIDED").**

## 2. Marketing site (stemfra.com)

The site today leads with the design ("Barbershop", "Showcase your team, your cuts, and your
hours") and the offer card ("Free website, 5%"). Proposed order everywhere: only you → your
brand → grows with you → price.

### 2.1 Home

| Where | Today | Draft |
|---|---|---|
| Hero eyebrow (per slide) | Beauty / Fitness / Wellness | unchanged |
| Hero headline (per slide) | the vertical name, e.g. "Barbershop" | unchanged (the slide shows the design) |
| Hero blurb, barbers | Showcase your team, your cuts, and your hours. Visitors book a chair in two taps. | Your own barbershop site, where clients see only you. They book a chair in two taps. |
| Hero blurb, salons | (design-led) | Your own salon site, where clients see only you. Every stylist bookable, every service priced. |
| Hero blurb, CrossFit | (design-led) | Your own box, your own site. Classes, memberships and drop-ins, booked under your name. |
| Hero blurb, yoga | (design-led) | Your own studio site, where members see only you. Classes, passes and memberships in one place. |
| Hero blurb, massage | (design-led) | Your own practice site, where clients see only you. They pick the treatment, the therapist and the time. |
| Hero blurb, spa | (design-led) | Your own spa site, where guests see only you. Treatments, packages and gift cards under your name. |
| NEW band under the hero | none | **Headline:** On a marketplace, your clients see every shop. On your site, they see you. **Body:** Booking apps put your page next to the shop down the road, and every rebooking is a chance to look around. Stemfra gives your business its own address, its own look and its own booking, and brings your regulars back to it. **Buttons:** See a live site · Start free |
| Offer card | Offer: free website, 5% | **Eyebrow:** The offer **Line:** Free to claim. No monthly plan. A flat 5% of what is booked through your site. **Small line:** Your clients pay you at the venue, so we add no payment fees on top of yours. |
| "Included with every site" heading | unchanged | unchanged; reorder the list so it opens with: your own domain and look · online booking for the whole team · client win-back · Google review requests · reminders · AI front desk · memberships and classes |
| NEW "Switching" strip | none | **Headline:** Switching takes two steps. **1.** Send us your client list. We load it for you, history included. **2.** Swap the booking link on your Google profile. **Footnote:** We do the setup. You keep working. |

### 2.2 Solutions pages (one per vertical)

| Where | Today (barbers) | Draft |
|---|---|---|
| Hero headline | A barbershop website your clients book from | Your barbershop, your site, your clients |
| Hero description | Real barbershops already run on Stemfra. Book a chair, browse the menu, and see it for yourself. | A site of your own where clients see only you: your barbers, your prices, your chair. Book one on a live shop and see for yourself. |
| Problems showcase, NEW first tab | (first tab today: "The phone rings mid-fade") | **Title:** "My clients open the app and see ten other shops" **Body:** On a booking marketplace your page sits beside every shop nearby, cheaper ones included. On your own site there is only you: your brand from the Google listing to the confirmation text, and a client list that stays yours. |
| Features, "Card payments" | Take payment at booking with Stripe. Money lands in your account; refunds stay in your control. | **STALE since the pay-at-venue decision (2026-08-05).** Draft: **Pay at the venue.** Clients book online and pay you in the shop, the way they do today. Nothing to connect, no payout delays, and no payment fees from us on top of yours. |

Same pattern for the other five verticals (headline "Your salon / box / studio / practice / spa,
your site, your clients"; the marketplace tab worded for salons and spas with Fresha-style apps,
for studios with class-pass apps).

### 2.3 Pricing page

| Where | Draft |
|---|---|
| Headline | One price. Yours to grow on. |
| Sub | Free to claim, no monthly plan, nothing per seat, no add-ons. A flat 5% of what is booked through your site. |
| Trust row | Your own domain and brand · Whole team included · We move your client list for you · Clients pay you at the venue · Leave any time, take your data |
| FAQ, new | **Can I keep my current booking app as well?** You could, but you would pay twice. Stemfra replaces it: we load your client list, you swap the booking link on your Google profile, and from then on clients book on your own site. |
| FAQ, new | **Is 5% more than I pay now?** On a quiet month it is less, on a very busy month it can be more. What you get for it is a site of your own where clients see only you, the tools that bring regulars back, and a team that runs it for you. (If the cap is decided: "and it never exceeds $X a month".) |

### 2.4 Claim page (where ads and outreach land)

**Headline:** We built {{business_name}} a site of its own.
**Sub:** Your name, your look, your booking. Nobody else on the page.
**Steps:** See your site · Claim it free · Send us your client list · Swap the link on your Google profile.

## 3. What is NOT drafted here

Ads (the $300 Facebook pilot) and the follow-up emails A2 to A20, which still carry the older
angle. They should follow once A1 and the home page are approved.

## Sources behind this copy

- Peter's Gemini (Google AI mode) research thread on positioning, qualification and pitches: https://share.google/aimode/IYx0PoDAqg9H74ZjR
- Mindbody, "4 Operational Pain Points That Push Studio Owners to Switch Software" (cost vs value, dated UX, support, hard exits): https://www.mindbodyonline.com/business/education/blog/4-operational-pain-points
- Provider pricing, marketplace fees, contracts and complaints: `MARKET_RESEARCH_PROVIDERS_2026-09.md` (every figure linked there).
- Owner complaints about Booksy, Fresha, Mindbody, Vagaro: `GTM_PLAN_2026-09.md` section 9.
- Email deliverability rule (one link in a cold email): `EMAIL_DELIVERABILITY.md`.
