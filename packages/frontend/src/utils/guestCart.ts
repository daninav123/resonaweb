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
    stock?: number;
    realStock?: number;
    category?: {
      name: string;
    };
  };
  quantity: number;
  startDate?: string;
  endDate?: string;
  eventMetadata?: {
    eventType?: string;
    attendees?: number;
    duration?: number;
    durationType?: string;
    startTime?: string;
    eventDate?: string;
    eventLocation?: string;
    selectedParts?: Array<{
      id: string;
      name: string;
      icon: string;
      price: number;
    }>;
    partsTotal?: number;
    selectedExtras?: Array<{
      id: string;
      name: string;
      quantity: number;
      pricePerDay: number;
      total: number;
    }>;
    extrasTotal?: number;
  };
}

const GUEST_CART_KEY = 'guest_cart';

// Función para disparar evento de actualización
const dispatchCartUpdate = () => {
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(
    new CustomEvent('guestCartChanged', {
      detail: { items: guestCart.getCart() },
    })
  );
};

export const guestCart = {
  // Obtener carrito
  getCart(): GuestCartItem[] {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      if (!cart) return [];
      
      const items: GuestCartItem[] = JSON.parse(cart);
      
      // Detectar y limpiar IDs duplicados
      const seenIds = new Set<string>();
      const cleanedItems = items.filter(item => {
        if (seenIds.has(item.id)) {
          console.warn(`⚠️ Item duplicado detectado con ID: ${item.id}, eliminando...`);
          return false;
        }
        seenIds.add(item.id);
        return true;
      });
      
      // Si encontramos duplicados, guardar carrito limpio
      if (cleanedItems.length !== items.length) {
        console.log(`✅ Carrito limpiado: ${items.length - cleanedItems.length} items duplicados eliminados`);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cleanedItems));
        dispatchCartUpdate();
      }
      
      return cleanedItems;
    } catch (error) {
      console.error('Error reading guest cart:', error);
      return [];
    }
  },

  // Añadir item
  addItem(product: any, quantity: number, eventMetadata?: any): GuestCartItem {
    const cart = this.getCart();
    
    // Verificar si ya existe
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      cart[existingIndex].quantity += quantity;
      // Actualizar eventMetadata si se proporciona
      if (eventMetadata) {
        cart[existingIndex].eventMetadata = eventMetadata;
      }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      dispatchCartUpdate();
      return cart[existingIndex];
    }
    
    // Generar ID único usando timestamp + random + productId
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${product.id}`;
    
    const newItem: GuestCartItem = {
      id: uniqueId,
      productId: product.id,
      product: {
        id: product.id,
        name: product.name,
        mainImageUrl: product.mainImageUrl,
        pricePerDay: product.pricePerDay,
        stock: product.stock,
        realStock: product.realStock,
        category: product.category,
      },
      quantity,
      ...(eventMetadata && { eventMetadata }),
    };

    // Añadir nuevo
    cart.push(newItem);

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
