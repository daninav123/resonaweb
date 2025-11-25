/**
 * ORDER EXPIRATION API ROUTES
 * 
 * Endpoints para administradores para gestionar la expiración de pedidos.
 * Solo accesible por usuarios con rol ADMIN.
 */

import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { orderExpirationService } from '../services/orderExpiration.service';
// import { orderExpirationScheduler } from '../schedulers/orderExpiration.scheduler'; // DESACTIVADO TEMPORALMENTE
import { logger } from '../utils/logger';

// Aliases para compatibilidad
const auth = authenticate;
const adminAuth = authorize('ADMIN');

const router = Router();

/**
 * GET /api/v1/order-expiration/stats
 * Obtener estadísticas de expiración de pedidos
 */
router.get('/stats', auth, adminAuth, async (req: Request, res: Response) => {
  try {
    const stats = await orderExpirationService.getExpirationStats();
    // const schedulerStatus = orderExpirationScheduler.getStatus(); // DESACTIVADO

    res.json({
      success: true,
      data: {
        ...stats,
        scheduler: { status: 'disabled', message: 'Scheduler temporalmente desactivado' }
      }
    });
  } catch (error: any) {
    logger.error('Error getting expiration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/order-expiration/run-now
 * Ejecutar verificación de expiración manualmente
 */
router.post('/run-now', auth, adminAuth, async (req: Request, res: Response) => {
  try {
    logger.info(`Manual expiration check triggered by admin user: ${req.user?.id}`);
    
    // const result = await orderExpirationScheduler.runNow(); // DESACTIVADO

    res.json({
      success: false,
      message: 'Scheduler temporalmente desactivado',
      data: null
    });
  } catch (error: any) {
    logger.error('Error running manual expiration check:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al ejecutar verificación'
    });
  }
});

/**
 * POST /api/v1/order-expiration/expire/:orderId
 * Expirar un pedido específico manualmente
 */
router.post('/expire/:orderId', auth, adminAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    logger.info(`Manual order expiration triggered by admin: ${req.user?.id} for order: ${orderId}`);

    await orderExpirationService.expireOrderById(orderId, reason);

    res.json({
      success: true,
      message: `Pedido ${orderId} expirado exitosamente`
    });
  } catch (error: any) {
    logger.error(`Error expiring order ${req.params.orderId}:`, error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al expirar pedido'
    });
  }
});

/**
 * GET /api/v1/order-expiration/scheduler/status
 * Obtener estado del scheduler
 */
router.get('/scheduler/status', auth, adminAuth, async (req: Request, res: Response) => {
  try {
    // const status = orderExpirationScheduler.getStatus(); // DESACTIVADO

    res.json({
      success: true,
      data: { status: 'disabled', message: 'Scheduler temporalmente desactivado' }
    });
  } catch (error: any) {
    logger.error('Error getting scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del scheduler'
    });
  }
});

export default router;
