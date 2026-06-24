@echo off
echo ========================================
echo    DETENIENDO BACKEND EN PUERTO 3001
echo ========================================
echo.

echo Buscando procesos en puerto 3001...
netstat -ano | findstr :3001

echo.
echo Matando procesos Node.js en puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
    echo Matando proceso PID: %%a
    taskkill /F /PID %%a 2>nul
)

timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo   PUERTO 3001 LIBERADO
echo ========================================
echo.
pause
