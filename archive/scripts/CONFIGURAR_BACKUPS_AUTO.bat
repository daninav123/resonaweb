@echo off
chcp 65001 >nul
echo.
echo ═══════════════════════════════════════════════════════════
echo   🔧 CONFIGURAR BACKUPS AUTOMÁTICOS
echo ═══════════════════════════════════════════════════════════
echo.
echo Este script configurará backups automáticos diarios a las 3:00 AM
echo.
pause

cd /d "%~dp0packages\backend"

echo.
echo 📋 Creando tarea programada en Windows...
echo.

schtasks /create /tn "ResonaWeb_Backup_Diario" /tr "cmd /c cd /d %CD% && node scripts/backup-now.js" /sc daily /st 03:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ TAREA CREADA EXITOSAMENTE
    echo.
    echo 📊 Detalles:
    echo    Nombre: ResonaWeb_Backup_Diario
    echo    Frecuencia: Diaria
    echo    Hora: 3:00 AM
    echo.
    echo 💡 Para ver la tarea:
    echo    taskschd.msc
    echo.
    echo 💡 Para ejecutar backup manualmente:
    echo    node scripts/backup-now.js
    echo.
) else (
    echo.
    echo ❌ ERROR al crear la tarea
    echo    Intenta ejecutar como Administrador
    echo.
)

pause
