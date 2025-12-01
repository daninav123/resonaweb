// Script para actualizar imágenes de categorías
// USO: node update-category-images.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mapeo de slug a ruta de imagen
const categoryImages = {
  'sonido': '/images/categories/sonido.jpg',
  'iluminacion': '/images/categories/iluminacion.jpg',
  'fx': '/images/categories/fx.jpg',
  'microfonia': '/images/categories/microfonia.jpg',
  'estructuras': '/images/categories/estructuras.jpg',
  'cableado': '/images/categories/cableado.jpg',
  'control-sonido': '/images/categories/control-sonido.jpg',
  'control-iluminacion': '/images/categories/control-iluminacion.jpg',
  'generacion-y-distribucion': '/images/categories/generacion-y-distribucion.jpg',
  'elementos-escenario': '/images/categories/elementos-escenario.jpg',
  'elementos-decorativos': '/images/categories/elementos-decorativos.jpg',
  'equipamiento-dj': '/images/categories/equipamiento-dj.jpg',
  'pantallas-y-proyeccion': '/images/categories/pantallas-y-proyeccion.jpg',
  'packs': '/images/categories/packs.jpg',
};

async function updateCategoryImages() {
  console.log('🖼️  Actualizando imágenes de categorías...\n');
  
  try {
    let updated = 0;
    let notFound = 0;
    
    for (const [slug, imageUrl] of Object.entries(categoryImages)) {
      const category = await prisma.category.findUnique({
        where: { slug },
      });
      
      if (category) {
        await prisma.category.update({
          where: { slug },
          data: { imageUrl },
        });
        console.log(`✅ ${category.name.padEnd(30)} → ${imageUrl}`);
        updated++;
      } else {
        console.log(`❌ Categoría no encontrada: ${slug}`);
        notFound++;
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ❌ No encontradas: ${notFound}`);
    console.log(`   📁 Total: ${Object.keys(categoryImages).length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryImages();
