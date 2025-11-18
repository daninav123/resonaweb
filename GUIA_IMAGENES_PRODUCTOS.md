# 📸 Guía: Cómo Editar Imágenes de Productos

## 🎯 3 Formas de Editar Imágenes

---

## **OPCIÓN 1: Panel de Administración (Recomendado)** ✨

### 1. Accede al gestor de productos
```
http://localhost:3000/admin/products
```

### 2. Busca el producto
- Usa la barra de búsqueda
- Encuentra el producto que quieres editar

### 3. Edita las imágenes
- Click en "Editar Imágenes"
- Pega las URLs de las nuevas imágenes
- Añade múltiples imágenes si quieres
- La primera imagen será la principal
- Click en "Guardar Cambios"

---

## **OPCIÓN 2: Script de Actualización (Múltiples productos)** ⚡

### Paso 1: Buscar productos
```bash
cd packages/backend
npx tsx src/scripts/update-product-images.ts search "das audio"
```

Esto te mostrará:
- Nombre del producto
- Slug (necesario para actualizar)
- Imágenes actuales

### Paso 2: Editar el script
Abre: `packages/backend/src/scripts/update-product-images.ts`

Edita el array `updates`:
```typescript
const updates = [
  {
    slug: 'das-audio-515a',
    images: [
      'https://nueva-imagen-1.jpg',
      'https://nueva-imagen-2.jpg',
      'https://nueva-imagen-3.jpg'
    ]
  },
  {
    slug: 'icoa-12a-blanco',
    images: [
      'https://otra-imagen.jpg'
    ]
  }
  // Añade más productos...
];
```

### Paso 3: Ejecutar el script
```bash
npx tsx src/scripts/update-product-images.ts
```

Verás:
```
🖼️  Actualizando imágenes de productos...

✅ Actualizado: DAS Audio 515A
   Imágenes anteriores: 1
   Imágenes nuevas: 3
   URLs:
   1. https://nueva-imagen-1.jpg
   2. https://nueva-imagen-2.jpg
   3. https://nueva-imagen-3.jpg

📊 RESUMEN:
   ✅ Actualizados: 2
   ❌ No encontrados: 0
   📦 Total procesados: 2
```

---

## **OPCIÓN 3: Directamente en la Base de Datos** 🛠️

### Usando Prisma Studio (GUI)
```bash
cd packages/backend
npx prisma studio
```

1. Se abre en http://localhost:5555
2. Ve a la tabla `Product`
3. Busca el producto
4. Edita el campo `images` (es un array JSON)
5. Formato: `["url1", "url2", "url3"]`
6. Guarda

### Usando SQL directamente
```sql
UPDATE "Product"
SET images = '["https://nueva-imagen.jpg"]',
    "mainImageUrl" = 'https://nueva-imagen.jpg'
WHERE slug = 'das-audio-515a';
```

---

## 📝 **Formato de URLs de Imágenes**

### ✅ URLs Válidas:
```
https://images.unsplash.com/photo-123456?w=800
https://tu-servidor.com/imagenes/producto.jpg
https://cdn.ejemplo.com/producto.png
```

### ❌ URLs NO Válidas:
```
/local/imagen.jpg           (no usar rutas locales)
C:\imagenes\foto.jpg        (no usar rutas de Windows)
imagen.jpg                  (necesita protocolo https://)
```

---

## 🎨 **Fuentes de Imágenes Legales**

### Gratuitas (Uso comercial permitido):
1. **Unsplash** - https://unsplash.com
   - Búsqueda: "audio equipment", "lighting stage", "microphone"
   - Click derecho → Copiar dirección de imagen

2. **Pexels** - https://pexels.com
   - Fotos y videos gratis
   - Licencia libre

3. **Pixabay** - https://pixabay.com
   - Millones de imágenes
   - Sin atribución requerida

### Tips para encontrar imágenes:
```
Búsquedas en inglés:
- "professional speaker"
- "stage lighting"
- "audio mixer"
- "microphone"
- "dj equipment"
- "truss structure"
```

---

## 🔧 **Ejemplo Completo**

### Cambiar imagen del "DAS Audio 515A"

**Opción A - Panel Admin:**
1. Ve a http://localhost:3000/admin/products
2. Busca "DAS Audio"
3. Click "Editar Imágenes"
4. Pega: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800`
5. Guardar

**Opción B - Script:**
```typescript
// En update-product-images.ts
const updates = [
  {
    slug: 'das-audio-515a',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800'
    ]
  }
];
```

Ejecutar:
```bash
npx tsx src/scripts/update-product-images.ts
```

---

## 🚨 **Solución de Problemas**

### Imagen no se muestra:
1. ✅ Verifica que la URL sea correcta (cópiala en el navegador)
2. ✅ Asegúrate de que empiece con `https://`
3. ✅ Comprueba que el servidor de la imagen permita hot-linking
4. ✅ Refresca el navegador (Ctrl + F5)

### Error "No encontrado":
- Verifica que el `slug` sea correcto
- Busca primero con: `npx tsx src/scripts/update-product-images.ts search "nombre"`

### Múltiples imágenes no aparecen:
- El formato debe ser un array JSON: `["url1", "url2"]`
- Verifica que no haya comas extras

---

## 📊 **Ver Todos los Productos**

Para ver una lista de todos los productos y sus slugs:

```bash
cd packages/backend
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.product.findMany({select:{name:1,slug:1,images:1}})
  .then(r => {
    r.forEach(x => console.log(x.slug + ' - ' + x.name));
    process.exit(0);
  });
"
```

---

## ✅ **Recomendaciones**

1. **Usa la Opción 1** (Panel Admin) para cambios individuales
2. **Usa la Opción 2** (Script) para actualizar muchos productos a la vez
3. **Guarda un backup** antes de cambios masivos
4. **Prueba primero** con 1-2 productos
5. **Usa imágenes de alta calidad** (mínimo 800px de ancho)
6. **Optimiza el tamaño** (no uses imágenes de 5MB+)

---

_Última actualización: 18/11/2025_
