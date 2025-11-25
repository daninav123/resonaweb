import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { orderModificationService } from '../../services/orderModification.service';
import { guestCart } from '../../utils/guestCart';

interface Props {
  orderId: string;
  currentItems: any[];
  orderDates: { startDate: string; endDate: string };
  onClose: () => void;
  onSuccess: () => void;
}

export const EditOrderModal: React.FC<Props> = ({ orderId, currentItems, orderDates, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [remove, setRemove] = useState<string[]>([]);
  const [add, setAdd] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const res: any = await api.get('/products', { params: { search, limit: 50 } });
      return res.data || res || [];
    },
  });

  // Cargar items del carrito
  useEffect(() => {
    const items = guestCart.getCart();
    setCartItems(items);
  }, []);

  const handleAdd = (p: any) => {
    const price = Number(p.pricePerDay || p.basePrice || 0);
    setAdd([...add, { productId: p.id, product: p, quantity: 1, pricePerUnit: price, totalPrice: price }]);
    setShow(false);
  };

  const handleAddFromCart = (cartItem: any) => {
    const newItem = {
      productId: cartItem.productId,
      product: cartItem.product,
      quantity: cartItem.quantity,
      pricePerUnit: Number(cartItem.product.pricePerDay || cartItem.product.basePrice || 0),
      totalPrice: Number(cartItem.product.pricePerDay || cartItem.product.basePrice || 0) * cartItem.quantity,
    };
    setAdd([...add, newItem]);
    
    // Remover del carrito
    guestCart.removeItem(cartItem.id);
    setCartItems(guestCart.getCart());
    
    toast.success(`${cartItem.product.name} añadido al pedido`);
  };

  const updateQty = (i: number, q: number) => {
    const u = [...add];
    u[i].quantity = Math.max(1, q);
    u[i].totalPrice = u[i].pricePerUnit * u[i].quantity;
    setAdd(u);
  };

  const submit = async () => {
    if (!remove.length && !add.length) return toast.error('Sin cambios');
    setLoading(true);
    try {
      // Eliminar items primero
      if (remove.length) {
        await orderModificationService.removeItems(orderId, remove, 'Cliente');
      }
      
      // Añadir items
      let modificationResponse: any = null;
      if (add.length) {
        modificationResponse = await orderModificationService.addItems(orderId, add.map(i => ({
          ...i, startDate: orderDates.startDate, endDate: orderDates.endDate
        })), 'Cliente');
      }
      
      // Si hay cargo adicional, redirigir a página de pago
      if (diff > 0 && modificationResponse) {
        // Buscar la última modificación creada
        const modifications = modificationResponse.order?.modifications || modificationResponse.modifications || [];
        const lastModification = modifications[modifications.length - 1];
        
        if (lastModification?.id) {
          toast.success('Redirigiendo a pago...');
          onClose();
          navigate(`/modification-payment/${orderId}?modificationId=${lastModification.id}&amount=${diff}`);
          return;
        }
      }
      
      toast.success('Pedido modificado correctamente');
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const diff = add.reduce((s, i) => s + i.totalPrice, 0) - currentItems.filter(i => remove.includes(i.id)).reduce((s, i) => s + Number(i.totalPrice), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Editar Pedido</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Botones de acciones */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setShow(!show)} className="p-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Añadir Productos
            </button>
            
            {cartItems.length > 0 && (
              <button onClick={() => setShowCart(!showCart)} className="p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Desde Carrito ({cartItems.length})
              </button>
            )}
          </div>

          {/* Items del Carrito */}
          {showCart && cartItems.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold mb-3 text-blue-900">Productos en tu carrito:</h3>
              <div className="space-y-2">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-blue-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        Cantidad: {item.quantity} | €{Number(item.product.pricePerDay || item.product.basePrice || 0).toFixed(2)}/día
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddFromCart(item)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {show && (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {products.map((p: any) => (
                  <div key={p.id} onClick={() => handleAdd(p)} className="flex items-center justify-between gap-2 p-3 bg-white border rounded-lg hover:border-green-500 cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">€{Number(p.pricePerDay || p.basePrice || 0).toFixed(2)}/día</p>
                    </div>
                    <Plus className="w-5 h-5 text-green-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {add.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-green-600">A añadir:</h3>
              {add.map((i, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 border border-green-300 rounded-lg mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{i.product.name}</p>
                  </div>
                  <input type="number" min="1" value={i.quantity} onChange={(e) => updateQty(idx, +e.target.value)} className="w-20 px-2 py-1 border rounded text-center" />
                  <p className="font-semibold w-24 text-right">+€{i.totalPrice.toFixed(2)}</p>
                  <button onClick={() => setAdd(add.filter((_, i) => i !== idx))} className="p-2 bg-red-100 text-red-600 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}

          <h3 className="font-semibold">Productos actuales:</h3>
          {currentItems.map((i) => (
            <div key={i.id} className={`flex justify-between p-4 border rounded-lg ${remove.includes(i.id) ? 'bg-red-50 border-red-300' : 'bg-white'}`}>
              <div>
                <p className="font-medium">{i.product?.name}</p>
                <p className="text-sm text-gray-600">Cant: {i.quantity} | €{Number(i.totalPrice).toFixed(2)}</p>
              </div>
              <button onClick={() => setRemove(remove.includes(i.id) ? remove.filter(x => x !== i.id) : [...remove, i.id])} className={`p-2 rounded-lg ${remove.includes(i.id) ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-red-100'}`}>
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {(add.length > 0 || remove.length > 0) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold">Resumen:</p>
              {add.length > 0 && <p className="text-sm">✅ {add.length} producto(s) a añadir</p>}
              {remove.length > 0 && <p className="text-sm">❌ {remove.length} producto(s) a eliminar</p>}
              <p className="text-lg font-bold mt-2">
                {diff > 0 ? `Cargo adicional: €${diff.toFixed(2)}` : diff < 0 ? `Reembolso: €${Math.abs(diff).toFixed(2)}` : 'Sin cambio de precio'}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg" disabled={loading}>Cancelar</button>
          <button onClick={submit} disabled={loading || (!add.length && !remove.length)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Procesando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
