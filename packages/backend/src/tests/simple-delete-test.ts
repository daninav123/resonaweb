/**
 * Test simple: Eliminar productos existentes del catálogo
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001/api/v1';

async function simpleDeleteTest() {
  console.log('🧪 TEST SIMPLE: Eliminación múltiple de productos\n');
  
  try {
    // 1. Login
    console.log('🔐 Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@resona.com',
      password: 'Admin123!',
    });
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido\n');
    
    // 2. Obtener productos actuales
    console.log('📦 Obteniendo productos...');
    const productsResponse = await axios.get(`${API_URL}/products?limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const products = productsResponse.data.data || productsResponse.data;
    console.log(`✅ ${products.length} productos encontrados\n`);
    
    if (products.length < 3) {
      console.error('❌ No hay suficientes productos para el test (necesitamos al menos 3)');
      return;
    }
    
    // 3. Intentar eliminar 3 productos seguidos
    console.log('🗑️  Eliminando productos...\n');
    
    const results = [];
    
    for (let i = 0; i < 3 && i < products.length; i++) {
      const product = products[i];
      console.log(`  ${i + 1}. Eliminando: ${product.name} (${product.id})`);
      
      const startTime = Date.now();
      try {
        const response = await axios.delete(`${API_URL}/products/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const duration = Date.now() - startTime;
        console.log(`     ✅ ${response.data.message} (${duration}ms)\n`);
        
        results.push({ 
          success: true, 
          productName: product.name, 
          duration,
          message: response.data.message,
        });
      } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`     ❌ Error: ${error.response?.data?.message || error.message} (${duration}ms)`);
        console.error(`     Status: ${error.response?.status}`);
        console.error(`     Stack: ${error.response?.data?.stack?.substring(0, 200)}...\n`);
        
        results.push({ 
          success: false, 
          productName: product.name, 
          duration,
          error: error.response?.data?.message || error.message,
          status: error.response?.status,
        });
      }
      
      // Pequeño delay entre eliminaciones
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // 4. Resultados
    console.log('\n📊 RESULTADOS FINALES:');
    console.log('════════════════════════════════════════\n');
    
    results.forEach((result, index) => {
      console.log(`Producto ${index + 1}: ${result.productName}`);
      console.log(`  Estado: ${result.success ? '✅ ÉXITO' : '❌ FALLÓ'}`);
      console.log(`  Duración: ${result.duration}ms`);
      if (result.success) {
        console.log(`  Mensaje: ${result.message}`);
      } else {
        console.log(`  Error: ${result.error}`);
        console.log(`  Status: ${result.status}`);
      }
      console.log('');
    });
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`✅ Éxitos: ${successCount}/${results.length}`);
    console.log(`❌ Fallos: ${failCount}/${results.length}\n`);
    
    if (failCount > 0) {
      console.error('⚠️  PROBLEMA DETECTADO: Algunos productos no se eliminaron');
      
      // Identificar patrón
      const firstFail = results.findIndex(r => !r.success);
      if (firstFail === 1) {
        console.error('🔴 PATRÓN: El SEGUNDO producto siempre falla - Bug confirmado');
      } else if (firstFail > 1) {
        console.error(`🟡 PATRÓN: Falla a partir del producto ${firstFail + 1}`);
      }
      
      throw new Error('Test fallido');
    }
    
    console.log('🎉 TEST PASADO: Todos los productos eliminados correctamente\n');
    
  } catch (error: any) {
    if (error.message !== 'Test fallido') {
      console.error('\n❌ TEST ERROR:', error.message);
    }
    throw error;
  }
}

// Ejecutar test
simpleDeleteTest()
  .then(() => {
    console.log('✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test fallido');
    process.exit(1);
  });
