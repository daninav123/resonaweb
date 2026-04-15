#!/bin/bash

# =============================================================
# RESONA - Script de Setup para Linux (vía SSH)
# Repositorio: https://github.com/daninav123/resonaweb
# =============================================================

set -e  # Salir si cualquier comando falla

TIMEOUT=120
REPO_URL="https://github.com/daninav123/resonaweb"
PROJECT_DIR="$HOME/resonaweb"
LOG_FILE="$HOME/resona-setup.log"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN: $1${NC}" | tee -a "$LOG_FILE"; }
error() { echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"; exit 1; }
info() { echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"; }

run_with_timeout() {
    local cmd="$1"
    local desc="$2"
    info "Ejecutando: $desc"
    timeout $TIMEOUT bash -c "$cmd" >> "$LOG_FILE" 2>&1 || error "Timeout o error en: $desc (revisar $LOG_FILE)"
    log "OK: $desc"
}

echo "" | tee "$LOG_FILE"
log "========================================="
log " RESONA - Setup en Linux"
log "========================================="

# ─── 1. VERIFICAR REQUISITOS ─────────────────────────────────
log "1/8 Verificando requisitos del sistema..."

if ! command -v docker &>/dev/null; then
    error "Docker no está instalado. Instálalo primero: https://docs.docker.com/engine/install/"
fi
log "Docker: $(docker --version)"

if ! docker compose version &>/dev/null 2>&1; then
    error "Docker Compose (v2) no está disponible. Instálalo."
fi
log "Docker Compose: $(docker compose version)"

if ! command -v git &>/dev/null; then
    warn "Git no encontrado. Intentando instalar..."
    sudo apt-get update -y && sudo apt-get install -y git || error "No se pudo instalar git"
fi
log "Git: $(git --version)"

if ! command -v node &>/dev/null; then
    warn "Node.js no encontrado. Instalando versión 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >> "$LOG_FILE" 2>&1
    sudo apt-get install -y nodejs >> "$LOG_FILE" 2>&1
fi
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Se requiere Node.js >= 18. Versión actual: $(node --version)"
fi
log "Node.js: $(node --version)"
log "npm: $(npm --version)"

# ─── 2. CLONAR REPOSITORIO ────────────────────────────────────
log "2/8 Clonando repositorio..."

if [ -d "$PROJECT_DIR/.git" ]; then
    warn "El directorio ya existe. Haciendo git pull..."
    cd "$PROJECT_DIR"
    timeout $TIMEOUT git pull origin main >> "$LOG_FILE" 2>&1 || error "No se pudo hacer git pull"
else
    timeout $TIMEOUT git clone "$REPO_URL" "$PROJECT_DIR" >> "$LOG_FILE" 2>&1 || error "No se pudo clonar el repositorio"
fi
log "Repositorio listo en: $PROJECT_DIR"

cd "$PROJECT_DIR"

# ─── 3. CONFIGURAR VARIABLES DE ENTORNO ─────────────────────
log "3/8 Configurando variables de entorno..."

# Backend .env
if [ ! -f "packages/backend/.env" ]; then
    cp packages/backend/.env.example packages/backend/.env
    
    # Ajustar DATABASE_URL para Docker (usuario resona_user, docker-compose credentials)
    sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://resona_user:resona_password@localhost:5432/resona_db"|' packages/backend/.env
    
    # Ajustar Redis
    sed -i 's|REDIS_HOST=.*|REDIS_HOST=localhost|' packages/backend/.env
    sed -i 's|REDIS_PORT=.*|REDIS_PORT=6379|' packages/backend/.env
    sed -i 's|REDIS_URL=.*|REDIS_URL=redis://localhost:6379|' packages/backend/.env
    
    # JWT secrets aleatorios
    JWT_ACCESS=$(openssl rand -hex 32)
    JWT_REFRESH=$(openssl rand -hex 32)
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_ACCESS|" packages/backend/.env
    sed -i "s|JWT_ACCESS_SECRET=.*|JWT_ACCESS_SECRET=$JWT_ACCESS|" packages/backend/.env
    sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$JWT_REFRESH|" packages/backend/.env
    
    # OpenAI key (configura OPENAI_API_KEY en tu entorno o edita el .env manualmente)
    # sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$OPENAI_API_KEY|" packages/backend/.env
    
    # URLs locales
    sed -i 's|BACKEND_URL=.*|BACKEND_URL=http://localhost:3001|' packages/backend/.env
    sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=http://localhost:3000|' packages/backend/.env
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:3000,http://localhost:3002|' packages/backend/.env
    sed -i 's|NODE_ENV=.*|NODE_ENV=development|' packages/backend/.env
    
    log "Backend .env creado"
else
    warn "Backend .env ya existe, no se sobreescribe"
fi

# Frontend .env
if [ ! -f "packages/frontend/.env" ]; then
    cp packages/frontend/.env.example packages/frontend/.env
    sed -i 's|VITE_API_URL=.*|VITE_API_URL=http://localhost:3001/api/v1|' packages/frontend/.env
    sed -i 's|VITE_ENV=.*|VITE_ENV=development|' packages/frontend/.env
    log "Frontend .env creado"
else
    warn "Frontend .env ya existe, no se sobreescribe"
fi

# ─── 4. LEVANTAR DOCKER (DB + Redis) ────────────────────────
log "4/8 Levantando servicios Docker (PostgreSQL + Redis + Adminer)..."

run_with_timeout "docker compose up -d postgres redis adminer" "docker compose up"

# Esperar a que PostgreSQL esté listo
info "Esperando a que PostgreSQL esté listo..."
for i in $(seq 1 30); do
    if docker exec resona-db pg_isready -U resona_user -d resona_db &>/dev/null; then
        log "PostgreSQL listo."
        break
    fi
    if [ "$i" -eq 30 ]; then
        error "PostgreSQL no arrancó a tiempo. Revisa: docker logs resona-db"
    fi
    sleep 2
done

# ─── 5. INSTALAR DEPENDENCIAS BACKEND ───────────────────────
log "5/8 Instalando dependencias del backend..."
cd "$PROJECT_DIR/packages/backend"
run_with_timeout "npm install --prefer-offline 2>&1 || npm install" "npm install backend"

# ─── 6. PRISMA: GENERAR + MIGRAR ────────────────────────────
log "6/8 Generando cliente Prisma y ejecutando migraciones..."
run_with_timeout "npx prisma generate" "prisma generate"
run_with_timeout "npx prisma migrate deploy" "prisma migrate deploy"
log "Base de datos migrada correctamente"

# ─── 7. INSTALAR DEPENDENCIAS FRONTEND ──────────────────────
log "7/8 Instalando dependencias del frontend..."
cd "$PROJECT_DIR/packages/frontend"
run_with_timeout "npm install --prefer-offline 2>&1 || npm install" "npm install frontend"

# ─── 8. INSTALAR PM2 Y CONFIGURAR PROCESOS ──────────────────
log "8/8 Configurando PM2 para gestión de procesos..."

if ! command -v pm2 &>/dev/null; then
    run_with_timeout "sudo npm install -g pm2" "instalar pm2"
fi

# Parar procesos previos si existen
pm2 delete resona-backend 2>/dev/null || true
pm2 delete resona-frontend 2>/dev/null || true

# Arrancar backend
cd "$PROJECT_DIR/packages/backend"
pm2 start "npm run dev" --name resona-backend --cwd "$PROJECT_DIR/packages/backend"

# Arrancar frontend
cd "$PROJECT_DIR/packages/frontend"
pm2 start "npm run dev -- --host 0.0.0.0 --port 3000" --name resona-frontend --cwd "$PROJECT_DIR/packages/frontend"

# Guardar configuración PM2 para reinicio automático
pm2 save
pm2 startup 2>&1 | grep "sudo" | bash 2>/dev/null || true

# ─── RESUMEN FINAL ────────────────────────────────────────────
echo ""
log "========================================="
log " SETUP COMPLETADO EXITOSAMENTE"
log "========================================="
echo ""
info "Servicios disponibles:"
info "  Frontend:    http://localhost:3000"
info "  Backend API: http://localhost:3001/api/v1"
info "  Adminer DB:  http://localhost:8080"
info "  Grafana:     http://localhost:3002 (si lo activas)"
echo ""
info "Comandos útiles:"
info "  Ver logs backend:   pm2 logs resona-backend"
info "  Ver logs frontend:  pm2 logs resona-frontend"
info "  Estado servicios:   pm2 status"
info "  Estado Docker:      docker compose ps"
info "  Prisma Studio:      cd packages/backend && npx prisma studio"
echo ""
info "Para acceder desde tu Mac con SSH tunnel:"
info "  ssh -L 3000:localhost:3000 -L 3001:localhost:3001 -L 8080:localhost:8080 usuario@IP_SERVIDOR -N"
echo ""
log "Log completo en: $LOG_FILE"
