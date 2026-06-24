# 🚀 Instrucciones de Setup - ReSona

## Estado Actual

✅ **Completado:**
- Dependencias instaladas (1,077 paquetes)
- Archivos `.env` configurados
- Cliente Prisma generado
- Estructura del código lista

⚠️ **Pendiente:**
- Docker (PostgreSQL + Redis)
- Migración de base de datos
- Inicio del servidor

---

## Opción 1: Setup con Docker (RECOMENDADO)

### 1. Instalar Docker Desktop

1. Descargar: https://www.docker.com/products/docker-desktop
2. Instalar y reiniciar el PC
3. Abrir Docker Desktop y esperar a que inicie

### 2. Levantar Servicios

```powershell
# En la raíz del proyecto
docker compose up -d

# Verificar que estén corriendo
docker compose ps
```

### 3. Configurar Base de Datos

```powershell
# Ejecutar migraciones
npm run db:migrate:dev

# (Opcional) Sembrar datos de prueba
npm run db:seed
```

### 4. Iniciar Desarrollo

```powershell
# Opción A: Backend y Frontend juntos
npm run dev

# Opción B: Solo backend
npm run dev:backend

# Opción C: Solo frontend  
npm run dev:frontend
```

### 5. Acceder a la Aplicación

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health
- Adminer (DB): http://localhost:8080
- Prisma Studio: `npm run db:studio`

---

## Opción 2: Sin Docker (PostgreSQL nativo)

### 1. Instalar PostgreSQL

1. Descargar PostgreSQL 15: https://www.postgresql.org/download/windows/
2. Durante instalación, establecer contraseña para usuario `postgres`
3. Instalar también pgAdmin (incluido en el instalador)

### 2. Crear Base de Datos

```sql
-- En pgAdmin o psql
CREATE DATABASE resona_db;
CREATE USER resona_user WITH PASSWORD 'resona_password';
GRANT ALL PRIVILEGES ON DATABASE resona_db TO resona_user;
```

### 3. Instalar Redis

**Opción A - Memurai (Redis para Windows):**
1. Descargar: https://www.memurai.com/get-memurai
2. Instalar y ejecutar

**Opción B - Redis con WSL:**
```bash
wsl --install
wsl
sudo apt update
sudo apt install redis-server
redis-server
```

### 4. Actualizar .env

Editar `packages/backend/.env`:
```env
DATABASE_URL="postgresql://resona_user:resona_password@localhost:5432/resona_db"
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5. Ejecutar Migraciones

```powershell
npm run db:migrate:dev
```

### 6. Iniciar Desarrollo

```powershell
npm run dev
```

---

## Opción 3: Base de Datos Cloud (Sin instalación local)

### 1. Crear Base de Datos en Supabase

1. Ir a https://supabase.com
2. Crear cuenta y nuevo proyecto
3. Copiar la Connection String de PostgreSQL

### 2. Actualizar .env

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 3. Redis Cloud

1. Ir a https://redis.com/try-free/
2. Crear cuenta y database gratuita
3. Copiar host y puerto

```env
REDIS_HOST=redis-12345.c123.us-east-1-1.ec2.redns.redis-cloud.com
REDIS_PORT=12345
REDIS_PASSWORD=your-password
```

### 4. Ejecutar Migraciones

```powershell
npm run db:migrate:dev
npm run dev
```

---

## Scripts Disponibles

```powershell
# Desarrollo
npm run dev                 # Backend + Frontend
npm run dev:backend         # Solo backend
npm run dev:frontend        # Solo frontend

# Base de Datos
npm run db:generate         # Generar cliente Prisma
npm run db:migrate:dev      # Ejecutar migraciones
npm run db:push             # Push schema sin migración
npm run db:studio           # Abrir Prisma Studio
npm run db:seed             # Datos de prueba

# Build
npm run build               # Build todo
npm run build:backend       # Build backend
npm run build:frontend      # Build frontend

# Testing
npm run test                # Ejecutar tests
npm run lint                # Linting
npm run lint:fix            # Fix linting

# Docker
docker compose up -d        # Iniciar servicios
docker compose down         # Detener servicios
docker compose logs -f      # Ver logs
```

---

## Solución de Problemas

### Error: "docker: command not found"
- Docker no está instalado
- Usar Opción 2 o 3 sin Docker

### Error: "Cannot connect to database"
- Verificar que PostgreSQL está corriendo
- Verificar credenciales en `.env`
- Verificar que el puerto 5432 está disponible

### Error: "Port 3000 already in use"
- Cerrar otras aplicaciones en ese puerto
- Cambiar puerto en `.env`:
  ```env
  FRONTEND_PORT=3001
  ```

### Error: "Module not found"
- Ejecutar: `npm install`
- Limpiar cache: `npm run clean && npm install`

### Errores de TypeScript
- Regenerar Prisma: `npm run db:generate`
- Reconstruir: `npm run build`

---

## Credenciales por Defecto

### PostgreSQL (Docker)
- Host: localhost
- Puerto: 5432
- Usuario: resona_user
- Password: resona_password
- Database: resona_db

### Redis (Docker)
- Host: localhost
- Puerto: 6379

### Adminer (Docker)
- URL: http://localhost:8080
- Sistema: PostgreSQL
- Servidor: postgres
- Usuario: resona_user
- Contraseña: resona_password

---

## Próximos Pasos Después del Setup

1. ✅ Verificar que el servidor backend inicia: http://localhost:3001/health
2. ✅ Verificar que el frontend carga: http://localhost:3000
3. ✅ Probar registro de usuario: POST /api/v1/auth/register
4. ✅ Probar login: POST /api/v1/auth/login
5. 🔄 Continuar con implementación de productos (Fase 2)

---

## Soporte

Si tienes problemas:
1. Revisa los logs del backend
2. Revisa la consola del navegador
3. Verifica que todas las dependencias estén instaladas
4. Asegúrate de que PostgreSQL y Redis están corriendo

---

**Estado del Proyecto: 8.5% Completo (Fase 1/11)**
**Siguiente Fase: Productos y Categorías**
