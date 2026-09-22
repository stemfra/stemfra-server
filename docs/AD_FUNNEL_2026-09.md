# Ad funnel and creative v1 (2026-09-22, agreed direction; nothing running)

_Peter took Gemini's suggestion of an ad whose call to action is "See what your business looks
like ... in 60 seconds" (`GEMINI_EVALUATION_2026-09-22.md`). This doc turns it into something we
can run truthfully. Rules: no em-dash, "Stemfra" sentence case, no claim the product cannot keep
today (the Front Desk is a chat widget, priced services book on the booking page, there is no
tenant voice agent), the cap wording as on the site, never "pay on success"._

## 1. What "60 seconds" would have to mean

Today an owner who taps an ad lands on `/claim` (generic by design, P35) or `/start`, signs up,
and walks a four-step wizard. That is minutes, not 60 seconds, and nothing on it is personal
until the wizard is done. The 60-second promise is only true once **P27 claim prefill** exists
end to end: business name + city typed on the landing page → our Places lookup (already built for
the wizard) → a preview of the vertical demo carrying THEIR name, address, hours, photos and
services → "Claim it". P35's rule stays: no fake "reserved for you" countdown; a preview built
from their public data is a different thing from a claim of readiness.

Until P27 ships, the honest CTA is "See a live site built for a shop like yours" (the vertical
demo). Both versions are written below; run version A now, switch to B when P27 is live.

## 2. Captions and hooks (vertical video, 15 to 30 s)

Version A (truthful today):
1. "Your shop deserves its own website. We build it for you, free to claim."
2. "Still booking by DM? Your clients could book you on your own site."
3. "A website built for you. Barbershops, salons, studios and spas."
4. "No monthly plan. 5% when it books, never more than $400 a month."

Version B (after P27):
5. "See your shop on its own website in 60 seconds."
6. "Type your shop's name. See the website we would build you."

Do not use: "AI receptionist that answers your phone", "we only earn if we bring you clients",
"pay on success", "performance fee", "reserved for you", any deadline.

## 3. Script, 25 seconds, screen-recorded (no actors)

0 to 3 s: phone screen, a salon's Instagram bio, "DM to book". Caption: "Still booking by DM?"
3 to 10 s: the salon demo site on a phone, scroll, tap Book, pick a service, pick a time, done.
Caption: "Your own site. Your name on the door. Clients see only you."
10 to 17 s: the Front Desk chat answering "Do you do balayage on Saturdays?" with the real
answer from the site's services and hours, then offering the booking page. Caption: "A front
desk that answers while you work." (chat, not phone)
17 to 22 s: the pricing line. Caption: "Free to claim. No monthly plan. 5% when it books,
never more than $400 a month."
22 to 25 s: logo. Caption (A): "See a live site built for a shop like yours." (B): "See yours in
60 seconds." CTA button: Sign up.

## 4. Instant Form (Lead generation objective)

Fields: business name, first name, phone (pre-filled), email, city. One question, single choice:
"How do clients book you today?" (Instagram / DM, Booksy, Fresha, Vagaro, another app, by phone,
we have a website). Thank-you screen: "We will call you within one business day" with the demo
link. Leads go to the CRM as source `tiktok_lead_form` with the answer in `qualification.
booking_platform`, then the normal calling flow. Owners who answer "we have a website" are
outside the target and get the A1b-free path (no site build pitch).

## 5. Before any spend

- Meta pilot first ($300, owner targeting exists there). TikTok stays at the $20 balance.
- Pixel on stemfra.com with a `CompleteRegistration` event on `/start` success, and the domain
  verified in the Business Center, so the Website form objective becomes possible later.
- P27 steps 2 and 3 for version B.
- Funnel tracking: `utm_source=tiktok&utm_medium=paid&utm_campaign=<name>` on every link, and the
  landing page records it on the lead.

## Sources
- `GEMINI_EVALUATION_2026-09-22.md` (the "60 seconds" idea and our verdict).
- TikTok lead generation objective: https://ads.tiktok.com/help/article/lead-generation-objective
- TikTok Instant Form setup: https://ads.tiktok.com/help/article/set-up-lead-generation-with-instant-form
- TikTok Pixel: https://ads.tiktok.com/help/article/get-started-pixel
- B2B cost per lead benchmarks 2026: https://adliftr.com/blog/tiktok-ads-cost-benchmarks-2026 ,
  https://yellow-octo.com/blog/tiktok-ads-b2b-lead-generation/
- Our own: `GTM_PLAN_2026-09.md`, `PRICING_COMPETITORS.md`, ROADMAP P27 / P35 / P43.
