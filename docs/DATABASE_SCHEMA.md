# 🗄️ Esquema de Base de Datos - ReSona

## Modelos de Datos

### User (Usuario)
```typescript
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String    // Hash bcrypt
  firstName       String
  lastName        String
  phone           String?
  role            UserRole  @default(CLIENT)
  
  // Cliente
  company         String?
  taxId           String?   // CIF/NIF
  billingAddress  Json?     // Dirección de facturación
  shippingAddress Json?     // Dirección de entrega
  
  // Relaciones
  orders          Order[]
  reviews         Review[]
  favorites       Favorite[]
  
  // Metadata
  isActive        Boolean   @default(true)
  emailVerified   Boolean   @default(false)
  lastLogin       DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  WAREHOUSE
  COMMERCIAL
  CLIENT
}
```

### Category (Categoría de Productos)
```typescript
model Category {
  id          String      @id @default(uuid())
  name        String      @unique
  slug        String      @unique
  description String?
  icon        String?     // Nombre del icono Lucide
  parentId    String?
  parent      Category?   @relation("CategoryTree", fields: [parentId], references: [id])
  children    Category[]  @relation("CategoryTree")
  
  products    Product[]
  
  isActive    Boolean     @default(true)
  order       Int         @default(0)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

### Product (Producto/Material)
```typescript
model Product {
  id              String          @id @default(uuid())
  sku             String          @unique
  name            String
  slug            String          @unique
  description     String
  specifications  Json?           // Especificaciones técnicas
  
  // Categorización
  categoryId      String
  category        Category        @relation(fields: [categoryId], references: [id])
  tags            String[]
  
  // Inventario
  stock           Int             @default(0)
  status          ProductStatus   @default(AVAILABLE)
  location        String?         // Ubicación en almacén
  
  // Precios
  pricePerDay     Decimal         @db.Decimal(10, 2)
  pricePerWeekend Decimal?        @db.Decimal(10, 2)
  pricePerWeek    Decimal?        @db.Decimal(10, 2)
  deposit         Decimal?        @db.Decimal(10, 2)
  
  // NUEVO: Dimensiones y peso para cálculo de envío
  weight          Decimal?        @db.Decimal(8, 2)  // kg
  length          Decimal?        @db.Decimal(8, 2)  // cm
  width           Decimal?        @db.Decimal(8, 2)  // cm
  height          Decimal?        @db.Decimal(8, 2)  // cm
  volume          Decimal?        @db.Decimal(10, 2) // cm³ (auto-calculado)
  requiresSpecialTransport Boolean @default(false)
  
  // Media
  images          ProductImage[]
  mainImageUrl    String?
  
  // Relaciones
  orderItems      OrderItem[]
  reviews         Review[]
  favorites       Favorite[]
  packProducts    PackProduct[]
  
  // Mantenimiento
  lastMaintenance DateTime?
  nextMaintenance DateTime?
  maintenanceNotes String?
  
  // Metadata
  isActive        Boolean         @default(true)
  featured        Boolean         @default(false)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

enum ProductStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
  RETIRED
}
```

### ProductImage
```typescript
model ProductImage {
  id         String   @id @default(uuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  url        String
  alt        String?
  order      Int      @default(0)
  
  createdAt  DateTime @default(now())
}
```

### Pack (Paquetes Predefinidos)
```typescript
model Pack {
  id           String        @id @default(uuid())
  name         String
  slug         String        @unique
  description  String
  imageUrl     String?
  
  eventType    String        // "boda", "concierto", "corporativo"
  capacity     Int?          // Número de personas
  
  products     PackProduct[]
  
  basePrice    Decimal       @db.Decimal(10, 2)
  discount     Decimal?      @db.Decimal(5, 2) // % descuento
  
  isActive     Boolean       @default(true)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model PackProduct {
  id        String   @id @default(uuid())
  packId    String
  pack      Pack     @relation(fields: [packId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  quantity  Int      @default(1)
}
```

### Order (Pedido)
```typescript
model Order {
  id                String        @id @default(uuid())
  orderNumber       String        @unique // RES-2024-0001
  
  // Cliente
  userId            String
  user              User          @relation(fields: [userId], references: [id])
  
  // Fechas del evento
  startDate         DateTime
  endDate           DateTime
  
  // Información del evento
  eventType         String
  eventLocation     Json          // Dirección completa
  attendees         Int?
  contactPerson     String
  contactPhone      String
  specialNotes      String?
  
  // Logística
  deliveryType      DeliveryType
  pickupTime        DateTime?
  deliveryTime      DateTime?
  returnTime        DateTime?
  
  shippingAddress   Json?
  shippingDistance  Decimal?      @db.Decimal(10, 2) // km
  shippingCost      Decimal?      @db.Decimal(10, 2)
  
  // Items y servicios
  items             OrderItem[]
  services          OrderService[]
  
  // Precios
  subtotal          Decimal       @db.Decimal(10, 2)
  taxRate           Decimal       @default(21) @db.Decimal(5, 2)
  taxAmount         Decimal       @db.Decimal(10, 2)
  total             Decimal       @db.Decimal(10, 2)
  deposit           Decimal?      @db.Decimal(10, 2)
  
  // Estado
  status            OrderStatus   @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  
  // Facturación
  invoice           Invoice?
  
  // Asignación
  assignedTo        String?       // ID del usuario asignado
  vehicleAssigned   String?
  
  // Devolución
  returnedAt        DateTime?
  returnNotes       String?
  damagesCost       Decimal?      @db.Decimal(10, 2)
  
  // Metadata
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  confirmedAt       DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  cancellationReason String?
}

enum DeliveryType {
  PICKUP      // Recogida en almacén
  DELIVERY    // Envío a ubicación
}

enum OrderStatus {
  PENDING           // Pendiente confirmación
  CONFIRMED         // Confirmado
  PREPARING         // En preparación
  READY             // Listo para entrega
  IN_TRANSIT        // En tránsito
  DELIVERED         // Entregado/En evento
  RETURNED          // Devuelto
  COMPLETED         // Completado
  CANCELLED         // Cancelado
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
  REFUNDED
}
```

### OrderItem (Item de Pedido)
```typescript
model OrderItem {
  id           String   @id @default(uuid())
  orderId      String
  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  
  quantity     Int      @default(1)
  days         Int      // Días de alquiler
  pricePerDay  Decimal  @db.Decimal(10, 2)
  subtotal     Decimal  @db.Decimal(10, 2)
  
  // Devolución
  returnedQuantity Int @default(0)
  damagedQuantity  Int @default(0)
  lostQuantity     Int @default(0)
  
  createdAt    DateTime @default(now())
}
```

### ShippingRate (Tarifas de Envío)
```typescript
model ShippingRate {
  id              String   @id @default(uuid())
  name            String   // "Estándar", "Pesado", "Voluminoso"
  description     String?
  
  // Rangos de aplicación
  minWeight       Decimal? @db.Decimal(8, 2)  // kg
  maxWeight       Decimal? @db.Decimal(8, 2)
  minVolume       Decimal? @db.Decimal(10, 2) // cm³
  maxVolume       Decimal? @db.Decimal(10, 2)
  
  // Precios base
  basePrice       Decimal  @db.Decimal(10, 2)
  pricePerKg      Decimal  @db.Decimal(10, 2)
  pricePerM3      Decimal  @db.Decimal(10, 2)
  
  // Distancia
  pricePerKm      Decimal? @db.Decimal(10, 2)
  freeShippingKm  Int?     // km gratis incluidos
  maxDistanceKm   Int?     // distancia máxima
  
  // Prioridad (menor = más prioritaria)
  priority        Int      @default(0)
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Service (Servicios Adicionales)
```typescript
model Service {
  id              String        @id @default(uuid())
  name            String        // "Montaje", "Desmontaje", "Técnico"
  slug            String        @unique
  description     String
  
  // Tipo de precio
  priceType       ServicePriceType
  price           Decimal       @db.Decimal(10, 2)
  
  // Duración estimada (para servicios por hora)
  estimatedHours  Decimal?      @db.Decimal(5, 2)
  
  // Aplicabilidad
  applicableCategories String[]  // IDs de categorías o "ALL"
  requiresProducts     Boolean   @default(false)
  
  // Metadata
  icon            String?
  isActive        Boolean       @default(true)
  featured        Boolean       @default(false)
  order           Int           @default(0)
  
  // Relaciones
  orderServices   OrderService[]
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum ServicePriceType {
  FIXED         // Precio fijo
  PER_HOUR      // Por hora
  PER_PRODUCT   // Por producto
  PER_KG        // Por kg de material
}
```

### OrderService (Servicios en Pedido)
```typescript
model OrderService {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  serviceId String
  service   Service  @relation(fields: [serviceId], references: [id])
  
  quantity  Int      @default(1)
  price     Decimal  @db.Decimal(10, 2)  // Precio unitario
  subtotal  Decimal  @db.Decimal(10, 2)  // Total
  
  notes     String?  // Instrucciones especiales
  
  createdAt DateTime @default(now())
}
```

### CustomInvoice (Facturas Independientes - Eventos DJ)
```typescript
model CustomInvoice {
  id              String                @id @default(uuid())
  invoiceNumber   String                @unique // FACT-DJ-2024-0001
  type            String                @default("DJ_EVENT")
  
  // Cliente (puede no estar en el sistema)
  clientName      String
  clientTaxId     String?               // CIF/NIF del cliente
  clientAddress   Json
  clientEmail     String?
  clientPhone     String?
  
  // Items personalizados
  items           CustomInvoiceItem[]
  
  // Montos
  subtotal        Decimal               @db.Decimal(10, 2)
  taxRate         Decimal               @db.Decimal(5, 2)
  taxAmount       Decimal               @db.Decimal(10, 2)
  total           Decimal               @db.Decimal(10, 2)
  
  // Datos del emisor (configurables)
  issuerName      String
  issuerTaxId     String
  issuerAddress   Json
  issuerEmail     String?
  issuerPhone     String?
  
  // Estado
  status          InvoiceStatus
  
  // Fechas
  issueDate       DateTime              @default(now())
  serviceDate     DateTime              // Fecha del evento
  dueDate         DateTime
  paidDate        DateTime?
  
  // Pago
  paymentMethod   String?
  paymentReference String?
  
  // Archivos
  pdfUrl          String?
  
  // Metadata
  notes           String?
  internalNotes   String?               // Solo admin
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt
}
```

### CustomInvoiceItem (Items de Facturas Independientes)
```typescript
model CustomInvoiceItem {
  id          String        @id @default(uuid())
  invoiceId   String
  invoice     CustomInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  description String        // "Actuación DJ en boda - 5 horas"
  quantity    Int           @default(1)
  unitPrice   Decimal       @db.Decimal(10, 2)
  subtotal    Decimal       @db.Decimal(10, 2)
  
  order       Int           @default(0)  // Para ordenar items
  
  createdAt   DateTime      @default(now())
}
```

### Invoice (Factura)
```typescript
model Invoice {
  id              String        @id @default(uuid())
  invoiceNumber   String        @unique // FACT-2024-0001
  
  orderId         String        @unique
  order           Order         @relation(fields: [orderId], references: [id])
  
  // Datos fiscales
  billingData     Json          // Nombre, CIF, dirección completa
  
  // Montos
  subtotal        Decimal       @db.Decimal(10, 2)
  taxRate         Decimal       @db.Decimal(5, 2)
  taxAmount       Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  
  // Archivos
  pdfUrl          String?
  
  // Pagos
  payments        Payment[]
  
  // Estado
  status          InvoiceStatus @default(DRAFT)
  
  // Fechas
  issueDate       DateTime      @default(now())
  dueDate         DateTime
  paidDate        DateTime?
  
  // Metadata
  notes           String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum InvoiceStatus {
  DRAFT
  ISSUED
  PAID
  OVERDUE
  CANCELLED
}
```

### Payment (Pago)
```typescript
model Payment {
  id            String        @id @default(uuid())
  invoiceId     String?
  invoice       Invoice?      @relation(fields: [invoiceId], references: [id])
  
  amount        Decimal       @db.Decimal(10, 2)
  currency      String        @default("EUR")
  
  // Stripe Integration
  stripePaymentIntentId String? @unique
  stripeChargeId        String?
  stripeCustomerId      String?
  stripePaymentMethodId String?
  
  method        PaymentMethod
  status        PaymentStatus @default(PENDING)
  
  // Detalles de tarjeta (si aplica)
  cardBrand     String?       // "visa", "mastercard"
  cardLast4     String?       // Últimos 4 dígitos
  cardExpMonth  Int?
  cardExpYear   Int?
  
  // Referencia para otros métodos
  reference     String?       // Número de transferencia, etc.
  
  // Metadata
  metadata      Json?
  errorMessage  String?
  notes         String?
  
  paidAt        DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

enum PaymentMethod {
  STRIPE        // Tarjeta vía Stripe
  BANK_TRANSFER
  CASH
  FINANCING
  OTHER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
  CANCELLED
}
```

### Review (Valoración)
```typescript
model Review {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  
  rating     Int      // 1-5
  title      String?
  comment    String?
  
  isApproved Boolean  @default(false)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Favorite (Favoritos)
```typescript
model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, productId])
}
```

### ApiKey (Claves de API)
```typescript
model ApiKey {
  id          String   @id @default(uuid())
  name        String   // Nombre de la aplicación
  key         String   @unique
  secret      String   // Hash
  
  userId      String?  // Si está asociada a un usuario
  
  permissions String[] // ["read:products", "write:orders"]
  rateLimit   Int      @default(100) // requests por minuto
  
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### AuditLog (Log de Auditoría)
```typescript
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  action     String   // "CREATE_ORDER", "UPDATE_PRODUCT"
  entity     String   // "Order", "Product"
  entityId   String
  changes    Json?    // Before/After
  ipAddress  String?
  userAgent  String?
  
  createdAt  DateTime @default(now())
}
```

### SystemConfig (Configuración del Sistema)
```typescript
model SystemConfig {
  id        String   @id @default(uuid())
  key       String   @unique
  value     Json
  
  updatedAt DateTime @updatedAt
}
```

## Índices y Optimizaciones

```prisma
// En Product
@@index([categoryId])
@@index([status])
@@index([isActive, featured])

// En Order
@@index([userId])
@@index([status])
@@index([startDate, endDate])
@@index([orderNumber])

// En Invoice
@@index([orderId])
@@index([status])
@@index([issueDate])

// En AuditLog
@@index([userId])
@@index([entity, entityId])
@@index([createdAt])
```

## Relaciones Clave

1. **User ↔ Order**: Un usuario puede tener múltiples pedidos
2. **Order ↔ OrderItem**: Un pedido contiene múltiples items
3. **Order ↔ Invoice**: Un pedido genera una factura
4. **Product ↔ OrderItem**: Tracking de qué se alquiló
5. **Category ↔ Product**: Organización del catálogo
6. **Pack ↔ Product**: Paquetes predefinidos

## Consideraciones

- **UUIDs** para IDs por seguridad y distribución
- **Soft deletes** donde sea necesario (isActive flags)
- **Timestamps** automáticos en todos los modelos
- **Json fields** para datos flexibles (direcciones, especificaciones)
- **Decimal** para montos monetarios (precisión exacta)
- **Cascadas** configuradas para integridad referencial
