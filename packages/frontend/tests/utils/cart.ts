import { Page, expect } from '@playwright/test';

/**
 * Añadir un producto al carrito
 */
export async function addProductToCart(
  page: Page,
  options: {
    productSlug?: string;
    startDate?: string;
    endDate?: string;
    quantity?: number;
  } = {}
) {
  const {
    productSlug = 'letras-luminosas', // Producto de prueba real
    startDate = '2025-12-01',
    endDate = '2025-12-05',
    quantity = 1
  } = options;

  // Ir a la página del producto
  await page.goto(`/productos/${productSlug}`);
  await page.waitForLoadState('networkidle');

  // Seleccionar fechas
  await page.fill('[data-testid="start-date"]', startDate);
  await page.fill('[data-testid="end-date"]', endDate);

  // Seleccionar cantidad si es necesario
  if (quantity > 1) {
    await page.fill('[data-testid="quantity"]', quantity.toString());
  }

  // Añadir al carrito
  await page.click('[data-testid="add-to-cart"]');

  // Esperar confirmación
  await expect(page.locator('text=/añadido/i')).toBeVisible({ timeout: 5000 });
}

/**
 * Ir al carrito
 */
export async function goToCart(page: Page) {
  await page.goto('/carrito');
  await page.waitForLoadState('networkidle');
}

/**
 * Vaciar el carrito
 */
export async function clearCart(page: Page) {
  await goToCart(page);
  
  // Eliminar todos los items
  const removeButtons = page.locator('[data-testid="remove-item"]');
  const count = await removeButtons.count();
  
  for (let i = 0; i < count; i++) {
    await removeButtons.first().click();
    await page.waitForTimeout(500); // Esperar a que se actualice
  }
}

/**
 * Obtener cantidad de items en el carrito
 */
export async function getCartCount(page: Page): Promise<number> {
  try {
    const countText = await page.locator('[data-testid="cart-count"]').textContent();
    return parseInt(countText || '0');
  } catch {
    return 0;
  }
}

/**
 * Verificar que un producto está en el carrito
 */
export async function assertProductInCart(page: Page, productName: string) {
  await goToCart(page);
  await expect(page.locator(`text=${productName}`)).toBeVisible();
}
