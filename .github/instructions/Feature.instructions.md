---
applyTo: '*.feature.json'
---

Features are used to define high-level behaviors and capabilities of the system. Each feature file should contain a clear description of the feature, its category (functional or non-functional), acceptance criteria, tasks, and implementation notes.

- `passes`: set to `false` by default; flip to `true` when the feature is implemented, verified by TestBuilder/Tester, and approved by Reviewer.
- `tests`: feature cards should include a machine-readable `tests` section (authored by the TestBuilder agent) containing positive, negative, and security tests. See `.github/schemas/tests.schema.json` for the required shape.
- `tests_summary`: a short, human-readable summary of the test intent so reviewers and Developers can quickly see test coverage.

Schema & validation

- Feature cards are validated against the repository schema at `.github/schemas/feature-card.schema.json` (which references the `tests` schema). Use the provided validator:

```bash
pnpm install
pnpm run validate:feature path/to/your.feature.json
```

TDD workflow notes

1. Architect writes the feature card (acceptance criteria + tasks + assumptions).
2. TestBuilder authors the `tests` section (positive, negative, security) and adds `tests_summary` to the card.
3. Developer implements to make TestBuilder tests pass (TDD). Developers run the specified test-run commands locally and include test results in handoffs.
4. Tester runs the full test-plan and reports failures/artifacts back to Developer.
5. Reviewer performs a strict review and blocks on any failing gate.
6. Maintainer merges only after Reviewer approval and green CI.

Example Feature Card (minimal):

```json
{
  "id": "API-TRIGGERS-01",
  "title": "API Surface, Validation, and Error Handling",
  "summary": "Define the API endpoints, validation schemas, error model, and testing strategy.",
  "description": "Cover endpoints under `src/routes/api`, their responsibilities, expected inputs/outputs, shared validation logic (schemas), and consistent error responses for the UI and automated tests.",
  "assumptions": ["Clients use JSON v1", "No breaking API changes without version bump"],
  "components": [ { "name": "Route Handlers", "responsibility": "Implement REST endpoints" } ],
  "acceptance_criteria": ["All API endpoints have explicit request/response schemas."],
  "tasks": ["Inventory `src/routes/api/*`"],
  "tests_summary": "Unit + integration tests for schema validation and POST /api/triggers happy/fail paths.",
  "tests": {
    "feature_id": "API-TRIGGERS-01",
    "tests": [
      { "id": "FB-API-TRIGGERS-01-T01", "type": "unit", "category": "positive", "target": "schema validation", "run": "pnpm test -- -t FB-API-TRIGGERS-01-T01", "expected": "201" }
    ]
  },
  "passes": false,
  "created_at": "2025-11-29"
}
```

If you maintain feature files, run `pnpm run validate:feature` during authoring and CI will run the same check on PRs.
