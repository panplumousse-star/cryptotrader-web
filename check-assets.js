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
    
    // Check for asset names
    const bodyText = await page.textContent('body');
    
    console.log('=== ASSETS IN PAGE ===');
    console.log('SOL found:', bodyText.includes('SOL'));
    console.log('BTC found:', bodyText.includes('BTC'));
    console.log('ALEO found:', bodyText.includes('ALEO'));
    console.log('NEAR found:', bodyText.includes('NEAR'));
    console.log('SWFTC found:', bodyText.includes('SWFTC'));
    
    // Get the summary values
    const totalValue = await page.textContent('text="Valeur Totale"').catch(() => null);
    console.log('\n=== SUMMARY CARD ===');
    const cards = await page.$$('.text-2xl.font-bold');
    for (const card of cards) {
      const text = await card.textContent();
      console.log('Card value:', text);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
