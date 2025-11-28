import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import os from 'os';
import {
	PROD_MODE,
	HOST as SETTINGS_HOST,
	PORT as SETTINGS_PORT,
	TLS_KEY_PATH,
	TLS_CERT_PATH,
	RATE_LIMIT_MAX
} from './src/lib/settings';

// Vite-specific aliases/local names
export const HOST = SETTINGS_HOST || os.hostname() || 'localhost';
export const PORT = parseInt(String(SETTINGS_PORT || '443'), 10);
// Use process.env for these values to match how other configs load env vars
export const DEV_HMR_HOST = HOST;
export const DEV_HMR_PORT = PORT + 1;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	appType: 'custom',
	build: {
		cssCodeSplit: true,
		minify: 'esbuild'
	},
	server: PROD_MODE
		? { allowedHosts: [HOST], hmr: false }
		: {
				allowedHosts: [HOST],
				https: {
					key: TLS_KEY_PATH,
					cert: TLS_CERT_PATH
				},
				hmr: {
					protocol: 'wss',
					host: DEV_HMR_HOST,
					port: DEV_HMR_PORT,
					clientPort: DEV_HMR_PORT
				}
			},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
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
});
