# 📅 Sistema de Disponibilidad y Stock - ReSona

## 🎯 Objetivo

Gestionar el stock de productos en tiempo real, considerando las reservas por fechas, para evitar sobreventa y garantizar disponibilidad.

## 📊 Concepto Clave

**Stock ≠ Disponibilidad**

- **Stock:** Cantidad total física de un producto (ej: 4 altavoces)
- **Disponibilidad:** Stock disponible en un rango de fechas específico

```
Disponibilidad = Stock Total - Stock Reservado en esas fechas
```

## 🔢 Ejemplo Práctico

### Escenario Inicial
```
Producto: Altavoces JBL PRX815
Stock total: 4 unidades
```

### Reserva 1
```
Cliente: Juan Pérez
Pedido: RES-2024-0001
Cantidad: 2 altavoces
Fechas: 1-3 diciembre 2024
Estado: CONFIRMED
```

### Resultado de Disponibilidad

#### 30 noviembre
- Stock reservado: 0
- **Disponible: 4 unidades** ✅

#### 1, 2, 3 diciembre
- Stock reservado: 2 (pedido RES-2024-0001)
- **Disponible: 2 unidades** 🟡

#### 4 diciembre
- Stock reservado: 0 (pedido terminó el día 3)
- **Disponible: 4 unidades** ✅

### Nueva Reserva 2
```
Cliente: María García
Pedido: RES-2024-0002
Cantidad: 2 altavoces
Fechas: 2-4 diciembre 2024
Estado: CONFIRMED
```

### Resultado Final de Disponibilidad

| Fecha | Pedidos Activos | Reservado | Disponible |
|-------|----------------|-----------|------------|
| 30 nov | - | 0 | **4** ✅ |
| 1 dic | RES-0001 | 2 | **2** 🟡 |
| 2 dic | RES-0001, RES-0002 | 4 | **0** 🔴 |
| 3 dic | RES-0001, RES-0002 | 4 | **0** 🔴 |
| 4 dic | RES-0002 | 2 | **2** 🟡 |
| 5 dic | - | 0 | **4** ✅ |

## 💻 Implementación Técnica

### Backend: Servicio de Disponibilidad

```typescript
// services/availability.service.ts

interface AvailabilityQuery {
  productId: string;
  startDate: Date;
  endDate: Date;
}

interface AvailabilityResult {
  productId: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  isAvailable: boolean;
  conflictingOrders: string[];
}

export class AvailabilityService {
  
  /**
   * Calcula disponibilidad de un producto en un rango de fechas
   */
  async checkAvailability(
    query: AvailabilityQuery
  ): Promise<AvailabilityResult> {
    const { productId, startDate, endDate } = query;
    
    // 1. Obtener stock total del producto
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true }
    });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // 2. Buscar pedidos que se solapen con el rango de fechas
    const overlappingOrders = await prisma.order.findMany({
      where: {
        // Contiene este producto
        items: {
          some: { productId: productId }
        },
        // Estados que ocupan stock
        status: {
          in: ['CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED']
        },
        // Fechas se solapan
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } }
        ]
      },
      include: {
        items: {
          where: { productId: productId }
        }
      }
    });
    
    // 3. Calcular stock reservado
    const reservedStock = overlappingOrders.reduce((sum, order) => {
      const item = order.items.find(i => i.productId === productId);
      return sum + (item?.quantity || 0);
    }, 0);
    
    // 4. Calcular disponibilidad
    const availableStock = product.stock - reservedStock;
    const isAvailable = availableStock > 0;
    
    return {
      productId,
      totalStock: product.stock,
      availableStock: Math.max(0, availableStock),
      reservedStock,
      isAvailable,
      conflictingOrders: overlappingOrders.map(o => o.orderNumber)
    };
  }
  
  /**
   * Verifica disponibilidad de múltiples productos
   */
  async checkMultipleAvailability(
    products: Array<{ productId: string; quantity: number }>,
    startDate: Date,
    endDate: Date
  ): Promise<{
    allAvailable: boolean;
    results: AvailabilityResult[];
    unavailableProducts: string[];
  }> {
    const results = await Promise.all(
      products.map(p => 
        this.checkAvailability({
          productId: p.productId,
          startDate,
          endDate
        })
      )
    );
    
    const unavailableProducts = products
      .filter((p, i) => results[i].availableStock < p.quantity)
      .map((p, i) => results[i].productId);
    
    return {
      allAvailable: unavailableProducts.length === 0,
      results,
      unavailableProducts
    };
  }
  
  /**
   * Obtiene calendario de disponibilidad de un producto (30 días)
   */
  async getAvailabilityCalendar(
    productId: string,
    startDate: Date,
    days: number = 30
  ): Promise<Array<{
    date: Date;
    available: number;
    reserved: number;
    percentage: number;
  }>> {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) throw new Error('Product not found');
    
    const calendar = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const availability = await this.checkAvailability({
        productId,
        startDate: date,
        endDate: endOfDay
      });
      
      calendar.push({
        date,
        available: availability.availableStock,
        reserved: availability.reservedStock,
        percentage: (availability.availableStock / product.stock) * 100
      });
    }
    
    return calendar;
  }
}
```

