import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export class SeoPageService {
  /**
   * Obtener todas las páginas SEO activas
   */
  async getActivePages() {
    try {
      const pages = await prisma.seoPage.findMany({
        where: { isActive: true },
        orderBy: { priority: 'desc' },
      });
      return pages;
    } catch (error) {
      logger.error('Error obteniendo páginas SEO activas:', error);
      throw new AppError(500, 'Error obteniendo páginas SEO', 'DATABASE_ERROR');
    }
  }

  /**
   * Obtener todas las páginas SEO (admin)
   */
  async getAllPages() {
    try {
      const pages = await prisma.seoPage.findMany({
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      return pages;
    } catch (error) {
      logger.error('Error obteniendo todas las páginas SEO:', error);
      throw new AppError(500, 'Error obteniendo páginas SEO', 'DATABASE_ERROR');
    }
  }

  /**
   * Obtener página SEO por slug
   */
  async getPageBySlug(slug: string) {
    try {
      const page = await prisma.seoPage.findUnique({
        where: { slug },
      });
      return page;
    } catch (error) {
      logger.error('Error obteniendo página SEO por slug:', error);
      throw new AppError(500, 'Error obteniendo página SEO', 'DATABASE_ERROR');
    }
  }

  /**
   * Crear página SEO
   */
  async createPage(data: {
    slug: string;
    title: string;
    description: string;
    keywords: string[];
    priority?: number;
    changefreq?: string;
    content?: string;
  }) {
    try {
      // Verificar que el slug no exista
      const existing = await prisma.seoPage.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        throw new AppError(400, 'Ya existe una página SEO con ese slug', 'DUPLICATE_SLUG');
      }

      const page = await prisma.seoPage.create({
        data: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          keywords: data.keywords,
          priority: data.priority || 0.9,
          changefreq: data.changefreq || 'weekly',
          content: data.content,
        },
      });

      logger.info(`Página SEO creada: ${page.slug}`);
      return page;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error creando página SEO:', error);
      throw new AppError(500, 'Error creando página SEO', 'DATABASE_ERROR');
    }
  }

  /**
   * Actualizar página SEO
   */
  async updatePage(
    id: string,
    data: {
      slug?: string;
      title?: string;
      description?: string;
      keywords?: string[];
      priority?: number;
      changefreq?: string;
      content?: string;
      isActive?: boolean;
    }
  ) {
    try {
      // Si se cambia el slug, verificar que no exista
      if (data.slug) {
        const existing = await prisma.seoPage.findFirst({
          where: {
            slug: data.slug,
            NOT: { id },
          },
        });

        if (existing) {
          throw new AppError(400, 'Ya existe una página SEO con ese slug', 'DUPLICATE_SLUG');
        }
      }

      const page = await prisma.seoPage.update({
        where: { id },
        data,
      });

      logger.info(`Página SEO actualizada: ${page.slug}`);
      return page;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Error actualizando página SEO:', error);
      throw new AppError(500, 'Error actualizando página SEO', 'DATABASE_ERROR');
    }
  }

  /**
   * Eliminar página SEO
   */
  async deletePage(id: string) {
    try {
      await prisma.seoPage.delete({
        where: { id },
      });

      logger.info(`Página SEO eliminada: ${id}`);
      return true;
    } catch (error) {
      logger.error('Error eliminando página SEO:', error);
      throw new AppError(500, 'Error eliminando página SEO', 'DATABASE_ERROR');
    }
  }
}

export const seoPageService = new SeoPageService();
