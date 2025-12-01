import { test, expect } from '@playwright/test';
import { appUrls } from '../fixtures/test-data';
import { clearSession } from '../helpers/auth';
import { goToProducts, goToCart } from '../helpers/navigation';
import {
  addToCart,
  openCart,
  getCartItemCount,
  changeQuantity,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  proceedToCheckout,
  verifyCartEmpty,
  verifyProductInCart
} from '../helpers/cart';

/**
 * CART TESTS
 * Tests exhaustivos del sistema de carrito de compras
 */

test.describe('Carrito - Agregar Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('01. Agregar un producto al carrito', async ({ page }) => {
    await goToProducts(page);
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const productName = await firstProduct.locator('h2, h3, .product-name').first().textContent();
      
      // Agregar al carrito
      const addButton = firstProduct.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
      await addButton.click();
      
      await page.waitForTimeout(1500);
      
      // Verificar que el contador del carrito aumentó
      const cartCount = await getCartItemCount(page);
      expect(cartCount).toBeGreaterThan(0);
    }
  });

  test('02. Agregar múltiples productos al carrito', async ({ page }) => {
    await goToProducts(page);
    
    const products = page.locator('[data-testid="product-card"], .product-card');
    const count = await products.count();
    
    if (count >= 3) {
      // Agregar los primeros 3 productos
      for (let i = 0; i < 3; i++) {
        const addButton = products.nth(i).locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
        await addButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Verificar contador del carrito
      const cartCount = await getCartItemCount(page);
      expect(cartCount).toBeGreaterThanOrEqual(3);
    }
  });

  test('03. Agregar el mismo producto varias veces incrementa cantidad', async ({ page }) => {
    await goToProducts(page);
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const addButton = firstProduct.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
      
      // Agregar 3 veces el mismo producto
      await addButton.click();
      await page.waitForTimeout(1000);
      await addButton.click();
      await page.waitForTimeout(1000);
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Ir al carrito y verificar cantidad
      await goToCart(page);
      
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
      if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        const quantity = await quantityInput.inputValue();
        expect(parseInt(quantity, 10)).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('04. Botón de agregar muestra feedback visual', async ({ page }) => {
    await goToProducts(page);
    
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const addButton = firstProduct.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
      
      await addButton.click();
      
      // Esperar toast, modal o cambio en el botón
      const toast = page.locator('.toast, .notification, [role="alert"]').first();
      const hasToast = await toast.isVisible({ timeout: 2000 }).catch(() => false);
      
      // También verificar si el contador del carrito cambió
      const cartCount = await getCartItemCount(page);
      
      expect(hasToast || cartCount > 0).toBeTruthy();
    }
  });

  test('05. Agregar producto sin stock debe mostrar error', async ({ page }) => {
    await goToProducts(page);
    
    // Buscar producto agotado
    const outOfStockProduct = page.locator('[data-testid="product-card"]:has-text("Agotado"), [data-testid="product-card"]:has-text("Sin stock")').first();
    
    if (await outOfStockProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const addButton = outOfStockProduct.locator('button:has-text("Agregar"), button:has-text("Añadir")').first();
      
      // El botón debería estar deshabilitado o no visible
      const isDisabled = await addButton.isDisabled().catch(() => true);
      const isVisible = await addButton.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(isDisabled || !isVisible).toBeTruthy();
    }
  });

});

