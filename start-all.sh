#!/bin/bash
echo "🚀 Iniciando Sistema Completo..."

# Backend
echo "▶️  Iniciando Backend..."
cd packages/backend
npm run dev:quick &
BACKEND_PID=$!

# Esperar que el backend esté listo
sleep 5

# Frontend
echo "▶️  Iniciando Frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Sistema iniciado"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait
