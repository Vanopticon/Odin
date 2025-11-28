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

const firefox = which('firefox') || which('firefox-bin');
const chromium =
	which('chromium') ||
	which('chromium-browser') ||
	which('google-chrome') ||
	which('google-chrome-stable') ||
	which('chrome');

let preferred;
if (firefox) preferred = 'firefox';
else if (chromium) preferred = 'chromium';
else preferred = 'chromium'; // fallback to Playwright bundled chromium

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
