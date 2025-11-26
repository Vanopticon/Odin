# Compliance & Governance Map (CGM)

**Purpose:**
Provide a concise, actionable mapping between Odin requirements and common external standards so auditors and engineers can find evidence and responsibilities without searching technical design documents.

**Related GitHub Issue:** [#59](https://github.com/Vanopticon/Odin/issues/59)

**References:** NIST SP 800-37 (RMF); NIST SP 800-53; ISO 27001; PCI-DSS; FedRAMP baselines

## 1. Control Mapping (summary)

- **Authentication & Access Control**: NIST 800-53 AC family → maps to `src/lib/auth/` services, `stores.ts`, and `permissions.ts`.
- **Audit & Logging**: NIST AU family → maps to logging design in `src/hooks.server.ts`, `src/lib/db/*` migrations/audit tables, and `VVP` test traces.
- **Configuration Management**: CM family / NIST SP 800-128 → maps to `07-Configuration-Deployment-Specification.md` and `server/settings.js`.
- **Data Protection & Encryption**: SC family / ISO 27001 A.10 → maps to `04-Data-Architecture-Specification.md`, DB schema encryption notes, and secrets handling in deployment specs.
- **Integrity & Input Validation**: SI/PL families → maps to route validation, input sanitization in server endpoints (see `src/routes/api/*`).
- **Incident Response**: IR family → maps to `09-Operational-Security-Runbook.md` and playbooks referenced therein.

Notes:

- This document intentionally references the authoritative design documents (SAO, TMSA, ICD, DAS, CDS, BSS, VVP, OSR) as the single source for implementation details.

## 2. Evidence Sources (where to find artifacts)

- **Design documents**: `docs/design/01-*` through `10-*` for architecture, threat model, interfaces, and operational runbooks.
- **Migrations & schema**: `src/lib/db/migrations/` and `src/lib/db/seed.ts` for structural database evidence.
- **Auth implementation**: `src/lib/auth/*` and route-level auth checks for enforcement evidence.
- **Test artifacts**: `src/__tests__/`, `src/lib/**/__tests__/`, and `e2e/` results (see `test-results/`) for verification evidence tied to VVP.
- **Operational evidence**: CI logs, deployment manifests, and backup snapshots (typically stored in the ops artifact store; reference location in `07-Configuration-Deployment-SpecIFICATION.md`).

## 3. Change Control Workflow (minimal, auditable)

1. Create or update a GitHub Issue (requirements/design change) and link the CGM.
2. Draft or update affected design documents in `docs/design/` and reference the issue.
3. Implement changes in a feature branch; include unit/integration tests and update `VVP` mappings.
4. Open a Pull Request linking the issue and design docs; request at least one reviewer from security/ops.
5. CI runs tests; security checks (linters, SCA) must pass.
6. Merge only after approval and successful CI; tag the release if applicable.
7. Record deployment and evidence (deployment manifest, runbook steps executed) and link to the issue.

Responsibilities:

- **Author**: create issue, update docs, add tests.
- **Reviewer (security/ops)**: validate mapping to controls and evidence sufficiency.
- **Release owner**: ensure evidence is archived and linked in the issue.

## 4. Audit Artifact List (minimal set)

- Approved design documents (SAO, TMSA, ICD, DAS, CDS, BSS, VVP, OSR, CGM).
- Change history: GitHub issues, PRs, and release tags.
- Test evidence: passing CI logs, unit/integration/e2e test results, fuzzing/security scans if performed.
- Deployment evidence: manifests, environment configs, rollback notes.
- Operational logs: anonymized/auditable logs stored per OSR guidance.
- Database migration history and snapshots.

## 5. How to use this document

- Link this CGM section from new requirements issues that introduce control obligations.
- Keep mappings intentionally high-level; implementation detail belongs in the referenced design document.

---

TL;DR: This file maps control families to source docs, lists where evidence lives, and defines a concise, auditable change-control workflow.

