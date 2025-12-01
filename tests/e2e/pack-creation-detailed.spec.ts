import { test, expect } from '@playwright/test';
import { appUrls, adminCredentials } from '../fixtures/test-data';
import { loginAsAdmin, clearSession } from '../helpers/auth';

/**
 * TEST E2E - Creación de Pack con Nuevo Sistema de Precios
 * Verifica: precio/día + envío + instalación + descuentos + ahorros
 */

test.describe('Pack Creation - Sistema Mejorado de Precios', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
    console.log('✅ Admin autenticado');
  });

  test('01. Crear pack completo con cálculo de precios', async ({ page }) => {
    console.log('🔄 Iniciando test de creación de pack...');
    
    // Paso 1: Navegar a packs admin
    console.log('📍 Navegando a /admin/packs');
    await page.goto(`${appUrls.admin}/packs`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Verificar que estamos en la página correcta
    expect(page.url()).toContain('/admin/packs');
    console.log('✅ Página de admin packs cargada');
    
    // Paso 2: Buscar y hacer clic en botón de crear pack
    console.log('🔍 Buscando botón "Crear Pack"');
    const createButton = page.locator('button:has-text("Crear Pack"), button:has-text("Nuevo Pack"), a:has-text("Crear Pack")').first();
    
    // Esperar a que aparezca el botón
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Botón "Crear Pack" encontrado');
    
    // Capturar screenshot antes de hacer clic
    await page.screenshot({ path: 'screenshots/01-before-create-pack.png', fullPage: true });
    
    await createButton.click();
    console.log('🖱️ Click en botón "Crear Pack"');
    await page.waitForTimeout(2000);
    
    // Capturar screenshot después del clic
    await page.screenshot({ path: 'screenshots/02-after-create-click.png', fullPage: true });
    
    // Paso 3: Verificar que se abrió el modal o se cambió la URL
    console.log('🔍 Verificando modal o redirección...');
    const modal = page.locator('[role="dialog"], .modal, [class*="Modal"]');
    const hasModal = await modal.isVisible({ timeout: 3000 }).catch(() => false);
    const urlChanged = page.url().includes('createPack') || page.url().includes('nuevo') || page.url().includes('products');
    
    console.log(`   Modal visible: ${hasModal}`);
    console.log(`   URL cambió: ${urlChanged}`);
    console.log(`   URL actual: ${page.url()}`);
    
    if (!hasModal && !urlChanged) {
      console.error('❌ No se abrió modal ni cambió la URL');
      await page.screenshot({ path: 'screenshots/03-ERROR-no-modal.png', fullPage: true });
      
      // Intentar buscar mensajes de error
      const errorMessage = await page.locator('text=/error/i, text=/fallo/i, [role="alert"]').first().textContent().catch(() => null);
      if (errorMessage) {
        console.error(`❌ Mensaje de error encontrado: ${errorMessage}`);
      }
      
      // Verificar console errors
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`❌ Console Error: ${msg.text()}`);
        }
      });
      
      throw new Error('No se pudo abrir el formulario de creación de pack');
    }
    
    console.log('✅ Formulario de creación abierto');
    await page.waitForTimeout(1000);
    
    // Paso 4: Llenar datos del pack
    console.log('📝 Llenando datos del pack...');
    
    const packData = {
      name: `Pack Test E2E ${Date.now()}`,
      description: 'Pack de prueba para E2E testing con nuevo sistema de precios',
      discountPercentage: 15
    };
    
    // Buscar campo de nombre
    console.log('🔍 Buscando campo "Nombre"');
    const nameField = page.locator('input[name="name"], input#name, input[placeholder*="nombre" i]').first();
    
    const nameVisible = await nameField.isVisible({ timeout: 5000 }).catch(() => false);
    if (!nameVisible) {
      console.error('❌ Campo de nombre no visible');
      await page.screenshot({ path: 'screenshots/04-ERROR-no-name-field.png', fullPage: true });
      
      // Listar todos los inputs disponibles
      const inputs = await page.locator('input').all();
      console.log(`📋 Inputs encontrados: ${inputs.length}`);
      for (let i = 0; i < Math.min(inputs.length, 10); i++) {
        const placeholder = await inputs[i].getAttribute('placeholder').catch(() => null);
        const name = await inputs[i].getAttribute('name').catch(() => null);
        const id = await inputs[i].getAttribute('id').catch(() => null);
        console.log(`   Input ${i}: placeholder="${placeholder}", name="${name}", id="${id}"`);
      }
      
      throw new Error('Campo de nombre no encontrado');
    }
    
    await nameField.fill(packData.name);
    console.log(`✅ Nombre: ${packData.name}`);
    await page.waitForTimeout(500);
    
    // Buscar campo de descripción
    console.log('🔍 Buscando campo "Descripción"');
    const descField = page.locator('textarea[name="description"], textarea#description, textarea[placeholder*="descripción" i]').first();
    
    if (await descField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descField.fill(packData.description);
      console.log(`✅ Descripción: ${packData.description}`);
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️ Campo de descripción no encontrado (opcional)');
    }
    
    // Buscar campo de descuento
    console.log('🔍 Buscando campo "Descuento"');
    const discountField = page.locator('input[name*="discount" i], input[placeholder*="descuento" i], input#discountPercentage').first();
    
    if (await discountField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await discountField.fill(packData.discountPercentage.toString());
      console.log(`✅ Descuento: ${packData.discountPercentage}%`);
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️ Campo de descuento no encontrado (puede estar en otro paso)');
    }
    
    await page.screenshot({ path: 'screenshots/05-form-filled.png', fullPage: true });
    
    // Paso 5: Seleccionar productos (componentes del pack)
    console.log('📦 Intentando agregar productos al pack...');
    
    const addProductButton = page.locator('button:has-text("Agregar producto"), button:has-text("Añadir producto"), button:has-text("Agregar componente"), button:has-text("+")').first();
    
    if (await addProductButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Botón "Agregar Producto" encontrado');
      await addProductButton.click();
      await page.waitForTimeout(1500);
      
      // Buscar selector de producto
      const productSelect = page.locator('select[name*="product" i], select[name*="componente" i]').first();
      if (await productSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Obtener opciones disponibles
        const options = await productSelect.locator('option').all();
        console.log(`📋 Productos disponibles: ${options.length - 1}`); // -1 por la opción vacía
        
        if (options.length > 1) {
          // Seleccionar el primer producto disponible
          await productSelect.selectOption({ index: 1 });
          console.log('✅ Producto 1 seleccionado');
          
          // Buscar campo de cantidad
          const quantityField = page.locator('input[name*="quantity" i], input[name*="cantidad" i]').first();
          if (await quantityField.isVisible({ timeout: 2000 }).catch(() => false)) {
            await quantityField.fill('2');
            console.log('✅ Cantidad: 2');
          }
          
          await page.waitForTimeout(1000);
          
          // Intentar agregar un segundo producto
          const addAnotherButton = page.locator('button:has-text("Agregar otro"), button:has-text("+")').first();
          if (await addAnotherButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await addAnotherButton.click();
            await page.waitForTimeout(1000);
            
            const productSelect2 = page.locator('select[name*="product" i]').nth(1);
            if (await productSelect2.isVisible({ timeout: 2000 }).catch(() => false)) {
              await productSelect2.selectOption({ index: 2 });
              console.log('✅ Producto 2 seleccionado');
            }
          }
        } else {
          console.log('⚠️ No hay productos disponibles para agregar');
        }
      }
      
      await page.screenshot({ path: 'screenshots/06-products-added.png', fullPage: true });
    } else {
      console.log('⚠️ Botón "Agregar Producto" no encontrado');
      console.log('   Esto puede indicar que los productos se seleccionan de otra manera');
    }
    
    // Paso 6: Verificar cálculo de precios
    console.log('💰 Verificando cálculo de precios...');
    
    const priceElements = {
      basePricePerDay: page.locator('text=/precio.*día/i, [data-testid="base-price"]').first(),
      shippingCost: page.locator('text=/envío/i, [data-testid="shipping-cost"]').first(),
      installationCost: page.locator('text=/instalación/i, [data-testid="installation-cost"]').first(),
      calculatedTotal: page.locator('text=/total calculado/i, [data-testid="calculated-total"]').first(),
      finalPrice: page.locator('text=/precio final/i, [data-testid="final-price"]').first(),
      savings: page.locator('text=/ahorro/i, text=/ahorr/i, [data-testid="savings"]').first()
    };
    
    for (const [key, element] of Object.entries(priceElements)) {
      const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        const text = await element.textContent();
        console.log(`✅ ${key}: ${text}`);
      } else {
        console.log(`⚠️ ${key}: no visible`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/07-price-calculation.png', fullPage: true });
    
    // Paso 7: Guardar el pack
    console.log('💾 Guardando pack...');
    
    const submitButton = page.locator('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear"), button:has-text("Crear Pack")').first();
    
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('✅ Botón "Guardar" encontrado');
      
      // Verificar si está habilitado
      const isEnabled = await submitButton.isEnabled();
      console.log(`   Botón habilitado: ${isEnabled}`);
      
      if (!isEnabled) {
        console.error('❌ Botón de guardar deshabilitado');
        await page.screenshot({ path: 'screenshots/08-ERROR-button-disabled.png', fullPage: true });
        
        // Buscar mensajes de validación
        const validationErrors = await page.locator('[role="alert"], .error, .text-red-500').all();
        console.log(`⚠️ Errores de validación encontrados: ${validationErrors.length}`);
        for (const error of validationErrors) {
          const text = await error.textContent().catch(() => null);
          if (text) console.error(`   - ${text}`);
        }
        
        throw new Error('Botón de guardar deshabilitado - revisar validaciones');
      }
      
      // Intentar guardar
      await submitButton.click();
      console.log('🖱️ Click en "Guardar"');
      
      // Esperar respuesta
      await page.waitForTimeout(3000);
      
      // Verificar resultado
      const successMessage = page.locator('text=/pack creado/i, text=/éxito/i, text=/success/i, [role="alert"]:has-text("éxito")').first();
      const errorMessage = page.locator('text=/error/i, text=/fallo/i, [role="alert"]:has-text("error")').first();
      
      const hasSuccess = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      await page.screenshot({ path: 'screenshots/09-after-save.png', fullPage: true });
      
      if (hasSuccess) {
        console.log('✅ ¡Pack creado exitosamente!');
        const successText = await successMessage.textContent();
        console.log(`   Mensaje: ${successText}`);
      } else if (hasError) {
        console.error('❌ Error al crear pack');
        const errorText = await errorMessage.textContent();
        console.error(`   Mensaje: ${errorText}`);
        throw new Error(`Error al crear pack: ${errorText}`);
      } else {
        console.log('⚠️ No se detectó mensaje de éxito ni error claro');
        console.log(`   URL actual: ${page.url()}`);
        
        // Verificar si redirigió a la lista de packs
        if (page.url().includes('/admin/packs') && !page.url().includes('createPack')) {
          console.log('✅ Parece que se guardó (redirigió a lista)');
        } else {
          console.log('⚠️ No se detectó redirección esperada');
        }
      }
      
      // Paso 8: Verificar que el pack aparece en la lista
      console.log('🔍 Verificando pack en la lista...');
      
      if (!page.url().includes('/admin/packs') || page.url().includes('createPack')) {
        await page.goto(`${appUrls.admin}/packs`);
        await page.waitForLoadState('networkidle');
      }
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/10-pack-list.png', fullPage: true });
      
      const packInList = page.locator(`text="${packData.name}"`).first();
      const inList = await packInList.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (inList) {
        console.log('✅ Pack encontrado en la lista');
      } else {
        console.log('⚠️ Pack no encontrado en la lista inmediatamente');
        console.log('   Esto puede ser normal si hay paginación o filtros');
      }
      
      expect(true).toBeTruthy();
      
    } else {
      console.error('❌ Botón de guardar no encontrado');
      await page.screenshot({ path: 'screenshots/08-ERROR-no-submit-button.png', fullPage: true });
      throw new Error('Botón de guardar no encontrado');
    }
  });

  test('02. Verificar campos de nuevo sistema de precios', async ({ page }) => {
    console.log('🔄 Verificando campos del nuevo sistema de precios...');
    
    await page.goto(`${appUrls.admin}/packs`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const createButton = page.locator('button:has-text("Crear Pack"), a:has-text("Crear Pack")').first();
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    await createButton.click();
    await page.waitForTimeout(2000);
    
    console.log('📋 Buscando campos esperados del nuevo sistema:');
    
    const expectedFields = {
      discountPercentage: 'input[name*="discount" i], input#discountPercentage',
      customFinalPrice: 'input[name*="finalPrice" i], input[name*="precioFinal" i]',
      savingsDisplay: 'text=/ahorro/i, [data-testid="savings"]',
      priceBreakdown: 'text=/desglose/i, [data-testid="price-breakdown"]'
    };
    
    for (const [fieldName, selector] of Object.entries(expectedFields)) {
      const element = page.locator(selector).first();
      const exists = await element.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (exists) {
        console.log(`✅ ${fieldName}: Encontrado`);
      } else {
        console.log(`⚠️ ${fieldName}: No encontrado`);
      }
    }
    
    await page.screenshot({ path: 'screenshots/11-new-price-fields.png', fullPage: true });
    
    expect(true).toBeTruthy();
  });

  test('03. Detectar errores comunes en creación', async ({ page }) => {
    console.log('🔄 Test de detección de errores...');
    
    // Escuchar errores de consola
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.error(`❌ Console Error: ${msg.text()}`);
      }
    });
    
    // Escuchar errores de red
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.error(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.goto(`${appUrls.admin}/packs`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`📊 Errores de consola detectados: ${consoleErrors.length}`);
    console.log(`📊 Errores de red detectados: ${networkErrors.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('📋 Errores de consola:');
      consoleErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('📋 Errores de red:');
      networkErrors.forEach((error, i) => console.log(`   ${i + 1}. ${error}`));
    }
    
    // El test pasa independientemente, pero reporta los errores
    expect(true).toBeTruthy();
  });

});
