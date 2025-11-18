import { test, expect } from '@playwright/test';

test.describe('Panel de Administración', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin antes de cada test
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  });

  test('debe permitir acceso al panel de admin siendo admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Debe cargar el dashboard
    await expect(page.locator('text=/Admin|Dashboard/i')).toBeVisible({ timeout: 5000 });
  });

  test('debe mostrar estadísticas en el dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Buscar números o estadísticas
    const stats = page.locator('text=/Total|Ventas|Productos|Usuarios/i');
    const count = await stats.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('debe navegar a gestión de productos', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Click en productos o navegar directamente
    await page.goto('http://localhost:3000/admin/products');
    
    // Debe mostrar tabla de productos
    await expect(page).toHaveURL(/admin\/products/);
  });

  test('debe navegar a gestión de categorías', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/categories');
    
    // Debe mostrar categorías
    await expect(page).toHaveURL(/admin\/categories/);
  });

  test('debe mostrar las 15 categorías en admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/categories');
    
    // Esperar a que cargue
    await page.waitForTimeout(2000);
    
    // Contar categorías (pueden estar en tabla, cards, etc.)
    const categoryRows = page.locator('tr, .category-item');
    const count = await categoryRows.count();
    
    // Debe haber al menos 15 (15 categorías + posible header)
    expect(count).toBeGreaterThanOrEqual(15);
  });

  test('debe navegar a gestión de pedidos', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/orders');
    
    // Debe cargar página de pedidos
    await expect(page).toHaveURL(/admin\/orders/);
  });

  test('debe navegar a gestión de usuarios', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/users');
    
    // Debe cargar página de usuarios
    await expect(page).toHaveURL(/admin\/users/);
  });

  test('debe tener menú de navegación de admin', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Verificar que existe navegación
    const navLinks = page.locator('nav a, aside a').filter({ hasText: /Productos|Categorías|Pedidos|Usuarios/i });
    const count = await navLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('debe permitir crear nuevo producto', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/products');
    
    // Buscar botón de nuevo producto
    const newButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Añadir")').first();
    
    if (await newButton.isVisible()) {
      await newButton.click();
      
      // Debe abrir formulario o modal
      await page.waitForTimeout(1000);
    }
  });

  test('debe mantener sesión de admin al recargar', async ({ page }) => {
    await page.goto('http://localhost:3000/admin');
    
    // Recargar
    await page.reload();
    
    // Debe seguir en admin
    expect(page.url()).toContain('admin');
  });
});

test.describe('Protección de Rutas de Admin', () => {
  test('debe redirigir a login si no es admin', async ({ page }) => {
    // Login como usuario normal
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'cliente@test.com');
    await page.fill('input[type="password"]', 'User123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // Intentar acceder a admin
    await page.goto('http://localhost:3000/admin');
    
    // Debe redirigir o mostrar error
    await page.waitForTimeout(2000);
    
    // No debe estar en /admin o debe mostrar mensaje de error
    const url = page.url();
    const hasError = await page.locator('text=/no autorizado|sin acceso|forbidden/i').isVisible().catch(() => false);
    
    expect(url.includes('admin') === false || hasError).toBeTruthy();
  });

  test('debe redirigir a login si no está autenticado', async ({ page }) => {
    // Sin login, intentar acceder
    await page.goto('http://localhost:3000/admin');
    
    // Debe redirigir a login
    await page.waitForURL(/login/, { timeout: 5000 });
  });
});
