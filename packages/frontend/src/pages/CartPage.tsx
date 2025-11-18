import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, Calendar, ShoppingCart, Package, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { useAuthStore } from '../stores/authStore';
import { productService } from '../services/product.service';
import { calculatePaymentBreakdown } from '../utils/depositCalculator';
import AddressAutocomplete from '../components/AddressAutocomplete';

const CartPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthStore();
  const [guestCartItems, setGuestCartItems] = useState<GuestCartItem[]>([]);
  const [globalDates, setGlobalDates] = useState({ start: '', end: '' });
  const [customDatesItems, setCustomDatesItems] = useState<Set<string>>(new Set());
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [distance, setDistance] = useState<number>(15); // Default 15km
  const [calculatedShipping, setCalculatedShipping] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [useManualDistance, setUseManualDistance] = useState(false);
  const [shippingConfig, setShippingConfig] = useState<any>(null);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup'); // pickup = recogida, delivery = envío
  
  // Debug de estado de autenticación (solo en desarrollo)
  // console.log('CartPage - Auth State:', { 
  //   user: user?.email, 
  //   isAuthenticated, 
  //   loading,
  //   hasUser: !!user 
  // });

  // Cargar configuración de envío y datos guardados al montar
  useEffect(() => {
    const loadShippingConfig = async () => {
      try {
        const config: any = await api.get('/shipping-config');
        setShippingConfig(config);
      } catch (error) {
        console.error('Error cargando configuración de envío:', error);
      }
    };

    loadShippingConfig();

    // Restaurar datos guardados del sidebar
    const savedDates = localStorage.getItem('cartGlobalDates');
    const savedDeliveryOption = localStorage.getItem('cartDeliveryOption');
    const savedDistance = localStorage.getItem('cartDistance');
    const savedAddress = localStorage.getItem('cartDeliveryAddress');
    const savedInstallation = localStorage.getItem('cartIncludeInstallation');

    if (savedDates) {
      try {
        const dates = JSON.parse(savedDates);
        setGlobalDates(dates);
      } catch (e) {
        console.error('Error parsing saved dates');
      }
    }

    if (savedDeliveryOption) {
      setDeliveryOption(savedDeliveryOption as 'pickup' | 'delivery');
    }

    if (savedDistance) {
      setDistance(Number(savedDistance));
    }

    if (savedAddress) {
      setDeliveryAddress(savedAddress);
    }

    if (savedInstallation) {
      setIncludeInstallation(savedInstallation === 'true');
    }
  }, []);

  // Handler para cuando se selecciona una dirección
  const handleAddressSelect = (address: string, calculatedDistance: number) => {
    setDeliveryAddress(address);
    setDistance(calculatedDistance);
    toast.success(`Distancia calculada: ${calculatedDistance}km`);
  };

  // Guardar fechas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('cartGlobalDates', JSON.stringify(globalDates));
  }, [globalDates]);

  // Guardar opción de entrega en localStorage
  useEffect(() => {
    localStorage.setItem('cartDeliveryOption', deliveryOption);
  }, [deliveryOption]);

  // Guardar distancia en localStorage
  useEffect(() => {
    localStorage.setItem('cartDistance', distance.toString());
  }, [distance]);

  // Guardar dirección en localStorage
  useEffect(() => {
    localStorage.setItem('cartDeliveryAddress', deliveryAddress);
  }, [deliveryAddress]);

  // Guardar opción de instalación en localStorage
  useEffect(() => {
    localStorage.setItem('cartIncludeInstallation', includeInstallation.toString());
  }, [includeInstallation]);

  // Aplicar fechas globales automáticamente cuando cambian
  useEffect(() => {
    if (globalDates.start && globalDates.end && guestCartItems.length > 0) {
      // Aplicar fechas a todos los items que no tengan fechas personalizadas
      guestCartItems.forEach((item: any) => {
        if (!customDatesItems.has(item.id)) {
          guestCart.updateDates(item.id, globalDates.start, globalDates.end);
        }
      });
      // Forzar actualización del estado
      setGuestCartItems(guestCart.getCart());
    }
  }, [globalDates.start, globalDates.end]);

  // Calcular coste de envío cuando cambia distancia o instalación
  useEffect(() => {
    const calculateShipping = async () => {
      // Solo calcular si es envío a domicilio
      if (deliveryOption === 'delivery' && distance > 0 && guestCartItems.length > 0) {
        try {
          // Preparar datos de productos
          const productsData = guestCartItems.map((item: any) => ({
            shippingCost: Number(item.product.shippingCost || 0),
            installationCost: Number(item.product.installationCost || 0),
            quantity: item.quantity
          }));

          const response: any = await api.post('/shipping-config/calculate', {
            distance,
            includeInstallation,
            products: productsData
          });
          setCalculatedShipping(response);
        } catch (error) {
          console.error('Error calculando envío:', error);
        }
      } else {
        // Si es recogida, limpiar cálculo de envío
        setCalculatedShipping(null);
      }
    };

    calculateShipping();
  }, [distance, includeInstallation, guestCartItems, deliveryOption]);

  // Cargar guest cart (SIEMPRE, backend no persiste aún)
  useEffect(() => {
    const initializeCart = async () => {
      const cart = guestCart.getCart();
      
      // MIGRACIÓN AUTOMÁTICA: Actualizar productos sin stock con datos actuales
      let needsUpdate = false;
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          // Si el producto no tiene stock definido, actualizar desde la API
          if (item.product && (item.product.stock === undefined || item.product.realStock === undefined)) {
            try {
              console.log(`🔄 Actualizando producto sin stock: ${item.product.name}`);
              const response: any = await api.get(`/products/${item.productId}`);
              const productData = response.data.data || response.data;
              
              // Actualizar el producto en el item con los datos completos
              item.product = {
                ...item.product,
                stock: productData.stock,
                realStock: productData.realStock,
              };
              needsUpdate = true;
              console.log(`✅ Stock actualizado: ${item.product.name} -> stock: ${productData.stock}`);
            } catch (error) {
              console.error(`❌ Error actualizando producto ${item.productId}:`, error);
            }
          }
          return item;
        })
      );
      
      // Si hubo actualizaciones, guardar el carrito actualizado
      if (needsUpdate) {
        localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
        console.log('✅ Carrito actualizado con información de stock');
        toast.success('Carrito actualizado con información de stock actual', { duration: 3000 });
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      setGuestCartItems(updatedCart);
    };
    
    initializeCart();
    
    // Listener para actualizar cuando cambie
    const handleUpdate = () => {
      setGuestCartItems(guestCart.getCart());
    };
    
    window.addEventListener('cartUpdated', handleUpdate);
    return () => window.removeEventListener('cartUpdated', handleUpdate);
  }, []);

  // Nota: No usamos useQuery porque trabajamos con localStorage (guest cart)
  // El backend no persiste el carrito aún

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
    // Si no hay fechas, mostrar precio de mínimo 1 día
    if (!dates.start || !dates.end) {
      return item.product.pricePerDay * 1 * item.quantity;
    }
    const days = calculateDays(dates.start, dates.end);
    return item.product.pricePerDay * days * item.quantity;
  };

  const calculateShippingCost = () => {
    // Si es recogida en tienda, sin coste de envío
    if (deliveryOption === 'pickup') {
      return 0;
    }
    
    // Usar el cálculo del backend si está disponible
    if (calculatedShipping) {
      return includeInstallation 
        ? Number(calculatedShipping.totalInstallationCost || 0)
        : Number(calculatedShipping.totalShippingCost || 0);
    }
    
    // Fallback: mínimo default
    return 20;
  };

  const calculateInstallationCost = () => {
    // Ya está incluido en calculateShippingCost cuando includeInstallation es true
    return 0;
  };

  const calculateSubtotal = () => {
    return guestCartItems.reduce((total: number, item: any) => {
      return total + calculateItemPrice(item);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShippingCost();
    const installation = calculateInstallationCost();
    const totalBeforeTax = subtotal + shipping + installation;
    const tax = totalBeforeTax * 0.21; // IVA 21%
    return totalBeforeTax + tax;
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

  const hasInvalidDates = () => {
    // Verificar si algún producto con stock 0 tiene fechas < 30 días
    return guestCartItems.some((item: any) => {
      const productStock = (item.product as any)?.stock ?? 0;
      if (productStock === 0 && item.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(item.startDate);
        start.setHours(0, 0, 0, 0);
        const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilStart < 30;
      }
      return false;
    });
  };

  const getInvalidItemsCount = () => {
    return guestCartItems.filter((item: any) => {
      const productStock = (item.product as any)?.stock ?? 0;
      if (productStock === 0 && item.startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(item.startDate);
        start.setHours(0, 0, 0, 0);
        const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilStart < 30;
      }
      return false;
    }).length;
  };

  // Funciones para guest cart
  const handleGuestUpdateQuantity = (itemId: string, newQuantity: number) => {
    guestCart.updateQuantity(itemId, newQuantity);
    setGuestCartItems(guestCart.getCart());
    toast.success('Cantidad actualizada');
  };

  const handleGuestUpdateDates = (itemId: string, startDate: string, endDate: string) => {
    console.log('🔍 handleGuestUpdateDates called:', { itemId, startDate, endDate });
    
    // Validar si el producto tiene stock 0 y la fecha es < 1 mes
    const item = guestCartItems.find(i => i.id === itemId);
    if (item && item.product) {
      // Usar SOLO stock, no realStock (realStock puede ser diferente)
      const productStock = (item.product as any).stock ?? 0;
      console.log('📦 Producto en carrito:', {
        nombre: item.product.name,
        stock: productStock,
        realStock: (item.product as any).realStock,
        startDate,
      });
      
      if (productStock === 0 && startDate) {
        // Calcular días hasta la fecha de inicio
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log('⏰ Validación de fechas:', {
          today: today.toISOString().split('T')[0],
          startDate: start.toISOString().split('T')[0],
          daysUntilStart,
          shouldReject: daysUntilStart < 30
        });
        
        // Sin validación - permitir guardar la fecha y que el badge visual lo indique
        if (daysUntilStart < 30) {
          console.log('⚠️ Fecha cercana para producto sin stock - se guardará y mostrará badge');
        } else {
          console.log('✅ Fecha con suficiente antelación');
        }
      }
    }
    
    console.log('💾 Guardando fechas en carrito');
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
    console.log('🌍 Aplicando fechas globales:', globalDates);
    
    if (!globalDates.start || !globalDates.end) {
      toast.error('Selecciona las fechas globales');
      return;
    }
    
    // Validar productos con stock 0
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(globalDates.start);
    start.setHours(0, 0, 0, 0);
    const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    console.log('⏰ Cálculo de días globales:', {
      today: today.toISOString().split('T')[0],
      startDate: start.toISOString().split('T')[0],
      daysUntilStart
    });
    
    const itemsWithoutStock = guestCartItems.filter((item: any) => {
      // Usar SOLO stock, no realStock (realStock puede ser diferente)
      const productStock = item.product?.stock ?? 0;
      return productStock === 0 && !customDatesItems.has(item.id);
    });
    
    console.log('📦 Productos sin stock encontrados:', itemsWithoutStock.length);
    itemsWithoutStock.forEach(item => {
      console.log('  -', item.product.name, 'stock:', item.product.stock);
    });
    
    // Aplicar fechas sin validación - el badge visual mostrará "no disponible" en cada item
    guestCartItems.forEach((item: any) => {
      if (!customDatesItems.has(item.id)) {
        guestCart.updateDates(item.id, globalDates.start, globalDates.end);
      }
    });
    
    setGuestCartItems(guestCart.getCart());
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

  // Loading state eliminado - trabajamos directo con localStorage

  // Usar siempre guest cart (backend no persiste aún)
  const cartItems = guestCartItems;
  const subtotal = calculateSubtotal();
  const shippingCost = calculateShippingCost();
  const installationCost = calculateInstallationCost();
  const totalBeforeTax = subtotal + shippingCost + installationCost;
  const tax = totalBeforeTax * 0.21;
  const total = calculateTotal();
  
  // Calcular desglose de pago (señal, fianza, etc.)
  const paymentBreakdown = calculatePaymentBreakdown(
    subtotal,
    shippingCost,
    deliveryOption
  );

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
                          
                          {/* Badge de stock - solo muestra cuando hay fecha inválida */}
                          {(() => {
                            const productStock = (item.product as any)?.stock ?? 0;
                            const hasDateAssigned = item.startDate;
                            
                            // Solo mostrar badge si tiene stock 0, fecha asignada, y fecha inválida
                            if (productStock === 0 && hasDateAssigned) {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const start = new Date(item.startDate);
                              start.setHours(0, 0, 0, 0);
                              const daysUntilStart = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              
                              if (daysUntilStart < 30) {
                                return (
                                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-700 font-semibold">
                                      No disponible para las fechas seleccionadas
                                    </p>
                                  </div>
                                );
                              }
                            }
                            
                            // No mostrar nada en otros casos
                            return null;
                          })()}
                          
                          <p className="text-blue-600 font-semibold mt-2">
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
                
                {/* Fechas del Pedido */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Fechas del Pedido
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Inicio
                      </label>
                      <input
                        type="date"
                        value={globalDates.start}
                        onChange={(e) => setGlobalDates({ ...globalDates, start: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fin
                      </label>
                      <input
                        type="date"
                        value={globalDates.end}
                        onChange={(e) => setGlobalDates({ ...globalDates, end: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={globalDates.start || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>

                {!allItemsHaveDates() && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      ⚠️ Selecciona las fechas de inicio y fin
                    </p>
                  </div>
                )}

                {/* Método de Entrega */}
                <div className="mb-4 pb-4 border-b">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Método de entrega
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('pickup')}
                      className={`p-4 border-2 rounded-lg transition ${
                        deliveryOption === 'pickup'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">🏪 Recogida en tienda</p>
                        <p className="text-sm text-gray-600 mt-1">Gratis</p>
                        <p className="text-xs text-gray-500 mt-1">{shippingConfig?.baseAddress || 'Valencia, España'}</p>
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('delivery')}
                      className={`p-4 border-2 rounded-lg transition ${
                        deliveryOption === 'delivery'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">🚚 Envío a domicilio</p>
                        <p className="text-sm text-gray-600 mt-1">Según distancia</p>
                        <p className="text-xs text-gray-500 mt-1">Introduce tu dirección</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Dirección y Distancia - Solo si es envío */}
                {deliveryOption === 'delivery' && (
                  <div className="mb-4 pb-4 border-b space-y-3">
                    {!useManualDistance ? (
                      <>
                      <AddressAutocomplete 
                        onAddressSelect={handleAddressSelect}
                        baseAddress={shippingConfig?.baseAddress || 'Madrid, España'}
                      />
                      <button
                        type="button"
                        onClick={() => setUseManualDistance(true)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        O introduce la distancia manualmente
                      </button>
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        📍 Distancia aproximada (km)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={distance}
                        onChange={(e) => setDistance(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="15"
                      />
                      <button
                        type="button"
                        onClick={() => setUseManualDistance(false)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Volver a búsqueda por dirección
                      </button>
                    </>
                  )}
                  
                  {calculatedShipping && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <p className="text-xs text-blue-900">
                        Zona: {calculatedShipping.zone === 'LOCAL' ? '🟢 Local' : 
                              calculatedShipping.zone === 'REGIONAL' ? '🔵 Regional' :
                              calculatedShipping.zone === 'EXTENDED' ? '🟡 Ampliada' : '🔴 Personalizada'}
                        {calculatedShipping.breakdown?.minimumApplied && ' (mínimo aplicado)'}
                      </p>
                      <p className="text-xs text-blue-800 font-semibold mt-1">
                        Distancia: {distance}km → Coste: €{calculatedShipping.finalCost}
                      </p>
                    </div>
                  )}
                  </div>
                )}

                {/* Checkbox de Instalación */}
                <div className="mb-4 pb-4 border-b">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeInstallation}
                      onChange={(e) => setIncludeInstallation(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">¿Necesitas montaje/instalación?</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Nuestro equipo montará todo el equipo en tu evento
                      </p>
                    </div>
                  </label>
                </div>

                <div className="space-y-2 mb-4 pb-4 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal productos</span>
                    <span className="font-semibold">
                      {subtotal > 0 ? `€${subtotal.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  
                  {/* Desglose de Envío/Instalación */}
                  {deliveryOption === 'pickup' && (
                    <div className="flex justify-between text-sm bg-green-50 p-2 rounded">
                      <span className="text-gray-600">🏪 Recogida en tienda</span>
                      <span className="font-semibold text-green-600">Gratis</span>
                    </div>
                  )}
                  
                  {deliveryOption === 'delivery' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {includeInstallation ? '🚚 + 🔧 Envío + instalación' : '🚚 Coste de envío'}
                      </span>
                      <span className="font-semibold">
                        €{shippingCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">IVA (21%)</span>
                    <span className="font-semibold">
                      €{tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold mb-4">
                  <span>Total</span>
                  <span className="text-blue-600">
                    €{total.toFixed(2)}
                  </span>
                </div>

                {/* Información de Pago */}
                {deliveryOption === 'pickup' ? (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-orange-900 mb-1">Pago en Tienda</p>
                        <p className="text-orange-800">
                          Ahora: <span className="font-bold">€{paymentBreakdown.payNow.toFixed(2)}</span> (50% señal)
                        </p>
                        <p className="text-orange-800">
                          En tienda: <span className="font-bold">€{(paymentBreakdown.payLater + paymentBreakdown.deposit).toFixed(2)}</span> (50% + fianza de €{paymentBreakdown.deposit.toFixed(2)})
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-green-900 mb-1">Pago Total Online</p>
                        <p className="text-green-800">
                          Pagas <span className="font-bold">€{paymentBreakdown.payNow.toFixed(2)}</span> (100%) ahora. Sin fianza.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumen de validación */}
                {hasInvalidDates() && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">
                      ⚠️ {getInvalidItemsCount()} {getInvalidItemsCount() === 1 ? 'producto no está' : 'productos no están'} disponible para las fechas seleccionadas
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Cambia las fechas o elimina los productos con el badge rojo para continuar
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    console.log('🔘 Click en Proceder al checkout:', {
                      isAuthenticated,
                      loading,
                      user: user?.email,
                      hasInvalidDates: hasInvalidDates(),
                      allItemsHaveDates: allItemsHaveDates()
                    });

                    if (!allItemsHaveDates()) {
                      toast.error('Por favor selecciona las fechas del pedido arriba');
                      return;
                    }
                    
                    if (hasInvalidDates()) {
                      toast.error('No puedes proceder. Algunos productos no están disponibles para las fechas seleccionadas.');
                      return;
                    }
                    
                    // Usar isAuthenticated en lugar de user para validación más confiable
                    if (!isAuthenticated && !loading) {
                      console.log('❌ No autenticado - redirigiendo a login');
                      toast('Inicia sesión o regístrate para continuar', {
                        icon: 'ℹ️',
                      });
                      navigate('/login', { state: { from: '/carrito' } });
                      return;
                    }
                    
                    console.log('✅ Procediendo al checkout');
                    
                    // Guardar datos de envío en localStorage para el checkout
                    // (ya están guardados en tiempo real con prefijo 'cart', ahora los copiamos a 'checkout')
                    localStorage.setItem('checkoutDeliveryOption', deliveryOption);
                    localStorage.setItem('checkoutDistance', distance.toString());
                    localStorage.setItem('checkoutAddress', deliveryAddress);
                    localStorage.setItem('checkoutInstallation', includeInstallation.toString());
                    
                    navigate('/checkout');
                  }}
                  disabled={!allItemsHaveDates() || hasInvalidDates() || loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verificando sesión...' : (isAuthenticated ? 'Proceder al checkout' : 'Inicia sesión para continuar')}
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
