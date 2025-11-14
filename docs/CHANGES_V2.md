# 🔄 Cambios Solicitados - Versión 2

## Cambios Críticos

### 1. ✅ Catálogo Público (Sin Login)
**Cambio:** El cliente puede navegar todo el catálogo SIN registrarse.  
**Login requerido:** Solo al hacer checkout.

**Impacto:**
- Mejor UX, menos fricción
- Mejora SEO (contenido indexable)
- Mayor conversión

**Flujo actualizado:**
1. Usuario visita web → Ve todo el catálogo
2. Añade productos al carrito (localStorage)
3. Click "Finalizar pedido" → **Aquí pide login/registro**
4. Completa checkout ya autenticado

---

### 2. ✅ Coste de Envío por Producto (Peso + Volumen)

**Cambio:** Cada producto tiene peso y volumen. El coste de envío se calcula dinámicamente en el carrito.

**Campos nuevos en Product:**
```typescript
model Product {
  // ... campos existentes
  
  // Dimensiones y peso
  weight      Decimal?  @db.Decimal(8, 2)  // kg
  length      Decimal?  @db.Decimal(8, 2)  // cm
  width       Decimal?  @db.Decimal(8, 2)  // cm
  height      Decimal?  @db.Decimal(8, 2)  // cm
  volume      Decimal?  @db.Decimal(10, 2) // cm³ (calculado auto)
  
  // Shipping
  requiresSpecialTransport Boolean @default(false)
}
```

**Configuración de Tarifas:**
```typescript
model ShippingRate {
  id              String   @id @default(uuid())
  name            String   // "Estándar", "Pesado", "Voluminoso"
  
  // Rangos
  minWeight       Decimal? @db.Decimal(8, 2)
  maxWeight       Decimal? @db.Decimal(8, 2)
  minVolume       Decimal? @db.Decimal(10, 2)
  maxVolume       Decimal? @db.Decimal(10, 2)
  
  // Precios
  basePrice       Decimal  @db.Decimal(10, 2)
  pricePerKg      Decimal  @db.Decimal(10, 2)
  pricePerM3      Decimal  @db.Decimal(10, 2)
  
  // Distancia
  pricePerKm      Decimal? @db.Decimal(10, 2)
  freeShippingKm  Int?     // km gratis
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}
```

**Cálculo en Carrito:**
```typescript
function calculateShippingCost(items, distance) {
  const totalWeight = items.reduce((sum, item) => 
    sum + (item.product.weight * item.quantity), 0
  );
  
  const totalVolume = items.reduce((sum, item) => 
    sum + (item.product.volume * item.quantity), 0
  );
  
  // Buscar tarifa aplicable
  const rate = findApplicableRate(totalWeight, totalVolume);
  
  // Calcular coste
  let cost = rate.basePrice;
  cost += totalWeight * rate.pricePerKg;
  cost += (totalVolume / 1000000) * rate.pricePerM3; // m³
  
  if (distance > rate.freeShippingKm) {
    cost += (distance - rate.freeShippingKm) * rate.pricePerKm;
  }
  
  return cost;
}
```

---

### 3. ✅ Opción: Envío + Montaje

**Cambio:** Cliente puede añadir servicio de montaje al pedido.

**Nuevo modelo:**
```typescript
model Service {
  id              String   @id @default(uuid())
  name            String   // "Montaje", "Desmontaje", "Técnico"
  description     String
  priceType       String   // "FIXED", "PER_HOUR", "PER_PRODUCT"
  price           Decimal  @db.Decimal(10, 2)
  
  // Relación con productos (algunos servicios solo para ciertos productos)
  applicableCategories String[]
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
}

model OrderService {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  serviceId String
  service   Service  @relation(fields: [serviceId], references: [id])
  
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(10, 2)
  subtotal  Decimal  @db.Decimal(10, 2)
  
  notes     String?  // Instrucciones especiales
}
```

**En el Checkout:**
```
□ Solo envío (50,00 €)
□ Envío + Montaje (120,00 €)
  └─ Montaje básico (2h estimadas)
□ Envío + Montaje + Desmontaje (180,00 €)
```

---

### 4. ✅ Facturación Independiente (Eventos DJ)

**Cambio:** Sistema para que TÚ (como autónomo) puedas generar facturas de tus eventos como DJ, independientes del sistema de alquiler.

**Nuevo módulo: "Mis Facturas DJ"**

```typescript
model CustomInvoice {
  id              String        @id @default(uuid())
  invoiceNumber   String        @unique // FACT-DJ-2024-0001
  type            String        @default("DJ_EVENT") // Para distinguir
  
  // Cliente (puede no estar en sistema)
  clientName      String
  clientTaxId     String?
  clientAddress   Json
  clientEmail     String?
  
  // Items personalizados
  items           CustomInvoiceItem[]
  
  // Montos
  subtotal        Decimal       @db.Decimal(10, 2)
  taxRate         Decimal       @db.Decimal(5, 2)
  taxAmount       Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  
  // Datos del emisor (TÚ)
  issuerName      String        // Tu nombre/empresa
  issuerTaxId     String        // Tu NIF
  issuerAddress   Json
  
  // Estado
  status          InvoiceStatus
  
  // Fechas
  issueDate       DateTime      @default(now())
  serviceDate     DateTime      // Fecha del evento DJ
  dueDate         DateTime
  paidDate        DateTime?
  
  // Archivos
  pdfUrl          String?
  
  // Metadata
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model CustomInvoiceItem {
  id          String        @id @default(uuid())
  invoiceId   String
  invoice     CustomInvoice @relation(fields: [invoiceId], references: [id])
  
  description String        // "Actuación DJ en boda"
  quantity    Int           @default(1)
  unitPrice   Decimal       @db.Decimal(10, 2)
  subtotal    Decimal       @db.Decimal(10, 2)
}
```

**Panel Admin:**
```
Menú:
├── Pedidos de Alquiler
├── Facturas de Alquiler
└── 🎧 Mis Facturas DJ (nuevo)
    ├── Crear Factura DJ
    ├── Lista de Facturas
    └── Configuración Fiscal
```

**Pantalla "Crear Factura DJ":**
- Datos del cliente (manual)
- Items con descripción libre
- Fecha del servicio
- Generar PDF automático
- Enviar por email (opcional)

---

### 5. ✅ Pagos con Stripe

**Integración completa de Stripe:**

```typescript
model Payment {
  id              String        @id @default(uuid())
  invoiceId       String?
  invoice         Invoice?      @relation(fields: [invoiceId], references: [id])
  
  amount          Decimal       @db.Decimal(10, 2)
  currency        String        @default("EUR")
  
  // Stripe
  stripePaymentIntentId String?  @unique
  stripeChargeId        String?
  stripeCustomerId      String?
  
  method          PaymentMethod
  status          PaymentStatus @default("PENDING")
  
  // Detalles
  cardBrand       String?       // "visa", "mastercard"
  cardLast4       String?       // Últimos 4 dígitos
  
  metadata        Json?
  errorMessage    String?
  
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}
```

**Flujo de pago:**
1. Cliente finaliza pedido
2. Se crea PaymentIntent en Stripe
3. Cliente introduce tarjeta (Stripe Elements)
4. Confirma pago
5. Webhook de Stripe notifica éxito
6. Sistema actualiza pedido y genera factura

**Configuración:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Endpoint webhook:**
```
POST /api/v1/webhooks/stripe
```

---

### 6. ✅ Almacenamiento de Imágenes: Cloudinary

**Recomendación: Cloudinary**

**¿Por qué Cloudinary?**
- Free tier generoso (25GB storage, 25GB bandwidth/mes)
- Transformación de imágenes on-the-fly
- CDN global incluido
- Fácil integración
- Optimización automática (WebP, calidad)

**Alternativas:**
- **AWS S3 + CloudFront:** Más escalable pero más complejo
- **Vercel Blob:** Simple pero menos features

**Implementación:**
```typescript
// Backend: Upload service
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadProductImage(file: Buffer, productId: string) {
  const result = await cloudinary.uploader.upload(file, {
    folder: `resona/products/${productId}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });
  
  return {
    url: result.secure_url,
    publicId: result.public_id
  };
}
```

**URLs generadas:**
```
Original: https://res.cloudinary.com/resona/image/upload/products/abc123/img.jpg
Thumbnail: https://res.cloudinary.com/resona/image/upload/w_300,h_300,c_fill/products/abc123/img.jpg
```

---

## Resumen de Cambios en Base de Datos

### Modelos Nuevos:
1. **ShippingRate** - Configuración de tarifas de envío
2. **Service** - Servicios adicionales (montaje, etc.)
3. **OrderService** - Relación pedido-servicios
4. **CustomInvoice** - Facturas DJ independientes
5. **CustomInvoiceItem** - Items de facturas DJ

### Modelos Modificados:
1. **Product** - Añadir: weight, length, width, height, volume
2. **Order** - Relación con OrderService
3. **Payment** - Campos de Stripe

### Configuración Nueva:
1. **SystemConfig** - Para datos del autónomo (NIF, dirección, etc.)

---

## Cambios en Variables de Entorno

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Datos del Autónomo (para facturas DJ)
BUSINESS_NAME=Tu Nombre / Razón Social
BUSINESS_TAX_ID=12345678X
BUSINESS_ADDRESS=Calle Example 123, 28001 Madrid
BUSINESS_EMAIL=contacto@resona.com
BUSINESS_PHONE=+34600000000
```

---

## Impacto en Roadmap

### Ajustes de Prioridad:

**Fase 1 (Semanas 1-2):**
- Setup + Auth **→ Auth solo para checkout**
- Productos públicos desde inicio

**Fase 3 (Semanas 3-4):**
- Añadir: Peso/volumen a productos
- Implementar: Cálculo de envío dinámico
- Añadir: Servicios adicionales (montaje)

**Fase 5 (Semanas 5-6):**
- **NUEVO:** Integración Stripe completa
- **NUEVO:** Upload a Cloudinary
- Facturación automática

**Fase 5.5 (Nueva - Semana 7):**
- **NUEVO:** Módulo de facturas DJ independientes
- Panel de configuración fiscal

**Resto de fases:** Sin cambios mayores

**Tiempo total:** ~12-13 semanas (añade ~1 semana por Stripe + Facturas DJ)

---

## Próximos Pasos

1. ✅ Actualizar DATABASE_SCHEMA.md con nuevos modelos
2. ✅ Actualizar FEATURES.md con nuevas funcionalidades
3. ✅ Actualizar USER_FLOWS.md (checkout sin login previo)
4. ✅ Documentar integración Stripe
5. ✅ Documentar integración Cloudinary

¿Procedo con estas actualizaciones?
