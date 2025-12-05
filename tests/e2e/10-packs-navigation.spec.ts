import { test, expect } from '@playwright/test';

test.describe('Navegación de Packs', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de productos
    await page.goto('http://localhost:3000/productos');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Esperar a que React Query cargue los datos
  });

  test('Debe cargar la lista de packs sin errores', async ({ page }) => {
    // Esperar a que carguen los productos
    await page.waitForSelector('[data-testid="product-card"], .grid', { timeout: 10000 });
    
    // Verificar que hay productos en la página
    const productCards = await page.locator('.grid > div').count();
    console.log(`📦 Productos encontrados: ${productCards}`);
    
    expect(productCards).toBeGreaterThan(0);
  });

  test('Debe poder hacer clic en un pack y ver su detalle', async ({ page, context }) => {
    // Escuchar todas las peticiones de red
    const requests: any[] = [];
    const errors404: string[] = [];
    
    page.on('response', response => {
      requests.push({
        url: response.url(),
        status: response.status()
      });
      
      if (response.status() === 404) {
        errors404.push(response.url());
        console.log(`❌ 404 detectado: ${response.url()}`);
      }
    });

    // Esperar a que carguen los productos
    await page.waitForSelector('.grid > div', { timeout: 10000 });
    
    // Obtener el primer producto/pack
    const firstProduct = page.locator('.grid > div').first();
    await firstProduct.waitFor({ state: 'visible' });
    
    // Extraer el nombre del pack antes de hacer clic
    const packName = await firstProduct.locator('h3, h2, .font-bold').first().textContent();
    console.log(`\n🎯 Haciendo clic en: ${packName}`);
    
    // Extraer el href del enlace
    const link = firstProduct.locator('a').first();
    const href = await link.getAttribute('href');
    console.log(`🔗 URL del pack: ${href}`);
    
    // Hacer clic en el pack
    await link.click();
    
    // Esperar a que se complete la navegación
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Esperar a que React Query intente cargar
    
    // Verificar la URL actual
    const currentUrl = page.url();
    console.log(`📍 URL actual: ${currentUrl}`);
    
    // Verificar que no estamos en la página de error o redirección
    const isErrorPage = await page.locator('text=no encontrado').count() > 0;
    const isProductsPage = currentUrl.includes('/productos') && !currentUrl.includes('/productos/');
    
    if (isErrorPage || isProductsPage) {
      console.log(`\n❌ ERROR: Redirigido a página de error o productos`);
      console.log(`   - Es página de error: ${isErrorPage}`);
      console.log(`   - Es lista de productos: ${isProductsPage}`);
    }
    
    // Mostrar todos los errores 404
    if (errors404.length > 0) {
      console.log(`\n❌ ERRORES 404 ENCONTRADOS (${errors404.length}):`);
      errors404.forEach(url => console.log(`   - ${url}`));
    }
    
    // Verificar que no hay errores 404
    expect(errors404.length).toBe(0);
    
    // Verificar que estamos en la página de detalle del pack
    expect(currentUrl).toContain('/packs/');
    expect(isErrorPage).toBe(false);
  });

  test('Debe cargar correctamente un pack específico conocido', async ({ page }) => {
    const errors404: string[] = [];
    
    page.on('response', response => {
      if (response.status() === 404) {
        errors404.push(response.url());
        console.log(`❌ 404: ${response.url()}`);
      }
    });

    // Primero obtener la lista de packs desde el API
    const apiResponse = await page.request.get('http://localhost:3001/api/v1/products/packs');
    expect(apiResponse.ok()).toBeTruthy();
    
    const data = await apiResponse.json();
    const packs = data.packs || data || [];
    
    console.log(`\n📦 Total packs en API: ${packs.length}`);
    
    if (packs.length > 0) {
      const firstPack = packs[0];
      console.log(`\n🎯 Probando pack:`);
      console.log(`   - Nombre: ${firstPack.name}`);
      console.log(`   - Slug: ${firstPack.slug}`);
      console.log(`   - ID: ${firstPack.id}`);
      
      // Navegar directamente al pack
      await page.goto(`http://localhost:3000/packs/${firstPack.slug}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verificar que no hay mensaje de error
      const errorMessage = await page.locator('text=no encontrado').count();
      const currentUrl = page.url();
      
      console.log(`📍 URL final: ${currentUrl}`);
      console.log(`❌ Mensaje de error visible: ${errorMessage > 0}`);
      
      // Mostrar errores 404
      if (errors404.length > 0) {
        console.log(`\n❌ ERRORES 404 (${errors404.length}):`);
        errors404.forEach(url => console.log(`   - ${url}`));
      }
      
      // Verificar que no hay errores
      expect(errors404.length).toBe(0);
      expect(errorMessage).toBe(0);
      expect(currentUrl).toContain(`/packs/${firstPack.slug}`);
    }
  });

  test('Debug: Verificar estructura de los packs en el API', async ({ page }) => {
    const apiResponse = await page.request.get('http://localhost:3001/api/v1/products/packs');
    expect(apiResponse.ok()).toBeTruthy();
    
    const data = await apiResponse.json();
    const packs = data.packs || data || [];
    
    console.log(`\n📊 ANÁLISIS DE PACKS:`);
    console.log(`Total packs: ${packs.length}`);
    
    if (packs.length > 0) {
      console.log(`\n📦 PRIMER PACK (ejemplo):`);
      const pack = packs[0];
      console.log(JSON.stringify({
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
        isPack: pack.isPack,
        isActive: pack.isActive,
        pricePerDay: pack.pricePerDay,
        categoryRef: pack.categoryRef
      }, null, 2));
      
      // Verificar que tienen slug
      const packsWithSlug = packs.filter((p: any) => p.slug);
      const packsWithoutSlug = packs.filter((p: any) => !p.slug);
      
      console.log(`\n✅ Packs con slug: ${packsWithSlug.length}`);
      if (packsWithoutSlug.length > 0) {
        console.log(`❌ Packs SIN slug: ${packsWithoutSlug.length}`);
        packsWithoutSlug.forEach((p: any) => {
          console.log(`   - ${p.name} (ID: ${p.id})`);
        });
      }
    }
  });
});