### Endpoints de API

#### POST /api/v1/availability/check
Verificar disponibilidad de productos.

**Request:**
```json
{
  "products": [
    {
      "productId": "uuid-altavoces",
      "quantity": 2
    },
    {
      "productId": "uuid-mezcladora",
      "quantity": 1
    }
  ],
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-03T23:59:59Z"
}
```

**Response:**
```json
{
  "allAvailable": true,
  "results": [
    {
      "productId": "uuid-altavoces",
      "totalStock": 4,
      "availableStock": 2,
      "reservedStock": 2,
      "isAvailable": true,
      "conflictingOrders": ["RES-2024-0001"]
    },
    {
      "productId": "uuid-mezcladora",
      "totalStock": 3,
      "availableStock": 3,
      "reservedStock": 0,
      "isAvailable": true,
      "conflictingOrders": []
    }
  ]
}
```

#### GET /api/v1/products/:id/availability-calendar
Calendario de disponibilidad (Admin).

**Query Params:**
- `startDate` - Fecha inicial (default: hoy)
- `days` - Número de días (default: 30)

**Response:**
```json
{
  "productId": "uuid-altavoces",
  "productName": "Altavoces JBL PRX815",
  "totalStock": 4,
  "calendar": [
    {
      "date": "2024-12-01",
      "available": 2,
      "reserved": 2,
      "percentage": 50,
      "status": "PARTIAL"
    },
    {
      "date": "2024-12-02",
      "available": 0,
      "reserved": 4,
      "percentage": 0,
      "status": "FULL"
    },
    {
      "date": "2024-12-03",
      "available": 4,
      "reserved": 0,
      "percentage": 100,
      "status": "AVAILABLE"
    }
  ]
}
```

## 🎨 Frontend: Componentes UI

### 1. Selector de Fechas con Disponibilidad

```typescript
// components/AvailabilityChecker.tsx
import { useState, useEffect } from 'react';
import { DateRangePicker } from './DateRangePicker';
import { checkAvailability } from '../services/api';

export const AvailabilityChecker = ({ productId, maxStock }) => {
  const [dateRange, setDateRange] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (dateRange) {
      checkProductAvailability();
    }
  }, [dateRange]);
  
  const checkProductAvailability = async () => {
    setLoading(true);
    try {
      const result = await checkAvailability({
        products: [{ productId, quantity: 1 }],
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setAvailability(result.results[0]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="availability-checker">
      <DateRangePicker 
        onChange={setDateRange}
        minDate={new Date()}
      />
      
      {loading && <Spinner />}
      
      {availability && (
        <div className="availability-status">
          {availability.isAvailable ? (
            <>
              <CheckCircle className="text-green-500" />
              <span className="text-green-700">
                Disponible: {availability.availableStock} unidades
              </span>
              
              <QuantitySelector 
                max={availability.availableStock}
                onChange={handleQuantityChange}
              />
            </>
          ) : (
            <>
              <XCircle className="text-red-500" />
              <span className="text-red-700">
                No disponible para estas fechas
              </span>
              <p className="text-sm text-gray-600">
                Todas las unidades están reservadas.
                Prueba con otras fechas.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
```

