const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 VERIFICACIÓN DE BASE DE DATOS - AHORA MISMO\n');
  console.log('Timestamp:', new Date().toLocaleString());
  console.log('='.repeat(70) + '\n');

  try {
    // Test conexión
    console.log('📋 TEST 1: Conexión a Base de Datos');
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Contar registros
    console.log('='.repeat(70));
    console.log('📋 TEST 2: Conteo de Registros\n');
    
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const orderCount = await prisma.order.count();
    
    console.log('✅ Conteos:');
    console.log('   Usuarios:', userCount);
    console.log('   Productos:', productCount);
    console.log('   Categorías:', categoryCount);
    console.log('   Pedidos:', orderCount);

    // Verificar usuarios
    console.log('\n' + '='.repeat(70));
    console.log('📋 TEST 3: Usuarios en Sistema\n');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@resona.com' }
    });
    
    if (admin) {
      console.log('✅ Admin existe:');
      console.log('   Email:', admin.email);
      console.log('   Nombre:', admin.firstName, admin.lastName);
      console.log('   Rol:', admin.role);
      console.log('   Activo:', admin.isActive ? 'SÍ ✅' : 'NO ❌');
      console.log('   Email verificado:', admin.emailVerified ? 'SÍ ✅' : 'NO ❌');
    } else {
      console.log('❌ Admin NO existe');
    }

    const client = await prisma.user.findUnique({
      where: { email: 'cliente@test.com' }
    });
    
    if (client) {
      console.log('\n✅ Cliente existe:');
      console.log('   Email:', client.email);
      console.log('   Nombre:', client.firstName, client.lastName);
      console.log('   Rol:', client.role);
      console.log('   Activo:', client.isActive ? 'SÍ ✅' : 'NO ❌');
    } else {
      console.log('\n❌ Cliente NO existe');
    }

    // Verificar productos
    console.log('\n' + '='.repeat(70));
    console.log('📋 TEST 4: Productos en Catálogo\n');
    
    const products = await prisma.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        sku: true,
        pricePerDay: true,
        stock: true,
        isActive: true
      }
    });

    console.log(`✅ Primeros 3 productos:`);
    products.forEach((p, i) => {
      console.log(`\n   ${i + 1}. ${p.name}`);
      console.log(`      SKU: ${p.sku}`);
      console.log(`      Precio/día: ${p.pricePerDay}€`);
      console.log(`      Stock: ${p.stock}`);
      console.log(`      Activo: ${p.isActive ? 'SÍ' : 'NO'}`);
    });

    // Verificar categorías
    console.log('\n' + '='.repeat(70));
    console.log('📋 TEST 5: Categorías Disponibles\n');
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { name: true }
    });

    console.log(`✅ Categorías activas: ${categories.length}`);
    categories.slice(0, 5).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}`);
    });
    if (categories.length > 5) {
      console.log(`   ... y ${categories.length - 5} más`);
    }

    // Resumen
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE BASE DE DATOS');
    console.log('='.repeat(70));
    console.log('✅ Conexión:', 'OK');
    console.log('✅ Usuarios:', userCount, '(mínimo 2 requeridos)');
    console.log('✅ Productos:', productCount, '(mínimo 15 esperados)');
    console.log('✅ Categorías:', categoryCount, '(mínimo 15 esperadas)');
    console.log('✅ Admin:', admin ? 'Existe' : 'NO EXISTE');
    console.log('✅ Cliente:', client ? 'Existe' : 'NO EXISTE');

    const allGood = userCount >= 2 && productCount >= 15 && categoryCount >= 15 && admin && client;

    console.log('\n' + '='.repeat(70));
    if (allGood) {
      console.log('🎉 BASE DE DATOS 100% CORRECTA');
      console.log('✅ Todos los datos necesarios presentes');
    } else {
      console.log('⚠️  BASE DE DATOS CON PROBLEMAS');
      console.log('❌ Faltan datos, ejecuta: npm run db:seed');
    }
    console.log('='.repeat(70));

  } catch (error) {
    console.log('❌ ERROR:', error.message);
    console.log('\n⚠️  Posibles causas:');
    console.log('   - PostgreSQL no está corriendo');
    console.log('   - Credenciales incorrectas en .env');
    console.log('   - Base de datos no existe');
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
