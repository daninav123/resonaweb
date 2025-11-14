import { Request, Response, NextFunction } from 'express';
import { orderService } from '../services/order.service';
import { AppError } from '../middleware/error.middleware';
import { OrderStatus, PaymentStatus } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}

export class OrderController {
  /**
   * Create a new order
   */
  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const orderData = {
        userId: req.user.id,
        ...req.body,
      };

      const order = await orderService.createOrder(orderData);

      res.status(201).json({
        message: 'Pedido creado exitosamente',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's orders
   */
  async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await orderService.getUserOrders(req.user.id, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

      const order = await orderService.getOrderById(id, userId);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(OrderStatus).includes(status)) {
        throw new AppError(400, 'Estado inválido', 'INVALID_STATUS');
      }

      // Only admin can update any order
      const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;

      const order = await orderService.updateOrderStatus(id, status, userId);
      
      res.json({
        message: 'Estado del pedido actualizado',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const { reason } = req.body;

      const order = await orderService.cancelOrder(id, req.user.id, reason);
      
      res.json({
        message: 'Pedido cancelado exitosamente',
        order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const filters: any = {};
      if (req.query.status) filters.status = req.query.status as OrderStatus;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus as PaymentStatus;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);
      if (req.query.search) filters.search = req.query.search as string;

      const result = await orderService.getAllOrders(filters, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order statistics (admin only)
   */
  async getOrderStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      const stats = await orderService.getOrderStats(period);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming events (admin only)
   */
  async getUpcomingEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const days = parseInt(req.query.days as string) || 7;
      const events = await orderService.getUpcomingEvents(days);
      res.json(events);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
