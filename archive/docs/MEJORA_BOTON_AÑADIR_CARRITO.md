# ✅ MEJORA: BOTÓN "AÑADIR AL CARRITO" EN MODAL DE EDICIÓN

_Fecha: 20/11/2025 02:00_  
_Estado: COMPLETADO_

---

## 🎯 **NUEVA FUNCIONALIDAD:**

Ahora cuando el usuario busca productos en el modal de edición de pedido, puede elegir entre:

1. **"A pedido"** → Modifica el pedido actual (cargo/reembolso)
2. **"Al carrito"** → Añade al carrito para crear un nuevo pedido

---

## 📋 **CAMBIO IMPLEMENTADO:**

### **ANTES:**
```
┌────────────────────────────┐
│ 🔍 Buscar productos...     │
│                            │
│ 📦 Luces LED - €50  [+]   │ ← Solo un botón (modificar pedido)
└────────────────────────────┘
```

### **AHORA:**
```
┌─────────────────────────────────────────┐
│ 🔍 Buscar productos...                  │
│                                         │
│ 💡 A pedido: Modifica | Al carrito: Nuevo│ ← Info
│                                         │
│ 📦 Luces LED - €50                      │
│    [+ A pedido]  [🛒 Al carrito]       │ ← Dos opciones
└─────────────────────────────────────────┘
```

---

## ⚙️ **FUNCIONALIDADES:**

### **1. Botón "A pedido" (verde):**
```typescript
- Añade al pedido actual
- Genera cargo adicional si suma precio
- Modifica el pedido existente
```

### **2. Botón "Al carrito" (azul):**
```typescript
- Añade al carrito (localStorage)
- Muestra confirmación "¿Ir al carrito?"
- Permite crear un nuevo pedido separado
```

---

## 🔄 **FLUJO DE USUARIO:**

### **Escenario 1: Modificar Pedido Actual**
```
1. Ver detalle del pedido
2. Click "Editar Pedido"
3. Click "+ Añadir Productos"
4. Buscar "luces"
5. Click "A pedido" → Se añade a este pedido
6. Confirmar → Cargo adicional procesado
```

### **Escenario 2: Crear Nuevo Pedido**
```
1. Ver detalle del pedido
2. Click "Editar Pedido"
3. Click "+ Añadir Productos"
4. Buscar "altavoz"
5. Click "Al carrito" → Añadido al carrito
6. Confirm: "¿Ir al carrito?"
7. → Redirige a /carrito
8. Configura fechas y completa nuevo pedido
```

---

## 💻 **CÓDIGO IMPLEMENTADO:**

### **Imports añadidos:**
```typescript
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { guestCart } from '../../utils/guestCart';
```

### **Función handleAddToCart:**
```typescript
const handleAddToCart = (product: any) => {
  try {
    guestCart.addItem(product, 1);
    toast.success(`${product.name} añadido al carrito`);
    const confirmation = confirm('Producto añadido al carrito. ¿Quieres ir al carrito ahora?');
    if (confirmation) {
      onClose();
      navigate('/carrito');
    }
  } catch (error) {
    toast.error('Error al añadir al carrito');
  }
};
```

### **Botones en UI:**
```tsx
<div className="flex gap-2">
  {/* Añadir a este pedido */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleAdd(p);
    }}
    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1 text-sm"
    title="Añadir a este pedido"
  >
    <Plus className="w-4 h-4" />
    A pedido
  </button>

  {/* Añadir al carrito (nuevo pedido) */}
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleAddToCart(p);
    }}
    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1 text-sm"
    title="Añadir al carrito (nuevo pedido)"
  >
    <ShoppingCart className="w-4 h-4" />
    Al carrito
  </button>
</div>
```

### **Mensaje informativo:**
```tsx
<div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
  💡 <strong>A pedido:</strong> Modifica este pedido | <strong>Al carrito:</strong> Crea nuevo pedido
</div>
```

---

## 🎯 **CASOS DE USO:**

### **Caso 1: Usuario quiere añadir más equipo al mismo evento**
```
✅ Usa "A pedido"
- Modifica el pedido actual
- Paga la diferencia
- Todo en el mismo pedido
```

### **Caso 2: Usuario quiere hacer un nuevo pedido para otro evento**
```
✅ Usa "Al carrito"
- Añade productos al carrito
- Va al carrito
- Configura nuevas fechas
- Crea pedido separado
```

---

## 🎨 **UI VISUAL:**

```
┌────────────────────────────────────────────────┐
│ Editar Pedido                             [X]  │
├────────────────────────────────────────────────┤
│ [+ Añadir Productos]                           │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 🔍 Buscar productos...                   │  │
│ │                                          │  │
│ │ 💡 A pedido: Modifica | Al carrito: Nuevo│  │
│ │                                          │  │
│ │ ┌────────────────────────────────────┐  │  │
│ │ │ 📦 Luces LED                       │  │  │
│ │ │ €50.00                             │  │  │
│ │ │  [+ A pedido]  [🛒 Al carrito]    │  │  │
│ │ └────────────────────────────────────┘  │  │
│ │                                          │  │
│ │ ┌────────────────────────────────────┐  │  │
│ │ │ 📦 Altavoz JBL                     │  │  │
│ │ │ €30.00                             │  │  │
│ │ │  [+ A pedido]  [🛒 Al carrito]    │  │  │
│ │ └────────────────────────────────────┘  │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## ✅ **BENEFICIOS:**

```
✅ Flexibilidad total para el usuario
✅ Puede modificar el pedido actual
✅ Puede crear nuevos pedidos desde el mismo lugar
✅ UX clara con dos botones diferenciados
✅ Confirmación antes de redirigir
✅ Mensaje informativo explica las opciones
```

---

## 📁 **ARCHIVOS MODIFICADOS:**

```
EditOrderModal.tsx:
  ✅ Import ShoppingCart, useNavigate, guestCart
  ✅ Función handleAddToCart()
  ✅ Dos botones por producto
  ✅ Mensaje informativo
```

---

## 🚀 **LISTO PARA USAR:**

El modal ya tiene ambos botones funcionando:

1. Ve a "Mis Pedidos"
2. Abre un pedido
3. Click "Editar Pedido"
4. Click "+ Añadir Productos"
5. Busca un producto
6. Elige:
   - **[+ A pedido]** → Modifica este pedido
   - **[🛒 Al carrito]** → Nuevo pedido

---

_Implementado: 20/11/2025_  
_Tiempo: ~5 minutos_  
_Archivos: 1 modificado_  
_Estado: ✅ PRODUCTION READY_
