/**
 * Test E2E HTTP para eliminación de productos
 * Simula las llamadas HTTP reales del frontend
 */

import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api/v1';

async function loginAndGetToken(): Promise<string> {
  console.log('🔐 Login como admin...');
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@resona.com',
    password: 'Admin123!',
  });
  console.log('✅ Token obtenido\n');
  return response.data.token;
}

async function createTestProduct(token: string, num: number): Promise<string> {
  // Obtener una categoría
  const categoriesResponse = await axios.get(`${API_URL}/products/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  const categories = categoriesResponse.data.data || categoriesResponse.data;
  
  if (!categories || categories.length === 0) {
    throw new Error('No hay categorías disponibles');
  }
  
  const categoryId = categories[0].id;
  
  const response = await axios.post(
    `${API_URL}/products`,
    {
      sku: `HTTP-TEST-${Date.now()}-${num}`,
      name: `HTTP Test Product ${num}`,
      slug: `http-test-${Date.now()}-${num}`,
      description: 'Test product for HTTP deletion',
      categoryId,
      pricePerDay: 100,
      pricePerWeekend: 150,
      pricePerWeek: 500,
      stock: 10,
      realStock: 10,
      availableStock: 10,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return response.data.id;
}

async function deleteProductViaHTTP(token: string, productId: string, name: string) {
  console.log(`🗑️  DELETE /products/${productId} (${name})`);
  const startTime = Date.now();
  
  try {
    const response = await axios.delete(`${API_URL}/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ ${response.data.message} (${duration}ms)`);
    return { success: true, duration, message: response.data.message };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Error: ${error.response?.data?.message || error.message} (${duration}ms)`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Code: ${error.response?.data?.code}`);
    return { 
      success: false, 
      duration, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status,
    };
  }
}

async function testHTTPDeletion() {
  console.log('🧪 TEST HTTP: Eliminación de productos múltiples\n');
  
  try {
    // 1. Login
    const token = await loginAndGetToken();
    
    // 2. Crear productos de prueba
    console.log('📦 Creando productos de prueba vía HTTP...');
    const productId1 = await createTestProduct(token, 1);
    console.log(`✅ Producto 1 creado: ${productId1}`);
    
    const productId2 = await createTestProduct(token, 2);
    console.log(`✅ Producto 2 creado: ${productId2}`);
    
    const productId3 = await createTestProduct(token, 3);
    console.log(`✅ Producto 3 creado: ${productId3}\n`);
    
    // 3. Eliminar productos secuencialmente (como hace el frontend)
    console.log('🔄 Eliminando productos secuencialmente...\n');
    
    const result1 = await deleteProductViaHTTP(token, productId1, 'Producto 1');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result2 = await deleteProductViaHTTP(token, productId2, 'Producto 2');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result3 = await deleteProductViaHTTP(token, productId3, 'Producto 3');
    
    // 4. Resultados
    console.log('\n📊 RESULTADOS:');
    console.log(`  Producto 1: ${result1.success ? '✅' : '❌'} (${result1.duration}ms)`);
    console.log(`  Producto 2: ${result2.success ? '✅' : '❌'} (${result2.duration}ms)`);
    console.log(`  Producto 3: ${result3.success ? '✅' : '❌'} (${result3.duration}ms)`);
    
    if (result1.success && result2.success && result3.success) {
      console.log('\n🎉 TEST PASADO: Todos los productos eliminados correctamente');
    } else {
      console.error('\n❌ TEST FALLIDO: Algunos productos no se eliminaron');
      if (!result2.success) {
        console.error('\n⚠️  SEGUNDO PRODUCTO FALLÓ - Este es el bug reportado');
        console.error('Error:', result2.error);
      }
      throw new Error('Test fallido');
    }
    
  } catch (error: any) {
    console.error('\n❌ TEST ERROR:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar test
testHTTPDeletion()
  .then(() => {
    console.log('\n✅ Test HTTP completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test HTTP fallido');
    process.exit(1);
  });
