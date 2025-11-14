# 🔑 Sistema de API Keys - ReSona

## 🎯 Objetivo

Controlar el acceso a la API REST de ReSona mediante claves (API Keys) que **tú generas y gestionas** desde el panel de administración.

## 🔒 Nivel de Acceso

### ❌ NO es Pública
La API **NO** es accesible para cualquiera. Requiere:
- API Key válida
- API Secret
- Ambos generados por ti desde el admin

### ✅ Es Privada y Controlada
- **TÚ decides** quién tiene acceso
- **TÚ generas** las API Keys
- **TÚ configuras** los permisos de cada key
- **TÚ puedes revocar** el acceso en cualquier momento

## 🎭 Casos de Uso

### 1. Tu Otra Aplicación (Principal)
```
Caso: Tienes otra app en desarrollo que necesita conectarse

Solución:
1. Creas API Key llamada "Mi App Móvil"
2. Le das permisos completos
3. Sin límite de rate (o alto)
4. Tu app usa esa key para todo
```

### 2. Integración con Partner
```
Caso: Una empresa quiere integrar tu catálogo en su web

Solución:
1. Creas API Key "Partner XYZ"
2. Permisos: solo lectura de productos
3. Rate limit: 1000 req/hora
4. Ellos muestran tus productos, te envían clientes
```

### 3. Cliente Enterprise
```
Caso: Cliente grande quiere gestionar sus pedidos programáticamente

Solución:
1. Creas API Key específica para ese cliente
2. Permisos: ver solo SUS pedidos, crear nuevos
3. Rate limit moderado
4. Pueden automatizar sus reservas
```

### 4. Desarrollo/Testing
```
Caso: Necesitas probar la API

Solución:
1. Creas API Key "Testing"
2. Permisos completos
3. Puedes eliminarla cuando termines
```

## 🏗️ Arquitectura

### Modelo de Datos

```typescript
model ApiKey {
  id          String   @id @default(uuid())
  
  // Identificación
  name        String   // "Mi App Móvil", "Partner XYZ"
  description String?
  
  // Credenciales
  key         String   @unique  // api_live_abc123...
  secret      String   // Hash bcrypt del secret
  
  // Propietario (opcional)
  userId      String?  // Si está asociada a un usuario
  user        User?    @relation(fields: [userId], references: [id])
  
  // Permisos (granulares)
  permissions String[] // ["read:products", "write:orders", "read:orders"]
  
  // Rate Limiting
  rateLimit   Int      @default(100)  // requests por minuto
  
  // Estado
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?  // Puede tener caducidad
  
  // Metadata
  metadata    Json?    // Info adicional
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([key])
  @@index([isActive])
}
```

### Generación de API Key

```typescript
// services/apiKey.service.ts

export class ApiKeyService {
  
  /**
   * Genera un par de API Key + Secret
   */
  async generateApiKey(data: {
    name: string;
    description?: string;
    permissions: string[];
    rateLimit?: number;
    expiresAt?: Date;
  }) {
    // 1. Generar key pública (prefijo + random)
    const key = `api_${process.env.NODE_ENV === 'production' ? 'live' : 'test'}_${this.generateRandomString(32)}`;
    
    // 2. Generar secret (mostrar solo UNA VEZ)
    const secret = `sk_${this.generateRandomString(48)}`;
    const hashedSecret = await bcrypt.hash(secret, 12);
    
    // 3. Guardar en BD
    const apiKey = await prisma.apiKey.create({
      data: {
        name: data.name,
        description: data.description,
        key: key,
        secret: hashedSecret,
        permissions: data.permissions,
        rateLimit: data.rateLimit || 100,
        expiresAt: data.expiresAt,
        isActive: true
      }
    });
    
    // 4. Retornar (secret solo visible ahora)
    return {
      id: apiKey.id,
      key: key,
      secret: secret,  // ⚠️ Guardar esto! No se puede recuperar
      message: 'Guarda el secret en un lugar seguro. No se volverá a mostrar.'
    };
  }
  
  /**
   * Verifica una API Key y devuelve sus permisos
   */
  async verifyApiKey(key: string, secret: string): Promise<ApiKey | null> {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: key }
    });
    
    if (!apiKey || !apiKey.isActive) {
      return null;
    }
    
    // Verificar que no haya expirado
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      return null;
    }
    
    // Verificar secret
    const isValid = await bcrypt.compare(secret, apiKey.secret);
    if (!isValid) {
      return null;
    }
    
    // Actualizar último uso
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() }
    });
    
    return apiKey;
  }
  
  private generateRandomString(length: number): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  }
}
```

