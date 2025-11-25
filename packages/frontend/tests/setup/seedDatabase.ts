/**
 * Script para poblar la base de datos con datos de test
 * Ejecutar antes de los tests E2E
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Credenciales de admin para crear recursos
const ADMIN_CREDENTIALS = {
  email: 'admin@resona.com',
  password: 'Admin123!'
};

/**
 * Login como admin y obtener token
 */
async function loginAsAdmin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    return response.data.accessToken;
  } catch (error: any) {
    console.error('❌ Error al hacer login como admin:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Crear usuario VIP de test
 */
async function createVipUser(token: string) {
  try {
    // Primero verificar si ya existe
    const checkResponse = await axios.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { email: 'vip@test.com' }
    }).catch(() => null);

    if (checkResponse?.data?.length > 0) {
      console.log('✓ Usuario VIP ya existe');
      return checkResponse.data[0];
    }

    // Crear usuario VIP
    const response = await axios.post(
      `${API_BASE_URL}/auth/register`,
      {
        email: 'vip@test.com',
        password: 'Vip123!',
        firstName: 'Usuario',
        lastName: 'VIP',
        phone: '+34600000001'
      }
    );

    // Actualizar a VIP
    const userId = response.data.user.id;
    await axios.patch(
      `${API_BASE_URL}/users/${userId}`,
      { userLevel: 'VIP' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('✓ Usuario VIP creado');
    return response.data.user;
  } catch (error: any) {
    console.error('⚠️  No se pudo crear usuario VIP:', error.response?.data || error.message);
  }
}

/**
 * Crear usuarios de test
 */
async function createTestUsers() {
  const users = [
    { email: 'user1@test.com', firstName: 'Test', lastName: 'User1' },
    { email: 'user2@test.com', firstName: 'Test', lastName: 'User2' }
  ];

  for (const user of users) {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        ...user,
        password: 'Test123!',
        phone: '+34600000000'
      });
      console.log(`✓ Usuario ${user.email} creado`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`✓ Usuario ${user.email} ya existe`);
      } else {
        console.error(`⚠️  Error al crear ${user.email}:`, error.response?.data || error.message);
      }
    }
  }
}

/**
 * Crear cupones de test
 */
async function createTestCoupons(token: string) {
  const coupons = [
    {
      code: 'TEST10',
      type: 'PERCENTAGE',
      value: 10,
      description: 'Cupón de test 10%',
      minOrderAmount: 0,
      maxUses: 100,
      isActive: true
    },
    {
      code: 'TEST20',
      type: 'PERCENTAGE',
      value: 20,
      description: 'Cupón de test 20%',
      minOrderAmount: 100,
      maxUses: 50,
      isActive: true
    },
    {
      code: 'FIXED50',
      type: 'FIXED',
      value: 50,
      description: 'Cupón de test 50€',
      minOrderAmount: 200,
      maxUses: 20,
      isActive: true
    }
  ];

  for (const coupon of coupons) {
    try {
      await axios.post(`${API_BASE_URL}/coupons`, coupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✓ Cupón ${coupon.code} creado`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log(`✓ Cupón ${coupon.code} ya existe`);
      } else {
        console.error(`⚠️  Error al crear cupón ${coupon.code}:`, error.response?.data || error.message);
      }
    }
  }
}

/**
 * Crear producto de test si no existe
 */
async function ensureTestProduct(token: string) {
  try {
    // Verificar si existe "letras-luminosas"
    const response = await axios.get(`${API_BASE_URL}/products`, {
      params: { slug: 'letras-luminosas' }
    });

    if (response.data.products && response.data.products.length > 0) {
      console.log('✓ Producto "letras-luminosas" ya existe');
      return response.data.products[0];
    }

    console.log('⚠️  Producto "letras-luminosas" no encontrado');
    console.log('   Los tests necesitan al menos un producto existente');
    return null;
  } catch (error: any) {
    console.error('⚠️  Error al verificar productos:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Verificar estado del servidor
 */
async function checkServerHealth() {
  try {
    await axios.get(`${API_BASE_URL}/products/categories`);
    console.log('✓ Servidor backend respondiendo');
    return true;
  } catch (error) {
    console.error('❌ Servidor backend no responde en', API_BASE_URL);
    console.error('   Asegúrate de que el backend esté corriendo en puerto 3001');
    return false;
  }
}

/**
 * Main setup function
 */
async function setupTestDatabase() {
  console.log('\n🔧 INICIANDO SETUP DE BASE DE DATOS PARA TESTS\n');

  // 1. Verificar servidor
  console.log('1. Verificando servidor...');
  const serverOk = await checkServerHealth();
  if (!serverOk) {
    process.exit(1);
  }

  // 2. Login como admin
  console.log('\n2. Login como admin...');
  let token: string;
  try {
    token = await loginAsAdmin();
    console.log('✓ Login exitoso');
  } catch (error) {
    console.error('❌ No se pudo hacer login como admin');
    console.error('   Verifica que exista el usuario admin@resona.com con password Admin123!');
    process.exit(1);
  }

  // 3. Crear usuarios de test
  console.log('\n3. Creando usuarios de test...');
  await createTestUsers();

  // 4. Crear usuario VIP
  console.log('\n4. Creando usuario VIP...');
  await createVipUser(token);

  // 5. Crear cupones
  console.log('\n5. Creando cupones de test...');
  await createTestCoupons(token);

  // 6. Verificar productos
  console.log('\n6. Verificando productos...');
  await ensureTestProduct(token);

  console.log('\n✅ SETUP COMPLETADO\n');
  console.log('La base de datos está lista para ejecutar tests E2E');
  console.log('\nPuedes ejecutar los tests con:');
  console.log('  npm run test:e2e');
  console.log('  npm run test:e2e:critical\n');
}

// Ejecutar setup
setupTestDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error durante el setup:', error);
    process.exit(1);
  });

export { setupTestDatabase };
