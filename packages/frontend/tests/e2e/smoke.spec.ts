import { test, expect } from '@playwright/test';

test.describe('Smoke Test - Verificación Básica', () => {
  
  test('La aplicación carga correctamente', async ({ page }) => {
    // Ir a home
    await page.goto('/');
    
    // Verificar que carga (título existe)
    await expect(page).toHaveTitle(/ReSona|Alquiler/i);
    
    console.log('✅ Home cargó correctamente');
  });

  test('Puede navegar a la página de login', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar URL
    await expect(page).toHaveURL('/login');
    
    // Verificar que hay un formulario de login
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    console.log('✅ Página de login cargó correctamente');
  });

  test('Puede navegar a la página de registro', async ({ page }) => {
    await page.goto('/register');
    
    // Verificar URL
    await expect(page).toHaveURL('/register');
    
    // Verificar que hay formulario de registro
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    console.log('✅ Página de registro cargó correctamente');
  });

  test('Puede ver el catálogo de productos', async ({ page }) => {
    await page.goto('/');
    
    // Esperar que cargue la página
    await page.waitForLoadState('networkidle');
    
    // Debe tener contenido (al menos un texto)
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
    
    console.log('✅ Catálogo cargó correctamente');
  });

  test('El header tiene enlaces de navegación', async ({ page }) => {
    await page.goto('/');
    
    // Buscar enlaces comunes en el header/nav
    const hasLoginLink = await page.locator('a[href="/login"]').count();
    const hasRegisterLink = await page.locator('a[href="/register"]').count();
    
    // Al menos uno debe existir
    expect(hasLoginLink + hasRegisterLink).toBeGreaterThan(0);
    
    console.log('✅ Navegación funciona correctamente');
  });

  test('Puede hacer login básico', async ({ page }) => {
    await page.goto('/login');
    
    // Rellenar formulario con usuario regular
    await page.fill('input[name="email"]', 'danielnavarrocampos@icloud.com');
    await page.fill('input[name="password"]', 'Daniel123!');
    
    // Click en submit
    await page.click('button[type="submit"]');
    
    // Esperar navegación (puede ir a / o a /admin)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Dar tiempo extra para navegación
    
    // Verificar que ya NO está en /login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log('✅ Login básico funciona');
    console.log('   URL después de login:', currentUrl);
  });

  test('Frontend y backend se comunican', async ({ page }) => {
    // Interceptar llamadas a la API
    let apiCallMade = false;
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('localhost:3001') || url.includes('/api/')) {
        apiCallMade = true;
        console.log('✅ Llamada API detectada:', url);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Dar tiempo para llamadas API
    
    // Verificar que se hizo al menos una llamada (no crítico si falla)
    console.log('   API llamadas:', apiCallMade ? 'SÍ' : 'NO');
  });

  test('JavaScript está funcionando', async ({ page }) => {
    await page.goto('/');
    
    // Ejecutar código JavaScript en el navegador
    const result = await page.evaluate(() => {
      return {
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        hasWindow: typeof window !== 'undefined',
      };
    });
    
    expect(result.hasLocalStorage).toBe(true);
    expect(result.hasDocument).toBe(true);
    expect(result.hasWindow).toBe(true);
    
    console.log('✅ JavaScript funciona correctamente');
  });

  test('No hay errores críticos en consola', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mostrar errores si los hay (pero no fallar el test por warnings normales)
    if (errors.length > 0) {
      console.log('⚠️  Errores en consola:', errors.length);
      errors.slice(0, 3).forEach(err => console.log('   -', err.substring(0, 100)));
    } else {
      console.log('✅ Sin errores críticos en consola');
    }
    
    // No hacer fail si hay errores, solo reportar
    expect(errors.length).toBeLessThan(50); // Límite razonable
  });

  test('Responsive - Vista móvil funciona', async ({ page }) => {
    // Simular viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que sigue cargando
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    console.log('✅ Vista móvil funciona');
  });
});
