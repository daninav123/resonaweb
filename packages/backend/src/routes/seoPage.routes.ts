import { Router } from 'express';
import { seoPageController } from '../controllers/seoPage.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { prisma } from '../index';

const router = Router();

// TEMPORAL: Endpoint para seed inicial (solo usar UNA vez)
router.post('/seed-initial-pages', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const pages = [
      {
        slug: 'alquiler-altavoces-valencia',
        title: 'Alquiler de Altavoces Profesionales en Valencia | Desde 35€/día',
        description: 'Alquiler de altavoces profesionales en Valencia. JBL, QSC, Yamaha, Mackie. Desde 400W hasta 2000W. Activos y pasivos para eventos, bodas, fiestas. Entrega e instalación gratis. Presupuesto en 24h ☎️ 613881414',
        keywords: ['alquiler altavoces valencia', 'alquiler altavoces profesionales valencia', 'alquiler altavoces activos valencia'],
        priority: 0.98,
        changefreq: 'weekly',
      },
      {
        slug: 'alquiler-sonido-valencia',
        title: 'Alquiler de Sonido Profesional en Valencia | ReSona Events',
        description: 'Alquiler de equipos de sonido profesional en Valencia. Altavoces, subwoofers, mesas de mezclas y microfonía para eventos, bodas y fiestas.',
        keywords: ['alquiler sonido valencia', 'alquiler equipos sonido valencia'],
        priority: 0.95,
        changefreq: 'weekly',
      },
      {
        slug: 'alquiler-iluminacion-valencia',
        title: 'Alquiler de Iluminación Profesional en Valencia | ReSona Events',
        description: 'Alquiler de iluminación profesional para eventos en Valencia. Moving heads, LED PAR, focos robotizados.',
        keywords: ['alquiler iluminacion valencia', 'alquiler luces eventos valencia'],
        priority: 0.95,
        changefreq: 'weekly',
      },
      {
        slug: 'sonido-bodas-valencia',
        title: 'Sonido Profesional para Bodas en Valencia | ReSona Events',
        description: 'Alquiler de sonido para bodas en Valencia. Sistemas completos, micrófonos inalámbricos.',
        keywords: ['sonido bodas valencia', 'alquiler sonido bodas valencia'],
        priority: 0.95,
        changefreq: 'weekly',
      },
      {
        slug: 'alquiler-sonido-torrent',
        title: 'Alquiler de Sonido Profesional en Torrent | ReSona Events',
        description: 'Alquiler de equipos de sonido en Torrent (Valencia). Entrega gratis.',
        keywords: ['alquiler sonido torrent', 'alquiler altavoces torrent'],
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
