---
title: "Authentication, Session, and RBAC"
labels: ["feature", "auth"]
---

**Summary**

Design for integrating OIDC, session management, and role-based access control.

**Description**

Define how users authenticate, how sessions are stored and validated, how group claims map to local roles, and how permission checks are enforced in the API and UI.

**Acceptance criteria**
- Login flow works end-to-end with configured provider and tests for `src/lib/auth` pass.
- Session expiration and revocation behavior specified and implemented.
- RBAC rules cover admin, editor, viewer roles and are enforced by tests.
- Sensitive endpoints return 403 when user lacks permission.

**Tasks**
- Audit existing files: `src/lib/auth/*.ts` and `src/routes/auth/*`.
- Add RBAC unit tests for key API endpoints in `src/routes/api`.
- Document mapping strategy for provider groups to local roles (configurable).

**References**
- `src/lib/auth/`
- `src/hooks.server.ts`
- `src/routes/auth/`
