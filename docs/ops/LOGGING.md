# Logging and Observability (summary)

This short file documents the logging expectations for the Odin project. It complements `docs/ops/OBSERVABILITY.md`.

Recommended structured JSON fields:

- `timestamp` (ISO 8601)
- `level` (`debug`|`info`|`warn`|`error`)
- `service` (string)
- `logger` (module/component)
- `message` (string)
- `trace_id` (optional)
- `span_id` (optional)
- `meta` (object - contextual fields)

Example:

```json
{
	"timestamp": "2025-11-25T21:00:01.123Z",
	"level": "info",
	"service": "odin",
	"logger": "http",
	"message": "request completed",
	"trace_id": "abcd-1234",
	"meta": { "path": "/api/health", "status": 200 }
}
```

Health endpoint: `GET /api/health` returns `200` with `{status: "ok", timestamp, uptime_seconds}`.

Operational note: prefer writing JSON logs to stdout so collectors (fluentd/logstash) can ingest them.
