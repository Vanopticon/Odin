import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import selfsigned from 'selfsigned';
import { createServer as createViteServer } from 'vite';

const app = express();
const root = process.cwd();
const PORT = process.env.PORT || 5173;

// Development defaults for TLS cert/key paths (optional)
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || null;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || null;

async function start() {
	// create vite server in middleware mode
	const vite = await createViteServer({
		root,
		server: {
			middlewareMode: 'ssr'
		},
		appType: 'custom'
	});

	// Basic hardening middleware
	app.disable('x-powered-by');
	app.use(
		helmet({
			hsts: { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true, preload: true }
		})
	);
	app.use(compression());
	app.use(express.json({ limit: '10kb' }));
	app.use(express.urlencoded({ extended: false, limit: '10kb' }));
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000,
			max: 100,
			standardHeaders: true,
			header: true
		})
	);

	// use vite's connect instance as middleware
	app.use(vite.middlewares);

	// serve index.html for all other routes (vite + svelte plugin will handle requests)
	app.use('*', async (req, res) => {
		try {
			const url = req.originalUrl;
			// SvelteKit projects use `app.html` as the template. Fall back to `index.html`.
			const templatePath = path.resolve(root, 'app.html');
			const altPath = path.resolve(root, 'index.html');
			let template;
			try {
				template = await fs.readFile(templatePath, 'utf-8');
			} catch (e) {
				template = await fs.readFile(altPath, 'utf-8');
			}
			const html = await vite.transformIndexHtml(url, template);
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
		} catch (err) {
			vite.ssrFixStacktrace(err);
			console.error(err);
			res.status(500).end(err.stack);
		}
	});

	// Prepare TLS options: try provided cert paths first, otherwise generate a dev self-signed cert
	let keyPem;
	let certPem;
	if (SSL_KEY_PATH && SSL_CERT_PATH) {
		try {
			keyPem = await fs.readFile(SSL_KEY_PATH, 'utf8');
			certPem = await fs.readFile(SSL_CERT_PATH, 'utf8');
		} catch (err) {
			console.warn(
				'Could not read provided SSL key/cert paths; falling back to generated dev cert.'
			);
		}
	}

	if (!keyPem || !certPem) {
		console.log('Generating ephemeral self-signed certificate for development (in-memory).');
		const attrs = [{ name: 'commonName', value: 'localhost' }];
		const pems = selfsigned.generate(attrs, { days: 365, algorithm: 'sha256' });
		keyPem = pems.private;
		certPem = pems.cert;
	}

	const tlsOptions = {
		key: keyPem,
		cert: certPem,
		minVersion: 'TLSv1.3',
		maxVersion: 'TLSv1.3',
		honorCipherOrder: true,
		ecdhCurve: 'X25519:secp521r1:secp384r1:prime256v1'
	};

	const server = https.createServer(tlsOptions, app);

	// Tuning timeouts for development
	server.keepAliveTimeout = 65000;
	server.headersTimeout = 120000;

	server.listen(PORT, () => {
		console.log(
			`Dev server (Express + Vite middleware) listening on https://localhost:${PORT} (TLS 1.3)`
		);
	});
}

start().catch((err) => {
	console.error(err);
	process.exit(1);
});
