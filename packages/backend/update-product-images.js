/**
 * Actualizar las imágenes de productos con URLs válidas
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateImages() {
  const productImages = {
    'Sony A7 III': 'https://images.unsplash.com/photo-1606986628025-35d57e735ae0?w=400&h=300&fit=crop',
    'Canon 50mm': 'https://images.unsplash.com/photo-1606986628253-05620e9b0a80?w=400&h=300&fit=crop',
    'Panel LED 1000W': 'https://images.unsplash.com/photo-1565120130276-dfbd9a7a3ad7?w=400&h=300&fit=crop',
    'JBL PRX815W': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=300&fit=crop',
    'Shure SM58': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop',
  };

  console.log('Actualizando imágenes de productos...\n');

  for (const [name, imageUrl] of Object.entries(productImages)) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: { contains: name } }
      });

      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            mainImageUrl: imageUrl,
            images: [imageUrl]
          }
        });
        console.log(`✅ Actualizado: ${name}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${name}:`, error.message);
    }
  }

  // Actualizar categorías también
  const categoryImages = {
    'Fotografía y Video': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
    'Iluminación': 'https://images.unsplash.com/photo-1565120130276-dfbd9a7a3ad7?w=400&h=300&fit=crop',
    'Sonido': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  };

  console.log('\nActualizando imágenes de categorías...\n');

  for (const [name, imageUrl] of Object.entries(categoryImages)) {
    try {
      const category = await prisma.category.findFirst({
        where: { name }
      });

      if (category) {
        await prisma.category.update({
          where: { id: category.id },
          data: { imageUrl }
        });
        console.log(`✅ Actualizado: ${name}`);
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${name}:`, error.message);
    }
  }

  console.log('\n✨ Imágenes actualizadas exitosamente');
  await prisma.$disconnect();
}

updateImages().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
