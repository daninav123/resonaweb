@echo off
echo ========================================
echo VERIFICAR SITEMAP BACKEND DIRECTO
echo ========================================
echo.

echo Obteniendo sitemap del backend...
echo URL: https://resona-backend.onrender.com/sitemap.xml
echo.

curl -s https://resona-backend.onrender.com/sitemap.xml > temp_sitemap.xml

echo.
echo Buscando paginas SEO con "alquiler"...
findstr /i "alquiler" temp_sitemap.xml

echo.
echo ========================================
echo.
echo Si ves URLs con "alquiler-altavoces-valencia", etc.
echo el sitemap backend funciona correctamente!
echo.
echo Ahora Vercel tiene que redesplegar (5 min)
echo.

del temp_sitemap.xml
pause
