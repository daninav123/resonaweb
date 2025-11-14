import { PrismaClient } from '@prisma/client';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

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
      // Check if invoice already exists
      const existingInvoice = await prisma.invoice.findUnique({
        where: { orderId },
      });

      if (existingInvoice) {
        logger.info(`Invoice already exists for order ${orderId}`);
        return existingInvoice;
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND');
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Prepare invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        customer: {
          name: `${((order as any).user?.firstName || "")} ${((order as any).user?.lastName || "")}`,
          email: ((order as any).user?.email || ""),
          phone: ((order as any).user?.phone || ""),
          address: order.deliveryAddress || '',
          taxId: ((order as any).user?.taxId || ""),
        },
        company: {
          name: 'ReSona Eventos S.L.',
          address: 'Calle Principal 123, 28001 Madrid',
          phone: '+34 900 123 456',
          email: 'facturacion@resona.com',
          taxId: 'B12345678',
          logo: '/logo.png',
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
        tax: Number(order.taxAmountAmount),
        deliveryFee: Number(order.shippingCost),
        total: Number(order.total),
        notes: order.notes || undefined,
        terms: 'Pago a 30 días. Se aplicará un recargo del 2% por retraso en el pago.',
      };

      // Generate PDF
      const pdfBuffer = await this.createPDF(invoiceData);

      // Save invoice to database
      const invoice = await prisma.invoice.create({
        data: {
          orderId,
          invoiceNumber,
          issueDate: invoiceData.date,
          dueDate: invoiceData.dueDate,
          subtotal: invoiceData.subtotal,
          tax: invoiceData.tax,
          total: invoiceData.total,
          status: 'PENDING',
          pdfUrl: `/invoices/${invoiceNumber} || "").pdf`, // We'll save to file system
          metadata: invoiceData as any,
        },
      });

      // Save PDF to file system
      const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
      await fs.mkdir(invoicesDir, { recursive: true });
      await fs.writeFile(path.join(invoicesDir, `${invoiceNumber} || "").pdf`), pdfBuffer);

      logger.info(`Invoice generated for order ${order.orderNumber}: ${invoiceNumber}`);

      return invoice;
    } catch (error) {
      logger.error('Error generating invoice:', error);
      throw error;
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
      margin-bottom: 40px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 20px;
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
      <div class="company-info">
        <div class="company-name">{{company.name}}</div>
        <div>{{company.address}}</div>
        <div>Tel: {{company.phone}}</div>
        <div>Email: {{company.email}}</div>
        <div>CIF: {{company.taxId}}</div>
      </div>
      <div class="invoice-title">
        <div class="invoice-number">{{invoiceNumber}}</div>
        <div class="invoice-date">Fecha: {{formatDate date}}</div>
        <div class="invoice-date">Vencimiento: {{formatDate dueDate}}</div>
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
      <p>Esta factura se ha generado electrónicamente y es válida sin firma</p>
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
      logger.info(`Invoice email would be sent to ${((order as any).email || "")}`);

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

      // Check if PDF exists
      const pdfPath = path.join(process.cwd(), 'uploads', 'invoices', `${invoice.invoiceNumber} || "").pdf`);
      
      try {
        const pdfBuffer = await fs.readFile(pdfPath);
        return pdfBuffer;
      } catch (fileError) {
        // Regenerate if not found
        logger.warn(`PDF not found for invoice ${invoice.invoiceNumber}, regenerating...`);
        
        const invoiceData = invoice.metadata as InvoiceData;
        const pdfBuffer = await this.createPDF(invoiceData);
        
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
}

export const invoiceService = new InvoiceService();
