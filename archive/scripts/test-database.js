const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🧪 Testing Database Connection...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database: CONECTADA');
    
    // Count products
    const productCount = await prisma.product.count();
    console.log('   Productos:', productCount);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log('   Usuarios:', userCount);
    
    // Count orders
    const orderCount = await prisma.order.count();
    console.log('   Pedidos:', orderCount);
    
    // Check for admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    console.log('   Admin user:', adminUser ? '✅ Existe' : '❌ No existe');
    
    console.log('\n✅ Database: FUNCIONANDO CORRECTAMENTE');
    
  } catch (error) {
    console.log('❌ Database: ERROR');
    console.log('   Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
