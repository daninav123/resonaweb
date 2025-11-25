const { chromium } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

async function testPriceFix() {
  console.log('🧪 Testing: Price Calculation Fix for Edit Order\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('admin@resona360.com');
      await passwordInput.fill('admin123');
      
      const loginBtn = page.locator('button:has-text("Iniciar")').first();
      if (await loginBtn.isVisible()) {
        await loginBtn.click();
        await page.waitForURL(`${BASE_URL}/admin`, { timeout: 10000 }).catch(() => {});
        console.log('✅ Login successful\n');
      }
    }
    
    // Step 2: Navigate to orders
    console.log('2️⃣ Navigating to orders...');
    await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle' });
    
    // Step 3: Find and click on an order
    console.log('3️⃣ Looking for orders...');
    const orderLinks = page.locator('a[href*="/admin/orders/"]');
    const orderCount = await orderLinks.count().catch(() => 0);
    
    if (orderCount > 0) {
      console.log(`✅ Found ${orderCount} orders`);
      
      // Click first order
      console.log('4️⃣ Opening first order...');
      await orderLinks.first().click();
      await page.waitForTimeout(2000);
      
      // Step 4: Look for edit button
      console.log('5️⃣ Looking for edit button...');
      const editBtn = page.locator('button:has-text("Editar"), button:has-text("Edit")').first();
      const editBtnVisible = await editBtn.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (editBtnVisible) {
        console.log('✅ Edit button found');
        
        // Click edit button
        console.log('6️⃣ Clicking edit button...');
        await editBtn.click();
        
        // Wait for modal
        console.log('7️⃣ Waiting for edit modal...');
        const modal = page.locator('text=Editar Pedido');
        const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (modalVisible) {
          console.log('✅ Edit modal opened');
          
          // Step 5: Look for add products button
          console.log('8️⃣ Looking for "Añadir Productos" button...');
          const addBtn = page.locator('button:has-text("Añadir Productos")');
          const addBtnVisible = await addBtn.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (addBtnVisible) {
            console.log('✅ Add products button found');
            
            // Click add button
            console.log('9️⃣ Clicking add products button...');
            await addBtn.click();
            await page.waitForTimeout(1000);
            
            // Step 6: Look for product list
            console.log('🔟 Looking for products to add...');
            const products = page.locator('div[class*="bg-white"][class*="border"][class*="rounded"]');
            const productCount = await products.count().catch(() => 0);
            
            if (productCount > 0) {
              console.log(`✅ Found ${productCount} products available`);
              
              // Get first product price
              console.log('1️⃣1️⃣ Checking first product price...');
              const firstProduct = products.first();
              const priceText = await firstProduct.locator('text=/€[0-9.]+/').textContent().catch(() => '€0.00');
              
              console.log(`✅ Product price shown: ${priceText}`);
              
              // Click first product to add
              console.log('1️⃣2️⃣ Adding first product...');
              await firstProduct.click();
              await page.waitForTimeout(1000);
              
              // Step 7: Check if price is calculated
              console.log('1️⃣3️⃣ Checking if price is calculated...');
              const addedItems = page.locator('text=A añadir');
              const addedItemsVisible = await addedItems.isVisible({ timeout: 2000 }).catch(() => false);
              
              if (addedItemsVisible) {
                console.log('✅ Item added section visible');
                
                // Get the price of added item
                const addedPrice = await page.locator('p:has-text("+€")').textContent().catch(() => '+€0.00');
                console.log(`✅ Added item price: ${addedPrice}`);
                
                // Check if price is not 0.00
                if (addedPrice.includes('€0.00')) {
                  console.log('❌ PRICE IS STILL 0.00 - FIX NOT WORKING');
                  return false;
                } else {
                  console.log('✅ PRICE IS CORRECT - FIX WORKING!');
                  return true;
                }
              } else {
                console.log('⚠️ Added items section not visible');
              }
            } else {
              console.log('⚠️ No products found');
            }
          } else {
            console.log('⚠️ Add products button not found');
          }
        } else {
          console.log('⚠️ Edit modal did not open');
        }
      } else {
        console.log('⚠️ Edit button not found');
      }
    } else {
      console.log('⚠️ No orders found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// Run test
testPriceFix().then(success => {
  console.log('\n' + '═'.repeat(50));
  if (success) {
    console.log('🎉 PRICE FIX VERIFIED - WORKING CORRECTLY!');
  } else {
    console.log('⚠️ Price fix needs verification');
  }
  console.log('═'.repeat(50));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
