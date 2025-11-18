/**
 * Verificar usuario admin y credenciales
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkAdminUser() {
  console.log('🔍 VERIFICANDO USUARIO ADMIN\n');

  try {
    // Buscar usuario admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@resona.com' },
    });

    if (!admin) {
      console.log('❌ Usuario admin@resona.com NO EXISTE\n');
      console.log('Creando usuario admin...\n');
      
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@resona.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'ReSona',
          role: 'SUPERADMIN',
          isActive: true,
          emailVerified: true,
        },
      });
      
      console.log('✅ Usuario admin creado:');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Role: ${newAdmin.role}`);
      console.log(`   Active: ${newAdmin.isActive}\n`);
      console.log('Credenciales:');
      console.log('   Email: admin@resona.com');
      console.log('   Password: Admin123!\n');
      
      return;
    }

    console.log('✅ Usuario admin EXISTE\n');
    console.log('Datos del usuario:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nombre: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   Email Verified: ${admin.emailVerified}`);
    console.log(`   Last Login: ${admin.lastLoginAt || 'Nunca'}\n`);

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...\n');
    
    const passwords = ['Admin123!', 'admin123', 'Admin123', 'admin@resona', 'resona123'];
    
    for (const pwd of passwords) {
      const isValid = await bcrypt.compare(pwd, admin.password);
      console.log(`   "${pwd}": ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`);
      
      if (isValid) {
        console.log(`\n✅ La contraseña correcta es: "${pwd}"\n`);
        return;
      }
    }

    console.log('\n⚠️  NINGUNA contraseña común funcionó.\n');
    console.log('Reseteando contraseña a: Admin123!\n');
    
    const newHashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: newHashedPassword },
    });
    
    console.log('✅ Contraseña actualizada correctamente.\n');
    console.log('Nueva credencial:');
    console.log('   Email: admin@resona.com');
    console.log('   Password: Admin123!\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUser()
  .then(() => {
    console.log('✅ Verificación completada');
    process.exit(0);
  })
  .catch(() => {
    console.error('❌ Error en verificación');
    process.exit(1);
  });
