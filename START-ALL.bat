@echo off
echo ========================================
echo    INICIANDO PROYECTO COMPLETO
echo ========================================
echo.

echo [1/2] Iniciando BACKEND en puerto 3001...
start "BACKEND - Puerto 3001" cmd /k "cd packages\backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando FRONTEND en puerto 3000...
start "FRONTEND - Puerto 3000" cmd /k "cd packages\frontend && npm run dev"

echo.
echo ========================================
echo   PROYECTO INICIADO
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul
