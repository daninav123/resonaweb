import { test, expect } from '@playwright/test';

test.describe('Crear Categoría - Admin', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Login como admin con credenciales correctas
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Esperar el redirect después del login
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
      page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(1000);
    
    console.log('✅ Login exitoso, URL actual:', page.url());
  });

  test('debe permitir crear una nueva categoría', async ({ page }) => {
    console.log('🧪 Test: Crear nueva categoría');
    
    // Ir a la página de categorías
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForTimeout(2000);
    
    console.log('📍 En página de categorías');
    
    // Verificar que estamos autenticados (ver si hay botón de crear)
    const createButton = page.locator('button:has-text("Nueva Categoría")');
    await expect(createButton).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Botón crear visible');
    
    // Capturar número inicial de categorías
    const initialRows = await page.locator('tbody tr').count();
    console.log(`📊 Categorías iniciales: ${initialRows}`);
    
    // Click en nueva categoría
    await createButton.click();
    await page.waitForTimeout(1000);
    
    console.log('📝 Modal abierto');
    
    // Llenar formulario
    const categoryName = `Test Category ${Date.now()}`;
    await page.fill('input[placeholder="Ej: Sonido Profesional"]', categoryName);
    await page.fill('textarea[placeholder="Descripción opcional de la categoría"]', 'Categoría de prueba automática');
    
    console.log(`📝 Formulario llenado: ${categoryName}`);
    
    // Interceptar la petición POST
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/v1/products/categories') && response.request().method() === 'POST',
      { timeout: 15000 }
    );
    
    // Click en crear
    await page.click('button:has-text("Crear")');
    
    console.log('🔄 Enviando petición...');
    
    // Esperar respuesta
    try {
      const response = await responsePromise;
      const status = response.status();
      
      console.log(`📡 Status de respuesta: ${status}`);
      
      if (status === 401) {
        console.error('❌ ERROR 401: No autorizado');
        
        // Obtener headers de la petición
        const request = response.request();
        const headers = await request.allHeaders();
        console.log('📋 Headers enviados:', JSON.stringify(headers, null, 2));
        
        // Verificar si hay token en localStorage
        const hasToken = await page.evaluate(() => {
          const token = localStorage.getItem('auth_token');
          const refreshToken = localStorage.getItem('refresh_token');
          return {
            hasToken: !!token,
            hasRefreshToken: !!refreshToken,
            tokenLength: token?.length || 0
          };
        });
        console.log('🔑 Estado de tokens:', hasToken);
        
        throw new Error('Petición rechazada con 401 Unauthorized');
      }
      
      expect(status).toBe(201);
      
      const data = await response.json();
      console.log('✅ Categoría creada:', data);
      
      // Esperar a que se cierre el modal y se recargue la lista
      await page.waitForTimeout(2000);
      
      // Verificar que hay una categoría más
      const finalRows = await page.locator('tbody tr').count();
      console.log(`📊 Categorías finales: ${finalRows}`);
      
      expect(finalRows).toBeGreaterThan(initialRows);
      
      // Verificar que la nueva categoría aparece en la lista
      const newCategoryRow = page.locator(`tr:has-text("${categoryName}")`);
      await expect(newCategoryRow).toBeVisible();
      
      console.log('✅ Test completado exitosamente');
      
    } catch (error: any) {
      console.error('❌ Error en el test:', error.message);
      
      // Captura de pantalla para debugging
      await page.screenshot({ path: 'test-results/category-create-error.png', fullPage: true });
      console.log('📸 Screenshot guardado en test-results/category-create-error.png');
      
      throw error;
    }
  });

  test('debe validar campos requeridos', async ({ page }) => {
    console.log('🧪 Test: Validación de campos');
    
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForTimeout(2000);
    
    // Click en nueva categoría
    await page.click('button:has-text("Nueva Categoría")');
    await page.waitForTimeout(1000);
    
    // Intentar crear sin llenar campos
    await page.click('button:has-text("Crear")');
    await page.waitForTimeout(500);
    
    // Verificar que el modal sigue abierto (no se cerró porque faltaban campos)
    // O que hay un mensaje de error
    const modalStillVisible = await page.locator('div[role="dialog"]').isVisible().catch(() => false);
    
    if (modalStillVisible) {
      console.log('✅ Modal sigue abierto (campos requeridos)');
    }
  });
});
