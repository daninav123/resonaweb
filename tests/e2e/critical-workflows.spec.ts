// TESTS E2E CRÍTICOS - FASE 1
// Total: 20 tests más importantes del sistema

import { test, expect, Page } from '@playwright/test';

// ======================
// HELPERS
// ======================

async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
}

async function loginAsAdmin(page: Page) {
  await loginAsUser(page, 'admin@resona.com', 'admin123');
  await expect(page).toHaveURL('/admin');
}

async function addProductToCart(page: Page, productId: string = 'test-product') {
  await page.goto(`/productos/${productId}`);
  await page.fill('[data-testid="start-date"]', '2025-12-01');
  await page.fill('[data-testid="end-date"]', '2025-12-05');
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('text=/añadido/i')).toBeVisible();
}

// ======================
// USUARIO WORKFLOWS
// ======================

test.describe('WF-U-001: Registro de Usuario', () => {
  test('Usuario puede registrarse exitosamente', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.goto('/register');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.check('[name="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Validar login automático
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('text=/Test User/i')).toBeVisible();
  });

  test('No permite registro con email duplicado', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.check('[name="acceptTerms"]');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/ya existe/i')).toBeVisible();
  });
});

test.describe('WF-U-002: Login de Usuario', () => {
  test('Usuario puede hacer login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('Login falla con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/incorrecta/i')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('WF-U-004: Añadir al Carrito sin Login', () => {
  test('Invitado puede añadir producto al carrito', async ({ page }) => {
    await page.goto('/productos/test-product');
    
    await page.fill('[data-testid="start-date"]', '2025-12-01');
    await page.fill('[data-testid="end-date"]', '2025-12-05');
    await page.click('[data-testid="add-to-cart"]');

    await expect(page.locator('text=/añadido/i')).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');

    // Verificar persistencia en localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('guestCart'));
    expect(cartData).toBeTruthy();
  });
});

test.describe('WF-U-005: Checkout Completo', () => {
  test('Usuario logueado puede completar checkout', async ({ page }) => {
    // Login
    await loginAsUser(page, 'user@example.com', 'password123');
    
    // Añadir producto
    await addProductToCart(page);
    
    // Ir a carrito
    await page.goto('/carrito');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    // Proceder a checkout
    await page.click('[data-testid="proceed-checkout"]');
    await expect(page).toHaveURL('/checkout');
    
    // Rellenar checkout
    await page.check('[name="acceptTerms"]');
    await page.click('[data-testid="submit-checkout"]');
    
    // Redirige a Stripe
    await expect(page).toHaveURL(/\/checkout\/stripe/);
    
    // Stripe iframe
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    await stripeFrame.locator('[placeholder*="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder*="MM"]').fill('12/25');
    await stripeFrame.locator('[placeholder*="CVC"]').fill('123');
    
    // Confirmar pago
    await page.click('[data-testid="submit-payment"]');
    
    // Éxito
    await expect(page).toHaveURL('/checkout/success', { timeout: 15000 });
    await expect(page.locator('text=/confirmado/i')).toBeVisible();
  });
});

test.describe('WF-U-006: Ver Mis Pedidos', () => {
  test('Usuario puede ver sus pedidos', async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'password123');
    
    await page.goto('/mis-pedidos');
    
    await expect(page.locator('[data-testid="order-card"]')).toHaveCount(1, { timeout: 5000 });
    
    // Click en primer pedido
    await page.click('[data-testid="order-card"]').first();
    await expect(page).toHaveURL(/\/mis-pedidos\/.+/);
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
  });
});

test.describe('WF-U-008: Descargar Factura', () => {
  test('Usuario puede descargar factura', async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'password123');
    await page.goto('/mis-pedidos/test-order-with-invoice');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-invoice"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    await download.saveAs(`./downloads/${download.suggestedFilename()}`);
  });
});

// ======================
// ADMIN WORKFLOWS
// ======================

test.describe('WF-A-001: Login como Admin', () => {
  test('Admin puede hacer login y acceder al panel', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@resona.com');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin');
    await expect(page.locator('[data-testid="admin-menu"]')).toBeVisible();
  });
});

