const { By, until } = require('selenium-webdriver');

module.exports.run = async function runHealthTest(driver, { serverUrl }) {
	// Navigate to /api/health and confirm we get a response body
	const healthUrl = serverUrl + '/api/health';
	await driver.get(healthUrl);
	// Wait for body to exist
	await driver.wait(until.elementLocated(By.css('body')), 3000);
	const body = await driver.findElement(By.css('body')).getText();
	if (!body || body.trim().length === 0) {
		throw new Error('/api/health returned empty body');
	}
	// Optionally expect JSON-looking content
	if (!body.trim().startsWith('{') && !body.trim().startsWith('[')) {
		console.warn('/api/health response does not look like JSON; response:', body.slice(0, 120));
	}
};
