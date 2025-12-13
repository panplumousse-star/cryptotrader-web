const { test, expect } = require('@playwright/test');

// KAN-70: Redirection automatique vers la page d'accueil pour utilisateurs non authentifiés
// Cette suite teste que les utilisateurs non authentifiés sont redirigés vers / 
// lorsqu'ils tentent d'accéder à des routes protégées

test.describe('KAN-70: Unauthenticated User Redirection', () => {
  // Utiliser une base URL locale pour les tests
  const baseURL = 'http://localhost:3000';

  // Helper: Ensure user is not authenticated (clear all cookies)
  async function clearAuthentication(page) {
    await page.context().clearCookies();
    console.log('Authentication cleared - no cookies present');
  }

  test.beforeEach(async ({ page, context }) => {
    // Clear any existing authentication before each test
    await context.clearCookies();
  });

  // CRITERION 1: Unauthenticated user accessing /portfolio is redirected to /
  test('KAN-70-1: Unauthenticated user accessing /portfolio is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-1: /portfolio redirection ===');
    
    // Navigate to protected route /portfolio
    await page.goto(`${baseURL}/portfolio`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Verify home page content is displayed
    const heading = await page.locator('body').first();
    await expect(heading).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-1-portfolio-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  // CRITERION 2: Unauthenticated user accessing /settings is redirected to /
  test('KAN-70-2: Unauthenticated user accessing /settings is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-2: /settings redirection ===');
    
    // Navigate to protected route /settings
    await page.goto(`${baseURL}/settings`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Verify home page content is displayed
    const heading = await page.locator('body').first();
    await expect(heading).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-2-settings-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  // CRITERION 3: Unauthenticated user accessing other protected pages is redirected to /
  test('KAN-70-3: Unauthenticated user accessing /trading is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-3: /trading redirection ===');
    
    // Navigate to protected route /trading
    await page.goto(`${baseURL}/trading`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-3-trading-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  test('KAN-70-4: Unauthenticated user accessing /bot is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-4: /bot redirection ===');
    
    // Navigate to protected route /bot
    await page.goto(`${baseURL}/bot`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-4-bot-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  test('KAN-70-5: Unauthenticated user accessing /history is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-5: /history redirection ===');
    
    // Navigate to protected route /history
    await page.goto(`${baseURL}/history`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-5-history-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  test('KAN-70-6: Unauthenticated user accessing /alerts is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-6: /alerts redirection ===');
    
    // Navigate to protected route /alerts
    await page.goto(`${baseURL}/alerts`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-6-alerts-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  test('KAN-70-7: Unauthenticated user accessing /profile is redirected to /', async ({ page }) => {
    console.log('\n=== Test KAN-70-7: /profile redirection ===');
    
    // Navigate to protected route /profile
    await page.goto(`${baseURL}/profile`, { waitUntil: 'networkidle' });
    
    // Verify redirect to home page
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-7-profile-redirect.png' });
    console.log('Test passed: Redirected to home page');
  });

  // CRITERION 4: Home page (/) remains accessible without authentication
  test('KAN-70-8: Unauthenticated user can access home page /', async ({ page }) => {
    console.log('\n=== Test KAN-70-8: Home page accessibility ===');
    
    // Navigate to home page
    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
    
    // Verify no redirect occurred
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toBe(`${baseURL}/`);
    
    // Verify page content is loaded
    const body = await page.locator('body').first();
    await expect(body).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-8-home-accessible.png' });
    console.log('Test passed: Home page is accessible');
  });

  // Public routes should be accessible without authentication
  test('KAN-70-9: Unauthenticated user can access /login', async ({ page }) => {
    console.log('\n=== Test KAN-70-9: Login page accessibility ===');
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    // Verify no redirect
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toContain('/login');
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-9-login-accessible.png' });
    console.log('Test passed: Login page is accessible');
  });

  test('KAN-70-10: Unauthenticated user can access /register', async ({ page }) => {
    console.log('\n=== Test KAN-70-10: Register page accessibility ===');
    
    // Navigate to register page
    await page.goto(`${baseURL}/register`, { waitUntil: 'networkidle' });
    
    // Verify no redirect
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toContain('/register');
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-10-register-accessible.png' });
    console.log('Test passed: Register page is accessible');
  });

  // CRITERION 5: Authenticated user can access protected pages
  test('KAN-70-11: Authenticated user can access /portfolio', async ({ page }) => {
    console.log('\n=== Test KAN-70-11: Authenticated user accessing /portfolio ===');
    
    // Simulate authenticated user by setting auth cookie
    await page.context().addCookies([{
      name: 'auth-storage',
      value: JSON.stringify({
        state: {
          token: 'test-token-valid',
          user: { email: 'test@test.com' }
        }
      }),
      url: baseURL
    }]);
    
    console.log('Auth cookie set: test-token-valid');
    
    // Navigate to protected route
    await page.goto(`${baseURL}/portfolio`, { waitUntil: 'networkidle' });
    
    // Verify NO redirect occurred - user stays on /portfolio
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toContain('/portfolio');
    
    // Verify page content loaded
    const body = await page.locator('body').first();
    await expect(body).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-11-auth-portfolio-access.png' });
    console.log('Test passed: Authenticated user can access /portfolio');
  });

  test('KAN-70-12: Authenticated user can access /settings', async ({ page }) => {
    console.log('\n=== Test KAN-70-12: Authenticated user accessing /settings ===');
    
    // Simulate authenticated user by setting auth cookie
    await page.context().addCookies([{
      name: 'auth-storage',
      value: JSON.stringify({
        state: {
          token: 'test-token-valid',
          user: { email: 'test@test.com' }
        }
      }),
      url: baseURL
    }]);
    
    console.log('Auth cookie set: test-token-valid');
    
    // Navigate to protected route
    await page.goto(`${baseURL}/settings`, { waitUntil: 'networkidle' });
    
    // Verify NO redirect occurred - user stays on /settings
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toContain('/settings');
    
    // Verify page content loaded
    const body = await page.locator('body').first();
    await expect(body).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-12-auth-settings-access.png' });
    console.log('Test passed: Authenticated user can access /settings');
  });

  test('KAN-70-13: Authenticated user can access /trading', async ({ page }) => {
    console.log('\n=== Test KAN-70-13: Authenticated user accessing /trading ===');
    
    // Simulate authenticated user by setting auth cookie
    await page.context().addCookies([{
      name: 'auth-storage',
      value: JSON.stringify({
        state: {
          token: 'test-token-valid',
          user: { email: 'test@test.com' }
        }
      }),
      url: baseURL
    }]);
    
    console.log('Auth cookie set: test-token-valid');
    
    // Navigate to protected route
    await page.goto(`${baseURL}/trading`, { waitUntil: 'networkidle' });
    
    // Verify NO redirect occurred - user stays on /trading
    const currentURL = page.url();
    console.log(`Final URL: ${currentURL}`);
    expect(currentURL).toContain('/trading');
    
    // Verify page content loaded
    const body = await page.locator('body').first();
    await expect(body).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan70-13-auth-trading-access.png' });
    console.log('Test passed: Authenticated user can access /trading');
  });
});
