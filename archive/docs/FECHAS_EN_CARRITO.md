# ✅ FECHAS DE ALQUILER EN EL CARRITO

**Fecha:** 13 de Noviembre de 2025  
**Estado:** ✅ Implementado

---

## 🎯 NUEVO FLUJO DE RESERVA

### **Antes:**
```
Producto → Seleccionar fechas → Añadir al carrito
```

### **Ahora:**
```
Producto → Añadir al carrito → En el carrito: Seleccionar fechas
```

---

## 💡 VENTAJAS DEL NUEVO FLUJO

### **1. Experiencia Más Simple**
```
✅ Menos pasos para añadir producto
✅ Usuario puede explorar y añadir rápidamente
✅ Fechas se organizan todas juntas en el carrito
```

### **2. Mejor UX para Múltiples Productos**
```
✅ Añade varios productos primero
✅ Luego organiza todas las fechas en un solo lugar
✅ Visión global del alquiler
```

### **3. Menos Fricción**
```
✅ No requiere fechas para explorar
✅ Usuario puede decidir fechas después
✅ Facilita impulso de compra
```

---

## 📋 CAMBIOS REALIZADOS

### **ProductDetailPage.tsx**

#### **ELIMINADO:**
```tsx
❌ Sección "Fechas de alquiler"
❌ Input fecha inicio
❌ Input fecha fin
❌ Estado selectedDates
❌ Validación de fechas requeridas
```

#### **MANTENIDO:**
```tsx
✅ Selector de cantidad
✅ Botón "Añadir al carrito"
✅ Validación de stock
✅ Mensajes de error apropiados
```

#### **AGREGADO:**
```tsx
✅ Manejo de error 401 (no autenticado)
✅ Mensaje: "Selecciona las fechas en el carrito"
```

---

## 🔄 NUEVO FLUJO COMPLETO

### **Paso 1: Ver Producto**
```
Usuario en: /products/microfono-shure-sm58

Ve:
├─ Imagen del producto
├─ Nombre y descripción
├─ Precio (día/fin de semana/semana)
├─ Selector de cantidad
└─ Botón "Añadir al carrito"

NO ve:
❌ Selector de fechas
```

### **Paso 2: Añadir al Carrito**
```
Usuario: Click "Añadir al carrito"

Si NO está logueado:
├─ ⚠️ "Debes iniciar sesión para añadir productos al carrito"
└─ Redirigir a /login

Si está logueado:
├─ ✅ "Producto añadido al carrito. Selecciona las fechas en el carrito."
└─ Producto añadido sin fechas
```

### **Paso 3: Ir al Carrito**
```
Usuario en: /cart

Ve:
├─ Lista de productos añadidos
├─ Para cada producto:
│  ├─ Imagen y nombre
│  ├─ Cantidad
│  ├─ 📅 Selector de fechas de alquiler  ← AQUÍ
│  └─ Precio calculado
└─ Total del carrito
```

### **Paso 4: Checkout**
```
Usuario: Click "Proceder al pago"

Sistema valida:
├─ ¿Todas las fechas seleccionadas?
├─ ¿Fechas válidas?
├─ ¿Stock disponible para esas fechas?
└─ Si todo OK → Checkout
```

---

## 🛒 IMPLEMENTACIÓN EN CARRITO (CartPage)

### **Estructura Necesaria:**

```tsx
// CartPage.tsx

{cartItems.map(item => (
  <div key={item.id} className="cart-item">
    {/* Producto info */}
    <div className="product-info">
      <img src={item.product.image} />
      <h3>{item.product.name}</h3>
      <p>Cantidad: {item.quantity}</p>
    </div>

    {/* Fechas de alquiler - NUEVA SECCIÓN */}
    <div className="rental-dates">
      <h4>Fechas de alquiler</h4>
      <div className="date-inputs">
        <input
          type="date"
          value={item.startDate || ''}
          onChange={(e) => updateItemDates(item.id, e.target.value, item.endDate)}
          placeholder="Fecha inicio"
        />
        <input
          type="date"
          value={item.endDate || ''}
          onChange={(e) => updateItemDates(item.id, item.startDate, e.target.value)}
          placeholder="Fecha fin"
        />
      </div>
      {!item.startDate || !item.endDate && (
        <p className="warning">⚠️ Selecciona las fechas para continuar</p>
      )}
    </div>

    {/* Precio */}
    <div className="price">
      {item.startDate && item.endDate ? (
        <p>€{calculatePrice(item)} ({getDays(item)} días)</p>
      ) : (
        <p className="text-gray-500">Selecciona fechas</p>
      )}
    </div>
  </div>
))}
```

---

## ⚡ VALIDACIONES REQUERIDAS

### **En el Carrito:**

```typescript
const canCheckout = () => {
  // Verificar que todos los items tengan fechas
  const allHaveDates = cartItems.every(item => 
    item.startDate && item.endDate
  );

  if (!allHaveDates) {
    toast.error('Por favor selecciona las fechas para todos los productos');
    return false;
  }

  // Verificar que las fechas sean válidas
  const allDatesValid = cartItems.every(item => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    const today = new Date();
    
    return start >= today && end > start;
  });

  if (!allDatesValid) {
    toast.error('Algunas fechas no son válidas');
    return false;
  }

  return true;
};

const handleCheckout = () => {
  if (!canCheckout()) return;
  
  navigate('/checkout');
};
```

