import os from 'os';
// `process` is available at runtime but TS in this environment may not have
// Node.js typings. Declare it locally to keep this config file simple.
declare const process: any;
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig } from '@playwright/test';
console.info('Loading Playwright configuration');

// Allow environment overrides for the test server address. Prefer an
// explicit `PLAYWRIGHT_BASE_URL` if provided (useful in CI). Otherwise
// prefer the server's configured host/port via `OD_HOST`/`OD_PORT`, and
// fall back to localhost:3000. Default to `https` since the dev server
// uses TLS by default in this repo's server implementation.
const envBase = process.env.PLAYWRIGHT_BASE_URL;
const host = process.env.OD_HOST || process.env.HOST || os.hostname() || 'localhost';
const port = process.env.OD_PORT || process.env.PORT || '3000';
const proto = process.env.PLAYWRIGHT_PROTOCOL || 'https';
const URL = envBase || `${proto}://${host}:${port}`;

// Fixed user data dir (no env overrides)
const userDataDir = `${os.homedir()}/.config/chromium`;

function isExecutable(pathname: string): boolean {
	try {
		if (!fs.existsSync(pathname)) return false;
		const stat = fs.statSync(pathname);
		if (!stat.isFile()) return false;
		fs.accessSync(pathname, fs.constants.X_OK);
		return true;
	} catch (e) {
		return false;
	}
}

function findExecutable(candidates: string[]): string | undefined {
	// Use `which` exclusively to resolve candidate names from PATH.
	for (const candidate of candidates) {
		const name = candidate.includes('/') ? candidate.split('/').pop()! : candidate;
		try {
			const resolved = execSync(`which ${name}`, { stdio: ['ignore', 'pipe', 'ignore'] })
				.toString()
				.trim();
			if (resolved && isExecutable(resolved)) return resolved;
		} catch (e) {
			// not found via which, continue
		}
	}

	return undefined;
}

const chromiumCandidates = [
	// simple names first so we can search PATH
	'chromium',
	'chromium-browser',
	'google-chrome-stable',
	'google-chrome',
	'chrome',
	// absolute fallbacks
	'/usr/bin/chromium',
	'/usr/bin/chromium-browser',
	'/usr/bin/google-chrome-stable',
	'/usr/bin/google-chrome',
	'/usr/bin/chrome',
	'/snap/bin/chromium'
];
const chromiumExecutable = findExecutable(chromiumCandidates);

if (chromiumExecutable) console.info(`Detected system Chromium executable: ${chromiumExecutable}`);

// No environment variables used; persistent profile disabled by default.
const usePersistent = false;

// Configure projects so each browser project can use its detected system
// executable. Only configure Chromium for local and CI runs. If a system
// Chromium is detected, prefer it by setting `executablePath`; otherwise
// leave it unset so Playwright uses the bundled browser.
const projects: any[] = [];
const chromiumProject = {
	name: 'chromium',
	use: {
		browserName: 'chromium',
		launchOptions: {
			args: [`--user-data-dir=${userDataDir}`],
			...(chromiumExecutable ? { executablePath: chromiumExecutable } : {})
		}
	}
};

// Prefer system Chromium when available; otherwise fall back to Playwright's bundled Chromium.
projects.push(chromiumProject);

const config = {
	projects,
	use: {
		baseURL: `${URL}`
	},
	webServer: {
		command: 'pnpm dev',
		url: `${URL}`,
		reuseExistingServer: true
	},

	testDir: 'e2e'
};

export default defineConfig(config);
console.debug(`Playwright configuration loaded successfully:\n${JSON.stringify(config)}`);