### 2. Calendario de Disponibilidad (Admin)

```typescript
// components/admin/AvailabilityCalendar.tsx
export const AvailabilityCalendar = ({ productId }) => {
  const [calendar, setCalendar] = useState([]);
  
  useEffect(() => {
    loadCalendar();
  }, [productId]);
  
  const loadCalendar = async () => {
    const data = await api.get(
      `/products/${productId}/availability-calendar`
    );
    setCalendar(data.calendar);
  };
  
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-200';
    if (percentage >= 25) return 'bg-yellow-200';
    return 'bg-red-200';
  };
  
  return (
    <div className="calendar-grid">
      {calendar.map((day) => (
        <div 
          key={day.date}
          className={`calendar-day ${getStatusColor(day.percentage)}`}
          title={`${day.available}/${day.available + day.reserved} disponibles`}
        >
          <div className="date">
            {format(new Date(day.date), 'd')}
          </div>
          <div className="availability">
            {day.available}/{day.available + day.reserved}
          </div>
        </div>
      ))}
    </div>
  );
};
```

## 🔒 Validaciones Críticas

### 1. Al Crear Pedido
```typescript
// controllers/orders.controller.ts
export async function createOrder(req, res) {
  const { items, startDate, endDate } = req.body;
  
  // CRÍTICO: Verificar disponibilidad antes de crear
  const availabilityCheck = await availabilityService.checkMultipleAvailability(
    items,
    new Date(startDate),
    new Date(endDate)
  );
  
  if (!availabilityCheck.allAvailable) {
    return res.status(409).json({
      error: {
        code: 'PRODUCT_NOT_AVAILABLE',
        message: 'Algunos productos no están disponibles',
        unavailableProducts: availabilityCheck.unavailableProducts
      }
    });
  }
  
  // Crear pedido...
}
```

### 2. Al Añadir al Carrito (Frontend)
```typescript
const addToCart = async (product, quantity, dates) => {
  // Verificar disponibilidad en tiempo real
  const availability = await checkAvailability({
    products: [{ productId: product.id, quantity }],
    startDate: dates.start,
    endDate: dates.end
  });
  
  if (!availability.allAvailable) {
    toast.error('Este producto ya no está disponible para esas fechas');
    return;
  }
  
  cart.add(product, quantity, dates);
};
```

## 📋 Estados de Pedido que Ocupan Stock

```typescript
const STOCK_BLOCKING_STATUSES = [
  'CONFIRMED',      // Confirmado
  'PREPARING',      // En preparación
  'READY',          // Listo para entrega
  'IN_TRANSIT',     // En tránsito
  'DELIVERED'       // Entregado (en el evento)
];

// NO ocupan stock:
const NON_BLOCKING_STATUSES = [
  'PENDING',        // Pendiente (no confirmado aún)
  'RETURNED',       // Ya devuelto
  'COMPLETED',      // Completado
  'CANCELLED'       // Cancelado
];
```

## 🎯 Casos Especiales

### 1. Pedido Cancelado
```typescript
// Al cancelar un pedido, el stock se libera automáticamente
await prisma.order.update({
  where: { id: orderId },
  data: { 
    status: 'CANCELLED',
    cancelledAt: new Date()
  }
});

// El stock queda disponible inmediatamente para esas fechas
```

### 2. Devolución Anticipada
```typescript
// Si el cliente devuelve antes de tiempo
await prisma.order.update({
  where: { id: orderId },
  data: { 
    status: 'RETURNED',
    returnedAt: new Date(),
    actualEndDate: new Date() // Fecha real de devolución
  }
});

// Stock disponible desde la fecha de devolución
```

### 3. Ampliación de Alquiler
```typescript
// Cliente quiere extender el alquiler
// 1. Verificar disponibilidad de los días adicionales
const extended Availability = await checkAvailability({
  productId,
  startDate: currentEndDate,
  endDate: newEndDate
});

if (!extendedAvailability.isAvailable) {
  throw new Error('No disponible para ampliar fechas');
}

// 2. Actualizar pedido
await prisma.order.update({
  where: { id: orderId },
  data: { endDate: newEndDate }
});
```

