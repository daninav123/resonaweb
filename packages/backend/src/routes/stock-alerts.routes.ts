import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/stock-alerts', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res) => {
  try {
    // Obtener pedidos confirmados futuros
    const orders = await prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        startDate: { gte: new Date() }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const alerts: any[] = [];
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        
        // Calcular stock disponible para esa fecha
        const overlappingItems = await prisma.orderItem.findMany({
          where: {
            productId: product.id,
            order: {
              status: { in: ['CONFIRMED', 'DELIVERED'] },
              startDate: { lte: order.endDate },
              endDate: { gte: order.startDate },
              id: { not: order.id }
            }
          },
          select: { quantity: true }
        });

        const reservedStock = overlappingItems.reduce((sum, item) => sum + item.quantity, 0);
        
        const availableStock = (product.realStock || product.stock) - reservedStock;
        const deficit = item.quantity - availableStock;

        if (deficit > 0) {
          alerts.push({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            orderId: order.id,
            orderNumber: order.orderNumber,
            startDate: order.startDate,
            endDate: order.endDate,
            quantityRequested: item.quantity,
            availableStock: Math.max(0, availableStock),
            deficit,
            priority: deficit > 5 ? 'high' : deficit > 2 ? 'medium' : 'low'
          });
        }
      }
    }

    const summary = {
      totalAlerts: alerts.length,
      highPriority: alerts.filter(a => a.priority === 'high').length,
      totalDeficit: alerts.reduce((sum, a) => sum + a.deficit, 0),
      estimatedCost: 0
    };

    res.json({ alerts, summary });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

export { router as stockAlertsRouter };
