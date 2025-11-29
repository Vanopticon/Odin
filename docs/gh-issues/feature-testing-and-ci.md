---
title: "Testing Strategy and CI"
labels: ["feature", "ci", "testing"]
---

Summary

Outline unit, integration, and e2e testing approaches and CI pipeline requirements.

Description

Define test types, where tests live (`src/__tests__`, `server/__tests__`, `e2e/`), how to run them locally, and CI job expectations (migrations, seed, run tests).

Acceptance criteria

- `pnpm test` runs unit + integration tests reliably on CI containers.
- E2E smoke tests (homepage, health) pass against a freshly migrated DB.
- Test artifacts are produced and attached to CI jobs for failures.

Tasks

- Ensure `pnpm test` works locally with developer instructions.
- Add CI job to run migrations before tests and tear down DB afterwards.
- Document how to run subset of tests for faster feedback loops.

References

- `e2e/`
- `server/__tests__`, `src/__tests__/`
