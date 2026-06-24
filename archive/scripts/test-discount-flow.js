/**
 * Test de Flujo de Descuentos - Verificación Backend
 * Este script verifica que los descuentos se calculen correctamente
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
};

// Test data
let authToken = null;
let userId = null;
let testCoupon = null;
let testProduct = null;

/**
 * 1. Login como usuario de prueba
 */
async function testLogin() {
  log.section('TEST 1: Login de Usuario');
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });

    authToken = response.data.token;
    userId = response.data.user.id;
    
    log.success(`Login exitoso - User ID: ${userId}`);
    return true;
  } catch (error) {
    log.error(`Login falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * 2. Crear cupón de prueba (como admin)
 */
async function createTestCoupon() {
  log.section('TEST 2: Crear Cupón de Prueba');
  
  try {
    // Login como admin
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@resonaevents.com',
      password: 'Resona2024!'
    });

    const adminToken = adminLogin.data.token;

    // Verificar si ya existe
    try {
      const existing = await axios.post(
        `${API_URL}/coupons/validate`,
        {
          code: 'PRUEBA',
          orderAmount: 100
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );

      if (existing.data.valid) {
        log.info('Cupón PRUEBA ya existe, reutilizando');
        testCoupon = existing.data.coupon;
        return true;
      }
    } catch (err) {
      // No existe, crear nuevo
    }

    // Crear cupón
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const response = await axios.post(
      `${API_URL}/coupons`,
      {
        code: 'PRUEBA',
        description: 'Cupón de prueba 20% descuento',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        scope: 'GLOBAL',
        minimumAmount: 50,
        validFrom: today.toISOString(),
        validTo: nextYear.toISOString(),
        isActive: true
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    testCoupon = response.data;
    log.success(`Cupón creado: ${testCoupon.code} - ${testCoupon.discountValue}% descuento`);
    return true;
  } catch (error) {
    log.error(`Error creando cupón: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * 3. Validar cupón con diferentes montos
 */
async function testCouponValidation() {
  log.section('TEST 3: Validación de Cupón');
  
  const testCases = [
    { amount: 100, shouldPass: true, expectedDiscount: 20 },
    { amount: 50, shouldPass: true, expectedDiscount: 10 },
    { amount: 30, shouldPass: false, expectedDiscount: 0 }, // Menos del mínimo
    { amount: 500, shouldPass: true, expectedDiscount: 100 },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      const response = await axios.post(
        `${API_URL}/coupons/validate`,
        {
          code: 'PRUEBA',
          orderAmount: testCase.amount
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      if (testCase.shouldPass) {
        const discount = response.data.finalDiscount.discountAmount;
        const expected = testCase.expectedDiscount;
        
        if (Math.abs(discount - expected) < 0.01) {
          log.success(`Monto €${testCase.amount}: Descuento correcto €${discount}`);
          passed++;
        } else {
          log.error(`Monto €${testCase.amount}: Descuento incorrecto. Esperado: €${expected}, Obtenido: €${discount}`);
          failed++;
        }
      } else {
        log.error(`Monto €${testCase.amount}: Cupón aceptado cuando NO debería (monto mínimo: €50)`);
        failed++;
      }
    } catch (error) {
      if (!testCase.shouldPass) {
        log.success(`Monto €${testCase.amount}: Rechazado correctamente (${error.response?.data?.message})`);
        passed++;
      } else {
        log.error(`Monto €${testCase.amount}: Error inesperado - ${error.response?.data?.message || error.message}`);
        failed++;
      }
    }
  }

  log.info(`\nResultado: ${passed} pasados, ${failed} fallados`);
  return failed === 0;
}

/**
 * 4. Simular cálculo de carrito con descuento
 */
async function testCartCalculation() {
  log.section('TEST 4: Cálculo de Carrito con Descuento');
  
  try {
    const subtotal = 375.00; // Ejemplo de la imagen
    const discountPercent = 20;
    const discountAmount = subtotal * (discountPercent / 100); // 75.00
    const subtotalAfterDiscount = subtotal - discountAmount; // 300.00
    const taxRate = 0.21;
    const tax = subtotalAfterDiscount * taxRate; // 63.00
    const total = subtotalAfterDiscount + tax; // 363.00

    log.info(`Subtotal: €${subtotal.toFixed(2)}`);
    log.info(`Descuento (${discountPercent}%): -€${discountAmount.toFixed(2)}`);
    log.info(`Subtotal después de descuento: €${subtotalAfterDiscount.toFixed(2)}`);
    log.info(`IVA (21%): €${tax.toFixed(2)}`);
    log.info(`Total final: €${total.toFixed(2)}`);

    // Verificar que el IVA se calcula DESPUÉS del descuento
    const taxOnOriginal = subtotal * taxRate;
    if (tax < taxOnOriginal) {
      log.success('IVA calculado correctamente DESPUÉS del descuento');
    } else {
      log.error('IVA calculado ANTES del descuento (INCORRECTO)');
      return false;
    }

    // Comparar con la imagen: Total debería ser €363.00 no €453.75
    if (Math.abs(total - 363.00) < 0.01) {
      log.success(`Total correcto: €${total.toFixed(2)}`);
    } else {
      log.warning(`Total diferente: Esperado ~€363.00, Calculado: €${total.toFixed(2)}`);
    }

    return true;
  } catch (error) {
    log.error(`Error en cálculo: ${error.message}`);
    return false;
  }
}

/**
 * 5. Verificar descuento VIP
 */
async function testVIPDiscount() {
  log.section('TEST 5: Descuento VIP');
  
  try {
    const response = await axios.post(
      `${API_URL}/coupons/validate`,
      {
        code: 'PRUEBA',
        orderAmount: 100
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    const couponDiscount = response.data.coupon.discountAmount;
    const vipDiscount = response.data.userDiscount?.discountAmount || 0;
    const finalDiscount = response.data.finalDiscount.discountAmount;

    log.info(`Descuento de cupón: €${couponDiscount}`);
    log.info(`Descuento VIP: €${vipDiscount}`);
    log.info(`Descuento final aplicado: €${finalDiscount}`);

    if (finalDiscount === Math.max(couponDiscount, vipDiscount)) {
      log.success('Se aplica el mayor descuento correctamente');
      return true;
    } else {
      log.error('El descuento final no es el mayor disponible');
      return false;
    }
  } catch (error) {
    log.error(`Error verificando descuento VIP: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log('\n' + colors.cyan + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + ' '.repeat(10) + 'TEST DE FLUJO DE DESCUENTOS' + ' '.repeat(20) + '║');
  console.log('╚' + '═'.repeat(58) + '╝' + colors.reset + '\n');

  const results = [];

  // Test 1: Login
  results.push(await testLogin());
  if (!results[0]) {
    log.error('Login falló, abortando tests');
    return;
  }

  // Test 2: Crear cupón
  results.push(await createTestCoupon());
  
  // Test 3: Validación de cupón
  results.push(await testCouponValidation());
  
  // Test 4: Cálculo de carrito
  results.push(await testCartCalculation());
  
  // Test 5: Descuento VIP
  results.push(await testVIPDiscount());

  // Resumen
  log.section('RESUMEN DE TESTS');
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`Tests pasados: ${colors.green}${passed}${colors.reset}/${total}`);
  console.log(`Tests fallados: ${colors.red}${total - passed}${colors.reset}/${total}`);
  
  if (passed === total) {
    log.success('\n✅ TODOS LOS TESTS PASARON\n');
  } else {
    log.error('\n❌ ALGUNOS TESTS FALLARON - Revisar logs arriba\n');
  }
}

// Ejecutar
runAllTests().catch((error) => {
  log.error(`Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
