# 📦 Sistema de Catálogo vs Stock Real - ReSona

## 🎯 Objetivo

Gestionar un **catálogo extenso** de productos (lo que puedes conseguir) vs **stock real** (lo que tienes físicamente):
- Mostrar catálogo amplio a clientes
- Trackear qué productos visitan y solicitan
- Comprar bajo demanda si hay tiempo (>1 mes)
- Control de stock real para disponibilidad inmediata

## 💡 Concepto

### Dos Niveles de Productos

```
CATÁLOGO (200+ productos)
├── EN STOCK (20 productos)
│   └── Disponibilidad: Inmediata
│
└── BAJO PEDIDO (180 productos)
    ├── >30 días: Disponible (te da tiempo a comprar)
    └── <30 días: No disponible
```

## 📊 Modelo de Datos

```typescript
model Product {
  // ... campos existentes
  
  // Stock y disponibilidad
  stock             Int       @default(0)
  realStock         Int       @default(0)     // ⭐ Stock físico real
  
  // Estado del producto
  stockStatus       StockStatus  @default(ON_DEMAND)
  
  // Política de adquisición
  leadTimeDays      Int       @default(30)    // Días necesarios para conseguirlo
  canBuyOnDemand    Boolean   @default(true)  // ¿Puedo comprarlo bajo pedido?
  
  // Tracking de interés
  viewCount         Int       @default(0)
  cartAddCount      Int       @default(0)     // Veces añadido al carrito
  quoteRequestCount Int       @default(0)     // Veces solicitado presupuesto
  orderCount        Int       @default(0)     // Veces realmente alquilado
  
  // Decisión de compra
  purchasePriority  Int?                      // 1-5, calculado automáticamente
  markedForPurchase Boolean   @default(false)
  purchaseNotes     String?
  
  // Proveedor
  supplier          String?
  supplierPrice     Decimal?  @db.Decimal(10, 2)
  supplierUrl       String?
}

enum StockStatus {
  IN_STOCK          // Tengo físicamente
  ON_DEMAND         // Puedo conseguir bajo pedido
  DISCONTINUED      // Ya no disponible
  SEASONAL          // Solo en temporada
}
```

### Tracking de Interacciones

```typescript
model ProductInteraction {
  id           String   @id @default(uuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  
  userId       String?  // Si está logueado
  sessionId    String   // Para usuarios anónimos
  
  // Tipo de interacción
  type         InteractionType
  
  // Contexto
  source       String?  // "search", "category", "related", "direct"
  referrer     String?
  
  // Metadata
  metadata     Json?    // Info adicional
  
  createdAt    DateTime @default(now())
  
  @@index([productId, type])
  @@index([createdAt])
}

enum InteractionType {
  VIEW              // Vio la página del producto
  ADD_TO_CART       // Añadió al carrito
  REMOVE_FROM_CART  // Quitó del carrito
  QUOTE_REQUEST     // Solicitó presupuesto
  AVAILABILITY_CHECK // Consultó disponibilidad
  ORDER_PLACED      // Completó pedido
  WISHLIST_ADD      // Añadió a favoritos
}

// Vista agregada para análisis
model ProductDemandAnalytics {
  id                    String   @id @default(uuid())
  productId             String   @unique
  product               Product  @relation(fields: [productId], references: [id])
  
  // Últimos 30 días
  views30d              Int      @default(0)
  cartAdds30d           Int      @default(0)
  quoteRequests30d      Int      @default(0)
  orders30d             Int      @default(0)
  
  // Últimos 90 días
  views90d              Int      @default(0)
  cartAdds90d           Int      @default(0)
  quoteRequests90d      Int      @default(0)
  orders90d             Int      @default(0)
  
  // Métricas de conversión
  viewToCartRate        Decimal  @db.Decimal(5, 2)  // %
  cartToOrderRate       Decimal  @db.Decimal(5, 2)  // %
  
  // Prioridad calculada
  demandScore           Decimal  @db.Decimal(10, 2)
  purchaseRecommendation Boolean @default(false)
  
  lastCalculated        DateTime @updatedAt
}
```

