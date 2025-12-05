# ✅ Fix: Error 401 en /extra-categories (Montajes no aparecen en Calculadora)

## 🐛 Problema Identificado

**Síntoma:**
```
GET https://resona-backend.onrender.com/api/v1/extra-categories 401 (Unauthorized)
{"error":{"code":"NO_TOKEN","message":"Token de autenticación no proporcionado"}}
```

**Impacto:**
- ❌ Los montajes NO aparecen en la calculadora en producción
- ❌ La calculadora no puede obtener las categorías de extras (Disco, FX, Decoración, Estructuras, etc.)
- ✅ En local funciona correctamente

---

## 🔍 Causa Raíz

El middleware de autenticación (`auth.middleware.ts` línea 24) **no incluía** `/extra-categories` en la lista de endpoints públicos:

**ANTES (❌):**
```typescript
const isPublicEndpoint = req.path.includes('/packs') || req.path.includes('/products') || req.path.includes('/categories');
```

**DESPUÉS (✅):**
```typescript
const isPublicEndpoint = req.path.includes('/packs') || req.path.includes('/products') || req.path.includes('/categories') || req.path.includes('/extra-categories');
```

---

## ✅ Solución Aplicada

### Cambio realizado:

**Archivo:** `packages/backend/src/middleware/auth.middleware.ts`
**Línea:** 24

```diff
- const isPublicEndpoint = req.path.includes('/packs') || req.path.includes('/products') || req.path.includes('/categories');
+ const isPublicEndpoint = req.path.includes('/packs') || req.path.includes('/products') || req.path.includes('/categories') || req.path.includes('/extra-categories');
```

**Efecto:**
- ✅ Permite acceso público (sin token) a `GET /api/v1/extra-categories`
- ✅ POST, PUT, DELETE siguen requiriendo autenticación (solo admin)
- ✅ La calculadora ahora puede obtener las categorías

---

## 📊 Estado del Deploy

```bash
✅ Commit: "fix: agregar /extra-categories a endpoints publicos"
✅ Branch: deploy
✅ Branch: main
✅ Pushed a GitHub
⏳ Esperando auto-deploy en Render (2-5 minutos)
```

---

## 🧪 Verificación Después del Deploy

### Paso 1: Esperar el deploy en Render

1. Ve a: https://dashboard.render.com
2. Busca el servicio `resona-backend`
3. Espera a que aparezca: `Build successful` y `Deploy live`

### Paso 2: Probar el endpoint

En el navegador, abre:
```
https://resona-backend.onrender.com/api/v1/extra-categories
```

**Resultado esperado:**
```json
{
  "categories": [
    {
      "id": "...",
      "name": "Disco",
      "slug": "disco",
      "icon": "🎵",
      "color": "purple",
      ...
    }
  ]
}
```

**Si el array está vacío `[]`:**
- Las categorías aún no existen en la base de datos
- Ver **Paso 3** para crearlas

### Paso 3: Crear las ExtraCategories (Si están vacías)

**Opción A - Usar herramienta HTML:**

1. Abrir: `test-production-extra-categories.html`
2. Hacer login en: https://www.resonaevents.com/admin
3. En la consola:
   ```javascript
   localStorage.getItem('authToken')
   ```
4. Copiar el token
5. En la herramienta HTML:
   ```javascript
   localStorage.setItem('authToken', 'TU_TOKEN')
   ```
6. Recargar y click en "✨ Crear ExtraCategories"

**Opción B - Restaurar backup desde local:**

1. **En LOCAL** (http://localhost:3000/admin/backup):
   - Crear backup nuevo
   - Descargar

2. **En PRODUCCIÓN** (https://www.resonaevents.com/admin/backup):
   - Subir backup
   - Restaurar

### Paso 4: Verificar la calculadora

1. Ir a: https://www.resonaevents.com/eventos
2. Seleccionar tipo de evento
3. En la sección de extras, deben aparecer las pestañas:
   - 🎵 Disco
   - ✨ FX
   - 🎨 Decoración
   - 🏗️ Estructuras ← **Aquí deben estar los montajes**
   - 💡 Iluminación
   - 📺 Audiovisual
   - 📦 Otros

---

## 📝 Categorías que se crearán

| ID | Nombre | Slug | Icon | Color | Orden |
|----|--------|------|------|-------|-------|
| cat-disco | Disco | disco | 🎵 | purple | 1 |
| cat-fx | FX | fx | ✨ | blue | 2 |
| cat-decoracion | Decoración | decoracion | 🎨 | pink | 3 |
| cat-iluminacion | Iluminación | iluminacion | 💡 | yellow | 4 |
| cat-estructuras | Estructuras | estructuras | 🏗️ | gray | 5 |
| cat-audiovisual | Audiovisual | audiovisual | 📺 | indigo | 6 |
| cat-otros | Otros | otros | 📦 | slate | 99 |

---

## ⚠️ Paso Adicional: Asignar Productos a Categorías

**IMPORTANTE:** Después de crear las ExtraCategories, los productos de montaje necesitan ser asignados a la categoría "Estructuras".

### Desde Panel de Admin:

1. Ve a: https://www.resonaevents.com/admin/calculator
2. Busca sección "Productos sin categoría"
3. Selecciona productos de montaje/personal
4. Asígnalos a la categoría "🏗️ Estructuras"

### Verificar productos con extraCategoryId:

En la consola del navegador:
```javascript
fetch('https://resona-backend.onrender.com/api/v1/products?category=Personal')
  .then(r => r.json())
  .then(data => {
    const withCategory = data.products.filter(p => p.extraCategoryId);
    console.log(`Productos con categoría: ${withCategory.length}/${data.products.length}`);
    console.log(withCategory.map(p => `${p.name} → ${p.extraCategory?.name}`));
  });
```

---

## 🎯 Checklist de Verificación

- [ ] Deploy en Render completado
- [ ] Endpoint `/api/v1/extra-categories` responde sin error 401
- [ ] ExtraCategories creadas (7 categorías)
- [ ] Productos de montaje asignados a "Estructuras"
- [ ] Calculadora muestra pestañas de extras
- [ ] Montajes aparecen en pestaña "Estructuras"

---

## 📊 Cronología del Fix

**5 dic 2025, 17:44:** Problema reportado - montajes no aparecen en producción
**5 dic 2025, 17:48:** Error 401 identificado
**5 dic 2025, 17:50:** Causa raíz encontrada - faltaba `/extra-categories` en lista pública
**5 dic 2025, 17:52:** Fix aplicado y pushed a deploy y main
**5 dic 2025, 17:55:** Esperando auto-deploy en Render

---

## 🔗 Archivos Relacionados

- **Fix principal:** `packages/backend/src/middleware/auth.middleware.ts:24`
- **Herramienta de test:** `test-production-extra-categories.html`
- **Rutas:** `packages/backend/src/routes/extraCategory.routes.ts`
- **Controller:** `packages/backend/src/controllers/extraCategory.controller.ts`
- **Service:** `packages/backend/src/services/extraCategory.service.ts`
- **Seed:** `packages/backend/scripts/seedExtraCategories.ts`

---

**Estado:** ✅ FIX APLICADO - Esperando deploy automático
**Próximo paso:** Verificar endpoint tras deploy y crear ExtraCategories si no existen
