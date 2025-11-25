import { api } from './api';

export interface ModificationCheck {
  canModify: boolean;
  reason?: string;
  hoursUntil: number;
  daysUntil: number;
}

class OrderModificationService {
  /**
   * Verificar si se puede modificar un pedido
   */
  async canModify(orderId: string): Promise<ModificationCheck> {
    const response: any = await api.get(`/order-modifications/${orderId}/can-modify`);
    return response;
  }

  /**
   * Añadir items a un pedido
   */
  async addItems(orderId: string, items: any[], reason?: string) {
    const response: any = await api.post(`/order-modifications/${orderId}/add-items`, {
      items,
      reason,
    });
    return response;
  }

  /**
   * Eliminar items de un pedido
   */
  async removeItems(orderId: string, itemIds: string[], reason?: string) {
    const response: any = await api.post(`/order-modifications/${orderId}/remove-items`, {
      itemIds,
      reason,
    });
    return response;
  }

  /**
   * Cancelar pedido con reembolso
   */
  async cancelWithRefund(orderId: string, reason?: string) {
    const response: any = await api.post(`/order-modifications/${orderId}/cancel-refund`, {
      reason,
    });
    return response;
  }
}

export const orderModificationService = new OrderModificationService();
