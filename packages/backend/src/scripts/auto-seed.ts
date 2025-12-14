#!/usr/bin/env ts-node
/**
 * Auto-seed para ejecutar automáticamente en producción
 * Este script se ejecuta después del deploy en Render
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEO_PAGES = [
  // ========== PÁGINAS PRINCIPALES ==========
  {
    slug: '',
    title: 'ReSona Events - Alquiler de Sonido e Iluminación Profesional en Valencia',
    description: 'Alquiler de equipos de sonido, iluminación y DJ profesional en Valencia. Más de 10 años de experiencia. Entrega gratis. Presupuesto en 24h. ☎️ 613881414',
    keywords: ['alquiler sonido valencia', 'alquiler iluminacion valencia', 'eventos valencia', 'resona events'],
    priority: 1.0,
    changefreq: 'daily',
  },
  {
    slug: 'productos',
    title: 'Catálogo de Productos - Alquiler de Sonido e Iluminación | ReSona Events',
    description: 'Catálogo completo de equipos de sonido, iluminación y DJ en alquiler. Altavoces, mesas de mezclas, luces LED, moving heads y más. Valencia.',
    keywords: ['catalogo sonido valencia', 'equipos alquiler valencia', 'productos sonido'],
    priority: 0.9,
    changefreq: 'daily',
  },
  {
    slug: 'blog',
    title: 'Blog - Consejos y Guías de Sonido e Iluminación | ReSona Events',
    description: 'Guías, tutoriales y consejos sobre sonido e iluminación profesional para eventos. Aprende a elegir el equipo perfecto.',
    keywords: ['blog sonido', 'guias iluminacion', 'consejos eventos'],
    priority: 0.9,
    changefreq: 'daily',
  },
  {
    slug: 'calculadora-evento',
    title: 'Calculadora de Eventos - Presupuesto Online | ReSona Events',
    description: 'Calcula el presupuesto de tu evento en 2 minutos. Elige equipos de sonido, iluminación y servicios. Precio instantáneo.',
    keywords: ['calculadora eventos', 'presupuesto sonido', 'cotizador eventos valencia'],
    priority: 0.9,
    changefreq: 'monthly',
  },
  {
    slug: 'servicios',
    title: 'Servicios - Alquiler de Sonido, Iluminación y DJ | ReSona Events',
    description: 'Servicios completos para eventos: alquiler de sonido, iluminación, DJ, técnicos profesionales. Valencia y área metropolitana.',
    keywords: ['servicios eventos valencia', 'alquiler equipos sonido', 'servicio tecnico'],
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    slug: 'sobre-nosotros',
    title: 'Sobre Nosotros - Más de 10 Años de Experiencia | ReSona Events',
    description: 'ReSona Events, empresa líder en alquiler de sonido e iluminación en Valencia. Más de 10 años y 500 eventos exitosos.',
    keywords: ['resona events', 'empresa sonido valencia', 'quienes somos'],
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    slug: 'contacto',
    title: 'Contacto - Pide tu Presupuesto Gratis | ReSona Events',
    description: 'Contacta con ReSona Events. Presupuesto gratis en 24h. Valencia: C/ de l\'Illa Cabrera, 13. ☎️ 613 88 14 14',
    keywords: ['contacto resona', 'presupuesto sonido valencia', 'telefono alquiler sonido'],
    priority: 0.7,
    changefreq: 'monthly',
  },
  
  // ========== PÁGINAS SEO LOCALES (ALTA PRIORIDAD) ==========
  {
    slug: 'alquiler-altavoces-valencia',
    title: 'Alquiler de Altavoces Profesionales en Valencia | Desde 35€/día',
    description: 'Alquiler de altavoces profesionales en Valencia. JBL, QSC, Yamaha, Mackie. Desde 400W hasta 2000W. Activos y pasivos para eventos, bodas, fiestas. Entrega e instalación gratis. Presupuesto en 24h ☎️ 613881414',
    keywords: ['alquiler altavoces valencia', 'alquiler altavoces profesionales valencia', 'alquiler PA valencia', 'altavoces eventos valencia'],
    priority: 0.98,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-sonido-valencia',
    title: 'Alquiler de Sonido Profesional en Valencia | ReSona Events',
    description: 'Alquiler de equipos de sonido profesional en Valencia. Altavoces, subwoofers, mesas de mezclas y microfonía para eventos, bodas y fiestas. Servicio técnico incluido. Presupuesto gratis en 24h. ☎️ 613881414',
    keywords: ['alquiler sonido valencia', 'alquiler equipos sonido valencia', 'sonido profesional valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-iluminacion-valencia',
    title: 'Alquiler de Iluminación Profesional en Valencia | ReSona Events',
    description: 'Alquiler de iluminación profesional para eventos en Valencia. Moving heads, LED PAR, focos robotizados, luces de discoteca. Desde 25€/día. Entrega gratis en Valencia. ☎️ 613881414',
    keywords: ['alquiler iluminacion valencia', 'alquiler luces eventos valencia', 'moving heads valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'sonido-bodas-valencia',
    title: 'Sonido Profesional para Bodas en Valencia | ReSona Events',
    description: 'Alquiler de sonido para bodas en Valencia. Sistemas completos, micrófonos inalámbricos, música ceremonia y banquete. Técnico incluido. Más de 200 bodas realizadas. ☎️ 613881414',
    keywords: ['sonido bodas valencia', 'alquiler sonido bodas valencia', 'musica boda valencia'],
    priority: 0.95,
    changefreq: 'weekly',
  },
  {
    slug: 'alquiler-sonido-torrent',
    title: 'Alquiler de Sonido Profesional en Torrent | ReSona Events',
    description: 'Alquiler de equipos de sonido en Torrent (Valencia). Altavoces, subwoofers, mesas de mezclas para eventos y fiestas. Entrega gratis en Torrent. ☎️ 613881414',
    keywords: ['alquiler sonido torrent', 'alquiler altavoces torrent', 'equipos sonido torrent'],
    priority: 0.90,
    changefreq: 'weekly',
  },
];

export async function autoSeed() {
  console.log('🌱 Auto-seed: Verificando páginas SEO...\n');

  try {
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const pageData of SEO_PAGES) {
      try {
        const existing = await prisma.seoPage.findUnique({
          where: { slug: pageData.slug },
        });

        if (existing) {
          // Actualizar si cambió algo importante
          const needsUpdate = 
            existing.title !== pageData.title ||
            existing.priority !== pageData.priority ||
            existing.changefreq !== pageData.changefreq;

          if (needsUpdate) {
            await prisma.seoPage.update({
              where: { slug: pageData.slug },
              data: pageData,
            });
            console.log(`🔄 Actualizada: /${pageData.slug || 'homepage'}`);
            updated++;
          } else {
            skipped++;
          }
        } else {
          await prisma.seoPage.create({
            data: pageData,
          });
          console.log(`✅ Creada: /${pageData.slug || 'homepage'}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error con /${pageData.slug}:`, error);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  - Creadas: ${created}`);
    console.log(`  - Actualizadas: ${updated}`);
    console.log(`  - Sin cambios: ${skipped}`);
    console.log(`  - Total: ${SEO_PAGES.length}`);
    
    if (created > 0 || updated > 0) {
      console.log('\n✅ Auto-seed completado exitosamente!');
    } else {
      console.log('\n✅ Todas las páginas SEO ya están actualizadas.');
    }
  } catch (error) {
    console.error('\n❌ Error en auto-seed:', error);
    // No lanzar error para no interrumpir el deploy
  }
}

autoSeed()
  .catch((e) => {
    console.error('❌ Error crítico:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
