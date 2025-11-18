import { test, expect } from '@playwright/test';

test.describe('Autenticación Completa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Limpiar localStorage antes de cada test
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('debe navegar a la página de login', async ({ page }) => {
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText(/Iniciar|Login/i);
  });

  test('debe navegar a la página de registro', async ({ page }) => {
    await page.click('text=Registrarse');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator('h1, h2')).toContainText(/Registr/i);
  });

  test('debe hacer login exitosamente con credenciales válidas', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    
    // Esperar redirección
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    
    // Verificar que muestra el nombre del usuario
    await expect(page.locator('text=Hola')).toBeVisible();
  });

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    const timestamp = Date.now();
    const email = `user${timestamp}@test.com`;
    
    // Fill registration form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="phone"]', '+34 600 000 000');
    await page.fill('input[name="password"]', 'Test123!');
    await page.fill('input[name="confirmPassword"]', 'Test123!');
    await page.check('input[type="checkbox"]');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to home after successful registration
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Test')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    // Now logout
    await page.click('text=Salir');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/cuenta');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/checkout');
    await expect(page).toHaveURL('/login');
    
    await page.goto('/mis-pedidos');
    await expect(page).toHaveURL('/login');
  });
});
