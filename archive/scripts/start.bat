@echo off
echo ========================================
echo      INICIANDO PROYECTO RESONA
echo ========================================
echo.

echo [1/4] Verificando Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta corriendo. Por favor, inicia Docker Desktop.
    pause
    exit /b 1
)
echo [OK] Docker esta corriendo

echo.
echo [2/4] Levantando contenedores Docker...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron levantar los contenedores.
    pause
    exit /b 1
)
echo [OK] Contenedores levantados

echo.
echo [3/4] Esperando a que PostgreSQL este listo...
timeout /t 5 /nobreak >nul
echo [OK] Base de datos lista

echo.
echo [4/4] Iniciando servidores...
echo.
echo ========================================
echo   SERVIDORES INICIADOS
echo ========================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo   Health:    http://localhost:3001/health
echo   Adminer:   http://localhost:8080
echo.
echo ========================================
echo   Presiona Ctrl+C para detener
echo ========================================
echo.

start cmd /k "cd packages\backend && npm run dev"
start cmd /k "cd packages\frontend && npm run dev"

echo Los servidores se estan iniciando en ventanas separadas...
echo.
pause
