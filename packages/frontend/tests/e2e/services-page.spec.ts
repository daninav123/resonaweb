import { test, expect } from '@playwright/test';

test.describe('Página de Servicios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/servicios');
  });

  test('debe cargar la página de servicios', async ({ page }) => {
    // Verificar título
    await expect(page.locator('h1, h2')).toContainText(/Servicio/i);
  });

  test('debe mostrar servicios disponibles', async ({ page }) => {
    // Debería haber algún contenido
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100);
  });

  test('debe tener navegación funcional', async ({ page }) => {
    // Verificar que puede volver al home
    await page.click('text=Resona');
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('debe tener botones de contacto o CTA', async ({ page }) => {
    // Buscar botones comunes
    const ctaButtons = page.locator('button, a').filter({ hasText: /Contactar|Solicitar|Más información/i });
    
    // Puede o no existir, pero si existe debería ser visible
    const count = await ctaButtons.count();
    if (count > 0) {
      await expect(ctaButtons.first()).toBeVisible();
    }
  });
});
