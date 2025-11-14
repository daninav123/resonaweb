@echo off
echo ========================================
echo   LIMPIEZA TOTAL DE CACHE
echo ========================================
echo.
echo Este script va a:
echo 1. Detener servidores
echo 2. Limpiar cache de Vite
echo 3. Reiniciar servidores
echo 4. Abrir navegador en modo incognito
echo.
echo IMPORTANTE: Cierra el navegador ANTES de continuar
echo.
pause

echo.
echo [1/5] Deteniendo servidores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo [2/5] Limpiando cache de Vite...
cd packages\frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo Cache eliminado
) else (
    echo No hay cache
)
if exist dist (
    rmdir /s /q dist
    echo Dist eliminado
)

echo.
echo [3/5] Reiniciando frontend...
start "ReSona Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak > nul

cd ..\backend
echo.
echo [4/5] Reiniciando backend...
start "ReSona Backend" cmd /k "npm run dev:quick"
timeout /t 3 /nobreak > nul

cd ..\..

echo.
echo [5/5] Abriendo navegador...
echo.
echo ========================================
echo   INSTRUCCIONES FINALES:
echo ========================================
echo.
echo 1. El navegador se abrira en modo incognito
echo 2. Espera a que cargue completamente
echo 3. Presiona F12 para abrir consola
echo 4. Busca: "15 categorias disponibles"
echo 5. Verifica el dropdown
echo.
echo Si sigues viendo 3 categorias:
echo - Ejecuta: .\test-api.bat
echo - Verifica que la API devuelve 15
echo.
pause

echo Abriendo navegador en 3 segundos...
timeout /t 3 /nobreak > nul

REM Intenta abrir en modo incognito (Chrome/Edge)
start chrome --incognito http://localhost:5173/productos 2>nul
if %errorlevel% neq 0 (
    start msedge --inprivate http://localhost:5173/productos 2>nul
)
if %errorlevel% neq 0 (
    echo No se pudo abrir en modo incognito
    echo Abre manualmente: http://localhost:5173/productos
)

echo.
echo ========================================
echo   LIMPIEZA COMPLETADA
echo ========================================
pause
