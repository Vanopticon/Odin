import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('server settings', () => {
	const OLD_ENV = { ...process.env };

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...OLD_ENV };
	});

	afterEach(() => {
		process.env = { ...OLD_ENV };
	});

	it('uses production mode when NODE_ENV=production', async () => {
		process.env.NODE_ENV = 'production';
		const settings = await import('../settings.js');
		expect(settings.PROD_MODE).toBe(true);
	});

	it('parses RATE_LIMIT_MAX as integer and falls back to 100', async () => {
		delete process.env.OD_RATE_LIMIT_MAX;
		let settings = await import('../settings.js');
		expect(settings.RATE_LIMIT_MAX).toBe(100);

		// reload with custom value
		vi.resetModules();
		process.env.OD_RATE_LIMIT_MAX = '250';
		settings = await import('../settings.js');
		expect(settings.RATE_LIMIT_MAX).toBe(250);
	});

	it('resolves TLS paths and host defaults', async () => {
		delete process.env.OD_TLS_KEY;
		delete process.env.OD_TLS_CERT;
		delete process.env.OD_HOST;
		const os = await import('os');
		const settings = await import('../settings.js');
		expect(settings.TLS_KEY_PATH).toBe('/etc/tls/tls.key');
		expect(settings.TLS_CERT_PATH).toBe('/etc/tls/tls.crt');
		// HOST should default to os.hostname() or 'localhost'
		expect(settings.HOST).toBe(process.env.OD_HOST || os.hostname() || 'localhost');
	});
});
