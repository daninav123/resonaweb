import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Calculator, Save, Plus, Trash2, ChevronDown, ChevronUp, RotateCcw, Info, List, Package, Sparkles, DollarSign, Eye, EyeOff, Layers, Edit2, GripVertical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useCalculatorConfig } from '../../hooks/useCalculatorConfig';
import { SERVICE_LEVEL_LABELS, ServiceLevel } from '../../types/calculator.types';
import { productService } from '../../services/product.service';
import { api } from '../../services/api';
import PackSelector from '../../components/admin/PackSelector';
import PackRecommendationEditor from '../../components/admin/PackRecommendationEditor';
import PartPricingEditor from '../../components/admin/PartPricingEditor';

// Helper para construir URLs completas de imágenes
const getFullImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const apiPath = baseUrl.replace('/api/v1', '');
  return `${apiPath}${imagePath}`;
};

const POPULAR_ICONS = [
  '🎵', '✨', '🎨', '💡', '🏗️', '📺', '📦',
  '🎭', '🎪', '🎬', '🎤', '🎧', '🎸', '🎹',
  '🎺', '🎻', '🥁', '🎙️', '🎚️', '🎛️', '📷',
  '📹', '💐', '🌸', '🌺', '🌻', '🌹', '🎀',
  '🎈', '🎉', '🎊', '🕯️', '💫', '⭐', '🌟',
];

