import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';

dotenv.config();

console.debug('Loading server settings from environment variables');
export const PROD_MODE = process.env['NODE_ENV']?.toLowerCase() == 'production';

export const TLS_KEY_PATH = process.env['OD_TLS_KEY'] || '/etc/tls/tls.key';
export const TLS_CERT_PATH = process.env['OD_TLS_CERT'] || '/etc/tls/tls.crt';

export const RATE_LIMIT_MAX = parseInt(process.env['OD_RATE_LIMIT_MAX'] || '100', 10);

export const HOST = process.env['OD_HOST'] || os.hostname() || 'localhost';
export const PORT = process.env['OD_PORT'] || 3000;
export const BIND_ADDR = process.env['OD_BIND_ADDR'] || '::';

export const DB_URL = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || '';

export const OAUTH_CLIENT_ID = process.env['OD_PKCE_ID'] || '';
export const OAUTH_SECRENT = process.env['OD_PKCE_SECRET'] || '';
export const OAUTH_AUTH_URL = process.env['OD_OAUTH_URL'] || '';

// Startup validations for production environments
function validateProductionStartup() {
	if (!PROD_MODE) return;

	const explicitHost = typeof process.env['OD_HOST'] !== 'undefined' && process.env['OD_HOST'] !== '';
	if (!explicitHost) {
		console.error('FATAL: Running in production mode requires `OD_HOST` be explicitly set (not inferred from hostname).');
		process.exit(1);
	}

	const keyPath = TLS_KEY_PATH;
	const certPath = TLS_CERT_PATH;

	const keyExists = fs.existsSync(keyPath);
	const certExists = fs.existsSync(certPath);

	if (!keyExists || !certExists) {
		console.error('FATAL: TLS key/cert not found. Expected files:');
		if (!keyExists) console.error(` - TLS key missing: ${keyPath}`);
		if (!certExists) console.error(` - TLS cert missing: ${certPath}`);
		console.error('Set `OD_TLS_KEY` and `OD_TLS_CERT` or ensure the files exist at the configured locations.');
		process.exit(1);
	}
}

validateProductionStartup();
