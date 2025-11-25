# Operational Security & Runbook Specification (OSR)

**Purpose:**
Capture the operational controls, monitoring signals, and step-by-step runbooks required to operate Odin securely and reliably.

**References:** NIST SP 800-137 (ISCM); SRE runbook conventions; NIST SP 800-61 (Incident Response)

## Monitoring and Alerting Requirements

- **Key signals to collect:** application errors (5xx), auth failures, slow queries (>500ms), queue/backlog depth, DB migrations status, disk/FS pressure, TLS certificate expiry.
- **Metrics and retention:** Retain 90 days of high-resolution metrics, 365 days of aggregated metrics per `07-Configuration-Deployment-Specification.md`.
- **Alerting rules (examples):**
  - High error rate: >5% 5xx over 5m → Pager alert; run `Runbook: High Error Rate`.
  - Auth failures spike: >200 auth failures / 5m → Pager alert; run `Runbook: Suspected Credential Abuse`.
  - Database connection saturation: >80% connections used for 2m → Pager alert; run `Runbook: DB Saturation`.

## Audit / Logging Scheme

- **Audit events:** all auth events (login, logout, token refresh), permission changes, admin actions, schema migrations, and deployment events.
- **Log retention & protection:** Immutable audit logs exported to long-term store per `07-Configuration-Deployment-Specification.md` and OSR guidance; redact PII before long-term archiving.
- **Evidence for audits:** link PRs, migration files in `src/lib/db/migrations/`, VVP test runs, and CI artifacts.

## Deployment / Rollback Procedures

1. Create a release branch and tag per release process.
2. Run full CI including unit, integration, and e2e suites; confirm VVP mappings are updated.
3. Stage deployment to pre-production environment and run smoke tests (health check, key flows).
4. Promote to production in a controlled rollout (canary or phased). Monitor SLOs for 30m before full promotion.
5. If SLO degradation or critical alerts arise, execute `Rollback Procedure`:
   - Mark the incident in the issue tracker and notify ops.
   - Revert to the previous deployment tag using deployment tooling.
   - Run quick verification smoke tests; if green, document the rollback and close the incident after RCA.

## Incident Response Playbooks (selected)

- Runbook: High Error Rate
  1. Identify scope (service, endpoint). 2. Check recent deploys and migrations. 3. Tail logs and examine stack traces. 4. If regression, rollback; otherwise apply hotfix and test.

- Runbook: Suspected Credential Abuse
  1. Disable affected accounts or rotate compromised credentials. 2. Force logout sessions (`src/lib/auth/session.ts`). 3. Increase auth logging and begin investigation. 4. Notify security and follow disclosure policy.

- Runbook: Database Compromise / Data Loss
  1. Isolate database (read-only / network isolation). 2. Capture forensic snapshots. 3. Identify scope of data exposure. 4. Restore from verified snapshot if restoration is required. 5. Notify stakeholders and follow legal/notification guidance in OSR.

## SLOs / SLIs

- **Availability SLO:** Service availability >= 99.9% per 30-day window for core UI and API endpoints.
- **Latency SLI:** 95th-percentile request latency < 300ms for API endpoints under normal load.
- **Error budget policy:** Teams may use up to 0.1% error budget per month; breaches require a mitigation plan before new releases.

## Operational Dependencies

- External services: Authentication provider (OIDC), database, object storage, SMTP, and monitoring/alerting platform.
- Network considerations: ensure private connectivity and firewall rules aligned with `01-System-Architecture-Overview.md`.

## Security Hardening Steps

- Enforce TLS for all inbound/outbound traffic; manage certs via ops (non-self-signed certs per repository policy).
- Apply least-privilege IAM roles for deployment automation and DB access.
- Keep dependency SCA scans in CI and block merges for critical vulnerabilities.

## Runbook Maintenance

- Maintain each runbook as a short, actionable procedure in `docs/design/09-Operational-Security-Runbook.md` and link to detailed playbooks if needed.
- After any incident, update affected runbooks and the VVP with verification steps derived from the incident RCA.

**GitHub Issue:** [#58](https://github.com/Vanopticon/Odin/issues/58)

---

TL;DR: Actionable monitoring rules, audit requirements, deployment and rollback steps, incident playbooks, SLOs, dependencies, and hardening guidance are recorded here for operations and auditors.
