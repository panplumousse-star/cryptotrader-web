const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Login
    await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.fill('input[type="email"]', 'portfolio_test@example.com');
    await page.fill('input[type="password"]', 'TestPortfolio123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Go to portfolio
    await page.goto('http://localhost:3002/portfolio', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Take full page screenshot
    await page.screenshot({ path: 'portfolio-full.png', fullPage: true });
    console.log('Screenshot saved to portfolio-full.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
