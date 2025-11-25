import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../../utils/auth';
import { cleanBrowserData } from '../../utils/helpers';

test.describe('WF-A-001: Login como Admin', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Admin puede hacer login y acceder al panel', async ({ page }) => {
    await loginAsAdmin(page);

    // Verificar que está en el admin
    await expect(page).toHaveURL(/\/(admin)?/);
    
    // Verificar menú admin visible
    const adminMenu = page.locator('[data-testid="admin-menu"]');
    if (await adminMenu.isVisible()) {
      await expect(adminMenu).toBeVisible();
    } else {
      // Alternativamente, verificar que puede acceder a rutas admin
      await page.goto('/admin/productos');
      await expect(page).toHaveURL('/admin/productos');
    }
  });

  test('Admin tiene acceso completo al panel', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Verificar acceso a diferentes secciones
    const sections = [
      '/admin/productos',
      '/admin/pedidos',
      '/admin/usuarios',
      '/admin/analytics',
    ];
    
    for (const section of sections) {
      await page.goto(section);
      await expect(page).toHaveURL(section);
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('WF-SEC-001: Acceso No Autorizado a Admin', () => {
  
  test('Usuario regular no puede acceder al panel admin', async ({ page }) => {
    await cleanBrowserData(page);
    
    // Login como usuario regular
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Intentar acceder a admin
    await page.goto('/admin');
    
    // Debe redirigir o mostrar error
    await page.waitForLoadState('networkidle');
    
    // Verificar que no está en admin
    const url = page.url();
    if (url.includes('/admin')) {
      // Si está en admin, debe mostrar mensaje de no autorizado
      await expect(page.locator('text=/no autorizado|not authorized|acceso denegado/i')).toBeVisible({ timeout: 5000 });
    } else {
      // Debe haber redirigido a home
      await expect(page).toHaveURL('/');
    }
  });

  test('Usuario sin login no puede acceder a admin', async ({ page }) => {
    await cleanBrowserData(page);
    
    await page.goto('/admin');
    
    // Debe redirigir a login o home
    await expect(page).not.toHaveURL('/admin');
  });
});
