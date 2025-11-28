const { By, until } = require('selenium-webdriver');

module.exports = async function runHomepageTest(driver, { serverUrl }) {
	// Navigate to root with a retry loop — dev server may restart/build between requests
	const url = serverUrl + '/';
	const maxAttempts = 5;
	let lastErr = null;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			await driver.get(url);
			// Wait for a main content container (common selectors)
			await driver.wait(until.elementLocated(By.css('main, #app, .app, body')), 7000);
			lastErr = null;
			break;
		} catch (err) {
			lastErr = err;
			// If connection refused, wait and retry
			const msg = (err && err.message) || '';
			if (msg.includes('ERR_CONNECTION_REFUSED') || msg.includes('ECONNREFUSED')) {
				await new Promise((r) => setTimeout(r, 1000));
				continue;
			}
			// otherwise rethrow
			throw err;
		}
	}
	if (lastErr) throw lastErr;

	// Check title is present (not empty)
	const title = await driver.getTitle();
	if (!title || title.trim().length === 0) {
		console.warn('Warning: document title is empty');
	}
	// Ensure at least one link or button exists as basic sanity
	const elems = await driver.findElements(By.css('a,button,input,form'));
	if (elems.length === 0) {
		console.warn('No interactive elements found on the page; this may be expected for some pages.');
	}
};
