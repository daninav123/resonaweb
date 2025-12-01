// Script para configurar imágenes de categorías con placeholders de Unsplash
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URLs de imágenes de productos sobre fondo blanco
// Usando Pexels y Pixabay (gratuitas, sin atribución requerida)
const categoryImages = {
  'sonido': 'https://images.pexels.com/photos/164693/pexels-photo-164693.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Altavoz negro sobre fondo blanco
  'iluminacion': 'https://images.pexels.com/photos/114820/pexels-photo-114820.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Bombilla/luz sobre fondo blanco
  'fx': 'https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Humo sobre fondo blanco
  'microfonia': 'https://images.pexels.com/photos/257904/pexels-photo-257904.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Micrófono sobre fondo blanco
  'estructuras': 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Estructura metálica
  'cableado': 'https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Cables sobre fondo blanco
  'control-sonido': 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Mesa de mezclas
  'control-iluminacion': 'https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Controlador de luces
  'generacion-y-distribucion': 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Equipamiento eléctrico
  'elementos-escenario': 'https://images.pexels.com/photos/265129/pexels-photo-265129.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Mesa/mobiliario
  'elementos-decorativos': 'https://images.pexels.com/photos/1292241/pexels-photo-1292241.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Letras decorativas
  'equipamiento-dj': 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Equipo DJ
  'pantallas-y-proyeccion': 'https://images.pexels.com/photos/4144179/pexels-photo-4144179.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Proyector
  'packs': 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800&h=800&fit=crop', // Conjunto de productos
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
