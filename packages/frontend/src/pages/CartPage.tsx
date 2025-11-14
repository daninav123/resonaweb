import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [guestCartItems, setGuestCartItems] = useState<GuestCartItem[]>([]);
  const [globalDates, setGlobalDates] = useState({ start: '', end: '' });
  const [customDatesItems, setCustomDatesItems] = useState<Set<string>>(new Set());

  // Cargar guest cart (SIEMPRE, backend no persiste aún)
  useEffect(() => {
    setGuestCartItems(guestCart.getCart());
    
    // Listener para actualizar cuando cambie
    const handleUpdate = () => {
      setGuestCartItems(guestCart.getCart());
    };
    
    window.addEventListener('cartUpdated', handleUpdate);
    return () => window.removeEventListener('cartUpdated', handleUpdate);
  }, []);

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      // Backend no persiste carrito aún, usar guest cart
      return { items: guestCartItems };
    },
    enabled: false, // Deshabilitado, usamos guest cart
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ productId, quantity }: any) => {
      await api.put(`/cart/items/${productId}`, { quantity });
    },
    onSuccess: () => {
      refetch();
      toast.success('Carrito actualizado');
    },
  });

  const updateDates = useMutation({
    mutationFn: async ({ itemId, startDate, endDate }: any) => {
      await api.put(`/cart/items/${itemId}/dates`, { startDate, endDate });
    },
    onSuccess: () => {
      refetch();
    },
    onError: () => {
      toast.error('Error al actualizar fechas');
    },
  });

  const removeItem = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/cart/items/${productId}`);
    },
    onSuccess: () => {
      refetch();
      toast.success('Producto eliminado del carrito');
    },
  });

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateItemPrice = (item: any) => {
    const dates = getEffectiveDates(item);
    if (!dates.start || !dates.end) return 0;
    const days = calculateDays(dates.start, dates.end);
    return item.product.pricePerDay * days * item.quantity;
  };

  const calculateTotal = () => {
    return guestCartItems.reduce((total: number, item: any) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const allItemsHaveDates = () => {
    // Verificar que haya fechas globales O que cada item tenga fechas personalizadas
    if (!globalDates.start || !globalDates.end) {
      if (guestCartItems.length === 0) return false;
      // Todos los items deben tener fechas personalizadas
      return guestCartItems.every((item: any) => 
        customDatesItems.has(item.id) && item.startDate && item.endDate
      );
    }
    return true; // Si hay fechas globales, está ok
  };

  // Funciones para guest cart
  const handleGuestUpdateQuantity = (itemId: string, newQuantity: number) => {
    guestCart.updateQuantity(itemId, newQuantity);
    setGuestCartItems(guestCart.getCart());
    toast.success('Cantidad actualizada');
  };

  const handleGuestUpdateDates = (itemId: string, startDate: string, endDate: string) => {
    guestCart.updateDates(itemId, startDate, endDate);
    setGuestCartItems(guestCart.getCart());
  };

  const handleGuestRemoveItem = (itemId: string) => {
    guestCart.removeItem(itemId);
    setGuestCartItems(guestCart.getCart());
    toast.success('Producto eliminado');
  };

  // Aplicar fechas globales a todos los items
  const applyGlobalDates = () => {
    if (!globalDates.start || !globalDates.end) {
      toast.error('Selecciona las fechas globales');
      return;
    }
    
    guestCartItems.forEach((item: any) => {
      if (!customDatesItems.has(item.id)) {
        handleGuestUpdateDates(item.id, globalDates.start, globalDates.end);
      }
    });

    toast.success('Fechas aplicadas a todos los productos');
  };

  // Toggle fechas personalizadas para un item
  const toggleCustomDates = (itemId: string) => {
    const newSet = new Set(customDatesItems);
    if (newSet.has(itemId)) {
      newSet.delete(itemId);
    } else {
      newSet.add(itemId);
    }
    setCustomDatesItems(newSet);
  };

  // Obtener fechas efectivas de un item (global o personalizada)
  const getEffectiveDates = (item: any) => {
    if (customDatesItems.has(item.id) && item.startDate && item.endDate) {
      return { start: item.startDate, end: item.endDate };
    }
    return globalDates;
  };

  if (isLoading && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Usar siempre guest cart (backend no persiste aún)
  const cartItems = guestCartItems;
  const subtotal = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Carrito</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">¡Añade algunos productos para empezar!</p>
            <Link
              to="/productos"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Fechas Globales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Fechas del Pedido
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Estas fechas se aplicarán a todos los productos del carrito
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha inicio
                    </label>
                    <input
                      type="date"
                      value={globalDates.start}
                      onChange={(e) => setGlobalDates({ ...globalDates, start: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha fin
                    </label>
                    <input
                      type="date"
                      value={globalDates.end}
                      onChange={(e) => setGlobalDates({ ...globalDates, end: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min={globalDates.start || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <button
                  onClick={applyGlobalDates}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Aplicar a todos los productos
                </button>
              </div>

              {/* Lista de Productos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Productos en el carrito</h2>
                
                <div className="space-y-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="border-b pb-6">
                      <div className="flex gap-4 mb-4">
                        <img
                          src={item.product.mainImageUrl || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm">{item.product.category?.name}</p>
                          <p className="text-blue-600 font-semibold mt-1">
                            €{item.product.pricePerDay} / día
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGuestUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded border hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4 mx-auto" />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleGuestUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded border hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleGuestRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Opción de fechas personalizadas */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                              {customDatesItems.has(item.id) ? 'Fechas personalizadas' : 'Usando fechas globales'}
                            </span>
                          </div>
                          <button
                            onClick={() => toggleCustomDates(item.id)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {customDatesItems.has(item.id) ? '✕ Usar fechas globales' : '✎ Personalizar fechas'}
                          </button>
                        </div>

                        {customDatesItems.has(item.id) && (
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <input
                                type="date"
                                value={item.startDate || ''}
                                onChange={(e) => handleGuestUpdateDates(item.id, e.target.value, item.endDate || '')}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                min={new Date().toISOString().split('T')[0]}
                              />
                              <span className="text-xs text-gray-500 mt-1 block">Fecha inicio</span>
                            </div>
                            <div>
                              <input
                                type="date"
                                value={item.endDate || ''}
                                onChange={(e) => handleGuestUpdateDates(item.id, item.startDate || '', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                min={item.startDate || new Date().toISOString().split('T')[0]}
                              />
                              <span className="text-xs text-gray-500 mt-1 block">Fecha fin</span>
                            </div>
                          </div>
                        )}

                        {/* Precio calculado */}
                        {(() => {
                          const dates = getEffectiveDates(item);
                          return dates.start && dates.end ? (
                            <div className="pt-3 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {calculateDays(dates.start, dates.end)} día(s) × €{item.product.pricePerDay} × {item.quantity} unidad(es)
                                </span>
                                <span className="font-semibold text-blue-600">
                                  €{calculateItemPrice(item).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-amber-600 text-sm">
                              ⚠️ Selecciona las fechas globales arriba
                            </p>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>
                
                {!allItemsHaveDates() && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ Selecciona las fechas del pedido arriba para continuar
                    </p>
                  </div>
                )}

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">
                      {subtotal > 0 ? `€${subtotal.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (21%)</span>
                    <span className="font-semibold">
                      {subtotal > 0 ? `€${(subtotal * 0.21).toFixed(2)}` : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-6">
                  <span>Total</span>
                  <span className="text-blue-600">
                    {subtotal > 0 ? `€${(subtotal * 1.21).toFixed(2)}` : '-'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (!allItemsHaveDates()) {
                      toast.error('Por favor selecciona las fechas del pedido arriba');
                      return;
                    }
                    
                    if (!user) {
                      toast('Inicia sesión o regístrate para continuar', {
                        icon: 'ℹ️',
                      });
                      navigate('/login', { state: { from: '/carrito' } });
                      return;
                    }
                    
                    navigate('/checkout');
                  }}
                  disabled={!allItemsHaveDates()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user ? 'Proceder al checkout' : 'Inicia sesión para continuar'}
                </button>

                <Link
                  to="/products"
                  className="block text-center mt-4 text-blue-600 hover:underline"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
