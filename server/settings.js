import dotenv from 'dotenv';
import os from 'os';

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
