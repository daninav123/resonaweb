# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN

_Paso a paso para subir Resona360 a Internet_

---

## 📋 **CHECKLIST PRE-DEPLOYMENT**

Antes de empezar, verifica:

```
□ Código funciona en local sin errores
□ Todas las funcionalidades están testeadas
□ No hay console.logs innecesarios
□ Variables de entorno configuradas
□ Base de datos con datos de prueba
□ Stock de productos actualizado
```

---

## 🏗️ **ARQUITECTURA RECOMENDADA**

```
┌─────────────────────────────────────────┐
│         USUARIO (navegador)             │
└──────────────┬──────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│   FRONTEND (Vercel/Netlify)             │
│   React + Vite                           │
│   https://tudominio.com                  │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│   BACKEND (Railway/Render)               │
│   Node.js + Express                      │
│   https://api.tudominio.com              │
└──────────────┬───────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────┐
│   BASE DE DATOS (PostgreSQL)             │
│   Railway/Neon/Supabase                  │
└──────────────────────────────────────────┘
```

---

## 🎯 **OPCIÓN RECOMENDADA: TODO EN RAILWAY**

Railway es la opción más simple porque todo está en un solo lugar.

### **Ventajas:**
- ✅ Frontend, Backend y BD en un mismo sitio
- ✅ Fácil de configurar
- ✅ $5/mes para empezar
- ✅ Escala automáticamente
- ✅ Deploy automático desde GitHub

---

## 📝 **PASO 1: PREPARAR EL CÓDIGO**

### **1.1 Limpiar Logs de Debugging**

Buscar y eliminar/comentar console.logs innecesarios:

```bash
# En packages/frontend/src
# Buscar: console.log
# Mantener solo los críticos (errores)
```

### **1.2 Verificar Variables de Entorno**

**Backend (.env):**
```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/resona_prod

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_y_largo_aqui

# Stripe (producción)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (si usas)
OPENAI_API_KEY=sk-...

# Entorno
NODE_ENV=production
PORT=3001

# CORS
FRONTEND_URL=https://tudominio.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.tudominio.com/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### **1.3 Actualizar package.json**

**Backend:**
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "nodemon src/server.ts",
    "migrate:deploy": "prisma migrate deploy",
    "postinstall": "prisma generate"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Frontend:**
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🗄️ **PASO 2: PREPARAR LA BASE DE DATOS**

### **Opción A: Railway PostgreSQL**

1. **Crear cuenta en Railway.app**
2. **New Project → Deploy PostgreSQL**
3. **Copiar DATABASE_URL** (estará en variables)
4. **Conectar desde local:**

```bash
cd packages/backend

# Actualizar DATABASE_URL en .env con la de Railway
DATABASE_URL=postgresql://postgres:...@...railway.app:5432/railway

# Ejecutar migraciones
npx prisma migrate deploy

# Verificar conexión
npx prisma studio
```

### **Opción B: Neon (PostgreSQL Serverless)**

1. **Crear cuenta en neon.tech** (gratis)
2. **Create Project**
3. **Copiar connection string**
4. **Aplicar migraciones igual que arriba**

### **2.1 Seed de Datos Iniciales**

Crear datos de prueba para producción:

```bash
cd packages/backend

# Crear seed script si no existe
npx prisma db seed
```

**prisma/seed.ts:**
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Usuario admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@resona360.com' },
    update: {},
    create: {
      email: 'admin@resona360.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // Productos de ejemplo...
  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🚢 **PASO 3: DEPLOY DEL BACKEND**

### **3.1 Preparar Repositorio GitHub**

```bash
# En la raíz del proyecto
git init
git add .
git commit -m "Preparado para producción"

