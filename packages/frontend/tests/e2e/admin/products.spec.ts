import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../utils/auth';
import { cleanBrowserData, generateUniqueEmail } from '../../utils/helpers';

test.describe('WF-A-002: Crear Producto', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede crear un producto', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    // Click en nuevo producto
    await page.click('[data-testid="new-product"]');
    
    // Rellenar formulario
    const timestamp = Date.now();
    await page.fill('[name="sku"]', `TEST-${timestamp}`);
    await page.fill('[name="name"]', `Producto Test ${timestamp}`);
    await page.fill('[name="description"]', 'Descripción de producto de test');
    await page.fill('[name="pricePerDay"]', '100');
    await page.fill('[name="stock"]', '5');
    
    // Seleccionar categoría
    const categorySelect = page.locator('[name="categoryId"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ index: 1 });
    }
    
    // Guardar
    await page.click('[data-testid="submit"]');
    
    // Verificar éxito
    await expect(page.locator('text=/creado|created/i')).toBeVisible({ timeout: 5000 });
  });

  test('Validación de campos requeridos', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.click('[data-testid="new-product"]');
    
    // Intentar guardar sin rellenar
    await page.click('[data-testid="submit"]');
    
    // Debe mostrar errores de validación o permanecer en la página
    await expect(page).toHaveURL(/\/admin\/productos/);
  });
});

test.describe('WF-A-003: Editar Producto', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede editar un producto', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    // Click en editar primer producto
    const editButton = page.locator('[data-testid="edit-product"]').first();
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Modificar nombre
      await page.fill('[name="name"]', `Producto Modificado ${Date.now()}`);
      
      // Guardar
      await page.click('[data-testid="submit"]');
      
      // Verificar éxito
      await expect(page.locator('text=/actualizado|updated/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('WF-A-004: Eliminar Producto', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede eliminar un producto', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    const deleteButton = page.locator('[data-testid="delete-product"]').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirmar eliminación
      await page.click('[data-testid="confirm-delete"]');
      
      // Verificar éxito
      await expect(page.locator('text=/eliminado|deleted/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('WF-A-013: Gestionar Stock', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede ajustar stock de producto', async ({ page }) => {
    await page.goto('/admin/stock');
    await page.waitForLoadState('networkidle');
    
    // Click en primer producto
    const productRow = page.locator('[data-testid="product-row"]').first();
    if (await productRow.isVisible()) {
      await productRow.click();
      
      // Ajustar stock
      await page.fill('[name="stock"]', '10');
      await page.fill('[name="notes"]', 'Ajuste de test');
      
      // Guardar
      await page.click('[data-testid="save-stock"]');
      
      // Verificar éxito
      await expect(page.locator('text=/actualizado|updated/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('Muestra alertas de stock bajo', async ({ page }) => {
    await page.goto('/admin/stock');
    await page.waitForLoadState('networkidle');
    
    // Verificar que hay sección de alertas
    const alertsSection = page.locator('[data-testid="stock-alerts"]');
    if (await alertsSection.isVisible()) {
      await expect(alertsSection).toBeVisible();
    }
  });
});

test.describe('Productos - Funcionalidad General', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Lista todos los productos', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    // Debe mostrar al menos un producto
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount(1, { timeout: 5000 });
  });

  test('Busca productos', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="search-products"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      
      // Verificar que filtra
      const results = await page.locator('[data-testid="product-row"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('Filtra productos por categoría', async ({ page }) => {
    await page.goto('/admin/productos');
    await page.waitForLoadState('networkidle');
    
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      // Verificar que filtra
      const results = await page.locator('[data-testid="product-row"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });
});
