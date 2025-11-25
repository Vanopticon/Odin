import type { RequestEvent } from '@sveltejs/kit';
import {
	generateCodeVerifier,
	codeChallengeFromVerifier,
	generateState,
	buildAuthorizationUrl
} from '$lib/auth/oidc';

export async function GET(event: RequestEvent) {
	// enforce HTTPS for auth endpoints unless explicitly allowed
	// enforce HTTPS for auth endpoints — non-TLS is not permitted
	if (event.url.protocol !== 'https:') {
		return new Response(JSON.stringify({ error: 'HTTPS required for auth endpoints' }), {
			status: 400
		});
	}

	const origin = event.url.origin;
	const redirectUri = `${origin}/auth/callback`;
	const verifier = generateCodeVerifier();
	const challenge = codeChallengeFromVerifier(verifier);
	const state = generateState();

	const authUrl = await buildAuthorizationUrl({
		redirect_uri: redirectUri,
		state,
		code_challenge: challenge
	});

	// store verifier and state in secure httpOnly cookies — treat dev like prod
	event.cookies.set('od_pkce_verifier', verifier, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
		maxAge: 300
	});
	event.cookies.set('od_oauth_state', state, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		path: '/',
		maxAge: 300
	});

	return new Response(null, { status: 302, headers: { Location: authUrl } });
}
