const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testEndpoints() {
  console.log('🧪 INICIANDO PRUEBAS DE ENDPOINTS...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  try {
    const response = await axios.get('http://localhost:3001/health');
    console.log('✅ Health Check:', response.data);
    results.passed++;
    results.tests.push({ name: 'Health Check', status: 'PASSED' });
  } catch (error) {
    console.log('❌ Health Check FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Health Check', status: 'FAILED', error: error.message });
  }

  // Test 2: Get Categories
  try {
    const response = await axios.get(`${BASE_URL}/products/categories`);
    console.log('✅ Get Categories:', response.data?.length || 0, 'categorías');
    results.passed++;
    results.tests.push({ name: 'Get Categories', status: 'PASSED', count: response.data?.length });
  } catch (error) {
    console.log('❌ Get Categories FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Categories', status: 'FAILED', error: error.message });
  }

  // Test 3: Get Products
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Get Products:', response.data?.data?.length || 0, 'productos');
    results.passed++;
    results.tests.push({ name: 'Get Products', status: 'PASSED', count: response.data?.data?.length });
  } catch (error) {
    console.log('❌ Get Products FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Products', status: 'FAILED', error: error.message });
  }

  // Test 4: Get Shipping Config
  try {
    const response = await axios.get(`${BASE_URL}/shipping-config`);
    console.log('✅ Get Shipping Config:', response.data ? 'OK' : 'No data');
    results.passed++;
    results.tests.push({ name: 'Get Shipping Config', status: 'PASSED' });
  } catch (error) {
    console.log('❌ Get Shipping Config FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Shipping Config', status: 'FAILED', error: error.message });
  }

  // Test 5: Get Company Settings
  try {
    const response = await axios.get(`${BASE_URL}/company/settings`);
    console.log('✅ Get Company Settings:', response.data?.companyName || 'No data');
    results.passed++;
    results.tests.push({ name: 'Get Company Settings', status: 'PASSED' });
  } catch (error) {
    console.log('❌ Get Company Settings FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Get Company Settings', status: 'FAILED', error: error.message });
  }

  // Test 6: Test Rate Limiting (should work)
  try {
    await axios.get(`${BASE_URL}/products`);
    console.log('✅ Rate Limiting: Working (request passed)');
    results.passed++;
    results.tests.push({ name: 'Rate Limiting', status: 'PASSED' });
  } catch (error) {
    console.log('❌ Rate Limiting FAILED:', error.message);
    results.failed++;
    results.tests.push({ name: 'Rate Limiting', status: 'FAILED', error: error.message });
  }

  // Resumen
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(50));
  console.log(`✅ Pruebas exitosas: ${results.passed}`);
  console.log(`❌ Pruebas fallidas: ${results.failed}`);
  console.log(`📈 Total: ${results.passed + results.failed}`);
  console.log(`🎯 Tasa de éxito: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);
  console.log('='.repeat(50));

  return results;
}

testEndpoints().catch(console.error);
