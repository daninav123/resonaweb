# 🔍 Verificar SEO en Producción - Checklist

**Fecha:** 15 Diciembre 2025  
**Objetivo:** Hacer que `/alquiler-altavoces-valencia` aparezca en Google

---

## ✅ CHECKLIST DE VERIFICACIÓN

### **1. Verificar Base de Datos Tiene Páginas SEO**

**Comando:**
```bash
curl https://api.resonaevents.com/api/v1/seo-pages
```

**Resultado esperado:**
```json
{
  "pages": [
    {
      "slug": "",
      "title": "ReSona Events - Alquiler de Sonido...",
      "priority": 1.0
    },
    {
      "slug": "alquiler-altavoces-valencia",
      "title": "Alquiler de Altavoces Profesionales...",
      "priority": 0.98
    },
    // ... 10 páginas más
  ],
  "total": 12
}
```

**Si devuelve `{"pages":[]}`:**
- ❌ El auto-seed NO se ejecutó
- ⚠️ Acción: Ver Paso 2

**Si devuelve 12 páginas:**
- ✅ Auto-seed funcionó correctamente
- ✅ Continuar al Paso 3

---

### **2. Si Auto-Seed NO Funcionó: Verificar Logs de Render**

**Pasos:**
1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio **backend**
3. Click en **"Logs"** (menú lateral)
4. Busca estas líneas:

```
🌱 Ejecutando auto-seed de páginas SEO...
✅ Creada: /alquiler-altavoces-valencia
✅ Auto-seed de páginas SEO completado
```

**Si NO aparecen:**

**Causa A: `NODE_ENV` no es `production`**
```
Render → Environment → NODE_ENV=production
```

**Causa B: Error en auto-seed**
- Busca líneas con: `⚠️ Auto-seed falló`
- Busca errores relacionados con `seoPage`
- Puede que Prisma no regeneró el schema

**Causa C: Deploy no se completó**
- Verifica que el último deploy terminó exitosamente
- Si está "Building" o "Failed", hay que investigar

---

### **3. Verificar Sitemap Incluye las Páginas SEO**

**Comando:**
```bash
curl https://resonaevents.com/sitemap.xml | grep "alquiler-altavoces"
```

**Resultado esperado:**
```xml
<url>
  <loc>https://resonaevents.com/alquiler-altavoces-valencia</loc>
  <lastmod>2025-12-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.98</priority>
</url>
```

**Si NO aparece:**
- ❌ El sitemap NO está generando páginas SEO
- ⚠️ Problema en `sitemap.controller.ts`
- ⚠️ O las páginas no están en BD (volver a Paso 1)

**Si aparece:**
- ✅ Sitemap funcionando correctamente
- ✅ Continuar al Paso 4

---

### **4. Verificar que la Página Carga en el Navegador**

**Prueba:**
1. Abre: `https://resonaevents.com/alquiler-altavoces-valencia`

**Resultado esperado:**
- ✅ Página carga correctamente (200 OK)
- ✅ Se ve contenido de la landing page

**Si da 404:**
- ❌ El frontend no tiene ruta para esta página
- ⚠️ Necesitas crear el componente en React

**Si redirige o muestra error:**
- ❌ Problema con el routing
- ⚠️ Verificar `vercel.json` redirects

---

### **5. Verificar Google Search Console**

**Pasos:**
1. Ve a: https://search.google.com/search-console
2. Selecciona: `resonaevents.com`
3. Menú → **"Sitemaps"**
4. Verifica que `sitemap.xml` esté enviado

**Estado del Sitemap:**

**Si dice "No se pudo obtener":**
- ❌ Google no puede leer tu sitemap
- ⚠️ Puede ser por CORS o redirect
- ⚠️ Prueba manualmente: `https://resonaevents.com/sitemap.xml`

**Si dice "Correcto" pero 0 URLs:**
- ❌ Sitemap vacío o mal formato
- ⚠️ Verifica XML válido

**Si dice "X URLs descubiertas":**
- ✅ Google ve el sitemap
- ℹ️ Pero puede no haber indexado aún (tarda días)

---

### **6. Solicitar Indexación Manual (ACELERA)**

**Pasos:**
1. Search Console → **"Inspección de URLs"**
2. Pega: `https://resonaevents.com/alquiler-altavoces-valencia`
3. Click **"Solicitar indexación"**

**Resultado esperado:**
```
✅ Solicitud de indexación enviada
⏰ Google la procesará en 1-2 días
```

**Si dice "URL no está en Google":**
- ℹ️ Normal si es primera vez
- ✅ Solicita indexación de todos modos

**Si dice "URL tiene problemas":**
- ❌ Investiga qué problema tiene
- Posibles: robots.txt bloqueando, noindex, redirect loop

---

## 🚀 PLAN DE ACCIÓN COMPLETO

### **Fase 1: Verificación (5 minutos)**

```bash
# Test 1: Páginas SEO en BD
curl https://api.resonaevents.com/api/v1/seo-pages

# Test 2: Sitemap incluye páginas
curl https://resonaevents.com/sitemap.xml | grep "alquiler"

# Test 3: Página carga
curl -I https://resonaevents.com/alquiler-altavoces-valencia
```

---

### **Fase 2A: Si Auto-Seed NO Funcionó**

