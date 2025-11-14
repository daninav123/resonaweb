# 💰 Sistema de Precios - ReSona

## 🎯 Objetivo

Gestionar diferentes modalidades de precios para el alquiler de material, con precios especiales para fines de semana y semana completa.

## 📊 Modalidades de Precio

### 1. Precio por Día (Base)
```
Precio estándar: 50€/día
Ejemplo: Lunes a Miércoles (2 días) = 100€
```

### 2. Precio por Fin de Semana ⭐
```
Precio especial: 1.5× el precio de 1 día
Periodo: Viernes tarde → Lunes mañana

Ejemplo:
- Precio por día: 50€
- Precio fin de semana: 75€ (50 × 1.5)
- Ahorro: 75€ vs 150€ (3 días normales)
```

**Definición de Fin de Semana:**
- **Inicio:** Viernes desde las 14:00h
- **Fin:** Lunes hasta las 10:00h

### 3. Precio por Semana Completa
```
Precio especial: 5× el precio de 1 día
Periodo: 7 días consecutivos

Ejemplo:
- Precio por día: 50€
- Precio semana: 250€ (50 × 5)
- Ahorro: 250€ vs 350€ (7 días normales)
```

## 🗓️ Ejemplos Prácticos

### Ejemplo 1: Fin de Semana Estándar
```
Producto: Altavoces JBL
Precio/día: 50€

Reserva: Viernes 15:00 → Lunes 09:00

Cálculo:
- Es fin de semana: ✅
- Precio: 50€ × 1.5 = 75€

Total: 75€
```

### Ejemplo 2: Fin de Semana Extendido
```
Reserva: Jueves 10:00 → Lunes 09:00

Cálculo:
- Jueves: 1 día normal = 50€
- Viernes tarde → Lunes: fin de semana = 75€

Total: 125€
```

### Ejemplo 3: Semana Completa
```
Reserva: Lunes 10:00 → Lunes siguiente 10:00 (7 días)

Cálculo:
- Es semana completa: ✅
- Precio: 50€ × 5 = 250€

Total: 250€
```

### Ejemplo 4: Dos Semanas
```
Reserva: Lunes 10:00 → Lunes +14 días

Cálculo:
- 2 semanas completas = 250€ × 2 = 500€

Total: 500€
```

### Ejemplo 5: Semana + Días Sueltos
```
Reserva: Lunes → Jueves siguiente (10 días)

Cálculo:
- 7 días (semana): 250€
- 3 días adicionales: 50€ × 3 = 150€

Total: 400€
```

### Ejemplo 6: Múltiples Fines de Semana
```
Reserva: Viernes → Lunes siguiente (9 días)

Cálculo:
Opción A - Por semana + días:
- 7 días (semana): 250€
- 2 días: 100€
Total: 350€

Opción B - Por fin de semana:
- Fin de semana 1: 75€
- Lunes-Viernes (5 días): 250€
- Fin de semana 2: 75€
Total: 400€

✅ Sistema elige la opción más barata: 350€
```

## 💻 Modelo de Datos

### Product con Precios

```typescript
model Product {
  // ... otros campos
  
  // Precios (todos obligatorios)
  pricePerDay     Decimal  @db.Decimal(10, 2)  // Base
  pricePerWeekend Decimal  @db.Decimal(10, 2)  // Viernes tarde → Lunes
  pricePerWeek    Decimal  @db.Decimal(10, 2)  // 7 días
  
  // Multiplicadores (opcionales, para cálculo automático)
  weekendMultiplier Decimal? @default(1.5) @db.Decimal(3, 2)
  weekMultiplier    Decimal? @default(5.0) @db.Decimal(3, 2)
}
```

### Ejemplo de Producto

```json
{
  "id": "uuid",
  "name": "Altavoces JBL PRX815",
  "pricePerDay": 50.00,
  "pricePerWeekend": 75.00,      // 50 × 1.5
  "pricePerWeek": 250.00,        // 50 × 5
  "weekendMultiplier": 1.5,
  "weekMultiplier": 5.0
}
```

## 🧮 Lógica de Cálculo

### Servicio de Cálculo de Precios

