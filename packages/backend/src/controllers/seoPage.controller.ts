import { Request, Response, NextFunction } from 'express';
import { seoPageService } from '../services/seoPage.service';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export class SeoPageController {
  /**
   * GET /api/v1/seo-pages (público)
   * Obtener páginas SEO activas
   */
  async getActivePages(req: Request, res: Response, next: NextFunction) {
    try {
      const pages = await seoPageService.getActivePages();
      res.json({ pages });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/seo-pages/all (admin)
   * Obtener todas las páginas SEO
   */
  async getAllPages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pages = await seoPageService.getAllPages();
      res.json({ pages });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/seo-pages/:slug (público)
   * Obtener página SEO por slug
   */
  async getPageBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const page = await seoPageService.getPageBySlug(slug);
      
      if (!page) {
        throw new AppError(404, 'Página SEO no encontrada', 'NOT_FOUND');
      }

      res.json(page);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/seo-pages (admin)
   * Crear página SEO
   */
  async createPage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug, title, description, keywords, priority, changefreq, content } = req.body;

      if (!slug || !title || !description) {
        throw new AppError(400, 'Slug, título y descripción son requeridos', 'MISSING_FIELDS');
      }

      const page = await seoPageService.createPage({
        slug,
        title,
        description,
        keywords: keywords || [],
        priority,
        changefreq,
        content,
      });

      logger.info(`Página SEO creada por admin: ${page.slug}`);
      res.status(201).json({
        message: 'Página SEO creada correctamente',
        page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/seo-pages/:id (admin)
   * Actualizar página SEO
   */
  async updatePage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { slug, title, description, keywords, priority, changefreq, content, isActive } = req.body;

      const page = await seoPageService.updatePage(id, {
        slug,
        title,
        description,
        keywords,
        priority,
        changefreq,
        content,
        isActive,
      });

      logger.info(`Página SEO actualizada por admin: ${page.slug}`);
      res.json({
        message: 'Página SEO actualizada correctamente',
        page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/seo-pages/:id (admin)
   * Eliminar página SEO
   */
  async deletePage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await seoPageService.deletePage(id);

      logger.info(`Página SEO eliminada por admin: ${id}`);
      res.json({
        message: 'Página SEO eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const seoPageController = new SeoPageController();
