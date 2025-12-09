import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@resona.com' }
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      console.log('📧 Email: admin@resona.com');
      process.exit(0);
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@resona.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'Resona',
        role: 'SUPERADMIN',
        isActive: true,
        emailVerified: true,
      }
    });

    console.log('✅ Usuario admin creado exitosamente');
    console.log('📧 Email: admin@resona.com');
    console.log('🔑 Password: Admin123!');
    console.log('👤 Role:', admin.role);

  } catch (error) {
    console.error('❌ Error creando admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
