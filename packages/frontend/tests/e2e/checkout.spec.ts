import { test, expect } from '@playwright/test';

test.describe('Shopping Cart and Checkout', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart first
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    await page.fill('input[name="startDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', dayAfter.toISOString().split('T')[0]);
    await page.click('button:has-text("Añadir al carrito")');
  });

  test('should display cart page with items', async ({ page }) => {
    await page.goto('/carrito');
    
    await expect(page.locator('h1')).toContainText('Mi Carrito');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    await expect(page.locator('.cart-total')).toBeVisible();
  });

  test('should update item quantity in cart', async ({ page }) => {
    await page.goto('/carrito');
    
    // Get initial total
    const initialTotal = await page.locator('.cart-total').textContent();
    
    // Increase quantity
    await page.click('.cart-item button[aria-label="Aumentar cantidad"]');
    await expect(page.locator('.cart-item .quantity')).toContainText('2');
    
    // Total should update
    const newTotal = await page.locator('.cart-total').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto('/carrito');
    
    // Remove item
    await page.click('.cart-item button[aria-label="Eliminar"]');
    
    // Cart should be empty
    await expect(page.locator('.empty-cart')).toBeVisible();
    await expect(page.locator('.empty-cart')).toContainText('Tu carrito está vacío');
  });

  test('should calculate totals correctly', async ({ page }) => {
    await page.goto('/carrito');
    
    // Check that subtotal, tax, and total are displayed
    await expect(page.locator('.subtotal')).toBeVisible();
    await expect(page.locator('.tax')).toContainText('IVA');
    await expect(page.locator('.cart-total')).toBeVisible();
    
    // Verify tax calculation (21%)
    const subtotalText = await page.locator('.subtotal').textContent();
    const taxText = await page.locator('.tax').textContent();
    const totalText = await page.locator('.cart-total').textContent();
    
    const subtotal = parseFloat(subtotalText?.match(/[\d.]+/)?.[0] || '0');
    const tax = parseFloat(taxText?.match(/[\d.]+/)?.[0] || '0');
    const total = parseFloat(totalText?.match(/[\d.]+/)?.[0] || '0');
    
    expect(Math.abs(tax - subtotal * 0.21)).toBeLessThan(0.01);
    expect(Math.abs(total - (subtotal + tax))).toBeLessThan(0.01);
  });

  test('should proceed to checkout when logged in', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Go to cart
    await page.goto('/carrito');
    
    // Proceed to checkout
    await page.click('button:has-text("Proceder al checkout")');
    await expect(page).toHaveURL('/checkout');
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/carrito');
    await page.click('button:has-text("Proceder al checkout")');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Checkout Process', () => {
  test.beforeEach(async ({ page }) => {
    // Login and add product to cart
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    await page.fill('input[name="startDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', dayAfter.toISOString().split('T')[0]);
    await page.click('button:has-text("Añadir al carrito")');
    
    await page.goto('/checkout');
  });

  test('should display checkout steps', async ({ page }) => {
    // Check all steps are visible
    await expect(page.locator('.step-1')).toContainText('Datos');
    await expect(page.locator('.step-2')).toContainText('Entrega');
    await expect(page.locator('.step-3')).toContainText('Pago');
    
    // First step should be active
    await expect(page.locator('.step-1')).toHaveClass(/active/);
  });

  test('should fill personal information (Step 1)', async ({ page }) => {
    // Fill personal info
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+34 600 000 001');
    
    // Go to next step
    await page.click('button:has-text("Siguiente")');
    
    // Should be on step 2
    await expect(page.locator('.step-2')).toHaveClass(/active/);
  });

  test('should select delivery method (Step 2)', async ({ page }) => {
    // Complete step 1
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+34 600 000 001');
    await page.click('button:has-text("Siguiente")');
    
    // Select delivery option
    await page.click('label:has-text("Envío a domicilio")');
    
    // Fill address
    await page.fill('input[name="address"]', 'Calle Test 123');
    await page.fill('input[name="city"]', 'Valencia');
    await page.fill('input[name="zipCode"]', '46001');
    
    // Go to next step
    await page.click('button:has-text("Siguiente")');
    
    // Should be on step 3
    await expect(page.locator('.step-3')).toHaveClass(/active/);
  });

  test('should enter payment information (Step 3)', async ({ page }) => {
    // Complete steps 1 and 2
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+34 600 000 001');
    await page.click('button:has-text("Siguiente")');
    
    await page.click('label:has-text("Recogida en tienda")');
    await page.click('button:has-text("Siguiente")');
    
    // Fill payment info
    await page.fill('input[name="cardName"]', 'John Doe');
    await page.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');
    
    // Accept terms
    await page.check('input[name="acceptTerms"]');
    
    // Submit button should be enabled
    await expect(page.locator('button:has-text("Pagar")')).toBeEnabled();
  });

  test('should show order summary', async ({ page }) => {
    // Check order summary is visible
    await expect(page.locator('.order-summary')).toBeVisible();
    await expect(page.locator('.order-summary .product-name')).toBeVisible();
    await expect(page.locator('.order-summary .subtotal')).toBeVisible();
    await expect(page.locator('.order-summary .total')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to go to next step without filling fields
    await page.click('button:has-text("Siguiente")');
    
    // Should show validation errors
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.step-1')).toHaveClass(/active/); // Should stay on step 1
  });

  test('should navigate between steps', async ({ page }) => {
    // Fill step 1
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+34 600 000 001');
    await page.click('button:has-text("Siguiente")');
    
    // Should be on step 2
    await expect(page.locator('.step-2')).toHaveClass(/active/);
    
    // Go back to step 1
    await page.click('button:has-text("Anterior")');
    await expect(page.locator('.step-1')).toHaveClass(/active/);
    
    // Data should be preserved
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
  });

  test('should complete full checkout process', async ({ page }) => {
    // Step 1: Personal info
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+34 600 000 001');
    await page.click('button:has-text("Siguiente")');
    
    // Step 2: Delivery
    await page.click('label:has-text("Recogida en tienda")');
    await page.click('button:has-text("Siguiente")');
    
    // Step 3: Payment
    await page.fill('input[name="cardName"]', 'John Doe');
    await page.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
    await page.fill('input[name="cardExpiry"]', '12/25');
    await page.fill('input[name="cardCvc"]', '123');
    await page.check('input[name="acceptTerms"]');
    
    // Submit order
    await page.click('button:has-text("Pagar")');
    
    // Should show processing
    await expect(page.locator('.processing')).toBeVisible();
    
    // Should redirect to order confirmation
    await expect(page).toHaveURL(/\/mis-pedidos/);
    await expect(page.locator('.success-message')).toContainText('Pedido realizado con éxito');
  });
});
