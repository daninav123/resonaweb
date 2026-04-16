#!/bin/bash

# ===========================================
# Script para activar/desactivar DB de producción en local
# ===========================================

set -e

BACKEND_ENV="/Users/dani/resonaweb/packages/backend/.env"
LOCAL_ENV="/Users/dani/resonaweb/packages/backend/.env.local"
PROD_ENV="/Users/dani/resonaweb/.env.local.production"

function use_production() {
    echo "⚠️  ATENCIÓN: Vas a conectar a la BASE DE DATOS REAL DE PRODUCCIÓN"
    echo "    Cualquier cambio que hagas modificará datos reales."
    echo ""
    read -p "¿Estás seguro? Escribe 'SI' para continuar: " confirm
    
    if [[ $confirm != "SI" ]]; then
        echo "❌ Cancelado"
        exit 1
    fi
    
    # Guardar configuración local actual
    if [[ -f "$BACKEND_ENV" ]]; then
        cp "$BACKEND_ENV" "$LOCAL_ENV"
        echo "💾 Configuración local guardada en .env.local"
    fi
    
    # Copiar configuración de producción
    cp "$PROD_ENV" "$BACKEND_ENV"
    echo "✅ Configuración de producción activada"
    echo ""
    echo "🚀 Para ver los datos reales, ejecuta:"
    echo "   npm run dev --workspace=backend"
    echo ""
    echo "🔗 Conectando a: Render PostgreSQL (resona_db_3x9i)"
}

function use_local() {
    if [[ -f "$LOCAL_ENV" ]]; then
        cp "$LOCAL_ENV" "$BACKEND_ENV"
        echo "✅ Configuración local restaurada"
        echo "🔗 Conectando a: PostgreSQL local (localhost:5432)"
    else
        echo "❌ No hay configuración local guardada"
        echo "   Usa el archivo .env.example como base"
    fi
}

function show_status() {
    CURRENT_URL=$(grep "DATABASE_URL" "$BACKEND_ENV" | head -1)
    if [[ "$CURRENT_URL" == *"render.com"* ]]; then
        echo "🟢 Estado: CONECTADO A PRODUCCIÓN"
        echo "   Base de datos: Render (resona_db_3x9i)"
        echo "   ⚠️  CUIDADO: Los cambios afectan datos reales"
    else
        echo "🔵 Estado: CONECTADO A LOCAL"
        echo "   Base de datos: PostgreSQL local (localhost:5432)"
    fi
}

# Menú
case "${1:-status}" in
    production|prod|p)
        use_production
        ;;
    local|l)
        use_local
        ;;
    status|s)
        show_status
        ;;
    *)
        echo "Uso: $0 [production|local|status]"
        echo ""
        echo "Comandos:"
        echo "  production  - Conectar a DB de producción (¡cuidado!)"
        echo "  local       - Volver a DB local"
        echo "  status      - Ver estado actual"
        echo ""
        show_status
        ;;
esac
