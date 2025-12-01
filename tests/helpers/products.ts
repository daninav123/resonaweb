import { Page, expect } from '@playwright/test';

/**
 * Ver detalles de un producto
 */
export async function viewProductDetails(page: Page, productName: string) {
  const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
  await productCard.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Buscar productos por texto
 */
export async function searchProducts(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[name="search"]').first();
  await searchInput.fill(searchTerm);
  await searchInput.press('Enter');
  await page.waitForLoadState('networkidle');
}

/**
 * Filtrar productos por categoría
 */
export async function filterByCategory(page: Page, categoryName: string) {
  const categoryFilter = page.locator(`button:has-text("${categoryName}"), a:has-text("${categoryName}"), [data-category="${categoryName}"]`).first();
  await categoryFilter.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Ordenar productos
 */
export async function sortProducts(page: Page, sortOption: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'newest') {
  const sortSelect = page.locator('select[name="sort"], select#sort, [data-testid="sort-select"]').first();
  await sortSelect.selectOption(sortOption);
  await page.waitForLoadState('networkidle');
}

/**
 * Obtener lista de productos visibles
 */
export async function getVisibleProducts(page: Page): Promise<string[]> {
  const productCards = page.locator('[data-testid="product-card"], .product-card');
  const count = await productCards.count();
  
  const products: string[] = [];
  for (let i = 0; i < count; i++) {
    const name = await productCards.nth(i).locator('h2, h3, .product-name, [data-testid="product-name"]').first().textContent();
    if (name) {
      products.push(name.trim());
    }
  }
  
  return products;
}

/**
 * Obtener precio de un producto
 */
export async function getProductPrice(page: Page, productName: string): Promise<number> {
  const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
  const priceElement = productCard.locator('[data-testid="product-price"], .product-price, .price').first();
  const text = await priceElement.textContent();
  
  const match = text?.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(',', ''));
  }
  
  return 0;
}

/**
 * Verificar que un producto tiene stock disponible
 */
export async function verifyProductInStock(page: Page, productName: string) {
  const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
  const stockIndicator = productCard.locator('text=/en stock/i, text=/disponible/i, [data-testid="in-stock"]');
  
  await expect(stockIndicator).toBeVisible();
}

/**
 * Verificar que un producto está agotado
 */
export async function verifyProductOutOfStock(page: Page, productName: string) {
  const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
  const stockIndicator = productCard.locator('text=/agotado/i, text=/sin stock/i, text=/out of stock/i, [data-testid="out-of-stock"]');
  
  await expect(stockIndicator).toBeVisible();
}

/**
 * Cambiar período de alquiler (día, fin de semana, semana)
 */
export async function selectRentalPeriod(page: Page, period: 'day' | 'weekend' | 'week') {
  const periodButton = page.locator(`button:has-text("Día"), button:has-text("Fin de semana"), button:has-text("Semana")`);
  
  if (period === 'day') {
    await periodButton.filter({ hasText: 'Día' }).click();
  } else if (period === 'weekend') {
    await periodButton.filter({ hasText: 'Fin de semana' }).click();
  } else {
    await periodButton.filter({ hasText: 'Semana' }).click();
  }
  
  await page.waitForTimeout(500);
}

/**
 * Verificar cantidad de productos en la página
 */
export async function verifyProductCount(page: Page, expectedCount: number) {
  const productCards = page.locator('[data-testid="product-card"], .product-card');
  await expect(productCards).toHaveCount(expectedCount);
}

/**
 * Scroll para cargar más productos (si hay paginación infinita)
 */
export async function loadMoreProducts(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
}

/**
 * Ir a la siguiente página de productos (paginación)
 */
export async function goToNextPage(page: Page) {
  const nextButton = page.locator('button:has-text("Siguiente"), button:has-text("Next"), [aria-label="Next page"]').first();
  await nextButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Verificar que existe un producto con un nombre específico
 */
export async function verifyProductExists(page: Page, productName: string) {
  const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
  await expect(productCard).toBeVisible();
}
