#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function copyProfile(src, dest) {
  return fs.promises.cp(src, dest, { recursive: true });
}

async function run() {
  try {
    const envBase = process.env.PLAYWRIGHT_BASE_URL;
    const host = process.env.OD_HOST || process.env.HOST || os.hostname() || 'localhost';
    const port = process.env.OD_PORT || process.env.PORT || '3000';
    const proto = process.env.PLAYWRIGHT_PROTOCOL || 'https';
    const baseURL = envBase || `${proto}://${host}:${port}`;

    const userProfile = path.resolve(process.env.HOME || os.homedir(), '.config', 'chromium');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'odin-chrome-profile-'));
    let userDataDir = userProfile;

    if (fs.existsSync(userProfile)) {
      // copy the profile to a temp dir to avoid mutating the real profile
      try {
        await copyProfile(userProfile, tmp);
        userDataDir = tmp;
      } catch (e) {
        console.warn('Failed to copy Chromium profile, will attempt to use original profile:', e && e.message ? e.message : e);
        userDataDir = userProfile;
      }
    }

    // Start the dev server so the tests have an endpoint to hit. This mirrors
    // Playwright's `webServer` behavior used by the test runner.
    const { spawn } = require('child_process');
    const dev = spawn('pnpm', ['dev'], { stdio: 'inherit' });

    // Wait for the server to be available
    const https = require('https');
    const maxWait = 60000;
    const start = Date.now();
    async function waitForServer() {
      return new Promise((resolve, reject) => {
        (function ping() {
          const req = https.request(baseURL + '/', { method: 'HEAD', timeout: 2000 }, (res) => {
            resolve();
          });
          req.on('error', (err) => {
            if (Date.now() - start > maxWait) return reject(new Error('Timed out waiting for dev server'));
            setTimeout(ping, 500);
          });
          req.on('timeout', () => {
            req.destroy();
            if (Date.now() - start > maxWait) return reject(new Error('Timed out waiting for dev server'));
            setTimeout(ping, 500);
          });
          req.end();
        })();
      });
    }

    try {
      await waitForServer();
    } catch (e) {
      console.error('Dev server did not start in time:', e && e.message ? e.message : e);
      dev.kill();
      process.exit(1);
    }

    console.info('Launching Chromium persistent context with profile:', userDataDir);
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: true
    });

    const page = await context.newPage();
    console.info('Navigating to', baseURL + '/');
    await page.goto(baseURL + '/', { waitUntil: 'load', timeout: 30000 });

    const h1 = await page.$('h1');
    if (!h1) {
      console.error('No <h1> found on page');
      await context.close();
      process.exit(1);
    }

    console.info('E2E check succeeded: <h1> found');
    await context.close();
    dev.kill();
    process.exit(0);
  } catch (err) {
    console.error('Persistent e2e runner failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
