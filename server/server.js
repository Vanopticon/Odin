import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Hapi from '@hapi/hapi';
import telemetry, { httpRequestDuration, metricsRegister } from './telemetry.js';

import { PROD_MODE, HOST, PORT, TLS_KEY_PATH, TLS_CERT_PATH, RATE_LIMIT_MAX } from './settings.js';

function loadRequiredFile(label, filePath) {
	console.debug(`Loading ${label} from ${filePath}`);
	if (!filePath) throw new Error(`${label} path not provided`);
	if (!fs.existsSync(filePath)) throw new Error(`${label} not found: ${filePath}`);
	return fs.readFileSync(filePath);
}

export async function startHapi() {
	console.info(`Starting Hapi server in ${PROD_MODE ? 'production' : 'development'} mode`);

	// Attempt to apply DB migrations at startup when running a built release.
	// In production the project is built to `dist/` and the compiled `data-source`
	// module is available. When `OD_DB_URL` (or `DATABASE_URL`) is configured
	// we must ensure migrations are applied before the server accepts traffic.
	try {
		const dbUrl = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || '';
		const builtDataSource = path.resolve(process.cwd(), 'dist/lib/db/data-source.js');
		if (dbUrl && fs.existsSync(builtDataSource)) {
			console.info('DB URL detected and built data-source present — applying migrations');
			const dsMod = await import(builtDataSource);
			const initializeDataSource =
				dsMod.initializeDataSource || dsMod.default?.initializeDataSource;
			const AppDataSource = dsMod.AppDataSource || dsMod.default?.AppDataSource;
			if (!initializeDataSource || !AppDataSource) {
				console.warn('Built data-source module missing expected exports; skipping migrations');
			} else {
				const ds = await initializeDataSource();
				// Run migrations with optional retries/backoff to tolerate short
				// transient DB errors. Configure via `OD_MIGRATE_RETRIES` and
				// `OD_MIGRATE_BACKOFF_MS` (initial backoff in ms).
				const maxRetries = Number(process.env['OD_MIGRATE_RETRIES'] || '3');
				const baseBackoff = Number(process.env['OD_MIGRATE_BACKOFF_MS'] || '500');
				let attempt = 0;
				let lastErr = null;
				while (attempt < Math.max(1, maxRetries)) {
					try {
						const res = await (ds.runMigrations
							? ds.runMigrations()
							: AppDataSource.runMigrations());
						console.info('Migrations applied:', Array.isArray(res) ? res.map((r) => r.name) : res);
						lastErr = null;
						break;
					} catch (err) {
						lastErr = err;
						attempt += 1;
						const backoff = baseBackoff * Math.pow(2, attempt - 1);
						console.warn(
							`Migration attempt ${attempt} failed, will retry in ${backoff}ms:`,
							err && (err.message || err)
						);
						// eslint-disable-next-line no-await-in-loop
						await new Promise((r) => setTimeout(r, backoff));
					}
				}
				if (lastErr) {
					console.error(
						'Failed to run migrations at startup after retries — aborting startup',
						lastErr && (lastErr.message || lastErr)
					);
					process.exit(1);
				}
			}
		}
	} catch (e) {
		console.error('Error while attempting migrations at startup:', e && (e.message || e));
		process.exit(1);
	}
	console.debug(`Using TLS key: ${TLS_KEY_PATH}`);
	console.debug(`Using TLS cert: ${TLS_CERT_PATH}`);
	const keyPath = TLS_KEY_PATH;
	const certPath = TLS_CERT_PATH;
	const key = loadRequiredFile('TLS key', keyPath);
	const cert = loadRequiredFile('TLS cert', certPath);

	console.debug('Configuring Hapi server');
	const server = Hapi.server({
		port: Number(PORT || 3000),
		host: HOST || '::',
		tls: {
			key,
			cert
		}
	});

	// Global auth intercept: no anonymous access except allowlist
	console.debug('Setting up global auth intercept');
	server.ext('onPreAuth', (request, h) => {
		try {
			const url = request.url.pathname + (request.url.search || '');
			const allowedPrefixes = ['/auth', '/_app', '/static', '/images'];
			const allowedFiles = ['/robots.txt', '/site.webmanifest', '/favicon.ico'];
			const isAsset =
				url.endsWith('.css') ||
				url.endsWith('.js') ||
				url.endsWith('.png') ||
				url.endsWith('.svg') ||
				url.endsWith('.webmanifest');
			const isAllowed =
				allowedPrefixes.some((p) => url.startsWith(p)) ||
				allowedFiles.includes(url.split('?')[0]) ||
				isAsset;
			if (isAllowed) return h.continue;

			const cookie = request.state && request.state.od_session;
			if (!cookie) {
				const accept = request.headers.accept || '';
				if (accept.includes('application/json') || url.startsWith('/api')) {
					return h.response({ error: 'Unauthenticated' }).code(401).takeover();
				}
				const returnTo = encodeURIComponent(url);
				return h.redirect(`/auth/login?returnTo=${returnTo}`).takeover();
			}

			// quick integrity check: ensure token has three parts
			if (String(cookie).split('.').length !== 3) {
				return h.response({ error: 'Unauthenticated' }).code(401).takeover();
			}

			return h.continue;
		} catch (e) {
			console.error('Auth intercept error', e);
			return h.response({ error: 'internal' }).code(500).takeover();
		}
	});

	// Record request start time for metrics. Use `request.app` for per-request
	// storage instead of mutating `request.plugins` which is intended for
	// plugin-specific state and may be treated as read-only by some hooks.
	console.debug('Setting up request metrics timing');
	server.ext('onPreHandler', (request, h) => {
		try {
			// Ensure request.app exists and store the timer there. The returned
			// `end` function records the observed duration when called.
			request.app = request.app || {};
			request.app._metricsTimer = httpRequestDuration.startTimer();
		} catch (e) {
			// non-fatal: metrics should not block request processing
			console.debug('Failed to start metrics timer', e && e.message ? e.message : e);
		}
		return h.continue;
	});

	// In development, mount Vite's dev middleware for HMR. Also attempt
	// to load the generated SvelteKit server handler (built to
	// `.svelte-kit/output/server/index.js`) so we can forward unmatched
	// requests to SvelteKit for SSR. These integrations use the raw
	// request/response objects and the Fetch API where appropriate.
	console.debug('Setting up development middleware and SvelteKit integration');
	let viteServer = null;
	let svelteServerInstance = null;
	const svelteServerPath = path.resolve(process.cwd(), '.svelte-kit/output/server/index.js');

	if (fs.existsSync(svelteServerPath)) {
		try {
			const mod = await import(svelteServerPath);
			const SvelteServer = mod?.Server || mod?.default || mod?.server || null;
			if (SvelteServer) {
				svelteServerInstance = new SvelteServer();
				await svelteServerInstance.init({
					env: process.env,
					read: (file) => {
						try {
							return fs.readFileSync(path.resolve(process.cwd(), file));
						} catch (e) {
							return undefined;
						}
					}
				});
			}
		} catch (e) {
			console.warn('Failed to load SvelteKit server handler:', e && e.message ? e.message : e);
		}
	}

	if (!PROD_MODE) {
		try {
			console.debug('Starting Vite dev middleware');
			const { createServer: createViteServer } = await import('vite');
			viteServer = await createViteServer({ server: { middlewareMode: 'ssr' }, appType: 'custom' });

			// Use Vite's connect-style middleware to handle HMR/static in dev.
			server.ext('onRequest', (request, h) => {
				return new Promise((resolve) => {
					viteServer.middlewares(request.raw.req, request.raw.res, () => resolve(h.continue));
				});
			});
		} catch (e) {
			console.warn('Failed to start Vite dev middleware:', e && e.message ? e.message : e);
		}
	}

	// If SvelteKit server was loaded, use it to handle 404 responses from Hapi
	// (i.e. let SvelteKit attempt to render the requested route). This keeps
	// Hapi's existing error handling in place for other errors.
	if (svelteServerInstance) {
		console.debug('Setting up SvelteKit SSR for unmatched routes');
		server.ext('onPreResponse', async (request, h) => {
			const response = request.response;
			// Only attempt SvelteKit rendering for not-found responses
			if (!(response && response.isBoom)) return h.continue;
			const status = (response.output && response.output.statusCode) || response.statusCode || 0;
			if (status !== 404) return h.continue;

			try {
				const proto = request.headers['x-forwarded-proto'] || 'https';
				const host = request.headers.host || `${server.settings.host}:${server.settings.port}`;
				const fullUrl = `${proto}://${host}${request.url.pathname}${request.url.search || ''}`;

				const init = {
					method: request.method.toUpperCase(),
					headers: request.headers || {},
					body: request.raw.req
				};

				const fetchReq = new Request(fullUrl, init);
				const svelteRes = await svelteServerInstance.respond(fetchReq, {
					env: process.env,
					getClientAddress: () => request.info.remoteAddress,
					read: (file) => {
						try {
							return fs.readFileSync(path.resolve(process.cwd(), file));
						} catch (e) {
							return undefined;
						}
					}
				});

				// Build Hapi response from SvelteKit's Response
				const hapiResp = h.response();
				hapiResp.code(svelteRes.status);
				svelteRes.headers.forEach((v, k) => hapiResp.header(k, v));

				if (svelteRes.body) {
					// Convert web ReadableStream to Node stream if needed
					const { Readable } = await import('stream');
					let nodeStream;
					if (Readable.fromWeb) {
						nodeStream = Readable.fromWeb(svelteRes.body);
					} else {
						// Fallback: create async generator from the web stream
						const reader = svelteRes.body.getReader();
						async function* gen() {
							while (true) {
								const { done, value } = await reader.read();
								if (done) return;
								yield value;
							}
						}
						nodeStream = Readable.from(gen());
					}
					hapiResp.source = nodeStream;
					return hapiResp.takeover();
				} else {
					return hapiResp.takeover();
				}
			} catch (e) {
				console.error('SvelteKit render error:', e && e.message ? e.message : e);
				return h.continue;
			}
		});
	}

	// Global error sanitiser
	console.debug('Setting up global error sanitiser');
	server.ext('onPreResponse', (request, h) => {
		const response = request.response;
		// record metrics (if started)
		try {
			const end = request.app && request.app._metricsTimer;
			const status =
				(response && response.statusCode) ||
				(response && response.output && response.output.statusCode) ||
				200;
			const route =
				request.route && request.route.path ? request.route.path : request.path || 'unknown';
			if (typeof end === 'function') {
				end({ method: request.method.toUpperCase(), route, status_code: String(status) });
				// cleanup the timer reference after recording
				try {
					delete request.app._metricsTimer;
				} catch (e) {
					// ignore
				}
			}
		} catch (err) {
			// ignore metric errors
		}
		if (!response.isBoom) return h.continue;
		const id = crypto.randomBytes(8).toString('hex');
		console.error(`ERROR ${id}`, response.stack || response.message || response);
		const accept = request.headers.accept || '';
		if (accept.includes('application/json') || request.path.startsWith('/api')) {
			return h.response({ error: 'Internal Server Error', id }).code(500);
		}
		const html = `<!doctype html><html><head><meta charset="utf-8"><title>Server error</title></head><body><h1>Something went wrong</h1><p>Reference ID: <strong>${id}</strong></p><p>Please contact support and provide that ID.</p></body></html>`;
		return h.response(html).type('text/html').code(500);
	});

	// Expose Prometheus metrics endpoint
	console.debug('Setting up /metrics endpoint for Prometheus');
	server.route({
		method: 'GET',
		path: '/metrics',
		handler: async (request, h) => {
			try {
				const metrics = await metricsRegister.metrics();
				return h
					.response(metrics)
					.type(metricsRegister.contentType || 'text/plain; version=0.0.4; charset=utf-8');
			} catch (e) {
				return h.response('error').code(500);
			}
		}
	});

	console.info('Starting Hapi server');
	await server.start();
	console.info(`HAPI server listening at https://${server.settings.host}:${server.settings.port}`);
	return server;
}

if (process.argv[1].endsWith('server.js')) {
	startHapi().catch((err) => {
		console.error('Failed to start Hapi server', err);
		process.exit(1);
	});
}
