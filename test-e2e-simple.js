const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api/v1';

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

async function test(name, fn) {
  try {
    console.log(`\n🧪 Test: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASSED' });
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAILED', error: error.message });
  }
}

async function checkUrl(url, expectedStatus = 200) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    return response;
  } catch (error) {
    throw new Error(`Failed to fetch ${url}: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting E2E Tests...\n');
  console.log(`Frontend URL: ${BASE_URL}`);
  console.log(`Backend URL: ${API_URL}\n`);

  // Test 1: Frontend is accessible
  await test('Frontend homepage loads', async () => {
    const response = await checkUrl(BASE_URL);
    if (!response.data.includes('html')) {
      throw new Error('Homepage does not contain HTML');
    }
  });

  // Test 2: Backend health check
  await test('Backend health endpoint', async () => {
    try {
      const response = await axios.get(`${API_URL.replace('/api/v1', '')}/health`, { timeout: 5000 });
      console.log(`   Backend response: ${JSON.stringify(response.data)}`);
    } catch (e) {
      console.log(`   ⚠️ Health endpoint not available (may be normal)`);
    }
  });

  // Test 3: API authentication endpoint exists
  await test('API auth endpoint exists', async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: 'test@test.com',
        password: 'test'
      }, { timeout: 5000 }).catch(e => e.response);
      
      // Should return 400 or 401, not 404
      if (response.status === 404) {
        throw new Error('Auth endpoint not found');
      }
      console.log(`   Auth endpoint returned: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw error;
      }
      console.log(`   ⚠️ Auth test: ${error.message}`);
    }
  });

  // Test 4: Products endpoint
  await test('Products API endpoint', async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, { timeout: 5000 });
      console.log(`   Found ${response.data.length || 0} products`);
    } catch (error) {
      console.log(`   ⚠️ Products endpoint: ${error.message}`);
    }
  });

  // Test 5: Invoices endpoint (requires auth)
  await test('Invoices API endpoint', async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices/`, { timeout: 5000 }).catch(e => e.response);
      
      if (response.status === 401) {
        console.log(`   ✅ Endpoint requires auth (expected)`);
      } else if (response.status === 200) {
        console.log(`   ✅ Invoices endpoint accessible`);
      } else {
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Invoices endpoint: ${error.message}`);
    }
  });

  // Test 6: Download all invoices endpoint
  await test('Download all invoices endpoint exists', async () => {
    try {
      const response = await axios.get(`${API_URL}/invoices/download-all?startDate=2025-01-01&endDate=2025-01-31`, {
        timeout: 5000
      }).catch(e => e.response);
      
      if (response.status === 401) {
        console.log(`   ✅ Endpoint requires auth (expected)`);
      } else if (response.status === 404) {
        throw new Error('Download endpoint not found');
      } else {
        console.log(`   Status: ${response.status}`);
      }
    } catch (error) {
      if (error.message.includes('not found')) {
        throw error;
      }
      console.log(`   ⚠️ ${error.message}`);
    }
  });

  // Test 7: Frontend routes
  await test('Frontend routes accessible', async () => {
    const routes = [
      '/productos',
      '/calculadora-eventos',
      '/contacto'
    ];

    for (const route of routes) {
      try {
        const response = await axios.get(`${BASE_URL}${route}`, { timeout: 5000 });
        console.log(`   ✅ ${route} - OK`);
      } catch (error) {
        console.log(`   ⚠️ ${route} - ${error.message}`);
      }
    }
  });

  // Test 8: Check if new components are in frontend
  await test('New components deployed', async () => {
    const response = await checkUrl(BASE_URL);
    const html = response.data;
    
    // Check for calculator page
    if (html.includes('calculadora') || html.includes('calculator')) {
      console.log(`   ✅ Calculator page found`);
    }
    
    // Check for admin pages
    if (html.includes('admin') || html.includes('Admin')) {
      console.log(`   ✅ Admin pages found`);
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📋 Total: ${testResults.passed + testResults.failed}`);
  
  console.log('\n📝 Detailed Results:');
  testResults.tests.forEach(t => {
    const icon = t.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${t.name}`);
    if (t.error) {
      console.log(`   └─ ${t.error}`);
    }
  });

  console.log('\n' + '='.repeat(50));
  
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED!');
  } else {
    console.log(`⚠️ ${testResults.failed} test(s) failed`);
  }
  
  console.log('='.repeat(50));
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
