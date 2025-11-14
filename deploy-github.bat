@echo off
echo ====================================
echo   SUBIR A GITHUB - RESONA EVENTS
echo ====================================
echo.

echo Verificando estado de Git...
git status

echo.
echo ¿Continuar con el commit y push? (S/N)
set /p CONFIRM=
if /i not "%CONFIRM%"=="S" (
    echo Operacion cancelada.
    pause
    exit /b 0
)

echo.
echo [1/3] Añadiendo archivos...
git add .

echo.
echo [2/3] Creando commit...
git commit -m "feat: App completa con carrito funcional - Lista para produccion"

echo.
echo [3/3] Subiendo a GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   ✅ CODIGO SUBIDO A GITHUB
    echo ========================================
    echo.
    echo PROXIMO PASO: Conectar con Netlify
    echo.
    echo 1. Ve a: https://app.netlify.com
    echo 2. Click: "Add new site" ^> "Import from Git"
    echo 3. Selecciona: GitHub
    echo 4. Busca tu repo: mywed360
    echo 5. Configuracion:
    echo    - Base directory: packages/frontend
    echo    - Build command: npm run build
    echo    - Publish directory: packages/frontend/dist
    echo 6. Click: "Deploy site"
    echo.
    echo Netlify detectara cambios automaticamente
    echo y redesplegar en cada push!
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ ERROR AL SUBIR
    echo ========================================
    echo.
    echo Posibles causas:
    echo - No estas autenticado en Git
    echo - El remoto no esta configurado
    echo - Conflictos de merge
    echo.
    echo Comandos utiles:
    echo.
    echo Configurar usuario:
    echo   git config --global user.name "Tu Nombre"
    echo   git config --global user.email "tu@email.com"
    echo.
    echo Configurar remoto:
    echo   git remote add origin https://github.com/Daniel-Navarro-Campos/mywed360.git
    echo.
    echo Ver remoto:
    echo   git remote -v
    echo.
)

pause
