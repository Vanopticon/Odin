---
title: "Deployment, Configuration, and Operational Runbook"
labels: ["feature", "ops"]
---

Summary

Deployment topology, configuration sources, secrets handling, and operational runbook notes.

Description

Describe recommended deployment (single-node or k8s), environment variables, secret stores, backup/restore for Postgres, and minimal runbook for incident handling.

Acceptance criteria

- Documentation covers how to deploy from main and v1.0.0 branches.
- Health endpoints return expected status and can be used in probe configs.
- Secrets and config practices documented for production use.

Tasks

- Add a short runbook in `docs/` for common ops tasks: backup/restore, rotate keys, handle migrations.
- Document environment variables and required vault entries.

References

- `server.js`, `settings.js`, `docs/odin-implementation-plan-2025-11-27.md`
