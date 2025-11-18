import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
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
      let where: any = {};
      
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
      const product = await productService.createProduct(req.body);
      
      res.status(201).json({
        message: 'Producto creado exitosamente',
        data: product,
      });
    } catch (error) {
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
}

export const productController = new ProductController();
