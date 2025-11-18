import { Request, Response, NextFunction } from 'express';
import { searchService } from '../services/search.service';

export class SearchController {
  /**
   * Búsqueda de productos con filtros
   */
  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        q: query,
        categories,
        minPrice,
        maxPrice,
        availability,
        sortBy,
        page,
        limit
      } = req.query;

      const filters = {
        query: query as string,
        categories: categories ? (categories as string).split(',') : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        availability: availability as any,
        sortBy: sortBy as any,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20
      };

      const results = await searchService.searchProducts(filters);

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Búsqueda rápida para autocompletado
   */
  async quickSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const { q: query, limit } = req.query;

      const results = await searchService.quickSearch(
        query as string,
        limit ? Number(limit) : 5
      );

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sugerencias de búsqueda
   */
  async getSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const { q: query } = req.query;

      const results = await searchService.getSuggestions(query as string);

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Productos relacionados
   */
  async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit } = req.query;

      const results = await searchService.getRelatedProducts(
        id,
        limit ? Number(limit) : 4
      );

      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Productos populares
   */
  async getPopularProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;

      const results = await searchService.getPopularProducts(
        limit ? Number(limit) : 8
      );

      res.json(results);
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
