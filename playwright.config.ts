import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';
import { defineConfig } from '@playwright/test';
console.info('Loading Playwright configuration');

// No environment variables are used in this config. Use system hostname
// and standard HTTPS port 443 for the base URL.
const URL = `https://${os.hostname()}:443`;

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
const firefoxCandidates = [
	// search PATH for these names
	'firefox',
	'firefox-bin',
	// absolute fallbacks
	'/usr/bin/firefox',
	'/usr/bin/firefox-bin'
];

const chromiumExecutable = findExecutable(chromiumCandidates);
const firefoxExecutable = findExecutable(firefoxCandidates);

if (chromiumExecutable) console.info(`Detected system Chromium executable: ${chromiumExecutable}`);
if (firefoxExecutable) console.info(`Detected system Firefox executable: ${firefoxExecutable}`);

// No environment variables used; persistent profile disabled by default.
const usePersistent = false;

// Configure projects so each browser project can use its detected system
// executable. Prefer Firefox over Chromium when both are available.
const projects: any[] = [];
// Prepare project descriptors without committing order yet.
const chromiumProject = {
	name: 'chromium',
	use: {
		browserName: 'chromium',
		launchOptions: {
			args: usePersistent ? [`--user-data-dir=${userDataDir}`] : [],
			...(chromiumExecutable ? { executablePath: chromiumExecutable } : {})
		}
	}
};

const firefoxProject = {
	name: 'firefox',
	use: {
		browserName: 'firefox',
		launchOptions: {
			...(firefoxExecutable ? { executablePath: firefoxExecutable } : {})
		}
	}
};

// Choose project ordering based on detected system executables.
// Prefer Firefox first when both browsers are present on the system.
const hasFirefox = !!firefoxExecutable;
const hasChromium = !!chromiumExecutable;

if (hasFirefox || hasChromium) {
	if (hasFirefox) projects.push(firefoxProject);
	if (hasChromium) projects.push(chromiumProject);
} else {
	// No system executables found — fall back to Playwright's bundled Chromium.
	projects.push(chromiumProject);
}

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
