# Telemetry configuration

This file documents how to configure telemetry for Odin (tracing + metrics).

By default the server boots a lightweight OpenTelemetry SDK and uses a console span
exporter for development visibility. Prometheus metrics are exposed at `/metrics`.

To enable exporting traces to a collector, set the following environment variable:

- `OTEL_EXPORTER_OTLP_ENDPOINT` — the OTLP HTTP trace endpoint, for example:
  `http://otel-collector:4318/v1/traces`

When `OTEL_EXPORTER_OTLP_ENDPOINT` is set the server will create an OTLP HTTP
exporter and send spans to the configured endpoint. If the variable is not set,
the server uses a `ConsoleSpanExporter` which prints spans to STDOUT.

Prometheus metrics are collected with the `odin_` prefix. The main HTTP metric
is a histogram named `odin_http_request_duration_seconds` with labels
`method`, `route`, and `status_code`.

Example local run:

```bash
pnpm install
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces pnpm run dev
# visit http://localhost:3000/metrics
```

Security note: do not commit OTLP endpoint credentials or secrets to the repo.
