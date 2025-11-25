import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVIPUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userLevel: true,
        role: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    console.log('\n📋 USUARIOS EN LA BASE DE DATOS:\n');
    console.log('─'.repeat(100));
    console.log('EMAIL'.padEnd(30) + ' | ' + 'NOMBRE'.padEnd(25) + ' | ' + 'NIVEL'.padEnd(12) + ' | ' + 'ROL');
    console.log('─'.repeat(100));

    users.forEach(user => {
      const nivel = user.userLevel.padEnd(12);
      const badge = user.userLevel === 'VIP' ? '⭐' : user.userLevel === 'VIP_PLUS' ? '👑' : '  ';
      console.log(
        user.email.padEnd(30) + ' | ' + 
        `${user.firstName} ${user.lastName}`.padEnd(25) + ' | ' + 
        `${badge} ${nivel}` + ' | ' + 
        user.role
      );
    });

    console.log('─'.repeat(100));
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total usuarios: ${users.length}`);
    console.log(`   STANDARD: ${users.filter(u => u.userLevel === 'STANDARD').length}`);
    console.log(`   VIP: ${users.filter(u => u.userLevel === 'VIP').length}`);
    console.log(`   VIP_PLUS: ${users.filter(u => u.userLevel === 'VIP_PLUS').length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVIPUsers();
