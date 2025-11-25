import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Crear interfaz para preguntar al usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚨 RESET DE BASE DE DATOS - OPERACIÓN DESTRUCTIVA');
  console.log('='.repeat(70) + '\n');

  try {
    // Contar datos actuales
    const productCount = await prisma.product.count();
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const invoiceCount = await prisma.invoice.count();

    console.log('📊 DATOS ACTUALES EN LA BASE DE DATOS:\n');
    console.log(`   📦 Productos:  ${productCount}`);
    console.log(`   👥 Usuarios:   ${userCount}`);
    console.log(`   📋 Pedidos:    ${orderCount}`);
    console.log(`   🧾 Facturas:   ${invoiceCount}`);
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  ADVERTENCIA: Esta operación BORRARÁ TODOS los datos anteriores');
    console.log('='.repeat(70) + '\n');

    // Pedir confirmación
    const confirm1 = await question('¿Estás seguro? Escribe "SÍ" para continuar: ');

    if (confirm1.toUpperCase() !== 'SÍ' && confirm1.toUpperCase() !== 'SI') {
      console.log('\n❌ Operación cancelada. Los datos están seguros.\n');
      process.exit(0);
    }

    // Segunda confirmación
    const confirm2 = await question(
      'ÚLTIMA CONFIRMACIÓN: Escribe "BORRAR TODO" para confirmar: '
    );

    if (confirm2.toUpperCase() !== 'BORRAR TODO') {
      console.log('\n❌ Operación cancelada. Los datos están seguros.\n');
      process.exit(0);
    }

    console.log('\n🗑️  Borrando datos...\n');

    // Borrar en orden correcto (respetando foreign keys)
    console.log('   Borrando reviews...');
    await prisma.review.deleteMany();

    console.log('   Borrando favoritos...');
    await prisma.favorite.deleteMany();

    console.log('   Borrando items de pedidos...');
    await prisma.orderItem.deleteMany();

    console.log('   Borrando pedidos...');
    await prisma.order.deleteMany();

    console.log('   Borrando facturas...');
    await prisma.invoice.deleteMany();

    console.log('   Borrando posts de blog...');
    await prisma.blogPost.deleteMany();

    console.log('   Borrando productos...');
    await prisma.product.deleteMany();

    console.log('   Borrando categorías...');
    await prisma.category.deleteMany();

    console.log('   Borrando usuarios...');
    await prisma.user.deleteMany();

    console.log('\n✅ Base de datos completamente limpia.\n');
    console.log('💡 Próximos pasos:\n');
    console.log('   1. Ejecuta: npm run db:seed');
    console.log('   2. O crea datos manualmente en el panel de admin\n');

  } catch (error) {
    console.error('\n❌ Error durante el reset:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
