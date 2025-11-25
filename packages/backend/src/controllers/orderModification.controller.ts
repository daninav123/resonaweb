import { Request, Response, NextFunction } from 'express';
import { orderModificationService } from '../services/orderModification.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

class OrderModificationController {
  /**
   * Verificar si se puede modificar
   */
  async checkCanModify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const result = await orderModificationService.canModifyOrder(orderId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Añadir items
   */
  async addItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      
      const { orderId } = req.params;
      const { items, reason } = req.body;

      const order = await orderModificationService.addItems(orderId, items, req.user.id, reason);
      
      res.json({ message: 'Items añadidos correctamente', order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar items
   */
  async removeItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      
      const { orderId } = req.params;
      const { itemIds, reason } = req.body;

      const order = await orderModificationService.removeItems(orderId, itemIds, req.user.id, reason);
      
      res.json({ message: 'Items eliminados correctamente', order });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancelar con reembolso
   */
  async cancelWithRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await orderModificationService.cancelWithRefund(orderId, req.user.id, reason);
      
      res.json({ 
        message: 'Pedido cancelado',
        order,
        refund: {
          amount: order.refundAmount,
          status: order.refundStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener payment intent para modificación
   */
  async getPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      
      const { orderId } = req.params;
      const { modificationId } = req.query;

      const paymentIntent = await orderModificationService.getPaymentIntent(
        orderId, 
        modificationId as string
      );
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aprobar reembolso (ADMIN ONLY)
   */
  async approveRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores pueden aprobar reembolsos', 'FORBIDDEN');
      }
      
      const { modificationId } = req.params;
      
      const result = await orderModificationService.approveRefund(
        modificationId,
        req.user.id
      );
      
      res.json({
        message: 'Reembolso aprobado y procesado',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener reembolsos pendientes (ADMIN ONLY)
   */
  async getPendingRefunds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'No autenticado', 'NOT_AUTH');
      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }
      
      const pendingRefunds = await orderModificationService.getPendingRefunds();
      
      res.json({
        refunds: pendingRefunds,
        count: pendingRefunds.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderModificationController = new OrderModificationController();
