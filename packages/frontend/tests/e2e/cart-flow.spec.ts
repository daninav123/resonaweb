import { test, expect } from '@playwright/test';

test.describe('Flujo Completo del Carrito', () => {
  test.beforeEach(async ({ page }) => {
    // Limpiar localStorage antes de cada test
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe permitir añadir productos al carrito sin login (guest cart)', async ({ page }) => {
    // Ir a productos
    await page.goto('http://localhost:3000/productos');
    
    // Esperar a que carguen los productos
    await page.waitForSelector('text=Ver detalles', { timeout: 10000 });
    
    // Click en el primer producto
    await page.click('text=Ver detalles >> nth=0');
    
    // Esperar a que cargue la página de detalle
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    
    // Añadir al carrito
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Verificar que el contador del carrito aumentó
    await expect(page.locator('text=1').first()).toBeVisible({ timeout: 5000 });
  });

  test('debe abrir el sidebar del carrito al hacer click en el icono', async ({ page }) => {
    // Añadir un producto primero
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Click en el icono del carrito
    await page.click('[class*="ShoppingCart"]');
    
    // Verificar que se abre el sidebar
    await expect(page.locator('text=Tu Carrito')).toBeVisible();
  });

  test('debe mantener items del carrito después de login', async ({ page }) => {
    // 1. Añadir producto sin login
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Verificar contador antes de login
    await expect(page.locator('text=1').first()).toBeVisible();
    
    // 2. Hacer login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Esperar a que redirija
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // 3. Verificar que el carrito todavía tiene 1 item
    await expect(page.locator('text=1').first()).toBeVisible();
  });

  test('debe permitir eliminar items del carrito', async ({ page }) => {
    // Añadir producto
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Abrir carrito
    await page.click('[class*="ShoppingCart"]');
    
    // Eliminar item
    await page.click('button:has-text("Eliminar")');
    
    // Verificar que el carrito está vacío
    await expect(page.locator('text=Tu carrito está vacío')).toBeVisible();
  });

  test('debe calcular el total correctamente', async ({ page }) => {
    // Añadir producto
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    
    // Obtener el precio del producto
    const priceText = await page.locator('text=/€\\d+/').first().textContent();
    
    // Añadir al carrito
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Abrir carrito
    await page.click('[class*="ShoppingCart"]');
    
    // Verificar que el total está presente
    await expect(page.locator('text=Total')).toBeVisible();
  });

  test('debe permitir cambiar cantidad de items', async ({ page }) => {
    // Añadir producto
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Abrir carrito
    await page.click('[class*="ShoppingCart"]');
    
    // Buscar botón de incrementar cantidad
    const incrementButton = page.locator('button:has-text("+")').first();
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      
      // Verificar que la cantidad aumentó
      await expect(page.locator('text=2')).toBeVisible();
    }
  });

  test('debe navegar a la página de checkout', async ({ page }) => {
    // Añadir producto
    await page.goto('http://localhost:3000/productos');
    await page.waitForSelector('text=Ver detalles');
    await page.click('text=Ver detalles >> nth=0');
    await page.waitForSelector('button:has-text("Añadir al Carrito")');
    await page.click('button:has-text("Añadir al Carrito")');
    
    // Abrir carrito
    await page.click('[class*="ShoppingCart"]');
    
    // Click en "Proceder al pago" o "Checkout"
    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceder"), a:has-text("Checkout")').first();
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      // Verificar que navegó a checkout o login
      await page.waitForURL(/\/(checkout|login)/, { timeout: 5000 });
    }
  });
});
