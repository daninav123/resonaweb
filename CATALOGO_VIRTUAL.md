# 💼 SISTEMA DE CATÁLOGO VIRTUAL - Productos Sin Stock Físico

**Fecha:** 13 de Noviembre de 2025  
**Estado:** ✅ Sistema preparado y listo

---

## 🎯 TU ESTRATEGIA DE NEGOCIO

### **Objetivo:**
Mostrar muchos productos en la web (que no tienes físicamente) para:
1. ✅ Ampliar catálogo visualmente
2. ✅ Captar interés de clientes
3. ✅ Próximo mes siempre ocupado (auto-bloqueado)
4. ✅ Si alguien quiere reservar → Registras manualmente → Compras el producto

### **Ventajas:**
- 💰 No inviertes en stock hasta que haya demanda real
- 📊 Ves qué productos interesan más
- 🚀 Catálogo grande sin inversión inicial
- ⏰ 30 días para conseguir el producto

---

## 🗄️ SISTEMA YA PREPARADO EN TU BD

Tu tabla `Product` ya tiene estos campos perfectos:

```typescript
Product {
  // Stock real vs mostrado
  stock: 0              // Stock "mostrado" (puede ser ficticio)
  realStock: 0          // Stock REAL que tienes
  
  // Estado del producto
  stockStatus: "ON_DEMAND"  // Bajo demanda
  
  // Tiempo de espera
  leadTimeDays: 30      // Días necesarios para conseguirlo
  
  // ¿Se puede comprar bajo demanda?
  canBuyOnDemand: true
  
  // Compra futura
  markedForPurchase: false
  purchaseNotes: "..."
  purchasePriority: 1-10
}
```

---

## 📝 CÓMO CONFIGURAR PRODUCTOS VIRTUALES

### **Opción 1: Al Crear Producto**

```javascript
// En el formulario de crear producto
{
  name: "Cámara Sony A7S III",
  sku: "CAM-SONY-A7S3",
  
  // Precios normales
  pricePerDay: 150,
  
  // CONFIGURACIÓN CLAVE
  stock: 1,                    // ← Mostrar como "disponible"
  realStock: 0,                // ← Pero NO lo tienes
  stockStatus: "ON_DEMAND",    // ← Bajo demanda
  leadTimeDays: 30,            // ← 30 días para conseguirlo
  canBuyOnDemand: true,        // ← Sí se puede pedir
  
  // Notas internas
  purchaseNotes: "Comprar en MediaMarkt si hay pedido"
}
```

### **Opción 2: Productos Existentes**

```javascript
// Editar producto existente
{
  // Mantén todo igual, solo cambia:
  stockStatus: "ON_DEMAND",
  realStock: 0,
  leadTimeDays: 30
}
```

---

## 🔒 CÓMO FUNCIONA EL BLOQUEO AUTOMÁTICO

### **1. Cliente ve el producto:**
```
✅ Producto visible en catálogo
✅ Precio mostrado
✅ Botón "Consultar disponibilidad"
```

### **2. Cliente selecciona fechas:**
```javascript
// Si fecha está en próximos 30 días:
if (selectedDate < now + leadTimeDays) {
  return "NO DISPONIBLE - Reserva con 30 días de antelación"
}

// Resultado visual:
Calendario:
  [X] [X] [X] [X] [X] [X] [X]  ← Próximos 30 días BLOQUEADOS
  [ ] [ ] [ ] [ ] [ ] [ ] [ ]  ← Día 31+ DISPONIBLES
```

### **3. Cliente quiere reservar para dentro de 35 días:**
```
1. Cliente: "Quiero reservar para el 15 de Enero"
2. Sistema: "✅ Disponible - Total: €XXX"
3. Cliente: Confirma y paga
4. Sistema: Notifica al admin
5. Admin: ¡Tienes 30 días para comprar el producto!
```

---

## 🎨 INTERFAZ EN EL FRONTEND

### **En el Catálogo Público:**

```
┌────────────────────────────────────────┐
│  📷 Cámara Sony A7S III               │
│  €150/día                              │
│                                        │
│  🕒 Disponible bajo demanda            │
│  📦 Entrega en 30 días                 │
│                                        │
│  [Consultar Disponibilidad]            │
└────────────────────────────────────────┘
```

### **Al Seleccionar Fechas:**

