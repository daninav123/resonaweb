import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class CustomerController {
  /**
   * Get customer profile
   */
  async getCustomerProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const customerId = id || req.user.id;

      // Only admins can view other users' profiles
      if (id && id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const profile = await customerService.getCustomerProfile(customerId);
      res.json(profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer history
   */
  async getCustomerHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const customerId = id || req.user.id;

      // Only admins can view other users' history
      if (id && id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await customerService.getCustomerHistory(customerId, page, limit);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer statistics
   */
  async getCustomerStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const customerId = id || req.user.id;

      // Only admins can view other users' stats
      if (id && id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const stats = await customerService.getCustomerStats(customerId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add customer note (admin only)
   */
  async addCustomerNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      const { note } = req.body;

      if (!note) {
        throw new AppError(400, 'Nota requerida', 'NOTE_REQUIRED');
      }

      const result = await customerService.addCustomerNote({
        userId: id,
        note,
        createdBy: req.user.id,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer notes
   */
  async getCustomerNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      const notes = await customerService.getCustomerNotes(id);
      res.json(notes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set customer status (admin only)
   */
  async setCustomerStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        throw new AppError(400, 'Estado inválido', 'INVALID_STATUS');
      }

      const result = await customerService.setCustomerStatus(id, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get customer documents
   */
  async getCustomerDocuments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const customerId = id || req.user.id;

      // Only admins can view other users' documents
      if (id && id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const documents = await customerService.getCustomerDocuments(customerId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search customers (admin only)
   */
  async searchCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { q, query } = req.query;
      const searchQuery = (q || query || '') as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const results = await customerService.searchCustomers(searchQuery, page, limit);
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export customer data (GDPR)
   */
  async exportCustomerData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const customerId = id || req.user.id;

      // Users can only export their own data, unless admin
      if (id && id !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'No autorizado', 'FORBIDDEN');
      }

      const data = await customerService.exportCustomerData(customerId);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="customer-data-${customerId}.json"`);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
