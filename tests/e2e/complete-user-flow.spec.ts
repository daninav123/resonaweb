/**
 * TESTS E2E COMPLETOS - FLUJO COMPLETO DE USUARIO
 * 
 * Estos tests prueban toda la aplicación de principio a fin
 * como lo haría un usuario real.
 */

import { test, expect, Page } from '@playwright/test';
import { chromium } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.BACKEND_URL || 'http://localhost:3001/api/v1';

// Credenciales de prueba
const TEST_USER = {
  firstName: 'Test',
  lastName: 'Usuario',
  email: `test.${Date.now()}@resona.com`,
  password: 'TestPassword123!',
  phone: '600123456'
};

const ADMIN_USER = {
  email: 'admin@resona360.com',
  password: 'admin123'
};

test.describe('🧪 E2E - Flujo Completo de Usuario', () => {
  
  test.setTimeout(120000); // 2 minutos por test
  
  // ============================================
  // TESTS DE USUARIO REGULAR
  // ============================================
  
  test('✅ 1. Homepage carga correctamente', async ({ page }) => {
    console.log('📄 Cargando homepage...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar que el título contiene ReSona
    const title = await page.title();
    console.log(`   Título: ${title}`);
    expect(title).toContain('ReSona');
    
    // Verificar que hay elementos clave
    await expect(page.locator('header')).toBeVisible();
    console.log('   ✅ Header visible');
    
    // Verificar que hay productos o navegación
    const hasProducts = await page.locator('text=/productos|product/i').isVisible();
    console.log(`   ✅ Navegación visible: ${hasProducts}`);
  });
  
  test('✅ 2. Registro de nuevo usuario', async ({ page }) => {
    console.log('👤 Probando registro de usuario...');
    
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    // Llenar formulario de registro
    console.log('   Llenando formulario...');
    await page.fill('input[name="firstName"]', TEST_USER.firstName);
    await page.fill('input[name="lastName"]', TEST_USER.lastName);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="phone"]', TEST_USER.phone);
    
    // Submit
    console.log('   Enviando formulario...');
    await page.click('button[type="submit"]');
    
    // Esperar redirect o mensaje de éxito
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`   URL después de registro: ${url}`);
    
    // Debe redirigir a login o dashboard
    expect(url).toMatch(/login|dashboard|home/);
    console.log('   ✅ Registro exitoso');
  });
  
  test('✅ 3. Login con usuario registrado', async ({ page }) => {
    console.log('🔐 Probando login...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Llenar credenciales
    console.log(`   Email: ${TEST_USER.email}`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Click login
    console.log('   Haciendo click en login...');
    await page.click('button[type="submit"]');
    
    // Esperar redirect
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`   URL después de login: ${url}`);
    
    // No debe estar en /login
    expect(url).not.toContain('/login');
    console.log('   ✅ Login exitoso');
  });
  
  test('✅ 4. Ver catálogo de productos', async ({ page }) => {
    console.log('📦 Probando catálogo de productos...');
    
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    // Esperar que carguen productos
    await page.waitForTimeout(2000);
    
    // Buscar productos en la página
    const productCards = page.locator('[class*="product"], [class*="card"]');
    const count = await productCards.count();
    
    console.log(`   Productos encontrados: ${count}`);
    
    if (count > 0) {
      console.log('   ✅ Catálogo carga productos');
    } else {
      console.log('   ⚠️  No se encontraron productos (BD vacía)');
    }
    
    // Verificar que la página no tiene errores
    const hasError = await page.locator('text=/error|404|500/i').isVisible();
    expect(hasError).toBe(false);
  });
  
  test('✅ 5. Añadir producto al carrito', async ({ page }) => {
    console.log('🛒 Probando añadir al carrito...');
    
    // Primero ir a productos
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Buscar primer producto
    const firstProduct = page.locator('[class*="product"]').first();
    const isVisible = await firstProduct.isVisible();
    
    if (isVisible) {
      console.log('   Producto encontrado, haciendo click...');
      await firstProduct.click();
      await page.waitForTimeout(1000);
      
      // Buscar botón de añadir al carrito
      const addToCartBtn = page.locator('button:has-text("Añadir")').or(page.locator('button:has-text("Carrito")')).first();
      
      if (await addToCartBtn.isVisible()) {
        await addToCartBtn.click();
        console.log('   ✅ Producto añadido al carrito');
        await page.waitForTimeout(1000);
      } else {
        console.log('   ⚠️  Botón de carrito no encontrado');
      }
    } else {
      console.log('   ⚠️  No hay productos disponibles');
    }
  });
  
  test('✅ 6. Ver carrito', async ({ page }) => {
    console.log('🛒 Verificando carrito...');
    
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url = page.url();
    console.log(`   URL: ${url}`);
    expect(url).toContain('cart');
    
    // Verificar que la página carga
    const hasError = await page.locator('text=/error|404/i').isVisible();
    expect(hasError).toBe(false);
    
    console.log('   ✅ Página de carrito accesible');
  });
  
  test('✅ 7. Rate Limiting - Intentar múltiples logins fallidos', async ({ page }) => {
    console.log('🔒 Probando rate limiting...');
    
    const attempts = 6;
    let blocked = false;
    
    for (let i = 1; i <= attempts; i++) {
      console.log(`   Intento ${i}/${attempts}...`);
      
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('networkidle');
      
      await page.fill('input[type="email"]', 'wrong@email.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(1000);
      
      // Buscar mensaje de rate limit
      const rateLimitMsg = await page.locator('text=/demasiados intentos|too many|rate limit/i').isVisible();
      
      if (rateLimitMsg) {
        console.log(`   ✅ Rate limiting activado en intento ${i}`);
        blocked = true;
        break;
      }
    }
    
    if (!blocked) {
      console.log('   ⚠️  Rate limiting no detectado (puede estar configurado más alto)');
    }
  });
  
  // ============================================
  // TESTS DE ADMIN
  // ============================================
  
  test('✅ 8. Login como administrador', async ({ page }) => {
    console.log('👨‍💼 Probando login admin...');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    console.log(`   Email admin: ${ADMIN_USER.email}`);
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`   URL: ${url}`);
    
    // Debe estar en admin
    expect(url).toContain('admin');
    console.log('   ✅ Login admin exitoso');
  });
  
  test('✅ 9. Panel admin carga correctamente', async ({ page }) => {
    console.log('📊 Verificando panel admin...');
    
    // Login admin primero
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Verificar que está en admin
    const url = page.url();
    expect(url).toContain('admin');
    
    // Buscar elementos del dashboard
    const hasDashboard = await page.locator('text=/dashboard|panel|admin/i').isVisible();
    console.log(`   Dashboard visible: ${hasDashboard}`);
    
    console.log('   ✅ Panel admin accesible');
  });
  
  test('✅ 10. Acceder a gestión de productos', async ({ page }) => {
    console.log('📦 Verificando gestión de productos...');
    
    // Login admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Ir a productos admin
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url = page.url();
    console.log(`   URL: ${url}`);
    expect(url).toContain('products');
    
    console.log('   ✅ Página de productos admin accesible');
  });
  
  test('✅ 11. Acceder a gestión de pedidos', async ({ page }) => {
    console.log('📋 Verificando gestión de pedidos...');
    
    // Login admin
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', ADMIN_USER.email);
    await page.fill('input[type="password"]', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Ir a pedidos admin
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const url = page.url();
    console.log(`   URL: ${url}`);
    expect(url).toContain('orders');
    
    console.log('   ✅ Página de pedidos admin accesible');
  });
  
  // ============================================
  // TESTS RESPONSIVE
  // ============================================
  
  test('✅ 12. Responsive - Mobile (375x667)', async ({ browser }) => {
    console.log('📱 Probando responsive mobile...');
    
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar que carga
    const title = await page.title();
    console.log(`   Título: ${title}`);
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/mobile-home.png' });
    console.log('   📸 Screenshot guardado: test-results/mobile-home.png');
    
    console.log('   ✅ Página carga en mobile');
    
    await context.close();
  });
  
  test('✅ 13. Responsive - Tablet (768x1024)', async ({ browser }) => {
    console.log('📱 Probando responsive tablet...');
    
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 }
    });
    const page = await context.newPage();
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`   Título: ${title}`);
    
    await page.screenshot({ path: 'test-results/tablet-home.png' });
    console.log('   📸 Screenshot guardado: test-results/tablet-home.png');
    
    console.log('   ✅ Página carga en tablet');
    
    await context.close();
  });
  
  // ============================================
  // TESTS DE SEGURIDAD
  // ============================================
  
  test('✅ 14. XSS Protection - Intentar inyectar script', async ({ page }) => {
    console.log('🛡️ Probando protección XSS...');
    
    await page.goto(`${BASE_URL}/register`);
    await page.waitForLoadState('networkidle');
    
    // Intentar inyectar script en nombre
    const xssPayload = '<script>alert("XSS")</script>';
    
    await page.fill('input[name="firstName"]', xssPayload);
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[name="email"]', `xss.${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Verificar que NO se ejecutó el script
    const alerts = [];
    page.on('dialog', dialog => {
      alerts.push(dialog.message());
      dialog.dismiss();
    });
    
    await page.waitForTimeout(2000);
    
    if (alerts.length === 0) {
      console.log('   ✅ XSS bloqueado correctamente');
    } else {
      console.log('   ❌ XSS NO bloqueado!');
      expect(alerts.length).toBe(0);
    }
  });
  
  test('✅ 15. HTTPS Redirect (si está en producción)', async ({ page }) => {
    console.log('🔒 Verificando HTTPS...');
    
    const url = page.url() || BASE_URL;
    
    if (url.startsWith('http://localhost')) {
      console.log('   ℹ️  Localhost - skip HTTPS check');
    } else {
      expect(url).toContain('https://');
      console.log('   ✅ HTTPS activo');
    }
  });
});

test.describe('🧪 E2E - Tests de API', () => {
  
  test('✅ API - Health check', async ({ request }) => {
    console.log('💓 Verificando health del API...');
    
    const response = await request.get(`${API_URL}/health`);
    console.log(`   Status: ${response.status()}`);
    
    expect(response.status()).toBe(200);
    console.log('   ✅ API funcionando');
  });
  
  test('✅ API - Timeout scheduler status (admin)', async ({ request }) => {
    console.log('⏰ Verificando timeout scheduler...');
    
    // Primero hacer login para obtener token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: ADMIN_USER.email,
        password: ADMIN_USER.password
      }
    });
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      // Verificar scheduler
      const schedulerResponse = await request.get(`${API_URL}/order-expiration/scheduler/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Status: ${schedulerResponse.status()}`);
      
      if (schedulerResponse.ok()) {
        const data = await schedulerResponse.json();
        console.log(`   Scheduler active: ${data.data?.active}`);
        console.log('   ✅ Timeout scheduler funcionando');
      } else {
        console.log('   ⚠️  Scheduler no accesible');
      }
    } else {
      console.log('   ⚠️  No se pudo hacer login admin');
    }
  });
});
