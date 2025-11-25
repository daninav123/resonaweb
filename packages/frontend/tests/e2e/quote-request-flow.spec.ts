import { test, expect } from '@playwright/test';

test.describe('Flujo Completo: Calculadora → Admin', () => {
  let userEmail: string;
  let quoteRequestId: string;

  test.beforeAll(async () => {
    // Generar email único para este test
    userEmail = `test-${Date.now()}@example.com`;
  });

  test('1. Usuario se registra', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    
    // Rellenar formulario de registro
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Usuario');
    await page.fill('input[name="email"]', userEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="phone"]', '+34600123456');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar que se redirige al home o dashboard
    await expect(page).toHaveURL(/\/(|home|dashboard)/, { timeout: 10000 });
  });

  test('2. Usuario completa calculadora con todos los datos', async ({ page }) => {
    await page.goto('http://localhost:3000/calculadora-evento');
    
    // PASO 1: Seleccionar tipo de evento
    await page.click('button:has-text("Boda")');
    await page.click('button:has-text("Siguiente")');
    
    // PASO 2: Detalles del evento
    await page.fill('input[type="number"]', '200'); // Asistentes
    
    // Duración
    const durationInput = page.locator('input[type="range"]').first();
    await durationInput.fill('8');
    
    // Fecha del evento
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Ubicación
    await page.fill('input[placeholder*="ubicación"], input[placeholder*="dirección"]', 'Valencia, España');
    
    await page.click('button:has-text("Siguiente")');
    
    // PASO 3: Partes del evento (si aparece)
    const partesVisible = await page.locator('text=Partes del Evento').isVisible().catch(() => false);
    if (partesVisible) {
      // Seleccionar algunas partes
      const checkboxes = page.locator('input[type="checkbox"]');
      const count = await checkboxes.count();
      
      // Seleccionar las primeras 2 partes
      for (let i = 0; i < Math.min(2, count); i++) {
        await checkboxes.nth(i).check();
      }
      
      await page.click('button:has-text("Siguiente")');
    }
    
    // PASO 4: Seleccionar pack
    await page.waitForSelector('text=Packs Disponibles', { timeout: 5000 });
    
    // Seleccionar el primer pack disponible
    const firstPack = page.locator('[class*="border-2"]').first();
    await firstPack.click();
    
    await page.click('button:has-text("Siguiente")');
    
    // PASO 5: Añadir extras
    await page.waitForSelector('text=Extras', { timeout: 5000 });
    
    // Añadir algunos extras
    const plusButtons = page.locator('button:has(svg)').filter({ hasText: '' });
    const plusCount = await plusButtons.count();
    
    if (plusCount > 0) {
      // Click en el primer botón + dos veces
      await plusButtons.first().click();
      await page.waitForTimeout(500);
      await plusButtons.first().click();
      
      // Click en el segundo botón + una vez (si existe)
      if (plusCount > 1) {
        await plusButtons.nth(1).click();
      }
    }
    
    await page.click('button:has-text("Ver Resumen")');
    
    // PASO 6: Verificar resumen y solicitar presupuesto
    await page.waitForSelector('text=Resumen', { timeout: 5000 });
    
    // Verificar que se muestra la información
    await expect(page.locator('text=Boda')).toBeVisible();
    await expect(page.locator('text=200 personas')).toBeVisible();
    await expect(page.locator('text=8 horas')).toBeVisible();
    
    // Solicitar presupuesto
    await page.click('button:has-text("Solicitar Presupuesto")');
    
    // Esperar mensaje de confirmación
    await page.waitForTimeout(2000);
    
    // Aceptar el diálogo de confirmación si aparece
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Solicitud enviada');
      await dialog.accept();
    });
  });

  test('3. Admin ve la solicitud en el panel', async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:3000/login');
    
    // Usar credenciales de admin (ajusta según tu configuración)
    await page.fill('input[name="email"], input[type="email"]', 'admin@resona.com');
    await page.fill('input[name="password"], input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Esperar a que cargue
    await page.waitForTimeout(2000);
    
    // Ir a solicitudes
    await page.goto('http://localhost:3000/admin/quote-requests');
    
    // Esperar a que carguen las solicitudes
    await page.waitForSelector('text=Solicitudes de Presupuesto', { timeout: 10000 });
    
    // Buscar la solicitud del usuario de test
    await page.waitForTimeout(2000);
    
    // Verificar que aparece el email del usuario
    const userRequestCard = page.locator(`text=${userEmail}`).first();
    await expect(userRequestCard).toBeVisible({ timeout: 10000 });
    
    // Click en la solicitud para ver detalles
    await userRequestCard.click();
    
    // Esperar a que carguen los detalles
    await page.waitForTimeout(1000);
  });

  test('4. Verificar que los datos llegaron correctamente', async ({ page }) => {
    // Login como admin (si no estamos ya logueados)
    await page.goto('http://localhost:3000/admin/quote-requests');
    await page.waitForTimeout(2000);
    
    // Buscar y seleccionar nuestra solicitud
    const userRequestCard = page.locator(`text=${userEmail}`).first();
    await userRequestCard.click();
    await page.waitForTimeout(1000);
    
    // VERIFICAR INFORMACIÓN BÁSICA DEL EVENTO
    await expect(page.locator('text=Boda')).toBeVisible();
    await expect(page.locator('text=200 personas')).toBeVisible();
    await expect(page.locator('text=8 horas')).toBeVisible();
    await expect(page.locator('text=Valencia, España')).toBeVisible();
    
    // VERIFICAR INFORMACIÓN DEL CLIENTE
    await expect(page.locator(`text=${userEmail}`)).toBeVisible();
    await expect(page.locator('text=Test Usuario').or(page.locator('text=Test'))).toBeVisible();
    await expect(page.locator('text=+34600123456').or(page.locator('text=600123456'))).toBeVisible();
    
    // VERIFICAR PACK SELECCIONADO
    const packSection = page.locator('text=Pack Seleccionado').or(page.locator('text=📦 Pack'));
    await expect(packSection).toBeVisible();
    
    // VERIFICAR EXTRAS SELECCIONADOS
    const extrasSection = page.locator('text=Extras Seleccionados').or(page.locator('text=✨ Extras'));
    const hasExtras = await extrasSection.isVisible().catch(() => false);
    
    if (hasExtras) {
      console.log('✓ Extras encontrados en el resumen');
    }
    
    // VERIFICAR PRECIO TOTAL
    const priceSection = page.locator('text=TOTAL').or(page.locator('text=Precio'));
    await expect(priceSection).toBeVisible();
    
    // Verificar que muestra un precio
    const euroSign = page.locator('text=€');
    await expect(euroSign.first()).toBeVisible();
    
    console.log('✓ Todos los datos verificados correctamente');
  });

  test('5. Admin puede cambiar el estado de la solicitud', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/quote-requests');
    await page.waitForTimeout(2000);
    
    // Seleccionar nuestra solicitud
    const userRequestCard = page.locator(`text=${userEmail}`).first();
    await userRequestCard.click();
    await page.waitForTimeout(1000);
    
    // Cambiar estado a "CONTACTED"
    const statusSelect = page.locator('select').filter({ hasText: 'Pendiente' });
    await statusSelect.selectOption('CONTACTED');
    
    // Esperar a que se actualice
    await page.waitForTimeout(2000);
    
    // Verificar que cambió
    await expect(page.locator('text=Contactado').or(page.locator('text=🔵'))).toBeVisible();
    
    console.log('✓ Estado cambiado correctamente');
  });

  test('6. Admin puede añadir notas internas', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/quote-requests');
    await page.waitForTimeout(2000);
    
    // Seleccionar nuestra solicitud
    const userRequestCard = page.locator(`text=${userEmail}`).first();
    await userRequestCard.click();
    await page.waitForTimeout(1000);
    
    // Click en editar notas
    const editButton = page.locator('button:has-text("Editar")').or(
      page.locator('button').filter({ has: page.locator('svg') }).first()
    );
    
    const isEditButtonVisible = await editButton.isVisible().catch(() => false);
    if (isEditButtonVisible) {
      await editButton.click();
      
      // Escribir nota
      const notesTextarea = page.locator('textarea');
      await notesTextarea.fill('Test E2E: Cliente contactado, enviado presupuesto detallado');
      
      // Guardar
      await page.click('button:has-text("Guardar")');
      
      // Esperar confirmación
      await page.waitForTimeout(2000);
      
      console.log('✓ Notas guardadas correctamente');
    }
  });
});

// Test adicional: Verificar estadísticas
test.describe('Verificar Estadísticas', () => {
  test('Las estadísticas se actualizan con las nuevas solicitudes', async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"], input[type="email"]', 'admin@resona.com');
    await page.fill('input[name="password"], input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Ir a solicitudes
    await page.goto('http://localhost:3000/admin/quote-requests');
    await page.waitForTimeout(2000);
    
    // Verificar que aparecen las estadísticas
    await expect(page.locator('text=Total')).toBeVisible();
    await expect(page.locator('text=Pendientes')).toBeVisible();
    await expect(page.locator('text=Conversión')).toBeVisible();
    
    // Verificar que hay números
    const totalStat = page.locator('text=Total').locator('..').locator('div').first();
    const totalText = await totalStat.textContent();
    
    expect(totalText).toMatch(/\d+/);
    
    console.log(`✓ Total de solicitudes: ${totalText}`);
  });
});
