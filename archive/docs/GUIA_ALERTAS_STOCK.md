# 📖 GUÍA DE ALERTAS DE STOCK

_Cómo funcionan y cómo actualizar_

---

## 🎯 **CÓMO FUNCIONAN LAS ALERTAS**

Las alertas se calculan **EN TIEMPO REAL** cada vez que:
- Cargas la página de alertas
- Haces click en "Actualizar"

### **Cálculo:**
```
Para cada pedido activo:
  Si es pack:
    → Suma la demanda de cada componente
  Si es producto individual:
    → Suma la demanda del producto

Si Demanda Total > Stock Actual:
  → Genera alerta ⚠️
```

---

## ✅ **CÓMO ELIMINAR UNA ALERTA**

### **Opción 1: Aumentar el Stock**

1. Ve a **Admin → Productos**
2. Encuentra el producto con alerta
3. Edita el producto
4. **Aumenta el campo `Stock Real`** hasta que sea ≥ demanda
5. Guarda cambios
6. Ve a **Admin → Alertas de Stock**
7. Click en **"Actualizar"** 🔄
8. ✅ La alerta debe desaparecer

**Ejemplo:**
```
Producto: Shure 58
Demanda total: 9 unidades
Stock actual: 0 unidades
Alerta: Falta 9 ⚠️

Solución:
→ Editar producto
→ Stock Real: 10
→ Guardar
→ Actualizar alertas
→ Alerta desaparece ✅
```

### **Opción 2: Cancelar Pedidos**

1. Ve a **Admin → Pedidos**
2. Encuentra los pedidos que generan la alerta
3. Cancela los pedidos que no sean necesarios
4. Ve a **Admin → Alertas de Stock**
5. Click en **"Actualizar"** 🔄
6. ✅ La alerta se reduce o desaparece

---

## 🔍 **VERIFICAR SI EL STOCK SE ACTUALIZÓ**

### **Método 1: En la Base de Datos**
```sql
-- Buscar el producto
SELECT id, name, sku, stock, realStock 
FROM Product 
WHERE name LIKE '%Shure 58%';

-- Ver si cambió
```

### **Método 2: Test Manual**
```bash
cd packages/backend
npx ts-node src/test-stock-alerts.ts
```

Esto te mostrará:
- Stock actual de cada producto
- Demanda total
- Si hay déficit

---

## 🚨 **PROBLEMAS COMUNES**

### **1. "Actualicé el stock pero sigue la alerta"**

**Posibles causas:**
- ❌ No guardaste los cambios en el producto
- ❌ Editaste el campo `Stock` en vez de `Stock Real`
- ❌ No actualizaste la página de alertas

**Solución:**
```
1. Verifica en Admin → Productos que el stock sea correcto
2. Asegúrate que el campo "Stock Real" tenga el valor correcto
3. Ve a Alertas de Stock
4. Click en "Actualizar" 🔄
5. Espera 2-3 segundos
6. La alerta debe desaparecer
```

### **2. "El campo Stock Real no se guarda"**

**Verificar:**
- El backend tiene el campo `realStock` en el modelo
- El frontend envía `realStock` al actualizar
- No hay errores en consola

**Test:**
```bash
# En backend
cd packages/backend
npm run dev

# Buscar en logs si hay errores al guardar
```

### **3. "Las alertas no se actualizan automáticamente"**

**Esto es normal:**
- Las alertas NO se actualizan automáticamente
- Debes hacer click en "Actualizar" 🔄
- O refrescar la página (F5)

---

## 📊 **EJEMPLO COMPLETO**

### **Situación Inicial:**
```
Producto: Set Micrófonos Inalámbricos Dual
Stock Real: 1
Demanda: 10 (3 pedidos)
Alerta: ⚠️ Falta 9 unidades (ALTA)
```

### **Paso a Paso:**

**1. Ver la alerta:**
```
Admin → Alertas de Stock
→ "Set Micrófonos... Falta 9 unidades"
```

**2. Aumentar stock:**
```
Admin → Productos
→ Buscar: "Set Micrófonos"
→ Click "Editar"
→ Stock Real: 1 → 15 (cambiar)
→ Click "Guardar Cambios"
→ ✅ "Producto actualizado correctamente"
```

