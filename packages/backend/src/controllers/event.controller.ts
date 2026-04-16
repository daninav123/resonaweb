import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/event.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class EventController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const event = await eventService.create(req.body);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const event = await eventService.getById(req.params.id);
      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const result = await eventService.list({
        phase: req.query.phase as any,
        eventType: req.query.eventType as string,
        search: req.query.search as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        priority: req.query.priority as any,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const event = await eventService.update(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async changePhase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const event = await eventService.changePhase(req.params.id, req.body.phase);
      res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      await eventService.delete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      const stats = await eventService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // ============= SUB-RESOURCES =============
  async addTimelineItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await eventService.addTimelineItem(req.params.id, req.body);
      res.status(201).json(item);
    } catch (error) { next(error); }
  }

  async updateTimelineItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await eventService.updateTimelineItem(req.params.itemId, req.body);
      res.json(item);
    } catch (error) { next(error); }
  }

  async deleteTimelineItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.deleteTimelineItem(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  async toggleTimelineItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await eventService.toggleTimelineItem(req.params.itemId);
      res.json(item);
    } catch (error) { next(error); }
  }

  async addChecklistItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await eventService.addChecklistItem(req.params.id, req.body);
      res.status(201).json(item);
    } catch (error) { next(error); }
  }

  async toggleChecklistItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await eventService.toggleChecklistItem(req.params.itemId, req.user?.firstName);
      res.json(item);
    } catch (error) { next(error); }
  }

  async deleteChecklistItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.deleteChecklistItem(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  async addStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await eventService.addStaff(req.params.id, req.body);
      res.status(201).json(staff);
    } catch (error) { next(error); }
  }

  async updateStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await eventService.updateStaff(req.params.itemId, req.body);
      res.json(staff);
    } catch (error) { next(error); }
  }

  async removeStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.removeStaff(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  async addEquipment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eq = await eventService.addEquipment(req.params.id, req.body);
      res.status(201).json(eq);
    } catch (error) { next(error); }
  }

  async updateEquipment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const eq = await eventService.updateEquipment(req.params.itemId, req.body);
      res.json(eq);
    } catch (error) { next(error); }
  }

  async removeEquipment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.removeEquipment(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const note = await eventService.addNote(req.params.id, {
        ...req.body,
        authorName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      });
      res.status(201).json(note);
    } catch (error) { next(error); }
  }

  async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.deleteNote(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }

  async addIncident(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await eventService.addIncident(req.params.id, req.body);
      res.status(201).json(incident);
    } catch (error) { next(error); }
  }

  async resolveIncident(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await eventService.resolveIncident(req.params.itemId, {
        ...req.body,
        resolvedBy: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      });
      res.json(incident);
    } catch (error) { next(error); }
  }

  async addDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doc = await eventService.addDocument(req.params.id, {
        ...req.body,
        uploadedBy: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
      });
      res.status(201).json(doc);
    } catch (error) { next(error); }
  }

  async removeDocument(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await eventService.removeDocument(req.params.itemId);
      res.json({ success: true });
    } catch (error) { next(error); }
  }
}

export const eventController = new EventController();
