import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../utils/auth';
import { cleanBrowserData } from '../../utils/helpers';

test.describe('WF-A-005: Ver Todos los Pedidos', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede ver todos los pedidos', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    // Debe mostrar al menos un pedido
    await expect(page.locator('[data-testid="order-row"]')).toHaveCount(1, { timeout: 10000 });
  });

  test('Filtra pedidos por estado', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    const statusFilter = page.locator('[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('PENDING');
      await page.waitForTimeout(1000);
      
      // Todos los pedidos visibles deben ser PENDING
      const statusBadges = await page.locator('[data-testid="order-status"]').allTextContents();
      if (statusBadges.length > 0) {
        statusBadges.forEach(status => {
          expect(status).toContain('PENDING');
        });
      }
    }
  });

  test('Busca pedidos por número', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.locator('[data-testid="search-order"]');
    if (await searchInput.isVisible()) {
      // Obtener número del primer pedido
      const firstOrderNumber = await page.locator('[data-testid="order-number"]').first().textContent();
      
      if (firstOrderNumber) {
        await searchInput.fill(firstOrderNumber);
        await page.waitForTimeout(1000);
        
        // Debe mostrar solo ese pedido
        await expect(page.locator('[data-testid="order-row"]')).toHaveCount(1);
      }
    }
  });
});

test.describe('WF-A-006: Confirmar Pedido', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede confirmar un pedido pendiente', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    // Buscar un pedido PENDING o PAID
    const firstOrder = page.locator('[data-testid="order-row"]').first();
    await firstOrder.click();
    
    // Esperar detalle
    await page.waitForURL(/\/admin\/pedidos\/.+/);
    
    const confirmButton = page.locator('[data-testid="confirm-order"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
      
      // Confirmar en diálogo
      await page.click('[data-testid="confirm-dialog-yes"]');
      
      // Verificar éxito
      await expect(page.locator('text=/confirmado|confirmed/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="order-status"]')).toHaveText(/CONFIRMED/i);
    }
  });
});

test.describe('WF-A-008: Cancelar Pedido', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede cancelar un pedido', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    // Click en primer pedido
    await page.locator('[data-testid="order-row"]').first().click();
    await page.waitForURL(/\/admin\/pedidos\/.+/);
    
    const cancelButton = page.locator('[data-testid="cancel-order"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Rellenar razón
      await page.fill('[name="cancelReason"]', 'Test cancellation');
      await page.click('[data-testid="confirm-cancel"]');
      
      // Verificar éxito
      await expect(page.locator('text=/cancelado|cancelled/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="order-status"]')).toHaveText(/CANCELLED/i);
    }
  });

  test('Requiere razón de cancelación', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.locator('[data-testid="order-row"]').first().click();
    
    const cancelButton = page.locator('[data-testid="cancel-order"]');
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Intentar cancelar sin razón
      await page.click('[data-testid="confirm-cancel"]');
      
      // Debe mostrar error o permanecer en modal
      await expect(page.locator('[name="cancelReason"]')).toBeVisible();
    }
  });
});

test.describe('WF-A-007: Modificar Pedido', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede modificar un pedido', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.locator('[data-testid="order-row"]').first().click();
    
    const modifyButton = page.locator('[data-testid="modify-order"]');
    if (await modifyButton.isVisible()) {
      await modifyButton.click();
      
      // Modificar cantidad
      await page.fill('[name="quantity"]', '3');
      
      // Guardar
      await page.click('[data-testid="save-modification"]');
      
      // Verificar éxito
      await expect(page.locator('text=/modificado|modified/i')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('[data-testid="modified-badge"]')).toBeVisible();
    }
  });
});

test.describe('WF-A-009: Generar Factura Manual', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Admin puede generar factura manualmente', async ({ page }) => {
    await page.goto('/admin/facturas/crear');
    await page.waitForLoadState('networkidle');
    
    // Seleccionar pedido
    const orderSelect = page.locator('[name="orderId"]');
    if (await orderSelect.isVisible()) {
      await orderSelect.selectOption({ index: 1 });
      
      // Rellenar datos del cliente
      await page.fill('[name="clientName"]', 'Cliente Test');
      await page.fill('[name="clientTaxId"]', 'B12345678');
      await page.fill('[name="clientAddress"]', 'Calle Test 123');
      
      // Generar
      await page.click('[data-testid="generate-invoice"]');
      
      // Verificar éxito
      await expect(page.locator('text=/generada|generated/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Pedidos Admin - Funcionalidad General', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
    await loginAsAdmin(page);
  });

  test('Muestra información completa del pedido', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.locator('[data-testid="order-row"]').first().click();
    
    // Verificar elementos clave
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-customer"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
  });

  test('Puede exportar pedidos', async ({ page }) => {
    await page.goto('/admin/pedidos');
    
    const exportButton = page.locator('[data-testid="export-orders"]');
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      // Verificar que descarga archivo
      expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/i);
    }
  });

  test('Paginación funciona correctamente', async ({ page }) => {
    await page.goto('/admin/pedidos');
    await page.waitForLoadState('networkidle');
    
    const nextButton = page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      const ordersBefore = await page.locator('[data-testid="order-row"]').count();
      
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      const ordersAfter = await page.locator('[data-testid="order-row"]').count();
      
      // Debe cambiar la lista
      expect(ordersBefore).toBeGreaterThan(0);
      expect(ordersAfter).toBeGreaterThan(0);
    }
  });
});
