import { test, expect } from '@playwright/test';

test.describe('Diagnóstico de Conexión', () => {
  test('debe poder conectar a localhost:3000', async ({ page }) => {
    console.log('🔍 Intentando conectar a http://localhost:3000...');
    
    try {
      await page.goto('http://localhost:3000', { timeout: 10000 });
      console.log('✅ Conexión exitosa!');
      
      const title = await page.title();
      console.log('📄 Título de página:', title);
      
      await expect(page).toHaveURL(/localhost:3000/);
      console.log('✅ Test pasó!');
    } catch (error) {
      console.error('❌ Error al conectar:', error);
      throw error;
    }
  });

  test('debe poder ver texto en la página', async ({ page }) => {
    console.log('🔍 Navegando y buscando texto...');
    
    await page.goto('http://localhost:3000', { timeout: 10000 });
    
    const bodyText = await page.locator('body').textContent();
    console.log('📝 Texto encontrado en body (primeros 200 chars):', bodyText?.substring(0, 200));
    
    // Verificar que hay contenido
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });
});
