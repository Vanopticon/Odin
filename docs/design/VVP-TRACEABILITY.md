# VVP Traceability Matrix

This file maps key design requirements (VVP/TMSA/SAO) to the automated tests and evidence currently present in the repository. It is intended to be a living document; update entries when tests or requirements change.

## How to use

Each row lists a requirement id, short description, evidence (file/test), and status.

## Traceability table (initial)

REq-AUTH-PLACEHOLDER

REq-AUTH-PLACEHOLDER

- REQ-AUTH-002: Encrypted session cookie handling
  - Evidence: `src/lib/auth/session.ts`, `src/hooks.server.ts`, relevant tests in `src/lib/auth/__tests__`
  - Status: Covered (unit tests exist for session creation via callback)

- REQ-PERM-001: Permission helpers and client checks
  - Evidence: `src/lib/auth/permissions.ts`, `src/lib/auth/groups.ts`, tests: `src/lib/auth/__tests__/permissions.test.ts`
  - Status: Covered

- REQ-DB-001: Database migrations and seeding
  - Evidence: `src/lib/db/migrations/*`, `src/lib/db/seed.ts`, tests: `src/lib/db/__tests__/data-source.test.ts`, `src/lib/db/__tests__/seed.test.ts`
  - Status: Partially covered (migration run tests exist; recommend CI migration validation)

- REQ-API-001: Server-side permission enforcement for mutation endpoints
  - Evidence: `src/routes/api/triggers/+server.ts`, server guards in `src/lib/auth/server.ts`
  - Status: Partially covered (server-side guards present; add integration tests that assert 401/403 for unauthorized requests)

## Missing/required tests (action items)

- Add integration tests for permission-enforced endpoints (issue #32). These should attempt unauthorized requests and expect 401/403.
- Add contract tests validating API responses against an OpenAPI spec (issue #73).
- Add CI job to run migrations/seeds against disposable DB (issue #30).

## Next steps

- Keep this file updated when new requirements or tests are added. Link PRs and test IDs in the `evidence` column for auditability.
