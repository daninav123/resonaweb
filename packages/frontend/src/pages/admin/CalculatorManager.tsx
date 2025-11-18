import { Link } from 'react-router-dom';
import { Calculator, Save, Plus, Trash2, ChevronDown, DollarSign, Music, Lightbulb, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { AdvancedCalculatorConfig, EventTypeConfig, EventPart, DEFAULT_CALCULATOR_CONFIG, SERVICE_LEVEL_LABELS } from '../../types/calculator.types';

interface EventType {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  parts?: EventPart[];
}

const CalculatorManager = () => {
  const [config, setConfig] = useState<AdvancedCalculatorConfig>(DEFAULT_CALCULATOR_CONFIG);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem('advancedCalculatorConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('advancedCalculatorConfig', JSON.stringify(config));
      toast.success('✅ Configuración guardada correctamente');
    } catch (error) {
      toast.error('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const togglePartExpanded = (partId: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  };

  const updateEventType = (index: number, field: keyof EventType, value: any) => {
    const newEventTypes = [...config.eventTypes];
    newEventTypes[index] = { ...newEventTypes[index], [field]: value };
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  const addEventType = () => {
    const newEventTypes: EventTypeConfig[] = [...config.eventTypes, {
      id: Date.now().toString(),
      name: 'Nuevo Evento',
      icon: '📅',
      multiplier: 1.0,
      parts: [], // Añadir propiedad parts requerida
    }];
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  const removeEventType = (index: number) => {
    const newEventTypes = config.eventTypes.filter((_, i) => i !== index);
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  const updateServicePrice = (service: 'sound' | 'lighting', level: keyof ServicePrices, value: number) => {
    setConfig({
      ...config,
      servicePrices: {
        ...config.servicePrices,
        [service]: {
          ...config.servicePrices[service],
          [level]: value,
        },
      },
    });
  };

  // Wedding parts functionality disabled - type not defined
  // const updateWeddingPart = (index: number, field: any, value: string) => {
  //   // Functionality disabled
  // };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-resona" />
                Gestor de Calculadora
              </h1>
              <p className="text-gray-600 mt-2">
                Configura precios, tipos de eventos y opciones de la calculadora
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-resona hover:bg-resona-dark text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {/* Event Types Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tipos de Eventos</h2>
              <button
                onClick={addEventType}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Añadir Tipo
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {config.eventTypes.map((eventType, index) => (
                <div key={eventType.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={eventType.icon}
                    onChange={(e) => updateEventType(index, 'icon', e.target.value)}
                    className="w-16 text-center text-2xl px-2 py-2 border border-gray-300 rounded-lg"
                    placeholder="🎉"
                  />
                  <input
                    type="text"
                    value={eventType.name}
                    onChange={(e) => updateEventType(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    placeholder="Nombre del evento"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Multiplicador:</label>
                    <input
                      type="number"
                      step="0.1"
                      value={eventType.multiplier}
                      onChange={(e) => updateEventType(index, 'multiplier', parseFloat(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => removeEventType(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Multiplicador:</strong> Un valor mayor aumenta el precio base para ese tipo de evento. 
                Por ejemplo, 1.5 significa +50% sobre el precio base.
              </p>
            </div>
          </div>
        </div>

        {/* Service Prices Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">Precios de Servicios (€/día)</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {/* Sound Prices */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music className="w-5 h-5 text-resona" />
                <h3 className="font-semibold text-gray-900">Sonido</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Básico</label>
                  <input
                    type="number"
                    value={config.servicePrices.sound.basic}
                    onChange={(e) => updateServicePrice('sound', 'basic', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intermedio</label>
                  <input
                    type="number"
                    value={config.servicePrices.sound.intermediate}
                    onChange={(e) => updateServicePrice('sound', 'intermediate', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profesional</label>
                  <input
                    type="number"
                    value={config.servicePrices.sound.professional}
                    onChange={(e) => updateServicePrice('sound', 'professional', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Premium</label>
                  <input
                    type="number"
                    value={config.servicePrices.sound.premium}
                    onChange={(e) => updateServicePrice('sound', 'premium', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Lighting Prices */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-resona" />
                <h3 className="font-semibold text-gray-900">Iluminación</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Básico</label>
                  <input
                    type="number"
                    value={config.servicePrices.lighting.basic}
                    onChange={(e) => updateServicePrice('lighting', 'basic', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intermedio</label>
                  <input
                    type="number"
                    value={config.servicePrices.lighting.intermediate}
                    onChange={(e) => updateServicePrice('lighting', 'intermediate', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profesional</label>
                  <input
                    type="number"
                    value={config.servicePrices.lighting.professional}
                    onChange={(e) => updateServicePrice('lighting', 'professional', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Premium</label>
                  <input
                    type="number"
                    value={config.servicePrices.lighting.premium}
                    onChange={(e) => updateServicePrice('lighting', 'premium', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wedding Parts Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">Partes de Boda</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-500 text-sm">Sección de partes de boda deshabilitada temporalmente.</p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Vista Previa de Precios</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Music className="w-4 h-4 text-resona" />
                Sonido
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Básico:</span>
                  <span className="font-semibold">€{config.servicePrices.sound.basic}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intermedio:</span>
                  <span className="font-semibold">€{config.servicePrices.sound.intermediate}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profesional:</span>
                  <span className="font-semibold">€{config.servicePrices.sound.professional}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-semibold">€{config.servicePrices.sound.premium}/día</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-resona" />
                Iluminación
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Básico:</span>
                  <span className="font-semibold">€{config.servicePrices.lighting.basic}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Intermedio:</span>
                  <span className="font-semibold">€{config.servicePrices.lighting.intermediate}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profesional:</span>
                  <span className="font-semibold">€{config.servicePrices.lighting.professional}/día</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-semibold">€{config.servicePrices.lighting.premium}/día</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button Bottom */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-resona hover:bg-resona-dark text-white px-8 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculatorManager;
