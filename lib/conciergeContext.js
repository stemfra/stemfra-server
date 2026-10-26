// Chat product knowledge, reconciled with current marketing offers 2026-10-26.
// Voice knowledge below remains isolated pending the voice integration hold.
function buildConciergeContext() {
  return {
    company: { name: 'Stemfra', what: 'Stemfra LLC provides managed websites, Stemfra AI and custom software for businesses.' },
    websites: {
      price_usd_month: 299, trial_days: 14, setup_fee: 0, booking_commission: 0,
      terms: 'The advertised offer includes 14 days free, no card required, then $299/month. Payment is by bank-transfer invoice; the paid month starts when payment is confirmed. For getting started, direct visitors to the templates gallery at /templates to choose a design based on their business needs. A consultation is not required for a standard managed website. Offer a consultation only for custom website requirements or an explicit request to speak with the team.',
      internal_guardrails: 'Do not promise immediate trial activation or online checkout. These are internal constraints, not introductory customer copy. Do not describe the signup or billing journey as a preview. Give the available next step instead.',
      included: ['Branded website', 'Online booking and website AI Front Desk', 'Setup help', 'Hosting, security and maintenance', 'Routine website updates', 'Owner dashboard and client management', 'Email and chat support'],
      verticals: ['Barbershops', 'Beauty salons', 'CrossFit and fitness studios', 'Yoga and Pilates studios', 'Massage and bodywork', 'Spas'],
      limits: ['Domain purchases are separate.', 'Existing feature availability restrictions apply. Do not promise SMS, card processing or other integrations are active for every customer.', 'Existing booking systems can be linked; do not promise two-way sync or guaranteed embedded widgets.', 'Discuss data import requirements with the team; do not promise every migration is included or automatic.'],
      retired_offer: 'The former free website with 5% commission capped at $400 is not the current advertised offer. Do not repeat it as current pricing or assume existing customers have been migrated.'
    },
    ai: {
      description: 'A separate subscription business workspace for customer enquiries, inbox organization, client and appointment management, documents and AI-assisted prospect research, with human review controls.',
      plans: [{name:'Starter',monthly_usd:100,annual_usd:1000,seats:5,monthly_credits:2000},{name:'Growth',monthly_usd:200,annual_usd:2000,seats:10,monthly_credits:5000},{name:'Business',monthly_usd:300,annual_usd:3000,seats:25,monthly_credits:10000}],
      terms: 'Annual payment covers twelve months for ten monthly payments, paid upfront. Credits remain monthly allowances. Taxes are excluded. Online checkout is disabled; contact support about a plan. The standalone AI workspace is separate from the Front Desk included in the website plan.'
    },
    custom_software: { starting_price_usd:10000, unit:'per project', terms:'Scope, final price and delivery milestones are agreed before development. Hosting, maintenance and ongoing support are quoted separately where required. Arrange a consultation to discuss requirements.' },
    guidance: 'Ask which product the visitor means when ambiguous. Route by product and readiness. Never promise free forever, an active checkout, guaranteed results or unsupported features. Use current knowledge over historical chat pricing. Do not use em dashes. For help requests, answer only verified information and offer support rather than inventing dashboard instructions.',
    links: { websites:'/websites', ai:'/ai', software:'/custom-software', pricing:'/pricing', examples:'/templates', contact:'/contact', help:'/docs' }
  };
}

// Compact, SPOKEN-language version of the knowledge for Stemfra Voice. The chat
// Concierge can afford the full JSON context; on a live phone call that JSON is
// tokens the model must read before EVERY reply — measurable added latency. Same
// facts as buildConciergeContext(), distilled to a tight brief.
// ⚠ KEEP IN SYNC with buildConciergeContext() above (commission model).
function buildVoiceKnowledge() {
  return [
    'STEMFRA — what to know (speak it naturally in your own words, never read this list aloud):',
    '- Stemfra builds and runs a done-for-you website with built-in booking, an AI front desk and text and email alerts for local service businesses: barbershops, salons, CrossFit and fitness, yoga and pilates, massage and spas. We design it, set it up and import your data; you run it from one simple dashboard, or ask Stacy, our AI assistant, to do it for you.',
    '- The website is free: no setup fee, no monthly fee, and no contract. Instead, Stemfra earns a flat five percent commission on the sales you make through your site, so we only earn when you do. Everyone gets every feature; there are no tiers.',
    '- The five percent applies to the sales through the site: bookings you mark as collected at the visit, memberships, packs and drop-ins. Walk-ins and phone bookings you type into your own calendar carry no commission, they only keep your availability accurate. Tips and taxes are never counted, and refunds reverse the commission. We bill it once a month by invoice that you pay by bank transfer. Booking is book now, pay at the business, so Stemfra never touches your money; online card payments will come later as an option.',
    '- Prospects we email get a personal page at stemfra dot com slash claim, where they can try the live sample website and claim it in about a minute; their name, photos, prices and hours go on when they claim. If someone asks for the link, offer to resend the email.',
    '- Getting started: you can start free and preview your real site before anything goes live; we set it up and import your existing client data; Stacy helps you fill in your services, prices, team and hours; then you publish to go live on your free custom web address, or on your own domain, which you can bring or buy from the dashboard. You can keep your current system, like Mindbody or Wodify, and switch at your own pace.',
    '- To move forward: point them to get started free at stemfra dot com, or offer to take their details so a teammate follows up.',
  ].join('\n');
}

module.exports = { buildConciergeContext, buildVoiceKnowledge };
