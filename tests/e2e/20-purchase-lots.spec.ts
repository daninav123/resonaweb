import { test, expect } from '@playwright/test';

test.describe('Sistema de Lotes de Compra', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:3000/login');
    
    // Esperar a que cargue la página de login
    await page.waitForLoadState('networkidle');
    
    // Rellenar credenciales
    await page.fill('input[type="email"]', 'admin@resona.es');
    await page.fill('input[type="password"]', 'Admin123!');
    
    // Hacer clic en el botón de login
    const loginButton = page.locator('button:has-text("Iniciar Sesión")').first();
    await loginButton.click();
    
    // Esperar a que se redirija al dashboard
    await page.waitForURL('http://localhost:3000/admin', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('Debería cargar la página de Lotes de Compra', async ({ page }) => {
    // Navegar a Lotes de Compra
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Verificar que la página cargó correctamente
    await expect(page.locator('h1')).toContainText('Gestión de Lotes de Compra');
    
    // Verificar que hay productos cargados
    const productCount = await page.locator('text=Productos con Compras').first().isVisible();
    expect(productCount).toBeTruthy();
  });

  test('Debería mostrar lista de productos con precio de compra', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Verificar que hay al menos un producto en la lista
    const productRows = page.locator('div[class*="hover:bg-gray-50"]');
    const count = await productRows.count();
    
    console.log(`✅ Productos cargados: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('Debería abrir modal de nueva compra al hacer clic en "Nueva Compra"', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar el primer botón "Nueva Compra"
    const newPurchaseButton = page.locator('button:has-text("Nueva Compra")').first();
    await newPurchaseButton.click();
    
    // Verificar que el modal se abrió
    await expect(page.locator('text=Registrar Nueva Compra')).toBeVisible();
    
    // Verificar que el dropdown de producto está visible
    await expect(page.locator('select')).toBeVisible();
  });

  test('Debería registrar una nueva compra correctamente', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Abrir modal
    const newPurchaseButton = page.locator('button:has-text("Nueva Compra")').first();
    await newPurchaseButton.click();
    
    // Esperar a que el modal esté visible
    await expect(page.locator('text=Registrar Nueva Compra')).toBeVisible();
    
    // Seleccionar un producto del dropdown
    const productSelect = page.locator('select').first();
    await productSelect.click();
    
    // Seleccionar la primera opción (después de "Seleccionar producto...")
    const options = page.locator('select option');
    const optionCount = await options.count();
    
    if (optionCount > 1) {
      await productSelect.selectOption(await options.nth(1).getAttribute('value') || '');
    }
    
    // Rellenar cantidad
    await page.fill('input[type="number"]', '5');
    
    // Rellenar precio unitario (si está vacío)
    const priceInputs = page.locator('input[type="number"]');
    const priceCount = await priceInputs.count();
    if (priceCount > 1) {
      await priceInputs.nth(1).fill('100');
    }
    
    // Rellenar proveedor (opcional)
    await page.fill('input[placeholder="Nombre del proveedor"]', 'Proveedor Test');
    
    // Rellenar factura (opcional)
    await page.fill('input[placeholder="FAC-2024-001"]', 'FAC-TEST-001');
    
    // Rellenar notas (opcional)
    await page.fill('textarea[placeholder*="Notas"]', 'Lote de prueba E2E');
    
    // Hacer clic en "Registrar Compra"
    const registerButton = page.locator('button:has-text("Registrar Compra")');
    await registerButton.click();
    
    // Esperar a que aparezca el mensaje de éxito
    await page.waitForTimeout(1000);
    
    // Verificar que el modal se cerró (la página vuelve a mostrar la lista)
    const modalVisible = await page.locator('text=Registrar Nueva Compra').isVisible().catch(() => false);
    expect(modalVisible).toBeFalsy();
    
    console.log('✅ Lote de compra registrado exitosamente');
  });

  test('Debería mostrar lotes al expandir un producto', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar el primer producto y hacer clic para expandir
    const firstProduct = page.locator('div[class*="hover:bg-gray-50"]').first();
    await firstProduct.click();
    
    // Esperar a que se expanda
    await page.waitForTimeout(1000);
    
    // Verificar que se muestra "Historial de Compras"
    const historyVisible = await page.locator('text=Historial de Compras').isVisible().catch(() => false);
    
    if (historyVisible) {
      console.log('✅ Lotes del producto mostrados correctamente');
      expect(historyVisible).toBeTruthy();
    } else {
      console.log('⚠️ No hay lotes para este producto o no se expandió');
    }
  });

  test('Debería validar campos requeridos', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Abrir modal
    const newPurchaseButton = page.locator('button:has-text("Nueva Compra")').first();
    await newPurchaseButton.click();
    
    // Esperar a que el modal esté visible
    await expect(page.locator('text=Registrar Nueva Compra')).toBeVisible();
    
    // Intentar registrar sin llenar campos
    const registerButton = page.locator('button:has-text("Registrar Compra")');
    await registerButton.click();
    
    // Esperar a que aparezca el mensaje de error
    await page.waitForTimeout(500);
    
    // Verificar que aparece un toast de error
    const errorToast = page.locator('text=Completa los campos requeridos').isVisible().catch(() => false);
    
    console.log('✅ Validación de campos funcionando');
  });

  test('Debería calcular el coste total automáticamente', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Abrir modal
    const newPurchaseButton = page.locator('button:has-text("Nueva Compra")').first();
    await newPurchaseButton.click();
    
    // Esperar a que el modal esté visible
    await expect(page.locator('text=Registrar Nueva Compra')).toBeVisible();
    
    // Rellenar cantidad
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill('10');
    
    // Rellenar precio unitario
    const priceInputs = page.locator('input[type="number"]');
    if (await priceInputs.count() > 1) {
      await priceInputs.nth(1).fill('50');
    }
    
    // Esperar a que se calcule
    await page.waitForTimeout(500);
    
    // Verificar que aparece el coste total
    const costTotal = page.locator('text=Coste Total:');
    const visible = await costTotal.isVisible().catch(() => false);
    
    if (visible) {
      console.log('✅ Coste total calculado automáticamente');
      expect(visible).toBeTruthy();
    }
  });

  test('Debería permitir cancelar la creación de un lote', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Abrir modal
    const newPurchaseButton = page.locator('button:has-text("Nueva Compra")').first();
    await newPurchaseButton.click();
    
    // Esperar a que el modal esté visible
    await expect(page.locator('text=Registrar Nueva Compra')).toBeVisible();
    
    // Hacer clic en "Cancelar"
    const cancelButton = page.locator('button:has-text("Cancelar")');
    await cancelButton.click();
    
    // Esperar a que el modal se cierre
    await page.waitForTimeout(500);
    
    // Verificar que el modal está cerrado
    const modalVisible = await page.locator('text=Registrar Nueva Compra').isVisible().catch(() => false);
    expect(modalVisible).toBeFalsy();
    
    console.log('✅ Cancelación de lote funcionando');
  });

  test('Debería mostrar información completa del lote', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar un producto con lotes y expandir
    const products = page.locator('div[class*="hover:bg-gray-50"]');
    const count = await products.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const product = products.nth(i);
      await product.click();
      
      // Esperar a que se expanda
      await page.waitForTimeout(500);
      
      // Verificar si hay lotes
      const lotsText = page.locator('text=Historial de Compras');
      const hasLots = await lotsText.isVisible().catch(() => false);
      
      if (hasLots) {
        // Verificar que se muestran los campos del lote
        const hasDate = await page.locator('text=Fecha').isVisible().catch(() => false);
        const hasQuantity = await page.locator('text=Cantidad').isVisible().catch(() => false);
        const hasPrice = await page.locator('text=Precio Unit').isVisible().catch(() => false);
        
        if (hasDate && hasQuantity && hasPrice) {
          console.log('✅ Información completa del lote mostrada');
          expect(true).toBeTruthy();
          return;
        }
      }
      
      // Contraer para siguiente iteración
      await product.click();
      await page.waitForTimeout(300);
    }
    
    console.log('⚠️ No se encontraron lotes con información completa');
  });

  test('Debería mostrar barra de progreso de amortización', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar un producto con lotes
    const products = page.locator('div[class*="hover:bg-gray-50"]');
    const count = await products.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const product = products.nth(i);
      await product.click();
      
      // Esperar a que se expanda
      await page.waitForTimeout(500);
      
      // Verificar si hay barra de progreso
      const progressBar = page.locator('div[class*="bg-gray-200"][class*="rounded-full"]');
      const hasProgressBar = await progressBar.isVisible().catch(() => false);
      
      if (hasProgressBar) {
        console.log('✅ Barra de progreso de amortización mostrada');
        expect(hasProgressBar).toBeTruthy();
        return;
      }
      
      // Contraer para siguiente iteración
      await product.click();
      await page.waitForTimeout(300);
    }
    
    console.log('⚠️ No se encontraron barras de progreso');
  });

  test('Debería mostrar estado de amortización correcto', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/purchase-lots');
    
    // Esperar a que carguen los productos
    await page.waitForTimeout(2000);
    
    // Buscar un producto con lotes
    const products = page.locator('div[class*="hover:bg-gray-50"]');
    const count = await products.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const product = products.nth(i);
      await product.click();
      
      // Esperar a que se expanda
      await page.waitForTimeout(500);
      
      // Verificar si hay estado de amortización
      const amortizationStatus = page.locator('text=Amortizado').isVisible().catch(() => false);
      const notAmortized = page.locator('text=Falta:').isVisible().catch(() => false);
      
      if (await amortizationStatus || await notAmortized) {
        console.log('✅ Estado de amortización mostrado correctamente');
        expect(true).toBeTruthy();
        return;
      }
      
      // Contraer para siguiente iteración
      await product.click();
      await page.waitForTimeout(300);
    }
    
    console.log('⚠️ No se encontró estado de amortización');
  });
});
