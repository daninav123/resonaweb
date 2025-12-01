import { api } from './api';

class AnalyticsService {
  /**
   * Get complete dashboard data
   */
  async getCompleteDashboard() {
    try {
      return await api.get('/analytics/dashboard/complete');
    } catch (error) {
      console.error('Error getting complete dashboard:', error);
      throw error;
    }
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      return await api.get('/analytics/dashboard');
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get revenue chart data
   */
  async getRevenueChart(days: number = 30) {
    return api.get(`/analytics/revenue-chart?days=${days}`);
  }

  /**
   * Get order status distribution
   */
  async getOrderStatusDistribution() {
    return api.get('/analytics/order-status');
  }

  /**
   * Get top products
   */
  async getTopProducts(limit: number = 10) {
    return api.get(`/analytics/top-products?limit=${limit}`);
  }

  /**
   * Get top customers
   */
  async getTopCustomers(limit: number = 10) {
    return api.get(`/analytics/top-customers?limit=${limit}`);
  }

  /**
   * Get events calendar
   */
  async getEventsCalendar(days: number = 30) {
    return api.get(`/analytics/events-calendar?days=${days}`);
  }

  /**
   * Get inventory utilization
   */
  async getInventoryUtilization() {
    return api.get('/analytics/inventory-utilization');
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return api.get('/analytics/performance-metrics');
  }

  /**
   * Get popular rental periods
   */
  async getPopularRentalPeriods() {
    return api.get('/analytics/rental-periods');
  }

  /**
   * Get product amortization data
   */
  async getProductAmortization() {
    return api.get('/analytics/product-amortization');
  }
}

export const analyticsService = new AnalyticsService();
