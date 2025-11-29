---
title: "API Surface, Validation, and Error Handling"
labels: ["feature", "api"]
---

Summary

Define the API endpoints, validation schemas, error model, and testing strategy.

Description

Cover endpoints under `src/routes/api`, their responsibilities, expected inputs/outputs, shared validation logic (schemas), and consistent error responses for the UI and automated tests.

Acceptance criteria

- All API endpoints have explicit request/response schemas.
- Tests cover positive & negative cases using existing test harness (`pnpm test`).
- Consistent error format documented and used across the API.

Tasks

- Inventory `src/routes/api/*` and ensure each route uses a schema from `src/lib/schemas`.
- Add or normalize error formatting utilities and unit tests for them.
- Document API surface in `docs/` or update `openapi.yaml` as needed.

References

- `src/routes/api/`
- `src/lib/schemas/`
