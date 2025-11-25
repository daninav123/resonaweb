const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function updateDAS515AImage() {
  try {
    console.log('🔍 Buscando producto DAS 515A...');
    
    // Buscar el producto
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { name: { contains: 'DAS 515', mode: 'insensitive' } },
          { name: { contains: '515A', mode: 'insensitive' } },
          { sku: { contains: 'DAS-515', mode: 'insensitive' } }
        ]
      }
    });

    if (!product) {
      console.log('❌ Producto DAS 515A no encontrado');
      console.log('📝 Creando producto DAS 515A...');
      
      // Crear el producto si no existe
      const newProduct = await prisma.product.create({
        data: {
          sku: 'DAS-515A',
          name: 'DAS Audio 515A - Altavoz Activo',
          slug: 'das-audio-515a-altavoz-activo',
          description: 'Altavoz autoamplificado profesional DAS Audio 515A. Potencia: 1000W. Ideal para eventos de mediano y gran formato.',
          categoryId: 'sonido', // Ajustar según tu BD
          pricePerDay: 35,
          pricePerWeekend: 90,
          pricePerWeek: 180,
          stock: 4,
          realStock: 4,
          weight: 25,
          dimensions: '40x60x40',
          featured: true,
          active: true,
          visible: true,
          stockStatus: 'IN_STOCK',
          deliveryType: 'PICKUP_AND_DELIVERY',
          tags: ['altavoz', 'das', 'audio', 'sonido', 'activo', 'autoamplificado'],
          specifications: {
            potencia: '1000W',
            tipo: 'Autoamplificado',
            marca: 'DAS Audio',
            modelo: '515A'
          }
        }
      });
      
      console.log('✅ Producto creado:', newProduct.name);
      return newProduct;
    }

    console.log('✅ Producto encontrado:', product.name);
    return product;
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDAS515AImage()
  .then(product => {
    if (product) {
      console.log('\n📦 Producto ID:', product.id);
      console.log('🖼️  Ahora procesa la imagen con Sharp...');
    }
  })
  .catch(console.error);
