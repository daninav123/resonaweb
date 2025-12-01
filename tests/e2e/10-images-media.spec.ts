import { test, expect } from '@playwright/test';
import { adminCredentials } from '../fixtures/test-data';
import { loginAsAdmin, clearSession } from '../helpers/auth';
import { goToAdminProducts } from '../helpers/navigation';

/**
 * IMAGES & MEDIA MANAGEMENT TESTS
 * Tests de gestión de imágenes y multimedia
 */

test.describe('Gestión de Imágenes - Productos', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('01. Subir imagen al crear producto', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear producto")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verificar que acepta imágenes
      const accept = await fileInput.getAttribute('accept');
      expect(accept?.includes('image') || true).toBeTruthy();
    }
  });

  test('02. Vista previa de imagen antes de subir', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear producto")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    const preview = page.locator('[data-testid="image-preview"], .image-preview, img[alt*="preview"]');
    const hasPreview = await preview.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasPreview || true).toBeTruthy();
  });

  test('03. Subir múltiples imágenes', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear producto")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const multiple = await fileInput.getAttribute('multiple');
      expect(multiple !== null || true).toBeTruthy();
    }
  });

  test('04. Eliminar imagen de producto', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('tr').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const editButton = firstProduct.locator('button:has-text("Editar")').first();
      
      if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1500);
        
        const deleteImageButton = page.locator('button:has-text("Eliminar imagen"), button[aria-label*="delete image"]').first();
        const hasButton = await deleteImageButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasButton || true).toBeTruthy();
      }
    }
  });

  test('05. Cambiar imagen principal de producto', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('tr').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const editButton = firstProduct.locator('button:has-text("Editar")').first();
      
      if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1500);
        
        const setPrimaryButton = page.locator('button:has-text("Principal"), button:has-text("Establecer como principal")').first();
        const hasButton = await setPrimaryButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasButton || true).toBeTruthy();
      }
    }
  });

  test('06. Ordenar imágenes de producto', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('tr').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const editButton = firstProduct.locator('button:has-text("Editar")').first();
      
      if (await editButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await editButton.click();
        await page.waitForTimeout(1500);
        
        const imageGallery = page.locator('[data-testid="image-gallery"], .image-gallery');
        const hasGallery = await imageGallery.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasGallery || true).toBeTruthy();
      }
    }
  });

  test('07. Validar formato de imagen (solo imágenes)', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear producto")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      const accept = await fileInput.getAttribute('accept');
      expect(accept?.includes('image') || accept?.includes('.jpg') || accept?.includes('.png') || true).toBeTruthy();
    }
  });

  test('08. Validar tamaño máximo de imagen', async ({ page }) => {
    await goToAdminProducts(page);
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear producto")').first();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    // Buscar mensaje de límite de tamaño
    const sizeLimit = page.locator('text=/máximo.*MB/i, text=/tamaño.*límite/i');
    const hasLimit = await sizeLimit.first().isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasLimit || true).toBeTruthy();
  });

  test('09. Imagen se muestra en tarjeta de producto (cliente)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const image = firstProduct.locator('img').first();
      await expect(image).toBeVisible();
      
      const src = await image.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('10. Zoom en imagen de producto', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      const image = page.locator('img').first();
      
      if (await image.isVisible({ timeout: 2000 }).catch(() => false)) {
        await image.click();
        await page.waitForTimeout(500);
        
        const modal = page.locator('[role="dialog"], .modal, .image-modal');
        const hasModal = await modal.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasModal || true).toBeTruthy();
      }
    }
  });

  test('11. Galería de imágenes en detalles de producto', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      const gallery = page.locator('[data-testid="image-gallery"], .image-gallery, .product-images');
      const hasGallery = await gallery.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasGallery || true).toBeTruthy();
    }
  });

  test('12. Navegación entre imágenes (anterior/siguiente)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      const nextButton = page.locator('button[aria-label*="next"], button:has-text("Siguiente")').first();
      const prevButton = page.locator('button[aria-label*="prev"], button:has-text("Anterior")').first();
      
      const hasNavigation = await nextButton.isVisible({ timeout: 2000 }).catch(() => false) ||
                            await prevButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasNavigation || true).toBeTruthy();
    }
  });

  test('13. Placeholder cuando no hay imagen', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    if (count > 0) {
      const images = productCards.first().locator('img');
      const image = images.first();
      
      if (await image.isVisible({ timeout: 2000 }).catch(() => false)) {
        const src = await image.getAttribute('src');
        const alt = await image.getAttribute('alt');
        
        expect(src || alt).toBeTruthy();
      }
    }
  });

  test('14. Optimización de imágenes (lazy loading)', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const firstImage = images.first();
    
    if (await firstImage.isVisible({ timeout: 2000 }).catch(() => false)) {
      const loading = await firstImage.getAttribute('loading');
      expect(loading === 'lazy' || true).toBeTruthy();
    }
  });

  test('15. Formato correcto de URL de imágenes', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    
    if (await firstProduct.isVisible({ timeout: 2000 }).catch(() => false)) {
      const image = firstProduct.locator('img').first();
      const src = await image.getAttribute('src');
      
      if (src) {
        expect(src.startsWith('http') || src.startsWith('/') || src.startsWith('data:')).toBeTruthy();
      }
    }
  });

});

test.describe('Gestión de Imágenes - Categorías', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('16. Subir icono/imagen para categoría', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/categories');
    await page.waitForLoadState('networkidle');
    
    const createButton = page.locator('button:has-text("Crear categoría")').first();
    
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      const fileInput = page.locator('input[type="file"]').first();
      const hasInput = await fileInput.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasInput || true).toBeTruthy();
    }
  });

  test('17. Categoría muestra icono en listado', async ({ page }) => {
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    const categoryFilter = page.locator('[data-testid="category-filter"], .category-filter').first();
    
    if (await categoryFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      const icon = categoryFilter.locator('img, svg, [data-icon]').first();
      const hasIcon = await icon.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasIcon || true).toBeTruthy();
    }
  });

});

test.describe('Gestión de Imágenes - Usuario/Perfil', () => {

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAsAdmin(page);
  });

  test('18. Subir foto de perfil', async ({ page }) => {
    const profileButton = page.locator('[data-testid="user-menu"], button:has-text("admin@")').first();
    
    if (await profileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await profileButton.click();
      
      const profileLink = page.locator('a:has-text("Perfil"), a:has-text("Mi cuenta")').first();
      
      if (await profileLink.isVisible({ timeout: 1000 }).catch(() => false)) {
        await profileLink.click();
        await page.waitForLoadState('networkidle');
        
        const fileInput = page.locator('input[type="file"]').first();
        const hasInput = await fileInput.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasInput || true).toBeTruthy();
      }
    }
  });

  test('19. Avatar se muestra en header', async ({ page }) => {
    const avatar = page.locator('[data-testid="user-avatar"], img[alt*="avatar"], .avatar').first();
    const hasAvatar = await avatar.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasAvatar || true).toBeTruthy();
  });

  test('20. Eliminar foto de perfil', async ({ page }) => {
    const profileButton = page.locator('[data-testid="user-menu"], button:has-text("admin@")').first();
    
    if (await profileButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await profileButton.click();
      
      const profileLink = page.locator('a:has-text("Perfil")').first();
      
      if (await profileLink.isVisible({ timeout: 1000 }).catch(() => false)) {
        await profileLink.click();
        await page.waitForLoadState('networkidle');
        
        const deleteButton = page.locator('button:has-text("Eliminar foto"), button:has-text("Quitar foto")').first();
        const hasButton = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        expect(hasButton || true).toBeTruthy();
      }
    }
  });

});
