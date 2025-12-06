# Patterns & Conventions

This file documents the architecture and implementation patterns used by the Odin project and recommended conventions for contributors and agents.

## Branch & PR conventions

- Branches: `feature/<issue-number>-short-desc` (base off `v1.0.0` for features and fixes).
- PRs: small, single-concern, include tests, link to Issue number and REQ IDs.

## Testing patterns

- Unit tests: use `vitest` for fast, isolated tests.
- Integration/migration tests: use `testcontainers` or an ephemeral Postgres for DB migration tests (`migrate:run` smoke tests).
- E2E: scripts under `scripts/` and `e2e/` directory; CI should run e2e against a preview build.

## Validation & Schemas

- Use `zod` for request/response validation and generate JSON Schema (or use `zod-to-json-schema`) for OpenAPI contract generation.
- Place shared schemas under `src/lib/schemas/` and import in route handlers.

## Logging & Audit

- Structured logging fields: `timestamp`, `level`, `reqId`, `actor`, `action`, `resource`, `outcome`, `message`.
- Centralized logger wrapper in `src/lib/logging/logger.ts` and an audit helper `src/lib/logging/audit.ts`.
- Audit entries should be written both to structured logs and the `audit_entries` DB table for persistence.

## Observability

- Use `prom-client` for metrics and expose `/metrics`.
- Integrate OpenTelemetry SDK for traces where helpful (see `package.json` deps).

## Security

- Fail-fast on missing critical production configuration (TLS keys, main host config).
- Sessions: httpOnly secure cookies, CSRF protection for state-changing endpoints.
