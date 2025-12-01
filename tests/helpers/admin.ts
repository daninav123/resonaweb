import { Page, expect } from '@playwright/test';

/**
 * Crear un nuevo producto (admin)
 */
export async function createProduct(page: Page, productData: {
  name: string;
  sku: string;
  description: string;
  pricePerDay: number;
  stock: number;
  categoryId?: string;
}) {
  // Hacer clic en el botón de crear producto
  const createButton = page.locator('button:has-text("Crear producto"), button:has-text("Nuevo producto"), button:has-text("Añadir producto")').first();
  await createButton.click();
  
  // Esperar que se abra el modal
  await page.waitForSelector('[role="dialog"], .modal, [data-testid="product-modal"]', { timeout: 5000 });
  
  // Rellenar el formulario
  await page.fill('input[name="name"], input#name', productData.name);
  await page.fill('input[name="sku"], input#sku', productData.sku);
  await page.fill('textarea[name="description"], textarea#description', productData.description);
  await page.fill('input[name="pricePerDay"], input#pricePerDay', productData.pricePerDay.toString());
  await page.fill('input[name="stock"], input#stock', productData.stock.toString());
  
  // Seleccionar categoría si se proporciona
  if (productData.categoryId) {
    await page.selectOption('select[name="categoryId"], select#categoryId', productData.categoryId);
  }
  
  // Guardar
  await page.click('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")');
  
  // Esperar confirmación
  await page.waitForTimeout(2000);
}

/**
 * Editar un producto existente (admin)
 */
export async function editProduct(page: Page, productName: string, updates: Partial<{
  name: string;
  sku: string;
  description: string;
  pricePerDay: number;
  stock: number;
}>) {
  // Buscar el producto en la lista
  const productRow = page.locator(`tr:has-text("${productName}"), [data-testid="product-row"]:has-text("${productName}")`).first();
  
  // Hacer clic en el botón de editar
  const editButton = productRow.locator('button:has-text("Editar"), button[aria-label*="Edit"]').first();
  await editButton.click();
  
  // Esperar que se abra el modal
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
  
  // Actualizar campos
  if (updates.name) {
    await page.fill('input[name="name"], input#name', updates.name);
  }
  if (updates.sku) {
    await page.fill('input[name="sku"], input#sku', updates.sku);
  }
  if (updates.description) {
    await page.fill('textarea[name="description"], textarea#description', updates.description);
  }
  if (updates.pricePerDay) {
    await page.fill('input[name="pricePerDay"], input#pricePerDay', updates.pricePerDay.toString());
  }
  if (updates.stock) {
    await page.fill('input[name="stock"], input#stock', updates.stock.toString());
  }
  
  // Guardar cambios
  await page.click('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Actualizar")');
  
  // Esperar confirmación
  await page.waitForTimeout(2000);
}

/**
 * Eliminar un producto (admin)
 */
export async function deleteProduct(page: Page, productName: string) {
  // Buscar el producto en la lista
  const productRow = page.locator(`tr:has-text("${productName}"), [data-testid="product-row"]:has-text("${productName}")`).first();
  
  // Hacer clic en el botón de eliminar
  const deleteButton = productRow.locator('button:has-text("Eliminar"), button[aria-label*="Delete"]').first();
  await deleteButton.click();
  
  // Confirmar eliminación
  const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Sí"), button:has-text("Eliminar")');
  if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmButton.click();
  }
  
  await page.waitForTimeout(2000);
}

/**
 * Crear una nueva categoría (admin)
 */
export async function createCategory(page: Page, categoryData: {
  name: string;
  slug: string;
  description: string;
}) {
  const createButton = page.locator('button:has-text("Crear categoría"), button:has-text("Nueva categoría")').first();
  await createButton.click();
  
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
  
  await page.fill('input[name="name"], input#name', categoryData.name);
  await page.fill('input[name="slug"], input#slug', categoryData.slug);
  await page.fill('textarea[name="description"], textarea#description', categoryData.description);
  
  await page.click('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")');
  await page.waitForTimeout(2000);
}

/**
 * Crear un pack (admin)
 */
