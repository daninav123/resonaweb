import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../services/invoice.service';
import { facturaeService } from '../services/facturae.service';
import { AppError } from '../middleware/error.middleware';
import archiver from 'archiver';
import { PDFDocument } from 'pdfkit';

interface AuthRequest extends Request {
  user?: any;
}

export class InvoiceController {
  /**
   * Create manual invoice (Admin only - for non-web events)
   */
  async createManualInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores pueden crear facturas manuales', 'FORBIDDEN');
      }

      const invoiceData = req.body;

      if (!invoiceData.customer || !invoiceData.items || !invoiceData.total) {
        throw new AppError(400, 'Datos de factura incompletos', 'MISSING_DATA');
      }

      const invoice = await invoiceService.createManualInvoice(invoiceData);

      res.status(201).json({
        message: 'Factura manual creada exitosamente',
        invoice,
      });
    } catch (error) {
      next(error);
    }
  }

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

  /**
   * Generate Facturae XML for invoice
   */
  async generateFacturae(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;

      // Generate XML
      const xml = await facturaeService.generateFacturae(id);
      
      // Save to file
      const url = await facturaeService.saveFacturaeToFile(id);

      res.json({
        message: 'Facturae XML generado exitosamente',
        facturaeUrl: url,
        generated: true,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download Facturae XML
   */
  async downloadFacturae(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { id } = req.params;
      
      // Get invoice with XML
      const invoice = await invoiceService.getInvoiceById(id);
      
      if (!invoice.facturaeXml) {
        throw new AppError(404, 'Facturae XML no generado aún', 'XML_NOT_FOUND');
      }

      res.set({
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="factura_${invoice.invoiceNumber}.xml"`,
      });

      res.send(invoice.facturaeXml);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all invoices (Admin)
   */
  async getAllInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const invoices = await invoiceService.getAllInvoices();

      res.json({
        invoices,
        total: invoices.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download all invoices as ZIP within date range
   */
  async downloadAllInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'No autenticado', 'NOT_AUTHENTICATED');
      }

      if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
        throw new AppError(403, 'Solo administradores', 'FORBIDDEN');
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError(400, 'Se requieren fechas de inicio y fin', 'MISSING_DATES');
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Get invoices within date range
      const invoices = await invoiceService.getInvoicesByDateRange(start, end);

      if (invoices.length === 0) {
        throw new AppError(404, 'No se encontraron facturas en el período especificado', 'NO_INVOICES');
      }

      // Create ZIP archive
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="facturas_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.zip"`);

      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(res);

      // Add each invoice PDF to the archive
      for (const invoice of invoices) {
        try {
          const pdfBuffer = await invoiceService.generateInvoicePDF(invoice);
          archive.append(pdfBuffer, { name: `${invoice.invoiceNumber}.pdf` });
        } catch (error) {
          console.error(`Error generating PDF for invoice ${invoice.invoiceNumber}:`, error);
        }
      }

      await archive.finalize();
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController = new InvoiceController();
