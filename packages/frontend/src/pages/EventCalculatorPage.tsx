import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { ChevronLeft, ChevronRight, Calculator, Users, Clock, Calendar, Package, Mail, Plus, Minus, AlertTriangle, MapPin, CreditCard } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { calculatorFAQSchema } from '../utils/faqSchema';
import { serviceSchema } from '../utils/schemas';
import { DEFAULT_CALCULATOR_CONFIG, type AdvancedCalculatorConfig } from '../types/calculator.types';
import { productService } from '../services/product.service';
import { validateEventData, type EventValidation } from '../utils/eventValidation';
import { guestCart } from '../utils/guestCart';
import { decodeHTMLEntities } from '../utils/htmlDecode';
import { api } from '../services/api';

// Helper para construir URLs completas de imágenes
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const apiPath = baseUrl.replace('/api/v1', '');
  return `${apiPath}${imagePath}`;
};

interface EventData {
  eventType: string;
  attendees: number;
  duration: number;
  durationType: 'hours' | 'days';
  startTime: string; // Hora de inicio (formato HH:00 o HH:30)
  eventDate: string;
  eventLocation: string; // Dirección del evento
  // Partes seleccionadas (IDs de las partes que el cliente quiere)
  selectedParts: string[];
  // Pack seleccionado (solo uno)
  selectedPack: string | null;
  // Productos extras seleccionados { productId: quantity }
  selectedExtras: Record<string, number>;
  email?: string;
}

const EventCalculatorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>({
    eventType: '',
    attendees: 50,
    duration: 4,
    durationType: 'hours',
    startTime: '10:00',
    eventDate: '',
    eventLocation: '',
    selectedParts: [],
    selectedPack: null,
    selectedExtras: {},
  });
  const [eventValidation, setEventValidation] = useState<EventValidation | null>(null);
  const [hoveredPackId, setHoveredPackId] = useState<string | null>(null);
  const [hoveredExtraId, setHoveredExtraId] = useState<string | null>(null);
  const [activeExtraTab, setActiveExtraTab] = useState(0); // Pestaña activa de extras
  const [showContactModal, setShowContactModal] = useState(false);
  const [imageModal, setImageModal] = useState<{show: boolean; product: any} | null>(null);
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  // Cargar configuración desde la BD (igual que el admin)
  const [calculatorConfig, setCalculatorConfig] = useState(DEFAULT_CALCULATOR_CONFIG);

  // Cargar configuración al montar el componente
  useEffect(() => {
    const loadConfig = async () => {
      // 🔥🔥🔥 LIMPIEZA AGRESIVA DE CACHÉ - SIEMPRE RECARGA DESDE API
      const CACHE_VERSION = 'v5_force_api'; // Cambiar para forzar recarga total
      const cachedVersion = localStorage.getItem('calculatorConfigVersion');
      
      // SIEMPRE limpiar localStorage de calculadora en cada carga (hasta v6)
      if (cachedVersion !== CACHE_VERSION) {
        console.log('🔥 LIMPIEZA FORZADA de caché de calculadora...');
        localStorage.removeItem('advancedCalculatorConfig');
        localStorage.removeItem('calculatorConfigVersion'); // Limpiar también la versión
        localStorage.setItem('calculatorConfigVersion', CACHE_VERSION);
        console.log('✅ Caché limpiado completamente');
      }

      // 🎯 SIEMPRE cargar desde API (no usar localStorage antiguo)
      try {
        console.log('📡 Cargando configuración desde API...');
        const response = await api.get('/calculator-config') as AdvancedCalculatorConfig;
        
        if (response && response.eventTypes) {
          console.log('✅ Configuración cargada desde API');
          console.log(`📊 Total eventos recibidos: ${response.eventTypes.length}`);
          console.log('📋 Eventos en configuración:', response.eventTypes.map((e: any) => ({
            name: e.name,
            isActive: e.isActive
          })));
          
          // Verificar que no haya eventos con isActive=false
          const hiddenEvents = response.eventTypes.filter((e: any) => e.isActive === false);
          if (hiddenEvents.length > 0) {
            console.error('🚨 ERROR: El backend devolvió eventos ocultos:', hiddenEvents.map((e: any) => e.name));
          }
          
          setCalculatorConfig(response);
          return;
        }
        
        console.error('❌ La API no devolvió configuración válida');
      } catch (error) {
        console.error('❌ Error cargando desde API:', error);
      }

      // Si la API falla, usar configuración por defecto (NO localStorage antiguo)
      console.log('⚠️ Usando configuración por defecto (API falló)');
      setCalculatorConfig(DEFAULT_CALCULATOR_CONFIG);
    };

    loadConfig();
  }, []);

  // Filtrar solo tipos de evento activos (ocultar los que tienen isActive === false)
  // IMPORTANTE: Filtro explícito - solo mostrar si isActive es true O undefined (retrocompatibilidad)
  const eventTypes = calculatorConfig.eventTypes
    .filter((et: any) => {
      // Si isActive es explícitamente false, NO mostrar
      if (et.isActive === false) {
        console.log(`🚫 Evento OCULTO (isActive=false): ${et.name}`);
        return false;
      }
      // Si isActive es true o undefined, SÍ mostrar
      console.log(`✅ Evento VISIBLE (isActive=${et.isActive}): ${et.name}`);
      return true;
    })
    .map((et: any) => ({
      id: et.id,
      name: et.name,
      icon: et.icon,
      multiplier: et.multiplier,
      parts: et.parts || [],
    }));

  // Cargar productos y packs del catálogo
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['catalog-products-and-packs'],
    queryFn: async () => {
      // Cargar packs activos INCLUYENDO MONTAJES (para calculadora)
      const packsResponse: any = await api.get('/packs?includeMontajes=true');
      const packsData = packsResponse?.packs || packsResponse || [];
      
      // Filtrar solo packs ACTIVOS (comparación explícita para Safari)
      const activePacks = Array.isArray(packsData) ? packsData.filter((pack: any) => pack.isActive === true) : [];
      
      // Mapear packs al formato esperado (incluye montajes y otros packs)
      const mappedPacks = activePacks.map((pack: any) => {
        // Un montaje se identifica por tener categoryRef.name === 'Montaje'
        const isMontaje = pack.categoryRef?.name?.toLowerCase() === 'montaje';
        
        // Convertir URL de imagen a URL completa usando helper
        const imageUrl = getFullImageUrl(pack.imageUrl || pack.mainImageUrl);
        
        return {
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          description: pack.description,
          mainImageUrl: imageUrl,
          imageUrl: imageUrl,
          pricePerDay: Number(pack.pricePerDay || pack.finalPrice || pack.calculatedTotalPrice || 0),
          realStock: 999,
          // Mantener la categoría real del pack (ej: MONTAJE, BODAS, etc.)
          category: pack.category ? 
            (typeof pack.category === 'string' ? { name: pack.category } : pack.category) 
            : { name: 'Packs' },
          isActive: pack.isActive === true,
          isPack: true, // Marcar como pack
          isMontaje, // Flag para identificar montajes
          finalPrice: Number(pack.finalPrice || pack.calculatedTotalPrice || 0),
          packData: pack.packData, // Datos adicionales del pack (transportCost, etc.)
        };
      });
      
      // NO cargar productos normales - solo mostrar montajes en la calculadora
      return mappedPacks; // Solo devolver packs (que incluyen montajes)
    },
  });

  // Cargar categorías
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await productService.getCategories();
      return result || [];
    },
  });

  // Cargar packs de MONTAJE (transporte + instalación)
  const { data: montajePacks = [] } = useQuery({
    queryKey: ['montaje-packs'],
    queryFn: async () => {
      try {
        // INCLUIR MONTAJES explícitamente
        const response: any = await api.get('/packs?includeMontajes=true');
        const allPacks = response?.packs || response || [];
        
        // Filtrar solo packs que son montajes (categoryRef.name === 'Montaje')
        const montajePacks = allPacks.filter((pack: any) => 
          pack.categoryRef?.name?.toLowerCase() === 'montaje' && pack.isActive === true
        );
        
        return montajePacks;
      } catch (error) {
        console.error('Error cargando packs de montaje:', error);
        return [];
      }
    },
  });

  // Validar ubicación y fecha cuando llegamos al Step 6 (Resumen final)
  useEffect(() => {
    if (step === 6) {
      validateEventData(eventData.eventLocation, eventData.eventDate).then(validation => {
        setEventValidation(validation);
      });
    }
  }, [step, eventData.eventLocation, eventData.eventDate]);

  // Recuperar solicitud pendiente después del login
  useEffect(() => {
    // Recuperar solicitud de presupuesto pendiente
    const pendingRequest = sessionStorage.getItem('pendingQuoteRequest');
    if (pendingRequest && isAuthenticated) {
      try {
        const savedData = JSON.parse(pendingRequest);
        setEventData(savedData);
        sessionStorage.removeItem('pendingQuoteRequest');
        // Ir al último paso (resumen)
        setStep(6);
      } catch (error) {
        console.error('Error recuperando solicitud:', error);
      }
    }
  }, [isAuthenticated]);

  const selectedEventType = eventTypes.find(et => et.id === eventData.eventType);
  const hasParts = selectedEventType?.parts && selectedEventType.parts.length > 0;

  // Scroll hacia arriba cuando cambia el paso
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [step]);

  const handleNext = () => {
    // Si estamos en paso 2 (Detalles) y el evento NO tiene partes, saltar al paso 4 (Equipos)
    if (step === 2 && !hasParts) {
      setStep(4);
    } else if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    // Si estamos en paso 4 (Equipos) y el evento NO tiene partes, volver al paso 2
    if (step === 4 && !hasParts) {
      setStep(2);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddToCartAndCheckout = async () => {
    // 1. Verificar que haya productos seleccionados
    if (!eventData.selectedPack && Object.keys(eventData.selectedExtras).length === 0) {
      alert('❌ Por favor selecciona al menos un pack o producto extra');
      return;
    }

    // 2. Verificar que se haya especificado fecha Y ubicación
    if (!eventData.eventDate || !eventData.eventLocation) {
      alert('❌ Para añadir al carrito necesitas especificar:\n\n• Fecha del evento\n• Ubicación del evento\n\nPor favor, completa estos datos en el paso de "Detalles del Evento".');
      return;
    }

    // 2. Calcular total incluyendo transporte y montaje
    let totalCalculated = 0;
    let itemCount = 0;

    try {
      // Preparar metadata del evento con partes y sus precios
      const selectedPartsWithPrices: Array<{id: string; name: string; icon: string; price: number}> = [];
      let partsTotal = 0;
      
      if (eventData.selectedParts && eventData.selectedParts.length > 0 && selectedEventType) {
        eventData.selectedParts.forEach((partId) => {
          const part = selectedEventType.parts?.find((p: any) => p.id === partId);
          if (part) {
            // Calcular precio de la parte según rangos de invitados
            let partPrice = 0;
            if (part.pricingRanges && part.pricingRanges.length > 0) {
              const applicableRange = part.pricingRanges.find((range: any) => 
                eventData.attendees >= range.minAttendees && 
                eventData.attendees <= range.maxAttendees
              );
              
              // Si no hay rango exacto, buscar el rango más cercano
              if (!applicableRange) {
                const sortedRanges = [...part.pricingRanges].sort((a: any, b: any) => a.minAttendees - b.minAttendees);
                const closestRange = sortedRanges.reverse().find((range: any) => 
                  eventData.attendees >= range.minAttendees
                );
                partPrice = closestRange ? closestRange.price : (sortedRanges[0]?.price || 0);
              } else {
                partPrice = applicableRange.price;
              }
            }
            
            // IMPORTANTE: Si es parte de "Disco/Fiesta" y hay pack seleccionado, usar precio del pack
            const isPartyPart = part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
            const selectedPackData = eventData.selectedPack 
              ? catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack)
              : null;
            
            // Precio final: si es parte de fiesta con pack, usar precio del pack
            const finalPrice = isPartyPart && selectedPackData 
              ? Number(selectedPackData.pricePerDay) 
              : partPrice;
            
            selectedPartsWithPrices.push({
              id: part.id,
              name: part.name,
              icon: part.icon,
              price: finalPrice
            });
            partsTotal += finalPrice;
          }
        });
      }
      
      // Preparar extras seleccionados
      const selectedExtrasWithPrices: Array<{id: string; name: string; quantity: number; pricePerDay: number; total: number}> = [];
      let extrasTotal = 0;
      
      for (const [productId, quantity] of Object.entries(eventData.selectedExtras)) {
        if (Number(quantity) > 0) {
          const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
          if (product) {
            const basePrice = Number(product.pricePerDay);
            const total = basePrice * Number(quantity);
            selectedExtrasWithPrices.push({
              id: product.id,
              name: product.name,
              quantity: Number(quantity),
              pricePerDay: basePrice,
              total: total
            });
            extrasTotal += total;
            totalCalculated += total;
            itemCount += Number(quantity);
          }
        }
      }
      
      // Calcular si el pack debe sumarse aparte o ya está incluido en partsTotal
      let packBasePrice = 0;
      const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
        const part = selectedEventType.parts?.find((p: any) => p.id === partId);
        return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
      });
      
      // Si NO hay parte de fiesta Y hay pack seleccionado, calcular precio del pack
      if (!hasPartyPart && eventData.selectedPack) {
        const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
        if (pack) {
          packBasePrice = Number(pack.pricePerDay) || 0;
        }
      }

      const eventMetadata = {
        eventType: eventTypes.find(t => t.id === eventData.eventType)?.name || eventData.eventType,
        attendees: eventData.attendees,
        duration: eventData.duration,
        durationType: eventData.durationType,
        startTime: eventData.startTime,
        eventDate: eventData.eventDate,
        eventLocation: eventData.eventLocation,
        selectedParts: selectedPartsWithPrices,
        partsTotal: partsTotal,
        selectedExtras: selectedExtrasWithPrices,
        extrasTotal: extrasTotal,
        packBasePrice: packBasePrice // Nuevo campo para el precio base del pack cuando no está incluido en partes
      };

      // 3. Añadir SOLO el pack al carrito con todo el metadata (partes + extras)
      if (eventData.selectedPack) {
        const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
        if (pack) {
          guestCart.addItem(pack, 1, eventMetadata);
          
          // Verificar si hay parte de fiesta (para evitar duplicar el precio del pack)
          const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
            const part = selectedEventType.parts?.find((p: any) => p.id === partId);
            return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
          });
          
          // Si NO hay parte de fiesta, sumar el precio del pack
          // Si SÍ hay parte de fiesta, el pack ya está incluido en partsTotal
          if (!hasPartyPart) {
            const basePrice = Number(pack.pricePerDay);
            const shipping = Number(pack.packData?.shippingCost || 0);
            const installation = Number(pack.packData?.installationCost || 0);
            totalCalculated += basePrice + shipping + installation;
          }
          
          // Sumar las partes (que pueden incluir el pack si hay parte de fiesta)
          totalCalculated += partsTotal;
          itemCount = 1; // Solo el pack como un item
        }
      }

      // IMPORTANTE: Los eventos son SIEMPRE 1 día, NO multiplicar por días
      // El precio ya incluye todo el servicio del evento
      const totalFinal = totalCalculated;

      // 5. Marcar que los productos ya incluyen transporte/montaje
      localStorage.setItem('cartIncludesShippingInstallation', 'true');
      localStorage.setItem('cartFromCalculator', 'true');

      // 6. Guardar fechas del evento para el carrito
      // Los eventos son SIEMPRE 1 día (fecha inicio = fecha fin)
      const eventDate = new Date(eventData.eventDate);
      const startDate = eventDate.toISOString().split('T')[0];
      const endDate = eventDate.toISOString().split('T')[0]; // Mismo día
      
      localStorage.setItem('cartEventDates', JSON.stringify({
        start: startDate,
        end: endDate
      }));

      // 8. Guardar información completa del evento para las notas
      const eventInfo = {
        eventType: eventTypes.find(t => t.id === eventData.eventType)?.name || eventData.eventType,
        attendees: eventData.attendees,
        duration: eventData.duration,
        durationType: eventData.durationType,
        startTime: eventData.startTime,
        eventDate: eventData.eventDate,
        eventLocation: eventData.eventLocation,
        selectedParts: eventData.selectedParts,
      };
      localStorage.setItem('cartEventInfo', JSON.stringify(eventInfo));

      // 9. Redirigir al carrito para que el usuario pueda revisar antes de pagar
      navigate('/carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Error al añadir productos al carrito');
    }
  };

  const handleRequestQuote = async () => {
    // Verificar si el usuario está logueado
    if (!isAuthenticated || !user) {
      const shouldLogin = confirm(
        '🔒 Inicia sesión para solicitar presupuesto\n\n' +
        'Para poder contactarte y gestionar tu solicitud correctamente,\n' +
        'necesitamos que inicies sesión o crees una cuenta.\n\n' +
        '¿Quieres ir al login ahora?'
      );
      
      if (shouldLogin) {
        // Guardar el estado actual en sessionStorage para recuperarlo después
        sessionStorage.setItem('pendingQuoteRequest', JSON.stringify(eventData));
        navigate('/login', { 
          state: { 
            from: location.pathname,
            message: 'Inicia sesión para solicitar tu presupuesto' 
          } 
        });
      }
      return;
    }

    try {
      // Calcular total estimado (mismo cálculo que en el resumen visual)
      let total = 0;
      
      // Verificar si hay parte de fiesta seleccionada
      const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
        const part = selectedEventType.parts?.find((p: any) => p.id === partId);
        return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
      });
      
      // Añadir precio de las partes seleccionadas
      if (eventData.selectedParts && eventData.selectedParts.length > 0 && selectedEventType) {
        eventData.selectedParts.forEach((partId) => {
          const part = selectedEventType.parts?.find((p: any) => p.id === partId);
          if (part) {
            let partPrice = 0;
            if (part.pricingRanges && part.pricingRanges.length > 0) {
              const applicableRange = part.pricingRanges.find((range: any) => 
                eventData.attendees >= range.minAttendees && 
                eventData.attendees <= range.maxAttendees
              );
              
              // Si no hay rango exacto, buscar el rango más cercano
              if (!applicableRange) {
                const sortedRanges = [...part.pricingRanges].sort((a: any, b: any) => a.minAttendees - b.minAttendees);
                const closestRange = sortedRanges.reverse().find((range: any) => 
                  eventData.attendees >= range.minAttendees
                );
                partPrice = closestRange ? closestRange.price : (sortedRanges[0]?.price || 0);
              } else {
                partPrice = applicableRange.price;
              }
            }
            
            // Si es parte de fiesta Y hay pack, usar precio del pack
            const isPartyPart = part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
            if (isPartyPart && eventData.selectedPack) {
              const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
              if (pack) {
                const basePrice = Number(pack.pricePerDay);
                const shipping = Number(pack.packData?.shippingCost || 0);
                const installation = Number(pack.packData?.installationCost || 0);
                partPrice = basePrice + shipping + installation;
              }
            }
            
            total += partPrice;
          }
        });
      }
      
      // Añadir precio del pack SOLO si NO hay parte de fiesta
      if (eventData.selectedPack && !hasPartyPart) {
        const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
        if (pack) {
          const basePrice = Number(pack.pricePerDay);
          const shipping = Number(pack.packData?.shippingCost || 0);
          const installation = Number(pack.packData?.installationCost || 0);
          total += basePrice + shipping + installation;
        }
      }
      
      // Añadir precio de extras
      Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
        const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
        if (product) {
          const basePrice = Number(product.pricePerDay);
          const shipping = Number(product.packData?.shippingCost || 0);
          const installation = Number(product.packData?.installationCost || 0);
          total += (basePrice + shipping + installation) * quantity;
        }
      });
      
      // IMPORTANTE: Los eventos son SIEMPRE 1 día, NO multiplicar
      const totalFinal = total;

      // Preparar datos para enviar (usar datos del usuario logueado)
      const quoteData = {
        customerEmail: user.email,
        customerName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
        customerPhone: user.phone || '',
        eventType: eventTypes.find(t => t.id === eventData.eventType)?.name || eventData.eventType,
        attendees: eventData.attendees,
        duration: eventData.duration,
        durationType: eventData.durationType,
        eventDate: eventData.eventDate,
        eventLocation: eventData.eventLocation,
        selectedPack: eventData.selectedPack,
        selectedExtras: eventData.selectedExtras,
        estimatedTotal: totalFinal,
        notes: `Solicitud desde calculadora web`
      };

      // Obtener token
      const token = useAuthStore.getState().accessToken || localStorage.getItem('token');
      
      // Enviar solicitud
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/quote-requests/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        // Mostrar mensaje de éxito con SweetAlert o alert personalizado
        const confirmed = confirm(
          '✅ ¡Solicitud enviada correctamente!\n\n' +
          'Hemos recibido tu solicitud de presupuesto.\n' +
          'Nuestro equipo la revisará y te contactará en menos de 24 horas.\n\n' +
          '¿Quieres ver más productos mientras tanto?'
        );
        
        if (confirmed) {
          navigate('/productos');
        } else {
          navigate('/');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al enviar solicitud');
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert(
        '❌ No se pudo enviar la solicitud automáticamente.\n\n' +
        'Por favor, contáctanos directamente por email o teléfono.\n' +
        'Te redirigiremos a nuestra página de contacto.'
      );
      
      // Solo ir a contacto si hay error
      setTimeout(() => {
        navigate('/contacto', { 
          state: { 
            subject: 'Solicitud de Presupuesto',
            eventData 
          } 
        });
      }, 2000);
    }
  };

  const handleContactRequest = async () => {
    // Validar campos del formulario
    if (!contactData.name || !contactData.phone) {
      alert('❌ Por favor completa al menos tu nombre y teléfono');
      return;
    }

    try {
      // Calcular total del evento
      let total = 0;
      
      // Calcular precio de partes seleccionadas (si aplica)
      if (eventData.selectedParts && eventData.selectedParts.length > 0) {
        const eventConfig = calculatorConfig.eventTypes.find((et: any) => et.id === eventData.eventType);
        eventData.selectedParts.forEach((partId: string) => {
          const part = eventConfig?.parts?.find((p: any) => p.id === partId);
          if (part) {
            total += Number(part.price || 0);
          }
        });
      }
      
      // Añadir precio del pack seleccionado
      if (eventData.selectedPack) {
        const selectedPackData = catalogProducts.find((p: any) => p.id === eventData.selectedPack);
        if (selectedPackData) {
          total += Number(selectedPackData.pricePerDay || selectedPackData.finalPrice || 0);
        }
      }
      
      // Añadir precio de extras
      Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
        const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
        if (product) {
          const basePrice = Number(product.pricePerDay);
          total += basePrice * quantity;
        }
      });

      // Preparar datos completos para enviar (formato esperado por el backend)
      const contactRequestData = {
        customerName: contactData.name,
        customerPhone: contactData.phone,
        customerEmail: contactData.email || null,
        eventType: eventTypes.find(t => t.id === eventData.eventType)?.name || eventData.eventType,
        attendees: eventData.attendees,
        duration: eventData.duration,
        durationType: eventData.durationType,
        eventDate: eventData.eventDate || null,
        eventLocation: eventData.eventLocation || null,
        selectedPack: eventData.selectedPack || null,
        selectedExtras: eventData.selectedExtras || {},
        estimatedTotal: total,
        notes: contactData.message ? `Solicitud de contacto: ${contactData.message}` : 'Solicitud de contacto desde calculadora de eventos'
      };

      // Enviar solicitud de contacto
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/quote-requests/public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactRequestData),
      });

      if (response.ok) {
        alert(
          '✅ ¡Solicitud enviada correctamente!\n\n' +
          'Te llamaremos pronto al teléfono: ' + contactData.phone + '\n' +
          'Horario de atención: L-V 9:00-18:00'
        );
        
        // Cerrar modal y resetear formulario
        setShowContactModal(false);
        setContactData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error('Error al enviar solicitud');
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert(
        '❌ No se pudo enviar la solicitud.\n\n' +
        'Por favor llámanos directamente al:\n' +
        '📞 +34 XXX XXX XXX'
      );
    }
  };

  // Determinar el total de pasos según si el evento tiene partes
  const totalSteps = hasParts ? 6 : 5;
  const stepLabels = hasParts
    ? ['Tipo', 'Detalles', 'Partes', 'Equipos', 'Extras', 'Resumen']
    : ['Tipo', 'Detalles', 'Equipos', 'Extras', 'Resumen'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <SEOHead
        title="Calculadora Presupuesto Eventos Valencia | ReSona"
        description="Calculadora online gratuita para presupuesto de alquiler de equipos de eventos en Valencia. Sonido, iluminación, audiovisuales para bodas, conciertos y eventos corporativos. Presupuesto instantáneo."
        keywords="calculadora presupuesto eventos valencia, calcular alquiler sonido valencia, presupuesto boda valencia, precio alquiler equipos eventos valencia, calculadora alquiler material"
        canonicalUrl="https://resonaevents.com/calculadora-evento"
        schema={[serviceSchema, calculatorFAQSchema]}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Calculadora de Presupuesto para Eventos
          </h1>
          <p className="text-gray-600 text-lg">
            Obtén un presupuesto estimado para tu evento en minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
              // Si NO tiene partes y el paso es > 2, ajustar el número de paso actual
              const adjustedCurrentStep = !hasParts && step > 2 ? step + 1 : step;
              const isActive = s <= adjustedCurrentStep;
              
              return (
                <div
                  key={s}
                  className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                    isActive ? 'bg-resona' : 'bg-gray-200'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {stepLabels.map((label, index) => {
              const stepNum = index + 1;
              const adjustedCurrentStep = !hasParts && step > 2 ? step + 1 : step;
              const isActive = stepNum <= adjustedCurrentStep;
              
              return (
                <span key={label} className={isActive ? 'text-resona font-medium' : ''}>
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Step 1: Event Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                ¿Qué tipo de evento organizas?
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setEventData({ ...eventData, eventType: type.id })}
                    className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                      eventData.eventType === type.id
                        ? 'border-resona bg-resona/5 shadow-lg'
                        : 'border-gray-200 hover:border-resona/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{type.icon}</div>
                    <div className="font-semibold">{type.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Event Details */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Detalles del Evento
              </h2>
              <div className="space-y-6">
                {/* Attendees */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Users className="w-5 h-5 text-resona" />
                    Número de Asistentes
                  </label>
                  <input
                    type="number"
                    value={eventData.attendees}
                    onChange={(e) => setEventData({ ...eventData, attendees: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    min="10"
                    max="10000"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    Asistentes: {eventData.attendees}
                  </div>
                </div>

                {/* Hora de inicio del Evento */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Clock className="w-5 h-5 text-resona" />
                    Hora de Inicio
                  </label>
                  <select
                    value={eventData.startTime}
                    onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  >
                    {Array.from({ length: 48 }, (_, i) => {
                      const hour = String(Math.floor(i / 2)).padStart(2, '0');
                      const minute = i % 2 === 0 ? '00' : '30';
                      const time = `${hour}:${minute}`;
                      return (
                        <option key={i} value={time}>
                          {time}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Calendar className="w-5 h-5 text-resona" />
                    Fecha del Evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventData.eventDate}
                    onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-red-500">*</span> Obligatorio para añadir al carrito
                  </p>
                </div>

                {/* Event Location */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Mail className="w-5 h-5 text-resona" />
                    Lugar del Evento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventData.eventLocation}
                    onChange={(e) => setEventData({ ...eventData, eventLocation: e.target.value })}
                    placeholder="Dirección completa del evento"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="text-red-500">*</span> Obligatorio para añadir al carrito
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Event Parts (para eventos con partes definidas) */}
          {step === 3 && hasParts && selectedEventType && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                ¿Qué partes tendrá tu {selectedEventType.name.toLowerCase()}?
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Selecciona las diferentes fases de tu evento
              </p>
              <div className="space-y-4">
                {selectedEventType.parts.map((part: any) => {
                  const isSelected = eventData.selectedParts.includes(part.id);
                  return (
                    <button
                      key={part.id}
                      onClick={() => {
                        const newSelectedParts = isSelected
                          ? eventData.selectedParts.filter(id => id !== part.id)
                          : [...eventData.selectedParts, part.id];
                        setEventData({ ...eventData, selectedParts: newSelectedParts });
                      }}
                      className={`w-full p-5 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                        isSelected
                          ? 'border-resona bg-resona/10 shadow-lg'
                          : 'border-gray-200 hover:border-resona/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{part.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">
                            {decodeHTMLEntities(part.name)}
                          </div>
                          <div className="text-sm text-gray-600">{part.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Duración: {part.defaultDuration}h • Sonido: {part.soundLevel} • Iluminación: {part.lightingLevel}
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-resona bg-resona scale-110'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Consejo:</strong> Cada parte del evento puede requerir equipamiento diferente. 
                  Esto nos ayudará a calcular mejor tu presupuesto.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Pack Selection */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Elige el material para tu evento
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Packs recomendados para {eventData.attendees} personas en tu {selectedEventType?.name.toLowerCase()}
              </p>
              
              {(() => {
                // Obtener configuración del tipo de evento seleccionado
                const eventConfig = calculatorConfig.eventTypes.find((et: any) => et.id === eventData.eventType);
                const configuredPacks = eventConfig?.availablePacks || [];
                const recommendedPacksRules = eventConfig?.recommendedPacks || [];
                
                // Filtrar packs: SOLO mostrar MONTAJES (categoría MONTAJE)
                const availablePacks = catalogProducts.filter((p: any) => {
                  if (!p.isPack || !p.isActive) {
                    return false;
                  }
                  
                  // IMPORTANTE: Solo mostrar montajes (packs con categoría MONTAJE)
                  if (!p.isMontaje) {
                    return false;
                  }
                  
                  // ⭐ REGLA CRÍTICA: SOLO mostrar montajes que estén configurados en el admin
                  // Si NO está en la lista de availablePacks del evento, NO mostrarlo
                  if (!configuredPacks.includes(p.id)) {
                    return false;
                  }
                  
                  return true;
                });
                
                // Aplicar reglas de recomendación para ordenar y destacar
                const packsWithRecommendation = availablePacks.map((pack: any) => {
                  // Buscar si hay una regla de recomendación que aplique
                  const rule = recommendedPacksRules.find((r: any) => {
                    // Verificar si el pack coincide
                    if (r.packId !== pack.id) return false;
                    
                    // Verificar rango de asistentes
                    if (eventData.attendees < r.minAttendees || eventData.attendees > r.maxAttendees) {
                      return false;
                    }
                    
                    // Verificar partes requeridas (si las hay)
                    if (r.requiredParts && r.requiredParts.length > 0) {
                      // El cliente debe tener al menos una de las partes requeridas
                      const hasRequiredPart = r.requiredParts.some((partId: string) => 
                        eventData.selectedParts.includes(partId)
                      );
                      if (!hasRequiredPart) return false;
                    }
                    
                    return true;
                  });
                  
                  return {
                    ...pack,
                    isRecommended: !!rule,
                    priority: rule?.priority || 999,
                    recommendationReason: rule?.reason
                  };
                });
                
                // Ordenar: primero recomendados (por prioridad), luego el resto
                const sortedPacks = packsWithRecommendation.sort((a: any, b: any) => {
                  if (a.isRecommended && !b.isRecommended) return -1;
                  if (!a.isRecommended && b.isRecommended) return 1;
                  return a.priority - b.priority;
                });
                
                return (
                  <>
                    {/* Packs Disponibles */}
                    {sortedPacks.length > 0 ? (
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>📦</span>
                          <span>Packs Disponibles</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {sortedPacks.map((pack: any) => {
                            const isSelected = eventData.selectedPack === pack.id;
                            const showImagePreview = hoveredPackId === pack.id;
                            
                            return (
                              <div key={pack.id} className="relative">
                                <button
                                  onClick={() => {
                                    // Solo permitir seleccionar UN pack
                                    setEventData({ 
                                      ...eventData, 
                                      selectedPack: isSelected ? null : pack.id 
                                    });
                                  }}
                                  onMouseEnter={() => setHoveredPackId(pack.id)}
                                  onMouseLeave={() => setHoveredPackId(null)}
                                  className={`w-full text-left bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                                    isSelected
                                      ? 'border-resona bg-resona/5 shadow-md'
                                      : 'border-gray-200 hover:border-resona/50'
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    {(pack.imageUrl || pack.mainImageUrl) && (
                                      <img 
                                        src={pack.imageUrl || pack.mainImageUrl} 
                                        alt={pack.name}
                                        className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50"
                                      />
                                    )}
                                    <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-bold text-gray-900">{pack.name}</h4>
                                        {pack.isRecommended && (
                                          <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                            ✨ Recomendado para ti
                                          </span>
                                        )}
                                      </div>
                                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                        isSelected
                                          ? 'border-resona bg-resona'
                                          : 'border-gray-300'
                                      }`}>
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pack.description}</p>
                                    
                                    {/* Badge de rango de asistentes */}
                                    {(() => {
                                      const specs = pack.specifications 
                                        ? (typeof pack.specifications === 'string' ? JSON.parse(pack.specifications) : pack.specifications)
                                        : null;
                                      
                                      if (specs && (specs.minAttendees || specs.maxAttendees)) {
                                        return (
                                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                            <Users className="w-3 h-3" />
                                            {specs.minAttendees && specs.maxAttendees 
                                              ? `${specs.minAttendees}-${specs.maxAttendees} personas`
                                              : specs.minAttendees 
                                              ? `Mín. ${specs.minAttendees} personas`
                                              : `Máx. ${specs.maxAttendees} personas`
                                            }
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                    
                                    <div className="mt-3">
                                      {(() => {
                                        const basePrice = Number(pack.pricePerDay);
                                        const shipping = Number(pack.packData?.shippingCost || 0);
                                        const installation = Number(pack.packData?.installationCost || 0);
                                        const totalPrice = basePrice + shipping + installation;
                                        
                                        return (
                                          <div>
                                            <span className="text-xl font-bold text-resona">
                                              €{totalPrice.toFixed(2)}/día
                                            </span>
                                            {(shipping > 0 || installation > 0) && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                Incluye transporte y montaje
                                              </p>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </button>
                              
                              {/* Preview con imagen grande - SOLO en desktop (hover) */}
                              {showImagePreview && (pack.imageUrl || pack.mainImageUrl) && (
                                <div className="hidden lg:block absolute z-50 left-full ml-4 top-0 w-96 bg-white rounded-lg shadow-2xl border-2 border-resona p-4 pointer-events-none">
                                  <div className="w-full h-64 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={pack.imageUrl || pack.mainImageUrl} 
                                      alt={pack.name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">{pack.name}</h4>
                                  <p className="text-sm text-gray-600">{pack.description}</p>
                                  <div className="mt-3 text-2xl font-bold text-resona">
                                    €{Number(pack.pricePerDay || pack.packData?.finalPrice || 0).toFixed(2)}/día
                                  </div>
                                </div>
                              )}
                              
                              {/* Botón para abrir imagen en móvil - posicionado sobre la imagen */}
                              {(pack.imageUrl || pack.mainImageUrl) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageModal({ show: true, product: pack });
                                  }}
                                  className="lg:hidden absolute top-8 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                                  aria-label="Ver imagen completa"
                                >
                                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No hay packs disponibles en este momento.</p>
                        <p className="text-sm text-gray-500 mt-2">Puedes continuar y te contactaremos para personalizar tu evento.</p>
                      </div>
                    )}
                  </>
                );
              })()}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Selecciona UN pack que se ajuste a tu evento. Podrás añadir productos extra en el siguiente paso.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Extras - Productos adicionales */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Extras para tu Evento
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Añade productos adicionales que complementen tu evento
              </p>
              
              {(() => {
                // Filtrar extras según la configuración del evento
                const eventConfig = calculatorConfig.eventTypes.find((et: any) => et.id === eventData.eventType);
                const availableExtras = eventConfig?.availableExtras || [];
                const extraCategories = eventConfig?.extraCategories || [];
                
                // Filtrar extras: SOLO mostrar MONTAJES configurados
                const extrasProducts = catalogProducts.filter((p: any) => {
                  if (!p.isActive) return false;
                  if (!p.isMontaje) return false;
                  if (!availableExtras.includes(p.id)) return false;
                  return true;
                });
                
                // Si hay categorías configuradas, mostrar con pestañas
                if (extraCategories.length > 0) {
                  const activeCategory = extraCategories[activeExtraTab];
                  
                  // Filtrar productos de la categoría activa
                  const filteredProducts = extrasProducts.filter((p: any) => 
                    activeCategory.extrasIds.includes(p.id)
                  );
                  
                  return extrasProducts.length > 0 ? (
                    <div className="space-y-6">
                      {/* Pestañas de categorías */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {extraCategories.map((category: any, index: number) => {
                          const productsInCategory = extrasProducts.filter((p: any) => 
                            category.extrasIds.includes(p.id)
                          );
                          const selectedInCategory = productsInCategory.filter((p: any) => 
                            eventData.selectedExtras[p.id]
                          ).length;
                          
                          // Mapeo de colores Tailwind
                          const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
                            purple: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500', hover: 'hover:bg-purple-600' },
                            blue: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500', hover: 'hover:bg-blue-600' },
                            pink: { bg: 'bg-pink-500', text: 'text-pink-700', border: 'border-pink-500', hover: 'hover:bg-pink-600' },
                            yellow: { bg: 'bg-yellow-500', text: 'text-yellow-700', border: 'border-yellow-500', hover: 'hover:bg-yellow-600' },
                            gray: { bg: 'bg-gray-500', text: 'text-gray-700', border: 'border-gray-500', hover: 'hover:bg-gray-600' },
                            indigo: { bg: 'bg-indigo-500', text: 'text-indigo-700', border: 'border-indigo-500', hover: 'hover:bg-indigo-600' },
                            green: { bg: 'bg-green-500', text: 'text-green-700', border: 'border-green-500', hover: 'hover:bg-green-600' },
                            red: { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', hover: 'hover:bg-red-600' },
                            orange: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', hover: 'hover:bg-orange-600' },
                            cyan: { bg: 'bg-cyan-500', text: 'text-cyan-700', border: 'border-cyan-500', hover: 'hover:bg-cyan-600' },
                          };
                          
                          const colors = colorClasses[category.color] || colorClasses.purple;
                          const isActive = activeExtraTab === index;
                          
                          return (
                            <button
                              key={category.id}
                              onClick={() => setActiveExtraTab(index)}
                              className={`relative px-6 py-3 rounded-lg font-medium transition-all ${
                                isActive
                                  ? `${colors.bg} text-white shadow-lg scale-105`
                                  : `bg-white border-2 ${colors.border} ${colors.text} ${colors.hover} hover:scale-105`
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{category.icon}</span>
                                <span>{category.name}</span>
                                {productsInCategory.length > 0 && (
                                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                    isActive ? 'bg-white/20' : 'bg-gray-100'
                                  }`}>
                                    {productsInCategory.length}
                                  </span>
                                )}
                              </div>
                              {selectedInCategory > 0 && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                  {selectedInCategory}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Productos de la categoría activa */}
                      {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredProducts.map((product: any) => {
                            const isSelected = !!eventData.selectedExtras[product.id];
                            const quantity = eventData.selectedExtras[product.id] || 0;
                            const showImagePreview = hoveredExtraId === product.id;
                            
                            return (
                              <div key={product.id} className="relative">
                              <div
                                onMouseEnter={() => setHoveredExtraId(product.id)}
                                onMouseLeave={() => setHoveredExtraId(null)}
                                className={`bg-white rounded-lg border-2 p-4 transition-all ${
                                  isSelected ? 'border-resona bg-resona/5' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {product.mainImageUrl && (
                                    <img 
                                      src={product.mainImageUrl} 
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                    <div className="mt-2">
                                      {(() => {
                                        const basePrice = Number(product.pricePerDay);
                                        const shipping = Number(product.shippingCost || 0);
                                        const installation = Number(product.installationCost || 0);
                                        const totalPrice = basePrice + shipping + installation;
                                        
                                        return (
                                          <>
                                            <div className="font-bold text-resona">
                                              €{totalPrice.toFixed(2)}/día
                                            </div>
                                            {(shipping > 0 || installation > 0) && (
                                              <p className="text-xs text-gray-500">
                                                Inc. transporte y montaje
                                              </p>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const newExtras = { ...eventData.selectedExtras };
                                      const currentQty = newExtras[product.id] || 0;
                                      if (currentQty > 1) {
                                        newExtras[product.id] = currentQty - 1;
                                      } else {
                                        delete newExtras[product.id];
                                      }
                                      setEventData({ ...eventData, selectedExtras: newExtras });
                                    }}
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:border-resona hover:bg-resona/10 flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{quantity}</span>
                                  <button
                                    onClick={() => {
                                      const newExtras = { ...eventData.selectedExtras };
                                      newExtras[product.id] = (newExtras[product.id] || 0) + 1;
                                      setEventData({ ...eventData, selectedExtras: newExtras });
                                    }}
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:border-resona hover:bg-resona/10 flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Preview con imagen grande - SOLO en desktop (hover) */}
                              {showImagePreview && (product.imageUrl || product.mainImageUrl) && (
                                <div className="hidden lg:block absolute z-50 left-full ml-4 top-0 w-96 bg-white rounded-lg shadow-2xl border-2 border-resona p-4 pointer-events-none">
                                  <div className="w-full h-64 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={product.imageUrl || product.mainImageUrl} 
                                      alt={product.name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <div className="mt-3">
                                    {(() => {
                                      const basePrice = Number(product.pricePerDay);
                                      const shipping = Number(product.shippingCost || 0);
                                      const installation = Number(product.installationCost || 0);
                                      const totalPrice = basePrice + shipping + installation;
                                      
                                      return (
                                        <div>
                                          <div className="text-2xl font-bold text-resona">
                                            €{totalPrice.toFixed(2)}/día
                                          </div>
                                          {(shipping > 0 || installation > 0) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Incluye transporte y montaje
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                              
                              {/* Botón para abrir imagen en móvil - Extras - posicionado sobre la imagen */}
                              {(product.imageUrl || product.mainImageUrl) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageModal({ show: true, product });
                                  }}
                                  className="lg:hidden absolute top-8 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-colors z-10"
                                  aria-label="Ver imagen completa"
                                >
                                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No hay extras en esta categoría</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay productos extras disponibles</p>
                    </div>
                  );
                }
                
                // Fallback: Si NO hay categorías, mostrar todos los extras agrupados por categoría de producto
                const productsByCategory: Record<string, any[]> = {};
                extrasProducts.forEach((product: any) => {
                  const categoryName = product.category?.name || 'Sin categoría';
                  if (!productsByCategory[categoryName]) {
                    productsByCategory[categoryName] = [];
                  }
                  productsByCategory[categoryName].push(product);
                });
                
                return extrasProducts.length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(productsByCategory).map(([categoryName, products]) => (
                      <div key={categoryName}>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-resona">
                          <span className="bg-resona text-white px-3 py-1 rounded-lg text-sm">
                            {products.length}
                          </span>
                          <span>{categoryName}</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {products.map((product: any) => {
                            const isSelected = !!eventData.selectedExtras[product.id];
                            const quantity = eventData.selectedExtras[product.id] || 0;
                            const showImagePreview = hoveredExtraId === product.id;
                            
                            return (
                              <div key={product.id} className="relative">
                              <div
                                onMouseEnter={() => setHoveredExtraId(product.id)}
                                onMouseLeave={() => setHoveredExtraId(null)}
                                className={`bg-white rounded-lg border-2 p-4 transition-all ${
                                  isSelected ? 'border-resona bg-resona/5' : 'border-gray-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {product.mainImageUrl && (
                                    <img 
                                      src={product.mainImageUrl} 
                                      alt={product.name}
                                      className="w-16 h-16 object-cover rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                    <div className="mt-2">
                                      {(() => {
                                        const basePrice = Number(product.pricePerDay);
                                        const shipping = Number(product.shippingCost || 0);
                                        const installation = Number(product.installationCost || 0);
                                        const totalPrice = basePrice + shipping + installation;
                                        
                                        return (
                                          <>
                                            <div className="font-bold text-resona">
                                              €{totalPrice.toFixed(2)}/día
                                            </div>
                                            {(shipping > 0 || installation > 0) && (
                                              <p className="text-xs text-gray-500">
                                                Inc. transporte y montaje
                                              </p>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const newExtras = { ...eventData.selectedExtras };
                                      const currentQty = newExtras[product.id] || 0;
                                      if (currentQty > 1) {
                                        newExtras[product.id] = currentQty - 1;
                                      } else {
                                        delete newExtras[product.id];
                                      }
                                      setEventData({ ...eventData, selectedExtras: newExtras });
                                    }}
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:border-resona hover:bg-resona/10 flex items-center justify-center transition-colors"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="w-12 text-center font-medium">{quantity}</span>
                                  <button
                                    onClick={() => {
                                      const newExtras = { ...eventData.selectedExtras };
                                      newExtras[product.id] = (newExtras[product.id] || 0) + 1;
                                      setEventData({ ...eventData, selectedExtras: newExtras });
                                    }}
                                    className="w-8 h-8 rounded-lg border border-gray-300 hover:border-resona hover:bg-resona/10 flex items-center justify-center transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              
                              {showImagePreview && (product.imageUrl || product.mainImageUrl) && (
                                <div className="absolute z-50 left-full ml-4 top-0 w-96 bg-white rounded-lg shadow-2xl border-2 border-resona p-4 pointer-events-none">
                                  <div className="w-full h-64 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    <img 
                                      src={product.imageUrl || product.mainImageUrl} 
                                      alt={product.name}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h4>
                                  <p className="text-sm text-gray-600">{product.description}</p>
                                  <div className="mt-3">
                                    {(() => {
                                      const basePrice = Number(product.pricePerDay);
                                      const shipping = Number(product.shippingCost || 0);
                                      const installation = Number(product.installationCost || 0);
                                      const totalPrice = basePrice + shipping + installation;
                                      
                                      return (
                                        <div>
                                          <div className="text-2xl font-bold text-resona">
                                            €{totalPrice.toFixed(2)}/día
                                          </div>
                                          {(shipping > 0 || installation > 0) && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Incluye transporte y montaje
                                            </p>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No hay productos extras disponibles</p>
                  </div>
                );
              })()}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Nota:</strong> Los extras son opcionales. Puedes añadir la cantidad que necesites de cada producto.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Resumen Final */}
          {step === 6 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Resumen de tu Evento
              </h2>
              
              {/* Información del Evento */}
              <div className="space-y-4 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Tipo de Evento</p>
                    <p className="font-semibold text-lg mt-1">{eventTypes.find(t => t.id === eventData.eventType)?.name}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Asistentes</p>
                    <p className="font-semibold text-lg mt-1">{eventData.attendees} personas</p>
                  </div>
                  
                  {eventData.eventDate && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Fecha del Evento</p>
                      <p className="font-semibold text-lg mt-1">{new Date(eventData.eventDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>
                
                {eventData.eventLocation && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Ubicación</p>
                    <p className="font-semibold text-lg mt-1">{eventData.eventLocation}</p>
                  </div>
                )}

                {/* Partes Seleccionadas */}
                {eventData.selectedParts.length > 0 && selectedEventType && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium mb-3">🎭 Partes del Evento</p>
                    <div className="space-y-2">
                      {selectedEventType.parts
                        .filter((part: any) => eventData.selectedParts.includes(part.id))
                        .map((part: any) => {
                        
                        // Calcular el precio de la parte según el número de invitados
                        let partPrice = 0;
                        if (part.pricingRanges && part.pricingRanges.length > 0) {
                          // Buscar el rango aplicable
                          const applicableRange = part.pricingRanges.find((range: any) => 
                            eventData.attendees >= range.minAttendees && 
                            eventData.attendees <= range.maxAttendees
                          );
                          
                          // Si no hay rango exacto, buscar el rango más cercano (el último que el número de invitados supera)
                          if (!applicableRange) {
                            const sortedRanges = [...part.pricingRanges].sort((a: any, b: any) => a.minAttendees - b.minAttendees);
                            const closestRange = sortedRanges.reverse().find((range: any) => 
                              eventData.attendees >= range.minAttendees
                            );
                            partPrice = closestRange ? closestRange.price : (sortedRanges[0]?.price || 0);
                          } else {
                            partPrice = applicableRange.price;
                          }
                        }
                        
                        // Verificar si esta parte es "Disco/Fiesta" y mostrar el pack aquí
                        const isPartyPart = part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                        const selectedPackData = eventData.selectedPack 
                          ? catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack)
                          : null;
                        
                        // Si es parte de fiesta y hay pack, mostrar el precio del pack en lugar del precio de la parte
                        const displayPrice = isPartyPart && selectedPackData 
                          ? Number(selectedPackData.pricePerDay) 
                          : partPrice;
                        
                        // Decodificar entidades HTML en el nombre
                        const decodedName = decodeHTMLEntities(part.name);
                        
                        return (
                          <div key={part.id}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{part.icon} {decodedName}</span>
                              <span className="text-sm font-semibold text-purple-600">€{displayPrice.toFixed(2)}</span>
                            </div>
                            
                            {/* Si es la parte de fiesta, mostrar el pack debajo SIN precio */}
                            {isPartyPart && selectedPackData && (
                              <div className="ml-4 mt-2 p-2 bg-white/50 rounded border border-purple-200">
                                <span className="text-xs text-gray-600">📦 {selectedPackData.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pack Seleccionado (solo si NO hay parte de fiesta) */}
                {eventData.selectedPack && (() => {
                  // Verificar si hay alguna parte de fiesta seleccionada
                  const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
                    const part = selectedEventType.parts?.find((p: any) => p.id === partId);
                    return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                  });
                  
                  // Solo mostrar esta sección si NO hay parte de fiesta
                  if (hasPartyPart) return null;
                  
                  const selectedPackData = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                  return selectedPackData ? (
                    <div className="p-4 bg-resona/10 rounded-lg border border-resona/30">
                      <p className="text-sm text-resona font-medium mb-2">📦 Pack Seleccionado</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-gray-900">{selectedPackData.name}</span>
                          {(Number(selectedPackData.packData?.shippingCost || 0) > 0 || Number(selectedPackData.packData?.installationCost || 0) > 0) && (
                            <p className="text-xs text-gray-500">Incluye transporte y montaje</p>
                          )}
                        </div>
                        <span className="font-bold text-resona">
                          €{(Number(selectedPackData.pricePerDay) + Number(selectedPackData.packData?.shippingCost || 0) + Number(selectedPackData.packData?.installationCost || 0)).toFixed(2)}/día
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Extras Seleccionados */}
                {Object.keys(eventData.selectedExtras).length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium mb-2">✨ Extras Seleccionados</p>
                    <div className="space-y-2">
                      {Object.entries(eventData.selectedExtras).map(([productId, quantity]) => {
                        const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
                        return product ? (
                          <div key={productId} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{quantity}x {product.name}</span>
                            <span className="text-sm font-semibold text-gray-900">€{((Number(product.pricePerDay) + Number(product.packData?.shippingCost || 0) + Number(product.packData?.installationCost || 0)) * quantity).toFixed(2)}/día</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Precio Total */}
                {(() => {
                  let total = 0;
                  
                  // Verificar si hay parte de fiesta seleccionada
                  const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
                    const part = selectedEventType.parts?.find((p: any) => p.id === partId);
                    return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                  });
                  
                  // Añadir precio de las partes seleccionadas
                  if (eventData.selectedParts.length > 0 && selectedEventType) {
                    eventData.selectedParts.forEach((partId) => {
                      const part = selectedEventType.parts.find((p: any) => p.id === partId);
                      if (part) {
                        // Precio base de la parte
                        let partPrice = 0;
                        if (part.pricingRanges && part.pricingRanges.length > 0) {
                          const applicableRange = part.pricingRanges.find((range: any) => 
                            eventData.attendees >= range.minAttendees && 
                            eventData.attendees <= range.maxAttendees
                          );
                          
                          // Si no hay rango exacto, buscar el rango más cercano
                          if (!applicableRange) {
                            const sortedRanges = [...part.pricingRanges].sort((a: any, b: any) => a.minAttendees - b.minAttendees);
                            const closestRange = sortedRanges.reverse().find((range: any) => 
                              eventData.attendees >= range.minAttendees
                            );
                            partPrice = closestRange ? closestRange.price : (sortedRanges[0]?.price || 0);
                          } else {
                            partPrice = applicableRange.price;
                          }
                        }
                        
                        // Si es parte de fiesta Y hay pack, usar precio del pack
                        const isPartyPart = part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                        if (isPartyPart && eventData.selectedPack) {
                          const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                          if (pack) {
                            const basePrice = Number(pack.pricePerDay);
                            const shipping = Number(pack.packData?.shippingCost || 0);
                            const installation = Number(pack.packData?.installationCost || 0);
                            partPrice = basePrice + shipping + installation;
                          }
                        }
                        
                        total += partPrice;
                      }
                    });
                  }
                  
                  // Añadir precio del pack SOLO si NO hay parte de fiesta (para evitar duplicar)
                  if (eventData.selectedPack && !hasPartyPart) {
                    const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                    if (pack) {
                      const basePrice = Number(pack.pricePerDay);
                      const shipping = Number(pack.packData?.shippingCost || 0);
                      const installation = Number(pack.packData?.installationCost || 0);
                      total += basePrice + shipping + installation;
                    }
                  }
                  
                  // Añadir precio de extras (incluyendo transporte y montaje)
                  Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
                    const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
                    if (product) {
                      const basePrice = Number(product.pricePerDay);
                      const shipping = Number(product.packData?.shippingCost || 0);
                      const installation = Number(product.packData?.installationCost || 0);
                      total += (basePrice + shipping + installation) * quantity;
                    }
                  });
                  
                  // IMPORTANTE: Los eventos son SIEMPRE 1 día, NO multiplicar
                  const subtotal = total;
                  const iva = subtotal * 0.21;
                  const totalFinal = subtotal + iva;
                  
                  return total > 0 ? (
                    <>
                      {/* Total del Evento */}
                      <div className="p-5 bg-green-50 rounded-lg border-2 border-green-300 mb-4">
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Subtotal (sin IVA):</span>
                            <span className="text-sm text-gray-600">€{subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">IVA (21%):</span>
                            <span className="text-sm text-gray-600">€{iva.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-green-300">
                            <span className="text-lg font-bold text-gray-900">TOTAL EVENTO:</span>
                            <span className="text-2xl font-bold text-green-600">€{totalFinal.toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          * Incluye transporte, montaje e IVA. Precio final puede variar según disponibilidad.
                        </p>
                      </div>
                      
                      {/* Información de Pago a Plazos (solo si > 500€) */}
                      {totalFinal > 500 && (
                        <div className="p-5 bg-blue-50 rounded-lg border-2 border-blue-300">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-blue-900">💳 Sistema de Pago a Plazos</h4>
                          </div>
                          
                          <p className="text-sm text-blue-800 mb-3">
                            Para tu comodidad, puedes pagar tu evento en 3 plazos:
                          </p>
                          
                          <div className="space-y-2 text-sm">
                            {/* Plazo 1 - 25% */}
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-blue-900">1️⃣ Reserva ahora (25%)</span>
                              </div>
                              <span className="font-bold text-blue-600">€{(totalFinal * 0.25).toFixed(2)}</span>
                            </div>
                            
                            {/* Plazo 2 - 50% */}
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">2️⃣ Un mes antes del evento (50%)</span>
                              </div>
                              <span className="font-semibold text-gray-700">€{(totalFinal * 0.50).toFixed(2)}</span>
                            </div>
                            
                            {/* Plazo 3 - 25% */}
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">3️⃣ Un día antes del evento (25%)</span>
                              </div>
                              <span className="font-semibold text-gray-700">€{(totalFinal * 0.25).toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-blue-700 mt-3 bg-blue-100 p-2 rounded">
                            <strong>ℹ️ Nota:</strong> Al reservar ahora pagarás solo el 25%. Los pagos restantes podrás realizarlos según las fechas indicadas o pagar todo de una vez desde "Mis Pedidos".
                          </p>
                        </div>
                      )}
                      
                      {/* Información para pedidos < 500€ */}
                      {totalFinal <= 500 && (
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>💡 Pago único:</strong> Este pedido se pagará en un solo pago al confirmar la reserva.
                          </p>
                        </div>
                      )}
                    </>
                  ) : null;
                })()}
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Información:</strong> Este es el resumen de tu evento. Para obtener un presupuesto detallado, 
                  haz clic en "Solicitar Presupuesto" y nos pondremos en contacto contigo.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {/* Botón principal: Tramitar Reserva */}
                {(() => {
                  // Calcular total para mostrar en el botón
                  let total = 0;
                  
                  const hasPartyPart = selectedEventType && eventData.selectedParts.some((partId: string) => {
                    const part = selectedEventType.parts?.find((p: any) => p.id === partId);
                    return part && part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                  });
                  
                  if (eventData.selectedParts.length > 0 && selectedEventType) {
                    eventData.selectedParts.forEach((partId) => {
                      const part = selectedEventType.parts.find((p: any) => p.id === partId);
                      if (part) {
                        let partPrice = 0;
                        if (part.pricingRanges && part.pricingRanges.length > 0) {
                          const applicableRange = part.pricingRanges.find((range: any) => 
                            eventData.attendees >= range.minAttendees && 
                            eventData.attendees <= range.maxAttendees
                          );
                          
                          // Si no hay rango exacto, buscar el rango más cercano
                          if (!applicableRange) {
                            const sortedRanges = [...part.pricingRanges].sort((a: any, b: any) => a.minAttendees - b.minAttendees);
                            const closestRange = sortedRanges.reverse().find((range: any) => 
                              eventData.attendees >= range.minAttendees
                            );
                            partPrice = closestRange ? closestRange.price : (sortedRanges[0]?.price || 0);
                          } else {
                            partPrice = applicableRange.price;
                          }
                        }
                        
                        const isPartyPart = part.name && (part.name.toLowerCase().includes('disco') || part.name.toLowerCase().includes('fiesta'));
                        if (isPartyPart && eventData.selectedPack) {
                          const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                          if (pack) {
                            partPrice = Number(pack.pricePerDay) + Number(pack.packData?.shippingCost || 0) + Number(pack.packData?.installationCost || 0);
                          }
                        }
                        
                        total += partPrice;
                      }
                    });
                  }
                  
                  if (eventData.selectedPack && !hasPartyPart) {
                    const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                    if (pack) {
                      total += Number(pack.pricePerDay) + Number(pack.packData?.shippingCost || 0) + Number(pack.packData?.installationCost || 0);
                    }
                  }
                  
                  Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
                    const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
                    if (product) {
                      total += (Number(product.pricePerDay) + Number(product.packData?.shippingCost || 0) + Number(product.packData?.installationCost || 0)) * quantity;
                    }
                  });
                  
                  const reservaAmount = total * 0.25;
                  const isEligibleForInstallments = total > 500;
                  
                  return (
                    <button
                      onClick={handleAddToCartAndCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex flex-col items-center justify-center gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {isEligibleForInstallments ? (
                          <span>💳 Reservar Ahora (25%)</span>
                        ) : (
                          <span>📋 Tramitar Reserva</span>
                        )}
                      </div>
                      {isEligibleForInstallments && (
                        <span className="text-sm font-normal">Solo pagas: €{reservaAmount.toFixed(2)}</span>
                      )}
                    </button>
                  );
                })()}
                
                {/* Divisor */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">o</span>
                  </div>
                </div>
                
                {/* Botón de contacto */}
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-resona hover:bg-resona-dark text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  ¿Tienes dudas? Deja tu contacto y te llamamos!
                </button>
                
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-all"
                >
                  ← Modificar Evento
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  step === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={
                  (step === 1 && !eventData.eventType)
                }
                className="flex items-center gap-2 px-6 py-3 bg-resona hover:bg-resona-dark text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {step === 5 ? 'Ver Resumen' : 'Siguiente'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>

        {/* Info Footer */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            ¿Tienes dudas? <a href="/contacto" className="text-resona hover:underline font-medium">Contáctanos</a> y 
            te ayudaremos a planificar tu evento perfecto.
          </p>
        </div>
      </div>

      {/* Modal de Contacto */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-fade-in">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Título */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¿Tienes dudas?
            </h3>
            <p className="text-gray-600 mb-6">
              Déjanos tus datos y te llamaremos para resolver todas tus preguntas
            </p>

            {/* Formulario */}
            <form onSubmit={(e) => { e.preventDefault(); handleContactRequest(); }} className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  placeholder="Tu nombre"
                  required
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  placeholder="+34 XXX XXX XXX"
                  required
                />
              </div>

              {/* Email (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-gray-400">(opcional)</span>
                </label>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              {/* Mensaje (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent resize-none"
                  rows={3}
                  placeholder="¿Alguna pregunta específica?"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-resona hover:bg-resona-dark text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl"
                >
                  Enviar
                </button>
              </div>
            </form>

            {/* Info adicional */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>📞 Te llamaremos en menos de 24h</strong><br/>
                Horario: Lunes a Viernes de 9:00 a 18:00
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Imagen para Móvil */}
      {imageModal?.show && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setImageModal(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">{imageModal.product.name}</h3>
              <button
                onClick={() => setImageModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Imagen */}
            <div className="p-4">
              <div className="w-full bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden" style={{ minHeight: '300px' }}>
                <img 
                  src={imageModal.product.imageUrl || imageModal.product.mainImageUrl} 
                  alt={imageModal.product.name}
                  className="max-w-full h-auto object-contain"
                  style={{ maxHeight: '60vh' }}
                />
              </div>
              
              {/* Descripción */}
              <div className="space-y-3">
                <p className="text-gray-600">{imageModal.product.description}</p>
                
                {/* Precio */}
                <div className="p-3 bg-resona/5 border border-resona/20 rounded-lg">
                  {(() => {
                    const basePrice = Number(imageModal.product.pricePerDay || imageModal.product.finalPrice || 0);
                    const shipping = Number((imageModal.product as any).shippingCost || 0);
                    const installation = Number((imageModal.product as any).installationCost || 0);
                    const totalPrice = basePrice + shipping + installation;
                    
                    return (
                      <>
                        <div className="text-2xl font-bold text-resona">
                          €{totalPrice.toFixed(2)}/día
                        </div>
                        {(shipping > 0 || installation > 0) && (
                          <p className="text-sm text-gray-600 mt-1">
                            Incluye transporte y montaje
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                {/* Rango de asistentes si existe */}
                {(() => {
                  const specs = (imageModal.product as any).specifications 
                    ? (typeof (imageModal.product as any).specifications === 'string' 
                        ? JSON.parse((imageModal.product as any).specifications) 
                        : (imageModal.product as any).specifications)
                    : null;
                  
                  if (specs && (specs.minAttendees || specs.maxAttendees)) {
                    return (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="w-5 h-5 text-resona" />
                        <span className="font-medium">
                          {specs.minAttendees && specs.maxAttendees 
                            ? `${specs.minAttendees}-${specs.maxAttendees} personas`
                            : specs.minAttendees 
                            ? `Mínimo ${specs.minAttendees} personas`
                            : `Máximo ${specs.maxAttendees} personas`
                          }
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalculatorPage;
