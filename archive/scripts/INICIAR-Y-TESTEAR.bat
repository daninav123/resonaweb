@echo off
cls
echo ================================================
echo   RESONA - INICIO Y TESTING COMPLETO
echo ================================================
echo.

REM Paso 1: Limpiar todo
echo [1/6] Matando procesos anteriores...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM chrome.exe 2>nul
timeout /t 2 /nobreak > nul
echo ✓ Procesos limpiados

REM Paso 2: Limpiar cache
echo.
echo [2/6] Limpiando cache de Vite...
cd packages\frontend
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✓ Cache eliminado
) else (
    echo ✓ Cache ya estaba limpio
)

REM Paso 3: Iniciar Backend
echo.
echo [3/6] Iniciando Backend en puerto 3001...
cd ..\backend
start "RESONA Backend :3001" cmd /k "npm run dev:quick"
timeout /t 5 /nobreak > nul
echo ✓ Backend iniciado (ver ventana separada)

REM Paso 4: Iniciar Frontend
echo.
echo [4/6] Iniciando Frontend en puerto 3000...
cd ..\frontend
start "RESONA Frontend :3000" cmd /k "npm run dev"
echo ✓ Frontend iniciando (ver ventana separada)

REM Paso 5: Esperar que arranquen
echo.
echo [5/6] Esperando que los servidores arranquen...
echo      Esto puede tomar 10-20 segundos...
timeout /t 15 /nobreak > nul

REM Verificar Backend
echo.
echo Verificando Backend (puerto 3001)...
curl -s http://localhost:3001/api/v1/health > nul 2>&1
if errorlevel 1 (
    echo ! ADVERTENCIA: Backend podria no estar listo todavia
    echo   Revisa la ventana "RESONA Backend :3001"
) else (
    echo ✓ Backend responde correctamente
)

REM Verificar Frontend  
echo.
echo Verificando Frontend (puerto 3000)...
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ! ADVERTENCIA: Frontend podria no estar listo todavia
    echo   Revisa la ventana "RESONA Frontend :3000"
    echo   Espera a ver el mensaje: "Local: http://localhost:3000/"
    echo.
    echo Presiona cualquier tecla cuando veas ese mensaje...
    pause > nul
) else (
    echo ✓ Frontend responde
)

REM Paso 6: Abrir navegador para verificar
echo.
echo [6/6] Abriendo navegador para verificar...
start http://localhost:3000
timeout /t 3 /nobreak > nul

echo.
echo ================================================
echo   VERIFICACION MANUAL
echo ================================================
echo.
echo Se abrio tu navegador en http://localhost:3000
echo.
echo PREGUNTA: ¿Se ve tu aplicacion correctamente?
echo.
echo   Si ves tu aplicacion → Presiona CUALQUIER tecla
echo   Si ves error 404     → Presiona CTRL+C
echo.
pause > nul

echo.
echo ================================================
echo   EJECUTANDO TESTS E2E
echo ================================================
echo.
echo Los tests se van a ejecutar ahora...
echo Veras Chrome abriendose automaticamente.
echo.
timeout /t 3 /nobreak > nul

cd packages\frontend

echo Ejecutando test simple de conexion...
call npx playwright test tests/e2e/test-simple.spec.ts --config=playwright.minimal.config.ts --reporter=list

if errorlevel 1 (
    echo.
    echo ================================================
    echo   TESTS FALLARON
    echo ================================================
    echo.
    echo Revisa los errores arriba.
    echo.
    echo Posibles soluciones:
    echo 1. Instala navegadores: npx playwright install chromium
    echo 2. Verifica que http://localhost:3000 carga en navegador
    echo 3. Revisa las ventanas del Backend y Frontend por errores
    echo.
) else (
    echo.
    echo ================================================
    echo   ✓ TESTS PASARON EXITOSAMENTE
    echo ================================================
    echo.
    echo Para ejecutar mas tests:
    echo   cd packages\frontend
    echo   npx playwright test tests/e2e/categories.spec.ts --config=playwright.minimal.config.ts
    echo.
)

pause
