# 🛒 Sistema de Productos Consumibles

## 📋 **Concepto**

Los consumibles son productos que se **venden** (no se alquilan) y no se devuelven. Son artículos de un solo uso o que el cliente se queda.

### **Ejemplos:**
- Confeti, serpentinas
- Líquido de humo
- Pilas, baterías
- Cables que se quedan
- Fusibles
- Otros accesorios desechables

---

## 🔧 **Implementación Técnica**

### **1. Base de Datos** ✅

**Campos añadidos al modelo `Product`:**

```prisma
// Consumible (productos que se venden, no se alquilan)
isConsumable            Boolean   @default(false)
pricePerUnit            Decimal?  @db.Decimal(10, 2) // Precio por unidad
```

**Índice añadido:**
```prisma
@@index([isConsumable])
```

---

## 📊 **Diferencias entre Tipos de Productos**

| Característica | Alquiler | Consumible | Pack |
|----------------|----------|------------|------|
| **Se devuelve** | ✅ Sí | ❌ No | ✅ Sí |
| **Precio** | Por día/semana | Por unidad | Por día/semana |
| **Stock** | Se reserva | Se resta | N/A |
| **Fianza** | Sí | No | Sí |
| **Fecha inicio/fin** | Sí | No | Sí |

---

## 🎯 **Comportamiento del Sistema**

### **En el Catálogo:**
```
┌─────────────────────────────┐
│ 🎊 Confeti Premium          │
│ CONSUMIBLE                  │
│ €5.00/unidad               │
│ Stock: 50 unidades         │
└─────────────────────────────┘
```

### **En el Carrito:**
```
PRODUCTOS DE ALQUILER:
- Mesa DJ (3 días) .... €150.00
- Altavoz (3 días) .... €90.00

CONSUMIBLES:
- Confeti (5 unidades) . €25.00
- Líquido humo (2L) ... €15.00

SUBTOTAL ALQUILER: €240.00
SUBTOTAL CONSUMIBLES: €40.00
```

### **En la Factura:**
```
ALQUILER (01/01/2026 - 03/01/2026):
Mesa DJ ×1 .............. €150.00
Altavoz ×1 .............. €90.00

CONSUMIBLES:
Confeti ×5 .............. €25.00
Líquido humo ×2 ......... €15.00

SUBTOTAL: €280.00
IVA (21%): €58.80
TOTAL: €338.80
```

---

## ✅ **Reglas de Negocio**

### **Stock:**
- ✅ Los consumibles restan stock al vender
- ✅ No se "reservan" como los productos de alquiler
- ✅ Stock disponible = Stock total - Vendidos

### **Precio:**
- ✅ Precio único por unidad (no varía por días)
- ✅ Se suma al total del pedido
- ✅ IVA 21% igual que los alquileres

### **Envío:**
- ✅ Si el pedido ya tiene envío (por alquiler), los consumibles se incluyen
- ✅ Si solo hay consumibles, se cobra envío aparte

### **Fianza:**
- ❌ Los consumibles NO tienen fianza
- ✅ Solo se calcula fianza para productos de alquiler

---

## 🔄 **Flujo de Compra**

### **Usuario:**
1. Añade producto consumible al carrito
2. Especifica cantidad (ej: 5 bolsas de confeti)
3. Se suma al total
4. Al pagar, el stock se resta automáticamente

### **Admin:**
1. Crea producto consumible en panel de admin
2. Marca checkbox "Es consumible"
3. Define precio por unidad
4. Establece stock inicial
5. El sistema gestiona automáticamente las ventas

---

## 📁 **Archivos Modificados**

### **Backend:**
- ✅ `schema.prisma` - Añadidos campos `isConsumable` y `pricePerUnit`

### **Próximos pasos (pendientes):**
- [ ] Backend: Actualizar `product.controller.ts` para manejar consumibles
- [ ] Backend: Actualizar `cart.service.ts` para calcular precio de consumibles
- [ ] Backend: Actualizar `order.service.ts` para restar stock de consumibles
- [ ] Frontend: Añadir checkbox "Es consumible" en ProductsManager
- [ ] Frontend: Mostrar badge "CONSUMIBLE" en catálogo
- [ ] Frontend: Carrito: separar alquileres de consumibles
- [ ] Frontend: Detalle de producto: mostrar "Precio por unidad" en lugar de "por día"

---

## 🎯 **Categorías Sugeridas**

Crear una nueva categoría llamada:
- **"Consumibles"** o
- **"Accesorios"** o
- **"Artículos de Venta"**

O integrarlos en categorías existentes:
- FX → Líquido de humo, confeti
- Cableado → Cables que se quedan
- Etc.

---

## 💡 **Casos de Uso**

### **Caso 1: Cliente alquila + compra consumibles**
```
Cliente reserva:
- 2 máquinas de humo (alquiler 3 días) ... €180.00
- 4 litros de líquido de humo (consumible) €60.00

Pedido:
- Alquiler: €180.00 (se devuelve)
- Consumibles: €60.00 (se queda el cliente)
- Fianza: €50.00 (solo por las máquinas)

Total a pagar: €240.00 + Fianza €50.00
Al devolver: Reembolso de €50.00
```

### **Caso 2: Solo consumibles**
```
Cliente compra:
- 10 bolsas de confeti ... €50.00
- 5 packs de pilas .......  €25.00

Pedido:
- Consumibles: €75.00
- IVA: €15.75
- Total: €90.75

Sin fianza, sin devolución.
```

---

## 🚀 **Estado Actual**

✅ Base de datos actualizada
⏳ Backend pendiente
⏳ Frontend pendiente

**Próximo paso:** Implementar lógica en backend y frontend
