# Odin — Developer Quickstart

This quickstart helps developers get Odin running locally for development and testing.

Prerequisites

- Node.js (>=18) and `pnpm` installed.
- A running PostgreSQL instance and an accessible `DATABASE_URL` environment variable.
- Optional: OAuth provider credentials for full auth flows.

Install

```bash
pnpm install
```

Environment

Copy or create a `.env` (not committed) with the minimum required variables:

```
DATABASE_URL=postgres://user:pass@localhost:5432/odin
NODE_ENV=development
# TLS_KEY and TLS_CERT are used in production; for local dev the server can run without them.
```

Run database migrations and seed data

```bash
# Build and run the migration helper
pnpm migrate:run
```

Run the app in development

```bash
pnpm dev
```

Run tests

```bash
pnpm test:unit
pnpm test:e2e
```

Notes

- The `dev` script starts `server/server.js` in dev mode (see `package.json`).
- TLS and production deployment steps are documented in `docs/RELEASE.md`.

If you want, I can also add a `Makefile` or `pnpm` script wrapper to simplify these commands.

# Documentation

_This will be the starting point for all documentation for the project. Documentation must be ready for deployment using GitHub pages and Jekyll._

## Getting Started

- [Main README](../README.md) - Project overview, features, and quick start guide
- [Contributing Guidelines](../CONTRIBUTING.md) - Development setup and contribution process
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community guidelines and standards

- [Changelog](CHANGELOG.md) - Project history and release notes

## User Guides

_Either add short guides heree or link to full guides._

## Examples

_Link to documentaton for each example in the project._

## Developer Documentation

_Provide an overview of getting set up as a developer and provide links to more detailed documentation, including the designs._

## API Documentation

_If the project exposes an API provide an overview of it here and link to detailed (Swagger) documentation. If not, remove this section._
