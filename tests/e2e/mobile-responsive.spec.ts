import { test, expect, Page } from '@playwright/test';

// Viewports móviles comunes
const MOBILE_VIEWPORTS = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
];

// URLs a testear
const PUBLIC_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/productos', name: 'Productos' },
  { path: '/calculadora-eventos', name: 'Calculadora' },
  { path: '/servicios', name: 'Servicios' },
  { path: '/contacto', name: 'Contacto' },
  { path: '/carrito', name: 'Carrito' },
];

const ADMIN_PAGES = [
  { path: '/admin/dashboard', name: 'Admin Dashboard' },
  { path: '/admin/products', name: 'Gestión Productos' },
  { path: '/admin/orders', name: 'Gestión Pedidos' },
  { path: '/admin/users', name: 'Gestión Usuarios' },
  { path: '/admin/montajes', name: 'Gestión Montajes' },
  { path: '/admin/packs', name: 'Gestión Packs' },
  { path: '/admin/categories', name: 'Categorías' },
];

// Helper para hacer login como admin
async function loginAsAdmin(page: Page) {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@resona.com');
  await page.fill('input[type="password"]', 'Admin123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin|\//, { timeout: 5000 });
}

// Helper para verificar responsive issues comunes
async function checkResponsiveIssues(page: Page, pageName: string) {
  const issues: string[] = [];

  // 1. Verificar overflow horizontal
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width || 0;
  if (bodyWidth > viewportWidth + 5) { // 5px de tolerancia
    issues.push(`⚠️ Overflow horizontal detectado: body ${bodyWidth}px > viewport ${viewportWidth}px`);
  }

  // 2. Verificar elementos que salen del viewport
  const elementsOutside = await page.evaluate(() => {
    const viewport = window.innerWidth;
    const elements = document.querySelectorAll('*');
    const outside: string[] = [];
    
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > viewport + 10 && rect.width > 50) {
        const className = el.className || '';
        const tag = el.tagName.toLowerCase();
        outside.push(`${tag}.${className} (right: ${Math.round(rect.right)}px)`);
      }
    });
    
    return outside.slice(0, 5); // Limitar a 5 elementos
  });

  if (elementsOutside.length > 0) {
    issues.push(`⚠️ Elementos fuera del viewport: ${elementsOutside.join(', ')}`);
  }

  // 3. Verificar tablas sin scroll horizontal
  const tablesOverflow = await page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    const overflowing: string[] = [];
    
    tables.forEach((table) => {
      const parent = table.parentElement;
      const tableWidth = table.scrollWidth;
      const parentWidth = parent?.clientWidth || 0;
      
      if (tableWidth > parentWidth) {
        const hasOverflow = parent?.style.overflowX === 'auto' || 
                          parent?.classList.contains('overflow-x-auto');
        if (!hasOverflow) {
          overflowing.push(`Table ${tableWidth}px sin overflow-x-auto`);
        }
      }
    });
    
    return overflowing;
  });

  if (tablesOverflow.length > 0) {
    issues.push(`⚠️ Tablas sin scroll: ${tablesOverflow.join(', ')}`);
  }

  // 4. Verificar texto que se solapa
  const overlappingText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div'));
    const overlaps: string[] = [];
    
    for (let i = 0; i < elements.length - 1; i++) {
      const rect1 = elements[i].getBoundingClientRect();
      const rect2 = elements[i + 1].getBoundingClientRect();
      
      if (rect1.height > 0 && rect2.height > 0) {
        const overlap = rect1.bottom - rect2.top;
        if (overlap > 10) { // 10px de superposición
          overlaps.push(`Elementos solapados ${overlap}px`);
          if (overlaps.length >= 3) break;
        }
      }
    }
    
    return overlaps;
  });

  if (overlappingText.length > 0) {
    issues.push(`⚠️ Solapamiento: ${overlappingText.join(', ')}`);
  }

  // 5. Verificar botones muy pequeños (accesibilidad touch)
  const smallButtons = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a[role="button"]');
    const small: string[] = [];
    
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40)) {
        small.push(`${btn.tagName} ${Math.round(rect.width)}x${Math.round(rect.height)}px`);
      }
    });
    
    return small.slice(0, 3);
  });

  if (smallButtons.length > 0) {
    issues.push(`ℹ️ Botones pequeños (< 40x40px): ${smallButtons.join(', ')}`);
  }

  return issues;
}

