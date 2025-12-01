import { Prisma, ProductStatus } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import slugify from 'slugify';
import { cacheService, cacheKeys } from './cache.service';

// Lock para serializar eliminaciones y evitar race conditions
class DeletionLock {
  private queue: Array<() => Promise<any>> = [];
  private processing: boolean = false;

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const task = this.queue.shift();
    
    if (task) {
      try {
        await task();
      } catch (error) {
        logger.error('Error processing deletion task', error);
      }
    }

    this.processing = false;
    
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }
}

const deletionLock = new DeletionLock();

export class ProductService {
  /**
   * Get all products with filters
   */
  async getAllProducts(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
    include?: Prisma.ProductInclude;
  }) {
    const { 
      skip = 0, 
      take = 20, 
      where,
      orderBy = { createdAt: 'desc' },
      include = {
        category: true,
      }
    } = params || {};

    // Merge where conditions - always include isActive
    const finalWhere: Prisma.ProductWhereInput = {
      isActive: true,
      ...where
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy,
        include,
      }),
      prisma.product.count({ where: finalWhere }),
    ]);

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });
        
        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
        };
      })
    );

    return {
      data: productsWithRatings,
      pagination: {
        page: Math.floor(skip / take) + 1,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNext: skip + take < total,
        hasPrev: skip > 0,
      },
    };
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isPack: false, // Excluir packs de productos destacados
        featured: true,
        stock: { gt: 0 },
      },
      take: limit,
      orderBy: [
        { featured: 'desc' },
        { viewCount: 'desc' },
      ],
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
    });

    return products;
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { 
            reviews: true,
            orderItems: true,
            favorites: true 
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // Increment view count
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
    });

    return {
      ...product,
      averageRating: avgRating._avg.rating || 0,
    };
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: { 
            reviews: true,
            orderItems: true,
            favorites: true 
          },
        },
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
    });

    // Buscar productos relacionados
    const relatedProducts = await this.getRelatedProducts(product.id, product.categoryId);

    return {
      ...product,
      averageRating: avgRating._avg.rating || 0,
      relatedProducts,
    };
  }

  /**
   * Obtener productos relacionados
   * Prioridad:
   * 1. Packs que contengan el producto (mínimo 2 si existen)
   * 2. Productos de la misma categoría
   */
  async getRelatedProducts(productId: string, categoryId: string) {
    const relatedProducts: any[] = [];

    // 1. Buscar packs que incluyan este producto
    const packsWithProduct = await prisma.pack.findMany({
      where: {
        status: 'ACTIVE',
        items: {
          some: {
            productId: productId
          }
        }
      },
      take: 6, // Buscar más de lo necesario por si algunos están inactivos
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        price: true,
        status: true,
      }
    });

    // Convertir packs a formato de producto con campo especial
    const packProducts = packsWithProduct.slice(0, 3).map(pack => ({
      id: pack.id,
      name: pack.name,
      slug: pack.slug,
      description: pack.description,
      mainImageUrl: pack.imageUrl,
      pricePerDay: pack.price,
      isPack: true, // Identificador especial
    }));

    relatedProducts.push(...packProducts);

    // 2. Si no tenemos suficientes relacionados, agregar productos de la misma categoría
    const remainingSlots = 6 - relatedProducts.length;
    
    if (remainingSlots > 0) {
      const sameCategory = await prisma.product.findMany({
        where: {
          categoryId: categoryId,
          id: { not: productId }, // Excluir el producto actual
          status: ProductStatus.ACTIVE,
        },
        take: remainingSlots,
        orderBy: [
          { viewCount: 'desc' }, // Productos más vistos primero
          { createdAt: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          mainImageUrl: true,
          pricePerDay: true,
          sku: true,
        }
      });

      relatedProducts.push(...sameCategory);
    }

    return relatedProducts;
  }

  /**
   * Search products
   */
  async searchProducts(params: {
    query?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    tags?: string[];
    skip?: number;
    take?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest' | 'popular';
  }) {
    const {
      query,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      featured,
      tags,
      skip = 0,
      take = 20,
      sortBy = 'newest',
    } = params;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isPack: false, // Excluir packs de búsquedas
      ...(query && {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined && { pricePerDay: { gte: minPrice } }),
      ...(maxPrice !== undefined && { pricePerDay: { lte: maxPrice } }),
      ...(inStock && { stock: { gt: 0 } }),
      ...(featured !== undefined && { featured }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    };

    // Build orderBy
    let orderBy: Prisma.ProductOrderByWithRelationInput;
    switch (sortBy) {
      case 'price_asc':
        orderBy = { pricePerDay: 'asc' };
        break;
      case 'price_desc':
        orderBy = { pricePerDay: 'desc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
    }

    return this.getAllProducts({
      skip,
      take,
      where,
      orderBy,
    });
  }

  /**
   * Create product
   */
  async createProduct(data: {
    sku: string;
    name: string;
    slug?: string;
    description: string;
    categoryId: string;
    pricePerDay: number;
    pricePerWeekend: number;
    pricePerWeek: number;
    stock: number;
    realStock: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    volume?: number;
    requiresSpecialTransport?: boolean;
    mainImageUrl?: string;
    images?: string[];
    specifications?: any;
    tags?: string[];
    featured?: boolean;
    isPack?: boolean;
    shippingCost?: number;
    installationCost?: number;
    installationTimeMinutes?: number;
    requiresInstallation?: boolean;
    installationComplexity?: number;
    stockStatus?: string;
    leadTimeDays?: number;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  }) {
    // Generate slug if not provided
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    // Check if SKU or slug already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: data.sku },
          { slug },
        ],
      },
    });

    if (existing) {
      if (existing.sku === data.sku) {
        throw new AppError(409, 'Ya existe un producto con este SKU', 'SKU_EXISTS');
      }
      throw new AppError(409, 'Ya existe un producto con este slug', 'SLUG_EXISTS');
    }

    // Verify category exists (solo si se proporciona categoryId)
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new AppError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND');
      }
    }

    // Create product
    // Filtrar categoryId si es null (para packs sin categoría)
    const productData: any = { ...data, slug };
    if (!productData.categoryId) {
      delete productData.categoryId;
    }
    
    console.log('🔧 Datos procesados para Prisma:', JSON.stringify(productData, null, 2));
    
    let product;
    try {
      product = await prisma.product.create({
        data: productData,
      });
      
      console.log('✅ Producto creado en DB:', product.id);
    } catch (prismaError: any) {
      console.error('❌ ERROR DE PRISMA:');
      console.error('Name:', prismaError.name);
      console.error('Message:', prismaError.message);
      console.error('Code:', prismaError.code);
      if (prismaError.meta) {
        console.error('Meta:', JSON.stringify(prismaError.meta, null, 2));
      }
      throw prismaError;
    }

    // Create product specifications if provided
    if (data.specifications && Object.keys(data.specifications).length > 0) {
      await prisma.productSpecification.create({
        data: {
          productId: product.id,
          specs: data.specifications,
        },
      });
    }

    logger.info(`Product created: ${product.name} (${product.id})`);
    return product;
  }

  /**
   * Update product
   */
  async updateProduct(
    id: string,
    data: Partial<{
      sku: string;
      name: string;
      slug: string;
      description: string;
      categoryId: string;
      pricePerDay: number;
      pricePerWeekend: number;
      pricePerWeek: number;
      stock: number;
      realStock: number;
      weight: number;
      length: number;
      width: number;
      height: number;
      volume: number;
      requiresSpecialTransport: boolean;
      mainImageUrl: string;
      images: string[];
      specifications: any;
      tags: string[];
      featured: boolean;
      isActive: boolean;
      isPack: boolean;
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string;
      shippingCost: number;
      installationCost: number;
      installationTimeMinutes: number;
      requiresInstallation: boolean;
      installationComplexity: number;
      stockStatus: string;
      leadTimeDays: number;
    }>
  ) {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // If SKU is being changed, check it doesn't exist
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new AppError(409, 'Ya existe un producto con este SKU', 'SKU_EXISTS');
      }
    }

    // If slug is being changed, check it doesn't exist
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new AppError(409, 'Ya existe un producto con este slug', 'SLUG_EXISTS');
      }
    }

    // If name is being changed but not slug, update slug
    if (data.name && !data.slug) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    // Handle specifications update separately
    let specifications = data.specifications;
    delete data.specifications;
    
    logger.info(`📦 Updating product ${id}:`, {
      stock: data.stock,
      realStock: data.realStock,
      oldStock: existingProduct.stock,
      oldRealStock: existingProduct.realStock,
    });
    
    // Update stock status if stock changes
    if (data.stock !== undefined) {
      const updateData: any = data;
      if (data.stock === 0) {
        updateData.stockStatus = 'OUT_OF_STOCK';
      } else if (data.stock > 0 && existingProduct.stockStatus === 'OUT_OF_STOCK') {
        updateData.stockStatus = 'IN_STOCK';
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    
    logger.info(`✅ Product updated:`, {
      stock: product.stock,
      realStock: product.realStock,
    });

    // Update specifications if provided
    if (specifications !== undefined) {
      await prisma.productSpecification.upsert({
        where: { productId: id },
        update: { specs: specifications },
        create: {
          productId: id,
          specs: specifications,
        },
      });
    }

    logger.info(`Product updated: ${product.name} (${product.id})`);

    return product;
  }

  /**
   * Delete product (soft delete)
   * Usa un lock para serializar las eliminaciones y evitar race conditions
   */
  async deleteProduct(id: string, force: boolean = false) {
    return deletionLock.acquire(async () => {
      return this._deleteProductInternal(id, force);
    });
  }

  private async _deleteProductInternal(id: string, force: boolean = false) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
            packItems: true,
            reviews: true,
            favorites: true,
            interactions: true,
          },
        },
        analytics: true,
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // Check if product has orders or is in packs
    const hasRelations = product._count.orderItems > 0 || product._count.packItems > 0;
    
    if (hasRelations && !force) {
      // Soft delete
      await prisma.product.update({
        where: { id },
        data: {
          isActive: false,
          status: 'DISCONTINUED',
        },
      });

      logger.info(`Product soft deleted: ${product.name} (${product.id})`);

      return { message: 'Producto desactivado correctamente (tiene pedidos o está en packs)' };
    }

    // Hard delete if no critical relations or force
    try {
      // Delete in transaction to handle all relationships
      await prisma.$transaction(async (tx) => {
        // Delete related data first
        if (product.analytics) {
          try {
            await tx.productDemandAnalytics.delete({
              where: { productId: id },
            });
          } catch (e) {
            logger.warn(`No analytics to delete for product ${id}`);
          }
        }

        await tx.productInteraction.deleteMany({
          where: { productId: id },
        });

        await tx.favorite.deleteMany({
          where: { productId: id },
        });

        await tx.review.deleteMany({
          where: { productId: id },
        });

        // Delete the product
        await tx.product.delete({
          where: { id },
        });
      }, {
        maxWait: 5000, // Espera máxima para obtener la transacción
        timeout: 10000, // Timeout total de la transacción
      });

      logger.info(`Product deleted: ${product.name} (${product.id})`);

      return { message: 'Producto eliminado correctamente' };
    } catch (error: any) {
      logger.error('Error deleting product:', {
        error: error.message,
        stack: error.stack,
        productId: id,
        productName: product.name,
      });
      
      // Proporcionar mensaje más específico
      if (error.code === 'P2003') {
        throw new AppError(500, 'No se puede eliminar el producto porque tiene relaciones pendientes. Contacta con soporte.', 'DELETE_CONSTRAINT_ERROR');
      }
      
      if (error.code === 'P2025') {
        throw new AppError(404, 'El producto ya no existe', 'PRODUCT_NOT_FOUND');
      }
      
      throw new AppError(500, `Error al eliminar el producto: ${error.message}`, 'DELETE_ERROR');
    }
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number, operation: 'increase' | 'decrease') {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    let newStock: number;
    let newAvailableStock: number;

    if (operation === 'increase') {
      newStock = product.stock + quantity;
      newAvailableStock = product.availableStock + quantity;
    } else {
      if (product.availableStock < quantity) {
        throw new AppError(400, 'Stock insuficiente', 'INSUFFICIENT_STOCK');
      }
      newStock = product.stock - quantity;
      newAvailableStock = product.availableStock - quantity;
    }

    // Update status based on new stock
    let status: ProductStatus = product.status;
    if (newAvailableStock === 0) {
      status = 'OUT_OF_STOCK';
    } else if (newAvailableStock > 0 && product.status === 'OUT_OF_STOCK') {
      status = 'AVAILABLE';
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        availableStock: newAvailableStock,
        status,
      },
    });

    logger.info(
      `Stock updated for product ${productId}: ${operation} ${quantity}. New stock: ${newStock}`
    );

    return updatedProduct;
  }

  /**
   * Bulk update product prices
   */
  async bulkUpdatePrices(
    updates: Array<{
      id: string;
      pricePerDay?: number;
      pricePerWeekend?: number;
      pricePerWeek?: number;
    }>
  ) {
    const results = await prisma.$transaction(
      updates.map((update) =>
        prisma.product.update({
          where: { id: update.id },
          data: {
            pricePerDay: update.pricePerDay,
            pricePerWeekend: update.pricePerWeekend,
            pricePerWeek: update.pricePerWeek,
          },
        })
      )
    );

    logger.info(`Bulk price update: ${results.length} products updated`);

    return results;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    params?: {
      skip?: number;
      take?: number;
      includeSubcategories?: boolean;
    }
  ) {
    const { skip = 0, take = 20, includeSubcategories = false } = params || {};

    let categoryIds = [categoryId];

    // If include subcategories, get all child category IDs
    if (includeSubcategories) {
      const childCategories = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      
      categoryIds = [...categoryIds, ...childCategories.map(c => c.id)];
    }

    return this.getAllProducts({
      skip,
      take,
      where: {
        categoryId: { in: categoryIds },
        isActive: true,
        isPack: false, // Excluir packs de productos por categoría
      },
    });
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        tags: true,
      },
    });

    if (!product) {
      throw new AppError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND');
    }

    // Find products in same category or with similar tags
    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { isActive: true },
          { isPack: false }, // Excluir packs de productos relacionados
          { stock: { gt: 0 } },
          {
            OR: [
              { categoryId: product.categoryId },
              { tags: { hasSome: product.tags } },
            ],
          },
        ],
      },
      take: limit,
      orderBy: { viewCount: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        mainImageUrl: true,
        pricePerDay: true,
        pricePerWeekend: true,
        pricePerWeek: true,
        stock: true,
      },
    });

    return relatedProducts;
  }
}

export const productService = new ProductService();
