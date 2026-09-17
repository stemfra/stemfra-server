# Market research: the booking software owners use today (checked 2026-09-17)

_Who our prospects pay now, what it costs them, where it hurts, how hard it is to leave, and
where our pitch is strong or weak against each. Started from Peter's find: the GlossGenius help
centre section "Importing & Transferring Data" lists the providers owners migrate from (Vagaro,
StyleSeat, Square, Booksy, Rosy, Booker, Fresha, DaySmart, Meevo, SalonBiz, Mangomint, Acuity,
Schedulicity, Wix, Boulevard, Phorest). Companion docs: `GTM_PLAN_2026-09.md` (what we sell),
`OWNER_SOURCING_2026-09.md` (where reps find owners), `PRICING_COMPETITORS.md`._

**How to read the labels.** **V** = read on the vendor's own page. **3P** = a review site, press
or a competitor's blog (biased: Pabau, GlossGenius, Vibefam, Gymdesk, Mangomint all sell against
these tools). **U** = could not be verified. Pages were read through a summarising fetch tool and
several vendor pages answered in EUR / GBP / CZK (the tool browses from Europe). **Re-check any
figure on the vendor page, from a US browser, before it goes into sales copy or a call.** Rule for
reps: ask about the pain, never state another company's fee as a fact.

## 1. The five things this research changes

1. **The marketplace argument only works against marketplaces.** Other shops appear next to the
   owner on Booksy, Fresha, Vagaro, StyleSeat, theCut, Treatwell, Mindbody / ClassPass,
   MassageBook, Square Go (US, iOS) and WellnessLiving Explorer. It is FALSE for GlossGenius,
   Square Appointments pages, Acuity, Setmore, Boulevard, Mangomint, Phorest, Meevo, Zenoti, Jane,
   PushPress, Wodify. Outreach now only makes the claim for real marketplaces (code:
   `MARKETPLACES` in `lib/leadgenNative.js`).
2. **Almost nobody gives the owner a real website.** The premium tools (Boulevard, Mangomint,
   Phorest, Meevo, Zenoti) sell a booking widget, page or app. Websites are a paid add-on at
   Vagaro ($20), StyleSeat ($10), Jane (CAD $59), Zen Planner ($99), PushPress (in the $329 Grow
   bundle), Walla ($199). Only Wix gives a full site, and the owner builds it. "Your own branded
   site, built and run for you" is our clearest difference across the whole field.
3. **New-client fees are now everywhere on marketplaces**: Booksy Boost 30% (first visit, $10 to
   $100), StyleSeat 30% (max $50) plus a $2.35 fee the CLIENT pays on every booking, Treatwell 35%,
   Fresha 20% (min $6), Vagaro 20% (V on the UK page; the US wording must be re-checked),
   Mindbody 20% (max $30), MassageBook 15% (min $6). The most repeated owner complaint is being
   charged that fee on clients who were already theirs.
4. **Contracts decide timing.** Mindbody (12 / 24 / 36 months), Phorest (1 year, auto-renew, 2
   months' notice, remainder owed), Meevo (annual, "non-cancelable", up to 6% a year increase
   without notice), Zenoti (auto-renew, 60 days' notice, up to 20% at renewal), Boulevard (12
   months, 3P), Glofox (auto-renew, 30 days' notice, 3P), WellnessLiving (annual auto-renew, no
   refunds "under any circumstances"). For these owners the first call's job is to learn the
   renewal month and set the follow-up before the notice window. Paid or limited data exports
   (Meevo: one export, for a fee, within 30 days; Zenoti: CSV at "then-current data export fees";
   Phorest: engineer export only if fees are paid) make "we load your client list for you" worth
   saying early.
5. **On software cost alone we lose for a busy shop, and every researcher said so.** A 5-chair shop
   pays about $40 to $230 a month on the mainstream tools and $150 to $540 on the premium ones. 5%
   of $30,000 in bookings is $1,500. For membership gyms it is worse: 150 members at $150 = $22,500
   a month, 5% = $1,125 against software bills of $180 to $620. The pitch must rest on the branded
   site, win-back and reviews, a team that runs it, and no fixed fee in a slow month. This is the
   evidence behind the cap discussion (Peter: about $400) and suggests a carve-out or a cap for
   recurring gym memberships.

## 2. Comparison: what a 5-chair shop pays (software only, before card processing)

