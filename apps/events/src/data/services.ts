export interface Service {
  slug: string;
  number: string;
  label: string;
  tagline: string;
  description: string;
  includes: string[];
  image: string;
}

export const SERVICES: Service[] = [
  {
    slug: 'sonido',
    number: '01',
    label: 'Sonido',
    tagline: 'Que la voz llegue. Que la música mueva. Que el silencio pese.',
    description:
      'Line arrays, point sources, subs, monitoraje, inalámbricos y mesa. Diseñamos el sistema según aforo, acústica del espacio y riders. La pregunta no es cuántos watios, es qué tiene que sentir cada invitado en cada momento.',
    includes: ['Line array escalable', 'Monitoraje in-ear', 'Microfonía inalámbrica', 'Mesa digital', 'Técnico FOH'],
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2000&auto=format&fit=crop',
  },
  {
    slug: 'iluminacion',
    number: '02',
    label: 'Iluminación',
    tagline: 'La luz no decora. Narra.',
    description:
      'Arquitectónica para realzar el espacio, escénica para marcar momentos, decorativa para crear atmósfera. Programamos escenas sincronizadas con el timing emocional, no con el cronómetro.',
    includes: ['Arquitectónica', 'Escenarios y cabezas móviles', 'Ambiente y decorativa', 'Control DMX programado', 'Técnico lumínico'],
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2000&auto=format&fit=crop',
  },
  {
    slug: 'dj',
    number: '03',
    label: 'DJ & Banda',
    tagline: 'La música que os define.',
    description:
      'Seleccionamos DJ según brief musical (jazz, electrónica, latino, indie, mainstream). Para bodas, nuestros DJ leen al público y coordinan transiciones con banda en vivo sin corte perceptible.',
    includes: ['DJ residente de la casa', 'Banda en vivo (opcional)', 'Lista de música consensuada', 'Equipamiento DJ integrado'],
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop',
  },
  {
    slug: 'video-streaming',
    number: '04',
    label: 'Vídeo & Streaming',
    tagline: 'Lo que pasa, pasa en muchos sitios a la vez.',
    description:
      'Videoescenario LED, cámaras multiplataforma, streaming simultáneo a YouTube/Vimeo/RRSS y régie centralizada. Cerramos con un vídeo resumen editado el mismo fin de semana si lo necesitas.',
    includes: ['Pantallas LED modulares', 'Cámaras IP multicam', 'Streaming multiplataforma', 'Régie + vision mixer', 'Edición post-evento'],
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=2000&auto=format&fit=crop',
  },
  {
    slug: 'produccion-integral',
    number: '05',
    label: 'Producción integral',
    tagline: 'Un único interlocutor. Un único plan.',
    description:
      'Escribimos el plan técnico completo, nos coordinamos con tus proveedores (catering, WP, agencia), gestionamos permisos y licencias. Tú no tocas un solo cable. Solo decides y disfrutas.',
    includes: ['Project manager dedicado', 'Coordinación de proveedores', 'Licencias y permisos', 'Logística y transporte', 'Recogida post-evento'],
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop',
  },
];