const AVAILABLE_COLORS = [
  { name: 'Púrpura', value: 'purple', class: 'bg-purple-500' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-500' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500' },
  { name: 'Amarillo', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Gris', value: 'gray', class: 'bg-gray-500' },
  { name: 'Índigo', value: 'indigo', class: 'bg-indigo-500' },
  { name: 'Verde', value: 'green', class: 'bg-green-500' },
  { name: 'Rojo', value: 'red', class: 'bg-red-500' },
  { name: 'Naranja', value: 'orange', class: 'bg-orange-500' },
  { name: 'Cian', value: 'cyan', class: 'bg-cyan-500' },
];

const CalculatorManagerNew = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showIconPicker, setShowIconPicker] = useState<number | null>(null);
  
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

  // Cargar montajes y productos para la calculadora
  const { data: catalogProducts = [] } = useQuery({
    queryKey: ['calculator-montajes-and-products-admin'],
    queryFn: async () => {
      // Cargar todos los packs INCLUYENDO MONTAJES (necesario para admin)
      const packsResponse: any = await api.get('/packs?includeInactive=true&includeMontajes=true');
      const packsData = packsResponse?.packs || packsResponse || [];
      console.log('📦 Packs cargados en calculadora:', packsData);
      
      // Filtrar SOLO montajes (packs con categoría "Montaje")
      const montajesData = Array.isArray(packsData) 
        ? packsData.filter((pack: any) => {
            const categoryName = pack.categoryRef?.name?.toLowerCase() || pack.category?.toLowerCase() || '';
            return categoryName === 'montaje';
          })
        : [];
      
      console.log('🚚 Montajes filtrados para calculadora:', montajesData.length);
      
      // Mapear montajes al formato esperado
      const mappedMontajes = montajesData.map((pack: any) => {
        const imageUrl = getFullImageUrl(pack.imageUrl || pack.mainImageUrl);
        console.log(`📷 Montaje "${pack.name}":`, {
          imageUrl_original: pack.imageUrl,
          mainImageUrl_original: pack.mainImageUrl,
          imageUrl_final: imageUrl
        });
        
        return {
          id: pack.id,
          name: pack.name,
          slug: pack.slug,
          description: pack.description,
          mainImageUrl: imageUrl,
          pricePerDay: Number(pack.pricePerDay || pack.finalPrice || pack.calculatedTotalPrice || 0),
          realStock: 999,
          category: { name: 'MONTAJE' },
          isActive: pack.isActive !== false,
          isPack: true, // Mantener como pack para compatibilidad
          isMontaje: true, // Flag para identificar montajes
          packData: pack, // Datos completos del montaje
        };
      });
      
      // Cargar productos normales
      const productsResult = await productService.getProducts({ limit: 200 });
      const productsData = productsResult?.data || [];
      console.log('📦 Productos cargados en calculadora:', productsData);
      
      // Combinar montajes y productos
      const allItems = [...mappedMontajes, ...productsData];
      console.log('📦 Total items:', allItems.length, '(Montajes:', mappedMontajes.length, '+ Productos:', productsData.length, ')');
      return allItems;
    },
  });

  // Funciones para manejar categorías de extras
  const addExtraCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      name: 'Nueva Categoría',
      icon: '📦',
      color: 'purple',
      order: (selectedEvent.extraCategories?.length || 0) + 1,
      extrasIds: [] // IDs de los extras asignados a esta categoría
    };
    
    const updatedCategories = [...(selectedEvent.extraCategories || []), newCategory];
    updateEventType(selectedEventIndex, 'extraCategories', updatedCategories);
  };

  const updateExtraCategory = (categoryIndex: number, field: string, value: any) => {
    const updatedCategories = [...(selectedEvent.extraCategories || [])];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      [field]: value
    };
    updateEventType(selectedEventIndex, 'extraCategories', updatedCategories);
  };

  const removeExtraCategory = (categoryIndex: number) => {
    const updatedCategories = selectedEvent.extraCategories?.filter((_, i) => i !== categoryIndex) || [];
    updateEventType(selectedEventIndex, 'extraCategories', updatedCategories);
  };

  const toggleExtraInCategory = (categoryIndex: number, extraId: string) => {
    const updatedCategories = [...(selectedEvent.extraCategories || [])];
    const category = updatedCategories[categoryIndex];
    
    // Inicializar extrasIds si no existe
    if (!category.extrasIds) {
      category.extrasIds = [];
    }
    
    if (category.extrasIds.includes(extraId)) {
      // Remover
      category.extrasIds = category.extrasIds.filter((id: string) => id !== extraId);
    } else {
      // Agregar
      category.extrasIds = [...category.extrasIds, extraId];
    }
    
    // Actualizar categorías
    updateEventType(selectedEventIndex, 'extraCategories', updatedCategories);
  };

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
                    } ${eventType.isActive === false ? 'opacity-50' : ''}`}
                    onClick={() => {
                      console.log('👆 Click en evento:', eventType.name, 'índice:', index);
                      setSelectedEventIndex(index);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl">{eventType.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center gap-2">
                          {eventType.name}
                          {eventType.isActive === false && (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              selectedEventIndex === index ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                            }`}>
                              Oculto
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${selectedEventIndex === index ? 'text-white/70' : 'text-gray-500'}`}>
                          {eventType.parts.length} {eventType.parts.length === 1 ? 'parte' : 'partes'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateEventType(index, 'isActive', eventType.isActive === false);
                        }}
                        className={`p-1 rounded hover:bg-white/20 ${
                          selectedEventIndex === index ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={eventType.isActive === false ? 'Mostrar en calculadora' : 'Ocultar de calculadora'}
                      >
                        {eventType.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
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
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span className="text-3xl">{selectedEvent.icon}</span>
                    {selectedEvent.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedEvent.parts.length} partes • {selectedEvent.availablePacks?.length || 0} montajes • {selectedEvent.availableExtras?.length || 0} extras
                  </p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow sticky top-4 z-10">
                  <nav className="flex border-b border-gray-200 overflow-x-auto">
                    <button onClick={() => setActiveTab('general')} className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-resona text-resona bg-resona/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Info className="w-4 h-4" />General
                    </button>
                    <button onClick={() => setActiveTab('parts')} className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'parts' ? 'border-resona text-resona bg-resona/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <List className="w-4 h-4" />Partes ({selectedEvent.parts.length})
                    </button>
                    <button onClick={() => setActiveTab('packs')} className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'packs' ? 'border-resona text-resona bg-resona/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Package className="w-4 h-4" />Montajes ({selectedEvent.availablePacks?.length || 0})
                    </button>
                    <button onClick={() => setActiveTab('extras')} className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'extras' ? 'border-resona text-resona bg-resona/5' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      <Sparkles className="w-4 h-4" />Extras ({selectedEvent.availableExtras?.length || 0})
                    </button>
                  </nav>
                </div>

                {/* General Tab */}
                <div className={activeTab !== 'general' ? 'hidden' : ''}>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icono/Emoji</label>
                        <input type="text" value={selectedEvent.icon} onChange={(e) => updateEventType(selectedEventIndex, 'icon', e.target.value)} className="w-full text-center text-3xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona" />
                        <p className="text-xs text-gray-500 mt-1 text-center">Win + . o Cmd + Ctrl + Space</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Evento</label>
                        <input type="text" value={selectedEvent.name} onChange={(e) => updateEventType(selectedEventIndex, 'name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona" placeholder="Ej: Boda, Cumpleaños..." />
                      </div>
                    </div>
                    
                    {/* Visibilidad */}
                    <div className="border-t pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedEvent.isActive !== false}
                          onChange={(e) => updateEventType(selectedEventIndex, 'isActive', e.target.checked)}
                          className="w-5 h-5 text-resona border-gray-300 rounded focus:ring-resona focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 group-hover:text-resona">
                            Mostrar en calculadora pública
                          </div>
                          <p className="text-sm text-gray-500">
                            {selectedEvent.isActive === false 
                              ? '🔴 Este tipo de evento está oculto y no aparecerá en la calculadora' 
                              : '✅ Este tipo de evento es visible en la calculadora'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Parts Tab */}
                <div className={activeTab !== 'parts' ? 'hidden' : ''}>
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

                              {/* Configuración de Precio y Materiales */}
                              <div className="border-t pt-4 mt-4">
                                <PartPricingEditor
                                  part={part}
                                  allProducts={catalogProducts}
                                  onChange={(updatedPart) => {
                                    const newParts = [...selectedEvent.parts];
                                    newParts[partIndex] = updatedPart;
                                    updateEventType(selectedEventIndex, 'parts', newParts);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                </div>

                {/* Packs Tab */}
                <div className={activeTab !== 'packs' ? 'hidden' : ''}>
                {/* Packs Configuration */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">🚚</span>
                      Configuración de Montajes
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Define qué montajes están disponibles y cuáles recomendar según el número de asistentes
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Available Packs */}
                    <div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Montajes Disponibles para este Evento
                        </label>
                        <p className="text-xs text-gray-500">
                          Selecciona montajes individuales. Usa el filtro de categorías para encontrarlos más fácilmente.
                        </p>
                      </div>
                      <PackSelector
                        allPacks={catalogProducts.filter((p: any) => p.isPack && p.isMontaje)}
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
                          Define qué montajes recomendar según el número de asistentes. Las reglas con prioridad 1 se mostrarán primero.
                        </p>
                      </div>
                      <PackRecommendationEditor
                        rules={selectedEvent.recommendedPacks || []}
                        availablePacks={selectedEvent.availablePacks || []}
                        allPacks={catalogProducts.filter((p: any) => p.isPack && p.isMontaje)}
                        eventParts={selectedEvent.parts || []}
                        onChange={(rules) => updateEventType(selectedEventIndex, 'recommendedPacks', rules)}
                      />
                    </div>
                  </div>
                </div>
                </div>

                {/* Extras Tab */}
                <div className={activeTab !== 'extras' ? 'hidden' : ''}>
                {/* Extras Configuration */}
                <div className="bg-white rounded-lg shadow mt-6">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-2xl">✨</span>
                      Configuración de Extras
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Organiza tus extras en categorías y asígnalos a cada una
                    </p>
                  </div>

                  <div className="p-6">
                    {/* Organización por Categorías - PRIMERO */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600" />
                            Organizar Extras por Categorías
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Crea categorías para organizar los extras en pestañas en la calculadora
                          </p>
                        </div>
                        <button
                          onClick={addExtraCategory}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Agregar Categoría
                        </button>
                      </div>

                      {/* Lista de categorías */}
                      {selectedEvent.extraCategories && selectedEvent.extraCategories.length > 0 ? (
                        <div className="space-y-4">
                          {selectedEvent.extraCategories.map((category: any, catIndex: number) => {
                            // Obtener TODOS los montajes disponibles
                            const allMontajes = catalogProducts.filter((p: any) => p.isPack && p.isMontaje);
                            
                            // Separar asignados vs no asignados
                            const assignedExtras = allMontajes.filter((extra: any) => 
                              category.extrasIds?.includes(extra.id) || false
                            );
                            const unassignedExtras = allMontajes.filter((extra: any) => 
                              !category.extrasIds?.includes(extra.id)
                            );

                            return (
                              <div key={category.id} className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                                {/* Header de categoría */}
                                <div className="flex items-start gap-4 mb-4">
                                  <button
                                    className="text-4xl hover:scale-110 transition-transform cursor-pointer"
                                    onClick={() => setShowIconPicker(showIconPicker === catIndex ? null : catIndex)}
                                  >
                                    {category.icon}
                                  </button>

                                  <div className="flex-1 space-y-3">
                                    <input
                                      type="text"
                                      value={category.name}
                                      onChange={(e) => updateExtraCategory(catIndex, 'name', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                      placeholder="Nombre de la categoría"
                                    />

                                    <div className="flex items-center gap-3">
                                      <label className="text-sm font-medium text-gray-700">Color:</label>
                                      <div className="flex gap-2">
                                        {AVAILABLE_COLORS.slice(0, 6).map(color => (
                                          <button
                                            key={color.value}
                                            onClick={() => updateExtraCategory(catIndex, 'color', color.value)}
                                            className={`w-8 h-8 rounded ${color.class} ${
                                              category.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                                            }`}
                                            title={color.name}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => removeExtraCategory(catIndex)}
                                    className="text-red-600 hover:text-red-700 p-2"
                                    title="Eliminar categoría"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>

                                {/* Icon picker */}
                                {showIconPicker === catIndex && (
                                  <div className="mb-4 p-3 border rounded-lg bg-white grid grid-cols-12 gap-2 max-h-32 overflow-y-auto">
                                    {POPULAR_ICONS.map(icon => (
                                      <button
                                        key={icon}
                                        onClick={() => {
                                          updateExtraCategory(catIndex, 'icon', icon);
                                          setShowIconPicker(null);
                                        }}
                                        className="text-2xl hover:scale-125 transition-transform"
                                      >
                                        {icon}
                                      </button>
                                    ))}
                                  </div>
                                )}

                                {/* Lista de montajes disponibles */}
                                <div>
                                  <div className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                                    <span>Montajes en esta categoría ({assignedExtras.length}/{allMontajes.length})</span>
                                    {allMontajes.length > 10 && (
                                      <input
                                        type="text"
                                        placeholder="Buscar montaje..."
                                        className="px-2 py-1 text-xs border rounded"
                                        onChange={(e) => {
                                          // TODO: Implementar filtro de búsqueda si es necesario
                                        }}
                                      />
                                    )}
                                  </div>
                                  
                                  {allMontajes.length > 0 ? (
                                    <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                      <div className="divide-y divide-gray-200">
                                        {allMontajes.map((extra: any) => {
                                          const isAssigned = category.extrasIds?.includes(extra.id) || false;
                                          return (
                                            <label
                                              key={extra.id}
                                              className={`flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                isAssigned ? 'bg-purple-50' : ''
                                              }`}
                                            >
                                              <input
                                                type="checkbox"
                                                checked={isAssigned}
                                                onChange={() => toggleExtraInCategory(catIndex, extra.id)}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                              />
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-medium text-gray-900">{extra.name}</span>
                                                  <span className="text-xs text-gray-500">
                                                    €{Number(extra.pricePerDay || 0).toFixed(2)}/día
                                                  </span>
                                                </div>
                                                {extra.description && (
                                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {extra.description}
                                                  </p>
                                                )}
                                              </div>
                                              {extra.mainImageUrl && (
                                                <img
                                                  src={extra.mainImageUrl}
                                                  alt={extra.name}
                                                  className="w-12 h-12 object-cover rounded"
                                                />
                                              )}
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg bg-white">
                                      <p className="text-sm">
                                        No hay montajes disponibles. Crea montajes en la sección "Montajes" primero.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">
                            No hay categorías. Haz clic en "Agregar Categoría" para empezar.
                          </p>
                        </div>
                      )}
                    </div>
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
