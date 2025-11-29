# Developer Handoff — Odin Feature Implementation

Created: 2025-11-29
Source: `docs/design/features/`

Purpose

- Provide a concise implementation handoff for developers to begin work on the feature files created under `docs/design/features/`.

Files included

- `docs/design/features/core-architecture.feature.json`
- `docs/design/features/auth.feature.json`
- `docs/design/features/api.feature.json`
- `docs/design/features/ui.feature.json`
- `docs/design/features/data-storage.feature.json`
- `docs/design/features/audit.feature.json`
- `docs/design/features/testing-and-ci.feature.json`
- `docs/design/features/deployment.feature.json`

Priority guidance

- High: `auth`, `api`, `audit` — these secure and persist configuration changes and require tests.
- Medium: `ui`, `data-storage` — user experience and DB migrations/seeds.
- Low: `deployment`, `testing-and-ci`, `core-architecture` (documentation-oriented tasks).

Implementation checklist (per feature)

- Review referenced code paths in the feature file `references` field.
- Implement missing behavior in small, testable commits.
- Add/update unit tests under `src/lib/**/__tests__` and route tests under `src/routes/**/__tests__`.
- Add/instrument integration tests for DB-backed behavior and audit creation (place under `server/__tests__` or `src/lib/logging/__tests__`).
- Run `pnpm test` locally and ensure new tests are included in CI.

Branch & PR convention

- Create a branch from `v1.0.0` named: `feature/<feature-id>-<short-desc>` (e.g., `feature/auth-rbac-init`).
- Keep PRs small and focused; reference the relevant feature file in the PR description and link to any issues.
- Use `pnpm format` and `pnpm lint` before opening PR.

Testing & CI

- Use the existing `pnpm test` and e2e scripts under `e2e/`.
- Ensure migrations run in CI before tests; use the seed scripts for test fixtures.

Developer notes & shortcuts

- Key code locations:
    + Auth: `src/lib/auth/`, `src/routes/auth/`, `src/hooks.server.ts`
    + API: `src/routes/api/` and `src/lib/schemas/`
    + Audit: `src/lib/logging/audit.ts`, migration `server/db/migrations/0003-CreateAuditEntries.ts`
    + DB: `src/lib/db/` and `server/db/migrations/`
    + UI: `src/lib/controls/`, `src/routes/+layout.svelte`
- When in doubt choose the secure, simplest option (least privilege for auth, strict validation for APIs).

Acceptance criteria checklist (apply on PRs)

- Implementation meets the feature's `acceptance_criteria` entries.
- Unit and integration tests added/updated and pass locally.
- E2E smoke tests (homepage, health, login) unaffected; if affected, update tests accordingly.
- Documentation updated if behavior or interfaces change.

Next steps (recommended)

- Convert each feature file `tasks` into GitHub issues and attach developers.
- Triage and pick the first implementation target (recommend: `auth-and-rbac`).

Contact

- If you want me to open issues and create starter branches, tell me which feature to begin; I can create the branch and draft a PR.

TL;DR

- Feature files live under `docs/design/features/` summarizing scope, data flow, and acceptance criteria.
- Start with `auth` or `api` for greatest impact; follow the checklist above.
