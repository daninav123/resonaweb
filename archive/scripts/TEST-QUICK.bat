@echo off
cls
echo ================================================
echo   TEST E2E - CATEGORIAS
echo ================================================
echo.
echo IMPORTANTE: Asegurate que estan corriendo:
echo   1. Frontend en http://localhost:3000
echo   2. Backend en http://localhost:3001
echo.
echo Presiona CTRL+C para cancelar, o
pause

cd packages\frontend
npx playwright test tests/e2e/categories.spec.ts --config=playwright.config.simple.ts --headed

echo.
echo ================================================
echo   TEST COMPLETADO
echo ================================================
pause
