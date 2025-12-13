const { test, expect } = require('@playwright/test');

// KAN-72: Redirection vers "/" au lieu de "/portfolio" après connexion
// Cette suite teste le bug où les utilisateurs sont redirigés vers "/" 
// au lieu de "/portfolio" après une connexion réussie

test.describe('KAN-72: Wrong Redirect After Login', () => {
  const baseURL = 'http://localhost:3002';
  const testAccount = {
    email: 'titi@gmail.com',
    password: 'titi@gmail.com'
  };

  test.beforeEach(async ({ page, context }) => {
    // Clear state for clean test
    await context.clearCookies();
    console.log('Test state cleared');
    
    // Log all network requests
    page.on('request', req => {
      if (req.method() === 'POST' || req.url().includes('api')) {
        console.log('Request: ' + req.method() + ' ' + req.url());
      }
    });
    
    page.on('response', resp => {
      if (resp.status() >= 400) {
        console.log('Response: ' + resp.status() + ' ' + resp.url());
      }
    });
  });

  // Test 1: Verify login page loads
  test('KAN-72-1: Login page loads without auto-redirect', async ({ page }) => {
    console.log('\n=== Test KAN-72-1: Login page loads ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    const currentURL = page.url();
    console.log('Current URL: ' + currentURL);
    expect(currentURL).toContain('login');
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-1-login-initial.png' 
    });
    console.log('Test passed: Login page loaded');
  });

  // Test 2: Fill login form
  test('KAN-72-2: Fill login form with test credentials', async ({ page }) => {
    console.log('\n=== Test KAN-72-2: Fill login form ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    // Find and fill email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testAccount.email);
    console.log('Filled email: ' + testAccount.email);
    
    // Find and fill password input
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testAccount.password);
    console.log('Filled password: ' + testAccount.password);
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-2-form-filled.png' 
    });
    console.log('Test passed: Form filled');
  });

  // Test 3: Submit login form
  test('KAN-72-3: Submit login form', async ({ page }) => {
    console.log('\n=== Test KAN-72-3: Submit login form ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    // Fill form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testAccount.email);
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testAccount.password);
    
    // Find and click submit button
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("S\'identifier")'
    ).first();
    
    console.log('Submitting login form...');
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(err => {
      console.log('Navigation timeout or no navigation: ' + err.message);
    });
    
    // Small delay to ensure redirect completes
    await page.waitForTimeout(1000);
    
    const finalURL = page.url();
    console.log('URL after login submission: ' + finalURL);
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-3-after-submit.png' 
    });
    console.log('Test completed: Final URL is ' + finalURL);
  });

  // Test 4: Check final redirect destination (THE BUG)
  test('KAN-72-4: Verify redirect destination after successful login', async ({ page }) => {
    console.log('\n=== Test KAN-72-4: Verify redirect destination (BUG TEST) ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    // Fill and submit form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testAccount.email);
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testAccount.password);
    
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("S\'identifier")'
    ).first();
    
    console.log('Submitting login form...');
    await submitButton.click();
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(err => {
      console.log('Navigation timeout: ' + err.message);
    });
    
    // Wait for potential redirect
    await page.waitForTimeout(1500);
    
    const finalURL = page.url();
    console.log('Final URL after login: ' + finalURL);
    
    // This is what we expect (correct behavior)
    const expectedURL = baseURL + '/portfolio';
    const actualURL = finalURL;
    
    console.log('Expected redirect: ' + expectedURL);
    console.log('Actual redirect: ' + actualURL);
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-4-final-redirect.png' 
    });
    
    // This assertion SHOULD FAIL if the bug exists (user redirected to "/" instead of "/portfolio")
    try {
      expect(finalURL).toContain('/portfolio');
      console.log('PASS: User correctly redirected to /portfolio');
    } catch (e) {
      console.log('FAIL: User NOT redirected to /portfolio');
      console.log('Bug confirmed: User redirected to ' + actualURL + ' instead of ' + expectedURL);
      throw new Error('BUG REPRODUCED: Expected redirect to /portfolio, got ' + actualURL);
    }
  });

  // Test 5: Verify user authentication is maintained
  test('KAN-72-5: Verify user is authenticated after login', async ({ page }) => {
    console.log('\n=== Test KAN-72-5: Verify authentication ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testAccount.email);
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testAccount.password);
    
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("S\'identifier")'
    ).first();
    
    await submitButton.click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(err => {
      console.log('Navigation timeout: ' + err.message);
    });
    
    await page.waitForTimeout(1500);
    
    // Check if localStorage/cookies have auth token
    const cookies = await page.context().cookies();
    const authToken = cookies.find(c => 
      c.name.toLowerCase().includes('auth') || 
      c.name.toLowerCase().includes('token')
    );
    
    console.log('Cookies found: ' + cookies.map(c => c.name).join(', '));
    console.log('Auth token present: ' + (!!authToken));
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-5-auth-check.png' 
    });
  });

  // Test 6: Try to access portfolio directly
  test('KAN-72-6: Access /portfolio directly after login', async ({ page }) => {
    console.log('\n=== Test KAN-72-6: Access /portfolio directly ===');
    
    await page.goto(baseURL + '/login', { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testAccount.email);
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testAccount.password);
    
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("S\'identifier")'
    ).first();
    
    await submitButton.click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(err => {
      console.log('Navigation timeout: ' + err.message);
    });
    
    await page.waitForTimeout(1500);
    
    // Now try to navigate to portfolio directly
    console.log('Navigating to /portfolio directly...');
    await page.goto(baseURL + '/portfolio', { waitUntil: 'networkidle' });
    
    const portfolioURL = page.url();
    console.log('URL at /portfolio: ' + portfolioURL);
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan72-6-portfolio-page.png' 
    });
  });

});