**Opción 1: Ejecutar Seed Manual desde Render Shell**
1. Render Dashboard → Backend → **"Shell"**
2. Ejecuta:
   ```bash
   cd packages/backend
   npx ts-node src/scripts/auto-seed.ts
   ```

**Opción 2: Ejecutar Seed desde API (Más Fácil)**
1. Login en tu sitio como admin
2. F12 → Application → Local Storage → Copia `accessToken`
3. Ejecuta:
   ```bash
   curl -X POST https://api.resonaevents.com/api/v1/seo-pages/seed-initial-pages \
     -H "Authorization: Bearer TU_TOKEN_AQUI"
   ```

**Resultado:**
```json
{
  "message": "Seed completado",
  "created": ["", "productos", "blog", ..., "alquiler-altavoces-valencia"],
  "total": 12
}
```

---

### **Fase 2B: Si Auto-Seed SÍ Funcionó**

**Reenviar Sitemap a Google:**
1. Search Console → Sitemaps
2. "Añadir sitemap": `sitemap.xml`
3. Click **"Enviar"**
4. Espera 1 hora (Google lo procesa)

---

### **Fase 3: Solicitar Indexación de Landing Pages (2 minutos)**

En Search Console → Inspección de URLs → Solicitar indexación:

1. `https://resonaevents.com/alquiler-altavoces-valencia` ⭐
2. `https://resonaevents.com/alquiler-sonido-valencia`
3. `https://resonaevents.com/alquiler-iluminacion-valencia`
4. `https://resonaevents.com/sonido-bodas-valencia`
5. `https://resonaevents.com/alquiler-sonido-torrent`

**Tiempo:** 30 segundos por URL = 2.5 minutos total

---

### **Fase 4: Esperar y Verificar (Timeline)**

| Tiempo | Acción | Estado Esperado |
|--------|--------|-----------------|
| **Ahora** | Verificar BD y sitemap | Debe estar todo OK |
| **+1 hora** | Google procesa sitemap | Reconoce nuevas URLs |
| **+1 día** | Inspección de URLs | Google dice "URL en cola" |
| **+2-3 días** | Primera indexación | Aparece en `site:` |
| **+5-7 días** | Indexación completa | Aparece en búsquedas |
| **+2 semanas** | Ranking inicial | Posición 30-50 |
| **+1 mes** | Con backlinks y GMB | Top 10 🎯 |

---

## 🔍 TROUBLESHOOTING

### **Problema 1: API devuelve `{"pages":[]}`**

**Causa:** Auto-seed no se ejecutó o BD está vacía

**Solución:**
1. Ejecuta seed manual (Fase 2A)
2. Verifica `NODE_ENV=production` en Render
3. Verifica logs de Render por errores

---

### **Problema 2: Sitemap no incluye las páginas**

**Causa:** Código no está desplegado o error en controller

**Solución:**
1. Verifica último commit en Render
2. Verifica logs por errores en `sitemap.controller.ts`
3. Prueba manualmente: `curl https://resonaevents.com/sitemap.xml`

---

### **Problema 3: Página da 404**

**Causa:** Frontend no tiene componente para landing pages SEO

**Solución:**
- Necesitas crear componente React para renderizar estas páginas
- O configurar como páginas estáticas
- Ver documentación de frontend routing

---

### **Problema 4: Google dice "URL bloqueada por robots.txt"**

**Causa:** robots.txt bloqueando la ruta

**Solución:**
1. Verifica: `https://resonaevents.com/robots.txt`
2. Asegúrate que NO tiene: `Disallow: /alquiler`
3. Debe tener: `Allow: /`

---

### **Problema 5: Google no indexa después de 1 semana**

**Causas posibles:**
- Contenido duplicado
- Calidad baja del contenido
- Sin backlinks (autoridad baja)
- Penalización (poco probable si es sitio nuevo)

**Solución:**
1. Crea contenido único y de calidad
2. Añade imágenes y videos
3. Consigue backlinks de calidad
4. Optimiza Google My Business
5. Crea contenido de blog relacionado

---

## 📊 CHECKLIST FINAL

**Antes de irse:**
- [ ] BD tiene 12 páginas SEO
- [ ] Sitemap incluye `/alquiler-altavoces-valencia`
- [ ] Página carga en navegador (200 OK)
- [ ] Sitemap enviado a Google Search Console
- [ ] Indexación solicitada (5 landing pages)
- [ ] Variables en Render actualizadas (sin www)

**Después de 2-3 días:**
- [ ] Verificar en Google: `site:resonaevents.com alquiler altavoces`
- [ ] Si NO aparece, revisar Search Console → Coverage
- [ ] Si aparece, verificar posición con búsqueda normal

---

## 🎯 EJECUTA AHORA (EN ORDEN)

1. **Test rápido (1 min):**
   ```bash
   curl https://api.resonaevents.com/api/v1/seo-pages
   ```

2. **Si devuelve páginas:** Continuar a Fase 2B (Reenviar sitemap)

3. **Si está vacío:** Ejecutar seed manual (Fase 2A)

4. **Después del seed:** Reenviar sitemap + Solicitar indexación

---

**Tiempo total:** 10-15 minutos de trabajo activo  
**Resultado:** Indexación en 2-7 días  

🚀 **¡Empecemos con el Test 1!**
