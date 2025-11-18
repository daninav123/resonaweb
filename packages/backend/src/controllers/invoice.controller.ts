import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { AppError } from '../middleware/error.middleware';

interface AuthRequest extends Request {
  user?: any;
}

export class InvoiceController {
  /**
   * Generate invoice for order
   */
  async generateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { orderId } = req.params;

      if (!orderId) {
        throw new AppError(400, 'Order ID requerido', 'MISSING_DATA');
      }

      const invoice = await invoiceService.generateInvoice(orderId);

      res.status(201).json({
        message: 'Factura generada exitosamente',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      const invoice = await invoiceService.getInvoiceById(id);

      // Check if user has access to this invoice
      if (req.user.role !== 'ADMIN' && invoice.order.userId !== req.user.id) {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      res.json(invoice);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      
      // Get invoice to check permissions
      const invoice = await invoiceService.getInvoiceById(id);
      
      if (req.user.role !== 'ADMIN' && invoice.order.userId !== req.user.id) {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const pdfBuffer = await invoiceService.downloadInvoice(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send invoice by email
   */
  async sendInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      const { id } = req.params;
      
      // Get invoice to check permissions
      const invoice = await invoiceService.getInvoiceById(id);
      
      if (req.user.role !== 'ADMIN' && invoice.order.userId !== req.user.id) {
        throw new AppError(403, 'Acceso denegado', 'FORBIDDEN');
      }

      const result = await invoiceService.sendInvoiceEmail(id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      const { paymentDate } = req.body;

      const invoice = await invoiceService.markInvoiceAsPaid(
        id,
        paymentDate ? new Date(paymentDate) : undefined
      );

      res.json({
        message: 'Factura marcada como pagada',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
