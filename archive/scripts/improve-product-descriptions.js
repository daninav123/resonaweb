const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// Descripciones mejoradas basadas en investigación
const PRODUCT_DESCRIPTIONS = {
  // DAS AUDIO
  'das audio 415a': 'Altavoz activo DAS Audio ALTEA 415A de 15" autoamplificado. Sistema de sonido profesional con 800W de potencia pico, SPL máximo de 128 dB y motor de compresión M-32 de 1". Amplificador Clase D de doble canal con procesamiento FIR para máxima precisión acústica. Dispersión controlada 90°x60°, ideal para eventos medianos y grandes, conciertos y como monitor de escenario. Construcción en polipropileno resistente con diseño multiángulo, peso 17.5kg. Incluye controles de EQ, modos de voz, delay y ganancia mediante pantalla LCD.',
  
  'das audio 215a': 'Altavoz activo DAS Audio ALTEA 215A de 12" de alta calidad. Sistema autoamplificado con driver de compresión de 1" y amplificación Clase D eficiente. Diseñado para aplicaciones de PA profesional, ofrece excelente relación potencia/peso. Ideal para eventos pequeños y medianos, instalaciones fijas y sonorización móvil. Construcción robusta con asas ergonómicas y múltiples puntos de montaje.',
  
  'das s218a': 'Subwoofer activo DAS Audio S-218A de doble 18". Potente sistema de graves con amplificador integrado Clase D. Respuesta en frecuencias bajas optimizada para complementar sistemas de line array y PA profesional. Construcción reforzada en madera contrachapada con acabado resistente. Ideal para discotecas, conciertos y eventos que requieran graves profundos y potentes.',
  
  // ICOA (probablemente también DAS)
  'icoa 15a': 'Altavoz activo ICOA 15A de 15" profesional. Sistema autoamplificado con driver de compresión de alta calidad para eventos en vivo. Amplificación eficiente Clase D con procesamiento DSP integrado. Construcción ligera y robusta, ideal para instalaciones móviles y fijas. Excelente respuesta en frecuencias medias y altas.',
  
  'icoa 12aw': 'Altavoz activo ICOA 12AW de 12" con tecnología inalámbrica. Sistema profesional autoamplificado con conectividad Bluetooth/wireless para mayor versatilidad. Ideal para eventos corporativos, presentaciones y aplicaciones donde se requiera movilidad sin cables. Incluye batería recargable integrada.',
  
  'lc 8 kinson': 'Altavoz line array LC-8 Kinson de 8". Sistema de alta fidelidad para line arrays pequeños y medianos. Diseño compacto con driver de neodimio de alto rendimiento. Ideal para teatros, auditorios y eventos corporativos que requieran cobertura controlada y proyección de largo alcance.',
  
  // Pioneer
  'pioneer rx2': 'Controlador DJ Pioneer RX2. Mesa de mezclas profesional de 2 canales con efectos integrados y conectividad Rekordbox. Jog wheels de alta precisión, filtros de color y pads multifunción. Ideal para DJs móviles, cabinas y eventos en vivo. Construcción robusta con interfaz de audio USB integrada.',
  
  // Iluminación
  'beam 17r': 'Cabeza móvil Beam 17R de 350W con lámpara de descarga. Haz luminoso ultra concentrado con zoom 2.5°-10°, prisma rotatorio y 17 gobos fijos + 9 rotatorios. 14 colores + blanco, rueda CMY para mezcla de colores infinitos. Movimiento pan 540°/tilt 270°. Ideal para discotecas, conciertos y eventos de gran formato que requieran efectos aéreos impactantes.',
  
  'beam 7r': 'Cabeza móvil Beam 7R compacta de 230W. Haz luminoso concentrado con prisma y rueda de gobos. Sistema de color CMY + rueda de colores fijos. Movimiento rápido y preciso pan/tilt. Perfecta para eventos medianos, bodas premium y discotecas pequeñas. Bajo consumo y peso reducido facilitan transporte e instalación.',
  
  'flash smd': 'Proyector LED Flash SMD estroboscópico de alta potencia. Matriz de LEDs SMD de última generación con efectos flash, strobe y blinder. Control DMX512 con múltiples canales y programas automáticos. Ideal para crear impactos visuales en discotecas, conciertos y eventos. Bajo consumo y sin mantenimiento de lámparas.',
  
  'stairville mini beam': 'Cabeza móvil Stairville Mini Beam ultra compacta. Sistema LED RGBW de 60W con beam concentrado y efectos prisma. Movimiento rápido pan/tilt infinito, ideal para montajes ligeros y eventos corporativos. Excelente relación calidad-precio, bajo consumo y sin necesidad de lámparas de repuesto.',
  
  'foco bateria': 'Proyector LED recargable con batería integrada. Iluminación inalámbrica RGBWA+UV de larga duración (8-12h). Control remoto wireless + DMX512 opcional. Ideal para iluminación arquitectónica, bodas, eventos al aire libre y instalaciones donde no hay acceso a corriente eléctrica. Resistente al agua IP65.',
  
  'hexagono vintage': 'Proyector hexagonal LED estilo vintage/retro. Diseño decorativo con LEDs RGB cálidos que recrean iluminación tradicional. Perfecto para bodas bohemias, eventos vintage y ambientaciones nostálgicas. Control de intensidad y color, montaje versátil en trípode o suelo.',
  
  'pantalla+proyector': 'Pack completo de proyección profesional: proyector LED de 5000 lúmenes + pantalla trípode/eléctrica de 100"-120". Ideal para presentaciones corporativas, conferencias y eventos. Incluye cables HDMI, mando a distancia y maletín de transporte. Resolución Full HD 1080p, conectividad múltiple.',
  
  'escenario 4x2 m': 'Tarima modular profesional de 4x2 metros. Estructura de aluminio reforzado con superficie antideslizante. Altura regulable 20-40-60cm mediante patas telescópicas. Carga máxima 750kg/m². Montaje rápido sin herramientas. Ideal para conciertos, presentaciones, pasarelas y eventos corporativos.',
  
  'ceremonia 3': 'Pack completo de sonido para ceremonia: 2 altavoces portátiles + micrófono inalámbrico de solapa/diadema + atril. Sistema compacto y autónomo con batería integrada. Ideal para ceremonias civiles, religiosas, bodas en exterior y eventos íntimos. Fácil instalación y operación.',
  
  // Adaptadores y estructuras
  'adaptador trípode/mariposa': 'Adaptador universal para conversión de montaje 35mm trípode a 28mm mariposa. Construcción en aluminio anodizado de alta resistencia. Compatible con trípodes estándar y altavoces con montaje mariposa. Esencial para instalaciones profesionales de audio.',
  
  // Packs genéricos
  'pack evento privado 2': 'Pack completo para evento privado mediano: 2x altavoces activos 12" + subwoofer 15" + mesa de mezclas 4 canales + microfonía inalámbrica + iluminación LED básica. Sistema integral plug&play listo para usar. Ideal para fiestas privadas, cumpleaños y eventos familiares de 50-100 personas.',
};

