import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Hapi from '@hapi/hapi';
import telemetry, { httpRequestDuration, metricsRegister } from './telemetry.js';

import { PROD_MODE, HOST, PORT, TLS_KEY_PATH, TLS_CERT_PATH, RATE_LIMIT_MAX } from './settings.js';

function loadRequiredFile(label, filePath) {
	if (!filePath) throw new Error(`${label} path not provided`);
	if (!fs.existsSync(filePath)) throw new Error(`${label} not found: ${filePath}`);
	return fs.readFileSync(filePath);
}

export async function startHapi() {
	const keyPath = TLS_KEY_PATH;
	const certPath = TLS_CERT_PATH;
	const key = loadRequiredFile('TLS key', keyPath);
	const cert = loadRequiredFile('TLS cert', certPath);

	// Security check: ensure TLS key file has restrictive permissions and is owned by this user
	try {
		const s = fs.statSync(keyPath);
		const mode = s.mode & 0o777;
		// deny group/other read/write/exec bits
		if ((mode & 0o077) !== 0) {
			throw new Error(
				`TLS key file ${keyPath} has unsafe permissions (mode ${mode.toString(8)}). It must not be group/other accessible.`
			);
		}
		if (typeof process.getuid === 'function' && s.uid !== process.getuid()) {
			throw new Error(
				`TLS key file ${keyPath} must be owned by the process user (uid ${process.getuid()}) but is owned by uid ${s.uid}`
			);
		}
	} catch (err) {
		throw new Error(`TLS key security check failed: ${err.message}`);
	}

	const server = Hapi.server({
		port: Number(PORT || 3000),
		host: HOST || '0.0.0.0',
		tls: {
			key,
			cert
			// Node chooses TLS versions; ensure OpenSSL supports TLS1.3
		}
	});

	// Global auth intercept: no anonymous access except allowlist
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

	// Record request start time for metrics
	server.ext('onPreHandler', (request, h) => {
		try {
			request.plugins = request.plugins || {};
			request.plugins._metricsTimer = httpRequestDuration.startTimer();
		} catch (e) {
			// non-fatal
		}
		return h.continue;
	});

	// Global error sanitiser
	server.ext('onPreResponse', (request, h) => {
		const response = request.response;
		// record metrics (if started)
		try {
			const end = request.plugins && request.plugins._metricsTimer;
			const status =
				(response && response.statusCode) ||
				(response && response.output && response.output.statusCode) ||
				200;
			const route =
				request.route && request.route.path ? request.route.path : request.path || 'unknown';
			if (typeof end === 'function') {
				end({ method: request.method.toUpperCase(), route, status_code: String(status) });
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

	await server.start();
	console.log(`HAPI server listening at https://${server.settings.host}:${server.settings.port}`);
	return server;
}

if (process.argv[1].endsWith('hapi-server.js')) {
	startHapi().catch((err) => {
		console.error('Failed to start Hapi server', err);
		process.exit(1);
	});
}
