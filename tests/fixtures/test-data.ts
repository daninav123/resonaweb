/**
 * Datos de prueba reutilizables para tests E2E
 */

// Generar email único para cada test
export const generateTestEmail = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}@test-resona.com`;
};

// Generar SKU único
export const generateSKU = (prefix: string = 'TEST'): string => {
  return `${prefix}-${Date.now()}`;
};

// Usuario de prueba
export const testUser = {
  email: generateTestEmail('user'),
  password: 'Test123!@#',
  firstName: 'Test',
  lastName: 'User',
  phone: '+34666777888'
};

// Credenciales de admin (existentes en el sistema)
export const adminCredentials = {
  email: 'admin@resona.com',
  password: 'Admin123!@#'
};

// Producto de prueba para crear
export const testProduct = {
  name: 'Producto Test E2E',
  sku: generateSKU('PROD'),
  description: 'Este es un producto creado por un test E2E automatizado',
  pricePerDay: 50,
  pricePerWeekend: 90,
  pricePerWeek: 300,
  stock: 10,
  weight: 5,
  length: 100,
  width: 50,
  height: 30
};

// Categoría de prueba
export const testCategory = {
  name: 'Categoría Test E2E',
  slug: `cat-test-${Date.now()}`,
  description: 'Categoría creada por test E2E'
};

// Pack de prueba
export const testPack = {
  name: 'Pack Test E2E',
  sku: generateSKU('PACK'),
  description: 'Pack creado por test E2E',
  pricePerDay: 150,
  pricePerWeekend: 270,
  pricePerWeek: 900,
  stock: 5
};

// Datos de checkout/pedido
export const testCheckoutData = {
  deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 días desde ahora
  returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 días desde ahora
  deliveryAddress: 'Calle Test, 123',
  deliveryCity: 'Madrid',
  deliveryPostalCode: '28001',
  notes: 'Notas de prueba para el pedido E2E'
};

// Producto de prueba completo con todas las propiedades
export const fullTestProduct = {
  name: 'Producto Completo Test',
  sku: generateSKU('FULL'),
  description: 'Producto de prueba con todas las propiedades configuradas',
  pricePerDay: 75,
  pricePerWeekend: 135,
  pricePerWeek: 450,
  weekendMultiplier: 1.8,
  weekMultiplier: 6,
  stock: 15,
  realStock: 15,
  status: 'AVAILABLE',
  weight: 10,
  length: 150,
  width: 80,
  height: 60,
  requiresSpecialTransport: false,
  shippingCost: 25,
  requiresInstallation: true,
  installationCost: 50,
  installationTimeMinutes: 60,
  purchaseValue: 1000,
  replacementCost: 1200,
  customDeposit: 200,
  featured: false,
  isActive: true
};

// Múltiples productos de prueba para tests de carrito
export const multipleTestProducts = [
  {
    name: 'Producto Test 1',
    sku: generateSKU('P1'),
    pricePerDay: 30,
    stock: 20
  },
  {
    name: 'Producto Test 2',
    sku: generateSKU('P2'),
    pricePerDay: 45,
    stock: 15
  },
  {
    name: 'Producto Test 3',
    sku: generateSKU('P3'),
    pricePerDay: 60,
    stock: 10
  }
];

// Usuario VIP de prueba
export const testVIPUser = {
  email: generateTestEmail('vip'),
  password: 'VIP123!@#',
  firstName: 'VIP',
  lastName: 'User',
  phone: '+34666999111',
  userLevel: 'VIP'
};

// Estados de pedido
export const orderStatuses = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

// Términos de búsqueda para tests
export const searchTerms = {
  validTerm: 'test',
  invalidTerm: 'xyzabc123notfound',
  partialTerm: 'prod'
};

// URLs de la aplicación
export const appUrls = {
  home: 'http://localhost:3000',
  login: 'http://localhost:3000/login',
  register: 'http://localhost:3000/register',
  products: 'http://localhost:3000/products',
  packs: 'http://localhost:3000/packs',
  cart: 'http://localhost:3000/cart',
  checkout: 'http://localhost:3000/checkout',
  orders: 'http://localhost:3000/orders',
  admin: {
    dashboard: 'http://localhost:3000/admin/dashboard',
    products: 'http://localhost:3000/admin/products',
    packs: 'http://localhost:3000/admin/packs',
    orders: 'http://localhost:3000/admin/orders',
    users: 'http://localhost:3000/admin/users',
    categories: 'http://localhost:3000/admin/categories'
  }
};

// Tiempos de espera comunes
export const timeouts = {
  short: 2000,
  medium: 5000,
  long: 10000,
  veryLong: 30000
};
