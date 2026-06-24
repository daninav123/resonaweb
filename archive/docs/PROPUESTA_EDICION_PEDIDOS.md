# 📋 PROPUESTA: EDICIÓN Y CANCELACIÓN DE PEDIDOS

## 🎯 REQUISITOS:
1. **Editar**: hasta 24h antes (solo añadir items)
2. **Modificar completo**: añadir/eliminar productos
3. **Cancelar**: 
   - >= 7 días: Reembolso 100%
   - < 7 días: Reembolso 50%
   - < 24h: Sin reembolso

## 🗄️ BASE DE DATOS:

### Nueva tabla OrderModification:
```prisma
model OrderModification {
  id          String @id @default(cuid())
  orderId     String
  type        ModificationType // ADD, REMOVE, CANCEL
  oldTotal    Decimal
  newTotal    Decimal
  difference  Decimal
  createdAt   DateTime @default(now())
}
```

### Actualizar Order:
```prisma
model Order {
  modifications   OrderModification[]
  isModified      Boolean @default(false)
  cancelledAt     DateTime?
  refundAmount    Decimal?
  refundStatus    RefundStatus? // NONE, PARTIAL, FULL
}
```

## 🔧 BACKEND:

### 1. Validar modificación:
```typescript
async canModifyOrder(orderId: string) {
  const order = await getOrder(orderId);
  const hours = hoursUntil(order.startDate);
  return hours >= 24;
}
```

### 2. Añadir items:
```typescript
async addItems(orderId, newItems) {
  // Validar 24h
  // Calcular costo adicional
  // Crear cargo Stripe
  // Actualizar pedido
}
```

### 3. Cancelar con reembolso:
```typescript
async cancelOrder(orderId, userId) {
  const hours = hoursUntil(order.startDate);
  const days = hours / 24;
  
  let refund = 0;
  if (days >= 7) refund = 100; // 100%
  else if (days >= 1) refund = 50; // 50%
  else refund = 0; // Sin reembolso
  
  await stripeService.refund(order, refund);
}
```

## 🎨 FRONTEND:

### Botón "Editar Pedido" en OrderDetailPage:
```tsx
{canEdit && <button onClick={handleEdit}>Editar</button>}
{canCancel && <button onClick={handleCancel}>Cancelar</button>}
```

### Modal de edición con carrito temporal

## ⏰ REGLAS DE TIEMPO:

| Acción | Condición | Resultado |
|--------|-----------|-----------|
| Editar | >= 24h | ✅ Permitido |
| Editar | < 24h | ❌ Bloqueado |
| Cancelar >= 7 días | | 100% reembolso |
| Cancelar 1-7 días | | 50% reembolso |
| Cancelar < 24h | | 0% reembolso |

## 📱 FLUJO USUARIO:

1. Usuario ve pedido → Botón "Editar"
2. Abre modal con items actuales
3. Añade/elimina productos
4. Sistema calcula diferencia
5. Si positivo → Pagar
6. Si negativo → Reembolso
7. Actualizar pedido

¿Implemento esta solución?
