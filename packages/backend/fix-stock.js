const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixStock() {
  console.log('🔧 Actualizando stock del Shure 58 a 0...\n');
  
  const updated = await prisma.product.update({
    where: { sku: 'sm58' },
    data: {
      stock: 0,
      realStock: 0
    }
  });
  
  console.log('✅ Stock actualizado:');
  console.log(`   Producto: ${updated.name}`);
  console.log(`   Stock: ${updated.stock}`);
  console.log(`   Real Stock: ${updated.realStock}`);
  console.log('\n🚨 Ahora debería aparecer una alerta!\n');
  
  await prisma.$disconnect();
}

fixStock().catch(console.error);
