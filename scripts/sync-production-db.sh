#!/bin/bash

# ===========================================
# Script para sincronizar DB de producción a local
# ===========================================

set -e

echo "🔄 Sincronizando base de datos de producción..."

# URL de producción (Render - External)
PROD_DB_URL="postgresql://resona_db_3x9i_user:GNoTchPmhPv9tpa5Hf0ieH5eU4QMxd6E@dpg-d4j710vgi27c739g6fkg-a.frankfurt-postgres.render.com/resona_db_3x9i?sslmode=require"

# URL local
LOCAL_DB_URL="postgresql://resona_user:resona_password@localhost:5432/resona_db"

BACKUP_FILE="backup_prod_$(date +%Y%m%d_%H%M%S).sql"

echo "📥 Exportando base de datos de producción..."
pg_dump "$PROD_DB_URL" > "$BACKUP_FILE"

echo "💾 Backup guardado: $BACKUP_FILE"

echo "🗑️  Limpiando base de datos local..."
# Limpiar la base de datos local (manteniendo el esquema)
psql "$LOCAL_DB_URL" -c "DO \$\$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'DROP TABLE IF EXISTS ' || r.tablename || ' CASCADE'; END LOOP; END \$\$;" 2>/dev/null || true

echo "📤 Importando datos a base de datos local..."
psql "$LOCAL_DB_URL" < "$BACKUP_FILE"

echo "✅ Sincronización completada!"
echo "🗂️  Backup guardado en: ./$BACKUP_FILE"

# Opcional: Eliminar backup después de importar
read -p "¿Eliminar archivo de backup? (y/n): " delete_backup
if [[ $delete_backup == "y" ]]; then
    rm "$BACKUP_FILE"
    echo "🗑️  Backup eliminado"
fi
