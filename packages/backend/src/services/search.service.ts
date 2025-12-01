import { prisma } from '../index';
import { Prisma } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: 'ALL' | 'IN_STOCK' | 'ON_DEMAND';
  sortBy?: 'NAME_ASC' | 'NAME_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';
  page?: number;
  limit?: number;
}

export class SearchService {
  /**
   * Búsqueda de productos con filtros
   */
  async searchProducts(filters: SearchFilters) {
    const {
      query,
      categories,
      minPrice,
      maxPrice,
      availability,
      sortBy = 'POPULAR',
      page = 1,
      limit = 20
    } = filters;

    const skip = (page - 1) * limit;

    // Construir condiciones WHERE
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isPack: false, // Excluir packs de las búsquedas
      AND: []
    };

    // Búsqueda por texto
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } }
      ];
    }

    // Filtro por categorías
    if (categories && categories.length > 0) {
      if (!Array.isArray(where.AND)) where.AND = [];
      (where.AND as any[]).push({
        categoryId: { in: categories }
      });
    }

    // Filtro por precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      if (!Array.isArray(where.AND)) where.AND = [];
      (where.AND as any[]).push({ pricePerDay: priceFilter });
    }

    // Filtro por disponibilidad
    if (availability && availability !== 'ALL') {
      if (!Array.isArray(where.AND)) where.AND = [];
      if (availability === 'IN_STOCK') {
        (where.AND as any[]).push({ 
          realStock: { gt: 0 },
          stockStatus: 'IN_STOCK'
        });
      } else if (availability === 'ON_DEMAND') {
        (where.AND as any[]).push({ 
          stockStatus: 'ON_DEMAND',
          canBuyOnDemand: true
        });
      }
    }

    // Limpiar array vacío
    if (Array.isArray(where.AND) && where.AND.length === 0) {
      delete where.AND;
    }

    // Construir ordenamiento
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    
    switch (sortBy) {
      case 'NAME_ASC':
        orderBy = { name: 'asc' };
        break;
      case 'NAME_DESC':
        orderBy = { name: 'desc' };
        break;
      case 'PRICE_ASC':
        orderBy = { pricePerDay: 'asc' };
        break;
      case 'PRICE_DESC':
        orderBy = { pricePerDay: 'desc' };
        break;
      case 'POPULAR':
        orderBy = { orderCount: 'desc' };
        break;
    }

    // Ejecutar búsqueda
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          pricePerDay: true,
          images: true,
          realStock: true,
          stockStatus: true,
          canBuyOnDemand: true,
          leadTimeDays: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          featured: true,
          orderCount: true
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products: products.map(p => ({
        ...p,
        price: p.pricePerDay,
        imageUrl: (p.images as string[])?.[0] || null
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Búsqueda rápida para autocompletado
   */
  async quickSearch(query: string, limit: number = 5) {
    if (!query || query.length < 2) {
      return { products: [] };
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        pricePerDay: true,
        images: true,
        category: {
          select: {
            name: true
          }
        }
      },
      take: limit,
      orderBy: {
        orderCount: 'desc'
      }
    });

    return {
      products: products.map(p => ({
        ...p,
        price: p.pricePerDay,
        imageUrl: (p.images as string[])?.[0] || null
      }))
    };
  }

  /**
   * Obtener sugerencias de búsqueda
   */
  async getSuggestions(query: string) {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    // Buscar productos similares
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: 'insensitive' }
      },
      select: {
        name: true,
        tags: true
      },
      take: 10
    });

    // Extraer palabras únicas
    const suggestions = new Set<string>();
    products.forEach(p => {
      // Añadir nombre
      suggestions.add(p.name);
      // Añadir tags
      if (p.tags) {
        (p.tags as string[]).forEach(tag => suggestions.add(tag));
      }
    });

    return {
      suggestions: Array.from(suggestions).slice(0, 5)
    };
  }

  /**
   * Productos relacionados
   */
  async getRelatedProducts(productId: string, limit: number = 4) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        tags: true
      }
    });

    if (!product) {
      return { products: [] };
    }

    const related = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        OR: [
          { categoryId: product.categoryId },
          { tags: { hasSome: product.tags as string[] || [] } }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        pricePerDay: true,
        images: true,
        category: {
          select: {
            name: true
          }
        },
        realStock: true,
        stockStatus: true
      },
      take: limit,
      orderBy: {
        orderCount: 'desc'
      }
    });

    return {
      products: related.map(p => ({
        ...p,
        price: p.pricePerDay,
        imageUrl: (p.images as string[])?.[0] || null
      }))
    };
  }

  /**
   * Productos populares
   */
  async getPopularProducts(limit: number = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        featured: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        pricePerDay: true,
        images: true,
        category: {
          select: {
            name: true
          }
        },
        realStock: true,
        stockStatus: true,
        orderCount: true
      },
      take: limit,
      orderBy: [
        { orderCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return {
      products: products.map(p => ({
        ...p,
        price: p.pricePerDay,
        imageUrl: (p.images as string[])?.[0] || null
      }))
    };
  }
}

export const searchService = new SearchService();
