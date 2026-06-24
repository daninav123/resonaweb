@echo off
echo ========================================
echo   VERIFICAR CATEGORIAS EN FRONTEND
echo ========================================
echo.
echo 1. Abre: http://localhost:5173/productos
echo.
echo 2. Mira el sidebar izquierdo
echo.
echo 3. Deberias ver 15 categorias:
echo.
echo    SOLICITADAS:
echo    - Sonido
echo    - Microfonia
echo    - Mesas de Mezcla para Directo
echo    - Equipamiento DJ
echo    - Elementos de Escenario
echo    - Elementos Decorativos
echo.
echo    EXTRAS:
echo    - Backline
echo    - Pantallas y Proyeccion
echo    - Efectos Especiales
echo    - Comunicaciones
echo    - Energia y Distribucion
echo    - Cables y Conectores
echo.
echo    EXISTENTES:
echo    - Fotografia y Video
echo    - Iluminacion
echo    - Mobiliario
echo.
echo ========================================
echo.
pause
start http://localhost:5173/productos
