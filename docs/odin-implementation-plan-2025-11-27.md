# Odin Implementation Plan — 2025-11-27

**Repo:** `Vanopticon/Odin`
**Branch:** `feature/architect-plan-20251127`
**Prepared by:** Copilot (assistant) — plan derived from repo files and open issues.

## Summary

- Inventory completed: top-level docs (`README.md`, `package.json`) and current design docs present.
- Open issues reviewed: 42 total (many closed design items; 10+ active operational, security, testing, and API work items).
- Primary workstreams: Security (audit logs, validation, OpenAPI), Operations (monitoring, TLS/secrets), Testing & CI (VVP, CI jobs, DB migration tests), API/Contracts (OpenAPI, request validation), Auth & Sessions, Observability/Logging, Frontend accessibility and performance, Traceability & docs.

---

## Prioritized Backlog & Step-by-step Tasks

General pattern for each issue/feature:

1) Discovery & spec: update `docs/` (ICD, runbooks, VVP) and create small design/acceptance notes.
2) Implement: code changes in `src/` or `server/` with small focused commits and feature branches from `v1.0.0`.
3) Tests: unit + integration + e2e where applicable; add CI job entries.
4) Docs & rollout: update `docs/` and the plan; open PR with the linked Issue.

A. Security & API Contracts

