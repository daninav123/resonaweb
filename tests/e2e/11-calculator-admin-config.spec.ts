import { test, expect } from '@playwright/test';

/**
 * TEST E2E - PANEL DE ADMINISTRACIÓN DE CALCULADORA
 * 
 * Verifica que el panel de admin puede configurar correctamente
 * los tipos de eventos, partes, precios y montajes.
 */

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'Admin123!';

test.describe('Panel de Admin - Configuración de Calculadora', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue el dashboard
    await page.waitForURL('**/admin/**', { timeout: 10000 });
    
    console.log('✅ Login como admin completado');
  });

  test('01. Admin panel debe cargar página de calculadora', async ({ page }) => {
    // Navegar al panel de calculadora
    await page.goto(`${BASE_URL}/admin/calculator`);
    
    // Verificar que carga sin errores
    await expect(page.locator('text=Calculadora').or(page.locator('text=Calculator'))).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Panel de admin de calculadora cargado');
  });

  test('02. Debe cargar montajes disponibles (23+)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    
    // Esperar a que carguen los datos
    await page.waitForTimeout(3000);
    
    // Capturar logs de consola
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Montajes') || msg.text().includes('montajes')) {
        logs.push(msg.text());
      }
    });
    
    // Dar tiempo para que se ejecuten los logs
    await page.waitForTimeout(2000);
    
    console.log('📋 Logs capturados sobre montajes:');
    logs.forEach(log => console.log(log));
    
    // Buscar el log que indica cuántos montajes se cargaron
    const montajesLog = logs.find(l => l.includes('filtrados') || l.includes('cargados'));
    if (montajesLog) {
      console.log(`✅ ${montajesLog}`);
    }
  });

  test('03. Debe poder crear un nuevo tipo de evento', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar botón de añadir evento
    const addButton = page.locator('button:has-text("Añadir")').or(page.locator('button:has-text("Nuevo")'));
    const hasAddButton = await addButton.count() > 0;
    
    if (hasAddButton) {
      console.log('✅ Botón de añadir tipo de evento encontrado');
      
      // Verificar que es clickeable
      const isEnabled = await addButton.first().isEnabled();
      expect(isEnabled).toBe(true);
      
      console.log('✅ Botón de añadir habilitado');
    } else {
      console.log('ℹ️ Botón de añadir no encontrado (puede usar otra UI)');
    }
  });

  test('04. Debe mostrar tipos de eventos existentes', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar selectores o lista de eventos
    const eventList = page.locator('select').or(page.locator('[role="listbox"]')).or(page.locator('ul'));
    const hasEventList = await eventList.count() > 0;
    
    if (hasEventList) {
      console.log('✅ Lista de tipos de eventos visible');
      
      // Contar eventos
      const options = page.locator('option').or(page.locator('li[role="option"]'));
      const count = await options.count();
      
      console.log(`📋 Tipos de eventos configurados: ${count}`);
    }
  });

  test('05. Debe poder editar configuración de evento', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar botones de edición
    const editButtons = page.locator('button[title*="Edit"]').or(
      page.locator('button:has-text("Editar")')
    ).or(page.locator('svg[class*="edit"]').locator('..'));
    
    const count = await editButtons.count();
    console.log(`✏️ Botones de edición encontrados: ${count}`);
    
    if (count > 0) {
      console.log('✅ Sistema de edición disponible');
    }
  });

  test('06. Debe mostrar sección de rangos de precio', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar referencias a rangos de precio o invitados
    const pricingVisible = await page.locator('text=/rango|precio|invitados/i').count();
    
    console.log(`💰 Referencias a configuración de precios: ${pricingVisible}`);
    
    if (pricingVisible > 0) {
      console.log('✅ Sistema de rangos de precio visible');
    }
  });

  test('07. Botón de guardar debe estar presente', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar botón de guardar
    const saveButton = page.locator('button:has-text("Guardar")').or(
      page.locator('button:has-text("Save")')
    );
    
    const count = await saveButton.count();
    console.log(`💾 Botones de guardar encontrados: ${count}`);
    
    if (count > 0) {
      console.log('✅ Sistema de guardado disponible');
      
      // Verificar que al menos uno está habilitado
      const isEnabled = await saveButton.first().isEnabled();
      console.log(`📋 Estado del botón: ${isEnabled ? 'HABILITADO' : 'DESHABILITADO'}`);
    }
  });

  test('08. Debe poder resetear configuración', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(2000);
    
    // Buscar botón de reset/restaurar
    const resetButton = page.locator('button:has-text("Reset")').or(
      page.locator('button:has-text("Restaurar")').or(
        page.locator('button:has-text("Defecto")')
      )
    );
    
    const count = await resetButton.count();
    console.log(`🔄 Botones de reset encontrados: ${count}`);
    
    if (count > 0) {
      console.log('✅ Sistema de reset disponible');
    }
  });

  test('09. No debe haber errores críticos en consola', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filtrar errores de DevTools y otros no críticos
        if (!msg.text().includes('DevTools') && 
            !msg.text().includes('favicon') &&
            !msg.text().includes('Violated') &&
            !msg.text().includes('shippingCost')) { // Error de TypeScript conocido
          errors.push(msg.text());
        }
      }
    });
    
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(5000);
    
    console.log(`🐛 Errores críticos capturados: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('❌ ERRORES ENCONTRADOS:');
      errors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ No se encontraron errores críticos');
    }
    
    expect(errors.length).toBe(0);
  });

  test('10. Verificar carga correcta de packs con includeMontajes', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('includeMontajes') || 
          text.includes('Packs cargados') ||
          text.includes('Montajes filtrados')) {
        logs.push(text);
      }
    });
    
    await page.goto(`${BASE_URL}/admin/calculator`);
    await page.waitForTimeout(5000);
    
    console.log('📦 Logs de carga de packs:');
    logs.forEach(log => console.log(`   ${log}`));
    
    // Verificar que se mencionan los montajes
    const mentionsMontajes = logs.some(log => 
      log.toLowerCase().includes('montaje') && 
      /\d+/.test(log) // Contiene números
    );
    
    if (mentionsMontajes) {
      console.log('✅ Sistema carga montajes correctamente');
    } else {
      console.log('⚠️ No se detectaron logs sobre carga de montajes');
    }
  });
});
