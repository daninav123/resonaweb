import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class AnalyticsController {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const stats = await analyticsService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const days = parseInt(req.query.days as string) || 30;
      const data = await analyticsService.getRevenueChart(days);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top products
   */
  async getTopProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const products = await analyticsService.getTopProducts(limit);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top customers
   */
  async getTopCustomers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const customers = await analyticsService.getTopCustomers(limit);
      res.json(customers);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const distribution = await analyticsService.getOrderStatusDistribution();
      res.json(distribution);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get upcoming events calendar
   */
  async getUpcomingEventsCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const days = parseInt(req.query.days as string) || 30;
      const events = await analyticsService.getUpcomingEventsCalendar(days);
      res.json(events);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory utilization
   */
  async getInventoryUtilization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const utilization = await analyticsService.getInventoryUtilization();
      res.json(utilization);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const metrics = await analyticsService.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular rental periods
   */
  async getPopularRentalPeriods(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const periods = await analyticsService.getPopularRentalPeriods();
      res.json(periods);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complete dashboard data in a single request
   */
  async getCompleteDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      // Fetch all dashboard data in parallel
      const [
        stats,
        metrics,
        topProducts,
        topCustomers,
        upcomingEvents,
        revenueChart,
        statusDistribution,
        inventoryUtilization,
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getTopProducts(5),
        analyticsService.getTopCustomers(5),
        analyticsService.getUpcomingEventsCalendar(30),
        analyticsService.getRevenueChart(30),
        analyticsService.getOrderStatusDistribution(),
        analyticsService.getInventoryUtilization(),
      ]);

      // Get recent orders
      const recentOrders = await analyticsService.getRecentOrders(10);

      res.json({
        stats,
        metrics,
        topProducts,
        topCustomers,
        upcomingEvents,
        revenueChart,
        statusDistribution,
        inventoryUtilization,
        recentOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product amortization data
   */
  async getProductAmortization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const amortizationData = await analyticsService.getProductAmortization();
      res.json(amortizationData);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
