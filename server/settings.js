import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

export const PROD_MODE = process.env['NODE_ENV']?.toLowerCase() == 'production';
export const HOST = process.env['OD_HOST'] || os.hostname() || 'localhost';
export const PORT = process.env['OD_PORT'] || 3000;
export const TLS_KEY_PATH = process.env['OD_TLS_KEY'] || '/etc/tls/tls.key';
export const TLS_CERT_PATH = process.env['OD_TLS_CERT'] || '/etc/tls/tls.crt';
export const RATE_LIMIT_MAX = parseInt(process.env['OD_RATE_LIMIT_MAX'] || '100', 10);
