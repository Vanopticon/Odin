# Telemetry (tracing + metrics)

This file documents the initial telemetry added in branch `issue/3-observability`.

What was added:

- OpenTelemetry bootstrap at `server/telemetry.js` (console span exporter by default).
- Prometheus metrics exposed at `/metrics` (Prometheus exposition format).
- HTTP request duration histogram `odin_http_request_duration_seconds`.
- Server instrumentation: request timer started in Hapi `onPreHandler` and recorded in `onPreResponse`.

How to run locally:

```bash
pnpm install
pnpm run dev
# then visit http://localhost:3000/metrics (or the configured host/port)
```

Notes:

- The OpenTelemetry bootstrap currently uses a console exporter for development; configure OTLP exporters as needed.
- Default Prometheus metrics use the `odin_` prefix.

