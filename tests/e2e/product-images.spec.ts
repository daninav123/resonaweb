import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Product Images E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@resona.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin**');
  });

  test('Subir imagen a producto y verificar en catálogo', async ({ page }) => {
    console.log('🧪 TEST: Flujo completo de subida de imágenes');
    
    // 1. Ir a productos admin
    console.log('📍 Paso 1: Ir a /admin/productos');
    await page.goto('http://localhost:3000/admin/productos');
    await page.waitForLoadState('networkidle');
    
    // 2. Buscar producto "das Altea 415a"
    console.log('📍 Paso 2: Buscar producto "das Altea 415a"');
    await page.fill('input[placeholder*="Buscar"]', 'das Altea 415a');
    await page.waitForTimeout(500);
    
    // 3. Click en botón de imágenes
    console.log('📍 Paso 3: Click en botón de imágenes');
    const imageButton = page.locator('button[title="Imágenes"]').first();
    await expect(imageButton).toBeVisible();
    await imageButton.click();
    
    // 4. Esperar modal
    console.log('📍 Paso 4: Esperar modal de imágenes');
    await page.waitForSelector('text=Gestionar Imágenes');
    
    // 5. Obtener ID del producto del modal
    const modalText = await page.textContent('body');
    console.log('Modal visible:', modalText?.includes('Gestionar Imágenes'));
    
    // 6. Crear imagen de prueba
    console.log('📍 Paso 5: Preparar imagen de prueba');
    const testImagePath = path.join(__dirname, '../fixtures/test-product-image.jpg');
    
    // Verificar si existe, si no, usar cualquier imagen del proyecto
    const fs = require('fs');
    let imagePath = testImagePath;
    if (!fs.existsSync(testImagePath)) {
      // Usar logo del proyecto como imagen de prueba
      imagePath = path.join(__dirname, '../../packages/frontend/public/logo-resona.svg');
      console.log('⚠️  Usando logo como imagen de prueba');
    }
    
    // 7. Subir imagen
    console.log('📍 Paso 6: Subir imagen');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(imagePath);
    
    // 8. Esperar a que se suba
    console.log('📍 Paso 7: Esperar subida');
    await page.waitForTimeout(2000);
    
    // 9. Verificar que aparece en el modal
    console.log('📍 Paso 8: Verificar previsualización en modal');
    const imagePreview = page.locator('img[alt*="Imagen"]').first();
    await expect(imagePreview).toBeVisible({ timeout: 5000 });
    
    // 10. Click en Guardar
    console.log('📍 Paso 9: Guardar cambios');
    const saveButton = page.locator('button:has-text("Guardar Cambios")');
    await saveButton.click();
    
    // 11. Esperar mensaje de éxito
    console.log('📍 Paso 10: Esperar confirmación');
    await page.waitForTimeout(1000);
    
    // 12. Obtener ID del producto
    const productRow = page.locator('tr:has-text("das Altea 415a")').first();
    const productId = await productRow.getAttribute('data-id') || '';
    console.log('📦 Product ID:', productId);
    
    // 13. Verificar en BD via API
    console.log('📍 Paso 11: Verificar en BD');
    const response = await page.request.get(`http://localhost:3001/api/v1/products?search=das Altea 415a`, {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('token'))}`
      }
    });
    
    const productsData = await response.json();
    console.log('📊 Productos encontrados:', productsData.data?.length);
    
    const product = productsData.data?.find((p: any) => p.name.includes('das Altea 415a'));
    
    console.log('📦 Producto:', {
      name: product?.name,
      mainImageUrl: product?.mainImageUrl,
      images: product?.images,
      imagesLength: product?.images?.length
    });
    
    // Verificaciones
    expect(product, 'Producto debe existir').toBeTruthy();
    expect(product.mainImageUrl, 'mainImageUrl debe existir').toBeTruthy();
    expect(product.images, 'images array debe existir').toBeTruthy();
    expect(product.images.length, 'images debe tener al menos 1 elemento').toBeGreaterThan(0);
    
    console.log('✅ Verificación BD: OK');
    
    // 14. Ir al catálogo público
    console.log('📍 Paso 12: Ir a catálogo público');
    await page.goto('http://localhost:3000/productos');
    await page.waitForLoadState('networkidle');
    
    // 15. Buscar el producto en catálogo
    console.log('📍 Paso 13: Buscar producto en catálogo');
    const productCard = page.locator(`text=das Altea 415a`).first();
    await expect(productCard).toBeVisible({ timeout: 5000 });
    
    // 16. Verificar que tiene imagen (no el placeholder)
    console.log('📍 Paso 14: Verificar imagen visible');
    
    // Encontrar la tarjeta del producto
    const card = page.locator('a').filter({ hasText: 'das Altea 415a' }).first();
    await expect(card).toBeVisible();
    
    // Verificar que tiene una imagen dentro
    const productImage = card.locator('img').first();
    await expect(productImage).toBeVisible({ timeout: 5000 });
    
    // Verificar que NO es el placeholder (Package icon)
    const imageSrc = await productImage.getAttribute('src');
    console.log('🖼️  Imagen SRC:', imageSrc);
    
    expect(imageSrc, 'Imagen debe tener src').toBeTruthy();
    expect(imageSrc, 'No debe ser placeholder SVG').not.toContain('data:image/svg');
    expect(imageSrc, 'Debe ser de localhost:3001').toContain('localhost:3001');
    expect(imageSrc, 'Debe ser de /uploads/products/').toContain('/uploads/products/');
    
    console.log('✅ Imagen visible en catálogo: OK');
    console.log('🎉 TEST COMPLETADO CON ÉXITO');
  });
  
  test('Verificar producto específico: das Altea 415a', async ({ page }) => {
    console.log('🧪 TEST: Verificar estado actual de "das Altea 415a"');
    
    // Ir al catálogo
    await page.goto('http://localhost:3000/productos');
    await page.waitForLoadState('networkidle');
    
    // Buscar producto
    const productCard = page.locator('text=das Altea 415a').first();
    
    if (await productCard.isVisible()) {
      console.log('✅ Producto visible en catálogo');
      
      // Encontrar la imagen
      const card = page.locator('a').filter({ hasText: 'das Altea 415a' }).first();
      const img = card.locator('img').first();
      
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        console.log('🖼️  Imagen actual:', src);
        
        if (src?.includes('data:image/svg')) {
          console.log('❌ PROBLEMA: Está usando placeholder');
        } else if (src?.includes('localhost:3001')) {
          console.log('✅ Imagen apunta correctamente al backend');
        } else {
          console.log('⚠️  Imagen apunta a:', src);
        }
      } else {
        console.log('❌ PROBLEMA: Imagen no visible');
      }
    } else {
      console.log('❌ PROBLEMA: Producto no visible en catálogo');
    }
  });
});
