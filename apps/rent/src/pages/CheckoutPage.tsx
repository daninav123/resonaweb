import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { CreditCard, Lock, User, Mail, Phone, MapPin, ShoppingBag, AlertCircle, Info, Tag, Star, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { guestCart, GuestCartItem } from '../utils/guestCart';
import { calculatePaymentBreakdown } from '../utils/depositCalculator';
import { CouponInput } from '../components/coupons/CouponInput';
import { useAuthStore } from '../stores/authStore';
import { calculateCartTotals } from '../utils/cartCalculations';

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
  
  // 🔍 DEBUG: Log step changes
  useEffect(() => {
    console.log('🎯 CheckoutPage - Current step:', step);
  }, [step]);
  
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
  
  // Detectar si es un pedido de evento
  // En Rent nunca hay eventos con montaje — todos los pedidos son alquileres simples.
  // (Los items con eventMetadata vienen de la calculadora de eventos, que solo existe en resonaevents.com.)
  const isEventOrder = false;
  
  // Obtener dirección del evento si existe
  const eventLocation = cartItems.find((item: any) => item.eventMetadata)?.eventMetadata?.eventLocation;
  
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
  const [fromCalculator, setFromCalculator] = useState(false);

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
    
    // 💳 Detectar si viene de calculadora (ANTES de que se limpie)
    const isFromCalc = localStorage.getItem('cartFromCalculator') === 'true';
    setFromCalculator(isFromCalc);
    
    // Detectar si productos incluyen transporte/montaje
    const hasShipping = localStorage.getItem('cartIncludesShippingInstallation') === 'true';
    setShippingIncludedInPrice(hasShipping);
    
    console.log('📦 Configuración de entrega del carrito:', {
      deliveryOption: savedDeliveryOption,
      distance: savedDistance,
      address: savedAddress,
      installation: savedInstallation,
      shippingIncluded: hasShipping,
      fromCalculator: isFromCalc // 💳 Log importante
    });
    
    if (isFromCalc) {
      console.log('💳 DETECTADO: Pedido desde calculadora - Se aplicará pago de reserva (25%)');
    }
    
    if (savedDeliveryOption) {
      setFormData(prev => ({ ...prev, deliveryOption: savedDeliveryOption as 'pickup' | 'delivery' }));
    }
    if (savedDistance) setDistance(Number(savedDistance));
    if (savedAddress) {
      setDeliveryAddress(savedAddress);
      setFormData(prev => ({ ...prev, address: savedAddress }));
    }
    if (savedInstallation) setIncludeInstallation(savedInstallation === 'true');
    
    // Cargar notas del pedido desde localStorage
    const savedNotes = localStorage.getItem('checkoutOrderNotes');
    if (savedNotes) {
      setFormData(prev => ({ ...prev, notes: savedNotes }));
    }
    
    // Verificar que hay items y tienen fechas
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      navigate('/carrito');
      return;
    }
    
    // Verificar que todos los items tienen fechas (excepto items de eventos que tienen su propia fecha)
    const itemsWithoutDates = items.filter(item => {
      // Items de eventos ya tienen su fecha en eventMetadata
      const isEventItem = item.eventMetadata?.eventDate && item.eventMetadata?.selectedParts?.length > 0;
      if (isEventItem) return false; // No requieren startDate/endDate
      
      // Items normales sí requieren fechas
      return !item.startDate || !item.endDate;
    });
    
    if (itemsWithoutDates.length > 0) {
      toast.error('Debes asignar fechas a todos los productos en el carrito');
      navigate('/carrito');
      return;
    }
    
    // Verificar que no hay productos con fechas inválidas (excepto items de eventos)
    const invalidItems = items.filter(item => {
      // Items de eventos tienen disponibilidad garantizada
      const isEventItem = item.eventMetadata?.eventDate && item.eventMetadata?.selectedParts?.length > 0;
      if (isEventItem) return false;
      
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
    
    // Si las fechas son iguales (mismo día), devolver 0 para eventos
    if (startDate === endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total: number, item: GuestCartItem) => {
      // Items de eventos: precio incluye partes + extras (NO MULTIPLICAR POR DÍAS)
      if (item.eventMetadata) {
        // IMPORTANTE: partsTotal YA incluye el precio del pack, NO sumar packPrice
        const partsTotal = Number(item.eventMetadata.partsTotal) || 0;
        const extrasTotal = Number(item.eventMetadata.extrasTotal) || 0;
        const eventPrice = partsTotal + extrasTotal;
        console.log('💰 Subtotal evento:', { partsTotal, extrasTotal, eventPrice, NO_MULTIPLICA: true });
        return total + eventPrice; // NO multiplicar por días ni quantity
      }
      
      // Items normales: precio por día * días
      const days = calculateDays(item.startDate || '', item.endDate || '') || 1;
      return total + (item.product.pricePerDay * days * item.quantity);
    }, 0);
  };

  const calculateShippingCost = () => {
    // Items de eventos ya incluyen transporte y montaje
    const hasEventItems = cartItems.some((item: any) => item.eventMetadata);
    if (hasEventItems) return 0;
    
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
      return subtotal * 0.25; // 25% descuento
    } else if (user.userLevel === 'VIP_PLUS') {
      return subtotal * 0.70; // 70% descuento
    }
    
    return 0;
  };

  // ⭐ USAR FUNCIÓN CENTRALIZADA PARA TODOS LOS CÁLCULOS
  const cartTotals = calculateCartTotals({
    items: cartItems,
    deliveryOption: formData.deliveryOption as 'pickup' | 'delivery',
    distance,
    includeInstallation,
    shippingIncludedInPrice,
    userLevel: user?.userLevel,
    appliedCoupon: appliedCoupon ? {
      discountAmount: appliedCoupon.discountAmount,
      freeShipping: appliedCoupon.freeShipping
    } : null
  });

  // Extraer valores de la función centralizada
  const { 
    subtotal: centralizedSubtotal, 
    shippingCost: centralizedShipping, 
    vipDiscount: centralizedVipDiscount, 
    couponDiscount: centralizedCouponDiscount, 
    total: centralizedTotal 
  } = cartTotals;

  // Calcular desglose de pago (señal, fianza, etc.)
  console.log('💳 CALCULANDO PAYMENT BREAKDOWN:', {
    fromCalculator,
    total: centralizedTotal,
    shippingIncludedInPrice
  });
  
  const paymentBreakdown = calculatePaymentBreakdown(
    centralizedSubtotal,
    centralizedShipping,
    formData.deliveryOption as 'pickup' | 'delivery',
    user?.userLevel, // ⭐ Pasar nivel VIP
    centralizedVipDiscount, // ⭐ Pasar descuento VIP
    shippingIncludedInPrice, // ⭐ Pasar si tiene transporte/montaje incluido (sin fianza)
    fromCalculator // 💳 Pasar si viene de calculadora para aplicar 25%
  );
  
  console.log('💳 PAYMENT BREAKDOWN RESULTADO:', {
    payNow: paymentBreakdown.payNow,
    payLater: paymentBreakdown.payLater,
    total: paymentBreakdown.total
  });

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
    
    // Validar que solo haya 1 evento/pack de calculadora
    const eventItems = cartItems.filter((item: any) => item.eventMetadata);
    if (eventItems.length > 1) {
      toast.error(
        `⚠️ Solo puedes pagar 1 evento a la vez. Tienes ${eventItems.length} eventos en tu carrito. Por favor, elimina los eventos adicionales desde el carrito.`,
        { duration: 10000 }
      );
      return;
    }

    setIsProcessing(true);

    // Guardar datos de la orden en sessionStorage para crearla DESPUÉS del pago
    const orderItems = cartItems.map(item => {
      let pricePerUnit: number;
      let totalPrice: number;
      
      // Items de eventos: precio FIJO - NO MULTIPLICAR POR NADA
      if (item.eventMetadata) {
        // IMPORTANTE: partsTotal YA incluye el precio del pack, NO sumar packPrice
        const partsTotal = Number(item.eventMetadata.partsTotal) || 0;
        const extrasTotal = Number(item.eventMetadata.extrasTotal) || 0;
        pricePerUnit = partsTotal + extrasTotal;
        totalPrice = pricePerUnit; // NO multiplicar por quantity ni días
        
        console.log('💰 Item de evento (NO MULTIPLICA):', {
          name: item.product.name,
          partsTotal,
          extrasTotal,
          pricePerUnit,
          totalPrice,
          quantity: item.quantity,
          MULTIPLICADO: false
        });
      } else {
        // Items normales: precio por días
        const days = calculateDays(item.startDate || '', item.endDate || '') || 1;
        pricePerUnit = item.product.pricePerDay * days;
        totalPrice = pricePerUnit * item.quantity;
        
        console.log('💰 Item normal:', {
          name: item.product.name,
          days,
          pricePerDay: item.product.pricePerDay,
          pricePerUnit,
          totalPrice
        });
      }
      
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
        eventMetadata: item.eventMetadata || undefined,  // IMPORTANTE: Incluir metadata para detectar pedidos de calculadora
        notes: item.notes || undefined,  // Notas específicas del producto
      };
    });
    
    // Construir notas con información de packs y extras
    let notesWithDetails = formData.notes || '';
    
    // Agregar información de packs y extras de items de eventos
    const eventItemsForNotes = cartItems.filter((item: any) => item.eventMetadata);
    
    console.log('📝 Event Items encontrados:', eventItemsForNotes.length);
    console.log('📝 Event Items:', eventItemsForNotes);
    console.log('📝 Todos los items del carrito:', cartItems);
    
    if (eventItemsForNotes.length > 0) {
      if (notesWithDetails) {
        notesWithDetails += '\n\n---\n\n';
      }
      
      notesWithDetails += '📋 DETALLES DEL EVENTO:\n';
      
      eventItemsForNotes.forEach((item: any, index: number) => {
        notesWithDetails += `\n${index + 1}. ${item.product.name}\n`;
        
        console.log(`📝 Item ${index + 1} metadata:`, item.eventMetadata);
        
        // Información del evento
        if (item.eventMetadata.eventType) {
          notesWithDetails += `   🎉 Tipo: ${item.eventMetadata.eventType}\n`;
        }
        if (item.eventMetadata.attendees) {
          notesWithDetails += `   👥 Asistentes: ${item.eventMetadata.attendees}\n`;
        }
        if (item.eventMetadata.eventDate) {
          notesWithDetails += `   📅 Fecha: ${new Date(item.eventMetadata.eventDate).toLocaleDateString('es-ES')}\n`;
        }
        if (item.eventMetadata.eventLocation) {
          notesWithDetails += `   📍 Ubicación: ${item.eventMetadata.eventLocation}\n`;
        }
        
        notesWithDetails += '\n';
        
        // Packs seleccionados (Partes del Evento)
        if (item.eventMetadata.selectedParts && Array.isArray(item.eventMetadata.selectedParts) && item.eventMetadata.selectedParts.length > 0) {
          notesWithDetails += '   📦 Partes del Evento:\n';
          item.eventMetadata.selectedParts.forEach((part: any) => {
            const price = part.price || part.pricePerDay || 0;
            notesWithDetails += `      • ${part.name}${price > 0 ? ` - €${Number(price).toFixed(2)}` : ''}\n`;
          });
          notesWithDetails += '\n';
        }
        
        // Extras seleccionados
        if (item.eventMetadata.selectedExtras && Array.isArray(item.eventMetadata.selectedExtras) && item.eventMetadata.selectedExtras.length > 0) {
          notesWithDetails += '   ✨ Extras:\n';
          item.eventMetadata.selectedExtras.forEach((extra: any) => {
            const price = extra.total || extra.price || extra.pricePerDay || 0;
            const qty = extra.quantity || 1;
            notesWithDetails += `      • ${extra.name}${qty > 1 ? ` (x${qty})` : ''}${price > 0 ? ` - €${Number(price).toFixed(2)}` : ''}\n`;
          });
          notesWithDetails += '\n';
        }
        
        // Mostrar total de partes y extras
        const hasPartsTotal = item.eventMetadata.partsTotal && Number(item.eventMetadata.partsTotal) > 0;
        const hasExtrasTotal = item.eventMetadata.extrasTotal && Number(item.eventMetadata.extrasTotal) > 0;
        
        if (hasPartsTotal || hasExtrasTotal) {
          notesWithDetails += '   💰 Subtotales:\n';
          if (hasPartsTotal) {
            notesWithDetails += `      • Partes: €${Number(item.eventMetadata.partsTotal).toFixed(2)}\n`;
          }
          if (hasExtrasTotal) {
            notesWithDetails += `      • Extras: €${Number(item.eventMetadata.extrasTotal).toFixed(2)}\n`;
          }
          if (hasPartsTotal && hasExtrasTotal) {
            const total = Number(item.eventMetadata.partsTotal) + Number(item.eventMetadata.extrasTotal);
            notesWithDetails += `      • TOTAL: €${total.toFixed(2)}\n`;
          }
        }
      });
      
      console.log('📝 Notas finales construidas:', notesWithDetails);
    }
    
    // Detectar si es un pedido de calculadora (tiene eventMetadata)
    const isFromCalculator = eventItemsForNotes.length > 0;
    const totalAmount = centralizedTotal;
    
    const orderPayload = {
      // Items
      items: orderItems,
      
      // Totales
      subtotal: centralizedSubtotal,
      shippingCost: centralizedShipping,
      taxAmount: totalAmount - (totalAmount / 1.21), // Calcular IVA del total
      total: totalAmount,
      
      // 💳 INFORMACIÓN DE PAGO (25% o 100%)
      paymentBreakdown: {
        payNow: paymentBreakdown.payNow,
        payLater: paymentBreakdown.payLater,
        total: totalAmount,
        deposit: paymentBreakdown.deposit,
        requiresDeposit: paymentBreakdown.requiresDeposit,
      },
      
      // Tipo de entrega (PICKUP o DELIVERY en mayúsculas)
      deliveryType: formData.deliveryOption.toUpperCase(),
      
      // Dirección de entrega (solo si es delivery)
      deliveryAddress: formData.deliveryOption === 'delivery' 
        ? `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`
        : undefined,
      
      // Información de envío y montaje
      deliveryDistance: formData.deliveryOption === 'delivery' ? distance : 0,
      includeInstallation: includeInstallation,
      
      // Notas con detalles de packs y extras
      notes: notesWithDetails || undefined,
      
      // Cupón de descuento
      couponCode: appliedCoupon?.code || undefined,
      discountAmount: appliedCoupon?.discountAmount || undefined,
      
      // 🎯 CAMPOS PARA PAGO A PLAZOS (eventos de calculadora > 500€)
      isCalculatorEvent: isFromCalculator,
      eligibleForInstallments: isFromCalculator && totalAmount > 500,
    };
    
    // Guardar en sessionStorage para usar después del pago
    sessionStorage.setItem('pendingOrderData', JSON.stringify(orderPayload));
    
    console.log('📦 Datos de orden guardados para crear después del pago:', {
      hasPaymentBreakdown: !!orderPayload.paymentBreakdown,
      payNow: orderPayload.paymentBreakdown?.payNow,
      payLater: orderPayload.paymentBreakdown?.payLater
    });
    
    // Limpiar flags de calculadora DESPUÉS de guardarlos en sessionStorage
    // (para que no se apliquen en futuras compras)
    localStorage.removeItem('cartFromCalculator');
    localStorage.removeItem('cartIncludesShippingInstallation');
    localStorage.removeItem('cartEventDates');
    localStorage.removeItem('cartEventInfo');
    
    // Redirigir directamente a Stripe SIN crear la orden aún
    // El orderId será null, indicando que es un pago inicial
    toast.success('Redirigiendo a pago seguro...');
    navigate('/checkout/stripe');
    
    setIsProcessing(false);
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
  // ⭐ Usar valor centralizado del total
  const total = centralizedTotal;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            {[
              { n: 1, label: 'Datos' },
              { n: 2, label: 'Entrega' },
              { n: 3, label: 'Pago' },
            ].map((s, i, arr) => (
              <div key={s.n} className="flex items-center flex-1 last:flex-none">
                <div className={`flex-1 text-center ${step >= s.n ? 'text-resona' : 'text-gray-400'}`}>
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step > s.n
                        ? 'bg-green-500 text-white'
                        : step === s.n
                        ? 'bg-resona text-white shadow-md'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s.n ? '✓' : s.n}
                  </div>
                  <p className={`text-sm mt-1 font-medium ${step === s.n ? 'text-gray-900' : ''}`}>
                    {s.label}
                  </p>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 border-t-2 mx-2 transition-colors ${step > s.n ? 'border-green-500' : step === s.n ? 'border-resona/40' : 'border-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Banner permanente: solo pagas 25% ahora */}
        {paymentBreakdown.payLater > 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="rounded-xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                25%
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-green-900">
                  Solo pagas <span className="font-bold">€{paymentBreakdown.payNow.toFixed(2)}</span> ahora
                  <span className="text-green-700 font-normal text-sm"> · el 25% de reserva</span>
                </p>
                <p className="text-sm text-green-800 mt-0.5">
                  El resto (<span className="font-semibold">€{paymentBreakdown.payLater.toFixed(2)}</span>) se cobra antes de la entrega. Cancela gratis hasta 48h antes.
                </p>
              </div>
            </div>
          </div>
        )}

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
                  
                  {/* Nota: datos del perfil si está logueado, invitado si no */}
                  {isAuthenticated ? (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Datos cargados de tu perfil. <button type="button" className="underline" onClick={() => navigate('/cuenta/datos')}>Editar en mi cuenta</button>
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 border-l-4 border-gray-400 rounded-r-lg">
                      <p className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>Estás reservando como invitado.</span>
                        <button
                          type="button"
                          onClick={() => navigate('/login?redirect=/checkout')}
                          className="underline text-resona hover:text-resona-dark"
                        >
                          ¿Ya tienes cuenta? Inicia sesión
                        </button>
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        readOnly={isAuthenticated}
                        placeholder={isAuthenticated ? undefined : 'Tu nombre'}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isAuthenticated ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-resona'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        readOnly={isAuthenticated}
                        placeholder={isAuthenticated ? undefined : 'Tus apellidos'}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isAuthenticated ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-resona'
                        }`}
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
                        readOnly={isAuthenticated}
                        placeholder={isAuthenticated ? undefined : 'tu@email.com'}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg ${
                          isAuthenticated ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-resona'
                        }`}
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
                        // Siempre ir al paso 2 (confirmación de entrega)
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
                    {isEventOrder ? 'Confirmación del Evento' : 'Confirmación de Entrega'}
                  </h2>

                  {/* Para eventos: mostrar info del evento */}
                  {isEventOrder ? (
                    <>
                      <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                        <p className="text-sm text-green-700 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Evento configurado - Montaje incluido
                        </p>
                      </div>

                      <div className="mb-6 p-5 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                              🎉 Montaje en el lugar del evento
                            </h3>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-700"><strong>📍 Ubicación:</strong> {eventLocation}</p>
                              <p className="text-sm text-gray-700"><strong>📏 Distancia:</strong> {distance} km desde Valencia</p>
                              <p className="text-sm text-green-700 flex items-center gap-1 mt-2">
                                <span className="text-lg">✅</span>
                                <strong>Transporte y montaje incluidos en el precio</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700">
                          💡 La ubicación del evento se estableció en la calculadora. Para cambiarla, debes volver a configurar el evento.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Nota de configuración del carrito (solo para no-eventos) */}
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
                                {calculatedShipping && (
                                  <div className="mt-3 pt-3 border-t border-gray-300">
                                    <p className="text-sm text-gray-700">
                                      <strong>Coste de envío:</strong> €{calculatedShipping.shippingCost?.toFixed(2) || '0.00'}
                                    </p>
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
                    </>
                  )}

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
                    <li>✓ {user.userLevel === 'VIP' ? '25%' : '50%'} de descuento aplicado</li>
                  </ul>
                </div>
              )}
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item: any) => {
                  // Items de eventos: mostrar desglose detallado
                  if (item.eventMetadata) {
                    // ⚠️ IMPORTANTE: partsTotal YA incluye el pack, NO sumar packPrice
                    const partsTotal = Number(item.eventMetadata.partsTotal) || 0;
                    const extrasTotal = Number(item.eventMetadata.extrasTotal) || 0;
                    const itemTotal = partsTotal + extrasTotal; // Solo partes + extras
                    
                    return (
                      <div key={item.id} className="border-l-4 border-blue-500 pl-3 pb-2">
                        <div className="flex justify-between text-sm font-semibold mb-1">
                          <span className="text-gray-900">{item.product.name}</span>
                          <span className="text-blue-600">€{itemTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 ml-2">
                          {partsTotal > 0 && (
                            <div className="flex justify-between">
                              <span>• Partes del evento</span>
                              <span>€{partsTotal.toFixed(2)}</span>
                            </div>
                          )}
                          {extrasTotal > 0 && (
                            <div className="flex justify-between">
                              <span>• Extras</span>
                              <span>€{extrasTotal.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  // Items normales
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">€{(item.product.pricePerDay * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 my-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{centralizedSubtotal.toFixed(2)}</span>
                </div>
                
                {/* Coupon Input */}
                <div className="my-4">
                  <CouponInput
                    orderAmount={centralizedSubtotal}
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
                {centralizedVipDiscount > 0 && (
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-yellow-700 flex items-center gap-1">
                      {user?.userLevel === 'VIP' ? (
                        <><Star className="w-4 h-4" /> Descuento VIP (25%)</>
                      ) : (
                        <><Crown className="w-4 h-4" /> Descuento VIP PLUS (70%)</>
                      )}
                    </span>
                    <span className="text-green-600 font-bold">-€{centralizedVipDiscount.toFixed(2)}</span>
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
                      <span>€{centralizedShipping.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {formData.deliveryOption === 'delivery' && !calculatedShipping && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">🚚 Envío</span>
                    <span>€{centralizedShipping.toFixed(2)}</span>
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

              {/* Resumen de pago */}
              <div className={`mt-4 p-4 border-2 rounded-lg ${
                paymentBreakdown.payLater > 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-300'
              }`}>
                <h3 className="font-bold text-gray-900 text-sm mb-3">
                  {paymentBreakdown.payLater > 0 ? 'Resumen de pago' : 'Pago único'}
                </h3>

                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-700">A pagar ahora</span>
                  <span className="text-2xl font-bold text-green-700">
                    €{paymentBreakdown.payNow.toFixed(2)}
                  </span>
                </div>

                {paymentBreakdown.payLater > 0 && (
                  <>
                    <div className="flex justify-between items-baseline pt-2 border-t border-green-200">
                      <span className="text-xs text-gray-600">Pendiente antes de entrega</span>
                      <span className="text-sm font-semibold text-gray-800">
                        €{paymentBreakdown.payLater.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Reservas con solo el 25%. El resto se cobra antes de la entrega.
                    </p>
                  </>
                )}
                
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
