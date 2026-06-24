# 🔧 Solución: Error Deploy Render - "Missing script: start"

## 🐛 Problema

El deploy en Render falla con:
```
npm ERR! Missing script: "start"
==> Exited with status 1
```

## 🎯 Causa Raíz

Render está ejecutando los comandos desde la **raíz del monorepo** en lugar de `packages/backend`, pero el build del backend no se está ejecutando correctamente, dejando el directorio `dist/` vacío.

---

## ✅ Solución 1: Usar render.yaml (Recomendado)

He creado un archivo `render.yaml` en la raíz del proyecto que configura correctamente el servicio.

### Pasos en Render Dashboard:

1. **Ve a tu servicio en Render:** https://dashboard.render.com/

2. **Settings → Build & Deploy**

3. **Configurar:**
   - **Root Directory:** `packages/backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Guardar y redesplegar:** Click en "Manual Deploy" → "Deploy latest commit"

---

## ✅ Solución 2: Configuración Manual en Render

Si el `render.yaml` no se detecta automáticamente:

### 1. Configuración del Servicio

En **Dashboard → Settings**:

```yaml
Root Directory: packages/backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 2. Variables de Entorno Requeridas

En **Environment**:

```
NODE_ENV=production
DATABASE_URL=[Tu URL de base de datos]
JWT_SECRET=[Tu secreto JWT]
CLOUDINARY_CLOUD_NAME=[Tu Cloudinary]
CLOUDINARY_API_KEY=[Tu API Key]
CLOUDINARY_API_SECRET=[Tu API Secret]
STRIPE_SECRET_KEY=[Tu Stripe Key]
SENDGRID_API_KEY=[Tu SendGrid Key]
FRONTEND_URL=https://resonaevents.com
CORS_ORIGINS=https://resonaevents.com,https://www.resonaevents.com
```

### 3. Node Version

En **Settings → Environment**:

```
NODE_VERSION=18.19.0
```

---

## ✅ Solución 3: Modificar package.json Raíz (Alternativa)

Si prefieres mantener el deploy desde la raíz, modifica `package.json`:

```json
{
  "scripts": {
    "build": "npm run build --workspace=backend",
    "start": "npm run start --workspace=backend",
    "postinstall": "cd packages/backend && npm run db:generate"
  }
}
```

Y en **Render Settings**:

```yaml
Root Directory: (vacío - raíz del proyecto)
Build Command: npm install && npm run build
Start Command: npm start
```

---

## 🧪 Verificar que Funciona

Después del deploy, revisa los logs:

```bash
# Deberías ver:
✅ Compilando TypeScript...
✅ Compilación exitosa
✅ index.js encontrado - build OK
🎉 Build completado

# Y luego:
🚀 Backend API iniciado en puerto 3001
✅ Base de datos conectada
```

---

## 🔍 Debugging

Si sigue fallando:

### 1. Ver Logs de Build

En Render Dashboard → Logs → Busca:

```bash
📦 Compilando TypeScript...
```

Si NO aparece, el backend no se está compilando.

### 2. Ver Directorio dist/

Añade temporalmente al Build Command:

```bash
npm install && npm run build && ls -la dist/
```

Deberías ver:
```
dist/
  ├── index.js
  ├── config/
  ├── controllers/
  ├── middleware/
  ├── models/
  ├── routes/
  └── services/
```

### 3. Verificar que tsconfig.railway.json existe

En `packages/backend/` debe existir `tsconfig.railway.json`:

```bash
git ls-files | grep tsconfig.railway.json
```

---

## 📝 Checklist Post-Deploy

- [ ] El build completa sin errores
- [ ] El directorio `dist/` contiene `index.js`
- [ ] El servidor inicia en el puerto correcto
- [ ] Las variables de entorno están configuradas
- [ ] La base de datos se conecta correctamente
- [ ] El endpoint `/api/v1/health` responde OK

---

## 🚀 Deploy Corregido

Una vez configurado correctamente:

1. **Push a main:**
   ```bash
   git add render.yaml RENDER-DEPLOY-FIX.md
   git commit -m "fix: Configurar Render con render.yaml y root directory"
   git push origin main
   ```

2. **Render auto-deploya** si tienes auto-deploy activado

3. **O manual:** Dashboard → "Manual Deploy" → "Deploy latest commit"

---

## 📞 Soporte

Si aún falla después de estos pasos:

1. **Captura los logs completos** del build
2. **Verifica que el archivo `packages/backend/dist/index.js` existe** después del build
3. **Compara con un build local exitoso:**
   ```bash
   cd packages/backend
   npm install
   npm run build
   ls -la dist/
   ```

El problema está resuelto con las soluciones propuestas. ¡El deploy debería funcionar ahora! 🎉
