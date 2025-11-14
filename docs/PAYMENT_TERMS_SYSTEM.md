# 💳 Sistema de Condiciones de Pago y Fianzas - ReSona

## 🎯 Objetivo

Gestionar diferentes modalidades de pago con incentivos/penalizaciones:
- **100% adelantado:** 10% descuento
- **50% adelantado:** Precio normal (opción por defecto)
- **Pago en recogida:** 10% recargo
- **Fianzas automáticas** basadas en valor del producto

## 💰 Modalidades de Pago

### 1. Pago Completo Adelantado (100%)
```
Descuento: 10%
Momento: Al confirmar pedido
Ventaja cliente: Ahorro
Ventaja negocio: Liquidez inmediata, menos riesgo
```

### 2. Pago Parcial Adelantado (50%) - DEFAULT
```
Descuento/Recargo: 0%
Momento: 50% al confirmar, 50% antes del evento
Ventaja: Balance entre ambas partes
```

### 3. Pago en Recogida (0% adelantado)
```
Recargo: 10%
Momento: El día de recoger el material
Ventaja cliente: No paga hasta tener el material
Desventaja: Más caro, mayor riesgo para negocio
```

## 📊 Modelo de Datos

```typescript
model Order {
  // ... campos existentes
  
  // Modalidad de pago
  paymentTerm         PaymentTerm  @default(PARTIAL_UPFRONT)
  
  // Descuento/Recargo aplicado
  paymentTermAdjustment  Decimal   @db.Decimal(10, 2)  // +/- en euros
  paymentTermPercent     Decimal   @db.Decimal(5, 2)   // +/- en %
  
  // Desglose de pagos
  totalBeforeAdjustment  Decimal   @db.Decimal(10, 2)  // Total sin desc/rec
  paymentTermDiscount    Decimal?  @db.Decimal(10, 2)  // Si hay descuento
  paymentTermSurcharge   Decimal?  @db.Decimal(10, 2)  // Si hay recargo
  
  // Pagos realizados
  upfrontPaymentAmount   Decimal?  @db.Decimal(10, 2)  // Pago adelantado
  upfrontPaymentDate     DateTime?
  upfrontPaymentStatus   PaymentStatus?
  
  remainingPaymentAmount Decimal?  @db.Decimal(10, 2)  // Pago restante
  remainingPaymentDue    DateTime?                      // Cuándo vence
  remainingPaymentDate   DateTime?
  remainingPaymentStatus PaymentStatus?
  
  // Fianza
  depositAmount          Decimal   @db.Decimal(10, 2)
  depositStatus          DepositStatus  @default(PENDING)
  depositPaidAt          DateTime?
  depositReleasedAt      DateTime?
  depositRetainedAmount  Decimal?  @db.Decimal(10, 2)  // Si hay daños
  depositNotes           String?
}

enum PaymentTerm {
  FULL_UPFRONT      // 100% adelantado (-10%)
  PARTIAL_UPFRONT   // 50% adelantado (default)
  ON_PICKUP         // 0% adelantado (+10%)
}

enum DepositStatus {
  PENDING           // Aún no pagado
  AUTHORIZED        // Pre-autorizado en tarjeta
  CAPTURED          // Capturado (si hay daños)
  RELEASED          // Liberado (todo OK)
  PARTIALLY_RETAINED // Retenido parcialmente
}
```

## 🧮 Cálculo de Totales

### Servicio de Cálculo

