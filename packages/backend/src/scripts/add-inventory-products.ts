import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // ============================================
  // SONIDO
  // ============================================
  {
    name: 'DAS Audio 515A',
    slug: 'das-audio-515a',
    description: 'Altavoz activo de alta potencia DAS Audio 515A, ideal para eventos profesionales. Sistema de 2 vías con 1500W de potencia.',
    category: 'sonido',
    pricePerDay: 85,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    features: ['1500W potencia', '2 vías', 'Procesador DSP', 'SPL máx 135dB'],
  },
  {
    name: 'ICOA 12A Blanco',
    slug: 'icoa-12a-blanco',
    description: 'Altavoz activo ICOA de 12 pulgadas en acabado blanco. Perfecto para instalaciones elegantes y eventos corporativos.',
    category: 'sonido',
    pricePerDay: 65,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1545486332-9e0999c535b2?w=800',
    features: ['12" woofer', 'Acabado blanco', '1000W', 'Entrada XLR/Jack'],
  },
  {
    name: 'ICOA 15A Negro',
    slug: 'icoa-15a-negro',
    description: 'Altavoz activo ICOA de 15 pulgadas en acabado negro. Mayor potencia y graves profundos para eventos de gran escala.',
    category: 'sonido',
    pricePerDay: 75,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
    features: ['15" woofer', 'Acabado negro', '1200W', 'Control remoto'],
  },
  {
    name: 'DAS Audio 215A',
    slug: 'das-audio-215a',
    description: 'Subwoofer activo DAS Audio 215A de doble 15". Graves potentes y definidos para complementar tu sistema de sonido.',
    category: 'sonido',
    pricePerDay: 95,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1614963366795-e5c8f2c4c1c5?w=800',
    features: ['Doble 15"', '2000W', 'Respuesta 35Hz-150Hz', 'Amplificador Clase D'],
  },
  {
    name: 'DAS Audio 218A Subwoofer',
    slug: 'das-audio-218a-sub',
    description: 'Subwoofer de alta gama DAS Audio 218A con doble 18". Máxima potencia y calidad en graves para eventos premium.',
    category: 'sonido',
    pricePerDay: 125,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',
    features: ['Doble 18"', '3200W pico', 'Respuesta 30Hz-120Hz', 'SPL 138dB'],
  },
  {
    name: 'Altavoz Pasivo 10"',
    slug: 'altavoz-pasivo-10',
    description: 'Altavoz pasivo de 10 pulgadas, versátil y compacto. Ideal para monitores de escenario o sistemas secundarios.',
    category: 'sonido',
    pricePerDay: 35,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1590659174768-ea5e573e5c33?w=800',
    features: ['10" woofer', 'Pasivo', '400W programa', 'Múltiples aplicaciones'],
  },

  // ============================================
  // ILUMINACIÓN
  // ============================================
  {
    name: 'Moving Head 3en1 17R',
    slug: 'moving-head-3en1-17r',
    description: 'Cabeza móvil profesional 3 en 1 con lámpara 17R (350W). Beam, Spot y Wash en un solo equipo. Prisma rotatorio.',
    category: 'iluminacion',
    pricePerDay: 95,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1519874179391-3ebc752241dd?w=800',
    features: ['17R 350W', 'Beam/Spot/Wash', 'Prisma 8+16 facetas', 'Zoom 5-45°'],
  },
  {
    name: 'Moving Head Beam 7R',
    slug: 'moving-head-beam-7r',
    description: 'Moving head tipo beam con lámpara 7R (230W). Haz de luz concentrado y potente para efectos espectaculares.',
    category: 'iluminacion',
    pricePerDay: 75,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    features: ['7R 230W', 'Beam concentrado', '14 colores + blanco', 'Prisma 3 facetas'],
  },
  {
    name: 'Mini Beam LED',
    slug: 'mini-beam-led',
    description: 'Mini cabeza móvil tipo beam LED. Compacta y eficiente, perfecta para eventos pequeños y medianos.',
    category: 'iluminacion',
    pricePerDay: 45,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
    features: ['LED 60W', 'Compacto', '8 colores', 'DMX 512'],
  },
  {
    name: 'Mini Wash LED RGBW',
    slug: 'mini-wash-led-rgbw',
    description: 'Mini cabeza móvil wash LED RGBW. Mezcla de colores suave y uniforme con tecnología LED de última generación.',
    category: 'iluminacion',
    pricePerDay: 45,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?w=800',
    features: ['LED RGBW 80W', 'Mezcla colores', 'Zoom motorizado', 'Silencioso'],
  },
  {
    name: 'Foco Spot Pequeño',
    slug: 'foco-spot-pequeno',
    description: 'Foco tipo spot compacto para iluminación puntual. Ideal para destacar elementos específicos en el escenario.',
    category: 'iluminacion',
    pricePerDay: 25,
    stock: 3,
    imageUrl: 'https://images.unsplash.com/photo-1478940020726-e9e191651f1a?w=800',
    features: ['LED 50W', 'Haz concentrado', 'Regulable', 'Montaje versátil'],
  },
  {
    name: 'Ventilador LED RGB',
    slug: 'ventilador-led-rgb',
    description: 'Efecto de iluminación tipo ventilador con LED RGB. Crea impactantes efectos giratorios de luz y color.',
    category: 'iluminacion',
    pricePerDay: 55,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
    features: ['LED RGB', 'Efecto rotatorio', 'DMX/Auto/Sound', 'Bajo consumo'],
  },
  {
    name: 'Flash Estroboscópico RGB 1000W',
    slug: 'flash-rgb-1000w',
    description: 'Flash estroboscópico LED RGB de alta potencia (1000W). Efectos explosivos de luz para momentos clave del evento.',
    category: 'iluminacion',
    pricePerDay: 65,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
    features: ['1000W LED', 'RGB full color', 'Velocidad variable', 'Control DMX'],
  },
  {
    name: 'Foco LED RGB Decoración',
    slug: 'foco-led-rgb-decoracion',
    description: 'Foco LED RGB para iluminación decorativa y ambiental. Compacto, versátil y bajo consumo.',
    category: 'iluminacion',
    pricePerDay: 15,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
    features: ['LED RGB 18W', 'Control remoto', 'Múltiples modos', 'Batería opcional'],
  },

  // ============================================
  // ESTRUCTURAS
  // ============================================
  {
    name: 'Truss Aluminio 1m',
    slug: 'truss-aluminio-1m',
    description: 'Truss de aluminio de 1 metro. Estructura ligera y resistente para montaje de equipos de iluminación y sonido.',
    category: 'elementos-escenario',
    pricePerDay: 12,
    stock: 7,
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    features: ['Aluminio 6061', '29cm x 29cm', 'Carga 250kg', 'Sistema rápido'],
  },
  {
    name: 'Truss Aluminio 2m',
    slug: 'truss-aluminio-2m',
    description: 'Truss de aluminio de 2 metros. Mayor longitud para estructuras más amplias manteniendo la resistencia.',
    category: 'elementos-escenario',
    pricePerDay: 20,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
    features: ['Aluminio 6061', '29cm x 29cm', 'Carga 250kg', '2 metros'],
  },
  {
    name: 'Base para Truss',
    slug: 'base-truss',
    description: 'Base de soporte para estructuras truss. Sistema de montaje estable y seguro para tus instalaciones.',
    category: 'elementos-escenario',
    pricePerDay: 15,
    stock: 6,
    imageUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
    features: ['Acero reforzado', 'Estabilidad máxima', 'Regulable', 'Patas ajustables'],
  },
  {
    name: 'Top para Estructura',
    slug: 'top-estructura',
    description: 'Elemento superior para cerrar estructuras truss. Acabado profesional y seguridad en el montaje.',
    category: 'elementos-escenario',
    pricePerDay: 18,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    features: ['Aluminio', 'Universal', 'Sistema seguro', 'Acabado perfecto'],
  },
  {
    name: 'Semicírculo Truss 4m Diámetro',
    slug: 'semicirculo-truss-4m',
    description: 'Estructura semicircular de truss con 4 metros de diámetro. Diseño espectacular para eventos especiales.',
    category: 'elementos-escenario',
    pricePerDay: 85,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
    features: ['Diámetro 4m', 'Semicircular', 'Montaje modular', 'Gran impacto visual'],
  },
  {
    name: 'Cubo Truss',
    slug: 'cubo-truss',
    description: 'Estructura cúbica de truss. Elemento decorativo y funcional para crear puntos focales en el evento.',
    category: 'elementos-escenario',
    pricePerDay: 65,
    stock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    features: ['Estructura cúbica', 'Versátil', 'Montaje rápido', 'Efecto visual único'],
  },
  {
    name: 'Mesa Plegable DJ 2x1m',
    slug: 'mesa-dj-2x1',
    description: 'Mesa plegable profesional para DJ de 2x1 metros. Superficie amplia y estable para equipamiento.',
    category: 'mobiliario',
    pricePerDay: 35,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
    features: ['2m x 1m', 'Plegable', 'Estructura reforzada', 'Acabado profesional'],
  },
  {
    name: 'Pata Telescópica 1m',
    slug: 'pata-telescopica-1m',
    description: 'Pata telescópica ajustable hasta 1 metro. Sistema de soporte versátil para múltiples aplicaciones.',
    category: 'elementos-escenario',
    pricePerDay: 8,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
    features: ['Ajustable', 'Hasta 1m', 'Carga 50kg', 'Base estable'],
  },

  // ============================================
  // ELEMENTOS DECORATIVOS
  // ============================================
  {
    name: 'Cabina DJ Palets',
    slug: 'cabina-dj-palets',
    description: 'Cabina para DJ con diseño estilo palets. Look industrial y moderno perfecto para eventos trendy.',
    category: 'elementos-decorativos',
    pricePerDay: 95,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    features: ['Diseño palets', 'Industrial', 'Amplio espacio', 'Acabado natural'],
  },
  {
    name: 'Cabina DJ Jardín',
    slug: 'cabina-dj-jardin',
    description: 'Cabina para DJ con acabado tipo jardín. Ideal para eventos al aire libre y bodas campestres.',
    category: 'elementos-decorativos',
    pricePerDay: 95,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    features: ['Acabado jardín', 'Eventos outdoor', 'Decoración integrada', 'Estilo natural'],
  },
  {
    name: 'Letras Luminosas',
    slug: 'letras-luminosas',
    description: 'Letras luminosas decorativas personalizables. Crea mensajes únicos e impactantes para tu evento.',
    category: 'elementos-decorativos',
    pricePerDay: 125,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800',
    features: ['LED integrado', 'Personalizable', 'Gran impacto', 'Bajo consumo'],
  },

  // ============================================
  // MICROFONÍA Y MEZCLA
  // ============================================
  {
    name: 'Micrófono Audibax Missouri 58',
    slug: 'microfono-audibax-58',
    description: 'Micrófono dinámico Audibax Missouri 58. Calidad profesional tipo Shure SM58, ideal para voces.',
    category: 'microfonia',
    pricePerDay: 12,
    stock: 4,
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
    features: ['Dinámico', 'Patrón cardioide', 'Rango 50Hz-15kHz', 'Cable XLR incluido'],
  },
  {
    name: 'Micrófono Audibax Missouri 57',
    slug: 'microfono-audibax-57',
    description: 'Micrófono dinámico Audibax Missouri 57. Perfecto para instrumentos y amplificadores.',
    category: 'microfonia',
    pricePerDay: 12,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800',
    features: ['Dinámico', 'Cardioide', 'Versátil', 'Alta presión sonora'],
  },
  {
    name: 'Micrófono Behringer BA 19A',
    slug: 'microfono-behringer-ba19a',
    description: 'Micrófono condensador Behringer BA 19A. Ideal para grabación y sonido en vivo de alta calidad.',
    category: 'microfonia',
    pricePerDay: 15,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800',
    features: ['Condensador', 'Phantom power', 'Baja frecuencia 40Hz', 'Sensibilidad -38dB'],
  },
  {
    name: 'Micrófono Inalámbrico Simple',
    slug: 'microfono-inalambrico-simple',
    description: 'Sistema de micrófono inalámbrico UHF de un canal. Libertad de movimiento sin cables.',
    category: 'microfonia',
    pricePerDay: 35,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800',
    features: ['UHF', 'Alcance 50m', 'Batería recargable', 'Receptor incluido'],
  },
  {
    name: 'Set Micrófonos Inalámbricos Dual',
    slug: 'set-microfonos-inalambricos-dual',
    description: 'Sistema de 2 micrófonos inalámbricos UHF. Ideal para presentadores, bodas y eventos con múltiples oradores.',
    category: 'microfonia',
    pricePerDay: 65,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
    features: ['2 canales UHF', 'Alcance 80m', '2 micros', 'Receptor doble'],
  },
  {
    name: 'Mezcladora Behringer X Air XR18',
    slug: 'mezcladora-behringer-xair-xr18',
    description: 'Mezcladora digital Behringer X Air XR18 de 18 canales. Control via tablet/smartphone, WiFi integrado.',
    category: 'microfonia',
    pricePerDay: 85,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
    features: ['18 canales', 'Control WiFi', 'Efectos integrados', 'Grabación USB'],
  },
  {
    name: 'Mezcladora Soundcraft',
    slug: 'mezcladora-soundcraft',
    description: 'Mezcladora analógica Soundcraft. Calidad británica legendaria, controles intuitivos y sonido cálido.',
    category: 'microfonia',
    pricePerDay: 75,
    stock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
    features: ['Analógica', 'Pre-amps Soundcraft', 'EQ 4 bandas', 'Construcción robusta'],
  },
];

