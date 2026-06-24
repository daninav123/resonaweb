@echo off
echo.
echo Verificando servidores...
echo.
curl http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo.
    echo ✅ Backend funcionando
) else (
    echo.
    echo ❌ Backend no responde
)
echo.
curl http://localhost:3000 2>nul | find "<!doctype html>" >nul
if %errorlevel% equ 0 (
    echo ✅ Frontend funcionando
) else (
    echo ❌ Frontend no responde
)
echo.
