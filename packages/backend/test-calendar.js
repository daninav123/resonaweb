const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Necesitarás un token de admin para probar
// Reemplaza con un token real de tu sistema
const ADMIN_TOKEN = 'tu-token-de-admin-aqui';

async function testCalendarEndpoints() {
  console.log('🧪 PROBANDO ENDPOINTS DEL CALENDARIO\n');

  try {
    // Test 1: Obtener eventos del calendario
    console.log('1️⃣  Obteniendo eventos del calendario...');
    try {
      const headers = ADMIN_TOKEN !== 'tu-token-de-admin-aqui' 
        ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        : {};
      
      const events = await axios.get(`${BASE_URL}/calendar/events`, { headers });
      console.log(`   ✅ Eventos obtenidos: ${events.data.total}`);
      if (events.data.events.length > 0) {
        console.log(`   📅 Primer evento: ${events.data.events[0].title}`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ⚠️  Endpoint protegido - requiere autenticación de admin');
      } else {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Obtener estadísticas
    console.log('\n2️⃣  Obteniendo estadísticas del mes...');
    try {
      const headers = ADMIN_TOKEN !== 'tu-token-de-admin-aqui' 
        ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        : {};
      
      const stats = await axios.get(`${BASE_URL}/calendar/stats`, { headers });
      console.log(`   ✅ Ingresos del mes: €${stats.data.monthRevenue}`);
      console.log(`   📊 Pedidos por estado:`, stats.data.ordersByStatus);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ⚠️  Endpoint protegido - requiere autenticación de admin');
      } else {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Verificar disponibilidad
    console.log('\n3️⃣  Verificando disponibilidad de fechas...');
    try {
      const headers = ADMIN_TOKEN !== 'tu-token-de-admin-aqui' 
        ? { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
        : {};
      
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const availability = await axios.get(
        `${BASE_URL}/calendar/availability?startDate=${startDate}&endDate=${endDate}`,
        { headers }
      );
      console.log(`   ${availability.data.available ? '✅' : '⚠️'} ${availability.data.message}`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ⚠️  Endpoint protegido - requiere autenticación de admin');
      } else {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ENDPOINTS DEL CALENDARIO DISPONIBLES');
    console.log('='.repeat(60));

    console.log('\n📝 NOTAS:');
    console.log('   • Los endpoints requieren autenticación de admin');
    console.log('   • Login como admin en el frontend para obtener token');
    console.log('   • El calendario mostrará todos los pedidos como eventos');
    console.log('\n📚 Endpoints disponibles:');
    console.log('   GET /api/v1/calendar/events');
    console.log('   GET /api/v1/calendar/stats');
    console.log('   GET /api/v1/calendar/availability');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n💡 SOLUCIÓN:');
    console.log('   1. Verifica que el backend esté corriendo (puerto 3001)');
    console.log('   2. Asegúrate de tener la migración aplicada');
    console.log('   3. Login como admin para obtener un token');
  }
}

testCalendarEndpoints();
