import { api } from './api';

class InvoiceService {
  /**
   * Generate invoice for an order
   */
  async generateInvoice(orderId: string) {
    return await api.post(`/invoices/generate/${orderId}`);
  }

  /**
   * Download invoice PDF
   */
  async downloadInvoice(invoiceId: string) {
    try {
      // Use axios instance from api.ts which handles auth automatically
      const response = await api.get(`/invoices/download/${invoiceId}`, {
        responseType: 'blob',
      });
      
      // Response is already a blob when responseType is 'blob'
      return response as unknown as Blob;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Send invoice by email
   */
  async sendInvoiceEmail(invoiceId: string) {
    return await api.post(`/invoices/${invoiceId}/send`);
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string) {
    return await api.get(`/invoices/order/${orderId}`);
  }
}

export const invoiceService = new InvoiceService();
