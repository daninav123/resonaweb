# 🌟 Sistema de Niveles VIP - Implementación Completa

## 📋 Especificaciones

### **Niveles de Usuario:**

| Nivel | Descuento | Fianza | Descripción |
|-------|-----------|--------|-------------|
| **STANDARD** | 0% | Sí | Usuario normal |
| **VIP** | 50% | No | Cliente premium |
| **VIP_PLUS** | 70% | No | Cliente VIP Plus |

---

## ✅ Cambios Realizados

### **1. Base de Datos (Prisma Schema)**

```prisma
enum UserLevel {
  STANDARD
  VIP
  VIP_PLUS
}

model User {
  // ... campos existentes
  role              UserRole  @default(CLIENT)
  userLevel         UserLevel @default(STANDARD)
  // ...
}
```

**Migración creada:** `20251119004446_add_user_levels`

---

## 🎯 Funcionalidades a Implementar

### **1. Panel de Admin - Gestión de Niveles**

**Ubicación:** `/admin/users`

**Funcionalidad:**
- Select dropdown para cambiar nivel de usuario
- Opciones: STANDARD, VIP, VIP_PLUS
- Solo admin puede modificar
- Badge visual que muestre el nivel actual

---

### **2. Cálculo de Descuentos en Checkout**

**Lógica:**

```typescript
function calculateDiscountByUserLevel(userLevel: UserLevel, subtotal: number) {
  switch(userLevel) {
    case 'VIP':
      return subtotal * 0.50; // 50% descuento
    case 'VIP_PLUS':
      return subtotal * 0.70; // 70% descuento
    case 'STANDARD':
    default:
      return 0; // Sin descuento
  }
}
```

**Aplicación:**
```typescript
const subtotal = calculateSubtotal();
const vipDiscount = calculateDiscountByUserLevel(user.userLevel, subtotal);
const total = subtotal - vipDiscount + shipping;
```

---

### **3. Eliminación de Fianza para VIP**

**Lógica:**

```typescript
function calculateDeposit(userLevel: UserLevel, items: CartItem[]) {
  // VIP y VIP_PLUS no pagan fianza
  if (userLevel === 'VIP' || userLevel === 'VIP_PLUS') {
    return 0;
  }
  
  // Usuario STANDARD paga fianza normal
  return items.reduce((total, item) => {
    const depositPerItem = calculateDepositForProduct(item.product);
    return total + (depositPerItem * item.quantity);
  }, 0);
}
```

---

### **4. Interfaz de Usuario**

#### **Badge VIP en Perfil:**
```tsx
// AccountPage.tsx
{user.userLevel === 'VIP' && (
  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm rounded-full font-semibold">
    ⭐ VIP
  </span>
)}

{user.userLevel === 'VIP_PLUS' && (
  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-semibold">
    👑 VIP PLUS
  </span>
)}
```

#### **Información en Checkout:**
```tsx
{user.userLevel !== 'STANDARD' && (
  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
    <h3 className="font-bold text-yellow-900 flex items-center gap-2">
      <Star className="w-5 h-5" />
      Descuento {user.userLevel}
    </h3>
    <p className="text-sm text-yellow-800">
      {user.userLevel === 'VIP' ? '50%' : '70%'} de descuento aplicado
      • Sin fianza
    </p>
  </div>
)}
```

---

## 📊 Desglose de Precios con VIP

### **Usuario STANDARD:**
```
Subtotal productos:    €200.00
Envío:                 €25.00
Instalación:           €50.00
─────────────────────────────
Total a pagar ahora:   €275.00
Fianza (en tienda):    €100.00
═════════════════════════════
TOTAL PEDIDO:          €375.00
```

### **Usuario VIP (50%):**
```
Subtotal productos:    €200.00
Descuento VIP (50%):   -€100.00
Envío:                 €25.00
Instalación:           €50.00
─────────────────────────────
Total a pagar ahora:   €175.00
Fianza:                €0.00 ✓
═════════════════════════════
TOTAL PEDIDO:          €175.00
```

### **Usuario VIP PLUS (70%):**
```
Subtotal productos:    €200.00
Descuento VIP+ (70%):  -€140.00
Envío:                 €25.00
Instalación:           €50.00
─────────────────────────────
Total a pagar ahora:   €135.00
Fianza:                €0.00 ✓
═════════════════════════════
TOTAL PEDIDO:          €135.00
```

---

## 🔧 Archivos a Modificar

