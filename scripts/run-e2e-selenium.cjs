#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// chromedriver binary path from npm package (if available)
let chromedriverPath;
try {
	chromedriverPath = require('chromedriver').path;
} catch (e) {
	chromedriverPath = null;
}

const REPO_ROOT = process.cwd();
const PROFILE_DIR = path.resolve(REPO_ROOT, '.chromium-profile');
const HOST = process.env.OD_HOST || os.hostname();
const PORT = process.env.OD_PORT || '3000';
const BASE_URL = `https://${HOST}:${PORT}`;

let serverProc = null;
let driver = null;
let resolvedChromedriverPath = null;

function startDevServer() {
	console.log('Starting dev server...');
	serverProc = spawn('pnpm', ['dev'], { cwd: REPO_ROOT, stdio: 'pipe' });
	serverProc.stdout.on('data', (d) => process.stdout.write(`[dev stdout] ${d}`));
	serverProc.stderr.on('data', (d) => process.stderr.write(`[dev stderr] ${d}`));
	serverProc.on('close', (code) => {
		console.log(`Dev server exited with code ${code}`);
		if (driver == null) process.exit(code || 0);
	});
}

function checkServerReady(url, timeoutMs = 120000, intervalMs = 1000) {
	const deadline = Date.now() + timeoutMs;
	return new Promise((resolve, reject) => {
		(async function poll() {
			if (Date.now() > deadline) return reject(new Error('Timed out waiting for server'));
			try {
				await new Promise((res, rej) => {
					const req = https.get(url, { rejectUnauthorized: false }, (res2) => {
						res2.resume();
						res();
					});
					req.on('error', (err) => rej(err));
				});
				return resolve();
			} catch (err) {
				setTimeout(poll, intervalMs);
			}
		})();
	});
}

