# 🎁 SISTEMA DE PACKS COMO PRODUCTOS

_Fecha: 20/11/2025 03:16_  
_Estado: IMPLEMENTADO_

---

## 🎯 **CONCEPTO:**

Los **packs son productos normales** que aparecen en la categoría "Packs". Cada pack tiene asociados los productos que lo componen, y el sistema verifica automáticamente el stock de todos sus componentes.

---

## 📊 **ESTRUCTURA:**

```
Producto "Pack Boda Premium"
├── isPack: true
├── Categoría: "Packs"
├── Precio: €200/día
└── Componentes:
    ├── 2x Luces LED
    ├── 1x Sistema de Sonido
    └── 4x Altavoces
```

---

## 🗄️ **BASE DE DATOS:**

### **Modificaciones a Product:**
```prisma
model Product {
  // ... campos existentes ...
  
  isPack      Boolean   @default(false)  // ← NUEVO
  
  // Relaciones cuando ES un pack
  components  ProductComponent[] @relation("PackComponents")
  
  // Relaciones cuando ES componente de un pack
  usedInPacks ProductComponent[] @relation("ComponentInPacks")
}
```

### **Nueva Tabla ProductComponent:**
```prisma
model ProductComponent {
  id           String
  
  packId       String     // ← Producto que ES pack
  pack         Product
  
  componentId  String     // ← Producto dentro del pack
  component    Product
  
  quantity     Int        // ← Cantidad en el pack
}
```

---

## 🔄 **FLUJO COMPLETO:**

### **1. Crear un Pack:**

```
1. Admin crea producto normal:
   - Nombre: "Pack Boda Premium"
   - Categoría: "Packs"
   - Precio: €200/día
   - isPack: true
   
2. Admin añade componentes:
   POST /api/v1/products/:packId/components
   {
     "components": [
       { "componentId": "luces-led-id", "quantity": 2 },
       { "componentId": "sonido-id", "quantity": 1 },
       { "componentId": "altavoces-id", "quantity": 4 }
     ]
   }
```

### **2. Cliente Ve el Pack:**

```
GET /api/v1/products?categoryId=packs-category-id

Response:
[
  {
    "id": "pack-boda-id",
    "name": "Pack Boda Premium",
    "isPack": true,
    "pricePerDay": 200,
    "category": { "name": "Packs" },
    "mainImageUrl": "..."
  }
]
```

### **3. Cliente Ve Detalles del Pack:**

```
GET /api/v1/products/pack-boda-id

Response:
{
  "id": "pack-boda-id",
  "name": "Pack Boda Premium",
  "isPack": true,
  "pricePerDay": 200,
  "components": [
    {
      "id": "comp-1",
      "quantity": 2,
      "component": {
        "id": "luces-led-id",
        "name": "Luces LED",
        "pricePerDay": 50,
        "mainImageUrl": "...",
        "realStock": 10
      }
    },
    {
      "id": "comp-2",
      "quantity": 1,
      "component": {
        "id": "sonido-id",
        "name": "Sistema de Sonido",
        "pricePerDay": 100,
        "realStock": 3
      }
    }
  ],
  "pricing": {
    "packPrice": 200,
    "individualPrice": 300,  // (2*50 + 1*100 + 4*10)
    "savings": 100,
    "savingsPercentage": 33
  }
}
```

### **4. Cliente Verifica Disponibilidad:**

```
POST /api/v1/products/pack-boda-id/check-pack-availability
{
  "startDate": "2024-12-01",
  "endDate": "2024-12-03",
  "quantity": 2  // Quiere 2 packs
}

Response (disponible):
{
  "available": true,
  "productName": "Pack Boda Premium",
  "totalComponents": 3,
  "message": "Pack completamente disponible"
}

Response (NO disponible):
{
  "available": false,
  "productName": "Pack Boda Premium",
  "unavailableComponents": [
    {
      "componentName": "Sistema de Sonido",
      "required": 2,  // 2 packs x 1 unidad
      "available": 1,
      "reason": "Stock insuficiente"
    }
  ],
  "message": "El pack no está completamente disponible. 1 componente(s) no disponible(s)."
}
```

### **5. Ver Máximo Disponible:**

```
GET /api/v1/products/pack-boda-id/max-pack-availability
    ?startDate=2024-12-01&endDate=2024-12-03

Response:
{
  "productId": "pack-boda-id",
  "productName": "Pack Boda Premium",
  "maxAvailableQuantity": 2,  // Limitado por Sonido
  "components": [
    {
      "name": "Luces LED",
      "requiredPerPack": 2,
      "available": 10  // 10/2 = 5 packs posibles
    },
    {
      "name": "Sistema de Sonido",
      "requiredPerPack": 1,
      "available": 2   // 2/1 = 2 packs posibles ← LIMITANTE
    },
    {
      "name": "Altavoces",
      "requiredPerPack": 4,
      "available": 20  // 20/4 = 5 packs posibles
    }
  ]
}
```

