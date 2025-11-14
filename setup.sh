#!/bin/bash

# ReSona Project Setup Script

echo "🎵 ReSona - Sistema de Gestión de Alquiler"
echo "========================================="
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d '.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18 o superior es requerido"
  exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Instalando dependencias..."
npm install

# Copy environment files
echo "📋 Configurando variables de entorno..."
if [ ! -f packages/backend/.env ]; then
  cp packages/backend/.env.example packages/backend/.env
  echo "✅ Backend .env creado - Por favor editar con tus valores"
else
  echo "⚠️  Backend .env ya existe"
fi

if [ ! -f packages/frontend/.env ]; then
  echo "VITE_API_URL=http://localhost:3001/api/v1" > packages/frontend/.env
  echo "✅ Frontend .env creado"
else
  echo "⚠️  Frontend .env ya existe"
fi

# Start Docker services
echo ""
echo "🐳 Iniciando servicios Docker..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Setup database
echo ""
echo "🗄️  Configurando base de datos..."
npm run db:generate
npm run db:migrate:dev

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "Para iniciar el desarrollo, ejecuta:"
echo "  npm run dev"
echo ""
echo "Accesos:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Adminer:  http://localhost:8080"
echo ""
echo "Para ver los logs de Docker:"
echo "  docker-compose logs -f"
echo ""
