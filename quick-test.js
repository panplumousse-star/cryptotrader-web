const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Login
    console.log('1. Loading login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    console.log('2. Filling credentials...');
    await page.fill('input[type="email"]', 'portfolio_test@example.com');
    await page.fill('input[type="password"]', 'TestPortfolio123');
    
    console.log('3. Clicking login...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForTimeout(2000);
    console.log('4. After login, URL:', page.url());
    
    // Go to portfolio
    console.log('5. Navigating to portfolio...');
    await page.goto('http://localhost:3002/portfolio', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    // Wait for React to render
    await page.waitForTimeout(3000);
    
    console.log('6. Taking screenshot...');
    await page.screenshot({ path: 'portfolio-quick.png', fullPage: true });
    
    // Get page text content
    const bodyText = await page.textContent('body');
    const hasSOL = bodyText.includes('SOL');
    const hasBTC = bodyText.includes('BTC');
    const hasError = bodyText.includes('Erreur');
    const hasConfigBtn = bodyText.includes('Configurer');
    
    console.log('\n=== PAGE CONTENT ===');
    console.log('Contains "SOL":', hasSOL);
    console.log('Contains "BTC":', hasBTC);
    console.log('Contains "Erreur":', hasError);
    console.log('Contains "Configurer":', hasConfigBtn);
    
  } catch (error) {
    console.error('Error:', error.message);
    await page.screenshot({ path: 'portfolio-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