```typescript
// services/paymentTerms.service.ts

interface PaymentTermsConfig {
  fullUpfrontDiscount: number;    // 10%
  onPickupSurcharge: number;       // 10%
  defaultDepositPercent: number;   // 20% del valor total
}

const PAYMENT_CONFIG: PaymentTermsConfig = {
  fullUpfrontDiscount: 10,
  onPickupSurcharge: 10,
  defaultDepositPercent: 20
};

export class PaymentTermsService {
  
  /**
   * Calcula el total del pedido según la modalidad de pago
   */
  calculateOrderTotal(params: {
    subtotal: number;           // Productos
    shippingCost: number;       // Envío
    servicesCost: number;       // Servicios adicionales
    paymentTerm: PaymentTerm;
    taxRate: number;            // 21%
  }) {
    // 1. Total antes de impuestos y ajustes de pago
    const subtotalBeforeTax = 
      params.subtotal + 
      params.shippingCost + 
      params.servicesCost;
    
    // 2. Calcular ajuste por modalidad de pago
    let adjustmentPercent = 0;
    let adjustmentAmount = 0;
    
    switch (params.paymentTerm) {
      case 'FULL_UPFRONT':
        adjustmentPercent = -PAYMENT_CONFIG.fullUpfrontDiscount;
        adjustmentAmount = subtotalBeforeTax * (adjustmentPercent / 100);
        break;
        
      case 'PARTIAL_UPFRONT':
        adjustmentPercent = 0;
        adjustmentAmount = 0;
        break;
        
      case 'ON_PICKUP':
        adjustmentPercent = PAYMENT_CONFIG.onPickupSurcharge;
        adjustmentAmount = subtotalBeforeTax * (adjustmentPercent / 100);
        break;
    }
    
    // 3. Subtotal con ajuste
    const subtotalWithAdjustment = subtotalBeforeTax + adjustmentAmount;
    
    // 4. Calcular impuestos sobre el total ajustado
    const taxAmount = subtotalWithAdjustment * (params.taxRate / 100);
    
    // 5. Total final
    const total = subtotalWithAdjustment + taxAmount;
    
    // 6. Calcular cuánto pagar ahora y cuánto después
    let upfrontAmount = 0;
    let remainingAmount = 0;
    
    switch (params.paymentTerm) {
      case 'FULL_UPFRONT':
        upfrontAmount = total;
        remainingAmount = 0;
        break;
        
      case 'PARTIAL_UPFRONT':
        upfrontAmount = total * 0.5;
        remainingAmount = total * 0.5;
        break;
        
      case 'ON_PICKUP':
        upfrontAmount = 0;
        remainingAmount = total;
        break;
    }
    
    return {
      // Desglose
      productsSubtotal: params.subtotal,
      shippingCost: params.shippingCost,
      servicesCost: params.servicesCost,
      subtotalBeforeAdjustment: subtotalBeforeTax,
      
      // Ajuste por modalidad de pago
      adjustmentType: adjustmentPercent < 0 ? 'DISCOUNT' : adjustmentPercent > 0 ? 'SURCHARGE' : 'NONE',
      adjustmentPercent: Math.abs(adjustmentPercent),
      adjustmentAmount: adjustmentAmount,
      
      // Totales
      subtotalAfterAdjustment: subtotalWithAdjustment,
      taxAmount: taxAmount,
      taxRate: params.taxRate,
      total: total,
      
      // Pagos
      upfrontAmount: upfrontAmount,
      remainingAmount: remainingAmount,
      paymentTerm: params.paymentTerm
    };
  }
  
  /**
   * Calcula la fianza basada en el valor de los productos
   */
  calculateDeposit(params: {
    products: Array<{
      value: number;      // Valor del producto
      quantity: number;
    }>;
    customDepositPercent?: number;
  }) {
    // 1. Calcular valor total de los productos
    const totalProductValue = params.products.reduce(
      (sum, p) => sum + (p.value * p.quantity),
      0
    );
    
    // 2. Usar porcentaje custom o default
    const depositPercent = params.customDepositPercent || PAYMENT_CONFIG.defaultDepositPercent;
    
    // 3. Calcular fianza
    const depositAmount = totalProductValue * (depositPercent / 100);
    
    // 4. Redondear a múltiplo de 5€ (opcional, hace números más limpios)
    const depositRounded = Math.ceil(depositAmount / 5) * 5;
    
    return {
      totalProductValue: totalProductValue,
      depositPercent: depositPercent,
      depositAmount: depositRounded,
      breakdown: params.products.map(p => ({
        value: p.value,
        quantity: p.quantity,
        subtotal: p.value * p.quantity,
        depositPortion: (p.value * p.quantity) * (depositPercent / 100)
      }))
    };
  }
}
```

## 📋 Ejemplos Prácticos

### Ejemplo 1: Pago Completo Adelantado