```typescript
// services/pricing.service.ts

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface PricingResult {
  subtotal: number;
  breakdown: PriceBreakdown[];
  appliedRule: string;
}

interface PriceBreakdown {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class PricingService {
  
  /**
   * Calcula el precio óptimo de alquiler
   */
  calculateRentalPrice(
    product: Product,
    dateRange: DateRange
  ): PricingResult {
    const { startDate, endDate } = dateRange;
    
    // Calcular días totales
    const totalDays = this.calculateDays(startDate, endDate);
    
    // Detectar si es fin de semana
    const isWeekend = this.isWeekendRental(startDate, endDate);
    
    // Calcular todas las opciones posibles
    const options = [
      this.calculateByDay(product, totalDays),
      this.calculateByWeek(product, totalDays),
      this.calculateByWeekend(product, startDate, endDate),
      this.calculateOptimal(product, startDate, endDate)
    ];
    
    // Elegir la opción más barata para el cliente
    const bestOption = options
      .filter(opt => opt !== null)
      .sort((a, b) => a.subtotal - b.subtotal)[0];
    
    return bestOption;
  }
  
  /**
   * Verifica si la reserva es un fin de semana
   */
  private isWeekendRental(startDate: Date, endDate: Date): boolean {
    const startDay = startDate.getDay(); // 0=Dom, 5=Vie
    const startHour = startDate.getHours();
    
    const endDay = endDate.getDay(); // 1=Lun
    const endHour = endDate.getHours();
    
    // Inicio: Viernes después de las 14:00
    const startsOnFriday = startDay === 5 && startHour >= 14;
    
    // Fin: Lunes antes de las 10:00
    const endsOnMonday = endDay === 1 && endHour <= 10;
    
    return startsOnFriday && endsOnMonday;
  }
  
  /**
   * Calcula precio por días normales
   */
  private calculateByDay(
    product: Product,
    days: number
  ): PricingResult {
    return {
      subtotal: product.pricePerDay * days,
      breakdown: [{
        description: `${days} día${days > 1 ? 's' : ''}`,
        quantity: days,
        unitPrice: product.pricePerDay,
        subtotal: product.pricePerDay * days
      }],
      appliedRule: 'POR_DIA'
    };
  }
  
  /**
   * Calcula precio por semanas
   */
  private calculateByWeek(
    product: Product,
    days: number
  ): PricingResult {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    
    if (weeks === 0) return null;
    
    const breakdown: PriceBreakdown[] = [];
    let subtotal = 0;
    
    if (weeks > 0) {
      const weekPrice = weeks * product.pricePerWeek;
      subtotal += weekPrice;
      breakdown.push({
        description: `${weeks} semana${weeks > 1 ? 's' : ''}`,
        quantity: weeks,
        unitPrice: product.pricePerWeek,
        subtotal: weekPrice
      });
    }
    
    if (remainingDays > 0) {
      const dayPrice = remainingDays * product.pricePerDay;
      subtotal += dayPrice;
      breakdown.push({
        description: `${remainingDays} día${remainingDays > 1 ? 's' : ''} adicional${remainingDays > 1 ? 'es' : ''}`,
        quantity: remainingDays,
        unitPrice: product.pricePerDay,
        subtotal: dayPrice
      });
    }
    
    return {
      subtotal,
      breakdown,
      appliedRule: 'POR_SEMANA'
    };
  }
  
  /**
   * Calcula precio por fin de semana
   */
  private calculateByWeekend(
    product: Product,
    startDate: Date,
    endDate: Date
  ): PricingResult | null {
    if (!this.isWeekendRental(startDate, endDate)) {
      return null;
    }
    
    return {
      subtotal: product.pricePerWeekend,
      breakdown: [{
        description: 'Fin de semana (Vie tarde → Lun mañana)',
        quantity: 1,
        unitPrice: product.pricePerWeekend,
        subtotal: product.pricePerWeekend
      }],
      appliedRule: 'FIN_DE_SEMANA'
    };
  }
  
  /**
   * Calcula el precio óptimo combinando diferentes modalidades
   */
  private calculateOptimal(
    product: Product,
    startDate: Date,
    endDate: Date
  ): PricingResult {
    const breakdown: PriceBreakdown[] = [];
    let subtotal = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      // Intentar aplicar semana completa
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      if (weekEnd <= endDate) {
        // Aplicar precio de semana
        subtotal += product.pricePerWeek;
        breakdown.push({
          description: `Semana (${this.formatDate(currentDate)} - ${this.formatDate(weekEnd)})`,
          quantity: 1,
          unitPrice: product.pricePerWeek,
          subtotal: product.pricePerWeek
        });
        currentDate = weekEnd;
        continue;
      }
      
      // Intentar aplicar fin de semana
      if (this.canApplyWeekend(currentDate, endDate)) {
        const weekendEnd = this.getWeekendEnd(currentDate);
        subtotal += product.pricePerWeekend;
        breakdown.push({
          description: 'Fin de semana',
          quantity: 1,
          unitPrice: product.pricePerWeekend,
          subtotal: product.pricePerWeekend
        });
        currentDate = weekendEnd;
        continue;
      }
      
      // Aplicar día individual
      subtotal += product.pricePerDay;
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      breakdown.push({
        description: `Día (${this.formatDate(currentDate)})`,
        quantity: 1,
        unitPrice: product.pricePerDay,
        subtotal: product.pricePerDay
      });
      
      currentDate = dayEnd;
    }
    
    return {
      subtotal,
      breakdown,
      appliedRule: 'OPTIMIZADO'
    };
  }
  
  /**
   * Calcula días entre dos fechas
   */
  private calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  }
}
```

