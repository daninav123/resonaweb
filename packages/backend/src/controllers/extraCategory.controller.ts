import { Request, Response, NextFunction } from 'express';
import { extraCategoryService } from '../services/extraCategory.service';

export class ExtraCategoryController {
  /**
   * Obtener todas las categorías
   */
  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await extraCategoryService.getAllCategories(includeInactive);
      
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener categoría por ID
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await extraCategoryService.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear categoría
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, icon, color, description, order } = req.body;
      
      // Validaciones
      if (!name || !slug) {
        return res.status(400).json({ message: 'Nombre y slug son requeridos' });
      }
      
      // Verificar si ya existe
      const existing = await extraCategoryService.getCategoryBySlug(slug);
      if (existing) {
        return res.status(400).json({ message: 'Ya existe una categoría con ese slug' });
      }
      
      const category = await extraCategoryService.createCategory({
        name,
        slug,
        icon,
        color,
        description,
        order
      });
      
      res.status(201).json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, slug, icon, color, description, order, isActive } = req.body;
      
      const category = await extraCategoryService.updateCategory(id, {
        name,
        slug,
        icon,
        color,
        description,
        order,
        isActive
      });
      
      res.json({ category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await extraCategoryService.deleteCategory(id);
      
      res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reordenar categorías
   */
  async reorderCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryOrders } = req.body;
      
      if (!Array.isArray(categoryOrders)) {
        return res.status(400).json({ message: 'Se esperaba un array de órdenes' });
      }
      
      await extraCategoryService.reorderCategories(categoryOrders);
      
      res.json({ message: 'Categorías reordenadas correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar categoría a productos
   */
  async assignCategoryToProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, productIds } = req.body;
      
      if (!categoryId || !Array.isArray(productIds)) {
        return res.status(400).json({ message: 'categoryId y productIds son requeridos' });
      }
      
      await extraCategoryService.assignCategoryToProducts(categoryId, productIds);
      
      res.json({ message: 'Productos actualizados correctamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener productos sin categoría
   */
  async getUncategorizedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await extraCategoryService.getUncategorizedProducts();
      
      res.json({ products });
    } catch (error) {
      next(error);
    }
  }
}

export const extraCategoryController = new ExtraCategoryController();
