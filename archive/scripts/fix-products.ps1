$source = "packages\frontend\src\pages\admin\ProductsManagerFull.tsx"
$dest = "packages\frontend\src\pages\admin\ProductsManager.tsx"

if (Test-Path $source) {
    Copy-Item $source $dest -Force
    Write-Host "✅ ProductsManager.tsx actualizado exitosamente"
} else {
    Write-Host "❌ Error: No se encuentra ProductsManagerFull.tsx"
}