```typescript
Pedido:
- 2× Altavoces JBL: 150€
- Envío: 50€
- Montaje: 80€
────────────────────────
Subtotal: 280€

Modalidad: FULL_UPFRONT
Descuento 10%: -28€
────────────────────────
Subtotal ajustado: 252€
IVA (21%): 52.92€
────────────────────────
TOTAL: 304.92€

💰 Pagar ahora: 304.92€
💰 Pagar después: 0€

🎉 Ahorro: 33.08€ (vs pago parcial)

Fianza:
- Valor productos: 500€ (valor de compra)
- 20% fianza: 100€
- Pre-autorización en tarjeta: 100€
```

### Ejemplo 2: Pago Parcial (Default)

```typescript
Pedido:
- 2× Altavoces JBL: 150€
- Envío: 50€
- Montaje: 80€
────────────────────────
Subtotal: 280€

Modalidad: PARTIAL_UPFRONT
Ajuste: 0€
────────────────────────
Subtotal ajustado: 280€
IVA (21%): 58.80€
────────────────────────
TOTAL: 338.80€

💰 Pagar ahora (50%): 169.40€
💰 Pagar antes del evento: 169.40€
  Vencimiento: 3 días antes del evento

Fianza: 100€ (pre-autorización)
```

### Ejemplo 3: Pago en Recogida

```typescript
Pedido:
- 2× Altavoces JBL: 150€
- Envío: 50€
- Montaje: 80€
────────────────────────
Subtotal: 280€

Modalidad: ON_PICKUP
Recargo 10%: +28€
────────────────────────
Subtotal ajustado: 308€
IVA (21%): 64.68€
────────────────────────
TOTAL: 372.68€

💰 Pagar ahora: 0€
💰 Pagar el día de recogida: 372.68€

⚠️ Recargo: 33.88€ (vs pago parcial)

Fianza: 100€ (pago obligatorio adelantado)
```

## 🎨 Frontend: Selector de Modalidad

```typescript
// components/checkout/PaymentTermSelector.tsx
export const PaymentTermSelector = ({ orderTotal, onSelect }) => {
  const [selectedTerm, setSelectedTerm] = useState('PARTIAL_UPFRONT');
  const [calculations, setCalculations] = useState(null);
  
  useEffect(() => {
    calculateAllOptions();
  }, [orderTotal]);
  
  const calculateAllOptions = async () => {
    const options = await Promise.all([
      api.post('/payment-terms/calculate', { 
        ...orderTotal, 
        paymentTerm: 'FULL_UPFRONT' 
      }),
      api.post('/payment-terms/calculate', { 
        ...orderTotal, 
        paymentTerm: 'PARTIAL_UPFRONT' 
      }),
      api.post('/payment-terms/calculate', { 
        ...orderTotal, 
        paymentTerm: 'ON_PICKUP' 
      })
    ]);
    
    setCalculations({
      fullUpfront: options[0].data,
      partial: options[1].data,
      onPickup: options[2].data
    });
  };
  
  return (
    <div className="payment-term-selector">
      <h3>Elige tu forma de pago</h3>
      
      {/* Opción 1: Pago completo */}
      <div 
        className={`option ${selectedTerm === 'FULL_UPFRONT' ? 'selected' : ''}`}
        onClick={() => setSelectedTerm('FULL_UPFRONT')}
      >
        <input 
          type="radio" 
          checked={selectedTerm === 'FULL_UPFRONT'}
          readOnly
        />
        
        <div className="option-content">
          <div className="header">
            <strong>Pago Completo Adelantado</strong>
            <span className="badge discount">-10% DESCUENTO</span>
          </div>
          
          <p className="description">
            Paga el 100% ahora y ahorra un 10%
          </p>
          
          <div className="pricing">
            <div className="total">
              <span>Total a pagar ahora:</span>
              <strong className="price">
                {calculations?.fullUpfront.total.toFixed(2)}€
              </strong>
            </div>
            <div className="savings">
              🎉 Ahorras: {calculations?.fullUpfront.adjustmentAmount.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
      
      {/* Opción 2: Pago parcial (RECOMENDADO) */}
      <div 
        className={`option recommended ${selectedTerm === 'PARTIAL_UPFRONT' ? 'selected' : ''}`}
        onClick={() => setSelectedTerm('PARTIAL_UPFRONT')}
      >
        <input 
          type="radio" 
          checked={selectedTerm === 'PARTIAL_UPFRONT'}
          readOnly
        />
        
        <div className="option-content">
          <div className="header">
            <strong>Pago Parcial</strong>
            <span className="badge recommended">RECOMENDADO</span>
          </div>
          
          <p className="description">
            Paga el 50% ahora y el resto 3 días antes del evento
          </p>
          
          <div className="pricing">
            <div className="split-payment">
              <div>
                <span>Ahora (50%):</span>
                <strong>{calculations?.partial.upfrontAmount.toFixed(2)}€</strong>
              </div>
              <div>
                <span>Después (50%):</span>
                <strong>{calculations?.partial.remainingAmount.toFixed(2)}€</strong>
              </div>
            </div>
            <div className="total">
              Total: {calculations?.partial.total.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
      
      {/* Opción 3: Pago en recogida */}
      <div 
        className={`option ${selectedTerm === 'ON_PICKUP' ? 'selected' : ''}`}
        onClick={() => setSelectedTerm('ON_PICKUP')}
      >
        <input 
          type="radio" 
          checked={selectedTerm === 'ON_PICKUP'}
          readOnly
        />
        
        <div className="option-content">
          <div className="header">
            <strong>Pago en Recogida</strong>
            <span className="badge surcharge">+10% RECARGO</span>
          </div>
          
          <p className="description">
            Paga el día que recojas el material
          </p>
          
          <div className="pricing">
            <div className="total">
              <span>Total a pagar en recogida:</span>
              <strong className="price">
                {calculations?.onPickup.total.toFixed(2)}€
              </strong>
            </div>
            <div className="surcharge">
              ⚠️ Recargo: +{calculations?.onPickup.adjustmentAmount.toFixed(2)}€
            </div>
          </div>
          
          <div className="warning">
            ⚠️ Fianza de {calculations?.deposit}€ requerida por adelantado
          </div>
        </div>
      </div>
      
      <button 
        className="continue-btn"
        onClick={() => onSelect(selectedTerm)}
      >
        Continuar con {selectedTerm === 'FULL_UPFRONT' ? 'Pago Completo' : 
                       selectedTerm === 'PARTIAL_UPFRONT' ? 'Pago Parcial' : 
                       'Pago en Recogida'}
      </button>
    </div>
  );
};
```

