# Stemfra AI consolidation plan: Helen's lead-gen + every other component, on one runtime (2026-09-24)

_Drafted by the websites session at Peter's request, from the three repos' own handoffs and docs
(verified 2026-09-24). Companion to `STEMFRA_AI_POSITIONING_2026-09.md` (the business model and the
catalogue). The Stemfra AI session executes; it should copy this file into `stemfra_ai/docs/` the
way `LEADS_PRODUCT_PLAN.md` was copied, and treat the five phases there (P1 to P5) as still valid:
this plan re-sequences them around today's catalogue and adds what the last month changed._

## 0. Where the three codebases stand today

| Codebase | State (from its handoff) | What it contributes |
|---|---|---|
| **stemfra_ai** (`~/Documents/stemfra/stemfra_ai`) | Phase 1 complete and gated (M1.1 to M1.13, hardening incl. spend guards, canaries, redaction audit, load test, runbooks); 1.14 standalone Supabase project done (`pvvevthltffrxnaoepcu`, schema `stemfra_ai`, runtime role denied `public.*`); deployed (API agent.stemfra.com, web + widget ai.stemfra.com, pipeline green since 2026-09-21); model routing live (dev gpt-oss-120b, background DeepSeek-V4.1-Flash, chat GPT-4o, fallback wrapper built); L0 done (`Tenant.products`, product-grouped nav); L1 gated on the read-first rule; paused at stage 0, D4 waits on a signed client | The runtime, dispatcher, vault, KB, connectors (calcom, imap-smtp, notion, postgres, supabase, website-scraper, file-upload, stemfra-crm, query templates), Recipes, the web shell (Setup, Connections, Knowledge, Inbox, Leads, Bookings, Persona, auth), widget |
| **Helen lead-gen** (`~/Documents/SAAS/leadgen_helen`) | Complete single-tenant CRM, live at leads.stemfra.com (Express :4290 + Vite :5195, `public` schema of the SAME Supabase project); frozen to fixes-only since 2026-08-30 (canonical-repo rule); pilot has no blockers; carries verbatim platform code (routes/leadgen.js, leadgenCall, gmailOutreach, leadgenDraft, leadTimezone, CRM components) | The proven Leads loop: CCS import → GBP enrichment → channel router → AI drafts (form via Playwright, email via Gmail app password) → the Gmail-grade inbox (the reference inbox for every Stemfra build) → copilot with confirm-before-act; usage metering; persona catalog; the migration SQL draft; PORT_DELTA |
| **Websites platform** (server, CRM, CMS, marketing) | Far ahead of what Helen copied in late August: CRM OS shell + app registry + light mode + notifications (Sep 5), native lead-gen in the server (P41, Sep 17), Google refresh, outreach compliance (CASL/PECR), call transcripts, the six-vertical Solutions pages, the Setup wizard, the design rules (no underline, one accent, tablekit, Select) | Ports and patterns the AI session may RE-CREATE (never edit): `lib/leadgenNative.js` (Google Maps pool), `lib/outreachCompliance.js`, `lib/callTranscripts.js`, `lib/mailer.js` + `templates/baseEmail.js`, the CRM `apps.js` registry idea, CMS `dashkit`/`tablekit`, the Solutions page pattern, `seo.js` prerender |

