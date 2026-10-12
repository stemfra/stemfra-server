# Codex onboarding assessment

Verified 2026-10-12. Development can continue in the websites repositories using their existing architecture. This is a documentation transition, not an application migration or release.

## Scope and implementation

The workspace root is not a Git repository. Inspected the shared handoff, docs hub, roadmap/launch gate, repository guidance, package scripts, selected entry points, middleware, shared packages, operational scripts and deployment configuration. This was targeted orientation, not an every-line audit or exhaustive read of the 459 KB historical handoff.

- **stemfra_server**: Express/CommonJS API (`index.js`, `routes/`, `controllers/`, `lib/`). Booking, CMS, staff CRM, outreach, native lead-gen, billing/reconciliation and document exports are implemented. Boot starts multiple background sweepers. Deployment is GitHub Actions on main to Hostinger/Docker; the workflow is the production environment source of truth.
- **stemfra_platform**: npm workspaces, React/TypeScript CMS and six active vertical template families; shared `site-data` and `archetypes`, theme tokens and variant registry; tenant-router Worker and edge rendering code. `primitives` and `integrations` remain stubs; gyms has only a package manifest. Browser Supabase access is part of this project's architecture, unlike an API-only browser architecture used in some other projects.
- **stemfra-ops**: React JSX staff CRM with an OS shell, leads, calls, billing and platform administration. Existing lint is a missing-symbol crash guard. Preserve active-staff checks and server role boundaries.
- **stemfra_client**: React/Vite marketing, Claim funnel, templates gallery and Help Center. Build produces client assets, SSR and prerendered public routes.
- **stemfra_business**: React/TypeScript business plans, versioned content, pitch decks and export tools. The Master Plan and Envest routes exist despite older placeholder claims. Identity is unresolved; its prepared AGENTS.md is not committed.
- **stemfra_ai**: separate product/session, intentionally not edited or executed. Its runtime needs its own scoped onboarding. Reference repositories, inference, test_agent, assets and n8n exports were not audited or transitioned.

## Git evidence before transition commits

All five application repositories are on main. Four established repositories use local `Peter Okeme <peter.space.io@gmail.com>` consistently with recent history; no identity settings changed.

| Directory | Origin owner/repository | SSH account verified | HEAD | Live main | Existing unpublished commits |
|---|---|---|---|---|---|
| stemfra_server | stemfra/stemfra-server | stemfra-admin | 27ad8a9 | 5ea49fc | 8 |
| stemfra_platform | peterspace/stemfra-platform | peterspace | 5512f30 | df1d6e0 | 1 |
| stemfra-ops | peterspace/stemfra-op | peterspace | 7baf3b0 | e887570 | 1 |
| stemfra_client | peterspace/stemfra | peterspace | dffa8f10 | fccb294 | 6 |
| stemfra_business | no origin | not established | ba7a657 | not available | no upstream |

Read-only SSH greetings verified both accounts. `git ls-remote` checked all advertised heads and pull refs on the four origins; main is the only advertised branch in each. Client advertises pull ref 1 at e0605d3. A pull ref does not establish open/closed PR status. GitHub CLI is unauthenticated, so PR state/review details were not checked. Remote main hashes match cached origin/main; recent local history and unpublished commits were inspected. No fetch, push or deploy was performed.

Business has no explicit user.name/user.email and past commits use a machine-local email. Ask Peter for its intended commit identity and repository owner before configuring/committing. Do not initialize the workspace root without a repository decision.

Existing work preserved: platform `docs/CMS_TUTORIAL_VIDEOS.md` (22 changed lines), plus all pre-existing local commits. Root AGENTS.md, handoff and docs hub are outside Git. Only explicit onboarding paths are staged in the four established repositories.

## Fresh verification