## 🛡️ Middleware de Autenticación

```typescript
// middleware/apiKey.middleware.ts

export const requireApiKey = (requiredPermissions: string[] = []) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Obtener key y secret de headers
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;
    
    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        error: {
          code: 'API_KEY_REQUIRED',
          message: 'Se requiere X-API-Key y X-API-Secret headers'
        }
      });
    }
    
    // 2. Verificar la key
    const apiKeyService = new ApiKeyService();
    const verifiedKey = await apiKeyService.verifyApiKey(apiKey, apiSecret);
    
    if (!verifiedKey) {
      return res.status(401).json({
        error: {
          code: 'INVALID_API_KEY',
          message: 'API Key inválida o expirada'
        }
      });
    }
    
    // 3. Verificar permisos
    if (requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(
        perm => verifiedKey.permissions.includes(perm)
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `Se requieren permisos: ${requiredPermissions.join(', ')}`
          }
        });
      }
    }
    
    // 4. Rate limiting
    const rateLimiter = new RateLimiter();
    const allowed = await rateLimiter.check(verifiedKey.id, verifiedKey.rateLimit);
    
    if (!allowed) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Límite de ${verifiedKey.rateLimit} requests/minuto excedido`
        }
      });
    }
    
    // 5. Adjuntar info al request
    req.apiKey = verifiedKey;
    next();
  };
};
```

## 📝 Sistema de Permisos

### Permisos Disponibles

```typescript
const PERMISSIONS = {
  // Productos
  'read:products': 'Ver productos',
  'write:products': 'Crear/editar productos (admin)',
  
  // Pedidos
  'read:orders': 'Ver pedidos',
  'write:orders': 'Crear pedidos',
  'update:orders': 'Actualizar pedidos',
  
  // Facturas
  'read:invoices': 'Ver facturas',
  
  // Disponibilidad
  'read:availability': 'Consultar disponibilidad',
  
  // Estadísticas (admin)
  'read:stats': 'Ver estadísticas',
  
  // Wildcard
  'admin': 'Acceso completo (todos los permisos)'
};
```

### Ejemplos de Configuración

#### Tu App Personal (Full Access)
```json
{
  "name": "Mi App Móvil",
  "permissions": ["admin"],
  "rateLimit": 10000
}
```

#### Partner (Solo Lectura)
```json
{
  "name": "Partner XYZ",
  "permissions": [
    "read:products",
    "read:availability"
  ],
  "rateLimit": 1000
}
```

#### Cliente Enterprise (Gestionar sus pedidos)
```json
{
  "name": "Cliente ABC Corp",
  "permissions": [
    "read:products",
    "read:orders",
    "write:orders",
    "read:availability"
  ],
  "rateLimit": 500,
  "userId": "uuid-del-cliente"
}
```

#### Testing/Development
```json
{
  "name": "Development Testing",
  "permissions": ["admin"],
  "rateLimit": 10000,
  "expiresAt": "2024-12-31"
}
```

## 🎨 Panel de Administración

### Vista: Lista de API Keys

```
API Keys
════════════════════════════════════════════════════════

[+ Nueva API Key]

┌─────────────────────────────────────────────────────┐
│ Mi App Móvil                            🟢 Activa   │
│ api_live_abc123...def456                            │
│ Permisos: admin                                     │
│ Rate limit: 10,000/min                              │
│ Último uso: Hace 5 minutos                          │
│ Creada: 15 Nov 2024                                 │
│                                                      │
│ [Ver Stats] [Regenerar] [Desactivar] [Eliminar]    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Partner XYZ                             🟢 Activa   │
│ api_live_xyz789...ghi012                            │
│ Permisos: read:products, read:availability          │
│ Rate limit: 1,000/min                               │
│ Último uso: Hace 2 horas                            │
│ Creada: 10 Nov 2024                                 │
│                                                      │
│ [Ver Stats] [Editar] [Desactivar] [Eliminar]       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Old Testing Key                         🔴 Inactiva │
│ api_test_old123...xyz789                            │
│ Desactivada hace 30 días                            │
│                                                      │
│ [Reactivar] [Eliminar]                              │
└─────────────────────────────────────────────────────┘
```

### Crear Nueva API Key

```
Nueva API Key
════════════════════════════════════════════════════════

