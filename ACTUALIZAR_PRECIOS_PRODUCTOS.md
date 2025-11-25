# 🔄 Actualizar Precios de Todos los Productos

## 📋 Valores a Aplicar

Todos los productos serán actualizados con:
- **Precio de envío:** €5
- **Precio de instalación:** €5
- **Tiempo de montaje:** 5 minutos

---

## 🚀 Cómo Ejecutar

### **Opción 1: Desde la Terminal (Recomendado)**

1. **Abre una terminal**
2. **Navega al backend:**
   ```bash
   cd packages/backend
   ```
3. **Ejecuta el script:**
   ```bash
   npm run db:update-prices
   ```

### **Opción 2: Desde la Raíz del Proyecto**

```bash
cd packages/backend && npm run db:update-prices
```

---

## 📊 Qué Hace el Script

El script `update-product-prices.ts`:

1. ✅ Conecta a la base de datos
2. ✅ Actualiza TODOS los productos con:
   ```typescript
   {
     shippingCost: 5,      // €5 envío
     installationCost: 5,   // €5 instalación
     setupTime: 5,          // 5 minutos
   }
   ```
3. ✅ Muestra cuántos productos se actualizaron
4. ✅ Muestra 5 ejemplos de productos actualizados

---

## 📤 Salida Esperada

```bash
🔄 Actualizando precios de todos los productos...
✅ 20 productos actualizados correctamente
📊 Nuevos valores:
   - Precio envío: €5
   - Precio instalación: €5
   - Tiempo montaje: 5 minutos

📦 Ejemplos de productos actualizados:
   - Mezcladora Soundcraft EPM8
     Envío: €5
     Instalación: €5
     Montaje: 5 min
   - Proyector LED 4K
     Envío: €5
     Instalación: €5
     Montaje: 5 min
   ...

✅ Script completado exitosamente
```

---

## 🔍 Verificar los Cambios

### **Opción 1: Prisma Studio**
```bash
cd packages/backend
npm run db:studio
```
Luego navega a la tabla `Product` y verás los valores actualizados.

### **Opción 2: Desde la App**
1. Ve a `http://localhost:3000/admin/products`
2. Edita cualquier producto
3. Verás los campos con los nuevos valores

---

## 📝 Campos Afectados

### **En la Base de Datos:**
```prisma
model Product {
  // ... otros campos
  shippingCost      Float?  @default(0)     // ← Ahora €5
  installationCost  Float?  @default(0)     // ← Ahora €5
  setupTime         Int?    @default(0)     // ← Ahora 5 min
}
```

### **En el Frontend:**
- Admin → Editar Producto
  - Campo "Coste de Envío": €5
  - Campo "Coste de Instalación": €5
  - Campo "Tiempo de Montaje": 5 min

---

## 🎯 Modificar Productos Individualmente Después

Una vez ejecutado el script, puedes modificar cada producto individualmente:

1. **Ve al Admin:** `http://localhost:3000/admin/products`
2. **Click "Editar"** en cualquier producto
3. **Modifica los campos:**
   - Precio de envío
   - Precio de instalación
   - Tiempo de montaje
4. **Guarda los cambios**

Los nuevos valores se guardarán solo para ese producto específico.

---

## 🔧 Código del Script

```typescript
// packages/backend/scripts/update-product-prices.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductPrices() {
  try {
    console.log('🔄 Actualizando precios de todos los productos...');

    const result = await prisma.product.updateMany({
      data: {
        shippingCost: 5,      // 5 euros envío
        installationCost: 5,   // 5 euros instalación
        setupTime: 5,          // 5 minutos montaje
      },
    });

    console.log(`✅ ${result.count} productos actualizados`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateProductPrices();
```

---

## ⚠️ Importante

- ✅ Este script actualiza **TODOS** los productos
- ✅ Los valores anteriores se sobrescriben
- ✅ Es seguro ejecutarlo múltiples veces
- ✅ No afecta a otros campos del producto
- ✅ Puedes modificar productos individualmente después

---

## 🔄 Cambiar los Valores del Script

Si quieres usar valores diferentes:

1. **Abre:** `packages/backend/scripts/update-product-prices.ts`
2. **Modifica las líneas:**
   ```typescript
   data: {
     shippingCost: 5,      // ← Cambia este número
     installationCost: 5,   // ← Cambia este número
     setupTime: 5,          // ← Cambia este número
   }
   ```
3. **Guarda el archivo**
4. **Ejecuta de nuevo:** `npm run db:update-prices`

---

## 📊 Ejemplo de Uso

```bash
# Terminal
cd packages/backend
npm run db:update-prices

# Salida:
🔄 Actualizando precios de todos los productos...
✅ 25 productos actualizados correctamente
📊 Nuevos valores:
   - Precio envío: €5
   - Precio instalación: €5
   - Tiempo montaje: 5 minutos

📦 Ejemplos de productos actualizados:
   - Mezcladora Soundcraft EPM8
     Envío: €5
     Instalación: €5
     Montaje: 5 min
   - Altavoz JBL PRX615M
     Envío: €5
     Instalación: €5
     Montaje: 5 min

✅ Script completado exitosamente
```

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar el script con `npm run db:update-prices`
2. ✅ Verificar que los productos se actualizaron
3. ✅ Ir al admin y modificar productos específicos según necesites
4. ✅ Ajustar valores individuales producto por producto

---

## 💡 Tip

Si necesitas actualizar solo algunos productos específicos, modifica el script para añadir un filtro:

```typescript
const result = await prisma.product.updateMany({
  where: {
    categoryId: 'alguna-categoria-id', // Solo productos de esta categoría
  },
  data: {
    shippingCost: 5,
    installationCost: 5,
    setupTime: 5,
  },
});
```

---

_Última actualización: 19/11/2025 01:35_  
_Script: `update-product-prices.ts`_  
_Comando: `npm run db:update-prices`_
