@echo off
echo ========================================
echo   TEST: DROPDOWN DE CATEGORIAS
echo ========================================
echo.
echo Este script te ayudara a verificar
echo que el dropdown muestra las 15 categorias
echo.
echo PASOS:
echo.
echo 1. Presiona ENTER para abrir la pagina
echo 2. Presiona F12 para abrir consola
echo 3. Ve a /productos (si no estas ahi)
echo 4. Busca en consola:
echo    - "Categorias cargadas: (15)"
echo    - 15 lineas de "Categoria en dropdown"
echo.
echo 5. Mira el sidebar izquierdo
echo 6. Debajo del dropdown debe decir:
echo    "15 categorias disponibles"
echo.
echo 7. Click en el dropdown
echo 8. Deberias ver las 15 categorias
echo.
pause
start http://localhost:5173/productos
echo.
echo ========================================
echo.
echo Si NO ves 15 categorias:
echo.
echo 1. Presiona Ctrl + Shift + R
echo 2. Si no funciona, ejecuta:
echo    .\refresh-frontend.bat
echo.
pause
