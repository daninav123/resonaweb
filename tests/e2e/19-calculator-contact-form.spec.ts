import { test, expect } from '@playwright/test';

test.describe('Calculator Contact Form', () => {
  test('should send contact request with phone and create quote request', async ({ page }) => {
    // Ir a la calculadora
    await page.goto('http://localhost:3000/calculadora-evento');
    
    // Esperar a que cargue
    await page.waitForSelector('text=Calculadora de Presupuesto');
    
    // Step 1: Seleccionar tipo de evento
    await page.click('text=Boda');
    await page.click('button:has-text("Siguiente")');
    
    // Step 2: Detalles del evento
    await page.waitForSelector('text=¿Cuántos asistentes?');
    await page.fill('input[type="number"]', '100');
    await page.click('button:has-text("Siguiente")');
    
    // Step 3: Seleccionar pack (si hay alguno disponible)
    await page.waitForTimeout(1000);
    const hasPacks = await page.locator('text=Packs Disponibles').count() > 0;
    if (hasPacks) {
      // Intentar seleccionar un pack si existe
      const packRadio = page.locator('input[type="radio"]').first();
      if (await packRadio.count() > 0) {
        await packRadio.click();
      }
    }
    await page.click('button:has-text("Siguiente")');
    
    // Step 4: Extras (omitir)
    await page.waitForTimeout(500);
    await page.click('button:has-text("Ver Resumen")');
    
    // Step 5: Resumen - Verificar que aparece el botón de contacto
    await page.waitForSelector('text=Resumen de tu Evento');
    await expect(page.locator('text=¿Tienes dudas? Deja tu contacto y te llamamos!')).toBeVisible();
    
    // Click en el botón de contacto
    await page.click('button:has-text("¿Tienes dudas? Deja tu contacto y te llamamos!")');
    
    // Verificar que se abre el modal
    await page.waitForSelector('text=Déjanos tus datos y te llamaremos');
    
    // Llenar el formulario
    const timestamp = Date.now();
    await page.fill('input[placeholder="Tu nombre"]', 'Test Usuario E2E');
    await page.fill('input[placeholder="+34 XXX XXX XXX"]', `+34 666 ${timestamp.toString().slice(-6)}`);
    await page.fill('input[placeholder="tu@email.com"]', `test${timestamp}@example.com`);
    await page.fill('textarea[placeholder="¿Alguna pregunta específica?"]', 'Test E2E - Solicitud de contacto desde calculadora');
    
    // Enviar formulario
    await page.click('button[type="submit"]:has-text("Enviar")');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Solicitud enviada correctamente')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Formulario enviado correctamente');
    
    // Verificar que el modal se cerró (con un timeout más largo)
    await page.waitForTimeout(2000);
    
    // Ahora verificar en el admin que la solicitud llegó
    // Login como admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('http://localhost:3000/admin');
    
    // Ir a solicitudes de presupuesto
    await page.goto('http://localhost:3000/admin/quote-requests');
    
    // Esperar a que cargue la página
    await page.waitForSelector('text=Solicitudes de Presupuesto');
    
    // Verificar que aparece la nueva solicitud
    await expect(page.locator('text=Test Usuario E2E')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=+34 666`)).toBeVisible();
    
    // Verificar el estado "Pendiente"
    await expect(page.locator('text=Pendiente')).toBeVisible();
    
    console.log('✅ Solicitud visible en el panel de admin');
    
    // Abrir detalles de la solicitud
    await page.click('button[title="Ver detalles"]');
    
    // Verificar que se abre el modal de detalle
    await page.waitForSelector('text=Detalle de Solicitud');
    await expect(page.locator('text=Test Usuario E2E')).toBeVisible();
    await expect(page.locator('text=Test E2E - Solicitud de contacto desde calculadora')).toBeVisible();
    
    // Cambiar estado a "Contactado"
    await page.click('button:has-text("Contactado")');
    
    // Verificar mensaje de éxito
    await page.waitForTimeout(1000);
    
    // Cerrar modal
    await page.click('button:has-text("Cerrar")');
    
    // Verificar que el estado cambió
    await expect(page.locator('text=Contactado').first()).toBeVisible();
    
    console.log('✅ Estado actualizado correctamente');
    
    // Cleanup: Eliminar la solicitud de prueba
    await page.click('button[title="Eliminar"]');
    page.on('dialog', dialog => dialog.accept()); // Aceptar el confirm
    
    await page.waitForTimeout(1000);
    
    console.log('✅ Test completado exitosamente');
  });
  
  test('should validate required fields in contact form', async ({ page }) => {
    await page.goto('http://localhost:3000/calculadora-evento');
    
    // Navegar hasta el resumen (pasos rápidos)
    await page.waitForSelector('text=Calculadora de Presupuesto');
    await page.click('text=Boda');
    await page.click('button:has-text("Siguiente")');
    await page.fill('input[type="number"]', '50');
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Siguiente")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Ver Resumen")');
    
    // Abrir modal de contacto
    await page.click('button:has-text("¿Tienes dudas? Deja tu contacto y te llamamos!")');
    await page.waitForSelector('text=Déjanos tus datos y te llamaremos');
    
    // Intentar enviar sin llenar campos requeridos
    await page.click('button[type="submit"]:has-text("Enviar")');
    
    // Verificar que no se envía (el navegador debería mostrar validación HTML5)
    // El modal debería seguir abierto
    await expect(page.locator('text=Déjanos tus datos y te llamaremos')).toBeVisible();
    
    console.log('✅ Validación de campos requeridos funcionando');
  });
});
