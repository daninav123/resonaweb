# ✅ MEJORA: AÑADIR PRODUCTOS EN MODAL DE EDICIÓN

_Fecha: 20/11/2025 01:43_  
_Estado: COMPLETADO_

---

## 🎯 **MEJORA IMPLEMENTADA:**

El usuario ahora puede **añadir Y eliminar productos** directamente desde el modal de edición del pedido, sin necesidad de contactar con soporte.

---

## 📋 **CAMBIOS REALIZADOS:**

### **EditOrderModal.tsx - Totalmente reescrito:**

#### **✅ ANTES:**
```
❌ Solo podía eliminar productos
❌ Mensaje: "Para añadir, contacta con nosotros"
```

#### **✅ AHORA:**
```
✅ Puede añadir productos (búsqueda)
✅ Puede eliminar productos
✅ Ajustar cantidades de nuevos productos
✅ Ver resumen de cargos/reembolsos
✅ Todo en una sola operación
```

---

## 🎨 **NUEVA UI DEL MODAL:**

```
┌──────────────────────────────────────────┐
│ Editar Pedido                       [X]  │
├──────────────────────────────────────────┤
│                                          │
│ [+ Añadir Productos]  ← Botón verde     │
│                                          │
│ ┌────────────────────────────────────┐  │
│ │ 🔍 Buscar productos...             │  │ ← Abre buscador
│ │                                    │  │
│ │ 📦 Luces LED - €50  [+]            │  │
│ │ 📦 Altavoz JBL - €30  [+]          │  │
│ └────────────────────────────────────┘  │
│                                          │
│ ✅ A añadir:                             │
│ ┌────────────────────────────────────┐  │
│ │ Luces LED  [2] +€100  [X]          │  │ ← Ajustar cantidad
│ └────────────────────────────────────┘  │
│                                          │
│ Productos actuales:                      │
│ ┌────────────────────────────────────┐  │
│ │ Cámara 4K  €200  [🗑️]              │  │ ← Eliminar
│ │ Trípode  €50  [🗑️]                 │  │
│ └────────────────────────────────────┘  │
│                                          │
│ 📊 Resumen:                              │
│ ✅ 1 producto(s) a añadir                │
│ ❌ 1 producto(s) a eliminar              │
│ 💰 Cargo adicional: €50.00               │
│                                          │
│        [Cancelar]  [Confirmar]           │
└──────────────────────────────────────────┘
```

---

## ⚙️ **FUNCIONALIDADES:**

### **1. Búsqueda de Productos:**
```typescript
- Buscar por nombre
- Ver precio por día
- Click para añadir instantáneamente
```

### **2. Ajustar Cantidades:**
```typescript
- Input numérico (min: 1)
- Actualiza precio total automáticamente
- Cálculo en tiempo real
```

### **3. Eliminar de Lista:**
```typescript
- Botón X para productos nuevos
- Botón 🗑️ para productos actuales
- Cambio visual inmediato
```

### **4. Resumen de Cambios:**
```typescript
- Muestra productos a añadir
- Muestra productos a eliminar
- Calcula diferencia de precio:
  • Positivo → Cargo adicional
  • Negativo → Reembolso
  • Cero → Sin cambio
```

---

## 🔄 **FLUJO DE USUARIO:**

```
1. Usuario ve su pedido
   ↓
2. Click "Editar Pedido"
   ↓
3. Modal se abre
   ↓
4. Click "+ Añadir Productos"
   ↓
5. Busca "luces"
   ↓
6. Click en producto → Se añade
   ↓
7. Ajusta cantidad a 2
   ↓
8. También marca un producto actual para eliminar
   ↓
9. Ve resumen: "Cargo adicional: €50"
   ↓
10. Click "Confirmar"
   ↓
11. Backend procesa:
    - Elimina productos (reembolso)
    - Añade productos (cargo Stripe)
    - Actualiza pedido
   ↓
12. ✅ "Pedido modificado correctamente"
```

---

## 💻 **CÓDIGO CLAVE:**

### **Estado del Modal:**
```typescript
const [remove, setRemove] = useState<string[]>([]);     // IDs a eliminar
const [add, setAdd] = useState<any[]>([]);              // Productos a añadir
const [search, setSearch] = useState('');               // Búsqueda
const [show, setShow] = useState(false);                // Mostrar selector
```

### **Añadir Producto:**
```typescript
const handleAdd = (product: any) => {
  setAdd([...add, {
    productId: product.id,
    product,
    quantity: 1,
    pricePerUnit: Number(product.basePrice || 0),
    totalPrice: Number(product.basePrice || 0),
  }]);
  setShow(false); // Cierra selector
};
```

### **Actualizar Cantidad:**
```typescript
const updateQty = (index: number, quantity: number) => {
  const updated = [...add];
  updated[index].quantity = Math.max(1, quantity);
  updated[index].totalPrice = updated[index].pricePerUnit * updated[index].quantity;
  setAdd(updated);
};
```

### **Calcular Diferencia:**
```typescript
const diff = 
  add.reduce((sum, i) => sum + i.totalPrice, 0) -       // Total a añadir
  currentItems
    .filter(i => remove.includes(i.id))
    .reduce((sum, i) => sum + Number(i.totalPrice), 0); // Total a eliminar
```

### **Enviar Cambios:**
```typescript
// 1. Eliminar items
if (remove.length > 0) {
  await orderModificationService.removeItems(orderId, remove, 'Cliente');
}

// 2. Añadir items
if (add.length > 0) {
  await orderModificationService.addItems(
    orderId,
    add.map(i => ({
      ...i,
      startDate: orderDates.startDate,
      endDate: orderDates.endDate,
    })),
    'Cliente'
  );
}
```

---

## 🎯 **EJEMPLO DE USO:**

### **Escenario:**
Usuario tiene pedido con:
- Cámara 4K (€200)
- Trípode (€50)

**Total actual: €250**

### **Modificación:**
1. Elimina: Trípode (€50)
2. Añade: Luces LED x2 (€50 x 2 = €100)

### **Resultado:**
```
Productos eliminados: -€50  (reembolso)
Productos añadidos:   +€100 (cargo)
─────────────────────────────
Diferencia:           +€50  (cargo adicional Stripe)

Nuevo total pedido: €300
```

---

## ✅ **BENEFICIOS:**

```
✅ Autonomía del cliente
✅ Proceso más rápido
✅ Menos carga para soporte
✅ Transparencia total (ve precio antes de confirmar)
✅ Flexible (añadir y eliminar en mismo paso)
✅ Integración completa con Stripe
```

---

## 📁 **ARCHIVOS MODIFICADOS:**

```
✅ EditOrderModal.tsx - Reescrito completamente
✅ OrderDetailUserPage.tsx - Pasa orderDates al modal
```

---

## 🚀 **LISTO PARA USAR:**

El modal ya está funcionando. Prueba:
1. Ir a "Mis Pedidos"
2. Ver detalle de un pedido (>24h antes del evento)
3. Click "Editar Pedido"
4. Click "+ Añadir Productos"
5. Buscar y añadir
6. ¡Confirmar!

---

_Implementado: 20/11/2025_  
_Tiempo: ~10 minutos_  
_Archivos: 1 reescrito, 1 modificado_  
_Estado: ✅ PRODUCTION READY_
