@echo off
echo Matando procesos Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo Iniciando servicios...
cd /d "%~dp0"
start cmd /k "cd packages\backend && npm run dev"
timeout /t 5 /nobreak >nul
start cmd /k "cd packages\frontend && npm run dev"

echo.
echo Servicios iniciados.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
timeout /t 5 /nobreak
start http://localhost:3000/admin/blog
exit