Two rules from the handoffs that still bind: **Helen's code is never merged** into stemfra_ai (it
carries verbatim platform IP; ideas and libs are re-created in TypeScript on the runtime), and
**every Twilio call happens on a production server only** (Helen's telephony routes retire; voice
stays on stemfra_server until the runtime's Phase 4 voice adapter).

## 1. Principles for the combined product

1. One runtime, one tenant model, one shell. Products are Recipes; the active Recipes decide both
   what the dispatcher allows and what the dashboard shows (positioning paper §3g).
2. Tenant data, credentials and model spend stay isolated per tenant exactly as now.
3. Pools are platform-owned and shared (one CCS import, one Google Maps scrape, one job-board
   scrape serves every tenant); tenant state sits beside them (`lead_state`), never inside them
   (Leads plan §3.2).
4. Every workflow that produces something for a human lands in ONE Review queue.
5. Keyless fallbacks stay a requirement (Helen's rule): a tenant without an AI key still gets
   template drafts and heuristic paths.
6. Nothing is built outside a Recipe; a custom ask becomes a Recipe or is declined.

## 2. Workstreams

### W1. Product foundation on the runtime (first, small)
- `workspace_products` entitlements exist (L0). Add: the **Review queue** (`review_items`: tenant,
  workflow, kind = reply | outreach | post | extraction, payload, status, decided_by, decided_at)
  with one module in the shell; every Recipe that drafts writes to it, and the Inbox's existing
  suggested reply becomes the first producer.
- The **app registry**: one file listing modules (Conversations, Leads, Inbox, Reports, Documents,
  Content) with the Recipe capability that unlocks each; nav, routes and the copilot's `SURFACES`
  read it (the CRM `apps.js` pattern, re-created).
- Exit: a workspace with Front desk only shows Conversations + shared surfaces; adding Leads adds
  the Leads module without a deploy.

### W2. Stemfra Leads port (the Leads plan's P2 + P3, unchanged in substance)
- Migration: number and apply `LEADS_MIGRATION_DRAFT.sql` through the runner after Peter's gate
  (projects pool, company_contacts, per-tenant lead_state, email_messages, notifications, copilot
  conversations, persona config).
- Lib ports, in TypeScript on the runtime, in this order: `channelRouter` (one function shared by
  shortlist, dashboard and copilot), `constructionDraft` + `replySuggest` + `emailRefine` (as
  background-surface model calls, keyless fallbacks kept), `emailSync` + `emailHtml` (through the
  `imap_smtp` connector and the vault, not a port of `emailAccount.js`), `formOutreach`
  (Playwright, dry-run default, CAPTCHA abort, human gate), `sources/apifyGbp` (STOP_TOKENS kept).
- Read `PORT_DELTA.md` at the start of every slice (its standing rule); the usage and billing
  surface is a PORT item there.
- Persona catalog (`PERSONA_CATALOG.md`) as the single-source file; the accommodation preset is the
  parity test against Helen's CRM.
- Inbox parity: the "Helen inbox standard" checklist (ROADMAP "Inbox parity upgrades") is applied
  ONCE to the shared Inbox module, which then serves Front desk and Leads alike.
- Exit: the accommodation persona reproduces Helen's CRM on a seeded test workspace; one
  non-accommodation persona (materials supplier) works end to end.

### W3. Pools: three, platform-owned
1. **Construction (UK)**: CCS import moves from Helen's manual control to a platform cron with
   platform credentials (decision 3 and 8 in the Leads plan); the Insights-API auto-pull is the
   automation step.
2. **Local businesses (Google Maps)**: RE-CREATE `stemfra_server/lib/leadgenNative.js` +
   `leadGoogleRefresh.js` as the pool #2 fetcher (a port, not a move; the platform keeps its own
   pipeline). Buyer personas per the Leads plan §1 (agencies, suppliers, bookkeepers, and Stemfra
   itself).
3. **Hiring signals (new)**: an Apify job-board actor (Indeed and LinkedIn Jobs) pulling posts by
   keywords and region, scored against the tenant's offer with a threshold and rationale (the
   German consultant's loop, positioning paper §3b), enrichment above threshold only. First
   tenant: Stemfra AI's own prospecting (companies posting "AI & automation" roles; 176 found in one
   week on 2026-09-24). This pool also dogfoods the product before any client uses it.
- Exit: three pools refresh on schedule from platform credentials; a tenant subscribes to a pool
  through its persona, never with its own scraper keys.

### W4. The catalogue on the web
- ai.stemfra.com becomes a hub plus one page per workflow, named in the buyer's words (positioning
  paper §3e), built on the Solutions-page pattern from stemfra_client (one data file drives the
  pages, prerendered). First pages: Website chat front desk, Email front desk, Hiring-signal leads,
  Local-business leads, Construction-project leads.
