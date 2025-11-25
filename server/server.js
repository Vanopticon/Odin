import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PROD_MODE, HOST, PORT, TLS_KEY_PATH, TLS_CERT_PATH, RATE_LIMIT_MAX } from './settings.js';

function loadRequiredFile(label, filePath) {
	if (!filePath) throw new Error(`${label} path not provided`);
	if (!fs.existsSync(filePath)) throw new Error(`${label} not found: ${filePath}`);
	return fs.readFileSync(filePath);
}

async function start() {
	const app = express();
	app.disable('x-powered-by');

	const DEV_HOST = process.env.OD_HOST || HOST || 'localhost';
	const APP_PORT = Number(process.env.OD_PORT || PORT || 3000);
	const HMR_PORT = Number(process.env.OD_HMR_PORT || APP_PORT + 1);

	// Load TLS material — required for all modes
	const key = loadRequiredFile('TLS key', TLS_KEY_PATH);
	const cert = loadRequiredFile('TLS cert', TLS_CERT_PATH);

	// Common middleware
	app.use(compression());
	app.use(express.json({ limit: '10kb' }));
	app.use(express.urlencoded({ extended: false, limit: '10kb' }));
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: RATE_LIMIT_MAX,
			standardHeaders: true
		})
	);

	if (!PROD_MODE) {
		// Vite dev server in middleware mode
		const vite = await createViteServer({
			server: {
				middlewareMode: true,
				https: { key, cert },
				hmr: {
					protocol: 'wss',
					host: DEV_HOST,
					port: HMR_PORT,
					clientPort: HMR_PORT
				}
			}
		});

		// Dev mode CSP with unsafe-inline for scripts (HMR)
		app.use(async (req, res, next) => {
			const nonce = crypto.randomBytes(16).toString('base64');
			res.locals.cspNonce = nonce;

			const csp = [
				"default-src 'self'",
				"script-src 'self' 'unsafe-inline'",
				"style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
				"style-src-attr 'self' 'unsafe-inline'",
				"font-src 'self' https://fonts.gstatic.com",
				`connect-src 'self' wss://${DEV_HOST}:${HMR_PORT}`,
				"img-src 'self' data:",
				"object-src 'none'",
				"base-uri 'self'",
				"frame-ancestors 'none'"
			].join('; ');

			res.setHeader('Content-Security-Policy', csp);
			next();
		});

		// Vite middleware
		app.use(vite.middlewares);

		// Serve transformed HTML
		app.use('*', async (req, res) => {
			try {
				let html = fs.readFileSync('index.html', 'utf8');
				html = await vite.transformIndexHtml(req.originalUrl, html);

				html = html.replace('<!--app-->', '<div id="app">DEV</div>');

				res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
			} catch (err) {
				vite.ssrFixStacktrace(err);
				res.status(500).end(err.message);
			}
		});

		https.createServer({ key, cert }, app).listen(APP_PORT, () => {
			console.log(`DEV: https://${DEV_HOST}:${APP_PORT}`);
			console.log(`HMR: wss://${DEV_HOST}:${HMR_PORT}`);
		});

		return;
	}

	// ============================================================================
	// PRODUCTION MODE
	// ============================================================================
	app.use((req, res, next) => {
		const csp = [
			"default-src 'self'",
			"script-src 'self'",
			"style-src 'self' https://fonts.googleapis.com",
			"style-src-elem 'self' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com",
			"img-src 'self' data:",
			"connect-src 'self'",
			"object-src 'none'",
			"base-uri 'self'",
			"frame-ancestors 'none'"
		].join('; ');
		res.setHeader('Content-Security-Policy', csp);
		next();
	});

	app.use(express.static(path.resolve('dist')));

	https.createServer({ key, cert }, app).listen(APP_PORT, () => {
		console.log(`PROD: https://${HOST}:${APP_PORT}`);
	});
}

start();
