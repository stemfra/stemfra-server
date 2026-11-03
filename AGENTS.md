# Codex instructions: stemfra_server

Read [workspace instructions](../AGENTS.md), [session handoff](../SESSION_HANDOFF.md), [documentation hub](../docs/README.md), the relevant [roadmap](../stemfra_server/docs/ROADMAP.md) item and [CLAUDE.md](CLAUDE.md) before work. CLAUDE.md remains the shared architecture and conventions reference; reconcile old status claims against current code and dated decisions.

Express/CommonJS API. Preserve route/controller/lib boundaries, raw webhook parsing order, CMS ownership checks and staff authorization. Inspect background sweepers before starting index.js. There is no npm test/lint script; node --check is syntax validation only.

## Local GitHub access

The ignored server `.env` contains `PERSONAL_ACCESS_TOKEN` for authorized GitHub release work. Use `node scripts/github.cjs <gh arguments>` from this repository, for example `node scripts/github.cjs api repos/stemfra/stemfra-server --jq '{full_name,permissions}'`. The helper supplies the token privately as `GH_TOKEN`; an empty `gh auth status` does not mean GitHub access is missing. Do not ask Peter to run `gh auth login` before checking this documented path. Verify the target repository and permissions. Never print the token, commit `.env`, copy it to clients, or add it to production application environment variables. Existing token access to Actions secrets is verified; Actions variables previously returned403, so use the established encrypted-secret mapping where needed.

Preserve existing uncommitted work. Verify repository identity and scope before edits. Keep commits local; never push, deploy or modify external services without authorization. Twilio is production-server-only. Never expose credentials. Update the handoff and touched status documentation with fresh checks and remaining blockers.

If the sibling workspace documents are absent in an isolated checkout, request their location before cross-repository work; do not invent the missing context.

Onboarding evidence: [CODEX_ONBOARDING.md](../stemfra_server/docs/CODEX_ONBOARDING.md).
