# Project: Odin

## Overview

Odin is the management and reporting interface for the Vanopticon cyber-threat suite. It provides a hardened, auditable UI and API for detection tuning, source/feed administration, configuration management, and audited change history. Odin prepares and evaluates detection logic; it does not collect telemetry.

Repository: `Vanopticon/Odin`

Primary goals:

- Operational clarity and explainability for analysts
- Hardened server and secure auth flows
- Traceable configuration changes with full audit trails
- Testable, observable, and documented APIs

## Where to find important artifacts

- Implementation plan: `docs/odin-implementation-plan-2025-11-27.md`
- Agent progress snapshots: `docs/agents/agent-progress-20251127.md`
- Design docs: `docs/design/`
- Server code: `server/` and `src/`

## Acceptance criteria (project-level)

- Tests: unit, integration, and e2e for modified functionality
- CI: lint, test, and contract checks (OpenAPI/spectral) in CI
- Security: startup validation for production secrets/TLS, hardened session handling
- Observability: structured logs and `/metrics` instrumentation

## TL;DR

- **Purpose**: Admin UI + API for detection/config management (no telemetry collection).
- **Stack**: SvelteKit + TypeScript frontend, Node server, Postgres + TypeORM, Zod for validation.
- **Priorities**: OpenAPI + validation, audit logging, startup validation (TLS/secrets), CI for migrations.
- **Branching**: feature branches off `v1.0.0`; small PRs, tests required.
- **This file**: canonical in-repo project brief for agents and contributors.
