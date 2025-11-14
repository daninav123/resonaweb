# 🧪 Estrategia de Testing - ReSona

## Objetivos
- Cobertura mínima: 70%
- Tests automáticos en CI/CD
- Prevenir regresiones

## Stack de Testing

### Backend
- **Jest** - Framework principal
- **Supertest** - Testing de endpoints
- **ts-jest** - Jest con TypeScript

### Frontend
- **Vitest** - Testing rápido para Vite
- **React Testing Library** - Testing de componentes
- **MSW** - Mock Service Worker para API

## Tests Unitarios

### Backend
```typescript
// packages/backend/tests/unit/pricing.test.ts
describe('calculateOrderTotal', () => {
  it('calculates total with 21% tax', () => {
    const result = calculateOrderTotal(100, 21);
    expect(result.total).toBe(121);
  });
});
```

### Frontend
```typescript
// packages/frontend/tests/unit/formatPrice.test.ts
describe('formatPrice', () => {
  it('formats price in euros', () => {
    expect(formatPrice(100)).toBe('100,00 €');
  });
});
```

## Tests de Integración

### Backend (Endpoints)
```typescript
// packages/backend/tests/integration/orders.test.ts
describe('POST /api/v1/orders', () => {
  it('creates order successfully', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderData);
    
    expect(response.status).toBe(201);
    expect(response.body.orderNumber).toBeDefined();
  });
});
```

## Coverage

```bash
# Backend
cd packages/backend
npm run test:coverage

# Frontend
cd packages/frontend
npm run test:coverage
```

## CI/CD Integration

```yaml
# .github/workflows/tests.yml
- name: Run tests
  run: |
    npm run test:ci --workspaces
    npm run test:coverage --workspaces
```

## Tests Críticos

### Prioridad Alta
- [ ] Autenticación (login, register, JWT)
- [ ] Creación de pedidos
- [ ] Cálculo de precios
- [ ] Generación de facturas
- [ ] Validación de disponibilidad

### Prioridad Media
- [ ] CRUD de productos
- [ ] Filtros de búsqueda
- [ ] Cambios de estado de pedidos

### Prioridad Baja
- [ ] Formateo de datos
- [ ] Componentes UI básicos

## Setup de Tests

### Backend (Jest + Supertest)

#### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

#### Test Database Setup
```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST
    }
  }
});

beforeAll(async () => {
  await prisma.$connect();
  // Ejecutar migraciones
  await exec('npx prisma migrate deploy');
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpiar DB entre tests
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});
```

### Frontend (Vitest + React Testing Library)

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

#### Mock Service Worker Setup
```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/v1/products', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          { id: '1', name: 'Altavoces JBL', pricePerDay: 50 }
        ]
      })
    );
  }),
  
  rest.post('/api/v1/orders', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'order-1',
        orderNumber: 'RES-2024-0001'
      })
    );
  })
];
```

## Ejemplos de Tests Completos

### Backend: Test de Autenticación
```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Authentication', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+34600000000'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(userData.email);
      
      // Verificar que se guardó en BD
      const user = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      expect(user).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      // Crear usuario primero
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashed',
          firstName: 'Existing',
          lastName: 'User'
        }
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'Test123!',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
      // Setup: crear usuario
      const password = 'Test123!';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await prisma.user.create({
        data: {
          email: 'login@example.com',
          password: hashedPassword,
          firstName: 'Login',
          lastName: 'Test'
        }
      });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
  });
});
```

### Backend: Test de Pedidos
```typescript
// tests/integration/orders.test.ts
describe('Orders', () => {
  let authToken: string;
  let userId: string;
  let productId: string;

  beforeEach(async () => {
    // Setup: crear usuario y producto
    const user = await prisma.user.create({
      data: {
        email: 'ordertest@example.com',
        password: 'hashed',
        firstName: 'Order',
        lastName: 'Test'
      }
    });
    userId = user.id;
    authToken = generateToken(user);

    const product = await prisma.product.create({
      data: {
        name: 'Altavoces Test',
        sku: 'TEST-001',
        slug: 'altavoces-test',
        description: 'Test product',
        pricePerDay: 50,
        stock: 10,
        categoryId: 'cat-id'
      }
    });
    productId = product.id;
  });

  describe('POST /api/v1/orders', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        startDate: '2024-12-01T10:00:00Z',
        endDate: '2024-12-03T20:00:00Z',
        eventType: 'boda',
        eventLocation: {
          address: 'Calle Test 123',
          city: 'Valencia',
          postalCode: '46001'
        },
        attendees: 100,
        contactPerson: 'Test Contact',
        contactPhone: '+34600000000',
        deliveryType: 'DELIVERY',
        items: [
          {
            productId: productId,
            quantity: 2
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.orderNumber).toMatch(/RES-\d{4}-\d{4}/);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.items).toHaveLength(1);
    });

    it('should reject order with unavailable product', async () => {
      // Hacer producto no disponible
      await prisma.product.update({
        where: { id: productId },
        data: { stock: 0 }
      });

      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2024-12-01T10:00:00Z',
          endDate: '2024-12-03T20:00:00Z',
          items: [{ productId, quantity: 1 }]
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('PRODUCT_NOT_AVAILABLE');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return user orders', async () => {
      // Crear un pedido
      await prisma.order.create({
        data: {
          userId: userId,
          orderNumber: 'RES-2024-0001',
          startDate: new Date(),
          endDate: new Date(),
          eventType: 'boda',
          eventLocation: {},
          contactPerson: 'Test',
          contactPhone: '+34600000000',
          deliveryType: 'PICKUP',
          subtotal: 100,
          taxAmount: 21,
          total: 121
        }
      });

      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].orderNumber).toBe('RES-2024-0001');
    });
  });
});
```