| Provider | Entry price | Per staff? | Marketplace + new-client fee | Contract | Own website | About $/mo for 5 chairs | Main complaint |
|---|---|---|---|---|---|---|---|
| Booksy | $29.99 (V) | +$20 each (V) | Yes. Boost 30% first visit, opt-in (V) | No | No (profile) | $110; about $230 with 10 Boost clients | Boost charged on the shop's own clients |
| Fresha | $19.95 solo (3P US) | $14.95 each (3P US) | Yes. 20%, min $6 | No | No | $75; about $155 with 10 marketplace clients | End of "free forever", fee on own clients, payout holds |
| Vagaro | $30, promo $23.99 (3P US) | +$10 per calendar (3P) | Yes. 20% one-time (V UK page) | No | Add-on $20 (3P) | $64 base, $85 to $120 with add-ons | Add-on creep; clients must create an account |
| Mindbody | from about $99 to $159 (3P US) | Unlimited users (V) | Yes. 20% first booking, cap (V) | **12 / 24 / 36 mo auto-renew (V)** | Widgets; branded app about $250 (3P) | about $279; $500+ with the app | Cannot cancel, renewals, price rises |
| GlossGenius | $28 (V) | By plan (Gold to 9 users, 3P) | None | No | Templated booking site on all plans (V); own domain = redirect (3P) | $56 | Payout holds, support, app downtime |
| Square Appointments | Free; Plus $49 per location (3P) | No | Square Go app, free, US iOS (V) | No | Subdomain; full site needs a paid Square Online plan | $49 to $64 | 2025 price rise, fund holds |
| StyleSeat | $35 per pro (V) | Per pro | **Yes. 30% first visit, max $50 (V); client pays $2.35 per booking (V)** | No | Add-on $10 (V) | $175 to $225 + fees | Fees, the client booking fee, support |
| Acuity | $20 (V) | By calendars | None | No | Scheduling page only; no own domain (3P) | $34 (+ a Squarespace site) | No free tier, Squarespace login issues |
| Schedulicity | **Gone: bought by Vagaro Jan 2025, site redirects (V)** | | | | | treat as Vagaro | Forced migration = warm prospects |
| Wix Bookings | $29 Core (3P US) | Seats = collaborators (5 / 10) | None | Annual prepay typical | **Yes, real site, owner builds it** | $39 | Bookings app rated 3.4 / 5 on Wix's own store (V); billing |
| Setmore | Free to 4 users; Pro $12 / user (V) | Yes | None | No | Booking page only | $25 to $60 | Calendar sync breaks |
| SimplyBook.me | about $10 to $60 (U for USD) | Provider caps | Minor directory | No | Templated; custom domain $119 / 3 yrs (V) | $45 to $90 | Feature-count tiers, booking caps |
| Boulevard | $143 promo (V) | Flat per location (5 providers on Essentials) | None | 12 months (3P) | No, widget | $143 to $208 | Contract, stacked costs, support |
| Mangomint | $120 + $10 / user (V) | Yes | None | Month to month (V) | No, overlay widget | $160 to $190 | Weak reporting, add-ons. Rated 4.9: hardest to displace |
| Phorest | Not published (V) | Unlimited staff | None; about $1 per online booking (3P) | **1 yr auto-renew, 2 months' notice (V)** | No; branded app add-on | about $150 to $300 (estimate) | Expensive, contract "not how it was sold" |
| Meevo | Not published (V); $129 to $179 Lite (3P) | 5 users on Lite | None | **Annual, non-cancelable (V)** | No | $129 to $179; 6th login forces $229+ | Glitchy, billed after cancelling |
| Zenoti | Not published (V) | Quote | None that matters in US/UK/CA | **Auto-renew, 60 days' notice, +20% at renewal (V)** | No; Webstore + app | about $440 to $540 (estimate) | Expensive, rigid contract, complexity |
| Treatwell (UK/EU) | Not published; about £35 (3P) | | **Yes. 35% new client (V)**, 2.5% prepay | 30 days' notice (V) | No | about £350 to £420 with 20 new clients | "High commission AND high monthly fees" |
| Salonized (Treatwell) | £25 to £50 (V) | +£4 each | Optional Treatwell at 35% | No | No | £55 to £66 | Price rises |
| MassageBook | $15 / $59 / $99 (V) | Unlimited on Clinic | **Yes. 15% first service, min $6 (3P vendor article)** | No | Free site on their URL | $99 + 15% on directory clients | Price rises, slow payouts |
| Jane | CAD $54 to $99 (V) | +CAD $35 to $40 each (3P) | None | No | Add-on CAD $59 (V) | CAD $219 to $318 | Confusing billing reports, add-ons |
| ClinicSense | $39 to $99 (V) | +$20 each | None | No | No | $179 | Mild; well liked |
| Noterro | $33 to $77 (V) | +$13 to $27.50 each | None | U | Subdomain portal | $143 to $187 | Slow pages, add-ons |

