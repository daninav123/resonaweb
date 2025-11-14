import { Request, Response, NextFunction } from 'express';
import { logisticsService } from '../services/logistics.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class LogisticsController {
  /**
   * Plan delivery routes
   */
  async planDeliveryRoutes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { date } = req.query;
      const planDate = date ? new Date(date as string) : new Date();

      const routes = await logisticsService.planDeliveryRoutes(planDate);
      res.json(routes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign vehicle to order
   */
  async assignVehicle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { orderId, vehicleId } = req.body;

      if (!orderId || !vehicleId) {
        throw new AppError(400, 'Datos incompletos', 'MISSING_DATA');
      }

      const result = await logisticsService.assignVehicle(orderId, vehicleId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign driver
   */
  async assignDriver(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { orderId, driverId } = req.body;

      if (!orderId || !driverId) {
        throw new AppError(400, 'Datos incompletos', 'MISSING_DATA');
      }

      const result = await logisticsService.assignDriver(orderId, driverId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate delivery note
   */
  async generateDeliveryNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;
      const note = await logisticsService.generateDeliveryNote(orderId);
      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track delivery
   */
  async trackDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tracking = await logisticsService.trackDelivery(id);
      res.json(tracking);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm delivery
   */
  async confirmDelivery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;
      const { signature } = req.body;

      if (!signature) {
        throw new AppError(400, 'Firma requerida', 'SIGNATURE_REQUIRED');
      }

      const result = await logisticsService.confirmDelivery(orderId, signature);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm pickup
   */
  async confirmPickup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;
      const result = await logisticsService.confirmPickup(orderId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get delivery schedule
   */
  async getDeliverySchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { date } = req.query;
      const scheduleDate = date ? new Date(date as string) : new Date();

      const schedule = await logisticsService.getDeliverySchedule(scheduleDate);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available vehicles
   */
  async getAvailableVehicles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { date } = req.query;
      const checkDate = date ? new Date(date as string) : new Date();

      const vehicles = await logisticsService.getAvailableVehicles(checkDate);
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get return schedule
   */
  async getReturnSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { date } = req.query;
      const returnDate = date ? new Date(date as string) : new Date();

      const schedule = await logisticsService.getReturnSchedule(returnDate);
      res.json(schedule);
    } catch (error) {
      next(error);
    }
  }
}

export const logisticsController = new LogisticsController();
