import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para actualizar imágenes de productos
 * 
 * USO:
 * 1. Modifica el array 'updates' con los slugs y nuevas URLs
 * 2. Ejecuta: npx tsx src/scripts/update-product-images.ts
 */

const updates = [
  // Ejemplo de cómo actualizar imágenes:
  {
    slug: 'das-audio-515a',
    images: [
      'https://nueva-url-imagen-1.jpg',
      'https://nueva-url-imagen-2.jpg', // Opcional: múltiples imágenes
    ]
  },
  // Añade más productos aquí...
];

async function updateImages() {
  console.log('🖼️  Actualizando imágenes de productos...\n');

  let updated = 0;
  let notFound = 0;

  for (const item of updates) {
    try {
      const product = await prisma.product.findUnique({
        where: { slug: item.slug },
        select: { id: true, name: true, images: true }
      });

      if (!product) {
        console.log(`❌ No encontrado: ${item.slug}`);
        notFound++;
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: item.images,
          mainImageUrl: item.images[0] || null
        }
      });

      console.log(`✅ Actualizado: ${product.name}`);
      console.log(`   Imágenes anteriores: ${(product.images as string[]).length}`);
      console.log(`   Imágenes nuevas: ${item.images.length}`);
      console.log(`   URLs:`);
      item.images.forEach((url, i) => {
        console.log(`   ${i + 1}. ${url}`);
      });
      console.log('');

      updated++;

    } catch (error: any) {
      console.error(`❌ Error al actualizar ${item.slug}:`, error.message);
    }
  }

  console.log('\n📊 RESUMEN:');
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ❌ No encontrados: ${notFound}`);
  console.log(`   📦 Total procesados: ${updates.length}`);
}

// También puedes buscar un producto por nombre
async function findProductByName(searchTerm: string) {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true
    },
    take: 10
  });

  console.log(`\n🔍 Resultados para "${searchTerm}":\n`);
  
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`);
    console.log(`   Slug: ${p.slug}`);
    console.log(`   Imágenes actuales: ${(p.images as string[]).length}`);
    if ((p.images as string[]).length > 0) {
      console.log(`   URL principal: ${(p.images as string[])[0]}`);
    }
    console.log('');
  });
}

// Modo de uso
const args = process.argv.slice(2);

if (args[0] === 'search' && args[1]) {
  // Buscar productos: npx tsx src/scripts/update-product-images.ts search "das audio"
  findProductByName(args[1])
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error('Error:', error);
      prisma.$disconnect();
      process.exit(1);
    });
} else if (updates.length > 0) {
  // Actualizar imágenes
  updateImages()
    .then(() => {
      prisma.$disconnect();
      console.log('\n✨ Proceso completado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      prisma.$disconnect();
      process.exit(1);
    });
} else {
  console.log(`
📸 USO DEL SCRIPT:

1. BUSCAR PRODUCTOS:
   npx tsx src/scripts/update-product-images.ts search "nombre del producto"
   
   Ejemplo:
   npx tsx src/scripts/update-product-images.ts search "das audio"

2. ACTUALIZAR IMÁGENES:
   - Edita el array 'updates' en este archivo
   - Añade los slugs y nuevas URLs
   - Ejecuta: npx tsx src/scripts/update-product-images.ts

Ejemplo de configuración:
const updates = [
  {
    slug: 'das-audio-515a',
    images: [
      'https://mi-imagen.jpg',
      'https://segunda-imagen.jpg'
    ]
  }
];
  `);
  process.exit(0);
}
