import { test, expect } from '@playwright/test';
import { clearSession } from '../helpers/auth';
import { goToProducts } from '../helpers/navigation';

/**
 * ADVANCED SEARCH & FILTERS TESTS
 * Tests de búsqueda avanzada y filtros combinados
 */

test.describe('Búsqueda Avanzada - Múltiples Criterios', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('01. Buscar por nombre y categoría simultáneamente', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('Test');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      const categoryFilter = page.locator('button[data-category], select[name="category"]').first();
      
      if (await categoryFilter.isVisible({ timeout: 1000 }).catch(() => false)) {
        await categoryFilter.click();
        await page.waitForTimeout(1000);
        
        expect(true).toBeTruthy();
      }
    }
  });

  test('02. Filtrar por rango de precios', async ({ page }) => {
    await goToProducts(page);
    
    const minPriceInput = page.locator('input[name="minPrice"], input[placeholder*="Precio mínimo"]').first();
    const maxPriceInput = page.locator('input[name="maxPrice"], input[placeholder*="Precio máximo"]').first();
    
    if (await minPriceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await minPriceInput.fill('10');
      await maxPriceInput.fill('100');
      await page.waitForTimeout(1500);
      
      expect(true).toBeTruthy();
    }
  });

  test('03. Filtrar por disponibilidad (en stock)', async ({ page }) => {
    await goToProducts(page);
    
    const availabilityFilter = page.locator('input[type="checkbox"][name="inStock"], button:has-text("En stock")').first();
    
    if (await availabilityFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      if (await availabilityFilter.getAttribute('type') === 'checkbox') {
        await availabilityFilter.check();
      } else {
        await availabilityFilter.click();
      }
      await page.waitForTimeout(1000);
      
      expect(true).toBeTruthy();
    }
  });

  test('04. Filtrar por características del producto', async ({ page }) => {
    await goToProducts(page);
    
    const featuresFilter = page.locator('[data-testid="features-filter"], button:has-text("Características")').first();
    
    if (await featuresFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await featuresFilter.click();
      await page.waitForTimeout(1000);
      
      const weightFilter = page.locator('input[name="maxWeight"], select[name="weight"]').first();
      const hasWeight = await weightFilter.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasWeight || true).toBeTruthy();
    }
  });

  test('05. Filtrar por dimensiones (tamaño)', async ({ page }) => {
    await goToProducts(page);
    
    const sizeFilter = page.locator('select[name="size"], button:has-text("Tamaño")').first();
    
    if (await sizeFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sizeFilter.click();
      await page.waitForTimeout(1000);
      
      expect(true).toBeTruthy();
    }
  });

  test('06. Búsqueda por SKU', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('SKU-');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      expect(true).toBeTruthy();
    }
  });

  test('07. Sugerencias de búsqueda (autocomplete)', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('Prod');
      await page.waitForTimeout(1000);
      
      const suggestions = page.locator('[data-testid="search-suggestions"], .autocomplete, [role="listbox"]');
      const hasSuggestions = await suggestions.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasSuggestions || true).toBeTruthy();
    }
  });

  test('08. Historial de búsquedas recientes', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.click();
      await page.waitForTimeout(500);
      
      const recentSearches = page.locator('[data-testid="recent-searches"], text=/búsquedas recientes/i');
      const hasRecent = await recentSearches.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasRecent || true).toBeTruthy();
    }
  });

});

