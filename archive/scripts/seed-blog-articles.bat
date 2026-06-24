@echo off
echo ========================================
echo   CREANDO 10 ARTICULOS INICIALES
echo ========================================
echo.

cd packages\backend
call npx ts-node src/scripts/seed-blog.ts

echo.
echo ========================================
echo   ARTICULOS CREADOS
echo ========================================
pause
