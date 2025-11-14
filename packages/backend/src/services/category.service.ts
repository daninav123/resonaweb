import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import slugify from 'slugify';

const prisma = new PrismaClient();

export class CategoryService {
  /**
   * Get all categories
   */
  async getAllCategories(params?: {
    includeInactive?: boolean;
    parentId?: string | null;
  }) {
    try {
      const { includeInactive = false, parentId } = params || {};

      const where: any = {};
      
      if (!includeInactive) {
        where.isActive = true;
      }
      
      if (parentId !== undefined) {
        where.parentId = parentId;
      }

      const categories = await prisma.category.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });

      return categories;
    } catch (error) {
      logger.error('Error getting categories:', error);
      throw error;
    }
  }

  /**
   * Get category tree (hierarchical)
   */
  async getCategoryTree() {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });

      // Build tree structure
      const categoryMap = new Map();
      const rootCategories: any[] = [];

      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      categories.forEach(cat => {
        const category = categoryMap.get(cat.id);
        if (cat.parentId) {
          const parent = categoryMap.get(cat.parentId);
          if (parent) {
            parent.children.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });

      return rootCategories;
    } catch (error) {
      logger.error('Error getting category tree:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, includeProducts: boolean = false) {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: includeProducts ? {
          products: {
            where: { isActive: true },
            take: 50,
          },
        } : undefined,
      });

      if (!category) {
        throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
      }

      return category;
    } catch (error) {
      logger.error('Error getting category by ID:', error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string, includeProducts: boolean = false) {
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: includeProducts ? {
          products: {
            where: { isActive: true },
            take: 50,
          },
        } : undefined,
      });

      if (!category) {
        throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
      }

      return category;
    } catch (error) {
      logger.error('Error getting category by slug:', error);
      throw error;
    }
  }

  /**
   * Create category
   */
  async createCategory(data: {
    name: string;
    description?: string;
    parentId?: string;
    imageUrl?: string;
    featured?: boolean;
  }) {
    try {
      const slug = slugify(data.name, { lower: true, strict: true });

      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          parentId: data.parentId,
          imageUrl: data.imageUrl,
          featured: data.featured || false,
        },
      });

      return category;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: any) {
    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          featured: data.featured,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
        },
      });

      return category;
    } catch (error) {
      logger.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string, force: boolean = false) {
    try {
      if (force) {
        await prisma.category.delete({ where: { id } });
      } else {
        await prisma.category.update({
          where: { id },
          data: { isActive: false },
        });
      }

      return { message: 'Categoría eliminada exitosamente' };
    } catch (error) {
      logger.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(orders: { id: string; sortOrder: number }[]) {
    try {
      await Promise.all(
        orders.map(order =>
          prisma.category.update({
            where: { id: order.id },
            data: { sortOrder: order.sortOrder },
          })
        )
      );

      return { message: 'Orden actualizado exitosamente' };
    } catch (error) {
      logger.error('Error reordering categories:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();
