# Codex instructions: stemfra_server

Read [workspace instructions](../AGENTS.md), [session handoff](../SESSION_HANDOFF.md), [documentation hub](../docs/README.md), the relevant [roadmap](../stemfra_server/docs/ROADMAP.md) item and [CLAUDE.md](CLAUDE.md) before work. CLAUDE.md remains the shared architecture and conventions reference; reconcile old status claims against current code and dated decisions.

Express/CommonJS API. Preserve route/controller/lib boundaries, raw webhook parsing order, CMS ownership checks and staff authorization. Inspect background sweepers before starting index.js. There is no npm test/lint script; node --check is syntax validation only.

Preserve existing uncommitted work. Verify repository identity and scope before edits. Keep commits local; never push, deploy or modify external services without authorization. Twilio is production-server-only. Never expose credentials. Update the handoff and touched status documentation with fresh checks and remaining blockers.

If the sibling workspace documents are absent in an isolated checkout, request their location before cross-repository work; do not invent the missing context.

Onboarding evidence: [CODEX_ONBOARDING.md](../stemfra_server/docs/CODEX_ONBOARDING.md).
