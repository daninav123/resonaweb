import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All analytics routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPERADMIN'));

// Dashboard stats
router.get('/dashboard', analyticsController.getDashboardStats);

// Charts and graphs
router.get('/revenue-chart', analyticsController.getRevenueChart);
router.get('/order-status', analyticsController.getOrderStatusDistribution);

// Top lists
router.get('/top-products', analyticsController.getTopProducts);
router.get('/top-customers', analyticsController.getTopCustomers);

// Calendar and events
router.get('/events-calendar', analyticsController.getUpcomingEventsCalendar);

// Inventory
router.get('/inventory-utilization', analyticsController.getInventoryUtilization);

// Performance
router.get('/performance-metrics', analyticsController.getPerformanceMetrics);
router.get('/rental-periods', analyticsController.getPopularRentalPeriods);

export { router as analyticsRouter };
