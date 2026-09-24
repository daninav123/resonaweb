// Tarifa de material: precio/día del catálogo de Resona Rent (alquiler a terceros).
// Fuente: tabla Product, campo pricePerDay. Actualizar si cambian en BD.
export const TARIFA = {
  'icoa12': { n: 'LD Icoa 12a (blanco)', p: 25 },
  'icoa15': { n: 'LD Icoa 15a (negro)', p: 35 },
  'altea415': { n: 'Das Altea 415a', p: 25 },
  'das215': { n: 'Das Audio Action 215a', p: 49.58 },
  'sub218': { n: 'Subwoofer Das 218a', p: 66.11 },
  'lc8': { n: 'LC 8 Kinson', p: 12.39 },
  'curv500': { n: 'LD Curv 500TS', p: 100 },
  'epm8': { n: 'Mesa Soundcraft EPM8', p: 15 },
  'xair18': { n: 'Mesa Behringer XAir 18', p: 40 },
  'tracks': { n: 'Procesador t.racks 204', p: 40 },
  'rx2': { n: 'Pioneer RX2', p: 100 },
  'mic580': { n: 'Micro Audibax SM580', p: 5 },
  'mic570': { n: 'Micro Audibax SM570', p: 5 },
  'micba19': { n: 'Micro Behringer BA 19A', p: 5 },
  'micinal': { n: 'Micro inalámbrico', p: 10 },
  'micinal2': { n: 'Set 2 micros inalámbricos', p: 15 },
  'micpinza': { n: 'Micro piezoeléctrico pinza', p: 5 },
  'tripode': { n: 'Trípode negro', p: 10 },
  'gravity': { n: 'Soporte Gravity blanco', p: 10 },
  'tripodeg': { n: 'Trípode grande', p: 20 },
  'cabeza17r': { n: 'Cabeza 3en1 17r', p: 70.25 },
  'beam7r': { n: 'Cabeza móvil Beam 7r', p: 24.79 },
  'flash1000': { n: 'Flash RGB 1000w', p: 25 },
  'flashsmd': { n: 'Flash RGB SMD', p: 10 },
  'miniwash': { n: 'Mini wash', p: 15 },
  'minibeam': { n: 'Mini beam', p: 15 },
  'spot': { n: 'Foco spot pequeño', p: 10 },
  'laser': { n: 'Láser RGB 10w', p: 50 },
  'chamsys': { n: 'Mesa Chamsys QuickQ 20', p: 100 },
  'usbdmx': { n: 'Cajetín USB-DMX', p: 30 },
  'dmxwl': { n: 'DMX wireless', p: 10 },
  'truss1': { n: 'Truss 1 m', p: 10 },
  'truss15': { n: 'Truss 1,5 m', p: 15 },
  'truss2': { n: 'Truss 2 m', p: 20 },
  'minitruss': { n: 'Mini truss 2 m', p: 10 },
  'cubo': { n: 'Cubo truss', p: 40 },
  'base': { n: 'Base', p: 10 },
  'top': { n: 'Top', p: 10 },
  'semi4m': { n: 'Semicírculo 4 m Ø', p: 75 },
  'torre': { n: 'Torre elevadora Guil ELC 785', p: 80 },
  'tarima': { n: 'Tarima 2x1 m', p: 16 },
  'pata1': { n: 'Pata 1 m', p: 1 },
  'patareg': { n: 'Pata regulable 0,6-1 m', p: 5 },
  'palets': { n: 'Cabina DJ palets', p: 50 },
  'jardin': { n: 'Cabina DJ jardín vertical', p: 100 },
  'totem1': { n: 'Tótem madera 1 m', p: 25 },
  'totem2': { n: 'Tótem madera 2 m', p: 25 },
  'letras': { n: 'Letras madera', p: 70 },
  'retro': { n: 'Luz retro 7x50 RGB', p: 40 },
  'ventilador': { n: 'Ventilador', p: 40 },
  'focobat': { n: 'Foco RGB batería (wireless)', p: 10 },
  'guirnalda': { n: 'Guirnalda incandescente 25 m', p: 10 },
  'guirled': { n: 'Guirnalda LED', p: 10 },
  'fuegofrio': { n: 'Máquina fuego frío 700w', p: 70 },
  'humovert': { n: 'Máquina humo vertical 1500w', p: 30 },
  'hazer': { n: 'Máquina humo Hazer 1000w', p: 20 },
  'confeti': { n: 'Lanzador de confeti', p: 20 },
  'led34': { n: 'Pantalla LED 3x4 m P3.9', p: 1500 },
  'led32': { n: 'Pantalla LED 3x2 m P3.9', p: 800 },
  'modled': { n: 'Módulo LED P3.91 1000x500', p: 70 },
  'proyector': { n: 'Proyector', p: 30 },
  'pantalla': { n: 'Pantalla de proyección', p: 10 },
  'generador': { n: 'Generador 6500w', p: 40 },
  'dist32': { n: 'Distribuidor 32a', p: 15 },
  'spliter': { n: 'Spliter 32a', p: 10 },
  'xlr': { n: 'Cable XLR', p: 2 },
  'dmx': { n: 'Cable DMX', p: 2 },
  'iec': { n: 'Cable Schuko-IEC', p: 1 },
  'alarg': { n: 'Alargador schuko', p: 3 },
  'zapa': { n: 'Zapatilla', p: 2 },
  'powercon': { n: 'Alimentación powercon', p: 1 },
  'mang20': { n: 'Manguera trifásica 20 m', p: 15 },
  'mang5': { n: 'Manguera trifásica 5 m', p: 20 },
  'minijack': { n: 'Cable minijack/jack', p: 1 },
};