test.describe('WF-A-002: Crear Producto', () => {
  test('Admin puede crear un producto', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/productos');
    
    await page.click('[data-testid="new-product"]');
    
    await page.fill('[name="sku"]', `TEST-${Date.now()}`);
    await page.fill('[name="name"]', 'Producto de Test E2E');
    await page.fill('[name="description"]', 'Descripción del producto');
    await page.fill('[name="pricePerDay"]', '100');
    await page.fill('[name="stock"]', '5');
    await page.selectOption('[name="categoryId"]', { index: 1 });
    
    await page.click('[data-testid="submit"]');
    
    await expect(page.locator('text=/creado/i')).toBeVisible();
    await expect(page).toHaveURL('/admin/productos');
  });
});

test.describe('WF-A-005: Ver Todos los Pedidos', () => {
  test('Admin puede ver todos los pedidos', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pedidos');
    
    await expect(page.locator('[data-testid="order-row"]')).toHaveCount(1, { timeout: 5000 });
    
    // Filtrar
    await page.selectOption('[data-testid="status-filter"]', 'PENDING');
    await expect(page.locator('[data-testid="order-status"]:has-text("PENDING")')).toHaveCount(1);
  });
});

test.describe('WF-A-006: Confirmar Pedido', () => {
  test('Admin puede confirmar un pedido', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pedidos/test-pending-order');
    
    await page.click('[data-testid="confirm-order"]');
    await page.click('[data-testid="confirm-dialog-yes"]');
    
    await expect(page.locator('text=/confirmado/i')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toHaveText('CONFIRMED');
  });
});

test.describe('WF-A-008: Cancelar Pedido', () => {
  test('Admin puede cancelar un pedido', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/pedidos/test-active-order');
    
    await page.click('[data-testid="cancel-order"]');
    await page.fill('[name="cancelReason"]', 'Test cancellation');
    await page.click('[data-testid="confirm-cancel"]');
    
    await expect(page.locator('text=/cancelado/i')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toHaveText('CANCELLED');
  });
});

test.describe('WF-A-009: Generar Factura Manual', () => {
  test('Admin puede generar factura manualmente', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/facturas/crear');
    
    await page.selectOption('[name="orderId"]', 'test-order-without-invoice');
    await page.fill('[name="clientName"]', 'Cliente Test');
    await page.fill('[name="clientTaxId"]', 'B12345678');
    await page.fill('[name="clientAddress"]', 'Calle Test 123');
    
    await page.click('[data-testid="generate-invoice"]');
    
    await expect(page.locator('text=/generada/i')).toBeVisible();
  });
});

// ======================
// SEGURIDAD WORKFLOWS
// ======================

test.describe('WF-SEC-001: Acceso No Autorizado a Admin', () => {
  test('Usuario regular no puede acceder al panel admin', async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'password123');
    
    await page.goto('/admin');
    
    // Debe redirigir a home
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=/no autorizado/i')).toBeVisible();
  });
});

test.describe('WF-SEC-002: Ver Pedido de Otro Usuario', () => {
  test('Usuario no puede ver pedidos de otros', async ({ page }) => {
    await loginAsUser(page, 'user1@example.com', 'password123');
    
    // Intentar acceder a pedido de otro usuario
    await page.goto('/mis-pedidos/order-of-user2');
    
    // Debe mostrar error 403 o redirigir
    await expect(page.locator('text=/no autorizado|no encontrado/i')).toBeVisible();
  });
});

// ======================
// ERROR WORKFLOWS
// ======================

test.describe('WF-ERR-001: Pago Fallido', () => {
  test('Maneja error de pago con tarjeta rechazada', async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'password123');
    await addProductToCart(page);
    await page.goto('/carrito');
    await page.click('[data-testid="proceed-checkout"]');
    await page.check('[name="acceptTerms"]');
    await page.click('[data-testid="submit-checkout"]');
    
    // Stripe con tarjeta rechazada
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]').first();
    await stripeFrame.locator('[placeholder*="Card number"]').fill('4000000000000002');
    await stripeFrame.locator('[placeholder*="MM"]').fill('12/25');
    await stripeFrame.locator('[placeholder*="CVC"]').fill('123');
    
    await page.click('[data-testid="submit-payment"]');
    
    // Debe mostrar error
    await expect(page.locator('text=/rechazada|declined/i')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout\/stripe/);
  });
});

