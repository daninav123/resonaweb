export type ServiceLevel = 'none' | 'basic' | 'intermediate' | 'professional' | 'premium';

export interface RangeProduct {
  productId: string; // ID del producto
  quantity: number; // Cantidad de este producto
}

export interface PricingRange {
  minAttendees: number; // Mínimo de invitados (ej: 0)
  maxAttendees: number; // Máximo de invitados (ej: 50)
  price: number; // Precio para este rango
  recommendedProducts?: RangeProduct[]; // Productos con cantidades para este rango
}

export interface EventPart {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultDuration: number; // en horas
  soundLevel: ServiceLevel;
  lightingLevel: ServiceLevel;
  price?: number; // Precio fijo (si aplica)
  // Precio variable según rangos de asistentes
  pricingRanges?: PricingRange[]; // Array de rangos de precio
  // Productos/materiales recomendados para esta parte
  recommendedProducts?: string[]; // IDs de productos
}

export interface PackRecommendationRule {
  packId: string; // ID del producto pack
  minAttendees?: number; // Mínimo de asistentes
  maxAttendees?: number; // Máximo de asistentes
  requiredParts?: string[]; // IDs de partes del evento que deben estar seleccionadas (opcional)
  priority: number; // 1 = más alta prioridad para recomendar
  reason?: string; // Razón de la recomendación (opcional)
}

export interface ExtraCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
  extrasIds: string[]; // IDs de los extras asignados a esta categoría
}

export interface EventTypeConfig {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  parts: EventPart[];
  isActive?: boolean; // Mostrar u ocultar el tipo de evento en la calculadora
  recommendedPacks?: PackRecommendationRule[]; // Packs recomendados según condiciones
  availablePacks?: string[]; // IDs de packs/montajes disponibles para este tipo de evento
  availableExtras?: string[]; // IDs de productos extras disponibles para este tipo de evento
  extraCategories?: ExtraCategory[]; // Categorías para organizar los extras en pestañas
}

export interface ServicePrices {
  basic: number;
  intermediate: number;
  professional: number;
  premium: number;
}

export interface AdvancedCalculatorConfig {
  eventTypes: EventTypeConfig[];
  servicePrices: {
    sound: ServicePrices;
    lighting: ServicePrices;
  };
}

export const DEFAULT_CALCULATOR_CONFIG: AdvancedCalculatorConfig = {
  eventTypes: [
    {
      id: 'boda',
      name: 'Boda',
      icon: '💒',
      multiplier: 1.5,
      isActive: true,
      parts: [
        {
          id: 'ceremony',
          name: 'Ceremonia',
          icon: '💒',
          description: 'Ceremonia religiosa o civil',
          defaultDuration: 1,
          soundLevel: 'professional',
          lightingLevel: 'basic',
        },
        {
          id: 'cocktail',
          name: 'Cóctel',
          icon: '🍸',
          description: 'Aperitivo y bebidas entre ceremonia y banquete',
          defaultDuration: 2,
          soundLevel: 'intermediate',
          lightingLevel: 'intermediate',
        },
        {
          id: 'banquet',
          name: 'Banquete',
          icon: '🍽️',
          description: 'Comida o cena principal',
          defaultDuration: 4,
          soundLevel: 'professional',
          lightingLevel: 'professional',
        },
        {
          id: 'disco',
          name: 'Disco/Fiesta',
          icon: '🎵',
          description: 'Música y baile después del banquete',
          defaultDuration: 4,
          soundLevel: 'premium',
          lightingLevel: 'premium',
        },
      ],
    },
    {
      id: 'conferencia',
      name: 'Conferencia',
      icon: '🎤',
      multiplier: 1.2,
      isActive: true,
      parts: [
        {
          id: 'registration',
          name: 'Registro',
          icon: '📋',
          description: 'Acreditación de asistentes',
          defaultDuration: 1,
          soundLevel: 'none',
          lightingLevel: 'basic',
        },
        {
          id: 'presentations',
          name: 'Ponencias',
          icon: '🎤',
          description: 'Charlas y presentaciones principales',
          defaultDuration: 4,
          soundLevel: 'professional',
          lightingLevel: 'professional',
        },
        {
          id: 'coffee-break',
          name: 'Coffee Break',
          icon: '☕',
          description: 'Descanso y networking',
          defaultDuration: 0.5,
          soundLevel: 'basic',
          lightingLevel: 'basic',
        },
      ],
    },
    {
      id: 'concierto',
      name: 'Concierto',
      icon: '🎵',
      multiplier: 1.8,
      isActive: true,
      parts: [
        {
          id: 'soundcheck',
          name: 'Prueba de Sonido',
          icon: '🔧',
          description: 'Preparación técnica y ajustes',
          defaultDuration: 2,
          soundLevel: 'premium',
          lightingLevel: 'professional',
        },
        {
          id: 'concert',
          name: 'Concierto',
          icon: '🎵',
          description: 'Actuación principal',
          defaultDuration: 3,
          soundLevel: 'premium',
          lightingLevel: 'premium',
        },
      ],
    },
    {
      id: 'corporativo',
      name: 'Evento Corporativo',
      icon: '💼',
      multiplier: 1.3,
      isActive: true,
      parts: [
        {
          id: 'welcome',
          name: 'Bienvenida',
          icon: '👋',
          description: 'Recepción inicial',
          defaultDuration: 0.5,
          soundLevel: 'basic',
          lightingLevel: 'intermediate',
        },
        {
          id: 'presentation',
          name: 'Presentación',
          icon: '📊',
          description: 'Presentación corporativa principal',
          defaultDuration: 2,
          soundLevel: 'professional',
          lightingLevel: 'professional',
        },
        {
          id: 'teambuilding',
          name: 'Team Building',
          icon: '🤝',
          description: 'Actividades de equipo',
          defaultDuration: 3,
          soundLevel: 'intermediate',
          lightingLevel: 'intermediate',
        },
      ],
    },
    {
      id: 'fiesta',
      name: 'Fiesta Privada',
      icon: '🎉',
      multiplier: 1.0,
      isActive: true,
      parts: [
        {
          id: 'setup',
          name: 'Montaje',
          icon: '🔧',
          description: 'Preparación del espacio',
          defaultDuration: 1,
          soundLevel: 'intermediate',
          lightingLevel: 'intermediate',
        },
        {
          id: 'party',
          name: 'Fiesta',
          icon: '🎉',
          description: 'Celebración principal',
          defaultDuration: 5,
          soundLevel: 'professional',
          lightingLevel: 'professional',
        },
      ],
    },
    {
      id: 'otro',
      name: 'Otro',
      icon: '📅',
      multiplier: 1.0,
      isActive: true,
      parts: [
        {
          id: 'event',
          name: 'Evento',
          icon: '📅',
          description: 'Evento general',
          defaultDuration: 4,
          soundLevel: 'intermediate',
          lightingLevel: 'intermediate',
        },
      ],
    },
  ],
  servicePrices: {
    sound: { basic: 100, intermediate: 200, professional: 350, premium: 600 },
    lighting: { basic: 80, intermediate: 150, professional: 280, premium: 500 },
  },
};

export const SERVICE_LEVEL_LABELS: Record<ServiceLevel, string> = {
  none: 'No necesito',
  basic: 'Básico',
  intermediate: 'Intermedio',
  professional: 'Profesional',
  premium: 'Premium',
};
