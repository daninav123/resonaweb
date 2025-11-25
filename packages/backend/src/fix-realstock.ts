/**
 * Script para actualizar el realStock del producto problemático
 * Ejecutar: npx ts-node src/fix-realstock.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixRealStock() {
  console.log('\n🔧 === ACTUALIZANDO REALSTOCK ===\n');

  try {
    // Encontrar el producto
    const product = await prisma.product.findFirst({
      where: {
        name: { contains: 'Set Micrófonos Inalámbricos Dual' }
      }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('📦 Producto encontrado:');
    console.log(`   Nombre: ${product.name}`);
    console.log(`   Stock actual: ${product.stock}`);
    console.log(`   RealStock actual: ${product.realStock}\n`);

    // Actualizar a 15 unidades
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        realStock: 15,
        stock: 15,
      }
    });

    console.log('✅ Producto actualizado:');
    console.log(`   Stock nuevo: ${updated.stock}`);
    console.log(`   RealStock nuevo: ${updated.realStock}\n`);

    console.log('🧪 Ejecuta el test de alertas para verificar:');
    console.log('   npx ts-node src/test-stock-alerts.ts\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRealStock();
