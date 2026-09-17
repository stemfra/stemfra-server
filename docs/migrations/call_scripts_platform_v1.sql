-- call_scripts.platform + one pitch per booking provider (2026-09-17, Peter).
-- A lead whose Google listing points at Booksy / Fresha / Vagaro / Mindbody opens that
-- provider's script by default in the CRM (CallScriptSection bestScript). The pains come
-- from the sourced research in docs/GTM_PLAN_2026-09.md section 9. House rule in every
-- script: ASK about the pain, never state another company's fee as a fact on a call;
-- the figures sit in Comment blocks for the rep only and must be re-checked before quoting.
alter table public.call_scripts add column if not exists platform text;

insert into public.call_scripts (name, vertical, platform, sort, content)
select v.name, null, v.platform, v.sort, v.content from (values
('On Booksy', 'booksy', 10,
$s$Comment: BEFORE YOU DIAL. Open their Google listing and tap Book. Confirm it lands on a Booksy page with a real services menu (their own account). Note their rating and review count: {rating} from {reviews} reviews.

Comment: WHAT BOOKSY OWNERS SAY (for you, do not recite). Booksy costs about $30 a month plus about $20 per extra staff member. Boost, its marketplace feature, takes 30% of a new client's first visit. The complaints we found most: being charged that fee for people who were already their clients (walk-ins, referrals, Instagram followers who booked through the app), and their clients seeing other shops inside the same app. Figures checked September 2026; check again before you quote one.

Me: Hi, is this {business}?

Response: Yeah

Me: Great. My name is {my_name}. I was looking at barbershops and salons with really strong reviews, and yours stood out: {rating} stars from {reviews} people. That takes years. Quick question, I saw your Book button goes to Booksy. How has that been working for you?

Response: (It's fine / It's okay / Don't get me started)

Comment: Let them talk. Whatever they say, ask the next question. This is the common ground.

Me: Can I ask you something other owners tell me about? When one of your regulars books through the app, have you ever been charged a new client fee for someone who was already yours?

Response: (Yes, all the time / I turned Boost off / Not sure)

Me: And when your client opens the app to rebook, do they only see you, or do they see the other shops around you too?

Response: (They see everyone)

Comment: Now the pivot. One idea only: the clients are theirs, the storefront is not.

Me: That's the part I wanted to talk about. With {reviews} reviews, people are searching for YOU by name. Right now that search ends on a page Booksy owns. I built {business} its own website, on your own address, with booking on it, so the people who look for you book with you, and the client list stays yours. It also brings back clients who have not visited in a while and asks every visit for a Google review.

Response: What does it cost?

Me: Nothing to claim it and no monthly plan. We earn 5% of what is booked through the site, so we only earn when you do. And we move your services, prices and client list over for you. You do not rebuild anything.

Comment: If they ask "is 5% more than I pay now?": be straight. "On a busy month it can be. What you get for it is your own site, the win-back and review tools and someone who runs it for you. Look at the site first, then decide." Do not promise a cap; pricing for high-volume shops is under review.

Me: Let me send you the site so you can see it. Should I text it to this number or email it?

Comment: They said yes: Send Claim from the drawer. Note in Activity: on Booksy, Boost on or off, what they complained about.$s$),

('On Fresha', 'fresha', 11,
$s$Comment: BEFORE YOU DIAL. Tap Book on their Google listing. If the Fresha page has a services menu with prices and a Book button, it is their real account: use this script. If it shows a grey "not affiliated" notice and only "Call to book", use the script "Fresha listing, not theirs" instead.

Comment: WHAT FRESHA OWNERS SAY (for you, do not recite). Fresha was free for years and now charges a monthly fee per team member (about $15 to $20), plus a one-time 20% fee on new clients from its marketplace, plus paid extras (text messages beyond the free quota, loyalty, the rating booster). The complaints we found most: the end of "free forever" at short notice, the 20% fee landing on clients the salon brought in itself from Instagram or Google, and slow support when a payout is held. Figures checked September 2026; check again before you quote one.

Me: Hi, is this {business}?

Response: Yeah

Me: Great. My name is {my_name}. I was looking at salons with really strong reviews and yours stood out: {rating} stars from {reviews} people. I saw you take bookings on Fresha. How long have you been with them?

Response: (A few years / Since it was free)

Me: That's what I hear a lot. Were you on it back when it was free? How did the change to paying per team member land with you?

Response: (They react)

Comment: Let them talk. Then one more question.

Me: And the new client fee: have you ever paid it on someone who found you on your own Instagram or Google and just booked through the link?

Response: (Yes / Probably / I never checked)

Me: Here is why I called. With {reviews} reviews, people look for you by name. Today that search ends on a page Fresha owns, next to other salons. I built {business} its own website, on your own address, with booking on it. The people who look for you book with you, the client list stays yours, and it brings back clients who have gone quiet and asks every visit for a Google review.

Response: What does it cost?

Me: Nothing to claim and no monthly plan, no per-seat fee, no paid add-ons. We earn 5% of what is booked through the site. And we move your services, prices and clients over for you.

Comment: If they ask "is 5% more than I pay now?": be straight. "On a busy month it can be. There is no fee per team member and no extras, and you own the site and the client list. Look at it first, then decide." Do not promise a cap.

Me: Let me send you the site. Text to this number, or email?

Comment: They said yes: Send Claim from the drawer. Note in Activity what they said about the fees.$s$),

('On Mindbody', 'mindbody', 12,
$s$Comment: BEFORE YOU DIAL. Studios and gyms mostly. Confirm the Book or Schedule link on their listing goes to a Mindbody page (clients.mindbodyonline.com or the Mindbody app).

Comment: WHAT MINDBODY OWNERS SAY (for you, do not recite). Contracts run 12, 24 or 36 months and renew automatically unless cancelled 30 days before the end; plans start around $79 a month per location and owners report far higher bills after the first term. The best documented complaints anywhere in our research: not being able to cancel, renewals nobody expected, price rises, a dated and click-heavy system, and first-line support that is hard to reach. Mindbody's own blog names the four reasons owners switch: cost against value, hard-to-use software, poor support, and hard exits. Figures checked September 2026.

Comment: IMPORTANT. Many of these owners are locked in a contract. Do not tell them to break it. The first question finds out where they are in the term.

Me: Hi, is this {business}?

Response: Yeah

Me: Great. My name is {my_name}. I was looking at studios with really strong reviews and yours stood out: {rating} stars from {reviews} people. I saw your schedule runs on Mindbody. Can I ask, are you on a contract with them, and do you know when it renews?

Response: (Yes, renews in … / Not sure / Month to month)

Comment: Write the renewal month in the follow-up note. That date is the whole deal.

Me: How do you feel about what you pay for what you get? And how is it for your front desk and your members to use?

Response: (They react: expensive / clunky / support is slow)

Me: I hear that a lot. Here is why I called. I built {business} its own website, on your own address, with class booking and memberships on it, made to be simple for members. No contract at all, you can leave any month and take your data with you. It also brings back members who stopped coming and asks for Google reviews after visits.

Response: What does it cost?

Me: Nothing to claim it, no monthly plan, no contract. We earn 5% of what is booked through the site. And when you are ready we move your classes, prices and member list over for you.

Comment: If they are mid-contract: "Then let's not touch that. Look at the site now, and we time the move for your renewal date so you never pay twice." Set the follow-up 60 days before their renewal.

Comment: If they ask "is 5% more than I pay now?": be straight. "For a busy studio it can be close to what you pay today. The difference is no contract, no price jump at renewal, and a person who picks up." Do not promise a cap.

Me: Let me send you the site so you can see it. Text to this number, or email?

Comment: They said yes: Send Claim from the drawer. Activity note: contract end date, what they pay, what they dislike.$s$),

('On Vagaro', 'vagaro', 13,
$s$Comment: BEFORE YOU DIAL. Tap Book on their Google listing and confirm it lands on their Vagaro page.

Comment: WHAT VAGARO OWNERS SAY (for you, do not recite). The base plan is about $30 a month, then about $10 more per extra calendar (each staff member who takes bookings), and the useful parts are paid add-ons: their website builder about $20, forms $10, text marketing from $20, a branded app $100. Owners describe a $30 plan turning into $100 to $200 a month. The second common complaint: a client must create a Vagaro account before they can book, and some new clients give up at that step. Figures checked September 2026; check again before you quote one.

Me: Hi, is this {business}?

Response: Yeah

Me: Great. My name is {my_name}. I was looking at shops with really strong reviews and yours stood out: {rating} stars from {reviews} people. I saw you book through Vagaro. How many of you are on it?

Response: (Three of us / Just me)

Me: Got it. Can I ask what the bill comes to once you add each person and the extras like texts and the website?

Response: (More than I expected / Around …)

Me: And a new client booking for the first time: do they have to make a Vagaro account first? Have you ever lost one at that step?

Response: (Yes / People complain about it)

Me: Here is why I called. With {reviews} reviews, people look for you by name. I built {business} its own website, on your own address, where a new client books in under a minute without creating an account anywhere. Everyone on your team is included, the website is included, reminders are included. It also brings back clients who have gone quiet and asks every visit for a Google review.

Response: What does it cost?

Me: Nothing to claim, no monthly plan, nothing per person, no add-ons. We earn 5% of what is booked through the site. And we move your services, prices and clients over for you.

Comment: If they ask "is 5% more than I pay now?": be straight. "On a busy month it can be. Everything is included and you own the site and the client list. Look at it first, then decide." Do not promise a cap.

Me: Let me send you the site. Text to this number, or email?

Comment: They said yes: Send Claim from the drawer. Note in Activity: team size, monthly bill, the account complaint if they raised it.$s$),

('On another booking tool', 'other', 14,
$s$Comment: For Square, GlossGenius, StyleSeat, Schedulicity, Acuity, Setmore, theCut, Boulevard and the rest. Tap Book on their listing first so you know what the client sees. {platform} is the tool's name.

Me: Hi, is this {business}?

Response: Yeah

Me: Great. My name is {my_name}. I was looking at shops with really strong reviews and yours stood out: {rating} stars from {reviews} people. I saw your Book button goes to {platform}. How is that working for you?

Response: (Fine / It does the job / Complaints)

Me: Good to hear. One thing I noticed: when someone searches for {business} by name, they land on a {platform} page, not on a site that is yours. Do you have a website of your own anywhere?

Response: No / Just Instagram

Me: That is why I called. I built {business} its own website, on your own address, with booking on it, so the people who look for you by name land on your brand. It also brings back clients who have gone quiet and asks every visit for a Google review, which is what moves you up on Google Maps.

Response: What does it cost?

Me: Nothing to claim and no monthly plan. We earn 5% of what is booked through the site, so we only earn when you do. And we set it up with your services and prices for you.

Me: Let me send you the site so you can see it. Text to this number, or email?

Comment: They said yes: Send Claim from the drawer.$s$)
) as v(name, platform, sort, content)
where not exists (select 1 from public.call_scripts c where c.platform = v.platform);