Nombre *
[Mi Nueva App_________________]

Descripción
[Aplicación móvil para gestión de eventos______]

Permisos *
☑ Acceso completo (admin)
☐ Permisos personalizados:
  Productos
    ☐ read:products
    ☐ write:products
  Pedidos
    ☐ read:orders
    ☐ write:orders
    ☐ update:orders
  ...

Rate Limit (requests/minuto) *
[1000_______] ℹ️ Recomendado: 100-1000

Expiración (opcional)
☐ Sin expiración
☐ Expira el: [___________] 📅

Usuario asociado (opcional)
[Seleccionar usuario_______▼]

[Cancelar] [Generar API Key]
```

### Después de Generar

```
✅ API Key Generada Exitosamente
════════════════════════════════════════════════════════

⚠️ IMPORTANTE: Guarda estos datos en un lugar seguro.
   El Secret solo se muestra UNA VEZ.

API Key:
api_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

Secret:
sk_q9w8e7r6t5y4u3i2o1p0a9s8d7f6g5h4j3k2l1

[Copiar API Key] [Copiar Secret] [Descargar como .env]

[Cerrar]
```

## 🔌 Uso de la API

### Ejemplo: JavaScript/Node.js

```javascript
// config.js
const API_CONFIG = {
  baseURL: 'https://api.resona.com/v1',
  apiKey: 'api_live_abc123...',
  apiSecret: 'sk_xyz789...'
};

// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'X-API-Key': API_CONFIG.apiKey,
    'X-API-Secret': API_CONFIG.apiSecret,
    'Content-Type': 'application/json'
  }
});

// Uso
async function getProducts() {
  const response = await api.get('/products');
  return response.data;
}

async function createOrder(orderData) {
  const response = await api.post('/orders', orderData);
  return response.data;
}
```

### Ejemplo: Python

```python
import requests

class ResonaAPI:
    def __init__(self, api_key, api_secret):
        self.base_url = 'https://api.resona.com/v1'
        self.headers = {
            'X-API-Key': api_key,
            'X-API-Secret': api_secret,
            'Content-Type': 'application/json'
        }
    
    def get_products(self):
        response = requests.get(
            f'{self.base_url}/products',
            headers=self.headers
        )
        return response.json()
    
    def create_order(self, order_data):
        response = requests.post(
            f'{self.base_url}/orders',
            json=order_data,
            headers=self.headers
        )
        return response.json()

# Uso
api = ResonaAPI(
    api_key='api_live_abc123...',
    api_secret='sk_xyz789...'
)

products = api.get_products()
```

### Ejemplo: cURL

```bash
curl -X GET "https://api.resona.com/v1/products" \
  -H "X-API-Key: api_live_abc123..." \
  -H "X-API-Secret: sk_xyz789..."
```

## 📊 Datos Compartidos por la API

### Endpoints Públicos (con API Key)

#### ✅ Sí Comparte (Lectura)
- **Productos:**
  - Lista de productos activos
  - Detalles de productos
  - Imágenes, precios, especificaciones
  - Disponibilidad por fechas
- **Categorías:**
  - Lista de categorías
- **Servicios:**
  - Servicios adicionales disponibles
- **Tarifas de envío:**
  - Cálculo de coste de envío

#### ✅ Sí Comparte (Escritura - con permisos)
- **Pedidos:**
  - Crear nuevos pedidos
  - Ver estado de pedidos
  - Actualizar pedidos (si tiene permiso)
- **Disponibilidad:**
  - Consultar disponibilidad en tiempo real

#### ❌ NO Comparte (Privado)
- Datos sensibles de otros clientes
- Información financiera detallada
- Datos personales de usuarios
- Configuración interna del sistema
- Contraseñas, tokens, secrets
- Facturas de otros clientes

### Filtrado Automático por Usuario

Si la API Key está asociada a un usuario:
```typescript
// Ejemplo: GET /orders
// Solo devuelve pedidos del usuario asociado

