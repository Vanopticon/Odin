import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	const host = env['ODIN_HOST'] || 'eros';
	const port = parseInt(env['ODIN_PORT'] || '9120');
	const tls_key = env['ODIN_TLS_KEY'] || '/etc/tls/tls.key';
	const tls_cert = env['ODIN_TLS_CERT'] || '/etc/tls/tls.crt';

	return {
		plugins: [sveltekit()],
		server: {
			origin: `https://${host}:${port}`,
			https: {
				key: tls_key,
				cert: tls_cert,
				minVersion: `TLSv1.3`,
				ecdhCurve: 'X25519:P-256:P-384:P-521',
				requestCert: false,
				rejectUnauthorized: true
			},
			open: false,
			cors: {
				origin: new RegExp(`^https:\/\/${host}:${port}$`),
				methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
				allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
				credentials: true,
				preflightContinue: false,
				optionsSuccessStatus: 204
			}
		},
		clearScreen: false,
		test: {
			expect: { requireAssertions: true },
			projects: [
				{
					extends: './vite.config.ts',
					test: {
						name: 'client',
						environment: 'browser',
						browser: {
							enabled: true,
							provider: 'playwright',
							instances: [{ browser: 'chromium' }]
						},
						include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
						exclude: ['src/lib/server/**'],
						setupFiles: ['./vitest-setup-client.ts']
					}
				},
				{
					extends: './vite.config.ts',
					test: {
						name: 'server',
						environment: 'node',
						include: ['src/**/*.{test,spec}.{js,ts}'],
						exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
					}
				}
			]
		}
	};
});
