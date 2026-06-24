# 🚨 SISTEMA DE ALERTAS DE STOCK MEJORADO

_Fecha: 20/11/2025 04:04_  
_Estado: IMPLEMENTADO_

---

## 🐛 **PROBLEMAS DEL SISTEMA ANTERIOR:**

### **1. No consideraba packs**
```
❌ ANTES:
Pack "Boda Premium" con:
- 2x Luces LED
- 1x Sonido  
- 4x Altavoces

Sistema NO detectaba que necesitaba stock de los componentes
```

### **2. Solo pedidos futuros**
```
❌ ANTES:
startDate: { gte: new Date() }

Ignoraba pedidos que están en curso
```

### **3. Cálculo incorrecto de stock**
```
❌ ANTES:
Calculaba por cada pedido individualmente
No acumulaba la demanda total de un producto
```

---

## ✅ **NUEVO SISTEMA - MEJORAS:**

### **1. Considera Packs y Sus Componentes** ✅

```typescript
// Si el pedido incluye un pack, descompone en componentes
if (product.isPack && product.components.length > 0) {
  for (const comp of product.components) {
    const quantityNeeded = comp.quantity * item.quantity;
    // Acumula demanda del componente
  }
}
```

**Ejemplo:**
```
Cliente pide:
- 2x Pack "Boda Premium"

Sistema detecta necesidad de:
- 4x Luces LED (2 packs × 2 unidades)
- 2x Sonido (2 packs × 1 unidad)
- 8x Altavoces (2 packs × 4 unidades)

Si stock actual:
- Luces LED: 3 → ⚠️ ALERTA: Faltan 1 unidad
- Sonido: 2 → ✅ OK
- Altavoces: 5 → ⚠️ ALERTA: Faltan 3 unidades
```

### **2. Incluye Pedidos en Curso** ✅

```typescript
where: {
  status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'] },
  endDate: { gte: new Date() }  // Que terminen después de hoy
}
```

**Considera:**
- ✅ Pedidos futuros
- ✅ Pedidos que están en curso
- ✅ Pedidos en tránsito
- ✅ Pedidos entregados (hasta que terminen)

### **3. Acumula Demanda Total** ✅

```typescript
// Mapa para acumular demanda por producto
const productDemand = new Map<string, {
  product: any;
  totalDemand: number;
  orders: Array<...>;
}>();

// Luego verifica:
const deficit = demand.totalDemand - currentStock;
```

**Ejemplo:**
```
Producto: Luces LED

Pedido A: 2 unidades (1-5 Dic)
Pedido B: 3 unidades (3-7 Dic)
Pack C: 4 unidades (componente) (10-15 Dic)

Total demanda: 2 + 3 + 4 = 9 unidades
Stock actual: 5 unidades
Déficit: 4 unidades → ⚠️ ALERTA
```

---

## 📊 **TIPOS DE ALERTAS:**

### **Prioridad Alta** 🔴
```
Déficit > 5 unidades
Requiere acción inmediata
```

### **Prioridad Media** 🟡
```
Déficit 3-5 unidades
Requiere planificación
```

### **Prioridad Baja** 🔵
```
Déficit 1-2 unidades
Monitorear
```

---

## 🔄 **FLUJO COMPLETO:**

```
1. Sistema revisa pedidos activos
   ↓
2. Para cada pedido:
   - Si es producto individual → Suma demanda
   - Si es pack → Descompone en componentes y suma demanda
   ↓
3. Acumula demanda total por producto
   ↓
4. Compara con stock actual
   ↓
5. Si demanda > stock → Genera alerta
   ↓
6. Clasifica por prioridad
   ↓
7. Muestra en panel admin
```

---

## 📡 **NUEVOS ENDPOINTS:**

### **GET /stock-alerts**
```
Obtiene todas las alertas de stock

Response:
{
  "alerts": [
    {
      "productId": "...",
      "productName": "Luces LED",
      "sku": "LED-001",
      "orderNumber": "ORD-12345",
      "quantityRequested": 9,
      "availableStock": 5,
      "deficit": 4,
      "priority": "medium",
      "affectedOrders": ["ORD-12345", "ORD-12346", "ORD-12347"]
    }
  ],
  "summary": {
    "totalAlerts": 5,
    "highPriority": 2,
    "mediumPriority": 2,
    "lowPriority": 1,
    "totalDeficit": 15
  }
}
```

