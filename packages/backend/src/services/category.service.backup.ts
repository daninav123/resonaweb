import { Prisma } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import slugify from 'slugify';

export class CategoryService {
  /**
   * Get all categories with hierarchy
   */
  async getAllCategories(params?: {
    includeInactive?: boolean;
    parentId?: string | null;
  }) {
    const { includeInactive = false, parentId } = params || {};

    const where: Prisma.CategoryWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...(parentId !== undefined ? { parentId } : {}),
    };

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, includeProducts: boolean = false) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            take: 10,
            select: {
              id: true,
              name: true,
              slug: true,
              mainImageUrl: true,
              pricePerDay: true,
              stock: true,
            },
          },
        }),
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string, includeProducts: boolean = false) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        ...(includeProducts && {
          products: {
            where: { isActive: true },
            orderBy: { featured: 'desc' },
            take: 20,
            select: {
              id: true,
              name: true,
              slug: true,
              mainImageUrl: true,
              pricePerDay: true,
              pricePerWeekend: true,
              pricePerWeek: true,
              stock: true,
              featured: true,
            },
          },
        }),
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
    }

    return category;
  }

  /**
   * Create category
   */
  async createCategory(data: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    isActive?: boolean;
    featured?: boolean;
    sortOrder?: number;
  }) {
    // Generate slug if not provided
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new AppError(409, 'Ya existe una categoría con este slug', 'SLUG_EXISTS');
    }

    // Verify parent exists if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new AppError(404, 'Categoría padre no encontrada', 'PARENT_NOT_FOUND');
      }
    }

    // Get next sort order if not provided
    const sortOrder = data.sortOrder ?? await this.getNextSortOrder(data.parentId);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId,
        isActive: data.isActive ?? true,
        featured: data.featured ?? false,
        sortOrder,
      },
    });

    logger.info(`Category created: ${category.name} (${category.id})`);

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      imageUrl: string;
      parentId: string;
      isActive: boolean;
      featured: boolean;
      sortOrder: number;
    }>
  ) {
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
    }

    // If slug is being changed, check it doesn't exist
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new AppError(409, 'Ya existe una categoría con este slug', 'SLUG_EXISTS');
      }
    }

    // If name is being changed but not slug, update slug
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    // Verify parent exists if being changed
    if (data.parentId && data.parentId !== existingCategory.parentId) {
      // Can't be parent of itself
      if (data.parentId === id) {
        throw new AppError(400, 'Una categoría no puede ser su propio padre', 'INVALID_PARENT');
      }

      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new AppError(404, 'Categoría padre no encontrada', 'PARENT_NOT_FOUND');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    logger.info(`Category updated: ${category.name} (${category.id})`);

    return category;
  }

  /**
   * Delete category (soft delete if has products)
   */
  async deleteCategory(id: string, force: boolean = false) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
    }

    // Check if has children
    if (category._count.children > 0) {
      throw new AppError(
        400,
        'No se puede eliminar una categoría con subcategorías',
        'HAS_CHILDREN'
      );
    }

    // If has products, only soft delete unless force
    if (category._count.products > 0 && !force) {
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info(`Category soft deleted: ${category.name} (${category.id})`);

      return { message: 'Categoría desactivada correctamente' };
    }

    // Hard delete if no products or force
    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Category deleted: ${category.name} (${category.id})`);

    return { message: 'Categoría eliminada correctamente' };
  }

  /**
   * Reorder categories
   */
  async reorderCategories(orders: Array<{ id: string; sortOrder: number }>) {
    await prisma.$transaction(
      orders.map((order) =>
        prisma.category.update({
          where: { id: order.id },
          data: { sortOrder: order.sortOrder },
        })
      )
    );

    logger.info(`Reordered ${orders.length} categories`);

    return { message: 'Categorías reordenadas correctamente' };
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getCategoryTree() {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return categories;
  }

  /**
   * Get next sort order for a parent
   */
  private async getNextSortOrder(parentId?: string): Promise<number> {
    const lastCategory = await prisma.category.findFirst({
      where: { parentId: parentId || null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    return (lastCategory?.sortOrder ?? 0) + 1;
  }
}

export const categoryService = new CategoryService();
