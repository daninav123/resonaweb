import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEO_PAGES = [
  {
    slug: 'alquiler-altavoces-valencia',
    title: 'Alquiler de Altavoces Profesionales en Valencia | Desde 35€/día',
    description: 'Alquiler de altavoces profesionales en Valencia. JBL, QSC, Yamaha, Mackie. Desde 400W hasta 2000W. Activos y pasivos para eventos, bodas, fiestas. Entrega e instalación gratis. Presupuesto en 24h ☎️ 613881414',
    keywords: [
      'alquiler altavoces valencia',
      'alquiler altavoces profesionales valencia',
      'alquiler altavoces activos valencia',
      'alquiler altavoces eventos valencia',
      'alquiler PA valencia',
      'alquiler altavoces JBL valencia'
    ],
    priority: 0.98,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-sonido-valencia',
    title: 'Alquiler de Sonido Profesional en Valencia | ReSona Events',
    description: 'Alquiler de equipos de sonido profesional en Valencia. Altavoces, subwoofers, mesas de mezclas y microfonía para eventos, bodas y fiestas. Servicio técnico incluido. Presupuesto gratis en 24h. ☎️ 613881414',
    keywords: [
      'alquiler sonido valencia',
      'alquiler equipos sonido valencia',
      'sonido profesional valencia',
      'alquiler PA valencia',
      'sistema sonido eventos valencia'
    ],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-iluminacion-valencia',
    title: 'Alquiler de Iluminación Profesional en Valencia | ReSona Events',
    description: 'Alquiler de iluminación profesional para eventos en Valencia. Moving heads, LED PAR, focos robotizados, luces de discoteca. Desde 25€/día. Entrega gratis en Valencia. ☎️ 613881414',
    keywords: [
      'alquiler iluminacion valencia',
      'alquiler luces eventos valencia',
      'alquiler moving heads valencia',
      'iluminacion profesional valencia',
      'alquiler LED PAR valencia'
    ],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'sonido-bodas-valencia',
    title: 'Sonido Profesional para Bodas en Valencia | ReSona Events',
    description: 'Alquiler de sonido para bodas en Valencia. Sistemas completos, micrófonos inalámbricos, música ceremonia y banquete. Técnico incluido. Más de 200 bodas realizadas. ☎️ 613881414',
    keywords: [
      'sonido bodas valencia',
      'alquiler sonido bodas valencia',
      'equipo sonido boda valencia',
      'microfonos boda valencia',
      'musica boda valencia'
    ],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-sonido-torrent',
    title: 'Alquiler de Sonido Profesional en Torrent | ReSona Events',
    description: 'Alquiler de equipos de sonido en Torrent (Valencia). Altavoces, subwoofers, mesas de mezclas para eventos y fiestas. Entrega gratis en Torrent. ☎️ 613881414',
    keywords: [
      'alquiler sonido torrent',
      'alquiler altavoces torrent',
      'sonido profesional torrent',
      'alquiler equipos sonido torrent'
    ],
    priority: 0.90,
    changefreq: 'weekly',
  },
];

async function seedSeoPages() {
  console.log('🌱 Seeding SEO Pages...\n');

  for (const pageData of SEO_PAGES) {
    try {
      // Verificar si existe
      const existing = await prisma.seoPage.findUnique({
        where: { slug: pageData.slug },
      });

      if (existing) {
        // Actualizar
        await prisma.seoPage.update({
          where: { slug: pageData.slug },
          data: pageData,
        });
        console.log(`✅ Actualizada: /${pageData.slug}`);
      } else {
        // Crear
        await prisma.seoPage.create({
          data: pageData,
        });
        console.log(`🆕 Creada: /${pageData.slug}`);
      }
    } catch (error) {
      console.error(`❌ Error con /${pageData.slug}:`, error);
    }
  }

  console.log('\n✅ Seed completado!');
  console.log(`📊 Total páginas SEO: ${SEO_PAGES.length}`);
}

seedSeoPages()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
