@echo off
echo ================================
echo   RESONA EVENTS - DESPLIEGUE
echo ================================
echo.

echo [1/3] Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias
    pause
    exit /b 1
)

echo.
echo [2/3] Construyendo aplicacion...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al construir
    pause
    exit /b 1
)

echo.
echo [3/3] Build completado!
echo.
echo Carpeta 'dist' lista para desplegar
echo.
echo OPCIONES DE DESPLIEGUE:
echo.
echo 1. Netlify CLI:
echo    netlify deploy --dir=dist --prod
echo.
echo 2. Netlify Drag-and-Drop:
echo    https://app.netlify.com/drop
echo    (Arrastra la carpeta 'dist')
echo.
echo 3. GitHub + Netlify:
echo    git push origin main
echo    (Conecta GitHub en Netlify)
echo.
pause
