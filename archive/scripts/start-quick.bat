@echo off
echo ========================================
echo    INICIANDO SISTEMA RESONA
echo ========================================
echo.

echo Iniciando Backend...
cd packages\backend
start "Backend" cmd /k "npm run dev:quick"

echo Iniciando Frontend...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   SISTEMA INICIANDO...
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Admin:    http://localhost:3000/login
echo.
echo   Credenciales:
echo   Email:    admin@resona.com
echo   Password: Admin123!
echo ========================================
echo.
echo Espera 10 segundos y abre: http://localhost:3000
echo.
