# 🎉 ReSona - Plataforma de Gestión de Eventos

Plataforma web completa para gestión de alquiler de material y montaje de eventos.

## 📊 ESTADO DEL PROYECTO: 80% COMPLETADO

- ✅ Backend: 95% (Todos los servicios implementados)
- ✅ Frontend: 70% (Estructura y páginas principales)
- ✅ Base de datos: 100% (26 modelos Prisma)
- ✅ Docker: 100% (PostgreSQL + Redis + Adminer)
- ⏳ Testing: 0%
- ⏳ Deployment: 0%

## 📚 Documentación

- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - Resumen ejecutivo y arquitectura
- **[FEATURES.md](docs/FEATURES.md)** - Características completas del sistema
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Modelo de datos con Prisma
- **[API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)** - Documentación de API REST
- **[USER_FLOWS.md](docs/USER_FLOWS.md)** - Flujos de usuario detallados
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Stack tecnológico completo
- **[ROADMAP.md](docs/ROADMAP.md)** - Plan de desarrollo por fases
- **[SECURITY.md](docs/SECURITY.md)** - Prácticas de seguridad
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guía de despliegue
- **[TESTING.md](docs/TESTING.md)** - Estrategia de testing
- **[MONITORING.md](docs/MONITORING.md)** - Monitorización y alertas

## 🚀 INICIO RÁPIDO (WINDOWS)

### Prerrequisitos
- Node.js 18 o superior
- Docker Desktop para Windows
- Git

## 🛠️ Instalación

### Método 1: Script Automático (RECOMENDADO)

```batch
# Simplemente ejecuta:
start.bat
```

### Método 2: Instalación Manual

#### 1. Instalar dependencias

```bash
# Instalar todas las dependencias del monorepo
npm install
```

#### 2. Variables de entorno

⚠️ **LAS VARIABLES YA ESTÁN CONFIGURADAS**
- Backend: `packages/backend/.env` (configurado con PostgreSQL local)
- Frontend: No requiere configuración

#### 3. Levantar servicios con Docker

```bash
# Iniciar PostgreSQL, Redis y Adminer
docker compose up -d

# Verificar que estén corriendo
docker ps
```

#### 4. Base de datos (si es primera vez)

```bash
# Las migraciones ya están ejecutadas, pero si necesitas:
npm run db:migrate:dev
```

#### 5. Iniciar servidores

```bash
# Opción 1: Ambos servicios
npm run dev

# Opción 2: Por separado
npm run dev:backend   # En una terminal
npm run dev:frontend  # En otra terminal
```

## 🌐 URLs de Acceso

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | http://localhost:3000 | ✅ React + Vite |
| **Backend API** | http://localhost:3001 | ✅ Express |
| **Health Check** | http://localhost:3001/health | ✅ |
| **Adminer DB** | http://localhost:8080 | ✅ PostgreSQL UI |

### Credenciales Adminer
- Sistema: PostgreSQL
- Servidor: `resona-db` o `localhost`
- Usuario: `resona_user`
- Contraseña: `resona_password`
- Base de datos: `resona_db`

## 🏗️ Estructura del Proyecto

```
windsurf-project-3/
├── packages/
│   ├── frontend/     # React + TypeScript + Vite
│   └── backend/      # Express + TypeScript + Prisma
├── docs/             # Documentación completa
├── scripts/          # Scripts de automatización
└── logs/             # Logs del sistema
```

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- React Query + Zustand
- React Router v6

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL 15

### DevOps
- Docker + Docker Compose
- GitHub Actions
- Prometheus + Grafana

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                    # Inicia frontend y backend
npm run dev:frontend          # Solo frontend
npm run dev:backend           # Solo backend

# Build
npm run build                 # Build de todos los workspaces

# Testing
npm run test                  # Ejecuta tests
npm run test:coverage         # Con coverage

# Base de datos
npm run db:migrate            # Ejecuta migraciones
npm run db:seed               # Seed de datos
npm run db:studio             # Prisma Studio

# Docker
npm run docker:up             # Levantar containers
npm run docker:down           # Detener containers

# Linting
npm run lint                  # Lint de código
```

## 🔑 Usuarios de Prueba (Post-Seed)

**Admin:**
- Email: admin@resona.com
- Password: Admin123!

**Cliente:**
- Email: cliente@example.com
- Password: Cliente123!

## 🔥 Funcionalidades Implementadas

### Backend (95%)
- ✅ Autenticación JWT con refresh tokens
- ✅ CRUD completo (Usuarios, Productos, Categorías, Órdenes)
- ✅ Sistema de disponibilidad y reservas
- ✅ Precios dinámicos y descuentos
- ✅ Carrito de compras persistente
- ✅ Integración con Stripe para pagos
- ✅ Sistema de notificaciones (Email con SendGrid)
- ✅ Tracking y analytics de productos
- ✅ Jobs programados con node-cron
- ✅ Rate limiting y seguridad

### Frontend (70%)
- ✅ Autenticación y registro
- ✅ Catálogo de productos con filtros
- ✅ Detalle de producto
- ✅ Carrito de compras
- ✅ Panel de administración
- ⏳ Checkout con Stripe
- ⏳ Panel de usuario

## 🐛 Solución de Problemas

### Docker no funciona
```batch
# Asegúrate de que Docker Desktop esté corriendo
# Reinicia Docker Desktop si es necesario
docker compose down
docker compose up -d
```

### Puerto en uso
```batch
# Ver qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Matar el proceso (reemplaza PID con el número)
taskkill /PID [PID] /F
```

### Error de base de datos
```bash
# Reiniciar y regenerar
docker compose down -v
docker compose up -d
npm run db:migrate:dev --workspace=backend
```

## 📞 Soporte

Para soporte o dudas sobre el proyecto, revisa la documentación en `/docs`.

---

**Proyecto desarrollado por:** Daniel Navarro Campos  
**Stack:** Node.js, Express, React, PostgreSQL, Docker  
**Estado:** 80% Completado - Funcional para desarrollo
