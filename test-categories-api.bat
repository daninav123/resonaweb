@echo off
echo ========================================
echo   PROBANDO API DE CATEGORIAS
echo ========================================
echo.
echo Llamando a: http://localhost:3001/api/v1/products/categories
echo.
curl http://localhost:3001/api/v1/products/categories
echo.
echo.
echo ========================================
pause
