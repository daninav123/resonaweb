import { test, expect } from '@playwright/test';

test.describe('🆕 Test Simple del Blog', () => {
  
  test('Backend responde con datos del blog', async ({ page }) => {
    console.log('🧪 Verificando que el backend responde...');
    
    // Interceptar llamadas a la API
    const responses: any[] = [];
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/blog/posts') || url.includes('/blog/categories')) {
        const status = response.status();
        console.log(`📡 API llamada: ${url} - Status: ${status}`);
        
        try {
          const data = await response.json();
          responses.push({ url, status, data });
          console.log(`📦 Datos recibidos:`, JSON.stringify(data).substring(0, 200));
        } catch (e) {
          console.log('⚠️ No se pudo parsear JSON');
        }
      }
    });
    
    // Capturar errores de console
    const errors: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        console.log('❌ Error en consola:', text.substring(0, 200));
      } else if (text.includes('blog') || text.includes('Blog')) {
        console.log('💬 Console:', text.substring(0, 200));
      }
    });
    
    // Ir a la página del blog
    await page.goto('/blog');
    
    // Esperar a que cargue
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Esperar 3 segundos
    
    // Verificar URL
    await expect(page).toHaveURL('/blog');
    
    // Verificar que se hicieron llamadas a la API
    console.log(`\n📊 Total de llamadas API del blog: ${responses.length}`);
    expect(responses.length).toBeGreaterThan(0);
    
    // Verificar contenido de la página
    const bodyText = await page.textContent('body');
    console.log(`\n📄 Longitud del contenido: ${bodyText?.length} caracteres`);
    console.log(`📝 Primeros 500 caracteres:`, bodyText?.substring(0, 500));
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/blog-simple-test.png', fullPage: true });
    console.log('📸 Screenshot guardado en: test-results/blog-simple-test.png');
    
    // Verificar que hay contenido
    expect(bodyText).toBeTruthy();
    
    // Verificar elementos específicos del blog
    const h1Exists = await page.locator('h1').count();
    console.log(`\n🔍 Elementos H1 encontrados: ${h1Exists}`);
    
    const articlesCount = await page.locator('article').count();
    console.log(`📰 Artículos encontrados: ${articlesCount}`);
    
    // Si hay respuestas de la API, verificar que tienen posts
    if (responses.length > 0) {
      const postsResponse = responses.find(r => r.url.includes('/blog/posts'));
      if (postsResponse) {
        console.log('\n✅ Respuesta de posts encontrada:');
        console.log('   Status:', postsResponse.status);
        console.log('   Posts:', postsResponse.data?.posts?.length || 0);
      }
    }
    
    // Mostrar errores si los hay
    if (errors.length > 0) {
      console.log(`\n⚠️ ${errors.length} errores detectados en consola`);
      errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 150)}`);
      });
    }
  });
});
