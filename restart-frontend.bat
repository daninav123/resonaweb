@echo off
echo ========================================
echo    REINICIANDO FRONTEND
echo ========================================
echo.

echo [1/3] Deteniendo procesos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/3] Iniciando Backend...
cd packages\backend
start "Backend" cmd /k "npm run dev:quick"
timeout /t 5 /nobreak > nul

echo.
echo [3/3] Iniciando Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   SISTEMA REINICIADO
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo   Credenciales Admin:
echo   Email:    admin@resona.com
echo   Password: Admin123!
echo.
echo ========================================
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause > nul
start http://localhost:3000
