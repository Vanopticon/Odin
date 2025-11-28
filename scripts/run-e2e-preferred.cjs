#!/usr/bin/env node
// Load the environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Simple helper to locate binaries in PATH
function which(bin) {
	try {
		const out = require('child_process')
			.execSync(`which ${bin}`, { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
		return out || null;
	} catch (e) {
		return null;
	}
}

// Prefer Chromium-family browsers
const chromium =
	which('chromium') ||
	which('chromium-browser') ||
	which('google-chrome') ||
	which('google-chrome-stable') ||
	which('chrome');

const chromedriverCmd = which('chromedriver');

if (!chromium) {
	console.warn(
		'No Chromium binary found in PATH. E2E may fail if chromedriver cannot launch a browser.'
	);
}

if (!chromedriverCmd) {
	console.error(
		'chromedriver binary not found. Please run `pnpm install` to install devDependencies.'
	);
	process.exit(1);
}

const chromedriverPort = process.env.CHROMEDRIVER_PORT || '9515';

// Helper to cleanup child processes and exit
let cdProc = null;
let serverProc = null;
function cleanupAndExit(code) {
	try {
		if (cdProc && !cdProc.killed) cdProc.kill();
	} catch (e) {
		// ignore
	}
	try {
		if (serverProc && !serverProc.killed) serverProc.kill();
	} catch (e) {
		// ignore
	}
	process.exit(code || 0);
}

process.on('exit', () => cleanupAndExit(0));
process.on('SIGINT', () => cleanupAndExit(130));
process.on('SIGTERM', () => cleanupAndExit(143));

// Determine host and port, prefer OD_HOST env, otherwise os.hostname()
const odHost = process.env['OD_HOST'] || os.hostname();
const odPort = process.env['OD_PORT'] || '443';

const chosenServer = `https://${odHost}:${odPort}`;

try {
	const urlObj = new URL(chosenServer);
	const host = urlObj.hostname;
	if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('127.')) {
		console.error(
			'E2E server must not be localhost or 127.0.0.1. Set OD_HOST in .env to a non-loopback HTTPS host.'
		);
		cleanupAndExit(1);
	}
} catch (e) {
	console.error('E2E server URL is invalid:', chosenServer);
	cleanupAndExit(1);
}

// Run each test file in `e2e/` using selenium-webdriver connected to chromedriver.
(async function run() {
	try {
		// Start the server subprocess using the current env (dotenv loaded above)
		console.log('Starting server: node server/server.js');
		serverProc = spawn(process.execPath, ['server/server.js'], {
			stdio: 'inherit',
			env: Object.assign({}, process.env)
		});

		// Wait for the server to be ready (health endpoint)
		const https = require('https');

		function checkReady(url, timeoutMs = 30000, intervalMs = 500) {
			return new Promise((resolve, reject) => {
				const deadline = Date.now() + timeoutMs;

				function attempt() {
					try {
						const req = https.get(url, (res) => {
							// any 2xx/3xx/4xx/5xx means server responded
							res.resume();
							resolve(true);
						});
						req.on('error', (err) => {
							if (Date.now() > deadline) return reject(err);
							setTimeout(attempt, intervalMs);
						});
						req.setTimeout(3000, () => {
							req.abort();
							if (Date.now() > deadline) return reject(new Error('timeout'));
							setTimeout(attempt, intervalMs);
						});
					} catch (e) {
						if (Date.now() > deadline) return reject(e);
						setTimeout(attempt, intervalMs);
					}
				}

				attempt();
			});
		}

		const healthUrl = `${chosenServer.replace(/:443$/, ':')}/api/health`.replace(/:$/, ':' + odPort);
		// More robust URL: ensure :port is present
		const baseUrl = `${chosenServer}`;
		const healthCheck = `${baseUrl.replace(/:\d+$/, '')}:${odPort}/api/health`;
		console.log('Waiting for server readiness at', healthCheck);
		await checkReady(healthCheck, 30000, 500);
		console.log('Server ready');

		// Start chromedriver
		console.log('Starting chromedriver:', chromedriverCmd, 'port', chromedriverPort);
		cdProc = spawn(chromedriverCmd, [`--port=${chromedriverPort}`], { stdio: 'inherit' });

		const selenium = require('selenium-webdriver');
		const { Builder } = selenium;
		const chrome = require('selenium-webdriver/chrome');

		// Ensure certificate validation is enforced by the browser.
		// If a CA file exists at `/etc/tls/ca.crt`, we assume it's installed in the OS trust store.
		const caPath = process.env['OD_CA_CERT'] || '/etc/tls/ca.crt';
		if (fs.existsSync(caPath)) {
			console.log('Found CA certificate at', caPath, '- relying on OS trust store for validation');
		} else {
			console.warn('CA certificate not found at', caPath, "— the browser may reject the server certificate unless it's trusted by the OS");
		}

		const chromeOptions = new chrome.Options();
		// Do not disable certificate checks; enforce validation.
		// Add useful flags for CI environments if desired (kept minimal here).
		// chromeOptions.addArguments('--headless=new'); // enable if you need headless

		const driver = await new Builder()
			.forBrowser('chrome')
			.setChromeOptions(chromeOptions)
			.withCapabilities({ acceptInsecureCerts: false })
			.usingServer(`http://localhost:${chromedriverPort}`)
			.build();

		// Load test files from e2e directory
		const e2eDir = path.join(__dirname, '..', 'e2e');
		const files = fs.readdirSync(e2eDir).filter((f) => f.endsWith('.cjs') || f.endsWith('.js'));

		for (const f of files) {
			const full = path.join(e2eDir, f);
			console.log('Running E2E test:', f);
			const mod = require(full);
			// Support `module.exports = async function(driver, opts)` or `exports.run = async function...`
			const fn = typeof mod === 'function' ? mod : mod.run || mod.default;
			if (!fn) {
				console.warn('E2E file does not export a runnable function:', f);
				continue;
			}
			// call with driver and serverUrl
			await fn(driver, { serverUrl: chosenServer });
			console.log('Passed:', f);
		}

		await driver.quit();
		cleanupAndExit(0);
	} catch (err) {
		console.error('E2E test failure:', err && err.stack ? err.stack : err);
		cleanupAndExit(2);
	}
})();
