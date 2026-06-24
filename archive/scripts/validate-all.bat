@echo off
echo ========================================
echo    VALIDACION COMPLETA DEL SISTEMA
echo ========================================
echo.

echo [1/5] Verificando Backend...
cd packages\backend
call npm run test:e2e:basic > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Backend funcionando
) else (
    echo   [ERROR] Backend con problemas
)

echo.
echo [2/5] Verificando Frontend...
curl -s http://localhost:3000 > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Frontend accesible
) else (
    echo   [ERROR] Frontend no accesible
)

echo.
echo [3/5] Verificando API...
curl -s http://localhost:3001/api/v1/products > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] API respondiendo
) else (
    echo   [ERROR] API no responde
)

echo.
echo [4/5] Verificando Base de Datos...
docker ps | findstr resona-db > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] PostgreSQL corriendo
) else (
    echo   [ERROR] PostgreSQL no detectado
)

echo.
echo [5/5] Ejecutando Tests E2E...
call node test-complete-system.js > test-results.txt 2>&1
findstr /C:"SISTEMA 100%% FUNCIONAL" test-results.txt > nul
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Todos los tests pasaron
) else (
    echo   [ERROR] Algunos tests fallaron
)

echo.
echo ========================================
echo    VALIDACION COMPLETADA
echo ========================================
echo.
echo Ver detalles en: test-results.txt
echo Ver documentacion en: ESTADO_FINAL_SISTEMA.md
echo.
pause
