import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import PDFDocument from 'pdfkit';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { companyService } from './company.service';

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    taxId?: string;
  };
  company: {
    name: string;
    ownerName?: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    logo?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    startDate?: Date;
    endDate?: Date;
  }>;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  terms?: string;
}

export class InvoiceService {
  private templatePath: string;
  
  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/invoice.hbs');
  }

  /**
   * Generate invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `INV-${year}-`,
        },
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
      nextNumber = lastNumber + 1;
    }

    return `INV-${year}-${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Generate invoice for an order
   */
  async generateInvoice(orderId: string) {
    try {
      logger.info(`📄 Generando factura para pedido: ${orderId}`);
      
      // ⚠️ VALIDACIÓN: Facturas automáticas solo disponibles desde el 1 de enero de 2026
      const currentDate = new Date();
      const invoiceAvailableDate = new Date('2026-01-01T00:00:00Z');
      
      if (currentDate < invoiceAvailableDate) {
        logger.warn(`⚠️ Sistema de facturas automáticas no disponible hasta el 1 de enero de 2026`);
        throw new AppError(
          423, // HTTP 423 Locked - Resource is locked
          'El sistema de facturación automática estará disponible a partir del 1 de enero de 2026. Recibirás tu factura de forma manual por email.',
          'INVOICE_SYSTEM_NOT_AVAILABLE'
        );
      }
      
      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findUnique({
        where: { orderId },
      });

      if (existingInvoice) {
        logger.info(`✅ Factura ya existe para pedido ${orderId}`);
        return existingInvoice;
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            include: {
              billingData: true, // Include billing data for invoice
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        logger.error(`❌ Pedido no encontrado: ${orderId}`);
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }
      
      logger.info(`✅ Pedido encontrado: ${orderId}, Items: ${order.items.length}`);

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Get company settings
      const companySettings = await companyService.getSettings();

      // Get billing data or fall back to user data
      const billingData = (order as any).user?.billingData;
      const user = (order as any).user;
      
      // Prepare customer info using billing data if available
      const customerName = billingData?.companyName || 
                          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || 
                          'Cliente';
      
      // Prepare customer address with fallbacks
      let customerAddress = '';
      if (billingData && billingData.address) {
        customerAddress = `${billingData.address || ''}, ${billingData.postalCode || ''} ${billingData.city || ''} ${billingData.province || ''}`.trim();
      } else if (order.deliveryAddress && typeof order.deliveryAddress === 'string') {
        customerAddress = order.deliveryAddress;
      } else {
        // Si no hay dirección, usar una dirección por defecto
        customerAddress = 'Dirección no especificada';
      }
      
      logger.info(`📋 Datos del cliente: ${customerName}, Dirección: ${customerAddress}`);

      // Prepare invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        customer: {
          name: customerName,
          email: billingData?.email || user?.email || "cliente@example.com",
          phone: billingData?.phone || user?.phone || "+34 000 000 000",
          address: customerAddress,
          taxId: billingData?.taxId || user?.taxId || "No especificado",
        },
        company: {
          name: companySettings.companyName || 'ReSona Events S.L.',
          ownerName: companySettings.ownerName || undefined,
          address: `${companySettings.address || ''}, ${companySettings.postalCode || ''} ${companySettings.city || ''}`.trim(),
          phone: companySettings.phone || '+34 600 123 456',
          email: companySettings.email || 'info@resona.com',
          taxId: companySettings.taxId || '',
          logo: companySettings.logoUrl || '',
        },
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.pricePerUnit),
          totalPrice: Number(item.totalPrice),
          startDate: item.startDate,
          endDate: item.endDate,
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.taxAmount || 0),
        deliveryFee: Number(order.shippingCost || 0),
        total: Number(order.total),
        notes: companySettings.invoiceNotes || order.notes || undefined,
        terms: companySettings.termsConditions || 'Gracias por confiar en nosotros.',
      };

      // Save invoice to database first (without PDF)
      const invoice = await prisma.invoice.create({
        data: {
          orderId,
          invoiceNumber,
          issueDate: invoiceData.date,
          dueDate: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          taxAmount: invoiceData.tax,
          tax: invoiceData.tax,
          total: invoiceData.total,
          status: 'PENDING',
          pdfUrl: `/invoices/${invoiceNumber}.pdf`,
          metadata: invoiceData as any,
        },
      });
      
      logger.info(`💾 Factura guardada en BD: ${invoiceNumber}`);

      // Generate PDF using PDFKit
      logger.info(`📄 Generando PDF con PDFKit...`);
      const pdfBuffer = await this.generateInvoicePDF(invoice);

      // Save PDF to file system
      const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
      await fs.mkdir(invoicesDir, { recursive: true });
      await fs.writeFile(path.join(invoicesDir, `${invoiceNumber}.pdf`), pdfBuffer);
      
      logger.info(`💾 PDF guardado en: ${invoicesDir}/${invoiceNumber}.pdf`);

      logger.info(`Invoice generated for order ${order.orderNumber}: ${invoiceNumber}`);

      logger.info(`✅ Factura generada exitosamente: ${invoiceNumber}`);
      return invoice;
    } catch (error: any) {
      logger.error(`❌ Error generando factura para pedido ${orderId}:`, {
        message: error.message,
        stack: error.stack,
        code: error.code,
      });
      
      // Si es un AppError, re-lanzarlo
      if (error instanceof AppError) {
        throw error;
      }
      
      // Si es otro error, envolverlo en AppError
      throw new AppError(
        500,
        `Error generando factura: ${error.message}`,
        'INVOICE_GENERATION_ERROR'
      );
    }
  }

  /**
   * Create PDF from invoice data
   */
  async createPDF(data: InvoiceData): Promise<Buffer> {
    try {
      // Load and compile template
      const templateHtml = await this.getInvoiceTemplate();
      const template = handlebars.compile(templateHtml);

      // Register Handlebars helpers
      handlebars.registerHelper('formatDate', (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES');
      });

      handlebars.registerHelper('formatCurrency', (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount);
      });

      // Generate HTML
      const html = template(data);

      // Launch puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          bottom: '20mm',
          left: '20mm',
          right: '20mm',
        },
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      logger.error('Error creating PDF:', error);
      throw error;
    }
  }

  /**
   * Get invoice template
   */
  private async getInvoiceTemplate(): Promise<string> {
    // For now, return a hardcoded template
    // In production, this would be loaded from a file
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 20px;
    }
    .company-section {
      flex: 1;
      display: flex;
      align-items: flex-start;
      gap: 20px;
    }
    .company-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      flex-shrink: 0;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #3498db;
      margin-bottom: 10px;
    }
    .invoice-title {
      text-align: right;
      flex: 1;
    }
    .invoice-number {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
    .invoice-date {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    .customer-info {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    .customer-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .table th {
      background: #3498db;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
    }
    .table td {
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    .table tr:hover {
      background: #f5f5f5;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-top: 30px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .total-label {
      width: 150px;
      text-align: right;
      padding-right: 20px;
    }
    .total-value {
      width: 150px;
      text-align: right;
      font-weight: bold;
    }
    .grand-total {
      font-size: 20px;
      color: #3498db;
      border-top: 2px solid #3498db;
      padding-top: 10px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="company-section">
        {{#if company.logo}}
        <img src="{{company.logo}}" alt="Logo" class="company-logo" />
        {{/if}}
        <div class="company-info">
          <div class="company-name">{{company.name}}</div>
          {{#if company.ownerName}}
          <div style="font-size: 14px; margin-top: 5px;">{{company.ownerName}}</div>
          {{/if}}
          <div style="margin-top: 10px;">{{company.address}}</div>
          <div>Tel: {{company.phone}}</div>
          <div>Email: {{company.email}}</div>
          {{#if company.taxId}}
          <div>NIF/CIF: {{company.taxId}}</div>
          {{/if}}
        </div>
      </div>
      <div class="invoice-title">
        <div class="invoice-number">{{invoiceNumber}}</div>
        <div class="invoice-date">Fecha: {{formatDate date}}</div>
      </div>
    </div>

    <div class="customer-info">
      <div class="customer-title">FACTURAR A:</div>
      <div><strong>{{customer.name}}</strong></div>
      <div>{{customer.email}}</div>
      {{#if customer.phone}}<div>Tel: {{customer.phone}}</div>{{/if}}
      {{#if customer.address}}<div>{{customer.address}}</div>{{/if}}
      {{#if customer.taxId}}<div>NIF/CIF: {{customer.taxId}}</div>{{/if}}
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Periodo</th>
          <th class="text-right">Cantidad</th>
          <th class="text-right">Precio Unit.</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each items}}
        <tr>
          <td>{{name}}</td>
          <td>
            {{#if startDate}}
              {{formatDate startDate}} - {{formatDate endDate}}
            {{else}}
              -
            {{/if}}
          </td>
          <td class="text-right">{{quantity}}</td>
          <td class="text-right">{{formatCurrency unitPrice}}</td>
          <td class="text-right">{{formatCurrency totalPrice}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <div class="total-label">Subtotal:</div>
        <div class="total-value">{{formatCurrency subtotal}}</div>
      </div>
      {{#if deliveryFee}}
      <div class="total-row">
        <div class="total-label">Transporte:</div>
        <div class="total-value">{{formatCurrency deliveryFee}}</div>
      </div>
      {{/if}}
      <div class="total-row">
        <div class="total-label">IVA (21%):</div>
        <div class="total-value">{{formatCurrency tax}}</div>
      </div>
      <div class="total-row grand-total">
        <div class="total-label">TOTAL:</div>
        <div class="total-value">{{formatCurrency total}}</div>
      </div>
    </div>

    {{#if notes}}
    <div class="notes">
      <div class="notes-title">Notas:</div>
      <div>{{notes}}</div>
    </div>
    {{/if}}

    {{#if terms}}
    <div class="notes">
      <div class="notes-title">Términos y Condiciones:</div>
      <div>{{terms}}</div>
    </div>
    {{/if}}

    <div class="footer">
      <p>Gracias por confiar en {{company.name}}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Send invoice by email
   */
  async sendInvoiceEmail(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new AppError(404, 'Factura no encontrada', 'INVOICE_NOT_FOUND');
      }

      // This would integrate with notification service
      // For now, just log
      logger.info(`Invoice email would be sent to ${invoice.order?.user?.email || 'unknown'}`);

      return {
        success: true,
        message: 'Factura enviada por email',
      };
    } catch (error) {
      logger.error('Error sending invoice email:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!invoice) {
        throw new AppError(404, 'Factura no encontrada', 'INVOICE_NOT_FOUND');
      }

      return invoice;
    } catch (error) {
      logger.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceId: string): Promise<Buffer> {
    try {
      const invoice = await this.getInvoiceById(invoiceId);
      
      // Para facturas manuales, siempre regenerar el PDF con los datos actuales
      const isManual = !invoice.orderId;
      
      if (isManual) {
        logger.info(`Generating PDF for manual invoice ${invoice.invoiceNumber}`);
        const pdfBuffer = await this.generateInvoicePDF(invoice);
        return pdfBuffer;
      }

      // Para facturas de pedidos, intentar leer del disco primero
      const pdfPath = path.join(process.cwd(), 'uploads', 'invoices', `${invoice.invoiceNumber}.pdf`);
      
      try {
        const pdfBuffer = await fs.readFile(pdfPath);
        return pdfBuffer;
      } catch (fileError) {
        // Regenerate if not found
        logger.warn(`PDF not found for invoice ${invoice.invoiceNumber}, regenerating...`);
        
        const pdfBuffer = await this.generateInvoicePDF(invoice);
        
        // Save for future use
        await fs.writeFile(pdfPath, pdfBuffer);
        
        return pdfBuffer;
      }
    } catch (error) {
      logger.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Mark invoice as paid
   */
  async markInvoiceAsPaid(invoiceId: string, paymentDate?: Date) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: paymentDate || new Date(),
        },
      });

      logger.info(`Invoice ${invoice.invoiceNumber} marked as paid`);

      return invoice;
    } catch (error) {
      logger.error('Error marking invoice as paid:', error);
      throw error;
    }
  }

  /**
   * Get all invoices (Admin)
   */
  async getAllInvoices() {
    const invoices = await prisma.invoice.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return invoices;
  }

  /**
   * Create manual invoice (for non-web events)
   * Admin only - respects sequential numbering
   */
  async createManualInvoice(invoiceData: {
    customer: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
      taxId?: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      tax?: number;
    }>;
    eventDate?: Date;
    notes?: string;
    dueDate?: Date;
    irpf?: number; // IRPF percentage
  }) {
    try {
      // Generate sequential invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Calculate totals
      const subtotal = invoiceData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );
      
      const taxAmount = invoiceData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice * (item.tax || 0.21)), 0
      );
      
      // Calculate IRPF (withholding tax) - se resta del total
      const irpfAmount = invoiceData.irpf ? subtotal * (invoiceData.irpf / 100) : 0;
      
      const total = subtotal + taxAmount - irpfAmount;

      // Create invoice in database
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          status: 'PENDING',
          subtotal,
          taxAmount,
          tax: taxAmount,
          total,
          dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          metadata: {
            customer: invoiceData.customer,
            items: invoiceData.items,
            eventDate: invoiceData.eventDate,
            notes: invoiceData.notes,
            irpf: invoiceData.irpf || 0,
            irpfAmount,
            isManual: true,
            createdBy: 'admin'
          },
        },
      });

      logger.info(`Manual invoice created: ${invoiceNumber}`);

      return invoice;
    } catch (error: any) {
      logger.error('Error creating manual invoice:', error);
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      throw new AppError(500, `Error al crear factura manual: ${error.message}`, 'INVOICE_CREATION_ERROR');
    }
  }

  /**
   * Get invoices by date range
   */
  async getInvoicesByDateRange(startDate: Date, endDate: Date) {
    try {
      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          order: {
            include: {
              user: true,
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return invoices;
    } catch (error) {
      logger.error('Error getting invoices by date range:', error);
      throw new AppError(500, 'Error al obtener facturas', 'INVOICE_FETCH_ERROR');
    }
  }

  /**
   * Generate invoice PDF buffer
   */
  async generateInvoicePDF(invoice: any): Promise<Buffer> {
    try {
      logger.info('🔵 Generating professional PDF with PDFKit...');
      const invoiceData = await this.prepareInvoiceData(invoice);
      
      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({ 
            margin: 50,
            size: 'A4'
          });
          const chunks: Buffer[] = [];
          
          doc.on('data', (chunk) => chunks.push(chunk));
          doc.on('end', () => resolve(Buffer.concat(chunks)));
          doc.on('error', reject);
          
          // ==================== HEADER ====================
          // Banda superior con color Resona
          doc.rect(0, 0, 612, 120).fill('#5ebbff');
          
          // Nombre comercial en blanco
          doc.fontSize(24).fillColor('#ffffff')
             .text('ReSona Events', 50, 30, { align: 'left', width: 300 });
          
          // Subtítulo
          doc.fontSize(10).fillColor('#ffffff')
             .text('Producción de Eventos Audiovisuales', 50, 60);
          
          // "FACTURA" en grande a la derecha
          doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
             .text('FACTURA', 350, 20, { align: 'right', width: 212 });
          
          // Número de factura a la derecha
          doc.fontSize(14).fillColor('#ffffff').font('Helvetica')
             .text(invoiceData.invoiceNumber, 350, 50, { align: 'right', width: 212 });
          doc.fontSize(9)
             .text(`Fecha: ${invoiceData.date}`, 350, 70, { align: 'right', width: 212 });
          
          // ==================== DATOS EMISOR ====================
          doc.y = 140;
          doc.fillColor('#000000');
          
          // Columna izquierda - Datos del titular (autónomo)
          doc.fontSize(9).fillColor('#666666').text('DATOS DEL EMISOR:', 50, doc.y);
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#000000').font('Helvetica-Bold');
          const companyOwner = (invoiceData.company as any).ownerName || invoiceData.company.name || 'Daniel Navarro Campos';
          doc.text(companyOwner);
          doc.font('Helvetica').fontSize(9);
          if (invoiceData.company.taxId) doc.text(`NIF: ${invoiceData.company.taxId}`);
          doc.text(invoiceData.company.address);
          doc.text(`Tel: ${invoiceData.company.phone}`);
          doc.text(`Email: ${invoiceData.company.email}`);
          
          // ==================== DATOS CLIENTE ====================
          const clientY = 140;
          doc.fontSize(9).fillColor('#666666').text('FACTURAR A:', 320, clientY);
          doc.moveDown(0.5);
          doc.fontSize(11).fillColor('#000000').font('Helvetica-Bold');
          doc.text(invoiceData.customer.name, 320, doc.y);
          doc.font('Helvetica').fontSize(9);
          doc.text(invoiceData.customer.email, 320, doc.y);
          if (invoiceData.customer.phone) doc.text(invoiceData.customer.phone, 320, doc.y);
          if (invoiceData.customer.address) doc.text(invoiceData.customer.address, 320, doc.y);
          if (invoiceData.customer.taxId) doc.text(`NIF/CIF: ${invoiceData.customer.taxId}`, 320, doc.y);
          
          // ==================== TABLA DE CONCEPTOS ====================
          doc.y = 280;
          doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke('#5ebbff');
          
          const tableTop = doc.y + 10;
          doc.fontSize(10).font('Helvetica-Bold').fillColor('#5ebbff');
          doc.text('DESCRIPCIÓN', 50, tableTop);
          doc.text('CANT.', 350, tableTop, { width: 50, align: 'center' });
          doc.text('PRECIO', 410, tableTop, { width: 60, align: 'right' });
          doc.text('TOTAL', 480, tableTop, { width: 82, align: 'right' });
          
          doc.moveTo(50, tableTop + 18).lineTo(562, tableTop + 18).stroke('#cccccc');
          
          let itemY = tableTop + 28;
          doc.font('Helvetica').fillColor('#000000');
          invoiceData.items.forEach((item: any) => {
            doc.fontSize(10);
            doc.text(item.name, 50, itemY, { width: 290 });
            doc.text(item.quantity.toString(), 350, itemY, { width: 50, align: 'center' });
            doc.text(`${item.unitPrice.toFixed(2)}€`, 410, itemY, { width: 60, align: 'right' });
            doc.text(`${item.totalPrice.toFixed(2)}€`, 480, itemY, { width: 82, align: 'right' });
            itemY += 25;
          });
          
          doc.moveTo(50, itemY + 5).lineTo(562, itemY + 5).stroke('#cccccc');
          
          // ==================== TOTALES ====================
          const totalsY = itemY + 20;
          doc.fontSize(10).fillColor('#000000');
          
          // Caja con fondo para totales
          doc.rect(350, totalsY - 5, 212, 75).fillAndStroke('#f8f9fa', '#cccccc');
          
          doc.fillColor('#000000');
          doc.text('Subtotal:', 360, totalsY);
          doc.text(`${invoiceData.subtotal.toFixed(2)}€`, 480, totalsY, { width: 72, align: 'right' });
          
          doc.text('IVA (21%):', 360, totalsY + 20);
          doc.text(`${invoiceData.tax.toFixed(2)}€`, 480, totalsY + 20, { width: 72, align: 'right' });
          
          // Total en grande y con color
          doc.fontSize(14).font('Helvetica-Bold').fillColor('#5ebbff');
          doc.text('TOTAL:', 360, totalsY + 45);
          doc.text(`${invoiceData.total.toFixed(2)}€`, 480, totalsY + 45, { width: 72, align: 'right' });
          
          // ==================== NOTAS ====================
          if (invoiceData.notes) {
            doc.moveDown(3);
            doc.font('Helvetica').fontSize(9).fillColor('#666666');
            doc.text('NOTAS:', 50, doc.y);
            doc.fillColor('#000000');
            doc.text(invoiceData.notes, 50, doc.y, { width: 512 });
          }
          
          // ==================== FOOTER ====================
          doc.fontSize(8).fillColor('#999999');
          const footerY = 750;
          doc.text('Gracias por confiar en ReSona Events', 50, footerY, { align: 'center', width: 512 });
          
          // Línea decorativa inferior
          doc.moveTo(50, 770).lineTo(562, 770).stroke('#5ebbff');
          
          doc.end();
          logger.info('✅ Professional PDF generated with PDFKit');
        } catch (err) {
          reject(err);
        }
      });
    } catch (error: any) {
      logger.error('❌ Error generating invoice PDF:', error);
      logger.error('❌ Error message:', error.message);
      throw new AppError(500, `Error al generar PDF: ${error.message}`, 'PDF_GENERATION_ERROR');
    }
  }

  /**
   * Prepare invoice data for template
   */
  private async prepareInvoiceData(invoice: any) {
    const company = await companyService.getForInvoice();
    
    const isManual = !invoice.orderId;
    
    // Si no es manual, cargar el pedido con sus items
    let order = invoice.order;
    if (!isManual && invoice.orderId && !order) {
      logger.info(`📦 Cargando pedido ${invoice.orderId} para preparar PDF...`);
      order = await prisma.order.findUnique({
        where: { id: invoice.orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    
    const customerData = isManual 
      ? (invoice.metadata as any)?.customer 
      : {
          name: `${order?.user?.firstName || ''} ${order?.user?.lastName || ''}`.trim(),
          email: order?.user?.email,
          phone: order?.user?.phone,
          address: order?.user?.address,
        };

    const items = isManual
      ? ((invoice.metadata as any)?.items || []).map((item: any) => ({
          name: item.description,  // Para facturas manuales, description -> name
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,  // Calcular total
          startDate: null,
          endDate: null,
        }))
      : order?.items?.map((item: any) => ({
          name: item.product?.name,
          quantity: item.quantity,
          unitPrice: parseFloat(item.pricePerUnit),
          totalPrice: parseFloat(item.totalPrice),
          startDate: item.startDate,
          endDate: item.endDate,
        })) || [];
    
    logger.info(`📋 Items preparados para PDF: ${items.length}`);

    return {
      invoiceNumber: invoice.invoiceNumber,
      date: new Date(invoice.createdAt).toLocaleDateString('es-ES'),
      dueDate: new Date(invoice.dueDate).toLocaleDateString('es-ES'),
      customer: customerData,
      company: {
        name: company?.name || 'ReSona360',
        address: company?.address || '',
        phone: company?.phone || '',
        email: company?.email || '',
        taxId: company?.taxId || '',
      },
      items,
      subtotal: parseFloat(invoice.subtotal),
      tax: parseFloat(invoice.tax),
      deliveryFee: parseFloat(invoice.shippingCost || 0),
      total: parseFloat(invoice.total),
      notes: (invoice.metadata as any)?.notes || '',
    };
  }

  /**
   * Delete invoice (admin only - hard delete)
   */
  async deleteInvoice(invoiceId: string) {
    try {
      // Verificar que existe
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new AppError(404, 'Factura no encontrada', 'NOT_FOUND');
      }

      // Eliminar
      await prisma.invoice.delete({
        where: { id: invoiceId }
      });

      logger.info(`Invoice ${invoiceId} deleted permanently`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error deleting invoice:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