## 🎨 Visualización en Frontend

### Selector de Fechas con Precio Dinámico

```typescript
// components/PriceCalculator.tsx
export const PriceCalculator = ({ product }) => {
  const [dateRange, setDateRange] = useState(null);
  const [pricing, setPricing] = useState(null);
  
  useEffect(() => {
    if (dateRange) {
      calculatePrice();
    }
  }, [dateRange]);
  
  const calculatePrice = async () => {
    const result = await api.post('/pricing/calculate', {
      productId: product.id,
      startDate: dateRange.start,
      endDate: dateRange.end
    });
    setPricing(result.data);
  };
  
  return (
    <div className="price-calculator">
      <DateRangePicker onChange={setDateRange} />
      
      {pricing && (
        <div className="pricing-result">
          <div className="breakdown">
            <h4>Desglose de precio:</h4>
            {pricing.breakdown.map((item, i) => (
              <div key={i} className="breakdown-item">
                <span>{item.description}</span>
                <span>{item.unitPrice.toFixed(2)}€</span>
              </div>
            ))}
          </div>
          
          <div className="total">
            <strong>Total:</strong>
            <strong className="price">{pricing.subtotal.toFixed(2)}€</strong>
          </div>
          
          {pricing.appliedRule === 'FIN_DE_SEMANA' && (
            <div className="savings-badge">
              🎉 ¡Ahorro de fin de semana aplicado!
            </div>
          )}
          
          {pricing.appliedRule === 'POR_SEMANA' && (
            <div className="savings-badge">
              💰 ¡Descuento por semana completa!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

### Ejemplo Visual

```
┌─────────────────────────────────────────┐
│  Altavoces JBL PRX815                   │
│                                         │
│  [Fechas: Vie 01 Dic - Lun 04 Dic]     │
│                                         │
│  📊 Desglose de precio:                 │
│  ─────────────────────────────────      │
│  Fin de semana (Vie → Lun)     75,00€  │
│                                         │
│  💵 TOTAL:              75,00€          │
│                                         │
│  🎉 ¡Ahorro de fin de semana aplicado! │
│     Ahorras: 75€ (precio normal: 150€) │
│                                         │
│  [Añadir al carrito]                    │
└─────────────────────────────────────────┘
```

## 📋 Panel de Administración

### Configurar Precios de Producto

```
Editar Producto: Altavoces JBL PRX815
════════════════════════════════════════════════════════

Precios de Alquiler
────────────────────

Precio por día *
[50.00______] €

┌─────────────────────────────────────────────────┐
│ Precios especiales                              │
│                                                 │
│ ☑ Habilitar precio de fin de semana            │
│   Multiplicador: [1.5___] × precio/día         │
│   Precio: 75,00€                                │
│   Periodo: Viernes 14:00 → Lunes 10:00         │
│                                                 │
│ ☑ Habilitar precio de semana completa          │
│   Multiplicador: [5.0___] × precio/día         │
│   Precio: 250,00€                               │
│   Periodo: 7 días consecutivos                  │
└─────────────────────────────────────────────────┘

ℹ️ El sistema aplicará automáticamente el precio 
   más ventajoso para el cliente.

[Guardar] [Cancelar]
```

## 🔧 Configuración del Sistema

### Configuración Global de Fines de Semana

```typescript
// SystemConfig
{
  "weekend_start_day": 5,        // Viernes
  "weekend_start_hour": 14,      // 14:00
  "weekend_end_day": 1,          // Lunes
  "weekend_end_hour": 10,        // 10:00
  "weekend_multiplier_default": 1.5,
  "week_multiplier_default": 5.0
}
```

Admin puede ajustar estos valores desde:
```
Panel Admin > Configuración > Precios
```

## 📊 Reglas de Negocio

### Prioridad de Aplicación

```
1. Semana completa (si >= 7 días)
2. Fin de semana (si cumple criterios)
3. Precio por día (fallback)
4. Optimización combinada (mejor precio)
```

### Redondeo

```typescript
// Siempre redondear a 2 decimales
const price = Math.round(basePrice * multiplier * 100) / 100;
```

### Días Mínimos

```typescript
// Opcional: establecer alquiler mínimo
const minimumRentalDays = 1;

