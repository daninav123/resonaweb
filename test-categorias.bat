@echo off
echo ========================================
echo   TEST DE 15 CATEGORIAS
echo ========================================
echo.
echo PREREQUISITOS:
echo - Frontend corriendo en http://localhost:3000
echo - Backend corriendo en http://localhost:3001
echo.
echo Verificando servidores...
echo.

REM Verificar que el frontend está corriendo
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2; Write-Host 'Frontend: OK' -ForegroundColor Green } catch { Write-Host 'ERROR: Frontend no esta corriendo en puerto 3000' -ForegroundColor Red; exit 1 }"
if errorlevel 1 (
    echo.
    echo Por favor, inicia el frontend primero:
    echo   cd packages\frontend
    echo   npm run dev
    echo.
    pause
    exit /b 1
)

REM Verificar que el backend está corriendo
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/health' -UseBasicParsing -TimeoutSec 2; Write-Host 'Backend: OK' -ForegroundColor Green } catch { Write-Host 'ADVERTENCIA: Backend podria no estar corriendo' -ForegroundColor Yellow }"

echo.
echo ========================================
echo   EJECUTANDO TESTS
echo ========================================
echo.

cd packages\frontend

REM Usar configuración simple
npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts --reporter=list

echo.
echo ========================================
echo   COMPLETADO
echo ========================================
echo.
pause
