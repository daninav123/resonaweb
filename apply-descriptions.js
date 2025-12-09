const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function applyDescriptions() {
  try {
    console.log('📚 Cargando actualizaciones desde descriptions-review.json...\n');
    
    const updates = JSON.parse(fs.readFileSync('descriptions-review.json', 'utf8'));
    
    console.log(`✅ ${updates.length} actualizaciones encontradas\n`);
    console.log('🔄 Aplicando cambios en la base de datos...\n');
    
    let success = 0;
    let errors = 0;
    
    for (const update of updates) {
      try {
        await prisma.product.update({
          where: { id: update.id },
          data: { description: update.newDescription }
        });
        
        console.log(`✅ ${update.name}`);
        success++;
      } catch (error) {
        console.error(`❌ Error en ${update.name}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\n📊 Resultados finales:`);
    console.log(`   ✅ ${success} descripciones actualizadas`);
    console.log(`   ❌ ${errors} errores\n`);
    
    if (success > 0) {
      console.log(`🎉 ¡Descripciones aplicadas exitosamente!`);
      console.log(`\n💡 Recuerda hacer un rebuild del frontend si es necesario.\n`);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

console.log(`
╔══════════════════════════════════════════════════════════╗
║  APLICADOR DE DESCRIPCIONES MEJORADAS                    ║
╚══════════════════════════════════════════════════════════╝

⚠️  ATENCIÓN: Este script actualizará ${JSON.parse(fs.readFileSync('descriptions-review.json', 'utf8')).length} productos en la base de datos.

¿Quieres continuar? Presiona Ctrl+C para cancelar o Enter para continuar...
`);

// Esperar confirmación del usuario
process.stdin.once('data', () => {
  applyDescriptions();
});
