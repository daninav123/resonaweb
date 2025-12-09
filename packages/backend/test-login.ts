import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔐 Probando login con admin@resona.com...\n');

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: 'admin@resona.com' }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado en BD:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`🔑 Role: ${user.role}`);
    console.log(`🎖️  UserLevel: ${user.userLevel}`);
    console.log(`✅ Activo: ${user.isActive}`);
    console.log(`📨 Email verificado: ${user.emailVerified}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Probar password
    const testPassword = 'Admin123!';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);

    console.log(`🔑 Probando password "${testPassword}": ${isPasswordValid ? '✅ CORRECTA' : '❌ INCORRECTA'}\n`);

    if (!isPasswordValid) {
      console.log('⚠️  Si la password es incorrecta, actualiza con:');
      console.log('   npx ts-node create-admin.ts\n');
    }

    // Simular respuesta del login
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('📤 DATOS QUE EL BACKEND DEVUELVE AL FRONTEND:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(userWithoutPassword, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar permisos
    console.log('🔐 VERIFICACIÓN DE PERMISOS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const hasAdminAccess = user.role === 'ADMIN' || user.role === 'SUPERADMIN';
    
    if (hasAdminAccess) {
      console.log('✅ Este usuario PUEDE acceder al panel de admin');
      console.log(`   Rol válido: ${user.role}`);
    } else {
      console.log('❌ Este usuario NO PUEDE acceder al panel de admin');
      console.log(`   Rol actual: ${user.role}`);
      console.log('   Roles permitidos: ADMIN, SUPERADMIN');
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
