Follow-up notes for telemetry implementation

Files changed/added on branch `issue/3-observability`:

- `server/telemetry.js` (OpenTelemetry bootstrap + prom-client)
- `server/server.js` (imports telemetry, `/metrics` route, request duration instrumentation)
- `package.json` (added `prom-client` and OpenTelemetry deps)
- `docs/ops/TELEMETRY.md` (instructions)
- `docs/ops/CHANGELOG-TELEMETRY.md`
- `docs/agents/TODO.md`

Suggested follow-up work / PR checklist:

- Review OpenTelemetry package versions and resolve peer dependency warnings.
- Configure OTLP/Jaeger/Zipkin exporter and sensitive env configuration (don't commit secrets).
- Add CI job to run linter/tests with telemetry dependencies present.
- Add integration test verifying `/metrics` responds and contains `odin_` metrics.
- Create a PR from `issue/3-observability` to `main` with these changes.

