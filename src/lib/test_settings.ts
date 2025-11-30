// Centralized test settings used by unit tests. Keep values deterministic.
export const DB_URL = '';
export const OD_PKCE_ID = 'test-client';
export const OD_PKCE_SECRET = 'test-secret';
export const OD_OAUTH_URL = 'https://oidc.test/.well-known/openid-configuration';
export const OD_COOKIE_SECRET = 'cookie-secret-for-tests';
export const OD_COOKIE_SALT = 'od_cookie_salt_v1';
export const OD_COOKIE_PBKDF2_ITERS = 100000;
export const RUN_MIGRATIONS_SEED = '0';
export const OD_HMR_HOST = 'localhost';
export const OD_HMR_PORT = 3001;
export default {
	DB_URL,
	OD_PKCE_ID,
	OD_PKCE_SECRET,
	OD_OAUTH_URL,
	OD_COOKIE_SECRET,
	OD_COOKIE_SALT,
	OD_COOKIE_PBKDF2_ITERS,
	RUN_MIGRATIONS_SEED,
	OD_HMR_HOST,
	OD_HMR_PORT
};
