import { test, expect } from '@playwright/test';
import { loginAsUser } from '../../utils/auth';
import { addProductToCart, goToCart } from '../../utils/cart';
import { fillCheckoutForm, proceedToCheckout, completeStripePayment, completeFullCheckout } from '../../utils/checkout';
import { cleanBrowserData } from '../../utils/helpers';

test.describe('WF-U-005: Checkout Completo', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Usuario logueado puede completar checkout', async ({ page }) => {
    // Login
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    // Añadir producto
    await addProductToCart(page);
    
    // Ir a carrito
    await goToCart(page);
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 5000 });
    
    // Proceder a checkout
    await proceedToCheckout(page);
    await expect(page).toHaveURL('/checkout');
    
    // Rellenar checkout
    await fillCheckoutForm(page);
    
    // Continuar al pago
    await page.click('[data-testid="submit-checkout"]');
    
    // Redirige a Stripe
    await expect(page).toHaveURL(/\/checkout\/stripe/, { timeout: 10000 });
    
    // Completar pago con Stripe
    await completeStripePayment(page);
    
    // Verificar éxito
    await expect(page).toHaveURL('/checkout/success');
    await expect(page.locator('text=/confirmado|éxito|success/i')).toBeVisible({ timeout: 5000 });
  });

  test('Checkout con entrega a domicilio', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    await addProductToCart(page);
    await goToCart(page);
    await proceedToCheckout(page);
    
    // Seleccionar entrega a domicilio
    await fillCheckoutForm(page, {
      deliveryType: 'delivery',
      address: 'Calle Test 123, Valencia'
    });
    
    // Verificar que muestra coste de envío
    await expect(page.locator('text=/envío|shipping/i')).toBeVisible({ timeout: 5000 });
  });

  test('No permite checkout sin aceptar términos', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    await addProductToCart(page);
    await goToCart(page);
    await proceedToCheckout(page);
    
    // Intentar continuar sin aceptar términos
    await page.click('[data-testid="submit-checkout"]');
    
    // Debe permanecer en checkout
    await expect(page).toHaveURL('/checkout');
  });
});

test.describe('WF-G-003: Intentar Checkout sin Login', () => {
  
  test('Invitado es redirigido a login', async ({ page }) => {
    await cleanBrowserData(page);
    
    // Añadir sin login
    await addProductToCart(page);
    await goToCart(page);
    
    // Intentar checkout
    await page.click('[data-testid="proceed-checkout"]');
    
    // Debe redirigir a login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('WF-G-004: Registro desde Checkout', () => {
  
  test('Puede registrarse y continuar checkout', async ({ page }) => {
    await cleanBrowserData(page);
    
    // Añadir producto sin login
    await addProductToCart(page);
    await goToCart(page);
    await page.click('[data-testid="proceed-checkout"]');
    
    // Ir a registro
    await page.click('a:has-text("Crear cuenta")');
    
    // Registrarse
    const timestamp = Date.now();
    await page.fill('[name="email"]', `test${timestamp}@example.com`);
    await page.fill('[name="password"]', 'Test123456!');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.check('[name="acceptTerms"]');
    await page.click('button[type="submit"]');
    
    // Debe volver a checkout con carrito intacto
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('WF-U-009: Aplicar Cupón', () => {
  
  test('Puede aplicar cupón válido', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    await addProductToCart(page);
    await goToCart(page);
    await proceedToCheckout(page);
    
    // Aplicar cupón (asumiendo que existe un cupón de test)
    await page.fill('[data-testid="coupon-input"]', 'TEST10');
    await page.click('[data-testid="apply-coupon"]');
    
    // Verificar que se aplicó
    await expect(page.locator('text=/aplicado|applied/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });

  test('Rechaza cupón inválido', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    await addProductToCart(page);
    await goToCart(page);
    await proceedToCheckout(page);
    
    // Aplicar cupón inválido
    await page.fill('[data-testid="coupon-input"]', 'INVALID123');
    await page.click('[data-testid="apply-coupon"]');
    
    // Debe mostrar error
    await expect(page.locator('text=/inválido|no válido|invalid/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('WF-ERR-001: Pago Fallido', () => {
  
  test('Maneja tarjeta rechazada', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    await addProductToCart(page);
    
    // Checkout hasta Stripe
    await completeFullCheckout(page, {
      cardNumber: '4000000000000002' // Tarjeta que será rechazada
    }).catch(() => {
      // Expected to fail
    });
    
    // Debe mostrar error
    await expect(page.locator('text=/rechazada|declined|error/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('WF-VIP-002: Checkout VIP con Descuento', () => {
  
  test('Usuario VIP obtiene descuento automático', async ({ page }) => {
    // Asumiendo que hay un usuario VIP de test
    await loginAsUser(page, 'vip@test.com', 'password123');
    
    await page.goto('/productos/letras-luminosas');
    
    // Verificar badge VIP
    await expect(page.locator('[data-testid="vip-price"]')).toBeVisible({ timeout: 5000 });
    
    await addProductToCart(page);
    await goToCart(page);
    
    // Verificar descuento en carrito
    await expect(page.locator('[data-testid="vip-discount"]')).toBeVisible();
    
    await proceedToCheckout(page);
    
    // Verificar descuento en checkout
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });
});
