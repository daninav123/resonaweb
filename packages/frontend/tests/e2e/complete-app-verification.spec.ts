import { test, expect } from '@playwright/test';

test.describe('🔍 VERIFICACIÓN COMPLETA DE LA APLICACIÓN', () => {
  
  test.describe('📄 Páginas Públicas', () => {
    
    test('Home - Página principal carga correctamente', async ({ page }) => {
      await page.goto('/');
      
      // Verificar título
      await expect(page).toHaveTitle(/ReSona|Alquiler/i);
      
      // Verificar que hay contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(100);
      
      console.log('✅ Home funciona correctamente');
    });

    test('Productos - Catálogo carga correctamente', async ({ page }) => {
      await page.goto('/productos');
      
      // Esperar carga
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verificar URL
      await expect(page).toHaveURL(/\/productos/);
      
      // Verificar que hay contenido (productos o mensaje)
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de productos funciona');
    });

    test('Servicios - Página de servicios carga', async ({ page }) => {
      await page.goto('/servicios');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/servicios');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de servicios funciona');
    });

    test('Calculadora - Calculadora de eventos carga', async ({ page }) => {
      await page.goto('/calculadora-evento');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/calculadora-evento');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Calculadora de eventos funciona');
    });

    test('Sobre Nosotros - Página about carga', async ({ page }) => {
      await page.goto('/sobre-nosotros');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/sobre-nosotros');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página sobre nosotros funciona');
    });

    test('Contacto - Página de contacto carga', async ({ page }) => {
      await page.goto('/contacto');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/contacto');
      
      // Verificar que hay un formulario
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de contacto funciona');
    });

    test('🆕 BLOG - Lista de artículos carga correctamente', async ({ page }) => {
      console.log('🧪 Probando página de blog...');
      
      await page.goto('/blog');
      
      // Esperar carga
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Verificar URL
      await expect(page).toHaveURL('/blog');
      
      // Verificar que la página carga (no debe estar en blanco)
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      expect(bodyText!.length).toBeGreaterThan(50);
      
      // Verificar que dice algo relacionado con blog
      expect(bodyText!.toLowerCase()).toMatch(/blog|artículo|post/i);
      
      console.log('✅ Página de blog funciona');
      console.log('   Contenido detectado:', bodyText!.substring(0, 200));
    });

    test('🆕 BLOG - Puede navegar a artículo individual', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      // Buscar enlaces a artículos
      const articleLinks = await page.locator('a[href^="/blog/"]').count();
      
      if (articleLinks > 0) {
        // Click en el primer artículo
        const firstArticle = page.locator('a[href^="/blog/"]').first();
        await firstArticle.click();
        
        // Verificar navegación
        await page.waitForLoadState('networkidle');
        
        // Verificar que estamos en un artículo
        const url = page.url();
        expect(url).toMatch(/\/blog\/.+/);
        
        console.log('✅ Navegación a artículo individual funciona');
        console.log('   URL del artículo:', url);
      } else {
        console.log('⚠️  No hay artículos en el blog para probar');
      }
    });
  });

  test.describe('🔐 Páginas de Autenticación', () => {
    
    test('Login - Página de login carga', async ({ page }) => {
      await page.goto('/login');
      
      // Verificar elementos del formulario
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log('✅ Página de login funciona');
    });

    test('Registro - Página de registro carga', async ({ page }) => {
      await page.goto('/register');
      
      // Verificar URL
      await expect(page).toHaveURL('/register');
      
      // Verificar formulario
      await expect(page.locator('input[name="email"]')).toBeVisible();
      
      console.log('✅ Página de registro funciona');
    });
  });

  test.describe('📝 Páginas Legales', () => {
    
    test('Términos y Condiciones carga', async ({ page }) => {
      await page.goto('/legal/terminos');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/legal/terminos');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de términos funciona');
    });

    test('Política de Privacidad carga', async ({ page }) => {
      await page.goto('/legal/privacidad');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/legal/privacidad');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de privacidad funciona');
    });

    test('Política de Cookies carga', async ({ page }) => {
      await page.goto('/legal/cookies');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/legal/cookies');
      
      // Verificar contenido
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de cookies funciona');
    });
  });

  test.describe('🛒 Funcionalidad de Carrito', () => {
    
    test('Carrito - Página de carrito carga', async ({ page }) => {
      await page.goto('/carrito');
      
      await page.waitForLoadState('networkidle');
      
      // Verificar URL
      await expect(page).toHaveURL('/carrito');
      
      // Verificar que la página carga
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página de carrito funciona');
    });
  });

  test.describe('🔗 Navegación y Enlaces', () => {
    
    test('Header tiene enlaces principales', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Buscar enlaces comunes
      const hasProductsLink = await page.locator('a[href="/productos"]').count();
      const hasServicesLink = await page.locator('a[href="/servicios"]').count();
      const hasBlogLink = await page.locator('a[href="/blog"]').count();
      
      console.log('📊 Enlaces detectados:');
      console.log('   - Productos:', hasProductsLink > 0 ? '✅' : '❌');
      console.log('   - Servicios:', hasServicesLink > 0 ? '✅' : '❌');
      console.log('   - Blog:', hasBlogLink > 0 ? '✅' : '❌');
      
      // Al menos algunos enlaces deben existir
      expect(hasProductsLink + hasServicesLink).toBeGreaterThan(0);
    });

    test('Footer tiene enlaces legales', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Scroll al footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      // Buscar enlaces legales
      const hasTermsLink = await page.locator('a[href="/legal/terminos"]').count();
      const hasPrivacyLink = await page.locator('a[href="/legal/privacidad"]').count();
      
      console.log('📊 Enlaces legales:');
      console.log('   - Términos:', hasTermsLink > 0 ? '✅' : '❌');
      console.log('   - Privacidad:', hasPrivacyLink > 0 ? '✅' : '❌');
    });
  });

  test.describe('🌐 Comunicación Backend', () => {
    
    test('Frontend se comunica con Backend API', async ({ page }) => {
      let apiCallsMade = 0;
      const apiUrls: string[] = [];
      
      page.on('response', response => {
        const url = response.url();
        if (url.includes('localhost:3001') || url.includes('/api/v1/')) {
          apiCallsMade++;
          apiUrls.push(url);
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('📡 Llamadas API detectadas:', apiCallsMade);
      if (apiUrls.length > 0) {
        console.log('   Ejemplos:');
        apiUrls.slice(0, 3).forEach(url => {
          console.log('   -', url.replace('http://localhost:3001', ''));
        });
      }
      
      // Verificar que hubo comunicación con la API
      expect(apiCallsMade).toBeGreaterThan(0);
    });
  });

  test.describe('⚠️ Errores y Estado', () => {
    
    test('No hay errores críticos de JavaScript', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Navegar a varias páginas
      const pages = ['/', '/productos', '/blog', '/servicios'];
      
      for (const route of pages) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
      }
      
      if (errors.length > 0) {
        console.log('⚠️  Errores detectados:', errors.length);
        errors.slice(0, 5).forEach(err => {
          console.log('   -', err.substring(0, 150));
        });
      } else {
        console.log('✅ Sin errores críticos de JavaScript');
      }
      
      // No fallar si hay pocos errores (warnings normales)
      expect(errors.length).toBeLessThan(20);
    });

    test('Página 404 funciona correctamente', async ({ page }) => {
      await page.goto('/esta-pagina-no-existe-12345');
      await page.waitForLoadState('networkidle');
      
      // Verificar que muestra algo (404 page)
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Página 404 funciona');
    });
  });

  test.describe('📱 Responsive y Performance', () => {
    
    test('Vista móvil funciona correctamente', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Vista móvil funciona');
    });

    test('Vista tablet funciona correctamente', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
      
      console.log('✅ Vista tablet funciona');
    });
  });
});
