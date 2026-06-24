@echo off
echo ========================================
echo VERIFICACION SEO PRODUCCION
echo ========================================
echo.

echo [1/3] Verificando paginas SEO en base de datos...
curl -s https://api.resonaevents.com/api/v1/seo-pages
echo.
echo.

echo [2/3] Verificando sitemap incluye alquiler-altavoces-valencia...
curl -s https://resonaevents.com/sitemap.xml | findstr "alquiler-altavoces"
echo.
echo.

echo [3/3] Verificando que la pagina carga...
curl -I https://resonaevents.com/alquiler-altavoces-valencia
echo.
echo.

echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo ANALISIS:
echo - Si Test 1 devuelve "pages":[], el auto-seed NO funciono
echo - Si Test 2 no muestra nada, el sitemap no tiene la pagina
echo - Si Test 3 da 404, la pagina no existe en frontend
echo.
pause
