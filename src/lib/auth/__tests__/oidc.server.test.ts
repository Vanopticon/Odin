import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let testSettings: any;

beforeEach(async () => {
	vi.resetModules();
	testSettings = await import('$lib/test_settings');
	// Mock the runtime settings module so app code reads values from here.
	vi.doMock('$lib/settings', () => ({ ...testSettings }));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('OIDC PKCE helpers and auth handlers', () => {
	it('generates verifier and code challenge', async () => {
		const oidc = await import('$lib/auth/oidc');
		const verifier = oidc.generateCodeVerifier();
		expect(typeof verifier).toBe('string');
		const challenge = oidc.codeChallengeFromVerifier(verifier);
		expect(typeof challenge).toBe('string');
		expect(challenge.length).toBeGreaterThan(0);
	});

	it('buildAuthorizationUrl includes client_id and code_challenge', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};

		// mock fetch for provider discovery
		global.fetch = vi.fn(async (input: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			throw new Error('unexpected fetch ' + input);
		}) as any;

		const oidc = await import('$lib/auth/oidc');
		const verifier = oidc.generateCodeVerifier();
		const challenge = oidc.codeChallengeFromVerifier(verifier);
		const url = await oidc.buildAuthorizationUrl({
			redirect_uri: 'https://app/auth/callback',
			state: 's',
			code_challenge: challenge
		});
		expect(url).toContain('client_id=' + encodeURIComponent(testSettings.OD_PKCE_ID));
		expect(url).toContain('code_challenge=' + encodeURIComponent(challenge));
	});

	it('login handler sets pkce cookies and redirects', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};
		global.fetch = vi.fn(async (input: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			return { ok: true, json: async () => ({}) } as any;
		}) as any;

		const login = await import('../../../routes/auth/login/+server');

		const cookiesSet = [] as any[];
		const event: any = {
			url: new URL('https://app.example/auth/login'),
			cookies: {
				set: (name: string, value: string, opts: any) => cookiesSet.push({ name, value, opts })
			}
		};

		const res: any = await login.GET(event);
		expect(res.status).toBe(302);
		const loc =
			res.headers?.Location || (res.headers && res.headers.get && res.headers.get('Location'));
		expect(loc).toContain(cfg.authorization_endpoint);
		// ensure pkce cookies set
		const names = cookiesSet.map((c) => c.name);
		expect(names).toContain('od_pkce_verifier');
		expect(names).toContain('od_oauth_state');
	});

	it('login handler rejects non-HTTPS when not allowed', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};
		global.fetch = vi.fn(async (input: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			return { ok: true, json: async () => ({}) } as any;
		}) as any;

		const login = await import('../../../routes/auth/login/+server');
		const event: any = {
			url: new URL('http://insecure.example/auth/login'),
			cookies: {
				set: () => {}
			}
		};

		const res: any = await login.GET(event);
		expect(res.status).toBe(400);
		// normalize Response -> JSON
		const text = res.json ? await res.json() : JSON.parse(await res.text());
		const body = typeof text === 'string' ? JSON.parse(text) : text;
		expect(body.error).toMatch(/HTTPS required/);
	});

	it('callback exchanges code, fetches userinfo and sets encrypted session', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};

		// fetch mock: first call discovery, second call token exchange, third call userinfo
		global.fetch = vi.fn(async (input: any, opts?: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			if (typeof input === 'string' && input === cfg.token_endpoint) {
				return { ok: true, json: async () => ({ access_token: 'at', id_token: 'it' }) } as any;
			}
			if (typeof input === 'string' && input === cfg.userinfo_endpoint) {
				return { ok: true, json: async () => ({ sub: 'user1', email: 'u@example.com' }) } as any;
			}
			return { ok: false, text: async () => 'not found' } as any;
		}) as any;

		const callback = await import('../../../routes/auth/callback/+server');
		const cookiesSet = vi.fn();
		const cookiesDeleted = vi.fn();
		const event: any = {
			url: new URL('https://app.example/auth/callback?code=thecode&state=thestate'),
			cookies: {
				get: (name: string) => {
					if (name === 'od_oauth_state') return 'thestate';
					if (name === 'od_pkce_verifier') return 'verifier-value';
					return null;
				},
				set: cookiesSet,
				delete: cookiesDeleted
			}
		};

		const res: any = await callback.GET(event);
		expect(res.status).toBe(302);
		// ensure session cookie set
		expect(cookiesSet).toHaveBeenCalled();
		const calledWith = cookiesSet.mock.calls.find((c: any[]) => c[0] === 'od_session');
		expect(calledWith).toBeTruthy();
	});

	it('callback enriches session with DB roles when DB_URL present', async () => {
		// simulate a DB being configured and mock enrichSessionWithDB to inject roles
		vi.resetModules();
		// import default settings object and create a modified copy with DB_URL
		const tsMod: any = await import('$lib/test_settings');
		const testSettingsLocal: any = { ...(tsMod && tsMod.default ? tsMod.default : tsMod) };
		// ensure DB_URL is present so callback attempts enrichment
		testSettingsLocal.DB_URL = 'postgres://test:test@localhost:5432/testdb';
		vi.doMock('$lib/settings', () => ({ ...testSettingsLocal }));

		// mock enrichSessionWithDB to add roles and permissions
		vi.doMock('$lib/auth/server', () => ({
			enrichSessionWithDB: async (session: any) => {
				if (!session) return session;
				session.roles = ['maintainer'];
				session.permissions = ['manage:triggers'];
				return session;
			}
		}));

		// mock discovery/token/userinfo flow
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};
		global.fetch = vi.fn(async (input: any, opts?: any) => {
			if (typeof input === 'string' && input === testSettingsLocal.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			if (typeof input === 'string' && input === cfg.token_endpoint) {
				return { ok: true, json: async () => ({ access_token: 'at', id_token: 'it' }) } as any;
			}
			if (typeof input === 'string' && input === cfg.userinfo_endpoint) {
				return {
					ok: true,
					json: async () => ({ sub: 'user1', email: 'dbuser@example.com' })
				} as any;
			}
			return { ok: false, text: async () => 'not found' } as any;
		}) as any;

		const callback = await import('../../../routes/auth/callback/+server');
		const cookiesSet = vi.fn();
		const cookiesDeleted = vi.fn();
		const event: any = {
			url: new URL('https://app.example/auth/callback?code=thecode&state=thestate'),
			cookies: {
				get: (name: string) => {
					if (name === 'od_oauth_state') return 'thestate';
					if (name === 'od_pkce_verifier') return 'verifier-value';
					return null;
				},
				set: cookiesSet,
				delete: cookiesDeleted
			}
		};

		const res: any = await callback.GET(event);
		expect(res.status).toBe(302);
		// ensure session cookie set
		expect(cookiesSet).toHaveBeenCalled();
		const calledWith = cookiesSet.mock.calls.find((c: any[]) => c[0] === 'od_session');
		expect(calledWith).toBeTruthy();
		// decrypt the session to inspect roles/permissions
		const { decryptSession } = await import('$lib/auth/session');
		const enc = calledWith[1];
		const dec = decryptSession(enc);
		expect(dec).toHaveProperty('roles');
		expect(dec.roles).toContain('maintainer');
		expect(dec).toHaveProperty('permissions');
		expect(dec.permissions).toContain('manage:triggers');
	});

	it('callback returns 400 when code missing', async () => {
		const callback = await import('../../../routes/auth/callback/+server');
		const event: any = {
			url: new URL('https://app.example/auth/callback'),
			cookies: {
				get: () => null,
				set: () => {},
				delete: () => {}
			}
		};
		const res: any = await callback.GET(event);
		expect(res.status).toBe(400);
		const text = res.json ? await res.json() : JSON.parse(await res.text());
		const body = typeof text === 'string' ? JSON.parse(text) : text;
		expect(body.error).toBe('code required');
	});

	it('callback returns 400 on state mismatch', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};
		global.fetch = vi.fn(async (input: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			return { ok: false, text: async () => 'not found' } as any;
		}) as any;

		const callback = await import('../../../routes/auth/callback/+server');
		const event: any = {
			url: new URL('https://app.example/auth/callback?code=thecode&state=otherstate'),
			cookies: {
				get: (name: string) => {
					if (name === 'od_oauth_state') return 'thestate';
					if (name === 'od_pkce_verifier') return 'verifier';
					return null;
				},
				set: () => {},
				delete: () => {}
			}
		};

		const res: any = await callback.GET(event);
		expect(res.status).toBe(400);
		const text = res.json ? await res.json() : JSON.parse(await res.text());
		const body = typeof text === 'string' ? JSON.parse(text) : text;
		expect(body.error).toBe('invalid state');
	});

	it('callback rejects when token exchange fails', async () => {
		const cfg = {
			authorization_endpoint: 'https://provider/auth',
			token_endpoint: 'https://provider/token',
			userinfo_endpoint: 'https://provider/userinfo'
		};
		// discovery ok, token endpoint returns non-ok
		global.fetch = vi.fn(async (input: any) => {
			if (typeof input === 'string' && input === testSettings.OD_OAUTH_URL) {
				return { ok: true, json: async () => cfg } as any;
			}
			if (typeof input === 'string' && input === cfg.token_endpoint) {
				return { ok: false, text: async () => 'bad token' } as any;
			}
			return { ok: false, text: async () => 'not found' } as any;
		}) as any;

		const callback = await import('../../../routes/auth/callback/+server');
		const event: any = {
			url: new URL('https://app.example/auth/callback?code=thecode&state=thestate'),
			cookies: {
				get: (name: string) => (name === 'od_oauth_state' ? 'thestate' : 'verifier'),
				set: () => {},
				delete: () => {}
			}
		};

		await expect(callback.GET(event)).rejects.toThrow(/Token exchange failed/);
	});
});