## 📊 Reports para Admin

### Dashboard: Vista de Ocupación
```sql
-- Productos más solicitados
SELECT 
  p.name,
  COUNT(DISTINCT o.id) as total_rentals,
  AVG((o.endDate - o.startDate)) as avg_duration_days,
  SUM(oi.quantity) as total_units_rented
FROM products p
JOIN order_items oi ON oi.productId = p.id
JOIN orders o ON o.id = oi.orderId
WHERE o.status NOT IN ('CANCELLED', 'PENDING')
GROUP BY p.id
ORDER BY total_rentals DESC;
```

### Calendario de Próximos 30 Días
```
Altavoces JBL PRX815
════════════════════════════════════════════
Diciembre 2024
Lun Mar Mié Jue Vie Sáb Dom
    1   2   3   4   5   6   7
   2/4 0/4 0/4 2/4 4/4 4/4 4/4
   🟡  🔴  🔴  🟡  🟢  🟢  🟢

8   9  10  11  12  13  14
4/4 1/4 1/4 1/4 4/4 4/4 4/4
🟢  🟡  🟡  🟡  🟢  🟢  🟢
```

## ⚠️ Consideraciones Importantes

### 1. Race Conditions
```typescript
// Usar transacciones para prevenir doble reserva
await prisma.$transaction(async (tx) => {
  // 1. Verificar disponibilidad
  const availability = await checkAvailability(...);
  
  if (!availability.isAvailable) {
    throw new Error('Not available');
  }
  
  // 2. Crear pedido inmediatamente
  const order = await tx.order.create({...});
  
  return order;
});
```

### 2. Caché de Disponibilidad
```typescript
// Cache de 30 segundos para consultas de disponibilidad
import { Redis } from 'ioredis';

const cacheKey = `availability:${productId}:${startDate}:${endDate}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const availability = await calculateAvailability(...);
await redis.setex(cacheKey, 30, JSON.stringify(availability));

return availability;
```

### 3. Buffer de Seguridad (Opcional)
```typescript
// Reservar 1 día extra para limpieza/mantenimiento
const effectiveEndDate = addDays(order.endDate, 1);

// Usar effectiveEndDate para cálculos de disponibilidad
```

## 🧪 Tests

```typescript
describe('Availability Service', () => {
  it('should calculate correct availability with overlapping orders', async () => {
    // Setup
    const product = await createTestProduct({ stock: 4 });
    await createTestOrder({
      productId: product.id,
      quantity: 2,
      startDate: '2024-12-01',
      endDate: '2024-12-03'
    });
    
    // Test
    const availability = await availabilityService.checkAvailability({
      productId: product.id,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-03')
    });
    
    // Assert
    expect(availability.availableStock).toBe(2);
    expect(availability.reservedStock).toBe(2);
    expect(availability.isAvailable).toBe(true);
  });
  
  it('should return zero availability when fully booked', async () => {
    const product = await createTestProduct({ stock: 2 });
    await createTestOrder({
      productId: product.id,
      quantity: 2,
      startDate: '2024-12-01',
      endDate: '2024-12-03'
    });
    
    const availability = await availabilityService.checkAvailability({
      productId: product.id,
      startDate: new Date('2024-12-02'),
      endDate: new Date('2024-12-02')
    });
    
    expect(availability.availableStock).toBe(0);
    expect(availability.isAvailable).toBe(false);
  });
});
```

## 📝 Resumen

### ✅ Lo que SÍ hace el sistema:
- Calcula disponibilidad en tiempo real por fechas
- Muestra stock disponible al cliente
- Bloquea stock al confirmar pedido
- Libera stock al cancelar/completar pedido
- Previene sobreventa
- Calendario visual para admin

### ❌ Lo que NO hace (pero podría añadirse):
- Reservas temporales (carrito no bloquea stock)
- Listas de espera cuando no hay disponibilidad
- Sugerencias de fechas alternativas
- Descuentos automáticos por baja ocupación

---

**¿Necesitas alguna aclaración o ajuste en este flujo?**
