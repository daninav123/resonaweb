import { api } from './api';

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

class ProductService {
  /**
   * Get all products (EXCLUYE categoría Personal para usuarios públicos)
   */
  async getProducts(filters?: ProductFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    const response: any = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
    
    // Filtrar productos de categoría "Personal" (solo para admin)
    if (response?.data) {
      response.data = response.data.filter((product: any) => {
        const categoryName = product.category?.name?.toLowerCase() || '';
        return categoryName !== 'personal';
      });
    }
    
    return response || { data: [], pagination: { total: 0 } };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const response: any = await api.get(`/products/${id}`);
    return response?.data || null;
  }

  /**
   * Get featured products (EXCLUYE categoría Personal)
   */
  async getFeaturedProducts(limit: number = 6) {
    const response: any = await api.get(`/products/featured?limit=${limit}`);
    const products = response?.data || [];
    
    // Filtrar productos de categoría "Personal"
    return products.filter((product: any) => {
      const categoryName = product.category?.name?.toLowerCase() || '';
      return categoryName !== 'personal';
    });
  }

  /**
   * Check product availability
   */
  async checkAvailability(productId: string, startDate: string, endDate: string, quantity: number) {
    return api.post('/availability/check', {
      items: [{ productId, startDate, endDate, quantity }],
    });
  }

  /**
   * Get product availability calendar
   */
  async getAvailabilityCalendar(productId: string, month: number, year: number) {
    return api.get(`/availability/calendar/${productId}?month=${month}&year=${year}`);
  }

  /**
   * Get all categories (EXCLUYE categoría Personal para usuarios públicos)
   */
  async getCategories() {
    const response: any = await api.get('/products/categories');
    const categories = response?.data || [];
    
    // Filtrar categoría "Personal" (solo visible en admin)
    return categories.filter((cat: any) => cat.name.toLowerCase() !== 'personal');
  }

  /**
   * Get products by category (EXCLUYE categoría Personal)
   */
  async getProductsByCategory(categorySlug: string, page: number = 1, limit: number = 12) {
    const response: any = await api.get(`/products?category=${categorySlug}&page=${page}&limit=${limit}`);
    const products = response?.data || [];
    
    // Filtrar productos de categoría "Personal"
    return products.filter((product: any) => {
      const categoryName = product.category?.name?.toLowerCase() || '';
      return categoryName !== 'personal';
    });
  }

  /**
   * Search products (EXCLUYE categoría Personal)
   */
  async searchProducts(query: string, page: number = 1, limit: number = 12) {
    const response: any = await api.get(`/products/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    const products = response?.data || [];
    
    // Filtrar productos de categoría "Personal"
    return products.filter((product: any) => {
      const categoryName = product.category?.name?.toLowerCase() || '';
      return categoryName !== 'personal';
    });
  }

  /**
   * Add product review
   */
  async addReview(productId: string, rating: number, comment: string) {
    return api.post(`/products/${productId}/reviews`, { rating, comment });
  }

  /**
   * Get product reviews
   */
  async getReviews(productId: string, page: number = 1, limit: number = 10) {
    return api.get(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
  }
}

export const productService = new ProductService();
