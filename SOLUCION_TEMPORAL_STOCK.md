# 🔧 SOLUCIÓN TEMPORAL PARA ACTUALIZAR STOCK

---

## ✅ **LA ALERTA YA ESTÁ ELIMINADA**

He actualizado el stock de "Set Micrófonos Inalámbricos Dual" a 15 unidades.

**Resultado:**
- ✅ Alerta eliminada
- ✅ Quedan 3 alertas en vez de 4
- ✅ Stock suficiente para todos los pedidos

---

## 🛠️ **SOLUCIÓN TEMPORAL: Script para actualizar stock**

Mientras se soluciona el formulario de la UI, puedes usar este script:

### **Actualizar stock de cualquier producto:**

```bash
cd packages/backend

# Crear archivo temporal
code update-stock.ts
```

**Contenido del archivo `update-stock.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function updateStock() {
  const productName = 'NOMBRE_DEL_PRODUCTO';  // ← Cambiar aquí
  const newStock = 10;  // ← Cambiar aquí

  const product = await prisma.product.findFirst({
    where: { name: { contains: productName } }
  });

  if (!product) {
    console.log('❌ Producto no encontrado');
    return;
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { realStock: newStock, stock: newStock }
  });

  console.log(`✅ ${product.name}`);
  console.log(`   Stock actualizado: ${updated.realStock}`);
  await prisma.$disconnect();
}

updateStock();
```

**Ejecutar:**
```bash
npx ts-node update-stock.ts
```

---

## 📋 **SOLUCIÓN PERMANENTE (EN PROGRESO)**

El problema está en el formulario de edición de productos. El código parece correcto pero el valor no se está enviando al backend.

**Lo que necesitamos verificar:**
1. ¿El `formData.realStock` se actualiza cuando cambias el input?
2. ¿Se envía correctamente al backend?
3. ¿El backend lo recibe y lo guarda?

**Próximos pasos:**
- Añadir más logs en el onChange del input
- Verificar que el valor se actualice en el estado
- Confirmar que se envíe en la petición PUT

---

## 🎯 **MIENTRAS TANTO:**

### **Opción 1: Usar el script**
```bash
cd packages/backend
# Editar fix-realstock.ts con el producto y cantidad
npx ts-node src/fix-realstock.ts
```

### **Opción 2: Actualizar desde la BD directamente**
```sql
UPDATE Product 
SET realStock = 15, stock = 15 
WHERE name LIKE '%Set Micrófonos%';
```

### **Opción 3: Esperar el fix del formulario**
Estoy investigando por qué el formulario no guarda el `realStock` correctamente.

---

## ✅ **RESUMEN DE ALERTAS ACTUALES:**

```
⚠️ Shure 58 (ALTA)
   Falta: 9 unidades
   
⚠️ Producto Test Sin Stock (MEDIA)  
   Falta: 5 unidades
   
⚠️ Mezcladora Soundcraft EPM8 (BAJA)
   Falta: 2 unidades

✅ Set Micrófonos Inalámbricos Dual
   RESUELTO - Stock suficiente
```

---

**¿Quieres que actualice el stock de otro producto con el script?** 
Dime el nombre del producto y la cantidad deseada.