- Issues: #73 (OpenAPI ICD), #70 (request validation), #72 (audit logging schema), #32/34 (permission tests/structured logging)
- Steps:
  1. Create `docs/openapi.yaml` initial pass covering existing endpoints: `/api/triggers`, auth endpoints (`/auth/login`, `/auth/callback`), `/api/health` (Issue #73). Link to `docs/design/03-Interface-Control-Document.md`.
  2. Generate Zod schemas (or JSON Schema via zod-to-json-schema) for request/response shapes; extract into `src/lib/schemas/` and consume from `src/routes/api/*`.
  3. Add validation middleware/util (using Zod) applied to `POST/PUT /api/triggers` and others (Issue #70).
  4. Implement centralized audit logger helper `src/lib/logging/audit.ts` that emits structured JSON to stdout (Issue #72). Hook into auth handlers and CRUD endpoints.
  5. Add unit/integration tests asserting validation failures and audit log entries written to stdout (capture logs in tests).
  6. Add CI lint job: `openapi-cli`/`spectral` linting and contract test that validates live responses or a contract-test harness.
- Acceptance: OpenAPI file present & linted in CI; Zod schemas used by endpoints; validation tests added; audit logs emitted with required fields.

B. Operations & Secrets/TLS

- Issues: #68 (secrets & TLS), #67 (host config/startup validation), #71 (monitoring & runbook)
- Steps:
  1. Update `server/settings.js` to remove production default to `localhost` and fail startup when `NODE_ENV=production` and `OD_HOST` is unset or invalid (Issue #67).
  2. Add startup validation for TLS cert presence when running in production mode and add clear error messages and exit codes.
  3. Add `docs/ops/SECRETS.md` and update `docs/design/07-Configuration-Deployment-Specification.md` with recommended KMS options and rotation guidance (Issue #68).
  4. Define minimal Prometheus metrics and thresholds in `docs/design/09-Operational-Security-Runbook.md` and provide sample Prometheus rules (Issue #71).
  5. Add `prom-client` instrumentation in server boot and key endpoints (req durations, error rates, auth failures) and expose `/metrics` endpoint.
  6. Add runbook playbooks for common incidents.
- Acceptance: startup checks in place; TLS/secret docs added; `/metrics` endpoint available; runbook updated.

C. Testing, CI, and VVP

- Issues: #29 (CI accessibility), #30 (migration tests), #31 (traceability), #59 (CGM closed), #69 (VVP mapping)
- Steps:
  1. Add CI workflow(s) to run: `pnpm build`, `pnpm preview` (port 4173), `vitest` unit tests, and  E2E tests. Ensure ephemeral DB or test DB used for migration tests (Issue #29).
  2. Create DB migration+seed smoke test using a disposable Postgres (docker/testcontainers) that runs `run-migrations.ts` and `seed.ts` (Issue #30).
  3. Create `docs/design/VVP-TRACEABILITY.md` mapping critical requirements → tests, and add missing tests for gaps (Issue #69).
  4. Add accessibility checks into CI for critical flows (Issue #33).
- Acceptance: CI runs full acceptance checklist; migration tests pass in CI; traceability doc created and tests added for uncovered items.

D. Auth, Roles & Permissions

- Issues: #27 (server-side role→permission mapping), #14/17/9 (OAuth integration, APIs, repo audit)
- Steps:
  1. Centralize role→permission mapping on the server (new module `src/lib/auth/roles.ts`) and expose a secure endpoint for the client to fetch current user permissions (Issue #27).
  2. Harden session handling: httpOnly secure cookies, token refresh endpoints, logout, CSRF protection (refer to existing `src/lib/auth/*` and `src/hooks.server.ts`) (Issue #14).
  3. Add integration tests for permission enforcement (attempt unauthorized requests) and ensure 401/403 semantics (Issue #32).
- Acceptance: server authoritative permissions, secure session flows, and tests validating enforcement.

E. Data & Audit Trail

- Issues: #35 (audit trail for configuration changes), #30 (migrations)
- Steps:
  1. Add migration to create `audit_entries` table and supporting indices (migration in `src/lib/db/migrations/`), then update `seed.ts` if needed (Issue #35).
  2. Implement DB helper to write audit entries on create/update/delete for key tables (triggers, sources, users).
  3. Add API/UI to query audit history with pagination and RBAC control.
  4. Add tests that assert audit rows are written for operations.
- Acceptance: audit tables and writes implemented, UI access exists for authorized roles.

F. Observability & Logging

- Issues: #34/LOG-001 (structured logging), #71 (monitoring)
- Steps:
  1. Standardize on structured logging fields (ts, level, reqId, actor, action, resource, outcome, message) and add `src/lib/logging/logger.ts` wrapper (Issue #34).
  2. Add correlation ID middleware to requests and ensure it appears in logs and audit events.
  3. Document logging format in `docs/ops/LOGGING.md` and retention recommendations.
  4. Integrate `prom-client` metrics instrumentation and export `/metrics` (see Ops above).
- Acceptance: structured logs across server code and docs added.

G. Frontend Accessibility & Performance

- Issues: #33 (a11y checks), #36 (performance budgets)
- Steps:
  2. Define performance budgets in `docs/design/NFR-PERFORMANCE.md` and add a basic k6 or Lighthouse harness for primary pages (Issue #36).
  3. Implement UI improvements: reduce main-thread work, measure TTFP, lazy-load non-critical assets.
- Acceptance: CI enforces a11y checks on critical flows; performance budget doc and at least one automated test exist.

H. Docs & Traceability

- Issues: #31, #17, #16
- Steps:
  1. Create `docs/design/TRACEABILITY.md` linking issues/PRs to REQ IDs and updating PR templates to reference REQ IDs (Issue #31).
  2. Finish `docs/agents/TODO.md` inventory and link to plan items (Issue #17).
  3. Create or update `docs/RELEASE.md`, `docs/ops/*` as needed.
- Acceptance: traceability doc added and PR process updated.

---

## Suggested Prioritization (first 2 sprints)

Sprint 1 (Week 1–2):

- Implement startup validations for host/TLS and secrets docs (#67, #68).
- Add OpenAPI skeleton and Zod schemas for critical endpoints (#73, #70).
- Add validation middleware for `/api/triggers` and auth endpoints (#70).
- Add CI OpenAPI lint job and basic test harness (#73).

Sprint 2 (Week 3–4):

- Centralized audit logging and DB audit table migration (#72, #35).
- Add structured logging and `/metrics` instrumentation (#34, #71).

Lower priority but required in parallel:

- Traceability & VVP mapping (#69, #31)
- OAuth provider integration and session APIs (#14)
- Accessibility & performance testing in CI (#33, #36)

---

## Implementation conventions & acceptance

- Branch naming: `feature/<issue-number>-short-desc` (branch off `v1.0.0`).
- PRs: small, single-concern, include tests, link issue number, and reference REQ IDs where applicable.
- Tests: unit + integration + e2e for critical flows. DB migrations must have test coverage via disposable DB in CI.
- Docs: update `docs/` alongside code changes; add changelog entries for configuration changes.

---

## Next Immediate Actions (I can perform now)

1. Create the implementation plan file in the brain (this file).
2. Mark mapping step in the TODO list in-progress and update statuses.
3. Optionally, create the first feature branch for `server/settings.js` startup validations and open a draft PR.

---

## References

- `README.md`, `package.json` (repo inventory)
- Issues reviewed: #73, #72, #71, #70, #69, #68, #67, #36, #35, #34, #33, #32, #31, #30, #29, #28... (see issue list)
- Design docs in `docs/design/`

---

_Plan created: 2025-11-27T00:00Z_
