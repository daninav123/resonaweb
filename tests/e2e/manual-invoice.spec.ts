import { test, expect } from '@playwright/test';

test.describe('🧾 E2E - Factura Manual', () => {
  let adminToken: string;

  test.beforeEach(async ({ page }) => {
    console.log('🔐 Iniciando sesión como admin...');
    
    // Login como admin
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Rellenar formulario
    const emailInput = page.locator('input[type="email"]');
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await emailInput.fill('admin@resona.com');
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('Admin123!');
    
    // Click en submit y esperar respuesta
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Esperar que la URL cambie (éxito) o aparezca un error
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('URL después del login:', currentUrl);
    
    // Si seguimos en /login, el login falló
    if (currentUrl.includes('/login')) {
      console.error('❌ Login falló - aún en página de login');
      await page.screenshot({ path: 'test-results/login-still-on-page.png' });
      
      // Intentar capturar mensaje de error
      const errorMsg = await page.locator('text=/error|inválid/i').textContent().catch(() => 'No error message');
      console.error('Error en página:', errorMsg);
      
      throw new Error(`Login falló: ${errorMsg}`);
    }
    
    console.log('✅ Sesión iniciada - URL cambió a:', currentUrl);
  });

  test('✅ Crear factura manual completa', async ({ page }) => {
    console.log('\n📝 TEST: Crear factura manual completa');
    
    // Ir a crear factura manual
    await page.goto('http://localhost:3000/admin/invoices/manual');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página correcta
    await expect(page.locator('h1:has-text("Crear Factura Manual")')).toBeVisible();
    console.log('✅ Página de factura manual cargada');
    
    // Rellenar datos del cliente
    console.log('📝 Rellenando datos del cliente...');
    
    // Rellenar nombre
    const nameInput = page.locator('label:has-text("Nombre / Empresa")').locator('..').locator('input').first();
    await nameInput.fill('Cliente Test E2E');
    
    // Rellenar email
    const emailInput = page.locator('label:has-text("Email")').locator('..').locator('input[type="email"]').first();
    await emailInput.fill('cliente-test@example.com');
    
    // Rellenar teléfono
    const phoneInput = page.locator('label:has-text("Teléfono")').locator('..').locator('input[type="tel"]');
    await phoneInput.fill('+34 612 345 678');
    
    // Rellenar primer ítem
    console.log('📦 Añadiendo ítem...');
    const descInput = page.locator('input[placeholder*="Alquiler"]').first();
    await descInput.fill('Alquiler equipo sonido - Test E2E');
    
    const quantityInput = page.locator('label:has-text("Cantidad")').locator('..').locator('input[type="number"]').first();
    await quantityInput.fill('2');
    
    const priceInput = page.locator('label:has-text("Precio Unit.")').locator('..').locator('input[type="number"]').first();
    await priceInput.fill('150');
    
    // Fecha del evento
    console.log('📅 Añadiendo fecha...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // IRPF (es un select, no un input)
    console.log('💰 Configurando IRPF...');
    const irpfSelect = page.locator('select').filter({ hasText: 'Sin retención' });
    await irpfSelect.selectOption('15');
    
    // Notas
    const notesTextarea = page.locator('textarea[placeholder*="Información adicional"]');
    await notesTextarea.fill('Factura de prueba E2E');
    
    console.log('✅ Formulario rellenado');
    
    // Esperar un momento para que se calculen los totales
    await page.waitForTimeout(500);
    
    // Verificar que los totales se calculan
    const subtotalElement = await page.locator('text=/Subtotal.*€/').first();
    await expect(subtotalElement).toBeVisible();
    console.log('✅ Totales calculados');
    
    // Hacer screenshot antes de enviar
    await page.screenshot({ path: 'test-results/manual-invoice-before-submit.png' });
    
    // Click en crear factura
    console.log('🚀 Enviando factura...');
    await page.click('button:has-text("Crear Factura")');
    
    // Esperar respuesta (éxito o error)
    await page.waitForTimeout(3000);
    
    // Hacer screenshot después de enviar
    await page.screenshot({ path: 'test-results/manual-invoice-after-submit.png' });
    
    // Verificar mensaje de éxito o capturar error
    const successMessage = page.locator('text=/Factura.*creada.*exitosamente/i');
    const errorMessage = page.locator('text=/error/i').first();
    
    const isSuccess = await successMessage.isVisible({ timeout: 2000 }).catch(() => false);
    const isError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isSuccess) {
      console.log('✅ Factura creada exitosamente');
      
      // Verificar que aparece el número de factura
      const invoiceNumber = page.locator('text=/Factura.*FACT-/');
      await expect(invoiceNumber).toBeVisible({ timeout: 5000 });
      console.log('✅ Número de factura generado');
      
      // Verificar botones de descarga
      await expect(page.locator('button:has-text("Descargar PDF")')).toBeVisible();
      await expect(page.locator('button:has-text("Generar Facturae XML")')).toBeVisible();
      console.log('✅ Botones de acción disponibles');
      
    } else if (isError) {
      console.error('❌ Error al crear factura');
      const errorText = await errorMessage.textContent();
      console.error('Error:', errorText);
      
      // Capturar logs de consola
      const logs = await page.evaluate(() => {
        return (window as any).__consoleLogs || [];
      });
      console.log('Console logs:', logs);
      
      throw new Error(`Error al crear factura: ${errorText}`);
    } else {
      throw new Error('No se pudo determinar el resultado de la creación de factura');
    }
  });

  test('✅ Validación de campos obligatorios', async ({ page }) => {
    console.log('\n🔍 TEST: Validación de campos obligatorios');
    
    await page.goto('http://localhost:3000/admin/invoices/manual');
    await page.waitForLoadState('networkidle');
    
    // Intentar crear sin datos
    const submitButton = page.locator('button:has-text("Crear Factura")');
    await submitButton.click();
    
    // Esperar un momento para que aparezca cualquier validación
    await page.waitForTimeout(1000);
    
    // El formulario HTML5 debería impedir el envío, o debe mostrar un toast
    // Verificar que no se creó la factura (seguimos en el formulario)
    const formIsVisible = await page.locator('h2:has-text("Datos del Cliente")').isVisible();
    expect(formIsVisible).toBe(true);
    
    console.log('✅ Validación de campos obligatorios funciona (form HTML5)');
  });

  test('✅ Añadir múltiples ítems', async ({ page }) => {
    console.log('\n📦 TEST: Añadir múltiples ítems');
    
    await page.goto('http://localhost:3000/admin/invoices/manual');
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay 1 ítem por defecto
    const initialItems = await page.locator('input[placeholder*="Alquiler"]').count();
    expect(initialItems).toBe(1);
    
    // Click en añadir concepto
    await page.click('button:has-text("Añadir Concepto")');
    await page.waitForTimeout(500);
    
    // Verificar que ahora hay 2 ítems
    const newItemsCount = await page.locator('input[placeholder*="Alquiler"]').count();
    expect(newItemsCount).toBe(2);
    console.log('✅ Se pueden añadir múltiples ítems');
    
    // Rellenar segundo ítem
    const secondDescInput = page.locator('input[placeholder*="Alquiler"]').nth(1);
    await secondDescInput.fill('Segundo ítem de prueba');
    
    // Eliminar el segundo ítem (icono de trash)
    const deleteButtons = page.locator('button:has(svg.lucide-trash-2)');
    const deleteCount = await deleteButtons.count();
    if (deleteCount > 0) {
      await deleteButtons.last().click();
      await page.waitForTimeout(500);
      
      const finalItemsCount = await page.locator('input[placeholder*="Alquiler"]').count();
      expect(finalItemsCount).toBe(1);
      console.log('✅ Se pueden eliminar ítems');
    }
  });

  test('✅ Cálculo automático de totales', async ({ page }) => {
    console.log('\n💰 TEST: Cálculo automático de totales');
    
    await page.goto('http://localhost:3000/admin/invoices/manual');
    await page.waitForLoadState('networkidle');
    
    // Rellenar datos básicos del ítem
    const descInput = page.locator('input[placeholder*="Alquiler"]').first();
    await descInput.fill('Producto Test');
    
    const quantityInput = page.locator('label:has-text("Cantidad")').locator('..').locator('input[type="number"]').first();
    await quantityInput.fill('2');
    
    const priceInput = page.locator('label:has-text("Precio Unit.")').locator('..').locator('input[type="number"]').first();
    await priceInput.fill('100');
    
    await page.waitForTimeout(500);
    
    // Verificar que se muestra el total (buscar en el div con font-bold y text-xl)
    const totalRow = page.locator('div').filter({ hasText: /^TOTAL:/ }).filter({ hasNot: page.locator('span:has-text("Subtotal:")') });
    await expect(totalRow.first()).toBeVisible();
    
    console.log('✅ Totales se calculan automáticamente');
  });
});