Fitness and studios (a 150-member, 5-coach box; core plan + branded app + website + marketing):

| Provider | Core price | Website | All-in about $/mo | Contract | Main complaint |
|---|---|---|---|---|---|
| PushPress | Free / $159 / $229 (V) | In Grow $329 (V) | $488 to $559 | Month to month (not verified) | The stack gets expensive. Well liked |
| Wodify | $199 list, $99 promo (V) | In Ultimate or add-on, price hidden | $178 to $278 + hidden add-ons | Month to month (V) | Opaque pricing, payment quirks |
| Zen Planner | $99 to $289 by members; about $229 at 150 (3P) | Add-on $99 (3P) | $616 | 30 days' notice form | Billed after cancelling; processor about 3.5% |
| Pike13 | $139 to $286 (V) | Widgets only | $225 to $286 | Monthly option | Outages, reporting, price rises |
| Glofox (ABC) | "from $99" (V); $160 to $400 reported (3P) | No | about $250 to $400 | Auto-renew, 30 days' notice (3P) | Hard to cancel, charges after cancelling |
| WellnessLiving | $69 / $199 / $349 (V) | Presence add-on, price hidden | $199 to $500 | **Annual auto-renew; no refunds (V)** | Trustpilot 2.1 / 5; 24 BBB complaints |
| Momence | Not published; about $250 to $300 (3P) | No | about $250 to $400 | U | Billing errors, slow support |
| TeamUp | $189 for 101 to 200 customers (V) | No; app +$99 | $288 | None (V) | The honest pricer of the group |
| Walla | $299 / $599 per location (V) | Website + SEO $199 (V) | $498 to $647 | Negotiated | Premium |
| Mariana Tek | Not published | | $179 to $285+ (3P, low confidence) | | Multi-location boutique tool |
| Arketa | $49 + a 3% platform fee (V) | Unpriced add-on | $149 to $699 (3P) | Month to month | Instructor-first |

## 3. Where our pitch is strongest and weakest

**Strongest (lead with "your clients should only see you"):** StyleSeat (30% + the client fee +
competitors beside them), Booksy (Boost on their own clients), Treatwell UK (35%), Fresha (20% +
the end of free), Vagaro marketplace users and the ex-Schedulicity owners who were moved without
being asked, MassageBook directory users.

**Strong on a different argument (lock-in and no website):** Mindbody, WellnessLiving, Glofox, Zen
Planner, Meevo, Phorest, Zenoti. Pitch: no contract, leave any month, your data is yours, and a
real site they do not have today. Time the call to the renewal window.

**Weak (they pay little, have no marketplace problem, and are content):** Square Appointments,
GlossGenius, Acuity, Setmore, ClinicSense, TeamUp, PushPress, Wodify, Mangomint. Only the branded
site + win-back + reviews + "we run it for you" can carry these, and only for owners who want to
grow. Do not spend the first calls here.

**Verticals:** barbers and salons sit mostly in the strongest group. Yoga / Pilates / CrossFit run
on membership revenue, where a flat 5% compares worst: decide the cap or a membership carve-out
before pushing those verticals.

## 4. Provider notes (what a rep should know before a call)

### Marketplaces

- **Booksy.** $29.99 + $20 per extra staff; Boost 30% of a new client's first visit ($10 min, $100
  max), opt-in, 0% after; processing 2.49% to 2.69%. Owners: charged Boost on clients they already
  had; clients see other shops in the app; weekend payouts; disputed reviews stay. Booksy's own
  help tells owners to add walk-ins to the client list first and offers a claim + refund route.
- **Fresha.** Free plan ended; $19.95 solo or $14.95 per team member (US, 3P); 20% one-time on
  marketplace clients (min $6); paid add-ons (AI concierge $99.95, loyalty $59.95, Google rating
  boost $14.95 per location); texts beyond the quota are paid. Owners: the end of "free forever" at
  short notice, the fee on clients they brought themselves, slow email-only support, payout holds
  (a minority, but loud). Rated 4.8 / 5 overall: most users are happy.
- **Vagaro.** About $30 base (promo $23.99), about $10 per extra calendar, add-ons: website $20,
  forms $10, text marketing from $20, branded app $100 (3P). A one-time 20% on new Marketplace
  clients is on the UK pricing page (V); confirm the US wording. Clients must create a Vagaro
  account to book (V, Vagaro help). Owners: a $30 plan becomes $100 to $200; outages.
