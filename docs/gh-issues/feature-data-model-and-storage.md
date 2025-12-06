---
title: 'Data Model, Migrations, and Seeding'
labels: ['feature', 'db']
---

Summary

Define the database schema ownership, migration strategy, and seed data approach.

Description

Specifies where models live, migration responsibilities, expected constraints, indexing and seeding approaches for test/dev. Aligns with existing `server/db/migrations` and `seed.ts`.

Acceptance criteria

- Migrations apply cleanly in a fresh DB and in CI containers.
- Seed script creates deterministic test fixtures used by unit and integration tests.
- Indexes and constraints exist for common queries (e.g., unique keys for sources, users).

Tasks

- Review `server/db/migrations/*` and ensure each migration is idempotent.
- Add migration test harness to CI to validate forward/backward migrations where feasible.
- Document seed usage and expose `pnpm` script to load test fixtures.

References

- `src/lib/db/`
- `server/db/migrations/`
