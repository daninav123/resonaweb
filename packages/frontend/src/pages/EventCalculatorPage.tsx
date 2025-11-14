import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Users, Calendar, Clock, Package, ChevronRight, ChevronLeft, Mail } from 'lucide-react';
import SEOHead from '../components/SEO/SEOHead';
import { serviceSchema } from '../utils/schemas';

interface EventData {
  eventType: string;
  attendees: number;
  duration: number;
  durationType: 'hours' | 'days';
  eventDate: string;
  needsSound: boolean;
  needsLighting: boolean;
  needsPhoto: boolean;
  needsFurniture: boolean;
  needsDecor: boolean;
  email?: string;
}

const EventCalculatorPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [eventData, setEventData] = useState<EventData>({
    eventType: '',
    attendees: 50,
    duration: 1,
    durationType: 'days',
    eventDate: '',
    needsSound: false,
    needsLighting: false,
    needsPhoto: false,
    needsFurniture: false,
    needsDecor: false,
  });

  const eventTypes = [
    { id: 'boda', name: 'Boda', icon: '💒', multiplier: 1.5 },
    { id: 'conferencia', name: 'Conferencia', icon: '🎤', multiplier: 1.2 },
    { id: 'concierto', name: 'Concierto', icon: '🎵', multiplier: 1.8 },
    { id: 'fiesta', name: 'Fiesta Privada', icon: '🎉', multiplier: 1.0 },
    { id: 'corporativo', name: 'Evento Corporativo', icon: '💼', multiplier: 1.3 },
    { id: 'otro', name: 'Otro', icon: '📅', multiplier: 1.0 },
  ];

  // Precios base por categoría (por día)
  const basePrices = {
    sound: 150,      // Sonido
    lighting: 120,   // Iluminación
    photo: 200,      // Fotografía/Video
    furniture: 80,   // Mobiliario
    decor: 100,      // Decoración
  };

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
    const breakdown: { category: string; amount: number }[] = [];

    if (eventData.needsSound) {
      const amount = Math.round(basePrices.sound * multiplier * attendeeFactor * durationInDays);
      breakdown.push({ category: '🎵 Sonido', amount });
      total += amount;
    }
    if (eventData.needsLighting) {
      const amount = Math.round(basePrices.lighting * multiplier * attendeeFactor * durationInDays);
      breakdown.push({ category: '💡 Iluminación', amount });
      total += amount;
    }
    if (eventData.needsPhoto) {
      const amount = Math.round(basePrices.photo * multiplier * durationInDays);
      breakdown.push({ category: '📷 Fotografía/Video', amount });
      total += amount;
    }
    if (eventData.needsFurniture) {
      const amount = Math.round(basePrices.furniture * attendeeFactor * durationInDays);
      breakdown.push({ category: '🪑 Mobiliario', amount });
      total += amount;
    }
    if (eventData.needsDecor) {
      const amount = Math.round(basePrices.decor * multiplier * durationInDays);
      breakdown.push({ category: '✨ Decoración', amount });
      total += amount;
    }

    return { total, breakdown };
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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

  const estimate = step === 4 ? calculateEstimate() : null;

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
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  s <= step ? 'bg-resona' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span className={step >= 1 ? 'text-resona font-medium' : ''}>Tipo de Evento</span>
            <span className={step >= 2 ? 'text-resona font-medium' : ''}>Detalles</span>
            <span className={step >= 3 ? 'text-resona font-medium' : ''}>Necesidades</span>
            <span className={step >= 4 ? 'text-resona font-medium' : ''}>Presupuesto</span>
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

          {/* Step 3: Needs */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6 text-center">
                ¿Qué necesitas para tu evento?
              </h2>
              <div className="space-y-4">
                {[
                  { key: 'needsSound', icon: '🎵', label: 'Sonido', desc: 'Micrófonos, altavoces, mesas de mezcla' },
                  { key: 'needsLighting', icon: '💡', label: 'Iluminación', desc: 'Focos, proyectores, luces LED' },
                  { key: 'needsPhoto', icon: '📷', label: 'Fotografía/Video', desc: 'Cámaras, objetivos, equipos de grabación' },
                  { key: 'needsFurniture', icon: '🪑', label: 'Mobiliario', desc: 'Mesas, sillas, carpas' },
                  { key: 'needsDecor', icon: '✨', label: 'Decoración', desc: 'Elementos decorativos para tu evento' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setEventData({ ...eventData, [item.key]: !eventData[item.key as keyof EventData] })}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      eventData[item.key as keyof EventData]
                        ? 'border-resona bg-resona/5'
                        : 'border-gray-200 hover:border-resona/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.label}</div>
                        <div className="text-sm text-gray-600">{item.desc}</div>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        eventData[item.key as keyof EventData]
                          ? 'border-resona bg-resona'
                          : 'border-gray-300'
                      }`}>
                        {eventData[item.key as keyof EventData] && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Estimate */}
          {step === 4 && estimate && (
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
                        <span className="font-medium">{item.category}</span>
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
          {step < 4 && (
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
                  (step === 3 && !eventData.needsSound && !eventData.needsLighting && 
                   !eventData.needsPhoto && !eventData.needsFurniture && !eventData.needsDecor)
                }
                className="flex items-center gap-2 px-6 py-3 bg-resona hover:bg-resona-dark text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex justify-center mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  setStep(1);
                  setEventData({
                    eventType: '',
                    attendees: 50,
                    duration: 1,
                    durationType: 'days',
                    eventDate: '',
                    needsSound: false,
                    needsLighting: false,
                    needsPhoto: false,
                    needsFurniture: false,
                    needsDecor: false,
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
