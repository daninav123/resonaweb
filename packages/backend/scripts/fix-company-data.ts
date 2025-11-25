import { PrismaClient } from '@prisma/client';
import { decode } from 'html-entities';

const prisma = new PrismaClient();

async function fixCompanyData() {
  try {
    console.log('🔧 Corrigiendo datos de empresa con HTML entities...\n');
    
    const settings = await prisma.companySettings.findFirst({
      where: { isActive: true }
    });
    
    if (!settings) {
      console.log('❌ No se encontró configuración de empresa');
      return;
    }
    
    console.log('📋 Datos ANTES:');
    console.log(`   Dirección: ${settings.address}`);
    console.log(`   Website: ${settings.website}\n`);
    
    // Decodificar HTML entities
    const cleanedData = {
      address: settings.address ? decode(settings.address) : settings.address,
      website: settings.website ? decode(settings.website) : settings.website,
      companyName: settings.companyName ? decode(settings.companyName) : settings.companyName,
      email: settings.email ? decode(settings.email) : settings.email,
      phone: settings.phone ? decode(settings.phone) : settings.phone,
    };
    
    await prisma.companySettings.update({
      where: { id: settings.id },
      data: cleanedData,
    });
    
    console.log('✅ Datos DESPUÉS:');
    console.log(`   Dirección: ${cleanedData.address}`);
    console.log(`   Website: ${cleanedData.website}\n`);
    
    console.log('🎉 Datos corregidos correctamente');
    console.log('   Recarga la página de configuración de empresa\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompanyData();
