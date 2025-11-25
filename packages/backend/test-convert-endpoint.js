// Script para probar directamente el endpoint convert-to-order
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/v1';
const ADMIN_EMAIL = 'admin@resona.com';
const ADMIN_PASSWORD = 'Admin123!';

async function testConvertEndpoint() {
  console.log('🧪 TEST: Convertir Solicitud a Pedido\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Token obtenido\n');
    
    // 2. Obtener solicitudes
    console.log('2️⃣ Obteniendo solicitudes...');
    const quotesResponse = await fetch(`${API_URL}/quote-requests`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!quotesResponse.ok) {
      throw new Error(`Get quotes failed: ${quotesResponse.status}`);
    }
    
    const quotesData = await quotesResponse.json();
    const quotes = quotesData.data || [];
    
    console.log(`📊 Solicitudes totales: ${quotes.length}`);
    
    // Buscar una activa
    const activeQuote = quotes.find(q => 
      ['PENDING', 'CONTACTED', 'QUOTED'].includes(q.status)
    );
    
    if (!activeQuote) {
      console.log('❌ No hay solicitudes activas para probar');
      console.log('💡 Crea una solicitud desde /calculadora-evento primero');
      return;
    }
    
    console.log(`\n✅ Solicitud encontrada:`);
    console.log(`   ID: ${activeQuote.id}`);
    console.log(`   Email: ${activeQuote.customerEmail}`);
    console.log(`   Status: ${activeQuote.status}`);
    console.log(`   Pack: ${activeQuote.selectedPack || 'N/A'}`);
    console.log(`   Extras: ${JSON.stringify(activeQuote.selectedExtras)}`);
    console.log(`   Total: €${activeQuote.estimatedTotal || 0}`);
    
    // 3. Intentar convertir
    console.log(`\n3️⃣ Intentando convertir a pedido...`);
    console.log(`URL: POST ${API_URL}/quote-requests/${activeQuote.id}/convert-to-order\n`);
    
    const convertResponse = await fetch(
      `${API_URL}/quote-requests/${activeQuote.id}/convert-to-order`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const convertData = await convertResponse.json();
    
    console.log(`📊 Status: ${convertResponse.status}\n`);
    
    if (convertResponse.ok) {
      console.log('✅ ÉXITO - Pedido creado:\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(JSON.stringify(convertData, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      if (convertData.data?.order) {
        console.log(`✅ Order ID: ${convertData.data.order.id}`);
        console.log(`✅ Total: €${convertData.data.order.total}`);
        console.log(`✅ Items: ${convertData.data.order.items?.length || 0}`);
      }
    } else {
      console.log('❌ ERROR - No se pudo crear el pedido:\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(JSON.stringify(convertData, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🔍 Análisis del error:');
      console.log(`   Mensaje: ${convertData.message || 'No message'}`);
      console.log(`   Error: ${convertData.error || 'No error code'}`);
      
      if (convertData.details) {
        console.log(`   Detalles: ${JSON.stringify(convertData.details, null, 2)}`);
      }
    }
    
  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:');
    console.error(error);
  }
}

// Ejecutar
testConvertEndpoint().then(() => {
  console.log('\n🎉 Test completado');
  process.exit(0);
}).catch(err => {
  console.error('💥 Error fatal:', err);
  process.exit(1);
});
