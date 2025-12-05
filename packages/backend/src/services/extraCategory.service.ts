import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExtraCategoryService {
  /**
   * Obtener todas las categorías de extras
   */
  async getAllCategories(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };
    
    return await prisma.extraCategory.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id: string) {
    return await prisma.extraCategory.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            pricePerDay: true,
            mainImageUrl: true
          }
        }
      }
    });
  }

  /**
   * Obtener una categoría por slug
   */
  async getCategoryBySlug(slug: string) {
    return await prisma.extraCategory.findUnique({
      where: { slug }
    });
  }

  /**
   * Crear una categoría
   */
  async createCategory(data: {
    name: string;
    slug: string;
    icon?: string;
    color?: string;
    description?: string;
    order?: number;
  }) {
    return await prisma.extraCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon || '📦',
        color: data.color || 'purple',
        description: data.description,
        order: data.order || 0
      }
    });
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: string, data: {
    name?: string;
    slug?: string;
    icon?: string;
    color?: string;
    description?: string;
    order?: number;
    isActive?: boolean;
  }) {
    return await prisma.extraCategory.update({
      where: { id },
      data
    });
  }

  /**
   * Eliminar una categoría
   */
  async deleteCategory(id: string) {
    // Primero desasociar todos los productos
    await prisma.product.updateMany({
      where: { extraCategoryId: id },
      data: { extraCategoryId: null }
    });

    // Luego eliminar la categoría
    return await prisma.extraCategory.delete({
      where: { id }
    });
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(categoryOrders: { id: string; order: number }[]) {
    const updates = categoryOrders.map(({ id, order }) =>
      prisma.extraCategory.update({
        where: { id },
        data: { order }
      })
    );

    return await Promise.all(updates);
  }

  /**
   * Asignar categoría a productos
   */
  async assignCategoryToProducts(categoryId: string, productIds: string[]) {
    return await prisma.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: {
        extraCategoryId: categoryId
      }
    });
  }

  /**
   * Obtener productos sin categoría de extra
   */
  async getUncategorizedProducts() {
    return await prisma.product.findMany({
      where: {
        extraCategoryId: null,
        isActive: true,
        isPack: false
      },
      select: {
        id: true,
        name: true,
        sku: true,
        pricePerDay: true
      }
    });
  }
}

export const extraCategoryService = new ExtraCategoryService();
