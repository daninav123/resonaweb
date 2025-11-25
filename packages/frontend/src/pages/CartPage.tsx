import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, Calendar, ShoppingCart, Package, AlertTriangle, Info, Star, Crown } from 'lucide-react';
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
  const [unavailableItems, setUnavailableItems] = useState<Map<string, string>>(new Map()); // itemId -> error message
  const [calculatedShipping, setCalculatedShipping] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [useManualDistance, setUseManualDistance] = useState(false);
  const [shippingConfig, setShippingConfig] = useState<any>(null);
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup'); // pickup = recogida, delivery = envío
  const [orderNotes, setOrderNotes] = useState<string>(''); // Notas del pedido
  const [shippingIncludedInPrice, setShippingIncludedInPrice] = useState(false); // Flag: transporte ya incluido en precio
  
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
    const savedNotes = localStorage.getItem('cartOrderNotes');

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

    if (savedNotes) {
      setOrderNotes(savedNotes);
    }

    // Detectar si viene de la calculadora (transporte/montaje ya incluido)
    const fromCalculator = localStorage.getItem('cartFromCalculator') === 'true';
    const includesShipping = localStorage.getItem('cartIncludesShippingInstallation') === 'true';
    
    if (fromCalculator && includesShipping) {
      setShippingIncludedInPrice(true);
      setIncludeInstallation(true); // Marcar automáticamente
    }

    // Cargar fechas del evento desde la calculadora
    const eventDates = localStorage.getItem('cartEventDates');
    if (eventDates && fromCalculator) {
      try {
        const dates = JSON.parse(eventDates);
        setGlobalDates(dates);
      } catch (e) {
        console.error('Error parsing event dates:', e);
      }
    }

    // Generar notas del pedido con información del evento
    const eventInfo = localStorage.getItem('cartEventInfo');
    if (eventInfo && fromCalculator) {
      try {
        const info = JSON.parse(eventInfo);
        
        // Generar texto descriptivo de las notas
        let notesText = `📅 INFORMACIÓN DEL EVENTO\n\n`;
        notesText += `Tipo de evento: ${info.eventType}\n`;
        notesText += `Número de asistentes: ${info.attendees} personas\n`;
        
        // Mostrar horario si está disponible
        if (info.startTime && info.endTime) {
          notesText += `Horario: ${info.startTime} - ${info.endTime} (${info.duration} horas)\n`;
        } else {
          notesText += `Duración: ${info.duration} ${info.durationType === 'hours' ? 'horas' : 'días'}\n`;
        }
        
        if (info.eventDate) {
          const date = new Date(info.eventDate);
          notesText += `Fecha del evento: ${date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}\n`;
        }
        
        if (info.eventLocation) {
          notesText += `Ubicación: ${info.eventLocation}\n`;
        }
        
        if (info.selectedParts && info.selectedParts.length > 0) {
          notesText += `\nPartes del evento seleccionadas:\n`;
          
          // Intentar obtener nombres reales de las partes
          try {
            const calculatorConfig = localStorage.getItem('advancedCalculatorConfig');
            if (calculatorConfig) {
              const config = JSON.parse(calculatorConfig);
              const eventType = config.eventTypes?.find((et: any) => et.name === info.eventType);
              
              if (eventType && eventType.parts) {
                info.selectedParts.forEach((partId: string) => {
                  const part = eventType.parts.find((p: any) => p.id === partId);
                  if (part) {
                    notesText += `  ${part.icon || '•'} ${part.name}`;
                    if (part.defaultDuration) {
                      notesText += ` (${part.defaultDuration}h)`;
                    }
                    notesText += `\n`;
                  } else {
                    notesText += `  • ${partId}\n`;
                  }
                });
              } else {
                // Si no hay config, mostrar IDs
                info.selectedParts.forEach((partId: string) => {
                  notesText += `  • ${partId}\n`;
                });
              }
            } else {
              // Si no hay config, mostrar IDs
              info.selectedParts.forEach((partId: string) => {
                notesText += `  • ${partId}\n`;
              });
            }
          } catch (e) {
            // Fallback: mostrar IDs
            info.selectedParts.forEach((partId: string) => {
              notesText += `  • ${partId}\n`;
            });
          }
        }
        
        notesText += `\n---\nNotas adicionales:\n`;
        
        setOrderNotes(notesText);
      } catch (e) {
        console.error('Error parsing event info:', e);
      }
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

  // Guardar notas del pedido en localStorage
  useEffect(() => {
    localStorage.setItem('cartOrderNotes', orderNotes);
  }, [orderNotes]);

  // Estado para controlar si ya se validó
  const [lastValidatedDates, setLastValidatedDates] = useState({ start: '', end: '' });
  const [isValidating, setIsValidating] = useState(false);

  // Aplicar fechas globales automáticamente cuando ambas están seleccionadas
  useEffect(() => {
    // Solo validar si las fechas cambiaron y no estamos ya validando
    if (
      globalDates.start && 
      globalDates.end && 
      !isValidating &&
      (globalDates.start !== lastValidatedDates.start || globalDates.end !== lastValidatedDates.end)
    ) {
      // Delay para evitar múltiples llamadas mientras escribe
      const timer = setTimeout(() => {
        setIsValidating(true);
        setLastValidatedDates({ start: globalDates.start, end: globalDates.end });
        applyGlobalDates().finally(() => {
          setIsValidating(false);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [globalDates.start, globalDates.end, isValidating, lastValidatedDates]);

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
    const shipping = calculateShippingCost();
    const installation = calculateInstallationCost();
    const vipDiscount = calculateVIPDiscount(); // ⭐ Descuento VIP
    const totalBeforeTax = subtotal + shipping + installation - vipDiscount;
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
    // Verificar si hay productos no disponibles marcados
    return unavailableItems.size > 0;
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
  const handleGuestUpdateQuantity = async (itemId: string, newQuantity: number) => {
    guestCart.updateQuantity(itemId, newQuantity);
    setGuestCartItems(guestCart.getCart());
    
    // Verificar disponibilidad si tiene fechas
    const item = guestCart.getCart().find(i => i.id === itemId);
    if (item && item.startDate && item.endDate) {
      console.log('🔍 Verificando disponibilidad después de cambiar cantidad...');
      
      try {
        const response: any = await api.post('/products/check-availability', {
          productId: item.product.id,
          startDate: item.startDate,
          endDate: item.endDate,
          quantity: newQuantity
        });
        
        if (response.available) {
          // Limpiar error si existía
          setUnavailableItems(prev => {
            const newMap = new Map(prev);
            newMap.delete(itemId);
            return newMap;
          });
          toast.success('Cantidad actualizada');
        } else {
          // Mostrar error de disponibilidad
          const startDateStr = new Date(item.startDate).toLocaleDateString('es-ES');
          const endDateStr = new Date(item.endDate).toLocaleDateString('es-ES');
          const errorMsg = response.message || `No disponible ${newQuantity > 1 ? `(${newQuantity} unidades)` : ''} para ${startDateStr} - ${endDateStr}`;
          
          setUnavailableItems(prev => {
            const newMap = new Map(prev);
            newMap.set(itemId, errorMsg);
            return newMap;
          });
          
          toast.error(`No hay suficiente stock disponible`, { duration: 4000 });
        }
      } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        toast('Cantidad actualizada. Verificaremos disponibilidad en el checkout.', { icon: '⚠️' });
      }
    } else {
      toast.success('Cantidad actualizada');
    }
  };

  const handleGuestUpdateDates = async (itemId: string, startDate: string, endDate: string) => {
    console.log('🔍 ============ handleGuestUpdateDates LLAMADO ============');
    console.log('📋 Parámetros:', { itemId, startDate, endDate });
    
    // Siempre guardar la fecha (permite cambiar una a la vez)
    guestCart.updateDates(itemId, startDate, endDate);
    setGuestCartItems(guestCart.getCart());
    
    // Solo validar disponibilidad si ambas fechas están presentes
    if (!startDate || !endDate) {
      console.log('⏭️ Fecha incompleta, esperando la otra fecha...');
      console.log('   startDate:', startDate || 'VACÍO');
      console.log('   endDate:', endDate || 'VACÍO');
      return;
    }
    
    console.log('✅ Ambas fechas presentes, procediendo a validar...');
    
    const item = guestCartItems.find(i => i.id === itemId);
    if (!item || !item.product) {
      console.log('❌ Item no encontrado en carrito');
      return;
    }

    console.log('📦 Item encontrado:', {
      name: item.product.name,
      quantity: item.quantity
    });

    try {
      // Verificar disponibilidad en el backend
      console.log('🌐 Llamando a API /products/check-availability...');
      console.log('📤 Payload:', {
        productId: item.product.id,
        productName: item.product.name,
        startDate,
        endDate,
        quantity: item.quantity
      });
      
      const response: any = await api.post('/products/check-availability', {
        productId: item.product.id,
        startDate,
        endDate,
        quantity: item.quantity
      });

      console.log('📥 Respuesta recibida del servidor:', response);
      console.log('📊 response.available:', response.available);
      console.log('📊 response.message:', response.message);

      if (response.available) {
        console.log('✅ Producto DISPONIBLE');
        // Limpiar error si existía
        setUnavailableItems(prev => {
          const newMap = new Map(prev);
          newMap.delete(itemId);
          return newMap;
        });
        toast.success('Producto disponible', { duration: 2000 });
      } else {
        console.log('❌ Producto NO DISPONIBLE');
        console.log('🗑️ Limpiando fechas del carrito...');
        
        // Eliminar las fechas si no hay disponibilidad
        guestCart.updateDates(itemId, '', '');
        setGuestCartItems(guestCart.getCart());
        
        // Construir mensaje con fechas y cantidad
        const item = guestCartItems.find(i => i.id === itemId);
        const startDateStr = new Date(startDate).toLocaleDateString('es-ES');
        const endDateStr = new Date(endDate).toLocaleDateString('es-ES');
        const errorMsg = response.message || `No disponible ${item?.quantity && item.quantity > 1 ? `(${item.quantity} unidades)` : ''} para ${startDateStr} - ${endDateStr}`;
        console.log('💬 Mensaje de error:', errorMsg);
        
        // Guardar el error en el estado
        setUnavailableItems(prev => {
          const newMap = new Map(prev);
          newMap.set(itemId, errorMsg);
          return newMap;
        });
        
        console.log('✅ Error guardado en item');
      }
    } catch (error: any) {
      console.error('❌ ============ ERROR EN LA PETICIÓN ============');
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error completo:', error);
      
      // Si hay error específico del backend, mostrarlo
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, { duration: 6000 });
      } else {
        // Si falla la verificación, mostrar advertencia
        toast('No se pudo verificar disponibilidad. Se verificará en el checkout.', { 
          duration: 5000,
          icon: '⚠️'
        });
      }
    }
    
    console.log('🔍 ============ handleGuestUpdateDates TERMINADO ============\n');
  };

  const handleGuestRemoveItem = (itemId: string) => {
    guestCart.removeItem(itemId);
    setGuestCartItems(guestCart.getCart());
    // Limpiar error si existía
    setUnavailableItems(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
    toast.success('Producto eliminado');
  };

  // Aplicar fechas globales a todos los items
  const applyGlobalDates = async () => {
    console.log('🌍 ============ APLICANDO FECHAS GLOBALES ============');
    console.log('📅 Fechas globales:', globalDates);
    
    if (!globalDates.start || !globalDates.end) {
      toast.error('Selecciona las fechas globales');
      return;
    }
    
    // Limpiar errores previos al comenzar nueva validación
    setUnavailableItems(new Map());
    
    console.log('🔍 Validando disponibilidad para cada producto...');
    
    const newUnavailableItems = new Map<string, string>();
    let availableCount = 0;
    let unavailableCount = 0;
    
    // Validar disponibilidad para cada item
    for (const item of guestCartItems) {
      if (customDatesItems.has(item.id)) {
        console.log(`⏭️ Item ${item.product.name} tiene fechas personalizadas, saltando...`);
        continue;
      }
      
      console.log(`\n📦 Validando: ${item.product.name}`);
      console.log(`   Cantidad: ${item.quantity}`);
      
      try {
        const response: any = await api.post('/products/check-availability', {
          productId: item.product.id,
          startDate: globalDates.start,
          endDate: globalDates.end,
          quantity: item.quantity
        });
        
        console.log(`   📊 Disponibilidad: ${response.available ? '✅ SÍ' : '❌ NO'}`);
        
        if (!response.available) {
          unavailableCount++;
          // Construir mensaje con fechas y cantidad
          const startDateStr = new Date(globalDates.start).toLocaleDateString('es-ES');
          const endDateStr = new Date(globalDates.end).toLocaleDateString('es-ES');
          const errorMsg = response.message || `No disponible ${item.quantity > 1 ? `(${item.quantity} unidades)` : ''} para ${startDateStr} - ${endDateStr}`;
          newUnavailableItems.set(item.id, errorMsg);
          console.log(`   ❌ Error: ${errorMsg}`);
        } else {
          availableCount++;
          // Aplicar fechas si está disponible
          guestCart.updateDates(item.id, globalDates.start, globalDates.end);
          console.log(`   ✅ Fechas aplicadas`);
        }
      } catch (error: any) {
        console.error(`   ❌ Error al validar ${item.product.name}:`, error);
        unavailableCount++;
        newUnavailableItems.set(item.id, 'Error al verificar disponibilidad');
      }
    }
    
    // Actualizar estado de items no disponibles
    setUnavailableItems(newUnavailableItems);
    setGuestCartItems(guestCart.getCart());
    
    // Mostrar resumen
    if (unavailableCount > 0) {
      console.log(`\n⚠️ ${unavailableCount} producto(s) no disponibles`);
      toast.error(`${unavailableCount} producto(s) no disponibles para estas fechas`, { duration: 5000 });
    } else {
      console.log('\n✅ TODOS LOS PRODUCTOS DISPONIBLES');
      toast.success('Todos los productos están disponibles');
    }
    
    console.log('🌍 ============ FECHAS GLOBALES APLICADAS ============\n');
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
  
  // Obtener descuento VIP ANTES de calcular IVA
  const vipDiscount = calculateVIPDiscount();
  
  // Calcular IVA sobre el total después del descuento VIP
  const totalBeforeTax = subtotal + shippingCost + installationCost - vipDiscount;
  const tax = totalBeforeTax * 0.21;
  const total = calculateTotal();
  
  // Calcular desglose de pago (señal, fianza, etc.)
  const paymentBreakdown = calculatePaymentBreakdown(
    subtotal,
    shippingCost,
    deliveryOption,
    user?.userLevel, // ⭐ Pasar nivel VIP
    vipDiscount, // ⭐ Pasar descuento VIP
    shippingIncludedInPrice // ⭐ Pasar si tiene transporte/montaje incluido (sin fianza)
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
                    <div key={item.id} data-testid="cart-item" className="border-b pb-6">
                      <div className="flex gap-4 mb-4">
                        <img
                          src={item.product.mainImageUrl || '/placeholder.png'}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm">{item.product.category?.name}</p>
                          
                          {/* Badge de error de disponibilidad */}
                          {unavailableItems.has(item.id) && (
                            <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-red-600 text-lg">⚠️</span>
                                <div>
                                  <p className="text-sm text-red-700 font-semibold">
                                    No disponible
                                  </p>
                                  <p className="text-xs text-red-600 mt-1">
                                    {unavailableItems.get(item.id)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-blue-600 font-semibold mt-2">
                            €{item.product.pricePerDay} / día
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            data-testid="decrease-quantity"
                            onClick={() => handleGuestUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded border hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4 mx-auto" />
                          </button>
                          <span data-testid="quantity-input" className="w-12 text-center">{item.quantity}</span>
                          <button
                            data-testid="increase-quantity"
                            onClick={() => handleGuestUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded border hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                        <button
                          data-testid="remove-item"
                          onClick={() => handleGuestRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notas del Pedido - Sección Grande */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Notas del Pedido
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Añade cualquier información adicional sobre tu evento, preferencias de horario, instrucciones especiales, etc.
                </p>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Ej: El evento comienza a las 18:00h. Preferimos que el montaje se realice entre las 15:00 y 17:00h. Acceso por la entrada lateral del edificio."
                  rows={8}
                  maxLength={1000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    💡 Tip: Incluye detalles como horarios, accesos especiales, contactos adicionales, etc.
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {orderNotes.length}/1000 caracteres
                  </p>
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
                        data-testid="global-start-date"
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
                        data-testid="global-end-date"
                        value={globalDates.end}
                        onChange={(e) => setGlobalDates({ ...globalDates, end: e.target.value })}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={globalDates.start || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  
                  {/* Validación automática - sin botón necesario */}
                  {globalDates.start && globalDates.end && (
                    <div className="mt-3 text-center text-xs text-gray-500">
                      ✓ Validando disponibilidad automáticamente...
                    </div>
                  )}
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
                      onChange={(e) => {
                        // Si viene de la calculadora, no permitir desmarcar
                        if (shippingIncludedInPrice) {
                          toast('El transporte y montaje ya están incluidos en el precio de los productos', {
                            icon: 'ℹ️',
                          });
                          return;
                        }
                        setIncludeInstallation(e.target.checked);
                      }}
                      disabled={shippingIncludedInPrice}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-60"
                    />
                    <div>
                      {shippingIncludedInPrice ? (
                        <>
                          <span className="text-sm font-medium text-green-700">✓ Transporte y montaje incluidos</span>
                          <p className="text-xs text-green-600 mt-1">
                            Ya incluido en el precio de los productos seleccionados
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-medium text-gray-900">¿Necesitas montaje/instalación?</span>
                          <p className="text-xs text-gray-500 mt-1">
                            Nuestro equipo montará todo el equipo en tu evento
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Alerta VIP */}
                {user && user.userLevel && user.userLevel !== 'STANDARD' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg mb-4">
                    <h3 className="font-bold text-yellow-900 flex items-center gap-2 text-sm mb-1">
                      {user.userLevel === 'VIP' ? (
                        <><Star className="w-4 h-4" /> ⭐ Cliente VIP</>
                      ) : (
                        <><Crown className="w-4 h-4" /> 👑 Cliente VIP PLUS</>
                      )}
                    </h3>
                    <ul className="text-xs text-yellow-800 space-y-1">
                      <li>✓ {user.userLevel === 'VIP' ? '50%' : '70%'} de descuento aplicado</li>
                      <li>✓ Sin fianza requerida (€0)</li>
                    </ul>
                  </div>
                )}

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
                  
                  {/* Descuento VIP */}
                  {vipDiscount > 0 && (
                    <div className="flex justify-between text-sm font-semibold bg-yellow-50 p-2 rounded">
                      <span className="text-yellow-700 flex items-center gap-1">
                        {user?.userLevel === 'VIP' ? (
                          <><Star className="w-4 h-4" /> Descuento VIP (50%)</>
                        ) : (
                          <><Crown className="w-4 h-4" /> Descuento VIP PLUS (70%)</>
                        )}
                      </span>
                      <span className="text-green-600 font-bold">-€{vipDiscount.toFixed(2)}</span>
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
                  <span data-testid="cart-total" className="text-blue-600">
                    €{total.toFixed(2)}
                  </span>
                </div>

                {/* Información de Pago */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-blue-900 mb-1">💳 Pago Total Online</p>
                      <p className="text-blue-800 mb-2">
                        Pagas <span className="font-bold">€{paymentBreakdown.payNow.toFixed(2)}</span> (100%) ahora al reservar.
                      </p>
                      {paymentBreakdown.requiresDeposit && (
                        <p className="text-blue-800 text-xs bg-blue-100 p-2 rounded">
                          ℹ️ Fianza de <span className="font-bold">€{paymentBreakdown.deposit.toFixed(2)}</span> se cobrará en tienda al recoger el material (reembolsable)
                        </p>
                      )}
                      {!paymentBreakdown.requiresDeposit && (
                        <p className="text-blue-800 text-xs bg-blue-100 p-2 rounded">
                          {user && (user.userLevel === 'VIP' || user.userLevel === 'VIP_PLUS') ? (
                            <>⭐ Como usuario {user.userLevel}, no pagas fianza</>
                          ) : shippingIncludedInPrice ? (
                            <>✓ Sin fianza requerida (productos incluyen transporte y montaje)</>
                          ) : (
                            <>✓ Sin fianza requerida</>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alerta de productos no disponibles */}
                {unavailableItems.size > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🚫</span>
                      <div className="flex-1">
                        <p className="text-base text-red-700 font-bold">
                          No puedes continuar con el pedido
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {unavailableItems.size} producto{unavailableItems.size > 1 ? 's' : ''} no {unavailableItems.size > 1 ? 'están' : 'está'} disponible{unavailableItems.size > 1 ? 's' : ''} para las fechas seleccionadas
                        </p>
                        <p className="text-xs text-red-500 mt-2 font-medium">
                          → Cambia las fechas o elimina los productos marcados con rojo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  data-testid="proceed-checkout"
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
                      const count = unavailableItems.size;
                      toast.error(
                        `No puedes continuar. ${count} producto${count > 1 ? 's' : ''} no ${count > 1 ? 'están' : 'está'} disponible${count > 1 ? 's' : ''} para las fechas seleccionadas.`,
                        { duration: 6000 }
                      );
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
                    localStorage.setItem('checkoutOrderNotes', orderNotes);
                    
                    navigate('/checkout');
                  }}
                  disabled={!allItemsHaveDates() || hasInvalidDates() || loading}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    hasInvalidDates() 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {hasInvalidDates() 
                    ? '🚫 Productos no disponibles' 
                    : (loading ? 'Verificando sesión...' : (isAuthenticated ? 'Proceder al checkout' : 'Inicia sesión para continuar'))
                  }
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