## 🔄 Sistema de Disponibilidad Inteligente

### Lógica de Disponibilidad

```typescript
// services/productAvailability.service.ts

export class ProductAvailabilityService {
  
  /**
   * Determina si un producto está disponible para un pedido
   */
  async checkAvailability(
    productId: string,
    startDate: Date,
    quantity: number
  ): Promise<{
    available: boolean;
    availableQuantity: number;
    status: 'IN_STOCK' | 'ON_DEMAND' | 'NOT_AVAILABLE';
    message: string;
    estimatedAvailability?: Date;
  }> {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    const daysUntilEvent = differenceInDays(startDate, new Date());
    
    // 1. Verificar stock real primero
    if (product.realStock >= quantity) {
      // Tenemos stock físico
      const stockAvailability = await this.checkStockAvailability(
        productId,
        startDate,
        quantity
      );
      
      if (stockAvailability.available) {
        return {
          available: true,
          availableQuantity: stockAvailability.availableQuantity,
          status: 'IN_STOCK',
          message: '✅ Disponible - Tenemos en stock'
        };
      }
    }
    
    // 2. No hay stock suficiente, verificar si podemos conseguir
    if (product.canBuyOnDemand && daysUntilEvent >= product.leadTimeDays) {
      return {
        available: true,
        availableQuantity: quantity,
        status: 'ON_DEMAND',
        message: `✅ Disponible - Lo conseguimos para tu evento (requiere ${product.leadTimeDays} días)`,
        estimatedAvailability: addDays(new Date(), product.leadTimeDays)
      };
    }
    
    // 3. No disponible
    const needsMoreDays = product.leadTimeDays - daysUntilEvent;
    return {
      available: false,
      availableQuantity: 0,
      status: 'NOT_AVAILABLE',
      message: `❌ No disponible - Tu evento es en ${daysUntilEvent} días, necesitamos ${product.leadTimeDays} días para conseguirlo (faltan ${needsMoreDays} días)`
    };
  }
  
  /**
   * Verifica disponibilidad del stock real
   */
  private async checkStockAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number
  ) {
    // Lógica existente de disponibilidad por fechas
    // (ver AVAILABILITY_SYSTEM.md)
    // ...
  }
}
```

### UI: Indicador de Disponibilidad

```typescript
// components/ProductCard.tsx
export const ProductAvailabilityBadge = ({ product, selectedDates }) => {
  const [availability, setAvailability] = useState(null);
  
  useEffect(() => {
    if (selectedDates) {
      checkAvailability();
    }
  }, [selectedDates]);
  
  const checkAvailability = async () => {
    const result = await api.post('/products/check-availability', {
      productId: product.id,
      startDate: selectedDates.start,
      quantity: 1
    });
    setAvailability(result.data);
  };
  
  if (!availability) return null;
  
  return (
    <div className={`availability-badge ${availability.status.toLowerCase()}`}>
      {availability.status === 'IN_STOCK' && (
        <>
          <span className="icon">✅</span>
          <span>En Stock - Disponible</span>
        </>
      )}
      
      {availability.status === 'ON_DEMAND' && (
        <>
          <span className="icon">🕒</span>
          <span>
            Disponible bajo pedido
            <small>Requiere {product.leadTimeDays} días</small>
          </span>
        </>
      )}
      
      {availability.status === 'NOT_AVAILABLE' && (
        <>
          <span className="icon">❌</span>
          <span>No disponible para estas fechas</span>
          <small>{availability.message}</small>
        </>
      )}
    </div>
  );
};
```

## 📈 Sistema de Tracking

### Tracking Automático

