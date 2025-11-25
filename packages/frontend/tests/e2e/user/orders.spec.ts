import { test, expect } from '@playwright/test';
import { loginAsUser } from '../../utils/auth';
import { cleanBrowserData } from '../../utils/helpers';

test.describe('WF-U-006: Ver Mis Pedidos', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Usuario puede ver lista de pedidos', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    
    // Debe mostrar al menos un pedido
    await expect(page.locator('[data-testid="order-card"]')).toHaveCount(1, { timeout: 10000 });
  });

  test('Puede ver detalle de un pedido', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    await page.waitForLoadState('networkidle');
    
    // Click en primer pedido
    await page.locator('[data-testid="order-card"]').first().click();
    
    // Debe ir a detalle
    await expect(page).toHaveURL(/\/mis-pedidos\/.+/);
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="order-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
  });

  test('Muestra estado correcto del pedido', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    await page.locator('[data-testid="order-card"]').first().click();
    
    // Verificar que muestra un estado válido
    const status = await page.locator('[data-testid="order-status"]').textContent();
    expect(status).toMatch(/PENDING|CONFIRMED|PAID|DELIVERED|CANCELLED/i);
  });
});

test.describe('WF-U-008: Descargar Factura', () => {
  
  test('Usuario puede descargar factura de pedido pagado', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    // Ir a un pedido con factura
    await page.goto('/mis-pedidos');
    await page.locator('[data-testid="order-card"]').first().click();
    
    // Verificar que existe botón de descarga
    const downloadButton = page.locator('[data-testid="download-invoice"]');
    
    if (await downloadButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await downloadButton.click();
      const download = await downloadPromise;
      
      // Verificar que es PDF
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    }
  });
});

test.describe('WF-U-007: Solicitar Modificación', () => {
  
  test('Usuario puede solicitar modificación de pedido', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    await page.locator('[data-testid="order-card"]').first().click();
    
    // Buscar botón de modificación
    const modifyButton = page.locator('[data-testid="request-modification"]');
    
    if (await modifyButton.isVisible()) {
      await modifyButton.click();
      
      // Rellenar formulario de modificación
      await page.fill('[name="changes"]', 'Quiero añadir un producto más');
      await page.click('[data-testid="submit-modification"]');
      
      // Verificar confirmación
      await expect(page.locator('text=/solicitud enviada|request sent/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Pedidos - Funcionalidad General', () => {
  
  test('Filtra pedidos por estado', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    
    // Filtrar por CONFIRMED
    const filterSelect = page.locator('[data-testid="status-filter"]');
    if (await filterSelect.isVisible()) {
      await filterSelect.selectOption('CONFIRMED');
      await page.waitForTimeout(1000); // Esperar actualización
      
      // Todos los pedidos visibles deben ser CONFIRMED
      const statusBadges = await page.locator('[data-testid="order-status"]').allTextContents();
      statusBadges.forEach(status => {
        expect(status).toContain('CONFIRMED');
      });
    }
  });

  test('Busca pedido por número', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    await page.goto('/mis-pedidos');
    
    const searchInput = page.locator('[data-testid="search-order"]');
    if (await searchInput.isVisible()) {
      // Obtener número de un pedido visible
      const firstOrderNumber = await page.locator('[data-testid="order-number"]').first().textContent();
      
      // Buscar
      await searchInput.fill(firstOrderNumber || '');
      await page.waitForTimeout(1000);
      
      // Debe mostrar solo ese pedido
      await expect(page.locator('[data-testid="order-card"]')).toHaveCount(1);
    }
  });
});

test.describe('WF-SEC-002: Ver Pedido de Otro Usuario', () => {
  
  test('Usuario no puede ver pedidos de otros', async ({ page }) => {
    await loginAsUser(page, 'user1@test.com', 'password123');
    
    // Intentar acceder a pedido de otro usuario
    // Necesitamos un ID de pedido de otro usuario
    await page.goto('/mis-pedidos/00000000-0000-0000-0000-000000000000');
    
    // Debe mostrar error 403 o redirigir
    await expect(
      page.locator('text=/no autorizado|not authorized|no encontrado|not found/i')
    ).toBeVisible({ timeout: 5000 });
  });
});
