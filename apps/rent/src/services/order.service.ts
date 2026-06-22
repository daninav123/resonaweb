import { api } from './api';

export interface CreateOrderData {
  items: any[];
  deliveryType: 'PICKUP' | 'DELIVERY';
  deliveryAddress?: string;
  deliveryDate?: string;
  notes?: string;
  eventType?: string;
  eventLocation?: string;
  attendees?: number;
}

class OrderService {
  /**
   * Create new order
   */
  async createOrder(data: CreateOrderData) {
    return api.post('/orders', data);
  }

  /**
   * Get user orders
   */
  async getMyOrders(page: number = 1, limit: number = 10) {
    return api.get(`/orders/my-orders?page=${page}&limit=${limit}`);
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string) {
    return api.get(`/orders/${orderId}`);
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string) {
    return api.post(`/orders/${orderId}/cancel`, { reason });
  }

  /**
   * Get order statistics
   */
  async getOrderStats() {
    return api.get('/orders/stats');
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents() {
    return api.get('/orders/upcoming');
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(page: number = 1, limit: number = 10, filters?: any) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    return api.get(`/orders?${params.toString()}`);
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(orderId: string, status: string) {
    return api.patch(`/orders/${orderId}/status`, { status });
  }
}

export const orderService = new OrderService();