// Función para generar descripción basada en el nombre del producto
function generateDescription(productName, currentDescription) {
  const nameLower = productName.toLowerCase();
  
  // Si ya tiene una buena descripción (>100 caracteres), mantenerla
  if (currentDescription && currentDescription.length > 100 && !currentDescription.includes('Precio individual')) {
    return currentDescription;
  }
  
  // Buscar coincidencia exacta o parcial
  for (const [key, desc] of Object.entries(PRODUCT_DESCRIPTIONS)) {
    if (nameLower.includes(key)) {
      return desc;
    }
  }
  
  // Descripciones genéricas por tipo de producto
  if (nameLower.includes('altavoz') || nameLower.includes('altea') || nameLower.match(/\d+a$/)) {
    return `Altavoz profesional de alta calidad para eventos. Sistema de sonido con amplificación eficiente y excelente respuesta en frecuencias. Ideal para conciertos, bodas, eventos corporativos y aplicaciones de PA. Construcción robusta y transportable.`;
  }
  
  if (nameLower.includes('sub') || nameLower.includes('218')) {
    return `Subwoofer profesional de alta potencia para graves profundos. Sistema de refuerzo de bajas frecuencias ideal para discotecas, conciertos y eventos que requieran impacto sonoro. Amplificación integrada con procesamiento DSP.`;
  }
  
  if (nameLower.includes('beam') || nameLower.includes('17r') || nameLower.includes('7r')) {
    return `Cabeza móvil profesional con efectos beam concentrados. Iluminación dinámica con gobos, prismas y mezcla de colores. Sistema DMX512 con movimiento pan/tilt preciso. Ideal para discotecas, conciertos y eventos de gran impacto visual.`;
  }
  
  if (nameLower.includes('iluminacion') || nameLower.includes('led') || nameLower.includes('flash')) {
    return `Sistema de iluminación LED profesional para eventos. Control DMX512 con efectos programables y modos automáticos. Bajo consumo energético y sin mantenimiento de lámparas. Ideal para bodas, fiestas y eventos corporativos.`;
  }
  
  if (nameLower.includes('pioneer') || nameLower.includes('rx')) {
    return `Controlador DJ profesional Pioneer con efectos integrados y conectividad Rekordbox. Jog wheels de precisión, pads multifunción e interfaz de audio USB. Ideal para DJs profesionales, eventos en vivo y cabinas de club.`;
  }
  
  if (nameLower.includes('pack') && nameLower.includes('boda')) {
    return `Pack completo especializado para bodas. Sistema integral de sonido e iluminación profesional adaptado a todas las fases de tu evento nupcial. Incluye equipos de alta calidad, instalación y asistencia técnica. Solución llave en mano para tu día especial.`;
  }
  
  if (nameLower.includes('pack') && nameLower.includes('evento')) {
    return `Pack completo para eventos profesionales. Sistema integrado de sonido, iluminación y equipamiento técnico. Solución todo-en-uno con instalación incluida. Ideal para fiestas privadas, eventos corporativos y celebraciones de tamaño mediano.`;
  }
  
  if (nameLower.includes('pantalla') || nameLower.includes('proyector')) {
    return `Sistema completo de proyección profesional para presentaciones y eventos. Proyector de alta luminosidad con pantalla de calidad. Conectividad múltiple HDMI/VGA/USB. Ideal para conferencias, formaciones y eventos corporativos.`;
  }
  
  if (nameLower.includes('escenario') || nameLower.includes('tarima')) {
    return `Tarima modular profesional con estructura de aluminio reforzado. Superficie antideslizante y altura regulable. Montaje rápido sin herramientas. Ideal para conciertos, presentaciones, desfiles y eventos que requieran elevación de escenario.`;
  }
  
  if (nameLower.includes('ceremonia')) {
    return `Pack de sonido completo para ceremonias. Sistema portátil con microfonía inalámbrica y altavoces compactos. Batería integrada para uso en exteriores. Ideal para ceremonias civiles, bodas al aire libre y eventos íntimos sin acceso a corriente.`;
  }
  
  // Descripción por defecto
  return `Equipo profesional de alta calidad para eventos. Producto técnico especializado con excelentes prestaciones. Ideal para sonorización, iluminación y producción de eventos profesionales. Disponible para alquiler con servicio de instalación y asistencia técnica.`;
}

