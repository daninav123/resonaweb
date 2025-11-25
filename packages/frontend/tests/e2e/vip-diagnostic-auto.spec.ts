import { test, expect } from '@playwright/test';

/**
 * Tests de diagnóstico automático del sistema VIP
 * Estos tests NO requieren login manual - trabajan con el estado actual del navegador
 */

test.describe('VIP System - Automated Diagnostics', () => {
  
  test.beforeEach(async ({ page }) => {
    // Configurar para capturar logs de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
  });

  test('TEST 1: Verify user is VIP in localStorage', async ({ page }) => {
    await page.goto('http://localhost:3000/account');
    await page.waitForLoadState('networkidle');
    
    // Leer localStorage
    const authData = await page.evaluate(() => {
      const stored = localStorage.getItem('auth-storage');
      return stored ? JSON.parse(stored) : null;
    });
    
    console.log('\n=== TEST 1: LOCALSTORAGE ===');
    console.log('Auth data exists:', !!authData);
    
    if (authData?.state?.user) {
      const user = authData.state.user;
      console.log('User email:', user.email);
      console.log('User userLevel:', user.userLevel);
      console.log('User object keys:', Object.keys(user));
      
      // Verificar
      expect(user).toHaveProperty('userLevel');
      console.log('✅ userLevel property exists');
      
      if (user.email === 'danielnavarrocampos@icloud.com') {
        expect(user.userLevel).toBe('VIP');
        console.log('✅ User is VIP');
      }
    } else {
      console.log('❌ No user in localStorage');
      throw new Error('No user found in localStorage');
    }
  });

  test('TEST 2: Verify VIP badge shows in account page', async ({ page }) => {
    await page.goto('http://localhost:3000/account');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('\n=== TEST 2: ACCOUNT PAGE UI ===');
    
    // Buscar badge VIP
    const vipBadge = page.locator('text=VIP').first();
    const badgeExists = await vipBadge.count() > 0;
    
    console.log('VIP badge found:', badgeExists);
    
    if (badgeExists) {
      await expect(vipBadge).toBeVisible();
      console.log('✅ VIP badge is visible');
    } else {
      console.log('❌ VIP badge not found');
    }
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/vip-account-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: vip-account-page.png');
  });

  test('TEST 3: Check if userLevel propagates to checkout', async ({ page }) => {
    // Primero verificar localStorage
    await page.goto('http://localhost:3000');
    
    const beforeCheckout = await page.evaluate(() => {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.user?.userLevel;
      }
      return null;
    });
    
    console.log('\n=== TEST 3: CHECKOUT PROPAGATION ===');
    console.log('UserLevel before checkout:', beforeCheckout);
    
    // Ir al checkout
    await page.goto('http://localhost:3000/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verificar si el componente CheckoutPage tiene acceso al user
    const checkoutState = await page.evaluate(() => {
      // Intentar leer el estado de React (si es accesible)
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const data = JSON.parse(stored);
        return {
          userLevel: data.state?.user?.userLevel,
          email: data.state?.user?.email,
        };
      }
      return null;
    });
    
    console.log('UserLevel in checkout:', checkoutState?.userLevel);
    console.log('Email in checkout:', checkoutState?.email);
    
    // Verificar elementos VIP en la página
    const pageContent = await page.content();
    const hasVIPText = pageContent.includes('Beneficio VIP') || 
                       pageContent.includes('VIP') ||
                       pageContent.includes('50%') ||
                       pageContent.includes('Descuento VIP');
    
    console.log('Page has VIP text:', hasVIPText);
    
    // Buscar elementos específicos
    const vipAlert = await page.locator('text=Beneficio VIP').count();
    const vipDiscount = await page.locator('text=Descuento VIP').count();
    const deferredPayment = await page.locator('text=Pago Diferido').count();
    
    console.log('VIP Alert count:', vipAlert);
    console.log('VIP Discount count:', vipDiscount);
    console.log('Deferred Payment count:', deferredPayment);
    
    // Screenshot
    await page.screenshot({ 
      path: 'test-results/vip-checkout-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved: vip-checkout-page.png');
    
    // Resultado
    if (beforeCheckout === 'VIP' && !hasVIPText) {
      console.log('');
      console.log('🔴 PROBLEMA IDENTIFICADO:');
      console.log('   - userLevel está en localStorage: VIP');
      console.log('   - Pero NO aparece en el checkout');
      console.log('   - CAUSA: El componente CheckoutPage no está leyendo el userLevel');
      throw new Error('VIP not showing in checkout despite localStorage having it');
    } else if (beforeCheckout === 'VIP' && hasVIPText) {
      console.log('✅ VIP showing correctly in checkout');
    }
  });

  test('TEST 4: Debug - Check React component state', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('\n=== TEST 4: REACT COMPONENT DEBUG ===');
    
    // Inyectar script para debug
    const debugInfo = await page.evaluate(() => {
      const results: any = {
        localStorage: null,
        windowKeys: [],
        reactKeys: [],
        vipElements: {
          byText: 0,
          byClass: 0,
        }
      };
      
      // LocalStorage
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const data = JSON.parse(stored);
        results.localStorage = {
          hasUser: !!data.state?.user,
          userLevel: data.state?.user?.userLevel,
          email: data.state?.user?.email,
        };
      }
      
      // Window keys que contengan "user" o "auth"
      results.windowKeys = Object.keys(window).filter(key => 
        key.toLowerCase().includes('user') || 
        key.toLowerCase().includes('auth')
      );
      
      // Buscar elementos VIP en el DOM
      results.vipElements.byText = document.body.innerText.match(/VIP/gi)?.length || 0;
      results.vipElements.byClass = document.querySelectorAll('[class*="yellow"], [class*="vip"]').length;
      
      return results;
    });
    
    console.log('LocalStorage info:', debugInfo.localStorage);
    console.log('Window keys with user/auth:', debugInfo.windowKeys);
    console.log('VIP elements in DOM:', debugInfo.vipElements);
    
    // Capturar HTML del resumen del pedido
    const orderSummary = await page.locator('text=Resumen del Pedido').locator('..').innerHTML();
    console.log('\nOrder Summary HTML preview:');
    console.log(orderSummary.substring(0, 500));
    
    // Si userLevel está en localStorage pero no hay elementos VIP
    if (debugInfo.localStorage?.userLevel === 'VIP' && debugInfo.vipElements.byText === 0) {
      console.log('');
      console.log('🔴 PROBLEMA CONFIRMADO:');
      console.log('   - localStorage tiene userLevel: VIP');
      console.log('   - Pero CheckoutPage no muestra elementos VIP');
      console.log('   - El componente no está accediendo a authStore correctamente');
    }
  });

  test('TEST 5: Network - Check if /auth/me is called', async ({ page }) => {
    console.log('\n=== TEST 5: NETWORK REQUESTS ===');
    
    const requests: any[] = [];
    
    // Capturar todas las requests
    page.on('request', request => {
      if (request.url().includes('auth')) {
        requests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });
    
    // Capturar responses
    page.on('response', async response => {
      if (response.url().includes('/auth/me')) {
        console.log('/auth/me response:');
        console.log('  Status:', response.status());
        try {
          const body = await response.json();
          console.log('  User email:', body.user?.email);
          console.log('  UserLevel:', body.user?.userLevel);
          console.log('  UserLevel present:', 'userLevel' in (body.user || {}));
        } catch (e) {
          console.log('  Could not parse response');
        }
      }
    });
    
    await page.goto('http://localhost:3000/checkout');
    await page.waitForTimeout(3000);
    
    console.log('\nAuth requests made:', requests.length);
    requests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });
    
    if (requests.length === 0) {
      console.log('⚠️  No auth requests made - component might not be calling checkAuth()');
    }
  });

  test('TEST 6: Final diagnosis', async ({ page }) => {
    await page.goto('http://localhost:3000/checkout');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('\n=== TEST 6: FINAL DIAGNOSIS ===\n');
    
    const diagnosis = await page.evaluate(() => {
      const results: any = {};
      
      // 1. LocalStorage
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const data = JSON.parse(stored);
        results.localStorage = {
          hasUser: !!data.state?.user,
          userLevel: data.state?.user?.userLevel,
          isVIP: data.state?.user?.userLevel === 'VIP' || data.state?.user?.userLevel === 'VIP_PLUS',
        };
      }
      
      // 2. DOM Elements
      const pageText = document.body.innerText;
      results.dom = {
        hasVIPText: pageText.includes('VIP'),
        hasBeneficioVIP: pageText.includes('Beneficio VIP'),
        hasDescuentoVIP: pageText.includes('Descuento VIP'),
        hasPagoDiferido: pageText.includes('Pago Diferido'),
        has50Percent: pageText.includes('50%'),
        hasZeroPayment: pageText.includes('€0.00'),
      };
      
      // 3. Calcular que elementos faltan
      results.missing = [];
      if (results.localStorage?.isVIP) {
        if (!results.dom.hasBeneficioVIP) results.missing.push('Alerta "Beneficio VIP"');
        if (!results.dom.hasDescuentoVIP) results.missing.push('Línea "Descuento VIP"');
        if (!results.dom.hasPagoDiferido) results.missing.push('Sección "Pago Diferido"');
        if (!results.dom.hasZeroPayment) results.missing.push('Texto "€0.00"');
      }
      
      return results;
    });
    
    console.log('📋 DIAGNOSIS RESULTS:\n');
    console.log('1. LocalStorage State:');
    console.log('   - Has user:', diagnosis.localStorage?.hasUser);
    console.log('   - UserLevel:', diagnosis.localStorage?.userLevel);
    console.log('   - Is VIP:', diagnosis.localStorage?.isVIP);
    
    console.log('\n2. DOM Elements Present:');
    console.log('   - Has "VIP" text:', diagnosis.dom?.hasVIPText);
    console.log('   - Has "Beneficio VIP":', diagnosis.dom?.hasBeneficioVIP);
    console.log('   - Has "Descuento VIP":', diagnosis.dom?.hasDescuentoVIP);
    console.log('   - Has "Pago Diferido":', diagnosis.dom?.hasPagoDiferido);
    console.log('   - Has "50%":', diagnosis.dom?.has50Percent);
    console.log('   - Has "€0.00":', diagnosis.dom?.hasZeroPayment);
    
    if (diagnosis.missing && diagnosis.missing.length > 0) {
      console.log('\n❌ MISSING ELEMENTS:');
      diagnosis.missing.forEach((item: string) => {
        console.log(`   - ${item}`);
      });
      
      console.log('\n🔧 PROBABLE CAUSE:');
      console.log('   El componente CheckoutPage no está recibiendo el userLevel');
      console.log('   desde el authStore. Verificar:');
      console.log('   1. useAuthStore() está importado correctamente');
      console.log('   2. const { user } = useAuthStore() incluye userLevel');
      console.log('   3. El backend devuelve userLevel en /auth/me');
    } else if (diagnosis.localStorage?.isVIP) {
      console.log('\n✅ ALL VIP ELEMENTS PRESENT');
      console.log('   System working correctly!');
    } else {
      console.log('\n⚠️  User is not VIP in localStorage');
    }
    
    // Screenshot final
    await page.screenshot({ 
      path: 'test-results/vip-final-diagnosis.png',
      fullPage: true 
    });
    console.log('\n📸 Final screenshot saved: vip-final-diagnosis.png');
  });
});
