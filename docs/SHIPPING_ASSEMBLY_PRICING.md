# 🚚 Sistema de Envío y Montaje - ReSona

## 🎯 Objetivo

Gestionar precios de envío y montaje con:
- Sugerencias automáticas del sistema
- Edición manual desde admin
- **Descuentos progresivos** por múltiples productos
- Límite para evitar que sea gratis o negativo

## 💰 Modelo de Precios

### Precio Base por Servicio

```typescript
model ShippingRate {
  id              String   @id @default(uuid())
  name            String   // "Estándar", "Express", "Local Valencia"
  
  // Cálculo automático
  basePrice       Decimal  @db.Decimal(10, 2)  // 20€ base
  pricePerKm      Decimal  @db.Decimal(10, 2)  // 1.5€/km
  pricePerKg      Decimal  @db.Decimal(10, 2)  // 0.5€/kg
  pricePerM3      Decimal  @db.Decimal(10, 2)  // 10€/m³
  
  // Límites
  minPrice        Decimal  @db.Decimal(10, 2)  // 15€ mínimo
  maxPrice        Decimal? @db.Decimal(10, 2)  // 200€ máximo
  freeAbove       Decimal? @db.Decimal(10, 2)  // Gratis si pedido > 1000€
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Service {
  id              String   @id @default(uuid())
  name            String   // "Montaje", "Técnico"
  
  // Tipos de precio
  priceType       PriceType
  price           Decimal  @db.Decimal(10, 2)
  
  // Para precio por hora
  estimatedHours  Decimal? @db.Decimal(5, 2)
  
  // Para precio por producto
  pricePerItem    Decimal? @db.Decimal(10, 2)
  
  isActive        Boolean  @default(true)
}

enum PriceType {
  FIXED           // 100€ fijo
  PER_HOUR        // 50€/hora × horas estimadas
  PER_ITEM        // 10€/producto
  PERCENTAGE      // 15% del total pedido
}
```

## 📊 Sistema de Descuentos Progresivos

### Fórmula Inteligente

```typescript
/**
 * Descuento progresivo con límite máximo
 * 
 * - 1 producto: 0% descuento (precio base)
 * - 2 productos: 5% descuento
 * - 3 productos: 10% descuento
 * - ...
 * - MÁXIMO: 40% descuento (nunca más)
 */

interface DiscountConfig {
  discountPerItem: number;      // 5% por producto extra
  maxDiscountPercent: number;   // 40% máximo
  minFinalPrice: number;        // Nunca menos de X€
}

const SHIPPING_DISCOUNT_CONFIG: DiscountConfig = {
  discountPerItem: 5,           // 5%
  maxDiscountPercent: 40,       // Máximo 40% descuento
  minFinalPrice: 20             // Mínimo 20€ siempre
};

function calculateShippingDiscount(
  baseShippingPrice: number,
  numberOfProducts: number
): {
  discount: number;
  discountPercent: number;
  finalPrice: number;
} {
  // Productos extra (el primero no cuenta)
  const extraProducts = Math.max(0, numberOfProducts - 1);
  
  // Calcular porcentaje de descuento
  let discountPercent = extraProducts * SHIPPING_DISCOUNT_CONFIG.discountPerItem;
  
  // Aplicar límite máximo
  discountPercent = Math.min(
    discountPercent, 
    SHIPPING_DISCOUNT_CONFIG.maxDiscountPercent
  );
  
  // Calcular descuento en euros
  const discount = baseShippingPrice * (discountPercent / 100);
  
  // Precio final
  let finalPrice = baseShippingPrice - discount;
  
  // Aplicar precio mínimo
  finalPrice = Math.max(finalPrice, SHIPPING_DISCOUNT_CONFIG.minFinalPrice);
  
  // Si el precio mínimo es mayor que el calculado, ajustar descuento
  const actualDiscount = baseShippingPrice - finalPrice;
  const actualDiscountPercent = (actualDiscount / baseShippingPrice) * 100;
  
  return {
    discount: actualDiscount,
    discountPercent: actualDiscountPercent,
    finalPrice: finalPrice
  };
}
```

