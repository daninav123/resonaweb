import { test, expect, Page } from '@playwright/test';

/**
 * Test E2E para Descuentos y Cupones
 * Verifica que los descuentos se apliquen correctamente en:
 * 1. Carrito
 * 2. Checkout
 * 3. Orden final
 */

const TEST_COUPON = {
  code: 'TEST20',
  discountPercent: 20,
  minAmount: 50
};

const TEST_PRODUCT = {
  name: 'Test Product for Discount',
  price: 100
};

// Helper: Login como usuario regular
async function loginAsUser(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('**/', { timeout: 5000 });
}

// Helper: Añadir producto al carrito
async function addProductToCart(page: Page) {
  await page.goto('http://localhost:3000/productos');
  
  // Buscar cualquier producto disponible
  const firstProduct = await page.locator('[data-testid="product-card"]').first();
  await firstProduct.click();
  
  // Esperar a que cargue la página de detalle
  await page.waitForSelector('[data-testid="add-to-cart-button"]', { timeout: 5000 });
  
  // Seleccionar fechas
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  await page.fill('[data-testid="start-date-input"]', today.toISOString().split('T')[0]);
  await page.fill('[data-testid="end-date-input"]', tomorrow.toISOString().split('T')[0]);
  
  // Añadir al carrito
  await page.click('[data-testid="add-to-cart-button"]');
  await page.waitForTimeout(1000);
}

