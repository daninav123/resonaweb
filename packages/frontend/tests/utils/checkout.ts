import { Page, expect } from '@playwright/test';

/**
 * Completar formulario de checkout
 */
export async function fillCheckoutForm(
  page: Page,
  options: {
    deliveryType?: 'pickup' | 'delivery';
    address?: string;
    notes?: string;
  } = {}
) {
  const {
    deliveryType = 'pickup',
    address = '',
    notes = ''
  } = options;

  // Esperar que la página cargue
  await page.waitForLoadState('networkidle');

  // Seleccionar tipo de entrega
  if (deliveryType === 'delivery' && address) {
    await page.click('[data-testid="delivery-option-delivery"]');
    await page.fill('[name="address"]', address);
  }

  // Añadir notas si hay
  if (notes) {
    await page.fill('[name="notes"]', notes);
  }

  // Aceptar términos y condiciones
  await page.check('[name="acceptTerms"]');
}

/**
 * Ir a checkout
 */
export async function goToCheckout(page: Page) {
  await page.goto('/checkout');
  await page.waitForLoadState('networkidle');
}

/**
 * Proceder al pago desde el carrito
 */
export async function proceedToCheckout(page: Page) {
  await page.click('[data-testid="proceed-checkout"]');
  await page.waitForURL('/checkout', { timeout: 10000 });
}

/**
 * Completar pago con Stripe (tarjeta de prueba)
 */
export async function completeStripePayment(
  page: Page,
  cardNumber: string = '4242424242424242'
) {
  // Esperar a que cargue Stripe
  await page.waitForURL(/\/checkout\/stripe/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Esperar el iframe de Stripe
  await page.waitForSelector('iframe[name*="stripe"]', { timeout: 10000 });

  // Rellenar datos de tarjeta en el iframe de Stripe
  const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
  
  await stripeFrame.locator('[placeholder*="Card number"]').fill(cardNumber);
  await stripeFrame.locator('[placeholder*="MM"]').fill('12/25');
  await stripeFrame.locator('[placeholder*="CVC"]').fill('123');

  // Submit el pago
  await page.click('[data-testid="submit-payment"]');

  // Esperar redirección a success (puede tardar)
  await page.waitForURL('/checkout/success', { timeout: 30000 });
}

/**
 * Aplicar un cupón de descuento
 */
export async function applyCoupon(page: Page, couponCode: string) {
  await page.fill('[data-testid="coupon-input"]', couponCode);
  await page.click('[data-testid="apply-coupon"]');
  
  // Esperar confirmación
  await expect(page.locator('text=/aplicado/i')).toBeVisible({ timeout: 5000 });
}

/**
 * Workflow completo: Carrito -> Checkout -> Pago
 */
export async function completeFullCheckout(
  page: Page,
  options: {
    deliveryType?: 'pickup' | 'delivery';
    address?: string;
    notes?: string;
    cardNumber?: string;
  } = {}
) {
  // Ir al carrito
  await page.goto('/carrito');
  
  // Proceder a checkout
  await proceedToCheckout(page);
  
  // Rellenar formulario
  await fillCheckoutForm(page, options);
  
  // Continuar al pago
  await page.click('[data-testid="submit-checkout"]');
  
  // Completar pago con Stripe
  await completeStripePayment(page, options.cardNumber);
}
