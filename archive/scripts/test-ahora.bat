@echo off
cls
echo ================================================
echo   TEST SIMPLE - RESONA
echo ================================================
echo.

REM Matar cualquier proceso de Playwright colgado
echo [1/3] Limpiando procesos anteriores...
taskkill /F /IM playwright.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak > nul

echo [2/3] Verificando que el servidor esta corriendo...
echo.
powershell -Command "$response = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200) { Write-Host '✓ Servidor OK en puerto 3000' -ForegroundColor Green } else { Write-Host '✗ Error: Servidor no responde' -ForegroundColor Red; exit 1 }" 2>nul

if errorlevel 1 (
    echo.
    echo ERROR: El servidor no esta corriendo en puerto 3000
    echo.
    echo Por favor ejecuta primero:
    echo   .\start-admin.bat
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Ejecutando test simple...
echo.

cd packages\frontend

call npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts

echo.
echo ================================================
echo   COMPLETADO
echo ================================================
echo.
pause