test.describe('WF-ERR-002: Producto Agotado Durante Checkout', () => {
  test('Detecta producto sin stock durante checkout', async ({ page, context }) => {
    // Usuario 1 añade último producto
    await loginAsUser(page, 'user1@example.com', 'password123');
    await addProductToCart(page, 'product-with-stock-1');
    
    // Usuario 2 también lo añade y compra primero (en otra sesión)
    const page2 = await context.newPage();
    await loginAsUser(page2, 'user2@example.com', 'password123');
    await addProductToCart(page2, 'product-with-stock-1');
    // ... completa checkout de user2
    
    // Usuario 1 intenta checkout
    await page.goto('/carrito');
    await page.click('[data-testid="proceed-checkout"]');
    
    // Debe detectar no disponible
    await expect(page.locator('text=/no disponible|agotado/i')).toBeVisible();
  });
});

test.describe('WF-ERR-003: Sesión Expirada', () => {
  test('Maneja sesión expirada durante checkout', async ({ page }) => {
    await loginAsUser(page, 'user@example.com', 'password123');
    await addProductToCart(page);
    
    // Simular expiración de token
    await page.evaluate(() => {
      localStorage.removeItem('token');
    });
    
    await page.goto('/checkout');
    
    // Debe redirigir a login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('text=/sesión expirada/i')).toBeVisible();
  });
});

// ======================
// INVITADO WORKFLOWS
// ======================

test.describe('WF-G-003: Intentar Checkout sin Login', () => {
  test('Invitado es redirigido a login en checkout', async ({ page }) => {
    // Añadir sin login
    await page.goto('/productos/test-product');
    await page.fill('[data-testid="start-date"]', '2025-12-01');
    await page.fill('[data-testid="end-date"]', '2025-12-05');
    await page.click('[data-testid="add-to-cart"]');
    
    // Intentar checkout
    await page.goto('/carrito');
    await page.click('[data-testid="proceed-checkout"]');
    
    // Redirige a login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('WF-G-004: Registro desde Checkout', () => {
  test('Invitado puede registrarse desde checkout y continuar', async ({ page }) => {
    // Añadir sin login
    await addProductToCart(page);
    await page.goto('/carrito');
    await page.click('[data-testid="proceed-checkout"]');
    
    // En login, ir a registro
    await page.click('a:has-text("Crear cuenta")');
    
    const timestamp = Date.now();
    await page.fill('[name="email"]', `test${timestamp}@example.com`);
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.check('[name="acceptTerms"]');
    await page.click('button[type="submit"]');
    
    // Debe volver a checkout
    await expect(page).toHaveURL('/checkout');
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
  });
});

// ======================
// VIP WORKFLOWS
// ======================

test.describe('WF-VIP-002: Checkout VIP con Descuento', () => {
  test('Usuario VIP obtiene descuento automático', async ({ page }) => {
    await loginAsUser(page, 'vip@example.com', 'password123');
    
    await page.goto('/productos/test-product');
    
    // Verificar precio con descuento
    await expect(page.locator('[data-testid="vip-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="discount-badge"]')).toHaveText(/25%/);
    
    // Añadir y checkout
    await page.fill('[data-testid="start-date"]', '2025-12-01');
    await page.fill('[data-testid="end-date"]', '2025-12-05');
    await page.click('[data-testid="add-to-cart"]');
    await page.goto('/carrito');
    
    // Verificar descuento en carrito
    await expect(page.locator('[data-testid="vip-discount"]')).toBeVisible();
    
    // Checkout
    await page.click('[data-testid="proceed-checkout"]');
    
    // Verificar descuento en checkout
    await expect(page.locator('[data-testid="discount-amount"]')).toBeVisible();
  });
});
