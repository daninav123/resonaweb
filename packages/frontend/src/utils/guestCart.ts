// Guest Cart - Carrito para usuarios sin login
// Se guarda en localStorage

export interface GuestCartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    mainImageUrl?: string;
    pricePerDay: number;
    category?: {
      name: string;
    };
  };
  quantity: number;
  startDate?: string;
  endDate?: string;
}

const GUEST_CART_KEY = 'guest_cart';

// Helper para disparar evento de actualización
const dispatchCartUpdate = () => {
  window.dispatchEvent(new Event('cartUpdated'));
};

export const guestCart = {
  // Obtener carrito
  getCart(): GuestCartItem[] {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return [];
    }
  },

  // Añadir item
  addItem(product: any, quantity: number): GuestCartItem {
    const cart = this.getCart();
    
    // Verificar si ya existe
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    
    const newItem: GuestCartItem = {
      id: Date.now().toString(),
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        mainImageUrl: product.mainImageUrl,
        pricePerDay: product.pricePerDay,
        category: product.category,
      },
      quantity,
    };

    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      cart[existingIndex].quantity += quantity;
    } else {
      // Añadir nuevo
      cart.push(newItem);
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    dispatchCartUpdate();
    return newItem;
  },

  // Actualizar cantidad
  updateQuantity(itemId: string, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
      item.quantity = quantity;
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      dispatchCartUpdate();
    }
  },

  // Actualizar fechas
  updateDates(itemId: string, startDate: string, endDate: string): void {
    const cart = this.getCart();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
      item.startDate = startDate;
      item.endDate = endDate;
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      dispatchCartUpdate();
    }
  },

  // Eliminar item
  removeItem(itemId: string): void {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    dispatchCartUpdate();
  },

  // Limpiar carrito
  clear(): void {
    localStorage.removeItem(GUEST_CART_KEY);
    dispatchCartUpdate();
  },

  // Contar items
  getItemCount(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Verificar si tiene items
  hasItems(): boolean {
    return this.getCart().length > 0;
  },
};