# Crear repo en GitHub y subir
git remote add origin https://github.com/tuusuario/resona360.git
git push -u origin main
```

### **3.2 Deploy en Railway**

1. **Railway.app → New Project**
2. **Deploy from GitHub repo**
3. **Seleccionar tu repositorio**
4. **Configurar:**

```
Root Directory: packages/backend
Build Command: npm run build
Start Command: npm start
```

5. **Añadir Variables de Entorno:**

```
DATABASE_URL → (copiar de tu BD PostgreSQL)
JWT_SECRET → tu_secret_seguro
STRIPE_SECRET_KEY → sk_live_...
NODE_ENV → production
FRONTEND_URL → https://tudominio.com
```

6. **Generate Domain** → Copiar URL (ej: `backend-production-abc123.up.railway.app`)

### **3.3 Verificar Deployment**

```bash
# Probar API
curl https://backend-production-abc123.up.railway.app/api/v1/health

# Debería responder:
# {"status":"ok","timestamp":"..."}
```

---

## 🎨 **PASO 4: DEPLOY DEL FRONTEND**

### **4.1 Configurar Variables de Entorno**

**packages/frontend/.env.production:**
```env
VITE_API_URL=https://backend-production-abc123.up.railway.app/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### **4.2 Opción A: Deploy en Vercel**

1. **Vercel.com → New Project**
2. **Import Git Repository**
3. **Configurar:**

```
Framework Preset: Vite
Root Directory: packages/frontend
Build Command: npm run build
Output Directory: dist
```

4. **Environment Variables:**
   - Añadir las del .env.production

5. **Deploy** → Esperar 2-3 minutos

6. **Dominio:** `resona360.vercel.app`

### **4.3 Opción B: Deploy en Netlify**

1. **Netlify.com → Add new site**
2. **Import from Git**
3. **Build settings:**

```
Base directory: packages/frontend
Build command: npm run build
Publish directory: packages/frontend/dist
```

4. **Environment variables:** Añadir las mismas

5. **Deploy**

---

## 🔧 **PASO 5: CONFIGURAR CORS EN BACKEND**

**packages/backend/src/server.ts:**

```typescript
import cors from 'cors';

const allowedOrigins = [
  'https://resona360.vercel.app',
  'https://tudominio.com',
  'http://localhost:5173', // Para desarrollo
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

**Commit y push para que Railway redeploy automáticamente.**

---

## 🌐 **PASO 6: CONFIGURAR DOMINIO PROPIO** (Opcional)

### **6.1 Comprar Dominio**

Opciones:
- **Namecheap.com** (~$10/año)
- **GoDaddy.com**
- **Google Domains**

### **6.2 Configurar DNS**

En tu proveedor de dominio:

```
A     @      76.76.21.21          (IP de Vercel)
CNAME www    resona360.vercel.app
CNAME api    backend-production-abc123.up.railway.app
```

### **6.3 Añadir Dominio en Vercel/Railway**

**Vercel:**
1. Settings → Domains
2. Add: `tudominio.com` y `www.tudominio.com`

**Railway:**
1. Settings → Domains
2. Custom Domain: `api.tudominio.com`

---

## 💳 **PASO 7: CONFIGURAR STRIPE PRODUCCIÓN**

1. **Stripe Dashboard → Developers**
2. **Cambiar a modo Live** (toggle arriba a la derecha)
3. **API Keys → Reveal live key**
4. **Copiar:**
   - `pk_live_...` → Frontend env
   - `sk_live_...` → Backend env

5. **Webhooks:**
   - URL: `https://api.tudominio.com/api/v1/stripe/webhook`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copiar Signing Secret → Backend env

6. **Actualizar variables en Vercel y Railway**

---

## 📧 **PASO 8: CONFIGURAR EMAIL** (Opcional)

### **Para envío de facturas y notificaciones:**

**Opción A: SendGrid**
```env
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@resona360.com
```

**Opción B: Resend**
```env
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@resona360.com
```

**Backend code:**
```typescript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Resona360 <noreply@resona360.com>',
  to: customer.email,
  subject: 'Confirmación de pedido',
  html: '<h1>Gracias por tu pedido</h1>',
});
```

