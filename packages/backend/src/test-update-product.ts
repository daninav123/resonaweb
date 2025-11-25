/**
 * Test de actualización de producto con realStock
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testUpdate() {
  console.log('\n🧪 === TEST ACTUALIZACIÓN DE PRODUCTO ===\n');

  try {
    const product = await prisma.product.findFirst({
      where: { name: { contains: 'Set Micrófonos Inalámbricos Dual' } }
    });

    if (!product) {
      console.log('❌ Producto no encontrado');
      return;
    }

    console.log('📦 Estado ANTES:');
    console.log(`   Stock: ${product.stock}`);
    console.log(`   RealStock: ${product.realStock}\n`);

    // Simular la actualización que haría el frontend
    const updateData = {
      stock: 20,
      realStock: 20,
    };

    console.log('📤 Datos a actualizar:', updateData);

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: updateData,
    });

    console.log('\n✅ Estado DESPUÉS:');
    console.log(`   Stock: ${updated.stock}`);
    console.log(`   RealStock: ${updated.realStock}`);

    if (updated.realStock === 20) {
      console.log('\n✅ ¡UPDATE FUNCIONA CORRECTAMENTE!\n');
    } else {
      console.log('\n❌ Update NO funcionó correctamente\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUpdate();
