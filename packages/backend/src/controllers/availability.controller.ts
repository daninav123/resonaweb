import { Request, Response, NextFunction } from 'express';
import { availabilityService } from '../services/availability.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request { user?: any; }

export const availabilityController = {
  getGlobal: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const categoryId = req.query.categoryId as string | undefined;
      res.json(await availabilityService.getGlobalAvailability(startDate, endDate, categoryId));
    } catch (e) { next(e); }
  },

  getCalendar: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const { productId } = req.params;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      res.json(await availabilityService.getAvailabilityCalendar(productId, year, month));
    } catch (e) { next(e); }
  },

  getSummary: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const { productId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      res.json(await availabilityService.getProductAvailabilitySummary(productId, days));
    } catch (e) { next(e); }
  },

  check: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const { productId } = req.params;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const quantity = parseInt(req.query.quantity as string) || 1;
      const available = await availabilityService.checkProductAvailability(productId, startDate, endDate, quantity);
      res.json({ available });
    } catch (e) { next(e); }
  },

  getPopularDates: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const limit = parseInt(req.query.limit as string) || 10;
      res.json(await availabilityService.getPopularDates(limit));
    } catch (e) { next(e); }
  },
};
