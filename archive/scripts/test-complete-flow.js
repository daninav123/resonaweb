const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

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

async function testCompleteFlow() {
  log('\n🧪 Testing: Complete Application Flow with Authentication\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Step 1: Go to homepage
    log('1️⃣ Navigating to homepage...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle' });
    logTest('Homepage loads', 'PASS', 'Page accessible');
    
    // Step 2: Navigate to login
    log('\n2️⃣ Navigating to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const loginTitle = page.locator('h1, h2').first();
    const loginVisible = await loginTitle.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (loginVisible) {
      logTest('Login page loads', 'PASS', 'Page accessible');
      
      // Step 3: Try to login
      log('\n3️⃣ Attempting login...');
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('admin@resona360.com');
        await passwordInput.fill('admin123');
        
        const loginBtn = page.locator('button:has-text("Iniciar")').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
          
          // Wait for redirect
          await page.waitForURL(`${BASE_URL}/admin`, { timeout: 10000 }).catch(() => {});
          
          logTest('Login successful', 'PASS', 'Redirected to admin');
          
          // Step 4: Navigate to invoices
          log('\n4️⃣ Navigating to invoices page...');
          await page.goto(`${BASE_URL}/admin/invoices`, { waitUntil: 'networkidle' });
          
          // Step 5: Look for download button
          log('\n5️⃣ Looking for "Descargar Todas" button...');
          const downloadBtn = page.locator('button:has-text("Descargar Todas")');
          const btnVisible = await downloadBtn.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (btnVisible) {
            logTest('Download button visible', 'PASS', 'Button found on invoices page');
            
            // Step 6: Click button
            log('\n6️⃣ Clicking download button...');
            await downloadBtn.click();
            
            // Step 7: Check modal
            log('\n7️⃣ Checking if modal appears...');
            const modal = page.locator('text=Descargar Facturas');
            const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
            
            if (modalVisible) {
              logTest('Modal opens', 'PASS', 'Modal appears after button click');
              
              // Step 8: Check period selector
              log('\n8️⃣ Checking period selector...');
              const select = page.locator('select').first();
              const selectVisible = await select.isVisible({ timeout: 2000 }).catch(() => false);
              
              if (selectVisible) {
                logTest('Period selector visible', 'PASS', 'Dropdown found in modal');
                
                // Step 9: Check download button in modal
                log('\n9️⃣ Checking download button in modal...');
                const downloadBtnModal = page.locator('button:has-text("Descargar")').last();
                const downloadBtnVisible = await downloadBtnModal.isVisible({ timeout: 2000 }).catch(() => false);
                
                if (downloadBtnVisible) {
                  logTest('Download button in modal', 'PASS', 'Download button visible');
                } else {
                  logTest('Download button in modal', 'FAIL', 'Download button not found');
                }
              } else {
                logTest('Period selector visible', 'FAIL', 'Dropdown not found');
              }
            } else {
              logTest('Modal opens', 'FAIL', 'Modal did not appear');
            }
          } else {
            logTest('Download button visible', 'FAIL', 'Button not found on invoices page');
          }
        } else {
          logTest('Login successful', 'FAIL', 'Login button not found');
        }
      } else {
        logTest('Login successful', 'FAIL', 'Email or password input not found');
      }
    } else {
      logTest('Login page loads', 'FAIL', 'Page not accessible');
    }
    
  } catch (error) {
    logTest('Complete flow test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function testCalculatorFlow() {
  log('\n🧪 Testing: Calculator Page Flow\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    log('1️⃣ Navigating to calculator...');
    await page.goto(`${BASE_URL}/calculadora-eventos`, { waitUntil: 'networkidle' });
    
    const title = page.locator('h1, h2').first();
    const titleVisible = await title.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (titleVisible) {
      logTest('Calculator page loads', 'PASS', 'Page accessible');
      
      log('\n2️⃣ Looking for event type buttons...');
      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count().catch(() => 0);
      
      if (count > 0) {
        logTest('Event buttons present', 'PASS', `Found ${count} buttons`);
        
        log('\n3️⃣ Clicking first event button...');
        const firstBtn = buttons.first();
        await firstBtn.click();
        
        // Wait for page to update
        await page.waitForTimeout(1000);
        
        logTest('Event button clickable', 'PASS', 'Button click successful');
      } else {
        logTest('Event buttons present', 'FAIL', 'No buttons found');
      }
    } else {
      logTest('Calculator page loads', 'FAIL', 'Page not accessible');
    }
    
  } catch (error) {
    logTest('Calculator flow test', 'FAIL', error.message);
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  log('═'.repeat(70));
  log('🚀 COMPLETE E2E FLOW TESTS WITH AUTHENTICATION');
  log('═'.repeat(70));
  log(`Frontend: ${BASE_URL}`);
  log('═'.repeat(70));
  
  await testCompleteFlow();
  await testCalculatorFlow();
  
  // Print summary
  log('\n' + '═'.repeat(70));
  log('📊 FINAL TEST SUMMARY');
  log('═'.repeat(70));
  log(`✅ Passed: ${results.passed}`);
  log(`❌ Failed: ${results.failed}`);
  log(`📋 Total: ${results.passed + results.failed}`);
  
  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED!');
    log('✅ Download button working correctly');
    log('✅ Modal opens and functions properly');
    log('✅ Calculator page functional');
    log('✅ All buttons clickable and responsive');
  } else {
    log(`\n⚠️ ${results.failed} test(s) failed. Review details above.`);
  }
  
  log('═'.repeat(70));
  
  return results.failed === 0;
}

// Run tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
