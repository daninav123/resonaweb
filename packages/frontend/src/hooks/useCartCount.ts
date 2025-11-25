import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { guestCart } from '../utils/guestCart';
import { api } from '../services/api';

export const useCartCount = () => {
  const { user } = useAuthStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = async () => {
      if (user) {
        // Usuario autenticado - obtener del backend
        try {
          const response: any = await api.get('/cart');
          const items = response.data?.items || [];
          const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCount(totalItems);
        } catch (error: any) {
          // Silenciar error 401 (no autenticado) - es esperado al inicio
          if (error?.response?.status !== 401) {
            console.error('Error loading cart:', error);
          }
          setCount(0);
        }
      } else {
        // Usuario invitado - obtener de localStorage
        const items = guestCart.getCart();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setCount(totalItems);
      }
    };

    updateCount();

    // Actualizar cada vez que cambie el storage (para guest cart)
    const handleStorageChange = () => {
      if (!user) {
        const items = guestCart.getCart();
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setCount(totalItems);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event para actualizaciones locales
    window.addEventListener('cartUpdated', handleStorageChange as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange as any);
    };
  }, [user]);

  return count;
};