---

## ✅ **PASO 9: VERIFICACIONES FINALES**

### **Checklist de Testing:**

```bash
# 1. Frontend carga correctamente
□ Abrir https://tudominio.com
□ Sin errores en consola
□ Imágenes cargan
□ Navegación funciona

# 2. Autenticación
□ Login funciona
□ Registro funciona
□ JWT se guarda correctamente

# 3. Productos
□ Lista de productos carga
□ Detalle de producto funciona
□ Filtros y búsqueda funcionan

# 4. Carrito y Checkout
□ Añadir al carrito
□ Modificar cantidades
□ Checkout con Stripe
□ Pago de prueba funciona

# 5. Admin
□ Login admin funciona
□ Dashboard carga
□ CRUD de productos
□ Gestión de pedidos
□ Calculadora funciona

# 6. Performance
□ Lighthouse score > 90
□ First Contentful Paint < 1.8s
□ Time to Interactive < 3.9s
```

---

## 🔒 **PASO 10: SEGURIDAD**

### **10.1 Variables Sensibles**

```bash
# NUNCA commitear:
.env
.env.production
.env.local

# Añadir a .gitignore:
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore
```

### **10.2 Rate Limiting**

**Backend:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máx 100 requests por IP
});

app.use('/api/', limiter);
```

### **10.3 Helmet (Headers de Seguridad)**

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## 📊 **PASO 11: MONITOREO**

### **11.1 Railway Logs**

```
Railway Dashboard → tu servicio → Observability
```

### **11.2 Sentry (Errores)**

```bash
npm install @sentry/node @sentry/react

# En backend
Sentry.init({
  dsn: "https://...@sentry.io/...",
  environment: "production",
});

# En frontend
Sentry.init({
  dsn: "https://...@sentry.io/...",
  integrations: [new BrowserTracing()],
});
```

### **11.3 Google Analytics**

```html
<!-- En index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

---

## 💰 **COSTOS ESTIMADOS**

```
Railway (Backend + BD)    → $5-20/mes
Vercel (Frontend)         → $0 (Free tier)
Dominio                   → $10/año
Stripe                    → 2.9% + $0.30 por transacción
SendGrid/Resend          → $0-15/mes (según volumen)

TOTAL: ~$15-35/mes + comisiones Stripe
```

---

## 🚨 **PROBLEMAS COMUNES**

### **Error: CORS**
```
Solución: Verificar FRONTEND_URL en backend env
Verificar allowedOrigins incluye tu dominio
```

### **Error: Database connection**
```
Solución: Verificar DATABASE_URL está correctamente copiada
Verificar que migraciones se ejecutaron
```

### **Error: 404 en rutas**
```
Solución: Configurar rewrites en Vercel
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### **Error: Build fails**
```
Solución: Verificar todas las dependencias están en package.json
Verificar Node version compatible
```

---

## 📝 **ARCHIVOS NECESARIOS**

### **vercel.json** (en packages/frontend)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### **.env.example** (para documentar)
```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
STRIPE_SECRET_KEY=sk_...
NODE_ENV=production

# Frontend
VITE_API_URL=https://api.tudominio.com/api/v1
VITE_STRIPE_PUBLIC_KEY=pk_...
```

---

## 🎉 **¡LISTO PARA PRODUCCIÓN!**

Después de seguir todos los pasos:
1. ✅ Frontend desplegado en Vercel/Netlify
2. ✅ Backend desplegado en Railway
3. ✅ Base de datos en la nube
4. ✅ Dominio configurado
5. ✅ Stripe en modo producción
6. ✅ Emails configurados
7. ✅ Monitoreo activo

**Tu aplicación está en internet y lista para recibir clientes reales!** 🚀

---

_¿Dudas? Sigue los pasos uno por uno y verifica cada checklist._
