#!/bin/bash

###############################################################################
# SCRIPT DE BACKUP AUTOMÁTICO DE BASE DE DATOS
# Proyecto: ReSona - Alquiler Material Eventos
# 
# Funcionalidades:
# - Backup completo de PostgreSQL
# - Compresión automática
# - Rotación de backups (mantiene últimos 30 días)
# - Notificaciones de error
# - Logs de operaciones
###############################################################################

set -e  # Exit on error

# ============================================
# CONFIGURACIÓN
# ============================================

# Cargar variables de entorno
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Cargar .env si existe
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Configuración de backup
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups/database}"
LOG_DIR="${LOG_DIR:-$PROJECT_ROOT/logs/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Base de datos (extraer de DATABASE_URL)
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL no está configurada"
  exit 1
fi

# Extraer componentes de DATABASE_URL
# Formato: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Nombre del archivo de backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="resona_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Crear directorios si no existen
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Archivo de log
LOG_FILE="$LOG_DIR/backup_$(date +"%Y%m%d").log"

# ============================================
# FUNCIONES
# ============================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
  log "❌ ERROR: $1"
  send_error_notification "$1"
  exit 1
}

success() {
  log "✅ SUCCESS: $1"
}

send_error_notification() {
  local message="$1"
  
  # Email de notificación (si está configurado)
  if [ -n "$BACKUP_ERROR_EMAIL" ]; then
    echo "Backup Error: $message" | mail -s "❌ Backup Failed - ReSona" "$BACKUP_ERROR_EMAIL" 2>/dev/null || true
  fi
  
  # Slack notification (si está configurado)
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"❌ Backup Failed: $message\"}" 2>/dev/null || true
  fi
}

send_success_notification() {
  local size="$1"
  
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST "$SLACK_WEBHOOK_URL" \
      -H 'Content-Type: application/json' \
      -d "{\"text\":\"✅ Backup Successful: $BACKUP_FILE_GZ ($size)\"}" 2>/dev/null || true
  fi
}

# ============================================
# BACKUP PRINCIPAL
# ============================================

log "========================================="
log "🔄 Iniciando backup de base de datos"
log "========================================="
log "Base de datos: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "Directorio: $BACKUP_DIR"

# Verificar que pg_dump está disponible
if ! command -v pg_dump &> /dev/null; then
  error "pg_dump no está instalado. Instala PostgreSQL client tools."
fi

# Realizar backup
log "📦 Creando backup..."
export PGPASSWORD="$DB_PASS"

if pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-acl \
  --verbose \
  > "$BACKUP_DIR/$BACKUP_FILE" 2>> "$LOG_FILE"; then
  success "Backup SQL creado: $BACKUP_FILE"
else
  error "Falló pg_dump"
fi

unset PGPASSWORD

# Verificar que el archivo no está vacío
if [ ! -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
  rm -f "$BACKUP_DIR/$BACKUP_FILE"
  error "Archivo de backup está vacío"
fi

# Comprimir backup
log "🗜️  Comprimiendo backup..."
if gzip -9 "$BACKUP_DIR/$BACKUP_FILE"; then
  success "Backup comprimido: $BACKUP_FILE_GZ"
else
  error "Falló compresión"
fi

# Verificar backup comprimido
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE_GZ" ]; then
  error "Archivo comprimido no existe"
fi

# Tamaño del backup
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE_GZ" | cut -f1)
log "📊 Tamaño del backup: $BACKUP_SIZE"

# ============================================
# ROTACIÓN DE BACKUPS
# ============================================

log "🔄 Rotando backups antiguos (>$RETENTION_DAYS días)..."

# Eliminar backups más antiguos que RETENTION_DAYS
find "$BACKUP_DIR" -name "resona_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# Contar backups restantes
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "resona_backup_*.sql.gz" -type f | wc -l)
log "📁 Backups almacenados: $BACKUP_COUNT"

# ============================================
# VERIFICACIÓN DE INTEGRIDAD
# ============================================

log "🔍 Verificando integridad del backup..."

# Verificar que el archivo gzip es válido
if gzip -t "$BACKUP_DIR/$BACKUP_FILE_GZ" 2>/dev/null; then
  success "Integridad del backup verificada"
else
  error "Backup corrupto - falló verificación gzip"
fi

# ============================================
# FINALIZACIÓN
# ============================================

log "========================================="
log "✅ Backup completado exitosamente"
log "========================================="
log "Archivo: $BACKUP_FILE_GZ"
log "Tamaño: $BACKUP_SIZE"
log "Ubicación: $BACKUP_DIR"
log "========================================="

# Enviar notificación de éxito
send_success_notification "$BACKUP_SIZE"

# Opcional: Subir a S3/Cloud Storage
if [ -n "$AWS_S3_BACKUP_BUCKET" ]; then
  log "☁️  Subiendo a S3..."
  if command -v aws &> /dev/null; then
    aws s3 cp "$BACKUP_DIR/$BACKUP_FILE_GZ" "s3://$AWS_S3_BACKUP_BUCKET/resona/database/" --storage-class STANDARD_IA
    success "Backup subido a S3"
  fi
fi

exit 0
