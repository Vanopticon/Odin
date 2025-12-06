import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

export const PROD_MODE = process.env['NODE_ENV']?.toLowerCase() == 'production';

export const TLS_KEY_PATH = process.env['OD_TLS_KEY'] || '/etc/tls/tls.key';
export const TLS_CERT_PATH = process.env['OD_TLS_CERT'] || '/etc/tls/tls.crt';

export const RATE_LIMIT_MAX = parseInt(process.env['OD_RATE_LIMIT_MAX'] || '100', 10);

export const HOST = process.env['OD_HOST'] || os.hostname() || 'localhost';
export const PORT = process.env['OD_PORT'] || 3000;
export const BIND_ADDR = process.env['OD_BIND_ADDR'] || '::';

export const DB_URL = process.env['OD_DB_URL'] || process.env['DATABASE_URL'] || '';

// OAuth / PKCE
export const OD_PKCE_ID = process.env['OD_PKCE_ID'] || '';
export const OD_PKCE_SECRET = process.env['OD_PKCE_SECRET'] || '';
export const OD_OAUTH_URL = process.env['OD_OAUTH_URL'] || '';

// Session secret used for cookie encryption
export const OD_COOKIE_SECRET = process.env['OD_COOKIE_SECRET'] || '';
// Optional salt for cookie key derivation. Change when rotating keys/versioning.
export const OD_COOKIE_SALT = process.env['OD_COOKIE_SALT'] || 'od_cookie_salt_v1';
// PBKDF2 iteration count for deriving the cookie encryption key. Defaults to 100k.
export const OD_COOKIE_PBKDF2_ITERS = parseInt(
	process.env['OD_COOKIE_PBKDF2_ITERS'] || '100000',
	10
);

// HMR / dev
export const OD_HMR_HOST = process.env['OD_HMR_HOST'] || HOST;
export const OD_HMR_PORT = parseInt(process.env['OD_HMR_PORT'] || '3001', 10);

// CI / runtime helpers
export const RUN_MIGRATIONS_SEED = process.env['RUN_MIGRATIONS_SEED'] || '0';
