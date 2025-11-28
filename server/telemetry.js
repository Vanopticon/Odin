import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import client from 'prom-client';
// The `@opentelemetry/resources` and `@opentelemetry/semantic-conventions`
// packages are optional at runtime for some environments. Load them
// dynamically so missing optional packages won't crash the server startup.

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

	// Allow service.name to be set via env, otherwise use a sensible default
	const serviceName = process.env.OTEL_SERVICE_NAME || process.env.SERVICE_NAME || 'odin-server';

	// Attempt to dynamically load resource helpers. If they are not
	// available, continue without setting a Resource (SDK will still work).
	let resourceOption = undefined;
	try {
		// Load resource helpers; be tolerant of differing package shapes across
		// OpenTelemetry versions (some versions export Resource differently).
		const resourcesModule = await import('@opentelemetry/resources');
		const semconvModule = await import('@opentelemetry/semantic-conventions');
		const ResourceCandidate =
			resourcesModule.Resource || resourcesModule.default || resourcesModule;
		const SemanticResourceAttributes =
			semconvModule.SemanticResourceAttributes || semconvModule.default || semconvModule;

		// Attempt to construct or obtain a Resource in a few compatible ways.
		try {
			if (typeof ResourceCandidate === 'function') {
				resourceOption = new ResourceCandidate({
					[SemanticResourceAttributes.SERVICE_NAME]: serviceName
				});
			} else if (ResourceCandidate && typeof ResourceCandidate.create === 'function') {
				resourceOption = ResourceCandidate.create({
					[SemanticResourceAttributes.SERVICE_NAME]: serviceName
				});
			} else if (ResourceCandidate && typeof ResourceCandidate.from === 'function') {
				resourceOption = ResourceCandidate.from({
					[SemanticResourceAttributes.SERVICE_NAME]: serviceName
				});
			} else {
				// As a last-resort, try to use the module directly if it already
				// represents a Resource-like object.
				resourceOption = ResourceCandidate;
			}
			// eslint-disable-next-line no-console
			console.info('OpenTelemetry: resource and semantic conventions loaded (compat)');

			// Validate that the created resource looks like an OpenTelemetry
			// Resource (some SDK code expects a `merge` function). If not,
			// discard and continue without explicit resource to avoid
			// runtime errors in differing versions.
			if (!(resourceOption && typeof resourceOption.merge === 'function')) {
				// eslint-disable-next-line no-console
				console.warn(
					'OpenTelemetry: created resource is incompatible with SDK, ignoring explicit resource'
				);
				resourceOption = undefined;
			}
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(
				'OpenTelemetry: failed to construct Resource from optional modules, continuing without explicit Resource:',
				e && e.message ? e.message : e
			);
		}
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn(
			'OpenTelemetry optional resource modules not available, continuing without explicit Resource:',
			e && e.message ? e.message : e
		);
	}

	const sdk = new NodeSDK({
		...(resourceOption ? { resource: resourceOption } : {}),
		traceExporter,
		instrumentations: [getNodeAutoInstrumentations()]
	});

	// Start SDK and register a graceful shutdown handler. Keep failures non-fatal.
	(async () => {
		try {
			await sdk.start();
			// eslint-disable-next-line no-console
			console.info('OpenTelemetry: SDK started');
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error('OpenTelemetry failed to start', err);
		}

		// On process exit attempt to shutdown the SDK cleanly
		const shutdown = async () => {
			try {
				await sdk.shutdown();
				// eslint-disable-next-line no-console
				console.info('OpenTelemetry: SDK shut down');
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error('OpenTelemetry shutdown error', err);
			}
		};

		process.on('SIGTERM', shutdown);
		process.on('SIGINT', shutdown);
	})();
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
