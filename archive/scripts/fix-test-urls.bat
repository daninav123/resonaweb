@echo off
echo ========================================
echo   ARREGLANDO URLs EN TESTS E2E
echo ========================================
echo.
echo Reemplazando localhost:5173 por localhost:3000
echo en todos los archivos de tests...
echo.

cd packages\frontend\tests\e2e

powershell -Command "(Get-Content auth.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content auth.spec.ts"
powershell -Command "(Get-Content categories.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content categories.spec.ts"
powershell -Command "(Get-Content cart-flow.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content cart-flow.spec.ts"
powershell -Command "(Get-Content navigation.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content navigation.spec.ts"
powershell -Command "(Get-Content services-page.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content services-page.spec.ts"
powershell -Command "(Get-Content admin-panel.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content admin-panel.spec.ts"
powershell -Command "(Get-Content event-calculator.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content event-calculator.spec.ts"
powershell -Command "(Get-Content performance.spec.ts) -replace 'localhost:5173', 'localhost:3000' | Set-Content performance.spec.ts"

echo.
echo ========================================
echo   COMPLETADO
echo ========================================
echo.
echo Todas las URLs han sido actualizadas al puerto correcto (3000)
echo.
pause
