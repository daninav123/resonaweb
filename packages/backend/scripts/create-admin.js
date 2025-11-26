const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('\n🔐 CREANDO USUARIO ADMIN\n');
  
  try {
    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existing) {
      console.log('✅ Usuario admin ya existe');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      await prisma.$disconnect();
      return;
    }

    // Crear contraseña hasheada
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'Usuario',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
      }
    });

    console.log('✅ Usuario admin creado exitosamente\n');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log(`👤 Role: ${admin.role}`);
    console.log(`\n🔗 Login: http://localhost:3000/login\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
