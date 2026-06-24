@echo off
cls
echo ================================================
echo   REINICIO COMPLETO - RESONA
echo ================================================
echo.
echo Este script va a:
echo 1. Matar todos los procesos Node y Chrome
echo 2. Limpiar cache de Vite
echo 3. Reiniciar Backend y Frontend
echo.
echo ADVERTENCIA: Cerrara TODOS los procesos Node.js
echo.
pause

echo.
echo [1/5] Matando procesos...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM playwright.exe 2>nul
echo ✓ Procesos eliminados

echo.
echo [2/5] Limpiando cache de Vite...
cd packages\frontend
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist
echo ✓ Cache limpiado

echo.
echo [3/5] Verificando puerto 3000...
netstat -ano | findstr :3000
if errorlevel 1 (
    echo ✓ Puerto 3000 libre
) else (
    echo ! Puerto 3000 todavia ocupado - matando...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%a /F 2>nul
)

echo.
echo [4/5] Iniciando Backend...
cd ..\backend
start "ReSona Backend" cmd /k "npm run dev:quick"
timeout /t 5 /nobreak > nul
echo ✓ Backend iniciado

echo.
echo [5/5] Iniciando Frontend...
cd ..\frontend
start "ReSona Frontend" cmd /k "npm run dev"
timeout /t 8 /nobreak > nul

echo.
echo ================================================
echo   REINICIO COMPLETADO
echo ================================================
echo.
echo IMPORTANTE:
echo 1. Verifica que ambas ventanas se abrieron
echo 2. Espera a ver "Local: http://localhost:3000/" en Frontend
echo 3. Abre http://localhost:3000 en navegador
echo 4. Si carga correctamente, ejecuta: test-simple-ahora.bat
echo.
echo Presiona cualquier tecla para abrir navegador...
pause > nul
start http://localhost:3000
echo.
echo Si la pagina carga OK, ejecuta los tests con:
echo   test-simple-ahora.bat
echo.
pause
