import { test, expect } from '@playwright/test';

test.describe('Navegación General', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar título o logo
    await expect(page.locator('text=Resona')).toBeVisible();
    
    // Verificar que hay un menú de navegación
    await expect(page.locator('text=Catálogo')).toBeVisible();
  });

  test('debe navegar a todas las páginas principales', async ({ page }) => {
    const pages = [
      { link: 'Catálogo', url: '/productos' },
      { link: 'Servicios', url: '/servicios' },
      { link: 'Blog', url: '/blog' },
      { link: 'Nosotros', url: '/sobre-nosotros' },
      { link: 'Contacto', url: '/contacto' },
    ];

    for (const { link, url } of pages) {
      await page.goto('http://localhost:3000');
      await page.click(`text=${link}`);
      await expect(page).toHaveURL(new RegExp(url));
    }
  });

  test('debe mostrar calculadora de eventos', async ({ page }) => {
    await page.click('text=Calculadora');
    await expect(page).toHaveURL(/calculadora-evento/);
  });

  test('debe tener footer con enlaces', async ({ page }) => {
    // Scroll al footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verificar elementos del footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('debe permitir búsqueda de productos', async ({ page }) => {
    // Buscar el input de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('camara');
      await searchInput.press('Enter');
      
      // Debe navegar a productos con query
      await expect(page).toHaveURL(/productos\?q=/);
    }
  });

  test('debe mostrar el logo y permitir volver al home', async ({ page }) => {
    // Navegar a otra página
    await page.goto('http://localhost:3000/productos');
    
    // Click en el logo
    await page.click('img[alt*="Resona"], a:has(img)');
    
    // Debe volver al home
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('debe tener meta tags SEO', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('debe ser responsive - vista móvil', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verificar que el menú hamburguesa está visible
    await expect(page.locator('[class*="Menu"], button:has-text("☰")')).toBeVisible();
  });

  test('debe mantener la navegación entre páginas', async ({ page }) => {
    // Navegar por varias páginas
    await page.click('text=Productos >> nth=0');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Servicios');
    await page.waitForLoadState('networkidle');
    
    // Volver atrás
    await page.goBack();
    await expect(page).toHaveURL(/productos/);
  });
});
