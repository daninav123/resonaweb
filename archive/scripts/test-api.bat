@echo off
echo ========================================
echo   PROBANDO API DE CATEGORIAS
echo ========================================
echo.
echo Este script abre una pagina HTML que
echo llama directamente a la API del backend
echo.
echo La API esta en:
echo http://localhost:3001/api/v1/products/categories
echo.
pause
start test-api-categorias.html
echo.
echo ========================================
echo   INSTRUCCIONES:
echo ========================================
echo.
echo 1. Click en "Probar API"
echo 2. Deberas ver "Total: 15 categorias"
echo 3. Si ves menos, el problema esta en el backend
echo 4. Si ves 15, el problema esta en el frontend
echo.
pause
