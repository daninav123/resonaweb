import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreditCard, Lock, User, Mail, Phone, MapPin, ShoppingBag, AlertCircle, Info, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { calculatePaymentBreakdown } from '../utils/depositCalculator';
import { CouponInput } from '../components/coupons/CouponInput';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Dirección de entrega
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'España',
    
    // Datos de pago
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    
    // Opciones adicionales
    deliveryOption: 'pickup', // pickup, delivery
    notes: '',
    acceptTerms: false,
  });

  // Obtener carrito actual desde localStorage
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  
  // Estado para cupón de descuento
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
    freeShipping?: boolean;
  } | null>(null);
  
  // Estados para envío e instalación
  const [distance, setDistance] = useState<number>(15);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [calculatedShipping, setCalculatedShipping] = useState<any>(null);
  const [shippingConfig, setShippingConfig] = useState<any>(null);

  // Cargar configuración de envío al montar
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
  }, []);

  // Calcular costes de envío cuando cambia algo
  useEffect(() => {
    const calculateShipping = async () => {
      if (distance > 0 && cartItems.length > 0 && formData.deliveryOption === 'delivery') {
        try {
          const productsData = cartItems.map((item: any) => ({
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
        setCalculatedShipping(null);
      }
    };

    calculateShipping();
  }, [distance, includeInstallation, cartItems, formData.deliveryOption]);

  useEffect(() => {
    // Cargar items del carrito desde localStorage
    const items = guestCart.getCart();
    console.log('📦 Carrito en checkout:', items);
    setCartItems(items);
    
    // Cargar datos de envío desde localStorage si existen
    const savedDistance = localStorage.getItem('checkoutDistance');
    const savedAddress = localStorage.getItem('checkoutAddress');
    const savedInstallation = localStorage.getItem('checkoutInstallation');
    
    if (savedDistance) setDistance(Number(savedDistance));
    if (savedAddress) setDeliveryAddress(savedAddress);
    if (savedInstallation) setIncludeInstallation(savedInstallation === 'true');
    
    // Verificar que hay items y tienen fechas
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      navigate('/carrito');
      return;
    }
    
    // Verificar que todos los items tienen fechas
    const itemsWithoutDates = items.filter(item => !item.startDate || !item.endDate);
    if (itemsWithoutDates.length > 0) {
      toast.error('Debes asignar fechas a todos los productos en el carrito');
      navigate('/carrito');
      return;
    }
    
    // Verificar que no hay productos con fechas inválidas
    const invalidItems = items.filter(item => {
      const productStock = item.product?.stock ?? 0;
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
    
    if (invalidItems.length > 0) {
      const productNames = invalidItems.map(i => i.product.name).join(', ');
      toast.error(`Los siguientes productos no están disponibles para las fechas seleccionadas: ${productNames}. Por favor, vuelve al carrito y ajusta las fechas.`);
      navigate('/carrito');
      return;
    }
  }, [navigate]);

  // Crear orden
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response: any = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('✅ ORDEN CREADA EXITOSAMENTE:', data);
      console.log('✅ Estructura completa:', JSON.stringify(data, null, 2));
      
      toast.success('¡Pedido realizado con éxito!');
      
      // Limpiar carrito después del éxito
      guestCart.clear();
      
      // El backend devuelve { message: '...', order: { id, ... } }
      const orderId = data?.order?.id || data?.id || data?.data?.id;
      
      if (orderId) {
        console.log('✅ Navegando a pedido:', orderId);
        navigate(`/mis-pedidos/${orderId}`);
      } else {
        console.log('⚠️ No se encontró ID de orden, navegando a lista de pedidos');
        navigate('/mis-pedidos');
      }
      
      setIsProcessing(false);
    },
    onError: (error: any) => {
      console.error('❌ Error completo del backend:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response data COMPLETO:', JSON.stringify(error.response?.data, null, 2));
      console.error('❌ Response status:', error.response?.status);
      
      // Intentar extraer el mensaje de error
      const errorData = error.response?.data?.error;
      const errorMessage = typeof errorData === 'string' 
        ? errorData 
        : errorData?.message || error.response?.data?.message || error.message || 'Error al procesar el pedido';
      
      console.error('❌ Mensaje final:', errorMessage);
      
      toast.error(`Error: ${errorMessage}`);
      setIsProcessing(false);
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

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total: number, item: GuestCartItem) => {
      const days = calculateDays(item.startDate || '', item.endDate || '');
      return total + (item.product.pricePerDay * days * item.quantity);
    }, 0);
  };

  const calculateShippingCost = () => {
    if (formData.deliveryOption !== 'delivery') return 0;
    
    if (calculatedShipping) {
      return includeInstallation 
        ? Number(calculatedShipping.totalInstallationCost || 0)
        : Number(calculatedShipping.totalShippingCost || 0);
    }
    
    return 20; // Mínimo por defecto
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.discountAmount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = appliedCoupon?.freeShipping ? 0 : calculateShippingCost();
    const discount = calculateDiscount();
    const beforeTax = subtotal + shipping - discount;
    return Math.max(0, beforeTax * 1.21); // Con IVA (nunca negativo)
  };

  // Calcular desglose de pago (señal, fianza, etc.)
  const paymentBreakdown = calculatePaymentBreakdown(
    calculateSubtotal(),
    calculateShippingCost(),
    formData.deliveryOption as 'pickup' | 'delivery'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setIsProcessing(true);

    // Crear orden con los items del carrito
    setTimeout(() => {
      const orderItems = cartItems.map(item => {
        const days = calculateDays(item.startDate || '', item.endDate || '');
        const pricePerUnit = item.product.pricePerDay * days;
        const totalPrice = pricePerUnit * item.quantity;
        
        // Convertir fechas de string "YYYY-MM-DD" a Date ISO string
        const startDate = item.startDate ? new Date(item.startDate + 'T00:00:00.000Z').toISOString() : new Date().toISOString();
        const endDate = item.endDate ? new Date(item.endDate + 'T23:59:59.999Z').toISOString() : new Date().toISOString();
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: pricePerUnit,
          totalPrice: totalPrice,
          startDate: startDate,  // ISO Date string
          endDate: endDate,      // ISO Date string
        };
      });
      
      const orderPayload = {
        // Items
        items: orderItems,
        
        // Tipo de entrega (PICKUP o DELIVERY en mayúsculas)
        deliveryType: formData.deliveryOption.toUpperCase(),
        
        // Dirección de entrega (solo si es delivery)
        deliveryAddress: formData.deliveryOption === 'delivery' 
          ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`
          : undefined,
        
        // Notas
        notes: formData.notes || undefined,
        
        // Cupón de descuento
        couponCode: appliedCoupon?.code || undefined,
        discountAmount: appliedCoupon?.discountAmount || undefined,
      };
      
      console.log('📦 Enviando orden al backend:', orderPayload);
      console.log('📦 Items detalle:', JSON.stringify(orderPayload.items, null, 2));
      
      createOrderMutation.mutate(orderPayload);
    }, 2000);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // cartItems ya está definido en el state
  const total = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Añade productos antes de continuar con el checkout</p>
            <button
              onClick={() => navigate('/productos')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <p className="text-sm mt-1">Datos</p>
            </div>
            <div className="flex-1 border-t-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-200'}" />
            <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <p className="text-sm mt-1">Entrega</p>
            </div>
            <div className="flex-1 border-t-2 ${step >= 3 ? 'border-blue-600' : 'border-gray-200'}" />
            <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <p className="text-sm mt-1">Pago</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Datos Personales */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Datos Personales
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Dirección y Fechas */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Entrega y Fechas
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Método de entrega</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className={`border rounded-lg p-4 cursor-pointer ${formData.deliveryOption === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={formData.deliveryOption === 'pickup'}
                          onChange={(e) => updateFormData('deliveryOption', e.target.value)}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium">Recogida en tienda</p>
                          <p className="text-sm text-gray-600">Gratis - Calle Example 123, Valencia</p>
                        </div>
                      </label>
                      <label className={`border rounded-lg p-4 cursor-pointer ${formData.deliveryOption === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="delivery"
                          checked={formData.deliveryOption === 'delivery'}
                          onChange={(e) => updateFormData('deliveryOption', e.target.value)}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium">Envío a domicilio</p>
                          <p className="text-sm text-gray-600">+€50 - Introduce tu dirección</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.deliveryOption === 'delivery' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => updateFormData('city', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                          <input
                            type="text"
                            required
                            value={formData.zipCode}
                            onChange={(e) => updateFormData('zipCode', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">📍 Distancia aproximada (km)</label>
                        <input
                          type="number"
                          min="1"
                          value={distance}
                          onChange={(e) => {
                            setDistance(Number(e.target.value));
                            localStorage.setItem('checkoutDistance', e.target.value);
                          }}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="15"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Distancia desde nuestra ubicación ({shippingConfig?.baseAddress || 'Madrid, España'})
                        </p>
                      </div>
                      
                      <div className="border-t pt-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeInstallation}
                            onChange={(e) => {
                              setIncludeInstallation(e.target.checked);
                              localStorage.setItem('checkoutInstallation', e.target.checked.toString());
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">🔧 ¿Necesitas montaje/instalación?</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Nuestro equipo montará todo el equipo en tu evento
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {calculatedShipping && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-xs text-blue-900 font-semibold">
                            Zona: {calculatedShipping.zone === 'LOCAL' ? '🟢 Local' : 
                                  calculatedShipping.zone === 'REGIONAL' ? '🔵 Regional' :
                                  calculatedShipping.zone === 'EXTENDED' ? '🟡 Ampliada' : '🔴 Personalizada'}
                          </p>
                          <p className="text-xs text-blue-800 mt-1">
                            Coste: €{calculateShippingCost().toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Pago */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Información de Pago
                  </h2>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Modo Demo:</strong> Usa la tarjeta 4242 4242 4242 4242 con cualquier fecha futura y CVC.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la tarjeta</label>
                      <input
                        type="text"
                        required
                        value={formData.cardName}
                        onChange={(e) => updateFormData('cardName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                      <div className="relative">
                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => updateFormData('cardNumber', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
                        <input
                          type="text"
                          required
                          value={formData.cardExpiry}
                          onChange={(e) => updateFormData('cardExpiry', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <div className="relative">
                          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            value={formData.cardCvc}
                            onChange={(e) => updateFormData('cardCvc', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Acepto los términos y condiciones y la política de privacidad
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Anterior
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pagar €{total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium">€{(item.product.pricePerDay * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 my-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {/* Coupon Input */}
                <div className="my-4">
                  <CouponInput
                    orderAmount={calculateSubtotal()}
                    onCouponApplied={(discount) => setAppliedCoupon(discount)}
                    onCouponRemoved={() => setAppliedCoupon(null)}
                    appliedCoupon={appliedCoupon?.code}
                  />
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span className="font-medium flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Descuento ({appliedCoupon.code})
                    </span>
                    <span className="font-bold">-€{appliedCoupon.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-b py-4 my-4 space-y-2">
                
                {formData.deliveryOption === 'delivery' && calculatedShipping && (
                  <div className="bg-blue-50 p-3 rounded-lg space-y-2 my-2">
                    <div className="font-semibold text-xs text-blue-900">
                      {includeInstallation ? '🚚 + 🔧 Envío e Instalación:' : '🚚 Coste de Envío:'}
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-600 pl-3">
                      <span>• Precio base (distancia)</span>
                      <span>€{Number(calculatedShipping.baseWithMinimum || 0).toFixed(2)}</span>
                    </div>
                    
                    {calculatedShipping.breakdown?.products > 0 && (
                      <div className="flex justify-between text-xs text-gray-600 pl-3">
                        <span>• Costes por productos</span>
                        <span>€{Number(calculatedShipping.breakdown.products || 0).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-xs text-blue-900 pt-2 border-t border-blue-200">
                      <span>Total {includeInstallation ? 'envío + instalación' : 'envío'}</span>
                      <span>€{calculateShippingCost().toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {formData.deliveryOption === 'delivery' && !calculatedShipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">🚚 Envío</span>
                    <span>€{calculateShippingCost().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (21%)</span>
                  <span>€{(total - (total / 1.21)).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold mb-2">
                  <span>Total Pedido</span>
                  <span className="text-gray-900">
                    €{paymentBreakdown.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Desglose de Pago según método de entrega */}
              {formData.deliveryOption === 'pickup' ? (
                <>
                  {/* RECOGIDA EN TIENDA */}
                  <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-orange-900 text-sm mb-1">Pago en Tienda</h3>
                        <p className="text-xs text-orange-800">
                          Para recogidas en tienda, pagas el 50% ahora como señal.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">💳 A pagar ahora (50%):</span>
                        <span className="font-bold text-green-600">
                          €{paymentBreakdown.payNow.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="border-t border-orange-200 pt-2 mt-2">
                        <p className="text-xs text-orange-800 font-semibold mb-2">
                          En tienda pagarás:
                        </p>
                        <div className="flex justify-between text-xs pl-3">
                          <span>• Resto del alquiler (50%):</span>
                          <span>€{paymentBreakdown.payLater.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs pl-3 mt-1">
                          <span>• Fianza (reembolsable):</span>
                          <span className="font-bold">€{paymentBreakdown.deposit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xs mt-2 pt-2 border-t border-orange-200">
                          <span>Total en tienda:</span>
                          <span>€{(paymentBreakdown.payLater + paymentBreakdown.deposit).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-2 rounded mt-2">
                        <p className="text-xs text-gray-600">
                          ℹ️ La fianza se devolverá al finalizar el alquiler si el material se devuelve en perfectas condiciones.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ENVÍO A DOMICILIO */}
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-green-900 text-sm mb-1">Pago Total Online</h3>
                        <p className="text-xs text-green-800">
                          Para envíos a domicilio, pagas el 100% ahora. Sin fianza.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-700">💳 A pagar ahora:</span>
                      <span className="text-green-600">
                        €{paymentBreakdown.payNow.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="bg-white p-2 rounded mt-3">
                      <p className="text-xs text-gray-600">
                        ✅ Sin fianza • Todo incluido • Pago único
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Pago Seguro</span>
                </div>
                <p className="text-xs text-gray-500">
                  Tus datos están protegidos con encriptación SSL.
                  Procesamos los pagos a través de Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