### Frontend: Test de Componente
```typescript
// tests/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../../src/components/ProductCard';
import { vi } from 'vitest';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Altavoces JBL PRX815',
    slug: 'altavoces-jbl-prx815',
    pricePerDay: 50,
    mainImageUrl: 'https://example.com/image.jpg',
    stock: 5
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Altavoces JBL PRX815')).toBeInTheDocument();
    expect(screen.getByText('50,00 €/día')).toBeInTheDocument();
  });

  it('calls onAddToCart when button clicked', () => {
    const handleAddToCart = vi.fn();
    
    render(
      <ProductCard 
        product={mockProduct} 
        onAddToCart={handleAddToCart}
      />
    );
    
    const button = screen.getByRole('button', { name: /añadir/i });
    fireEvent.click(button);
    
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('shows out of stock message when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    
    render(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Frontend: Test de Custom Hook
```typescript
// tests/hooks/useCart.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCart } from '../../src/hooks/useCart';

describe('useCart', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    
    const product = {
      id: '1',
      name: 'Test Product',
      pricePerDay: 50
    };
    
    act(() => {
      result.current.addItem(product, 2);
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(100);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart());
    
    const product = { id: '1', name: 'Test', pricePerDay: 50 };
    
    act(() => {
      result.current.addItem(product, 1);
      result.current.removeItem('1');
    });
    
    expect(result.current.items).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({ id: '1', pricePerDay: 50 }, 1);
      result.current.addItem({ id: '2', pricePerDay: 30 }, 2);
      result.current.clear();
    });
    
    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });
});
```

## Tests E2E (Opcional pero Recomendado)

### Con Playwright
```typescript
// e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('complete order from product to payment', async ({ page }) => {
    // 1. Ir a catálogo
    await page.goto('http://localhost:3000');
    
    // 2. Buscar producto
    await page.fill('input[name="search"]', 'altavoces');
    await page.click('button[type="submit"]');
    
    // 3. Añadir al carrito
    await page.click('button:has-text("Añadir al carrito")').first();
    
    // 4. Ir al carrito
    await page.click('a[href="/cart"]');
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // 5. Proceder al checkout
    await page.click('button:has-text("Finalizar pedido")');
    
    // 6. Login/Register (si no autenticado)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!');
    await page.click('button:has-text("Continuar")');
    
    // 7. Formulario del evento
    await page.fill('input[name="eventLocation"]', 'Valencia');
    await page.fill('input[name="contactPerson"]', 'Test User');
    await page.click('button:has-text("Siguiente")');
    
    // 8. Seleccionar entrega
    await page.click('input[value="DELIVERY"]');
    await page.click('button:has-text("Siguiente")');
    
    // 9. Verificar resumen
    await expect(page.locator('.order-summary')).toBeVisible();
    
    // 10. Pago (usar Stripe test card)
    // ... integración con Stripe Elements
  });
});
```

## Scripts de NPM

### Backend package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Frontend package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:ci": "vitest run --coverage"
  }
}
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: resona_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run backend tests
        run: npm run test:ci --workspace=backend
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/resona_test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/backend/coverage/coverage-final.json

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run frontend tests
        run: npm run test:ci --workspace=frontend
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./packages/frontend/coverage/coverage-final.json
```

## Best Practices

### 1. Test Naming
```typescript
// ✅ Bien
it('should create order when user is authenticated')
it('should return 401 when token is invalid')
it('should calculate shipping cost based on weight and volume')

// ❌ Mal
it('test 1')
it('order creation')
```

### 2. Arrange-Act-Assert Pattern
```typescript
it('should add product to cart', () => {
  // Arrange (preparar)
  const product = { id: '1', price: 50 };
  const cart = new Cart();
  
  // Act (actuar)
  cart.add(product);
  
  // Assert (verificar)
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(50);
});
```

### 3. Isolation
Cada test debe ser independiente y no depender de otros.

### 4. Mock External Dependencies
```typescript
// Mock de Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn().mockResolvedValue({
        id: 'pi_test',
        client_secret: 'secret_test'
      })
    }
  }))
}));
```

### 5. Test Data Builders
```typescript
// tests/builders/product.builder.ts
export class ProductBuilder {
  private product = {
    id: 'test-id',
    name: 'Test Product',
    pricePerDay: 50,
    stock: 10
  };
  
  withName(name: string) {
    this.product.name = name;
    return this;
  }
  
  withPrice(price: number) {
    this.product.pricePerDay = price;
    return this;
  }
  
  build() {
    return this.product;
  }
}

// Uso
const product = new ProductBuilder()
  .withName('Altavoces JBL')
  .withPrice(75)
  .build();
```

## Cobertura de Tests

**Objetivo: 70% mínimo**

### Áreas Críticas (90%+):
- Autenticación
- Pagos
- Cálculos (precios, envío)
- Validaciones

### Áreas Normales (70%+):
- CRUD operations
- Servicios
- Controladores

### Áreas Menos Críticas (50%+):
- Utilidades
- Formateo
- Componentes UI simples
