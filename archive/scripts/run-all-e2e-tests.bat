@echo off
echo ========================================
echo   EJECUTANDO TODOS LOS TESTS E2E
echo ========================================
echo.
echo Esta suite completa incluye:
echo - Autenticacion (10 tests)
echo - Categorias (5 tests)
echo - Flujo de Carrito (7 tests)
echo - Productos (ver checkout.spec.ts)
echo - Navegacion (10 tests)
echo - Servicios (4 tests)
echo - Panel Admin (12 tests)
echo - Calculadora de Eventos (5 tests)
echo - Performance y Accesibilidad (12 tests)
echo.
echo ========================================
pause

cd packages\frontend

echo.
echo [1/9] Tests de Autenticacion...
npx playwright test tests/e2e/auth.spec.ts --reporter=html

echo.
echo [2/9] Tests de Categorias (15 categorias)...
npx playwright test tests/e2e/categories.spec.ts --reporter=html

echo.
echo [3/9] Tests de Carrito...
npx playwright test tests/e2e/cart-flow.spec.ts --reporter=html

echo.
echo [4/9] Tests de Productos...
npx playwright test tests/e2e/products.spec.ts --reporter=html

echo.
echo [5/9] Tests de Checkout...
npx playwright test tests/e2e/checkout.spec.ts --reporter=html

echo.
echo [6/9] Tests de Navegacion...
npx playwright test tests/e2e/navigation.spec.ts --reporter=html

echo.
echo [7/9] Tests de Servicios...
npx playwright test tests/e2e/services-page.spec.ts --reporter=html

echo.
echo [8/9] Tests de Admin Panel...
npx playwright test tests/e2e/admin-panel.spec.ts --reporter=html

echo.
echo [9/9] Tests de Calculadora...
npx playwright test tests/e2e/event-calculator.spec.ts --reporter=html

echo.
echo [10/10] Tests de Performance...
npx playwright test tests/e2e/performance.spec.ts --reporter=html

echo.
echo ========================================
echo   RESUMEN
echo ========================================
echo.
echo Para ver el reporte completo:
echo   npx playwright show-report
echo.
pause
