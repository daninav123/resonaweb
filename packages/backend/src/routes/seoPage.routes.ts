import { Router } from 'express';
import { seoPageController } from '../controllers/seoPage.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { prisma } from '../index';

const router = Router();

// TEMPORAL: Endpoint para seed inicial (solo usar UNA vez)
router.post('/seed-initial-pages', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const pages = [
      // ========== PÁGINAS PRINCIPALES ==========
      {
        slug: '',  // Homepage (raíz)
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

    const created = [];
    for (const pageData of pages) {
      const existing = await prisma.seoPage.findUnique({ where: { slug: pageData.slug } });
      if (!existing) {
        const page = await prisma.seoPage.create({ data: pageData });
        created.push(page.slug);
      }
    }

    res.json({ 
      message: 'Seed completado',
      created,
      total: pages.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/seo-pages
 * Obtener páginas SEO activas (público)
 */
router.get('/', seoPageController.getActivePages.bind(seoPageController));

/**
 * GET /api/v1/seo-pages/all
 * Obtener todas las páginas SEO (admin)
 */
router.get(
  '/all',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  seoPageController.getAllPages.bind(seoPageController)
);

/**
 * GET /api/v1/seo-pages/:slug
 * Obtener página SEO por slug (público)
 */
router.get('/:slug', seoPageController.getPageBySlug.bind(seoPageController));

/**
 * POST /api/v1/seo-pages
 * Crear página SEO (admin)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  seoPageController.createPage.bind(seoPageController)
);

/**
 * PUT /api/v1/seo-pages/:id
 * Actualizar página SEO (admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  seoPageController.updatePage.bind(seoPageController)
);

/**
 * DELETE /api/v1/seo-pages/:id
 * Eliminar página SEO (admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPERADMIN'),
  seoPageController.deletePage.bind(seoPageController)
);

export default router;
