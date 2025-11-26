import { createCipheriv, randomBytes, createDecipheriv, createHash } from 'crypto';

const SECRET = process.env.OD_COOKIE_SECRET || process.env.OD_PKCE_SECRET || '';
if (!SECRET) {
	// do not throw at module load; rely on callers to surface meaningful errors
}

function getKey() {
	// derive 32-byte key from secret using sha256
	return createHash('sha256').update(SECRET).digest();
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
	if (!SECRET) throw new Error('OD_COOKIE_SECRET or OD_PKCE_SECRET must be set to encrypt session');
	const key = getKey();
	const iv = randomBytes(12); // 96-bit nonce for AES-GCM
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
	const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${base64UrlEncode(iv)}.${base64UrlEncode(ciphertext)}.${base64UrlEncode(tag)}`;
}

export function decryptSession(token: string) {
	if (!SECRET) throw new Error('OD_COOKIE_SECRET or OD_PKCE_SECRET must be set to decrypt session');
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
