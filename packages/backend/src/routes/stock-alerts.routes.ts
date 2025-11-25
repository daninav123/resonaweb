import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { stockAlertService } from '../services/stockAlert.service';

const router = Router();

router.get('/stock-alerts', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const result = await stockAlertService.getStockAlerts();
    res.json(result);
  } catch (error: any) {
    console.error('Error getting stock alerts:', error);
    res.status(500).json({ error: 'Error al obtener alertas de stock' });
  }
});

router.get('/stock-alerts/product/:productId', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const { productId } = req.params;
    const alerts = await stockAlertService.getAlertsByProduct(productId);
    res.json({ alerts });
  } catch (error: any) {
    console.error('Error getting product alerts:', error);
    res.status(500).json({ error: 'Error al obtener alertas del producto' });
  }
});

router.post('/stock-alerts/mark-for-purchase', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    const count = await stockAlertService.markProductsForPurchase();
    res.json({ message: `${count} productos marcados para compra`, count });
  } catch (error: any) {
    console.error('Error marking products for purchase:', error);
    res.status(500).json({ error: 'Error al marcar productos para compra' });
  }
});

export { router as stockAlertsRouter };