- Server: `node --check` over index.js and all JS under config/controllers/lib/middleware/routes: **276 files, zero failures**. Syntax only; no npm test/lint script exists.
- CMS: `npm run typecheck --workspace=@stemfra/cms`: **passed**.
- CRM: `npm run build`: **passed**, including lint (0 errors, 26 unused-disable warnings). Vite reports large chunks, mixed static/dynamic imports and stale Browserslist data.
- Marketing: `npm run build`: **passed**, client + SSR + **96 prerendered routes, zero head-only fallbacks**. Large-chunk warning remains.
- Business: `npm run typecheck`: **failed with 10 diagnostics**: missing pdfmake/file-saver declarations, IRText/IRShape narrowing in nativePptx.ts, and a generic cast in PitchDeckNVC.tsx. These pre-existing implementation errors are outside this documentation transition.
- No live migrations, operational tests, scrapes, messages, API boot, browser walkthrough or deployment validation. Server scripts named `agent-budget-test` and `leadgen-native-test` touch remote data/services and are not safe offline unit tests.

Credential presence only was inspected in server `.env`: Supabase URL, secret key and management access-token variable exist; DB password and DATABASE_URL variables do not. Values were not printed/copied and credential validity or live project access was not tested. Never infer shared-project boundaries from schema names alone. Before any AI project-wide auth/credential change, check Helen impact as well; this cross-product reminder comes from prior onboarding and must be reverified for the target operation.

## Discrepancies and development gaps

1. Root `.claude/settings.json` names COMMISSION_MODEL as the active arc; the later handoff/roadmap names LAUNCH_PLAN. Codex instructions follow the later documented order and task-specific roadmap item.
2. Platform guidance opens with four templates and setup/monthly pricing, while the workspace contains six active families and later commission/pricing decisions. Use the dated roadmap for product decisions; P48 holds the whole menu and AI promotion until Airwallex card payment is live. Only the Custom pricing switch is separately cleared. This transition does not lift any hold.
3. Root platform `npm run typecheck` invokes `tsc --build`, but no root tsconfig.json exists. CMS's own typecheck passes. A working aggregate verification command is a good first development task; verify all intended workspaces before changing its contract.
4. The hub describes reconciliation as not built, but index.js mounts recon endpoints/webhooks and lib/reconSweeper.js implements gated scheduling. Code existence does not establish production enablement. Older launch rows similarly conflict with later dated completion entries.
5. Business guidance simultaneously describes DB persistence and says no persistence, and lists Master Plan as unbuilt despite its implemented route. The current onboarding assessment flags these rather than rewriting unrelated historical records.
6. Platform guidance records pending booking write-side validation/rate-limit work; CRM guidance records role-scoped RLS hardening. These are investigation candidates, not freshly verified security findings or authorization to change production. A migration filename alone does not prove application.

## Claude workflow migration

Existing CLAUDE.md files stay compatible and remain shared references. New per-repository AGENTS.md files provide entry points even when a repository is opened directly. The unversioned parent AGENTS.md captures the session ritual, local-only commits, ownership boundaries, checks and status updates. Official basis: [OpenAI AGENTS.md documentation](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

- **SessionStart hook**: inspected root `.claude/settings.json`; preserve its read/update ritual in AGENTS.md instead of assuming Claude hooks execute in Codex.
- **Preview/run**: inspected shared `.claude/launch.json` and repository launch-file locations. Reuse their package commands/ports with current terminal/browser tools; `preview_start`, `preview_eval` and `/run` require adaptation. Preserve the parent launch config; avoid duplicate servers. Revalidate screenshot and output paths before running supporting scripts. No dev services started here.
- **Advisor**: inspected `docs/ADVISOR_STRATEGY.md`, the user-level advisor agent and advisor SKILL.md. Its complete brief, read-only review and one-question contract are reusable. Claude Agent invocation and Fable model pin are not portable unchanged. No replacement skill installed, no model changed, and no advisor needed for these routine documentation edits. Claude pricing claims were not verified.
- **Memory**: Claude private conversations and automatic memory were not imported. Do not write personal memory as a side effect of onboarding.

Next: fix the aggregate platform check and reconcile the status headings relevant to the next chosen arc, then perform a visible local UI baseline with background jobs controlled. Keep P48 and all external-service changes gated by the existing user decisions.
