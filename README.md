# Vanopticon: Odin

[![CI](https://github.com/Vanopticon/Odin/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Vanopticon/Odin/actions/workflows/ci.yml)

Odin is the management and reporting user interface for the Vanopticon cyber-threat suite. It provides operators and analysts with precise controls for detection tuning, configuration management, feed/source administration, and audited change history. Odin focuses on operational clarity, explainability, and accessibility — it configures and tests detection logic and prepares outputs; it does not collect telemetry.

Key principles:

- Security-first: strict typing, secure defaults, and auditability.
- Accessibility: designed for WCAG AAA compliance.
- Deterministic behavior: predictable change effects and versioned rules.
- Operator-focused UX: clear explainability, bulk operations, and rollback.

## Table of Contents

- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License & Contact](#license--contact)

## Features

Odin groups capabilities into three primary areas: Configuration, Detection Tuning, and System Operations. High-level features include:

- Configuration Management
    + Editable keyword/phrase lists, IOCs, and regex-builder with linting.
    + Rule versioning with diffs, rollback, and scheduled effective dates.
    + Bulk import/export and CSV/JSON interchange for large-scale edits.

- Source & Feed Management
    + Enable/disable feeds, per-feed normalization, trust scoring and prioritization.
    + Feed health, last-ingest stats, and conflict resolution rules.

- Detection Logic Tuning
    + Tunable scoring models, multi-condition rule builder, and simulation mode.
    + False-positive feedback loop, whitelists, and explainability panels.

- Analytics & Reporting
    + Dashboards (trend, heatmap, source distribution), correlation views, and IOC propagation analysis.

- Operations & Audit
    + Pipeline and worker health views, audit log with filtering/export, and RBAC-based access control.

For a compact feature overview, see `docs/README.md` and `docs/CHANGELOG.md`.

## Architecture & Tech Stack

- Frontend: SvelteKit 5 (TypeScript) — strict TypeScript settings in `tsconfig.json`.
- Package manager: `pnpm` (monorepo-ready via `pnpm-workspace.yaml`).
- Build: Vite (configured in `vite.config.ts`).
- E2E: Playwright (see `playwright.config.ts` and `e2e/demo.test.ts`).
- Server: lightweight Node/Express adapter used for local dev (`server/server.js`).
- Database: schema and migrations under `src/lib/db/` (TypeORM-like migration scripts).

The project purposely isolates UI/workflow logic from data collection components in the Vanopticon suite.

## Getting Started

Prerequisites

- Node.js 18+ (LTS recommended)
- `pnpm` (install via `npm i -g pnpm`)
- Non-self-signed TLS certificates are required for production deployments (see `docs/express-server.md`). Localhost-only self-signed certs are not allowed by policy.

Quick start (development)

```bash
# from repo root
pnpm install
pnpm dev
```

Open your browser at the local dev URL printed by the dev server. For CI and production builds use `pnpm build` followed by your production host steps.

Project layout (high level)

- `src/` — application sources (Svelte pages, lib, routes)
- `src/lib/db/` — data-source, migrations, and seed scripts
- `docs/` — design docs, architecture notes, and operation guides
- `e2e/` — end-to-end tests (Playwright)

## Development

Scripts (defined in `package.json`)

```bash
pnpm install        # install dependencies
pnpm dev            # run development server
pnpm build          # build for production
pnpm test           # run unit & integration tests (where configured)
pnpm e2e            # run end-to-end Playwright tests
```

Editor recommendations

- Use an editor with TypeScript and Svelte support (VS Code + Svelte extension).
- Respect `prettier` and the repo linting rules. The repo uses tabs for indentation.

Database and migrations

The repo includes migration scripts in `src/lib/db/migrations/`. Use the included runner `src/lib/db/run-migrations.ts` and the seed file `src/lib/db/seed.ts` for local development. See `docs/README-db.md` for environment configuration.

## Testing

- Unit tests: located under `src/__tests__/` and run via the `pnpm test` script.
- E2E: Playwright tests are in `e2e/` and can be run with `pnpm e2e`.

Example: run e2e locally

```bash
pnpm install
pnpm build
pnpm start   # start production-like server
pnpm e2e
```

## Security

- The project follows a security-first posture: no self-signed TLS in production, strict TypeScript settings, and secure defaults.
- Sensitive secrets should be provided by environment variables or secret management systems — do not commit secrets.
- See `SECURITY.md` for disclosure and responsible reporting procedures.

## Contributing

We welcome contributions. Please follow these guidelines:

1. Open an issue to discuss large changes before implementing.
2. Branch from `v1.0.0` and open a PR against `v1.0.0` with a clear description and tests where applicable.
3. Keep patches small and focused. Follow repository coding standards (tabs for indentation, TypeScript strictness).

See `docs/` for design and architecture guidelines, and check existing issues for priorities. The repo uses an issue board (`docs/agents/PROJECT_BOARD.md`) for planning.

## Roadmap

- CI improvement and security scanning
- Expanded simulation and model-testing tools
- Additional reporting formats and export options

If you'd like to propose features, open an issue and tag it `enhancement`.

## License & Contact

This repository is licensed under the terms in `LICENSE.md`.

For questions or to report security issues, see `SECURITY.md` or contact the maintainers via the repository issue tracker.

---

TL;DR

- `Odin` is the Vanopticon UI for managing detection rules, feeds, and audits.
- Start dev with `pnpm install` and `pnpm dev`.
- Read `docs/` for architecture and deployment details.
