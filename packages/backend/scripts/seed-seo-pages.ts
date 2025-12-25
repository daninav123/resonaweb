/**
 * Script para agregar páginas de servicios al modelo SeoPage
 * Esto hará que aparezcan en el sitemap.xml dinámico
 * 
 * Ejecutar con: npx tsx scripts/seed-seo-pages.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seoPages = [
  // Páginas principales
  {
    slug: '',
    title: 'Resona Events - Alquiler de Material para Eventos en Valencia',
    description: 'Alquiler profesional de equipos de sonido, iluminación, fotografía y video para eventos en Valencia. Bodas, conciertos, conferencias y eventos corporativos.',
    keywords: ['alquiler sonido valencia', 'alquiler iluminación valencia', 'alquiler material eventos valencia', 'equipos audiovisuales valencia'],
    priority: 1.0,
    changefreq: 'daily',
  },
  {
    slug: 'productos',
    title: 'Catálogo de Productos - Alquiler de Material para Eventos | ReSona',
    description: 'Catálogo completo de equipos de sonido, iluminación, audiovisuales para alquilar en Valencia. Precios competitivos y disponibilidad online.',
    keywords: ['catálogo alquiler valencia', 'productos alquiler eventos', 'equipos audiovisuales valencia'],
    priority: 0.95,
    changefreq: 'daily',
  },
  {
    slug: 'blog',
    title: 'Blog - Consejos para Eventos y Alquiler de Material | ReSona',
    description: 'Guías, consejos y novedades sobre alquiler de material audiovisual para eventos en Valencia.',
    keywords: ['blog eventos valencia', 'consejos alquiler sonido', 'guías eventos valencia'],
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    slug: 'calculadora-evento',
    title: 'Calculadora de Presupuesto para Eventos Valencia | ReSona Events',
    description: 'Calculadora online gratuita para presupuesto de alquiler de equipos de eventos en Valencia. Presupuesto instantáneo.',
    keywords: ['calculadora presupuesto eventos valencia', 'presupuesto boda valencia', 'calcular alquiler sonido'],
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    slug: 'contacto',
    title: 'Contacto Valencia - Presupuesto para Eventos | ReSona Events',
    description: 'Contáctanos en Valencia para presupuesto personalizado. Respuesta en 24h. Teléfono: +34 613881414',
    keywords: ['contacto resona valencia', 'presupuesto alquiler equipos valencia'],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    slug: 'faqs',
    title: 'Preguntas Frecuentes (FAQs) | ReSona Events',
    description: 'Resolvemos dudas frecuentes sobre alquiler de equipos para eventos: reservas, transporte, montaje.',
    keywords: ['faqs alquiler equipos', 'preguntas alquiler sonido valencia'],
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    slug: 'sobre-nosotros',
    title: 'Sobre Nosotros - ReSona Events Valencia',
    description: 'Empresa de alquiler de material audiovisual profesional en Valencia con más de 15 años de experiencia.',
    keywords: ['resona events', 'empresa alquiler valencia', 'sobre nosotros'],
    priority: 0.7,
    changefreq: 'monthly',
  },

  // Páginas de servicios (23 páginas)
  {
    slug: 'servicios/alquiler-sonido-valencia',
    title: 'Alquiler Sonido Valencia 🔊 Desde 35€/día | Eventos, Bodas, Fiestas',
    description: 'Alquiler de sonido profesional en Valencia. Equipos JBL, QSC, Yamaha. Instalación GRATIS. 15 años experiencia. ☎️ 613881414',
    keywords: ['alquiler sonido valencia', 'alquiler equipos audio valencia', 'sonido profesional valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/sonido-bodas-valencia',
    title: 'Sonido para Bodas en Valencia | Alquiler Equipos Profesionales',
    description: 'Alquiler de sonido profesional para bodas en Valencia. Ceremonia, banquete y fiesta. Microfonía inalámbrica y técnico incluido. ☎️ 613881414',
    keywords: ['sonido bodas valencia', 'alquiler sonido boda valencia', 'microfono boda valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-dj-valencia',
    title: 'Alquiler DJ Valencia | Equipos Pioneer XDJ-RX2 desde 80€/día',
    description: 'Alquiler de equipos DJ profesionales en Valencia. Pioneer XDJ-RX2, CDJ-2000NXS2, controladores. ☎️ 613881414',
    keywords: ['alquiler dj valencia', 'equipos dj valencia', 'pioneer valencia'],
    priority: 0.90,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-altavoces-profesionales',
    title: 'Alquiler Altavoces Profesionales Valencia | JBL, QSC desde 35€/día',
    description: 'Alquiler de altavoces profesionales en Valencia. JBL, QSC, D.A.S Audio. Line array, monitores, subwoofers. ☎️ 613881414',
    keywords: ['alquiler altavoces valencia', 'altavoces profesionales valencia', 'jbl valencia'],
    priority: 0.90,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/iluminacion-led-profesional',
    title: 'Iluminación LED Profesional Valencia | Alquiler desde 25€/día',
    description: 'Alquiler de iluminación LED profesional en Valencia. Moving heads, PAR LED, focos, efectos. ☎️ 613881414',
    keywords: ['iluminación led valencia', 'alquiler luces valencia', 'moving heads valencia'],
    priority: 0.90,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-iluminacion-bodas',
    title: 'Iluminación para Bodas Valencia | Alquiler desde 150€',
    description: 'Iluminación profesional para bodas en Valencia. LED RGB, uplights, primera danza. Técnico incluido. ☎️ 613881414',
    keywords: ['iluminación bodas valencia', 'luces boda valencia', 'uplights valencia'],
    priority: 0.90,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-pantallas-led',
    title: 'Alquiler Pantallas LED Valencia | Indoor/Outdoor desde 200€/día',
    description: 'Alquiler de pantallas LED profesionales en Valencia. P2.9, P3.91 indoor y outdoor. Conciertos, eventos. ☎️ 613881414',
    keywords: ['pantallas led valencia', 'alquiler pantallas eventos valencia', 'videowall valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-microfonos-inalambricos',
    title: 'Alquiler Micrófonos Inalámbricos Valencia | Shure, Sennheiser',
    description: 'Alquiler de micrófonos inalámbricos profesionales en Valencia. Shure, Sennheiser. Bodas, eventos. ☎️ 613881414',
    keywords: ['micrófonos inalámbricos valencia', 'alquiler microfonos valencia', 'shure valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-subwoofers',
    title: 'Alquiler Subwoofers Valencia | Potencia Extra desde 60€/día',
    description: 'Alquiler de subwoofers profesionales en Valencia. JBL, QSC, D.A.S. Graves potentes para eventos. ☎️ 613881414',
    keywords: ['subwoofers valencia', 'alquiler subwoofers valencia', 'graves potentes valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-mesa-mezcla-dj',
    title: 'Alquiler Mesa Mezclas DJ Valencia | Pioneer DJM desde 40€/día',
    description: 'Alquiler de mesas de mezclas DJ profesionales. Pioneer DJM-900NXS2, DJM-750, controladores. ☎️ 613881414',
    keywords: ['mesa mezclas dj valencia', 'alquiler djm valencia', 'pioneer djm valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/produccion-eventos-valencia',
    title: 'Producción Eventos Valencia | Desde 800€ | ReSona',
    description: 'Producción integral de eventos en Valencia. Sonido, iluminación, vídeo, streaming. +1000 eventos producidos. ☎️ 613881414',
    keywords: ['producción eventos valencia', 'eventos corporativos valencia', 'producción audiovisual valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/streaming-eventos-valencia',
    title: 'Streaming Eventos Valencia | Retransmisión Profesional',
    description: 'Servicio de streaming profesional para eventos en Valencia. Multicámara, mezcla en directo, YouTube Live. ☎️ 613881414',
    keywords: ['streaming eventos valencia', 'retransmisión eventos valencia', 'video streaming valencia'],
    priority: 0.85,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/alquiler-estructuras-truss',
    title: 'Alquiler Estructuras Truss Valencia | Montaje Profesional',
    description: 'Alquiler de estructuras truss para eventos en Valencia. Montaje profesional incluido. ☎️ 613881414',
    keywords: ['truss valencia', 'estructuras eventos valencia', 'alquiler truss valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/alquiler-laser',
    title: 'Alquiler Láser Valencia | Efectos Especiales para Eventos',
    description: 'Alquiler de láseres profesionales para eventos en Valencia. Efectos espectaculares. ☎️ 613881414',
    keywords: ['láser valencia', 'alquiler laser eventos valencia', 'efectos laser valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/alquiler-moving-heads',
    title: 'Alquiler Moving Heads Valencia | Iluminación Profesional',
    description: 'Alquiler de moving heads profesionales en Valencia. Beam 230W, Spot 250W. ☎️ 613881414',
    keywords: ['moving heads valencia', 'alquiler moving heads valencia', 'luces inteligentes valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/alquiler-proyectores',
    title: 'Alquiler Proyectores Valencia | Profesionales desde 80€/día',
    description: 'Alquiler de proyectores profesionales en Valencia. Full HD, 4K, alta luminosidad. ☎️ 613881414',
    keywords: ['proyectores valencia', 'alquiler proyectores valencia', 'proyección eventos valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/alquiler-maquinas-fx',
    title: 'Alquiler Máquinas FX Valencia | Humo, CO2, Confeti',
    description: 'Alquiler de máquinas de efectos especiales en Valencia. Humo, CO2, confeti, burbujas. ☎️ 613881414',
    keywords: ['máquinas fx valencia', 'humo valencia', 'efectos especiales valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/iluminacion-arquitectonica',
    title: 'Iluminación Arquitectónica Valencia | Fachadas y Espacios',
    description: 'Iluminación arquitectónica profesional en Valencia. Fachadas, monumentos, espacios singulares. ☎️ 613881414',
    keywords: ['iluminación arquitectónica valencia', 'iluminación fachadas valencia', 'uplighting valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/iluminacion-escenarios',
    title: 'Iluminación Escenarios Valencia | Profesional para Eventos',
    description: 'Iluminación profesional para escenarios en Valencia. Conciertos, teatro, eventos. ☎️ 613881414',
    keywords: ['iluminación escenarios valencia', 'luces escénicas valencia', 'iluminación teatro valencia'],
    priority: 0.80,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/produccion-tecnica-eventos',
    title: 'Producción Técnica Eventos Valencia | Servicio Completo',
    description: 'Producción técnica completa para eventos en Valencia. Sonido, iluminación, vídeo. ☎️ 613881414',
    keywords: ['producción técnica valencia', 'producción audiovisual valencia', 'eventos técnicos valencia'],
    priority: 0.85,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/sonido-eventos-corporativos',
    title: 'Sonido Eventos Corporativos Valencia | Profesional y Discreto',
    description: 'Sonido profesional para eventos corporativos en Valencia. Conferencias, presentaciones, galas. ☎️ 613881414',
    keywords: ['sonido corporativo valencia', 'sonido conferencias valencia', 'audio empresarial valencia'],
    priority: 0.85,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios/sonido-iluminacion-bodas-valencia',
    title: 'Sonido + Iluminación Bodas Valencia | Desde 850€ | ReSona',
    description: 'Sonido e iluminación para bodas Valencia desde 850€. Técnico incluido. +500 bodas realizadas. ☎️ 613881414',
    keywords: ['bodas valencia', 'sonido bodas valencia', 'iluminación bodas valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'servicios/bodas-valencia',
    title: 'Alquiler Equipos Bodas Valencia | Packs desde 850€ | ReSona',
    description: 'Alquiler de equipos completos para bodas en Valencia. Sonido, iluminación, DJ. Paquetes todo incluido. ☎️ 613881414',
    keywords: ['equipos bodas valencia', 'alquiler boda valencia', 'packs bodas valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },

  // Páginas de alquiler específicas
  {
    slug: 'alquiler-sonido-torrent',
    title: 'Alquiler Sonido Torrent | Equipos Profesionales | ReSona',
    description: 'Alquiler de sonido profesional en Torrent. Servicio completo con transporte e instalación. ☎️ 613881414',
    keywords: ['alquiler sonido torrent', 'sonido torrent', 'equipos audio torrent'],
    priority: 0.85,
    changefreq: 'monthly',
  },
];

async function seedSeoPages() {
  console.log('🌱 Iniciando seed de páginas SEO...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of seoPages) {
    try {
      // Verificar si ya existe
      const existing = await prisma.seoPage.findUnique({
        where: { slug: page.slug },
      });

      if (existing) {
        console.log(`⏭️  Página ya existe: ${page.slug || '(homepage)'}`);
        skipped++;
        continue;
      }

      // Crear página
      await prisma.seoPage.create({
        data: page,
      });

      console.log(`✅ Creada: ${page.slug || '(homepage)'} - Priority: ${page.priority}`);
      created++;
    } catch (error) {
      console.error(`❌ Error en: ${page.slug}`, error);
      errors++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Creadas: ${created}`);
  console.log(`   ⏭️  Omitidas (ya existen): ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📄 Total intentadas: ${seoPages.length}`);

  // Mostrar estadísticas finales
  const total = await prisma.seoPage.count();
  const active = await prisma.seoPage.count({ where: { isActive: true } });

  console.log('\n📈 Estado final:');
  console.log(`   Total páginas SEO en BD: ${total}`);
  console.log(`   Páginas activas: ${active}`);
  console.log('\n✨ Sitemap dinámico actualizado en: https://resonaevents.com/sitemap.xml');
}

// Ejecutar
seedSeoPages()
  .then(() => {
    console.log('\n✅ Seed completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
