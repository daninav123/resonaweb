/**
 * Schema.org structured data para ReSona Events.
 * Orientado a producción integral de eventos, no a alquiler.
 */

export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'EventPlanner'],
  '@id': 'https://resonaevents.com/#localbusiness',
  name: 'ReSona Events',
  alternateName: 'ReSona Events Valencia',
  url: 'https://resonaevents.com',
  logo: 'https://resonaevents.com/logo.png',
  image: [
    'https://resonaevents.com/og-image.png',
  ],
  description:
    'Estudio de producción audiovisual en Valencia. Bodas, eventos corporativos, conciertos y eventos privados llave en mano. Sonido, iluminación, DJ, vídeo y producción técnica integral.',
  priceRange: '€€€',
  telephone: '+34613881414',
  email: 'info@resonaevents.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: "C/ de l'Illa Cabrera, 13",
    addressLocality: 'València',
    postalCode: '46026',
    addressRegion: 'Comunidad Valenciana',
    addressCountry: 'ES',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '39.4523',
    longitude: '-0.3744',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '19:00',
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Valencia' },
    { '@type': 'State', name: 'Comunidad Valenciana' },
  ],
  sameAs: [
    'https://resonaevents.com',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de producción audiovisual',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Producción integral de bodas',
          description:
            'Ceremonia, cóctel, banquete y disco con un único equipo técnico dedicado. Sonido, iluminación y DJ coordinados de principio a fin.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Producción de eventos corporativos',
          description:
            'Convenciones, lanzamientos, galas y kick-offs. Line array, videoescenario, streaming multicámara y régie centralizada.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Producción de conciertos y festivales',
          description:
            'Line array gran formato, iluminación espectáculo, backline y producción técnica para plazas, festivales municipales y marcas.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Sonido profesional',
          description: 'Diseño y operación de sistemas de sonido line array, monitoraje y mesa digital con técnico FOH.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Iluminación escénica y decorativa',
          description: 'Iluminación arquitectónica, de escenarios y decorativa con control DMX programado y técnico lumínico.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Vídeo y streaming',
          description: 'Videoescenario LED, cámaras multicámara, streaming multiplataforma y edición post-evento.',
          provider: { '@id': 'https://resonaevents.com/#organization' },
        },
      },
    ],
  },
});

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://resonaevents.com/#organization',
  name: 'ReSona Events',
  url: 'https://resonaevents.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://resonaevents.com/logo.png',
    width: 600,
    height: 200,
  },
  description:
    'Estudio de producción audiovisual para bodas, eventos corporativos, conciertos y eventos privados en Valencia.',
  foundingDate: '2011',
  areaServed: { '@type': 'City', name: 'Valencia' },
});

export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://resonaevents.com/#website',
  name: 'ReSona Events',
  url: 'https://resonaevents.com',
  description:
    'Producción integral de bodas y eventos en Valencia.',
  publisher: { '@id': 'https://resonaevents.com/#organization' },
  inLanguage: 'es-ES',
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: { '@type': 'WebPage', '@id': item.url, name: item.name },
  })),
});

export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
});

export const getServiceSchema = (service: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  url: service.url,
  provider: { '@id': 'https://resonaevents.com/#organization' },
  areaServed: { '@type': 'City', name: 'Valencia' },
});

export const getEventCaseSchema = (cas: {
  name: string;
  description: string;
  url: string;
  image: string;
  startDate?: string;
  location: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: cas.name,
  description: cas.description,
  image: cas.image,
  ...(cas.startDate ? { startDate: cas.startDate } : {}),
  location: {
    '@type': 'Place',
    name: cas.location,
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Comunidad Valenciana',
      addressCountry: 'ES',
    },
  },
  organizer: { '@id': 'https://resonaevents.com/#organization' },
  url: cas.url,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
});

export const getBlogPostSchema = (post: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.description,
  author: { '@type': 'Person', name: post.author },
  publisher: {
    '@type': 'Organization',
    name: 'ReSona Events',
    logo: { '@type': 'ImageObject', url: 'https://resonaevents.com/logo.png' },
  },
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  image: post.image,
  url: post.url,
  mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
});
