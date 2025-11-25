import { test, expect } from '@playwright/test';
import { generateUserData, cleanBrowserData } from '../../utils/helpers';
import { loginAsUser, logout } from '../../utils/auth';

test.describe('WF-U-001: Registro de Usuario', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Usuario puede registrarse exitosamente', async ({ page }) => {
    const userData = generateUserData();

    await page.goto('/register');
    
    // Rellenar formulario
    await page.fill('[name="email"]', userData.email);
    await page.fill('[name="password"]', userData.password);
    await page.fill('[name="firstName"]', userData.firstName);
    await page.fill('[name="lastName"]', userData.lastName);
    await page.check('[name="acceptTerms"]');
    
    // Enviar formulario
    await page.click('button[type="submit"]');

    // Validar login automático y redirección
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verificar que el usuario está logueado
    await expect(page.locator('text=/Test User/i')).toBeVisible({ timeout: 5000 });
  });

  test('No permite registro con email duplicado', async ({ page }) => {
    const email = 'danielnavarrocampos@icloud.com'; // Email ya existente

    await page.goto('/register');
    await page.fill('[name="email"]', email);
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.check('[name="acceptTerms"]');
    await page.click('button[type="submit"]');

    // Debe mostrar error
    await expect(page.locator('text=/ya existe|already exists/i')).toBeVisible({ timeout: 5000 });
  });

  test('Validación de campos requeridos', async ({ page }) => {
    await page.goto('/register');
    
    // Intentar enviar sin completar
    await page.click('button[type="submit"]');
    
    // Debe permanecer en la página
    await expect(page).toHaveURL('/register');
  });
});

test.describe('WF-U-002: Login de Usuario', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Usuario puede hacer login', async ({ page }) => {
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');

    // Verificar redirección y login exitoso
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({ timeout: 5000 });
  });

  test('Login falla con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Debe mostrar error
    await expect(page.locator('text=/incorrecta|incorrect|invalid/i')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('Login falla con email no existente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'noexiste@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Debe mostrar error
    await expect(page.locator('text=/no encontrado|not found|no existe/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('WF-U-014: Logout', () => {
  
  test('Usuario puede cerrar sesión', async ({ page }) => {
    // Login primero
    await loginAsUser(page, 'danielnavarrocampos@icloud.com', 'Daniel123!');
    
    // Logout
    await logout(page);
    
    // Verificar que está deslogueado
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
    await expect(page.locator('text=/Iniciar sesión|Login/i')).toBeVisible();
  });
});
