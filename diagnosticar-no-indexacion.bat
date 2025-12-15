@echo off
echo ========================================
echo DIAGNOSTICO COMPLETO NO INDEXACION
echo ========================================
echo.

echo [1/6] Verificando que la pagina carga (debe ser 200 OK)...
curl -I https://resonaevents.com/alquiler-altavoces-valencia 2>nul | findstr "HTTP"
echo.

echo [2/6] Verificando robots.txt no bloquea...
curl -s https://resonaevents.com/robots.txt | findstr /C:"Disallow: /alquiler" /C:"Disallow: /*"
if errorlevel 1 (
    echo [OK] robots.txt NO bloquea la pagina
) else (
    echo [ERROR] robots.txt esta bloqueando!
)
echo.

echo [3/6] Verificando sitemap incluye la pagina...
curl -s https://resonaevents.com/sitemap.xml | findstr "alquiler-altavoces-valencia"
if errorlevel 1 (
    echo [ERROR] Pagina NO esta en sitemap.xml
) else (
    echo [OK] Pagina SI esta en sitemap.xml
)
echo.

echo [4/6] Verificando meta robots (debe NO tener noindex)...
curl -s https://resonaevents.com/alquiler-altavoces-valencia | findstr /I "noindex"
if errorlevel 1 (
    echo [OK] NO tiene meta noindex
) else (
    echo [ERROR] Tiene meta noindex bloqueando indexacion!
)
echo.

echo [5/6] Verificando que el contenido se renderiza...
curl -s https://resonaevents.com/alquiler-altavoces-valencia | findstr "Altavoces Profesionales"
if errorlevel 1 (
    echo [ERROR] Contenido NO se renderiza (SPA problem)
) else (
    echo [OK] Contenido SI se renderiza
)
echo.

echo [6/6] Verificando canonical URL...
curl -s https://resonaevents.com/alquiler-altavoces-valencia | findstr "canonical"
echo.

echo ========================================
echo DIAGNOSTICO COMPLETADO
echo ========================================
echo.
echo ANALISIS:
echo - Si Test 1 NO es 200: La pagina no existe o redirige
echo - Si Test 2 bloquea: robots.txt esta mal configurado
echo - Si Test 3 NO esta: sitemap.xml no incluye la pagina
echo - Si Test 4 tiene noindex: Meta tag bloqueando indexacion
echo - Si Test 5 NO renderiza: Google solo ve app vacio (SSR problem)
echo - Test 6: Debe tener canonical correcto
echo.
pause
