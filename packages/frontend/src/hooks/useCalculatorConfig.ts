import { useState, useEffect } from 'react';
import { 
  AdvancedCalculatorConfig, 
  EventTypeConfig, 
  EventPart, 
  ServicePrices,
  DEFAULT_CALCULATOR_CONFIG 
} from '../types/calculator.types';
import toast from 'react-hot-toast';
import { api } from '../services/api';

export const useCalculatorConfig = () => {
  const [config, setConfig] = useState<AdvancedCalculatorConfig>(DEFAULT_CALCULATOR_CONFIG);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Primero intentar cargar desde BD
    const loadConfigFromBD = async () => {
      try {
        const response = await api.get('/calculator-config') as AdvancedCalculatorConfig;
        if (response && response.eventTypes) {
          console.log('✅ Configuración cargada desde BD');
          
          // Inicializar extraCategories para eventos que no las tengan
          const processedConfig: AdvancedCalculatorConfig = {
            ...response,
            eventTypes: response.eventTypes.map((event: EventTypeConfig) => {
              if (!event.extraCategories || event.extraCategories.length === 0) {
                console.log(`✅ Inicializando extraCategories vacías para ${event.name}`);
                return { ...event, extraCategories: [] };
              }
              return event;
            })
          };
          
          setConfig(processedConfig);
          return;
        }
      } catch (error) {
        console.log('⚠️ No hay configuración en BD, usando localStorage o default');
      }

      // Si no hay en BD, intentar cargar desde localStorage
      const savedConfig = localStorage.getItem('advancedCalculatorConfig');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
        
        // 1. Merge eventos guardados: Si no tienen partes, usar las del default
        const mergedEventTypes = parsed.eventTypes.map((savedEvent: EventTypeConfig) => {
          const defaultEvent = DEFAULT_CALCULATOR_CONFIG.eventTypes.find(e => e.id === savedEvent.id);
          
          const updates: Partial<EventTypeConfig> = {};
          
          // Restaurar partes si están vacías
          if ((!savedEvent.parts || savedEvent.parts.length === 0) && defaultEvent && defaultEvent.parts.length > 0) {
            console.log(`✅ Restaurando partes para ${savedEvent.name}`);
            updates.parts = defaultEvent.parts;
          }
          
          // Inicializar extraCategories vacías si no existen
          if (!savedEvent.extraCategories || savedEvent.extraCategories.length === 0) {
            console.log(`✅ Inicializando extraCategories vacías para ${savedEvent.name}`);
            updates.extraCategories = [];
          }
          
          return {
            ...savedEvent,
            ...updates,
          };
        });
        
        // 2. Añadir eventos nuevos del default que no estén guardados
        const savedEventIds = new Set(parsed.eventTypes.map((e: EventTypeConfig) => e.id));
        const newEventsFromDefault = DEFAULT_CALCULATOR_CONFIG.eventTypes.filter(
          defaultEvent => !savedEventIds.has(defaultEvent.id)
        ).map(event => ({
          ...event,
          extraCategories: event.extraCategories || [] // Inicializar extraCategories vacías
        }));
        
        if (newEventsFromDefault.length > 0) {
          console.log(`✅ Añadiendo ${newEventsFromDefault.length} eventos nuevos:`, newEventsFromDefault.map(e => e.name));
          mergedEventTypes.push(...newEventsFromDefault);
        }
        
        setConfig({
          ...parsed,
          eventTypes: mergedEventTypes,
        });
        
        // Auto-guardar si hubo cambios
        if (newEventsFromDefault.length > 0 || mergedEventTypes.some((e, i) => e !== parsed.eventTypes[i])) {
          setTimeout(() => {
            localStorage.setItem('advancedCalculatorConfig', JSON.stringify({
              ...parsed,
              eventTypes: mergedEventTypes,
            }));
          }, 100);
        }
        } catch (error) {
          console.error('Error loading config:', error);
          toast.error('Error al cargar configuración, usando valores por defecto');
          setConfig(DEFAULT_CALCULATOR_CONFIG);
        }
      }
    };

    loadConfigFromBD();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sincronizar availableExtras con extraCategories antes de guardar
      const syncedConfig = {
        ...config,
        eventTypes: config.eventTypes.map(eventType => {
          // Si tiene categorías de extras, recopilar todos los IDs
          if (eventType.extraCategories && eventType.extraCategories.length > 0) {
            const allExtrasIds = new Set<string>();
            
            // Recopilar IDs de todas las categorías
            eventType.extraCategories.forEach((category: any) => {
              if (category.extrasIds && Array.isArray(category.extrasIds)) {
                category.extrasIds.forEach((id: string) => allExtrasIds.add(id));
              }
            });
            
            // Actualizar availableExtras con todos los IDs únicos
            return {
              ...eventType,
              availableExtras: Array.from(allExtrasIds)
            };
          }
          
          return eventType;
        })
      };
      
      // Guardar en BD
      await api.post('/calculator-config', { config: syncedConfig });
      
      // También guardar en localStorage como backup
      localStorage.setItem('advancedCalculatorConfig', JSON.stringify(syncedConfig));
      
      // Actualizar estado local con la config sincronizada
      setConfig(syncedConfig);
      
      toast.success('✅ Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = () => {
    if (window.confirm('¿Estás seguro? Esto restaurará la configuración por defecto y perderás todos los cambios.')) {
      // Limpiar localStorage primero
      localStorage.removeItem('advancedCalculatorConfig');
      
      // Establecer nueva configuración
      setConfig(DEFAULT_CALCULATOR_CONFIG);
      localStorage.setItem('advancedCalculatorConfig', JSON.stringify(DEFAULT_CALCULATOR_CONFIG));
      setSelectedEventIndex(0);
      setExpandedParts(new Set());
      toast.success('✅ Configuración restaurada a valores por defecto');
      
      // Forzar recarga después de 500ms
      setTimeout(() => {
        window.location.reload();
      }, 500);
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

  // Event Type Operations
  const updateEventType = (index: number, field: keyof EventTypeConfig, value: any) => {
    const newEventTypes = [...config.eventTypes];
    newEventTypes[index] = { ...newEventTypes[index], [field]: value };
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  const addEventType = () => {
    const newEventType: EventTypeConfig = {
      id: `event-${Date.now()}`,
      name: 'Nuevo Evento',
      icon: '📅',
      multiplier: 1.0,
      parts: [],
    };
    setConfig({ ...config, eventTypes: [...config.eventTypes, newEventType] });
    setSelectedEventIndex(config.eventTypes.length);
  };

  const removeEventType = (index: number) => {
    if (config.eventTypes.length <= 1) {
      toast.error('Debe haber al menos un tipo de evento');
      return;
    }
    const newEventTypes = config.eventTypes.filter((_, i) => i !== index);
    setConfig({ ...config, eventTypes: newEventTypes });
    if (selectedEventIndex >= newEventTypes.length) {
      setSelectedEventIndex(newEventTypes.length - 1);
    }
  };

  // Event Part Operations
  const addEventPart = (eventIndex: number) => {
    const newPart: EventPart = {
      id: `part-${Date.now()}`,
      name: 'Nueva Parte',
      icon: '📦',
      description: 'Descripción de la parte del evento',
      defaultDuration: 2,
      soundLevel: 'basic',
      lightingLevel: 'basic',
    };
    const newEventTypes = [...config.eventTypes];
    newEventTypes[eventIndex].parts = [...newEventTypes[eventIndex].parts, newPart];
    setConfig({ ...config, eventTypes: newEventTypes });
    togglePartExpanded(newPart.id);
  };

  const updateEventPart = (eventIndex: number, partIndex: number, field: keyof EventPart, value: any) => {
    const newEventTypes = [...config.eventTypes];
    newEventTypes[eventIndex].parts[partIndex] = {
      ...newEventTypes[eventIndex].parts[partIndex],
      [field]: value,
    };
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  const removeEventPart = (eventIndex: number, partIndex: number) => {
    const newEventTypes = [...config.eventTypes];
    newEventTypes[eventIndex].parts = newEventTypes[eventIndex].parts.filter((_, i) => i !== partIndex);
    setConfig({ ...config, eventTypes: newEventTypes });
  };

  // Service Prices
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

  // Asegurar que selectedEvent siempre sea válido
  const selectedEvent = config.eventTypes[selectedEventIndex] || config.eventTypes[0];
  
  // Debug: Log cada vez que cambia el selectedEventIndex
  useEffect(() => {
    console.log('🔄 Cambio de evento:', {
      index: selectedEventIndex,
      evento: selectedEvent?.name,
      partes: selectedEvent?.parts?.length,
      id: selectedEvent?.id
    });
  }, [selectedEventIndex, selectedEvent]);

  return {
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
  };
};