### **GET /stock-alerts/product/:productId**
```
Obtiene alertas de un producto específico
```

### **POST /stock-alerts/mark-for-purchase**
```
Marca automáticamente productos con déficit para compra

Response:
{
  "message": "5 productos marcados para compra",
  "count": 5
}
```

---

## 💡 **EJEMPLOS PRÁCTICOS:**

### **Ejemplo 1: Pedido con Pack**

**Pedido:**
```
Cliente: Juan
Fecha: 15-20 Dic
Items:
- 1x Pack "Boda Premium"
- 2x Cámara 4K
```

**Sistema detecta:**
```
Demanda generada:
- 2x Luces LED (del pack)
- 1x Sonido (del pack)
- 4x Altavoces (del pack)
- 2x Cámara 4K (directo)

Stock actual vs demanda:
- Luces LED: 1 vs 2 → ⚠️ Falta 1
- Sonido: 1 vs 1 → ✅ OK
- Altavoces: 2 vs 4 → ⚠️ Faltan 2
- Cámara 4K: 3 vs 2 → ✅ OK

Alertas generadas: 2
- Luces LED: Déficit 1 (Baja prioridad)
- Altavoces: Déficit 2 (Baja prioridad)
```

### **Ejemplo 2: Múltiples Pedidos**

**Pedidos:**
```
Pedido A: 3x Luces LED (1-5 Dic)
Pedido B: 2x Luces LED (3-7 Dic)
Pedido C: 1x Pack Boda (5-10 Dic)
  → Incluye 2x Luces LED

Total demanda: 3 + 2 + 2 = 7 Luces LED
Stock actual: 4 Luces LED
Déficit: 3 unidades

Alerta generada:
- Producto: Luces LED
- Déficit: 3 unidades
- Prioridad: Media
- Pedidos afectados: ORD-A, ORD-B, ORD-C
```

---

## 🎯 **USO EN ADMIN:**

### **Ver Alertas:**
```
Panel Admin → Alertas de Stock

Verás:
┌──────────────────────────────────────────┐
│ 🚨 Alertas de Stock                      │
├──────────────────────────────────────────┤
│ Total: 5 alertas                         │
│ Alta prioridad: 2                        │
│ Faltantes: 15 unidades                   │
├──────────────────────────────────────────┤
│ [Todas] [Alta] [Media] [Baja]            │
├──────────────────────────────────────────┤
│ 🔴 Luces LED                             │
│ ├─ Déficit: 4 unidades                  │
│ ├─ Stock: 5 | Necesario: 9              │
│ ├─ Pedidos: ORD-123, ORD-124, ORD-125   │
│ └─ 🛒 Comprar: 4 unidades                │
├──────────────────────────────────────────┤
│ 🟡 Altavoces                             │
│ ├─ Déficit: 2 unidades                  │
│ └─ ...                                   │
└──────────────────────────────────────────┘
```

### **Marcar para Compra:**
```
Click "Marcar para Compra"
→ Productos con déficit se marcan automáticamente
→ Campo markedForPurchase = true
→ Aparecen en lista de compras
```

---

## ✅ **VENTAJAS DEL NUEVO SISTEMA:**

```
✅ Considera packs y componentes
✅ Acumula demanda total por producto
✅ Incluye pedidos en curso
✅ Muestra todos los pedidos afectados
✅ Prioriza alertas automáticamente
✅ Puede marcar productos para compra
✅ Logs detallados para debugging
✅ Más eficiente (una consulta vs múltiples)
```

---

## 🔧 **PARA USAR:**

**Reinicia el servidor backend:**
```bash
cd packages/backend
npm run dev
```

**Accede al panel:**
```
http://localhost:3000/admin/stock-alerts
```

---

_Implementado: 20/11/2025_  
_Archivos: stockAlert.service.ts, stock-alerts.routes.ts_  
_Estado: ✅ LISTO PARA USAR_
