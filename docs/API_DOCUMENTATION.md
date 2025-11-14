# 🔌 Documentación de API - ReSona

## Base URL
```
Desarrollo: http://localhost:3001/api/v1
Producción: https://api.resona.com/v1
```

## Autenticación

### Cliente Web (JWT)
```http
Authorization: Bearer <jwt_token>
```

### API Pública (API Key)
```http
X-API-Key: <api_key>
X-API-Secret: <api_secret>
```

## Rate Limiting
- **Autenticado:** 1000 requests/hora
- **API Key:** Configurable por cliente (default: 100/min)

## Endpoints Principales

### Autenticación

#### POST /auth/register
Registro de nuevo cliente.
```json
{
  "email": "cliente@example.com",
  "password": "Password123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+34600000000"
}
```

#### POST /auth/login
```json
{
  "email": "cliente@example.com",
  "password": "Password123!"
}
```
Respuesta:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": "...", "email": "...", "role": "CLIENT" }
}
```

### Productos

#### GET /products
Listar productos con filtros.

**Query Params:**
- `category` - ID de categoría
- `search` - Búsqueda por nombre
- `minPrice`, `maxPrice` - Rango de precio
- `available` - true/false
- `startDate`, `endDate` - Para verificar disponibilidad
- `page`, `limit` - Paginación

#### GET /products/:id
Detalle de un producto.

#### POST /products (Admin)
Crear producto.

#### PATCH /products/:id (Admin)
Actualizar producto.

#### DELETE /products/:id (Admin)
Eliminar producto.

### Disponibilidad

#### POST /availability/check
Verificar disponibilidad de productos en fechas específicas.
```json
{
  "productIds": ["uuid1", "uuid2"],
  "startDate": "2024-12-01T00:00:00Z",
  "endDate": "2024-12-03T23:59:59Z"
}
```

### Pedidos

#### GET /orders
Listar pedidos (cliente ve solo los suyos, admin ve todos).

#### GET /orders/:id
Detalle de pedido.

#### POST /orders
Crear nuevo pedido.
```json
{
  "startDate": "2024-12-01T10:00:00Z",
  "endDate": "2024-12-03T20:00:00Z",
  "eventType": "boda",
  "eventLocation": {
    "address": "Calle Example 123",
    "city": "Madrid",
    "postalCode": "28001"
  },
  "attendees": 150,
  "contactPerson": "Juan Pérez",
  "contactPhone": "+34600000000",
  "deliveryType": "DELIVERY",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10
    }
  ],
  "specialNotes": "Montaje a las 8:00"
}
```

#### PATCH /orders/:id
Actualizar estado del pedido (Admin).

#### DELETE /orders/:id
Cancelar pedido.

### Facturas

#### GET /invoices/:id
Obtener factura.

#### GET /invoices/:id/pdf
Descargar PDF de factura.

### Categorías

#### GET /categories
Listar todas las categorías.

### Packs

#### GET /packs
Listar packs disponibles.

#### GET /packs/:id
Detalle de un pack.

## Códigos de Estado

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **409** - Conflict (ej: producto no disponible)
- **422** - Validation Error
- **429** - Too Many Requests
- **500** - Internal Server Error

## Webhooks

Para integraciones avanzadas, ReSona puede enviar notificaciones:

### Eventos Disponibles
- `order.created`
- `order.confirmed`
- `order.completed`
- `order.cancelled`
- `product.out_of_stock`

### Configuración
Configurar en panel de administración > API > Webhooks.

## Ejemplos de Uso

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'X-API-Key': 'your-api-key',
    'X-API-Secret': 'your-api-secret'
  }
});

// Obtener productos disponibles
const products = await api.get('/products', {
  params: {
    available: true,
    startDate: '2024-12-01',
    endDate: '2024-12-03'
  }
});

// Crear pedido
const order = await api.post('/orders', {
  startDate: '2024-12-01T10:00:00Z',
  endDate: '2024-12-03T20:00:00Z',
  // ... resto de datos
});
```

### cURL
```bash
curl -X GET "http://localhost:3001/api/v1/products" \
  -H "X-API-Key: your-api-key" \
  -H "X-API-Secret: your-api-secret"
```

### Python
```python
import requests

api_url = 'http://localhost:3001/api/v1'
headers = {
    'X-API-Key': 'your-api-key',
    'X-API-Secret': 'your-api-secret'
}

# Obtener productos
response = requests.get(f'{api_url}/products', headers=headers)
products = response.json()

# Crear pedido
order_data = {
    'startDate': '2024-12-01T10:00:00Z',
    'endDate': '2024-12-03T20:00:00Z',
    'eventType': 'boda',
    'items': [{'productId': 'uuid', 'quantity': 2}]
}
response = requests.post(f'{api_url}/orders', json=order_data, headers=headers)
order = response.json()
```

