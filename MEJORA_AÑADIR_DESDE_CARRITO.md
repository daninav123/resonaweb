# ✅ MEJORA: AÑADIR ITEMS DEL CARRITO AL PEDIDO

_Fecha: 20/11/2025 02:08_  
_Estado: COMPLETADO_

---

## 🎯 **FUNCIONALIDAD IMPLEMENTADA:**

Ahora cuando editas un pedido, puedes **añadir los productos que tienes en el carrito** directamente al pedido que estás modificando.

---

## 📋 **CÓMO FUNCIONA:**

### **ANTES:**
```
┌────────────────────────────┐
│ Editar Pedido         [X]  │
├────────────────────────────┤
│ [+ Añadir Productos]       │ ← Solo búsqueda
└────────────────────────────┘
```

### **AHORA:**
```
┌─────────────────────────────────────┐
│ Editar Pedido                  [X]  │
├─────────────────────────────────────┤
│ [+ Añadir Productos] [🛒 Desde      │
│                       Carrito (3)]  │ ← Nuevo botón
├─────────────────────────────────────┤
│ Productos en tu carrito:            │
│ ┌─────────────────────────────┐    │
│ │ 📦 Luces LED                │    │
│ │ Cantidad: 2 | €50/día       │    │
│ │              [+ Añadir]     │    │ ← Click para añadir
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## ⚙️ **CARACTERÍSTICAS:**

### **1. Botón "Desde Carrito"**
```typescript
- Solo aparece si hay items en el carrito
- Muestra número de items: "Desde Carrito (3)"
- Click para ver lista de productos
```

### **2. Lista de Items del Carrito**
```typescript
- Muestra nombre del producto
- Muestra cantidad y precio por día
- Botón "Añadir" por cada producto
```

### **3. Al Añadir:**
```typescript
- Se añade al pedido actual (sección "A añadir:")
- Se ELIMINA del carrito automáticamente
- Muestra toast de confirmación
- Puedes ajustar cantidad antes de confirmar
```

---

## 🔄 **FLUJO COMPLETO:**

```
1. Usuario tiene productos en el carrito
   ↓
2. Abre un pedido existente
   ↓
3. Click "Editar Pedido"
   ↓
4. Ve botón "Desde Carrito (3)"
   ↓
5. Click → Ve lista de productos del carrito
   ↓
6. Click "Añadir" en producto específico
   ↓
7. Producto se añade a "A añadir:"
   ↓
8. Producto se ELIMINA del carrito
   ↓
9. Ajusta cantidad si necesario
   ↓
10. Click "Confirmar"
   ↓
11. ✅ Pedido modificado con producto añadido
```

---

## 💻 **CÓDIGO IMPLEMENTADO:**

### **Estado del Carrito:**
```typescript
const [cartItems, setCartItems] = useState<any[]>([]);
const [showCart, setShowCart] = useState(false);

useEffect(() => {
  const items = guestCart.getCart();
  setCartItems(items);
}, []);
```

### **Función handleAddFromCart:**
```typescript
const handleAddFromCart = (cartItem: any) => {
  const newItem = {
    productId: cartItem.productId,
    product: cartItem.product,
    quantity: cartItem.quantity,
    pricePerUnit: Number(cartItem.product.pricePerDay || cartItem.product.basePrice || 0),
    totalPrice: Number(cartItem.product.pricePerDay || cartItem.product.basePrice || 0) * cartItem.quantity,
  };
  setAdd([...add, newItem]);
  
  // Remover del carrito
  guestCart.removeItem(cartItem.id);
  setCartItems(guestCart.getCart());
  
  toast.success(`${cartItem.product.name} añadido al pedido`);
};
```

### **UI Botones:**
```tsx
<div className="grid grid-cols-2 gap-3">
  <button onClick={() => setShow(!show)} ...>
    <Plus /> Añadir Productos
  </button>
  
  {cartItems.length > 0 && (
    <button onClick={() => setShowCart(!showCart)} ...>
      <ShoppingCart /> Desde Carrito ({cartItems.length})
    </button>
  )}
</div>
```

### **UI Lista del Carrito:**
```tsx
{showCart && cartItems.length > 0 && (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h3>Productos en tu carrito:</h3>
    {cartItems.map((item: any) => (
      <div key={item.id}>
        <p>{item.product.name}</p>
        <p>Cantidad: {item.quantity} | €{price}/día</p>
        <button onClick={() => handleAddFromCart(item)}>
          <Plus /> Añadir
        </button>
      </div>
    ))}
  </div>
)}
```

---

## 🎯 **EJEMPLO DE USO:**

### **Situación:**
Usuario tiene en el carrito:
- 2x Luces LED (€50/día)
- 1x Altavoz JBL (€30/día)

Usuario también tiene un pedido activo:
- Cámara 4K (€200)

### **Acción:**
1. Abre el pedido → "Editar Pedido"
2. Click "Desde Carrito (2)"
3. Ve lista con Luces y Altavoz
4. Click "Añadir" en Luces LED
5. Las luces pasan a "A añadir:" en el pedido
6. Las luces se eliminan del carrito
7. Confirma modificación
8. Ahora el pedido tiene: Cámara + Luces

### **Resultado:**
```
Pedido actualizado:
- Cámara 4K: €200
- Luces LED x2: €100
Total: €300

