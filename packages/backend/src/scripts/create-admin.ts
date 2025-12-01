import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creando usuario admin...\n');

    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@resona.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rol: ${existingAdmin.role}`);
      return;
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@resona.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'ReSona',
        phone: '+34 600 000 000',
        role: 'ADMIN',
        userLevel: 'VIP_PLUS',
        isActive: true,
        emailVerified: true,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
      }
    });

    console.log('✅ Usuario admin creado exitosamente\n');
    console.log('📋 Detalles:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.role}`);
    console.log(`   Nivel: ${admin.userLevel}`);
    console.log(`   Estado: ${admin.isActive ? 'Activo' : 'Inactivo'}`);
    console.log(`   ID: ${admin.id}\n`);

  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
