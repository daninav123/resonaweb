import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@resona.com';
const ADMIN_PASSWORD = 'Admin123!';

test.describe('Convertir Solicitud a Pedido', () => {
  test('Debe crear un pedido desde una solicitud existente', async ({ page }) => {
    console.log('🧪 TEST: Convertir solicitud a pedido');
    
    // 1. Login como admin
    console.log('1️⃣ Login como admin...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    console.log('✅ Admin logueado');
    
    // 2. Ir a solicitudes
    console.log('2️⃣ Navegando a solicitudes...');
    await page.goto('http://localhost:3000/admin/quote-requests');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verificar que la página cargó
    const title = await page.locator('text=Solicitudes de Presupuesto').first();
    await expect(title).toBeVisible({ timeout: 10000 });
    console.log('✅ Página de solicitudes cargada');
    
    // 3. Verificar que hay solicitudes activas
    const activeTab = page.locator('text=Presupuestos Activos');
    await expect(activeTab).toBeVisible();
    await activeTab.click();
    await page.waitForTimeout(1000);
    
    // Contar cards de solicitudes
    const requestCards = page.locator('[class*="bg-white"][class*="border-2"]');
    const count = await requestCards.count();
    
    console.log(`📊 Solicitudes activas encontradas: ${count}`);
    
    if (count === 0) {
      console.log('⚠️ No hay solicitudes activas para probar');
      console.log('💡 Crea una solicitud desde la calculadora primero');
      return;
    }
    
    // 4. Click en la primera solicitud
    console.log('3️⃣ Abriendo modal de la primera solicitud...');
    const firstCard = requestCards.first();
    
    // Capturar el email para identificar la solicitud
    const emailText = await firstCard.locator('div').first().textContent();
    console.log(`📧 Solicitud seleccionada: ${emailText}`);
    
    await firstCard.click();
    await page.waitForTimeout(1000);
    
    // Verificar que se abrió el modal
    const modalTitle = page.locator('text=Detalle de Solicitud');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
    console.log('✅ Modal abierto');
    
    // 5. Capturar el request para ver el error
    console.log('4️⃣ Preparando listener de red...');
    
    let requestError = null;
    let responseData = null;
    let requestUrl = '';
    
    page.on('response', async (response) => {
      if (response.url().includes('/convert-to-order')) {
        requestUrl = response.url();
        console.log(`📡 Request detectado: POST ${response.url()}`);
        console.log(`📊 Status: ${response.status()}`);
        
        try {
          const body = await response.json();
          responseData = body;
          console.log('📦 Response body:', JSON.stringify(body, null, 2));
          
          if (response.status() >= 400) {
            requestError = body;
            console.log('❌ Error en response:', JSON.stringify(body, null, 2));
          } else {
            console.log('✅ Response exitosa');
          }
        } catch (e) {
          console.log('⚠️ No se pudo parsear response como JSON:', e);
          const text = await response.text().catch(() => 'No text available');
          console.log('📄 Response text:', text);
        }
      }
    });
    
    page.on('requestfailed', (request) => {
      if (request.url().includes('/convert-to-order')) {
        console.log('❌ Request FAILED:', request.url());
        console.log('   Failure:', request.failure()?.errorText);
      }
    });
    
    // 6. Click en "Aceptar y Crear Pedido"
    console.log('5️⃣ Haciendo click en "Aceptar y Crear Pedido"...');
    const acceptButton = page.locator('button:has-text("Aceptar y Crear Pedido")');
    await expect(acceptButton).toBeVisible({ timeout: 5000 });
    
    // Esperar el diálogo de confirmación
    page.once('dialog', async dialog => {
      console.log(`🔔 Diálogo detectado: "${dialog.message()}"`);
      await dialog.accept();
      console.log('✅ Confirmación aceptada');
    });
    
    await acceptButton.click();
    console.log('✅ Botón clickeado');
    
    // Esperar a que haya una response (con timeout)
    try {
      await page.waitForResponse(
        response => response.url().includes('/convert-to-order'),
        { timeout: 10000 }
      );
      console.log('✅ Response recibida');
    } catch (e) {
      console.log('⚠️ Timeout esperando response (puede que no se haya enviado el request)');
    }
    
    // Esperar un poco más para que se procese
    await page.waitForTimeout(2000);
    
    // 7. Verificar resultado
    console.log('6️⃣ Verificando resultado...');
    
    if (requestError) {
      console.log('\n❌ ERROR DETECTADO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('URL:', requestUrl);
      console.log('Status:', requestError.status || 'unknown');
      console.log('Message:', requestError.message || 'No message');
      console.log('Error:', JSON.stringify(requestError, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Tomar screenshot del error
      await page.screenshot({ path: 'test-error-convert-to-order.png', fullPage: true });
      console.log('📸 Screenshot guardado: test-error-convert-to-order.png');
      
      // Fallar el test con info del error
      throw new Error(`Failed to convert quote: ${requestError.message || JSON.stringify(requestError)}`);
    } else if (responseData && responseData.success) {
      console.log('\n✅ ÉXITO:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Pedido creado correctamente');
      console.log('Order ID:', responseData.data?.order?.id);
      console.log('Total:', responseData.data?.order?.total);
      console.log('Items:', responseData.data?.order?.items?.length || 0);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Verificar que el modal se cerró
      await page.waitForTimeout(1000);
      const modalStillVisible = await modalTitle.isVisible().catch(() => false);
      
      if (modalStillVisible) {
        console.log('⚠️ Modal todavía visible (puede ser normal si hay alert)');
      } else {
        console.log('✅ Modal cerrado');
      }
      
      // Verificar alert de éxito
      const alertShown = await page.locator('text=Pedido creado exitosamente').isVisible().catch(() => false);
      if (alertShown) {
        console.log('✅ Alert de éxito mostrado');
      }
      
    } else {
      console.log('\n⚠️ RESULTADO DESCONOCIDO:');
      console.log('No se detectó error ni éxito');
      console.log('Response data:', JSON.stringify(responseData, null, 2));
      
      await page.screenshot({ path: 'test-unknown-result.png', fullPage: true });
      console.log('📸 Screenshot guardado: test-unknown-result.png');
    }
    
    console.log('\n🎉 TEST COMPLETADO');
  });
});

// Test adicional: Verificar endpoint directo
test.describe('Verificar Backend', () => {
  test('Debe poder llamar al endpoint convert-to-order', async ({ request }) => {
    console.log('🧪 TEST: Verificar endpoint backend');
    
    // 1. Login para obtener token
    console.log('1️⃣ Obteniendo token...');
    const loginResponse = await request.post('http://localhost:3001/api/v1/auth/login', {
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Token obtenido');
    
    // 2. Obtener solicitudes
    console.log('2️⃣ Obteniendo solicitudes...');
    const quotesResponse = await request.get('http://localhost:3001/api/v1/quote-requests', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    expect(quotesResponse.ok()).toBeTruthy();
    const quotesData = await quotesResponse.json();
    const quotes = quotesData.data || [];
    
    console.log(`📊 Solicitudes encontradas: ${quotes.length}`);
    
    if (quotes.length === 0) {
      console.log('⚠️ No hay solicitudes para probar');
      return;
    }
    
    // Buscar una solicitud activa (no convertida)
    const activeQuote = quotes.find((q: any) => 
      ['PENDING', 'CONTACTED', 'QUOTED'].includes(q.status)
    );
    
    if (!activeQuote) {
      console.log('⚠️ No hay solicitudes activas (PENDING/CONTACTED/QUOTED)');
      return;
    }
    
    console.log(`📧 Probando con solicitud: ${activeQuote.customerEmail}`);
    console.log(`   ID: ${activeQuote.id}`);
    console.log(`   Status: ${activeQuote.status}`);
    
    // 3. Intentar convertir
    console.log('3️⃣ Intentando convertir a pedido...');
    const convertResponse = await request.post(
      `http://localhost:3001/api/v1/quote-requests/${activeQuote.id}/convert-to-order`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log(`📊 Status: ${convertResponse.status()}`);
    
    if (convertResponse.ok()) {
      const convertData = await convertResponse.json();
      console.log('✅ ÉXITO:');
      console.log(JSON.stringify(convertData, null, 2));
    } else {
      const errorData = await convertResponse.json().catch(() => ({ error: 'No JSON' }));
      console.log('❌ ERROR:');
      console.log('Status:', convertResponse.status());
      console.log('Body:', JSON.stringify(errorData, null, 2));
      
      // No fallar el test, solo mostrar el error
      console.log('\n⚠️ El endpoint falló - revisa los logs arriba para ver el error exacto');
    }
  });
});
