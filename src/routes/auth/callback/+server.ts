import type { RequestEvent } from '@sveltejs/kit';
import { exchangeCodeForToken, getUserInfo } from '$lib/auth/oidc';
import { encryptSession } from '$lib/auth/session';

export async function GET(event: RequestEvent) {
	const url = event.url;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	if (!code) return new Response(JSON.stringify({ error: 'code required' }), { status: 400 });

	const storedState = event.cookies.get('od_oauth_state');
	const verifier = event.cookies.get('od_pkce_verifier');
	if (!storedState || !verifier || storedState !== state) {
		return new Response(JSON.stringify({ error: 'invalid state' }), { status: 400 });
	}

	const origin = event.url.origin;
	const redirectUri = `${origin}/auth/callback`;

	const tokenResp = await exchangeCodeForToken({
		code,
		redirect_uri: redirectUri,
		code_verifier: verifier
	});

	// try to fetch userinfo if available
	let user = null;
	if (tokenResp.access_token) {
		try {
			user = await getUserInfo(tokenResp.access_token);
		} catch (e) {
			// best-effort
		}
	}

	// derive groups from userinfo (map claims to odin groups) and create encrypted session
	const groups: string[] = [];
	try {
		if (user) {
			// user may include `groups` or `roles` or `realm_access.roles`
			const u: any = user;
			const claims = [] as string[];
			if (Array.isArray(u.groups)) claims.push(...u.groups);
			if (Array.isArray(u.roles)) claims.push(...u.roles);
			if (u.realm_access && Array.isArray(u.realm_access.roles))
				claims.push(...u.realm_access.roles);
			// normalize and map: admin-like roles -> odin_admins; otherwise odin_users
			const normalized = new Set(claims.map((s) => String(s).toLowerCase()));
			if (
				normalized.has('admin') ||
				normalized.has('odin_admins') ||
				normalized.has('realm-admin') ||
				normalized.has('realm_admin')
			) {
				groups.push('odin_admins');
			}
		}
	} catch (e) {
		// ignore and fall back to default
	}
	// ensure every logged-in user is at least an odin_user
	if (!groups.includes('odin_users')) groups.push('odin_users');

	const session = {
		tokens: tokenResp,
		user,
		groups
	};
	const enc = encryptSession(session);
	// always set secure/httpOnly flags (treat dev like prod)
	event.cookies.set('od_session', enc, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
		maxAge: 60 * 60 * 24 * 7
	});

	// clear pkce cookies (best-effort)
	event.cookies.delete('od_pkce_verifier', { path: '/' });
	event.cookies.delete('od_oauth_state', { path: '/' });

	// redirect to root (or use returnTo)
	const returnTo = url.searchParams.get('returnTo') || '/';
	return new Response(null, { status: 302, headers: { Location: returnTo } });
}
