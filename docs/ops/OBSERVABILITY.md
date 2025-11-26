# Observability & Logging

This document describes the minimal observability expectations for the Odin project: a health endpoint and a recommended structured logging format.

## Health endpoint

- Path: `/api/health`
- Method: `GET`
- Response: `200 OK` with JSON payload

Example response:

```json
{
	"status": "ok",
	"timestamp": "2025-11-25T21:00:00.000Z",
	"uptime_seconds": 1234
}
```

The health endpoint is intentionally lightweight and can be used by load balancers, orchestrators, and monitoring probes to verify service liveness. Implementations may extend the endpoint to include readiness checks (DB connectivity, downstream dependencies) behind a separate readiness path if needed.

## Structured logging format (recommendation)

Use JSON structured logs for machine parsing and correlation. Each log entry SHOULD be a single JSON object with the following recommended fields:

- `timestamp` (string, ISO 8601): event time
- `level` (string): one of `debug`, `info`, `warn`, `error` (lowercase)
- `logger` (string): component or module name
- `message` (string): human-readable message
- `service` (string): service name (e.g., `odin`) or subsystem
- `env` (string): environment, e.g., `production`, `staging`, `dev`
- `pid` (number): process id
- `trace_id` (string, optional): request correlation id
- `span_id` (string, optional): span id for tracing
- `meta` (object, optional): additional structured context (user id, request path, status code)

Example log line:

```json
{
	"timestamp": "2025-11-25T21:00:01.123Z",
	"level": "info",
	"logger": "http",
	"message": "request completed",
	"service": "odin",
	"env": "dev",
	"pid": 12345,
	"trace_id": "abcd-1234",
	"meta": { "method": "GET", "path": "/api/health", "status": 200 }
}
```

## Correlation and tracing

- Propagate a `trace_id` (and optionally `span_id`) through incoming requests and use it in all log entries for that request.
- Prefer standard headers like `traceparent` and `tracestate` for distributed tracing integration.

## Metrics

- The service exposes Prometheus-compatible metrics at `/metrics` (plain-text, Prometheus exposition format).
- Default process and runtime metrics are collected with the prefix `odin_` and an HTTP request duration histogram is provided as `odin_http_request_duration_seconds`.

## Tracing bootstrap

- A lightweight OpenTelemetry bootstrap is started when the server launches. By default it uses a console span exporter for development visibility; you can configure an OTLP exporter via environment variables in future.
- Instrumentation is provided for core Node HTTP paths; libraries may add more detailed spans as needed.

## Retention and rotation

- Logs should be rotated and retained according to your operational policies. For production, keep at least 90 days of logs for auditing and incident investigation unless regulatory constraints require otherwise.

## Implementation notes

- Server-side: integrate a structured logger (pino/winston/bunyan) configured to output JSON to stdout so container logs can be collected by infrastructure.
- In development, console-friendly formatting is acceptable behind a flag.
- Avoid logging secrets or full tokens; redact sensitive fields before logging.

## Acceptance

- Health endpoint exists at `/api/health`.
- Observability documentation and logging format recommendation are present in this file.
