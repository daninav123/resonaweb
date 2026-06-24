const axios = require('axios');

async function testContactAPI() {
  console.log('🧪 Probando API de solicitud de contacto...\n');

  const testData = {
    customerName: 'Test Usuario',
    customerPhone: '+34 666 777 888',
    customerEmail: 'test@example.com',
    eventType: 'Boda',
    attendees: 100,
    duration: 8,
    durationType: 'hours',
    eventDate: '2025-12-25',
    eventLocation: 'Valencia',
    selectedPack: null,
    selectedExtras: {},
    estimatedTotal: 1500.00,
    notes: 'Test de solicitud de contacto'
  };

  try {
    console.log('📤 Enviando solicitud...');
    const response = await axios.post('http://localhost:3001/api/v1/quote-requests', testData);
    
    console.log('\n✅ ÉXITO - Solicitud creada');
    console.log('ID:', response.data.data.id);
    console.log('Status:', response.data.data.status);
    console.log('Cliente:', response.data.data.customerName);
    console.log('Teléfono:', response.data.data.customerPhone);
    console.log('\nRespuesta completa:', JSON.stringify(response.data, null, 2));

    return response.data.data.id;
  } catch (error) {
    console.error('\n❌ ERROR al enviar solicitud:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

async function testGetQuoteRequests() {
  console.log('\n\n🧪 Probando GET de solicitudes (requiere token de admin)...\n');
  
  try {
    // Primero login como admin
    console.log('🔐 Haciendo login como admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@resona.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // Ahora obtener las solicitudes
    console.log('\n📥 Obteniendo solicitudes...');
    const response = await axios.get('http://localhost:3001/api/v1/quote-requests', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n✅ ÉXITO - Solicitudes obtenidas');
    console.log('Total de solicitudes:', response.data.data.length);
    console.log('\nPrimeras 3 solicitudes:');
    response.data.data.slice(0, 3).forEach((req, i) => {
      console.log(`\n${i + 1}. ${req.customerName || 'Sin nombre'}`);
      console.log(`   ID: ${req.id}`);
      console.log(`   Teléfono: ${req.customerPhone || 'N/A'}`);
      console.log(`   Email: ${req.customerEmail || 'N/A'}`);
      console.log(`   Estado: ${req.status}`);
      console.log(`   Total estimado: €${req.estimatedTotal || 0}`);
      console.log(`   Creado: ${new Date(req.createdAt).toLocaleString()}`);
    });

  } catch (error) {
    console.error('\n❌ ERROR al obtener solicitudes:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Ejecutar los tests
(async () => {
  try {
    await testContactAPI();
    await testGetQuoteRequests();
    console.log('\n\n🎉 TODOS LOS TESTS COMPLETADOS\n');
  } catch (error) {
    console.error('\n\n❌ TESTS FALLIDOS\n');
    process.exit(1);
  }
})();
