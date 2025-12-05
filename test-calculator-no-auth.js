/**
 * Test E2E: Calculadora de Eventos sin Autenticación
 * Verifica que los endpoints funcionen sin estar logeado
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testCalculatorWithoutAuth() {
  console.log('🧪 Test E2E: Calculadora sin Autenticación\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health check
  console.log('1️⃣ Test: Health check del backend...');
  try {
    const response = await axios.get('http://localhost:3001/health');
    if (response.status === 200) {
      console.log('✅ Backend está corriendo');
      passed++;
    }
  } catch (error) {
    console.log('❌ Backend no responde');
    failed++;
    return;
  }
  
  // Test 2: GET /packs sin autenticación
  console.log('\n2️⃣ Test: GET /packs sin token de autenticación...');
  try {
    const response = await axios.get(`${BASE_URL}/packs`, {
      // NO enviar header Authorization
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint /packs funciona sin autenticación');
      console.log(`   Packs encontrados: ${response.data.packs?.length || 0}`);
      passed++;
    }
  } catch (error) {
    console.log('❌ Endpoint /packs requiere autenticación');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error?.message}`);
    failed++;
  }
  
  // Test 3: GET /products sin autenticación
  console.log('\n3️⃣ Test: GET /products sin token de autenticación...');
  try {
    const response = await axios.get(`${BASE_URL}/products`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint /products funciona sin autenticación');
      console.log(`   Productos encontrados: ${response.data.products?.length || 0}`);
      passed++;
    }
  } catch (error) {
    console.log('❌ Endpoint /products requiere autenticación');
    console.log(`   Status: ${error.response?.status}`);
    failed++;
  }
  
  // Test 4: GET /categories sin autenticación
  console.log('\n4️⃣ Test: GET /categories sin token de autenticación...');
  try {
    const response = await axios.get(`${BASE_URL}/products/categories`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Endpoint /categories funciona sin autenticación');
      console.log(`   Categorías encontradas: ${response.data.length || 0}`);
      passed++;
    }
  } catch (error) {
    console.log('❌ Endpoint /categories requiere autenticación');
    console.log(`   Status: ${error.response?.status}`);
    failed++;
  }
  
  // Test 5: Simular llamada del frontend con axios interceptor
  console.log('\n5️⃣ Test: Simulando axios del frontend (sin token)...');
  try {
    // Crear instancia de axios sin token
    const frontendAxios = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    const response = await frontendAxios.get('/packs');
    
    if (response.status === 200) {
      console.log('✅ Frontend puede cargar packs sin autenticación');
      console.log(`   Packs disponibles: ${response.data.packs?.length || 0}`);
      
      // Verificar si hay montajes
      const montajes = response.data.packs?.filter((p) => 
        p.category === 'MONTAJE' || p.packData?.category === 'MONTAJE'
      ) || [];
      console.log(`   Montajes encontrados: ${montajes.length}`);
      passed++;
    }
  } catch (error) {
    console.log('❌ Frontend NO puede cargar packs sin autenticación');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    failed++;
  }
  
  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMEN DEL TEST`);
  console.log('='.repeat(50));
  console.log(`✅ Tests pasados: ${passed}`);
  console.log(`❌ Tests fallidos: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todos los tests pasaron! La calculadora funciona sin autenticación');
    process.exit(0);
  } else {
    console.log('\n⚠️  Algunos tests fallaron. La calculadora NO funciona correctamente sin autenticación');
    console.log('\n🔍 PROBLEMA IDENTIFICADO:');
    console.log('   El backend está requiriendo autenticación en endpoints públicos.');
    console.log('   Solución: Reiniciar el backend con los cambios aplicados.');
    process.exit(1);
  }
}

// Ejecutar tests
testCalculatorWithoutAuth().catch(error => {
  console.error('\n💥 Error ejecutando tests:', error.message);
  process.exit(1);
});
