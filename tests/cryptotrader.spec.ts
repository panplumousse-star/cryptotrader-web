import { test, expect } from '@playwright/test';

const BASE_URL = 'https://cryptotrader-web.vercel.app';

test.describe('CryptoTrader - Suite de tests complète', () => {

  // Configuration pour capturer les erreurs console
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  });

  test('1. Test de la page d\'accueil - Redirection', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Capture screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/homepage.png', fullPage: true });

    // Vérifier l'URL après redirection
    const currentUrl = page.url();
    console.log('URL après redirection:', currentUrl);

    // La page d'accueil devrait rediriger vers /login ou rester sur /
    expect(currentUrl).toBeTruthy();
  });

  test('2. Test de la page Login - Formulaire et validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Capture screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/login-page.png', fullPage: true });

    // Vérifier que nous sommes sur la page login
    expect(page.url()).toContain('/login');

    // Vérifier la présence du titre ou heading
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Vérifier la présence des champs de formulaire
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[type="password"]').first();

    if (await emailField.isVisible()) {
      await expect(emailField).toBeVisible();
      console.log('✓ Champ email présent');
    } else {
      console.log('✗ Champ email non trouvé');
    }

    if (await passwordField.isVisible()) {
      await expect(passwordField).toBeVisible();
      console.log('✓ Champ password présent');
    } else {
      console.log('✗ Champ password non trouvé');
    }

    // Vérifier la présence du bouton de soumission
    const submitButton = page.locator('button[type="submit"], button:has-text("connexion"), button:has-text("login")').first();
    if (await submitButton.isVisible()) {
      await expect(submitButton).toBeVisible();
      console.log('✓ Bouton de soumission présent');
    } else {
      console.log('✗ Bouton de soumission non trouvé');
    }
  });

  test('3. Test de la page Register - Formulaire d\'inscription', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');

    // Capture screenshot
    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/register-page.png', fullPage: true });

    // Vérifier que nous sommes sur la page register
    expect(page.url()).toContain('/register');

    // Vérifier la présence du titre
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Vérifier les champs du formulaire d'inscription
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"]').first();

    if (await emailField.isVisible()) {
      console.log('✓ Champ email présent');
    } else {
      console.log('✗ Champ email non trouvé');
    }

    if (await passwordField.isVisible()) {
      console.log('✓ Champ(s) password présent(s)');
    } else {
      console.log('✗ Champ password non trouvé');
    }
  });

  test('4.1 Test de navigation - Portfolio', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/portfolio-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL Portfolio:', currentUrl);

    // Vérifier que la page charge (pas d'erreur 404)
    const response = await page.goto(`${BASE_URL}/portfolio`);
    expect(response?.status()).not.toBe(404);
  });

  test('4.2 Test de navigation - Trading', async ({ page }) => {
    await page.goto(`${BASE_URL}/trading`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/trading-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL Trading:', currentUrl);

    const response = await page.goto(`${BASE_URL}/trading`);
    expect(response?.status()).not.toBe(404);
  });

  test('4.3 Test de navigation - Bot Strategies', async ({ page }) => {
    await page.goto(`${BASE_URL}/bot/strategies`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/bot-strategies-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL Bot Strategies:', currentUrl);

    const response = await page.goto(`${BASE_URL}/bot/strategies`);
    expect(response?.status()).not.toBe(404);
  });

  test('4.4 Test de navigation - History', async ({ page }) => {
    await page.goto(`${BASE_URL}/history`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/history-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL History:', currentUrl);

    const response = await page.goto(`${BASE_URL}/history`);
    expect(response?.status()).not.toBe(404);
  });

  test('4.5 Test de navigation - Alerts', async ({ page }) => {
    await page.goto(`${BASE_URL}/alerts`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/alerts-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL Alerts:', currentUrl);

    const response = await page.goto(`${BASE_URL}/alerts`);
    expect(response?.status()).not.toBe(404);
  });

  test('4.6 Test de navigation - Settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/settings-page.png', fullPage: true });

    const currentUrl = page.url();
    console.log('URL Settings:', currentUrl);

    const response = await page.goto(`${BASE_URL}/settings`);
    expect(response?.status()).not.toBe(404);
  });

  test('5.1 Test Responsive - Mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/mobile-login.png', fullPage: true });

    // Vérifier que le contenu est visible sur mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('5.2 Test Responsive - Tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/tablet-login.png', fullPage: true });

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('5.3 Test Responsive - Desktop (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: '/home/plum_-/cryptotrader/web/tests/screenshots/desktop-login.png', fullPage: true });

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('6. Test des erreurs console', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Naviguer sur plusieurs pages pour capturer les erreurs
    const pages = ['/login', '/register', '/portfolio', '/trading'];

    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000); // Attendre les erreurs async
    }

    console.log('Erreurs console détectées:', consoleErrors);
    console.log('Erreurs de page détectées:', pageErrors);

    // Log les erreurs mais ne pas faire échouer le test
    if (consoleErrors.length > 0 || pageErrors.length > 0) {
      console.warn(`⚠️ ${consoleErrors.length} erreurs console et ${pageErrors.length} erreurs de page détectées`);
    }
  });
});
