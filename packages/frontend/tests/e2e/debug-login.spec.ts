import { test, expect } from '@playwright/test';

test('DEBUG: Login paso a paso', async ({ page }) => {
  // Interceptar errores de consola
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('🔴 ERROR en consola:', msg.text());
    }
  });

  // Interceptar peticiones a API
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('3001')) {
      console.log('📤 REQUEST:', request.method(), request.url());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('3001')) {
      const status = response.status();
      console.log('📥 RESPONSE:', status, response.url());
      
      try {
        const body = await response.text();
        console.log('   Body:', body.substring(0, 200));
      } catch (e) {
        console.log('   (no body)');
      }
    }
  });

  console.log('\n🔵 1. Ir a /login');
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  console.log('\n🔵 2. Verificar que está en /login');
  expect(page.url()).toContain('/login');
  
  console.log('\n🔵 3. Verificar que formulario existe');
  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');
  const submitButton = page.locator('button[type="submit"]');
  
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();
  
  console.log('\n🔵 4. Rellenar con credenciales de usuario regular');
  await emailInput.fill('danielnavarrocampos@icloud.com');
  await passwordInput.fill('Daniel123!');
  
  console.log('\n🔵 5. Verificar que se rellenó correctamente');
  const emailValue = await emailInput.inputValue();
  const passwordValue = await passwordInput.inputValue();
  console.log('   Email:', emailValue);
  console.log('   Password:', '*'.repeat(passwordValue.length));
  
  console.log('\n🔵 6. Click en submit');
  await submitButton.click();
  
  console.log('\n🔵 7. Esperando respuesta (5 segundos)...');
  await page.waitForTimeout(5000);
  
  console.log('\n🔵 8. URL después de login:', page.url());
  
  // Verificar si hay errores visibles en la página
  const errorMessage = page.locator('text=/error|incorrecto|invalid/i');
  const hasError = await errorMessage.count() > 0;
  
  if (hasError) {
    const errorText = await errorMessage.first().textContent();
    console.log('❌ ERROR VISIBLE:', errorText);
  }
  
  // Ver si hay errores en consola
  if (errors.length > 0) {
    console.log('\n❌ Errores en consola:', errors.length);
    errors.forEach(err => console.log('   -', err.substring(0, 150)));
  }
  
  // Tomar screenshot
  await page.screenshot({ path: 'debug-login-result.png', fullPage: true });
  console.log('\n📸 Screenshot guardado: debug-login-result.png');
  
  // No hacemos expect que falle, solo mostramos info
  console.log('\n✅ Test de debug completado');
});

test('DEBUG: Login con admin', async ({ page }) => {
  console.log('\n🔵 Testing login con ADMIN');
  
  // Interceptar API
  page.on('response', async response => {
    if (response.url().includes('/api/auth/login') || response.url().includes('/login')) {
      console.log('📥 Login response:', response.status());
      try {
        const body = await response.json();
        console.log('   Response body:', JSON.stringify(body, null, 2).substring(0, 300));
      } catch {}
    }
  });

  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@resona.com');
  await page.fill('input[name="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(5000);
  
  console.log('   URL final:', page.url());
  console.log('   Expected: NOT /login');
  console.log('   Success:', !page.url().includes('/login'));
  
  await page.screenshot({ path: 'debug-login-admin.png', fullPage: true });
});
