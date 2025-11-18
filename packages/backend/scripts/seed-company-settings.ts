import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCompanySettings() {
  try {
    console.log('🏢 Creando configuración de empresa...');

    // Verificar si ya existe
    const existing = await prisma.companySettings.findFirst({
      where: { isActive: true },
    });

    if (existing) {
      console.log('✅ Ya existe configuración de empresa');
      console.log(`   Empresa: ${existing.companyName}`);
      console.log(`   Propietario: ${existing.ownerName}`);
      return;
    }

    // Crear configuración por defecto
    const settings = await prisma.companySettings.create({
      data: {
        companyName: 'ReSona Events S.L.',
        ownerName: 'Daniel Navarro Campos',
        address: 'C/valencia n 37, 2',
        city: 'Xirivella',
        postalCode: '46950',
        province: 'Valencia',
        country: 'España',
        phone: '+34 600 123 456',
        email: 'info@resona.com',
        website: 'https://resona.com',
        primaryColor: '#5ebbff',
        invoiceNotes: 'Gracias por confiar en ReSona Events. Para cualquier consulta, no dude en contactarnos.',
        termsConditions: 'La fianza se devolverá al finalizar el alquiler si el material se devuelve en perfectas condiciones.',
      },
    });

    console.log('✅ Configuración de empresa creada:');
    console.log(`   Empresa: ${settings.companyName}`);
    console.log(`   Propietario: ${settings.ownerName}`);
    console.log(`   Dirección: ${settings.address}, ${settings.postalCode} ${settings.city}`);
    console.log(`   Provincia: ${settings.province}`);
    console.log(`   Teléfono: ${settings.phone}`);
    console.log(`   Email: ${settings.email}`);
  } catch (error) {
    console.error('❌ Error al crear configuración de empresa:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCompanySettings();
