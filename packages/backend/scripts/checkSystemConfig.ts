import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystemConfig() {
  try {
    console.log('🔍 Verificando SystemConfig...\n');

    const configs = await prisma.systemConfig.findMany();

    console.log(`📊 Total de configs: ${configs.length}\n`);

    if (configs.length === 0) {
      console.log('❌ No hay configuraciones guardadas');
      return;
    }

    configs.forEach(config => {
      console.log(`📌 ${config.key}:`);
      console.log(`   Valor: ${JSON.stringify(config.value, null, 2)}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSystemConfig();
