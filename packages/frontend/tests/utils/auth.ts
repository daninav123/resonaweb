import { Page, expect } from '@playwright/test';

/**
 * Helper para login de usuario regular
 */
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Esperar a que el login sea exitoso
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Helper para login de admin
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('[name="email"]', 'admin@resona.com'); // Email admin
  await page.fill('[name="password"]', 'Admin123!'); // Contraseña admin
  await page.click('button[type="submit"]');
  
  // Admin puede redirigir a /admin o /
  await page.waitForLoadState('networkidle');
}

/**
 * Helper para logout
 */
export async function logout(page: Page) {
  // Click en menú de usuario
  await page.click('[data-testid="user-menu"]');
  await page.click('text=/cerrar sesión/i');
  await expect(page).toHaveURL('/');
}

/**
 * Verificar si el usuario está logueado
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