## 🛡️ Sistema de Fianzas (Deposits)

### Cálculo Automático

```typescript
model Product {
  // ... campos existentes
  
  // Valor del producto (para fianza)
  purchaseValue   Decimal?  @db.Decimal(10, 2)  // Valor de compra
  replacementCost Decimal?  @db.Decimal(10, 2)  // Coste de reemplazo
  
  // Fianza custom (opcional, sobrescribe cálculo automático)
  customDeposit   Decimal?  @db.Decimal(10, 2)
}

// Cálculo de fianza para un pedido
function calculateOrderDeposit(orderItems: OrderItem[]) {
  let totalDeposit = 0;
  
  for (const item of orderItems) {
    const product = item.product;
    
    if (product.customDeposit) {
      // Usar fianza custom si está definida
      totalDeposit += product.customDeposit * item.quantity;
    } else {
      // Calcular automáticamente (20% del valor)
      const productValue = product.replacementCost || product.purchaseValue || 0;
      const depositPerUnit = productValue * 0.20;
      totalDeposit += depositPerUnit * item.quantity;
    }
  }
  
  // Redondear a múltiplo de 5€
  return Math.ceil(totalDeposit / 5) * 5;
}
```

### Gestión con Stripe

```typescript
// Autorización de fianza (no captura)
const paymentIntent = await stripe.paymentIntents.create({
  amount: depositAmount * 100, // En centavos
  currency: 'eur',
  customer: customerId,
  capture_method: 'manual',  // ⭐ No capturar automáticamente
  metadata: {
    orderId: order.id,
    type: 'deposit'
  }
});

// Al devolver sin daños
await stripe.paymentIntents.cancel(paymentIntentId);
// La pre-autorización se libera automáticamente

// Si hay daños
const damageAmount = calculateDamages();
await stripe.paymentIntents.capture(paymentIntentId, {
  amount_to_capture: damageAmount * 100
});
```

