@echo off
echo ========================================
echo VERIFICACION COMPLETA DEL PROYECTO
echo ========================================
echo.

echo [1/5] Verificando Docker...
docker ps | findstr "resona" >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Docker containers corriendo
) else (
    echo   ✗ Docker NO esta corriendo
    echo   Ejecuta: docker compose up -d
)
echo.

echo [2/5] Verificando Backend (puerto 3001)...
curl -s http://localhost:3001/health >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend responde en puerto 3001
    curl -s http://localhost:3001/health
) else (
    echo   ✗ Backend NO responde
    echo   Ejecuta: npm run dev:backend
)
echo.

echo [3/5] Verificando Frontend (puerto 3000)...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Frontend responde en puerto 3000
) else (
    echo   ✗ Frontend NO responde
    echo   Ejecuta: npm run dev:frontend
)
echo.

echo [4/5] Verificando compilacion Backend...
cd packages\backend
if exist "dist\index.js" (
    echo   ✓ Backend compilado correctamente
) else (
    echo   ✗ Backend NO compilado
    echo   Ejecuta: npm run build --workspace=backend
)
cd ..\..
echo.

echo [5/5] Verificando compilacion Frontend...
cd packages\frontend
if exist "dist\index.html" (
    echo   ✓ Frontend compilado correctamente
) else (
    echo   ✗ Frontend NO compilado
    echo   Ejecuta: npm run build --workspace=frontend
)
cd ..\..
echo.

echo ========================================
echo RESUMEN:
echo ========================================
echo.
echo Backend API:     http://localhost:3001
echo Frontend:        http://localhost:3000
echo Adminer (DB):    http://localhost:8080
echo.
echo Endpoints disponibles:
echo   POST /api/v1/auth/register
echo   POST /api/v1/auth/login
echo   GET  /api/v1/products
echo   GET  /api/v1/users
echo.
echo Lee ESTADO_FINAL_REAL.md para mas detalles
echo.
pause
