import usersData from '../fixtures/users.json';
import productsData from '../fixtures/products.json';
import couponsData from '../fixtures/coupons.json';

/**
 * Obtener datos de usuario de test
 */
export function getUser(type: 'admin' | 'regularUser' | 'vipUser' | 'testUser1' | 'testUser2') {
  return usersData[type];
}

/**
 * Obtener datos de producto de test
 */
export function getProduct(type: 'testProduct1' | 'testProduct2') {
  return productsData[type];
}

/**
 * Obtener datos de cupón de test
 */
export function getCoupon(type: 'testCoupon10' | 'testCoupon20' | 'testFixed50' | 'invalidCoupon') {
  return couponsData[type];
}

/**
 * Datos de prueba para formularios
 */
export const testData = {
  address: {
    valid: 'Calle Test 123, Valencia, España',
    withPostal: '46001 Valencia, España',
    short: 'Valencia'
  },
  dates: {
    valid: {
      start: '2025-12-01',
      end: '2025-12-05'
    },
    invalid: {
      past: '2023-01-01',
      reversed: {
        start: '2025-12-10',
        end: '2025-12-05'
      }
    }
  },
  orderNotes: {
    short: 'Nota de prueba',
    long: 'Esta es una nota de prueba más larga para verificar que el sistema maneja correctamente textos extensos en el campo de notas del pedido.'
  },
  payment: {
    validCard: '4242424242424242',
    declinedCard: '4000000000000002',
    insufficientFunds: '4000000000009995',
    expiry: {
      valid: '12/25',
      expired: '01/20'
    },
    cvc: '123'
  }
};

/**
 * Generar datos aleatorios para tests
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    email: `test_${timestamp}_${random}@test.com`,
    username: `testuser_${timestamp}`,
    productSku: `TEST-${timestamp}`,
    orderNumber: `ORD-${timestamp}`,
    invoiceNumber: `INV-${timestamp}`
  };
}

/**
 * Validar estructura de datos
 */
export function validateUser(user: any): boolean {
  return !!(user && user.email && user.password);
}

export function validateProduct(product: any): boolean {
  return !!(product && (product.slug || product.sku) && product.name);
}

export function validateCoupon(coupon: any): boolean {
  return !!(coupon && coupon.code);
}
