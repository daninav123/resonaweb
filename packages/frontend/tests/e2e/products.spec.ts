import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/productos');
  });

  test('should display product catalog page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Catálogo de Productos');
    await expect(page.locator('.product-card')).toHaveCount(20); // Default pagination
  });

  test('should filter products by category', async ({ page }) => {
    // Click on a category filter
    await page.click('text=Sonido');
    
    // URL should update with category filter
    await expect(page).toHaveURL(/categoria=sonido/);
    
    // Products should be filtered
    await expect(page.locator('.product-card')).toHaveCount.lessThan(20);
  });

  test('should filter products by price range', async ({ page }) => {
    // Set price range
    await page.fill('input[name="minPrice"]', '50');
    await page.fill('input[name="maxPrice"]', '200');
    await page.click('button:has-text("Aplicar")');
    
    // URL should update with price filters
    await expect(page).toHaveURL(/minPrice=50/);
    await expect(page).toHaveURL(/maxPrice=200/);
  });

  test('should search for products', async ({ page }) => {
    // Use search bar
    await page.fill('input[placeholder*="Buscar"]', 'altavoz');
    await page.press('input[placeholder*="Buscar"]', 'Enter');
    
    // Should show search results
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0);
    await expect(page.locator('.product-card').first()).toContainText(/altavoz/i);
  });

  test('should sort products', async ({ page }) => {
    // Select sort option
    await page.selectOption('select[name="sortBy"]', 'priceAsc');
    
    // URL should update with sort parameter
    await expect(page).toHaveURL(/sortBy=priceAsc/);
    
    // First product should have lower price than last visible
    const firstPrice = await page.locator('.product-price').first().textContent();
    const lastPrice = await page.locator('.product-price').last().textContent();
    
    const firstPriceNum = parseFloat(firstPrice?.replace('€', '') || '0');
    const lastPriceNum = parseFloat(lastPrice?.replace('€', '') || '0');
    
    expect(firstPriceNum).toBeLessThanOrEqual(lastPriceNum);
  });

  test('should paginate products', async ({ page }) => {
    // Check pagination exists
    await expect(page.locator('.pagination')).toBeVisible();
    
    // Go to next page
    await page.click('button:has-text("Siguiente")');
    
    // URL should update with page parameter
    await expect(page).toHaveURL(/page=2/);
    
    // Should show different products
    await expect(page.locator('.product-card')).toHaveCount.greaterThan(0);
  });

  test('should switch between grid and list view', async ({ page }) => {
    // Default should be grid view
    await expect(page.locator('.grid-view')).toBeVisible();
    
    // Switch to list view
    await page.click('button[aria-label="Vista lista"]');
    await expect(page.locator('.list-view')).toBeVisible();
    
    // Switch back to grid view
    await page.click('button[aria-label="Vista cuadrícula"]');
    await expect(page.locator('.grid-view')).toBeVisible();
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Click on first product
    const firstProductName = await page.locator('.product-card h3').first().textContent();
    await page.locator('.product-card').first().click();
    
    // Should navigate to product detail
    await expect(page).toHaveURL(/\/productos\/.+/);
    await expect(page.locator('h1')).toContainText(firstProductName || '');
  });
});

test.describe('Product Detail', () => {
  test('should display product information', async ({ page }) => {
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Check all product info is displayed
    await expect(page.locator('h1')).toBeVisible(); // Product name
    await expect(page.locator('.product-price')).toBeVisible();
    await expect(page.locator('.product-description')).toBeVisible();
    await expect(page.locator('.product-stock')).toBeVisible();
  });

  test('should select rental dates', async ({ page }) => {
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Select dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    await page.fill('input[name="startDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', dayAfter.toISOString().split('T')[0]);
    
    // Price should update based on days
    await expect(page.locator('.total-price')).toContainText('€');
  });

  test('should adjust quantity', async ({ page }) => {
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Increase quantity
    await page.click('button[aria-label="Aumentar cantidad"]');
    await expect(page.locator('.quantity-input')).toHaveValue('2');
    
    // Decrease quantity
    await page.click('button[aria-label="Disminuir cantidad"]');
    await expect(page.locator('.quantity-input')).toHaveValue('1');
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Select dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    await page.fill('input[name="startDate"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', dayAfter.toISOString().split('T')[0]);
    
    // Add to cart
    await page.click('button:has-text("Añadir al carrito")');
    
    // Should show success message
    await expect(page.locator('.toast-success')).toContainText('añadido al carrito');
    
    // Cart badge should update
    await expect(page.locator('.cart-badge')).toContainText('1');
  });

  test('should show related products', async ({ page }) => {
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Scroll to related products section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Should show related products
    await expect(page.locator('.related-products')).toBeVisible();
    await expect(page.locator('.related-products .product-card')).toHaveCount.greaterThan(0);
  });

  test('should add to favorites', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    
    // Go to product detail
    await page.goto('/productos');
    await page.locator('.product-card').first().click();
    
    // Add to favorites
    await page.click('button[aria-label="Añadir a favoritos"]');
    await expect(page.locator('.toast-success')).toContainText('favoritos');
  });
});
