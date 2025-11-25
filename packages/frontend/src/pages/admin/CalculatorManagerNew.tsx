import { Link } from 'react-router-dom';
import { Calculator, Save, Plus, Trash2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCalculatorConfig } from '../../hooks/useCalculatorConfig';
import { SERVICE_LEVEL_LABELS, ServiceLevel } from '../../types/calculator.types';
import { productService } from '../../services/product.service';
import PackSelector from '../../components/admin/PackSelector';
import PackRecommendationEditor from '../../components/admin/PackRecommendationEditor';

const CalculatorManagerNew = () => {
  const {
    config,
    selectedEventIndex,
    setSelectedEventIndex,
    expandedParts,
    saving,
    handleSave,
    resetToDefault,
    togglePartExpanded,
    updateEventType,
    addEventType,
    removeEventType,
    addEventPart,
    updateEventPart,
    removeEventPart,
    updateServicePrice,
    selectedEvent,
  } = useCalculatorConfig();

  // Cargar productos (packs)
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['catalog-products-admin'],
    queryFn: async () => {
      const result = await productService.getProducts({ limit: 200 });
      // El servicio ahora devuelve { data: [...], pagination: {...} }
      return result?.data || [];
    },
  });

  // Validación y debug
  if (!selectedEvent) {
    console.error('❌ selectedEvent is undefined!');
    return <div>Error: No hay evento seleccionado</div>;
  }
  
  if (!selectedEvent.parts) {
    console.error('❌ selectedEvent.parts is undefined for', selectedEvent.name);
    selectedEvent.parts = [];
  }
  
  console.log('✅ RENDER OK - Evento:', selectedEvent.name, 'Partes:', selectedEvent.parts.length);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calculator className="w-8 h-8 text-resona" />
                Gestor Avanzado de Calculadora
              </h1>
              <p className="text-gray-600 mt-2">
                Configura cada tipo de evento y sus partes específicas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  console.log('=== DIAGNÓSTICO ===');
                  console.log('Total tipos de eventos:', config.eventTypes.length);
                  config.eventTypes.forEach((e, i) => {
                    console.log(`${i + 1}. ${e.icon} ${e.name} - ${e.parts.length} partes`);
                  });
                  console.log('Evento seleccionado:', selectedEvent?.name, '- Partes:', selectedEvent?.parts.length);
                  alert(`Total: ${config.eventTypes.length} tipos\nSeleccionado: ${selectedEvent?.name}\nPartes: ${selectedEvent?.parts.length}`);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                🔍 Debug
              </button>
              <button
                onClick={resetToDefault}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
                title="Restaurar configuración por defecto"
              >
                <RotateCcw className="w-5 h-5" />
                Resetear
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-resona hover:bg-resona-dark text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3 space-y-6">
            {/* Event Types */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Tipos de Eventos</h2>
                <button
                  onClick={addEventType}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                  title="Añadir tipo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <nav className="p-2">
                {config.eventTypes.map((eventType, index) => (
                  <div
                    key={eventType.id}
                    className={`w-full p-3 rounded-lg mb-1 transition-all flex items-center justify-between group cursor-pointer ${
                      selectedEventIndex === index ? 'bg-resona text-white' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      console.log('👆 Click en evento:', eventType.name, 'índice:', index);
                      setSelectedEventIndex(index);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl">{eventType.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{eventType.name}</div>
                        <div className={`text-xs ${selectedEventIndex === index ? 'text-white/70' : 'text-gray-500'}`}>
                          {eventType.parts.length} {eventType.parts.length === 1 ? 'parte' : 'partes'}
                        </div>
                      </div>
                    </div>
                    {selectedEventIndex === index && config.eventTypes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEventType(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-white hover:text-red-200 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {selectedEvent && (
              <div key={`event-${selectedEvent.id}-${selectedEventIndex}`} className="space-y-6">
                {/* Event Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mb-6 pb-4 border-b">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <span className="text-3xl">{selectedEvent.icon}</span>
                      Configuración: {selectedEvent.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">
                      ID: {selectedEvent.id} • Índice: {selectedEventIndex} • {selectedEvent.parts.length} partes definidas
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                      <input
                        type="text"
                        value={selectedEvent.icon}
                        onChange={(e) => updateEventType(selectedEventIndex, 'icon', e.target.value)}
                        className="w-full text-center text-3xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <input
                        type="text"
                        value={selectedEvent.name}
                        onChange={(e) => updateEventType(selectedEventIndex, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Multiplicador</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedEvent.multiplier}
                        onChange={(e) => updateEventType(selectedEventIndex, 'multiplier', parseFloat(e.target.value) || 1)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedEvent.multiplier > 1
                          ? `+${((selectedEvent.multiplier - 1) * 100).toFixed(0)}%`
                          : selectedEvent.multiplier < 1
                          ? `-${((1 - selectedEvent.multiplier) * 100).toFixed(0)}%`
                          : 'Sin cambio'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Parts List */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Partes del Evento 
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({selectedEvent.parts.length} {selectedEvent.parts.length === 1 ? 'parte' : 'partes'})
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Define las fases de este evento</p>
                    </div>
                    <button
                      onClick={() => addEventPart(selectedEventIndex)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir Parte
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {!selectedEvent.parts || selectedEvent.parts.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg mb-2">No hay partes definidas</p>
                        <p className="text-sm">Haz click en "Añadir Parte"</p>
                      </div>
                    ) : (
                      selectedEvent.parts.map((part, partIndex) => (
                        <div key={part.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Part Header */}
                          <div
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 flex-1" onClick={() => togglePartExpanded(part.id)}>
                              <span className="text-2xl">{part.icon}</span>
                              <div className="text-left">
                                <div className="font-semibold text-gray-900">{part.name}</div>
                                <div className="text-sm text-gray-500">
                                  {part.defaultDuration}h
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeEventPart(selectedEventIndex, partIndex);
                                }}
                                className="text-red-500 hover:text-red-700 p-2 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div onClick={() => togglePartExpanded(part.id)} className="cursor-pointer">
                                {expandedParts.has(part.id) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                              </div>
                            </div>
                          </div>

                          {/* Part Details */}
                          {expandedParts.has(part.id) && (
                            <div className="p-6 border-t bg-gray-50 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                                  <input
                                    type="text"
                                    value={part.icon}
                                    onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'icon', e.target.value)}
                                    className="w-full text-center text-2xl px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                  <input
                                    type="text"
                                    value={part.name}
                                    onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                                <textarea
                                  value={part.description}
                                  onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'description', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={part.defaultDuration}
                                  onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'defaultDuration', parseFloat(e.target.value) || 0)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Packs Configuration */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">📦</span>
                      Configuración de Packs
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Define qué packs están disponibles y cuáles recomendar según el número de asistentes
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Available Packs */}
                    <div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Packs Disponibles para este Evento
                        </label>
                        <p className="text-xs text-gray-500">
                          Solo estos packs se mostrarán en la calculadora para este tipo de evento
                        </p>
                      </div>
                      <PackSelector
                        allPacks={catalogProducts.filter((p: any) => p.isPack)}
                        selectedPacks={selectedEvent.availablePacks || []}
                        onChange={(packs) => updateEventType(selectedEventIndex, 'availablePacks', packs)}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-t pt-6">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reglas de Recomendación
                        </label>
                        <p className="text-xs text-gray-500">
                          Define qué packs recomendar según el número de asistentes. Las reglas con prioridad 1 se mostrarán primero.
                        </p>
                      </div>
                      <PackRecommendationEditor
                        rules={selectedEvent.recommendedPacks || []}
                        availablePacks={selectedEvent.availablePacks || []}
                        allPacks={catalogProducts.filter((p: any) => p.isPack)}
                        onChange={(rules) => updateEventType(selectedEventIndex, 'recommendedPacks', rules)}
                      />
                    </div>
                  </div>
                </div>

                {/* Extras Configuration */}
                <div className="bg-white rounded-lg shadow mt-6">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Configuración de Extras
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Define qué productos individuales están disponibles como extras para este tipo de evento
                    </p>
                  </div>

                  <div className="p-6">
                    <div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Extras Disponibles para este Evento
                        </label>
                        <p className="text-xs text-gray-500">
                          Solo estos productos se mostrarán como extras en la calculadora para este tipo de evento
                        </p>
                      </div>
                      <PackSelector
                        allPacks={catalogProducts.filter((p: any) => !p.isPack && p.isActive)}
                        selectedPacks={selectedEvent.availableExtras || []}
                        onChange={(extras) => updateEventType(selectedEventIndex, 'availableExtras', extras)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorManagerNew;