### Ejemplos Prácticos

#### Ejemplo 1: Pedido Pequeño
```typescript
Productos: 2 altavoces
Precio base envío: 50€
Distancia: 20km

Cálculo:
- Extra productos: 2 - 1 = 1
- Descuento: 1 × 5% = 5%
- Descuento en €: 50€ × 5% = 2.50€
- Precio final: 50€ - 2.50€ = 47.50€
✅ Mayor que mínimo (20€)
```

#### Ejemplo 2: Pedido Mediano
```typescript
Productos: 5 items (altavoces, mezcladora, luces, etc.)
Precio base envío: 80€

Cálculo:
- Extra productos: 5 - 1 = 4
- Descuento: 4 × 5% = 20%
- Descuento en €: 80€ × 20% = 16€
- Precio final: 80€ - 16€ = 64€
✅ Mayor que mínimo (20€)
```

#### Ejemplo 3: Pedido Grande
```typescript
Productos: 10 items
Precio base envío: 120€

Cálculo:
- Extra productos: 10 - 1 = 9
- Descuento: 9 × 5% = 45%
- ⚠️ Límite máximo: 40%
- Descuento en €: 120€ × 40% = 48€
- Precio final: 120€ - 48€ = 72€
✅ Mayor que mínimo (20€)
```

#### Ejemplo 4: Pedido Muy Grande
```typescript
Productos: 30 items
Precio base envío: 50€

Cálculo:
- Extra productos: 30 - 1 = 29
- Descuento teórico: 29 × 5% = 145%
- ⚠️ Límite máximo: 40%
- Descuento en €: 50€ × 40% = 20€
- Precio teórico: 50€ - 20€ = 30€
✅ Mayor que mínimo (20€)
- Precio final: 30€
```

#### Ejemplo 5: Activación de Precio Mínimo
```typescript
Productos: 40 items
Precio base envío: 30€

Cálculo:
- Descuento máximo: 40%
- Descuento en €: 30€ × 40% = 12€
- Precio teórico: 30€ - 12€ = 18€
- ⚠️ Menor que mínimo (20€)
- Precio final ajustado: 20€
- Descuento real aplicado: 30€ - 20€ = 10€ (33.3%)
```

## 🛠️ Panel de Administración

### Vista: Configuración de Envío

```
Configuración de Envío y Montaje
════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────┐
│ TARIFAS DE ENVÍO                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Tarifa Estándar (Valencia ciudad)                  │
│ ────────────────────────────────────               │
│ Precio base:           [20.00_] €                   │
│ Precio por km:         [1.50__] €/km               │
│ Precio por kg:         [0.50__] €/kg               │
│ Precio por m³:         [10.00_] €/m³               │
│                                                     │
│ Precio mínimo:         [15.00_] €                   │
│ Precio máximo:         [200.00] €                   │
│ Gratis si pedido >:    [1000__] € (opcional)       │
│                                                     │
│ [Guardar] [Probar Cálculo]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│ DESCUENTOS POR VOLUMEN                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Descuento por producto extra: [5__] %              │
│ Descuento máximo:              [40_] %              │
│ Precio mínimo siempre:         [20_] €             │
│                                                     │
│ 📊 Simulación:                                      │
│   1 producto  → 0%  descuento                       │
│   2 productos → 5%  descuento                       │
│   5 productos → 20% descuento                       │
│  10 productos → 40% descuento (máximo)             │
│  20 productos → 40% descuento (máximo)             │
│                                                     │
│ [Guardar]                                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ SERVICIOS ADICIONALES                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Montaje Profesional                                │
│ ────────────────────────────────────               │
│ Tipo de precio:  [Fijo             ▼]              │
│ Precio:          [100.00___________] €             │
│                                                     │
│ ☑ Aplicar descuentos por volumen                   │
│ Descuento por item: [3__] %                        │
│ Descuento máximo:   [25_] %                        │
│                                                     │
│ [Guardar] [Eliminar]                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [+ Añadir Nuevo Servicio]                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ CALCULADORA DE PRUEBA                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Número de productos:  [5____]                       │
│ Peso total (kg):      [45___]                       │
│ Volumen (m³):         [0.8__]                       │
│ Distancia (km):       [25___]                       │
│                                                     │
│ ☑ Incluir montaje                                   │
│                                                     │
│ [Calcular]                                          │
│                                                     │
│ Resultado:                                          │
│ ───────────────────────────────────                │
│ Envío base:           95.00€                        │
│ Descuento (20%):     -19.00€                        │
│ Envío final:          76.00€                        │
│                                                     │
│ Montaje base:        100.00€                        │
│ Descuento (12%):     -12.00€                        │
│ Montaje final:        88.00€                        │
│                                                     │
│ TOTAL:               164.00€                        │
└─────────────────────────────────────────────────────┘
```

