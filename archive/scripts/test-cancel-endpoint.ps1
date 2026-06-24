# Test Cancel Order Endpoint
Write-Host "🧪 Testing Cancel Order Endpoint..." -ForegroundColor Cyan

# Test sin autenticación (debería dar 401)
Write-Host "`n1. Testing without auth (should return 401):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/orders/test-id/cancel" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{}' `
        -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "Status: $statusCode" -ForegroundColor $(if($statusCode -eq 401){"Green"}else{"Red"})
    if ($statusCode -eq 404) {
        Write-Host "❌ ERROR: Ruta no encontrada (404) - La ruta NO está registrada" -ForegroundColor Red
    } elseif ($statusCode -eq 401) {
        Write-Host "✅ Ruta encontrada pero sin autenticación (esperado)" -ForegroundColor Green
    }
}

Write-Host "`n📋 Resumen:" -ForegroundColor Cyan
Write-Host "- Si ves 404: La ruta NO está registrada correctamente" -ForegroundColor Yellow
Write-Host "- Si ves 401: La ruta SÍ está registrada (necesita autenticación)" -ForegroundColor Yellow
