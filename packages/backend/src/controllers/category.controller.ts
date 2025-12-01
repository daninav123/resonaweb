import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';

export class CategoryController {
  /**
   * Get all categories
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const parentId = req.query.parentId as string | undefined;
      // Si es admin, incluir categorías ocultas
      const includeHidden = (req as any).user?.role === 'ADMIN' || (req as any).user?.role === 'SUPERADMIN';

      console.log('📦 Fetching todas las categorías...');
      const categories = await categoryService.getAllCategories({
        includeInactive,
        parentId: parentId === 'null' ? null : parentId,
        includeHidden,
      });

      console.log(`✅ Categorías encontradas: ${categories?.length || 0}`);
      res.json({ data: categories });
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      next(error);
    }
  }

  /**
   * Get category tree
   */
  async getCategoryTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await categoryService.getCategoryTree();
      res.json({ data: tree });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const includeProducts = req.query.includeProducts === 'true';

      const category = await categoryService.getCategoryById(id, includeProducts);

      res.json({ data: category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const includeProducts = req.query.includeProducts === 'true';

      const category = await categoryService.getCategoryBySlug(slug, includeProducts);

      res.json({ data: category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create category
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);

      res.status(201).json({
        message: 'Categoría creada exitosamente',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.updateCategory(id, req.body);

      res.json({
        message: 'Categoría actualizada exitosamente',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const force = req.query.force === 'true';

      const result = await categoryService.deleteCategory(id, force);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { orders } = req.body;
      const result = await categoryService.reorderCategories(orders);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
