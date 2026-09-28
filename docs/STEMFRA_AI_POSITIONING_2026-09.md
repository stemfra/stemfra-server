# Stemfra AI: productised subscription, custom agency, or the model in between (2026-09-24)

_Working paper for Peter's question of 2026-09-24: "should we still offer Stemfra AI as a
subscription-based productised offer like the website platform, or target only clients that need
custom AI automation and deliver at agency pricing?" Written by the websites session; the Stemfra AI
session owns the runtime and its docs (`stemfra_ai/docs/`). Sources at the end, tagged._

## 1. What the three job descriptions signal

Peter's file "AI Agent Job descriptions.docx" (three postings, all Russian-market, all 2026):

| Posting | Who | What they actually want | Signal |
|---|---|---|---|
| Dnevnik.ru (EdTech, top-10 education platform) | In-house AI agent engineer | Design and orchestrate LLM agents on their own infrastructure: routing, memory, tool calling, vector DB (Chroma / Weaviate / Pinecone), interfaces to internal APIs and knowledge stores | A large product company builds in-house; not a buyer of a SaaS agent, and not an agency client either |
| MTRC (medical market-access consultancy, ~ISO-certified, remote team) | Part-time IT generalist, 20 to 30 h a month, 1,500 to 2,500 RUB an hour (about $400 to $900 a month) | Automate internal processes with n8n / Make: an AI assistant over the internal knowledge base, onboarding automation, meeting transcription and summaries, plus routine IT admin | The mid-market buys HOURS for a bundle of small automations; the budget is a part-time salary, and the tools named are the productised ones (n8n, Make, ChatGPT Enterprise) |
| Doczilla (LegalTech, document automation) | Developer to maintain and extend an existing LangChain / RAG / MCP service, deploy at clients including local models | Keep a bespoke AI pipeline alive and growing; "understand an existing solution, find out why it breaks" | A vertical software company that already productised its own agent; its cost is maintenance, not invention |

Common thread: none of the three wants "an AI agent" as a category. Each wants a specific job done
inside its own data and tools, and each has priced that job as people time (a hire, a part-timer).
The stack they name (n8n / Make, LangChain, RAG, vector DB, MCP) is exactly what the Stemfra AI
runtime already packages.

## 2. What the market says (checked 2026-09-24)

**Productised AI front desk / receptionist SaaS is crowded and cheap.** Frontdesk (ex My AI Front
Desk) free tier then $65 to $99 a month, Goodcall $59, Dialzara $29 (60 minutes) to $349 (1,000
minutes), Rosie and AIRA in the $25 to $199 band, Smith.ai (AI + humans) from about $292 (third-party
comparisons, 2026). Selling Front Desk standalone means paid ads and cold outreach against dozens of
$65 products, the same grind as the websites, with a weaker visual hook.

**Custom AI automation is priced like an agency, and buyers come inbound.** Retainers for small
businesses run $1,000 to $3,500 a month for two or three workflows, $4,000 to $10,000 for mid-market
stacks; a single-workflow build $5,000 to $15,000; n8n / Make workflow builds $1,500 to $7,500 with
$300 to $1,500 a month managed; specialist hourly $95 to $235; the 2026 default engagement is a
fixed-fee first build plus a small monthly retainer (third-party rate cards and buyer guides, 2026).
Upwork's In-Demand Skills 2026 release: demand for top AI skills more than doubled year on year
(about +109%), AI integration and automation about +90%, AI chatbot development about +71%; roughly
4,000 AI / automation jobs posted in a 30-day window, paying above the platform median (Upwork's
figures as quoted from its release in search results, the release page timed out on fetch; job count
from the third-party Upwatcher analysis). The buyer posts the need; nobody has to call a barber.

**SMBs do not buy "AI agents", they buy a solved job.** Agentic adoption among smaller organisations
flat at 22% (McKinsey 2026 survey, third-party citation); 77% of non-adopters see no applicable use
case (SBA 2025, third-party citation); top barriers integration with existing systems 46%,
implementation cost 43%, data access and quality 42%. Practitioner consensus: the common case takes
a weekend, "the 20% edge cases eat 80% of the effort".

**Margins depend on reuse, not on the label.** Productised offers carry 60 to 80% gross margin
versus 45 to 55% for pure custom work; productised AI-ops firms target 60 to 75% of delivery hours
producing reusable IP, consulting firms 10 to 20% (third-party, 2026). The margin comes from AI
doing the delivery and from templates, not from calling it a product.

