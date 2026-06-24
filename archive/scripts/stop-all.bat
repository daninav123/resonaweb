@echo off
echo ========================================
echo    DETENIENDO TODOS LOS SERVICIOS
echo ========================================
echo.

echo Deteniendo procesos Node.js...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Procesos detenidos
) else (
    echo - No habia procesos corriendo
)

echo.
echo ========================================
echo   TODOS LOS SERVICIOS DETENIDOS
echo ========================================
echo.
pause