### Vista: Editar Pedido (Admin)

```
Pedido RES-2024-0123
════════════════════════════════════════════════════════

Productos (3 items)
─────────────────────────────────────────────────────
2× Altavoces JBL PRX815           150,00€
1× Mezcladora Pioneer             80,00€
                                  ────────
Subtotal productos:               230,00€

Envío y Servicios
─────────────────────────────────────────────────────
📍 Distancia: 25km | Peso: 45kg | Volumen: 0.8m³

Envío
  Precio sugerido:      95,00€
  Descuento (10%):     -9,50€
  ─────────────────────────────
  [85.50___] €  ✏️ [Editar manualmente]
  
  ℹ️ Sugerencia basada en: distancia, peso y volumen

Montaje Profesional
  Precio sugerido:     100,00€
  Descuento (6%):      -6,00€
  ─────────────────────────────
  [94.00___] €  ✏️ [Editar manualmente]
  
  ℹ️ 3 productos → 6% descuento (3-1 × 3%)

📝 Notas del precio manual:
[Precio especial para cliente VIP___________]

[Aplicar Cambios] [Restaurar Sugerencia]

─────────────────────────────────────────────────────
Subtotal servicios:               179,50€

TOTAL PEDIDO:                     409,50€
```

## 🧮 Servicio de Cálculo

