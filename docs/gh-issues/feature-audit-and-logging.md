---
title: "Audit Logging and Change History"
labels: ["feature", "audit"]
---

Summary

Design for audit entry schema, how audit entries are emitted, stored, and surfaced in the UI.

Description

Audit is critical for Odin. This describes when to emit audit entries, required fields, retention policy, and how to query and display audit history.

Acceptance criteria

- Every mutation endpoint creates an audit record and is covered by an integration test.
- Audit UI can filter by actor, resource type, time range, and action.
- Retention policy implemented as a background job or DB policy.

Tasks

- Add audit emission to missing mutation handlers.
- Write integration tests for audit creation (`src/lib/logging/__tests__`).
- Implement retention job and document retention configuration.

References

- `src/lib/logging/audit.ts`
- `server/db/migrations/0003-CreateAuditEntries.ts`
