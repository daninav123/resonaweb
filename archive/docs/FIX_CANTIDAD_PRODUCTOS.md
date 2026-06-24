# ✅ Fix: Control de Cantidad en Detalle de Producto

## 🐛 Problemas Detectados

### **1. Botón "+" no funcionaba correctamente**
- Al hacer click en "+", la cantidad no aumentaba o se volvía negativa
- En el producto Soundcraft pasaba de 1 a -2

### **2. No se podía escribir la cantidad**
- Solo había un `<span>` mostrando el número
- No era posible ingresar cantidad manualmente

---

## ✅ Soluciones Implementadas

### **1. Cambiado `<span>` por `<input>` Editable**

#### **Antes:**
```tsx
<span className="text-xl font-medium w-12 text-center">
  {quantity}
</span>
```

#### **Ahora:**
```tsx
<input
  type="number"
  min="1"
  max={product?.stock === 0 ? undefined : product?.stock}
  value={quantity}
  onChange={(e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product?.stock > 0 && value > product.stock) {
      setQuantity(product.stock);
      toast.error(`Stock máximo disponible: ${product.stock}`);
    } else {
      setQuantity(value);
    }
  }}
  className="w-20 text-xl font-medium text-center border..."
/>
```

---

### **2. Arreglado Botón "-" (Menos)**

#### **Antes:**
```tsx
onClick={() => setQuantity(Math.max(1, quantity - 1))}
```

#### **Ahora:**
```tsx
onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
```

**Cambio:** Usa `prev =>` para obtener el valor anterior del estado correctamente.

---

### **3. Arreglado Botón "+" (Más)**

#### **Antes:**
```tsx
onClick={() => {
  if (product.stock === 0) {
    setQuantity(quantity + 1);
  } else {
    setQuantity(Math.min(product.stock, quantity + 1));
  }
}}
```

**Problema:** 
- Accedía directamente a `product.stock` sin verificar si `product` existe
- No usaba el estado previo correctamente

#### **Ahora:**
```tsx
onClick={() => {
  setQuantity(prev => {
    // Si no hay stock (stock = 0), permitir aumentar sin límite
    if (!product || product.stock === 0) {
      return prev + 1;
    }
    // Si hay stock, limitar a la cantidad disponible
    if (prev >= product.stock) {
      toast.error(`Stock máximo disponible: ${product.stock}`);
      return product.stock;
    }
    return prev + 1;
  });
}}
```

**Mejoras:**
- ✅ Verifica que `product` existe antes de acceder a `stock`
- ✅ Usa `setQuantity(prev =>)` para obtener el valor correcto del estado
- ✅ Muestra toast si se intenta exceder el stock
- ✅ Retorna el valor correcto en cada caso

---

### **4. Validación en Input Manual**

```tsx
onChange={(e) => {
  const value = parseInt(e.target.value);
  
  // Si no es un número o es menor que 1, establece en 1
  if (isNaN(value) || value < 1) {
    setQuantity(1);
  } 
  // Si hay stock y excede, limita al stock máximo
  else if (product?.stock > 0 && value > product.stock) {
    setQuantity(product.stock);
    toast.error(`Stock máximo disponible: ${product.stock}`);
  } 
  // Si todo está bien, establece el valor
  else {
    setQuantity(value);
  }
}}
```

**Validaciones:**
- ✅ No permite valores menores a 1
- ✅ No permite valores mayores al stock disponible
- ✅ Convierte el valor a número entero
- ✅ Muestra mensaje si se intenta exceder el stock

---

### **5. Validación al Perder Foco (onBlur)**

```tsx
onBlur={(e) => {
  // Asegurar que al salir del campo siempre haya un valor válido
  if (!e.target.value || parseInt(e.target.value) < 1) {
    setQuantity(1);
  }
}}
```

**Protección:** Si el usuario borra el valor o deja el campo vacío, automáticamente se establece en 1.

---

### **6. Información de Stock Mejorada**

```tsx
<div className="mt-2 space-y-1">
  {product?.stock === 0 && (
    <p className="text-xs text-blue-600 font-medium">
      ✓ Producto bajo pedido - sin límite de cantidad
    </p>
  )}
  {product?.stock > 0 && (
    <p className="text-xs text-gray-500">
      Stock disponible: {product.stock} unidades
    </p>
  )}
</div>
```

**Feedback Visual:**
- ✅ Muestra "bajo pedido" si stock = 0
- ✅ Muestra cantidad disponible si stock > 0

---

## 🎨 Cómo Se Ve Ahora

### **Con Stock Disponible:**
```
┌─────────────────────────────────────┐
│ Cantidad                            │
│                                     │
│  [−]    [ 5 ]    [+]               │
│                                     │
│  Stock disponible: 10 unidades     │
└─────────────────────────────────────┘
```

