@echo off
echo ========================================
echo Verificacion de Docker - ReSona
echo ========================================
echo.

echo Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Docker esta instalado
    docker --version
    echo.
    echo Verificando si Docker esta corriendo...
    docker ps >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] Docker esta corriendo correctamente
        echo.
        echo TODO LISTO! Puedes ejecutar:
        echo   docker compose up -d
        echo   npm run db:migrate:dev
        echo   npm run dev
    ) else (
        echo [ATENCION] Docker instalado pero NO esta corriendo
        echo Por favor abre Docker Desktop y espera a que inicie
    )
) else (
    echo [ERROR] Docker NO esta instalado
    echo.
    echo Para instalar Docker Desktop:
    echo 1. Ve a: https://www.docker.com/products/docker-desktop
    echo 2. Descarga Docker Desktop para Windows
    echo 3. Instala y REINICIA el PC
    echo 4. Abre Docker Desktop
    echo 5. Espera a que el icono de la ballena este verde
    echo 6. Vuelve a ejecutar este script
)

echo.
echo ========================================
pause
