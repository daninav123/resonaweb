@echo off
cls
echo ================================================
echo   TEST SIMPLE RESONA
echo ================================================
echo.
echo IMPORTANTE: El servidor DEBE estar corriendo
echo Abre http://localhost:3000 en navegador primero
echo.
pause

echo Matando procesos anteriores...
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo Ejecutando test...
echo.

cd packages\frontend
call npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts

echo.
echo COMPLETADO
pause
