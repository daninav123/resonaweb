@echo off
cls
echo ================================================
echo   VERIFICANDO SERVIDORES
echo ================================================
echo.

echo [1/4] Verificando puerto 3000 (Frontend)...
powershell -Command "$result = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue; if ($result.TcpTestSucceeded) { Write-Host '✓ Puerto 3000 ABIERTO' -ForegroundColor Green } else { Write-Host '✗ Puerto 3000 CERRADO' -ForegroundColor Red }"

echo.
echo [2/4] Verificando puerto 3001 (Backend)...
powershell -Command "$result = Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue; if ($result.TcpTestSucceeded) { Write-Host '✓ Puerto 3001 ABIERTO' -ForegroundColor Green } else { Write-Host '✗ Puerto 3001 CERRADO' -ForegroundColor Red }"

echo.
echo [3/4] Intentando conexión HTTP a Frontend...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3000

echo.
echo [4/4] Intentando conexión HTTP a Backend...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:3001/api/v1/health

echo.
echo ================================================
echo   DIAGNOSTICO COMPLETO
echo ================================================
echo.
echo Si ambos puertos estan ABIERTOS y responden 200,
echo el problema esta en Playwright, no en los servidores.
echo.
pause
