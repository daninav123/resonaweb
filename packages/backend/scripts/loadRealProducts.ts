import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  'SONIDO',
  'ILUMINACION',
  'FX',
  'ESTRUCTURAS',
  'ELEMENTOS ESCENARIO',
  'ELEMENTOS DECORATIVOS',
  'MICROFONIA',
  'CONTROL SONIDO',
  'CONTROL ILUMINACION',
  'GENERACIÓN Y DISTRIBUCIÓN',
  'EQUIPAMIENTO DJ',
  'PANTALLAS Y PROYECCIÓN',
  'CABLEADO',
];

const products = [
  // SONIDO
  { name: 'das Altea 415a', category: 'SONIDO', stock: 4, purchasePrice: 409 },
  { name: 'icoa 12a blancos', category: 'SONIDO', stock: 6, purchasePrice: 313 },
  { name: 'icoa 15a negros', category: 'SONIDO', stock: 2, purchasePrice: 357 },
  { name: 'das action 215a', category: 'SONIDO', stock: 2, purchasePrice: 657 },
  { name: 'sub das 218a', category: 'SONIDO', stock: 1, purchasePrice: 1367 },
  { name: 'LC 8 kinson', category: 'SONIDO', stock: 4, purchasePrice: 100 },
  
  // ILUMINACION
  { name: 'cabezas 3en1 17r', category: 'ILUMINACION', stock: 6, purchasePrice: 850 },
  { name: 'beam 7r', category: 'ILUMINACION', stock: 4, purchasePrice: 250 },
  { name: 'mini beam', category: 'ILUMINACION', stock: 2, purchasePrice: 100 },
  { name: 'mini wash', category: 'ILUMINACION', stock: 2, purchasePrice: 100 },
  { name: 'focos spot pequeños', category: 'ILUMINACION', stock: 3, purchasePrice: 50 },
  { name: 'flash rgb 1000w', category: 'ILUMINACION', stock: 4, purchasePrice: 250 },
  { name: 'láser rgb 10w', category: 'ILUMINACION', stock: 2, purchasePrice: 390 },
  { name: 'flash rgb smd', category: 'ILUMINACION', stock: 10, purchasePrice: 50 },
  
  // FX
  { name: 'máquinas fuego frío', category: 'FX', stock: 4, purchasePrice: 150 },
  { name: 'máquinas de humo', category: 'FX', stock: 2, purchasePrice: 70 },
  
  // ESTRUCTURAS
  { name: 'truss 1 m', category: 'ESTRUCTURAS', stock: 7, purchasePrice: 100 },
  { name: 'truss 2 m', category: 'ESTRUCTURAS', stock: 6, purchasePrice: 200 },
  { name: 'bases', category: 'ESTRUCTURAS', stock: 6, purchasePrice: 50 },
  { name: 'top', category: 'ESTRUCTURAS', stock: 2, purchasePrice: 50 },
  { name: 'semicírculos 4m diametro', category: 'ESTRUCTURAS', stock: 2, purchasePrice: 500 },
  { name: 'cubos', category: 'ESTRUCTURAS', stock: 2, purchasePrice: 300 },
  { name: 'trípodes grandes', category: 'ESTRUCTURAS', stock: 2, purchasePrice: 100 },
  { name: 'mini truss 2m', category: 'ESTRUCTURAS', stock: 3, purchasePrice: 100 },
  { name: 'Trípodes negros', category: 'ESTRUCTURAS', stock: 9, purchasePrice: 25 },
  { name: 'soportes blancos', category: 'ESTRUCTURAS', stock: 6, purchasePrice: 50 },
  { name: 'Adapador trípode/mariposa', category: 'ESTRUCTURAS', stock: 4, purchasePrice: 10 },
  { name: 'Adaptador trípode/truss', category: 'ESTRUCTURAS', stock: 2, purchasePrice: 5 },
  
  // ELEMENTOS ESCENARIO
  { name: 'mesa 2x1', category: 'ELEMENTOS ESCENARIO', stock: 1, purchasePrice: 300 },
  { name: 'patas 1 m', category: 'ELEMENTOS ESCENARIO', stock: 4, purchasePrice: 10 },
  
  // ELEMENTOS DECORATIVOS
  { name: 'Cabina palets', category: 'ELEMENTOS DECORATIVOS', stock: 1, purchasePrice: 0 },
  { name: 'Cabina jardin', category: 'ELEMENTOS DECORATIVOS', stock: 1, purchasePrice: 0 },
  { name: 'Letras', category: 'ELEMENTOS DECORATIVOS', stock: 1, purchasePrice: 0 },
  { name: 'focos rgb decoración', category: 'ELEMENTOS DECORATIVOS', stock: 8, purchasePrice: 65 },
  { name: 'ventiladores', category: 'ELEMENTOS DECORATIVOS', stock: 2, purchasePrice: 350 },
  { name: 'hexágono', category: 'ELEMENTOS DECORATIVOS', stock: 2, purchasePrice: 140 },
  
  // MICROFONIA
  { name: 'micros audibax sm580', category: 'MICROFONIA', stock: 4, purchasePrice: 30 },
  { name: 'micro audibax sm570', category: 'MICROFONIA', stock: 1, purchasePrice: 30 },
  { name: 'micro Behringer BA 19A', category: 'MICROFONIA', stock: 1, purchasePrice: 30 },
  { name: 'micros inalámbrico', category: 'MICROFONIA', stock: 1, purchasePrice: 50 },
  { name: 'set micro 2 micros inalámbricos', category: 'MICROFONIA', stock: 1, purchasePrice: 60 },
  { name: 'mixer Behringer X Air XR18', category: 'MICROFONIA', stock: 1, purchasePrice: 400 },
  { name: 'mixer sound craft', category: 'MICROFONIA', stock: 1, purchasePrice: 250 },
  
  // CONTROL SONIDO
  { name: 'procesador t racks 204', category: 'CONTROL SONIDO', stock: 1, purchasePrice: 250 },
  
  // CONTROL ILUMINACION
  { name: 'mesa quick20', category: 'CONTROL ILUMINACION', stock: 1, purchasePrice: 3000 },
  { name: 'cajetín usb dmx', category: 'CONTROL ILUMINACION', stock: 1, purchasePrice: 200 },
  
  // GENERACIÓN Y DISTRIBUCIÓN
  { name: 'generador 6500w', category: 'GENERACIÓN Y DISTRIBUCIÓN', stock: 1, purchasePrice: 700 },
  { name: 'distribuidor 32a', category: 'GENERACIÓN Y DISTRIBUCIÓN', stock: 1, purchasePrice: 100 },
  
  // EQUIPAMIENTO DJ
  { name: 'pioneer rx2', category: 'EQUIPAMIENTO DJ', stock: 1, purchasePrice: 1500 },
  
  // PANTALLAS Y PROYECCIÓN
  { name: 'proyector', category: 'PANTALLAS Y PROYECCIÓN', stock: 1, purchasePrice: 100 },
  { name: 'pantalla', category: 'PANTALLAS Y PROYECCIÓN', stock: 1, purchasePrice: 250 },
  
  // CABLEADO
  { name: 'Dmx', category: 'CABLEADO', stock: 40, purchasePrice: 15 },
  { name: 'Xlr', category: 'CABLEADO', stock: 20, purchasePrice: 15 },
  { name: 'Alimentación', category: 'CABLEADO', stock: 40, purchasePrice: 5 },
  { name: 'Zapatillas', category: 'CABLEADO', stock: 30, purchasePrice: 15 },
  { name: 'Alargadores shucko', category: 'CABLEADO', stock: 20, purchasePrice: 20 },
  { name: 'Rca/rca', category: 'CABLEADO', stock: 5, purchasePrice: 5 },
  { name: 'Minijack/jack', category: 'CABLEADO', stock: 5, purchasePrice: 5 },
  { name: 'Manguera trifasica 20 metros', category: 'CABLEADO', stock: 1, purchasePrice: 100 },
];

