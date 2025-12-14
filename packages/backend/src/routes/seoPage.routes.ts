import { Router } from 'express';
import { seoPageController } from '../controllers/seoPage.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

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