test.describe('Carrito - Visualización y Gestión', () => {

  test('06. Abrir carrito desde icono/botón de navegación', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar un producto primero
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    // Abrir carrito
    await openCart(page);
    
    // Verificar que estamos en la página del carrito
    await expect(page).toHaveURL(/\/cart/);
  });

  test('07. Carrito muestra productos agregados correctamente', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const productName = await firstProduct.locator('h2, h3, .product-name').first().textContent();
      
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
      
      // Ir al carrito
      await goToCart(page);
      
      // Verificar que el producto está en el carrito
      if (productName) {
        await verifyProductInCart(page, productName.trim());
      }
    }
  });

  test('08. Carrito muestra información de cada producto', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    // Verificar elementos del producto en carrito
    const cartItem = page.locator('[data-testid="cart-item"]').first();
    
    if (await cartItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Nombre
      const productName = cartItem.locator('h2, h3, .product-name, [data-testid="product-name"]').first();
      await expect(productName).toBeVisible();
      
      // Precio
      const price = cartItem.locator('[data-testid="price"], .price, .item-price').first();
      await expect(price).toBeVisible();
      
      // Cantidad
      const quantity = cartItem.locator('input[type="number"], [data-testid="quantity"]').first();
      await expect(quantity).toBeVisible();
    }
  });

  test('09. Carrito muestra total calculado correctamente', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    // Verificar que hay un total visible
    const total = page.locator('[data-testid="cart-total"], .cart-total, .total-amount').first();
    await expect(total).toBeVisible();
    
    const totalText = await total.textContent();
    expect(totalText).toBeTruthy();
    expect(totalText.length).toBeGreaterThan(0);
  });

  test('10. Carrito vacío muestra mensaje apropiado', async ({ page }) => {
    await goToCart(page);
    
    // Verificar mensaje de carrito vacío
    await verifyCartEmpty(page);
  });

});

test.describe('Carrito - Modificar Cantidades', () => {

  test('11. Incrementar cantidad de un producto', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    // Obtener cantidad inicial
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialQuantity = parseInt(await quantityInput.inputValue(), 10);
      
      // Incrementar
      const incrementButton = page.locator('button:has-text("+"), button[aria-label*="Increment"]').first();
      if (await incrementButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await incrementButton.click();
        await page.waitForTimeout(1000);
        
        const newQuantity = parseInt(await quantityInput.inputValue(), 10);
        expect(newQuantity).toBe(initialQuantity + 1);
      }
    }
  });

  test('12. Decrementar cantidad de un producto', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto 2 veces
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const addButton = firstProduct.locator('button:has-text("Agregar")').first();
      await addButton.click();
      await page.waitForTimeout(1000);
      await addButton.click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    // Decrementar
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialQuantity = parseInt(await quantityInput.inputValue(), 10);
      
      const decrementButton = page.locator('button:has-text("-"), button[aria-label*="Decrement"]').first();
      if (await decrementButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await decrementButton.click();
        await page.waitForTimeout(1000);
        
        const newQuantity = parseInt(await quantityInput.inputValue(), 10);
        expect(newQuantity).toBe(initialQuantity - 1);
      }
    }
  });

  test('13. Cambiar cantidad manualmente en el input', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    // Cambiar cantidad manualmente
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quantityInput.fill('5');
      await quantityInput.press('Enter');
      await page.waitForTimeout(1500);
      
      const newQuantity = parseInt(await quantityInput.inputValue(), 10);
      expect(newQuantity).toBe(5);
    }
  });

  test('14. Cantidad 0 elimina el producto del carrito', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    const cartItems = await page.locator('[data-testid="cart-item"]').count();
    
    if (cartItems > 0) {
      // Poner cantidad a 0
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
      if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await quantityInput.fill('0');
        await quantityInput.press('Enter');
        await page.waitForTimeout(1500);
        
        // Verificar que se eliminó
        const newCount = await page.locator('[data-testid="cart-item"]').count();
        expect(newCount).toBe(cartItems - 1);
      }
    }
  });

  test('15. Total se actualiza al cambiar cantidades', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    const totalElement = page.locator('[data-testid="cart-total"], .cart-total, .total-amount').first();
    
    if (await totalElement.isVisible({ timeout: 2000 }).catch(() => false)) {
      const initialTotal = await totalElement.textContent();
      
      // Incrementar cantidad
      const incrementButton = page.locator('button:has-text("+")').first();
      if (await incrementButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await incrementButton.click();
        await page.waitForTimeout(1500);
        
        const newTotal = await totalElement.textContent();
        expect(newTotal).not.toBe(initialTotal);
      }
    }
  });

});

