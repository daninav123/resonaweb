@echo off
echo ============================================
echo   CONFIGURACION INICIAL DE GIT Y GITHUB
echo ============================================
echo.

echo [1/5] Inicializando repositorio Git...
git init
if %errorlevel% neq 0 (
    echo ERROR: No se pudo inicializar Git
    pause
    exit /b 1
)

echo.
echo [2/5] Configurando usuario Git...
echo.
set /p GIT_NAME="Tu nombre (ej: Daniel Navarro): "
set /p GIT_EMAIL="Tu email (ej: tu@email.com): "

git config --global user.name "%GIT_NAME%"
git config --global user.email "%GIT_EMAIL%"

echo.
echo ✅ Usuario configurado:
git config --global user.name
git config --global user.email

echo.
echo [3/5] Configurando remoto de GitHub...
git remote add origin https://github.com/Daniel-Navarro-Campos/mywed360.git
if %errorlevel% neq 0 (
    echo NOTA: Remoto ya existe, actualizando...
    git remote set-url origin https://github.com/Daniel-Navarro-Campos/mywed360.git
)

echo.
echo ✅ Remoto configurado:
git remote -v

echo.
echo [4/5] Añadiendo archivos...
git add .

echo.
echo [5/5] Creando commit inicial...
git commit -m "feat: Proyecto Resona Events completo - Frontend funcional con carrito"

echo.
echo ============================================
echo   ✅ GIT CONFIGURADO CORRECTAMENTE
echo ============================================
echo.
echo PROXIMO PASO: Subir a GitHub
echo.
echo Ejecuta:
echo   .\deploy-github.bat
echo.
echo O manualmente:
echo   git push -u origin main
echo.
pause