export async function createPack(page: Page, packData: {
  name: string;
  sku: string;
  description: string;
  pricePerDay: number;
  stock: number;
  components?: Array<{ productId: string; quantity: number }>;
}) {
  const createButton = page.locator('button:has-text("Crear pack"), button:has-text("Nuevo pack")').first();
  await createButton.click();
  
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
  
  await page.fill('input[name="name"], input#name', packData.name);
  await page.fill('input[name="sku"], input#sku', packData.sku);
  await page.fill('textarea[name="description"], textarea#description', packData.description);
  await page.fill('input[name="pricePerDay"], input#pricePerDay', packData.pricePerDay.toString());
  await page.fill('input[name="stock"], input#stock', packData.stock.toString());
  
  // Agregar componentes si se proporcionan
  if (packData.components && packData.components.length > 0) {
    for (const component of packData.components) {
      const addComponentButton = page.locator('button:has-text("Agregar componente"), button:has-text("Añadir producto")').first();
      await addComponentButton.click();
      
      await page.selectOption('select[name*="component"], select[name*="product"]', component.productId);
      await page.fill('input[name*="quantity"]', component.quantity.toString());
      
      await page.click('button:has-text("Añadir"), button:has-text("Agregar")');
    }
  }
  
  await page.click('button[type="submit"]:has-text("Guardar"), button[type="submit"]:has-text("Crear")');
  await page.waitForTimeout(2000);
}

/**
 * Editar un pack (admin)
 */
export async function editPack(page: Page, packName: string) {
  const packRow = page.locator(`tr:has-text("${packName}"), [data-testid="pack-row"]:has-text("${packName}")`).first();
  const editButton = packRow.locator('button:has-text("Editar"), button[aria-label*="Edit"]').first();
  await editButton.click();
  
  await page.waitForSelector('[role="dialog"], .modal', { timeout: 5000 });
}

/**
 * Cambiar estado de un pedido (admin)
 */
export async function changeOrderStatus(page: Page, orderId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
  const orderRow = page.locator(`tr:has-text("${orderId}"), [data-testid="order-row"]:has-text("${orderId}")`).first();
  const statusSelect = orderRow.locator('select[name="status"], select.status-select').first();
  
  await statusSelect.selectOption(newStatus);
  
  // Confirmar cambio si es necesario
  const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Guardar")');
  if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await confirmButton.click();
  }
  
  await page.waitForTimeout(2000);
}

/**
 * Buscar un usuario (admin)
 */
export async function searchUser(page: Page, searchTerm: string) {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar usuario"]').first();
  await searchInput.fill(searchTerm);
  await searchInput.press('Enter');
  await page.waitForLoadState('networkidle');
}

/**
 * Cambiar rol de un usuario (admin)
 */
export async function changeUserRole(page: Page, userEmail: string, newRole: 'CLIENT' | 'ADMIN' | 'SUPERADMIN') {
  const userRow = page.locator(`tr:has-text("${userEmail}"), [data-testid="user-row"]:has-text("${userEmail}")`).first();
  const roleSelect = userRow.locator('select[name="role"], select.role-select').first();
  
  await roleSelect.selectOption(newRole);
  await page.waitForTimeout(2000);
}

/**
 * Cambiar nivel VIP de un usuario (admin)
 */
export async function changeUserVIPLevel(page: Page, userEmail: string, vipLevel: 'NORMAL' | 'VIP' | 'PREMIUM') {
  const userRow = page.locator(`tr:has-text("${userEmail}"), [data-testid="user-row"]:has-text("${userEmail}")`).first();
  const vipSelect = userRow.locator('select[name="userLevel"], select.vip-select').first();
  
  await vipSelect.selectOption(vipLevel);
  await page.waitForTimeout(2000);
}

/**
 * Ver estadísticas del dashboard
 */
export async function getDashboardStats(page: Page): Promise<{
  totalOrders?: number;
  totalRevenue?: number;
  activeProducts?: number;
  totalUsers?: number;
}> {
  const stats: any = {};
  
  // Intentar extraer estadísticas del dashboard
  const ordersElement = page.locator('[data-testid="total-orders"], .stat-orders').first();
  if (await ordersElement.isVisible({ timeout: 2000 }).catch(() => false)) {
    const text = await ordersElement.textContent();
    const match = text?.match(/\d+/);
    if (match) stats.totalOrders = parseInt(match[0], 10);
  }
  
  const revenueElement = page.locator('[data-testid="total-revenue"], .stat-revenue').first();
  if (await revenueElement.isVisible({ timeout: 2000 }).catch(() => false)) {
    const text = await revenueElement.textContent();
    const match = text?.match(/[\d,]+\.?\d*/);
    if (match) stats.totalRevenue = parseFloat(match[0].replace(',', ''));
  }
  
  return stats;
}

/**
 * Verificar que un producto existe en la lista de admin
 */
export async function verifyProductInAdminList(page: Page, productName: string) {
  const productRow = page.locator(`tr:has-text("${productName}"), [data-testid="product-row"]:has-text("${productName}")`).first();
  await expect(productRow).toBeVisible();
}

/**
 * Verificar que un pack existe en la lista de admin
 */
export async function verifyPackInAdminList(page: Page, packName: string) {
  const packRow = page.locator(`tr:has-text("${packName}"), [data-testid="pack-row"]:has-text("${packName}")`).first();
  await expect(packRow).toBeVisible();
}
