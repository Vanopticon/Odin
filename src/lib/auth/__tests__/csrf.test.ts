import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

beforeEach(async () => {
	vi.resetModules();
	const testSettings = await import('$lib/test_settings');
	vi.doMock('$lib/settings', () => ({ ...testSettings }));
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('CSRF helpers', () => {
	it('generate and validate match', async () => {
		const csrf = await import('$lib/auth/csrf');
		const token = csrf.generateCsrfToken();
		expect(typeof token).toBe('string');

		const event: any = {
			request: { headers: new Map() as any },
			cookies: { get: (n: string) => token }
		};

		// simulate header via Headers object
		const headers = new Headers();
		headers.set('x-csrf-token', token);
		event.request.headers = headers;

		expect(() => csrf.validateCsrf(event as any)).not.toThrow();
	});

	it('validate throws on mismatch', async () => {
		const csrf = await import('$lib/auth/csrf');
		const event: any = {
			request: { headers: new Headers() },
			cookies: { get: (n: string) => 'cookie-token' }
		};
		event.request.headers.set('x-csrf-token', 'different');

		try {
			csrf.validateCsrf(event as any);
			throw new Error('should have thrown');
		} catch (e: any) {
			expect(e).toHaveProperty('status');
			expect(e.status).toBe(403);
		}
	});
});
