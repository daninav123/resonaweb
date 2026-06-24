# 🚀 GUÍA RÁPIDA - ReSona

## ✅ ESTADO ACTUAL

```
🟢 Backend:  FUNCIONANDO (Puerto 3001)
🟢 Frontend: FUNCIONANDO (Puerto 3000)
🟢 Base de Datos: POBLADA (5 productos, 3 categorías)
🟢 Tests E2E: 6/6 PASANDO (100%)
```

---

## 📋 INICIO RÁPIDO

### 1. Backend

```bash
# Terminal 1
cd packages/backend
npm run dev:quick
```

✅ **Backend corriendo en:** http://localhost:3001

### 2. Frontend

```bash
# Terminal 2 (nueva terminal)
cd packages/frontend
npm run dev
```

✅ **Frontend corriendo en:** http://localhost:3000

### 3. Verificar que todo funciona

```bash
# Terminal 3 (nueva terminal)
cd packages/backend
npm run test:e2e
```

✅ **Debería mostrar:** 6/6 tests pasando

---

## 🔑 CREDENCIALES

```
Email:    admin@resona.com
Password: Admin123!
```

---

## 📦 PRODUCTOS DISPONIBLES

El sistema ya tiene **5 productos** listos para usar:

1. **Cámara Sony A7 III** - 85€/día (Featured)
2. **Objetivo Canon 50mm** - 45€/día (Featured)
3. **Panel LED 1000W** - 35€/día
4. **Altavoz JBL PRX815W** - 60€/día (Featured)
5. **Micrófono Shure SM58** - 15€/día

---

## 🔍 VERIFICAR ENDPOINTS

### Health Check
```bash
curl http://localhost:3001/health
```

### Obtener Productos
```bash
curl http://localhost:3001/api/v1/products
```

### Obtener Categorías
```bash
curl http://localhost:3001/api/v1/products/categories
```

---

## 🛠️ COMANDOS ÚTILES

### Base de Datos

```bash
# Poblar base de datos (si está vacía)
cd packages/backend
node quick-seed.js

# Abrir Prisma Studio
npm run db:studio

# Generar cliente Prisma
npm run db:generate
```

### Tests

```bash
# Tests E2E rápidos
npm run test:e2e

# Todos los tests
npm test

# Tests con coverage
npm run test:coverage
```

### Desarrollo

```bash
# Limpiar y reinstalar
npm run clean
npm install

# Format código
npm run format

# Lint
npm run lint
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Productos no cargan en frontend

**Solución:**

1. Verificar backend está corriendo:
```bash
curl http://localhost:3001/api/v1/products
```

2. Si devuelve error, reiniciar backend:
```bash
cd packages/backend
npm run dev:quick
```

3. Refrescar frontend (F5)

### Base de datos vacía

**Solución:**

```bash
cd packages/backend
node quick-seed.js
```

### Error de compilación TypeScript

**Solución:**

```bash
cd packages/backend
npm run dev:quick  # Usa transpile-only
```

### Puerto 3001 ocupado

**Solución:**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Luego reiniciar
npm run dev:quick
```

---

## 📊 ESTRUCTURA DEL PROYECTO

```
windsurf-project-3/
├── packages/
│   ├── backend/           # API REST (Node + Express + Prisma)
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── tests/
│   │   ├── quick-seed.js  # Script de seed rápido
│   │   └── test-api.js    # Tests E2E rápidos
│   │
│   └── frontend/          # React + TypeScript + Vite
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── services/  # API clients
│       │   └── store/
│       └── package.json
│
├── TESTS_E2E_REPORT.md    # Reporte de tests
├── QUICK_START.md         # Esta guía
└── package.json           # Workspace root
```

---

## 🎯 ENDPOINTS PRINCIPALES

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/v1/products` | Lista todos los productos |
| `GET /api/v1/products/search` | Buscar productos |
| `GET /api/v1/products/featured` | Productos destacados |
| `GET /api/v1/products/categories` | Categorías |
| `GET /api/v1/products/:id` | Detalle de producto |
| `GET /health` | Health check |

---

## 📖 DOCUMENTACIÓN

- **Reporte de Tests:** [TESTS_E2E_REPORT.md](./TESTS_E2E_REPORT.md)
- **Proyecto Completo:** [PROYECTO_COMPLETADO_100.md](./PROYECTO_COMPLETADO_100.md)
- **API Swagger:** http://localhost:3001/api-docs (cuando backend esté corriendo)

---

## ✨ TODO LISTO

Si sigues esta guía, tendrás:

- ✅ Backend funcionando con 5 productos
- ✅ Frontend cargando productos
- ✅ Tests E2E validando todo
- ✅ Sistema completo operativo

**¡A desarrollar!** 🚀