// Tarifa de personal por hora (tabla Product, categoría Personal).
export const PERSONAL = {
  montador: { n: 'Montador', p: 30 },
  tecnico: { n: 'Técnico audiovisual', p: 40 },
  dj: { n: 'DJ', p: 50 },
};

// Transporte incluido en el PVP: ida + vuelta + carga/descarga, hasta 50 km de Valencia.
export const TRANSPORTE = {
  ligero: { n: 'Furgoneta pequeña', p: 80 },
  medio: { n: 'Furgoneta grande', p: 120 },
  pesado: { n: 'Furgón + estructura', p: 180 },
};

export const PARAMS = {
  factorServicio: 1.25,  // recargo sobre tarifa de material: montaje, desmontaje, consumibles, desgaste, stock inmovilizado.
                         // Bajado de 1,6 tras comparar con la competencia de Valencia: a 1,6 los montajes de disco se iban
                         // un 20-30% por encima del mercado local.
  costeMaterial: 0.20,   // coste interno real del material sobre su tarifa (amortización + revisión + fungibles)
  costePersonal: 0.60,   // coste interno de personal sobre lo facturado (bruto + SS + dietas)
  costeTransporte: 0.55, // coste interno de transporte sobre lo facturado (combustible + peajes + amortización furgo)
  descuentoMaxComercial: 0.15, // suelo de negociación sin autorización de Dani
};

const m = (key, qty = 1) => ({ key, qty });

