import { test, expect } from '@playwright/test';

test.describe('Test ULTRA Simple', () => {
  
  test('Solo cargar la página sin esperar nada', async ({ page }) => {
    // Timeout muy corto
    page.setDefaultTimeout(5000);
    
    console.log('Intentando ir a localhost:3000...');
    
    try {
      // waitUntil: 'commit' - No espera a que todo cargue, solo que empiece a cargar
      await page.goto('http://localhost:3000', { 
        waitUntil: 'commit',
        timeout: 5000 
      });
      
      console.log('✓ Página empezó a cargar');
      
      // Ver qué URL tenemos
      const url = page.url();
      console.log('URL actual:', url);
      
      // Solo verificar que no es error
      expect(url).toContain('localhost');
      
    } catch (error) {
      console.error('ERROR:', error);
      throw error;
    }
  });
});
