import { test, expect } from '@playwright/test';

test.describe('Test Simple de Conexión', () => {
  
  test('1. Conectar a la página principal', async ({ page }) => {
    console.log('→ Navegando a http://localhost:3000');
    await page.goto('http://localhost:3000');
    console.log('✓ Página cargada');
    
    await expect(page).toHaveURL(/localhost:3000/);
    console.log('✓ URL correcta');
  });

  test('2. Verificar que hay contenido', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log('✓ Body visible');
  });

  test('3. Buscar texto Resona', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Esperar a que cargue algo
    await page.waitForLoadState('domcontentloaded');
    
    const text = await page.textContent('body');
    console.log('✓ Contenido encontrado:', text?.substring(0, 100));
  });
});
