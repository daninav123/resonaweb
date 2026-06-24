@echo off
echo ========================================
echo   VERIFICAR DROPDOWN MENU CATALOGO
echo ========================================
echo.
echo Este script te ayuda a verificar que
echo el dropdown del menu "Catalogo" muestre
echo las 15 categorias.
echo.
echo ========================================
echo   DONDE VERIFICAR:
echo ========================================
echo.
echo 1. Abre: http://localhost:5173
echo 2. Mira el menu superior (header)
echo 3. Haz HOVER sobre "Catalogo"
echo 4. Se abrira un dropdown
echo.
echo Deberias ver:
echo - "Ver Todo el Catalogo"
echo - "Por Categoria (15)"
echo - 15 categorias con iconos
echo.
echo ========================================
echo   CATEGORIAS ESPERADAS:
echo ========================================
echo.
echo 📷 Fotografia y Video
echo 💡 Iluminacion
echo 🔊 Sonido
echo 🎤 Microfonia
echo 🎛️ Mesas de Mezcla para Directo
echo 🎧 Equipamiento DJ
echo 🎪 Elementos de Escenario
echo ✨ Elementos Decorativos
echo 🪑 Mobiliario
echo 🎸 Backline
echo 📺 Pantallas y Proyeccion
echo 🎆 Efectos Especiales
echo 📡 Comunicaciones
echo ⚡ Energia y Distribucion
echo 🔌 Cables y Conectores
echo.
echo ========================================
pause
echo.
echo Abriendo pagina...
start http://localhost:5173
echo.
echo ========================================
echo   SI NO VES 15 CATEGORIAS:
echo ========================================
echo.
echo 1. Presiona Ctrl + Shift + R
echo 2. Abre consola (F12)
echo 3. Busca: "Categorias cargadas en Header"
echo 4. Debe decir: Array(15)
echo.
echo Si sigue sin funcionar:
echo   .\limpiar-cache-total.bat
echo.
pause
