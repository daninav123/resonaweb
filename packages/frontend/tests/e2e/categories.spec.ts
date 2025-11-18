import { test, expect } from '@playwright/test';

test.describe('Categorías - 15 Categorías Completas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('debe mostrar 15 categorías en el dropdown del menú', async ({ page }) => {
    // Hover sobre el menú Catálogo
    await page.hover('text=Catálogo');
    
    // Esperar que aparezca el dropdown
    await page.waitForSelector('text=Por Categoría');
    
    // Verificar que dice "(15)"
    const categoryHeader = await page.textContent('text=Por Categoría');
    expect(categoryHeader).toContain('15');
    
    // Verificar que existen las 15 categorías esperadas
    const expectedCategories = [
      'Fotografía y Video',
      'Iluminación',
      'Sonido',
      'Microfonía',
      'Mesas de Mezcla para Directo',
      'Equipamiento DJ',
      'Elementos de Escenario',
      'Elementos Decorativos',
      'Mobiliario',
      'Backline',
      'Pantallas y Proyección',
      'Efectos Especiales',
      'Comunicaciones',
      'Energía y Distribución',
      'Cables y Conectores',
    ];

    for (const category of expectedCategories) {
      await expect(page.locator(`text=${category}`).first()).toBeVisible();
    }
  });

  test('debe navegar a productos cuando se hace click en una categoría', async ({ page }) => {
    // Hover sobre Catálogo
    await page.hover('text=Catálogo');
    
    // Click en "Sonido"
    await page.click('text=Sonido');
    
    // Verificar que navegó a productos con filtro
    await expect(page).toHaveURL(/\/productos\?category=/);
  });

  test('debe mostrar 15 categorías en la página de productos', async ({ page }) => {
    // Ir a productos
    await page.goto('http://localhost:3000/productos');
    
    // Verificar contador de categorías
    await expect(page.locator('text=15 categorías disponibles')).toBeVisible();
    
    // Verificar que el dropdown tiene opciones
    const categorySelect = page.locator('select').first();
    const options = await categorySelect.locator('option').count();
    
    // 15 categorías + 1 opción "Todas las categorías"
    expect(options).toBe(16);
  });

  test('debe filtrar productos por categoría', async ({ page }) => {
    await page.goto('http://localhost:3000/productos');
    
    // Seleccionar una categoría
    await page.selectOption('select', { index: 1 }); // Primera categoría
    
    // Esperar a que se actualice la URL
    await page.waitForTimeout(500);
    
    // Verificar que la URL cambió
    expect(page.url()).toContain('category=');
  });

  test('debe mostrar iconos en cada categoría del menú', async ({ page }) => {
    await page.hover('text=Catálogo');
    
    // Verificar que hay emojis/iconos (símbolos Unicode)
    const menuItems = await page.locator('[href*="/productos?category="]').all();
    
    expect(menuItems.length).toBeGreaterThan(0);
    
    // Verificar que al menos uno tiene un emoji
    const firstItem = await menuItems[0].textContent();
    expect(firstItem).toMatch(/[\u{1F300}-\u{1F9FF}]/u); // Rango de emojis
  });
});
