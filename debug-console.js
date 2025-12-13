const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });

  // Capture errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message);
    console.log(error.stack);
  });

  try {
    // 1. Login
    console.log('Logging in...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.fill('input[type="email"]', 'portfolio_test@example.com');
    await page.fill('input[type="password"]', 'TestPortfolio123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 2. Go to portfolio
    console.log('Loading portfolio page...');
    await page.goto('http://localhost:3002/portfolio', { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait for errors to appear
    await page.waitForTimeout(5000);
    console.log('Done waiting');

  } catch (error) {
    console.error('Test Error:', error.message);
  } finally {
    await browser.close();
  }
})();
