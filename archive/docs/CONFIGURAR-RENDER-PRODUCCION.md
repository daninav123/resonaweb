# 🚀 Configurar Variables de Entorno en Render (URGENTE)

## ⚠️ PROBLEMA: URLs con www incorrectas

Tu backend en Render está usando `www.resonaevents.com` pero debería usar `resonaevents.com` (sin www).

**Impacto:**
- ❌ Sitemap genera URLs incorrectas
- ❌ CORS no funciona correctamente
- ❌ Google ve 2 sitios diferentes
- ❌ SEO dividido entre 2 dominios

---

## ✅ SOLUCIÓN: Actualizar Variables en Render

### **Paso 1: Ir a Render Dashboard**

1. Ve a: https://dashboard.render.com
2. Inicia sesión
3. Selecciona tu servicio **backend** (probablemente "resonaevents-api" o similar)

---

### **Paso 2: Actualizar Variables de Entorno**

1. Click en **"Environment"** (menú lateral izquierdo)
2. Busca y **MODIFICA** estas variables:

#### **Variable 1: FRONTEND_URL**
```
Nombre: FRONTEND_URL
Valor ACTUAL: https://www.resonaevents.com ❌
Valor NUEVO:  https://resonaevents.com ✅
```

#### **Variable 2: SITE_URL**
```
Nombre: SITE_URL
Valor ACTUAL: https://www.resonaevents.com ❌
Valor NUEVO:  https://resonaevents.com ✅
```

#### **Variable 3: CORS_ORIGIN**
```
Nombre: CORS_ORIGIN
Valor ACTUAL: https://resonaweb-frontend.vercel.app,https://www.resonaevents.com,https://resonaevents.com ❌
Valor NUEVO:  https://resonaevents.com ✅
```

#### **Variable 4: REDSYS_BASE_URL** (si existe)
```
Nombre: REDSYS_BASE_URL
Valor ACTUAL: https://www.resonaevents.com ❌
Valor NUEVO:  https://resonaevents.com ✅
```

---

### **Paso 3: Guardar y Redesplegar**

1. Click en **"Save Changes"** (abajo)
2. Render detectará los cambios
3. Click en **"Manual Deploy"** → **"Deploy latest commit"**
4. Espera 5-8 minutos a que termine el deploy

---

## ✅ Verificar que Funcionó

### **1. Verificar Sitemap (Después del deploy):**

```bash
curl https://resonaevents.com/sitemap.xml | grep "<loc>"
```

**Debe mostrar URLs SIN www:**
```xml
<loc>https://resonaevents.com/</loc>
<loc>https://resonaevents.com/productos</loc>
<loc>https://resonaevents.com/alquiler-altavoces-valencia</loc>
```

**NO debe mostrar:**
```xml
<loc>https://www.resonaevents.com/...</loc> ❌
```

### **2. Verificar API de SEO Pages:**

```bash
curl https://api.resonaevents.com/api/v1/seo-pages
```

Debe devolver 12 páginas.

### **3. Verificar Logs de Auto-Seed:**

1. Render Dashboard → Tu servicio → **Logs**
2. Busca:
   ```
   🌱 Ejecutando auto-seed de páginas SEO...
   ✅ Creada: /alquiler-altavoces-valencia
   ✅ Auto-seed de páginas SEO completado
   ```

---

## 📊 Variables Completas de Referencia

Copia estas EXACTAS (sin www):

```bash
# Frontend
FRONTEND_URL=https://resonaevents.com

# CORS (solo el dominio principal)
CORS_ORIGIN=https://resonaevents.com

# SEO
SITE_URL=https://resonaevents.com

# Redsys (si lo usas)
REDSYS_BASE_URL=https://resonaevents.com
```

---

## 🎯 Resumen

**Cambios necesarios:**
- ✅ `FRONTEND_URL`: Quitar `www`
- ✅ `SITE_URL`: Quitar `www`
- ✅ `CORS_ORIGIN`: Solo `resonaevents.com`
- ✅ `REDSYS_BASE_URL`: Quitar `www`

**Tiempo:** 2 minutos cambiar + 8 minutos deploy = **10 minutos total**

**Impacto:** CRÍTICO para SEO - Todas las URLs deben ser consistentes.

---

## ⏰ Después de Configurar

Una vez que Render termine el deploy (10 min):

1. ✅ Verifica sitemap tiene URLs correctas
2. ✅ Google Search Console → Reenviar sitemap.xml
3. ✅ Solicitar indexación de 5 landing pages
4. ✅ Esperar 2-5 días para indexación

---

**¿Listo para hacer los cambios en Render?** 🚀
