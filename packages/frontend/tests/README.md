# 🧪 Tests E2E - Guía de Uso

## 📦 Instalación

Los tests ya están instalados. Si necesitas reinstalar:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

## 🚀 Ejecutar Tests

### **Ejecutar todos los tests:**
```bash
npm run test:e2e
```

### **Ejecutar solo tests críticos:**
```bash
npm run test:e2e:critical
```

### **Ejecutar en modo UI (interactivo):**
```bash
npm run test:e2e:ui
```

### **Ejecutar en modo debug:**
```bash
npm run test:e2e:debug
```

### **Ver reporte de resultados:**
```bash
npm run test:e2e:report
```

### **Ejecutar tests específicos:**
```bash
# Tests de autenticación
npx playwright test tests/e2e/user/auth.spec.ts

# Tests de carrito
npx playwright test tests/e2e/user/cart.spec.ts

# Tests de checkout
npx playwright test tests/e2e/user/checkout.spec.ts

# Tests de pedidos
npx playwright test tests/e2e/user/orders.spec.ts

# Tests de admin
npx playwright test tests/e2e/admin/
```

## 📁 Estructura de Tests

```
tests/
├── e2e/
│   ├── user/
│   │   ├── auth.spec.ts      # Login, registro, logout
│   │   ├── cart.spec.ts      # Carrito, favoritos
│   │   ├── checkout.spec.ts  # Checkout completo, cupones
│   │   └── orders.spec.ts    # Ver pedidos, descargar factura
│   ├── admin/
│   │   ├── auth.spec.ts      # Login admin, seguridad
│   │   ├── products.spec.ts  # CRUD productos, stock
│   │   └── orders.spec.ts    # Gestión pedidos, facturas
│   ├── smoke.spec.ts         # Tests de verificación básica
│   └── debug-login.spec.ts   # Tests de debugging
├── utils/
│   ├── auth.ts      # Helpers de autenticación
│   ├── cart.ts      # Helpers de carrito
│   ├── checkout.ts  # Helpers de checkout
│   ├── helpers.ts   # Utilidades generales
│   └── fixtures.ts  # Carga de fixtures
└── fixtures/
    ├── users.json     # Datos de usuarios de test
    ├── products.json  # Datos de productos de test
    └── coupons.json   # Datos de cupones de test
```

## ⚙️ Configuración

La configuración está en `playwright.config.ts`:

- **Base URL:** http://localhost:3000
- **Timeout:** 30 segundos por test
- **Browser:** Chromium
- **Workers:** 1 (secuencial)
- **Retries:** 0 en local, 2 en CI

## 📝 Tests Implementados

### **Usuario (12 tests):**
- ✅ Registro de usuario
- ✅ Login/Logout
- ✅ Añadir al carrito sin login
- ✅ Carrito múltiples productos
- ✅ Checkout completo con Stripe
- ✅ Checkout con entrega a domicilio
- ✅ Aplicar cupón válido/inválido
- ✅ Ver lista de pedidos
- ✅ Ver detalle de pedido
- ✅ Descargar factura
- ✅ Añadir a favoritos
- ✅ Fechas globales en carrito

### **Admin (10 tests):**
- ✅ Login como admin
- ✅ Crear producto
- ✅ Editar producto
- ✅ Eliminar producto
- ✅ Ver todos los pedidos
- ✅ Confirmar pedido
- ✅ Cancelar pedido
- ✅ Modificar pedido
- ✅ Generar factura manual
- ✅ Gestionar stock

### **Seguridad (2 tests):**
- ✅ Acceso no autorizado a admin
- ✅ Ver pedido de otro usuario

### **Errores (1 test):**
- ✅ Pago fallido con tarjeta rechazada

### **Total: 25 tests E2E implementados**

## 🔧 Antes de Ejecutar

### **1. Asegúrate de que el servidor esté corriendo:**
```bash
# En una terminal separada
cd packages/backend
npm run dev

# En otra terminal
cd packages/frontend
npm run dev
```

### **2. Configura datos de test:**

Edita los archivos de utils y cambia:
- Email y contraseña de admin en `tests/utils/auth.ts`
- Slugs de productos en `tests/utils/cart.ts`

### **3. Ten productos de prueba:**

Los tests asumen que existe:
- Un producto con slug `letras-luminosas`
- Un usuario admin con email configurado
- Al menos un pedido en el sistema

## 🐛 Debugging

### **Ver qué está pasando:**
```bash
npm run test:e2e:debug
```

### **Screenshots y videos:**
Los screenshots de fallos se guardan en `test-results/`

### **Trace viewer:**
```bash
npx playwright show-trace trace.zip
```

## 📦 Usando Fixtures

### **Cargar datos de test:**
```typescript
import { getUser, getProduct, getCoupon, testData } from '../utils/fixtures';

// Obtener usuario
const admin = getUser('admin');
await page.fill('[name="email"]', admin.email);
await page.fill('[name="password"]', admin.password);

// Obtener producto
const product = getProduct('testProduct1');
await page.goto(`/productos/${product.slug}`);

// Obtener cupón
const coupon = getCoupon('testCoupon10');
await page.fill('[data-testid="coupon-input"]', coupon.code);

// Usar datos de test
await page.fill('[name="address"]', testData.address.valid);
```

## ⚠️ Notas Importantes

1. **Los tests modifican datos:** Crean pedidos, productos, etc.
2. **Usar base de datos de test:** Recomendado usar BD separada para tests
3. **Limpiar datos:** Los tests limpian localStorage antes de cada uno (ahora con manejo de errores mejorado)
4. **Timeouts:** Si algún test falla por timeout, aumenta en `playwright.config.ts`
5. **Credenciales:** Usa fixtures de `tests/fixtures/users.json`

## 🎯 Tests Críticos

Los tests más importantes para ejecutar antes de cada deploy:

```bash
npm run test:e2e:critical
```

Incluye:
- Login y registro
- Checkout completo
- Gestión de pedidos admin

## 📊 Próximos Tests a Implementar

- [ ] Tests de concurrencia
- [ ] Tests de performance
- [ ] Tests en móvil
- [ ] Tests de analytics
- [ ] Tests de cupones admin
- [ ] Tests de blog
- [ ] Tests de exportación

## 🚀 CI/CD

Para ejecutar en CI:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
```

## 📞 Ayuda

Si los tests fallan:

1. Verifica que el servidor esté corriendo
2. Revisa las credenciales en los helpers
3. Asegúrate de que hay datos de test
4. Ejecuta con `--debug` para ver paso a paso
5. Revisa screenshots en `test-results/`