```
Calendario de Reserva:

Noviembre 2025        Diciembre 2025       Enero 2026
 L M X J V S D        L M X J V S D       L M X J V S D
[X][X][X][X][X][X][X] [X][X][X][X][X][X][X] [ ][ ][ ][ ][ ][ ][ ]
[X][X][X][X][X][X][X] [X][X][X][X][X][X][X] [✓][✓][✓][✓][✓][✓][✓]
 ← NO DISPONIBLE →     ← NO DISPONIBLE →    ← DISPONIBLE →

[X] = Bloqueado (próximos 30 días)
[✓] = Disponible (a partir del día 31)

⚠️ Este producto requiere reserva con 30 días de antelación
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Backend: Lógica de Disponibilidad**

```typescript
// packages/backend/src/services/availability.service.ts

export const checkProductAvailability = async (
  productId: string,
  startDate: Date,
  endDate: Date
) => {
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  // Si es producto bajo demanda
  if (product.stockStatus === 'ON_DEMAND') {
    const today = new Date();
    const leadTime = product.leadTimeDays || 30;
    const minimumDate = addDays(today, leadTime);

    // Si fecha de inicio es antes del mínimo
    if (startDate < minimumDate) {
      return {
        available: false,
        reason: 'LEAD_TIME_REQUIRED',
        message: `Este producto requiere reserva con ${leadTime} días de antelación`,
        minimumDate: minimumDate,
        canPurchaseOnDemand: product.canBuyOnDemand
      };
    }
  }

  // Continuar con lógica normal de disponibilidad
  return checkStandardAvailability(product, startDate, endDate);
};
```

### **Frontend: Componente de Calendario**

```typescript
// packages/frontend/src/components/ProductCalendar.tsx

const ProductCalendar = ({ product }) => {
  const isDateAvailable = (date: Date) => {
    // Si es producto bajo demanda
    if (product.stockStatus === 'ON_DEMAND') {
      const today = new Date();
      const leadTime = product.leadTimeDays || 30;
      const minimumDate = addDays(today, leadTime);
      
      // Bloquear fechas antes del lead time
      if (date < minimumDate) {
        return false;
      }
    }
    
    // Check disponibilidad normal
    return checkNormalAvailability(date);
  };

  return (
    <Calendar
      tileDisabled={({ date }) => !isDateAvailable(date)}
      tileClassName={({ date }) => {
        const leadTime = product.leadTimeDays || 30;
        const minimumDate = addDays(new Date(), leadTime);
        
        if (date < minimumDate) {
          return 'blocked-lead-time'; // Clase CSS roja
        }
        return 'available'; // Clase CSS verde
      }}
    />
  );
};
```

---

## 📊 PANEL DE ADMIN - Gestión de Catálogo Virtual

### **Vista de Productos:**

```
┌──────────────────────────────────────────────────────────┐
│  PRODUCTOS - Vista Admin                                 │
├──────────────────────────────────────────────────────────┤
│  Nombre          │Stock Real│Mostrado│Estado│Lead Time  │
├──────────────────────────────────────────────────────────┤
│  Sony A7S III   │    0     │   1    │ 🟡   │ 30 días   │
│  Canon R5       │    0     │   1    │ 🟡   │ 30 días   │
│  Altavoz JBL    │    5     │   5    │ 🟢   │ Inmediato │
│  Micrófono Rode │    0     │   1    │ 🟡   │ 45 días   │
└──────────────────────────────────────────────────────────┘

🟢 EN STOCK (realStock > 0)
🟡 BAJO DEMANDA (realStock = 0, stockStatus = ON_DEMAND)
🔴 NO DISPONIBLE (stockStatus = DISCONTINUED)
```

### **Editar Producto - Sección "Stock Virtual":**

```
┌──────────────────────────────────────────────────────────┐
│  CONFIGURACIÓN DE STOCK                                  │
├──────────────────────────────────────────────────────────┤
│  Stock Real (físico):      [0]                           │
│  Stock Mostrado (web):     [1]                           │
│                                                          │
│  Estado de Stock:                                        │
│  ( ) En Stock                                            │
│  (•) Bajo Demanda        ← SELECCIONADO                  │
│  ( ) Descontinuado                                       │
│                                                          │
│  Días de Anticipación:    [30] días                      │
│  ¿Comprar bajo demanda?   [✓] Sí                         │
│                                                          │
│  Notas de Compra:                                        │
│  [Proveedor: MediaMarkt                        ]         │
│  [Precio compra: ~€3,000                       ]         │
│  [Enlace: mediamarkt.es/sony-a7s-iii          ]         │
│                                                          │
│  Prioridad de Compra:     [●●●○○] (3/5)                 │
│  [ ] Marcar para compra inmediata                        │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 FLUJO COMPLETO DE EJEMPLO