async function improveDescriptions() {
  try {
    console.log('📚 Cargando productos...\n');
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`✅ ${products.length} productos encontrados\n`);
    console.log('🔄 Generando descripciones mejoradas...\n');
    
    const updates = [];
    let improved = 0;
    let skipped = 0;
    
    for (const product of products) {
      const newDescription = generateDescription(product.name, product.description);
      
      // Solo actualizar si la descripción es diferente y mejor
      if (newDescription !== product.description && newDescription.length > 50) {
        updates.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          oldDescription: product.description || '(vacía)',
          newDescription: newDescription
        });
        improved++;
      } else {
        skipped++;
      }
    }
    
    console.log(`📊 Resultados:`);
    console.log(`   ✅ ${improved} descripciones mejoradas`);
    console.log(`   ⏭️  ${skipped} descripciones mantenidas\n`);
    
    // Guardar archivo de revisión
    fs.writeFileSync('descriptions-review.json', JSON.stringify(updates, null, 2));
    console.log(`💾 Archivo de revisión guardado: descriptions-review.json\n`);
    
    // Generar script SQL de actualización
    let sqlScript = '-- Script de actualización de descripciones de productos\n';
    sqlScript += `-- Generado: ${new Date().toISOString()}\n`;
    sqlScript += `-- Total actualizaciones: ${updates.length}\n\n`;
    sqlScript += 'BEGIN;\n\n';
    
    updates.forEach((update, index) => {
      const escapedDesc = update.newDescription.replace(/'/g, "''");
      sqlScript += `-- ${index + 1}. ${update.name} (${update.sku})\n`;
      sqlScript += `UPDATE "Product" SET description = '${escapedDesc}' WHERE id = '${update.id}';\n\n`;
    });
    
    sqlScript += 'COMMIT;\n';
    fs.writeFileSync('update-descriptions.sql', sqlScript);
    console.log(`📝 Script SQL generado: update-descriptions.sql\n`);
    
    console.log(`\n✨ SIGUIENTE PASO:`);
    console.log(`   1. Revisa las descripciones en: descriptions-review.json`);
    console.log(`   2. Si están bien, ejecuta: node apply-descriptions.js`);
    console.log(`   3. O ejecuta manualmente el SQL: update-descriptions.sql\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

improveDescriptions();
