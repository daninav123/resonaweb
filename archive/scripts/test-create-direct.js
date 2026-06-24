// Script para probar creación directa en el servicio
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

async function testCreateProduct() {
  try {
    console.log('🧪 Probando crear producto directamente con Prisma...\n');
    
    // Obtener una categoría existente
    const category = await prisma.category.findFirst();
    console.log('✅ Categoría encontrada:', category.id, category.name);
    
    const productData = {
      name: 'Test Product Direct',
      sku: 'TEST-DIRECT-' + Date.now(),
      slug: slugify('Test Product Direct ' + Date.now(), { lower: true, strict: true }),
      description: 'Test description',
      categoryId: category.id,
      pricePerDay: 9.95,
      pricePerWeekend: 9.95,
      pricePerWeek: 49.75,
      stock: 1,
      realStock: 1,
      availableStock: 1,
      isPack: false
    };
    
    console.log('\n📦 Datos a crear:');
    console.log(JSON.stringify(productData, null, 2));
    
    console.log('\n🔧 Creando producto...');
    const product = await prisma.product.create({
      data: productData
    });
    
    console.log('\n✅ ¡Producto creado exitosamente!');
    console.log('ID:', product.id);
    console.log('Name:', product.name);
    console.log('SKU:', product.sku);
    
  } catch (error) {
    console.error('\n❌ ERROR:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.meta) {
      console.error('Meta:', JSON.stringify(error.meta, null, 2));
    }
    console.error('\nStack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateProduct();
