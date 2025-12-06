# Vanopticon / Odin — Project Brief

Odin is the user-facing management and reporting UI for the Vanopticon cyber-threat suite. It focuses on operator workflows for configuring detection rules, tuning scoring models, managing feeds/sources, and auditing changes.

Key goals

- Security-first: strict typing and secure defaults.
- Accessibility: WCAG-oriented UI and accessible components.
- Deterministic workflows: rule versioning, diffs, and rollback.

Primary areas

- Configuration management (keywords, IOCs, regex builder)
- Detection tuning and simulation
- Source & feed administration
- Analytics, reporting and audit trails

Important references

- Repo README: `README.md`
- Docs: `docs/` (design, features, e2e guidance)

Notes

- This LTM is intended for agent continuity: short summaries, progress tracking, and handoff notes. Keep entries factual and concise.
Last reviewed: 2025-12-05 — design features and issue inventory reviewed by agent.

Current priorities (high level):

- API surface & schema validation (open issue: #73)
- Audit logging & test coverage (open issue: #72 / #35 / #68)
- RBAC, session, and auth hardening (auth feature + related issues)
- Migration & seed validation for CI (data/migrations tests)
- Operational runbook, monitoring, and secrets/TLS guidance (issues #71, #68, #67)

This LTM summary is intended for humans and agents. For active work, see `active_context.md` and `progress_tracker.md`.