**Our own lesson (websites, Sep 2026):** outbound to SMB owners reached about 3% of the cohort; on
the calls that connected, price was never the objection, the product framing was (GTM plan §1).
Repeating that motion for a second product with no visual demo is the risk Peter names.

## 3. The answer: a productised agency on the runtime, not a SaaS and not a bespoke shop

The runtime's own design already decides this. Spec principle 1: "one canonical build, multi-tenant
by configuration, no per-tenant workflow artifacts"; §7.5: a questionnaire produces a **Recipe**
(configuration, not code) that is also the capability allowlist. That is the productisation lever.
The sales motion, though, should be the agency's: scoped outcomes, inbound demand, a build fee plus
a run fee.

**What we sell:** named Recipes, each a job to be done, delivered on the runtime and priced as a
fixed build plus a monthly run fee. The Recipe is the product; the client's data, tools and edge
cases are the service. Three to start, chosen for existing connectors and proof:

1. **Leads** (outbound lead finding + drafting + CRM), proven on Helen's UK short-let persona
   (`stemfra_ai/docs/LEADS_PRODUCT_PLAN.md`): US and UK variants are the same Recipe with a different
   pool, persona and compliance footer (the CASL / PECR work already exists on the server).
2. **Front Desk** (inbound chat + email, KB, bookings, lead capture, handoff), built and deployed at
   ai.stemfra.com; standalone for businesses that already own a site, included for Stemfra tenants.
3. **Document intake and qualification** (the Doczilla / law-firm / HR-screening shape): file-upload
   and website ingestion, KB search, Postgres/Notion readers and the email channel already exist;
   the Recipe adds the extraction schema and the review queue. This is the one that needs a scoping
   milestone in the AI roadmap before it is sold.

