# Product menu and AI agent pricing: how the category does it (2026-09-29)

_Discussion paper for Peter. No decision is taken here. Question put by Peter: restructure
"Products" into Websites and AI, list the agents with a price each, and move AI to a subscription
because the competitors' subscriptions are "tested and proven" and make profit deterministic.
Context he added the same day: the Stemfra AI session is building TWO products, Front desk and
Leads. Screenshots: `docs/research/shots-2026-09-29/` (captured headlessly, cookies declined)._

## 1. How the closest companies arrange their menus

| Company | Menu, left to right | Where AI sits |
|---|---|---|
| Squarespace | Products (what it does) · Solutions (who it is for) · Resources | Inside Products, as features (AI Website Builder) |
| GlossGenius | How it works (Agents, Booking, Marketing, Payments, Staff) · Businesses · Pricing · Resources | FIRST item of the first menu: "Agents" (Reception, Growth Agent, Marketing Agent) |
| Booksy Biz | Why Booksy · Features · Solutions by industry · Pricing · More | A feature: "AI Receptionist" |
| Mindbody | Features · Business type · Resources · Pricing | A feature: "AI Concierge", plus "AI-powered platform" |
| Vagaro | Business Types · Features · Products · Multi-location · Pricing | An add-on in Features |
| **Stemfra today** | Products (six business types) · Solutions (six business types) · Pricing | Nowhere in the menu |

Every one separates WHAT (features or products) from WHO (business types). None groups its menu
as "Websites" and "Business". GlossGenius is the only one that sells AI as hires: "Three new
hires growing your business, zero new payroll", with a tab per agent.

## 2. How AI agents are priced

| Vendor | AI product | Model | Price | Included | Over the allowance | Trial |
|---|---|---|---|---|---|---|
| GlossGenius | Reception (calls, texts, bookings) | Add-on subscription | $50/month | 100 minutes + 200 texts | $0.50/minute, $0.05/text | Free until 2026-11-30 |
| Vagaro | Vera Receptionist (chat) | Add-on subscription | $10/month | not stated | not stated | n/a (third-party source) |
| Booksy | AI Receptionist (phone) | Inside the base plan, early access | $29.99/month base | not stated | not stated | 14 days |
| Mindbody | AI Concierge (text + web chat) | Add-on on the top plan | on request | not stated | not stated | demo |
| Goodcall | Phone agent | Subscription per agent | $79 / $129 / $249 | unlimited minutes; 100 / 250 / 500 unique customers | $0.50 per customer | free trial |
| Intercom | Fin (support agent) | Per outcome + seats | $0.99 per resolved conversation + $29 to $132 per seat | n/a | n/a | 14 days, no card |
| Standalone AI receptionists (Dialzara, Trillet, Phonely, Smith.ai…) | Phone | Subscription with a bucket | $29 to $300/month | 60 to 200 minutes | $0.20 to $0.48/minute | varies (third-party round-ups) |

Findings:

1. **Nobody prices an AI agent as a commission on bookings.** Every one is a subscription, and
   almost every one is a subscription WITH A USAGE ALLOWANCE and an overage price. The reason is
   cost: an agent costs money per minute and per message whether or not a booking follows.
2. **The allowance is the meter.** It is also the abuse ceiling that ROADMAP P45 had to build by
   hand, which is a second argument for the model.
3. **Two units are in use**: time or messages (GlossGenius, the standalone vendors) and people or
   outcomes (Goodcall's unique customers, Intercom's resolutions). Outcome units are easier for a
   buyer to value and harder for the vendor to predict.
4. **"Free now, paid from a date"** is how GlossGenius is launching Reception.
5. **Commission does exist in this category, for one thing only: finding a new client.** Booksy's
   Boost takes 30% of a first visit; the pricing paper on file records Fresha and Treatwell doing
   the same. It is never used for software.

## 2b. Vagaro: one location, team size, many locations (Peter's question, 2026-09-29)

Read from Vagaro's own pricing page by clicking every size in its calculator. The network served
the UK page (GBP); the Canadian page was fetched for comparison; the US page redirects by location,
so US figures come from Vagaro's own FAQ line plus third-party write-ups.

| Bookable calendars | UK, shown price (struck-through price) | Step |
|---|---|---|
| 1 ("Just Me") | £20 (£30) | |
| 2 | £30 (£40) | +£10 |
| 3 | £40 (£50) | +£10 |
| 4 | £50 (£60) | +£10 |
| 5 | £60 (£70) | +£10 |
| 6 | £70 (£80) | +£10 |
| 7 or more | £80 (£90) | capped: more staff cost nothing |

