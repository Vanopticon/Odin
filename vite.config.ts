import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

export const PROD_MODE: boolean = process.env['NODE_ENV']?.toLowerCase() === 'production';
export const HOST = process.env['OD_HOST'] || os.hostname() || 'localhost';
export const PORT = parseInt(process.env['OD_PORT'] || '3000', 10);
export const TLS_KEY_PATH = process.env['OD_TLS_KEY'] || '/etc/tls/tls.key';
export const TLS_CERT_PATH = process.env['OD_TLS_CERT'] || '/etc/tls/tls.crt';
export const DEV_HMR_HOST = process.env['OD_HMR_HOST'] || HOST;
export const DEV_HMR_PORT = parseInt(process.env['OD_HMR_PORT'] || '3001', 10);
export const RATE_LIMIT_MAX = parseInt(process.env['OD_RATE_LIMIT_MAX'] || '100', 10);

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