async function locateChromedriver() {
	// 1) Prefer system chromedriver binaries in well-known locations
	try {
		const systemCandidates = [
			'/usr/bin/chromedriver',
			'/usr/local/bin/chromedriver',
			'/snap/bin/chromedriver',
			'/opt/google/chrome/chromedriver'
		];
		for (const s of systemCandidates) {
			try {
				if (s && fs.existsSync(s)) {
					fs.accessSync(s, fs.constants.X_OK);
					resolvedChromedriverPath = s;
					console.log('Using system chromedriver at', s);
					return;
				}
			} catch (e) {}
		}

		// 2) Fallback: prefer PATH chromedriver
		const which = spawnSync('which', ['chromedriver'], { stdio: ['ignore', 'pipe', 'pipe'] });
		if (which && which.status === 0) {
			const p = (which.stdout || Buffer.from('')).toString().trim();
			if (p) {
				try {
					fs.accessSync(p, fs.constants.X_OK);
					resolvedChromedriverPath = p;
					console.log('Using chromedriver from PATH at', p);
					return;
				} catch (e) {}
			}
		}
	} catch (e) {}

	// 2) Try package/local candidates
	const candidates = [];
	if (chromedriverPath) candidates.push(chromedriverPath);
	candidates.push(path.join(REPO_ROOT, 'node_modules', '.bin', 'chromedriver'));
	candidates.push(
		path.join(REPO_ROOT, 'node_modules', 'chromedriver', 'lib', 'chromedriver', 'chromedriver')
	);

	for (const c of candidates) {
		if (!c) continue;
		try {
			const res = spawnSync(c, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
			if (res && res.status === 0) {
				const out = (res.stdout || Buffer.from('')).toString();
				console.log('Found chromedriver executable:', c, out.trim());
				resolvedChromedriverPath = c;
				return;
			}
		} catch (e) {}
	}

	// 3) Auto-download matching chromedriver for installed Chrome/Chromium (best-effort)
	try {
		const probes = [
			'google-chrome',
			'google-chrome-stable',
			'chromium',
			'chromium-browser',
			'chrome'
		];
		let versionStr = null;
		for (const cmd of probes) {
			try {
				const r = spawnSync(cmd, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'] });
				if (r && r.status === 0) {
					const out = (r.stdout || Buffer.from('')).toString();
					const m = out.match(/(\d+\.\d+\.\d+\.\d+)/);
					if (m) {
						versionStr = m[1];
						break;
					}
				}
			} catch (e) {}
		}

		if (versionStr) {
			const arch = os.arch();
			const platformMap = { arm64: 'linux-arm64', x64: 'linux64', ia32: 'linux64' };
			const platform = platformMap[arch] || 'linux64';
			const release = versionStr;
			const cacheDir = path.join(REPO_ROOT, '.chromedriver-cache', release);
			const binName = platform.startsWith('win') ? 'chromedriver.exe' : 'chromedriver';
			const binPath = path.join(cacheDir, binName);
			if (fs.existsSync(binPath)) {
				resolvedChromedriverPath = binPath;
				console.log('Using cached chromedriver at', binPath);
				return;
			}

			// chrome-for-testing download URL pattern
			const zipUrl = `https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/${release}/${platform}/chromedriver-${platform}.zip`;
			console.log('Attempting to download chromedriver from', zipUrl);
			fs.mkdirSync(cacheDir, { recursive: true });
			const zipDest = path.join(cacheDir, 'chromedriver.zip');
			await new Promise((resolve, reject) => {
				const out = fs.createWriteStream(zipDest);
				https
					.get(zipUrl, (res) => {
						if (res.statusCode !== 200)
							return reject(new Error('Failed to download chromedriver: ' + res.statusCode));
						res.pipe(out);
						out.on('finish', () => out.close(resolve));
					})
					.on('error', reject);
			});

			const unzipRes = spawnSync('unzip', ['-o', zipDest, '-d', cacheDir], { stdio: 'inherit' });
			if (unzipRes.status !== 0) throw new Error('unzip failed');
			try {
				fs.chmodSync(binPath, 0o755);
			} catch (e) {}
			if (fs.existsSync(binPath)) {
				resolvedChromedriverPath = binPath;
				console.log('Downloaded chromedriver to', binPath);
				return;
			}
		}
	} catch (e) {
		console.warn('Auto-download chromedriver failed:', e && e.message ? e.message : e);
	}

	console.warn(
		'No working chromedriver binary detected; Selenium will attempt to use its manager or PATH binary.'
	);
}

(async () => {
	try {
		if (!fs.existsSync(PROFILE_DIR)) {
			console.warn(`Chromium profile not found at ${PROFILE_DIR}; continuing without a profile`);
		} else {
			console.log(`Using Chromium profile at ${PROFILE_DIR}`);
		}
		console.log(`Waiting for dev server at ${BASE_URL} ...`);

		startDevServer();
		await checkServerReady(BASE_URL);
		console.log('Dev server reachable. Locating chromedriver...');

		await locateChromedriver();

		const options = new chrome.Options();
		// Avoid using an existing user data dir to prevent profile locks/crashes
		// in automated/headless environments. Use a fresh profile managed by
		// ChromeDriver instead.
		// Run headless in CI/automated environments and include common safe flags
		options.addArguments(
			'--headless=new',
			'--no-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--ignore-certificate-errors'
		);

		let builder = new Builder().forBrowser('chrome').setChromeOptions(options);

		// Decide how we'll run chromedriver: prefer using a system binary
		// (absolute path) by spawning it on an ephemeral port. If the resolved
		// path is a packaged/node_modules binary, use ServiceBuilder instead.
		let chromedriverProc = null;
		let useSystemChromedriver = false;
		if (resolvedChromedriverPath) {
			const isSystem =
				resolvedChromedriverPath.startsWith('/') &&
				!resolvedChromedriverPath.includes('node_modules');
			if (!isSystem) {
				const serviceBuilder = new chrome.ServiceBuilder(resolvedChromedriverPath);
				builder.setChromeService(serviceBuilder);
			} else {
				useSystemChromedriver = true;
			}
		}

		// Ask chromedriver to bind to an ephemeral port (0) and parse the
		// chosen port from stdout so we avoid collisions with stale
		// chromedriver instances.
		if (!useSystemChromedriver) {
			// Nothing to spawn; selenium will use ServiceBuilder or manager
			chromedriverProc = null;
		} else {
			const cdPort = process.env.OD_CHROMEDRIVER_PORT || '9515';
			chromedriverProc = spawn(resolvedChromedriverPath, ['--port=0', '--verbose'], {
				stdio: 'pipe'
			});
			let captured = '';
			chromedriverProc.stdout.on('data', (d) => {
				const s = d.toString();
				process.stdout.write(`[chromedriver stdout] ${s}`);
				captured += s;
			});
			chromedriverProc.stderr.on('data', (d) => process.stderr.write(`[chromedriver stderr] ${d}`));
			chromedriverProc.on('close', (code) => console.log(`chromedriver exited with code ${code}`));

			// Wait for the "started successfully" message and extract the port
			const portMatch = await new Promise((resolve) => {
				const timeout = setTimeout(() => resolve(null), 8000);
				const interval = setInterval(() => {
					// Prefer explicit "started successfully" message
					const m1 = captured.match(/started successfully on port (\d+)/i);
					if (m1) {
						clearTimeout(timeout);
						clearInterval(interval);
						return resolve(m1[1]);
					}
					// Fallback: take the last "on port <n>" occurrence > 0
					const all = [...captured.matchAll(/on port (\d+)/g)].map((x) => x[1]);
					if (all.length) {
						const last = all[all.length - 1];
						if (last && last !== '0') {
							clearTimeout(timeout);
							clearInterval(interval);
							return resolve(last);
						}
					}
				}, 150);
			});
			if (!portMatch) throw new Error('Failed to determine chromedriver port');
			const serverUrl = `http://localhost:${portMatch}`;
			console.log('Chromedriver server URL ->', serverUrl);

			// Wait for chromedriver to respond on /status before using it
			const statusUrl = `${serverUrl}/status`;
			const deadline = Date.now() + 5000;
			let ok = false;
			while (Date.now() < deadline) {
				try {
					await new Promise((res, rej) => {
						const req = require('http').get(statusUrl, (res2) => {
							// 200 indicates ready
							if (res2.statusCode === 200) res();
							else rej(new Error('not ready'));
						});
						req.on('error', rej);
					});
					ok = true;
					break;
				} catch (e) {
					await new Promise((r) => setTimeout(r, 200));
				}
			}
			if (!ok) throw new Error('chromedriver did not respond on ' + statusUrl);
			builder = builder.usingServer(serverUrl);
		}

		driver = await builder.build();

		await driver.get(BASE_URL);
		await driver.wait(until.elementLocated(By.css('h1')), 60000);
		const h1 = await driver.findElement(By.css('h1')).getText();
		console.log('E2E check succeeded: <h1> ->', h1.trim());

		await driver.quit();
		try {
			if (typeof chromedriverProc !== 'undefined' && chromedriverProc && chromedriverProc.kill)
				chromedriverProc.kill('SIGTERM');
		} catch (e) {}
		if (serverProc) serverProc.kill('SIGTERM');
		process.exit(0);
	} catch (err) {
		console.error('Runner error:', err && err.stack ? err.stack : err);
		try {
			if (driver) await driver.quit();
			// ensure chromedriver subprocess is terminated if we spawned one
			try {
				if (typeof chromedriverProc !== 'undefined' && chromedriverProc && chromedriverProc.kill)
					chromedriverProc.kill('SIGTERM');
			} catch (e) {}
		} catch (e) {}
		if (serverProc) serverProc.kill('SIGTERM');
		process.exit(3);
	}
})();
