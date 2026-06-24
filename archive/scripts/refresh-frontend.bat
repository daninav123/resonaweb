@echo off
echo ========================================
echo   REFRESCAR FRONTEND - LIMPIAR CACHE
echo ========================================
echo.

echo [1/3] Parando servidor frontend...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq ReSona Frontend*" 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/3] Limpiando cache de Vite...
cd packages\frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache de Vite eliminado
) else (
    echo No hay cache de Vite
)

echo.
echo [3/3] Iniciando servidor...
start "ReSona Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   ✅ FRONTEND REFRESCADO
echo ========================================
echo.
echo Espera 5 segundos y luego:
echo 1. Abre: http://localhost:5173/productos
echo 2. Presiona: Ctrl + Shift + R
echo.
echo Deberas ver las 15 categorias!
echo.
pause
