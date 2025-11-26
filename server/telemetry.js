import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import client from 'prom-client';

// Initialize OpenTelemetry Node SDK with either an OTLP exporter (if configured)
// or a ConsoleSpanExporter as a safe default for development.
try {
	const exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
	let traceExporter = null;
	if (exporterEndpoint) {
		traceExporter = new OTLPTraceExporter({ url: exporterEndpoint });
		// eslint-disable-next-line no-console
		console.info('OpenTelemetry: configured OTLP exporter', exporterEndpoint);
	} else {
		traceExporter = new ConsoleSpanExporter();
		// eslint-disable-next-line no-console
		console.info('OpenTelemetry: using ConsoleSpanExporter (dev)');
	}

	const sdk = new NodeSDK({
		traceExporter,
		instrumentations: [getNodeAutoInstrumentations()]
	});

	sdk.start().catch((err) => {
		// Keep running even if telemetry fails to start; log for operational visibility
		// eslint-disable-next-line no-console
		console.error('OpenTelemetry failed to start', err);
	});
} catch (err) {
	// eslint-disable-next-line no-console
	console.error('OpenTelemetry initialization error', err);
}

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'odin_' });

// HTTP request duration histogram (seconds)
export const httpRequestDuration = new client.Histogram({
	name: 'odin_http_request_duration_seconds',
	help: 'HTTP request duration in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

export const metricsRegister = client.register;

export default {
	httpRequestDuration,
	metricsRegister
};