if (days < minimumRentalDays) {
  throw new Error(`Alquiler mínimo: ${minimumRentalDays} día(s)`);
}
```

## 📈 Endpoints de API

### POST /api/v1/pricing/calculate
Calcular precio de alquiler.

**Request:**
```json
{
  "productId": "uuid",
  "startDate": "2024-12-01T15:00:00Z",
  "endDate": "2024-12-04T09:00:00Z"
}
```

**Response:**
```json
{
  "subtotal": 75.00,
  "breakdown": [
    {
      "description": "Fin de semana (Vie tarde → Lun mañana)",
      "quantity": 1,
      "unitPrice": 75.00,
      "subtotal": 75.00
    }
  ],
  "appliedRule": "FIN_DE_SEMANA",
  "savings": {
    "amount": 75.00,
    "percentage": 50,
    "comparedTo": "POR_DIA"
  }
}
```

### POST /api/v1/pricing/calculate-cart
Calcular precio de todo el carrito.

**Request:**
```json
{
  "items": [
    {
      "productId": "uuid-altavoces",
      "quantity": 2
    },
    {
      "productId": "uuid-mezcladora",
      "quantity": 1
    }
  ],
  "startDate": "2024-12-01T15:00:00Z",
  "endDate": "2024-12-04T09:00:00Z"
}
```

**Response:**
```json
{
  "items": [
    {
      "productId": "uuid-altavoces",
      "productName": "Altavoces JBL",
      "quantity": 2,
      "pricePerUnit": 75.00,
      "subtotal": 150.00,
      "appliedRule": "FIN_DE_SEMANA"
    },
    {
      "productId": "uuid-mezcladora",
      "productName": "Mezcladora Pioneer",
      "quantity": 1,
      "pricePerUnit": 45.00,
      "subtotal": 45.00,
      "appliedRule": "FIN_DE_SEMANA"
    }
  ],
  "subtotal": 195.00,
  "totalSavings": 165.00
}
```

## 🧪 Tests

```typescript
describe('Pricing Service', () => {
  describe('Weekend Pricing', () => {
    it('should apply weekend price for Fri 15:00 → Mon 09:00', () => {
      const product = createTestProduct({
        pricePerDay: 50,
        pricePerWeekend: 75
      });
      
      const pricing = pricingService.calculateRentalPrice(product, {
        startDate: new Date('2024-12-06T15:00:00Z'), // Viernes
        endDate: new Date('2024-12-09T09:00:00Z')    // Lunes
      });
      
      expect(pricing.subtotal).toBe(75);
      expect(pricing.appliedRule).toBe('FIN_DE_SEMANA');
    });
    
    it('should NOT apply weekend price if starts Thursday', () => {
      const product = createTestProduct({
        pricePerDay: 50,
        pricePerWeekend: 75
      });
      
      const pricing = pricingService.calculateRentalPrice(product, {
        startDate: new Date('2024-12-05T15:00:00Z'), // Jueves
        endDate: new Date('2024-12-09T09:00:00Z')    // Lunes
      });
      
      expect(pricing.appliedRule).not.toBe('FIN_DE_SEMANA');
    });
  });
  
  describe('Week Pricing', () => {
    it('should apply week price for 7+ days', () => {
      const product = createTestProduct({
        pricePerDay: 50,
        pricePerWeek: 250
      });
      
      const pricing = pricingService.calculateRentalPrice(product, {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-08')
      });
      
      expect(pricing.subtotal).toBe(250);
      expect(pricing.appliedRule).toBe('POR_SEMANA');
    });
  });
});
```

## 📝 Comunicación al Cliente

### Email de Confirmación

```
Hola Juan,

Tu pedido RES-2024-0123 ha sido confirmado.

Resumen:
─────────────────────────────────────
2× Altavoces JBL PRX815
Periodo: Viernes 1 Dic (15:00) → Lunes 4 Dic (09:00)

Desglose de precio:
  Fin de semana × 2         150,00€
  
  🎉 Has ahorrado 150€ con nuestra tarifa de fin de semana

Subtotal:                   150,00€
Transporte:                  45,00€
IVA (21%):                   40,95€
─────────────────────────────────────
TOTAL:                      235,95€

Gracias por tu pedido!
```

## 💡 Mejoras Futuras

### Temporada Alta/Baja
```typescript
// Multiplicadores por temporada
const seasonMultipliers = {
  'summer': 1.3,    // Junio-Agosto
  'christmas': 1.5, // Diciembre
  'normal': 1.0
};
```

### Descuentos por Volumen
```typescript
// Descuento si alquila muchas unidades
if (quantity >= 10) {
  discount = 0.15; // 15% de descuento
}
```

### Precios Dinámicos
```typescript
// Ajustar precio según demanda
if (occupationRate > 80%) {
  price *= 1.2; // +20% si alta demanda
}
```

---

**¿Necesitas ajustar algo del sistema de precios?**
