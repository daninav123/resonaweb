import { Link } from 'react-router-dom';
import { Calculator, Save, Plus, Trash2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useCalculatorConfig } from '../../hooks/useCalculatorConfig';
import { SERVICE_LEVEL_LABELS, ServiceLevel } from '../../types/calculator.types';

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

            {/* Prices */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Precios (€/día)</h3>
              <div className="space-y-4">
                {/* Sound */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">🎵 Sonido</h4>
                  <div className="space-y-2 text-xs">
                    {(['basic', 'intermediate', 'professional', 'premium'] as const).map((level) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-gray-600">{SERVICE_LEVEL_LABELS[level]}:</span>
                        <div className="flex items-center gap-1">
                          <span>€</span>
                          <input
                            type="number"
                            value={config.servicePrices.sound[level]}
                            onChange={(e) => updateServicePrice('sound', level, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-resona"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Lighting */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Iluminación</h4>
                  <div className="space-y-2 text-xs">
                    {(['basic', 'intermediate', 'professional', 'premium'] as const).map((level) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-gray-600">{SERVICE_LEVEL_LABELS[level]}:</span>
                        <div className="flex items-center gap-1">
                          <span>€</span>
                          <input
                            type="number"
                            value={config.servicePrices.lighting[level]}
                            onChange={(e) => updateServicePrice('lighting', level, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-resona"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                                  {part.defaultDuration}h • Sonido: {SERVICE_LEVEL_LABELS[part.soundLevel]} • Ilum: {SERVICE_LEVEL_LABELS[part.lightingLevel]}
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
                              <div className="grid grid-cols-3 gap-4">
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
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Sonido</label>
                                  <select
                                    value={part.soundLevel}
                                    onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'soundLevel', e.target.value as ServiceLevel)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                  >
                                    {Object.entries(SERVICE_LEVEL_LABELS).map(([value, label]) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">Nivel Iluminación</label>
                                  <select
                                    value={part.lightingLevel}
                                    onChange={(e) => updateEventPart(selectedEventIndex, partIndex, 'lightingLevel', e.target.value as ServiceLevel)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                                  >
                                    {Object.entries(SERVICE_LEVEL_LABELS).map(([value, label]) => (
                                      <option key={value} value={value}>{label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
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
