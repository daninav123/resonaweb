@echo off
echo ========================================
echo   EJECUTANDO TEST DE CATEGORIAS
echo ========================================
echo.

cd packages\frontend

echo Ejecutando test de las 15 categorias...
echo.

call npx playwright test tests/e2e/categories.spec.ts

echo.
echo ========================================
echo   TEST COMPLETADO
echo ========================================
echo.
echo Para ver el reporte:
echo   cd packages\frontend
echo   npx playwright show-report
echo.
pause
