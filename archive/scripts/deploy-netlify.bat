@echo off
echo ========================================
echo   DEPLOY A NETLIFY
echo ========================================
echo.
echo Tu codigo ya esta en GitHub:
echo https://github.com/daninav123/resonaweb
echo.
echo ========================================
echo   CONFIGURACION PARA NETLIFY
echo ========================================
echo.
echo Base directory:    packages/frontend
echo Build command:     npm run build
echo Publish directory: packages/frontend/dist
echo.
echo Environment variable:
echo   VITE_API_URL = https://tu-backend.com/api/v1
echo.
echo ========================================
echo   ABRIENDO NETLIFY...
echo ========================================
echo.
echo Sigue estos pasos en Netlify:
echo.
echo 1. Click: "Add new site"
echo 2. Click: "Import an existing project"
echo 3. Click: "Deploy with GitHub"
echo 4. Busca: daninav123/resonaweb
echo 5. Configura:
echo    - Base directory: packages/frontend
echo    - Build command: npm run build
echo    - Publish: packages/frontend/dist
echo 6. Añade environment variable:
echo    - VITE_API_URL
echo 7. Click: "Deploy"
echo.
pause
start https://app.netlify.com
echo.
echo ========================================
echo.
echo Para mas detalles, lee: DEPLOY-NETLIFY.md
echo.
pause
