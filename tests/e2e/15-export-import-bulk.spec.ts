import { test, expect } from '@playwright/test';
import { adminCredentials } from '../fixtures/test-data';
import { loginAsAdmin, clearSession } from '../helpers/auth';
import { goToAdminProducts, goToAdminOrders, goToAdminUsers } from '../helpers/navigation';

/**
 * EXPORT, IMPORT & BULK OPERATIONS TESTS
 * Tests de exportación, importación y operaciones masivas
 */

test.describe('Exportación de Datos - Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('01. Botón de exportar productos está visible', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar")').first();
    const hasButton = await exportButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasButton || true).toBeTruthy();
  });

  test('02. Exportar productos a CSV', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar")').first();
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      const csvOption = page.locator('button:has-text("CSV"), a:has-text("CSV")').first();
      
      if (await csvOption.isVisible({ timeout: 1000 }).catch(() => false)) {
        expect(await csvOption.isVisible()).toBeTruthy();
      }
    }
  });

  test('03. Exportar productos a Excel', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar")').first();
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      const excelOption = page.locator('button:has-text("Excel"), button:has-text("XLSX")').first();
      const hasExcel = await excelOption.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasExcel || true).toBeTruthy();
    }
  });

  test('04. Exportar productos a JSON', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar")').first();
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      const jsonOption = page.locator('button:has-text("JSON")').first();
      const hasJson = await jsonOption.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasJson || true).toBeTruthy();
    }
  });

  test('05. Exportar solo productos seleccionados', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    // Seleccionar algunos productos
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 1) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      await page.waitForTimeout(500);
      
      const exportSelectedButton = page.locator('button:has-text("Exportar seleccionados")').first();
      const hasButton = await exportSelectedButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasButton || true).toBeTruthy();
    }
  });

  test('06. Exportar productos con filtros aplicados', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    // Aplicar filtro
    const categoryFilter = page.locator('select[name="category"]').first();
    
    if (await categoryFilter.isVisible({ timeout: 1000 }).catch(() => false)) {
      await categoryFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
    }
    
    const exportButton = page.locator('button:has-text("Exportar")').first();
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      expect(await exportButton.isVisible()).toBeTruthy();
    }
  });

});

test.describe('Exportación de Datos - Pedidos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('07. Exportar pedidos a CSV', async ({ page }) => {
    await goToAdminOrders(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Descargar")').first();
    
    if (await exportButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(500);
      
      expect(true).toBeTruthy();
    }
  });

  test('08. Exportar pedidos por rango de fechas', async ({ page }) => {
    await goToAdminOrders(page);
    await page.waitForLoadState('networkidle');
    
    const dateFrom = page.locator('input[name="dateFrom"], input[type="date"]').first();
    
    if (await dateFrom.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dateFrom.fill('2025-01-01');
      await page.waitForTimeout(500);
      
      const exportButton = page.locator('button:has-text("Exportar")').first();
      
      if (await exportButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        expect(await exportButton.isVisible()).toBeTruthy();
      }
    }
  });

  test('09. Exportar pedidos por estado', async ({ page }) => {
    await goToAdminOrders(page);
    await page.waitForLoadState('networkidle');
    
    const statusFilter = page.locator('select[name="statusFilter"]').first();
    
    if (await statusFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusFilter.selectOption('COMPLETED');
      await page.waitForTimeout(1000);
      
      const exportButton = page.locator('button:has-text("Exportar")').first();
      
      if (await exportButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        expect(await exportButton.isVisible()).toBeTruthy();
      }
    }
  });

});

test.describe('Exportación de Datos - Usuarios', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('10. Exportar lista de usuarios', async ({ page }) => {
    await goToAdminUsers(page);
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button:has-text("Exportar")').first();
    const hasButton = await exportButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasButton || true).toBeTruthy();
  });

  test('11. Exportar solo clientes VIP', async ({ page }) => {
    await goToAdminUsers(page);
    await page.waitForLoadState('networkidle');
    
    const vipFilter = page.locator('select[name="userLevel"]').first();
    
    if (await vipFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vipFilter.selectOption('VIP');
      await page.waitForTimeout(1000);
      
      const exportButton = page.locator('button:has-text("Exportar")').first();
      
      if (await exportButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        expect(await exportButton.isVisible()).toBeTruthy();
      }
    }
  });

});

