import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calculator, Users, Clock, Calendar, Package, Mail, Plus, Minus } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { serviceSchema } from '../utils/schemas';
import { DEFAULT_CALCULATOR_CONFIG, SERVICE_LEVEL_LABELS } from '../types/calculator.types';
import { productService } from '../services/product.service';

type ServiceLevel = 'none' | 'basic' | 'intermediate' | 'professional' | 'premium';

interface EventData {
  eventType: string;
  attendees: number;
  duration: number;
  durationType: 'hours' | 'days';
  eventDate: string;
  // Partes seleccionadas (IDs de las partes que el cliente quiere)
  selectedParts: string[];
  // Productos del catálogo seleccionados { productId: quantity }
  selectedProducts: Record<string, number>;
  soundLevel: ServiceLevel;
  lightingLevel: ServiceLevel;
  email?: string;
}

const EventCalculatorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>({
    eventType: '',
    attendees: 50,
    duration: 4,
    durationType: 'hours',
    eventDate: '',
    selectedParts: [],
    selectedProducts: {},
    soundLevel: 'none',
    lightingLevel: 'none',
  });

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

  // Precios base por categoría y nivel (por día)
  const basePrices = calculatorConfig.servicePrices;

  // Cargar productos del catálogo
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['catalog-products'],
    queryFn: async () => {
      const result = await productService.getProducts({ limit: 100 });
      return result || [];
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

  const serviceLevels = [
    { value: 'none', label: 'No necesito', multiplier: 0 },
    { value: 'basic', label: 'Básico', multiplier: 1 },
    { value: 'intermediate', label: 'Intermedio', multiplier: 1 },
    { value: 'professional', label: 'Profesional', multiplier: 1 },
    { value: 'premium', label: 'Premium', multiplier: 1 },
  ];

  // Función para recomendar nivel de servicio basado en asistentes
  const getRecommendedLevel = (attendees: number, serviceType: 'sound' | 'lighting'): ServiceLevel => {
    // Rangos de asistentes para recomendaciones
    if (attendees <= 50) return 'basic';
    if (attendees <= 100) return 'intermediate';
    if (attendees <= 200) return 'professional';
    return 'premium';
  };

  // Aplicar recomendaciones automáticamente cuando cambian los asistentes o se llega al paso 5
  useEffect(() => {
    if (step === 5 && eventData.attendees > 0) {
      // Solo aplicar si aún no se ha seleccionado nada
      if (eventData.soundLevel === 'none' && eventData.lightingLevel === 'none') {
        const recommendedSound = getRecommendedLevel(eventData.attendees, 'sound');
        const recommendedLighting = getRecommendedLevel(eventData.attendees, 'lighting');
        setEventData({
          ...eventData,
          soundLevel: recommendedSound,
          lightingLevel: recommendedLighting,
        });
      }
    }
  }, [step]);

  const calculateEstimate = () => {
    const selectedType = eventTypes.find(t => t.id === eventData.eventType);
    const multiplier = selectedType?.multiplier || 1.0;
    
    // Factor de asistentes (más personas = más equipo)
    const attendeeFactor = Math.log10(eventData.attendees / 10) + 1;
    
    // Factor de duración
    const durationInDays = eventData.durationType === 'hours' 
      ? eventData.duration / 8 
      : eventData.duration;

    let total = 0;
    const breakdown: { category: string; level: string; amount: number }[] = [];

    // Productos del catálogo
    Object.entries(eventData.selectedProducts).forEach(([productId, quantity]) => {
      const product = catalogProducts.find((p: any) => p._id === productId);
      if (product && quantity > 0) {
        const amount = Math.round(product.price * quantity * durationInDays);
        breakdown.push({
          category: product.name,
          level: `${quantity} unidad${quantity > 1 ? 'es' : ''}`,
          amount
        });
        total += amount;
      }
    });

    // Sonido (nivel general)
    if (eventData.soundLevel !== 'none') {
      const basePrice = basePrices.sound[eventData.soundLevel as keyof typeof basePrices.sound];
      const amount = Math.round(basePrice * multiplier * attendeeFactor * durationInDays);
      breakdown.push({ 
        category: '🎵 Sonido (Servicios adicionales)', 
        level: serviceLevels.find(l => l.value === eventData.soundLevel)?.label || '',
        amount 
      });
      total += amount;
    }

    // Iluminación (nivel general)
    if (eventData.lightingLevel !== 'none') {
      const basePrice = basePrices.lighting[eventData.lightingLevel as keyof typeof basePrices.lighting];
      const amount = Math.round(basePrice * multiplier * attendeeFactor * durationInDays);
      breakdown.push({ 
        category: '💡 Iluminación (Servicios adicionales)', 
        level: serviceLevels.find(l => l.value === eventData.lightingLevel)?.label || '',
        amount 
      });
      total += amount;
    }

    return { total, breakdown };
  };

  const selectedEventType = eventTypes.find(et => et.id === eventData.eventType);
  const hasParts = selectedEventType?.parts && selectedEventType.parts.length > 0;

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

  const handleRequestQuote = () => {
    // Aquí podrías enviar los datos a un endpoint
    navigate('/contacto', { 
      state: { 
        subject: 'Solicitud de Presupuesto',
        eventData 
      } 
    });
  };

  const estimate = step === 6 ? calculateEstimate() : null;

  // Determinar el total de pasos según si el evento tiene partes
  const totalSteps = hasParts ? 6 : 5;
  const stepLabels = hasParts
    ? ['Tipo', 'Detalles', 'Partes', 'Equipos', 'Resumen', 'Presupuesto']
    : ['Tipo', 'Detalles', 'Equipos', 'Resumen', 'Presupuesto'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
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

                {/* Duration */}
                <div>
                  <label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                    <Clock className="w-5 h-5 text-resona" />
                    Duración del Evento
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={eventData.duration}
                      onChange={(e) => setEventData({ ...eventData, duration: Number(e.target.value) })}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                      min="1"
                    />
                    <select
                      value={eventData.durationType}
                      onChange={(e) => setEventData({ ...eventData, durationType: e.target.value as 'hours' | 'days' })}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    >
                      <option value="hours">Horas</option>
                      <option value="days">Días</option>
                    </select>
                  </div>
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

          {/* Step 4: Equipment Selection */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Selecciona los equipos que necesitas
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Elige del catálogo profesional los componentes para tu {selectedEventType?.name.toLowerCase()}
              </p>
              
              {categories.map((category: any) => {
                const categoryProducts = catalogProducts.filter((p: any) => p.category === category.slug);
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={category.slug} className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryProducts.map((product: any) => {
                        const quantity = eventData.selectedProducts[product._id] || 0;
                        
                        return (
                          <div key={product._id} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-resona/50 transition-all">
                            <div className="flex gap-4">
                              {product.images && product.images.length > 0 && (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-lg font-bold text-resona">
                                    €{product.price}/día
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (quantity > 0) {
                                          const newProducts = { ...eventData.selectedProducts };
                                          if (quantity === 1) {
                                            delete newProducts[product._id];
                                          } else {
                                            newProducts[product._id] = quantity - 1;
                                          }
                                          setEventData({ ...eventData, selectedProducts: newProducts });
                                        }
                                      }}
                                      disabled={quantity === 0}
                                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 flex items-center justify-center transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{quantity}</span>
                                    <button
                                      onClick={() => {
                                        const newProducts = { ...eventData.selectedProducts };
                                        newProducts[product._id] = quantity + 1;
                                        setEventData({ ...eventData, selectedProducts: newProducts });
                                      }}
                                      className="w-8 h-8 rounded-full bg-resona hover:bg-resona-dark text-white flex items-center justify-center transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                {quantity > 0 && (
                                  <div className="mt-2 text-sm font-medium text-resona">
                                    Subtotal: €{(product.price * quantity).toFixed(2)}/día
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Selecciona solo lo que necesites. Puedes ajustar las cantidades en cualquier momento.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Service Levels */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                ¿Qué nivel de servicio necesitas?
              </h2>
              <p className="text-center text-gray-600 mb-2">
                Para {eventData.attendees} personas
              </p>
              <div className="text-center mb-6">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  ✨ Recomendado: {SERVICE_LEVEL_LABELS[getRecommendedLevel(eventData.attendees, 'sound')]}
                </span>
              </div>
              <div className="space-y-6">
                {[
                  { key: 'soundLevel', icon: '🎵', label: 'Sonido', desc: 'Micrófonos, altavoces, mesas de mezcla', type: 'sound' as const },
                  { key: 'lightingLevel', icon: '💡', label: 'Iluminación', desc: 'Focos, proyectores, luces LED', type: 'lighting' as const },
                ].map((item) => {
                  const recommended = getRecommendedLevel(eventData.attendees, item.type);
                  const currentValue = eventData[item.key as keyof EventData] as string;
                  
                  return (
                    <div key={item.key} className="p-6 rounded-lg border-2 border-gray-200 bg-white">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-lg">{item.label}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {serviceLevels.map((level) => {
                          const isRecommended = level.value === recommended;
                          const isSelected = currentValue === level.value;
                          const price = level.value !== 'none' 
                            ? basePrices[item.type][level.value as keyof typeof basePrices.sound]
                            : 0;
                          
                          return (
                            <button
                              key={level.value}
                              onClick={() => setEventData({ ...eventData, [item.key]: level.value })}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                isSelected
                                  ? 'border-resona bg-resona/10 shadow-md'
                                  : isRecommended
                                  ? 'border-green-400 bg-green-50 hover:border-green-500'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{level.label}</span>
                                    {isRecommended && (
                                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        Recomendado
                                      </span>
                                    )}
                                  </div>
                                  {price > 0 && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      Desde €{price}/día
                                    </div>
                                  )}
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Nota:</strong> Estas son nuestras recomendaciones para {eventData.attendees} personas, 
                  pero puedes seleccionar cualquier nivel según tus necesidades y presupuesto.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Estimate */}
          {step === 6 && estimate && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Tu Presupuesto Estimado
              </h2>
              
              {/* Summary */}
              <div className="bg-gradient-to-br from-resona to-resona-dark text-white rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-sm opacity-90 mb-2">Precio Estimado Total</div>
                  <div className="text-5xl font-bold">€{estimate.total}</div>
                  <div className="text-sm opacity-90 mt-2">
                    Para {eventData.attendees} personas · {eventData.duration} {eventData.durationType === 'hours' ? 'horas' : 'días'}
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              {estimate.breakdown.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4 text-gray-700">Desglose por Categoría:</h3>
                  <div className="space-y-3">
                    {estimate.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{item.category}</span>
                          <span className="text-sm text-gray-600 ml-2">({item.level})</span>
                        </div>
                        <span className="text-resona font-bold">€{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Este es un presupuesto estimado. El precio final puede variar según 
                  la disponibilidad de productos y necesidades específicas de tu evento.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleRequestQuote}
                  className="w-full bg-resona hover:bg-resona-dark text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Solicitar Presupuesto Detallado
                </button>
                <button
                  onClick={() => navigate('/productos')}
                  className="w-full bg-white hover:bg-gray-50 text-resona border-2 border-resona font-semibold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Ver Catálogo de Productos
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 5 && (
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
                  (step === 1 && !eventData.eventType) ||
                  (step === 5 && eventData.soundLevel === 'none' && eventData.lightingLevel === 'none')
                }
                className="flex items-center gap-2 px-6 py-3 bg-resona hover:bg-resona-dark text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="flex justify-center mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  setStep(1);
                  setEventData({
                    eventType: '',
                    attendees: 50,
                    duration: 4,
                    durationType: 'hours',
                    eventDate: '',
                    selectedParts: [],
                    selectedProducts: {},
                    soundLevel: 'none',
                    lightingLevel: 'none',
                  });
                }}
                className="text-gray-600 hover:text-resona font-medium transition-colors"
              >
                ← Hacer otro cálculo
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