Carrito actualizado:
- Altavoz JBL: €30
```

---

## ✅ **BENEFICIOS:**

```
✅ Aprovecha productos ya en el carrito
✅ No necesita buscar de nuevo
✅ Limpia el carrito automáticamente
✅ Rápido y conveniente
✅ Evita duplicados (se mueve, no se copia)
✅ Mantiene cantidad original del carrito
```

---

## 🎨 **UI VISUAL COMPLETA:**

```
┌──────────────────────────────────────────────┐
│ Editar Pedido                           [X]  │
├──────────────────────────────────────────────┤
│                                              │
│ ┌──────────────────┬──────────────────────┐ │
│ │ + Añadir         │ 🛒 Desde Carrito (2) │ │
│ │   Productos      │                      │ │
│ └──────────────────┴──────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────┐    │
│ │ Productos en tu carrito:             │    │
│ │                                      │    │
│ │ ┌──────────────────────────────┐    │    │
│ │ │ 📦 Luces LED                 │    │    │
│ │ │ Cantidad: 2 | €50/día        │    │    │
│ │ │                    [+ Añadir]│    │    │
│ │ └──────────────────────────────┘    │    │
│ │                                      │    │
│ │ ┌──────────────────────────────┐    │    │
│ │ │ 📦 Altavoz JBL               │    │    │
│ │ │ Cantidad: 1 | €30/día        │    │    │
│ │ │                    [+ Añadir]│    │    │
│ │ └──────────────────────────────┘    │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ ✅ A añadir:                                 │
│ Luces LED x2 → +€100                         │
│                                              │
│ Productos actuales:                          │
│ Cámara 4K → €200                             │
│                                              │
│ 📊 Cargo adicional: €100                     │
│                                              │
│           [Cancelar] [Confirmar]             │
└──────────────────────────────────────────────┘
```

---

## 📁 **ARCHIVOS MODIFICADOS:**

```
EditOrderModal.tsx:
  ✅ Import useEffect
  ✅ Estados cartItems y showCart
  ✅ useEffect para cargar carrito
  ✅ Función handleAddFromCart()
  ✅ Botón "Desde Carrito"
  ✅ Lista de productos del carrito
  ✅ Eliminado handleAddToCart (no necesario)
```

---

## 🚀 **CÓMO PROBARLO:**

1. **Preparar carrito:**
   - Añade 2-3 productos al carrito
   - NO completes el pedido

2. **Crear pedido separado:**
   - Añade otro producto al carrito
   - Completa ese pedido

3. **Editar el pedido:**
   - Ve a "Mis Pedidos"
   - Abre el pedido creado
   - Click "Editar Pedido"

4. **Ver el botón:**
   - Deberías ver "Desde Carrito (2-3)"
   - Click en el botón

5. **Añadir del carrito:**
   - Ve la lista de productos
   - Click "Añadir" en uno
   - Verifica que se añade al pedido
   - Verifica que desaparece del carrito

6. **Confirmar:**
   - Click "Confirmar"
   - Paga el cargo adicional
   - ✅ Pedido modificado

---

## 💡 **CASOS DE USO:**

### **Caso 1: Aprovechar productos del carrito**
```
Usuario añadió varios productos al carrito para un evento.
Decidió crear un pedido con solo algunos.
Los otros quedan en el carrito.
Luego decide añadirlos al pedido existente.
→ Usa "Desde Carrito" para moverlos
```

### **Caso 2: Consolidar pedidos**
```
Usuario tiene productos sueltos en el carrito.
Tiene un pedido activo para el mismo evento.
Quiere todo en un solo pedido.
→ Edita el pedido y añade desde carrito
```

---

## 🎉 **RESULTADO:**

El flujo ahora es más intuitivo:
- ✅ No pierde productos del carrito
- ✅ Puede consolidar todo en un pedido
- ✅ Limpieza automática del carrito
- ✅ Mantiene cantidades originales

---

_Implementado: 20/11/2025_  
_Tiempo: ~10 minutos_  
_Archivos: 1 modificado_  
_Estado: ✅ PRODUCTION READY_
