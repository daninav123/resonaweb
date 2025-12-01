// Script para configurar imágenes de categorías con placeholders de Unsplash
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URLs de imágenes profesionales de Unsplash (gratuitas, sin atribución requerida)
const categoryImages = {
  'sonido': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&q=80', // Altavoz profesional
  'iluminacion': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop&q=80', // Luces de escenario
  'fx': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=800&fit=crop&q=80', // Máquina de humo
  'microfonia': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=800&fit=crop&q=80', // Micrófono profesional
  'estructuras': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=800&fit=crop&q=80', // Estructura de truss
  'cableado': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&q=80', // Cables profesionales
  'control-sonido': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=800&fit=crop&q=80', // Mesa de mezclas
  'control-iluminacion': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=800&fit=crop&q=80', // Controlador DMX
  'generacion-y-distribucion': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=800&fit=crop&q=80', // Generador
  'elementos-escenario': 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=800&fit=crop&q=80', // Escenario
  'elementos-decorativos': 'https://images.unsplash.com/photo-1519167758481-83f29da8013a?w=800&h=800&fit=crop&q=80', // Letras luminosas
  'equipamiento-dj': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=800&fit=crop&q=80', // Mesa DJ
  'pantallas-y-proyeccion': 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&h=800&fit=crop&q=80', // Proyector
  'packs': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=800&fit=crop&q=80', // Conjunto de equipos
};

async function setupCategoryImages() {
  console.log('🖼️  Configurando imágenes de categorías...\n');
  
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
        console.log(`✅ ${category.name.padEnd(35)} → ✓`);
        updated++;
      } else {
        console.log(`⚠️  Categoría no encontrada: ${slug}`);
        notFound++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ⚠️  No encontradas: ${notFound}`);
    console.log(`   📁 Total: ${Object.keys(categoryImages).length}`);
    console.log(`${'='.repeat(60)}\n`);
    
    console.log('✨ Las imágenes se mostrarán automáticamente en el frontend');
    console.log('🔄 Recarga el navegador para ver los cambios\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupCategoryImages();
