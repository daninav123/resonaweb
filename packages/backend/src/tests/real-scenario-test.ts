/**
 * Test que reproduce EXACTAMENTE lo que hace el frontend
 * Simula el comportamiento real del ProductsManager
 */

import { PrismaClient } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1';

// Simular el cliente API del frontend
class FrontendAPIClient {
  private token: string = '';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
    });

    // Interceptor para agregar token
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  async login() {
    const response = await this.axiosInstance.post('/auth/login', {
      email: 'admin@resona.com',
      password: 'Admin123!',
    });
    this.token = response.data.token;
    console.log('✅ Login exitoso');
  }

  async getProducts() {
    const response = await this.axiosInstance.get('/products');
    console.log('   🔍 Respuesta raw:', JSON.stringify(response.data).substring(0, 200));
    // El frontend hace: response.data || []
    const data = response.data?.data || response.data || [];
    console.log(`   📊 Tipo de datos: ${typeof data}, Es array: ${Array.isArray(data)}`);
    return data;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await this.axiosInstance.delete(`/products/${id}`);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
      };
    }
  }
}

async function simulateFrontendBehavior() {
  console.log('🎭 SIMULACIÓN: Comportamiento exacto del frontend\n');
  console.log('═══════════════════════════════════════════════════\n');

  const client = new FrontendAPIClient();

  try {
    // 1. Login
    console.log('1️⃣  LOGIN');
    await client.login();
    console.log('');

    // 2. Cargar productos iniciales
    console.log('2️⃣  CARGAR PRODUCTOS');
    let products = await client.getProducts();
    console.log(`   📦 ${products.length} productos cargados`);
    
    if (products.length < 3) {
      console.log('   ⚠️  Necesitamos al menos 3 productos. Creando...\n');
      
      // Crear productos de prueba
      const category = await prisma.category.findFirst();
      if (!category) {
        throw new Error('No hay categorías');
      }

      for (let i = 0; i < 3; i++) {
        await prisma.product.create({
          data: {
            sku: `FRONTEND-TEST-${Date.now()}-${i}`,
            name: `Frontend Test ${i + 1}`,
            slug: `frontend-test-${Date.now()}-${i}`,
            description: 'Test',
            categoryId: category.id,
            pricePerDay: 100,
            pricePerWeekend: 150,
            pricePerWeek: 500,
            stock: 10,
            realStock: 10,
            availableStock: 10,
          },
        });
      }

      // Recargar
      products = await client.getProducts();
      console.log(`   📦 ${products.length} productos después de crear\n`);
    }

    // 3. Usuario hace click en "Eliminar" del primer producto
    console.log('3️⃣  USUARIO CLICKS');
    console.log('   👆 Click en "Eliminar" del producto 1\n');

    const product1 = products[0];
    console.log(`   🗑️  Eliminando: ${product1.name} (${product1.id})`);
    const result1 = await client.deleteProduct(product1.id);
    
    if (result1.success) {
      console.log(`   ✅ ${result1.message}\n`);
    } else {
      console.log(`   ❌ ERROR: ${result1.error}\n`);
    }

    // 4. Esperar 300ms (como hace el frontend)
    console.log('4️⃣  DELAY (300ms como en el código)');
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('   ⏱️  Delay completado\n');

    // 5. Recargar productos
    console.log('5️⃣  RECARGAR PRODUCTOS');
    products = await client.getProducts();
    console.log(`   📦 ${products.length} productos después del delete\n`);

    // 6. Usuario hace click en "Eliminar" del segundo producto
    console.log('6️⃣  USUARIO CLICKS DE NUEVO');
    console.log('   👆 Click en "Eliminar" del producto 2\n');

    const product2 = products[0]; // Ahora el primero es el que era el segundo
    console.log(`   🗑️  Eliminando: ${product2.name} (${product2.id})`);
    const result2 = await client.deleteProduct(product2.id);
    
    if (result2.success) {
      console.log(`   ✅ ${result2.message}\n`);
    } else {
      console.log(`   ❌ ERROR: ${result2.error}\n`);
    }

    // 7. Delay y recargar
    await new Promise(resolve => setTimeout(resolve, 300));
    products = await client.getProducts();
    console.log(`   📦 ${products.length} productos después del segundo delete\n`);

    // 8. Tercer producto
    console.log('7️⃣  TERCER DELETE');
    console.log('   👆 Click en "Eliminar" del producto 3\n');

    const product3 = products[0];
    console.log(`   🗑️  Eliminando: ${product3.name} (${product3.id})`);
    const result3 = await client.deleteProduct(product3.id);
    
    if (result3.success) {
      console.log(`   ✅ ${result3.message}\n`);
    } else {
      console.log(`   ❌ ERROR: ${result3.error}\n`);
    }

    // RESULTADOS
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 RESULTADOS FINALES:\n');
    console.log(`   Producto 1: ${result1.success ? '✅ ÉXITO' : '❌ FALLÓ'}`);
    console.log(`   Producto 2: ${result2.success ? '✅ ÉXITO' : '❌ FALLÓ'}`);
    console.log(`   Producto 3: ${result3.success ? '✅ ÉXITO' : '❌ FALLÓ'}`);

    if (!result1.success || !result2.success || !result3.success) {
      console.log('\n❌ PROBLEMA DETECTADO:');
      if (!result1.success) console.log(`   - Producto 1: ${result1.error}`);
      if (!result2.success) console.log(`   - Producto 2: ${result2.error}`);
      if (!result3.success) console.log(`   - Producto 3: ${result3.error}`);
      console.log('');
      throw new Error('Algunos productos no se eliminaron');
    }

    console.log('\n🎉 TEST PASADO: Todos los productos eliminados correctamente\n');

  } catch (error: any) {
    console.error('\n❌ ERROR EN EL TEST:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
console.log('\n🚀 Iniciando test de escenario real...\n');
console.log('Este test simula EXACTAMENTE lo que hace el usuario en la UI:\n');
console.log('1. Login');
console.log('2. Cargar productos');
console.log('3. Click "Eliminar" producto 1');
console.log('4. Delay 300ms');
console.log('5. Recargar lista');
console.log('6. Click "Eliminar" producto 2');
console.log('7. Delay 300ms');
console.log('8. Recargar lista');
console.log('9. Click "Eliminar" producto 3\n');
console.log('═══════════════════════════════════════════════════\n');

simulateFrontendBehavior()
  .then(() => {
    console.log('✅ Test de escenario real completado exitosamente\n');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Test de escenario real FALLIDO\n');
    process.exit(1);
  });