---

## 🎨 DISEÑO DEL CARRITO

### **Ejemplo Visual:**

```
┌────────────────────────────────────────────────────────┐
│  🛒 TU CARRITO (3 productos)                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📷  Micrófono Shure SM58        Cantidad: 1     │ │
│  │                                                  │ │
│  │  📅 Fechas de alquiler:                         │ │
│  │  [Inicio: __/__/__] [Fin: __/__/__]            │ │
│  │  ⚠️ Selecciona las fechas para ver el precio    │ │
│  │                                                  │ │
│  │  [Eliminar]                                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 📷  Cámara Sony A7 III          Cantidad: 1     │ │
│  │                                                  │ │
│  │  📅 Fechas de alquiler:                         │ │
│  │  [Inicio: 15/11/25] [Fin: 20/11/25]            │ │
│  │  ✅ €425 (5 días × €85/día)                     │ │
│  │                                                  │ │
│  │  [Eliminar]                                      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  RESUMEN                                         │ │
│  │  ────────────────────────────                   │ │
│  │  Subtotal:        €425                          │ │
│  │  IVA (21%):       €89.25                        │ │
│  │  ────────────────────────────                   │ │
│  │  TOTAL:           €514.25                       │ │
│  │                                                  │ │
│  │  [Continuar Comprando] [Proceder al Pago] ✅    │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 MANEJO DE AUTENTICACIÓN

### **Error 401 - No Autenticado:**

```typescript
// ProductDetailPage.tsx - Ya implementado

catch (error: any) {
  if (error.response?.status === 401) {
    toast.error('Debes iniciar sesión para añadir productos al carrito');
    // Opcional: Redirigir a login
    // navigate('/login');
  } else {
    toast.error('Error al añadir al carrito');
  }
}
```

### **Flujo Recomendado:**

```
Usuario NO logueado → Intenta añadir al carrito
└─> Mensaje: "Debes iniciar sesión"
    └─> Guardar producto en localStorage
        └─> Redirigir a /login
            └─> Después de login: Recuperar y añadir al carrito
```

---

## 📊 ESTADO DEL BACKEND

### **Endpoint Cart Items:**

```typescript
POST /api/v1/cart/items
Body: {
  productId: string
  quantity: number
  startDate?: string  // Opcional ahora
  endDate?: string    // Opcional ahora
}
```

### **Actualización Necesaria Backend:**

```typescript
// cart.service.ts

// Permitir añadir sin fechas
async addToCart(userId: string, data: AddToCartDto) {
  // Crear item sin fechas
  const cartItem = await prisma.cartItem.create({
    data: {
      userId,
      productId: data.productId,
      quantity: data.quantity,
      startDate: data.startDate || null,  // Permitir null
      endDate: data.endDate || null,      // Permitir null
    }
  });
  
  return cartItem;
}

// Nuevo endpoint para actualizar fechas
async updateCartItemDates(itemId: string, dates: {
  startDate: string,
  endDate: string
}) {
  return await prisma.cartItem.update({
    where: { id: itemId },
    data: {
      startDate: dates.startDate,
      endDate: dates.endDate,
    }
  });
}
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Frontend:**
- [x] ProductDetailPage sin fechas
- [x] Manejo error 401
- [x] Mensaje apropiado
- [ ] CartPage con selector de fechas
- [ ] Validación de fechas en carrito
- [ ] Cálculo de precio por fechas
- [ ] Validación antes de checkout

### **Backend:**
- [ ] Permitir startDate/endDate opcionales
- [ ] Endpoint PUT /cart/items/:id/dates
- [ ] Validación en checkout que requiera fechas
- [ ] Disponibilidad por fechas

---

## 🧪 TESTING

### **Test 1: Añadir sin Login**
```
1. Modo incógnito
2. Ver producto
3. Click "Añadir al carrito"
✅ Debe mostrar: "Debes iniciar sesión..."
```

### **Test 2: Añadir con Login**
```
1. Login
2. Ver producto
3. Click "Añadir al carrito"
✅ Debe mostrar: "Producto añadido. Selecciona fechas..."
4. Ir a /cart
✅ Debe ver el producto
✅ Debe ver selector de fechas
```

### **Test 3: Checkout sin Fechas**
```
1. Producto en carrito sin fechas
2. Click "Proceder al pago"
❌ Debe bloquear con: "Selecciona fechas..."
```

---

## 🎯 RESUMEN

```
ANTES:
- Fechas en producto ❌
- Fricción para añadir ❌
- Error 401 sin manejar ❌

AHORA:
- Fechas en carrito ✅
- Añadir rápido ✅
- Error 401 manejado ✅
- Mensaje claro ✅

PENDIENTE:
- Implementar selector fechas en CartPage
- Backend: Fechas opcionales al añadir
- Backend: Endpoint actualizar fechas
- Validación completa en checkout
```

---

**¡Flujo optimizado para mejor UX!** 🛒✨
