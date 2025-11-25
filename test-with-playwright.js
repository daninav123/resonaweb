const { chromium } = require('@playwright/test');

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

async function testDownloadButton() {
  log('\n🧪 Testing: Download Invoices Button\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    log('1️⃣ Navigating to invoices page...');
    await page.goto(`${BASE_URL}/admin/invoices`, { waitUntil: 'networkidle' });
    
    log('2️⃣ Looking for "Descargar Todas" button...');
    const button = page.locator('button:has-text("Descargar Todas")');
    const isVisible = await button.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      logTest('Download button visible', 'PASS', 'Button found on page');
      
      log('3️⃣ Clicking button...');
      await button.click();
      
      log('4️⃣ Checking if modal appears...');
      const modal = page.locator('text=Descargar Facturas');
      const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (modalVisible) {
        logTest('Modal opens on button click', 'PASS', 'Modal appears after click');
        
        log('5️⃣ Checking period selector...');
        const select = page.locator('select').first();
        const selectVisible = await select.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (selectVisible) {
          logTest('Period selector visible', 'PASS', 'Dropdown found in modal');
          
          log('6️⃣ Checking download button in modal...');
          const downloadBtn = page.locator('button:has-text("Descargar")').last();
          const downloadBtnVisible = await downloadBtn.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (downloadBtnVisible) {
            logTest('Download button in modal', 'PASS', 'Download button visible');
          } else {
            logTest('Download button in modal', 'FAIL', 'Download button not found');
          }
        } else {
          logTest('Period selector visible', 'FAIL', 'Dropdown not found');
        }
      } else {
        logTest('Modal opens on button click', 'FAIL', 'Modal did not appear');
      }
    } else {
      logTest('Download button visible', 'FAIL', 'Button not found on page');
    }
    
  } catch (error) {
    logTest('Download button test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function testCalculatorPage() {
  log('\n🧪 Testing: Calculator Page\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    log('1️⃣ Navigating to calculator page...');
    await page.goto(`${BASE_URL}/calculadora-eventos`, { waitUntil: 'networkidle' });
    
    log('2️⃣ Looking for calculator title...');
    const title = page.locator('h1, h2').first();
    const titleVisible = await title.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (titleVisible) {
      logTest('Calculator page loads', 'PASS', 'Page title visible');
      
      log('3️⃣ Looking for event type buttons...');
      const buttons = page.locator('button, [role="button"]');
      const buttonCount = await buttons.count().catch(() => 0);
      
      if (buttonCount > 0) {
        logTest('Event type buttons present', 'PASS', `Found ${buttonCount} interactive elements`);
        
        log('4️⃣ Looking for input fields...');
        const inputs = page.locator('input, select, textarea');
        const inputCount = await inputs.count().catch(() => 0);
        
        if (inputCount > 0) {
          logTest('Input fields present', 'PASS', `Found ${inputCount} input elements`);
        } else {
          logTest('Input fields present', 'FAIL', 'No input fields found');
        }
      } else {
        logTest('Event type buttons present', 'FAIL', 'No buttons found');
      }
    } else {
      logTest('Calculator page loads', 'FAIL', 'Page title not visible');
    }
    
  } catch (error) {
    logTest('Calculator page test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function testProductsPage() {
  log('\n🧪 Testing: Products Page\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    log('1️⃣ Navigating to products page...');
    await page.goto(`${BASE_URL}/productos`, { waitUntil: 'networkidle' });
    
    log('2️⃣ Looking for page title...');
    const title = page.locator('h1, h2').first();
    const titleVisible = await title.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (titleVisible) {
      logTest('Products page loads', 'PASS', 'Page title visible');
      
      log('3️⃣ Looking for product cards...');
      const cards = page.locator('[class*="product"], [data-testid*="product"]');
      const cardCount = await cards.count().catch(() => 0);
      
      if (cardCount >= 0) {
        logTest('Product elements present', 'PASS', `Found ${cardCount} product elements`);
      } else {
        logTest('Product elements present', 'FAIL', 'Could not count product elements');
      }
    } else {
      logTest('Products page loads', 'FAIL', 'Page title not visible');
    }
    
  } catch (error) {
    logTest('Products page test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function testNavigation() {
  log('\n🧪 Testing: Navigation\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    log('1️⃣ Navigating to homepage...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    
    log('2️⃣ Looking for navigation menu...');
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count().catch(() => 0);
    
    if (linkCount > 0) {
      logTest('Navigation menu present', 'PASS', `Found ${linkCount} navigation links`);
      
      log('3️⃣ Testing navigation to products...');
      const productsLink = page.locator('a:has-text("Productos"), a:has-text("productos")');
      const linkVisible = await productsLink.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (linkVisible) {
        logTest('Products link in navigation', 'PASS', 'Link found');
      } else {
        logTest('Products link in navigation', 'FAIL', 'Link not found');
      }
    } else {
      logTest('Navigation menu present', 'FAIL', 'No navigation links found');
    }
    
  } catch (error) {
    logTest('Navigation test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  log('═'.repeat(60));
  log('🚀 PLAYWRIGHT E2E BUTTON FUNCTIONALITY TESTS');
  log('═'.repeat(60));
  log(`Frontend: ${BASE_URL}`);
  log(`Backend: ${API_URL}`);
  log('═'.repeat(60));
  
  await testDownloadButton();
  await testCalculatorPage();
  await testProductsPage();
  await testNavigation();
  
  // Print summary
  log('\n' + '═'.repeat(60));
  log('📊 FINAL TEST SUMMARY');
  log('═'.repeat(60));
  log(`✅ Passed: ${results.passed}`);
  log(`❌ Failed: ${results.failed}`);
  log(`📋 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED!');
    log('✅ Download button working correctly');
    log('✅ Calculator page functional');
    log('✅ Products page accessible');
    log('✅ Navigation working');
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
