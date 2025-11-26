import { randomBytes, createHash } from 'crypto';

let providerConfig: any = null;

import { OD_OAUTH_URL, OD_PKCE_ID, OD_PKCE_SECRET } from '$lib/settings';

export async function getProviderConfig() {
	if (providerConfig) return providerConfig;
	const url = OD_OAUTH_URL;
	if (!url) throw new Error('OD_OAUTH_URL is not set');
	const res = await fetch(url);
	if (!res.ok) throw new Error('Failed to fetch OIDC configuration');
	providerConfig = await res.json();
	return providerConfig;
}

export function generateCodeVerifier() {
	return randomBytes(32).toString('base64url');
}

function base64URLEncode(buffer: Buffer) {
	return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export function codeChallengeFromVerifier(verifier: string) {
	const hash = createHash('sha256').update(verifier).digest();
	return base64URLEncode(hash);
}

export function generateState() {
	return randomBytes(16).toString('base64url');
}

export async function buildAuthorizationUrl({
	redirect_uri,
	state,
	code_challenge
}: {
	redirect_uri: string;
	state: string;
	code_challenge: string;
}) {
	const cfg = await getProviderConfig();
	const url = new URL(cfg.authorization_endpoint);
	url.searchParams.set('client_id', OD_PKCE_ID || '');
	url.searchParams.set('response_type', 'code');
	url.searchParams.set('scope', 'openid profile email');
	url.searchParams.set('redirect_uri', redirect_uri);
	url.searchParams.set('state', state);
	url.searchParams.set('code_challenge', code_challenge);
	url.searchParams.set('code_challenge_method', 'S256');
	return url.toString();
}

export async function exchangeCodeForToken({
	code,
	redirect_uri,
	code_verifier
}: {
	code: string;
	redirect_uri: string;
	code_verifier: string;
}) {
	const cfg = await getProviderConfig();
	const tokenUrl = cfg.token_endpoint;
	const body = new URLSearchParams();
	body.set('grant_type', 'authorization_code');
	body.set('code', code);
	body.set('redirect_uri', redirect_uri);
	body.set('client_id', OD_PKCE_ID || '');
	if (OD_PKCE_SECRET) body.set('client_secret', OD_PKCE_SECRET);
	body.set('code_verifier', code_verifier);

	const res = await fetch(tokenUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: body.toString()
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error('Token exchange failed: ' + text);
	}
	return res.json();
}

export async function getUserInfo(access_token: string) {
	const cfg = await getProviderConfig();
	if (!cfg.userinfo_endpoint) return null;
	const res = await fetch(cfg.userinfo_endpoint, {
		headers: { Authorization: `Bearer ${access_token}` }
	});
	if (!res.ok) return null;
	return res.json();
}