async function main() {
  console.log('🚀 Iniciando importación de productos...\n');

  // Obtener todas las categorías
  const categories = await prisma.category.findMany();
  console.log(`📂 Categorías encontradas: ${categories.length}\n`);

  const categoryMap: { [key: string]: string } = {};
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id;
  });

  let created = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const categoryId = categoryMap[product.category];
      
      if (!categoryId) {
        console.log(`⚠️  Categoría "${product.category}" no encontrada para: ${product.name}`);
        errors++;
        continue;
      }

      // Verificar si ya existe
      const existing = await prisma.product.findUnique({
        where: { slug: product.slug }
      });

      if (existing) {
        console.log(`⏭️  Ya existe: ${product.name}`);
        continue;
      }

      // Generar SKU único
      const sku = `SKU-${product.slug.toUpperCase().substring(0, 15)}-${Date.now().toString().substring(8)}`;
      
      // Calcular precios
      const pricePerWeekend = product.pricePerDay * 2.5; // 3 días con descuento
      const pricePerWeek = product.pricePerDay * 5; // 7 días con descuento

      // Crear el producto
      await prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          sku,
          description: product.description,
          categoryId,
          pricePerDay: product.pricePerDay,
          pricePerWeekend,
          pricePerWeek,
          customDeposit: product.pricePerDay * 2, // Depósito = 2x precio día
          stock: product.stock,
          realStock: product.stock,
          isActive: true,
          images: product.imageUrl ? [product.imageUrl] : [],
          specifications: product.features ? JSON.stringify({
            features: product.features
          }) : undefined
        }
      });

      console.log(`✅ Creado: ${product.name} (${product.stock} unidades)`);
      created++;
      
      // Pequeña pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      console.error(`❌ Error al crear ${product.name}:`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 RESUMEN:`);
  console.log(`   ✅ Productos creados: ${created}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📦 Total procesados: ${products.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Proceso completado!');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('💥 Error fatal:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
