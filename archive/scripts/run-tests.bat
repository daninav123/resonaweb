@echo off
echo ========================================
echo    EJECUTANDO TODOS LOS TESTS E2E
echo    (26 tests: 16 basicos + 10 extendidos)
echo ========================================
echo.

cd packages\backend
node test-all.js

echo.
echo ========================================
pause