**3. Verificar cambio:**
```
Productos → Ver "Set Micrófonos"
→ Verificar que muestra "Stock: 15"
```

**4. Actualizar alertas:**
```
Admin → Alertas de Stock
→ Click "Actualizar" 🔄
→ Esperar 2-3 segundos
→ ✅ Alerta desaparece
```

### **Resultado:**
```
Total Alertas: 4 → 3
"Set Micrófonos..." ya no aparece ✅

Stock Real: 15
Demanda: 10
Sobran: 5 unidades ✅
```

---

## 🔄 **BOTÓN "ACTUALIZAR"**

### **Qué hace:**
```javascript
onClick={() => {
  setLoading(true);        // Muestra spinner
  fetchAlerts();           // Llama al backend
                          // Recalcula alertas
  setAlerts(newAlerts);   // Actualiza la UI
  setLoading(false);      // Oculta spinner
}}
```

### **Cuándo usarlo:**
- ✅ Después de cambiar stock de un producto
- ✅ Después de cancelar un pedido
- ✅ Después de modificar un pedido
- ✅ Para ver el estado actual sin refrescar toda la página

---

## 💡 **TIPS**

### **1. Priorizar Alertas**
```
🔴 Alta: Déficit > 5 unidades
  → Acción inmediata
  → Comprar ya

🟡 Media: Déficit 3-5 unidades
  → Planificar compra
  → Verificar pedidos

🔵 Baja: Déficit 1-2 unidades
  → Monitorear
  → Puede esperar
```

### **2. Pedidos Afectados**
```
La alerta muestra todos los pedidos que necesitan el producto
→ Prioriza por fecha
→ Contacta al cliente si es necesario
```

### **3. Stock Real vs Stock**
```
Stock Real: Stock físico real en almacén ✅
Stock: Campo legacy (usar solo si no hay realStock)

Usa siempre "Stock Real" para mayor precisión
```

---

## 🧪 **TESTING**

### **Test 1: Crear Alerta**
```
1. Crear pedido con cantidad > stock
2. Ir a Alertas de Stock
3. ✅ Debe aparecer alerta
```

### **Test 2: Resolver Alerta**
```
1. Ver alerta existente
2. Aumentar stock del producto
3. Click "Actualizar"
4. ✅ Alerta desaparece
```

### **Test 3: Múltiples Pedidos**
```
1. Crear 3 pedidos del mismo producto
2. Ir a Alertas
3. ✅ Debe mostrar la suma total
4. ✅ Debe listar los 3 pedidos afectados
```

---

## 📋 **CHECKLIST**

Cuando una alerta no se elimina:

```
✅ Abrí el producto correcto
✅ Edité el campo "Stock Real" (no "Stock")
✅ Guardé los cambios correctamente
✅ No hubo errores al guardar
✅ Actualicé la página de alertas
✅ Esperé a que cargue (spinner)
✅ Verifiqué que el stock se guardó en la BD
```

---

## 🎯 **FLUJO COMPLETO**

```
1. Cliente hace pedido
   ↓
2. Sistema verifica stock
   ↓
3. Pedido se crea (puede quedar pendiente)
   ↓
4. Admin revisa Alertas de Stock
   ↓
5. Ve productos con déficit
   ↓
6. Opción A: Aumenta stock
   Opción B: Cancela/modifica pedido
   ↓
7. Click "Actualizar"
   ↓
8. Alerta desaparece ✅
```

---

## ❓ **FAQ**

**P: ¿Con qué frecuencia debo revisar las alertas?**
R: Diariamente, especialmente si tienes pedidos próximos.

**P: ¿Las alertas envían emails?**
R: No automáticamente. Puedes implementar notificaciones.

**P: ¿Puedo exportar las alertas?**
R: Sí, puedes añadir un botón de exportar a Excel/PDF.

**P: ¿Las alertas consideran packs?**
R: Sí, si pides un pack, cuenta el stock de cada componente.

**P: ¿Qué pasa si hay stock 0?**
R: Genera alerta por la cantidad total demandada.

---

_Última actualización: 20/11/2025_
