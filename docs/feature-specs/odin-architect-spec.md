# Odin Architect Feature Specification

Date: 2025-11-27

## Overview

This document captures the Discovery & Spec for the initial implementation work described by the Architect plan. It defines goals, success criteria, user stories, non-goals, high-level data and API contracts, and a test matrix for acceptance.

## Goals

- Provide a secure, auditable management interface for detection tuning, configuration, and source/feed administration.
- Ensure role-based access control (RBAC) is enforced consistently across server and client.
- Ship an MVP with DB-backed roles/permissions, OIDC login (PKCE), encrypted sessions, trigger management UI, and tests.

## Success criteria

- Core flows (login, view triggers, create/update/delete triggers) work end-to-end in staging.
- RBAC enforced server-side and client UI hides actions the user is not permitted to perform.
- Automated tests (unit + integration + e2e) cover positive, negative, and security cases for changed modules.
- Accessibility automated checks (axe) pass on critical pages; key flows manually verified for WCAG AA.
- Migration scripts and rollback steps are present and validated in staging.

## Non-goals (initial release)

- Full multi-tenant support.
- Complex workflow orchestration beyond trigger CRUD and user management.

## User stories

1. As an admin, I can log in with the organization's OIDC provider and manage triggers.
2. As a maintainer, I can create and edit triggers but cannot manage users.
3. As a viewer, I can view triggers but cannot create/update/delete them.
4. As an operator, I can run migrations and seed the DB in staging; I can roll back if needed.

## High-level Data changes

- Existing migrations `0001` and `0002` provide baseline tables. Future migrations (eg. `0003`) may add:
    + Additional columns on `triggers` (metadata, owner id) and auditing fields (changed_by, changed_at).
    + Soft-delete flag if needed for auditability.

## Auth & Session contract

- OIDC login uses PKCE; after successful token exchange the server must:
    + Map OIDC claims and/or groups into application roles.
    + Persist a minimal session payload into an encrypted cookie `od_session` containing: `sub`, `email`, `roles`, `permissions`, `expiresAt`.
    + Use `OD_COOKIE_SECRET` exclusively to encrypt sessions (AES-256-GCM). Do not fall back to `OD_PKCE_SECRET`.

Session shape (example):

```
{
  sub: string,        // subject / user id
  email?: string,
  roles: string[],    // e.g. ["admin"]
  permissions: string[],
  expiresAt: string   // ISO timestamp
}
```

Cookies must be set with `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` depending on redirect flows.

## API endpoints (high-level)

- `GET /api/triggers` — list triggers (auth: view:triggers)
- `GET /api/triggers?id=...` — get single trigger (auth: view:triggers)
- `POST /api/triggers` — create trigger (auth: manage:triggers)
- `PUT /api/triggers` — update trigger (auth: manage:triggers)
- `DELETE /api/triggers?id=...` — delete trigger (auth: manage:triggers)

Request validation: all mutating endpoints must validate input with a schema library (e.g., `zod`) and return 400 on invalid input.

CSRF: when using cookie-based sessions, enforce CSRF protection (double-submit cookie or origin check + SameSite). Document chosen approach.

## UI pages / components (MVP)

- `/` — Home/Dashboard (shows summary, health checks)
- `/triggers` — Triggers list (table) with create/edit/delete controls shown per-permission
- `/triggers/new` and `/triggers/:id/edit` — forms for create and update (client-side validation + server validation)
- `/auth/login` and `/auth/callback` — OIDC login flow pages

Accessibility: forms and tables must be keyboard navigable and provide aria-labels for interactive controls.

## Test Matrix (Acceptance)

- Unit tests: auth helpers, session encrypt/decrypt, permission helpers.
- Integration tests: `requireAuth` redirects, `requirePermission` denies/permits based on session and header scenarios.
- e2e tests: login flow (mock OIDC or use test provider), trigger create/edit/delete flows, and rollback smoke test.
- Security tests: input fuzzing for trigger endpoints, CSRF test for mutating endpoints.

## Milestones & Estimates

MVP (deliverable in first PR):

- OIDC login + session persistence, require `OD_COOKIE_SECRET` (2–3d)
- Trigger endpoints validation + tests (2–3d)
- Minimal UI for triggers (3–5d)

Polish & Hardening:

- DB role->permission adapter and mapping (2–3d)
- CSRF + cookie hardening + docs (1–2d)
- Accessibility and security hardening (2–3d)

Total rough estimate: 10–21 working days.

## Immediate next steps

1. Create feature branch `feature/architect-plan-20251127` from `v1.0.0`.
2. Implement server-side requirement: `OD_COOKIE_SECRET` required for session encryption (adjust `src/lib/auth/session.ts`).
3. Add `zod` validation to `src/routes/api/triggers/+server.ts` for POST/PUT.
4. Add integration tests for permission enforcement.

## Docs & Rollout notes

- Document `x-groups` fallback behavior and recommend mapping groups to DB roles for production deployments.
- Provide rollback commands and smoke-test checklist in `docs/release/rollout.md` when migrations are included.

---

Authored by: Architect (copilot)
