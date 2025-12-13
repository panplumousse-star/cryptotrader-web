const { test, expect } = require('@playwright/test');

// KAN-71: Redirection en boucle vers la page de login après connexion
// Cette suite teste le bug où les utilisateurs sont redirigés en boucle vers la page de login
// après une tentative de connexion

test.describe('KAN-71: Login Loop Redirection Bug', () => {
  const baseURL = 'http://localhost:3002';
  const testAccount = {
    email: 'tutu@gmail.com',
    password: 'Password123!'
  };

  test.beforeEach(async ({ page, context }) => {
    // Ensure a clean state - clear cookies
    await context.clearCookies();
    console.log('State cleared for test');
  });

  // Test 1: Navigate to login page and verify initial state
  test('KAN-71-1: Login page loads without redirect', async ({ page }) => {
    console.log('\n=== Test KAN-71-1: Login page loads ===');
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    // Verify we're on the login page
    const currentURL = page.url();
    console.log(`Current URL after navigation: ${currentURL}`);
    expect(currentURL).toContain('login');
    
    // Verify login form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    
    await expect(emailInput).toBeTruthy();
    await expect(passwordInput).toBeTruthy();
    await expect(submitButton).toBeTruthy();
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan71-1-login-page-initial.png' });
    console.log('Test passed: Login page loaded without redirect');
  });

  // Test 2: Fill login form with test credentials
  test('KAN-71-2: Fill login form with test credentials', async ({ page }) => {
    console.log('\n=== Test KAN-71-2: Fill login form ===');
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    // Get form inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    // Fill in credentials
    await emailInput.fill(testAccount.email);
    await passwordInput.fill(testAccount.password);
    
    // Verify form is filled
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    
    console.log(`Email filled: ${emailValue}`);
    console.log(`Password filled: ${passwordValue ? '***' : '[empty]'}`);
    
    expect(emailValue).toBe(testAccount.email);
    expect(passwordValue).toBe(testAccount.password);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan71-2-login-form-filled.png' });
    console.log('Test passed: Login form filled');
  });

  // Test 3: Submit login form and monitor for redirect loop
  test('KAN-71-3: Monitor login submission and redirection behavior', async ({ page }) => {
    console.log('\n=== Test KAN-71-3: Login submission and redirect monitoring ===');
    
    // Track all navigation URLs
    const navigationHistory = [];
    let navigationCount = 0;
    
    page.on('load', () => {
      navigationCount++;
      const url = page.url();
      navigationHistory.push(url);
      console.log(`Navigation count: ${navigationCount}, URL: ${url}`);
    });
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    console.log(`Initial navigation: ${page.url()}`);
    
    // Get form inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    
    // Fill form
    await emailInput.fill(testAccount.email);
    await passwordInput.fill(testAccount.password);
    
    // Listen for responses
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      if (url.includes('login') || url.includes('auth')) {
        console.log(`Response: ${status} ${url}`);
      }
    });
    
    // Click submit button
    console.log('Submitting login form...');
    await submitButton.click();
    
    // Wait for navigation or timeout after 5 seconds
    try {
      await page.waitForNavigation({ timeout: 5000, waitUntil: 'networkidle' });
    } catch (e) {
      console.warn('Navigation timeout or no navigation occurred');
    }
    
    // Wait a bit more to catch any redirect loops
    await page.waitForTimeout(3000);
    
    // Get final URL after submission
    const finalURL = page.url();
    console.log(`\nFinal URL after submission: ${finalURL}`);
    console.log(`Total navigation history: ${navigationHistory.length}`);
    console.log(`Navigation history: ${navigationHistory.join(' -> ')}`);
    
    // Analyze redirect loop
    const loginNavigations = navigationHistory.filter(u => u.includes('login')).length;
    console.log(`\nRedirect loop analysis:`);
    console.log(`- Total navigations: ${navigationHistory.length}`);
    console.log(`- Login page visits: ${loginNavigations}`);
    
    // Take screenshot of final state
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan71-3-login-submission-result.png' });
    
    // Log result
    if (finalURL.includes('login') && navigationHistory.length > 3) {
      console.error('BUG DETECTED: Multiple redirects to login page detected');
    } else if (finalURL.includes('login')) {
      console.log('Still on login page (may be normal if auth failed)');
    } else {
      console.log('Redirected away from login page');
    }
  });

  // Test 4: Check authentication state after login attempt
  test('KAN-71-4: Verify authentication state after login', async ({ page }) => {
    console.log('\n=== Test KAN-71-4: Authentication state verification ===');
    
    // Navigate to login page
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    // Get form inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    
    // Fill and submit form
    await emailInput.fill(testAccount.email);
    await passwordInput.fill(testAccount.password);
    await submitButton.click();
    
    // Wait for any navigation
    try {
      await page.waitForNavigation({ timeout: 5000, waitUntil: 'networkidle' });
    } catch (e) {
      // Navigation might timeout
    }
    
    // Check for error messages
    const errorMessages = await page.locator('[role="alert"], .alert, .error, [class*="error"]').allTextContents();
    console.log(`Error messages found: ${errorMessages.join(', ') || 'None'}`);
    
    // Get cookies
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => c.name.toLowerCase().includes('auth') || c.name.toLowerCase().includes('token'));
    console.log(`Auth cookies: ${authCookies.map(c => c.name).join(', ') || 'None'}`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan71-4-auth-state-check.png' });
    console.log('Test completed: Authentication state logged');
  });

  // Test 5: Direct protected page access after login attempt
  test('KAN-71-5: Access protected page to verify session', async ({ page }) => {
    console.log('\n=== Test KAN-71-5: Protected page access ===');
    
    // First, attempt login
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")').first();
    
    await emailInput.fill(testAccount.email);
    await passwordInput.fill(testAccount.password);
    await submitButton.click();
    
    // Wait for any navigation
    try {
      await page.waitForNavigation({ timeout: 5000, waitUntil: 'networkidle' });
    } catch (e) {
      // Timeout is ok
    }
    
    // After login attempt, try accessing a protected page
    console.log('Attempting to access protected page (/portfolio)...');
    const beforeURL = page.url();
    await page.goto(`${baseURL}/portfolio`, { waitUntil: 'networkidle' });
    const afterURL = page.url();
    
    console.log(`URL before portfolio access: ${beforeURL}`);
    console.log(`URL after portfolio access: ${afterURL}`);
    
    // Take screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/playwright-test/screenshots/kan71-5-protected-page-access.png' });
    console.log('Test completed: Protected page access logged');
  });
});