## Endpoints Adicionales

### Servicios

#### GET /services
Listar servicios adicionales disponibles (montaje, técnico, etc.).

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Montaje",
    "description": "Montaje profesional de equipos",
    "priceType": "FIXED",
    "price": 100.00,
    "estimatedHours": 2
  }
]
```

#### GET /services/:id
Detalle de un servicio.

### Tarifas de Envío

#### GET /shipping-rates
Listar tarifas de envío configuradas.

#### POST /shipping/calculate
Calcular coste de envío para un pedido.

**Request:**
```json
{
  "items": [
    {"productId": "uuid", "quantity": 2}
  ],
  "distance": 15.5
}
```

**Response:**
```json
{
  "totalWeight": 45.5,
  "totalVolume": 0.8,
  "shippingCost": 65.00,
  "rateName": "Estándar",
  "breakdown": {
    "basePrice": 20.00,
    "weightCost": 22.75,
    "volumeCost": 8.00,
    "distanceCost": 14.25
  }
}
```

### Pagos (Stripe)

#### POST /payments/create-intent
Crear Payment Intent de Stripe.

**Request:**
```json
{
  "orderId": "uuid",
  "amount": 250.00
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### POST /webhooks/stripe
Webhook de Stripe (uso interno).

### Facturas DJ (Admin)

#### GET /custom-invoices
Listar facturas DJ independientes.

**Query Params:**
- `status` - Estado de factura
- `startDate`, `endDate` - Rango de fechas
- `page`, `limit` - Paginación

#### GET /custom-invoices/:id
Detalle de factura DJ.

#### POST /custom-invoices
Crear factura DJ.

**Request:**
```json
{
  "clientName": "Juan Pérez",
  "clientEmail": "juan@example.com",
  "clientAddress": {
    "street": "Calle Example 123",
    "city": "Valencia",
    "postalCode": "46001"
  },
  "serviceDate": "2024-12-15T21:00:00Z",
  "items": [
    {
      "description": "Actuación DJ en boda - 5 horas",
      "quantity": 1,
      "unitPrice": 500.00
    }
  ],
  "notes": "Cliente contactado por teléfono"
}
```

**Response:**
```json
{
  "id": "uuid",
  "invoiceNumber": "FACT-DJ-2024-0001",
  "total": 605.00,
  "taxAmount": 105.00,
  "status": "DRAFT",
  "pdfUrl": null
}
```

#### PATCH /custom-invoices/:id
Actualizar factura DJ.

#### POST /custom-invoices/:id/generate-pdf
Generar PDF de factura DJ.

#### POST /custom-invoices/:id/send-email
Enviar factura por email al cliente.

### Reseñas

#### GET /products/:id/reviews
Obtener reseñas de un producto.

#### POST /products/:id/reviews
Crear reseña (requiere autenticación).

**Request:**
```json
{
  "rating": 5,
  "title": "Excelente equipo",
  "comment": "Altavoces de gran calidad, muy satisfecho."
}
```

### Favoritos

#### GET /favorites
Listar productos favoritos del usuario.

#### POST /favorites
Añadir producto a favoritos.

```json
{
  "productId": "uuid"
}
```

#### DELETE /favorites/:productId
Eliminar de favoritos.

### Estadísticas (Admin)

#### GET /stats/dashboard
Obtener estadísticas del dashboard.

**Response:**
```json
{
  "ordersToday": 5,
  "ordersThisMonth": 47,
  "revenueThisMonth": 15750.00,
  "inventoryOccupation": 65.5,
  "pendingOrders": 8,
  "topProducts": [
    {"productId": "uuid", "name": "Altavoces JBL", "rentCount": 15}
  ]
}
```

## Respuestas de Error

### Formato Estándar
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos proporcionados no son válidos",
    "details": [
      {
        "field": "email",
        "message": "El email no es válido"
      }
    ]
  }
}
```

### Códigos de Error Comunes
- `VALIDATION_ERROR` - Error de validación
- `AUTHENTICATION_REQUIRED` - Se requiere autenticación
- `INSUFFICIENT_PERMISSIONS` - Permisos insuficientes
- `RESOURCE_NOT_FOUND` - Recurso no encontrado
- `PRODUCT_NOT_AVAILABLE` - Producto no disponible
- `PAYMENT_FAILED` - Pago fallido
- `RATE_LIMIT_EXCEEDED` - Límite de requests excedido

## Paginación

### Formato
```
GET /products?page=1&limit=20
```

### Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Versionado

La API usa versionado en la URL: `/api/v1/`

Cuando se publique v2, la v1 seguirá disponible por compatibilidad.