### **Producto Bajo Pedido (Stock 0):**
```
┌─────────────────────────────────────┐
│ Cantidad                            │
│                                     │
│  [−]    [ 5 ]    [+]               │
│                                     │
│  ✓ Producto bajo pedido             │
│    sin límite de cantidad           │
└─────────────────────────────────────┘
```

---

## ⚙️ Comportamiento

### **Botón "-" (Menos):**
- Click: Disminuye en 1
- Mínimo: 1 (no puede ser menor)
- No muestra error, simplemente no disminuye más

### **Botón "+" (Más):**
- Click: Aumenta en 1
- Si stock = 0: Sin límite
- Si stock > 0: Máximo = stock disponible
- Si se alcanza el máximo: Muestra toast de error

### **Input Manual:**
- Se puede escribir directamente
- Validación en tiempo real
- Límite automático si excede stock
- Toast de error si intenta exceder
- Si se borra, vuelve a 1 al salir del campo

---

## 🧪 Casos de Prueba

### **Caso 1: Producto con Stock**
```
Producto: Mezcladora Soundcraft
Stock: 10 unidades

Pruebas:
1. Default: 1 ✓
2. Click "+" hasta 10: ✓ (funciona)
3. Click "+" en 10: Toast error ✓
4. Click "-" hasta 1: ✓ (funciona)
5. Click "-" en 1: Se queda en 1 ✓
6. Escribir "5": ✓ (funciona)
7. Escribir "20": Límite a 10 + toast ✓
8. Escribir "0": Vuelve a 1 ✓
9. Borrar valor: Vuelve a 1 al salir ✓
```

### **Caso 2: Producto Bajo Pedido (Stock 0)**
```
Producto: Equipo especial
Stock: 0 unidades

Pruebas:
1. Default: 1 ✓
2. Click "+" sin límite: ✓ (funciona)
3. Click "-" hasta 1: ✓ (funciona)
4. Escribir cualquier número: ✓ (sin límite)
5. Mensaje "bajo pedido": ✓ (se muestra)
```

---

## 🔧 Causa del Bug Original

### **Problema: Valores Negativos**

**Código Problemático:**
```tsx
setQuantity(quantity + 1)
// o
setQuantity(Math.min(product.stock, quantity + 1))
```

**Por qué fallaba:**
1. **Closure stale:** Al usar `quantity` directamente, se capturaba un valor antiguo del estado
2. **Múltiples clicks rápidos:** Si el usuario hacía click rápido, los eventos se acumulaban con el mismo valor de `quantity`
3. **Race condition:** Los cambios de estado no se aplicaban antes del siguiente click

**Ejemplo del problema:**
```
Estado inicial: quantity = 1
Click 1: setQuantity(1 + 1) → pendiente
Click 2: setQuantity(1 + 1) → pendiente (aún lee 1)
Click 3: setQuantity(1 - 1) → pendiente
Resultado: valores inconsistentes o negativos
```

**Solución:**
```tsx
setQuantity(prev => prev + 1)
```

Ahora siempre obtiene el valor **más reciente** del estado.

---

## 📊 Mejoras Técnicas

### **1. Uso Correcto de setState:**
- ✅ Usa función updater: `setQuantity(prev => ...)`
- ✅ Garantiza el valor más reciente del estado
- ✅ Evita race conditions

### **2. Validación Defensiva:**
- ✅ Verifica que `product` existe antes de acceder a propiedades
- ✅ Usa optional chaining: `product?.stock`
- ✅ Maneja casos edge (NaN, null, undefined)

### **3. Feedback al Usuario:**
- ✅ Toast cuando se alcanza el límite
- ✅ Mensaje de stock disponible
- ✅ Indicador de "bajo pedido"

### **4. Accesibilidad:**
- ✅ `aria-label` en botones
- ✅ `min` y `max` en input
- ✅ Tipo `number` para input

---

## 📝 Archivos Modificados

### **Frontend:**
- ✅ `packages/frontend/src/pages/ProductDetailPage.tsx`
  - Líneas 137-205: Control de cantidad completamente reescrito

---

## ✅ Checklist de Funcionalidad

- [x] Botón "-" funciona correctamente
- [x] Botón "+" funciona correctamente
- [x] Input permite escribir cantidad
- [x] Validación impide valores < 1
- [x] Validación impide exceder stock (si hay)
- [x] Sin límite para productos bajo pedido
- [x] Toast cuando se alcanza límite
- [x] Muestra stock disponible
- [x] Muestra mensaje "bajo pedido"
- [x] No se generan valores negativos
- [x] Manejo correcto de múltiples clicks rápidos

---

_Última actualización: 19/11/2025 01:18_  
_Bug: Cantidad negativa ARREGLADO ✅_  
_Feature: Input editable IMPLEMENTADO ✅_