```typescript
// services/shippingPricing.service.ts

export class ShippingPricingService {
  
  /**
   * Calcula precio de envío con descuentos
   */
  async calculateShipping(params: {
    distanceKm: number;
    weightKg: number;
    volumeM3: number;
    numberOfProducts: number;
    shippingRateId?: string;
  }) {
    // 1. Obtener tarifa (o usar default)
    const rate = params.shippingRateId 
      ? await prisma.shippingRate.findUnique({ where: { id: params.shippingRateId } })
      : await this.getDefaultRate();
    
    // 2. Calcular precio base
    const basePrice = 
      rate.basePrice +
      (params.distanceKm * rate.pricePerKm) +
      (params.weightKg * rate.pricePerKg) +
      (params.volumeM3 * rate.pricePerM3);
    
    // 3. Aplicar límites min/max
    let suggestedPrice = Math.max(basePrice, rate.minPrice);
    if (rate.maxPrice) {
      suggestedPrice = Math.min(suggestedPrice, rate.maxPrice);
    }
    
    // 4. Calcular descuento por volumen
    const discount = this.calculateVolumeDiscount(
      suggestedPrice,
      params.numberOfProducts
    );
    
    // 5. Precio final
    const finalPrice = suggestedPrice - discount.discount;
    
    return {
      basePrice: basePrice,
      suggestedPrice: suggestedPrice,
      discount: discount.discount,
      discountPercent: discount.discountPercent,
      finalPrice: finalPrice,
      breakdown: {
        base: rate.basePrice,
        distance: params.distanceKm * rate.pricePerKm,
        weight: params.weightKg * rate.pricePerKg,
        volume: params.volumeM3 * rate.pricePerM3
      }
    };
  }
  
  /**
   * Calcula precio de servicio (montaje) con descuentos
   */
  async calculateService(
    serviceId: string,
    numberOfProducts: number,
    orderSubtotal?: number
  ) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    let basePrice = 0;
    
    switch (service.priceType) {
      case 'FIXED':
        basePrice = service.price;
        break;
      case 'PER_HOUR':
        basePrice = service.price * (service.estimatedHours || 1);
        break;
      case 'PER_ITEM':
        basePrice = (service.pricePerItem || 0) * numberOfProducts;
        break;
      case 'PERCENTAGE':
        basePrice = (orderSubtotal || 0) * (service.price / 100);
        break;
    }
    
    // Aplicar descuento por volumen (más suave que envío)
    const discount = this.calculateServiceVolumeDiscount(
      basePrice,
      numberOfProducts
    );
    
    return {
      basePrice: basePrice,
      discount: discount.discount,
      discountPercent: discount.discountPercent,
      finalPrice: basePrice - discount.discount
    };
  }
  
  /**
   * Calcula descuento por volumen para envío
   */
  private calculateVolumeDiscount(
    basePrice: number,
    numberOfProducts: number
  ) {
    return calculateShippingDiscount(basePrice, numberOfProducts);
  }
  
  /**
   * Calcula descuento por volumen para servicios (más suave)
   */
  private calculateServiceVolumeDiscount(
    basePrice: number,
    numberOfProducts: number
  ) {
    const config = {
      discountPerItem: 3,        // 3% por producto (vs 5% envío)
      maxDiscountPercent: 25,    // 25% máximo (vs 40% envío)
      minFinalPrice: 30          // Mínimo 30€
    };
    
    const extraProducts = Math.max(0, numberOfProducts - 1);
    let discountPercent = extraProducts * config.discountPerItem;
    discountPercent = Math.min(discountPercent, config.maxDiscountPercent);
    
    const discount = basePrice * (discountPercent / 100);
    let finalPrice = basePrice - discount;
    finalPrice = Math.max(finalPrice, config.minFinalPrice);
    
    const actualDiscount = basePrice - finalPrice;
    const actualDiscountPercent = (actualDiscount / basePrice) * 100;
    
    return {
      discount: actualDiscount,
      discountPercent: actualDiscountPercent,
      finalPrice: finalPrice
    };
  }
}
```

## 📋 En el Pedido

```typescript
model Order {
  // ... campos existentes
  
  // Envío
  shippingCost          Decimal   @db.Decimal(10, 2)
  shippingSuggested     Decimal?  @db.Decimal(10, 2)  // Precio sugerido
  shippingManuallySet   Boolean   @default(false)
  shippingNotes         String?   // Por qué se editó
  
  shippingDistance      Decimal?  @db.Decimal(10, 2)
  shippingWeight        Decimal?  @db.Decimal(10, 2)
  shippingVolume        Decimal?  @db.Decimal(10, 2)
  
  // Servicios (relación a OrderService ya existe)
  services              OrderService[]
}

model OrderService {
  id                    String    @id @default(uuid())
  orderId               String
  order                 Order     @relation(fields: [orderId], references: [id])
  serviceId             String
  service               Service   @relation(fields: [serviceId], references: [id])
  
  quantity              Int       @default(1)
  
  // Precios
  price                 Decimal   @db.Decimal(10, 2)  // Precio final aplicado
  suggestedPrice        Decimal?  @db.Decimal(10, 2)  // Sugerencia del sistema
  manuallySet           Boolean   @default(false)
  notes                 String?
  
  createdAt             DateTime  @default(now())
}
```

## 🎨 Frontend: Checkout

