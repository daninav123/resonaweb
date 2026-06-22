export type CaseType = 'boda' | 'corporativo' | 'privado' | 'concierto';

export interface PortfolioCase {
  slug: string;
  type: CaseType;
  typeLabel: string;
  title: string;
  place: string;
  year: number;
  guests: number;
  cover: string;
  heroLandscape: string;
  gallery: string[];
  services: string[];
  challenge: string;
  approach: string;
  testimonial?: {
    quote: string;
    author: string;
  };
  featured?: boolean;
}

export const PORTFOLIO: PortfolioCase[] = [
  {
    slug: 'boda-maria-jorge',
    type: 'boda',
    typeLabel: 'Boda íntima',
    title: 'María & Jorge',
    place: 'Masía de los Falcones, Bétera',
    year: 2025,
    guests: 140,
    cover: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Sonido ceremonia', 'Banquete', 'Disco & DJ', 'Iluminación decorativa', 'Técnico dedicado'],
    challenge: 'Masía con dos espacios distantes (ceremonia al aire libre y banquete en nave interior) y transición al atardecer que los novios querían íntegramente iluminada en cálido.',
    approach: 'Tres rigs independientes controlados desde un solo FOH, cambios de ambiente sincronizados con el timing emocional y DJ que recogió el testigo sin corte perceptible.',
    testimonial: {
      quote: 'No queríamos que sonase a "boda". Sonó a nosotros. El primer baile lo vamos a recordar exactamente como lo imaginamos.',
      author: 'María & Jorge',
    },
    featured: true,
  },
  {
    slug: 'adidas-valencia-run',
    type: 'corporativo',
    typeLabel: 'Activación de marca',
    title: 'Adidas · Valencia Run',
    place: 'Marina de Valencia',
    year: 2025,
    guests: 1200,
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Line array', 'Videoescenario', 'Streaming multicámara', 'Régie de producción'],
    challenge: 'Activación outdoor con 1.200 asistentes, streaming simultáneo para RRSS y limitación sonora municipal estricta por proximidad a zona residencial.',
    approach: 'Line array direccional con control por zonas, cámaras IP sincronizadas con el régie central y mezcla separada para el live y el broadcast.',
    featured: true,
  },
  {
    slug: 'boda-clara-pablo',
    type: 'boda',
    typeLabel: 'Boda al aire libre',
    title: 'Clara & Pablo',
    place: 'Villa privada, Altea',
    year: 2024,
    guests: 90,
    cover: 'https://images.unsplash.com/photo-1470905906913-3f2f4c2cf98d?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1470905906913-3f2f4c2cf98d?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Ceremonia al aire libre', 'Cóctel con cuarteto', 'Banquete', 'Iluminación arquitectónica'],
    challenge: 'Boda íntima en villa privada con acceso limitado de vehículos y deseo expreso de que el equipamiento no "rompiese" la estética del lugar.',
    approach: 'Material de perfil bajo en negro mate, cableado enterrado y discreto, iluminación arquitectónica que realzó la villa en vez de competir con ella.',
    testimonial: {
      quote: 'Los invitados no veían los equipos. Solo la casa, la música y la luz. Exactamente lo que pedimos.',
      author: 'Clara Ruiz',
    },
    featured: true,
  },
  {
    slug: 'coca-cola-summer-camp',
    type: 'corporativo',
    typeLabel: 'Evento corporativo',
    title: 'Coca-Cola · Summer Camp',
    place: 'Palacio de Congresos, Valencia',
    year: 2024,
    guests: 480,
    cover: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Escenario modular', 'Iluminación espectáculo', 'Sonido plenario', 'Traducción simultánea'],
    challenge: 'Evento anual para 480 empleados con ponencia magistral, break-outs simultáneos y cierre tipo festival.',
    approach: 'Un único sistema escalable: el plenario se transforma en arena de festival en 90 minutos sin mover público.',
  },
  {
    slug: 'boda-lucia-alex',
    type: 'boda',
    typeLabel: 'Boda rural',
    title: 'Lucía & Álex',
    place: 'Finca La Concepción, Gandía',
    year: 2024,
    guests: 180,
    cover: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Ceremonia', 'Banquete', 'Disco', 'Fuegos sincronizados'],
    challenge: 'Boda de 180 invitados con tres momentos musicales muy distintos: ceremonia acústica, banquete ambiental y disco con pista hasta las 5am.',
    approach: 'Un sistema flexible, tres personalidades. Con el mismo rig entregamos intimidad en ceremonia y energía en pista.',
  },
  {
    slug: 'ayuntamiento-valencia-fallas',
    type: 'concierto',
    typeLabel: 'Concierto municipal',
    title: 'Fallas Valencia · Concierto plaza',
    place: 'Plaza del Ayuntamiento',
    year: 2024,
    guests: 8000,
    cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1800&auto=format&fit=crop',
    heroLandscape: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2400&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1800&auto=format&fit=crop',
    ],
    services: ['Line array gran formato', 'Iluminación espectáculo', 'Videoescenario', 'Producción técnica'],
    challenge: 'Concierto gratuito municipal con 8.000 personas, múltiples artistas con riders incompatibles y cambios de escenario de 20 minutos.',
    approach: 'Patch universal preparado en rehearsal, dos FOH engineers trabajando en paralelo y rotación de escenario con cambios invisibles al público.',
  },
];

export const getCaseBySlug = (slug: string): PortfolioCase | undefined =>
  PORTFOLIO.find((c) => c.slug === slug);

export const getCasesByType = (type: CaseType): PortfolioCase[] =>
  PORTFOLIO.filter((c) => c.type === type);

export const getFeaturedCases = (): PortfolioCase[] =>
  PORTFOLIO.filter((c) => c.featured);
