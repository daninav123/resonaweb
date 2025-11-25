import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SKUMapping {
  oldSku: string;
  newSku: string;
  productName: string;
  category: string;
  brand: string;
  model: string;
}

/**
 * Extraer marca y modelo del nombre del producto
 * Ejemplos:
 * - "Altavoz JBL EON615" -> brand: "JBL", model: "EON615"
 * - "Mesa Rectangular 180x80cm" -> brand: "MESA", model: "RECTANGULAR-180X80"
 * - "Foco LED Cameo ZENIT" -> brand: "CAMEO", model: "ZENIT"
 */
function extractBrandAndModel(productName: string): { brand: string; model: string } {
  // Limpiar el nombre
  const cleaned = productName.trim();
  
  // Patrones comunes
  const words = cleaned.split(' ');
  
  // Si tiene al menos 2 palabras
  if (words.length >= 2) {
    // La primera palabra suele ser tipo de producto, la segunda marca
    const brand = words[1].toUpperCase();
    const model = words.slice(2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Si no hay modelo, usar la primera palabra
    if (!model) {
      return {
        brand: words[0].toUpperCase().replace(/[^A-Z0-9-]/g, ''),
        model: words[1].toUpperCase().replace(/[^A-Z0-9-]/g, '')
      };
    }
    
    return { brand, model: model || brand };
  }
  
  // Si solo tiene una palabra
  return {
    brand: words[0].toUpperCase().replace(/[^A-Z0-9-]/g, ''),
    model: 'STD'
  };
}

/**
 * Normalizar nombre de categoría para SKU
 */
function normalizeCategoryForSKU(categoryName: string): string {
  const normalized = categoryName
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Abreviaturas comunes
  const abbreviations: { [key: string]: string } = {
    'SONIDO': 'SND',
    'ILUMINACION': 'LUZ',
    'FOTOGRAFIA-Y-VIDEO': 'FV',
    'FOTOGRAFIA': 'FOTO',
    'VIDEO': 'VID',
    'MOBILIARIO': 'MOB',
    'ELEMENTOS-DECORATIVOS': 'DEC',
    'DECORATIVOS': 'DEC',
    'MICROFONIA': 'MIC',
    'EQUIPOS-DE-SONIDO': 'SND',
    'ALTAVOCES': 'SPK',
    'MESAS': 'MESA',
    'SILLAS': 'SILLA',
  };
  
  return abbreviations[normalized] || normalized.substring(0, 6);
}

/**
 * Generar nuevo SKU en formato CATEGORIA-MARCA-MODELO
 */
function generateNewSKU(categoryName: string, productName: string): string {
  const category = normalizeCategoryForSKU(categoryName);
  const { brand, model } = extractBrandAndModel(productName);
  
  return `${category}-${brand}-${model}`;
}

/**
 * Script principal
 */
async function reorganizeSKUs() {
  console.log('🔄 Iniciando reorganización de SKUs...\n');
  
  try {
    // 1. Obtener todos los productos con sus categorías
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📦 Se encontraron ${products.length} productos\n`);
    
    // 2. Generar mappings de SKU
    const mappings: SKUMapping[] = [];
    const skuCounts: { [key: string]: number } = {};
    
    for (const product of products) {
      const categoryName = product.category?.name || 'GENERAL';
      const newBaseSKU = generateNewSKU(categoryName, product.name);
      
      // Manejar duplicados añadiendo sufijo numérico
      let newSKU = newBaseSKU;
      if (skuCounts[newBaseSKU]) {
        skuCounts[newBaseSKU]++;
        newSKU = `${newBaseSKU}-${skuCounts[newBaseSKU]}`;
      } else {
        skuCounts[newBaseSKU] = 1;
      }
      
      const { brand, model } = extractBrandAndModel(product.name);
      
      mappings.push({
        oldSku: product.sku,
        newSku: newSKU,
        productName: product.name,
        category: categoryName,
        brand,
        model
      });
    }
    
    // 3. Mostrar preview de cambios
    console.log('📋 PREVIEW DE CAMBIOS:\n');
    console.log('─'.repeat(120));
    console.log('OLD SKU'.padEnd(20) + ' → ' + 'NEW SKU'.padEnd(30) + ' | ' + 'PRODUCTO');
    console.log('─'.repeat(120));
    
    mappings.forEach(mapping => {
      console.log(
        mapping.oldSku.padEnd(20) + 
        ' → ' + 
        mapping.newSku.padEnd(30) + 
        ' | ' + 
        mapping.productName
      );
    });
    
    console.log('─'.repeat(120));
    console.log(`\n📊 Total de cambios: ${mappings.length}`);
    
    // 4. Preguntar confirmación (en producción, aquí habría un prompt)
    const shouldUpdate = process.argv.includes('--apply');
    
    if (!shouldUpdate) {
      console.log('\n⚠️  MODO PREVIEW - No se aplicarán cambios');
      console.log('💡 Para aplicar los cambios, ejecuta: npm run reorganize-skus -- --apply\n');
      return;
    }
    
    // 5. Aplicar cambios
    console.log('\n🔧 Aplicando cambios...\n');
    
    let updated = 0;
    let errors = 0;
    
    for (const mapping of mappings) {
      try {
        await prisma.product.update({
          where: { sku: mapping.oldSku },
          data: {
            sku: mapping.newSku,
            // Guardar SKU antiguo en un campo de metadata si existe
            // metadata: JSON.stringify({ oldSku: mapping.oldSku })
          }
        });
        updated++;
        console.log(`✅ ${mapping.oldSku} → ${mapping.newSku}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error actualizando ${mapping.oldSku}:`, error);
      }
    }
    
    console.log(`\n✨ Proceso completado:`);
    console.log(`   ✅ Actualizados: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    
  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
reorganizeSKUs()
  .then(() => {
    console.log('\n✅ Script finalizado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
