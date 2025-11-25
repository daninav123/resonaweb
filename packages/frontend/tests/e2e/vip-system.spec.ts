import { test, expect } from '@playwright/test';

test.describe('VIP System - Detailed Tests', () => {
  
  test('Admin can change user level to VIP', async ({ page }) => {
    // TODO: Implement admin login
    test.skip(true, 'Requires admin authentication');
    
    await page.goto('/admin/users');
    
    // Find user and change to VIP
    const userRow = page.locator('tr:has-text("danielnavarrocampos@icloud.com")');
    const levelSelect = userRow.locator('select');
    
    await levelSelect.selectOption('VIP');
    
    // Wait for success toast
    await expect(page.locator('text=actualizado a VIP')).toBeVisible({ timeout: 5000 });
    
    // Verify the select stayed as VIP
    await expect(levelSelect).toHaveValue('VIP');
  });

  test('User level persists in localStorage after login', async ({ page }) => {
    // TODO: Implement login
    test.skip(true, 'Requires authentication');
    
    await page.goto('/login');
    
    // Login as VIP user
    await page.fill('input[type="email"]', 'danielnavarrocampos@icloud.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/', { timeout: 10000 });
    
    // Check localStorage
    const authStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    
    expect(authStorage).toBeTruthy();
    const authData = JSON.parse(authStorage!);
    
    console.log('Auth data after login:', authData);
    expect(authData.state.user.userLevel).toBe('VIP');
  });

  test('User level persists after page reload', async ({ page }) => {
    test.skip(true, 'Requires authentication');
    
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'danielnavarrocampos@icloud.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Check userLevel before reload
    let authStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    let authData = JSON.parse(authStorage!);
    console.log('BEFORE RELOAD - userLevel:', authData.state.user.userLevel);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check userLevel after reload
    authStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    authData = JSON.parse(authStorage!);
    console.log('AFTER RELOAD - userLevel:', authData.state.user.userLevel);
    
    expect(authData.state.user.userLevel).toBe('VIP');
  });

  test('VIP discount shows in checkout', async ({ page }) => {
    test.skip(true, 'Requires authentication and cart items');
    
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Check for VIP alert
    const vipAlert = page.locator('text=Beneficio VIP');
    await expect(vipAlert).toBeVisible({ timeout: 10000 });
    
    // Check for discount line
    const discountLine = page.locator('text=Descuento VIP (50%)');
    await expect(discountLine).toBeVisible();
    
    // Check for deferred payment
    const payNowAmount = page.locator('text=€0.00');
    await expect(payNowAmount).toBeVisible();
  });

  test('Backend /auth/me returns userLevel', async ({ request }) => {
    // This test needs a valid token
    test.skip(true, 'Requires authentication token');
    
    const response = await request.get('http://localhost:3001/api/v1/auth/me', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log('Response from /auth/me:', data);
    expect(data.user).toHaveProperty('userLevel');
  });

  test('Backend /users returns userLevel', async ({ request }) => {
    test.skip(true, 'Requires admin authentication token');
    
    const response = await request.get('http://localhost:3001/api/v1/users?limit=10', {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log('Response from /users:', data);
    
    if (data.data && data.data.length > 0) {
      expect(data.data[0]).toHaveProperty('userLevel');
    }
  });
});

test.describe('VIP System - Debug Tests', () => {
  
  test('Check authStore state in browser console', async ({ page }) => {
    await page.goto('/');
    
    // Get authStore state from localStorage
    const authData = await page.evaluate(() => {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    });
    
    console.log('=== AUTH STORE DEBUG ===');
    console.log('Full authStorage:', JSON.stringify(authData, null, 2));
    
    if (authData && authData.state && authData.state.user) {
      console.log('User:', authData.state.user);
      console.log('UserLevel:', authData.state.user.userLevel);
    } else {
      console.log('No user in authStorage');
    }
  });

  test('Network requests for /auth/me', async ({ page }) => {
    // Listen to all network requests
    page.on('response', async (response) => {
      if (response.url().includes('/auth/me')) {
        console.log('=== /auth/me RESPONSE ===');
        console.log('Status:', response.status());
        const body = await response.json().catch(() => null);
        console.log('Body:', JSON.stringify(body, null, 2));
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000);
  });

  test('Check VIP elements in DOM', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    
    // Check if VIP elements exist in DOM (even if not visible)
    const vipAlertExists = await page.locator('text=Beneficio VIP').count();
    console.log('VIP alert count:', vipAlertExists);
    
    const discountLineExists = await page.locator('text=Descuento VIP').count();
    console.log('Discount line count:', discountLineExists);
    
    // Get page content and check for VIP text
    const content = await page.content();
    const hasVipText = content.includes('VIP') || content.includes('vip');
    console.log('Page has VIP text:', hasVipText);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/vip-debug-checkout.png', fullPage: true });
  });
});
