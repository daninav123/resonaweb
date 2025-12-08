#!/bin/bash

# 📦 Script de Backup Completo
# Respalda BD, imágenes y archivos estáticos

set -e

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="backup_complete_${TIMESTAMP}"

echo "🔄 Iniciando backup completo..."
echo "📁 Directorio: $BACKUP_DIR/$BACKUP_NAME"
echo ""

# 1. Crear directorio
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# 2. Backup de BD (JSON)
echo "📊 Respaldando base de datos..."
node scripts/backup-database.js "$BACKUP_DIR/$BACKUP_NAME/database.json"

# 3. Backup de imágenes
echo "🖼️ Respaldando imágenes..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/images"
cp -r packages/backend/uploads/* "$BACKUP_DIR/$BACKUP_NAME/images/" 2>/dev/null || true

# 4. Backup de archivos estáticos
echo "📄 Respaldando archivos estáticos..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/public"
cp -r public/* "$BACKUP_DIR/$BACKUP_NAME/public/" 2>/dev/null || true

# 5. Backup de configuración
echo "⚙️ Respaldando configuración..."
mkdir -p "$BACKUP_DIR/$BACKUP_NAME/config"
cp .env.production "$BACKUP_DIR/$BACKUP_NAME/config/" 2>/dev/null || true
cp packages/backend/.env "$BACKUP_DIR/$BACKUP_NAME/config/" 2>/dev/null || true

# 6. Crear manifest
echo "📋 Creando manifest..."
cat > "$BACKUP_DIR/$BACKUP_NAME/MANIFEST.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0",
  "contents": {
    "database": "database.json",
    "images": "images/",
    "public": "public/",
    "config": "config/"
  },
  "stats": {
    "database_size": "$(du -sh $BACKUP_DIR/$BACKUP_NAME/database.json 2>/dev/null | cut -f1 || echo 'N/A')",
    "images_size": "$(du -sh $BACKUP_DIR/$BACKUP_NAME/images 2>/dev/null | cut -f1 || echo 'N/A')",
    "public_size": "$(du -sh $BACKUP_DIR/$BACKUP_NAME/public 2>/dev/null | cut -f1 || echo 'N/A')"
  }
}
EOF

# 7. Crear comprimido
echo "🗜️ Comprimiendo backup..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"

# 8. Limpiar directorio sin comprimir
rm -rf "$BACKUP_DIR/$BACKUP_NAME"

echo ""
echo "✅ Backup completado exitosamente"
echo "📦 Archivo: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo ""
