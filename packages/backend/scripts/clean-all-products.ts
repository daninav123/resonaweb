import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanAllProducts() {
  try {
    console.log('🗑️  Limpiando base de datos de productos...\n');
    
    // 1. Eliminar reviews primero
    console.log('⭐ Eliminando reviews...');
    const reviews = await prisma.review.deleteMany({});
    console.log(`   ✅ ${reviews.count} reviews eliminadas`);
    
    // 2. Eliminar productos
    console.log('📦 Eliminando productos...');
    const products = await prisma.product.deleteMany({});
    console.log(`   ✅ ${products.count} productos eliminados\n`);
    
    console.log('🎉 Base de datos limpiada correctamente');
    console.log('✨ Lista para nuevos productos reales\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllProducts();
