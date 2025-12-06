**TDD workflow improvements — suggestions**

1. Enforce test-first: require a `tests` section in every feature card before implementation begins. This can be validated by CI using the provided JSON Schema and `scripts/validate-feature.js`.

2. CI stages: have a `testbuilder` stage that validates feature-card `tests` JSON and runs unit/security tests marked `unit`/`security` as a baseline before Developer PRs are allowed to merge.

3. Test artifact storage: standardize where test artifacts (logs, failing request/response dumps, fixtures) are stored (e.g., `artifacts/<pr>-<testid>/`) and include artifact links in handoffs.

4. Security gate: introduce an automated security test runner (e.g., a small suite using OWASP ZAP or custom checks) that is run for any feature with `tests` containing `category: security`.

5. TestBuilder ownership: assign a TestBuilder role (or CI job) that must sign off on tests' clarity before Developer work starts; this prevents churn on unclear tests.

6. Flaky test policy: flaky e2e tests should be quarantined and tracked in a `FLAKY_TESTS.md` document with responsible owner and ticket reference.

7. Review checklist automation: require the Reviewer to upload the JSON `review checklist` produced during review to the PR as `review-checklist.json`; CI can fail merges if blocking items exist.

8. LTM updates: require agents to append significant architectural decisions to `.github/agent_memory/active_context.md` automatically as part of the workflow (manual approval allowed).

9. Documentation enforcement: when a feature changes any public API or schema, CI should check `openapi.yaml` diffs and fail the build if documentation isn't updated.

10. Onboarding docs: add `docs/testbuilder.md` and `docs/reviewer_guide.md` for short templates to reduce human errors and ramp new contributors quickly.

These improvements are incremental and designed to be automated progressively.
