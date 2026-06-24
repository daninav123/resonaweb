# 🔧 Fix: Inconsistencia entre Validación de Carrito y Checkout

## 🐛 Problema Detectado

### **Síntoma:**
```
✅ Carrito dice: "TODOS LOS PRODUCTOS DISPONIBLES"
❌ Checkout dice: "Stock insuficiente"
```

### **Escenario:**
- Producto: Mezcladora Soundcraft
- Cantidad: 3 unidades
- Stock real: 1 unidad
- Fechas: 26-27/12/2025 (+37 días desde hoy)

### **Logs:**
```
// En carrito (check-availability):
📦 Validando: Mezcladora Soundcraft
   Cantidad: 3
   📊 Disponibilidad: ✅ SÍ      ← OK porque +37 días

// En checkout (validateCart):
❌ Stock insuficiente para Mezcladora Soundcraft
   Disponible: 1, solicitado: 3  ← ERROR sin considerar días
```

---

## 🔍 Causa Raíz

### **Dos lógicas diferentes:**

#### **1. Endpoint `/products/check-availability`** ✅ CORRECTO
```typescript
if (daysUntilEvent > 30) {
  return { available: true };  // Tiempo para conseguir stock
} else {
  // Verificar stock real disponible
}
```

#### **2. Validación en Checkout** ❌ INCORRECTO
```typescript
if (product.stock < item.quantity) {
  errors.push('Stock insuficiente');  // NO considera días
}
```

**La validación del checkout NO verificaba los 30 días de antelación.**

---

## ✅ Solución Implementada

### **Unificar la Lógica**

He actualizado `cart.service.ts` para usar **la misma lógica** que el endpoint de validación:

```typescript
// Nueva lógica unificada en cart.service.ts

if (daysUntilStart > 30) {
  // Con más de 30 días: SIEMPRE disponible
  console.log(`✅ ${product.name}: Bajo pedido permitido`);
} else {
  // Con menos de 30 días: Verificar stock REAL
  const overlappingItems = await prisma.orderItem.findMany({
    where: {
      productId: product.id,
      order: {
        status: 'CONFIRMED',
        startDate: { lte: endDate },
        endDate: { gte: startDate }
      }
    }
  });

  const reservedStock = overlappingItems.reduce(...);
  const availableStock = currentStock - reservedStock;

  if (availableStock < item.quantity) {
    errors.push('Stock insuficiente');
  }
}
```

---

## 🎯 Comportamiento Correcto Ahora

### **Escenario 1: Reserva con +30 días**
```
Fecha: 26/12/2025 (+37 días)
Stock actual: 1
Cantidad solicitada: 3

✅ Carrito: "Disponible" (bajo pedido)
✅ Checkout: "OK" (bajo pedido)
✅ Orden creada exitosamente
```

### **Escenario 2: Reserva con <30 días**
```
Fecha: 25/11/2025 (+6 días)
Stock actual: 1
Cantidad solicitada: 3

❌ Carrito: "No disponible"
❌ Checkout: "Stock insuficiente"
🚫 No puede continuar
```

---

## 📊 Lógica de Validación Unificada

```
┌─────────────────────────────────────┐
│ Usuario selecciona fechas           │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Calcular días hasta evento          │
│ daysUntilStart = (start - today)    │
└────────────────┬────────────────────┘
                 │
                 ▼
         ¿> 30 días?
        /           \
      SÍ             NO
       │              │
       ▼              ▼
┌─────────────┐  ┌──────────────────┐
│ ✅ SIEMPRE  │  │ Verificar stock  │
│ DISPONIBLE  │  │ real disponible  │
│ (bajo       │  │                  │
│ pedido)     │  │ Stock - Reservas │
└─────────────┘  └────────┬─────────┘
                          │
                          ▼
                  ¿Stock suficiente?
                    /          \
                  SÍ            NO
                   │             │
                   ▼             ▼
            ✅ Disponible   ❌ No disponible
```

---

## 🔄 Endpoints Sincronizados

### **1. Validación en Carrito**
```
POST /api/v1/products/check-availability
→ Usa lógica de 30 días ✅
```

### **2. Validación en Checkout**
```
POST /api/v1/orders (validateCartAvailability)
→ Usa lógica de 30 días ✅
```

**Ahora ambos están SINCRONIZADOS** 🎯

---

## 🧪 Testing

### **Test Case 1: Fechas Lejanas**
```bash
# Producto con stock = 1
# Solicitar cantidad = 3
# Fechas: +37 días

Resultado esperado:
✅ Carrito: Disponible
✅ Checkout: OK
✅ Orden creada
```

### **Test Case 2: Fechas Cercanas**
```bash
# Producto con stock = 1
# Solicitar cantidad = 3
# Fechas: +5 días

Resultado esperado:
❌ Carrito: No disponible
❌ Checkout: Error
🚫 Orden bloqueada
```

---

## 📝 Archivos Modificados

### **Backend:**
- ✅ `packages/backend/src/services/cart.service.ts`
  - Líneas 336-363
  - Añadida lógica de 30 días
  - Verificación de reservas solapadas

### **Ya existían (correctos):**
- ✅ `packages/backend/src/controllers/product.controller.ts`
  - Método `checkAvailability` (líneas 294-370)

---

## 🎯 Beneficios

### **Consistencia:**
- ✅ Misma lógica en carrito y checkout
- ✅ No más sorpresas en checkout
- ✅ Experiencia predecible

### **Funcionalidad:**
- ✅ Reservas "bajo pedido" funcionan
- ✅ Validación de stock real para fechas cercanas
- ✅ Considera reservas existentes

### **Usuario:**
- ✅ Si el carrito dice OK → checkout dice OK
- ✅ Mensajes consistentes
- ✅ Sin errores inesperados

---

## 🚀 Verificación

### **Pasos para probar:**

1. **Añadir producto al carrito** (con stock limitado)
2. **Seleccionar fechas > 30 días**
3. **Click "Aplicar fechas"**
4. **Verificar:** ✅ "Disponible"
5. **Proceder al checkout**
6. **Verificar:** ✅ Orden se crea exitosamente

### **Logs esperados en backend:**
```
✅ Mezcladora Soundcraft: Reserva con 37 días de 
   antelación - bajo pedido permitido
```

---

## 📈 Impacto

### **Antes:**
- ❌ Validación inconsistente
- ❌ Errores en checkout inesperados
- ❌ Frustración del usuario

### **Ahora:**
- ✅ Validación consistente
- ✅ Comportamiento predecible
- ✅ Mejor experiencia de usuario

---

_Fix aplicado: 19/11/2025 00:30_
_Problema: Inconsistencia entre carrito y checkout_
_Solución: Unificar lógica de 30 días en ambos_
