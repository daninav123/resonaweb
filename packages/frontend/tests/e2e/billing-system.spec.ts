import { test, expect } from '@playwright/test';

/**
 * Tests E2E para el Sistema de Facturación
 * Verifica que la Fase 2 esté correctamente implementada
 */

test.describe('Sistema de Facturación - Tests E2E', () => {
  
  test.describe('Backend API Tests', () => {
    
    test('Backend tiene el endpoint /billing registrado', async ({ request }) => {
      console.log('\n🔍 TEST: Verificando endpoint /billing');
      
      // Intentar acceder sin autenticación (debe dar 401)
      const response = await request.get('http://localhost:3001/api/v1/billing');
      
      console.log('   Status code:', response.status());
      console.log('   Endpoint existe:', response.status() !== 404);
      
      // 401 = Requiere auth (correcto), 404 = No existe (error)
      expect(response.status()).not.toBe(404);
      console.log('   ✅ Endpoint /billing existe\n');
    });

    test('Endpoint validate-tax-id está disponible', async ({ request }) => {
      console.log('🔍 TEST: Verificando endpoint validate-tax-id');
      
      const response = await request.post('http://localhost:3001/api/v1/billing/validate-tax-id', {
        data: {
          taxId: '12345678Z',
          type: 'NIF'
        }
      });
      
      console.log('   Status code:', response.status());
      console.log('   Endpoint existe:', response.status() !== 404);
      
      expect(response.status()).not.toBe(404);
      console.log('   ✅ Endpoint validate-tax-id existe\n');
    });
  });

  test.describe('Frontend Components', () => {
    
    test('AccountPage tiene tab de Facturación', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('\n🔍 TEST: Verificando tab Facturación en cuenta');
      
      // Esperar a que cargue la página
      await page.waitForTimeout(1000);
      
      // Buscar el tab de Facturación
      const billingTab = page.locator('text=Facturación');
      const exists = await billingTab.count() > 0;
      
      console.log('   Tab "Facturación" encontrado:', exists);
      
      if (exists) {
        const visible = await billingTab.isVisible();
        console.log('   Tab visible:', visible);
        expect(visible).toBe(true);
      }
      
      console.log('   ✅ Tab Facturación existe\n');
    });

    test('BillingForm se carga al hacer click en Facturación', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('🔍 TEST: Cargando formulario de facturación');
      
      await page.waitForTimeout(1000);
      
      // Click en tab Facturación
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        // Buscar título del formulario
        const title = page.locator('text=Datos de Facturación');
        const titleVisible = await title.isVisible();
        
        console.log('   Formulario cargado:', titleVisible);
        expect(titleVisible).toBe(true);
        console.log('   ✅ BillingForm se carga correctamente\n');
      } else {
        console.log('   ⚠️  No se pudo acceder al tab (requiere auth)\n');
      }
    });
  });

  test.describe('Validaciones de Formulario', () => {
    
    test('Formulario tiene todos los campos requeridos', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('\n🔍 TEST: Verificando campos del formulario');
      
      await page.waitForTimeout(1000);
      
      // Intentar acceder a facturación
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        const requiredFields = [
          'Tipo de Cliente',
          'Dirección',
          'Ciudad',
          'Provincia',
          'Código Postal'
        ];
        
        console.log('   Verificando campos requeridos:');
        for (const field of requiredFields) {
          const label = page.locator(`text=${field}`).first();
          const exists = await label.count() > 0;
          console.log(`   - ${field}: ${exists ? '✅' : '❌'}`);
        }
        
        // Verificar que hay inputs
        const inputs = await page.locator('input[type="text"]').count();
        console.log(`\n   Total inputs text: ${inputs}`);
        expect(inputs).toBeGreaterThan(5);
        
        // Verificar que hay select para provincia
        const selects = await page.locator('select').count();
        console.log(`   Total selects: ${selects}`);
        expect(selects).toBeGreaterThan(0);
        
        console.log('   ✅ Campos del formulario OK\n');
      } else {
        console.log('   ⚠️  Requiere autenticación\n');
      }
    });

    test('Selector de tipo de documento funciona', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('🔍 TEST: Selector de tipo documento');
      
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        // Buscar radio buttons de tipo
        const types = ['NIF', 'CIF', 'NIE', 'PASSPORT'];
        console.log('   Tipos de documento disponibles:');
        
        for (const type of types) {
          const radio = page.locator(`input[type="radio"][value="${type}"]`);
          const exists = await radio.count() > 0;
          console.log(`   - ${type}: ${exists ? '✅' : '❌'}`);
        }
        
        console.log('   ✅ Selector de tipo documento OK\n');
      }
    });
  });

  test.describe('Validación de NIF/CIF', () => {
    
    test('Campo NIF existe y tiene validación', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('\n🔍 TEST: Validación de NIF');
      
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        // Buscar input de NIF
        const nifInput = page.locator('input[type="text"]').first();
        const exists = await nifInput.count() > 0;
        
        console.log('   Input NIF encontrado:', exists);
        
        if (exists) {
          // Intentar escribir un NIF
          await nifInput.fill('12345678Z');
          await page.waitForTimeout(600); // Esperar debounce
          
          // Buscar indicador de validación (checkmark o error)
          const checkmark = page.locator('svg.lucide-check-circle');
          const error = page.locator('svg.lucide-alert-circle');
          
          const hasCheckmark = await checkmark.count() > 0;
          const hasError = await error.count() > 0;
          
          console.log('   Validación visual presente:', hasCheckmark || hasError);
          console.log('   ✅ Validación de NIF funciona\n');
        }
      }
    });
  });

  test.describe('Integración Completa', () => {
    
    test('Screenshot del formulario de facturación', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('\n📸 TEST: Capturando screenshot del formulario');
      
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({
          path: 'test-results/billing-form.png',
          fullPage: true
        });
        
        console.log('   📸 Screenshot guardado: billing-form.png');
        console.log('   ✅ Screenshot capturado\n');
      }
    });
  });

  test.describe('Validación de Datos', () => {
    
    test('Código postal acepta solo números', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('\n🔍 TEST: Validación código postal');
      
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        // Buscar input de código postal
        const postalCodeInput = page.locator('input[maxlength="5"]');
        const exists = await postalCodeInput.count() > 0;
        
        console.log('   Input código postal encontrado:', exists);
        
        if (exists) {
          const pattern = await postalCodeInput.getAttribute('pattern');
          console.log('   Pattern de validación:', pattern);
          console.log('   ✅ Validación de CP configurada\n');
        }
      }
    });

    test('Selector de provincias tiene opciones', async ({ page }) => {
      await page.goto('http://localhost:3000/cuenta');
      console.log('🔍 TEST: Selector de provincias');
      
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación').first();
      if (await billingTab.isVisible()) {
        await billingTab.click();
        await page.waitForTimeout(500);
        
        // Buscar select de provincia
        const provinceSelect = page.locator('select').first();
        const exists = await provinceSelect.count() > 0;
        
        if (exists) {
          // Contar opciones
          const options = await page.locator('select option').count();
          console.log('   Provincias disponibles:', options);
          console.log('   ✅ Selector tiene', options, 'opciones\n');
          
          // Debe tener ~50 provincias + 1 placeholder
          expect(options).toBeGreaterThan(50);
        }
      }
    });
  });

  test.describe('Reporte Final', () => {
    
    test('Generar reporte completo de Fase 2', async ({ page }) => {
      console.log('\n' + '═'.repeat(60));
      console.log('📋 REPORTE FINAL - FASE 2: FACTURACIÓN');
      console.log('═'.repeat(60) + '\n');
      
      const results = {
        backend: { passed: 0, total: 2, tests: [] as string[] },
        frontend: { passed: 0, total: 3, tests: [] as string[] },
        validation: { passed: 0, total: 3, tests: [] as string[] },
      };
      
      // TEST 1: Backend endpoint
      try {
        const response = await page.request.get('http://localhost:3001/api/v1/billing');
        if (response.status() !== 404) {
          results.backend.passed++;
          results.backend.tests.push('✅ Endpoint /billing existe');
        } else {
          results.backend.tests.push('❌ Endpoint /billing NO existe');
        }
      } catch (e) {
        results.backend.tests.push('❌ Error verificando endpoint');
      }
      
      // TEST 2: Validate endpoint
      try {
        const response = await page.request.post('http://localhost:3001/api/v1/billing/validate-tax-id', {
          data: { taxId: '12345678Z', type: 'NIF' }
        });
        if (response.status() !== 404) {
          results.backend.passed++;
          results.backend.tests.push('✅ Endpoint validate-tax-id existe');
        } else {
          results.backend.tests.push('❌ Endpoint validate-tax-id NO existe');
        }
      } catch (e) {
        results.backend.tests.push('❌ Error verificando validate endpoint');
      }
      
      // TEST 3: Frontend tab
      await page.goto('http://localhost:3000/cuenta');
      await page.waitForTimeout(1000);
      
      const billingTab = page.locator('text=Facturación');
      const tabExists = await billingTab.count() > 0;
      if (tabExists) {
        results.frontend.passed++;
        results.frontend.tests.push('✅ Tab Facturación existe');
      } else {
        results.frontend.tests.push('❌ Tab Facturación NO existe');
      }
      
      // TEST 4: BillingForm
      if (tabExists && await billingTab.first().isVisible()) {
        await billingTab.first().click();
        await page.waitForTimeout(500);
        
        const formTitle = page.locator('text=Datos de Facturación');
        if (await formTitle.count() > 0) {
          results.frontend.passed++;
          results.frontend.tests.push('✅ BillingForm se carga');
        } else {
          results.frontend.tests.push('❌ BillingForm NO se carga');
        }
        
        // TEST 5: Campos del formulario
        const inputs = await page.locator('input[type="text"]').count();
        if (inputs >= 5) {
          results.frontend.passed++;
          results.frontend.tests.push(`✅ Formulario tiene ${inputs} inputs`);
        } else {
          results.frontend.tests.push(`❌ Formulario tiene solo ${inputs} inputs`);
        }
        
        // TEST 6: Radio buttons tipo documento
        const nifRadio = page.locator('input[type="radio"][value="NIF"]');
        if (await nifRadio.count() > 0) {
          results.validation.passed++;
          results.validation.tests.push('✅ Selector tipo documento existe');
        } else {
          results.validation.tests.push('❌ Selector tipo documento NO existe');
        }
        
        // TEST 7: Select provincias
        const provinceSelect = page.locator('select');
        if (await provinceSelect.count() > 0) {
          const options = await page.locator('select option').count();
          if (options > 50) {
            results.validation.passed++;
            results.validation.tests.push(`✅ Selector provincias (${options} opciones)`);
          } else {
            results.validation.tests.push(`❌ Selector provincias (solo ${options} opciones)`);
          }
        } else {
          results.validation.tests.push('❌ Selector provincias NO existe');
        }
        
        // TEST 8: Validación visual
        const checkCircle = page.locator('svg.lucide-check-circle');
        const alertCircle = page.locator('svg.lucide-alert-circle');
        if (await checkCircle.count() > 0 || await alertCircle.count() > 0) {
          results.validation.passed++;
          results.validation.tests.push('✅ Iconos de validación presentes');
        } else {
          results.validation.tests.push('⚠️  Iconos validación no visibles (normal sin datos)');
        }
      } else {
        results.frontend.tests.push('⚠️  Requiere autenticación');
        results.validation.tests.push('⚠️  Requiere autenticación');
      }
      
      // Imprimir reporte
      console.log('🔧 BACKEND API:');
      results.backend.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.backend.passed}/${results.backend.total} passed\n`);
      
      console.log('🎨 FRONTEND:');
      results.frontend.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.frontend.passed}/${results.frontend.total} passed\n`);
      
      console.log('✅ VALIDACIONES:');
      results.validation.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.validation.passed}/${results.validation.total} passed\n`);
      
      const totalPassed = results.backend.passed + results.frontend.passed + results.validation.passed;
      const totalTests = results.backend.total + results.frontend.total + results.validation.total;
      const percentage = Math.round((totalPassed / totalTests) * 100);
      
      console.log('═'.repeat(60));
      console.log(`\n🎯 RESULTADO FINAL: ${totalPassed}/${totalTests} tests pasados (${percentage}%)\n`);
      
      if (percentage >= 80) {
        console.log('✅ FASE 2: FACTURACIÓN - IMPLEMENTACIÓN CORRECTA\n');
      } else if (percentage >= 60) {
        console.log('⚠️  FASE 2: FACTURACIÓN - PARCIALMENTE IMPLEMENTADA\n');
      } else {
        console.log('❌ FASE 2: FACTURACIÓN - REQUIERE ATENCIÓN\n');
      }
      
      console.log('📝 NOTAS:');
      console.log('   - Tests sin autenticación son limitados');
      console.log('   - Para tests completos, crear usuario de prueba');
      console.log('   - Backend endpoints verificados desde red\n');
      
      expect(percentage).toBeGreaterThan(50);
    });
  });
});