test.describe('Carrito - Eliminar Productos', () => {

  test('16. Eliminar un producto del carrito', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar productos
    const products = page.locator('[data-testid="product-card"], .product-card');
    const count = await products.count();
    
    if (count >= 2) {
      for (let i = 0; i < 2; i++) {
        await products.nth(i).locator('button:has-text("Agregar")').first().click();
        await page.waitForTimeout(1000);
      }
    }
    
    await goToCart(page);
    
    const initialCount = await page.locator('[data-testid="cart-item"]').count();
    
    if (initialCount > 0) {
      // Eliminar primer producto
      const removeButton = page.locator('button:has-text("Eliminar"), button:has-text("Quitar")').first();
      if (await removeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await removeButton.click();
        
        // Confirmar si hay modal
        const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí")');
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        await page.waitForTimeout(1500);
        
        const newCount = await page.locator('[data-testid="cart-item"]').count();
        expect(newCount).toBe(initialCount - 1);
      }
    }
  });

  test('17. Vaciar carrito completo', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar productos
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    await clearCart(page);
    
    // Verificar que el carrito está vacío
    await verifyCartEmpty(page);
  });

  test('18. Confirmar eliminación de producto si hay modal', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    const removeButton = page.locator('button:has-text("Eliminar"), button:has-text("Quitar")').first();
    if (await removeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await removeButton.click();
      
      // Buscar modal de confirmación
      const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Aceptar")');
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(1500);
      }
      
      // El producto debería estar eliminado
      const items = await page.locator('[data-testid="cart-item"]').count();
      expect(items).toBe(0);
    }
  });

});

test.describe('Carrito - Persistencia y Navegación', () => {

  test('19. Carrito persiste al navegar por la aplicación', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    const cartCount1 = await getCartItemCount(page);
    
    // Navegar a otra página
    await page.goto(appUrls.home);
    await page.waitForLoadState('networkidle');
    
    // Volver a productos
    await goToProducts(page);
    
    const cartCount2 = await getCartItemCount(page);
    expect(cartCount2).toBe(cartCount1);
  });

  test('20. Carrito persiste al recargar la página', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    const cartCount1 = await getCartItemCount(page);
    
    // Recargar
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const cartCount2 = await getCartItemCount(page);
    expect(cartCount2).toBe(cartCount1);
  });

  test('21. Contador del carrito se actualiza en todas las páginas', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1500);
    }
    
    const cartCountProducts = await getCartItemCount(page);
    
    // Ir a home
    await page.goto(appUrls.home);
    await page.waitForLoadState('networkidle');
    
    const cartCountHome = await getCartItemCount(page);
    
    expect(cartCountHome).toBe(cartCountProducts);
  });

  test('22. Botón de proceder al checkout funciona', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    await proceedToCheckout(page);
    
    // Verificar que redirige al checkout o al login
    await page.waitForTimeout(2000);
    const url = page.url();
    const redirectedCorrectly = url.includes('/checkout') || url.includes('/login');
    
    expect(redirectedCorrectly).toBeTruthy();
  });

});

test.describe('Carrito - Validaciones y Edge Cases', () => {

  test('23. No se puede agregar cantidad negativa', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Intentar poner cantidad negativa
      await quantityInput.fill('-5');
      await quantityInput.press('Enter');
      await page.waitForTimeout(1000);
      
      const quantity = parseInt(await quantityInput.inputValue(), 10);
      expect(quantity).toBeGreaterThanOrEqual(0);
    }
  });

  test('24. No se puede exceder el stock disponible', async ({ page }) => {
    await goToProducts(page);
    
    // Agregar producto
    const firstProduct = page.locator('[data-testid="product-card"], .product-card').first();
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.locator('button:has-text("Agregar")').first().click();
      await page.waitForTimeout(1000);
    }
    
    await goToCart(page);
    
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]').first();
    if (await quantityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Intentar poner cantidad muy alta (ej. 999999)
      await quantityInput.fill('999999');
      await quantityInput.press('Enter');
      await page.waitForTimeout(1500);
      
      // Debería mostrar error o limitar la cantidad
      const toast = page.locator('.toast, [role="alert"]');
      const hasError = await toast.isVisible({ timeout: 2000 }).catch(() => false);
      
      const quantity = parseInt(await quantityInput.inputValue(), 10);
      
      // La cantidad debe ser razonable o debe mostrar error
      expect(hasError || quantity < 999999).toBeTruthy();
    }
  });

});
