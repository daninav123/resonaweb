@echo off
echo ===============================================================
echo  TESTS E2E - SISTEMA COMPLETO DE CALCULADORA CON MONTAJES
echo ===============================================================
echo.

echo [1/4] Test: Flujo completo de calculadora
call npx playwright test tests/e2e/10-calculator-complete-flow.spec.ts --reporter=list
echo.

echo [2/4] Test: Panel de admin - Configuracion
call npx playwright test tests/e2e/11-calculator-admin-config.spec.ts --reporter=list
echo.

echo [3/4] Test: Filtrado de montajes
call npx playwright test tests/e2e/12-montajes-filtering.spec.ts --reporter=list
echo.

echo [4/4] Test: Integracion completa
call npx playwright test tests/e2e/13-integration-complete.spec.ts --reporter=list
echo.

echo ===============================================================
echo  TESTS COMPLETADOS
echo ===============================================================
echo.
echo Para ver el reporte HTML detallado:
echo   npx playwright show-report
echo.
pause