export const MONTAJES = [
  // ─────────────────────────────────────── BODAS · CEREMONIA, CÓCTEL, BANQUETE
  {
    id: 'BOD-CER-1', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Ceremonia Básica',
    resumen: 'Sonido para ceremonia al aire libre hasta 80 invitados.',
    items: [m('icoa12', 2), m('gravity', 2), m('epm8'), m('micinal'), m('mic580'), m('xlr', 4), m('alarg', 2), m('iec', 2), m('zapa', 1)],
    personal: [{ rol: 'montador', personas: 1, horas: 2.5 }],
    transporte: 'ligero',
    incluye: ['2 altavoces con soporte', 'Micrófono inalámbrico para oficiante', 'Micro con cable para lecturas', 'Entrada de música desde móvil/portátil', 'Montaje, prueba y presencia durante la ceremonia'],
  },
  {
    id: 'BOD-CER-2', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Ceremonia Plus',
    resumen: 'Ceremonia hasta 150 invitados, con música en directo o dos oficiantes.',
    items: [m('icoa12', 4), m('gravity', 4), m('epm8'), m('micinal2'), m('mic580', 2), m('micpinza'), m('xlr', 8), m('alarg', 4), m('iec', 4), m('zapa', 2)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }, { rol: 'tecnico', personas: 1, horas: 2 }],
    transporte: 'ligero',
    incluye: ['4 altavoces en refuerzo estéreo', '2 micrófonos inalámbricos', 'Micro de pinza para instrumento acústico', 'Técnico presente durante toda la ceremonia'],
  },
  {
    id: 'BOD-COC-1', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Cóctel Básico',
    resumen: 'Sonido ambiente distribuido en zona de cóctel.',
    items: [m('lc8', 4), m('epm8'), m('alarg', 4), m('iec', 4), m('xlr', 8), m('tripode', 4)],
    personal: [{ rol: 'montador', personas: 1, horas: 2.5 }],
    transporte: 'ligero',
    incluye: ['4 puntos de sonido repartidos', 'Música ambiente controlada', 'Cableado oculto'],
  },
  {
    id: 'BOD-COC-2', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Cóctel Plus',
    resumen: 'Cóctel amplio o en varias zonas, con micro para bienvenida.',
    items: [m('icoa12', 6), m('gravity', 6), m('epm8'), m('micinal'), m('alarg', 6), m('iec', 6), m('xlr', 12), m('zapa', 3)],
    personal: [{ rol: 'montador', personas: 2, horas: 2.5 }],
    transporte: 'medio',
    incluye: ['6 puntos de sonido', 'Micro inalámbrico para bienvenida', 'Cobertura de jardín + zona de barra'],
  },
  {
    id: 'BOD-BAN-1', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Banquete Básico',
    resumen: 'Sonido para banquete hasta 120 comensales, con micro para discursos.',
    items: [m('altea415', 4), m('tripode', 4), m('epm8'), m('micinal'), m('mic580'), m('xlr', 10), m('alarg', 8), m('iec', 4), m('zapa', 2)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }],
    transporte: 'medio',
    incluye: ['4 altavoces con trípode', 'Micrófono inalámbrico para discursos', 'Música de fondo durante la comida'],
  },
  {
    id: 'BOD-BAN-2', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Banquete Plus',
    resumen: 'Banquete grande o en carpa, con soportes blancos y refuerzo homogéneo.',
    items: [m('icoa12', 6), m('gravity', 6), m('epm8'), m('micinal2'), m('mic580'), m('xlr', 14), m('alarg', 8), m('iec', 6), m('zapa', 3)],
    personal: [{ rol: 'montador', personas: 2, horas: 3 }],
    transporte: 'medio',
    incluye: ['6 altavoces blancos sobre soporte Gravity', '2 micros inalámbricos', 'Reparto homogéneo en toda la sala'],
  },
  {
    id: 'BOD-INT-1', grupo: 'Bodas · Ceremonia, cóctel y banquete', nombre: 'Integral Ceremonia + Cóctel + Banquete',
    resumen: 'Los tres momentos con un solo montaje y un técnico durante todo el evento.',
    items: [m('icoa12', 6), m('gravity', 6), m('lc8', 4), m('altea415', 2), m('tripode', 2), m('epm8'), m('xair18'), m('micinal2'), m('mic580', 2), m('xlr', 20), m('alarg', 10), m('iec', 10), m('zapa', 5)],
    personal: [{ rol: 'montador', personas: 2, horas: 4 }, { rol: 'tecnico', personas: 1, horas: 6 }],
    transporte: 'medio',
    descuentoPack: 0.18,
    incluye: ['Cobertura de ceremonia, cóctel y banquete', 'Técnico presente todo el evento', 'Mesa digital y reubicación de equipos entre momentos', 'Un solo transporte y un solo montaje: más barato y con más equipo que contratar los tres momentos por separado'],
  },

  // ─────────────────────────────────────── BODAS · DISCO
  {
    id: 'BOD-DIS-1', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Básica',
    resumen: 'Barra libre hasta 100 invitados. Cabina de palets, sonido y cabezas móviles.',
    items: [m('das215', 2), m('beam7r', 4), m('palets'), m('totem1', 2), m('tripodeg', 2), m('rx2'), m('usbdmx'), m('flashsmd', 4), m('dmx', 6), m('xlr', 6), m('alarg', 4), m('iec', 6), m('zapa', 3), m('powercon', 4), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 4 }, { rol: 'dj', personas: 1, horas: 6 }],
    transporte: 'medio',
    incluye: ['DJ profesional 6 horas', 'Cabina de palets iluminada', '2 altavoces Das 215a', '4 cabezas móviles Beam + flashes', 'Máquina de humo'],
  },
  {
    id: 'BOD-DIS-2', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Truss + Jardín Vertical',
    resumen: 'Cabina de jardín vertical con puente de truss. La opción más vendida.',
    items: [m('das215', 2), m('sub218'), m('beam7r', 4), m('flash1000', 2), m('jardin'), m('truss15', 2), m('minitruss', 2), m('base', 2), m('rx2'), m('usbdmx'), m('dmx', 8), m('xlr', 6), m('alarg', 5), m('iec', 8), m('zapa', 4), m('powercon', 6), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 5 }, { rol: 'dj', personas: 1, horas: 6 }],
    transporte: 'pesado',
    incluye: ['DJ profesional 6 horas', 'Cabina jardín vertical con puente de truss', 'Sonido con subgrave', '4 cabezas Beam + 2 flashes RGB', 'Máquina de humo'],
  },
  {
    id: 'BOD-DIS-3', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Semicírculo Básico',
    resumen: 'Estructura en semicírculo de 4 m con 6 cabezas 3en1. Impacto visual alto.',
    items: [m('das215'), m('sub218'), m('semi4m'), m('truss1', 7), m('cubo', 2), m('base', 4), m('cabeza17r', 6), m('chamsys'), m('rx2'), m('dmx', 8), m('xlr', 5), m('alarg', 6), m('iec', 6), m('zapa', 5), m('powercon', 9), m('mang20'), m('dist32'), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 6 }, { rol: 'dj', personas: 1, horas: 6 }, { rol: 'tecnico', personas: 1, horas: 5 }],
    transporte: 'pesado',
    incluye: ['DJ profesional 6 horas', 'Estructura semicírculo 4 m de diámetro', '6 cabezas móviles 3en1 17r', 'Sonido con subgrave', 'Técnico de iluminación en directo (mesa Chamsys)', 'Máquina de humo'],
  },
  {
    id: 'BOD-DIS-4', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Semicírculo Pro',
    resumen: 'Semicírculo reforzado con flashes, láser y cabina. Bodas de 200+ invitados.',
    items: [m('das215', 2), m('sub218'), m('semi4m'), m('truss1', 7), m('cubo', 2), m('base', 4), m('cabeza17r', 6), m('flash1000', 4), m('laser'), m('jardin'), m('chamsys'), m('rx2'), m('dmx', 12), m('xlr', 6), m('alarg', 8), m('iec', 8), m('zapa', 6), m('powercon', 12), m('mang20'), m('dist32'), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 7 }, { rol: 'dj', personas: 1, horas: 6 }, { rol: 'tecnico', personas: 1, horas: 6 }],
    transporte: 'pesado',
    incluye: ['Todo lo del Semicírculo Básico', 'Sonido reforzado (2x 215a + sub)', '4 flashes RGB 1000w + láser RGB', 'Cabina jardín vertical', 'Técnico de iluminación toda la noche'],
  },
  {
    id: 'BOD-DIS-5', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Pirámide',
    resumen: 'Estructura piramidal de truss con 6 cabezas 3en1 y flashes.',
    items: [m('cubo', 3), m('truss2', 4), m('truss1', 4), m('base', 4), m('cabeza17r', 6), m('flash1000', 4), m('das215', 2), m('sub218'), m('chamsys'), m('rx2'), m('dmx', 10), m('xlr', 6), m('alarg', 6), m('iec', 6), m('zapa', 4), m('powercon', 10), m('mang20'), m('dist32'), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 6 }, { rol: 'dj', personas: 1, horas: 6 }, { rol: 'tecnico', personas: 1, horas: 5 }],
    transporte: 'pesado',
    incluye: ['DJ profesional 6 horas', 'Estructura piramidal de truss', '6 cabezas móviles 3en1 + 4 flashes RGB', 'Sonido con subgrave', 'Técnico de iluminación en directo'],
  },
  {
    id: 'BOD-DIS-6', grupo: 'Bodas · Disco y barra libre', nombre: 'Disco Pirámide Pro',
    resumen: 'Pirámide con LED SMD, láser y sonido reforzado. Máximo espectáculo.',
    items: [m('cubo', 3), m('truss2', 4), m('truss1', 6), m('base', 4), m('cabeza17r', 6), m('flashsmd', 10), m('flash1000', 4), m('laser'), m('das215', 2), m('sub218'), m('jardin'), m('chamsys'), m('rx2'), m('dmx', 14), m('xlr', 8), m('alarg', 8), m('iec', 10), m('zapa', 6), m('powercon', 14), m('mang20'), m('dist32'), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 7 }, { rol: 'dj', personas: 1, horas: 6 }, { rol: 'tecnico', personas: 1, horas: 6 }],
    transporte: 'pesado',
    incluye: ['Todo lo de la Disco Pirámide', '10 flashes LED SMD + láser RGB', 'Cabina jardín vertical', 'Sonido reforzado'],
  },

  // ─────────────────────────────────────── EVENTOS PRIVADOS
  {
    id: 'PRI-1', grupo: 'Eventos privados y fiestas', nombre: 'Fiesta Privada Básica',
    resumen: 'Cumpleaños, aniversarios, fiestas en chalet. Hasta 60 personas.',
    items: [m('altea415', 2), m('tripode', 2), m('palets'), m('rx2'), m('minibeam', 2), m('flashsmd', 2), m('dmx', 4), m('xlr', 4), m('alarg', 3), m('iec', 4), m('zapa', 2)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }, { rol: 'dj', personas: 1, horas: 4 }],
    transporte: 'ligero',
    incluye: ['DJ 4 horas', 'Cabina de palets', 'Sonido para 60 personas', 'Iluminación básica de pista'],
  },
  {
    id: 'PRI-2', grupo: 'Eventos privados y fiestas', nombre: 'Fiesta Privada Plus',
    resumen: 'Hasta 150 personas, con cabezas móviles y cabina decorada.',
    items: [m('das215', 2), m('beam7r', 4), m('palets'), m('totem1', 2), m('totem2', 2), m('rx2'), m('usbdmx'), m('flash1000', 2), m('dmx', 8), m('xlr', 6), m('alarg', 5), m('iec', 7), m('zapa', 3), m('hazer')],
    personal: [{ rol: 'montador', personas: 2, horas: 4 }, { rol: 'dj', personas: 1, horas: 5 }],
    transporte: 'medio',
    incluye: ['DJ 5 horas', 'Cabina de palets con tótems de madera', '4 cabezas móviles Beam', 'Sonido Das 215a', 'Máquina de humo'],
  },

  // ─────────────────────────────────────── CORPORATIVO
  {
    id: 'COR-1', grupo: 'Eventos corporativos', nombre: 'Sonido Corporativo Básico',
    resumen: 'Presentación, inauguración o rueda de prensa. Hasta 100 asistentes.',
    items: [m('icoa12', 2), m('gravity', 2), m('epm8'), m('micinal'), m('mic580'), m('xlr', 4), m('alarg', 3), m('iec', 3), m('zapa', 2)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }],
    transporte: 'ligero',
    incluye: ['2 altavoces blancos sobre soporte', 'Micrófono inalámbrico + micro de atril', 'Entrada de audio para portátil', 'Montaje y prueba antes del acto'],
  },
  {
    id: 'COR-2', grupo: 'Eventos corporativos', nombre: 'Sonido Corporativo + DJ',
    resumen: 'Acto corporativo con parte formal y afterwork con música.',
    items: [m('icoa12', 4), m('gravity', 4), m('rx2'), m('epm8'), m('micinal2'), m('minibeam', 2), m('xlr', 8), m('alarg', 5), m('iec', 5), m('zapa', 3), m('dmx', 3)],
    personal: [{ rol: 'montador', personas: 1, horas: 3.5 }, { rol: 'dj', personas: 1, horas: 4 }],
    transporte: 'medio',
    incluye: ['Sonido para la parte formal', 'DJ 4 horas para el afterwork', '2 micros inalámbricos', 'Iluminación de ambiente'],
  },
  {
    id: 'COR-3', grupo: 'Eventos corporativos', nombre: 'Conferencia con Proyección',
    resumen: 'Sala de conferencias con proyector, pantalla y técnico durante la jornada.',
    items: [m('icoa12', 4), m('gravity', 4), m('xair18'), m('micinal2'), m('mic580', 2), m('proyector'), m('pantalla'), m('xlr', 10), m('alarg', 6), m('iec', 6), m('zapa', 3), m('minijack', 2)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }, { rol: 'tecnico', personas: 1, horas: 8 }],
    transporte: 'medio',
    incluye: ['Sonido de sala con mesa digital', '2 micros inalámbricos + 2 de atril', 'Proyector y pantalla', 'Técnico durante toda la jornada'],
  },
  {
    id: 'COR-4', grupo: 'Eventos corporativos', nombre: 'Pantalla LED 3x2 m',
    resumen: 'Pantalla LED P3.9 de 3x2 m con estructura, procesador y técnico.',
    items: [m('led32'), m('truss2', 2), m('base', 4), m('mang20'), m('dist32'), m('powercon', 6)],
    personal: [{ rol: 'montador', personas: 2, horas: 4 }, { rol: 'tecnico', personas: 1, horas: 6 }],
    transporte: 'pesado',
    incluye: ['Pantalla LED P3.9 de 6 m²', 'Estructura de soporte y anclajes', 'Procesador de vídeo y cableado', 'Técnico de vídeo durante el evento'],
  },
  {
    id: 'COR-5', grupo: 'Eventos corporativos', nombre: 'Pantalla LED 3x4 m',
    resumen: 'Pantalla LED P3.9 de 3x4 m para escenario o congreso.',
    items: [m('led34'), m('truss2', 4), m('base', 4), m('torre', 2), m('mang20'), m('dist32'), m('powercon', 10)],
    personal: [{ rol: 'montador', personas: 3, horas: 5 }, { rol: 'tecnico', personas: 1, horas: 8 }],
    transporte: 'pesado',
    incluye: ['Pantalla LED P3.9 de 12 m²', 'Estructura con torres elevadoras', 'Procesador de vídeo y cableado', 'Técnico de vídeo durante todo el evento'],
  },

  // ─────────────────────────────────────── CONCIERTOS
  {
    id: 'CON-1', grupo: 'Conciertos y música en directo', nombre: 'PA Básico Grupo',
    resumen: 'Sonido para grupo pequeño o solista. Hasta 150 personas.',
    items: [m('das215', 2), m('tripodeg', 2), m('xair18'), m('mic580', 3), m('mic570'), m('micba19'), m('tracks'), m('xlr', 14), m('alarg', 5), m('iec', 5), m('zapa', 3)],
    personal: [{ rol: 'montador', personas: 1, horas: 3 }, { rol: 'tecnico', personas: 1, horas: 6 }],
    transporte: 'medio',
    incluye: ['PA estéreo Das 215a', 'Mesa digital Behringer XAir 18', 'Set de 5 micrófonos', 'Técnico de sonido en prueba y directo'],
  },
  {
    id: 'CON-2', grupo: 'Conciertos y música en directo', nombre: 'PA Concierto + Sub',
    resumen: 'Grupo completo con subgrave, monitores e iluminación frontal.',
    items: [m('das215', 2), m('sub218'), m('icoa15', 2), m('tripodeg', 2), m('xair18'), m('tracks'), m('mic580', 3), m('mic570'), m('micba19'), m('micinal'), m('minibeam', 4), m('flash1000', 2), m('truss2', 2), m('base', 2), m('xlr', 20), m('dmx', 6), m('alarg', 8), m('iec', 8), m('zapa', 4), m('mang20'), m('dist32')],
    personal: [{ rol: 'montador', personas: 2, horas: 5 }, { rol: 'tecnico', personas: 1, horas: 8 }],
    transporte: 'pesado',
    incluye: ['PA con subgrave', '2 monitores de escenario', 'Mesa digital y procesado', 'Set de micros para banda completa', 'Puente de luces frontal', 'Técnico en prueba de sonido y directo'],
  },
  {
    id: 'CON-3', grupo: 'Conciertos y música en directo', nombre: 'Escenario 4x2 m',
    resumen: 'Tarima modular de 8 m² con faldón y altura regulable.',
    items: [m('tarima', 4), m('pata1', 16), m('patareg', 4)],
    personal: [{ rol: 'montador', personas: 2, horas: 3 }],
    transporte: 'pesado',
    incluye: ['8 m² de tarima modular', 'Patas regulables 0,6-1 m', 'Montaje y nivelación'],
  },
  {
    id: 'CON-4', grupo: 'Conciertos y música en directo', nombre: 'Escenario 6x4 m',
    resumen: 'Tarima modular de 24 m² para grupo completo.',
    items: [m('tarima', 12), m('pata1', 40), m('patareg', 8)],
    personal: [{ rol: 'montador', personas: 3, horas: 4 }],
    transporte: 'pesado',
    incluye: ['24 m² de tarima modular', 'Patas regulables', 'Montaje, nivelación y desmontaje'],
  },
];

