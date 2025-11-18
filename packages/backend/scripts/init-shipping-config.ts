import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initShippingConfig() {
  console.log('🚀 Inicializando configuración de envío...\n');

  try {
    // Verificar si ya existe configuración
    const existing = await prisma.shippingConfig.findFirst();
    
    if (existing) {
      console.log('✅ Ya existe configuración de envío');
      console.log('\nConfiguración actual:');
      console.log('━'.repeat(60));
      console.log(`📍 Dirección base: ${existing.baseAddress}`);
      console.log('\n🚚 Tarifas por zona:');
      console.log(`  Local (0-${existing.localZoneMax}km):      €${existing.localZoneRate}`);
      console.log(`  Regional (${existing.localZoneMax}-${existing.regionalZoneMax}km):  €${existing.regionalZoneRate}`);
      console.log(`  Ampliada (${existing.regionalZoneMax}-${existing.extendedZoneMax}km):  €${existing.extendedZoneRate}`);
      console.log(`  Personalizada (>${existing.extendedZoneMax}km): €${existing.customZoneRatePerKm}/km`);
      console.log('\n💰 Mínimos:');
      console.log(`  Solo envío:              €${existing.minimumShippingCost}`);
      console.log(`  Envío + Instalación:     €${existing.minimumWithInstallation}`);
      console.log('\n💫 Extras:');
      console.log(`  Recargo urgente:         €${existing.urgentSurcharge}`);
      console.log(`  Recargo nocturno:        €${existing.nightSurcharge}`);
      console.log('━'.repeat(60));
      return;
    }

    // Crear configuración inicial
    const config = await prisma.shippingConfig.create({
      data: {
        // Zonas
        localZoneMax: 10,
        localZoneRate: 15,
        
        regionalZoneMax: 30,
        regionalZoneRate: 30,
        
        extendedZoneMax: 50,
        extendedZoneRate: 50,
        
        customZoneRatePerKm: 1.5,
        
        // Mínimos
        minimumShippingCost: 20,
        minimumWithInstallation: 50,
        
        // Base
        baseAddress: 'Madrid, España',
        
        // Extras
        urgentSurcharge: 50,
        nightSurcharge: 30,
        
        isActive: true
      }
    });

    console.log('✅ Configuración de envío creada exitosamente\n');
    console.log('Detalles:');
    console.log('━'.repeat(60));
    console.log(`📍 Dirección base: ${config.baseAddress}`);
    console.log('\n🚚 Tarifas por zona:');
    console.log(`  Local (0-${config.localZoneMax}km):      €${config.localZoneRate}`);
    console.log(`  Regional (${config.localZoneMax}-${config.regionalZoneMax}km):  €${config.regionalZoneRate}`);
    console.log(`  Ampliada (${config.regionalZoneMax}-${config.extendedZoneMax}km):  €${config.extendedZoneRate}`);
    console.log(`  Personalizada (>${config.extendedZoneMax}km): €${config.customZoneRatePerKm}/km`);
    console.log('\n💰 Mínimos:');
    console.log(`  Solo envío:              €${config.minimumShippingCost}`);
    console.log(`  Envío + Instalación:     €${config.minimumWithInstallation}`);
    console.log('\n💫 Extras:');
    console.log(`  Recargo urgente:         €${config.urgentSurcharge}`);
    console.log(`  Recargo nocturno:        €${config.nightSurcharge}`);
    console.log('━'.repeat(60));
    console.log('\n📝 Ejemplo de uso:');
    console.log('  - Pedido a 5km:  €20 (mínimo)');
    console.log('  - Pedido a 15km: €30 (zona regional)');
    console.log('  - Pedido a 35km: €50 (zona ampliada)');
    console.log('  - Pedido a 60km: €90 (60 × €1.5)');
    console.log('\n✨ Ahora puedes editarlo desde el panel de admin');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initShippingConfig();
