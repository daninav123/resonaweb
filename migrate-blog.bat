@echo off
echo ========================================
echo   MIGRANDO BASE DE DATOS - BLOG
echo ========================================
echo.

echo Generando migración de Prisma...
cd packages\backend
call npx prisma migrate dev --name add_blog_models

echo.
echo ========================================
echo   MIGRACIÓN COMPLETADA
echo ========================================
echo.
echo Tablas de blog creadas:
echo - BlogPost
echo - BlogCategory
echo - BlogTag
echo.
pause
