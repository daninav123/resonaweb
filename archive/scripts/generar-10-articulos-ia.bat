@echo off
echo ========================================
echo   GENERANDO 10 ARTICULOS CON IA
echo ========================================
echo.
echo Esto tomara 5-10 minutos...
echo La IA creara articulos profesionales de 1800-2200 palabras
echo.

cd packages\backend
call npx ts-node src/scripts/generate-10-articles.ts

echo.
echo ========================================
echo   GENERACION COMPLETADA
echo ========================================
pause