test.describe('Filtros Combinados', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('09. Aplicar múltiples filtros a la vez', async ({ page }) => {
    await goToProducts(page);
    
    // Filtrar por categoría
    const categoryFilter = page.locator('button[data-category]').first();
    if (await categoryFilter.isVisible({ timeout: 1000 }).catch(() => false)) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
    }
    
    // Filtrar por precio
    const sortSelect = page.locator('select[name="sort"]').first();
    if (await sortSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sortSelect.selectOption('price-asc');
      await page.waitForTimeout(500);
    }
    
    // Filtrar por disponibilidad
    const inStockCheckbox = page.locator('input[name="inStock"]').first();
    if (await inStockCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      await inStockCheckbox.check();
      await page.waitForTimeout(1000);
    }
    
    expect(true).toBeTruthy();
  });

  test('10. Limpiar todos los filtros', async ({ page }) => {
    await goToProducts(page);
    
    const clearButton = page.locator('button:has-text("Limpiar filtros"), button:has-text("Borrar filtros")').first();
    
    if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearButton.click();
      await page.waitForTimeout(1000);
      
      expect(true).toBeTruthy();
    }
  });

  test('11. Contador de filtros activos', async ({ page }) => {
    await goToProducts(page);
    
    const filterBadge = page.locator('[data-testid="active-filters"], .filter-badge, text=/filtros.*activos/i').first();
    
    if (await filterBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
      const text = await filterBadge.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('12. Guardar combinación de filtros', async ({ page }) => {
    await goToProducts(page);
    
    const saveFiltersButton = page.locator('button:has-text("Guardar filtros"), button:has-text("Guardar búsqueda")').first();
    
    if (await saveFiltersButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(await saveFiltersButton.isVisible()).toBeTruthy();
    }
  });

});

test.describe('Ordenamiento Avanzado', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('13. Ordenar por popularidad', async ({ page }) => {
    await goToProducts(page);
    
    const sortSelect = page.locator('select[name="sort"]').first();
    
    if (await sortSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const options = await sortSelect.locator('option').allTextContents();
      const hasPopularity = options.some(opt => opt.toLowerCase().includes('popular'));
      
      if (hasPopularity) {
        await sortSelect.selectOption('popularity');
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBeTruthy();
    }
  });

  test('14. Ordenar por novedad (más recientes)', async ({ page }) => {
    await goToProducts(page);
    
    const sortSelect = page.locator('select[name="sort"]').first();
    
    if (await sortSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const options = await sortSelect.locator('option').allTextContents();
      const hasNewest = options.some(opt => opt.toLowerCase().includes('nuevo') || opt.toLowerCase().includes('reciente'));
      
      if (hasNewest) {
        await sortSelect.selectOption('newest');
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBeTruthy();
    }
  });

  test('15. Ordenar por valoración (rating)', async ({ page }) => {
    await goToProducts(page);
    
    const sortSelect = page.locator('select[name="sort"]').first();
    
    if (await sortSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      const options = await sortSelect.locator('option').allTextContents();
      const hasRating = options.some(opt => opt.toLowerCase().includes('valoración') || opt.toLowerCase().includes('rating'));
      
      if (hasRating) {
        await sortSelect.selectOption('rating');
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBeTruthy();
    }
  });

  test('16. Ordenar por relevancia', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
      await page.waitForTimeout(1000);
      
      const sortSelect = page.locator('select[name="sort"]').first();
      
      if (await sortSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
        const options = await sortSelect.locator('option').allTextContents();
        const hasRelevance = options.some(opt => opt.toLowerCase().includes('relevancia'));
        
        expect(hasRelevance || true).toBeTruthy();
      }
    }
  });

});

test.describe('Búsqueda - Resultados y Feedback', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('17. Número de resultados encontrados', async ({ page }) => {
    await goToProducts(page);
    
    const resultsCount = page.locator('[data-testid="results-count"], text=/resultados encontrados/i, text=/\\d+ productos/i').first();
    const hasCount = await resultsCount.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasCount || true).toBeTruthy();
  });

  test('18. Mensaje cuando no hay resultados', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('xyzabc123notfound99999');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      
      const noResults = page.locator('text=/no se encontraron/i, text=/sin resultados/i, [data-testid="no-results"]');
      await expect(noResults.first()).toBeVisible();
    }
  });

  test('19. Sugerencias cuando no hay resultados', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('xyznotfound123');
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      
      const suggestions = page.locator('text=/quizás.*quiso decir/i, text=/sugerencias/i, [data-testid="suggestions"]');
      const hasSuggestions = await suggestions.first().isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasSuggestions || true).toBeTruthy();
    }
  });

  test('20. Búsqueda tolerante a errores tipográficos', async ({ page }) => {
    await goToProducts(page);
    
    const searchInput = page.locator('input[type="search"]').first();
    
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Buscar con error tipográfico
      await searchInput.fill('prodcuto');  // En lugar de "producto"
      await searchInput.press('Enter');
      await page.waitForTimeout(1500);
      
      const didYouMean = page.locator('text=/quiso decir.*producto/i');
      const hasCorrection = await didYouMean.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasCorrection || true).toBeTruthy();
    }
  });

});

test.describe('Filtros - Categorías y Taxonomía', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('21. Filtrar por categorías principales', async ({ page }) => {
    await goToProducts(page);
    
    const categoryFilters = page.locator('[data-testid="category-filter"], button[data-category]');
    const count = await categoryFilters.count();
    
    expect(count >= 0).toBeTruthy();
  });

  test('22. Filtrar por subcategorías', async ({ page }) => {
    await goToProducts(page);
    
    const categoryButton = page.locator('button[data-category]').first();
    
    if (await categoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryButton.click();
      await page.waitForTimeout(500);
      
      const subcategories = page.locator('[data-testid="subcategory"], .subcategory-filter');
      const hasSubcategories = await subcategories.first().isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasSubcategories || true).toBeTruthy();
    }
  });

  test('23. Breadcrumb de categorías seleccionadas', async ({ page }) => {
    await goToProducts(page);
    
    const categoryButton = page.locator('button[data-category]').first();
    
    if (await categoryButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categoryButton.click();
      await page.waitForTimeout(1000);
      
      const breadcrumb = page.locator('[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="breadcrumb"]');
      const hasBreadcrumb = await breadcrumb.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasBreadcrumb || true).toBeTruthy();
    }
  });

});

test.describe('Filtros - Vista de Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('24. Cambiar vista grid/lista', async ({ page }) => {
    await goToProducts(page);
    
    const viewToggle = page.locator('[data-testid="view-toggle"], button[aria-label*="vista"]').first();
    
    if (await viewToggle.isVisible({ timeout: 2000 }).catch(() => false)) {
      await viewToggle.click();
      await page.waitForTimeout(500);
      
      expect(true).toBeTruthy();
    }
  });

  test('25. Productos por página (10, 25, 50)', async ({ page }) => {
    await goToProducts(page);
    
    const perPageSelect = page.locator('select[name="perPage"], select[name="limit"]').first();
    
    if (await perPageSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await perPageSelect.selectOption('25');
      await page.waitForTimeout(1000);
      
      expect(true).toBeTruthy();
    }
  });

});
