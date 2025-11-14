Write-Host "🧹 LIMPIANDO CACHÉ Y REINICIANDO..." -ForegroundColor Cyan

# Detener procesos si están corriendo (opcional)
Write-Host "`n1. Deteniendo procesos..." -ForegroundColor Yellow

# Limpiar caché de Vite (frontend)
Write-Host "`n2. Limpiando caché de Vite..." -ForegroundColor Yellow
if (Test-Path "packages\frontend\node_modules\.vite") {
    Remove-Item -Recurse -Force "packages\frontend\node_modules\.vite"
    Write-Host "   ✅ Caché de Vite eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay caché de Vite" -ForegroundColor Gray
}

# Limpiar .next si existe (por si acaso)
if (Test-Path "packages\frontend\.next") {
    Remove-Item -Recurse -Force "packages\frontend\.next"
    Write-Host "   ✅ Caché .next eliminado" -ForegroundColor Green
}

# Limpiar dist
if (Test-Path "packages\frontend\dist") {
    Remove-Item -Recurse -Force "packages\frontend\dist"
    Write-Host "   ✅ Carpeta dist eliminada" -ForegroundColor Green
}

Write-Host "`n✅ LIMPIEZA COMPLETA!" -ForegroundColor Green
Write-Host "`nAhora ejecuta:" -ForegroundColor Cyan
Write-Host "  start-quick.bat" -ForegroundColor White
Write-Host "`nO manualmente:" -ForegroundColor Cyan
Write-Host "  cd packages\backend && npm run dev" -ForegroundColor White
Write-Host "  cd packages\frontend && npm run dev" -ForegroundColor White

Write-Host "`n📝 IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Después de reiniciar, abre el navegador en INCÓGNITO" -ForegroundColor White
Write-Host "  o limpia caché con Ctrl+Shift+R" -ForegroundColor White