### **Caso: Cliente quiere alquilar Sony A7S III**

```
DÍA 1 (13 Nov)
  Cliente: Ve Sony A7S III en web
  Cliente: Click "Consultar Disponibilidad"
  Sistema: Muestra calendario
  
  Próximos 30 días: [X][X][X][X] BLOQUEADOS
  A partir del 13 Dic: [✓][✓][✓] DISPONIBLES

DÍA 1 (13 Nov)
  Cliente: "Quiero reservar del 20-22 Diciembre"
  Sistema: "✅ Disponible - Total: €450"
  Cliente: Confirma reserva y paga €450

DÍA 1 (13 Nov) - NOTIFICACIÓN ADMIN
  📧 Email a admin:
  
  🚨 NUEVA RESERVA - PRODUCTO BAJO DEMANDA
  
  Producto: Sony A7S III
  Cliente: Juan Pérez
  Fechas: 20-22 Diciembre 2025
  Total: €450
  
  ⚠️ ACCIÓN REQUERIDA:
  - Comprar producto antes del 20 Diciembre
  - Tienes 37 días para conseguirlo
  
  Notas guardadas:
  - Proveedor: MediaMarkt
  - Precio: €3,000
  - Link: mediamarkt.es/...

DÍA 2-37 (14 Nov - 19 Dic)
  Admin: Compra Sony A7S III
  Admin: Actualiza en sistema:
    - realStock: 0 → 1
    - stockStatus: ON_DEMAND → IN_STOCK
    - markedForPurchase: false

DÍA 38 (20 Dic)
  Sistema: Entrega Sony A7S III a cliente
  Cliente: Feliz con su alquiler
  Admin: Ganó €450 - €3,000 = -€2,550 (inversión)

FUTURO
  Cada alquiler: +€450 (100% beneficio)
  ROI: 6-7 alquileres = Producto pagado
```

---

## 📈 DASHBOARD PARA ADMIN

### **Sección "Productos Virtuales":**

```
┌──────────────────────────────────────────────────────────┐
│  📊 PRODUCTOS BAJO DEMANDA - ESTADO                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Total productos virtuales:        28                    │
│  Reservas pendientes:              3                     │
│  Productos a comprar:              3                     │
│  Inversión pendiente:              €8,450                │
│                                                          │
│  ⚠️ PRÓXIMAS ACCIONES:                                   │
│                                                          │
│  1. Sony A7S III                                         │
│     Reserva: 20 Dic | Quedan: 37 días | €3,000          │
│     [Ver Detalles] [Marcar como comprado]               │
│                                                          │
│  2. Canon R5                                             │
│     Reserva: 5 Ene | Quedan: 53 días | €3,800           │
│     [Ver Detalles] [Marcar como comprado]               │
│                                                          │
│  3. Drone DJI                                            │
│     Reserva: 15 Ene | Quedan: 63 días | €1,650          │
│     [Ver Detalles] [Marcar como comprado]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 🔄 GESTIÓN DE PRODUCTOS COMPRADOS

### **Cuando compras el producto:**

```
Panel Admin → Productos → Sony A7S III

1. Click "Editar"
2. Cambiar:
   ✓ Stock Real: 0 → 1
   ✓ Estado: ON_DEMAND → IN_STOCK
   ✓ Días anticipación: 30 → 0
3. Guardar

Resultado:
  ✅ Producto ahora disponible inmediatamente
  ✅ Calendario sin bloqueos
  ✅ Clientes pueden reservar cualquier día
