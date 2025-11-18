import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definir costes por categoría
const CATEGORY_COSTS = {
  // Microfonía - Pequeño y ligero
  'Microfonía': {
    shippingCost: 5,
    installationCost: 10,
    installationTimeMinutes: 5,
    requiresInstallation: false,
    installationComplexity: 1
  },
  
  // Sonido - Peso medio
  'Sonido': {
    shippingCost: 15,
    installationCost: 50,
    installationTimeMinutes: 30,
    requiresInstallation: true,
    installationComplexity: 2
  },
  
  // Iluminación - Complejo
  'Iluminación': {
    shippingCost: 20,
    installationCost: 100,
    installationTimeMinutes: 60,
    requiresInstallation: true,
    installationComplexity: 3
  },
  
  // Pantallas y Proyección - Muy complejo
  'Pantallas y Proyección': {
    shippingCost: 30,
    installationCost: 150,
    installationTimeMinutes: 90,
    requiresInstallation: true,
    installationComplexity: 3
  },
  
  // Equipamiento DJ - Medio
  'Equipamiento DJ': {
    shippingCost: 15,
    installationCost: 75,
    installationTimeMinutes: 45,
    requiresInstallation: true,
    installationComplexity: 2
  },
  
  // Mobiliario - Grande pero simple
  'Mobiliario': {
    shippingCost: 25,
    installationCost: 30,
    installationTimeMinutes: 15,
    requiresInstallation: false,
    installationComplexity: 1
  },
  
  // Elementos de Escenario - Grande
  'Elementos de Escenario': {
    shippingCost: 40,
    installationCost: 100,
    installationTimeMinutes: 90,
    requiresInstallation: true,
    installationComplexity: 3
  },
  
  // Efectos Especiales - Complejo
  'Efectos Especiales': {
    shippingCost: 20,
    installationCost: 120,
    installationTimeMinutes: 60,
    requiresInstallation: true,
    installationComplexity: 3
  },
  
  // Backline - Pesado
  'Backline': {
    shippingCost: 30,
    installationCost: 60,
    installationTimeMinutes: 30,
    requiresInstallation: true,
    installationComplexity: 2
  },
  
  // Fotografía y Video - Delicado
  'Fotografía y Video': {
    shippingCost: 15,
    installationCost: 80,
    installationTimeMinutes: 45,
    requiresInstallation: true,
    installationComplexity: 2
  },
  
  // Cables y Conectores - Pequeño
  'Cables y Conectores': {
    shippingCost: 3,
    installationCost: 5,
    installationTimeMinutes: 5,
    requiresInstallation: false,
    installationComplexity: 1
  },
  
  // Comunicaciones - Pequeño
  'Comunicaciones': {
    shippingCost: 8,
    installationCost: 20,
    installationTimeMinutes: 15,
    requiresInstallation: false,
    installationComplexity: 1
  },
  
  // Energía y Distribución - Medio
  'Energía y Distribución': {
    shippingCost: 12,
    installationCost: 40,
    installationTimeMinutes: 20,
    requiresInstallation: true,
    installationComplexity: 2
  },
  
  // Elementos Decorativos - Variable
  'Elementos Decorativos': {
    shippingCost: 10,
    installationCost: 25,
    installationTimeMinutes: 20,
    requiresInstallation: false,
    installationComplexity: 1
  },
  
  // Mesas de Mezcla - Complejo
  'Mesas de Mezcla para Directo': {
    shippingCost: 20,
    installationCost: 100,
    installationTimeMinutes: 60,
    requiresInstallation: true,
    installationComplexity: 3
  },
  
  // Default para categorías no especificadas
  'DEFAULT': {
    shippingCost: 10,
    installationCost: 30,
    installationTimeMinutes: 20,
    requiresInstallation: false,
    installationComplexity: 1
  }
};

async function updateShippingCosts() {
  console.log('🚀 Actualizando costes de envío y montaje...\n');

  try {
    // Obtener todos los productos con sus categorías
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });

    console.log(`📦 Encontrados ${products.length} productos\n`);

    let updated = 0;

    for (const product of products) {
      const categoryName = product.category.name;
      const costs = CATEGORY_COSTS[categoryName] || CATEGORY_COSTS['DEFAULT'];

      await prisma.product.update({
        where: { id: product.id },
        data: {
          shippingCost: costs.shippingCost,
          installationCost: costs.installationCost,
          installationTimeMinutes: costs.installationTimeMinutes,
          requiresInstallation: costs.requiresInstallation,
          installationComplexity: costs.installationComplexity
        }
      });

      console.log(`✅ ${product.name}`);
      console.log(`   Categoría: ${categoryName}`);
      console.log(`   Envío: €${costs.shippingCost} | Montaje: €${costs.installationCost}`);
      console.log(`   Tiempo: ${costs.installationTimeMinutes}min | Complejidad: ${costs.installationComplexity}`);
      console.log('');

      updated++;
    }

    console.log(`\n🎉 ¡Completado! ${updated} productos actualizados`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateShippingCosts();
