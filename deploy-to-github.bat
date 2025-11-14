@echo off
echo ========================================
echo   SUBIENDO A GITHUB: daninav123/resonaweb
echo ========================================
echo.

echo [1/6] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git no esta instalado
    echo Descargalo de: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo Git: OK
echo.

echo [2/6] Inicializando repositorio...
if not exist .git (
    git init
    echo Repositorio inicializado
) else (
    echo Repositorio ya existe
)
echo.

echo [3/6] Configurando usuario...
git config user.name "daninav123"
git config user.email "danielnavarrocampos@icloud.com"
echo Usuario configurado
echo.

echo [4/6] Configurando remoto...
git remote remove origin 2>nul
git remote add origin https://github.com/daninav123/resonaweb.git
echo Remoto configurado: daninav123/resonaweb
echo.

echo [5/6] Añadiendo archivos...
git add .
echo Archivos añadidos
echo.

echo [6/6] Haciendo commit y push...
git commit -m "Initial commit - Resona Events Platform con 15 categorias"
echo.

echo ========================================
echo   PUSH A GITHUB
echo ========================================
echo.
echo Se te pedira tu usuario y token de GitHub.
echo.
echo IMPORTANTE:
echo - Usuario: daninav123
echo - Password: Usa tu Personal Access Token (no tu password)
echo.
echo Si no tienes token:
echo 1. Ve a: https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Marca: repo (todos los permisos)
echo 4. Copia el token
echo.
pause

git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo Intentando con 'master' en lugar de 'main'...
    git branch -M main
    git push -u origin main
)

echo.
echo ========================================
echo   RESULTADO
echo ========================================
echo.

if %errorlevel% equ 0 (
    echo ✅ EXITO! Codigo subido a GitHub
    echo.
    echo Repositorio: https://github.com/daninav123/resonaweb
    echo.
    echo ========================================
    echo   SIGUIENTE PASO: NETLIFY
    echo ========================================
    echo.
    echo 1. Ve a: https://app.netlify.com
    echo 2. Click: "Add new site" → "Import an existing project"
    echo 3. Click: "GitHub"
    echo 4. Selecciona: daninav123/resonaweb
    echo 5. Configuracion:
    echo    - Base directory: packages/frontend
    echo    - Build command: npm run build
    echo    - Publish directory: packages/frontend/dist
    echo 6. Environment variables:
    echo    - VITE_API_URL = (URL de tu backend)
    echo 7. Click: "Deploy site"
    echo.
) else (
    echo ❌ ERROR al subir a GitHub
    echo.
    echo Posibles soluciones:
    echo 1. Verifica tu token de GitHub
    echo 2. Asegurate que el repo existe
    echo 3. Ve a: https://github.com/daninav123/resonaweb
    echo.
)

pause
