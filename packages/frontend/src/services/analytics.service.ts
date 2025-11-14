import { api } from './api';

class AnalyticsService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return api.get('/analytics/dashboard');
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
}

export const analyticsService = new AnalyticsService();
