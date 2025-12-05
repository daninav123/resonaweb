/**
 * Script para verificar el estado de los montajes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMontajes() {
  try {
    console.log('🔍 Verificando estado de los montajes...\n');

    // 1. Buscar todos los montajes
    const montajes = await prisma.pack.findMany({
      where: {
        category: 'MONTAJE'
      },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        categoryId: true,
        categoryRef: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`📦 Total montajes encontrados: ${montajes.length}\n`);

    montajes.forEach((montaje, index) => {
      console.log(`${index + 1}. ${montaje.name}`);
      console.log(`   ID: ${montaje.id}`);
      console.log(`   Category: ${montaje.category}`);
      console.log(`   Activo: ${montaje.isActive ? '✅ SÍ' : '❌ NO'}`);
      console.log(`   CategoryRef: ${montaje.categoryRef?.name || 'N/A'}\n`);
    });

    // 2. Verificar eventos configurados
    const eventTypes = await prisma.eventType.findMany({
      select: {
        id: true,
        name: true,
        availablePacks: true
      }
    });

    console.log(`\n🎉 Eventos configurados: ${eventTypes.length}\n`);

    eventTypes.forEach((event) => {
      console.log(`📅 ${event.name}`);
      console.log(`   ID: ${event.id}`);
      
      if (event.availablePacks && event.availablePacks.length > 0) {
        console.log(`   Packs configurados: ${event.availablePacks.length}`);
        
        // Ver cuántos montajes están configurados
        const montajesEnEvento = montajes.filter(m => event.availablePacks.includes(m.id));
        console.log(`   Montajes incluidos: ${montajesEnEvento.length}`);
        
        if (montajesEnEvento.length > 0) {
          montajesEnEvento.forEach(m => {
            console.log(`      ✅ ${m.name}`);
          });
        } else {
          console.log(`      ⚠️ No hay montajes configurados para este evento`);
        }
      } else {
        console.log(`   ⚠️ No tiene packs configurados`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMontajes();
