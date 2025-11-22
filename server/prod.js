import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import https from 'node:https';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
const root = process.cwd();

// Production TLS certificate configuration
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || null;
const SSL_CERT_PATH = process.env.SSL_CERT_PATH || null;
const SSL_KEY_RAW = process.env.SSL_KEY || null;
const SSL_CERT_RAW = process.env.SSL_CERT || null;

// Serve static assets first
app.use(express.static(path.resolve(root, 'build')));
app.use(express.static(path.resolve(root, 'build', 'client')));

// mount the SvelteKit adapter-node handler if available
// adapter-node builds include `build/handler.js` which exports a `handler` function
let mounted = false;
try {
	// dynamic import so we don't fail at require-time if the build isn't present
	const mod = await import(path.resolve(root, 'build', 'handler.js'));
	if (mod && typeof mod.handler === 'function') {
		app.use((req, res, next) => {
			// handler expects Node's IncomingMessage and ServerResponse
			Promise.resolve(mod.handler(req, res)).catch(next);
		});
		mounted = true;
		console.log('Mounted SvelteKit handler from build/handler.js');
	} else if (mod && typeof mod.default === 'function') {
		app.use((req, res, next) => {
			Promise.resolve(mod.default(req, res)).catch(next);
		});
		mounted = true;
		console.log('Mounted default export from build/handler.js');
	}
} catch (err) {
	console.warn(
		'Could not mount build handler (no build available). Falling back to static-only server.'
	);
}

if (!mounted) {
	// fallback: serve index.html for SPA style routing
	app.get('*', (req, res) => {
		res.sendFile(path.resolve(root, 'build', 'index.html'));
	});
}

// Basic hardening middleware
app.disable('x-powered-by');
app.use(
	helmet({
		hsts: { maxAge: 60 * 60 * 24 * 365, includeSubDomains: true, preload: true },
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:'],
				connectSrc: ["'self'"],
				frameAncestors: ["'none'"]
			}
		}
	})
);
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000,
		max: 200,
		standardHeaders: true,
		legacyHeaders: false
	})
);

// Read production TLS certs. Require them to be set; do not auto-generate in prod.
let keyPem;
let certPem;
try {
	if (SSL_KEY_RAW && SSL_CERT_RAW) {
		keyPem = SSL_KEY_RAW;
		certPem = SSL_CERT_RAW;
	} else if (SSL_KEY_PATH && SSL_CERT_PATH) {
		keyPem = await fs.readFile(SSL_KEY_PATH, 'utf8');
		certPem = await fs.readFile(SSL_CERT_PATH, 'utf8');
	} else {
		console.error(
			'Production TLS certificate not provided. Set SSL_KEY_PATH/SSL_CERT_PATH or SSL_KEY/SSL_CERT in the environment.'
		);
		process.exit(1);
	}
} catch (err) {
	console.error('Error reading TLS key/cert:', err);
	process.exit(1);
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

// Production timeouts tuning
server.keepAliveTimeout = 65000;
server.headersTimeout = 120000;

// Optional: allow an HTTP listener to redirect to HTTPS if requested (useful behind NATs)
if (process.env.ENABLE_HTTP_REDIRECT === 'true') {
	const http = await import('node:http');
	const redirectPort = process.env.HTTP_PORT || 80;
	http
		.createServer((req, res) => {
			const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
			const redirectUrl = `https://${host}:${PORT}${req.url}`;
			res.writeHead(301, { Location: redirectUrl });
			res.end();
		})
		.listen(redirectPort, () => {
			console.log(`HTTP -> HTTPS redirect listening on port ${redirectPort}`);
		});
}

server.listen(PORT, () => {
	console.log(`Production server (Express) listening on https://localhost:${PORT} (TLS 1.3)`);
});
