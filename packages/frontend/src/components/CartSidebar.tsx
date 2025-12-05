import { useState, useEffect } from 'react';
import { X, ShoppingCart, Trash2, Calendar, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [guestCartItems, setGuestCartItems] = useState<GuestCartItem[]>([]);

  // Cargar guest cart (SIEMPRE, backend no persiste aún)
  useEffect(() => {
    setGuestCartItems(guestCart.getCart());
    
    const handleUpdate = () => {
      setGuestCartItems(guestCart.getCart());
    };
    
    window.addEventListener('cartUpdated', handleUpdate);
    return () => window.removeEventListener('cartUpdated', handleUpdate);
  }, [isOpen]);

  // Cart de usuario no usado (backend no persiste)
  const { data: cart, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => ({ items: guestCartItems }),
    enabled: false,
  });

  const removeItem = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/cart/items/${productId}`);
    },
    onSuccess: () => {
      refetch();
      toast.success('Producto eliminado');
    },
  });

  const handleGuestRemoveItem = (itemId: string) => {
    guestCart.removeItem(itemId);
    setGuestCartItems(guestCart.getCart());
    toast.success('Producto eliminado');
  };

  const cartItems = guestCartItems;

  const calculateItemPrice = (item: any) => {
    // Si es un item de evento (calculadora), usar su total calculado
    if (item.eventMetadata) {
      const partsTotal = Number(item.eventMetadata.partsTotal) || 0;
      const extrasTotal = Number(item.eventMetadata.extrasTotal) || 0;
      return partsTotal + extrasTotal;
    }
    
    // Si tiene fechas, calcular por días
    if (item.startDate && item.endDate) {
      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      return item.product.pricePerDay * days * item.quantity;
    }
    
    // Si no tiene fechas, usar precio por día × cantidad (precio base)
    return item.product.pricePerDay * item.quantity;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);

  // Calcular descuento VIP
  const calculateVIPDiscount = () => {
    if (!user || !user.userLevel) return 0;
    
    if (user.userLevel === 'VIP') {
      return subtotal * 0.50; // 50% descuento
    } else if (user.userLevel === 'VIP_PLUS') {
      return subtotal * 0.70; // 70% descuento
    }
    
    return 0;
  };

  const vipDiscount = calculateVIPDiscount();
  const total = subtotal - vipDiscount;

  const handleViewCart = () => {
    onClose();
    navigate('/carrito');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Mi Carrito ({cartItems.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Añade productos para empezar!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item: any) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-3">
                    <img
                      src={item.product.mainImageUrl || '/placeholder.png'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {item.product.category?.name}
                      </p>
                      <p className="text-sm text-blue-600 font-semibold mt-1">
                        €{item.product.pricePerDay}/día × {item.quantity}
                      </p>
                      
                      {item.startDate && item.endDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Detalles del evento si existe eventMetadata */}
                      {item.eventMetadata && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs space-y-1">
                          {item.eventMetadata.eventType && (
                            <p><span className="font-medium">Tipo:</span> {item.eventMetadata.eventType}</p>
                          )}
                          {item.eventMetadata.attendees && (
                            <p><span className="font-medium">Asistentes:</span> {item.eventMetadata.attendees}</p>
                          )}
                          {item.eventMetadata.eventLocation && (
                            <p><span className="font-medium">📍 Ubicación:</span> {item.eventMetadata.eventLocation}</p>
                          )}
                          
                          {/* Partes del evento */}
                          {item.eventMetadata.selectedParts && item.eventMetadata.selectedParts.length > 0 && (
                            <div className="mt-1">
                              <p className="font-medium">📦 Partes:</p>
                              <ul className="ml-2 space-y-0.5">
                                {item.eventMetadata.selectedParts.map((part: any, idx: number) => (
                                  <li key={idx} className="text-gray-600">
                                    • {part.name} {part.price > 0 && `€${Number(part.price).toFixed(2)}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Extras del evento */}
                          {item.eventMetadata.selectedExtras && item.eventMetadata.selectedExtras.length > 0 && (
                            <div className="mt-1">
                              <p className="font-medium">✨ Extras:</p>
                              <ul className="ml-2 space-y-0.5">
                                {item.eventMetadata.selectedExtras.map((extra: any, idx: number) => (
                                  <li key={idx} className="text-gray-600">
                                    • {extra.name} {extra.quantity > 1 && `(x${extra.quantity})`} {extra.total > 0 && `€${Number(extra.total).toFixed(2)}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Totales del evento */}
                          {(item.eventMetadata.partsTotal || item.eventMetadata.extrasTotal) && (
                            <div className="mt-1 pt-1 border-t border-gray-200">
                              <p className="font-semibold text-blue-700">
                                💰 Total: €{(
                                  (Number(item.eventMetadata.partsTotal) || 0) + 
                                  (Number(item.eventMetadata.extrasTotal) || 0)
                                ).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleGuestRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 h-fit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {/* Alerta VIP */}
            {user && user.userLevel && user.userLevel !== 'STANDARD' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded-r">
                <p className="text-xs font-bold text-yellow-900 flex items-center gap-1">
                  {user.userLevel === 'VIP' ? (
                    <><Star className="w-3 h-3" /> ⭐ VIP</>  
                  ) : (
                    <><Crown className="w-3 h-3" /> 👑 VIP PLUS</>
                  )}
                </p>
                <p className="text-xs text-yellow-800 mt-1">
                  {user.userLevel === 'VIP' ? '50%' : '70%'} descuento
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">
                  {subtotal > 0 ? `€${subtotal.toFixed(2)}` : '-'}
                </span>
              </div>

              {/* Descuento VIP */}
              {vipDiscount > 0 && (
                <div className="flex justify-between text-sm font-semibold text-green-600">
                  <span className="flex items-center gap-1">
                    {user?.userLevel === 'VIP' ? (
                      <><Star className="w-3 h-3" /> Descuento VIP</>
                    ) : (
                      <><Crown className="w-3 h-3" /> Descuento VIP+</>
                    )}
                  </span>
                  <span>-€{vipDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="text-resona">
                  €{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleViewCart}
              className="w-full bg-resona text-white py-3 rounded-lg font-semibold hover:bg-resona-dark transition"
            >
              Ver carrito completo
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
