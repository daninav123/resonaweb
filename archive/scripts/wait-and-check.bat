@echo off
echo Esperando a que los servicios arranquen (15 segundos)...
ping 127.0.0.1 -n 16 > nul
echo.
node check-services.js
pause
