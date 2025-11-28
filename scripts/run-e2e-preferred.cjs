#!/usr/bin/env node
const { spawnSync, execSync } = require('child_process');

function which(bin) {
	try {
		const out = execSync(`which ${bin}`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
		return out || null;
	} catch (e) {
		return null;
	}
}

const chromium =
	which('chromium') ||
	which('chromium-browser') ||
	which('google-chrome') ||
	which('google-chrome-stable') ||
	which('chrome');

// Always run tests using the Chromium project. If a system Chromium
// executable is available, Playwright will use it via the config; otherwise
// Playwright falls back to its bundled Chromium.
const preferred = 'chromium';
if (chromium) console.info(`Detected system Chromium executable: ${chromium}`);
console.info(`Preferred browser: ${preferred}`);

const extraArgs = process.argv.slice(2);
const args = [
	'exec',
	'playwright',
	'test',
	'--project',
	preferred,
	'-c',
	'playwright.config.ts',
	...extraArgs
];

const res = spawnSync('pnpm', args, { stdio: 'inherit' });
process.exit(res.status || 0);
