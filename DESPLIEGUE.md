# 🚀 GUÍA DE DESPLIEGUE - RESONA EVENTS

**Fecha:** 13 de Noviembre de 2025

---

## 📋 PRE-REQUISITOS

```bash
# 1. Node.js instalado (v18+)
node --version

# 2. Cuenta en Netlify (gratis)
https://app.netlify.com/signup

# 3. Instalar Netlify CLI
npm install -g netlify-cli
```

---

## 🎯 OPCIÓN 1: DESPLIEGUE DESDE GITHUB (RECOMENDADO)

### **Paso 1: Subir a GitHub**

```bash
# Ir al directorio del proyecto
cd c:\Users\Administrator\CascadeProjects\windsurf-project-3

# Inicializar Git (si no está iniciado)
git init

# Configurar repositorio remoto
git remote add origin https://github.com/Daniel-Navarro-Campos/mywed360.git

# Añadir archivos
git add .

# Commit
git commit -m "feat: Frontend completo con carrito funcional"

# Push
git push -u origin main
```

### **Paso 2: Conectar con Netlify**

1. Ve a https://app.netlify.com
2. Click "Add new site" > "Import an existing project"
3. Selecciona GitHub
4. Busca tu repo: `mywed360`
5. Configurar build:
   ```
   Base directory: packages/frontend
   Build command: npm run build
   Publish directory: packages/frontend/dist
   ```
6. Click "Deploy site"

✅ **Netlify detectará automáticamente cambios y redesplegar**

---

## 🎯 OPCIÓN 2: DESPLIEGUE MANUAL CON CLI

### **Paso 1: Build del Proyecto**

```bash
# Ir al frontend
cd c:\Users\Administrator\CascadeProjects\windsurf-project-3\packages\frontend

# Instalar dependencias (si no están)
npm install

# Build de producción
npm run build
```

### **Paso 2: Deploy con Netlify CLI**

```bash
# Login a Netlify
netlify login

# Deploy (primera vez)
netlify deploy --dir=dist --prod

# O usar el comando interactivo
netlify deploy
```

Sigue las instrucciones:
1. ¿Crear nuevo site? → Yes
2. Site name → `resona-events` (o el que prefieras)
3. Deploy path → `./dist`

---

## 🎯 OPCIÓN 3: DRAG & DROP (MÁS SIMPLE)

### **Paso 1: Build**

```bash
cd c:\Users\Administrator\CascadeProjects\windsurf-project-3\packages\frontend
npm run build
```

### **Paso 2: Upload Manual**

1. Ve a https://app.netlify.com/drop
2. Arrastra la carpeta `dist` completa
3. ✅ ¡Listo!

---

## ⚙️ VARIABLES DE ENTORNO

### **En Netlify Dashboard:**

1. Ve a Site settings > Environment variables
2. Añade:

```env
VITE_API_URL=https://tu-backend.onrender.com/api/v1
```

⚠️ **IMPORTANTE:** Cambia las URLs en `src/services/api.ts`

```typescript
// api.ts
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
```

---

## 🔧 CONFIGURACIÓN ACTUAL

### **Archivos Creados:**

✅ `packages/frontend/netlify.toml`
```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

✅ `packages/frontend/.gitignore`
```
node_modules
dist
.env
.env.local
```

---

## 🚀 BACKEND (Render/Railway/Heroku)

Tu backend (`packages/backend`) se debe desplegar por separado:

### **Render (Recomendado - Gratis):**

1. Ve a https://render.com
2. New > Web Service
3. Conecta GitHub repo
4. Configurar:
   ```
   Root Directory: packages/backend
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
5. Añadir variables de entorno:
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=tu-secreto-seguro
   NODE_ENV=production
   ```

### **Railway:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd packages/backend
railway up
```

---

## 📊 CHECKLIST PRE-DEPLOY

### **Frontend:**
- [x] Build funciona (`npm run build`)
- [x] netlify.toml creado
- [x] .gitignore configurado
- [ ] Variables de entorno configuradas
- [ ] URLs del backend actualizadas

### **Backend:**
- [ ] Base de datos PostgreSQL lista
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] Endpoint /health funcionando

### **General:**
- [ ] Repo en GitHub actualizado
- [ ] README con instrucciones
- [ ] Documentación API
- [ ] Testing básico completado

---

## 🧪 TESTING POST-DEPLOY

### **1. Frontend Deploy:**
```bash
# Verificar build local
npm run build
npm run preview

# Abrir http://localhost:4173
# ✅ Debe verse igual que en desarrollo
```

### **2. Después de Deploy:**

Verificar:
- [ ] Home carga correctamente
- [ ] Productos se muestran
- [ ] Login funciona
- [ ] Carrito funciona
- [ ] Imágenes cargan
- [ ] Navegación funciona
- [ ] Responsive mobile

---

## 🐛 TROUBLESHOOTING

### **Error: "Failed to load module"**
```bash
# Limpiar y rebuild
rm -rf dist node_modules
npm install
npm run build
```

### **Error: "404 on page refresh"**
✅ Ya configurado en `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Error: "API not connecting"**
Verifica:
1. Backend está desplegado y running
2. URL correcta en variables de entorno
3. CORS configurado en backend

---

## 📝 COMANDOS ÚTILES

```bash
# Ver logs del deploy
netlify logs

# Ver site info
netlify status

# Abrir dashboard
netlify open

# Ver preview de deploy
netlify preview

# Rollback a versión anterior
netlify rollback
```

---

## 🎯 PRÓXIMOS PASOS

1. **Deploy Frontend**
   ```bash
   cd packages/frontend
   npm run build
   netlify deploy --prod
   ```

2. **Deploy Backend**
   ```bash
   # En Render o Railway
   ```

3. **Configurar Dominio**
   - Netlify: Site settings > Domain management
   - Añade tu dominio personalizado

4. **SSL/HTTPS**
   - Netlify lo activa automáticamente ✅

5. **Analytics**
   - Netlify Analytics (opcional, de pago)
   - Google Analytics (gratis)

---

## 🔐 SEGURIDAD

### **Headers de Seguridad (Ya Configurados):**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### **Antes de Producción:**
- [ ] Cambiar JWT_SECRET
- [ ] Configurar rate limiting
- [ ] Activar HTTPS only
- [ ] Configurar CSP headers
- [ ] Revisar CORS origins

---

## 💰 COSTOS

### **Gratis:**
- ✅ Netlify (100GB bandwidth/mes)
- ✅ Render (750 horas/mes free tier)
- ✅ Railway ($5 crédito gratis)
- ✅ GitHub (repos públicos)

### **De Pago (Opcional):**
- Dominio: ~$12/año
- Netlify Pro: $19/mes
- Render Pro: $7-25/mes
- Base de datos: $7/mes

---

## ✅ RESUMEN RÁPIDO

```bash
# 1. Build
cd packages/frontend
npm run build

# 2. Deploy
netlify login
netlify deploy --dir=dist --prod

# 3. Verificar
# Abre la URL que te da Netlify
```

**¡Listo!** 🎉

---

## 📞 SOPORTE

- Netlify Docs: https://docs.netlify.com
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app

---

**Estado:** ✅ Configuración lista para desplegar
**Tiempo estimado:** 10-15 minutos
**Dificultad:** Fácil
