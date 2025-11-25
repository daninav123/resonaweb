import { test, expect } from '@playwright/test';
import { addProductToCart, goToCart, clearCart, getCartCount } from '../../utils/cart';
import { cleanBrowserData } from '../../utils/helpers';
import { loginAsUser } from '../../utils/auth';
import { getUser, getProduct } from '../../utils/fixtures';

test.describe('WF-U-004: Añadir al Carrito sin Login', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Invitado puede añadir producto al carrito', async ({ page }) => {
    await addProductToCart(page);

    // Verificar confirmación
    await expect(page.locator('text=/añadido/i')).toBeVisible({ timeout: 5000 });

    // Verificar contador de carrito
    const count = await getCartCount(page);
    expect(count).toBeGreaterThan(0);

    // Verificar que se guardó en localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('guestCart'));
    expect(cartData).toBeTruthy();
  });

  test('Puede añadir múltiples productos', async ({ page }) => {
    // Añadir primer producto
    await addProductToCart(page, { productSlug: 'letras-luminosas' });
    
    // Añadir segundo producto (si hay más productos disponibles)
    await addProductToCart(page, { 
      productSlug: 'letras-luminosas',
      startDate: '2025-12-10',
      endDate: '2025-12-15'
    });

    // Verificar contador
    const count = await getCartCount(page);
    expect(count).toBe(2);
  });

  test('Carrito persiste al navegar', async ({ page }) => {
    await addProductToCart(page);
    
    // Navegar a otra página
    await page.goto('/');
    
    // El contador debe seguir mostrando items
    const count = await getCartCount(page);
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('WF-U-013: Aplicar Fechas Globales en Carrito', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Puede aplicar fechas globales a todos los productos', async ({ page }) => {
    // Añadir producto sin fechas específicas
    await page.goto('/productos/letras-luminosas');
    await page.click('[data-testid="add-to-cart"]');
    
    // Ir al carrito
    await goToCart(page);
    
    // Aplicar fechas globales
    await page.fill('[data-testid="global-start-date"]', '2025-12-01');
    await page.fill('[data-testid="global-end-date"]', '2025-12-05');
    await page.click('[data-testid="apply-global-dates"]');
    
    // Verificar que se aplicaron
    await expect(page.locator('text=/fechas aplicadas/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Gestión de Carrito', () => {
  
  test.beforeEach(async ({ page }) => {
    await cleanBrowserData(page);
  });

  test('Puede eliminar producto del carrito', async ({ page }) => {
    await addProductToCart(page);
    await goToCart(page);
    
    // Eliminar item
    await page.locator('[data-testid="remove-item"]').first().click();
    
    // Verificar que se eliminó
    await expect(page.locator('text=/carrito vacío/i')).toBeVisible({ timeout: 5000 });
  });

  test('Puede actualizar cantidad', async ({ page }) => {
    await addProductToCart(page);
    await goToCart(page);
    
    // Cambiar cantidad
    await page.fill('[data-testid="quantity-input"]', '2');
    await page.click('[data-testid="update-quantity"]');
    
    // Verificar actualización
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');
  });

  test('Muestra total correcto', async ({ page }) => {
    await addProductToCart(page);
    await goToCart(page);
    
    // Verificar que hay un total
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible();
    
    const totalText = await page.locator('[data-testid="cart-total"]').textContent();
    expect(totalText).toMatch(/\d+/); // Debe contener números
  });
});

test.describe('WF-U-010: Favoritos', () => {
  
  test('Usuario logueado puede añadir a favoritos', async ({ page }) => {
    const user = getUser('regularUser');
    await loginAsUser(page, user.email, user.password);
    
    const product = getProduct('testProduct1');
    await page.goto(`/productos/${product.slug}`);
    
    // Click en favoritos
    await page.click('[data-testid="favorite-button"]');
    
    // Verificar que se añadió
    await expect(page.locator('[data-testid="favorite-button"][data-favorited="true"]')).toBeVisible({ timeout: 5000 });
    
    // Ir a página de favoritos
    await page.goto('/favoritos');
    
    // Debe aparecer el producto
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1, { timeout: 5000 });
  });
});
