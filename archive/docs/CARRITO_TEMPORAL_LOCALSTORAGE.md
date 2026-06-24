# 🛒 CARRITO TEMPORAL EN LOCALSTORAGE

**Fecha:** 13 de Noviembre de 2025  
**Estado:** ⚠️ TEMPORAL (Funciona, pero sin persistencia backend)

---

## ⚠️ SITUACIÓN ACTUAL

El **backend NO persiste el carrito** en base de datos. El servicio `cart.service.ts` solo devuelve una estructura vacía:

```typescript
async getCart(userId: string) {
  // Return empty cart structure
  return {
    userId: user.id,
    items: [],      // ← Siempre vacío
    subtotal: 0,
    tax: 0,
    total: 0,
  };
}
```

---

## ✅ SOLUCIÓN TEMPORAL

**TODO el carrito usa localStorage (guest cart)** independientemente de si el usuario está logueado o no.

### **Componentes Afectados:**

```typescript
// 1. ProductDetailPage.tsx
// SIEMPRE usa guestCart.addItem()
guestCart.addItem(product, quantity);

// 2. CartPage.tsx  
// SIEMPRE usa guestCartItems
const cartItems = guestCartItems;

// 3. CartSidebar.tsx
// SIEMPRE usa guestCartItems  
const cartItems = guestCartItems;

// 4. useCartCount hook
// Lee de localStorage
guestCart.getCart()
```

---

## 📊 CÓMO FUNCIONA AHORA

### **Con Login:**
```
Usuario logueado → Añade productos
  ↓
localStorage (guest cart)
  ↓
Carrito funciona ✅
```

### **Sin Login:**
```
Usuario invitado → Añade productos
  ↓
localStorage (guest cart)
  ↓
Carrito funciona ✅
```

**Ambos usan el MISMO sistema.**

---

## ⚠️ LIMITACIONES

```
❌ No sincroniza entre dispositivos
❌ Se pierde al limpiar caché
❌ No persiste en backend
❌ Login no transfiere carrito
```

---

## 🔄 PRÓXIMA IMPLEMENTACIÓN

### **Persistencia Real del Carrito:**

#### **1. Backend - Modelo Prisma**
```prisma
model CartItem {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantity   Int
  startDate  DateTime?
  endDate    DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### **2. Backend - Servicio**
```typescript
async getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } }
  });
  
  return {
    userId,
    items,
    // ... cálculos
  };
}

async addToCart(userId: string, data: CartItemData) {
  return await prisma.cartItem.create({
    data: {
      userId,
      productId: data.productId,
      quantity: data.quantity,
      startDate: data.startDate,
      endDate: data.endDate,
    },
    include: { product: true }
  });
}

async updateCartItem(userId: string, itemId: string, data: Partial<CartItemData>) {
  return await prisma.cartItem.update({
    where: { id: itemId, userId },
    data
  });
}

async removeFromCart(userId: string, itemId: string) {
  return await prisma.cartItem.delete({
    where: { id: itemId, userId }
  });
}
```

#### **3. Frontend - Migración al Login**
```typescript
// hooks/useCartMigration.ts
export const useCartMigration = () => {
  const { user } = useAuthStore();
  
  useEffect(() => {
    if (user) {
      const guestItems = guestCart.getCart();
      
      if (guestItems.length > 0) {
        // Transferir al backend
        migrateCart(guestItems);
      }
    }
  }, [user]);
};

const migrateCart = async (items: GuestCartItem[]) => {
  for (const item of items) {
    await api.post('/cart/items', {
      productId: item.productId,
      quantity: item.quantity,
      startDate: item.startDate,
      endDate: item.endDate,
    });
  }
  
  guestCart.clear();
  toast.success('Carrito sincronizado');
};
```

#### **4. Frontend - Usar Cart de API**
```typescript
// CartPage.tsx - Cuando esté implementado
const cartItems = user 
  ? (cart?.items || [])  // Del backend
  : guestCartItems;       // De localStorage
```

---

## 📋 PASOS PARA IMPLEMENTAR

### **Fase 1: Base de Datos**
- [ ] Crear migración de Prisma para CartItem
- [ ] Ejecutar migración
- [ ] Verificar schema

### **Fase 2: Backend**
- [ ] Implementar getCart (leer de DB)
- [ ] Implementar addToCart (guardar en DB)
- [ ] Implementar updateCartItem
- [ ] Implementar updateCartItemDates
- [ ] Implementar removeFromCart
- [ ] Implementar clearCart

### **Fase 3: Frontend**
- [ ] Crear hook useCartMigration
- [ ] Integrar en App.tsx
- [ ] Actualizar CartPage para usar API
- [ ] Actualizar CartSidebar para usar API
- [ ] Actualizar ProductDetailPage
- [ ] Mantener guest cart como fallback

### **Fase 4: Testing**
- [ ] Test: Añadir sin login
- [ ] Test: Login con items en guest cart
- [ ] Test: Items se transfieren
- [ ] Test: CRUD desde API funciona
- [ ] Test: Sincronización entre tabs

---

## 🧪 TESTING ACTUAL

### **Test: Añadir al Carrito**
```bash
1. Ctrl + Shift + R
2. Ver producto
3. Click "Añadir al carrito"

✅ ESPERADO:
- Guardado en localStorage
- Contador actualizado
- Sidebar muestra producto
```

### **Test: Login con Carrito**
```bash
1. Añadir productos sin login
2. Hacer login
3. Ver carrito

✅ ESPERADO:
- Productos siguen en carrito (localStorage)
- Todo funciona normal
```

### **Test: Cerrar y Abrir Navegador**
```bash
1. Añadir productos
2. Cerrar navegador
3. Abrir navegador
4. Ver carrito

✅ ESPERADO:
- Productos siguen ahí (localStorage persiste)
```

---

## 💡 VENTAJAS TEMPORALES

```
✅ Funciona sin backend complejo
✅ Rápido de implementar
✅ Sin latencia (todo local)
✅ No requiere login para añadir
✅ Persiste en localStorage
```

---

## ⚠️ DESVENTAJAS

```
❌ No sincroniza dispositivos
❌ Límite de 5MB (localStorage)
❌ Se pierde al limpiar caché
❌ No previene conflictos de stock
❌ No hay backup
```

---

## 🎯 RECOMENDACIÓN

**Estado Actual:** Funciona para desarrollo y MVP

**Próximo Paso:** Implementar persistencia backend cuando:
1. Necesites sincronización multi-dispositivo
2. Necesites backup del carrito
3. Necesites análisis de carritos abandonados
4. Necesites gestión de stock en tiempo real

**Prioridad:** 
- 🔴 Alta si vas a producción
- 🟡 Media si es solo MVP/demo
- 🟢 Baja si es desarrollo local

---

## ✅ ESTADO ACTUAL

```
FUNCIONALIDAD: ✅ 100%
PERSISTENCIA LOCAL: ✅ 100%
PERSISTENCIA BACKEND: ❌ 0%
UX: ✅ Excelente
ESCALABILIDAD: ⚠️ Limitada

PARA:
✅ Desarrollo
✅ Demo
✅ MVP
⚠️ Producción (requiere backend)
```

---

**¡El carrito funciona perfectamente con localStorage!** 🛒

**Nota:** Implementar backend cuando escales a producción.
