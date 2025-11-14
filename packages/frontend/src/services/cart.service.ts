import { api } from './api';

export interface CartItem {
  productId: string;
  quantity: number;
  startDate: string;
  endDate: string;
}

export interface Cart {
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface CartData {
  items: CartItem[];
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
}

class CartService {
  /**
   * Get user cart
   */
  async getCart(): Promise<Cart> {
    return api.get('/cart');
  }

  /**
   * Add item to cart
   */
  async addToCart(item: CartItem) {
    return api.post('/cart/items', item);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number) {
    return api.patch(`/cart/items/${productId}`, { quantity });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string) {
    return api.delete(`/cart/items/${productId}`);
  }

  /**
   * Clear cart
   */
  async clearCart() {
    return api.delete('/cart/clear');
  }

  /**
   * Calculate cart totals
   */
  async calculateTotals(cartData: CartData) {
    return api.post('/cart/calculate', cartData);
  }

  /**
   * Validate cart before checkout
   */
  async validateCart(cartData: CartData) {
    return api.post('/cart/validate', cartData);
  }
}

export const cartService = new CartService();
