# Progress Tracker

Master progress log for the project and high-level task tracking for agents.

Entries

- 2025-12-05 — LTM initialization: created `.github/agent_memory` and seeded pages (`project_brief.md`, `active_context.md`, `system_patterns.md`, `tech_stack.md`, `progress_tracker.md`, `handoff.md`). (completed)

- 2025-12-05 — Design review: reviewed `docs/design/features/*` and added high-priority issues (#73, #72, #71, #70, #68, #67, #36) into the LTP; updated `project_brief.md`, `active_context.md`, and `handoff.md`. (in-progress)

How to use

- Append concise entries with ISO date and short status. Keep one line per entry for quick scanning.
- For larger work, reference issue numbers and PRs.

Next suggested entries

- Add project milestones when features land (link to issue/PR)
- Record architecture decisions (brief + reference documents)

Master Plan (atomic tasks)

The following small, actionable tasks are derived from the design review and open issues. Each item is intentionally scoped to be easily reviewable and testable.

- API / OpenAPI (#73)
	- Create initial `docs/openapi.yaml` covering `/api/health`, `/api/triggers` (GET, POST, PUT, DELETE), and auth endpoints.
	- Add a `scripts/` helper to validate the OpenAPI file locally using `spectral` or `openapi-cli`.
	- Add CI workflow step to lint `docs/openapi.yaml` and fail on errors.
	- Add minimal contract tests that validate `/api/health` and `/api/triggers` responses against the spec.

- Request validation & sanitization (#70)
	- Add a shared validation utility (Zod/ajv) under `src/lib/schemas/validate.ts` and unit tests.
	- Convert `POST/PUT /api/triggers` to use the validation utility and add negative tests (missing/invalid fields).
	- Ensure error responses are sanitized, documented, and use standard error format.

- Audit logging & tests (#72, #35)
	- Define the audit log schema (fields, examples) and commit to `docs/ops/LOGGING.md`.
	- Implement `src/lib/logging/audit.ts` helper and wire it into mutation handlers for triggers/users.
	- Add integration tests that assert audit entries are emitted on config changes (capture DB or stdout as configured).

- Secrets & TLS hardening (#68, #67)
	- Draft `docs/ops/SECRETS.md` with recommended KMS/Vault patterns and rotation steps.
	- Add startup validation guidance for `server/settings.js` to fail if `OD_HOST` defaults to `localhost` in production.
	- Document TLS requirements in `docs/` and add optional startup heuristics to detect obvious self-signed certs.

- Monitoring & runbook (#71)
	- Inventory existing endpoints and identify metrics to export (uptime, error count, auth failures).
	- Draft `docs/design/monitoring.md` with sample Prometheus rules and one runbook play (DB down).
	- Optionally add a lightweight metrics exporter or example instrumentation points in code.

- DB migrations & seed validation (#30 / db-testing.feature)
	- Add CI job that provisions an ephemeral Postgres, runs migrations, runs `seed.ts`, and verifies a deterministic fixture.
	- Add a local README snippet explaining how to run migration/seed tests.

- Traceability & VVP (#69)
	- Create `docs/design/VVP-TRACEABILITY.md` mapping the highest-priority REQ IDs to concrete tests.
	- Run quick coverage / test-gap analysis and open issues for any missing critical tests.

How to claim a task

- Create a branch from `v1.0.0` named `feature/<short-topic>-<issue>`.
- Open a PR back to `v1.0.0` and reference the originating issue number(s).
- Add small, focused tests with each change and ensure `pnpm test` passes locally.

