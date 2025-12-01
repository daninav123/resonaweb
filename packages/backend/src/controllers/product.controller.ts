import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { productPackService } from '../services/productPack.service';
import { prisma } from '../index';

export class ProductController {
  /**
   * Get all products
   */
  async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      const sort = req.query.sort as string;
      const categorySlug = req.query.category as string;
      
      let orderBy: any = { createdAt: 'desc' };
      
      if (sort) {
        switch (sort) {
          case 'price_asc':
            orderBy = { pricePerDay: 'asc' };
            break;
          case 'price_desc':
            orderBy = { pricePerDay: 'desc' };
            break;
          case 'name_asc':
          case 'name':
            orderBy = { name: 'asc' };
            break;
          case 'popular':
            orderBy = { viewCount: 'desc' };
            break;
          case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
          case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        }
      }

      // Build where clause
      let where: any = {
        isPack: false, // Excluir packs de la lista de productos
      };
      
      // Filter by category slug if provided
      if (categorySlug) {
        console.log('🔍 Buscando categoría con slug:', categorySlug);
        // First, find the category by slug
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug }
        });
        
        if (category) {
          console.log('✅ Categoría encontrada:', category.name, 'ID:', category.id);
          where.categoryId = category.id;
        } else {
          console.log('❌ No se encontró categoría con slug:', categorySlug);
        }
      }

      console.log('📦 Where clause para productos:', where);
      const result = await productService.getAllProducts({
        skip,
        take: limit,
        orderBy,
        where,
      });

      console.log('✅ Productos retornados:', result.data?.length || 0);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 8;
      const products = await productService.getFeaturedProducts(limit);
      
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search products
   */
  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        q,
        category,
        minPrice,
        maxPrice,
        inStock,
        featured,
        tags,
        page = 1,
        limit = 20,
        sort = 'newest',
      } = req.query;

      const skip = ((Number(page) || 1) - 1) * (Number(limit) || 20);

      const result = await productService.searchProducts({
        query: q as string,
        categoryId: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock === 'true',
        featured: featured === 'true',
        tags: tags ? (tags as string).split(',') : undefined,
        skip,
        take: Number(limit),
        sortBy: sort as any,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      
      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);
      
      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const includeSubcategories = req.query.includeSubcategories === 'true';

      const result = await productService.getProductsByCategory(categoryId, {
        skip,
        take: limit,
        includeSubcategories,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 4;
      
      const products = await productService.getRelatedProducts(id, limit);
      
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create product (admin only)
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('📥 Datos recibidos para crear producto:', JSON.stringify(req.body, null, 2));
      const product = await productService.createProduct(req.body);
      console.log('✅ Producto creado exitosamente:', product.id);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        data: product,
      });
    } catch (error: any) {
      console.error('❌ Error en createProduct controller:');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.meta) console.error('Error meta:', error.meta);
      next(error);
    }
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      
      res.json({
        message: 'Producto actualizado exitosamente',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const force = req.query.force === 'true';
      
      console.log(`🗑️  DELETE REQUEST: Product ${id}, force: ${force}`);
      
      const result = await productService.deleteProduct(id, force);
      
      console.log(`✅ DELETE SUCCESS: Product ${id}`);
      res.json(result);
    } catch (error: any) {
      console.error(`❌ DELETE ERROR: Product ${id}`, {
        message: error.message,
        code: error.code,
        stack: error.stack?.substring(0, 500),
      });
      next(error);
    }
  }

  /**
   * Update product stock (admin only)
   */
  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;
      
      const product = await productService.updateStock(id, quantity, operation);
      
      res.json({
        message: `Stock ${operation === 'increase' ? 'aumentado' : 'reducido'} exitosamente`,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update prices (admin only)
   */
  async bulkUpdatePrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;
      const results = await productService.bulkUpdatePrices(updates);
      
      res.json({
        message: `${results.length} productos actualizados`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check product availability for specific dates
   */
  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, startDate, endDate, quantity } = req.body;

      if (!productId || !startDate || !endDate || !quantity) {
        return res.status(400).json({
          available: false,
          message: 'Faltan parámetros requeridos'
        });
      }

      // Get product
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        return res.status(404).json({
          available: false,
          message: 'Producto no encontrado'
        });
      }

      // Check if dates are more than 30 days away
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const daysUntilEvent = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // If more than 30 days, always available (time to acquire stock)
      if (daysUntilEvent > 30) {
        return res.json({
          available: true,
          message: 'Reserva con suficiente antelación',
          availableQuantity: quantity,
          daysUntilEvent
        });
      }

      // For dates within 30 days, check real availability
      const overlappingItems = await prisma.orderItem.findMany({
        where: {
          productId,
          order: {
            status: { in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] },
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        },
        select: { quantity: true }
      });

      const reservedStock = overlappingItems.reduce((sum, item) => sum + item.quantity, 0);
      const currentStock = product.realStock ?? product.stock ?? 0;
      const availableQuantity = currentStock - reservedStock;

      if (availableQuantity >= quantity) {
        return res.json({
          available: true,
          message: 'Producto disponible',
          availableQuantity,
          requestedQuantity: quantity
        });
      } else {
        return res.json({
          available: false,
          message: `${product.name} no disponible para las fechas seleccionadas`,
          availableQuantity: Math.max(0, availableQuantity),
          requestedQuantity: quantity
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      next(error);
    }
  }

  /**
   * Añadir componentes a un pack (ADMIN)
   */
  async addComponentsToPack(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { components } = req.body;

      const pack = await productPackService.addComponentsToPack(id, components);

      res.json({
        message: 'Componentes añadidos al pack',
        pack,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener pack con sus componentes
   */
  async getPackWithComponents(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const pack = await productPackService.getPackWithComponents(id);

      res.json({ pack });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de pack
   */
  async checkPackAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate, quantity } = req.body;

      const availability = await productPackService.checkPackAvailability(
        id,
        new Date(startDate),
        new Date(endDate),
        quantity || 1
      );

      res.json(availability);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener máximo disponible de un pack
   */
  async getPackMaxAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const result = await productPackService.getPackMaxAvailability(
        id,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los packs
   */
  async getAllPacks(req: Request, res: Response, next: NextFunction) {
    try {
      const includeComponents = req.query.includeComponents === 'true';
      const packs = await productPackService.getAllPacks(includeComponents);

      res.json({ packs });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
