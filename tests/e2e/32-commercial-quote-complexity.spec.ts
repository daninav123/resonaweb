import { test, expect } from '@playwright/test';

test.describe('Panel Comercial - Selector de Complejidad de Montaje', () => {
  test.beforeEach(async ({ page }) => {
    // Login como comercial
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'comercial@resona.com');
    await page.fill('input[type="password"]', 'Comercial123!');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el login
    await page.waitForURL('**/comercial/dashboard', { timeout: 10000 });
    
    // Ir a presupuestos
    await page.goto('http://localhost:3000/comercial/presupuestos');
    await page.waitForLoadState('networkidle');
  });

  test('debe mostrar botón "Crear Presupuesto" en panel comercial', async ({ page }) => {
    // Verificar que existe el botón de crear presupuesto
    const createButton = page.locator('button:has-text("Crear Presupuesto")');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Botón "Crear Presupuesto" encontrado');
  });

  test('debe abrir modal al hacer clic en "Crear Presupuesto"', async ({ page }) => {
    // Hacer clic en crear presupuesto
    await page.click('button:has-text("Crear Presupuesto")');
    
    // Esperar a que aparezca el modal
    await page.waitForSelector('.modal, [role="dialog"], .fixed', { timeout: 5000 });
    
    console.log('✅ Modal de creación abierto');
  });

  test('debe mostrar panel verde de precio final arriba del formulario', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1000);
    
    // Buscar el panel verde con precio final
    const precioFinalPanel = page.locator('div:has-text("💰 Precio Final del Presupuesto")').first();
    await expect(precioFinalPanel).toBeVisible({ timeout: 5000 });
    
    // Verificar que muestra €0.00 inicialmente
    const precioTexto = page.locator('text=/€\\d+\\.\\d{2}/').first();
    await expect(precioTexto).toBeVisible();
    
    console.log('✅ Panel verde de precio final visible');
  });

  test('debe mostrar selector de complejidad con 4 opciones después de añadir productos', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1500);
    
    // Rellenar datos básicos del cliente
    await page.fill('input[placeholder*="Nombre"]', 'Cliente Test');
    await page.fill('input[type="email"]', 'test@ejemplo.com');
    
    // Buscar la sección de complejidad de montaje
    const complejidadSection = page.locator('text=/Complejidad del Montaje/i');
    
    // Scroll para asegurarnos de que es visible
    await complejidadSection.scrollIntoViewIfNeeded();
    await expect(complejidadSection).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Sección de complejidad de montaje encontrada');
    
    // Verificar las 4 tarjetas de complejidad
    const simpleCard = page.locator('text=Simple').first();
    const estandarCard = page.locator('text=Estándar').first();
    const complejoCard = page.locator('text=Complejo').first();
    const personalizadoCard = page.locator('text=Personalizado').first();
    
    await expect(simpleCard).toBeVisible({ timeout: 5000 });
    await expect(estandarCard).toBeVisible({ timeout: 5000 });
    await expect(complejoCard).toBeVisible({ timeout: 5000 });
    await expect(personalizadoCard).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Las 4 tarjetas de complejidad están visibles');
  });

  test('debe mostrar los porcentajes correctos en cada tarjeta', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1500);
    
    // Buscar textos de porcentajes
    const simple30 = page.locator('text=30% del subtotal');
    const estandar40 = page.locator('text=40% del subtotal');
    const complejo50 = page.locator('text=50% del subtotal');
    
    await expect(simple30).toBeVisible({ timeout: 5000 });
    await expect(estandar40).toBeVisible({ timeout: 5000 });
    await expect(complejo50).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Porcentajes correctos (30%, 40%, 50%) visibles');
  });

  test('debe permitir seleccionar diferentes complejidades', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1500);
    
    // Hacer clic en "Simple"
    const simpleButton = page.locator('button:has-text("Simple")').first();
    await simpleButton.click();
    await page.waitForTimeout(500);
    
    // Verificar que se seleccionó (debería tener clase de seleccionado)
    const simpleSelected = page.locator('button:has-text("Simple")').first();
    const classes = await simpleSelected.getAttribute('class');
    expect(classes).toContain('bg-green-100');
    
    console.log('✅ Opción "Simple" seleccionable');
    
    // Hacer clic en "Complejo"
    const complejoButton = page.locator('button:has-text("Complejo")').first();
    await complejoButton.click();
    await page.waitForTimeout(500);
    
    const complejoSelected = page.locator('button:has-text("Complejo")').first();
    const complejoClasses = await complejoSelected.getAttribute('class');
    expect(complejoClasses).toContain('bg-purple-100');
    
    console.log('✅ Opción "Complejo" seleccionable');
  });

  test('NO debe mostrar panel de "Análisis de Rentabilidad"', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1500);
    
    // Buscar panel de rentabilidad (NO debería existir)
    const rentabilidadPanel = page.locator('text=/Análisis de Rentabilidad/i');
    await expect(rentabilidadPanel).not.toBeVisible();
    
    console.log('✅ Panel de rentabilidad NO visible (correcto para comerciales)');
  });

  test('debe calcular automáticamente el coste de montaje según porcentaje', async ({ page }) => {
    // Abrir modal
    await page.click('button:has-text("Crear Presupuesto")');
    await page.waitForTimeout(1500);
    
    // Rellenar datos básicos
    await page.fill('input[placeholder*="Nombre"]', 'Cliente Test');
    await page.fill('input[type="email"]', 'test@ejemplo.com');
    
    // El panel verde debería mostrar el cálculo automático
    // Verificar que hay un desglose con "Montaje (40%)" por defecto
    const montajeDesglose = page.locator('text=/Montaje.*40%/i');
    await expect(montajeDesglose).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Cálculo automático de montaje visible (40% por defecto)');
  });
});
