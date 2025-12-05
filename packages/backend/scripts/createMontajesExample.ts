import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMontajesExample() {
  try {
    console.log('🚀 Creando montajes de ejemplo...\n');

    // 1. Verificar si existe categoría Montaje
    let montajeCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Montaje',
          mode: 'insensitive'
        }
      }
    });

    if (!montajeCategory) {
      console.log('❌ Categoría Montaje no existe. Créala primero en el panel de admin.');
      return;
    }

    console.log('✅ Categoría Montaje encontrada:', montajeCategory.id);

    // 2. Verificar si existe categoría Personal
    let personalCategory = await prisma.category.findFirst({
      where: {
        name: {
          contains: 'Personal',
          mode: 'insensitive'
        }
      }
    });

    if (!personalCategory) {
      console.log('❌ Categoría Personal no existe. Créala primero en el panel de admin.');
      return;
    }

    console.log('✅ Categoría Personal encontrada:', personalCategory.id);

    // 3. Verificar si existen productos de personal
    const personalProducts = await prisma.product.findMany({
      where: {
        categoryId: personalCategory.id
      },
      take: 5
    });

    if (personalProducts.length === 0) {
      console.log('❌ No hay productos en categoría Personal. Crea algunos primero.');
      return;
    }

    console.log(`✅ Encontrados ${personalProducts.length} productos de personal`);

    // 4. Crear montajes de ejemplo
    const montajesData = [
      {
        name: 'Montaje Básico',
        slug: 'montaje-basico',
        description: 'Montaje básico con 1 montador',
        finalPrice: 150,
        category: 'MONTAJE',
        categoryId: montajeCategory.id,
        transportCost: 50,
        items: [
          {
            productId: personalProducts[0].id,
            numberOfPeople: 1,
            hoursPerPerson: 2
          }
        ]
      },
      {
        name: 'Montaje Estándar',
        slug: 'montaje-estandar',
        description: 'Montaje estándar con 2 montadores',
        finalPrice: 300,
        category: 'MONTAJE',
        categoryId: montajeCategory.id,
        transportCost: 100,
        items: [
          {
            productId: personalProducts[0].id,
            numberOfPeople: 2,
            hoursPerPerson: 3
          }
        ]
      },
      {
        name: 'Montaje Premium',
        slug: 'montaje-premium',
        description: 'Montaje premium con 3 montadores y técnico',
        finalPrice: 500,
        category: 'MONTAJE',
        categoryId: montajeCategory.id,
        transportCost: 150,
        items: [
          {
            productId: personalProducts[0].id,
            numberOfPeople: 3,
            hoursPerPerson: 4
          },
          ...(personalProducts[1] ? [{
            productId: personalProducts[1].id,
            numberOfPeople: 1,
            hoursPerPerson: 4
          }] : [])
        ]
      }
    ];

    // 5. Crear los montajes
    for (const montajeData of montajesData) {
      const existingPack = await prisma.pack.findUnique({
        where: { slug: montajeData.slug }
      });

      if (existingPack) {
        console.log(`⏭️  Montaje "${montajeData.name}" ya existe. Saltando...`);
        continue;
      }

      const { items, ...packData } = montajeData;

      const newPack = await prisma.pack.create({
        data: {
          ...packData,
          basePricePerDay: montajeData.finalPrice,
          calculatedTotalPrice: montajeData.finalPrice,
          isActive: true,
          items: {
            create: items
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      console.log(`✅ Creado: ${newPack.name} (${newPack.slug})`);
      console.log(`   - Precio: €${newPack.finalPrice}`);
      console.log(`   - Items: ${newPack.items.length}`);
    }

    console.log('\n✅ Montajes de ejemplo creados correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMontajesExample();