- Canada: CAD 35 for one calendar. US (third-party): $30 for one, +$10 each, $90 at seven or more.
- **The unit is the "bookable calendar"**: a person who performs services and needs a schedule.
  Front desk and admin staff are free.
- **Many locations**: the calculator is replaced by "Contact Multi-location Team". Vagaro's FAQ
  states the rule: every location is priced on its own (its calendars + the add-ons chosen for
  it), "without any added multi-location fees"; "Each bookable calendar license you add to a
  business location costs $10 (US), up to seven licenses"; locations may carry different
  features; staff profiles are shared across locations. What the sales team adds is service, not
  a price tier: data migration, a named success manager, single sign-on, data lake.
- **Trial**: 30 days, all features "except email marketing, text marketing & branded app" (the
  three with a real cost per use or per build). "Cancel anytime with no cancellation fees".
- **Add-ons** (names on Vagaro's page, prices third-party): Text Marketing $20, Email Marketing,
  Forms $10, Online Shopping Cart, **MySite (the website) $20**, Branded App $100 (some sources
  $200), Fill My Books, Payroll $34 + $5 per employee, Check-In App $10, Live Stream $10, Drive
  $10, QuickBooks, Xero, Data Lake $40; Vera Receptionist $10.
- Payments are a second income line (Vagaro Merchant Services; rates not on the pricing page).

What the model does:

1. **Price follows capacity to earn**, a proxy for revenue: one chair pays the least, the price
   rises with each earning person, and it STOPS at seven. It is a cap, like our $400.
2. **A low entry price and a long add-on list.** A realistic single shop with website, texts and
   forms pays about $80 to $100, not $30. Third-party reviews call this the hidden cost.
3. **Location is the billing unit.** No group discount is published and no group fee either.
4. **The website is an add-on** there and the core product here.

## 3. Trials (third-party benchmarks, 2025 to 2026)

| Trial design | Trial-to-paid, median | Range |
|---|---|---|
| No card required | about 14% | 8 to 22% |
| Card required | about 44% | 35 to 55% |
| Freemium | about 4.5% | 2 to 8% |

Card-required trials convert three times better and attract fewer sign-ups. Fourteen days is the
common length among the companies above; none of them offers thirty.

## 4. Reading for Stemfra

- **Subscription for the AI products: supported by the evidence.** Front desk and Leads both
  carry a cost per use; a subscription with an allowance covers it and makes revenue predictable.
- **That is not evidence against the 5% on websites.** The website platform's price was decided on
  2026-09-17 (5%, never more than $400) and a flat plan is "under consideration"
  (`PRICING_COMPETITORS.md` §2b). Free to start is the wedge against incumbents that charge $24 to
  $99 a month AND own a marketplace. Reopening it is Peter's call; this paper does not argue it.
- **One conflict to settle.** The AI Front desk is ON by default and free on every tenant site
  since 2026-09-16. If the receptionist becomes a priced product, the included one needs a limit
  (the P45 caps are the natural allowance) and the paid one needs to be more: voice, texts, a
  higher allowance.
- **Know the unit cost before setting the allowance.** A chat message costs about one cent on the
  current model (estimate from P45). A voice minute has not been measured; it is the sum of the
  phone line, the speech services and the model. Measure ten real calls first.
- **Menu**: Products = what Stemfra makes (Websites and booking, AI Front desk, AI Leads);
  Solutions = who it is for (the six business types, and Custom builds as the seventh door);
  Resources = help. Listing the six business types under Products → Websites would put WHO back
  inside WHAT, which is the confusion the visitor's feedback started from.
- **From Vagaro's model, for the AI products**: bill per LOCATION (one front desk = one phone
  line, one set of hours, one knowledge base); let the price follow size through the usage
  allowance rather than through seats (an agent's cost follows conversations, not staff count);
  publish a ceiling; publish single-location prices and route groups to a conversation. For the
  websites: our 5% already scales with size by itself and the $400 cap plays the role of Vagaro's
  seven-calendar cap; what we do not yet state is how the cap applies to an owner with several
  sites (the meter caps per site per month today).
- **Only list what is packaged.** The docs copilot and Stacy are features of our own products
  today. They become products when they have a page, a price and a way to buy.

## 5. Decisions for Peter

1. Menu groups: Products (what) and Solutions (who), or the Websites / Business split.
2. Which AI products go on the pricing page first: Front desk alone, or Front desk and Leads.
3. The unit: minutes and messages, or customers served.
4. The included Front desk on tenant sites: stays free within a cap, or becomes a trial.
5. Trial design: length, and card or no card.
6. Whether the website price is part of this review or stays as decided.

## 6. Websites: commission or subscription? (Peter's open question, 2026-09-30; NOT decided)

Decided since this paper was written: menu = Products / Solutions; Stemfra AI has its own
subscription pricing (owned by the AI session); everything about Stemfra AI on stemfra.com and
the whole menu change wait for card payment (Airwallex, update expected within the week); the
Custom switch on the pricing card may ship now.

What the research says about the WEBSITES product (full table: `PRICING_COMPETITORS.md`):

| For a subscription | For the commission |
|---|---|
| Every direct competitor charges one ($20 to $99 entry; Vagaro $30 to $90 by team size) | Nobody else is free to start and free in a dead month; it is our one line no competitor can copy |
| Revenue is known in advance; profit is "deterministic" (Peter) | Owners never see the mainstream's $250 all-in as a reason to switch; a lower fixed price is not a reason either |
| No metering, no pre-invoice review, no dispute over which booking counts | A subscription at competitor prices ($30 to $90) earns far less than 5% of a busy shop (cap $400) |
| Collects by card automatically once card is live | The 2026-09-24 paper found no owner on a call refusing a percentage |
| A shop with few online bookings still pays | A shop with few online bookings pays almost nothing: revenue depends on adoption we do not control |

Facts that weigh on it:
- We have no paying customer on either model (all charges in the database are demo or test),
  so neither model is proven FOR US. The commission has never been collected once.
- The commission is collected by invoice and bank transfer after the month, from owners who
  were paid in cash or on their own terminal. Collection risk is the model's weak point, and
  nothing in code enforces payment (`STEMFRA_AI_BILLING_INPUT_2026-09.md` B5).
- Card payment changes the balance: a subscription is what a saved card is good at; a
  variable commission can also be charged to a saved card, which would remove most of the
  collection risk without changing the model.

Options:
1. **Keep 5% capped at $400** (decided 2026-09-17) and charge it to a saved card once card is
   live.
2. **Two plans** (the 2026-09-24 proposal): Pay as you go (5%, cap $400) beside Flat rate
   ($399 or $449, 0%).
3. **Subscription only**, Vagaro-style by team size, with a free trial.
4. **Hybrid**: a small base fee plus a lower percentage (Owner.com: $249 + 5%).

Recommendation recorded for the discussion: do not decide before card is live and before the
first ten paying shops; keep option 1 as the default, prepare option 2 as the fallback line on
calls, and count how often a flat price is asked for.

## Sources

Verified on the vendor's own page, 2026-09-29:

- https://glossgenius.com/pricing · https://genius.ai/reception · https://glossgenius.com/ai-business-tools
- https://biz.booksy.com/pricing · https://biz.booksy.com/features/ai-receptionist-beta
- https://www.mindbodyonline.com/business/pricing · https://www.mindbodyonline.com/business/ai-concierge
- https://www.vagaro.com/en-gb/pro/pricing (calculator clicked through, both tabs, FAQ read) ·
  https://www.vagaro.com/en-ca/pro/pricing
- https://www.goodcall.com/pricing
- https://www.intercom.com/pricing
- https://www.squarespace.com · https://www.squarespace.com/feature-index (Peter's screenshots)

Third-party:

- https://www.usecarly.com/blog/vagaro-ai/ (Vagaro's Vera Receptionist price)
- https://koalendar.com/blog/vagaro-pricing · https://pabau.com/blog/vagaro-pricing/ ·
  https://glossgenius.com/blog/vagaro-cost (a competitor's page) ·
  https://www.dothebeauty.com/blog/vagaro-pricing-salon-cost-breakdown (Vagaro US base and add-on prices)
- https://www.plura.ai/articles/ai-receptionist-pricing-2026 · https://trillet.ai/blogs/ai-receptionist-pricing-models-explained
  · https://dapta.ai/blog-posts/ai-receptionist-cost/ (pricing models and the standalone price band)
- https://www.shno.co/marketing-statistics/free-trial-conversion-statistics ·
  https://www.poweredbysearch.com/learn/b2b-saas-trial-conversion-rate-benchmarks/ (trial benchmarks)
