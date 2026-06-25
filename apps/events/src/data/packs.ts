export type PackType = 'boda' | 'corporativo';

export interface PackUpgrade {
  key: string;
  label: string;
  price: number;
  description: string;
}

export interface Pack {
  slug: string;
  type: PackType;
  typeLabel: string;
  name: string;
  tagline: string;
  description: string;
  maxGuests: number;
  price: number;
  durationLabel: string;
  cover: string;
  heroLandscape: string;
  gallery: string[];
  includes: string[];
  upgrades: PackUpgrade[];
  idealFor: string;
  testimonial?: {
    quote: string;
    author: string;
  };
  featured?: boolean;
}

export const PACKS: Pack[] = [
  {
    slug: 'boda-esencial',
    type: 'boda',
    typeLabel: 'Boda · Pack Esencial',
    name: 'Esencial',
    tagline: 'Lo imprescindible, sin cortes, sin acoples.',
    description:
      'Todo lo que necesitas para que ceremonia, banquete y disco suenen de principio a fin. Un único equipo, técnico dedicado, transiciones cuidadas. Pensado para bodas íntimas donde la música importa tanto como la comida.',
    maxGuests: 100,
    price: 2800,
    durationLabel: 'Jornada completa (hasta 8h)',
    cover: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1800&auto=format&fit=crop',
    ],
    includes: [
      'Sonido completo (2 line array + 2 subs + monitoraje)',
      '2 micrófonos inalámbricos para ceremonia',
      'Mesa digital + técnico FOH toda la jornada',
      'Iluminación básica de pista (4 cabezas móviles + PAR LED)',
      'DJ residente de la casa con playlist consensuada',
      'Montaje, pruebas y recogida incluidos',
      'Transporte dentro de Valencia capital y Horta',
    ],
    upgrades: [
      { key: 'iluminacion-deco',  label: 'Iluminación decorativa',    price: 450, description: 'Guirnaldas, uplighters en cálido y focos arquitectónicos.' },
      { key: 'videoescenario',    label: 'Videoescenario LED',         price: 1200, description: 'Pantallas modulares para primer baile y vídeos personales.' },
      { key: 'fuegos',            label: 'Fuegos fríos sincronizados', price: 380, description: 'Efecto wow para el corte de la tarta o primer baile.' },
      { key: 'banda-live',        label: 'Banda en vivo integrada',     price: 900, description: 'Coordinamos FOH y transición con tu banda contratada.' },
      { key: 'horas-extra',       label: 'Hora extra de disco',         price: 180, description: 'Por cada hora pasada las 4:00. Hasta las 6:00 máx.' },
    ],
    idealFor: 'Bodas de hasta 100 invitados, ceremonia + banquete + disco en misma ubicación, Valencia o área metropolitana.',
    testimonial: {
      quote: 'Queríamos algo sin cortes, sin mezclas raras entre DJ y banda. Salió exactamente así. El pack base fue suficiente.',
      author: 'Inés & Rubén',
    },
    featured: true,
  },
  {
    slug: 'boda-completo',
    type: 'boda',
    typeLabel: 'Boda · Pack Completo',
    name: 'Completo',
    tagline: 'El equilibrio entre sobrio y memorable.',
    description:
      'Potencia para bodas medianas con detalles visuales cuidados. Añade iluminación decorativa completa y refuerzo de sonido para lugares más grandes. La elección más común en nuestras bodas.',
    maxGuests: 150,
    price: 4200,
    durationLabel: 'Jornada completa (hasta 10h)',
    cover: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1800&auto=format&fit=crop',
    ],
    includes: [
      'Sonido reforzado (4 line array + 4 subs cardioides + monitoraje)',
      'Microfonía inalámbrica completa (4 canales)',
      'Mesa digital + técnico FOH + técnico lumínico',
      'Iluminación escénica (8 cabezas móviles + efectos)',
      'Iluminación decorativa (uplighters + guirnaldas)',
      'DJ residente premium con sesión personalizada',
      'Montaje la tarde anterior si la finca lo permite',
      'Transporte toda la Comunidad Valenciana',
    ],
    upgrades: [
      { key: 'videoescenario',    label: 'Videoescenario LED 4x3m',    price: 1400, description: 'Pantalla grande para primer baile, fotos y vídeos.' },
      { key: 'banda-live',        label: 'Banda en vivo integrada',     price: 900, description: 'Coordinación FOH y transición DJ ↔ banda invisible.' },
      { key: 'fuegos',            label: 'Fuegos fríos sincronizados', price: 380, description: 'Efecto wow para tarta o primer baile.' },
      { key: 'photocall-led',     label: 'Photocall iluminado',         price: 320, description: 'Rincón de fotos con iluminación cálida dedicada.' },
      { key: 'horas-extra',       label: 'Hora extra de disco',         price: 220, description: 'Por cada hora pasada las 4:00. Hasta las 6:00 máx.' },
    ],
    idealFor: 'Bodas de 100 a 150 invitados, ceremonia al aire libre + banquete interior, lugares con buena acústica.',
    testimonial: {
      quote: 'La iluminación decorativa cambió cómo se veían las fotos. Vale cada euro.',
      author: 'Marta & Carlos',
    },
    featured: true,
  },
  {
    slug: 'boda-premium',
    type: 'boda',
    typeLabel: 'Boda · Pack Premium',
    name: 'Premium',
    tagline: 'Cuando el día tiene que ser cinematográfico.',
    description:
      'Producción completa para bodas grandes o con exigencias visuales altas. Videoescenario de serie, doble técnico, iluminación decorativa avanzada y coordinación con proveedores. Un pack para quienes miran vídeos de boda y piensan "así".',
    maxGuests: 200,
    price: 6500,
    durationLabel: 'Jornada completa (hasta 12h) + montaje tarde anterior',
    cover: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
    ],
    includes: [
      'Sonido gran formato (6 line array + 6 subs + fills + monitores in-ear)',
      'Microfonía inalámbrica avanzada (8 canales)',
      'Doble mesa (live + broadcast) + 2 técnicos FOH + técnico lumínico',
      'Iluminación espectáculo (12 cabezas móviles + láseres controlables)',
      'Iluminación decorativa completa (uplighters + guirnaldas + arquitectónica)',
      'Videoescenario LED 5x3m incluido',
      'Fuegos fríos sincronizados para primer baile y tarta',
      'DJ residente premium + coordinación con banda o DJ propio',
      'Project manager dedicado desde la contratación',
      'Montaje la tarde anterior con prueba final',
      'Transporte y dietas incluidos en toda España peninsular',
    ],
    upgrades: [
      { key: 'streaming',         label: 'Streaming multicámara',        price: 1600, description: 'Para invitados que no pueden asistir. 3 cámaras + broadcast.' },
      { key: 'resumen-video',     label: 'Vídeo resumen editado',        price: 1100, description: 'Aftermovie de 2-3 min entregado en 7 días.' },
      { key: 'segundo-ambiente',  label: 'Segundo ambiente musical',     price: 850, description: 'Rincón chill o zona fumadores con sonido independiente.' },
      { key: 'decoracion-lumin',  label: 'Decoración lumínica avanzada',  price: 620, description: 'Proyecciones arquitectónicas sobre la finca.' },
      { key: 'horas-extra',       label: 'Hora extra de disco',          price: 280, description: 'Por cada hora pasada las 4:00. Hasta las 7:00 máx.' },
    ],
    idealFor: 'Bodas de 150 a 200 invitados, masías y fincas grandes, parejas que quieren un aftermovie compartible.',
    testimonial: {
      quote: 'Vimos vídeos de boda en Instagram y dijimos "queremos esto". Lo entregaron tal cual.',
      author: 'Lucía & Álex',
    },
    featured: true,
  },
  {
    slug: 'corporativo-presentacion',
    type: 'corporativo',
    typeLabel: 'Corporativo · Presentación',
    name: 'Presentación',
    tagline: 'Lo técnico resuelto, el mensaje nítido.',
    description:
      'Pack estándar para ponencias, presentaciones de producto o kick-offs internos. Todo lo necesario para que se escuche bien y se vea bien en pantalla. Listo en 2 horas de montaje.',
    maxGuests: 100,
    price: 1400,
    durationLabel: 'Media jornada (hasta 5h)',
    cover: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
    ],
    includes: [
      'Sonido distribuido para sala (2 altavoces + sub)',
      'Micrófono inalámbrico (diadema o de mano, a elegir)',
      'Proyector + pantalla 3x2m o TV 65"',
      'Mesa técnica + técnico presente toda la sesión',
      'Cableado y adaptadores HDMI/USB-C',
      'Montaje y recogida en mismo día',
    ],
    upgrades: [
      { key: 'micro-adicional',   label: 'Micrófono adicional',           price: 80, description: 'Para panel de ponentes. Cada uno adicional.' },
      { key: 'streaming',         label: 'Streaming multiplataforma',    price: 680, description: 'Broadcast simultáneo a Zoom/Teams/YouTube.' },
      { key: 'pantalla-extra',    label: 'Segunda pantalla de apoyo',    price: 220, description: 'Para zona no cubierta por la principal.' },
      { key: 'iluminacion-po',    label: 'Iluminación para ponente',     price: 180, description: 'Focos LED para la zona del escenario.' },
    ],
    idealFor: 'Empresas en Valencia para presentaciones, formaciones internas, town halls. Hasta 100 asistentes sentados.',
  },
  {
    slug: 'corporativo-convencion',
    type: 'corporativo',
    typeLabel: 'Corporativo · Convención',
    name: 'Convención',
    tagline: 'De la ponencia al after, mismo día, mismo equipo.',
    description:
      'Producción técnica para convenciones y eventos corporativos de medio formato: plenario, break-outs, cóctel y sesión de networking musical. Escenario modular que se transforma sin mover al público.',
    maxGuests: 300,
    price: 3800,
    durationLabel: 'Jornada completa (hasta 10h)',
    cover: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1800&auto=format&fit=crop',
    ],
    includes: [
      'Escenario modular 4x3m con faldón',
      'Line array direccional (2x2) + subs + monitores',
      'Microfonía inalámbrica (6 canales: diademas + mano + solapa)',
      'Pantalla LED 4x2,5m o proyección gran formato',
      'Mesa digital + mesa vídeo + 2 técnicos',
      'Iluminación básica de escenario',
      'Régie con vision mixer para cambios de fuente',
      'Música de fondo y DJ para cóctel/networking',
      'Montaje la tarde anterior + prueba final',
    ],
    upgrades: [
      { key: 'streaming-multi',   label: 'Streaming multiplataforma',    price: 1200, description: 'Broadcast a Zoom/Teams/YouTube con 3 cámaras.' },
      { key: 'traduccion',        label: 'Traducción simultánea',         price: 950, description: 'Cabina + emisores + receptores para hasta 100 asistentes.' },
      { key: 'iluminacion-live',  label: 'Iluminación escenario avanzada', price: 680, description: 'Cabezas móviles + gobos para panel o entrevista live.' },
      { key: 'vision-mixer',      label: 'Grabación multicámara',         price: 740, description: 'Grabación limpia editada, entregada en 5 días.' },
      { key: 'breakout-room',     label: 'Sala break-out equipada',       price: 520, description: 'Sonido e imagen para una sala paralela adicional.' },
    ],
    idealFor: 'Convenciones corporativas, lanzamientos de producto, congresos medianos. 150-300 asistentes.',
    testimonial: {
      quote: 'El escenario se transformó en 90 minutos de plenario a afterwork. Mis jefes alucinaron.',
      author: 'Javier P., Coca-Cola',
    },
  },
];

export const getPackBySlug = (slug: string): Pack | undefined =>
  PACKS.find((p) => p.slug === slug);

export const getPacksByType = (type: PackType): Pack[] =>
  PACKS.filter((p) => p.type === type);

export const getFeaturedPacks = (): Pack[] =>
  PACKS.filter((p) => p.featured);

export const formatEuros = (n: number): string =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n) + '€';
