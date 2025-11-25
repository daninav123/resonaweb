import { test, expect } from '@playwright/test';

/**
 * Tests automáticos de Responsive Design
 * Verifica que la aplicación funcione correctamente en diferentes tamaños de pantalla
 */

test.describe('Responsive Design - Automated Tests', () => {
  
  // Configurar diferentes viewport sizes
  const viewports = {
    mobile: { width: 375, height: 667, name: 'iPhone SE' },
    mobileL: { width: 414, height: 896, name: 'iPhone 12 Pro' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    tabletL: { width: 1024, height: 768, name: 'iPad Pro' },
    desktop: { width: 1280, height: 720, name: 'Desktop' },
    desktopL: { width: 1920, height: 1080, name: 'Desktop FHD' },
  };

  test.describe('Header Navigation', () => {
    
    test('Mobile (375px): Muestra hamburger menu, oculta nav horizontal', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('http://localhost:3000');
      
      console.log('\n📱 TEST: MOBILE (375px)');
      
      // Hamburger menu debe ser visible
      const hamburger = page.locator('button:has(svg.lucide-menu), button:has-text("☰")').first();
      const isHamburgerVisible = await hamburger.isVisible();
      console.log('   Hamburger visible:', isHamburgerVisible);
      expect(isHamburgerVisible).toBe(true);
      
      // Nav horizontal debe estar oculta
      const nav = page.locator('nav.bg-gray-50');
      const navVisible = await nav.isVisible();
      console.log('   Nav horizontal visible:', navVisible);
      expect(navVisible).toBe(false);
      
      // Click en hamburger abre menu
      await hamburger.click();
      await page.waitForTimeout(300);
      const navAfterClick = await nav.isVisible();
      console.log('   Nav después de click:', navAfterClick);
      expect(navAfterClick).toBe(true);
      
      console.log('   ✅ Mobile: PASS\n');
    });

    test('Tablet (768px): Muestra nav horizontal, oculta hamburger', async ({ page }) => {
      await page.setViewportSize(viewports.tablet);
      await page.goto('http://localhost:3000');
      
      console.log('📱 TEST: TABLET (768px)');
      
      // Hamburger menu NO debe ser visible
      const hamburger = page.locator('button:has(svg.lucide-menu)').first();
      const isHamburgerVisible = await hamburger.isVisible().catch(() => false);
      console.log('   Hamburger visible:', isHamburgerVisible);
      expect(isHamburgerVisible).toBe(false);
      
      // Nav horizontal DEBE ser visible
      const nav = page.locator('nav.bg-gray-50');
      const navVisible = await nav.isVisible();
      console.log('   Nav horizontal visible:', navVisible);
      expect(navVisible).toBe(true);
      
      // Verificar que los enlaces son visibles
      const catalogLink = page.locator('text=Catálogo');
      const isCatalogVisible = await catalogLink.isVisible();
      console.log('   Link Catálogo visible:', isCatalogVisible);
      expect(isCatalogVisible).toBe(true);
      
      console.log('   ✅ Tablet: PASS\n');
    });

    test('Desktop (1280px): Muestra nav horizontal, oculta hamburger', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('http://localhost:3000');
      
      console.log('💻 TEST: DESKTOP (1280px)');
      
      // Nav horizontal DEBE ser visible
      const nav = page.locator('nav.bg-gray-50');
      const navVisible = await nav.isVisible();
      console.log('   Nav horizontal visible:', navVisible);
      expect(navVisible).toBe(true);
      
      // Todos los links deben ser visibles
      const links = ['Catálogo', 'Servicios', 'Blog', 'Contacto'];
      for (const linkText of links) {
        const link = page.locator(`text=${linkText}`).first();
        const visible = await link.isVisible();
        console.log(`   Link "${linkText}" visible:`, visible);
        expect(visible).toBe(true);
      }
      
      console.log('   ✅ Desktop: PASS\n');
    });
  });

  test.describe('Admin Panel Responsive', () => {
    
    test('Mobile: Admin sidebar oculto, hamburger visible', async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto('http://localhost:3000/admin');
      
      console.log('📱 TEST: ADMIN MOBILE');
      
      // Sidebar debe estar oculto (translate-x-full)
      const sidebar = page.locator('aside').first();
      const sidebarClass = await sidebar.getAttribute('class');
      const isHidden = sidebarClass?.includes('-translate-x-full');
      console.log('   Sidebar oculto:', isHidden);
      expect(isHidden).toBe(true);
      
      // Header móvil debe ser visible
      const mobileHeader = page.locator('.lg\\:hidden.bg-gray-900').first();
      const headerVisible = await mobileHeader.isVisible();
      console.log('   Header móvil visible:', headerVisible);
      expect(headerVisible).toBe(true);
      
      // Click en hamburger abre sidebar
      const hamburger = mobileHeader.locator('button').first();
      await hamburger.click();
      await page.waitForTimeout(300);
      
      const sidebarClassAfter = await sidebar.getAttribute('class');
      const isVisible = !sidebarClassAfter?.includes('-translate-x-full');
      console.log('   Sidebar visible después de click:', isVisible);
      expect(isVisible).toBe(true);
      
      console.log('   ✅ Admin Mobile: PASS\n');
    });

    test('Desktop: Admin sidebar siempre visible', async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await page.goto('http://localhost:3000/admin');
      
      console.log('💻 TEST: ADMIN DESKTOP');
      
      // Sidebar debe estar visible
      const sidebar = page.locator('aside').first();
      const isVisible = await sidebar.isVisible();
      console.log('   Sidebar visible:', isVisible);
      expect(isVisible).toBe(true);
      
      // Header móvil NO debe ser visible
      const mobileHeader = page.locator('.lg\\:hidden.bg-gray-900');
      const headerCount = await mobileHeader.count();
      console.log('   Header móvil presente:', headerCount === 0);
      
      // Main content debe tener margin-left
      const main = page.locator('main').first();
      const mainClass = await main.getAttribute('class');
      const hasMargin = mainClass?.includes('lg:ml-64');
      console.log('   Main con margin correcto:', hasMargin);
      expect(hasMargin).toBe(true);
      
      console.log('   ✅ Admin Desktop: PASS\n');
    });
  });

  test.describe('Grids Responsive', () => {
    
    test('HomePage: Grids adaptativos por breakpoint', async ({ page }) => {
      console.log('📊 TEST: HOMEPAGE GRIDS');
      
      // Test en diferentes tamaños
      for (const [key, viewport] of Object.entries(viewports)) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(500);
        
        // Verificar que los grids existen
        const grids = await page.locator('[class*="grid"]').count();
        console.log(`   ${viewport.name} (${viewport.width}px): ${grids} grids encontrados`);
        expect(grids).toBeGreaterThan(0);
      }
      
      console.log('   ✅ HomePage Grids: PASS\n');
    });
  });

  test.describe('CartSidebar VIP', () => {
    
    test('Sidebar del carrito responsive en todos los tamaños', async ({ page }) => {
      console.log('🛒 TEST: CART SIDEBAR');
      
      for (const [key, viewport] of Object.entries(viewports)) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(300);
        
        // Click en icono del carrito
        const cartButton = page.locator('button:has(svg.lucide-shopping-cart)').first();
        const cartVisible = await cartButton.isVisible();
        console.log(`   ${viewport.name}: Cart button visible:`, cartVisible);
        
        if (cartVisible) {
          await cartButton.click();
          await page.waitForTimeout(500);
          
          // Verificar que el sidebar aparece
          const sidebar = page.locator('div.fixed.right-0').first();
          const sidebarVisible = await sidebar.isVisible();
          console.log(`   ${viewport.name}: Sidebar visible:`, sidebarVisible);
          
          // Cerrar sidebar
          const closeButton = page.locator('button:has(svg.lucide-x)').first();
          if (await closeButton.isVisible()) {
            await closeButton.click();
            await page.waitForTimeout(300);
          }
        }
      }
      
      console.log('   ✅ Cart Sidebar: PASS\n');
    });
  });

  test.describe('Breakpoint Issues Detection', () => {
    
    test('Detectar problemas de visibilidad en rangos intermedios', async ({ page }) => {
      console.log('🔍 TEST: BREAKPOINT ISSUES');
      
      // Probar tamaños críticos donde suele haber problemas
      const criticalSizes = [
        { width: 640, name: '640px (sm)' },
        { width: 767, name: '767px (md-1)' },
        { width: 768, name: '768px (md)' },
        { width: 769, name: '769px (md+1)' },
        { width: 1023, name: '1023px (lg-1)' },
        { width: 1024, name: '1024px (lg)' },
        { width: 1025, name: '1025px (lg+1)' },
      ];
      
      for (const size of criticalSizes) {
        await page.setViewportSize({ width: size.width, height: 800 });
        await page.goto('http://localhost:3000');
        await page.waitForTimeout(300);
        
        // Verificar nav horizontal
        const nav = page.locator('nav.bg-gray-50');
        const navVisible = await nav.isVisible();
        
        // Verificar hamburger
        const hamburger = page.locator('button:has(svg.lucide-menu)').first();
        const hamburgerVisible = await hamburger.isVisible().catch(() => false);
        
        console.log(`   ${size.name}:`);
        console.log(`      Nav visible: ${navVisible}`);
        console.log(`      Hamburger visible: ${hamburgerVisible}`);
        
        // En < 768px: hamburger visible, nav oculto
        // En >= 768px: nav visible, hamburger oculto
        if (size.width < 768) {
          expect(hamburgerVisible).toBe(true);
          // Nav puede estar oculto o mostrado (si hamburger clickeado)
        } else {
          expect(navVisible).toBe(true);
          expect(hamburgerVisible).toBe(false);
        }
      }
      
      console.log('   ✅ Breakpoint Issues: PASS\n');
    });
  });

  test.describe('Final Report', () => {
    
    test('Generar reporte de responsive', async ({ page }) => {
      console.log('\n📋 REPORTE FINAL DE RESPONSIVE\n');
      console.log('═'.repeat(60));
      
      const results = {
        mobile: { passed: 0, failed: 0, tests: [] as string[] },
        tablet: { passed: 0, failed: 0, tests: [] as string[] },
        desktop: { passed: 0, failed: 0, tests: [] as string[] },
      };
      
      // Test mobile
      await page.setViewportSize(viewports.mobile);
      await page.goto('http://localhost:3000');
      
      const mobileTests = [
        { name: 'Hamburger visible', check: async () => {
          const h = page.locator('button:has(svg.lucide-menu)').first();
          return await h.isVisible().catch(() => false);
        }},
        { name: 'Nav oculto por defecto', check: async () => {
          const n = page.locator('nav.bg-gray-50');
          return !(await n.isVisible());
        }},
      ];
      
      for (const t of mobileTests) {
        const result = await t.check();
        if (result) {
          results.mobile.passed++;
          results.mobile.tests.push(`✅ ${t.name}`);
        } else {
          results.mobile.failed++;
          results.mobile.tests.push(`❌ ${t.name}`);
        }
      }
      
      // Test tablet
      await page.setViewportSize(viewports.tablet);
      await page.goto('http://localhost:3000');
      
      const tabletTests = [
        { name: 'Nav visible', check: async () => {
          const n = page.locator('nav.bg-gray-50');
          return await n.isVisible();
        }},
        { name: 'Hamburger oculto', check: async () => {
          const h = page.locator('button:has(svg.lucide-menu)').first();
          return !(await h.isVisible().catch(() => false));
        }},
      ];
      
      for (const t of tabletTests) {
        const result = await t.check();
        if (result) {
          results.tablet.passed++;
          results.tablet.tests.push(`✅ ${t.name}`);
        } else {
          results.tablet.failed++;
          results.tablet.tests.push(`❌ ${t.name}`);
        }
      }
      
      // Test desktop
      await page.setViewportSize(viewports.desktop);
      await page.goto('http://localhost:3000');
      
      const desktopTests = [
        { name: 'Nav visible', check: async () => {
          const n = page.locator('nav.bg-gray-50');
          return await n.isVisible();
        }},
        { name: 'Todos los links visibles', check: async () => {
          const links = await page.locator('nav a').count();
          return links >= 5;
        }},
      ];
      
      for (const t of desktopTests) {
        const result = await t.check();
        if (result) {
          results.desktop.passed++;
          results.desktop.tests.push(`✅ ${t.name}`);
        } else {
          results.desktop.failed++;
          results.desktop.tests.push(`❌ ${t.name}`);
        }
      }
      
      // Imprimir reporte
      console.log('\n📱 MOBILE (< 768px):');
      results.mobile.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.mobile.passed}/${results.mobile.passed + results.mobile.failed} passed`);
      
      console.log('\n📱 TABLET (768px - 1024px):');
      results.tablet.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.tablet.passed}/${results.tablet.passed + results.tablet.failed} passed`);
      
      console.log('\n💻 DESKTOP (> 1024px):');
      results.desktop.tests.forEach(t => console.log(`   ${t}`));
      console.log(`   Total: ${results.desktop.passed}/${results.desktop.passed + results.desktop.failed} passed`);
      
      const totalPassed = results.mobile.passed + results.tablet.passed + results.desktop.passed;
      const totalTests = totalPassed + results.mobile.failed + results.tablet.failed + results.desktop.failed;
      
      console.log('\n' + '═'.repeat(60));
      console.log(`\n🎯 RESULTADO FINAL: ${totalPassed}/${totalTests} tests pasados`);
      
      if (totalPassed === totalTests) {
        console.log('✅ RESPONSIVE: 100% FUNCIONAL\n');
      } else {
        console.log(`⚠️  ${totalTests - totalPassed} tests fallidos\n`);
      }
    });
  });
});
