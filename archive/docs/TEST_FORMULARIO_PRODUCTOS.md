# 🔧 TEST Y FIX DEL FORMULARIO DE PRODUCTOS

## ✅ **VERIFICACIONES REALIZADAS:**

### 1. Prisma puede actualizar `realStock` ✅
```
Test ejecutado: update directo funciona
Stock y realStock se actualizan correctamente
```

### 2. El tipo del servicio incluye `realStock` ✅
```typescript
// En product.service.ts línea 430
realStock: number,  // ✅ Presente
```

### 3. El formData inicial incluye `realStock` ✅
```typescript
// ProductsManager.tsx línea 47
realStock: 1,  // ✅ Presente
```

### 4. El input actualiza `realStock` ✅
```typescript
// Línea 581
value={formData.realStock}
onChange={(e) => setFormData({
  ...formData, 
  realStock: Number(e.target.value),
  stock: Number(e.target.value)
})}
```

---

## 🐛 **POSIBLES CAUSAS DEL BUG:**

### **Hipótesis 1: El valor no se actualiza en el estado**
- El onChange no se ejecuta
- El Number() devuelve NaN
- El spread operator no actualiza correctamente

### **Hipótesis 2: El valor se pierde al enviar**
- El api.put elimina campos undefined
- Hay algún middleware que filtra el campo
- El spread de productData no incluye realStock

### **Hipótesis 3: El backend no lo guarda**
- ❌ DESCARTADO - Test directo funciona

---

## 🔍 **DEBUGGING NECESARIO:**

### **Test 1: Verificar que onChange funciona**
Añadir en el input:
```typescript
onChange={(e) => {
  const newValue = Number(e.target.value);
  console.log('🔄 Cambiando realStock:', {
    oldValue: formData.realStock,
    newValue: newValue,
    isNaN: isNaN(newValue),
  });
  setFormData({
    ...formData, 
    realStock: newValue,
    stock: newValue
  });
}}
```

### **Test 2: Verificar que handleUpdate lo incluye**
Ya está añadido el log:
```typescript
console.log('📤 Enviando actualización:', {
  stock: productData.stock,
  realStock: productData.realStock,
});
```

### **Test 3: Verificar que llega al backend**
Ya está añadido el log en product.service.ts:
```typescript
logger.info(`📦 Updating product:`, {
  stock: data.stock,
  realStock: data.realStock,
});
```

---

## 🛠️ **FIX PROPUESTO:**

El problema puede ser que cuando se hace el spread `{...formData}`, si `formData.realStock` es `undefined` o no se ha actualizado, se pierde.

### **Solución: Asegurar que realStock siempre se envía**

En `handleUpdate`:
```typescript
const productData = {
  ...formData,
  pricePerWeekend: formData.pricePerDay * 1.5,
  pricePerWeek: formData.pricePerDay * 5,
  // Asegurar que realStock y stock siempre se envían
  stock: formData.stock || formData.realStock || 0,
  realStock: formData.realStock || formData.stock || 0,
};
```

---

## 🎯 **PRÓXIMOS PASOS:**

1. Añadir el console.log en el onChange del input
2. Editar un producto y cambiar el stock
3. Verificar los 3 logs:
   - 🔄 En el input (onChange)
   - 📤 En handleUpdate (antes de enviar)
   - 📦 En el backend (al recibir)

4. Identificar dónde se pierde el valor
5. Aplicar el fix correspondiente

---

## 💡 **TEORÍA MÁS PROBABLE:**

El input está bien, el problema es que cuando cargas un producto para editar:

```typescript
realStock: product.realStock || 1,  // Si product.realStock es null/undefined → 1
```

Y luego cuando guardas, envías `realStock: 1` aunque hayas cambiado el input a 10.

**Posible causa:** El onChange del input no está actualizando el estado correctamente, o hay un conflicto con React que no re-renderiza.

**Fix:** Usar un `console.log` dentro del onChange para verificar que se ejecuta y actualiza.
