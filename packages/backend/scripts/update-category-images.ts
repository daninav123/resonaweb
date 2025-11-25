import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para actualizar imágenes de categorías
 * Ejecutar con: npx ts-node scripts/update-category-images.ts
 */

const categoryImages: Record<string, string> = {
  'fotografia-video': 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
  'iluminacion': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
  'sonido': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
  'microfonia': 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=800',
  'mesas-mezcla-directo': 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
  'equipamiento-dj': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800',
  'elementos-escenario': 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
  'elementos-decorativos': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
  'mobiliario': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
  'backline': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
  'pantallas-proyeccion': 'https://images.unsplash.com/photo-1593510987459-04a2746ce6f0?w=800',
  'efectos-especiales': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'comunicaciones': 'https://images.unsplash.com/photo-1484807352052-23338990c6c6?w=800',
  'energia-distribucion': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
  'cables-conectores': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
};

async function main() {
  console.log('🖼️  Actualizando imágenes de categorías...\n');

  let updated = 0;
  let notFound = 0;

  for (const [slug, imageUrl] of Object.entries(categoryImages)) {
    try {
      const category = await prisma.category.findUnique({
        where: { slug }
      });

      if (category) {
        await prisma.category.update({
          where: { slug },
          data: { imageUrl }
        });
        console.log(`✅ ${category.name} - Imagen actualizada`);
        updated++;
      } else {
        console.log(`⚠️  Categoría '${slug}' no encontrada`);
        notFound++;
      }
    } catch (error) {
      console.error(`❌ Error actualizando ${slug}:`, error);
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Actualizadas: ${updated}`);
  console.log(`   No encontradas: ${notFound}`);
  console.log(`\n✅ Proceso completado`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