```typescript
// middleware/productTracking.middleware.ts

export const trackProductInteraction = (interactionType: InteractionType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.id || req.body.productId;
      const userId = req.user?.id;
      const sessionId = req.session?.id || req.cookies.sessionId;
      
      // Crear interacción (async, no bloquear request)
      prisma.productInteraction.create({
        data: {
          productId,
          userId,
          sessionId,
          type: interactionType,
          source: req.query.source as string,
          referrer: req.headers.referer,
          metadata: {
            userAgent: req.headers['user-agent'],
            ip: req.ip
          }
        }
      }).catch(err => console.error('Tracking error:', err));
      
      // Incrementar contador en producto (async)
      updateProductCounters(productId, interactionType);
      
      next();
    } catch (error) {
      // No fallar el request si el tracking falla
      next();
    }
  };
};

// Rutas con tracking
app.get('/api/v1/products/:id', 
  trackProductInteraction('VIEW'),
  productController.getProduct
);

app.post('/api/v1/cart/add', 
  trackProductInteraction('ADD_TO_CART'),
  cartController.addToCart
);
```

### Cálculo de Prioridad de Compra

```typescript
// services/demandAnalytics.service.ts

export class DemandAnalyticsService {
  
  /**
   * Calcula la prioridad de compra de cada producto
   */
  async calculatePurchasePriorities() {
    const products = await prisma.product.findMany({
      where: {
        stockStatus: 'ON_DEMAND',
        realStock: 0  // Solo productos que no tenemos
      },
      include: {
        analytics: true
      }
    });
    
    for (const product of products) {
      const score = this.calculateDemandScore(product);
      const recommendation = score >= 70; // Threshold
      
      await prisma.productDemandAnalytics.upsert({
        where: { productId: product.id },
        create: {
          productId: product.id,
          demandScore: score,
          purchaseRecommendation: recommendation,
          ...this.getMetrics(product)
        },
        update: {
          demandScore: score,
          purchaseRecommendation: recommendation,
          ...this.getMetrics(product)
        }
      });
      
      // Actualizar prioridad en producto
      await prisma.product.update({
        where: { id: product.id },
        data: {
          purchasePriority: Math.ceil(score / 20), // 1-5
          markedForPurchase: recommendation
        }
      });
    }
  }
  
  /**
   * Calcula score de demanda (0-100)
   */
  private calculateDemandScore(product: Product): number {
    const weights = {
      orders: 40,       // Pedidos reales (más importante)
      quoteRequests: 25, // Solicitudes de presupuesto
      cartAdds: 20,     // Añadidos al carrito
      views: 15         // Vistas
    };
    
    // Normalizar valores (máx 100 de cada tipo)
    const normalizedOrders = Math.min(product.analytics.orders30d * 10, 100);
    const normalizedQuotes = Math.min(product.analytics.quoteRequests30d * 5, 100);
    const normalizedCarts = Math.min(product.analytics.cartAdds30d * 3, 100);
    const normalizedViews = Math.min(product.analytics.views30d * 0.5, 100);
    
    // Calcular score ponderado
    const score = 
      (normalizedOrders * weights.orders / 100) +
      (normalizedQuotes * weights.quoteRequests / 100) +
      (normalizedCarts * weights.cartAdds / 100) +
      (normalizedViews * weights.views / 100);
    
    return Math.round(score);
  }
}
```

## 🎛️ Panel de Administración

### Dashboard: Análisis de Demanda

