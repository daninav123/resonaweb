# 🔌 TODOS LOS PUERTOS DEL PROYECTO RESONA

## 📊 RESUMEN

```
PORT  | SERVICIO          | NECESARIO PARA | COMANDO
------|-------------------|----------------|----------------------------------
3000  | Frontend          | App principal  | cd packages/frontend && npm run dev
3001  | Backend API       | App principal  | cd packages/backend && npm run dev:quick
5432  | PostgreSQL        | Base de datos  | docker-compose up -d postgres
6379  | Redis             | Cache/Queues   | docker-compose up -d redis
8080  | Adminer           | DB Admin UI    | docker-compose up -d adminer
5555  | Prisma Studio     | DB Visual      | cd packages/backend && npm run db:studio
```

---

## 🎯 PUERTOS PRINCIPALES (NECESARIOS)

### **3000 - Frontend (Vite + React)**
```bash
cd packages\frontend
npm run dev
```
- **URL:** http://localhost:3000
- **Descripción:** Aplicación web principal
- **Necesario para:** Tests E2E, desarrollo, uso de la app
- **Configurado en:** `packages/frontend/vite.config.ts`

### **3001 - Backend API (Express + Node)**
```bash
cd packages\backend
npm run dev:quick
```
- **URL:** http://localhost:3001/api/v1
- **Descripción:** API REST del backend
- **Necesario para:** Frontend, tests, toda la lógica de negocio
- **Configurado en:** `packages/backend/.env` (BACKEND_PORT)
- **Health check:** http://localhost:3001/api/v1/health

### **5432 - PostgreSQL Database**
```bash
docker-compose up -d postgres
```
- **Conexión:** `postgresql://resona_user:resona_password@localhost:5432/resona_db`
- **Descripción:** Base de datos principal
- **Necesario para:** Backend, almacenar todos los datos
- **Configurado en:** `docker-compose.yml`
- **Acceso:** Usa Adminer (puerto 8080) o Prisma Studio (puerto 5555)

---

## 🔧 PUERTOS AUXILIARES (OPCIONALES)

### **6379 - Redis**
```bash
docker-compose up -d redis
```
- **Descripción:** Cache y colas de trabajos
- **Necesario para:** Jobs en background, emails, caching
- **Configurado en:** `docker-compose.yml`
- **Uso:** Bull queues, session storage

### **8080 - Adminer (Database Admin UI)**
```bash
docker-compose up -d adminer
```
- **URL:** http://localhost:8080
- **Descripción:** Interfaz web para administrar PostgreSQL
- **Credenciales:**
  - Sistema: PostgreSQL
  - Servidor: postgres
  - Usuario: resona_user
  - Contraseña: resona_password
  - Base de datos: resona_db

### **5555 - Prisma Studio**
```bash
cd packages\backend
npm run db:studio
```
- **URL:** http://localhost:5555
- **Descripción:** Interfaz visual de Prisma para ver/editar la BD
- **Mejor que Adminer para:** Ver relaciones, editar datos rápidamente
- **Se inicia:** Manualmente cuando lo necesites

---

## 🚀 INICIAR SERVICIOS

### **Para Desarrollo Normal:**
```bash
# 1. Bases de datos (Docker)
docker-compose up -d

# 2. Aplicación (Backend + Frontend)
.\start-admin.bat

# Esto levanta:
✅ PostgreSQL (5432)
✅ Redis (6379)
✅ Adminer (8080)
✅ Backend (3001)
✅ Frontend (3000)
```

### **Para Testing E2E:**
```bash
# 1. Asegúrate que todo está corriendo
docker-compose up -d
.\start-admin.bat

# 2. Verifica los puertos principales
# Frontend: http://localhost:3000 ✅
# Backend:  http://localhost:3001/api/v1/health ✅

# 3. Ejecuta tests
.\TEST-QUICK.bat
```

### **Para Ver/Editar Base de Datos:**
```bash
# Opción A: Adminer (ya corriendo con Docker)
http://localhost:8080

# Opción B: Prisma Studio (más bonito)
cd packages\backend
npm run db:studio
# Abre: http://localhost:5555
```

---

## 🔍 VERIFICAR QUÉ ESTÁ CORRIENDO

### **Ver puertos ocupados:**
```bash
netstat -ano | findstr "3000 3001 5432 6379 8080 5555"
```

### **Ver contenedores Docker:**
```bash
docker ps
```

Deberías ver:
- resona-db (postgres:5432)
- resona-redis (redis:6379)
- resona-adminer (adminer:8080)

---

## 🐛 SOLUCIONAR PROBLEMAS

### **Puerto ocupado:**
```bash
# Ver qué proceso usa el puerto (ejemplo 3000)
netstat -ano | findstr :3000

# Matar proceso por PID
taskkill /PID <PID> /F

# O matar todos los node
taskkill /F /IM node.exe
```

### **Docker no inicia:**
```bash
# Reiniciar servicios
docker-compose down
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### **Puerto 5555 ocupado (Prisma Studio):**
```bash
# Prisma Studio usa puerto 5555 por defecto
# Si está ocupado, cierra la instancia anterior
# O especifica otro puerto:
npx prisma studio --port 5556
```

---

## 📝 CONFIGURACIÓN DE TESTS

Los tests E2E usan:
- **Frontend en 3000** (configurado en `playwright.config.simple.ts`)
- **Backend en 3001** (proxy desde frontend)
- **Base de datos en 5432** (necesaria para datos de test)

```typescript
// playwright.config.simple.ts
use: {
  baseURL: 'http://localhost:3000', // ✅
}
```

---

## 🎯 PUERTOS POR SERVICIO

### **App Principal:**
```
3000 (Frontend) + 3001 (Backend) + 5432 (PostgreSQL)
= MÍNIMO NECESARIO
```

### **Con Docker completo:**
```
3000 + 3001 + 5432 + 6379 + 8080
= DESARROLLO COMPLETO
```

### **Con Prisma Studio:**
```
Todo lo anterior + 5555
= DESARROLLO + DB VISUAL
```

---

## ✅ CHECKLIST ANTES DE TESTS

```
[ ] Puerto 3000 - Frontend corriendo
[ ] Puerto 3001 - Backend corriendo  
[ ] Puerto 5432 - PostgreSQL (Docker)
[ ] http://localhost:3000 carga en navegador
[ ] http://localhost:3001/api/v1/health responde

OPCIONAL:
[ ] Puerto 6379 - Redis (para jobs)
[ ] Puerto 8080 - Adminer (para ver DB)
[ ] Puerto 5555 - Prisma Studio (para editar DB)
```

---

## 🔐 CREDENCIALES

### **PostgreSQL:**
```
Host:     localhost
Puerto:   5432
Usuario:  resona_user
Password: resona_password
DB:       resona_db
```

### **Admin de la App:**
```
URL:      http://localhost:3000/login
Email:    admin@resona.com
Password: Admin123!
```

### **Adminer:**
```
URL:      http://localhost:8080
Sistema:  PostgreSQL
Servidor: postgres
Usuario:  resona_user
Password: resona_password
```

---

**¡Ahora sabes todos los puertos del proyecto!** 🎯

**Para ejecutar tests:**
1. `docker-compose up -d`
2. `.\start-admin.bat`
3. `.\TEST-QUICK.bat`
