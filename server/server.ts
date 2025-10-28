import 'dotenv/config';
import fs from 'fs';
import https from 'https';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { handler } from '../build/handler.js';

// Authored in part by GitHub Copilot (2025-10-28)

const app = express();

/* ---------- Disable X-Powered-By header ---------- */
app.disable('x-powered-by');

/* ---------------- Security: Helmet ---------------- */
app.use(
	helmet({
		contentSecurityPolicy: {
			useDefaults: true,
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", 'data:'],
				connectSrc: ["'self'", process.env.ODIN_HOST ? process.env.ODIN_HOST : 'https://127.0.0.1'],
				frameAncestors: ["'none'"]
			}
		},
		referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
		crossOriginResourcePolicy: { policy: 'same-origin' },
		crossOriginEmbedderPolicy: true,
		crossOriginOpenerPolicy: { policy: 'same-origin' },
		hsts: {
			maxAge: 63072000,
			includeSubDomains: true,
			preload: true
		}
	})
);

/* ---------------- Compression ---------------- */
app.use(compression());

// Logging to stdout/stderr
app.use(morgan('combined'));

/* ---------------- CORS ---------------- */
app.use(
	cors({
		origin: [process.env.ODIN_HOST ? process.env.ODIN_HOST : 'https://127.0.0.1'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
		maxAge: 86400
	})
);

/* ---------------- Static Assets ---------------- */
// Request size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 100, // limit each IP to 100 requests per windowMs
		standardHeaders: true,
		legacyHeaders: false
	})
);

/* ---------------- Static Assets ---------------- */
app.use(
	'/',
	express.static(path.join(process.cwd(), 'build/client'), {
		maxAge: '1y',
		immutable: true
	})
);

/* ---------------- SvelteKit SSR Handler ---------------- */
app.use(handler);

const keyPath = process.env.ODIN_TLS_KEY || '/etc/tls/tls.key';
const certPath = process.env.ODIN_TLS_CERT || '/etc/tls/tls.crt';
const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

const host = process.env.ODIN_HOST || '127.0.0.1';
const port = process.env.ODIN_PORT ? parseInt(process.env.ODIN_PORT) : 443;

const tlsOptions: https.ServerOptions = {
	key,
	cert,
	minVersion: 'TLSv1.3',
	requestCert: false,
	rejectUnauthorized: true,
	ciphers: ['TLS_AES_256_GCM_SHA384', 'TLS_CHACHA20_POLY1305_SHA256'].join(':'),
	ecdhCurve: 'X25519:P-256:P-384:P-521'
};

https.createServer(tlsOptions, app).listen(port, host, () => {
	console.log(`Odin server running with TLS 1.3 on ${host}:${port}`);
});

// Basic error handler
import type { Request, Response, NextFunction } from 'express';

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
	console.error(err instanceof Error ? err.stack : err);
	res.status(500).send('Internal Server Error');
});
