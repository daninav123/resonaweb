/**
 * Script para arreglar isActive en producción
 * 
 * Uso:
 * 1. Asegúrate que DATABASE_URL apunta a PRODUCCIÓN
 * 2. node fix-production-packs.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // URL de producción
    }
  }
});

async function fixPacks() {
  console.log('🔧 Arreglando packs en producción...\n');

  try {
    // 1. Ver estado actual
    const allPacks = await prisma.pack.findMany({
      select: { id: true, name: true, isActive: true }
    });

    console.log('📊 Estado actual de los packs:');
    allPacks.forEach(pack => {
      console.log(`- ${pack.name}: isActive = ${pack.isActive}`);
    });

    // 2. Actualizar NULLs a true
    const result = await prisma.pack.updateMany({
      where: {
        isActive: null
      },
      data: {
        isActive: true
      }
    });

    console.log(`\n✅ Actualizados ${result.count} packs de NULL a true`);

    // 3. Desactivar packs específicos (ajusta los nombres según necesites)
    const packsToHide = ['Nombre Pack 1', 'Nombre Pack 2']; // ← CAMBIA ESTO

    if (packsToHide.length > 0) {
      const hideResult = await prisma.pack.updateMany({
        where: {
          name: { in: packsToHide }
        },
        data: {
          isActive: false
        }
      });

      console.log(`✅ Ocultados ${hideResult.count} packs específicos`);
    }

    // 4. Verificar resultado final
    const finalPacks = await prisma.pack.findMany({
      select: { id: true, name: true, isActive: true },
      orderBy: { name: 'asc' }
    });

    console.log('\n📊 Estado final:');
    console.log('Activos:');
    finalPacks.filter(p => p.isActive === true).forEach(pack => {
      console.log(`  ✅ ${pack.name}`);
    });

    console.log('\nInactivos:');
    finalPacks.filter(p => p.isActive === false).forEach(pack => {
      console.log(`  ❌ ${pack.name}`);
    });

    console.log('\n🎉 ¡Listo!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPacks();
