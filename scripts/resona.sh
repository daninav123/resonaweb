#!/bin/bash

# =============================================================
# RESONA - Script de gestión diaria
# Uso: ./scripts/resona.sh [start|stop|restart|status|logs|update|db]
# =============================================================

PROJECT_DIR="$HOME/resonaweb"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log() { echo -e "${GREEN}[OK] $1${NC}"; }
info() { echo -e "${BLUE}[>>] $1${NC}"; }
warn() { echo -e "${YELLOW}[!!] $1${NC}"; }
error() { echo -e "${RED}[ERR] $1${NC}"; exit 1; }

CMD="${1:-status}"

case "$CMD" in

  start)
    info "Iniciando todos los servicios..."
    cd "$PROJECT_DIR"
    docker compose up -d postgres redis adminer
    pm2 start resona-backend 2>/dev/null || pm2 start "npm run dev" --name resona-backend --cwd "$PROJECT_DIR/packages/backend"
    pm2 start resona-frontend 2>/dev/null || pm2 start "npm run dev -- --host 0.0.0.0 --port 3000" --name resona-frontend --cwd "$PROJECT_DIR/packages/frontend"
    log "Servicios iniciados"
    ;;

  stop)
    info "Deteniendo todos los servicios..."
    pm2 stop resona-backend resona-frontend 2>/dev/null || true
    cd "$PROJECT_DIR" && docker compose stop postgres redis adminer
    log "Servicios detenidos"
    ;;

  restart)
    info "Reiniciando todos los servicios..."
    pm2 restart resona-backend resona-frontend 2>/dev/null || true
    log "Servicios reiniciados"
    ;;

  status)
    info "Estado de servicios:"
    echo ""
    echo "--- PM2 ---"
    pm2 status
    echo ""
    echo "--- Docker ---"
    cd "$PROJECT_DIR" && docker compose ps
    ;;

  logs)
    SERVICE="${2:-backend}"
    if [ "$SERVICE" = "backend" ]; then
        pm2 logs resona-backend --lines 50
    elif [ "$SERVICE" = "frontend" ]; then
        pm2 logs resona-frontend --lines 50
    elif [ "$SERVICE" = "db" ]; then
        docker logs resona-db --tail 50
    else
        warn "Uso: ./scripts/resona.sh logs [backend|frontend|db]"
    fi
    ;;

  update)
    info "Actualizando desde GitHub..."
    cd "$PROJECT_DIR"
    git pull origin main || error "No se pudo hacer git pull"
    
    info "Actualizando dependencias backend..."
    cd "$PROJECT_DIR/packages/backend"
    npm install
    npx prisma generate
    npx prisma migrate deploy
    
    info "Actualizando dependencias frontend..."
    cd "$PROJECT_DIR/packages/frontend"
    npm install
    
    info "Reiniciando servicios..."
    pm2 restart resona-backend resona-frontend
    log "Actualización completada"
    ;;

  db)
    SUBCMD="${2:-status}"
    case "$SUBCMD" in
      status)
        docker exec resona-db pg_isready -U resona_user -d resona_db && log "PostgreSQL OK" || error "PostgreSQL no disponible"
        ;;
      studio)
        info "Abriendo Prisma Studio en puerto 5555..."
        cd "$PROJECT_DIR/packages/backend"
        npx prisma studio
        ;;
      migrate)
        info "Ejecutando migraciones..."
        cd "$PROJECT_DIR/packages/backend"
        npx prisma migrate deploy && log "Migraciones aplicadas"
        ;;
      seed)
        info "Ejecutando seed de base de datos..."
        cd "$PROJECT_DIR/packages/backend"
        npm run db:seed && log "Seed completado"
        ;;
      backup)
        BACKUP_FILE="$HOME/backups/resona-$(date +%Y%m%d-%H%M%S).sql"
        mkdir -p "$HOME/backups"
        docker exec resona-db pg_dump -U resona_user resona_db > "$BACKUP_FILE"
        log "Backup guardado en: $BACKUP_FILE"
        ;;
      restore)
        FILE="${3}"
        [ -z "$FILE" ] && error "Uso: ./scripts/resona.sh db restore /ruta/al/backup.sql"
        docker exec -i resona-db psql -U resona_user -d resona_db < "$FILE" && log "Restore completado"
        ;;
      *)
        warn "Uso: ./scripts/resona.sh db [status|studio|migrate|seed|backup|restore <archivo>]"
        ;;
    esac
    ;;

  tunnel)
    HOST="${2}"
    [ -z "$HOST" ] && error "Uso: ./scripts/resona.sh tunnel usuario@ip-servidor"
    info "Creando túnel SSH a $HOST..."
    info "Accede en tu Mac: http://localhost:3000 (frontend) y http://localhost:3001 (backend)"
    info "Pulsa Ctrl+C para cerrar el túnel"
    ssh -L 3000:localhost:3000 -L 3001:localhost:3001 -L 8080:localhost:8080 -L 5555:localhost:5555 "$HOST" -N
    ;;

  *)
    echo ""
    echo "Uso: ./scripts/resona.sh <comando>"
    echo ""
    echo "Comandos disponibles:"
    echo "  start              Inicia todos los servicios"
    echo "  stop               Para todos los servicios"
    echo "  restart            Reinicia los servicios PM2"
    echo "  status             Muestra el estado de todos los servicios"
    echo "  logs [backend|frontend|db]  Muestra los logs"
    echo "  update             Actualiza desde GitHub y reinicia"
    echo "  db status          Verifica conexión a la base de datos"
    echo "  db studio          Abre Prisma Studio"
    echo "  db migrate         Aplica migraciones pendientes"
    echo "  db seed            Ejecuta el seed de datos iniciales"
    echo "  db backup          Crea un backup de la base de datos"
    echo "  db restore <file>  Restaura un backup"
    echo "  tunnel user@ip     Crea túnel SSH (ejecutar en tu Mac)"
    echo ""
    ;;

esac
