@echo off
:menu
cls
echo ========================================
echo   TESTS E2E - RESONA EVENTS
echo ========================================
echo.
echo Selecciona que tests ejecutar:
echo.
echo 1. Autenticacion (11 tests)
echo 2. Categorias - 15 completas (5 tests)
echo 3. Flujo del Carrito (7 tests)
echo 4. Productos (11+ tests)
echo 5. Navegacion General (9 tests)
echo 6. Panel de Admin (12 tests)
echo 7. Performance y Accesibilidad (12 tests)
echo 8. Calculadora de Eventos (5 tests)
echo 9. Pagina de Servicios (4 tests)
echo.
echo A. Ejecutar TODOS los tests (~65 tests)
echo R. Ver reporte HTML
echo 0. Salir
echo.
echo ========================================
set /p choice=Elige una opcion (1-9, A, R, 0): 

cd packages\frontend

if "%choice%"=="1" (
    echo.
    echo Ejecutando tests de Autenticacion...
    npx playwright test tests/e2e/auth.spec.ts
    pause
    goto menu
)

if "%choice%"=="2" (
    echo.
    echo Ejecutando tests de Categorias...
    echo Verificando las 15 categorias implementadas...
    npx playwright test tests/e2e/categories.spec.ts
    pause
    goto menu
)

if "%choice%"=="3" (
    echo.
    echo Ejecutando tests de Carrito...
    echo Verificando guest cart y persistencia...
    npx playwright test tests/e2e/cart-flow.spec.ts
    pause
    goto menu
)

if "%choice%"=="4" (
    echo.
    echo Ejecutando tests de Productos...
    npx playwright test tests/e2e/products.spec.ts
    pause
    goto menu
)

if "%choice%"=="5" (
    echo.
    echo Ejecutando tests de Navegacion...
    npx playwright test tests/e2e/navigation.spec.ts
    pause
    goto menu
)

if "%choice%"=="6" (
    echo.
    echo Ejecutando tests de Admin Panel...
    echo Verificando proteccion y funcionalidad...
    npx playwright test tests/e2e/admin-panel.spec.ts
    pause
    goto menu
)

if "%choice%"=="7" (
    echo.
    echo Ejecutando tests de Performance...
    npx playwright test tests/e2e/performance.spec.ts
    pause
    goto menu
)

if "%choice%"=="8" (
    echo.
    echo Ejecutando tests de Calculadora...
    npx playwright test tests/e2e/event-calculator.spec.ts
    pause
    goto menu
)

if "%choice%"=="9" (
    echo.
    echo Ejecutando tests de Servicios...
    npx playwright test tests/e2e/services-page.spec.ts
    pause
    goto menu
)

if /i "%choice%"=="A" (
    echo.
    echo ========================================
    echo   EJECUTANDO TODOS LOS TESTS
    echo ========================================
    echo.
    npx playwright test tests/e2e/ --reporter=html
    echo.
    echo Tests completados!
    echo Para ver el reporte: npx playwright show-report
    pause
    goto menu
)

if /i "%choice%"=="R" (
    echo.
    echo Abriendo reporte HTML...
    npx playwright show-report
    goto menu
)

if "%choice%"=="0" (
    exit
)

echo Opcion invalida
pause
goto menu
