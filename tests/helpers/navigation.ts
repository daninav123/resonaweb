import { Page, expect } from '@playwright/test';

/**
 * Navegar a la página de productos
 */
export async function goToProducts(page: Page) {
  await page.goto('http://localhost:3000/products');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/products/);
}

/**
 * Navegar al carrito
 */
export async function goToCart(page: Page) {
  await page.goto('http://localhost:3000/cart');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/cart/);
}

/**
 * Navegar al checkout
 */
export async function goToCheckout(page: Page) {
  await page.goto('http://localhost:3000/checkout');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/checkout/);
}

/**
 * Navegar a los pedidos del usuario
 */
export async function goToMyOrders(page: Page) {
  await page.goto('http://localhost:3000/orders');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/orders/);
}

/**
 * Navegar a la página de packs
 */
export async function goToPacks(page: Page) {
  await page.goto('http://localhost:3000/packs');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/packs/);
}

/**
 * Navegar al panel de administración
 */
export async function goToAdminDashboard(page: Page) {
  await page.goto('http://localhost:3000/admin/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

/**
 * Navegar a la gestión de productos (admin)
 */
export async function goToAdminProducts(page: Page) {
  await page.goto('http://localhost:3000/admin/products');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/products/);
}

/**
 * Navegar a la gestión de packs (admin)
 */
export async function goToAdminPacks(page: Page) {
  await page.goto('http://localhost:3000/admin/packs');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/packs/);
}

/**
 * Navegar a la gestión de pedidos (admin)
 */
export async function goToAdminOrders(page: Page) {
  await page.goto('http://localhost:3000/admin/orders');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/orders/);
}

/**
 * Navegar a la gestión de usuarios (admin)
 */
export async function goToAdminUsers(page: Page) {
  await page.goto('http://localhost:3000/admin/users');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/users/);
}

/**
 * Navegar a la gestión de categorías (admin)
 */
export async function goToAdminCategories(page: Page) {
  await page.goto('http://localhost:3000/admin/categories');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/\/admin\/categories/);
}

/**
 * Hacer clic en un enlace del menú de navegación
 */
export async function clickNavLink(page: Page, linkText: string) {
  await page.click(`nav a:has-text("${linkText}")`);
  await page.waitForLoadState('networkidle');
}

/**
 * Verificar que el breadcrumb contiene un texto
 */
export async function verifyBreadcrumb(page: Page, text: string) {
  const breadcrumb = page.locator('[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="breadcrumb"]');
  if (await breadcrumb.isVisible({ timeout: 1000 }).catch(() => false)) {
    await expect(breadcrumb).toContainText(text);
  }
}
