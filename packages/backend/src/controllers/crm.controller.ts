import { Request, Response, NextFunction } from 'express';
import { crmService } from '../services/crm.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class CRMController {
  async listCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const result = await crmService.listCustomers({
        search: req.query.search as string,
        customerType: req.query.customerType as string,
        tag: req.query.tag as string,
        scoringMin: req.query.scoringMin ? parseInt(req.query.scoringMin as string) : undefined,
        scoringMax: req.query.scoringMax ? parseInt(req.query.scoringMax as string) : undefined,
        hasNextFollowUp: req.query.hasNextFollowUp === 'true',
        assignedTo: req.query.assignedTo as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.json(result);
    } catch (error) { next(error); }
  }

  async getCustomerProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const profile = await crmService.getCustomerProfile(req.params.id);
      res.json(profile);
    } catch (error) { next(error); }
  }

  async updateCRM(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const result = await crmService.updateCRM(req.params.id, req.body);
      res.json(result);
    } catch (error) { next(error); }
  }

  async recalculateScoring(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const result = await crmService.recalculateScoring(req.params.id);
      res.json(result);
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const stats = await crmService.getGlobalStats();
      res.json(stats);
    } catch (error) { next(error); }
  }

  async getTags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const tags = await crmService.getAllTags();
      res.json(tags);
    } catch (error) { next(error); }
  }

  // Comunicaciones
  async addCommunication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const comm = await crmService.addCommunication(req.params.id, {
        ...req.body,
        authorName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      });
      res.status(201).json(comm);
    } catch (error) { next(error); }
  }

  async getCommunications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const comms = await crmService.getCommunications(req.params.id);
      res.json(comms);
    } catch (error) { next(error); }
  }

  // Tareas
  async addTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const task = await crmService.addTask(req.params.id, {
        ...req.body,
        authorName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      });
      res.status(201).json(task);
    } catch (error) { next(error); }
  }

  async toggleTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const task = await crmService.toggleTask(req.params.taskId, req.user ? `${req.user.firstName}` : 'Admin');
      res.json(task);
    } catch (error) { next(error); }
  }

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      await crmService.deleteTask(req.params.taskId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }
}

export const crmController = new CRMController();