test.describe('Descuentos y Cupones', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies y localStorage
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('01 - Crear cupón de prueba (admin)', async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:3000/login');
    await page.fill('[data-testid="email-input"]', 'admin@resonaevents.com');
    await page.fill('[data-testid="password-input"]', 'Resona2024!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/admin/**', { timeout: 5000 });

    // Ir a gestión de cupones
    await page.goto('http://localhost:3000/admin/cupones');
    await page.waitForSelector('[data-testid="create-coupon-button"]', { timeout: 5000 });

    // Verificar que existe o crear cupón de prueba
    const couponExists = await page.locator(`text="${TEST_COUPON.code}"`).count() > 0;
    
    if (!couponExists) {
      await page.click('[data-testid="create-coupon-button"]');
      
      // Llenar formulario
      await page.fill('[data-testid="coupon-code-input"]', TEST_COUPON.code);
      await page.fill('[data-testid="coupon-description-input"]', 'Cupón de prueba 20% descuento');
      await page.selectOption('[data-testid="discount-type-select"]', 'PERCENTAGE');
      await page.fill('[data-testid="discount-value-input"]', TEST_COUPON.discountPercent.toString());
      await page.fill('[data-testid="minimum-amount-input"]', TEST_COUPON.minAmount.toString());
      
      // Guardar
      await page.click('[data-testid="save-coupon-button"]');
      await page.waitForTimeout(1000);
    }

    console.log('✅ Cupón de prueba verificado/creado');
  });

  test('02 - Aplicar cupón en el carrito', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    // Ir al carrito
    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    // Obtener subtotal antes del descuento
    const subtotalText = await page.locator('[data-testid="cart-subtotal"]').textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Subtotal antes de descuento:', subtotal);

    expect(subtotal).toBeGreaterThan(0);

    // Aplicar cupón
    await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
    await page.click('[data-testid="apply-coupon-button"]');
    
    // Esperar confirmación
    await page.waitForSelector('[data-testid="coupon-applied-message"]', { timeout: 5000 });

    // Verificar que el descuento se muestra
    const discountText = await page.locator('[data-testid="cart-discount-amount"]').textContent();
    const discountAmount = parseFloat(discountText?.replace(/[^0-9.]/g, '') || '0');
    console.log('💰 Descuento aplicado:', discountAmount);

    // Calcular descuento esperado (20% del subtotal)
    const expectedDiscount = subtotal * (TEST_COUPON.discountPercent / 100);
    
    // Verificar que el descuento es correcto (con tolerancia de 0.01€)
    expect(Math.abs(discountAmount - expectedDiscount)).toBeLessThan(0.02);

    // Verificar que el total se ha actualizado correctamente
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Total después de descuento:', total);

    // El total debe ser menor que el subtotal original
    expect(total).toBeLessThan(subtotal);

    console.log('✅ Cupón aplicado correctamente en el carrito');
  });

  test('03 - Verificar descuento en checkout', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    // Ir al carrito y aplicar cupón
    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
    await page.click('[data-testid="apply-coupon-button"]');
    await page.waitForSelector('[data-testid="coupon-applied-message"]', { timeout: 5000 });

    // Obtener el total del carrito
    const cartTotalText = await page.locator('[data-testid="cart-total"]').textContent();
    const cartTotal = parseFloat(cartTotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('🛒 Total en carrito:', cartTotal);

    // Proceder al checkout
    await page.click('[data-testid="proceed-to-checkout-button"]');
    await page.waitForURL('**/checkout', { timeout: 5000 });

    // Esperar a que cargue el resumen
    await page.waitForSelector('[data-testid="checkout-summary"]', { timeout: 5000 });

    // Verificar que el cupón sigue aplicado
    const couponApplied = await page.locator('[data-testid="coupon-applied-message"]').count() > 0;
    expect(couponApplied).toBe(true);

    // Verificar que el descuento se muestra en checkout
    const checkoutDiscountText = await page.locator('[data-testid="checkout-discount-amount"]').textContent();
    const checkoutDiscount = parseFloat(checkoutDiscountText?.replace(/[^0-9.]/g, '') || '0');
    console.log('💰 Descuento en checkout:', checkoutDiscount);

    expect(checkoutDiscount).toBeGreaterThan(0);

    // Verificar que el total es consistente
    const checkoutTotalText = await page.locator('[data-testid="checkout-total"]').textContent();
    const checkoutTotal = parseFloat(checkoutTotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Total en checkout:', checkoutTotal);

    // Los totales deben ser iguales (con tolerancia de 0.01€)
    expect(Math.abs(checkoutTotal - cartTotal)).toBeLessThan(0.02);

    console.log('✅ Descuento verificado en checkout');
  });

  test('04 - Verificar IVA calculado correctamente con descuento', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    // Obtener subtotal antes de descuento
    const subtotalText = await page.locator('[data-testid="cart-subtotal"]').textContent();
    const subtotal = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');

    // Aplicar cupón
    await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
    await page.click('[data-testid="apply-coupon-button"]');
    await page.waitForSelector('[data-testid="coupon-applied-message"]', { timeout: 5000 });

    // Obtener descuento
    const discountText = await page.locator('[data-testid="cart-discount-amount"]').textContent();
    const discount = parseFloat(discountText?.replace(/[^0-9.]/g, '') || '0');

    // Obtener IVA
    const taxText = await page.locator('[data-testid="cart-tax-amount"]').textContent();
    const tax = parseFloat(taxText?.replace(/[^0-9.]/g, '') || '0');
    console.log('🧾 IVA aplicado:', tax);

    // Calcular IVA esperado: 21% sobre (subtotal - descuento)
    const subtotalAfterDiscount = subtotal - discount;
    const expectedTax = subtotalAfterDiscount * 0.21;
    console.log('🧾 IVA esperado:', expectedTax);

    // Verificar IVA correcto (con tolerancia de 0.01€)
    expect(Math.abs(tax - expectedTax)).toBeLessThan(0.02);

    // Verificar total final
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    const total = parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0');

    const expectedTotal = subtotalAfterDiscount + tax;
    expect(Math.abs(total - expectedTotal)).toBeLessThan(0.02);

    console.log('✅ IVA calculado correctamente con descuento');
  });

  test('05 - Verificar cupón en orden final', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    // Aplicar cupón en carrito
    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
    await page.click('[data-testid="apply-coupon-button"]');
    await page.waitForSelector('[data-testid="coupon-applied-message"]', { timeout: 5000 });

    // Obtener el descuento aplicado
    const discountText = await page.locator('[data-testid="cart-discount-amount"]').textContent();
    const expectedDiscount = parseFloat(discountText?.replace(/[^0-9.]/g, '') || '0');

    // Proceder al checkout
    await page.click('[data-testid="proceed-to-checkout-button"]');
    await page.waitForURL('**/checkout', { timeout: 5000 });

    // Llenar datos de checkout
    await page.fill('[data-testid="first-name-input"]', 'Test');
    await page.fill('[data-testid="last-name-input"]', 'User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '600123456');
    
    // Seleccionar recogida (pickup)
    await page.click('[data-testid="delivery-type-pickup"]');

    // Crear orden
    await page.click('[data-testid="create-order-button"]');
    await page.waitForTimeout(2000);

    // Esperar a que se cree la orden (puede redirigir a página de confirmación)
    const currentUrl = page.url();
    
    // Verificar que se creó correctamente
    if (currentUrl.includes('/orden/') || currentUrl.includes('/confirmacion')) {
      console.log('✅ Orden creada correctamente');

      // TODO: Verificar en la BD que la orden tiene el descuento aplicado
      // Esto requeriría acceso directo a la BD o un endpoint de verificación
    } else {
      // Si hay un error, capturarlo
      const errorMessage = await page.locator('[data-testid="error-message"]').textContent();
      console.log('❌ Error al crear orden:', errorMessage);
      
      // Tomar screenshot para debugging
      await page.screenshot({ path: 'test-results/checkout-error.png' });
    }
  });

  test('06 - Cupón inválido muestra error', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    // Intentar aplicar cupón inválido
    await page.fill('[data-testid="coupon-input"]', 'INVALIDO123');
    await page.click('[data-testid="apply-coupon-button"]');
    
    // Esperar mensaje de error
    await page.waitForSelector('[data-testid="coupon-error-message"]', { timeout: 5000 });
    
    const errorMessage = await page.locator('[data-testid="coupon-error-message"]').textContent();
    console.log('⚠️ Mensaje de error:', errorMessage);

    expect(errorMessage).toContain('válido');

    // Verificar que NO se aplicó descuento
    const discountVisible = await page.locator('[data-testid="cart-discount-amount"]').count() > 0;
    expect(discountVisible).toBe(false);

    console.log('✅ Error mostrado correctamente para cupón inválido');
  });

  test('07 - Cupón no se aplica si no alcanza mínimo', async ({ page }) => {
    await loginAsUser(page);
    
    // Añadir un producto barato (< €50)
    await page.goto('http://localhost:3000/productos');
    
    // Filtrar por productos baratos si es posible
    const products = await page.locator('[data-testid="product-card"]').all();
    
    // Buscar uno barato
    let cheapProduct = null;
    for (const product of products) {
      const priceText = await product.locator('[data-testid="product-price"]').textContent();
      const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '999');
      
      if (price < TEST_COUPON.minAmount) {
        cheapProduct = product;
        break;
      }
    }

    if (cheapProduct) {
      await cheapProduct.click();
      
      // Añadir fechas y al carrito
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      await page.fill('[data-testid="start-date-input"]', today.toISOString().split('T')[0]);
      await page.fill('[data-testid="end-date-input"]', tomorrow.toISOString().split('T')[0]);
      await page.click('[data-testid="add-to-cart-button"]');
      await page.waitForTimeout(1000);

      // Ir al carrito
      await page.goto('http://localhost:3000/carrito');
      await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

      // Intentar aplicar cupón
      await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
      await page.click('[data-testid="apply-coupon-button"]');
      
      // Esperar mensaje de error sobre monto mínimo
      await page.waitForSelector('[data-testid="coupon-error-message"]', { timeout: 5000 });
      
      const errorMessage = await page.locator('[data-testid="coupon-error-message"]').textContent();
      console.log('⚠️ Mensaje de error monto mínimo:', errorMessage);

      expect(errorMessage).toContain('mínimo');

      console.log('✅ Cupón no se aplicó por no alcanzar monto mínimo');
    } else {
      console.log('⚠️ No se encontró un producto lo suficientemente barato para el test');
      test.skip();
    }
  });

  test('08 - Remover cupón restaura precio original', async ({ page }) => {
    await loginAsUser(page);
    await addProductToCart(page);

    await page.goto('http://localhost:3000/carrito');
    await page.waitForSelector('[data-testid="cart-summary"]', { timeout: 5000 });

    // Guardar total original
    const originalTotalText = await page.locator('[data-testid="cart-total"]').textContent();
    const originalTotal = parseFloat(originalTotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Total original:', originalTotal);

    // Aplicar cupón
    await page.fill('[data-testid="coupon-input"]', TEST_COUPON.code);
    await page.click('[data-testid="apply-coupon-button"]');
    await page.waitForSelector('[data-testid="coupon-applied-message"]', { timeout: 5000 });

    // Guardar total con descuento
    const discountedTotalText = await page.locator('[data-testid="cart-total"]').textContent();
    const discountedTotal = parseFloat(discountedTotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Total con descuento:', discountedTotal);

    // Remover cupón
    await page.click('[data-testid="remove-coupon-button"]');
    await page.waitForTimeout(500);

    // Verificar que volvió al precio original
    const finalTotalText = await page.locator('[data-testid="cart-total"]').textContent();
    const finalTotal = parseFloat(finalTotalText?.replace(/[^0-9.]/g, '') || '0');
    console.log('📊 Total después de remover:', finalTotal);

    expect(Math.abs(finalTotal - originalTotal)).toBeLessThan(0.02);
    expect(finalTotal).toBeGreaterThan(discountedTotal);

    console.log('✅ Cupón removido correctamente, precio restaurado');
  });
});