- Each page: one-line job, the readable flow, connections needed, demo, build + run price, intake
  form (the questionnaire's first step). Upwork and LinkedIn listing twins are Peter's manual
  step per page.
- Exit: a visitor can start the questionnaire from a workflow page; `workspace_products` is set
  from the choice.

### W5. Reuse from the broader Stemfra (speed, read-and-re-create)
| Need in Stemfra AI | Take from | Note |
|---|---|---|
| Outreach compliance footers, CASL / PECR gate, UK sole-trader rule | server `lib/outreachCompliance.js` | Small, pure; port as is |
| Google Maps pool + readiness + booking-platform facts | server `lib/leadgenNative.js`, `lib/leadGoogleRefresh.js`, `lib/bookingPlatform` twin in the CRM | Port the scrape + normalise + score; scoring rules live in one prompt file (`prompts/leadgen-system.txt` pattern) |
| Call and meeting transcription + summary | server `lib/callTranscripts.js` (OpenAI transcription + summary JSON) | Becomes the Reports & summaries Recipe's core; audio comes from the tenant's uploads or the production Twilio server, never from a Mac |
| Transactional email rendering | server `lib/mailer.js` + `templates/baseEmail.js` | Owner alerts, digests, the pre-invoice style notices |
| Dashboard shell, tables, forms | CMS `dashkit.tsx`, `tablekit.tsx`, the OS-shell app registry (`stemfra-ops/src/lib/apps.js`) | The AI web already re-created the light CMS shell; re-copy tablekit for the Leads table (Helen's advanced table came from it) |
| Notifications bell + realtime | CMS `cms_notifications` pattern | Per-tenant bell for review items and handoffs |
| Copilot | Stacy / Helen copilot (markdown, confirm-before-act cards, history, rewind) | Already round-tripped into the runtime's Front Desk; keep one copilot per workspace whose context composes from active Recipes |
| Setup wizard anatomy | CMS `SetupWizard` (stages, listing card, launch screen) | The questionnaire's UI reference |
| Website pages | stemfra_client Solutions pages + `seo.js` | W4 |

### W6. Helen becomes tenant #1 (the Leads plan's P5)
- Export her `crm_settings` + lead state + conversations, create her workspace, she re-enters her
  Gmail app password into the workspace vault (never copied), CCS pool already shared.
- leads.stemfra.com becomes an alias or redirect; her repo and its deploy retire; its Supabase
  `public` schema is decommissioned after a soak.
- Exit: Helen works from ai.stemfra.com with the accommodation persona and sees no regression on
  the inbox, the shortlist or the copilot.

### W7. Models and cost
- Keep the adopted routing (dev gpt-oss-120b, background DeepSeek-V4.1-Flash, chat GPT-4o) with the
  gate discipline in `MODEL_STRATEGY_2026-09-18.md`; all Leads drafting and scoring is a
  background surface. The M-3 fallback stays one env var away for chat.
- Add bring-your-own-key as a tenant option (positioning paper §3b): a tenant model key is one more
  credential lane; usage metering already exists.

### W8. Later workflows (after the first paying Recipe)
Inbox triage and drafted replies (IMAP exists), Reports & summaries (W5 transcription), Knowledge
& onboarding (Slack and Teams channels, Phase 2), Documents (a scoping milestone first), cross-system
Integrations (Phase 2 connectors + the Phase 3 OAuth broker; only as Recipes).

## 3. Sequence and gates

| Order | Workstream | Gate (Peter) | Peter's own actions |
|---|---|---|---|
| 1 | W1 foundation (Review queue, registry) | Front-desk-only vs both-products navigation demo | none |
| 2 | W2 Leads port, slice by slice (migration → libs → persona → inbox parity) | Accommodation parity on a test workspace | number + approve the migration; keep the Helen repo frozen |
| 3 | W3 pools (construction cron, Google Maps port, hiring signals) | One scheduled refresh per pool visible in the dashboard | CCS credentials on the platform; Apify actor + budget for job boards; confirm keyword list |
| 4 | W4 catalogue pages | Five workflow pages live, questionnaire starts from a page | copy review; Upwork / LinkedIn listings |
| 5 | W6 Helen migration | Helen signs off on her workspace | export approval; her app password re-entry |
| 6 | W7 + W8 | per Recipe | pricing bands decision (positioning paper §4) |

The Supabase tier decision (free until about ten paying clients, Peter 2026-08-30) stands; the
project must not be allowed to auto-pause once a pool cron runs (Helen's poller currently keeps it
awake).

## 4. Division of labour

- **Stemfra AI session**: owns every step above inside `stemfra_ai/`; reads the Helen repo and the
  platform repos, never edits them; keeps its handoff and ROADMAP live per slice.
- **Websites session (this one)**: on request, hands over exact file paths and the current
  behaviour of any platform lib to port, keeps `outreachCompliance` and `leadgenNative` stable, and
  records cross-session decisions in the root handoff.
- **Helen repo**: fixes only; every change logged in `PORT_DELTA.md` with a disposition.
- **Peter**: gates, credentials, pricing bands, listings, Helen's sign-off.

## Sources
`stemfra_ai/SESSION_HANDOFF.md` (entries 2026-08-29 to 2026-09-21), `stemfra_ai/docs/ROADMAP.md`,
`stemfra_ai/docs/LEADS_PRODUCT_PLAN.md`, `stemfra_ai/CLAUDE.md`,
`~/Documents/SAAS/leadgen_helen/SESSION_HANDOFF.md`, `docs/PORTING_BRIEF.md`, `docs/PORT_DELTA.md`,
`stemfra_server/CLAUDE.md`, `stemfra-ops/CLAUDE.md`, `stemfra_platform/CLAUDE.md`,
`STEMFRA_AI_POSITIONING_2026-09.md` §3b, §3e, §3g. All read 2026-09-24.
