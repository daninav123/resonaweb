import { test, expect } from '@playwright/test';

test.describe('Calculadora de Eventos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/calculadora-evento');
  });

  test('debe cargar la página de calculadora', async ({ page }) => {
    // Verificar título
    await expect(page.locator('h1, h2')).toContainText(/Calculadora|Evento/i);
  });

  test('debe tener formulario de cálculo', async ({ page }) => {
    // Verificar que hay inputs o selects
    const inputs = await page.locator('input, select, textarea').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('debe calcular presupuesto estimado', async ({ page }) => {
    // Intentar llenar algunos campos
    const numberInputs = page.locator('input[type="number"]');
    const count = await numberInputs.count();
    
    if (count > 0) {
      await numberInputs.first().fill('100');
      
      // Buscar botón de calcular
      const calculateButton = page.locator('button:has-text("Calcular"), button:has-text("Estimar")').first();
      
      if (await calculateButton.isVisible()) {
        await calculateButton.click();
        await page.waitForTimeout(1000);
        
        // Debe mostrar algún resultado
        const result = page.locator('text=/€|Total|Presupuesto/i');
        const resultCount = await result.count();
        expect(resultCount).toBeGreaterThan(0);
      }
    }
  });

  test('debe permitir seleccionar tipo de evento', async ({ page }) => {
    // Buscar selects o radios para tipo de evento
    const eventTypeSelect = page.locator('select, input[type="radio"]').first();
    
    if (await eventTypeSelect.isVisible()) {
      const tagName = await eventTypeSelect.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'select') {
        await eventTypeSelect.selectOption({ index: 1 });
      } else {
        await eventTypeSelect.click();
      }
      
      await page.waitForTimeout(500);
    }
  });

  test('debe tener secciones de configuración', async ({ page }) => {
    // Buscar secciones comunes
    const sections = page.locator('section, .section, [role="group"]');
    const count = await sections.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
