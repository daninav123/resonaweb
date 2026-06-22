export interface Testimonial {
  quote: string;
  author: string;
  context: string;
  type: 'boda' | 'corporativo' | 'privado' | 'concierto';
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'No queríamos que sonase a "boda". Sonó a nosotros. El primer baile lo vamos a recordar exactamente como lo imaginamos.',
    author: 'María & Jorge',
    context: 'Boda · Masía de los Falcones',
    type: 'boda',
  },
  {
    quote: 'Nos resolvieron una activación outdoor con limitación sonora municipal y streaming simultáneo. Sin fricción, sin drama.',
    author: 'Irene M.',
    context: 'Adidas · Valencia Run',
    type: 'corporativo',
  },
  {
    quote: 'Los invitados no veían los equipos. Solo la casa, la música y la luz. Exactamente lo que pedimos.',
    author: 'Clara Ruiz',
    context: 'Boda íntima · Altea',
    type: 'boda',
  },
  {
    quote: 'El plenario se transformó en festival en hora y media. Mis jefes alucinaron, mi equipo alucinó. Yo también.',
    author: 'Javier P.',
    context: 'Coca-Cola · Summer Camp',
    type: 'corporativo',
  },
  {
    quote: 'La ceremonia, el banquete y la disco con un único equipo. Cero cortes, cero acoples. No sabía que se pudiera.',
    author: 'Lucía & Álex',
    context: 'Boda · Finca La Concepción',
    type: 'boda',
  },
  {
    quote: 'Ocho mil personas, múltiples artistas, cambios de escenario ajustadísimos. Estuvieron a la altura.',
    author: 'Coordinación · Fallas Valencia',
    context: 'Concierto plaza del Ayuntamiento',
    type: 'concierto',
  },
];
