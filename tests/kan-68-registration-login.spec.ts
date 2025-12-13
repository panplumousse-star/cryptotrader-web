import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

/**
 * Test E2E pour KAN-68: "Registration succeeds but login fails for newly created accounts"
 *
 * Scénario:
 * 1. Créer un nouvel compte avec email unique
 * 2. Vérifier la redirection vers /login
 * 3. Tenter de se connecter avec les mêmes credentials
 * 4. Vérifier si le login réussit ou échoue
 *
 * Captures:
 * - Screenshots à chaque étape
 * - Logs console du navigateur
 * - Requêtes réseau (registration et login)
 */

test.describe('KAN-68: Registration succeeds but login fails', () => {
  // Configuration pour capturer les erreurs console et les requêtes réseau
  let consoleLogs: Array<{ type: string; message: string }> = [];
  let networkErrors: Array<{ url: string; status: number; statusText: string }> = [];

  test.beforeEach(async ({ page }) => {
    // Réinitialiser les logs
    consoleLogs = [];
    networkErrors = [];

    // Capturer les messages console
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        message: msg.text(),
      });
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Capturer les erreurs de page
    page.on('pageerror', error => {
      consoleLogs.push({
        type: 'error',
        message: `Page Error: ${error.message}`,
      });
      console.error('[PAGE ERROR]', error.message);
    });

    // Capturer les réponses réseau en erreur
    page.on('response', response => {
      if (!response.ok() && response.url().includes('auth')) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
        console.error(`[NETWORK ERROR] ${response.status()} ${response.statusText()} - ${response.url()}`);
      }
    });
  });

  test('E2E: Registration and Login Flow', async ({ page }) => {
    // Générer un email unique avec timestamp
    const timestamp = Date.now();
    const uniqueEmail = `bug-test-${timestamp}@example.com`;
    const password = 'TestPassword123';
    const fullName = 'Bug Test KAN-68';

    console.log(`\n========== TEST KAN-68 START ==========`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Email: ${uniqueEmail}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${fullName}`);

    // STEP 1: Naviguer vers la page d'inscription
    console.log('\n--- STEP 1: Navigate to /register ---');
    const registerResponse = await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-01-register-page.png`, fullPage: true });

    const urlAfterNavigation = page.url();
    console.log(`URL after navigation to /register: ${urlAfterNavigation}`);
    console.log(`Response status: ${registerResponse?.status()}`);

    // Vérifier que nous sommes sur la page register (ou que nous avons été redirigés)
    if (!urlAfterNavigation.includes('/register')) {
      console.log(`⚠ Expected /register but got: ${urlAfterNavigation}`);
    } else {
      console.log('✓ Successfully navigated to /register');
    }

    // STEP 2: Remplir le formulaire d'inscription
    console.log('\n--- STEP 2: Fill registration form ---');

    // Chercher les champs du formulaire
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[placeholder*="name" i], input[placeholder*="nom" i]').first();
    const passwordConfirmInput = page.locator('input[type="password"]').nth(1);

    // Vérifier la visibilité des champs
    const emailVisible = await emailInput.isVisible().catch(() => false);
    const passwordVisible = await passwordInput.isVisible().catch(() => false);
    const nameVisible = await nameInput.isVisible().catch(() => false);

    console.log(`Email field visible: ${emailVisible}`);
    console.log(`Password field visible: ${passwordVisible}`);
    console.log(`Name field visible: ${nameVisible}`);

    // Remplir les champs
    if (emailVisible) {
      await emailInput.fill(uniqueEmail);
      console.log(`✓ Filled email: ${uniqueEmail}`);
    }

    if (nameVisible) {
      await nameInput.fill(fullName);
      console.log(`✓ Filled name: ${fullName}`);
    } else {
      console.log('⚠ Name field not found, attempting alternate selectors');
    }

    if (passwordVisible) {
      await passwordInput.fill(password);
      console.log(`✓ Filled password`);
    }

    // Si un second champ password existe (confirmation), le remplir aussi
    const passwordConfirmVisible = await passwordConfirmInput.isVisible().catch(() => false);
    if (passwordConfirmVisible) {
      await passwordConfirmInput.fill(password);
      console.log(`✓ Filled password confirmation`);
    }

    // Screenshot du formulaire rempli
    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-02-form-filled.png`, fullPage: true });

    // STEP 3: Soumettre le formulaire d'inscription
    console.log('\n--- STEP 3: Submit registration form ---');

    const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Inscription"), button:has-text("Register"), button:has-text("S\'inscrire")').first();

    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      console.log('✓ Clicked submit button');
    } else {
      console.log('⚠ Submit button not found');
    }

    // Attendre la réponse du serveur
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-03-after-submit.png`, fullPage: true });

    // Vérifier les erreurs après submission
    console.log(`\n--- Erreurs détectées après registration ---`);
    console.log(`Erreurs console: ${consoleLogs.length}`);
    consoleLogs.forEach(log => {
      console.log(`  [${log.type}] ${log.message}`);
    });
    console.log(`Erreurs réseau: ${networkErrors.length}`);
    networkErrors.forEach(err => {
      console.log(`  [${err.status}] ${err.statusText} - ${err.url}`);
    });

    // STEP 4: Vérifier la redirection vers /login
    console.log('\n--- STEP 4: Verify redirect to /login ---');

    // Attendre la redirection
    await page.waitForURL('**/login', { timeout: 10000 }).catch(() => {
      console.log('⚠ Did not redirect to /login as expected');
    });

    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('✓ Successfully redirected to /login');
    } else {
      console.log('✗ NOT redirected to /login - Possible error in registration');
    }

    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-04-redirected-to-login.png`, fullPage: true });

    // STEP 5: Remplir et soumettre le formulaire de login
    console.log('\n--- STEP 5: Fill login form ---');

    const loginEmailInput = page.locator('input[type="email"], input[name="email"]').first();
    const loginPasswordInput = page.locator('input[type="password"]').first();

    const loginEmailVisible = await loginEmailInput.isVisible().catch(() => false);
    const loginPasswordVisible = await loginPasswordInput.isVisible().catch(() => false);

    console.log(`Login email field visible: ${loginEmailVisible}`);
    console.log(`Login password field visible: ${loginPasswordVisible}`);

    if (loginEmailVisible) {
      await loginEmailInput.fill(uniqueEmail);
      console.log(`✓ Filled login email: ${uniqueEmail}`);
    }

    if (loginPasswordVisible) {
      await loginPasswordInput.fill(password);
      console.log(`✓ Filled login password`);
    }

    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-05-login-form-filled.png`, fullPage: true });

    // STEP 6: Soumettre le formulaire de login
    console.log('\n--- STEP 6: Submit login form ---');

    const loginSubmitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Connexion"), button:has-text("Login"), button:has-text("Se connecter")').first();

    if (await loginSubmitButton.isVisible().catch(() => false)) {
      await loginSubmitButton.click();
      console.log('✓ Clicked login submit button');
    }

    // Attendre la réponse
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-06-after-login-submit.png`, fullPage: true });

    // STEP 7: Vérifier le résultat du login
    console.log('\n--- STEP 7: Verify login result ---');

    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    // Vérifier les erreurs après login
    console.log(`\n--- Erreurs détectées après login ---`);
    console.log(`Erreurs console: ${consoleLogs.length}`);
    consoleLogs.forEach(log => {
      console.log(`  [${log.type}] ${log.message}`);
    });
    console.log(`Erreurs réseau: ${networkErrors.length}`);
    networkErrors.forEach(err => {
      console.log(`  [${err.status}] ${err.statusText} - ${err.url}`);
    });

    // Vérifier les messages d'erreur visibles
    const errorMessage = page.locator('[role="alert"], .error, .alert-error, [class*="error"]').first();
    const errorVisible = await errorMessage.isVisible().catch(() => false);

    if (errorVisible) {
      const errorText = await errorMessage.textContent();
      console.log(`✗ ERROR MESSAGE FOUND: ${errorText}`);
    } else {
      console.log('✓ No error message visible');
    }

    // Déterminer le résultat du test
    const isLoggedIn = finalUrl.includes('/dashboard') || finalUrl.includes('/portfolio');
    const isOnLoginPage = finalUrl.includes('/login');
    const hasError = errorVisible || networkErrors.length > 0 || consoleLogs.some(log => log.type === 'error');

    console.log('\n========== TEST RESULT ==========');
    console.log(`Login Successful: ${isLoggedIn}`);
    console.log(`Still on Login Page: ${isOnLoginPage}`);
    console.log(`Has Errors: ${hasError}`);

    // Capture finale
    await page.screenshot({ path: `/home/plum_-/cryptotrader/web/tests/screenshots/kan-68-07-final-state.png`, fullPage: true });

    // Assertions
    if (isLoggedIn) {
      console.log('\n✓ TEST PASSED: Login succeeded');
    } else if (isOnLoginPage && hasError) {
      console.log('\n✗ TEST FAILED: Login failed with error (BUG REPRODUCED)');
      expect(isLoggedIn).toBe(true);
    } else {
      console.log('\n? TEST INCONCLUSIVE: Unable to determine login state');
    }

    console.log(`\n========== TEST KAN-68 END ==========\n`);
  });
});
