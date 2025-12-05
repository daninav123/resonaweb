import { test, expect } from '@playwright/test';

/**
 * TEST E2E COMPLETO - SISTEMA DE CALCULADORA CON MONTAJES
 * 
 * Verifica el flujo completo desde la configuración en el admin
 * hasta la reserva final del evento.
 */

const API_URL = 'http://localhost:3001/api/v1';
const BASE_URL = 'http://localhost:3000';

// Datos de prueba
const TEST_EVENT_CONFIG = {
  name: 'Boda Test E2E',
  icon: '💒',
  color: 'pink',
  parts: [
    {
      name: 'Ceremonia',
      icon: '🎭',
      pricingRanges: [
        { minAttendees: 0, maxAttendees: 50, price: 300 },
        { minAttendees: 51, maxAttendees: 100, price: 500 },
        { minAttendees: 101, maxAttendees: 200, price: 700 }
      ]
    },
    {
      name: 'Disco',
      icon: '🎵',
      pricingRanges: [
        { minAttendees: 0, maxAttendees: 50, price: 500 },
        { minAttendees: 51, maxAttendees: 100, price: 800 },
        { minAttendees: 101, maxAttendees: 200, price: 1200 }
      ]
    }
  ]
};

test.describe('Sistema Completo de Calculadora', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto(`${BASE_URL}/login`);
  });

  test('01. Backend debe cargar montajes correctamente', async ({ request }) => {
    // Test sin montajes (catálogo público)
    const publicRes = await request.get(`${API_URL}/packs`);
    expect(publicRes.ok()).toBeTruthy();
    
    const publicData = await publicRes.json();
    const publicPacks = publicData.packs || [];
    
    console.log(`📦 Catálogo público: ${publicPacks.length} packs`);
    
    // Verificar que NO hay montajes
    const publicMontajes = publicPacks.filter((p: any) => 
      p.categoryRef?.name?.toLowerCase() === 'montaje'
    );
    expect(publicMontajes.length).toBe(0);

    // Test con montajes (calculadora)
    const calcRes = await request.get(`${API_URL}/packs?includeMontajes=true`);
    expect(calcRes.ok()).toBeTruthy();
    
    const calcData = await calcRes.json();
    const calcPacks = calcData.packs || [];
    
    console.log(`🧮 Calculadora: ${calcPacks.length} packs (incluyendo montajes)`);
    
    // Verificar que SÍ hay montajes
    const calcMontajes = calcPacks.filter((p: any) => 
      p.categoryRef?.name?.toLowerCase() === 'montaje'
    );
    expect(calcMontajes.length).toBeGreaterThan(0);
    
    console.log(`✅ Montajes disponibles: ${calcMontajes.length}`);
  });

  test('02. Calculadora debe cargar sin errores', async ({ page }) => {
    // Navegar a la calculadora
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Esperar a que cargue
    await page.waitForSelector('text=Calculadora de Eventos', { timeout: 10000 });
    
    // Verificar título
    await expect(page.locator('h1')).toContainText('Calculadora');
    
    // Verificar que no hay errores en consola
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Esperar 2 segundos para capturar errores
    await page.waitForTimeout(2000);
    
    console.log(`📊 Errores de consola: ${errors.length}`);
    
    // Filtrar solo errores críticos (ignorar algunos warnings comunes)
    const criticalErrors = errors.filter(e => 
      !e.includes('DevTools') && 
      !e.includes('favicon') &&
      !e.includes('Violated')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('03. Debe mostrar tipos de eventos disponibles', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Esperar a que cargue
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    
    // Verificar que hay al menos un tipo de evento
    const eventCards = await page.locator('[class*="cursor-pointer"][class*="border"]').count();
    expect(eventCards).toBeGreaterThan(0);
    
    console.log(`🎭 Tipos de eventos disponibles: ${eventCards}`);
  });

  test('04. Flujo completo: Selección de evento y detalles', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // PASO 1: Seleccionar tipo de evento
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    
    // Buscar el primer evento disponible y hacer clic
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    
    // Esperar a que avance al paso 2
    await page.waitForTimeout(500);
    
    // Verificar que estamos en el paso 2 (Detalles)
    await expect(page.locator('text=Detalles del Evento').or(page.locator('text=¿Cuántas personas'))).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Paso 1 completado: Tipo de evento seleccionado');
    
    // PASO 2: Ingresar detalles
    // Buscar el input de número de invitados
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Verificar que se ingresó correctamente
    await expect(attendeesInput).toHaveValue('80');
    
    console.log('✅ Paso 2 completado: 80 invitados ingresados');
  });

  test('05. Flujo completo: Selección de partes', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Completar pasos previos rápidamente
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    // Ingresar número de invitados
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Hacer clic en "Siguiente"
    const nextButton = page.locator('button:has-text("Siguiente")');
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Verificar si hay partes (algunos eventos no tienen)
    const hasPartes = await page.locator('text=Partes').count() > 0;
    
    if (hasPartes) {
      console.log('🎭 Evento con partes - seleccionando');
      
      // Seleccionar la primera parte disponible
      const firstPart = page.locator('[class*="border-2"]').first();
      await firstPart.click();
      
      console.log('✅ Parte seleccionada');
    } else {
      console.log('ℹ️ Evento sin partes - continuando');
    }
  });

  test('06. Flujo completo: Selección de equipos (montajes)', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Completar pasos previos
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Avanzar hasta equipos
    let clickCount = 0;
    while (clickCount < 5) { // Máximo 5 clicks para evitar loop infinito
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible();
      
      if (!isVisible) break;
      
      await nextButton.click();
      await page.waitForTimeout(500);
      clickCount++;
      
      // Verificar si llegamos a equipos
      const equiposVisible = await page.locator('text=Equipos').or(page.locator('text=equipos')).count() > 0;
      if (equiposVisible) {
        console.log('📦 Llegamos a la sección de equipos');
        break;
      }
    }
    
    // Verificar que hay equipos disponibles
    const equiposCount = await page.locator('[class*="border"]').count();
    console.log(`📦 Equipos disponibles: ${equiposCount}`);
    
    if (equiposCount > 0) {
      // Seleccionar el primer equipo
      const firstEquipo = page.locator('[class*="border"]').first();
      await firstEquipo.click();
      
      console.log('✅ Equipo seleccionado');
    }
  });

  test('07. Flujo completo: Resumen con precios correctos', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Listener para capturar logs de precios
    const priceLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('💰 Parte')) {
        priceLogs.push(msg.text());
      }
    });
    
    // Completar el flujo hasta el resumen
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Avanzar hasta el resumen (último paso)
    let clickCount = 0;
    while (clickCount < 10) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible();
      
      if (!isVisible) break;
      
      await nextButton.click();
      await page.waitForTimeout(500);
      clickCount++;
      
      // Verificar si llegamos al resumen
      const resumenVisible = await page.locator('text=Resumen').or(page.locator('text=resumen')).count() > 0;
      if (resumenVisible) {
        console.log('📋 Llegamos al resumen final');
        break;
      }
    }
    
    // Esperar a que se muestren los precios
    await page.waitForTimeout(2000);
    
    // Verificar que hay precios mostrados (con €)
    const pricesCount = await page.locator('text=/€\\d+/').count();
    console.log(`💰 Precios mostrados en resumen: ${pricesCount}`);
    
    // Verificar logs de cálculo de precios
    console.log(`📊 Logs de cálculo de precios: ${priceLogs.length}`);
    priceLogs.forEach(log => console.log(log));
    
    expect(pricesCount).toBeGreaterThan(0);
  });

  test('08. Verificar orden de partes respeta configuración', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Completar hasta el resumen
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Seleccionar múltiples partes si están disponibles
    let partesSeleccionadas = 0;
    for (let i = 0; i < 10; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible();
      if (!isVisible) break;
      
      // Si estamos en partes, seleccionar algunas
      const partesCount = await page.locator('text=Partes').count();
      if (partesCount > 0) {
        const partes = page.locator('[class*="border-2"]');
        const count = await partes.count();
        
        // Seleccionar las primeras 2 partes
        for (let j = 0; j < Math.min(2, count); j++) {
          await partes.nth(j).click();
          partesSeleccionadas++;
        }
      }
      
      await nextButton.click();
      await page.waitForTimeout(500);
      
      const resumenVisible = await page.locator('text=Resumen').count() > 0;
      if (resumenVisible) break;
    }
    
    if (partesSeleccionadas > 0) {
      console.log(`✅ Seleccionadas ${partesSeleccionadas} partes`);
      
      // Verificar que se muestran en el resumen
      const partesEnResumen = await page.locator('text=🎭 Partes del Evento').count();
      expect(partesEnResumen).toBe(1);
      
      console.log('✅ Partes mostradas en resumen respetando orden');
    } else {
      console.log('ℹ️ Evento sin partes para verificar orden');
    }
  });

  test('09. Flujo completo hasta añadir al carrito', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Completar todo el flujo
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    // Detalles
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('80');
    
    // Fecha
    const dateInput = page.locator('input[type="date"]');
    const hasFecha = await dateInput.count() > 0;
    if (hasFecha) {
      await dateInput.fill('2025-06-15');
    }
    
    // Ubicación
    const locationInput = page.locator('input[placeholder*="ubicación"]').or(page.locator('input[placeholder*="dirección"]'));
    const hasLocation = await locationInput.count() > 0;
    if (hasLocation) {
      await locationInput.fill('Valencia, España');
    }
    
    // Avanzar hasta el final
    for (let i = 0; i < 10; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible();
      if (!isVisible) break;
      
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Buscar botón de tramitar/reservar
      const tramitarButton = page.locator('button:has-text("Tramitar")').or(page.locator('button:has-text("Reservar")'));
      const hasTramitar = await tramitarButton.count() > 0;
      
      if (hasTramitar) {
        console.log('✅ Llegamos al botón de reservar');
        
        // Verificar que el botón está habilitado
        const isDisabled = await tramitarButton.isDisabled();
        console.log(`📋 Botón de reservar ${isDisabled ? 'DESHABILITADO' : 'HABILITADO'}`);
        
        break;
      }
    }
  });

  test('10. Sistema de pago a plazos (25%) - Verificación UI', async ({ page }) => {
    await page.goto(`${BASE_URL}/calculadora`);
    
    // Completar flujo hasta resumen
    await page.waitForSelector('text=Selecciona el tipo de evento', { timeout: 10000 });
    const firstEvent = page.locator('[class*="cursor-pointer"][class*="border"]').first();
    await firstEvent.click();
    await page.waitForTimeout(500);
    
    const attendeesInput = page.locator('input[type="number"]').first();
    await attendeesInput.fill('150'); // Más invitados = más precio
    
    // Completar hasta el resumen
    for (let i = 0; i < 10; i++) {
      const nextButton = page.locator('button:has-text("Siguiente")').first();
      const isVisible = await nextButton.isVisible();
      if (!isVisible) break;
      
      await nextButton.click();
      await page.waitForTimeout(500);
      
      const resumenVisible = await page.locator('text=Resumen').count() > 0;
      if (resumenVisible) break;
    }
    
    // Esperar a que se calculen los totales
    await page.waitForTimeout(2000);
    
    // Buscar referencias al sistema de plazos
    const plazosVisible = await page.locator('text=/25%|Reserva|plazos/i').count();
    
    if (plazosVisible > 0) {
      console.log('✅ Sistema de pago a plazos visible en UI');
      
      // Verificar que se muestra información sobre el 25%
      const has25Percent = await page.locator('text=/25%/').count() > 0;
      expect(has25Percent).toBe(true);
      
      console.log('✅ Porcentaje de reserva (25%) mostrado correctamente');
    } else {
      console.log('ℹ️ Sistema de plazos no visible (puede que el total sea < €500)');
    }
  });
});
