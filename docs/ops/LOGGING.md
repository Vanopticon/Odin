# Logging and Audit Guidance

This document defines the project-standard structured logging schema and audit guidance for Odin.

## Goals

Produce machine-parseable JSON logs for ingestion by log aggregators.
Emit auditable events for security-relevant actions (auth, session lifecycle, permission changes, CRUD on sensitive resources).
Include correlation IDs and minimal PII to aid investigations while respecting privacy.

## Log Format (JSON)

All structured logs SHOULD be valid JSON objects written to stdout/stderr. Required fields:

`ts`: ISO-8601 timestamp in UTC (e.g. `2025-11-26T15:04:05Z`).
`level`: log level (`debug`, `info`, `warn`, `error`, `audit`).
`logger`: component name (`auth`, `api.triggers`, `db`, `startup`, etc.).
`msg`: short human-readable message.
`request_id`: opaque correlation id when handling requests (propagate from incoming headers or generate per-request).
`actor`: minimal actor information when applicable (object with `id` or `sub` and `type` e.g. `{ "id": "user:123", "type": "user" }`).
`action`: short action string (e.g. `auth.login`, `session.create`, `trigger.create`, `role.assign`).
`resource`: resource identifier affected (e.g. `trigger:id-uuid`), or `null`.
`outcome`: `success` | `failure` | `partial`.
`meta`: optional object with additional structured context (IP, user agent, error code), avoid full PII.

Example:

```json
{
	"ts": "2025-11-26T15:04:05Z",
	"level": "audit",
	"logger": "auth.callback",
	"msg": "session created",
	"request_id": "d9f1a6b2-4e2a-4b8d-9f6a-3b5f1e6a1b2c",
	"actor": { "id": "user:user1", "type": "user" },
	"action": "session.create",
	"resource": null,
	"outcome": "success",
	"meta": { "ip": "198.51.100.1", "provider": "oidc-example" }
}
```

## Audit Events

Emit `audit`-level logs for events that must be retained for investigation:

- Authentication success/failure
- Session create/delete/refresh
- Permission/role assignment and revocation
- Creation, update, deletion of configuration or sensitive objects (triggers, roles, users)
- Migration and seed runs (success/failure)

Audit logs should include `actor`, `action`, `resource`, and `outcome`.

## Retention & Routing

Logs should be shipped to a centralized logging system (ELK/Opensearch, Datadog, Splunk, etc.).
Retention policies are operational decisions. Recommendations:

- Audit logs: retain for 1 year (or longer per compliance needs).
- Application debug logs: 30 days unless required otherwise.

## Privacy and PII

Avoid logging sensitive PII values. When necessary use hashed or redacted values and note the redaction in `meta.redacted_fields`.

## Implementation Notes

Provide a small helper in code (e.g., `src/lib/logging`) that standardizes JSON output and correlation-id propagation.
Unit tests should assert that the helper emits required fields for each audit event.

## Mapping to runbook and controls

Map audit `action` values to OSR playbooks and to control mappings in `docs/design/10-Compliance-Governance-Map.md`.

## Next steps

Add `src/lib/logging` helper and update auth and API handlers to call it for audit events.
Add CI tests that validate audit entries are emitted on key flows.