test.describe('Mobile Responsive Tests', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
      });

      // Tests de páginas públicas
      for (const pageInfo of PUBLIC_PAGES) {
        test(`${pageInfo.name} - debe ser responsive`, async ({ page }) => {
          await page.goto(`http://localhost:3000${pageInfo.path}`);
          await page.waitForLoadState('networkidle');
          
          const issues = await checkResponsiveIssues(page, pageInfo.name);
          
          console.log(`\n📱 ${viewport.name} - ${pageInfo.name}:`);
          if (issues.length === 0) {
            console.log('  ✅ Sin problemas detectados');
          } else {
            issues.forEach(issue => console.log(`  ${issue}`));
          }
          
          // Screenshot para inspección manual
          await page.screenshot({ 
            path: `tests/screenshots/mobile-${viewport.name.replace(/\s/g, '-')}-${pageInfo.name.replace(/\s/g, '-')}.png`,
            fullPage: true 
          });
          
          // Verificar que no hay overflow crítico
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
        });
      }

      // Tests de páginas admin
      test.describe('Admin Panel', () => {
        test.beforeEach(async ({ page }) => {
          await loginAsAdmin(page);
        });

        for (const pageInfo of ADMIN_PAGES) {
          test(`${pageInfo.name} - debe ser responsive`, async ({ page }) => {
            await page.goto(`http://localhost:3000${pageInfo.path}`);
            await page.waitForLoadState('networkidle');
            
            const issues = await checkResponsiveIssues(page, `Admin - ${pageInfo.name}`);
            
            console.log(`\n📱 ${viewport.name} - Admin ${pageInfo.name}:`);
            if (issues.length === 0) {
              console.log('  ✅ Sin problemas detectados');
            } else {
              issues.forEach(issue => console.log(`  ${issue}`));
            }
            
            // Screenshot
            await page.screenshot({ 
              path: `tests/screenshots/mobile-${viewport.name.replace(/\s/g, '-')}-admin-${pageInfo.name.replace(/\s/g, '-')}.png`,
              fullPage: true 
            });
            
            // Verificar tablas si existen
            const hasTables = await page.locator('table').count() > 0;
            if (hasTables) {
              // Verificar que las tablas tienen scroll horizontal
              const tableParents = await page.locator('table').evaluateAll((tables) => {
                return tables.map(table => {
                  const parent = table.parentElement;
                  return {
                    hasOverflow: parent?.classList.contains('overflow-x-auto') || 
                               parent?.style.overflowX === 'auto',
                    tableWidth: table.scrollWidth,
                    parentWidth: parent?.clientWidth || 0
                  };
                });
              });
              
              const tablesNeedingScroll = tableParents.filter(t => t.tableWidth > viewport.width);
              if (tablesNeedingScroll.length > 0) {
                console.log(`  ℹ️ Tablas anchas detectadas: ${tablesNeedingScroll.length}`);
                tablesNeedingScroll.forEach(t => {
                  if (!t.hasOverflow) {
                    console.log(`  ⚠️ Tabla sin overflow-x-auto: ${t.tableWidth}px > ${viewport.width}px`);
                  }
                });
              }
            }
          });
        }
      });
    });
  }
});

// Test específico para calculadora de eventos con imágenes
test.describe('Calculadora - Modal de Imágenes Móvil', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 12
  });

  test('Las imágenes deben abrirse en modal en móvil', async ({ page }) => {
    await page.goto('http://localhost:3000/calculadora-eventos');
    await page.waitForLoadState('networkidle');
    
    // Avanzar a paso 4 (Equipos)
    // Primero seleccionar tipo de evento
    const firstEventType = page.locator('button').filter({ hasText: /Boda|Concierto|Evento/ }).first();
    if (await firstEventType.count() > 0) {
      await firstEventType.click();
      await page.click('button:has-text("Siguiente")');
      
      // Llenar detalles básicos
      await page.fill('input[type="number"]', '100');
      await page.fill('input[type="date"]', '2025-12-31');
      await page.fill('input[placeholder*="ubicación"], input[placeholder*="dirección"]', 'Valencia');
      await page.click('button:has-text("Siguiente")');
      
      // Verificar que hay botones de zoom en móvil
      const zoomButtons = page.locator('button[aria-label="Ver imagen completa"]');
      const count = await zoomButtons.count();
      
      console.log(`\n📱 Botones de zoom encontrados: ${count}`);
      
      if (count > 0) {
        // Hacer click en el primer botón de zoom
        await zoomButtons.first().click();
        
        // Verificar que el modal se abre
        const modal = page.locator('div.fixed.inset-0.bg-black\\/80');
        await expect(modal).toBeVisible({ timeout: 2000 });
        
        // Verificar que la imagen está visible
        const modalImage = modal.locator('img');
        await expect(modalImage).toBeVisible();
        
        console.log('  ✅ Modal de imagen funciona correctamente');
        
        // Cerrar modal
        await page.click('div.fixed.inset-0.bg-black\\/80');
        await expect(modal).not.toBeVisible();
      }
    }
  });
});
