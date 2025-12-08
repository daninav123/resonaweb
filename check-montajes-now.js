const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMontajes() {
  console.log('\n🔍 VERIFICANDO MONTAJES EN BD\n');

  try {
    // 1. Buscar categoría "Montaje"
    const montajeCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: 'Montaje', mode: 'insensitive' } },
          { name: { equals: 'MONTAJE', mode: 'insensitive' } }
        ]
      }
    });

    if (!montajeCategory) {
      console.log('❌ No existe la categoría "Montaje" en la BD');
      console.log('   Necesitas crear una categoría llamada "Montaje" primero\n');
      return;
    }

    console.log('✅ Categoría Montaje encontrada:');
    console.log('   ID:', montajeCategory.id);
    console.log('   Nombre:', montajeCategory.name);
    console.log('   Oculta:', montajeCategory.isHidden || false);
    console.log('');

    // 2. Buscar packs con esa categoría
    const montajes = await prisma.pack.findMany({
      where: {
        OR: [
          { categoryId: montajeCategory.id },
          { category: 'MONTAJE' }
        ]
      },
      include: {
        categoryRef: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    console.log(`📦 Total montajes encontrados: ${montajes.length}\n`);

    if (montajes.length === 0) {
      console.log('⚠️ No hay montajes en la BD');
      console.log('   Crea montajes en /admin/montajes primero\n');
      return;
    }

    // 3. Mostrar detalles de cada montaje
    montajes.forEach((montaje, index) => {
      console.log(`${index + 1}. ${montaje.name}`);
      console.log(`   ID: ${montaje.id}`);
      console.log(`   CategoryId: ${montaje.categoryId}`);
      console.log(`   Category (enum): ${montaje.category}`);
      console.log(`   CategoryRef: ${montaje.categoryRef?.name || 'N/A'}`);
      console.log(`   Activo: ${montaje.isActive !== false ? 'Sí' : 'No'}`);
      console.log(`   Precio: €${montaje.pricePerDay || montaje.finalPrice || 0}/día`);
      console.log(`   Items: ${montaje.items.length}`);
      console.log('');
    });

    // 4. Verificar montajes activos vs inactivos
    const activos = montajes.filter(m => m.isActive !== false);
    const inactivos = montajes.filter(m => m.isActive === false);

    console.log(`📊 Resumen:`);
    console.log(`   Activos: ${activos.length}`);
    console.log(`   Inactivos: ${inactivos.length}`);
    console.log('');

    // 5. Verificar si tienen la estructura correcta
    const sinCategoryRef = montajes.filter(m => !m.categoryRef);
    const sinCategoryId = montajes.filter(m => !m.categoryId);

    if (sinCategoryRef.length > 0) {
      console.log(`⚠️ ${sinCategoryRef.length} montajes sin categoryRef`);
      sinCategoryRef.forEach(m => {
        console.log(`   - ${m.name} (ID: ${m.id})`);
      });
      console.log('');
    }

    if (sinCategoryId.length > 0) {
      console.log(`⚠️ ${sinCategoryId.length} montajes sin categoryId`);
      sinCategoryId.forEach(m => {
        console.log(`   - ${m.name} (ID: ${m.id})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMontajes();
