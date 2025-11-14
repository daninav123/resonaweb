# Script de Verificación del Setup - ReSona

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Verificación de Setup - ReSona" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js NO instalado" -ForegroundColor Red
    exit 1
}

# 2. Verificar npm
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm NO instalado" -ForegroundColor Red
    exit 1
}

# 3. Verificar Docker
Write-Host "3. Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker instalado: $dockerVersion" -ForegroundColor Green
    
    # Verificar que Docker está corriendo
    docker ps *>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker está corriendo" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Docker instalado pero NO está corriendo" -ForegroundColor Yellow
        Write-Host "      Por favor, abre Docker Desktop" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Docker NO instalado" -ForegroundColor Red
    Write-Host "      Descarga desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

# 4. Verificar dependencias
Write-Host "4. Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Dependencias NO instaladas" -ForegroundColor Red
    Write-Host "      Ejecuta: npm install" -ForegroundColor Yellow
}

# 5. Verificar archivos .env
Write-Host "5. Verificando archivos .env..." -ForegroundColor Yellow
if (Test-Path "packages\backend\.env") {
    Write-Host "   ✅ Backend .env existe" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend .env NO existe" -ForegroundColor Red
    Write-Host "      Ejecuta: copy packages\backend\.env.example packages\backend\.env" -ForegroundColor Yellow
}

if (Test-Path "packages\frontend\.env") {
    Write-Host "   ✅ Frontend .env existe" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Frontend .env NO existe (opcional)" -ForegroundColor Yellow
}

# 6. Verificar Prisma Client
Write-Host "6. Verificando Prisma Client..." -ForegroundColor Yellow
if (Test-Path "node_modules\.prisma\client") {
    Write-Host "   ✅ Prisma Client generado" -ForegroundColor Green
} else {
    Write-Host "   ❌ Prisma Client NO generado" -ForegroundColor Red
    Write-Host "      Ejecuta: npm run db:generate" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Verificación Completa" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Mostrar próximos pasos
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Si Docker NO está instalado:" -ForegroundColor Yellow
Write-Host "   - Descarga: https://www.docker.com/products/docker-desktop" -ForegroundColor White
Write-Host "   - Instala y reinicia el PC" -ForegroundColor White
Write-Host ""
Write-Host "2. Una vez Docker esté listo:" -ForegroundColor Yellow
Write-Host "   docker compose up -d" -ForegroundColor White
Write-Host "   npm run db:migrate:dev" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Accede a la aplicación:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "   Health:   http://localhost:3001/health" -ForegroundColor White
Write-Host ""
