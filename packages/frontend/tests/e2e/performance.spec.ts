import { test, expect } from '@playwright/test';

test.describe('Performance y Rendimiento', () => {
  test('debe cargar la página principal en menos de 3 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tiempo de carga: ${loadTime}ms`);
    
    // Debe cargar en menos de 3 segundos
    expect(loadTime).toBeLessThan(3000);
  });

  test('debe cargar productos en menos de 5 segundos', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles', { timeout: 10000 });
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    console.log(`Tiempo de carga de productos: ${loadTime}ms`);
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('no debe tener errores en consola (críticos)', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Filtrar errores conocidos/aceptables (401 en auth check es esperado)
    const criticalErrors = errors.filter(error => 
      !error.includes('401') && 
      !error.includes('auth/me')
    );
    
    console.log(`Errores críticos encontrados: ${criticalErrors.length}`);
    if (criticalErrors.length > 0) {
      console.log(criticalErrors);
    }
    
    // No debería haber errores críticos
    expect(criticalErrors.length).toBe(0);
  });

  test('debe cargar las 15 categorías sin timeout', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Hover en catálogo
    await page.hover('text=Catálogo');
    
    // Debe cargar las categorías rápidamente
    await expect(page.locator('text=Por Categoría (15)')).toBeVisible({ timeout: 5000 });
  });

  test('debe manejar múltiples navegaciones rápidas', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navegar rápidamente entre páginas
    await page.click('text=Productos');
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('text=Servicios');
    await page.waitForLoadState('domcontentloaded');
    
    await page.click('text=Resona');
    await page.waitForLoadState('domcontentloaded');
    
    // No debería romper la aplicación
    await expect(page.locator('text=Resona')).toBeVisible();
  });

  test('debe funcionar con conexión lenta simulada', async ({ page, context }) => {
    // Simular conexión 3G lenta
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });
    
    await page.goto('http://localhost:3000');
    
    // Debe cargar aunque sea lento
    await expect(page.locator('text=Resona')).toBeVisible({ timeout: 15000 });
  });

  test('imágenes deben tener lazy loading o cargarse correctamente', async ({ page }) => {
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('img', { timeout: 5000 });
    
    const images = await page.locator('img').all();
    
    // Verificar que las imágenes cargadas tienen src o data-src
    for (const img of images.slice(0, 5)) { // Solo primeras 5 para no demorar
      const src = await img.getAttribute('src');
      const dataSrc = await img.getAttribute('data-src');
      
      expect(src || dataSrc).toBeTruthy();
    }
  });
});

test.describe('Accesibilidad Básica', () => {
  test('debe tener alt text en imágenes', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Las imágenes deben tener alt (aunque sea vacío)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('debe ser navegable con teclado', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Tab a través de elementos
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // El foco debe moverse
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBeTruthy();
  });

  test('botones deben tener texto o aria-label', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons.slice(0, 10)) { // Primeros 10
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Botón debe tener texto o aria-label
      expect((text && text.trim().length > 0) || ariaLabel).toBeTruthy();
    }
  });

  test('debe tener título de página', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('links deben ser clickables', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const links = await page.locator('a[href]').all();
    
    // Debe haber links en la página
    expect(links.length).toBeGreaterThan(0);
    
    // El primer link debe tener href válido
    if (links.length > 0) {
      const href = await links[0].getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});
