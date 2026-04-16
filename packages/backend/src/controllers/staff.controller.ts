import { Request, Response, NextFunction } from 'express';
import { staffService } from '../services/staff.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request { user?: any; }

export const staffController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const result = await staffService.list({ search: req.query.search as string, type: req.query.type as string, status: req.query.status as string, page: parseInt(req.query.page as string) || 1, limit: parseInt(req.query.limit as string) || 20 });
      res.json(result);
    } catch (e) { next(e); }
  },
  getById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.getById(req.params.id)); } catch (e) { next(e); }
  },
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json(await staffService.create(req.body)); } catch (e) { next(e); }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.update(req.params.id, req.body)); } catch (e) { next(e); }
  },
  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { await staffService.delete(req.params.id); res.json({ success: true }); } catch (e) { next(e); }
  },
  addAvailability: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json(await staffService.addAvailability(req.params.id, req.body)); } catch (e) { next(e); }
  },
  deleteAvailability: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { await staffService.deleteAvailability(req.params.availId); res.json({ success: true }); } catch (e) { next(e); }
  },
  addWorkLog: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json(await staffService.addWorkLog(req.params.id, req.body)); } catch (e) { next(e); }
  },
  toggleWorkLogPaid: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.toggleWorkLogPaid(req.params.logId)); } catch (e) { next(e); }
  },
  getStats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.getStats()); } catch (e) { next(e); }
  },
  getMonthlyReport: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      res.json(await staffService.getMonthlyReport(req.params.id, year, month));
    } catch (e) { next(e); }
  },
  getAvailabilityCalendar: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      res.json(await staffService.getAvailabilityCalendar(year, month));
    } catch (e) { next(e); }
  },
  bulkAddAvailability: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json(await staffService.bulkAddAvailability(req.params.id, req.body.startDate, req.body.endDate, req.body.type, req.body.notes)); } catch (e) { next(e); }
  },
  getAvailableForEvent: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.getAvailableForEvent(req.query.date as string, req.query.specialty as string)); } catch (e) { next(e); }
  },
  getExpiringDocuments: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json(await staffService.getExpiringDocuments(parseInt(req.query.days as string) || 30)); } catch (e) { next(e); }
  },
};