// Los extras se montan en el mismo viaje que el montaje principal: no llevan transporte propio.
// Si un extra se contrata suelto, hay que sumarle el transporte a mano.
export const EXTRAS = [
  { id: 'EXT-01', nombre: 'Fuego frío (2 máquinas)', items: [m('fuegofrio', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1.5 }], transporte: null, nota: 'Consumible incluido. Requiere autorización de la finca.' },
  { id: 'EXT-02', nombre: 'Fuego frío (4 máquinas)', items: [m('fuegofrio', 4)], personal: [{ rol: 'montador', personas: 1, horas: 2 }], transporte: null, nota: 'Efecto de entrada + primer baile.' },
  { id: 'EXT-03', nombre: 'Confeti (2 lanzadores)', items: [m('confeti', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: '10 cargas incluidas.' },
  { id: 'EXT-04', nombre: 'Humo vertical (2 máquinas)', items: [m('humovert', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: 'Efecto de columna para entrada o primer baile.' },
  { id: 'EXT-05', nombre: 'Láser RGB 10w', items: [m('laser'), m('dmx', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: 'Requiere espacio con altura suficiente.' },
  { id: 'EXT-06', nombre: 'Letras de madera iluminadas', items: [m('letras')], personal: [{ rol: 'montador', personas: 1, horas: 1.5 }], transporte: null, nota: 'Consultar disponibilidad de letras según palabra.' },
  { id: 'EXT-07', nombre: 'Guirnaldas (por cada 50 m)', items: [m('guirnalda', 2)], personal: [{ rol: 'montador', personas: 2, horas: 2 }], transporte: null, nota: 'Precio por tramo de 50 m. Montaje en altura según finca.' },
  { id: 'EXT-08', nombre: 'Iluminación decorativa wireless (8 focos)', items: [m('focobat', 8), m('dmxwl')], personal: [{ rol: 'montador', personas: 1, horas: 1.5 }], transporte: null, nota: 'Sin cableado. Ideal para paredes y árboles.' },
  { id: 'EXT-09', nombre: 'Tótems de madera (4 uds)', items: [m('totem1', 2), m('totem2', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: 'Decoración de cabina o accesos.' },
  { id: 'EXT-10', nombre: 'Cabina DJ jardín vertical', items: [m('jardin')], personal: [{ rol: 'montador', personas: 2, horas: 1.5 }], transporte: null, nota: 'Upgrade sobre cabina de palets.' },
  { id: 'EXT-11', nombre: 'Proyector + pantalla', items: [m('proyector'), m('pantalla'), m('minijack', 2)], personal: [{ rol: 'tecnico', personas: 1, horas: 2 }], transporte: null, nota: 'Para vídeo sorpresa o presentación.' },
  { id: 'EXT-12', nombre: 'Generador 6500w', items: [m('generador'), m('dist32'), m('mang20')], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: 'medio', nota: 'Combustible aparte. Para fincas sin acometida.' },
  { id: 'EXT-13', nombre: 'Hora extra de DJ', items: [], personal: [{ rol: 'dj', personas: 1, horas: 1 }], transporte: null, pvpFijo: 80, nota: 'Se factura por hora iniciada. Incluye alargar el alquiler de todo el equipo, no solo al DJ.' },
  { id: 'EXT-14', nombre: 'Hora extra de técnico', items: [], personal: [{ rol: 'tecnico', personas: 1, horas: 1 }], transporte: null, pvpFijo: 70, nota: 'Se factura por hora iniciada. Incluye alargar el alquiler de todo el equipo.' },
  { id: 'EXT-15', nombre: 'Refuerzo de sonido pista (2x Icoa 15a)', items: [m('icoa15', 2), m('xlr', 2), m('iec', 2), m('zapa', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: 'Añadir a cualquier montaje de disco.' },
  { id: 'EXT-16', nombre: 'Subgrave adicional Das 218a', items: [m('sub218'), m('xlr', 2), m('powercon', 2)], personal: [{ rol: 'montador', personas: 1, horas: 1 }], transporte: null, nota: 'Añadir a cualquier montaje de disco.' },
];

export const SUPLEMENTOS = [
  { concepto: 'Desplazamiento 50-100 km de Valencia', precio: '+80 €' },
  { concepto: 'Desplazamiento >100 km', precio: '+80 € y 1,20 €/km adicional' },
  { concepto: 'Desmontaje nocturno después de las 03:00', precio: '+120 €' },
  { concepto: 'Montaje en día distinto al evento (finca lo exige)', precio: '+150 €' },
  { concepto: 'Acceso complicado: sin carga a pie de montaje, escaleras, más de 50 m de porteo', precio: '+100 €' },
  { concepto: 'Evento en isla o fuera de la Comunidad Valenciana', precio: 'Presupuesto a medida' },
  { concepto: 'Urgencia: contratación con menos de 7 días', precio: '+15% sobre el total' },
  { concepto: 'Día adicional de alquiler del mismo montaje', precio: '+35% sobre el material' },
];