```typescript
// components/checkout/ShippingCalculator.tsx
export const ShippingCalculator = ({ cart }) => {
  const [shipping, setShipping] = useState(null);
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    calculateShippingAndServices();
  }, [cart]);
  
  const calculateShippingAndServices = async () => {
    const result = await api.post('/shipping/calculate', {
      items: cart.items,
      distance: cart.deliveryAddress.distance
    });
    
    setShipping(result.shipping);
    setServices(result.availableServices);
  };
  
  return (
    <div className="shipping-calculator">
      {/* Envío */}
      <div className="shipping-section">
        <h3>Envío</h3>
        
        <div className="price-breakdown">
          <div className="item">
            <span>Precio base</span>
            <span>{shipping.basePrice.toFixed(2)}€</span>
          </div>
          
          {shipping.discountPercent > 0 && (
            <div className="item discount">
              <span>
                Descuento por {cart.items.length} productos ({shipping.discountPercent.toFixed(0)}%)
              </span>
              <span className="text-green-600">
                -{shipping.discount.toFixed(2)}€
              </span>
            </div>
          )}
          
          <div className="item total">
            <strong>Total envío</strong>
            <strong>{shipping.finalPrice.toFixed(2)}€</strong>
          </div>
        </div>
        
        {shipping.discountPercent > 0 && (
          <div className="savings-badge">
            🎉 ¡Ahorras {shipping.discount.toFixed(2)}€ en envío!
          </div>
        )}
      </div>
      
      {/* Servicios opcionales */}
      <div className="services-section">
        <h3>Servicios adicionales</h3>
        
        {services.map(service => (
          <div key={service.id} className="service-option">
            <label>
              <input 
                type="checkbox"
                checked={selectedServices.includes(service.id)}
                onChange={() => toggleService(service.id)}
              />
              
              <div className="service-info">
                <strong>{service.name}</strong>
                <p>{service.description}</p>
                
                <div className="price">
                  {service.discountPercent > 0 && (
                    <span className="original-price">
                      {service.basePrice.toFixed(2)}€
                    </span>
                  )}
                  <span className="final-price">
                    {service.finalPrice.toFixed(2)}€
                  </span>
                  {service.discountPercent > 0 && (
                    <span className="discount-badge">
                      -{service.discountPercent.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 📊 Reportes (Admin)

```
Dashboard > Envío y Servicios
════════════════════════════════════════════════════════

Estadísticas del Mes
─────────────────────────────────────────────────────
Ingresos por envío:          2,450€
Ingresos por montaje:        3,200€
Descuentos aplicados:         -480€ (16% promedio)

Pedidos por tamaño:
  1-2 productos:    15 pedidos (desc. promedio: 3%)
  3-5 productos:    28 pedidos (desc. promedio: 12%)
  6-10 productos:   12 pedidos (desc. promedio: 28%)
  >10 productos:     5 pedidos (desc. promedio: 40%)

Precio promedio envío:       41€
Precio promedio montaje:     64€
```

## 🧪 Tests

```typescript
describe('Shipping Discount System', () => {
  it('should apply 5% discount for 2 products', () => {
    const result = calculateShippingDiscount(100, 2);
    expect(result.discountPercent).toBe(5);
    expect(result.finalPrice).toBe(95);
  });
  
  it('should cap discount at 40%', () => {
    const result = calculateShippingDiscount(100, 15);
    expect(result.discountPercent).toBe(40);
    expect(result.finalPrice).toBe(60);
  });
  
  it('should enforce minimum price', () => {
    const result = calculateShippingDiscount(30, 50);
    // 40% descuento = 12€, quedaría 18€
    // Pero mínimo es 20€
    expect(result.finalPrice).toBe(20);
  });
  
  it('should never go negative', () => {
    const result = calculateShippingDiscount(25, 100);
    expect(result.finalPrice).toBeGreaterThanOrEqual(20);
  });
});
```

---

**Sistema completo de envío y montaje con descuentos inteligentes** ✅
