# Descargar sitemap
$sitemap = (Invoke-WebRequest -Uri "https://resona-backend.onrender.com/sitemap.xml").Content

# Buscar URLs de alquiler-sonido-valencia
Write-Host "`n=== URLs con 'alquiler-sonido-valencia' ===" -ForegroundColor Yellow
$sitemap -split "`n" | Select-String "alquiler-sonido-valencia"

Write-Host "`n=== URLs con 'alquiler-altavoces-valencia' ===" -ForegroundColor Yellow
$sitemap -split "`n" | Select-String "alquiler-altavoces-valencia"

Write-Host "`n=== URLs con 'servicios' ===" -ForegroundColor Yellow
($sitemap -split "`n" | Select-String "servicios" | Select-String "alquiler-sonido|alquiler-altavoces").Count
Write-Host "Total URLs /servicios/ con alquiler: $($sitemap -split '`n' | Select-String 'servicios' | Select-String 'alquiler' | Measure-Object | Select-Object -ExpandProperty Count)"

# Contar total de URLs
Write-Host "`n=== Total URLs ===" -ForegroundColor Green
$urlCount = ($sitemap -split "`n" | Select-String "<loc>").Count
Write-Host "Total URLs en sitemap: $urlCount"
