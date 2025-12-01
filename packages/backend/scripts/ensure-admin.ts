import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function ensureAdminUser() {
  try {
    console.log('🔍 Verificando usuario admin...');

    const adminEmail = 'admin@resona.com';
    const adminPassword = 'Admin123!';

    // Buscar admin existente
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', existingAdmin.email);
      console.log('   ID:', existingAdmin.id);
      console.log('   Rol:', existingAdmin.role);
      console.log('   Activo:', existingAdmin.isActive);
      
      // Actualizar contraseña
      console.log('🔐 Actualizando contraseña del admin...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      });
      console.log('✅ Contraseña actualizada');
      return;
    }

    // Crear admin
    console.log('🔐 Creando usuario admin...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'ReSona',
        phone: '+34 600 000 000',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      },
    });

    console.log('✅ Usuario admin creado exitosamente');
    console.log('   Email:', admin.email);
    console.log('   Contraseña: Admin123!@#');
    console.log('   ID:', admin.id);
    console.log('   Rol:', admin.role);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

ensureAdminUser();