### **Backend:**

1. **`packages/backend/prisma/schema.prisma`** ✅ HECHO
   - Añadido enum `UserLevel`
   - Añadido campo `userLevel` al modelo `User`

2. **`packages/backend/src/routes/user.routes.ts`** ⏳ PENDIENTE
   - Endpoint para actualizar nivel de usuario
   - Solo admin puede modificar

3. **`packages/backend/src/services/order.service.ts`** ⏳ PENDIENTE
   - Aplicar descuentos según userLevel
   - Eliminar fianza para VIP

4. **`packages/backend/src/services/cart.service.ts`** ⏳ PENDIENTE
   - Calcular totales con descuento VIP

### **Frontend:**

1. **`packages/frontend/src/pages/admin/UsersManager.tsx`** ⏳ PENDIENTE
   - Select para cambiar nivel de usuario
   - Badge visual del nivel

2. **`packages/frontend/src/pages/CheckoutPage.tsx`** ⏳ PENDIENTE
   - Mostrar descuento VIP
   - Eliminar sección de fianza para VIP
   - Calcular total con descuento

3. **`packages/frontend/src/pages/AccountPage.tsx`** ⏳ PENDIENTE
   - Badge VIP en perfil

4. **`packages/frontend/src/stores/authStore.ts`** ⏳ PENDIENTE
   - Añadir `userLevel` al tipo User

---

## 🎨 Diseño Visual

### **Badge STANDARD:**
```
┌──────────────┐
│ Cliente      │
└──────────────┘
```

### **Badge VIP:**
```
┌──────────────────────┐
│ ⭐ VIP               │
│ 50% dto • Sin fianza │
└──────────────────────┘
```

### **Badge VIP PLUS:**
```
┌──────────────────────┐
│ 👑 VIP PLUS          │
│ 70% dto • Sin fianza │
└──────────────────────┘
```

---

## 🔐 Permisos

### **Usuarios:**
- ✅ Pueden ver su propio nivel
- ❌ NO pueden modificar su nivel
- ✅ Beneficios se aplican automáticamente

### **Administradores:**
- ✅ Pueden ver nivel de todos los usuarios
- ✅ Pueden modificar nivel de cualquier usuario
- ✅ Cambios se aplican inmediatamente

---

## 📝 Próximos Pasos

### **Fase 1: Base de Datos** ✅ COMPLETADO
- [x] Crear enum UserLevel
- [x] Añadir campo userLevel a User
- [x] Ejecutar migración

### **Fase 2: Backend**
- [ ] Crear endpoint PUT /api/v1/users/:id/level
- [ ] Actualizar servicio de cálculo de pedidos
- [ ] Aplicar descuentos en checkout
- [ ] Eliminar fianza para VIP

### **Fase 3: Admin Panel**
- [ ] Añadir select de nivel en UsersManager
- [ ] Badge visual de nivel
- [ ] Formulario de edición

### **Fase 4: Frontend Cliente**
- [ ] Badge VIP en perfil
- [ ] Mostrar descuento en checkout
- [ ] Eliminar sección fianza para VIP
- [ ] Información de beneficios

### **Fase 5: Testing**
- [ ] Probar cambio de nivel desde admin
- [ ] Verificar descuentos en checkout
- [ ] Comprobar eliminación de fianza
- [ ] Validar permisos

---

## 🧪 Cómo Probar

### **1. Actualizar un Usuario a VIP:**
```sql
-- Desde Prisma Studio o SQL directo
UPDATE "User"
SET "userLevel" = 'VIP'
WHERE email = 'usuario@example.com';
```

### **2. Probar el Flujo:**
1. Login con usuario VIP
2. Añadir productos al carrito
3. Ir al checkout
4. **Verificar:**
   - ✅ Descuento 50% aplicado
   - ✅ Sin fianza
   - ✅ Total reducido

---

## 💡 Mejoras Futuras

- [ ] Historial de cambios de nivel
- [ ] Expiración de VIP (fecha límite)
- [ ] Auto-upgrade basado en gastos
- [ ] Notificación al usuario cuando cambia nivel
- [ ] Estadísticas de usuarios VIP
- [ ] Beneficios adicionales (envío gratis, prioridad, etc.)

---

_Última actualización: 19/11/2025 01:43_  
_Estado: Base de datos ✅ | Backend ⏳ | Frontend ⏳_  
_Próximo: Implementar endpoints y panel de admin_
