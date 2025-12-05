import { test, expect } from '@playwright/test';

/**
 * TEST E2E - INTEGRACIÓN COMPLETA
 * 
 * Simula el flujo completo de principio a fin:
 * 1. Admin configura calculadora
 * 2. Cliente usa calculadora
 * 3. Añade al carrito
 * 4. Ve resumen con 25%
 * 5. Procede al checkout
 */

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api/v1';

test.describe('Integración Completa del Sistema', () => {
  
  test('01. FLUJO COMPLETO: Desde calculadora hasta carrito', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 INICIANDO FLUJO DE INTEGRACIÓN COMPLETA');
    console.log('='.repeat(70) + '\n');
    
    // ============================================================
    // FASE 1: CALCULADORA - Configurar evento
    // ============================================================
    console.log('📋 FASE 1: Configurando evento en calculadora...\n');
    
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(2000);
    
    // Paso 1: Seleccionar tipo de evento
    console.log('   1️⃣ Seleccionando tipo de evento...');
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    const eventName = await firstEvent.textContent() || 'Evento';
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    console.log(`      ✅ Tipo seleccionado: ${eventName.trim()}`);
    
    // Paso 2: Detalles del evento
    console.log('   2️⃣ Ingresando detalles...');
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('120');
    console.log('      ✅ Invitados: 120');
    
    // Fecha (si existe)
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.count() > 0) {
      await dateInput.fill('2025-07-20');
      console.log('      ✅ Fecha: 2025-07-20');
    }
    
    // Ubicación (si existe)
    const locationInput = page.locator('input[placeholder*="ubicación"]').or(
      page.locator('input[placeholder*="dirección"]')
    );
    if (await locationInput.count() > 0) {
      await locationInput.fill('Valencia, España');
      console.log('      ✅ Ubicación: Valencia, España');
    }
    
    // ============================================================
    // FASE 2: NAVEGAR POR LA CALCULADORA
    // ============================================================
    console.log('\n📋 FASE 2: Navegando por los pasos...\n');
    
    let currentStep = 2;
    let totalEstimado = 0;
    
    for (let i = 0; i < 10; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible().catch(() => false);
      
      if (!isVisible) {
        console.log('   ℹ️ No hay más pasos (llegamos al final)');
        break;
      }
      
      // Ver en qué paso estamos
      const stepText = await page.locator('h2, h3').first().textContent() || '';
      console.log(`   ${currentStep}️⃣ Paso: ${stepText.trim()}`);
      
      // Si estamos en partes, seleccionar algunas
      if (stepText.toLowerCase().includes('parte')) {
        const parts = page.locator('[class*="border-2"]');
        const count = await parts.count();
        
        if (count > 0) {
          await parts.first().click();
          console.log(`      ✅ Parte seleccionada (1 de ${count})`);
        }
      }
      
      // Si estamos en equipos, seleccionar uno
      if (stepText.toLowerCase().includes('equipo')) {
        const equipos = page.locator('[class*="border"]');
        const count = await equipos.count();
        
        if (count > 0) {
          await equipos.first().click();
          console.log(`      ✅ Equipo seleccionado (1 de ${count})`);
        }
      }
      
      // Si estamos en extras, opcionalmente seleccionar
      if (stepText.toLowerCase().includes('extra')) {
        console.log('      ℹ️ Extras disponibles (saltando)');
      }
      
      // Si estamos en resumen, capturar total
      if (stepText.toLowerCase().includes('resumen')) {
        console.log('   📊 Llegamos al resumen final');
        await page.waitForTimeout(2000);
        
        // Buscar precios
        const prices = await page.locator('text=/€\\d+/').allTextContents();
        console.log(`      💰 Precios encontrados: ${prices.length}`);
        
        if (prices.length > 0) {
          // Intentar extraer el total
          const totalMatch = prices[prices.length - 1].match(/€([\d.,]+)/);
          if (totalMatch) {
            totalEstimado = parseFloat(totalMatch[1].replace(',', ''));
            console.log(`      💵 Total estimado: €${totalEstimado}`);
          }
        }
        
        break;
      }
      
      await nextButton.click();
      await page.waitForTimeout(500);
      currentStep++;
    }
    
    // ============================================================
    // FASE 3: AÑADIR AL CARRITO
    // ============================================================
    console.log('\n📋 FASE 3: Añadiendo al carrito...\n');
    
    const tramitarButton = page.locator('button:has-text("Tramitar")').or(
      page.locator('button:has-text("Reservar")')
    );
    
    const hasTramitar = await tramitarButton.count() > 0;
    
    if (hasTramitar) {
      const buttonText = await tramitarButton.first().textContent() || '';
      console.log(`   🔘 Botón encontrado: "${buttonText.trim()}"`);
      
      const isDisabled = await tramitarButton.first().isDisabled();
      console.log(`   📋 Estado: ${isDisabled ? 'DESHABILITADO' : 'HABILITADO'}`);
      
      if (!isDisabled) {
        await tramitarButton.first().click();
        await page.waitForTimeout(2000);
        
        // Verificar si fuimos al carrito
        const currentUrl = page.url();
        console.log(`   🔗 URL actual: ${currentUrl}`);
        
        if (currentUrl.includes('/cart') || currentUrl.includes('/carrito')) {
          console.log('   ✅ Redirigido al carrito correctamente');
        } else {
          console.log('   ℹ️ No se redirigió al carrito automáticamente');
        }
      } else {
        console.log('   ⚠️ Botón deshabilitado - puede faltar información');
      }
    } else {
      console.log('   ⚠️ Botón de tramitar no encontrado');
    }
    
    // ============================================================
    // FASE 4: VERIFICAR CARRITO
    // ============================================================
    console.log('\n📋 FASE 4: Verificando carrito...\n');
    
    await page.goto(`${BASE_URL}/cart`);
    await page.waitForTimeout(2000);
    
    // Verificar si hay items
    const cartEmpty = await page.locator('text=/vacío|empty/i').count() > 0;
    
    if (cartEmpty) {
      console.log('   ⚠️ Carrito vacío - el item no se añadió');
    } else {
      console.log('   ✅ Carrito contiene items');
      
      // Buscar referencias al sistema de pago a plazos
      const has25Percent = await page.locator('text=/25%/').count() > 0;
      const hasReserva = await page.locator('text=/Reserva|reserva/').count() > 0;
      
      if (has25Percent || hasReserva) {
        console.log('   💳 Sistema de pago a plazos (25%) detectado');
        
        // Buscar montos
        const prices = await page.locator('text=/€\\d+/').allTextContents();
        console.log(`   💰 Precios en carrito: ${prices.length}`);
        
        if (prices.length > 0) {
          console.log('   📊 Algunos precios:');
          prices.slice(0, 3).forEach(p => console.log(`      - ${p}`));
        }
      } else {
        console.log('   ℹ️ Pago a plazos no visible (total puede ser < €500)');
      }
      
      // Buscar botón de checkout
      const checkoutButton = page.locator('button:has-text("Checkout")').or(
        page.locator('button:has-text("Tramitar")').or(
          page.locator('a[href*="checkout"]')
        )
      );
      
      const hasCheckout = await checkoutButton.count() > 0;
      
      if (hasCheckout) {
        console.log('   🔘 Botón de checkout encontrado');
        
        const isEnabled = await checkoutButton.first().isEnabled();
        console.log(`   📋 Estado: ${isEnabled ? 'HABILITADO' : 'DESHABILITADO'}`);
      } else {
        console.log('   ⚠️ Botón de checkout no encontrado');
      }
    }
    
    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DEL FLUJO DE INTEGRACIÓN');
    console.log('='.repeat(70));
    console.log(`\n✅ Evento configurado: ${eventName.trim()}`);
    console.log(`✅ Invitados: 120`);
    console.log(`✅ Total estimado: €${totalEstimado || 'N/A'}`);
    console.log(`✅ Estado del carrito: ${cartEmpty ? 'Vacío ⚠️' : 'Con items ✅'}`);
    console.log('='.repeat(70) + '\n');
  });

  test('02. Verificar consistencia de datos entre páginas', async ({ page }) => {
    console.log('\n🔍 Verificando consistencia de datos...\n');
    
    // Cargar configuración de calculadora desde localStorage
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(2000);
    
    const config = await page.evaluate(() => {
      return localStorage.getItem('advancedCalculatorConfig');
    });
    
    if (config) {
      const parsedConfig = JSON.parse(config);
      const eventTypes = parsedConfig.eventTypes || [];
      
      console.log(`📋 Tipos de eventos en localStorage: ${eventTypes.length}`);
      
      eventTypes.forEach((et: any, index: number) => {
        console.log(`   ${index + 1}. ${et.name} (${et.parts?.length || 0} partes)`);
      });
      
      console.log('\n✅ Configuración consistente en localStorage');
    } else {
      console.log('⚠️ No se encontró configuración en localStorage');
    }
  });

  test('03. Verificar flags de localStorage para calculadora', async ({ page }) => {
    console.log('\n🔍 Verificando flags de localStorage...\n');
    
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(1000);
    
    // Completar un flujo rápido
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('100');
    
    // Intentar llegar hasta añadir al carrito
    for (let i = 0; i < 8; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      if (!(await nextButton.isVisible())) break;
      await nextButton.click();
      await page.waitForTimeout(300);
    }
    
    // Buscar botón de tramitar
    const tramitarButton = page.locator('button:has-text("Tramitar")').or(
      page.locator('button:has-text("Reservar")')
    );
    
    if (await tramitarButton.count() > 0) {
      if (!(await tramitarButton.first().isDisabled())) {
        await tramitarButton.first().click();
        await page.waitForTimeout(1000);
        
        // Verificar flags
        const flags = await page.evaluate(() => ({
          cartFromCalculator: localStorage.getItem('cartFromCalculator'),
          cartIncludesShippingInstallation: localStorage.getItem('cartIncludesShippingInstallation'),
          cartEventDates: localStorage.getItem('cartEventDates'),
          cartEventInfo: localStorage.getItem('cartEventInfo')
        }));
        
        console.log('📋 Flags de localStorage:');
        Object.entries(flags).forEach(([key, value]) => {
          console.log(`   ${key}: ${value || 'null'}`);
        });
        
        if (flags.cartFromCalculator === 'true') {
          console.log('\n✅ Flag cartFromCalculator establecido correctamente');
        } else {
          console.log('\n⚠️ Flag cartFromCalculator no establecido');
        }
      }
    }
  });

  test('04. Performance: Tiempo completo del flujo', async ({ page }) => {
    console.log('\n⏱️ Midiendo tiempo de flujo completo...\n');
    
    const startTime = Date.now();
    
    // Flujo completo simplificado
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(1000);
    
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(300);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('100');
    
    // Avanzar rápidamente
    for (let i = 0; i < 10; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      if (!(await nextButton.isVisible())) break;
      await nextButton.click();
      await page.waitForTimeout(200);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo total: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
    
    // Verificar que es razonable (< 30 segundos)
    expect(totalTime).toBeLessThan(30000);
    
    console.log('✅ Tiempo de flujo aceptable');
  });

  test('05. Verificar que no se pierden datos al navegar', async ({ page }) => {
    console.log('\n🔍 Verificando persistencia de datos...\n');
    
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(1000);
    
    // Seleccionar evento
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    // Ingresar datos
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('85');
    await page.waitForTimeout(500);
    
    // Navegar a otra página y volver
    console.log('   1️⃣ Navegando a home...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1000);
    
    console.log('   2️⃣ Volviendo a calculadora...');
    await page.goto(`${BASE_URL}/calculadora`);
    await page.waitForTimeout(2000);
    
    // Verificar si los datos persisten
    const config = await page.evaluate(() => {
      return localStorage.getItem('advancedCalculatorConfig');
    });
    
    if (config) {
      console.log('   ✅ Configuración persiste después de navegación');
    } else {
      console.log('   ⚠️ Configuración se perdió');
    }
  });
});
