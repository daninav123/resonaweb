import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { ChevronLeft, ChevronRight, Calculator, Users, Clock, Calendar, Package, Mail, Plus, Minus, AlertTriangle, MapPin, CreditCard } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { serviceSchema } from '../utils/schemas';
import { DEFAULT_CALCULATOR_CONFIG } from '../types/calculator.types';
import { productService } from '../services/product.service';
import { validateEventData, type EventValidation } from '../utils/eventValidation';
import { guestCart } from '../utils/guestCart';
import { api } from '../services/api';


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

  // Cargar configuración desde el gestor de admin
  const [calculatorConfig, setCalculatorConfig] = useState(() => {
    const saved = localStorage.getItem('advancedCalculatorConfig');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_CALCULATOR_CONFIG;
      }
    }
    return DEFAULT_CALCULATOR_CONFIG;
  });

  const eventTypes = calculatorConfig.eventTypes.map((et: any) => ({
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
      // Cargar packs activos
      const packsResponse: any = await api.get('/packs');
      const packsData = packsResponse?.packs || packsResponse || [];
      console.log('📦 Packs cargados en calculadora pública:', packsData);
      
      // Mapear packs al formato esperado
      const mappedPacks = Array.isArray(packsData) ? packsData.map((pack: any) => ({
        id: pack.id,
        name: pack.name,
        slug: pack.slug,
        description: pack.description,
        mainImageUrl: pack.imageUrl,
        pricePerDay: Number(pack.finalPrice || pack.calculatedTotalPrice || 0),
        realStock: 999,
        category: { name: 'Packs' },
        isActive: pack.isActive !== false,
        isPack: true, // Marcar como pack
      })) : [];
      
      // Cargar productos normales
      const productsResult = await productService.getProducts({ limit: 100 });
      const productsData = productsResult?.data || [];
      console.log('📦 Productos cargados en calculadora:', productsData);
      
      // Combinar packs y productos
      const allItems = [...mappedPacks, ...productsData];
      console.log('📦 Total items en calculadora:', allItems.length, '(Packs:', mappedPacks.length, '+ Productos:', productsData.length, ')');
      return allItems;
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
              partPrice = applicableRange ? applicableRange.price : 0;
            }
            
            selectedPartsWithPrices.push({
              id: part.id,
              name: part.name,
              icon: part.icon,
              price: partPrice
            });
            partsTotal += partPrice;
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
        extrasTotal: extrasTotal
      };

      // 3. Añadir SOLO el pack al carrito con todo el metadata (partes + extras)
      if (eventData.selectedPack) {
        const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
        if (pack) {
          guestCart.addItem(pack, 1, eventMetadata);
          const basePrice = Number(pack.pricePerDay);
          const shipping = Number(pack.shippingCost || 0);
          const installation = Number(pack.installationCost || 0);
          totalCalculated += basePrice + shipping + installation + partsTotal;
          itemCount = 1; // Solo el pack como un item
        }
      }

      const days = eventData.durationType === 'hours' ? Math.ceil(eventData.duration / 8) : eventData.duration;
      const totalFinal = totalCalculated * days;

      // 5. Mostrar confirmación
      alert(
        `✅ Productos añadidos al carrito!\n\n` +
        `${itemCount} producto${itemCount > 1 ? 's' : ''} listos para checkout.\n` +
        `Total estimado: €${totalFinal.toFixed(2)}\n` +
        `(${days} día${days > 1 ? 's' : ''}, incluye transporte y montaje)\n\n` +
        `Te redirigiremos al carrito para completar tu pedido.`
      );

      // 6. Marcar que los productos ya incluyen transporte/montaje
      localStorage.setItem('cartIncludesShippingInstallation', 'true');
      localStorage.setItem('cartFromCalculator', 'true');

      // 7. Guardar fechas del evento para el carrito
      if (eventData.eventDate) {
        const eventDate = new Date(eventData.eventDate);
        const startDate = eventDate.toISOString().split('T')[0];
        
        // Calcular fecha de fin según duración
        const endDate = new Date(eventDate);
        const daysToAdd = eventData.durationType === 'hours' 
          ? Math.ceil(eventData.duration / 8) 
          : eventData.duration;
        endDate.setDate(endDate.getDate() + daysToAdd);
        
        localStorage.setItem('cartEventDates', JSON.stringify({
          start: startDate,
          end: endDate.toISOString().split('T')[0]
        }));
      }

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

      // 9. Redirigir al checkout
      navigate('/checkout');
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
      // Calcular total estimado (incluyendo transporte y montaje)
      let total = 0;
      if (eventData.selectedPack) {
        const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
        if (pack) {
          const basePrice = Number(pack.pricePerDay);
          const shipping = Number(pack.shippingCost || 0);
          const installation = Number(pack.installationCost || 0);
          total += basePrice + shipping + installation;
        }
      }
      Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
        const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
        if (product) {
          const basePrice = Number(product.pricePerDay);
          const shipping = Number(product.shippingCost || 0);
          const installation = Number(product.installationCost || 0);
          total += (basePrice + shipping + installation) * quantity;
        }
      });
      const days = eventData.durationType === 'hours' ? Math.ceil(eventData.duration / 8) : eventData.duration;
      const totalFinal = total * days;

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
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      
      // Enviar solicitud
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/quote-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
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
      }, 1000);
    }
  };

  // Determinar el total de pasos según si el evento tiene partes
  const totalSteps = hasParts ? 6 : 5;
  const stepLabels = hasParts
    ? ['Tipo', 'Detalles', 'Partes', 'Equipos', 'Extras', 'Resumen']
    : ['Tipo', 'Detalles', 'Equipos', 'Extras', 'Resumen'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead
        title="Calculadora de Presupuesto para Eventos Online | Resona Events"
        description="Calcula el presupuesto estimado para tu evento en minutos. Bodas, conciertos, conferencias, eventos corporativos. Presupuesto inmediato y sin compromiso. Herramienta gratuita."
        keywords="calculadora presupuesto eventos, calcular costo evento, presupuesto boda, presupuesto concierto, presupuesto evento corporativo, alquiler material eventos precio"
        canonicalUrl="https://resona.com/calculadora-evento"
        schema={serviceSchema}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-resona rounded-full mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Calculadora de Eventos
          </h1>
          <p className="text-gray-600">
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
                    Fecha del Evento (Opcional)
                  </label>
                  <input
                    type="date"
                    value={eventData.eventDate}
                    onChange={(e) => setEventData({ ...eventData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Event Location */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Mail className="w-5 h-5 text-resona" />
                    Lugar del Evento (Opcional)
                  </label>
                  <input
                    type="text"
                    value={eventData.eventLocation}
                    onChange={(e) => setEventData({ ...eventData, eventLocation: e.target.value })}
                    placeholder="Dirección completa del evento"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    💡 Si no especificas lugar y fecha, el presupuesto será válido solo para eventos a menos de 50km de Valencia y en fechas normales.
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
                          <div className="font-semibold text-gray-900 text-lg">{part.name}</div>
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
                
                // Solo en desarrollo si es necesario
                // console.log('📦 Packs configurados para', eventConfig?.name, ':', configuredPacks);
                // console.log('📊 Reglas de recomendación:', recommendedPacksRules);
                
                // Filtrar packs según la configuración del admin
                const availablePacks = catalogProducts.filter((p: any) => {
                  if (!p.isPack || !p.isActive) return false;
                  
                  // REGLA 1: El pack debe estar en la lista de packs disponibles para este tipo de evento
                  if (configuredPacks.length > 0 && !configuredPacks.includes(p.id)) {
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
                            
                            return (
                              <button
                                key={pack.id}
                                onClick={() => {
                                  // Solo permitir seleccionar UN pack
                                  setEventData({ 
                                    ...eventData, 
                                    selectedPack: isSelected ? null : pack.id 
                                  });
                                }}
                                className={`text-left bg-white rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
                                  isSelected
                                    ? 'border-resona bg-resona/5 shadow-md'
                                    : 'border-gray-200 hover:border-resona/50'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {pack.mainImageUrl && (
                                    <img 
                                      src={pack.mainImageUrl} 
                                      alt={pack.name}
                                      className="w-24 h-24 object-cover rounded-lg"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-bold text-gray-900 text-lg">{pack.name}</h4>
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
                                        const shipping = Number(pack.shippingCost || 0);
                                        const installation = Number(pack.installationCost || 0);
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
                
                // Solo en desarrollo si es necesario
                // console.log('✨ Extras configurados para', eventConfig?.name, ':', availableExtras);
                
                // Filtrar productos/packs extras
                const extrasProducts = catalogProducts.filter((p: any) => {
                  if (!p.isActive) return false;
                  
                  // Si hay extras configurados, mostrar SOLO esos (productos O packs)
                  if (availableExtras.length > 0) {
                    return availableExtras.includes(p.id);
                  }
                  
                  // Si no hay configuración, mostrar todos los productos (NO packs)
                  return !p.isPack;
                });
                
                // Solo en desarrollo si es necesario
                // console.log('📦 Extras encontrados:', extrasProducts.length, 'de', availableExtras.length, 'configurados');
                
                // Agrupar productos por categoría
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
                        {/* Título de la categoría */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b-2 border-resona">
                          <span className="bg-resona text-white px-3 py-1 rounded-lg text-sm">
                            {products.length}
                          </span>
                          <span>{categoryName}</span>
                        </h3>
                        
                        {/* Productos de la categoría */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {products.map((product: any) => {
                            const isSelected = !!eventData.selectedExtras[product.id];
                            const quantity = eventData.selectedExtras[product.id] || 0;
                            
                            return (
                              <div
                                key={product.id}
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
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Tipo de Evento</p>
                  <p className="font-semibold text-lg mt-1">{eventTypes.find(t => t.id === eventData.eventType)?.name}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Asistentes</p>
                    <p className="font-semibold text-lg mt-1">{eventData.attendees} personas</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Duración</p>
                    <p className="font-semibold text-lg mt-1">{eventData.duration} {eventData.durationType === 'hours' ? 'horas' : 'días'}</p>
                  </div>
                </div>
                
                {eventData.eventDate && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">Fecha del Evento</p>
                    <p className="font-semibold text-lg mt-1">{new Date(eventData.eventDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                
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
                      {eventData.selectedParts.map((partId) => {
                        const part = selectedEventType.parts.find((p: any) => p.id === partId);
                        if (!part) return null;
                        
                        // Calcular el precio de la parte según el número de invitados
                        let partPrice = 0;
                        if (part.pricingRanges && part.pricingRanges.length > 0) {
                          const applicableRange = part.pricingRanges.find((range: any) => 
                            eventData.attendees >= range.minAttendees && 
                            eventData.attendees <= range.maxAttendees
                          );
                          partPrice = applicableRange ? applicableRange.price : 0;
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
                        
                        return (
                          <div key={partId}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{part.icon} {part.name}</span>
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
                          {(Number(selectedPackData.shippingCost || 0) > 0 || Number(selectedPackData.installationCost || 0) > 0) && (
                            <p className="text-xs text-gray-500">Incluye transporte y montaje</p>
                          )}
                        </div>
                        <span className="font-bold text-resona">
                          €{(Number(selectedPackData.pricePerDay) + Number(selectedPackData.shippingCost || 0) + Number(selectedPackData.installationCost || 0)).toFixed(2)}/día
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
                            <span className="text-sm font-semibold text-gray-900">€{((Number(product.pricePerDay) + Number(product.shippingCost || 0) + Number(product.installationCost || 0)) * quantity).toFixed(2)}/día</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Precio Total */}
                {(() => {
                  let total = 0;
                  
                  // Añadir precio de las partes seleccionadas
                  if (eventData.selectedParts.length > 0 && selectedEventType) {
                    eventData.selectedParts.forEach((partId) => {
                      const part = selectedEventType.parts.find((p: any) => p.id === partId);
                      if (part && part.pricingRanges && part.pricingRanges.length > 0) {
                        const applicableRange = part.pricingRanges.find((range: any) => 
                          eventData.attendees >= range.minAttendees && 
                          eventData.attendees <= range.maxAttendees
                        );
                        if (applicableRange) {
                          total += applicableRange.price;
                        }
                      }
                    });
                  }
                  
                  // Añadir precio del pack (incluyendo transporte y montaje)
                  if (eventData.selectedPack) {
                    const pack = catalogProducts.find((p: any) => p.id === eventData.selectedPack || p._id === eventData.selectedPack);
                    if (pack) {
                      const basePrice = Number(pack.pricePerDay);
                      const shipping = Number(pack.shippingCost || 0);
                      const installation = Number(pack.installationCost || 0);
                      total += basePrice + shipping + installation;
                    }
                  }
                  
                  // Añadir precio de extras (incluyendo transporte y montaje)
                  Object.entries(eventData.selectedExtras).forEach(([productId, quantity]) => {
                    const product = catalogProducts.find((p: any) => p.id === productId || p._id === productId);
                    if (product) {
                      const basePrice = Number(product.pricePerDay);
                      const shipping = Number(product.shippingCost || 0);
                      const installation = Number(product.installationCost || 0);
                      total += (basePrice + shipping + installation) * quantity;
                    }
                  });
                  
                  // Calcular por días
                  const days = eventData.durationType === 'hours' ? Math.ceil(eventData.duration / 8) : eventData.duration;
                  const totalFinal = total * days;
                  
                  return total > 0 ? (
                    <div className="p-5 bg-green-50 rounded-lg border-2 border-green-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Subtotal por día:</span>
                        <span className="font-semibold text-gray-900">€{total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Duración:</span>
                        <span className="font-semibold text-gray-900">{days} día{days > 1 ? 's' : ''}</span>
                      </div>
                      <div className="pt-2 border-t-2 border-green-300 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                          <span className="text-2xl font-bold text-green-600">€{totalFinal.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        * IVA no incluido. Precio final puede variar según disponibilidad.
                      </p>
                    </div>
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
                {/* NUEVO: Añadir al Carrito y Checkout */}
                <button
                  onClick={handleAddToCartAndCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  🛒 Añadir al Carrito y Pagar
                </button>
                
                {/* Divisor */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">o</span>
                  </div>
                </div>
                
                {/* Existente: Solicitar Presupuesto */}
                <button
                  onClick={handleRequestQuote}
                  className="w-full bg-resona hover:bg-resona-dark text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Solicitar Presupuesto Personalizado
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="w-full bg-white hover:bg-gray-50 text-resona border-2 border-resona font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Ver Productos en el Catálogo
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
    </div>
  );
};

export default EventCalculatorPage;
