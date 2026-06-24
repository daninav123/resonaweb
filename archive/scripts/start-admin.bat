@echo off
echo ========================================
echo    INICIANDO PANEL DE ADMIN RESONA
echo ========================================
echo.

echo [1/3] Arrancando Backend...
cd packages\backend
start "ReSona Backend" cmd /k "npm run dev:quick"
timeout /t 5 /nobreak > nul

echo.
echo [2/3] Arrancando Frontend...
cd ..\frontend
start "ReSona Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo [3/3] Todo listo!
echo.
echo ========================================
echo   ACCEDE AL PANEL DE ADMIN AQUI:
echo   http://localhost:3000/login
echo.
echo   CREDENCIALES:
echo   Email:    admin@resona.com
echo   Password: Admin123!
echo ========================================
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause > nul
start http://localhost:3000/login