- **StyleSeat.** US only, solo pros. $35 a month per pro; **30% of a new client's first
  appointment (max $50)**; the CLIENT pays $2.35 on every booking; Smart Pricing takes 5.5%;
  custom website add-on $10. Owners: "my clients are tipping me less because of the booking fees";
  the 30% on clients they referred themselves; no phone support. The pro's reviews and ranking
  stay with StyleSeat when they leave: say "your Google reviews are yours and they move with you".
- **Treatwell (UK / EU).** 35% on a new marketplace client's first booking, 0% on repeat and
  direct; 2.5% + VAT on prepayments; subscription not published (about £35, 3P). 150,000+ salon
  partners in Europe. Owners: "high commission AND high monthly fees", no control over which
  customers they get. 30 days' notice to leave; data downloadable before termination. Owns
  Salonized.
- **Mindbody (and Booker, which it owns).** Terms of 12, 24 or 36 months, auto-renew, 30 days'
  notice before the end, generally no mid-term exit (V, Mindbody's own blog); 20% of a new app
  client's first purchase (capped); branded app about $250 to $300 (3P). 103 BBB complaints in
  three years, about half on billing. CSV export exists; a paid export service runs for 30 days
  after cancelling.
- **MassageBook.** $15 / $59 / $99 (Clinic = unlimited staff); AMTA 25% and ABMP 10% discounts;
  15% of a new directory client's first service (min $6). ABMP's preferred software.
- **Square Go / WellnessLiving Explorer.** Small consumer directories attached to Square
  Appointments (free, US iOS, opt-out possible) and WellnessLiving.

### Booking tools without a marketplace

- **GlossGenius.** $28 / $56 / $168; flat 2.6% processing; templated booking site on every plan;
  125,000+ businesses (3P). Owners: payout holds and identity re-verification, app downtime,
  limited site customisation. No contract. Never tell a GlossGenius owner that other shops appear
  next to them: they do not.
- **Square Appointments.** Free plan; Plus $49 and Premium $149 per location since the October
  2025 restructure (3P; older articles still say $29 / $69); 2.5% + 15¢ in person on Plus. Owners:
  that price rise, fund holds, fragmented apps. The lock-in is Square hardware and payments.
- **Acuity (Squarespace).** $20 / $34 / $61 by number of calendars; no processing fee of its own;
  the scheduling page cannot sit on the owner's domain. 250,000+ businesses. The easiest exit of
  all (CSV, the owner's own Stripe).
- **Setmore, SimplyBook.me, Wix Bookings.** Cheap horizontal tools. Wix is the only provider here
  with a real website, built by the owner; its Bookings app scores 3.4 / 5 from 1,718 reviews on
  Wix's own app market, and a Wix site cannot be exported to another host.
- **Schedulicity.** Bought by Vagaro in January 2025; the site, pricing and help centre redirect to
  vagaro.com. Anyone still "on Schedulicity" is now a Vagaro user who did not choose to be.

### Premium salon and spa platforms

- **Boulevard.** $143 / $234 / $328 per location (promotional, V); Forms $65, QuickBooks $45;
  12-month contract (3P); no marketplace, no website builder. 5,000+ businesses, $80M Series D in
  2025. Owners: locked into a year, stacked costs, slow support.
- **Mangomint.** $120 + $10 per user; phone $70, marketing from $30, payroll $50 + $8; processing
  2.45% + 15¢; month to month; free data transfer; "open data ownership". Capterra 4.9. The
  hardest of all to displace; low priority.
- **Phorest.** No public prices; "designed for 3+ staff"; 1-year term that auto-renews unless
  written notice is given at least 2 months before the end, remainder owed on early exit (V,
  terms); about $1 per online booking in the US (3P); engineer-prepared export only if all fees are
  paid; data may be destroyed 60 days after termination. About 12,000 businesses. Strong in UK / IE.
- **Meevo (Millennium).** No public prices; "Annual Commitment"; payment obligations
  "non-cancelable"; fees may rise up to 6% a year without notice; one final export, for a fee,
  inside a 30-day window (V, terms). Owners: glitchy, billed after cancelling.
- **Zenoti.** Enterprise; no public prices; auto-renews yearly with 60 days' notice; up to 20% at
  renewal; CSV export at "then-current data export fees" (V, terms). Overkill for our audience;
  we meet it only in chains.
- **Booker (by Mindbody).** Day spas, salons, franchises. "Starting at $139" per location (V);
  $139 / $289 / $469 / $599 tiers with a 12-month minimum (3P). Lists the business in the Mindbody
  consumer app beside competitors. Same contract terms as Mindbody: 12 / 24 / 36 months,
  auto-renew, 30 days' notice, generally no mid-term exit (V). Owners: a bill that went from $85
  to $599, cannot cancel, downtime, no weekend support. The most locked-in vendor of all: call 60
  to 90 days before renewal.
- **DaySmart Salon (formerly Salon Iris; Orchid = DaySmart Spa).** $29 (1 user) / $69 (3) / $149
  (3, with text marketing + reputation) / $199 (6), +$9 per extra user (V). A real AI website
  builder with hosting and own domain exists as a paid add-on, price not published (V). Owners:
  slow support, cancellation by email that takes weeks (BBB D-), data not fully exportable after
  cancelling. About $87 to $167 for five staff.
- **Rosy (Fullsteam).** "Just Me" $29, tiers by provider count, cheaper with RosyPay (from 2.55% +
  $0.10); a website builder sits in the premium package (3P). Capterra 4.7: few complaints
  (support response, reporting). About $69 to $130 for five.
- **SalonBiz.** Commission hair salons. $160 with its payments / $185 without for up to 5
  professionals; $265 / $300 to 12 (V). No website builder, no marketplace, no contract. Owners:
  crashes, long support waits, dated.
- **Timely (EverCommerce).** Strong UK / AU / NZ. About $26 to $47 for the first staff member and
  $24 to $36 for each extra (3P; the vendor page did not render); about $155 for five. Owners: the
  per-staff price grows with the team. 50,000 professionals.
- **Envision, Shortcuts, Kitomba.** Quote-only legacy tools (Envision about $179 for five, 3P;
  Shortcuts from $29 per user, 14,000+ businesses, surprise contract renewals reported; Kitomba is
  NZ / AU). Low priority for US / CA / UK.
- **Squire (barbers), iSalon (UK).** Named as migration sources by Vagaro and Phorest; not yet
  profiled.

### Clinical and massage

- **Jane.** CAD $54 / $79 / $99 + per practitioner; Jane Websites add-on CAD $59; no contract;
  245,000+ practitioners; Canada first. Clinical charting and insurance are its moat: not our
  fight unless the clinic is mostly cash massage.
- **ClinicSense, Noterro.** Small, well-liked massage / RMT tools at $140 to $190 for five
  practitioners. No marketplace, no website.

### Fitness and studios

See the second table. Easiest to move: WellnessLiving (Trustpilot 2.1 / 5, auto-renewing annual
contracts, 24 BBB complaints), Glofox (hard to cancel), Zen Planner (billed after cancelling, a
processor at about 3.5%). Happy and month to month: PushPress, Wodify, TeamUp.

## 5. Who migrates from whom (the vendors' own import pages)

- **GlossGenius** publishes "How to Export Your Data from …" for Vagaro, StyleSeat, Square, Booksy,
  Rosy, Booker, Fresha, DaySmart, Meevo, SalonBiz, Mangomint, Acuity, Schedulicity, Wix, Boulevard,
  Phorest, plus "How to Request a Data Transfer" and "Exporting Your Data From Another Software"
  (Peter's screenshot, 2026-09-17; the article bodies did not render for the research tool).
- **Vagaro** import articles: Acuity, Booksy, Fresha, GlossGenius, Mindbody, Phorest, Square,
  Timely, Treatwell, "Another Software". Its compare page adds Booker, Zenoti, Rosy, StyleSeat,
  Squire, Mangomint.
- **Phorest** says it has migrated hundreds of salons from Fresha / Shedul, Shortcuts, iSalon,
  Timely, Salon Iris (3P snippets of phorest.com/compare).
- **Zenoti** "switching from" guides: Boulevard (4 to 6 weeks), Mindbody (about 8 weeks), Vagaro
  (1 to 3 weeks). Its note that stored cards on file are the number one blocker matters less to
  us: our clients pay at the venue, so there are no card tokens to move.
- **Jane** import guides name about 30 sources, incl. Acuity, Booker, Booksy, ClinicSense,
  Cliniko, DaySmart, Fresha, GlossGenius, MassageBook, Mindbody, Noterro, Schedulicity, Setmore,
  SimplyBook.me, Square, Timely, Vagaro, WellnessLiving, Wix, Zenoti.
- **Pattern:** the sources named most often are Vagaro, Fresha, Mindbody, Square, Booksy and
  GlossGenius. Those are the exports our import must read without hand work, and the first
  "How to export your data from …" articles our Help Center needs.

## 6. Still to research

Squire (barbers) and iSalon (UK) profiles; live quotes for Rosy, Timely, Booker tiers; exact client-export column headers per provider (in progress, for
the CMS import presets); US-browser re-check of Fresha, Vagaro and Mindbody prices; real quotes
for Phorest, Meevo and Zenoti.

## 7. Sources

**Peter's starting points:** GlossGenius help centre, "Importing & Transferring Data" (screenshot
2026-09-17) · Gemini research thread https://share.google/aimode/IYx0PoDAqg9H74ZjR · Mindbody's
"4 operational pain points" https://www.mindbodyonline.com/business/education/blog/4-operational-pain-points

**Booksy / Fresha / Vagaro / Mindbody:** https://biz.booksy.com/en-us/pricing · https://biz.booksy.com/features/boost · https://www.capterra.com/p/142741/Booksy/reviews/ · https://www.trustpilot.com/review/booksy.com · https://www.fresha.com/pricing · https://sorttheclicks.com/fresha-reviews-reddit/ · https://www.vagaro.com/pro/pricing · https://www.vagaro.com/pro/compare · https://support.vagaro.com/hc/en-us/sections/4403309122715-Import-Your-Data · https://glossgenius.com/blog/vagaro-cost · https://pabau.com/blog/vagaro-pricing/ · https://www.capterra.com/p/153752/Vagaro/reviews/ · https://www.trustpilot.com/review/vagaro.com · https://www.vagaro.com/news/press-release/vagaro-acquires-schedulicity-expand-industry-service · https://www.medspavendorhub.com/resources/schedulicity-is-now-vagaro · https://www.mindbodyonline.com/business/pricing · https://www.mindbodyonline.com/business/education/blog/mindbody-contracts-cancellation-data · https://vibefam.com/mindbody-pricing/ · https://www.bbb.org/us/ca/san-luis-obispo/profile/computer-software-developers/mindbody-inc-1236-5002899/complaints

**GlossGenius:** https://glossgenius.com/pricing · https://pabau.com/blog/glossgenius-pricing/ · https://glossgenius.elevio.help/en/articles/643-how-to-redirect-your-custom-domain-to-your-glossgenius-booking-site · https://glossgenius.elevio.help/en/articles/54-how-to-cancel-your-glossgenius-account · https://glossgenius.elevio.help/en/articles/871-exporting-data-from-your-glossgenius-account · https://www.trustpilot.com/review/glossgenius.com · https://www.capterra.com/p/174830/GlossGenius/reviews/ · https://getlatka.com/companies/glossgenius

**Square:** https://squareup.com/us/en/appointments/pricing · https://squareup.com/help/us/en/article/5068-what-are-square-s-fees · https://squareup.com/us/en/software/marketing/pricing · https://squareup.com/us/en/pricing · https://squareup.com/us/en/appointments/square-go · https://squareup.com/us/en/compare/square-vs-vagaro · https://www.nerdwallet.com/business/software/learn/square-fees · https://community.squareup.com/t5/Online-Store/Square-Plus-Online-new-pricing-49-mo-only-option/m-p/821571 · https://community.squareup.com/t5/Appointments-Bookings/Export-Appointments-Reports/td-p/638717 · https://squareup.com/help/us/en/article/6916-connect-your-domain-with-square-online-store · https://www.capterra.com/p/170263/Square-Appointments/reviews/ · https://www.bbb.org/us/ca/oakland/profile/credit-card-merchant-services/square-inc-1116-370609/complaints

**StyleSeat:** https://help.styleseat.com/articles/13612670-how-much-does-styleseat-cost · https://www.styleseat.com/blog/new-client-connection/ · https://www.styleseat.com/blog/styleseat-review/ · https://www.styleseat.com/tos-for-professionals · https://www.trustpilot.com/review/styleseat.com · https://www.capterra.com/p/176521/StyleSeat/reviews/ · https://pabau.com/blog/styleseat-pricing/ · https://support.heygoldie.com/en/articles/323741-importing-from-styleseat

**Acuity / Wix / Setmore / SimplyBook:** https://acuityscheduling.com/pricing · https://acuityscheduling.com/ · https://help.acuityscheduling.com/hc/en-us/articles/47575509977997-Change-your-scheduling-page-link · https://help.acuityscheduling.com/hc/en-us/articles/16676916553485-Exporting-Acuity-Scheduling-appointments-and-clients · https://www.capterra.com/p/191978/Acuity-Scheduling/reviews/ · https://www.trustpilot.com/review/acuityscheduling.com · https://www.wix.com/app-market/web-solution/bookings · https://support.wix.com/en/article/wix-bookings-upgrading-wix-bookings · https://www.wix.com/plans · https://www.websitebuilderexpert.com/website-builders/wix-pricing/ · https://support.wix.com/en/article/wix-payments-service-fees · https://forum.wixstudio.com/t/wix-bookings-staff-members-as-site-collaborators-limiting-them-at-5-and-10-sure/62904 · https://support.wix.com/en/article/exporting-or-embedding-your-wix-site-elsewhere · https://www.trustpilot.com/review/wix.com · https://www.setmore.com/pricing · https://www.capterra.com/p/122035/SetMore/reviews/ · https://trafft.com/setmore-reviews/ · https://simplybook.me/en/pricing · https://www.capterra.com/p/140086/Simplybook-me/reviews/ · https://schedulingkit.com/pros-and-cons/simplybook-pros-and-cons · https://www.g2.com/products/simplybook-me/reviews

**Boulevard / Mangomint / Phorest / Meevo / Zenoti:** https://www.joinblvd.com/pricing · https://www.joinblvd.com/features/data-migration · https://thesalonbusiness.com/boulevard-software-review/ · https://glossgenius.com/blog/boulevard-price · https://www.mangomint.com/go/switch-from-boulevard/ · https://www.trustpilot.com/review/www.joinblvd.com · https://www.capterra.com/p/180087/Boulevard/ · https://www.softwareadvice.com/retail/boulevard-profile/reviews/ · https://www.digitalcommerce360.com/2025/07/21/boulevard-raises-80-million-to-accelerate-ai-for-self-care/ · https://www.mangomint.com/pricing/ · https://www.mangomint.com/legal/platform-terms/ · https://www.mangomint.com/go/switch-from-vagaro-now/ · https://thesalonbusiness.com/mangomint-review/ · https://www.trustpilot.com/review/mangomint.com · https://www.capterra.com/p/187593/Mangomint/ · https://www.phorest.com/us/pricing/ · https://www.phorest.com/us/termsandconditions/ · https://www.phorest.com/compare/ · https://pabau.com/blog/phorest-pricing/ · https://support.phorest.com/hc/en-us/articles/360016261860-Online-Booking-Fee-FAQ · https://www.capterra.com/p/113530/Phorest-Salon-Software/pricing/ · https://www.trustpilot.com/review/phorest.com · https://www.softwareadvice.com/salon/phorest-profile/reviews/ · https://www.salontoday.com/1095821/phorest-unveils-lineup-and-teases-a-suite-of-strategic-ai-features-for-sold-out-salon-owners-summit-2026 · https://www.meevo.com/pricing · https://www.meevo.com/terms-of-service · https://www.meevo.com/features/meevopay · https://pabau.com/blog/meevo-pricing/ · https://www.capterra.com/p/172058/Meevo-2/reviews/ · https://www.zenoti.com/pricing · https://www.zenoti.com/trust/terms-and-conditions · https://pabau.com/blog/zenoti-pricing/ · https://schedulingkit.com/pricing-guides/zenoti-pricing · https://www.capterra.com/p/131057/ZENOTI/reviews/ · https://www.trustpilot.com/review/zenoti.com · https://www.zenoti.com/thecheckin/switching-from-boulevard-to-zenoti · https://www.zenoti.com/thecheckin/switching-from-mindbody-to-zenoti · https://www.zenoti.com/thecheckin/switch-from-vagaro-to-zenoti

**Booker / DaySmart / Rosy / SalonBiz / Timely / Envision / Shortcuts / Kitomba:** https://www.booker.com/ · https://www.booker.com/pricing · https://thesalonbusiness.com/booker-vs-mindbody/ · https://www.capterra.com/p/90708/Booker/reviews/ · https://www.daysmart.com/salon/pricing/ · https://www.daysmart.com/salon/features/salon-website-builder/ · https://www.softwareadvice.com/salon/salon-iris-profile/ · https://www.bbb.org/us/mi/ann-arbor/profile/computer-hardware/daysmart-software-inc-0372-90014580 · https://www.capterra.com/p/132391/Orchid-Medical-Spa/ · https://rosysalonsoftware.com/ · https://rosysalonsoftware.com/pricing/ · https://rosysalonsoftware.com/salon-website-builder/ · https://www.thesmbguide.com/rosy · https://www.cardfellow.com/blog/rosy-salon-software-review/ · https://costbench.com/software/salon-spa/rosy-salon/ · https://www.softwareadvice.com/retail/rosy-salon-profile/ · https://www.capterra.com/p/68391/Rosy-Salon-and-Spa/ · https://www.salonbizsoftware.com/ · https://www.salonbizsoftware.com/pricing/ · https://www.softwareadvice.com/retail/salonbiz-profile/reviews/ · https://www.capterra.com/p/9175/SalonBiz/ · https://envisionnow.com/pricing/ · https://www.softwareadvice.com/barbershop/envision-salon-profile/ · https://www.shortcutssoftware.com/ · https://www.softwareadvice.com/barbershop/shortcuts-profile/ · https://www.kitomba.com/pricing/ · https://www.kitomba.com/nz/single-site-pricing/ · https://timetobook.co.nz/blog/what-does-salon-software-cost-nz · https://www.capterra.co.nz/software/91452/kitomba · https://pabau.com/blog/timely-pricing/ · https://www.softwareadvice.com/product/26047-Timely/ · https://schedulingkit.com/pricing-guides/timely-pricing · https://investors.evercommerce.com/news-releases/news-release-details/evercommerce-completes-acquisition-timely-leading-business

**Treatwell / Salonized / MassageBook / Jane / ClinicSense / Noterro:** https://www.treatwell.co.uk/partners/pricing/ · https://www.treatwell.co.uk/partners/ · https://www.treatwell.co.uk/info/supplier-terms-and-conditions/ · https://www.dothebeauty.com/blog/treatwell-connect-review · https://www.capterra.com/p/181827/Treatwell/reviews/ · https://www.trustpilot.com/review/treatwell.co.uk · https://help.salonized.com/en/articles/572113-what-are-salonized-plans-and-pricings · https://www.salonized.com/en/pricing · https://hji.co.uk/treatwell-acquires-dutch-salon-software-company-salonized · https://www.capterra.com/p/141697/Salonized/reviews/ · https://pro.massagebook.com/pricing · https://www.capterra.com/p/147523/MassageBook/reviews/ · https://jane.app/pricing · https://jane.app/guide/jane-payments-faq · https://jane.app/guide/importing-from-fresha · https://jane.app/guide/batch-chart-export-for-practitioners · https://pabau.com/blog/jane-app-pricing/ · https://www.capterra.com/p/178984/Jane-App/reviews/ · https://clinicsense.com/pricing · https://www.capterra.com/p/178722/ClinicSense/reviews/ · https://www.noterro.com/pricing · https://www.capterra.com/p/164994/SOAP-Vault/reviews/

**Fitness and studios:** https://www.pike13.com/pricing · https://www.pike13.com/terms-and-conditions · https://www.capterra.com/p/225933/Pike13/reviews/ · https://www.glofox.com/plans/ · https://www.glofox.com/legal/terms-of-use/ · https://vibefam.com/glofox-pricing-2026/ · https://www.trustpilot.com/review/glofox.com · https://www.pushpress.com/pricing · https://www.pushpress.com/products/pushpress-websites · https://sites.pushpress.com/faq/ · https://www.capterra.com/p/172781/PushPress/reviews/ · https://gymdesk.com/blog/is-pushpress-good-for-gyms · https://stripe.com/en-mx/customers/pushpress · https://www.wodify.com/pricing · https://www.wodify.com/blog/wodify-faqs · https://www.wodify.com/products/branded-app · https://www.trustpilot.com/review/www.wodify.com · https://www.capterra.com/p/159663/Wodify/reviews/ · https://zenplanner.com/pricing/ · https://zenplanner.com/terms-of-use/ · https://gymdesk.com/blog/zen-planner-review · https://mattrackapp.com/blog/zen-planner-pricing/ · https://www.trustpilot.com/review/zenplanner.com · https://www.wellnessliving.com/pricing/ · https://www.wellnessliving.com/terms-of-use/ · https://www.trustpilot.com/review/wellnessliving.com · https://www.bbb.org/ca/on/richmond-hill/profile/marketing-software/wellness-living-systems-inc-0107-1305630/complaints · https://vibefam.com/wellnessliving-review-pricing-features-pros-cons-2026/ · https://www.softwareadvice.com/appointment-scheduling/wellnessliving-profile/reviews/ · https://momence.com/pricing/ · https://vibefam.com/momence-pricing-2026/ · https://studiostackpro.com/blog/momence-pricing-guide/ · https://www.offeringtree.com/blog/wellnessliving-vs-momence/ · https://help.momence.com/en/articles/12030799-domain-name-service-dns-faq-s · https://www.capterra.com/p/229516/Ribbon/reviews/ · https://www.trustpilot.com/review/momence.com · https://www.marianatek.com/pricing/ · https://www.exercise.com/grow/how-much-does-mariana-tek-cost/ · https://www.arketa.com/pricing · https://vibefam.com/arketa-pricing-2026/ · https://www.hellowalla.com/us/pricing · https://goteamup.com/pricing/ · https://www.g2.com/products/teamup/pricing