```

---

## 💰 ANÁLISIS DE RENTABILIDAD

### **Panel "Inversión en Catálogo Virtual":**

```
┌──────────────────────────────────────────────────────────┐
│  📊 ANÁLISIS DE RENTABILIDAD - Productos Bajo Demanda   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Sony A7S III                                            │
│  ├─ Inversión inicial:        €3,000                     │
│  ├─ Total alquileres:         6 veces                    │
│  ├─ Ingresos generados:       €2,700 (6 x €450)         │
│  ├─ Balance:                  -€300                      │
│  └─ Estado:                   🟡 Recuperando             │
│                                                          │
│  Canon R5                                                │
│  ├─ Inversión inicial:        €3,800                     │
│  ├─ Total alquileres:         12 veces                   │
│  ├─ Ingresos generados:       €7,200 (12 x €600)        │
│  ├─ Balance:                  +€3,400                    │
│  └─ Estado:                   ✅ Rentable                │
│                                                          │
│  TOTALES:                                                │
│  Inversión total:             €18,450                    │
│  Ingresos totales:            €24,750                    │
│  Beneficio neto:              +€6,300                    │
│  ROI:                         34% (6 meses)              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **FASE 1: Configurar Productos Virtuales**
- [ ] Ir a Admin → Productos
- [ ] Crear o editar productos
- [ ] Configurar:
  - Stock Real: 0
  - Stock Mostrado: 1
  - Estado: ON_DEMAND
  - Lead Time: 30 días
  - Compra bajo demanda: Sí
  - Notas de compra: Proveedor, precio, link

### **FASE 2: Verificar Frontend**
- [ ] Ir a catálogo público
- [ ] Ver productos "Bajo Demanda"
- [ ] Probar calendario de reservas
- [ ] Confirmar próximos 30 días bloqueados
- [ ] Confirmar día 31+ disponibles

### **FASE 3: Proceso de Reserva**
- [ ] Cliente hace reserva (día 31+)
- [ ] Recibir notificación por email
- [ ] Ver en Admin → Pedidos
- [ ] Comprar producto físico
- [ ] Actualizar stock real en sistema

### **FASE 4: Monitoreo**
- [ ] Revisar dashboard diariamente
- [ ] Ver productos con reservas pendientes
- [ ] Planificar compras
- [ ] Actualizar estados

---

## 🎓 TIPS Y MEJORES PRÁCTICAS

### **1. Lead Time Realista**
```
Producto fácil de conseguir: 15-20 días
Producto normal: 30 días
Producto difícil/importado: 45-60 días
```

### **2. Notas de Compra Completas**
```
✅ Proveedor específico
✅ Precio actualizado
✅ Link directo al producto
✅ Alternativas si no hay stock
✅ Tiempo de entrega del proveedor
```

### **3. Priorización**
```
Alta prioridad (5/5):
  - Productos con múltiples reservas
  - Productos muy demandados
  - Productos con margen alto

Baja prioridad (1/5):
  - Una sola reserva
  - Producto nicho
  - Margen bajo
```

### **4. Comunicación con Clientes**
```
Email automático tras reserva:

"✅ Reserva Confirmada - Sony A7S III

Fechas: 20-22 Diciembre 2025
Total: €450

⚠️ IMPORTANTE:
Este producto se prepara bajo demanda.
Confirmaremos disponibilidad 7 días antes.

Si necesitas cancelar, hazlo con 48h de antelación."
```

---

## 🚨 CASOS ESPECIALES

### **¿Qué pasa si NO consigues el producto?**

```
PLAN B:
1. Contactar cliente inmediatamente
2. Ofrecer alternativas:
   - Producto similar (mismo precio)
   - Descuento en futuro alquiler
   - Reembolso completo

3. Actualizar sistema:
   - stockStatus: DISCONTINUED
   - purchaseNotes: "No disponible con proveedores"
```

### **¿Cliente quiere reservar YA (dentro de 30 días)?**

```
SOLUCIÓN:
1. Admin puede hacer reserva manual
2. Admin → Nuevo Pedido
3. Seleccionar "Omitir validación de lead time"
4. Crear pedido directamente
5. ¡Corre a comprar el producto!
```

---

## 📊 RESUMEN EJECUTIVO

```
✅ Amplía catálogo sin inversión inicial
✅ Próximos 30 días siempre bloqueados
✅ Cliente solo puede reservar día 31+
✅ Te da tiempo para comprar producto
✅ Ves qué productos tienen demanda real
✅ Reduces riesgo de stock sin salida
✅ Dashboard para gestionar compras
✅ Análisis de rentabilidad
✅ Comunicación automática con clientes
✅ Sistema ya preparado en tu BD
```

---

## 🚀 ¿QUIERES QUE LO IMPLEMENTE AHORA?

Puedo crear:
1. ✅ Interface en admin para gestionar productos virtuales
2. ✅ Lógica de bloqueo de calendario (30 días)
3. ✅ Dashboard de productos pendientes de compra
4. ✅ Sistema de notificaciones automáticas
5. ✅ Análisis de rentabilidad

**¿Empiezo con la implementación?** 🎯