## 📧 Comunicaciones al Cliente

### Email: Confirmación Pago Completo

```
Hola Juan,

✅ Tu pedido RES-2024-0123 ha sido confirmado y pagado

Desglose:
─────────────────────────────────────
Productos:                    150,00€
Envío y servicios:            130,00€
                              ───────
Subtotal:                     280,00€

🎉 Descuento pago adelantado: -28,00€
                              ───────
Subtotal:                     252,00€
IVA (21%):                     52,92€
─────────────────────────────────────
TOTAL PAGADO:                 304,92€

Has ahorrado 33,08€ pagando por adelantado 💰

Fianza (pre-autorizada): 100€
Se liberará automáticamente tras la devolución

Fecha del evento: 15 Diciembre 2024
```

### Email: Recordatorio Pago Restante

```
Hola María,

Recordatorio: Pago pendiente para tu pedido RES-2024-0124

Ya pagaste: 169,40€ ✅
Pendiente: 169,40€

Vencimiento: 12 Diciembre 2024 (3 días antes del evento)

[Pagar Ahora]

Tu pedido no se preparará hasta recibir el pago completo.
```

## 📊 Panel Admin: Gestión de Fianzas

```
Fianzas Activas
════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────┐
│ RES-2024-0123 - Juan Pérez                         │
├────────────────────────────────────────────────────┤
│ Evento: 15 Dic 2024                                │
│ Fianza: 100€                                       │
│ Estado: Pre-autorizada ✅                          │
│                                                    │
│ Productos:                                         │
│ • 2× Altavoces JBL (valor: 500€)                  │
│                                                    │
│ Checklist devolución:                              │
│ ☐ Estado externo OK                                │
│ ☐ Cables incluidos                                 │
│ ☐ Sin daños                                        │
│                                                    │
│ [Iniciar Devolución]                               │
└────────────────────────────────────────────────────┘

Al iniciar devolución:
┌────────────────────────────────────────────────────┐
│ Checklist de Devolución - RES-2024-0123           │
├────────────────────────────────────────────────────┤
│ ☑ Estado externo OK                                │
│ ☑ Cables incluidos                                 │
│ ☐ Arañazo en altavoz derecho                      │
│                                                    │
│ ¿Retener parte de la fianza?                      │
│ ○ No, liberar completa (100€)                     │
│ ● Sí, retener: [40____]€                          │
│                                                    │
│ Motivo:                                            │
│ [Arañazo en altavoz, reparación necesaria____]    │
│                                                    │
│ Fotos:                                             │
│ [📷 Subir fotos del daño]                          │
│                                                    │
│ [Liberar 60€] [Retener 40€] [Cancelar]            │
└────────────────────────────────────────────────────┘
```

## 🧪 Tests

```typescript
describe('Payment Terms Service', () => {
  it('should apply 10% discount for full upfront', () => {
    const result = calculateOrderTotal({
      subtotal: 100,
      shippingCost: 50,
      servicesCost: 30,
      paymentTerm: 'FULL_UPFRONT',
      taxRate: 21
    });
    
    expect(result.adjustmentPercent).toBe(10);
    expect(result.adjustmentAmount).toBe(-18); // -(180 * 10%)
    expect(result.subtotalAfterAdjustment).toBe(162);
  });
  
  it('should apply 10% surcharge for on pickup', () => {
    const result = calculateOrderTotal({
      subtotal: 100,
      shippingCost: 50,
      servicesCost: 30,
      paymentTerm: 'ON_PICKUP',
      taxRate: 21
    });
    
    expect(result.adjustmentPercent).toBe(10);
    expect(result.adjustmentAmount).toBe(18); // (180 * 10%)
  });
  
  it('should calculate correct deposit (20% of product value)', () => {
    const result = calculateDeposit({
      products: [
        { value: 500, quantity: 2 },  // 1000€
        { value: 300, quantity: 1 }   // 300€
      ]
    });
    
    // Total: 1300€, 20% = 260€, redondeado a 260€
    expect(result.depositAmount).toBe(260);
  });
});
```

---

**Sistema completo de condiciones de pago y fianzas automáticas** ✅
