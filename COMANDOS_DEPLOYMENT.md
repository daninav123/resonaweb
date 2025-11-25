# ⚡ COMANDOS RÁPIDOS DE DEPLOYMENT

_Comandos esenciales para subir a producción_

---

## 🚀 **INICIO RÁPIDO (5 MINUTOS)**

```bash
# 1. Subir a GitHub
git add .
git commit -m "Ready for production"
git push origin main

# 2. Crear BD en Railway
# → railway.app → New Project → PostgreSQL
# → Copiar DATABASE_URL

# 3. Aplicar migraciones
cd packages/backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# 4. Deploy Backend en Railway
# → New Project → Deploy from GitHub
# → Root: packages/backend
# → Build: npm run build
# → Start: npm start

# 5. Deploy Frontend en Vercel
# → vercel.com → New Project
# → Root: packages/frontend
# → Build: npm run build
# → Output: dist
```

---

## 📦 **PREPARACIÓN LOCAL**

### **Instalar Dependencias**
```bash
# Raíz
npm install

# Backend
cd packages/backend
npm install
npx prisma generate

# Frontend  
cd packages/frontend
npm install
```

### **Verificar Build**
```bash
# Backend
cd packages/backend
npm run build
# Debe crear carpeta dist/ sin errores

# Frontend
cd packages/frontend
npm run build
# Debe crear carpeta dist/ sin errores
```

---

## 🗄️ **BASE DE DATOS**

### **Conectar a BD de Producción**
```bash
cd packages/backend

# Opción 1: Variable temporal
DATABASE_URL="postgresql://..." npx prisma studio

# Opción 2: Actualizar .env
echo 'DATABASE_URL="postgresql://..."' > .env
```

### **Migraciones**
```bash
# Aplicar todas las migraciones pendientes
npx prisma migrate deploy

# Ver estado de migraciones
npx prisma migrate status

# Generar cliente Prisma
npx prisma generate

# Abrir Studio (ver datos)
npx prisma studio
```

### **Seed de Datos**
```bash
# Cargar datos iniciales
npx prisma db seed

# O manual
npx ts-node src/scripts/seed-simple.ts
```

---

## 🚢 **RAILWAY (Backend)**

### **CLI de Railway**
```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Añadir variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="tu_secret_aqui"
railway variables set NODE_ENV="production"

# Ver variables
railway variables

# Deploy
railway up

# Ver logs
railway logs

# Abrir en navegador
railway open
```

### **Deploy Manual (Sin CLI)**
1. railway.app → Dashboard
2. New Project → Deploy from GitHub
3. Select repo
4. Settings:
   - Root: `packages/backend`
   - Build: `npm run build`
   - Start: `npm start`
5. Variables → Add todas las necesarias
6. Deploy

---

## 🎨 **VERCEL (Frontend)**

### **CLI de Vercel**
```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Deploy a preview
cd packages/frontend
vercel

# Deploy a production
vercel --prod

# Ver logs
vercel logs

# Abrir en navegador
vercel open
```

### **Variables de Entorno**
```bash
# Añadir variable
vercel env add VITE_API_URL production

# Listar variables
vercel env ls

# Ver valor
vercel env pull .env.production
```

---

## 🧪 **TESTING**

### **Health Check**
```bash
# Backend
curl https://tu-backend.railway.app/api/v1/health

# Debe responder:
# {"status":"ok","timestamp":"..."}
```

### **Test de API**
```bash
# Login
curl -X POST https://tu-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@resona360.com","password":"admin123"}'

# Productos
curl https://tu-backend.railway.app/api/v1/products
```

### **Test de Frontend**
```bash
# Verificar que carga
curl https://tudominio.vercel.app

# Ver headers
curl -I https://tudominio.vercel.app

# Lighthouse (requiere Chrome)
npx lighthouse https://tudominio.vercel.app --view
```

---

## 🔄 **ACTUALIZACIONES**

### **Actualizar Backend**
```bash
# Hacer cambios en código
git add .
git commit -m "Update backend"
git push

# Railway auto-deploy (si está conectado a GitHub)
# O manual: railway up
```

### **Actualizar Frontend**
```bash
# Hacer cambios
git add .
git commit -m "Update frontend"
git push

# Vercel auto-deploy
# O manual: vercel --prod
```

### **Actualizar BD (Migraciones)**
```bash
cd packages/backend

# Crear nueva migración
npx prisma migrate dev --name add_new_field

# Aplicar en producción
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## 🔒 **SEGURIDAD**

### **Rotar Secrets**
```bash
# Generar nuevo JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Actualizar en Railway
railway variables set JWT_SECRET="nuevo_secret"

# Actualizar en .env local
echo 'JWT_SECRET="nuevo_secret"' >> .env
```

### **Ver Logs**
```bash
# Railway
railway logs

# O en dashboard: railway.app → tu proyecto → Observability

# Vercel
vercel logs

# O en dashboard: vercel.com → tu proyecto → Logs
```

---

## 🚨 **TROUBLESHOOTING**

### **Build Falla**
```bash
# Limpiar y reinstalar
rm -rf node_modules dist
npm install
npm run build

# Ver logs detallados
npm run build --verbose
```

### **BD No Conecta**
```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Test de conexión
cd packages/backend
npx prisma db execute --stdin < /dev/null

# Regenerar cliente
npx prisma generate
```

### **CORS Errors**
```bash
# Verificar FRONTEND_URL en Railway
railway variables get FRONTEND_URL

# Debe ser: https://tudominio.vercel.app (sin / al final)
```

### **Rollback**
```bash
# Railway: Dashboard → Deployments → anterior → Redeploy

# Vercel
vercel rollback

# O en dashboard: Deployments → anterior → Promote to Production
```

---

## 📊 **MONITOREO**

### **Logs en Tiempo Real**
```bash
# Railway
railway logs --tail

# Vercel
vercel logs --follow
```

### **Status**
```bash
# Ver estado de servicios
railway status

# Ver uso
railway usage
```

---

## 🎯 **COMANDOS MÁS USADOS**

```bash
# Ver todo funcionando
npm run dev                    # Local
railway logs --tail            # Producción backend
vercel dev                     # Producción frontend (local preview)

# Deploy rápido
git add . && git commit -m "Update" && git push  # Auto-deploy

# Ver estado
railway status                 # Backend
vercel ls                      # Frontend

# Rollback si algo falla
railway rollback               # Backend
vercel rollback                # Frontend
```

---

## 🆘 **AYUDA RÁPIDA**

```bash
# Railway
railway help
railway logs
railway variables

# Vercel
vercel help
vercel --help deploy
vercel env --help

# Prisma
npx prisma --help
npx prisma migrate --help
```

---

**💡 TIP: Guarda estos comandos en tu terminal con alias:**

```bash
# En tu ~/.bashrc o ~/.zshrc
alias rdeploy="cd packages/backend && railway up"
alias vdeploy="cd packages/frontend && vercel --prod"
alias rlogs="railway logs --tail"
alias vlogs="vercel logs --follow"
```

---

**¡Deployment simplificado!** 🚀
