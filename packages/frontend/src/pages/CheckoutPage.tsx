import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreditCard, Lock, User, Mail, Phone, MapPin, ShoppingBag, AlertCircle, Info, Tag, Star, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { calculatePaymentBreakdown } from '../utils/depositCalculator';
import { CouponInput } from '../components/coupons/CouponInput';
import { useAuthStore } from '../stores/authStore';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const user = authStore.user;
  const isAuthenticated = authStore.isAuthenticated;
  const [authChecked, setAuthChecked] = useState(false);
  
  // 🔍 Verificar autenticación al montar
  useEffect(() => {
    const checkUserAuth = async () => {
      // Si no hay usuario pero sí hay token en localStorage, forzar checkAuth
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          if (data.state?.accessToken && !user) {
            console.log('🔄 Forzando checkAuth porque hay token pero no user');
            await authStore.checkAuth();
          }
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }
      setAuthChecked(true);
    };
    
    checkUserAuth();
  }, []);
  
  // 🔍 DEBUG: Log user state
  useEffect(() => {
    console.log('🔍 CheckoutPage - User state:', {
      exists: !!user,
      email: user?.email,
      userLevel: user?.userLevel,
      isAuthenticated,
      authChecked
    });
  }, [user, isAuthenticated, authChecked]);
  
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
  
  // Control para evitar bucle infinito en cálculo de envío
  const [lastShippingCalc, setLastShippingCalc] = useState<string>('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

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
        // Crear clave única para esta configuración
        const calcKey = `${distance}-${includeInstallation}-${cartItems.length}`;
        
        // Solo calcular si cambió algo Y no estamos calculando ya
        if (calcKey === lastShippingCalc || isCalculatingShipping) {
          return;
        }
        
        try {
          setIsCalculatingShipping(true);
          setLastShippingCalc(calcKey);
          
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
        } finally {
          setIsCalculatingShipping(false);
        }
      } else {
        setCalculatedShipping(null);
      }
    };

    // Debounce de 300ms
    const timer = setTimeout(() => {
      calculateShipping();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [distance, includeInstallation, cartItems.length, formData.deliveryOption, lastShippingCalc, isCalculatingShipping]);

  // Cargar datos del usuario automáticamente
  useEffect(() => {
    if (user) {
      console.log('👤 Cargando datos del usuario:', user);
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: (user as any).phone || '',
      }));
    }
  }, [user]);

  // Forzar volver a Step 1 si los datos no están completos y estamos en Step 2
  useEffect(() => {
    if (step === 2 && (!formData.firstName || !formData.email || !formData.phone)) {
      console.log('⚠️ Datos incompletos, volviendo a Step 1');
      setStep(1);
      if (!formData.phone) {
        toast.error('Por favor añade tu número de teléfono');
      } else {
        toast.error('Por favor completa tus datos personales en tu perfil');
      }
    }
  }, [step, formData.firstName, formData.email, formData.phone]);

  // Estado para saber si productos incluyen transporte/montaje (sin fianza)
  const [shippingIncludedInPrice, setShippingIncludedInPrice] = useState(false);

  useEffect(() => {
    // Cargar items del carrito desde localStorage
    const items = guestCart.getCart();
    console.log('📦 Carrito en checkout:', items);
    setCartItems(items);
    
    // Cargar configuración de entrega desde localStorage del carrito
    const savedDeliveryOption = localStorage.getItem('checkoutDeliveryOption');
    const savedDistance = localStorage.getItem('checkoutDistance');
    const savedAddress = localStorage.getItem('checkoutAddress');
    const savedInstallation = localStorage.getItem('checkoutInstallation');
    
    // Detectar si productos incluyen transporte/montaje
    const hasShipping = localStorage.getItem('cartIncludesShippingInstallation') === 'true';
    setShippingIncludedInPrice(hasShipping);
    
    console.log('📦 Configuración de entrega del carrito:', {
      deliveryOption: savedDeliveryOption,
      distance: savedDistance,
      address: savedAddress,
      installation: savedInstallation,
      shippingIncluded: hasShipping
    });
    
    if (savedDeliveryOption) {
      setFormData(prev => ({ ...prev, deliveryOption: savedDeliveryOption as 'pickup' | 'delivery' }));
    }
    if (savedDistance) setDistance(Number(savedDistance));
    if (savedAddress) {
      setDeliveryAddress(savedAddress);
      setFormData(prev => ({ ...prev, address: savedAddress }));
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  // Crear orden
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      // api.post ya retorna response.data, no necesitamos .data otra vez
      const response: any = await api.post('/orders', orderData);
      return response;
    },
    onSuccess: (data) => {
      console.log('✅ ORDEN CREADA EXITOSAMENTE:', data);
      console.log('✅ Tipo de data:', typeof data);
      console.log('✅ Data completo:', JSON.stringify(data, null, 2));
      
      // Limpiar carrito
      guestCart.clear();
      
      // data ya es { message: '...', order: {...} }
      const order = data?.order || data;
      const orderId = order?.id;
      
      console.log('✅ Order extraído:', order);
      console.log('✅ Order ID:', orderId);
      
      if (!orderId) {
        console.error('❌ ERROR: No se pudo obtener el ID del pedido');
        toast.error('Error: No se pudo obtener el ID del pedido');
        setIsProcessing(false);
        return;
      }
      
      // Redirigir a Stripe para el pago
      toast.success('Redirigiendo a pago seguro...');
      navigate(`/checkout/stripe?orderId=${orderId}`);
      
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

  // Calcular descuento VIP
  const calculateVIPDiscount = () => {
    if (!user || !user.userLevel) return 0;
    
    const subtotal = calculateSubtotal();
    
    if (user.userLevel === 'VIP') {
      return subtotal * 0.50; // 50% descuento
    } else if (user.userLevel === 'VIP_PLUS') {
      return subtotal * 0.70; // 70% descuento
    }
    
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = appliedCoupon?.freeShipping ? 0 : calculateShippingCost();
    const couponDiscount = calculateDiscount();
    const vipDiscount = calculateVIPDiscount();
    const beforeTax = subtotal + shipping - couponDiscount - vipDiscount;
    return Math.max(0, beforeTax * 1.21); // Con IVA (nunca negativo)
  };

  // Calcular desglose de pago (señal, fianza, etc.)
  const paymentBreakdown = calculatePaymentBreakdown(
    calculateSubtotal(),
    calculateShippingCost(),
    formData.deliveryOption as 'pickup' | 'delivery',
    user?.userLevel, // ⭐ Pasar nivel VIP
    calculateVIPDiscount(), // ⭐ Pasar descuento VIP
    shippingIncludedInPrice // ⭐ Pasar si tiene transporte/montaje incluido (sin fianza)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.firstName || !formData.email || !formData.phone) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
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
                  
                  {/* Nota de datos cargados automáticamente */}
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Datos cargados automáticamente de tu perfil
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
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
                        readOnly
                        className="w-full pl-10 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono {!formData.phone && <span className="text-orange-600">(requerido - añádelo)</span>}
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          formData.phone 
                            ? 'bg-gray-50 text-gray-700' 
                            : 'bg-white focus:ring-2 focus:ring-blue-500'
                        }`}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">
                      💡 Puedes editar el teléfono aquí. Para modificar nombre y email, ve a tu <button type="button" onClick={() => navigate('/cuenta')} className="text-blue-600 hover:underline">perfil de usuario</button>
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        // Validar que los datos estén completos
                        if (!formData.firstName || !formData.email) {
                          toast.error('Por favor, asegúrate de tener nombre y email en tu perfil');
                          return;
                        }
                        if (!formData.phone) {
                          toast.error('Por favor, añade un número de teléfono');
                          return;
                        }
                        setStep(2);
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Confirmar Entrega */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Confirmación de Entrega
                  </h2>

                  {/* Nota de configuración del carrito */}
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Configuración seleccionada en el carrito
                    </p>
                  </div>

                  <div className="mb-6 p-5 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {formData.deliveryOption === 'pickup' ? (
                          <ShoppingBag className="w-6 h-6 text-blue-600" />
                        ) : (
                          <MapPin className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {formData.deliveryOption === 'pickup' ? 'Recogida en tienda' : 'Envío a domicilio'}
                        </h3>
                        {formData.deliveryOption === 'pickup' ? (
                          <p className="text-sm text-gray-600">Gratis - C/ de l'Illa Cabrera, 13, 46026 València</p>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-700"><strong>Dirección:</strong> {deliveryAddress || formData.address}</p>
                            <p className="text-sm text-gray-700"><strong>Distancia:</strong> {distance} km</p>
                            {includeInstallation && (
                              <p className="text-sm text-green-700 flex items-center gap-1 mt-2">
                                <span className="text-lg">🔧</span>
                                <strong>Incluye montaje/instalación</strong>
                              </p>
                            )}
                            {calculatedShipping && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <p className="text-sm text-gray-700">
                                  <strong>Coste de envío:</strong> €{calculatedShipping.shippingCost?.toFixed(2) || '0.00'}
                                </p>
                                {includeInstallation && calculatedShipping.installationCost > 0 && (
                                  <p className="text-sm text-gray-700">
                                    <strong>Coste de instalación:</strong> €{calculatedShipping.installationCost?.toFixed(2) || '0.00'}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-600">
                      💡 Para modificar la entrega, vuelve al <button type="button" onClick={() => navigate('/carrito')} className="text-blue-600 hover:underline">carrito</button>
                    </p>
                  </div>

                  {/* Método de Pago - Solo información, no selector */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Método de Pago</h3>
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-sm text-blue-900 mb-2">
                        <strong>💳 Aceptamos los siguientes métodos de pago:</strong>
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <span className="text-lg">💳</span>
                          <div>
                            <strong>Tarjeta de crédito/débito</strong>
                            <p className="text-xs text-blue-600">Pago instantáneo</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <span className="text-lg">🅿️</span>
                          <div>
                            <strong>PayPal</strong>
                            <p className="text-xs text-blue-600">Pago instantáneo</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                          <span className="text-lg">🏦</span>
                          <div>
                            <strong>Transferencia bancaria SEPA</strong>
                            <p className="text-xs text-blue-600">Se procesa en 3-5 días • Comisión más baja</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mt-3 pt-3 border-t border-blue-200">
                        Selecciona tu método preferido en la siguiente pantalla de pago seguro
                      </p>
                    </div>
                  </div>

                  {/* Términos y condiciones */}
                  <div className="mt-6">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        data-testid="accept-terms"
                        checked={formData.acceptTerms}
                        onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Acepto los <button type="button" className="text-blue-600 hover:underline">términos y condiciones</button> y la <button type="button" className="text-blue-600 hover:underline">política de privacidad</button>
                      </span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      data-testid="submit-checkout"
                      disabled={isProcessing}
                      className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Continuar al Pago
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
              
              {/* Alerta VIP */}
              {user && user.userLevel && user.userLevel !== 'STANDARD' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
                  <h3 className="font-bold text-yellow-900 flex items-center gap-2 mb-2">
                    {user.userLevel === 'VIP' ? (
                      <><Star className="w-5 h-5" /> ⭐ Beneficio VIP</>
                    ) : (
                      <><Crown className="w-5 h-5" /> 👑 Beneficio VIP PLUS</>
                    )}
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>✓ {user.userLevel === 'VIP' ? '50%' : '70%'} de descuento aplicado</li>
                    <li>✓ Sin fianza requerida (€0)</li>
                  </ul>
                </div>
              )}
              
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
                
                {/* Descuento VIP */}
                {calculateVIPDiscount() > 0 && (
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-yellow-700 flex items-center gap-1">
                      {user?.userLevel === 'VIP' ? (
                        <><Star className="w-4 h-4" /> Descuento VIP (50%)</>
                      ) : (
                        <><Crown className="w-4 h-4" /> Descuento VIP PLUS (70%)</>
                      )}
                    </span>
                    <span className="text-green-600 font-bold">-€{calculateVIPDiscount().toFixed(2)}</span>
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

              {/* Información de pago */}
              <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-900 text-sm mb-1">💳 Pago Total Online</h3>
                    <p className="text-xs text-blue-800">
                      Pagas el 100% del pedido ahora al reservar el material.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between text-lg font-bold mb-3">
                  <span className="text-gray-700">A pagar ahora:</span>
                  <span className="text-blue-600">
                    €{paymentBreakdown.payNow.toFixed(2)}
                  </span>
                </div>
                
                {paymentBreakdown.requiresDeposit && (
                  <div className="bg-blue-100 p-3 rounded border border-blue-200">
                    <p className="text-xs text-blue-900 font-semibold mb-1">
                      ℹ️ Fianza en tienda
                    </p>
                    <p className="text-xs text-blue-800">
                      Al recoger el material, se cobrará una fianza de <span className="font-bold">€{paymentBreakdown.deposit.toFixed(2)}</span> (reembolsable al devolver el material en perfectas condiciones).
                    </p>
                  </div>
                )}
                
                {!paymentBreakdown.requiresDeposit && user && (user.userLevel === 'VIP' || user.userLevel === 'VIP_PLUS') && (
                  <div className="bg-yellow-100 p-3 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-900 font-semibold mb-1">
                      ⭐ Beneficio {user.userLevel}
                    </p>
                    <p className="text-xs text-yellow-800">
                      Como usuario {user.userLevel}, no necesitas pagar fianza.
                    </p>
                  </div>
                )}
              </div>

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