---

## 💻 **API ENDPOINTS:**

```typescript
// Productos normales (los packs aparecen aquí)
GET    /api/v1/products
GET    /api/v1/products/:id

// Gestión de componentes (ADMIN)
POST   /api/v1/products/:packId/components
GET    /api/v1/products/:packId/components
DELETE /api/v1/products/:packId/components/:componentId

// Verificación de disponibilidad de pack
POST   /api/v1/products/:packId/check-pack-availability
GET    /api/v1/products/:packId/max-pack-availability

// Listar solo packs
GET    /api/v1/products?isPack=true
```

---

## 📋 **EJEMPLO PASO A PASO:**

### **Admin crea Pack:**

```typescript
// 1. Crear producto base
POST /api/v1/products
{
  "name": "Pack Boda Premium",
  "description": "Todo lo necesario para tu boda",
  "categoryId": "packs-category-id",
  "pricePerDay": 200,
  "isPack": true,  // ← Importante
  "realStock": 999, // Stock del pack no importa, se calcula por componentes
  "mainImageUrl": "https://..."
}

Response: { "id": "pack-123", ... }

// 2. Añadir componentes
POST /api/v1/products/pack-123/components
{
  "components": [
    { "componentId": "prod-luces", "quantity": 2 },
    { "componentId": "prod-sonido", "quantity": 1 },
    { "componentId": "prod-altavoces", "quantity": 4 }
  ]
}

Response:
{
  "id": "pack-123",
  "name": "Pack Boda Premium",
  "components": [...]
}
```

### **Cliente consulta categoría Packs:**

```typescript
// Ver todos los packs
GET /api/v1/products?categoryId=packs-category-id

// O filtrar por packs
GET /api/v1/products?isPack=true
```

### **Cliente ve detalle:**

```typescript
GET /api/v1/products/pack-123

→ Ve el pack como producto normal
→ Ve lista de componentes incluidos
→ Ve ahorro vs comprar individual
```

---

## ✅ **VENTAJAS:**

```
✅ Packs aparecen como productos normales
✅ Misma UI que productos individuales
✅ Categoría "Packs" para organizarlos
✅ Control automático de stock
✅ Verifica TODOS los componentes
✅ Muestra qué componente limita
✅ Calcula ahorro automáticamente
✅ Reutiliza lógica existente de productos
✅ Fácil de gestionar en admin
```

---

## 🎨 **UI EJEMPLO:**

### **Listado de Productos (Categoría Packs):**

```
┌────────────────────────────────────────┐
│ PACKS                                  │
├────────────────────────────────────────┤
│                                        │
│ ┌────────┐  ┌────────┐  ┌────────┐   │
│ │ 📦     │  │ 📦     │  │ 📦     │   │
│ │ Pack   │  │ Pack   │  │ Pack   │   │
│ │ Boda   │  │ Evento │  │ Fiesta │   │
│ │        │  │        │  │        │   │
│ │ €200/d │  │ €150/d │  │ €100/d │   │
│ │ 💾 Pack│  │ 💾 Pack│  │ 💾 Pack│   │
│ └────────┘  └────────┘  └────────┘   │
└────────────────────────────────────────┘
```

### **Detalle de Pack:**

```
┌──────────────────────────────────────────┐
│ Pack Boda Premium              €200/día  │
├──────────────────────────────────────────┤
│                                          │
│ 💰 AHORRO: €100 (33% descuento)         │
│                                          │
│ 📦 INCLUYE:                              │
│ ┌────────────────────────────────────┐  │
│ │ ✓ 2x Luces LED          €50 c/u   │  │
│ │ ✓ 1x Sistema Sonido     €100       │  │
│ │ ✓ 4x Altavoces          €10 c/u   │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Total individual: €300                   │
│ Precio pack:      €200                   │
│ Ahorras:          €100                   │
│                                          │
│ [📅 Verificar Disponibilidad]            │
└──────────────────────────────────────────┘
```

---

## 🔧 **ARCHIVOS CREADOS:**

```
Backend:
✅ prisma/migrations/add_product_components/migration.sql
✅ prisma/schema.prisma (modificado)
✅ src/services/productPack.service.ts
```

---

## 📝 **SIGUIENTE PASO:**

Aplicar la migración:

```bash
cd packages/backend
npx prisma migrate dev --name add_product_components
```

---

_Implementado: 20/11/2025_  
_Tipo: Pack como Producto con Componentes_  
_Estado: ✅ LISTO PARA USAR_