async function main() {
  console.log('🗑️  Eliminando productos de prueba...');
  
  // Delete all existing products and related data
  await prisma.review.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  
  console.log('✅ Productos eliminados');
  
  console.log('📁 Creando categorías...');
  
  // Create categories
  const categoryMap: { [key: string]: string } = {};
  for (const categoryName of categories) {
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/ó/g, 'o').replace(/í/g, 'i'),
        description: `Productos de ${categoryName}`,
        isActive: true,
      },
    });
    categoryMap[categoryName] = category.id;
    console.log(`✅ Categoría creada: ${categoryName}`);
  }
  
  console.log('📦 Creando productos...');
  
  // Create products
  let count = 0;
  for (const product of products) {
    const sku = `${product.category.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(4, '0')}`;
    
    await prisma.product.create({
      data: {
        name: product.name,
        slug: `${product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${sku.toLowerCase()}`,
        sku: sku,
        description: `${product.name} - ${product.category}`,
        categoryId: categoryMap[product.category],
        pricePerDay: Math.round(product.purchasePrice * 0.15), // 15% del precio de compra como precio por día
        pricePerWeekend: Math.round(product.purchasePrice * 0.15), // Igual que precio día
        pricePerWeek: Math.round(product.purchasePrice * 0.50), // 50% del precio de compra como precio por semana
        stock: product.stock,
        realStock: product.stock,
        availableStock: product.stock,
        status: 'AVAILABLE',
        stockStatus: 'IN_STOCK',
        purchasePrice: product.purchasePrice,
        purchaseDate: new Date(),
        timesUsed: 0,
        isActive: true,
        isPack: false,
        images: [],
      },
    });
    
    count++;
    console.log(`✅ Producto creado: ${product.name} (${sku})`);
  }
  
  console.log(`\n🎉 ¡Completado! ${count} productos reales cargados correctamente.`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