```
Dashboard > Análisis de Demanda
════════════════════════════════════════════════════════

Productos Recomendados para Comprar (Score ≥ 70)
─────────────────────────────────────────────────────

┌────────────────────────────────────────────────────┐
│ 🔥 Altavoces QSC K12.2 (Score: 92/100)            │
├────────────────────────────────────────────────────┤
│ Stock: 0 unidades | Bajo pedido (30 días)         │
│                                                    │
│ Demanda últimos 30 días:                          │
│ • 8 pedidos reales                                 │
│ • 12 solicitudes de presupuesto                    │
│ • 25 añadidos al carrito                           │
│ • 145 visitas                                      │
│                                                    │
│ Conversión:                                        │
│ • Vista → Carrito: 17.2%                           │
│ • Carrito → Pedido: 32%                            │
│                                                    │
│ Proveedor: Thomann                                 │
│ Precio compra: 459€/ud                             │
│ ROI estimado: 12 meses                             │
│                                                    │
│ [Marcar para Comprar] [Ver Detalles]              │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│ ⭐ Luces LED Moving Head (Score: 78/100)           │
├────────────────────────────────────────────────────┤
│ Stock: 0 unidades | Bajo pedido (30 días)         │
│                                                    │
│ Demanda últimos 30 días:                          │
│ • 5 pedidos reales                                 │
│ • 8 solicitudes de presupuesto                     │
│ • 18 añadidos al carrito                           │
│ • 98 visitas                                       │
│                                                    │
│ [Marcar para Comprar] [Ver Detalles]              │
└────────────────────────────────────────────────────┘

Productos con Interés Moderado (Score 40-69)
─────────────────────────────────────────────────────
[Lista de 15 productos...]

Productos con Bajo Interés (Score < 40)
─────────────────────────────────────────────────────
[Lista de 80 productos...]


Filtros:
[Categoría ▼] [Score mínimo: 0] [Solo en stock ☐]
[Ordenar por: Score ▼]
```

### Vista: Producto Individual

```
Producto: Altavoces QSC K12.2
════════════════════════════════════════════════════════

Estado
─────────────────────────────────────────────────────
Stock Status:     [Bajo Pedido        ▼]
Stock Real:       [0__] unidades
Lead Time:        [30_] días
Puede comprar:    [✓] Sí

Proveedor
─────────────────────────────────────────────────────
Nombre:          [Thomann_________________]
Precio compra:   [459.00_] €
URL:             [https://www.thomann.de/...]
Notas:           [Verificar stock antes de confirmar]

Análisis de Demanda
─────────────────────────────────────────────────────
📊 Score: 92/100 🔥
Recomendación: ✅ Comprar

Últimos 30 días:
  Vistas:                145
  Añadido al carrito:     25 (17.2% conversión)
  Solicitudes presup.:    12
  Pedidos reales:          8 (32% conversión)

Últimos 90 días:
  Vistas:                425
  Pedidos reales:         18

Tendencia: 📈 Creciente (+25% vs mes anterior)

☑ Marcar para próxima compra
Prioridad: [5 (muy alta) ▼]
Cantidad sugerida: [4__] unidades

[Guardar] [Ver Historial Completo]
```

### Listado de Compras

```
Compras Planificadas
════════════════════════════════════════════════════════

Total presupuesto: 3,856€ (8 productos)

┌────────────────────────────────────────────────────┐
│ ☑ Altavoces QSC K12.2                              │
│   Cantidad: 2 uds × 459€ = 918€                    │
│   Score: 92 | Prioridad: 5                         │
│   Estado: Pendiente compra                         │
├────────────────────────────────────────────────────┤
│ ☑ Luces LED Moving Head                            │
│   Cantidad: 4 uds × 385€ = 1,540€                  │
│   Score: 78 | Prioridad: 4                         │
│   Estado: Pendiente compra                         │
├────────────────────────────────────────────────────┤
│ ☑ Mezcladora Allen & Heath                         │
│   Cantidad: 1 ud × 899€ = 899€                     │
│   Score: 71 | Prioridad: 4                         │
│   Estado: Pendiente compra                         │
└────────────────────────────────────────────────────┘

[Exportar Lista] [Generar Pedido] [Imprimir]
```

## 📧 Notificaciones Automáticas

### Alta Demanda Sin Stock

