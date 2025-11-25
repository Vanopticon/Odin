<!--
This file is an index of current TODOs / open issues and a lightweight inventory
of missing features and design gaps for the Odin UI/reporting layer.

Generated automatically as the repository "next work" index for contributors.
-->

# TODO / Open Work Inventory

This document collects the next logical work-items, known gaps, and pointers
to relevant files. It is intended to satisfy the acceptance criteria for
issue #17 (Audit repository artifacts).

## Summary (high-level)

- Documentation and design: product requirements, UI wireframes, and design
  docs are missing or in an early stage.
- Authentication & authorization: OAuth providers and server-side route
  guards are listed as planned work.
- Backend APIs: profile, roles, permissions, session/token lifecycle are
  planned but not fully implemented.
- Migrations & seeds: migrations exist; run/seed helpers are present but docs
  can be improved.

## Open issues (selected)

- #16 Define product requirements — create `docs/design/requirements.md` with
  user stories, roles, and permission matrix.
- #15 Create high-level designs — architecture diagrams and UI wireframes to
  be added under `docs/design/`.
- #14 Implement OAuth integration — add OIDC/Google/GitHub providers, server
  flows and secure sessions (see `server/server.js`, `settings.js`).
- #12 Enforce permission checks (routes) — server-side guards / SvelteKit
  hooks to protect routes and APIs.
- #9 Backend APIs & persisted sessions — add endpoints for profiles, role
  management, refresh/logout and document API contracts.
- #8 Database migrations and seed data — ensure `run-migrations.ts` runs
  migrations and seed as required; add docs for migrations.
- #17 Audit repository artifacts — (this file) inventory of missing features
  and pointers for contributors.

> For a full list of issues, see the repository Issues page.

## Existing migrations and DB code

- Migrations are in: `src/lib/db/migrations/`
    + `0001-CreateInitialTables.ts`
    + `0002-CreateAuthTables.ts`
- Migration runner: `src/lib/db/run-migrations.ts` — supports `--seed` or
  `RUN_MIGRATIONS_SEED=1` to seed the database.
- Seed script: `src/lib/db/seed.ts` — contains logic to populate default
  roles and minimal admin user.

## Immediate next steps (suggested)

1. Create `docs/design/requirements.md` (issue #16) with user stories and
   the permission matrix.
2. Create minimal OAuth integration PoC for a single provider (issue #14).
3. Implement server-side permission checks for one representative route
   and add a test (issue #12).
4. Improve `docs/` with a migrations/how-to-run guide (addresses #8).

## Acceptance checklist (for issue #17)

- [x] Inventory of missing features and TODOs created (this file).
- [x] Noted existing migrations and DB code under `src/lib/db/`.
- [x] Linked (this file) under `docs/agents/TODO.md` as requested.

---

If you'd like, I can open PR(s) to implement any one of the suggested next
steps above. Pick A) requirements doc, B) OAuth PoC, C) server-side guards,
or D) migration docs and I'll implement it next.
