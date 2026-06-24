# 📸 Guía: Subir y Gestionar Imágenes desde el Panel Admin

## 🎯 Cómo Subir Imágenes de Productos

### **Paso 1: Accede al Gestor de Productos**
```
http://localhost:3000/admin/products
```

### **Paso 2: Encuentra el Producto**
- Usa la barra de búsqueda si es necesario
- Localiza el producto al que quieres añadir imágenes

### **Paso 3: Click en el Icono de Imagen** 📷
- En la columna "Acciones", verás 3 botones:
  - **📷 Imagen** (azul) - Gestionar imágenes
  - **✏️ Editar** (naranja) - Editar detalles
  - **🗑️ Eliminar** (rojo) - Borrar producto

- Haz click en el **icono azul de imagen**

### **Paso 4: Subir Imágenes**

Tienes 2 formas de subir:

#### **Opción A: Arrastrar y Soltar**
1. Arrastra archivos desde tu explorador
2. Suéltalos en la zona punteada
3. ✅ Se subirán automáticamente

#### **Opción B: Seleccionar Archivos**
1. Click en "Seleccionar Archivos"
2. Elige una o varias imágenes
3. ✅ Se subirán automáticamente

### **Paso 5: Organizar Imágenes**
- **Primera imagen** = Imagen principal (se muestra con badge verde)
- Usa las flechas **← →** para reordenar
- Click en **X** para eliminar una imagen

### **Paso 6: Guardar**
- Click en **"Guardar Cambios"**
- ✅ Las imágenes se guardan en el producto

---

## ✨ **Características**

### **Límites y Formatos**
- ✅ **Formatos**: JPG, JPEG, PNG, GIF, WebP
- ✅ **Tamaño máximo**: 5MB por imagen
- ✅ **Cantidad**: Hasta 10 imágenes por producto

### **Almacenamiento**
- Las imágenes se guardan en el servidor
- Ruta: `packages/backend/uploads/products/`
- URL pública: `http://localhost:3001/uploads/products/nombre-archivo.jpg`

### **Funciones**
- ✅ Subida múltiple (varias imágenes a la vez)
- ✅ Arrastrar y soltar
- ✅ Reordenar imágenes
- ✅ Eliminar imágenes
- ✅ Vista previa instantánea
- ✅ Imagen principal automática (primera)

---

## 🔧 **API Endpoints**

El sistema incluye estos endpoints:

### **Subir una imagen**
```
POST /api/v1/upload/image
Content-Type: multipart/form-data
Body: { image: File }
```

### **Subir múltiples imágenes**
```
POST /api/v1/upload/images
Content-Type: multipart/form-data
Body: { images: File[] }
```

### **Eliminar una imagen**
```
DELETE /api/v1/upload/image/:filename
```

### **Listar todas las imágenes**
```
GET /api/v1/upload/images
```

---

## 📂 **Estructura de Archivos**

```
packages/
├── backend/
│   ├── uploads/
│   │   └── products/          ← Imágenes guardadas aquí
│   │       ├── altavoz-123.jpg
│   │       ├── luz-456.png
│   │       └── ...
│   ├── src/
│   │   ├── middleware/
│   │   │   └── upload.middleware.ts    ← Configuración Multer
│   │   └── routes/
│   │       └── upload.routes.ts        ← Rutas de upload
│   └── ...
│
└── frontend/
    └── src/
        ├── components/
        │   └── admin/
        │       ├── ImageUploader.tsx           ← Componente de subida
        │       └── ProductImageManager.tsx     ← Modal gestor
        └── pages/
            └── admin/
                └── ProductsManager.tsx          ← Panel principal
```

---

## 🎨 **Ejemplo de Uso**

### **1. Añadir imágenes a "DAS Audio 515A"**
```
1. Ve a http://localhost:3000/admin/products
2. Busca "DAS Audio"
3. Click en 📷 (icono azul)
4. Arrastra 3 imágenes del altavoz
5. Reordena si es necesario
6. Click "Guardar Cambios"
```

### **2. Ver el resultado**
```
http://localhost:3000/productos/das-audio-515a
```

Verás las imágenes en el carrusel del producto.

---

## 🚨 **Solución de Problemas**

### **Error: "Solo se permiten archivos de imagen"**
- ✅ Verifica que el archivo sea JPG, PNG, GIF o WebP
- ❌ No intentes subir PDF, ZIP, etc.

### **Error: "El archivo es demasiado grande"**
- ✅ Reduce el tamaño de la imagen
- ✅ Máximo permitido: 5MB
- 💡 Usa herramientas como TinyPNG.com para comprimir

### **La imagen no se muestra**
1. Refresca el navegador (Ctrl + F5)
2. Verifica que el servidor backend esté corriendo
3. Comprueba la consola del navegador (F12)

### **No puedo subir más imágenes**
- Máximo: 10 imágenes por producto
- Elimina alguna para añadir nuevas

---

## 💡 **Consejos y Buenas Prácticas**

### **Nombres de Archivos**
- ✅ Automático: `nombre-producto-timestamp.jpg`
- ✅ Único: No hay duplicados
- ✅ Sanitizado: Sin caracteres especiales

### **Optimización de Imágenes**
1. **Tamaño recomendado**: 1200x1200px
2. **Formato**: JPG para fotos, PNG para transparencias
3. **Compresión**: Usa TinyPNG o similares
4. **Peso**: Idealmente < 500KB por imagen

### **Orden de Imágenes**
1. **Primera**: Vista principal del producto
2. **Segunda**: Vista lateral/detalle
3. **Tercera**: Producto en uso
4. **Resto**: Detalles adicionales

### **SEO**
- Las URLs de las imágenes son limpias
- Se sirven con cache headers
- Compatible con lazy loading

---

## 📊 **Comparación: URLs vs Archivos Subidos**

| Aspecto | URLs Externas | Archivos Subidos |
|---------|--------------|------------------|
| **Control** | Depende de terceros | ✅ Total control |
| **Velocidad** | Variable | ✅ Rápido (servidor propio) |
| **Privacidad** | ❌ Público | ✅ En tu servidor |
| **Confiabilidad** | Puede fallar | ✅ Siempre disponible |
| **Gestión** | Manual | ✅ Interface gráfica |

---

## ✅ **Checklist de Verificación**

Antes de publicar un producto, asegúrate de:

- [ ] Mínimo 3 imágenes de calidad
- [ ] Primera imagen muestra el producto completo
- [ ] Imágenes bien iluminadas y enfocadas
- [ ] Sin marcas de agua de terceros
- [ ] Peso optimizado (< 1MB cada una)
- [ ] Formato adecuado (JPG/PNG)
- [ ] Orden lógico de las imágenes

---

## 🔐 **Seguridad**

El sistema incluye:
- ✅ Autenticación requerida (solo admins)
- ✅ Validación de tipo de archivo
- ✅ Límite de tamaño (5MB)
- ✅ Nombres de archivo únicos
- ✅ Sanitización de nombres
- ✅ Protección contra ataques

---

_Última actualización: 18/11/2025 19:20_