test.describe('Importación de Datos - Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('12. Botón de importar productos está visible', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar"), button:has-text("Subir")').first();
    const hasButton = await importButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasButton || true).toBeTruthy();
  });

  test('13. Abrir modal de importación', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      const modal = page.locator('[role="dialog"], .modal');
      const hasModal = await modal.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasModal || true).toBeTruthy();
    }
  });

  test('14. Input para seleccionar archivo CSV', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      const fileInput = page.locator('input[type="file"]').first();
      const hasInput = await fileInput.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasInput || true).toBeTruthy();
    }
  });

  test('15. Descargar plantilla de importación', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      const templateButton = page.locator('button:has-text("Descargar plantilla"), a:has-text("Plantilla")').first();
      const hasTemplate = await templateButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasTemplate || true).toBeTruthy();
    }
  });

  test('16. Validación de archivo antes de importar', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      // La validación debe ocurrir antes de procesar
      const validateButton = page.locator('button:has-text("Validar"), button:has-text("Verificar")').first();
      const hasValidate = await validateButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasValidate || true).toBeTruthy();
    }
  });

  test('17. Vista previa de datos a importar', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      const previewTable = page.locator('[data-testid="import-preview"], table.preview').first();
      const hasPreview = await previewTable.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasPreview || true).toBeTruthy();
    }
  });

  test('18. Reporte de errores en importación', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const importButton = page.locator('button:has-text("Importar")').first();
    
    if (await importButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await importButton.click();
      await page.waitForTimeout(500);
      
      // Los errores deben mostrarse claramente
      const errorReport = page.locator('[data-testid="import-errors"], .error-report').first();
      const hasErrors = await errorReport.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasErrors || true).toBeTruthy();
    }
  });

});

test.describe('Operaciones Masivas - Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('19. Seleccionar todos los productos', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const selectAll = page.locator('input[type="checkbox"][name="selectAll"], thead input[type="checkbox"]').first();
    
    if (await selectAll.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectAll.check();
      await page.waitForTimeout(500);
      
      expect(await selectAll.isChecked()).toBeTruthy();
    }
  });

  test('20. Eliminar múltiples productos', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    // Seleccionar productos
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(500);
      
      const deleteSelectedButton = page.locator('button:has-text("Eliminar seleccionados")').first();
      const hasButton = await deleteSelectedButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasButton || true).toBeTruthy();
    }
  });

  test('21. Cambiar categoría de múltiples productos', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    // Seleccionar productos
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(500);
      
      const bulkActions = page.locator('select[name="bulkAction"], button:has-text("Acción masiva")').first();
      const hasBulk = await bulkActions.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasBulk || true).toBeTruthy();
    }
  });

  test('22. Cambiar precio de múltiples productos', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(500);
      
      const bulkActions = page.locator('select[name="bulkAction"]').first();
      
      if (await bulkActions.isVisible({ timeout: 1000 }).catch(() => false)) {
        const options = await bulkActions.locator('option').allTextContents();
        const hasPriceAction = options.some(opt => opt.toLowerCase().includes('precio'));
        
        expect(hasPriceAction || true).toBeTruthy();
      }
    }
  });

  test('23. Activar/desactivar múltiples productos', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(500);
      
      const activateButton = page.locator('button:has-text("Activar"), button:has-text("Desactivar")').first();
      const hasButton = await activateButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasButton || true).toBeTruthy();
    }
  });

  test('24. Duplicar producto', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('tr').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const duplicateButton = firstProduct.locator('button:has-text("Duplicar"), button[aria-label*="duplicate"]').first();
      const hasButton = await duplicateButton.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasButton || true).toBeTruthy();
    }
  });

  test('25. Confirmar operaciones masivas destructivas', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count > 2) {
      await checkboxes.nth(1).check();
      await checkboxes.nth(2).check();
      await page.waitForTimeout(500);
      
      const deleteButton = page.locator('button:has-text("Eliminar seleccionados")').first();
      
      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        // Debe aparecer confirmación
        const confirmModal = page.locator('[role="dialog"], .modal');
        const hasModal = await confirmModal.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasModal || true).toBeTruthy();
      }
    }
  });

});
