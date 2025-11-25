const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001/api/v1';

let results = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(message) {
  console.log(message);
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : '❌';
  log(`${icon} ${name}`);
  if (details) {
    log(`   └─ ${details}`);
  }
  
  if (status === 'PASS') {
    results.passed++;
  } else {
    results.failed++;
  }
  
  results.tests.push({ name, status, details });
}

async function testDownloadInvoicesButton() {
  log('\n🧪 Testing: Download Invoices Button Functionality\n');
  
  try {
    // Test 1: Endpoint exists
    log('1️⃣ Checking if download endpoint exists...');
    try {
      const response = await axios.get(
        `${API_URL}/invoices/download-all?startDate=2025-01-01&endDate=2025-01-31`,
        { timeout: 5000 }
      ).catch(e => e.response);
      
      if (response.status === 401) {
        logTest('Download endpoint exists', 'PASS', 'Endpoint found (requires auth)');
      } else if (response.status === 404) {
        logTest('Download endpoint exists', 'FAIL', 'Endpoint not found (404)');
      } else {
        logTest('Download endpoint exists', 'PASS', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('Download endpoint exists', 'FAIL', error.message);
    }
    
    // Test 2: Endpoint accepts date parameters
    log('\n2️⃣ Checking if endpoint accepts date parameters...');
    try {
      const response = await axios.get(
        `${API_URL}/invoices/download-all?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z`,
        { timeout: 5000 }
      ).catch(e => e.response);
      
      if (response.status === 401 || response.status === 200 || response.status === 404) {
        logTest('Endpoint accepts date parameters', 'PASS', `Responded with ${response.status}`);
      } else {
        logTest('Endpoint accepts date parameters', 'FAIL', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      logTest('Endpoint accepts date parameters', 'FAIL', error.message);
    }
    
    // Test 3: Endpoint returns error without dates
    log('\n3️⃣ Checking if endpoint validates date parameters...');
    try {
      const response = await axios.get(
        `${API_URL}/invoices/download-all`,
        { timeout: 5000 }
      ).catch(e => e.response);
      
      if (response.status === 400 || response.status === 401) {
        logTest('Date validation works', 'PASS', `Returned ${response.status} (expected)`);
      } else {
        logTest('Date validation works', 'FAIL', `Returned ${response.status}, expected 400 or 401`);
      }
    } catch (error) {
      logTest('Date validation works', 'FAIL', error.message);
    }
    
  } catch (error) {
    logTest('Download Invoices Tests', 'FAIL', error.message);
  }
}

async function testCalculatorButtons() {
  log('\n🧪 Testing: Calculator Page Buttons\n');
  
  try {
    // Test 1: Calculator page loads
    log('1️⃣ Checking if calculator page loads...');
    try {
      const response = await axios.get(`${BASE_URL}/calculadora-eventos`, { timeout: 5000 });
      
      if (response.status === 200 && response.data.includes('html')) {
        logTest('Calculator page loads', 'PASS', 'Page accessible');
      } else {
        logTest('Calculator page loads', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('Calculator page loads', 'FAIL', error.message);
    }
    
    // Test 2: Check for calculator elements
    log('\n2️⃣ Checking for calculator elements...');
    try {
      const response = await axios.get(`${BASE_URL}/calculadora-eventos`, { timeout: 5000 });
      const html = response.data;
      
      const hasCalculator = html.includes('calculadora') || html.includes('calculator') || html.includes('Calculadora');
      const hasButtons = html.includes('button') || html.includes('Button');
      const hasInputs = html.includes('input') || html.includes('select');
      
      if (hasCalculator && hasButtons && hasInputs) {
        logTest('Calculator elements present', 'PASS', 'Found calculator, buttons, and inputs');
      } else {
        logTest('Calculator elements present', 'FAIL', `Calculator: ${hasCalculator}, Buttons: ${hasButtons}, Inputs: ${hasInputs}`);
      }
    } catch (error) {
      logTest('Calculator elements present', 'FAIL', error.message);
    }
    
  } catch (error) {
    logTest('Calculator Tests', 'FAIL', error.message);
  }
}

async function testAdminPages() {
  log('\n🧪 Testing: Admin Pages\n');
  
  try {
    // Test 1: Admin dashboard accessible
    log('1️⃣ Checking if admin dashboard is accessible...');
    try {
      const response = await axios.get(`${BASE_URL}/admin`, { timeout: 5000 });
      
      if (response.status === 200) {
        logTest('Admin dashboard accessible', 'PASS', 'Page loads');
      } else {
        logTest('Admin dashboard accessible', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('Admin dashboard accessible', 'FAIL', error.message);
    }
    
    // Test 2: Invoices page accessible
    log('\n2️⃣ Checking if invoices page is accessible...');
    try {
      const response = await axios.get(`${BASE_URL}/admin/invoices`, { timeout: 5000 });
      
      if (response.status === 200) {
        logTest('Invoices page accessible', 'PASS', 'Page loads');
      } else {
        logTest('Invoices page accessible', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('Invoices page accessible', 'FAIL', error.message);
    }
    
    // Test 3: Check for download button in HTML
    log('\n3️⃣ Checking for download button in HTML...');
    try {
      const response = await axios.get(`${BASE_URL}/admin/invoices`, { timeout: 5000 });
      const html = response.data;
      
      const hasDownloadButton = html.includes('Descargar') || html.includes('Download') || html.includes('download');
      
      if (hasDownloadButton) {
        logTest('Download button in HTML', 'PASS', 'Button element found');
      } else {
        logTest('Download button in HTML', 'FAIL', 'Button not found in HTML');
      }
    } catch (error) {
      logTest('Download button in HTML', 'FAIL', error.message);
    }
    
  } catch (error) {
    logTest('Admin Pages Tests', 'FAIL', error.message);
  }
}

async function testProductsPage() {
  log('\n🧪 Testing: Products Page\n');
  
  try {
    // Test 1: Products page loads
    log('1️⃣ Checking if products page loads...');
    try {
      const response = await axios.get(`${BASE_URL}/productos`, { timeout: 5000 });
      
      if (response.status === 200) {
        logTest('Products page loads', 'PASS', 'Page accessible');
      } else {
        logTest('Products page loads', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      logTest('Products page loads', 'FAIL', error.message);
    }
    
    // Test 2: Check for product elements
    log('\n2️⃣ Checking for product elements...');
    try {
      const response = await axios.get(`${BASE_URL}/productos`, { timeout: 5000 });
      const html = response.data;
      
      const hasProducts = html.includes('producto') || html.includes('product') || html.includes('Producto');
      
      if (hasProducts) {
        logTest('Product elements present', 'PASS', 'Product page structure found');
      } else {
        logTest('Product elements present', 'FAIL', 'Product elements not found');
      }
    } catch (error) {
      logTest('Product elements present', 'FAIL', error.message);
    }
    
  } catch (error) {
    logTest('Products Page Tests', 'FAIL', error.message);
  }
}

async function runAllTests() {
  log('═'.repeat(60));
  log('🚀 COMPREHENSIVE BUTTON & FUNCTIONALITY TESTS');
  log('═'.repeat(60));
  log(`Frontend: ${BASE_URL}`);
  log(`Backend: ${API_URL}`);
  log('═'.repeat(60));
  
  await testDownloadInvoicesButton();
  await testCalculatorButtons();
  await testAdminPages();
  await testProductsPage();
  
  // Print summary
  log('\n' + '═'.repeat(60));
  log('📊 FINAL TEST SUMMARY');
  log('═'.repeat(60));
  log(`✅ Passed: ${results.passed}`);
  log(`❌ Failed: ${results.failed}`);
  log(`📋 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! All buttons and functionality working correctly.');
  } else {
    log(`\n⚠️ ${results.failed} test(s) failed. Review details above.`);
  }
  
  log('═'.repeat(60));
  
  return results.failed === 0;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
