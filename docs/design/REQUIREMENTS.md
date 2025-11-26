## Odin — Formal Requirements

Version: 1.0.0

Last updated: 2025-11-25

Purpose

- Provide a single, formal set of requirements for the Odin UI and reporting layer of the Vanopticon suite. These requirements are derived from the repository README, implemented features, and design constraints present in the codebase.

Scope

- The document covers features implemented in the `Odin` repository including UI controls, user permissions, database integration, build & test tooling, and deployment constraints.

Definitions & Context

- Odin: the SvelteKit-based UI and reporting layer for Vanopticon.
- Shared database: the canonical configuration and persistence store used across the Vanopticon suite.
- REQ-: Requirement identifier prefix used for traceability.

Assumptions

- The system runs with SvelteKit 5 and is built/managed with `pnpm`.
- A PostgreSQL-compatible database is used and is reachable via `DATABASE_URL` (see `src/lib/db/data-source.ts`).
- Server-side code enforces authorization and sensitive checks; client-side code uses permission helpers for display/UX.

Functional Requirements

- REQ-001: Manage Triggers — The system shall allow authorized users to create, read, update and delete trigger configurations used by Vanopticon agents.
- REQ-002: Manage Dump-Prep Rules — The system shall allow authorized users to author and manage rules used to prepare data dumps.
- REQ-003: Configuration Storage — All configuration authored in the UI shall be persisted to the shared database and versioned via migrations.
- REQ-004: Reporting UI — The system shall provide a read-only reporting interface that displays sightings, sources, reporters, keywords, and language metadata.
- REQ-005: Role & Permission Model — The system shall expose role- and permission-based access to UI features. Client-side helpers exist (e.g. `hasPermission`, `hasAnyPermission`, `hasAllPermissions`) and panels shall hide or show content based on permissions (see `src/lib/controls/panel.svelte`).
- REQ-006: Migrations & Seeding — Database schema changes shall be applied via repository migrations (`src/lib/db/migrations`) and initial data may be provided via seeding scripts (`src/lib/db/seed.ts`).
- REQ-007: Server-side Initialization — The app shall fail fast when required environment variables are missing (e.g., throw if `DATABASE_URL` is not set in `initializeDataSource`).

Non-Functional Requirements

- REQ-101: Packaging & Tooling — The project shall use `pnpm` for package management and scripts (`pnpm run dev`, `pnpm run build`, `pnpm run preview`, `pnpm test`).
- REQ-102: SvelteKit Version — The project shall use SvelteKit 5 constructs only.
- REQ-103: Security — TLS must be configured with non-self-signed certificates (provided at `/etc/tls/tls/key` and `/etc/tls/tls.crt` in the suite environment). Localhost-only usage (127.0.0.1) is prohibited in production.
- REQ-104: Authorization Enforcement — All security-critical authorization checks must be enforced server-side; client-side permission helpers are strictly for UX.
- REQ-105: Accessibility — The UI shall meet WCAG AAA where practicable for critical workflows (color contrast, keyboard navigation, semantic markup).
- REQ-106: Observability & Logging — The application shall log critical errors and info-level lifecycle events; logs must be structured to support troubleshooting.
- REQ-107: Performance — The UI shall remain responsive for typical operator workloads; pages should render within a reasonable time (target: < 1s TTFP for primary views under nominal load).
- REQ-108: Test Coverage — The project shall include unit tests (Vitest) and Playwright end-to-end tests with CI coverage for critical flows (build + preview on port `4173` for Playwright by default).

Data & Persistence Requirements

- REQ-201: Database Type — Use PostgreSQL (TypeORM `DataSource` configured for `postgres`).
- REQ-202: Connection Env — The application shall obtain the DB connection from `DATABASE_URL` or `DATABASE_URI` env vars; failing to provide one shall cause startup failure.
- REQ-203: Entities — Persisted entities include at least: `Keyword`, `Sighting`, `Source`, `Reporter`, `Language` as present in `src/lib/types` and registered with TypeORM.

API and Integration Requirements

- REQ-301: Shared DB Integration — Odin shall store configuration and operational data in the shared suite database so other Vanopticon components can consume it.
- REQ-302: Migration Compatibility — Migrations are executed from source or built outputs (migrations paths include both `src/...` and `dist/...`).
- REQ-303: External Integrations — Any external integrations (e.g., telemetry, CI, alerting) shall be documented and configurable via environment variables.

Security & Privacy Requirements

- REQ-401: Secrets in Environment — Secrets (DB credentials, TLS keys) must be provided via environment or secure secret stores; secrets must not be committed to source control.
- REQ-402: Least Privilege — UI actions that mutate data must be protected by permissions and server-side checks.
- REQ-403: Data Minimization — Sensitive fields shall be redacted or omitted from logs and non-authorized UI views.

Deployment & Operations

- REQ-501: Build & Preview — The repository shall support `pnpm run build` and `pnpm run preview` for local validation and CI pipelines.
- REQ-502: CI Integration — Playwright tests shall build and preview the site automatically as part of E2E test runs.
- REQ-503: TLS Requirement — Production deployments must use non-self-signed TLS certs; local dev may use different arrangements but must document differences.

Testing & Acceptance Criteria

- REQ-601: Unit Tests — Unit tests for core helpers (permission checks, utilities) shall exist and run under Vitest.
- REQ-602: E2E Tests — Playwright E2E tests shall cover: login/auth flow, permissions-based UI visibility, CRUD for core configuration objects, and reporting views.
- REQ-603: Acceptance — A requirement is accepted when: automated tests for the requirement pass in CI, manual QA has validated critical flows, and an owner has approved the change in the repo's issue/PR flow.

Traceability & IDs

- Map feature work or PRs to requirement IDs (REQ-xxx) in PR descriptions and issue trackers to maintain traceability.

Open Items / Future Work

- FR-EXT-001: Server-side role-to-permission mapping to centralize authorization logic.
- FR-EXT-002: Audit trail for configuration changes.
- NFR-EXT-001: Formal performance budgets and load testing harness.

Acceptance Checklist (quick)

- A) `pnpm install` and `pnpm run dev` run locally without errors (dev server uses `server/server.js`).
- B) Database migrations apply successfully against a Postgres instance and `initializeDataSource` does not throw when `DATABASE_URL` is set.
- C) Playwright E2E tests (existing `e2e/demo.test.ts`) pass in CI and locally using default scripts.
- D) Accessibility spot-checks for primary pages (WCAG contrast and keyboard navigation) pass.

Authors

- Generated from repository code and README by contributor.

Notes

- This file should be used as the canonical functional and non-functional requirements document for short-term planning and PR acceptance. Update it when features or constraints change.
