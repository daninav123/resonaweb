import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.click('text=Iniciar Sesión');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2')).toContainText('Inicia sesión en tu cuenta');
  });

  test('should show validation errors for invalid inputs', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    await expect(page.locator('text=El email es obligatorio')).toBeVisible();
    
    // Enter invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'short');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=email no es válido')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Should redirect to home after successful login
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Hola')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Crea una cuenta aquí');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2')).toContainText('Crea tu cuenta');
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
