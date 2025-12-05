import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { InstallmentService } from '../services/installment.service';
import Stripe from 'stripe';

interface AuthRequest extends Request {
  user?: any;
}

const prisma = new PrismaClient();
const installmentService = new InstallmentService(prisma);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

/**
 * Obtener todos los plazos de un pedido
 */
export const getOrderInstallments = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    const userId = req.user.id;

    // Verificar que el pedido pertenece al usuario
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true, eligibleForInstallments: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (!order.eligibleForInstallments) {
      return res.status(400).json({ message: 'Este pedido no tiene pagos en plazos' });
    }

    const installments = await installmentService.getInstallmentsByOrder(orderId);
    const summary = await installmentService.getInstallmentsSummary(orderId);

    res.json({
      installments,
      summary
    });
  } catch (error) {
    console.error('Error al obtener plazos:', error);
    res.status(500).json({ message: 'Error al obtener plazos' });
  }
};

/**
 * Crear Payment Intent de Stripe para un plazo
 */
export const createInstallmentPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const { installmentId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    const userId = req.user.id;

    // Obtener el plazo con el pedido
    const installment = await prisma.paymentInstallment.findUnique({
      where: { id: installmentId },
      include: {
        order: {
          include: {
            user: true
          }
        }
      }
    });

    if (!installment) {
      return res.status(404).json({ message: 'Plazo no encontrado' });
    }

    if (installment.order.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (installment.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Este plazo ya está pagado' });
    }

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(installment.amount) * 100), // Convertir a centavos
      currency: 'eur',
      metadata: {
        installmentId: installment.id,
        orderId: installment.orderId,
        orderNumber: installment.order.orderNumber,
        installmentNumber: installment.installmentNumber.toString(),
        userId: userId
      },
      description: `Plazo ${installment.installmentNumber}/3 - Pedido #${installment.order.orderNumber}`,
      receipt_email: installment.order.user.email
    });

    // Guardar el Payment Intent ID
    await prisma.paymentInstallment.update({
      where: { id: installmentId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PROCESSING'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: installment.amount
    });
  } catch (error: any) {
    console.error('Error al crear Payment Intent:', error);
    res.status(500).json({ 
      message: 'Error al crear Payment Intent',
      error: error.message 
    });
  }
};

/**
 * Confirmar pago de un plazo (webhook de Stripe)
 */
export const confirmInstallmentPayment = async (req: Request, res: Response) => {
  try {
    const { installmentId } = req.params;
    const { paymentIntentId, chargeId } = req.body;

    await installmentService.markInstallmentAsPaid(
      installmentId,
      paymentIntentId,
      chargeId
    );

    // Verificar si todos los plazos están pagados
    const installment = await prisma.paymentInstallment.findUnique({
      where: { id: installmentId },
      select: { orderId: true }
    });

    if (installment) {
      const allPaid = await installmentService.areAllInstallmentsPaid(installment.orderId);
      
      if (allPaid) {
        // Actualizar el estado del pedido
        await prisma.order.update({
          where: { id: installment.orderId },
          data: {
            paymentStatus: 'COMPLETED'
          }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ message: 'Error al confirmar pago' });
  }
};

/**
 * Obtener el siguiente plazo pendiente de un pedido
 */
export const getNextPendingInstallment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    
    const userId = req.user.id;

    // Verificar que el pedido pertenece al usuario
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true }
    });

    if (!order || order.userId !== userId) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const nextInstallment = await installmentService.getNextPendingInstallment(orderId);

    res.json(nextInstallment);
  } catch (error) {
    console.error('Error al obtener siguiente plazo:', error);
    res.status(500).json({ message: 'Error al obtener siguiente plazo' });
  }
};