**Pricing shape (market-anchored, to confirm with the AI session's cost data):**

| Recipe | Build (fixed, scoped) | Run (monthly) | Notes |
|---|---|---|---|
| Front Desk standalone | $500 to $1,500 | $99 to $299 | Above the $65 SaaS crowd because it is set up for them (persona, KB, bookings, handoff) and includes email |
| Leads | $1,500 to $3,500 | $300 to $900 | Usage-guarded (spend guards exist); the retainer band small businesses already pay for two or three workflows |
| Document intake | $2,500 to $7,500 | $300 to $1,500 | Single-workflow build band; scope by document types and volume |
| Anything outside a Recipe | quote, minimum $5,000 | $1,000+ | Only if it becomes a Recipe; never per-client code (spec rule) |

Two rules that keep the margin: every engagement ends as a reusable Recipe (target 60 to 75% reuse
from the third client on), and nothing is built outside the runtime.

**Where the clients come from (different from the websites):** Upwork and LinkedIn inbound (the
demand growth above), Helen as tenant #1 and case study, referrals from the six-vertical tenants
once they use Front Desk, and the recipe pages on ai.stemfra.com as the landing surface. No cold
calling of SMB owners for this product.

**What not to do:** a self-serve SaaS marketing push for Front Desk against the $65 tier; bespoke
code per client (the tKle anti-pattern the spec rejects); a voice receptionist claim before voice
is in the runtime (Gemini evaluation verdict, 2026-09-22).

## 3b. Evidence round two (2026-09-24, afternoon): three videos, Upwork, one Facebook ad

Videos watched with the watch skill; transcripts and notes in `stemfra_video/<id>/`.

- **Germanaicreator, "How Claude Code got me a sales call in 24 hours"** (23 min): a solo AI
  consultant scrapes Indeed job posts for "AI automation / n8n / Claude Code" with Apify (a company
  hiring for the role is a buying signal), scores each company against his offer with GPT-4o
  (threshold 70, rationale, enterprises scored 0), enriches CEO / LinkedIn / email above threshold
  (Apify Google search, "1 cent per result"), drafts three LinkedIn messages and three emails, and
  works them in a local CRM with the job post beside the pitches. Run shown: 100 scraped, 94 already
  in his CRM, 5 qualified. His rule: selection and sending stay manual; automated outreach "reads as
  rubbish". **This is the Leads Recipe with a hiring-signal pool, and it is how Stemfra AI finds its
  own clients:** companies posting AI-automation jobs (Peter's three job descriptions are that pool)
  are prospects for a productised alternative to a hire.
- **Harry Long, "Connect Claude to LinkedIn"** (10 min): the Claude Chrome extension drives the
  LinkedIn tab; three jobs: personalised DMs from a profile read, posts in the author's voice, inbox
  triage (40 to 50 DMs a day into hot / later / dead). No API: LinkedIn work stays browser-driven and
  human-paced. Inbox triage over email is a small Recipe on our existing IMAP channel.
- **LinkedGrow** (35 s, silent): a LinkedIn-posts SaaS where the customer pastes their OWN
  OpenAI / Anthropic / Gemini key ("$0.01/post, ~$0.30/mo for 30 posts", "you only pay what you use
  directly to the provider"). Bring-your-own-key removes token risk from a flat plan; the runtime's
  tenant-secret credential lane already fits it.
- **Upwork's "Hire talent" menu** (Peter's screenshots): the AI & Automation category is split into
  labels, not products: AI Integration Developers ("connect AI to your existing tools"), Chatbot
  developers ("build AI for support and sales"), Automation Experts ("streamline your business
  processes"), N8N Experts, Claude Experts, AI Consultants, Vibe Coders; popular searches "AI chatbot
  developer for support automation", "Automation expert for n8n workflows". Buyers search for a
  person to do a named job. Our product pages should carry those names.
- **CraftLogic ad in "Salon & Spa Owners USA"** (a Pakistan-based agency, WhatsApp number, Gmail
  address, generic "ideas into real websites"): the commodity floor of the websites market, and a
  reminder that a group post with no vertical proof is noise. Not a threat to Stemfra AI; a caution
  about how not to present it.

**Answer to "several standalone products, like the templates?"** Yes, and the shape is already in
the Leads plan: pool × persona × territory × channel. Catalogue for the first year, each a Recipe
with a name a buyer would type:

| Product (Recipe) | Job it does | Pool / channel | Status |
|---|---|---|---|
| Front Desk | Answers, books, captures leads, hands off, on web chat + email | Any business with a site; included for Stemfra tenants | Built, deployed |
| Leads: local businesses | Finds and drafts to shops with a weak web presence | Google Maps (the platform's own pipeline) | Built (server native lead-gen) |
| Leads: construction (UK) | Finds active projects for accommodation, trades, suppliers | Helen's persona and data | Pilot proven; tenant #1 |
| Leads: hiring signals | Finds companies hiring for the job your service replaces | Indeed / LinkedIn Jobs via Apify | One connector away; also our own prospecting |
| Inbox triage | Sorts an inbox into act now / later / ignore, drafts replies | IMAP (exists) | Small; after the first paying Recipe |
| Document intake | Extracts and qualifies documents (legal, HR screening) | File upload + KB (exist) | Needs a scoping milestone |

**Marketing pages:** one domain, ai.stemfra.com, a hub plus one page per Recipe, the same way
stemfra.com has one Solutions page per vertical (`seo.js` single source, prerendered). Each page is
named for the job in Upwork's words, shows the flow the questionnaire produces (the Recipe rendered
readable), a demo, the build + run price, and an intake form. Separate domains per product would
split the small traffic and the trust; separate pages give each product its own search intent and
its own Upwork / LinkedIn listing twin. The AI session owns `packages/web`; the page pattern to copy
is the websites' Solutions page.

## 3c. Live job-market check (2026-09-24, Peter's LinkedIn via the Chrome extension + one Ashby posting)

Read-only: searches and postings opened, nothing sent, saved or applied. Past-week filter.

| Search | Results | What the top cards were |
|---|---|---|
| "AI agent developer", US | 1,068 | Mostly promoted startup roles (Founding AI Engineer $200K, Member of Technical Staff, Product Engineer AI); noisy, includes VMware and hardware roles |
| "AI automation" (exact), US | 152 | Ordinary companies hiring ONE in-house person: SONIFI (hospitality tech), SIXT (car rental), D.A. Davidson (financial services), Braze, Bennett Thrasher (accounting firm, intern), Quantum Sky; the "more jobs" rail added Carlyle, The Bancorp (Wilmington DE), RBC, Moderna, Ford, Invesco, Bluevine, Lantern, Avatardesk |
| "AI automation" (exact), UK | 24 | William Grant & Sons (distiller), Checkout.com, Klipboard, Auth21 (consultancy, two offices), a £60 to 70K "AI Automation Trainer / Coach", a £90 to 120K PM at an "AI automation startup" |
| "n8n", US | 13 | Ten of them are n8n's own sales and success hires; one real buyer: Simplex (Austin) |

Postings read in full:

- **SONIFI Solutions (hospitality tech, 501 to 1,000 staff), "AI & Automation Lead", Sioux Falls, on-site, 7+ years.** "Not a strategy-only AI role": evaluate workflows with process owners, pick the approach (native features, deterministic automation, integration, low-code, or applied AI), build with Python/JS, REST APIs, OAuth, webhooks, "Power Automate, Zapier, Make or equivalent" plus "LLM-enabled workflows using Claude, OpenAI or similar", integrate Salesforce, NetSuite, Microsoft 365, SharePoint, Teams; controls: human approval points, exception handling, retries, logging, audit trails, credential management, rollback. **Success = "deploy 3 to 5 production-ready workflows within the first six months"** with measured labour hours, cycle time, data quality. 74 applicants in 6 days.
- **Simplex (Austin, HR / recruiting tech client), "Junior IT Systems and Business Automation Specialist, n8n", $80K rising to $110K over two years, on-site.** Build and maintain workflow automations "using n8n, AI coding tools and custom integrations"; existing automations named: internal reporting digests, client call summarisation; plus IT support, M365 admin, SOC 2 / ISO 27001 support. Over 100 applicants.
- **Xcede (recruiter) for a "Founding AI Engineer" = a Forward Deployed Engineer, New York, $200K, travel up to 50%:** lead customer deployments "balancing customization with reuse", build "tools, playbooks and processes that improve deployment efficiency". 100 applicants in 4 days.
- **G2i (Ashby) for Vallor, "Senior/Staff TypeScript Engineer", remote Europe, $100 to 140K (up to $200K):** an 11-person "AI coworker for procurement, legal and sales" that reviews contracts and integrates with ERPs, contract platforms, email; wants forward-deployed experience with enterprise customers, SAP / NetSuite / Salesforce / Microsoft 365 / Slack integrations, "use AI coding agents extensively".

**What this adds to the picture.**
1. The buyer of "3 to 5 production workflows in six months" exists and is an ordinary company, not a tech company: a hotel-tech firm, a car-rental firm, an accountancy, a distiller, a regional bank. They are hiring a person at $80K to $200K plus benefits to do what a Recipe delivers, and each posting lists the same integration targets (Salesforce, NetSuite, Microsoft 365, SharePoint) and the same controls (approval points, audit trails, credential management) the runtime already has as principles.
2. The word on the market is "AI & Automation" (Lead, Engineer, Specialist), not "AI agent". Page names and Upwork listings should say "AI & automation" first.
3. Every posting had 74 to 100+ applicants within days: the hiring route is crowded and slow for the company, which is the opening for "a scoped build in weeks at a fraction of a salary". SONIFI's own success metric is the sales pitch: "your first three workflows, in production, with monitoring and an owner, in 90 days."
4. The hiring-signal pool is real and searchable today: two exact-phrase searches gave 152 US and 24 UK companies in one week. Indeed / LinkedIn Jobs via Apify, scored against a persona ("hires an automation person, names our integration targets, is not a tech vendor"), is the Leads Recipe that finds Stemfra AI's own clients.
5. The n8n search is a caution: the tool's name pulls the vendor's own hiring, not buyers. Search the job, not the tool.

**On the Oumi post ("Don't rent your AI. Build it. Own it. Compound it.")**: an enterprise argument for training specialised models on proprietary data (the poster sells that factory). It is the opposite end of our market: an SMB has no model to own and no data to compound yet; what it wants is the workflow. Two things carry over: the sovereignty worry is real at the mid-market (a bank or distiller will ask where its data goes: the runtime's per-tenant vault, redaction and read-only DB rules are the answer), and the model adapter with open-weight routes (DeepSeek, gpt-oss via DeepInfra) is our cheap version of "not renting from one lab". Not a positioning to copy.

Sources: LinkedIn job searches and postings opened on 2026-09-24 in Peter's session (job ids 4457265815 SONIFI, 4432464199 Simplex, 4468409296 Xcede, 4452478853 SIXT; search URLs with `f_TPR=r604800`); https://jobs.ashbyhq.com/g2i/e2b998c8-7b32-4964-997c-93f1422ddff3 (Vallor via G2i); the Oumi LinkedIn post as pasted by Peter (lnkd.in/gDCkJnKr).

## 3d. The workflows that matter, in plain words (from every finding above)

Each line = what the workflow does for the client, then the evidence and what the runtime has.

**Sell first (evidence strongest, runtime ready or nearly):**
1. **Inbound front desk.** Answers customer questions from the business's own material, books
   appointments on its calendar, captures the visitor's name and contact as a lead, hands off to a
   person when it cannot answer, on web chat and email. Evidence: Upwork's "AI chatbot developer for
   support automation"; every Stemfra tenant. Runtime: built and deployed.
2. **Hiring-signal lead finder.** Every morning, collects job posts for chosen roles and regions,
   scores each company against what the client sells, finds the decision-maker's name, email and
   LinkedIn for the ones above the bar, drafts three messages, skips companies already in the CRM,
   and queues everything for a human to approve. Never sends on its own. Evidence: the German
   consultant's system; 176 companies found in one week for our own use. Runtime: Apify + scoring
   + drafting exist on the server; the job-board pool is the missing piece.
3. **Inbox triage with drafted replies.** Reads a shared inbox, sorts each thread into act now,
   later or ignore, summarises long threads, drafts a reply for approval and flags hot leads.
   Evidence: Harry Long's DM triage (40 to 50 a day), MTRC's "AI assistant" ask, our own email and
   SMS reply drafts. Runtime: IMAP channel, drafting and handoff exist.

**Sell second (evidence strong, one connector or one scoping step away):**
4. **Reporting digests and call or meeting summaries.** A daily or weekly digest of what happened
   (bookings, leads, tickets, sales) sent to the owner; calls and meetings transcribed into notes
   and action items pushed to the CRM. Evidence: Simplex ("internal reporting digests, client call
   summarisation"), MTRC ("meeting transcription and summarisation"). Runtime: transcription exists
   on the Stemfra server for calls; a recurring digest job is a small Recipe.
5. **Internal knowledge assistant and onboarding.** Staff ask questions about policies, procedures
   and products and get answers from the company's own documents, in chat or Teams or Slack; new
   hires get a guided onboarding checklist. Evidence: MTRC's posting word for word. Runtime: KB
   pipeline (files, websites, Notion) exists; Slack and Teams channels are Phase 2.
6. **Local-business and construction lead finders.** The pools that already run: Google Maps
   businesses with a weak web presence (the platform's native lead-gen) and UK construction
   projects for accommodation, trades and suppliers (Helen). Runtime: built; productise as Recipes.

**Sell third (real demand, needs scoping and connector breadth):**
7. **Document intake and qualification.** Receives documents (contracts, CVs, claims, applications),
   extracts the fields, classifies, flags risks, routes to the right person, with a review queue.
   Evidence: Doczilla, Vallor's contract review, HR CV screening. Runtime: file ingestion and KB
   exist; the extraction schema and review queue need a scoping milestone.
8. **Cross-system automations with approval points.** "When X happens in Salesforce, do Y in
   NetSuite or Microsoft 365", with human approval steps, exception handling, logs and audit trails.
   Evidence: SONIFI's whole posting ("3 to 5 production workflows in six months"). This is where the
   agency money is ($5,000 to $15,000 a workflow) and where connector breadth (Phase 2 and the OAuth
   broker) decides what we can take. Rule: only as a Recipe, never per-client code.

## 3e. The catalogue, shaped like the websites' marketing page (Peter, 2026-09-24)

stemfra.com shows six verticals, each with several themes. ai.stemfra.com mirrors it: a **category**
is a job family (the "vertical"), a **workflow** is a named product inside it (the "theme"). n8n's
template library (12,446 templates, checked 2026-09-24) browses by AI · Sales · IT Ops · Marketing ·
Document Ops · Support · Other, and Upwork by AI Integration · Chatbot · Automation Experts. Our
categories use the buyer's words for the job, one Upwork-style label each, and every workflow keeps
the same anatomy on its page: what it does in one line, the flow the questionnaire produces, the
connections it needs, a demo, build + run price, an intake form.

**Naming decision (Peter, 2026-09-24 evening, after the Relevance AI screenshots in §3e-i): every
workflow is named as a job title, the hire it replaces or assists.** The job title is the card
name, the page name, the Recipe's display name and the Upwork / LinkedIn listing name; the plain
description of the work is the one verb-first line under it. Two words where possible, a role
noun at the end (Receptionist, Assistant, Prospector, Drafter, Reporter, Reviewer, Screener,
Router), no "AI" in the name (the category page already says it), no em-dash.

| Category (the "vertical") | Buyer's label | Hires (the "themes"): job title, what it does | Status |
|---|---|---|---|
| **Front desk** (inbound) | Chatbot / support automation | **Front Desk Receptionist**: answers website chat, books, captures the lead · **Email Receptionist**: answers the shared inbox in the business's voice · **Booking Assistant**: finds and books the slot on the calendar · **After-hours Receptionist**: catches after-hours enquiries and books the callback | Built; deployed |
| **Lead finding** (outbound) | Lead generation / sales automation | **Hiring Signal Prospector**: turns job posts into scored companies with a draft message · **Local Business Prospector**: finds and scores nearby businesses from Google Maps · **Construction Lead Finder**: pulls UK project notices into a reviewed lead list · **List Enricher**: researches an existing list and drafts the first message | Two built, one proven, one to add |
| **Inbox & messages** | Email / inbox automation | **Inbox Triager**: sorts, labels and routes what arrives · **Reply Drafter**: writes the reply for approval, never sends alone · **Reply Watcher**: notices when a prospect answers and flags it · **Text Reply Drafter**: drafts the SMS answer for the owner to approve | Channel exists; small Recipes |
| **Reports & summaries** | Reporting / meeting notes | **Daily Digest Writer**: sends the morning or Friday summary of the business · **Call Note Taker**: turns each call or meeting into notes and next steps in the CRM · **Weekly Sales Reporter**: rolls the pipeline into one weekly report | Transcription exists on the server; digest job to add |
| **Knowledge & onboarding** | Internal knowledge base / IT ops | **Staff Knowledge Assistant**: answers staff questions from the company's own documents · **Onboarding Guide**: walks a new hire through the setup steps · **Policy Answerer**: answers policy and benefits questions in Slack or Teams | KB pipeline exists; Slack/Teams Phase 2 |
| **Documents** | Document processing | **Contract Reviewer**: reads the contract and lists obligations, dates and risks · **Candidate Screener**: screens applicants against the role · **Application Assistant**: reads claims and applications into structured records | Needs scoping (roadmap milestone) |
| **Integrations** | Business process automation | **Systems Sync Coordinator**: keeps Salesforce, NetSuite and Microsoft 365 in step, with approvals · **Ticket Router**: sends each ticket to the team that owns it · **Provisioning Coordinator**: runs new-hire or new-client setup across every system | Connector breadth (Phase 2 + OAuth broker) |

Rules for the catalogue: a workflow is a Recipe (configuration on the one runtime, never
per-client code); a category needs at least one workflow that is live before it gets a page; each
workflow page has an Upwork and LinkedIn listing twin with the same name; the category names are the
site navigation, the way the six verticals are on stemfra.com. The AI session owns `packages/web`;
this table is the brief for its recipe pages. Card anatomy and category colours: §3e-i.

### 3e-i. How Relevance AI categorises (Peter's screenshots, 2026-09-24 evening)

Relevance AI's home page ("We've helped thousands of teams launch their AI workforce") is the
closest live example of the shape above. What they do, and what we take:

- **Categories are the buyer's department, seven tabs**: Sales, Customer Success, Marketing, Human
  Resources, Customer Support, plus two behind "+3 more". That is who signs the contract in an
  enterprise. Our buyer is a small business owner or a solo operator with no departments, so our
  categories stay job families (Front desk, Lead finding, Inbox & messages…). Their split still
  tells us which of ours matter most: their Sales tab and Marketing tab together are our Lead
  finding + Front desk; their Support and Success tabs are our Inbox & messages + Knowledge.
- **Eight agents per tab, every one named as a job title**: Research & Enricher, Pre-meeting
  Prepper, Post-call Actioner, Meeting Scheduler, Outbound Prospector, Forecast Roll-up, Deal
  Reviewer, Proposal Builder; Customer Transitioner, Onboarding Guide, Renewal Manager, Support
  Triage, Churn Risk Detector; MQL Qualifier, Inbound Engager, Old Deal Re-engager, Campaign
  Reporter; Candidate Screener, Leave Manager, Policy Answerer, Interview Scheduler; Ticket
  Resolver, Escalation Manager, SLA Watchdog, Reply Drafter, Voice of Customer. A persona name
  reads as a hire, which is exactly the productised-agency frame in §3. Adopted the same evening:
  every workflow in the §3e table now carries a job title as its name, with the plain description
  as the line under it.
- **Every card is the same three-beat picture: trigger, two steps, outcome, with the connector
  logos in the pills** ("Call ended" → Logged call notes, Sent pricing PDF → "CRM stage
  updated"; "Deal won" → Handoff brief sent, Intro email sent → "Kickoff booked"). One line of
  description under it, verb first ("Logs notes and fires follow-ups after each call"). Adopt the
  anatomy verbatim for the catalogue cards: the Recipe's trigger, its two visible actions, its
  outcome, the connections as pills, one verb-first line. The Recipe compiler already produces the
  flow the dashboard renders (§7.5 of the spec), so the card is a rendering of real configuration,
  not marketing art.
- **One colour per category** (violet Sales, pink Success, blue Marketing, green HR, orange
  Support). Cheap and memorable; ours can do the same with the CMS's category tokens.
- **The live task table on the same page** (Tasks run / Spend / Avg cost / Eval pass rate, then a
  row per task with the agent, the model and the cost) is their proof of scale. We have the same
  meter in the dispatcher; the CRM version of that table is recorded under ROADMAP P44.
- **Direct overlaps worth naming on our pages** so a buyer who has seen theirs recognises ours:
  Inbound Engager = Website chat front desk; Research & Enricher and Outbound Prospector = Lead
  finding; Ticket Resolver and Reply Drafter = Inbox & messages; Campaign Reporter and Forecast
  Roll-up = Reports & summaries; Policy Answerer and Knowledge Base Writer = Knowledge & onboarding;
  Proposal Builder and Candidate Screener = Documents. Nothing on their page maps to our
  Integrations category, which is the sync-with-approvals work the job descriptions in §1 asked
  for, so that one stays ours.

Their catalogue has around 56 agents across seven tabs; ours opens with 7 categories and about
25 workflows, only the live ones with a page. The named-hire framing and the card anatomy are the
two things to copy now; the department tabs are not.

## 3f. An eighth category: Content & social (Peter, 2026-09-24)

Demand is real and large: 87% of marketers use generative AI in at least one recurring workflow
(Salesforce State of Marketing 2026, third-party citation), small businesses highest at 84%; the
social-media-management software market is put at $33 to 43 billion in 2026 (report vendors,
third-party). Evidence in our own findings: Harry Long's channel (posts in the author's voice, DM
triage), LinkedGrow (a posts SaaS with bring-your-own model key), Upwork's "AI Video Creators &
Editors" label, and every Stemfra tenant's need for before-and-after posts and promos.

The lane is crowded and cheap for scheduling alone: Buffer from $5 a channel a month, Metricool
from about €16, Taplio $39 to $199 (AI credits only from the $65 tier) (vendor pages via
third-party comparisons, 2026). We do not compete on a scheduler. The workflows that fit us are the
ones that connect content to the business's own data and to a review step:

| Workflow | What it does | Platform reality |
|---|---|---|
| Posts in your voice | Learns from the client's past posts and site, drafts a week of posts and hooks, queues them for approval, publishes | LinkedIn: a member can publish to their own profile via the self-serve Share on LinkedIn product (`w_member_social`, 150 posts per member per day); company pages and posting for others need partner approval. Instagram and Facebook: Meta Graph API publishing to professional accounts (app review 2 to 4 weeks). TikTok: Content Posting API; unaudited apps post as private only |
| Repurpose | Turns a video, a call transcript or a blog post into posts, carousels and short clips | Same publishing paths; video editing is its own product line (Upwork's "AI video creators"), keep to text and image first |
| Comment and DM triage | Sorts comments and DMs into leads, questions and noise; drafts replies | DM access is limited (Meta messaging APIs by permission; LinkedIn DMs have no API): browser-assisted like Harry Long's method, human-paced, never automated sending |
| Google Business Profile posts | Weekly offers and updates on the listing our tenants already claimed | Google Business Profile API; the highest-value one for the six verticals |
| Social listening for leads | Owners posting "DM to book" or complaining about their booking tool become leads (the Gemini verdict's organic TikTok/Instagram outreach) | Manual and low volume by platform terms; a research workflow, not a bot |

Where it sits: an eighth category on the catalogue, buyer's label "Content & social media", with
"Posts in your voice" and "Google Business Profile posts" as the first two workflows because both
feed the websites business directly. Rule carried over from the videos: drafts are approved by a
person before anything is published or sent.

## 3g. The dashboard: one shell, modules per workflow, only the active ones shown

Peter's observation: Stemfra AI's dashboard and Helen's lead-gen have different UIs because they
are not the CMS, where six verticals share one page set. Should each product get its own UI?

No, and not one giant UI either. The pattern is the CRM's OS shell and the CMS's theme system
applied to workflows: **one shell, a small set of shared surfaces, and a module per workflow that
appears only when that workflow is active.** The Recipe is already the capability allowlist the
dispatcher enforces (spec §7.5); make it the navigation allowlist too. A tenant with Front desk
sees Conversations; one with Leads sees Leads; one with both sees both. Simplicity for each user
comes from what is hidden, not from separate apps.

Shared surfaces (every tenant): Setup (the questionnaire and the readable flow), Connections,
Knowledge, **Review** (one queue for every draft that waits for a human: replies, outreach messages,
posts, extracted documents), Activity (runs, tool calls, spend), Billing. Per-workflow modules:
Conversations (Front desk), Leads (Lead finding, Helen's inbox and pipeline are the reference
standard already recorded in the parity checklist), Inbox (Inbox & messages), Reports, Documents,
Content calendar. The Review queue is the load-bearing shared surface: every workflow that
produces something for approval posts to it, so a small business with three workflows has one
place to work each morning.

What this means for Helen's build: her inbox and pipeline become the Leads module of the one
shell (the Leads product plan already says she is tenant #1, not a fork). The runtime, the tenant
data and the credentials stay isolated per tenant as they are now; only the front end converges.
The AI session owns this; the brief is: one `packages/web` shell, an app registry that reads the
active Recipe, module folders per workflow, the Review queue first.

## 4. Decisions to take (Peter)

1. Model: productised agency on the runtime (Recipes as products, agency pricing and motion). Yes / no.
2. First two Recipes to sell: Leads + Front Desk (both exist) or add Document intake (needs scoping).
3. Price bands above: confirm or re-anchor with the AI session's per-conversation cost figures.
4. Channel: Upwork + LinkedIn inbound first; the ai.stemfra.com site becomes recipe pages, not a
   generic "AI platform" page.

## Sources

Job descriptions: Peter's file `AI Agent Job descriptions.docx` (three postings, translated).
Stemfra docs: `stemfra_ai/docs/stemfra_ai_spec_doc.md` (§1, §7.5), `stemfra_ai/docs/LEADS_PRODUCT_PLAN.md`,
`stemfra_ai/docs/ROADMAP.md`, `GTM_PLAN_2026-09.md` §1, `GEMINI_EVALUATION_2026-09-22.md`.

Market (official): Upwork In-Demand Skills 2026 press release
https://investors.upwork.com/news-releases/news-release-details/upworks-demand-skills-2026-demand-top-ai-skills-more-doubles-ai
Market (third-party, 2026): AI automation agency pricing https://www.layer3labs.io/roi/ai-automation-agency-cost ·
https://lets-viz.com/blogs/ai-automation-agency-pricing-2026-what-buyers-pay · https://thecrunch.io/ai-automation-agency-cost/ ·
n8n / Make rate cards https://buldrr.com/n8n-automation-agency-pricing/ ·
https://betonai.net/ai-automation-rate-card-2026-what-to-charge-for-n8n-make-and-zapier-builds-real-rates-from-54-operators/ ·
AI receptionist pricing https://www.getaira.io/blog/ai-receptionist-pricing-guide · https://ai-receptionist.com/pricing-comparison/ ·
https://www.marblism.com/blog/best-ai-receptionist · Upwork AI jobs analysis https://www.upwatcher.io/guides/upwork-ai-jobs-2026/ ·
SMB adoption and barriers https://www.omago.ai/blog/sme-ai-adoption-2026-data · https://epiphanydynamics.ai/blog/state-of-ai-adoption-us-small-business-2026/ ·
https://kaizenaiconsulting.com/ai-agents-small-business-2026-what-works/ · Productised vs custom margins
https://www.vendasta.com/blog/ai-agency-business-model/ · https://schmidtconsulting.group/articles/scaling-agency-services-how-to-choose-between-productization-and-custom ·
https://www.momentumnexus.com/blog/productize-ai-services-agentic-model
