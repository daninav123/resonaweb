import { prisma } from '../src/index';

async function addPriceDisclaimer() {
  try {
    console.log('🔄 Añadiendo disclaimer de precio a todas las descripciones...');
    
    const disclaimer = '\n\nPrecio individual - IVA no incluido';
    
    // Obtener todos los productos
    const products = await prisma.product.findMany();
    
    console.log(`📦 Se encontraron ${products.length} productos`);
    
    // Actualizar cada producto
    for (const product of products) {
      const currentDescription = product.description || '';
      
      // Verificar si ya tiene el disclaimer
      if (!currentDescription.includes('Precio individual - IVA no incluido')) {
        const newDescription = currentDescription + disclaimer;
        
        await prisma.product.update({
          where: { id: product.id },
          data: { description: newDescription }
        });
        
        console.log(`✅ Actualizado: ${product.name}`);
      } else {
        console.log(`⏭️  Ya tiene disclaimer: ${product.name}`);
      }
    }
    
    console.log('✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addPriceDisclaimer();
