import { test, expect } from '@playwright/test';
import { adminCredentials, appUrls } from '../fixtures/test-data';

/**
 * SMOKE TESTS
 * Tests básicos para verificar que la aplicación funciona correctamente
 * Estos tests deben ejecutarse primero y son críticos
 */

test.describe('Smoke Tests - Verificación Básica de la Aplicación', () => {
  
  test('01. Frontend está levantado y accesible', async ({ page }) => {
    await page.goto(appUrls.home);
    await expect(page).toHaveURL(appUrls.home);
    await expect(page).toHaveTitle(/Resona/i);
  });

  test('02. Backend responde correctamente', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('03. Página de login carga correctamente', async ({ page }) => {
    await page.goto(appUrls.login);
    await expect(page).toHaveURL(appUrls.login);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('04. Login de admin funciona', async ({ page }) => {
    await page.goto(appUrls.login);
    await page.fill('input[type="email"]', adminCredentials.email);
    await page.fill('input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    
    // Verificar redirección al panel de admin
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('05. Navegación principal es accesible', async ({ page }) => {
    await page.goto(appUrls.home);
    
    // Verificar que existen los enlaces principales
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
    
    // Verificar enlaces comunes (pueden variar según el diseño)
    const hasProductsLink = await page.locator('a[href*="/products"], a:has-text("Productos")').count() > 0;
    const hasPacksLink = await page.locator('a[href*="/packs"], a:has-text("Packs")').count() > 0;
    
    expect(hasProductsLink || hasPacksLink).toBeTruthy();
  });

  test('06. Página de productos carga', async ({ page }) => {
    await page.goto(appUrls.products);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(appUrls.products);
    
    // Verificar que hay productos o mensaje de vacío
    const hasProducts = await page.locator('[data-testid="product-card"], .product-card').count() > 0;
    const hasEmptyMessage = await page.locator('text=/no hay productos/i, text=/sin productos/i').count() > 0;
    
    expect(hasProducts || hasEmptyMessage).toBeTruthy();
  });

  test('07. API de productos responde', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/api/v1/products');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('08. API de categorías responde', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/api/v1/products/categories');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('09. Dashboard de admin carga', async ({ page }) => {
    // Login como admin
    await page.goto(appUrls.login);
    await page.fill('input[type="email"]', adminCredentials.email);
    await page.fill('input[type="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/**');
    
    // Ir al dashboard
    await page.goto(appUrls.admin.dashboard);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(appUrls.admin.dashboard);
  });

  test('10. Carrito es accesible', async ({ page }) => {
    await page.goto(appUrls.cart);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(appUrls.cart);
    
    // Verificar que hay un carrito (vacío o con items)
    const hasCartItems = await page.locator('[data-testid="cart-item"]').count() > 0;
    const hasEmptyCart = await page.locator('text=/carrito está vacío/i, text=/tu carrito/i').count() > 0;
    
    expect(hasCartItems || hasEmptyCart).toBeTruthy();
  });

  test('11. API de packs responde', async ({ page }) => {
    const response = await page.request.get('http://localhost:3001/api/v1/products/packs');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
  });

  test('12. Página de packs carga', async ({ page }) => {
    await page.goto(appUrls.packs);
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(appUrls.packs);
  });

  test('13. Estilos CSS están cargados', async ({ page }) => {
    await page.goto(appUrls.home);
    
    // Verificar que hay estilos aplicados
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('14. JavaScript se ejecuta correctamente', async ({ page }) => {
    await page.goto(appUrls.home);
    
    // Ejecutar código JavaScript básico
    const result = await page.evaluate(() => {
      return typeof window !== 'undefined' && typeof document !== 'undefined';
    });
    
    expect(result).toBeTruthy();
  });

  test('15. No hay errores de consola críticos', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(appUrls.home);
    await page.waitForLoadState('networkidle');
    
    // Filtrar errores conocidos/aceptables (como Google Analytics en desarrollo)
    const criticalErrors = errors.filter(error => 
      !error.includes('Google Analytics') &&
      !error.includes('favicon') &&
      !error.includes('404')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

});
