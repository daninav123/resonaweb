@echo off
echo ========================================
echo    REINICIANDO BACKEND
echo ========================================
echo.

echo [1/3] Buscando procesos en puerto 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo Deteniendo proceso PID: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/3] Limpiando procesos Node.js...
taskkill /F /FI "WINDOWTITLE eq Backend*" 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [3/3] Iniciando Backend...
cd packages\backend
start "Backend ReSona" cmd /k "npm run dev:quick"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   BACKEND REINICIADO
echo ========================================
echo.
echo   Backend corriendo en: http://localhost:3001
echo   Health Check: http://localhost:3001/health
echo.
echo   Ahora prueba los filtros de categoria:
echo   http://localhost:3001/api/v1/products?category=iluminacion
echo.
echo ========================================
echo.
pause
