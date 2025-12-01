import { Page, expect } from '@playwright/test';

/**
 * Agregar un producto al carrito
 */
export async function addToCart(page: Page, productName?: string) {
  if (productName) {
    // Buscar el producto específico y hacer clic en su botón de agregar
    const productCard = page.locator(`[data-testid="product-card"]:has-text("${productName}")`).first();
    await productCard.locator('button:has-text("Agregar"), button:has-text("Añadir")').click();
  } else {
    // Agregar el primer producto disponible
    await page.locator('button:has-text("Agregar al carrito"), button:has-text("Añadir al carrito")').first().click();
  }
  
  // Esperar confirmación (puede ser un toast o cambio en el icono del carrito)
  await page.waitForTimeout(1000);
}

/**
 * Ir al carrito desde cualquier página
 */
export async function openCart(page: Page) {
  // Buscar el icono/botón del carrito
  const cartButton = page.locator('[data-testid="cart-button"], a[href*="/cart"], button:has-text("Carrito")').first();
  await cartButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Obtener el número de items en el carrito
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const cartBadge = page.locator('[data-testid="cart-count"], .cart-badge, .cart-count').first();
  
  if (await cartBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
    const text = await cartBadge.textContent();
    return parseInt(text || '0', 10);
  }
  
  return 0;
}

/**
 * Cambiar la cantidad de un producto en el carrito
 */
export async function changeQuantity(page: Page, productName: string, quantity: number) {
  const cartItem = page.locator(`[data-testid="cart-item"]:has-text("${productName}")`).first();
  const quantityInput = cartItem.locator('input[type="number"], input[name*="quantity"]').first();
  
  await quantityInput.fill(quantity.toString());
  await quantityInput.press('Enter');
  await page.waitForTimeout(1000); // Esperar actualización
}

/**
 * Incrementar cantidad de un producto
 */
export async function incrementQuantity(page: Page, productName: string) {
  const cartItem = page.locator(`[data-testid="cart-item"]:has-text("${productName}")`).first();
  const incrementButton = cartItem.locator('button:has-text("+"), button[aria-label*="Increment"]').first();
  
  await incrementButton.click();
  await page.waitForTimeout(1000);
}

/**
 * Decrementar cantidad de un producto
 */
export async function decrementQuantity(page: Page, productName: string) {
  const cartItem = page.locator(`[data-testid="cart-item"]:has-text("${productName}")`).first();
  const decrementButton = cartItem.locator('button:has-text("-"), button[aria-label*="Decrement"]').first();
  
  await decrementButton.click();
  await page.waitForTimeout(1000);
}

/**
 * Eliminar un producto del carrito
 */
export async function removeFromCart(page: Page, productName: string) {
  const cartItem = page.locator(`[data-testid="cart-item"]:has-text("${productName}")`).first();
  const removeButton = cartItem.locator('button:has-text("Eliminar"), button:has-text("Quitar"), button[aria-label*="Remove"]').first();
  
  await removeButton.click();
  
  // Confirmar si aparece un diálogo
  const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Aceptar")');
  if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmButton.click();
  }
  
  await page.waitForTimeout(1000);
}

/**
 * Vaciar el carrito completamente
 */
export async function clearCart(page: Page) {
  const clearButton = page.locator('button:has-text("Vaciar carrito"), button:has-text("Limpiar carrito"), button:has-text("Clear cart")').first();
  
  if (await clearButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await clearButton.click();
    
    // Confirmar si aparece un diálogo
    const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Aceptar")');
    if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    await page.waitForTimeout(1000);
  }
}

/**
 * Obtener el total del carrito
 */
export async function getCartTotal(page: Page): Promise<number> {
  const totalElement = page.locator('[data-testid="cart-total"], .cart-total, .total-amount').first();
  const text = await totalElement.textContent();
  
  // Extraer el número del texto (puede incluir símbolos de moneda)
  const match = text?.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(',', ''));
  }
  
  return 0;
}

/**
 * Proceder al checkout desde el carrito
 */
export async function proceedToCheckout(page: Page) {
  const checkoutButton = page.locator('button:has-text("Proceder al pago"), button:has-text("Checkout"), a:has-text("Finalizar compra")').first();
  await checkoutButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Verificar que el carrito está vacío
 */
export async function verifyCartEmpty(page: Page) {
  const emptyMessage = page.locator('text=/carrito está vacío/i, text=/no items/i, [data-testid="empty-cart"]');
  await expect(emptyMessage).toBeVisible();
}

/**
 * Verificar que un producto está en el carrito
 */
export async function verifyProductInCart(page: Page, productName: string) {
  const cartItem = page.locator(`[data-testid="cart-item"]:has-text("${productName}")`).first();
  await expect(cartItem).toBeVisible();
}