const apiKey = req.apiKey; // Del middleware

let query = {};

if (apiKey.userId) {
  // Si la key tiene usuario, solo sus pedidos
  query.userId = apiKey.userId;
} else if (!apiKey.permissions.includes('admin')) {
  // Si no es admin, no puede ver pedidos de otros
  return res.status(403).json({ error: 'Forbidden' });
}

const orders = await prisma.order.findMany({ where: query });
```

## 📈 Estadísticas y Monitorización

### Dashboard de API Key

```
API Key: Mi App Móvil
════════════════════════════════════════════════════════

Uso en las últimas 24h:
[Gráfico de requests por hora]

Endpoints más usados:
1. GET /products              1,234 requests
2. POST /orders                 456 requests
3. POST /availability/check     234 requests

Errores:
- 401 Unauthorized: 12
- 429 Too Many Requests: 3

Rate Limit:
▓▓▓▓▓▓▓▓▓░ 89% (8,900/10,000 requests/min)

Última petición:
2024-11-12 01:25:33 - GET /products?category=altavoces
```

## 🔐 Seguridad

### Buenas Prácticas

1. **Nunca expongas el Secret**
   ```javascript
   // ❌ MAL
   const secret = 'sk_xyz789...'; // Hardcoded
   
   // ✅ BIEN
   const secret = process.env.RESONA_API_SECRET;
   ```

2. **Usa HTTPS siempre**
   ```
   ❌ http://api.resona.com
   ✅ https://api.resona.com
   ```

3. **Rota las keys periódicamente**
   - Cada 6-12 meses
   - Inmediatamente si sospechas compromiso

4. **Usa keys diferentes por entorno**
   ```
   Development: api_test_...
   Production: api_live_...
   ```

5. **Monitoriza el uso**
   - Alertas si hay picos inusuales
   - Revisa logs regularmente

### Revocar Acceso

```typescript
// Desactivar inmediatamente
await prisma.apiKey.update({
  where: { id: apiKeyId },
  data: { isActive: false }
});

// O eliminar permanentemente
await prisma.apiKey.delete({
  where: { id: apiKeyId }
});
```

## 🧪 Testing con API Keys

### Crear Key de Testing

```bash
# Desde CLI o panel admin
npm run create-api-key -- \
  --name "Testing" \
  --permissions admin \
  --rate-limit 10000 \
  --expires "2024-12-31"
```

### Tests Automáticos

```typescript
// tests/api/products.test.ts
describe('API with API Key', () => {
  let testApiKey: string;
  let testApiSecret: string;
  
  beforeAll(async () => {
    // Crear key de test
    const key = await apiKeyService.generateApiKey({
      name: 'Test Key',
      permissions: ['admin']
    });
    testApiKey = key.key;
    testApiSecret = key.secret;
  });
  
  it('should access API with valid key', async () => {
    const response = await request(app)
      .get('/api/v1/products')
      .set('X-API-Key', testApiKey)
      .set('X-API-Secret', testApiSecret);
    
    expect(response.status).toBe(200);
  });
  
  it('should reject invalid key', async () => {
    const response = await request(app)
      .get('/api/v1/products')
      .set('X-API-Key', 'invalid_key')
      .set('X-API-Secret', 'invalid_secret');
    
    expect(response.status).toBe(401);
  });
});
```

## 📝 Resumen

### ✅ La API ES:
- **Privada** - Solo con API Key
- **Controlada** - Tú decides quién accede
- **Granular** - Permisos específicos por key
- **Monitoreada** - Ves todo el uso
- **Segura** - Encriptación, rate limiting, logs

### ❌ La API NO ES:
- **Pública** - Requiere autenticación
- **Abierta** - No es libre para todos
- **Sin control** - Tú gestionas todo

### 🎯 Ideal Para:
- Tu otra aplicación (full access)
- Partners de confianza (lectura limitada)
- Clientes enterprise (sus propios datos)
- Integraciones personalizadas

---

**¿Tienes más preguntas sobre el sistema de API Keys?**
