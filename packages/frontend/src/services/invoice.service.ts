import { api } from './api';
import { useAuthStore } from '../stores/authStore';

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
    const token = useAuthStore.getState().accessToken;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/invoices/download/${invoiceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token || ''}`,
        'Content-Type': 'application/pdf',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Error al descargar factura');
    }

    return await response.blob();
  }

  /**
   * Send invoice by email
   */
  async sendInvoiceEmail(invoiceId: string) {
    return await api.post(`/invoices/send/${invoiceId}`);
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string) {
    return await api.get(`/invoices/order/${orderId}`);
  }
}

export const invoiceService = new InvoiceService();
