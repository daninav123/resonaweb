import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { guestCart } from '../utils/guestCart';
import { api } from '../services/api';

// Estado compartido del contador
let sharedCount = 0;
const listeners = new Set<(count: number) => void>();

export const cartCountManager = {
  increment: (amount: number = 1) => {
    sharedCount += amount;
    listeners.forEach(listener => listener(sharedCount));
  },
  set: (newCount: number) => {
    sharedCount = newCount;
    listeners.forEach(listener => listener(sharedCount));
  },
  subscribe: (listener: (count: number) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getCount: () => sharedCount,
};

export const useCartCount = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [count, setCount] = useState(sharedCount);

  useEffect(() => {
    const updateCount = async () => {
      // SIEMPRE usar localStorage (tanto autenticado como guest)
      const items = guestCart.getCart();
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      cartCountManager.set(totalItems);
    };

    updateCount();

    // Actualizar cada vez que cambie el carrito
    const handleCartUpdate = () => {
      // Pequeño delay para asegurar que el backend ya procesó el POST
      setTimeout(() => {
        updateCount();
      }, 200);
    };

    // Suscribirse a cambios del manager
    const unsubscribe = cartCountManager.subscribe(setCount);

    window.addEventListener('storage', handleCartUpdate);
    
    // Custom events para actualizaciones locales (guest cart)
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('guestCartChanged', handleCartUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleCartUpdate);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('guestCartChanged', handleCartUpdate);
    };
  }, []); // Sin dependencias - solo se ejecuta una vez

  return count;
};
