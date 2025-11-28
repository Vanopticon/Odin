import type { Histogram } from 'prom-client';

declare module '@hapi/hapi' {
	// Per-request storage used by the server for transient state. We store
	// the prom-client histogram end-timer here as `_metricsTimer` so that
	// the onPreResponse hook can record durations.
	interface RequestApp {
		_metricsTimer?: ReturnType<Histogram['startTimer']>;
	}
}

export {};
