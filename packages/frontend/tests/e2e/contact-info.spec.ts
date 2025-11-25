import { test, expect } from '@playwright/test';

test.describe('Company Contact Information', () => {
  const correctPhone = '+34 613 881 414';
  const correctEmail = 'info@resonaevents.com';
  const correctAddress = 'C/ de l\'Illa Cabrera, 13';
  const correctCity = 'València';
  const correctPostalCode = '46026';

  test('Header should display correct contact info', async ({ page }) => {
    await page.goto('/');
    
    // Verificar teléfono en header
    const headerPhone = page.locator('header').getByText(/Tel:/);
    await expect(headerPhone).toContainText(correctPhone);
    
    // Verificar email en header
    const headerEmail = page.locator('header').getByText(/Email:/);
    await expect(headerEmail).toContainText(correctEmail);
  });

  test('Footer should display correct contact info', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verificar teléfono en footer
    const footerPhone = page.locator('footer').getByText(correctPhone);
    await expect(footerPhone).toBeVisible();
    
    // Verificar email en footer
    const footerEmail = page.locator('footer').getByText(correctEmail);
    await expect(footerEmail).toBeVisible();
    
    // Verificar dirección en footer
    const footerAddress = page.locator('footer').getByText(new RegExp(correctAddress));
    await expect(footerAddress).toBeVisible();
  });

  test('Contact page should display correct info', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Esperar a que se cargue el contenido
    
    // Verificar teléfono en la página
    await expect(page.locator('body')).toContainText(correctPhone, { timeout: 10000 });
    
    // Verificar email en la página
    await expect(page.locator('body')).toContainText(correctEmail, { timeout: 10000 });
    
    // Verificar dirección
    await expect(page.locator('body')).toContainText(correctAddress, { timeout: 10000 });
  });

  test('Privacy policy should display correct address', async ({ page }) => {
    await page.goto('/legal/privacidad');
    await page.waitForLoadState('networkidle');
    
    // Verificar contenido en la página
    const pageContent = await page.content();
    expect(pageContent).toContain(correctAddress);
    expect(pageContent).toContain(correctEmail);
    expect(pageContent).toContain(correctPhone);
  });

  test('Terms page should display correct address', async ({ page }) => {
    await page.goto('/legal/terminos');
    await page.waitForLoadState('networkidle');
    
    // Verificar contenido en la página
    const pageContent = await page.content();
    expect(pageContent).toContain(correctAddress);
    expect(pageContent).toContain(correctEmail);
    expect(pageContent).toContain(correctPhone);
  });

  test('Footer should NOT have old social media icons', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verificar que NO existen links a redes sociales
    const fbLink = page.locator('footer a[href*="facebook"]');
    await expect(fbLink).toHaveCount(0);
    
    const twitterLink = page.locator('footer a[href*="twitter"]');
    await expect(twitterLink).toHaveCount(0);
    
    const instaLink = page.locator('footer a[href*="instagram"]');
    await expect(instaLink).toHaveCount(0);
    
    const ytLink = page.locator('footer a[href*="youtube"]');
    await expect(ytLink).toHaveCount(0);
  });

  test('Footer should have correct accent marks', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Verificar acentos correctos
    await expect(page.locator('footer').getByText('Enlaces Rápidos')).toBeVisible();
    await expect(page.locator('footer').getByText('Catálogo')).toBeVisible();
    await expect(page.locator('footer').getByText('Categorías')).toBeVisible();
    await expect(page.locator('footer').getByText('Iluminación')).toBeVisible();
    await expect(page.locator('footer').getByText('Fotografía y Video')).toBeVisible();
    await expect(page.locator('footer').getByText('Decoración')).toBeVisible();
    await expect(page.locator('footer').getByText('Métodos de Pago')).toBeVisible();
  });

  test.skip('Payment success page should have correct email', async ({ page }) => {
    // SKIP: Esta página requiere un orderId válido en la URL
    // TODO: Crear un pedido de prueba y verificar la página de éxito
    await page.goto('/checkout/success?orderId=test-123');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página contiene el email (puede no estar visible como link)
    const pageContent = await page.content();
    expect(pageContent).toContain(correctEmail);
  });

  test.skip('Payment error page should have correct contact info', async ({ page }) => {
    // SKIP: Esta página requiere autenticación o estado específico
    // TODO: Implementar test con autenticación
    await page.goto('/checkout/error');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    
    // Verificar contenido en la página
    await expect(page.locator('body')).toContainText(correctEmail, { timeout: 10000 });
    await expect(page.locator('body')).toContainText(correctPhone, { timeout: 10000 });
  });
});

test.describe('Admin Panel - Company Settings', () => {
  const correctPhone = '+34 613 881 414';
  const correctEmail = 'info@resonaevents.com';

  test.beforeEach(async ({ page }) => {
    // Nota: Este test requiere estar logueado como admin
    // En un entorno real, aquí irían los pasos de login
  });

  test.skip('Company settings should have correct placeholders', async ({ page }) => {
    // SKIP: Este test requiere autenticación admin
    // TODO: Implementar autenticación en tests E2E
    await page.goto('/admin/company-settings');
    
    // Verificar placeholders correctos
    const phoneInput = page.locator('input[type="tel"][placeholder]');
    await expect(phoneInput).toHaveAttribute('placeholder', correctPhone);
    
    const emailInput = page.locator('input[type="email"][placeholder]');
    await expect(emailInput).toHaveAttribute('placeholder', correctEmail);
  });

  test.skip('Settings manager should have correct default values', async ({ page }) => {
    // SKIP: Este test requiere autenticación admin
    // TODO: Implementar autenticación en tests E2E
    await page.goto('/admin/settings');
    
    // Verificar valores por defecto correctos
    const emailInput = page.locator('input[type="email"][value]');
    await expect(emailInput).toHaveValue(correctEmail);
    
    const phoneInput = page.locator('input[type="tel"][value]');
    await expect(phoneInput).toHaveValue(correctPhone);
  });
});
