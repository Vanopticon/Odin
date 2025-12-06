import { createCipheriv, randomBytes, createDecipheriv, pbkdf2Sync } from 'crypto';
import { OD_COOKIE_SECRET, OD_COOKIE_SALT, OD_COOKIE_PBKDF2_ITERS } from '$lib/settings';

// Use a dedicated cookie secret for session encryption. Do NOT fall back to
// PKCE or other secrets — cookie encryption must be explicit and managed.
//
// Security notes:
// - `OD_COOKIE_SECRET` must be high-entropy (32+ random bytes recommended).
// - If deployment tokens may be low-entropy, set `OD_COOKIE_SALT` and consider
//   using an external KDF or HKDF with a well-managed salt/nonce and rotation
//   strategy. PBKDF2 is used here to harden low-entropy secrets.
const SECRET = OD_COOKIE_SECRET || '';
const SALT = OD_COOKIE_SALT || 'od_cookie_salt_v1';

function getKey() {
	// Derive a 32-byte AES-256 key from the cookie secret using PBKDF2.
	// Iteration count is intentionally high for CPU hardening; adjustable via
	// `OD_COOKIE_PBKDF2_ITERS` environment variable for CI/serverless tradeoffs.
	// TODO: adopt HKDF for more robust key separation and consider adding
	// token versioning for key rotation (`v1`, `v2`, ...).
	const ITER = Number.isFinite(Number(OD_COOKIE_PBKDF2_ITERS)) ? OD_COOKIE_PBKDF2_ITERS : 100000;
	return pbkdf2Sync(SECRET, SALT, ITER, 32, 'sha256');
}

function base64UrlEncode(buf: Buffer) {
	return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlDecode(s: string) {
	s = s.replace(/-/g, '+').replace(/_/g, '/');
	// pad
	while (s.length % 4) s += '=';
	return Buffer.from(s, 'base64');
}

export function encryptSession(obj: unknown) {
	if (!SECRET) throw new Error('OD_COOKIE_SECRET must be set to encrypt session');
	const key = getKey();
	const iv = randomBytes(12); // 96-bit nonce for AES-GCM
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${base64UrlEncode(iv)}.${base64UrlEncode(ciphertext)}.${base64UrlEncode(tag)}`;
}

export function decryptSession(token: string) {
	if (!SECRET) throw new Error('OD_COOKIE_SECRET must be set to decrypt session');
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const iv = base64UrlDecode(parts[0]);
	const ciphertext = base64UrlDecode(parts[1]);
	const tag = base64UrlDecode(parts[2]);
	const key = getKey();
	const decipher = createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	try {
		const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
		return JSON.parse(plain.toString('utf8'));
	} catch (e) {
		return null;
	}
}
