@echo off
echo ========================================= 
echo ReSona - Sistema de Gestion de Alquiler
echo =========================================
echo.

REM Check Node version
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js 18 o superior desde https://nodejs.org
    pause
    exit /b 1
)

echo Node.js version:
node -v
echo npm version:
npm -v
echo.

REM Install dependencies
echo Instalando dependencias...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo la instalacion de dependencias
    pause
    exit /b 1
)

REM Copy environment files
echo Configurando variables de entorno...
if not exist "packages\backend\.env" (
    copy "packages\backend\.env.example" "packages\backend\.env"
    echo Backend .env creado - Por favor editar con tus valores
) else (
    echo Backend .env ya existe
)

if not exist "packages\frontend\.env" (
    echo VITE_API_URL=http://localhost:3001/api/v1 > "packages\frontend\.env"
    echo Frontend .env creado
) else (
    echo Frontend .env ya existe
)

REM Start Docker services
echo.
echo Iniciando servicios Docker...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado o no esta corriendo
    echo Por favor instala Docker Desktop desde https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Wait for PostgreSQL
echo Esperando a que PostgreSQL este listo...
timeout /t 5 /nobreak >nul

REM Setup database
echo.
echo Configurando base de datos...
call npm run db:generate
call npm run db:migrate:dev

echo.
echo =========================================
echo Setup completado!
echo =========================================
echo.
echo Para iniciar el desarrollo, ejecuta:
echo   npm run dev
echo.
echo Accesos:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Adminer:  http://localhost:8080
echo.
echo Para ver los logs de Docker:
echo   docker-compose logs -f
echo.
pause