```typescript
// Tarea programada: cada día
async function checkHighDemandProducts() {
  const products = await prisma.product.findMany({
    where: {
      realStock: 0,
      analytics: {
        demandScore: { gte: 70 }
      }
    }
  });
  
  if (products.length > 0) {
    await sendEmail({
      to: 'admin@resona.com',
      subject: `🔥 ${products.length} productos con alta demanda sin stock`,
      body: `
        Los siguientes productos tienen alta demanda pero no están en stock:
        
        ${products.map(p => `
          - ${p.name} (Score: ${p.analytics.demandScore})
            ${p.analytics.orders30d} pedidos último mes
        `).join('\n')}
        
        Considera comprarlos pronto.
      `
    });
  }
}
```

## 📊 Reportes

### Informe Mensual

```
Informe de Demanda - Noviembre 2024
════════════════════════════════════════════════════════

Resumen
─────────────────────────────────────────────────────
Total productos en catálogo:    215
Productos en stock físico:       24
Productos bajo pedido:          191

Interacciones totales:        8,540
  • Vistas:                   6,230
  • Añadidos al carrito:      1,450
  • Solicitudes presupuesto:    580
  • Pedidos completados:        280

Top 10 Productos Más Demandados (sin stock)
─────────────────────────────────────────────────────
1. Altavoces QSC K12.2          Score: 92
2. Luces LED Moving Head        Score: 78
3. Mezcladora Allen & Heath     Score: 71
...

Recomendaciones de Compra
─────────────────────────────────────────────────────
8 productos recomendados
Inversión sugerida: 3,856€
ROI estimado: 10-14 meses
```

## 🎯 Flujo de Trabajo

### Ciclo Completo

```
1. Cliente navega catálogo
   └→ Tracking automático de vistas

2. Cliente añade al carrito
   └→ Sistema verifica:
       ├→ ¿En stock? → Disponible inmediato
       └→ ¿Bajo pedido?
           ├→ >30 días hasta evento → Disponible
           └→ <30 días → No disponible

3. Cliente completa pedido
   └→ Si era "bajo pedido":
       ├→ Notificar admin
       ├→ Gestionar compra al proveedor
       └→ Añadir a stock cuando llegue

4. Análisis semanal
   └→ Calcular scores de demanda
       └→ Recomendar compras

5. Admin decide comprar
   └→ Marca productos
   └→ Genera lista de compra
   └→ Compra al proveedor
   └→ Actualiza stock real
```

## 🧪 Tests

```typescript
describe('Product Availability Service', () => {
  it('should mark as available if in stock', async () => {
    const product = await createProduct({
      realStock: 5,
      stockStatus: 'IN_STOCK'
    });
    
    const result = await checkAvailability(product.id, futureDate(10), 2);
    
    expect(result.available).toBe(true);
    expect(result.status).toBe('IN_STOCK');
  });
  
  it('should mark as available on-demand if enough lead time', async () => {
    const product = await createProduct({
      realStock: 0,
      stockStatus: 'ON_DEMAND',
      leadTimeDays: 30
    });
    
    const result = await checkAvailability(product.id, futureDate(45), 1);
    
    expect(result.available).toBe(true);
    expect(result.status).toBe('ON_DEMAND');
  });
  
  it('should mark as not available if not enough lead time', async () => {
    const product = await createProduct({
      realStock: 0,
      leadTimeDays: 30
    });
    
    const result = await checkAvailability(product.id, futureDate(20), 1);
    
    expect(result.available).toBe(false);
    expect(result.status).toBe('NOT_AVAILABLE');
  });
});

describe('Demand Analytics Service', () => {
  it('should calculate high score for popular product', () => {
    const score = calculateDemandScore({
      orders30d: 10,
      quoteRequests30d: 15,
      cartAdds30d: 30,
      views30d: 200
    });
    
    expect(score).toBeGreaterThan(80);
  });
  
  it('should recommend purchase for high demand products', () => {
    const product = { demandScore: 75 };
    expect(shouldRecommendPurchase(product)).toBe(true);
  });
});
```

---

**Sistema completo de catálogo extenso con tracking de demanda** ✅
