@echo off
cls
echo ================================================
echo   DIAGNOSTICO COMPLETO - TESTS E2E
echo ================================================
echo.

REM 1. Verificar que hay procesos Node corriendo
echo [1/7] Verificando procesos Node...
tasklist | findstr node.exe > nul
if errorlevel 1 (
    echo ! No hay procesos Node corriendo
    echo   Necesitas iniciar el servidor primero
    echo.
    echo   Ejecuta: .\start-admin.bat
    echo.
    pause
    exit /b 1
) else (
    echo ✓ Procesos Node detectados
)

REM 2. Verificar puerto 3000
echo.
echo [2/7] Verificando puerto 3000...
netstat -an | findstr :3000 | findstr LISTENING > nul
if errorlevel 1 (
    echo ! Puerto 3000 no esta escuchando
    pause
    exit /b 1
) else (
    echo ✓ Puerto 3000 esta abierto
)

REM 3. Verificar puerto 3001
echo.
echo [3/7] Verificando puerto 3001...
netstat -an | findstr :3001 | findstr LISTENING > nul
if errorlevel 1 (
    echo ! Puerto 3001 no esta escuchando
) else (
    echo ✓ Puerto 3001 esta abierto
)

REM 4. Test HTTP al puerto 3000
echo.
echo [4/7] Test HTTP a localhost:3000...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3 -UseBasicParsing; Write-Host '✓ Status:' $r.StatusCode; if ($r.StatusCode -eq 404) { Write-Host '! ADVERTENCIA: Responde 404 - la pagina no existe' -ForegroundColor Yellow } } catch { Write-Host '✗ Error:' $_.Exception.Message -ForegroundColor Red }"

REM 5. Verificar que Playwright está instalado
echo.
echo [5/7] Verificando instalacion de Playwright...
cd packages\frontend
if exist "node_modules\@playwright" (
    echo ✓ Playwright instalado
) else (
    echo ! Playwright NO instalado
    echo   Ejecuta: npm install
    pause
    exit /b 1
)

REM 6. Verificar navegadores de Playwright
echo.
echo [6/7] Verificando navegadores de Playwright...
call npx playwright --version > nul 2>&1
if errorlevel 1 (
    echo ! Playwright CLI no funciona
) else (
    echo ✓ Playwright CLI OK
    echo.
    echo Instalando/verificando navegadores...
    call npx playwright install chromium --with-deps
)

REM 7. Ejecutar test ultra simple
echo.
echo [7/7] Ejecutando test ultra simple...
echo.
call npx playwright test tests/e2e/test-ultra-simple.spec.ts --config=playwright.ultraminimal.config.ts

if errorlevel 1 (
    echo.
    echo ================================================
    echo   TEST FALLO
    echo ================================================
    echo.
    echo El test mas simple posible fallo.
    echo.
    echo POSIBLES CAUSAS:
    echo 1. El servidor NO esta sirviendo en puerto 3000
    echo 2. La pagina responde 404 (no existe)
    echo 3. Hay un redirect infinito
    echo 4. Playwright no puede iniciar el navegador
    echo.
    echo SOLUCION:
    echo 1. Abre http://localhost:3000 en tu navegador manualmente
    echo 2. Si NO carga o da 404, reinicia el servidor:
    echo    - Cierra todas las ventanas de Node
    echo    - Ejecuta: .\start-admin.bat
    echo 3. Si carga OK pero el test falla, hay problema con Playwright
    echo.
) else (
    echo.
    echo ================================================
    echo   ✓ TEST PASO - TODO OK
    echo ================================================
    echo.
    echo El test mas basico funciona.
    echo Ahora puedes ejecutar tests mas complejos.
    echo.
)

pause
