import { Page, expect } from '@playwright/test';

/**
 * Helper para login como administrador
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', 'admin@resona.com');
  await page.fill('input[type="password"]', 'Admin123!@#');
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el login y redirija
  await page.waitForURL('**/admin/**', { timeout: 10000 });
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Helper para login como cliente
 */
export async function loginAsClient(page: Page, email: string, password: string) {
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el login
  await page.waitForLoadState('networkidle');
  // Verificar que no estamos en la página de login
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * Helper para registro de nuevo usuario
 */
export async function registerNewUser(
  page: Page,
  userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }
) {
  await page.goto('http://localhost:3000/register');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="firstName"]', userData.firstName);
  await page.fill('input[name="lastName"]', userData.lastName);
  
  if (userData.phone) {
    await page.fill('input[name="phone"]', userData.phone);
  }
  
  // Aceptar términos y condiciones
  const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="accept"]').first();
  if (await termsCheckbox.isVisible()) {
    await termsCheckbox.check();
  }
  
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el registro
  await page.waitForLoadState('networkidle');
}

/**
 * Helper para logout
 */
export async function logout(page: Page) {
  // Buscar el botón de logout (puede estar en diferentes lugares)
  const logoutButton = page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout"), a:has-text("Cerrar sesión")').first();
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
  } else {
    // Si no está visible, buscar en el menú de usuario
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("admin@"), button:has-text("@")').first();
    if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
      await userMenu.click();
      await page.locator('button:has-text("Cerrar sesión"), button:has-text("Logout")').first().click();
    }
  }
  
  await page.waitForLoadState('networkidle');
}

/**
 * Verificar si el usuario está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    // Intentar acceder a una página protegida
    await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle' });
    return !page.url().includes('/login');
  } catch {
    return false;
  }
}

/**
 * Limpiar sesión (cookies y localStorage)
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  
  // Solo limpiar storage si la página está en un contexto válido
  try {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Si falla (ej: página no cargada), navegar primero y luego limpiar
    await page.goto('about:blank');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    }).catch(() => {
      // Ignorar si aún falla - puede ser que el navegador no lo permita
    });
  }
}
