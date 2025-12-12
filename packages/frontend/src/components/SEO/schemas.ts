/**
 * Schema.org structured data para SEO
 * Ayuda a Google a entender el negocio y mejorar el posicionamiento local
 */

interface LocalBusinessSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  url: string;
  logo: string;
  image: string[];
  description: string;
  telephone?: string;
  email?: string;
  priceRange: string;
  address: {
    '@type': string;
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  geo: {
    '@type': string;
    latitude: string;
    longitude: string;
  };
  openingHoursSpecification: Array<{
    '@type': string;
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }>;
  areaServed: {
    '@type': string;
    name: string;
  };
  sameAs: string[];
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    reviewCount: string;
  };
  hasOfferCatalog: {
    '@type': string;
    name: string;
    itemListElement: Array<{
      '@type': string;
      itemOffered: {
        '@type': string;
        name: string;
        description: string;
      };
    }>;
  };
}

/**
 * Schema principal de LocalBusiness para ReSona Events
 */
export const getLocalBusinessSchema = (): any => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://resonaevents.com/#localbusiness',
  name: 'ReSona Events',
  alternateName: 'ReSona Events Valencia',
  url: 'https://resonaevents.com',
  logo: 'https://resonaevents.com/logo.png',
  image: [
    'https://resonaevents.com/og-image.jpg',
    'https://resonaevents.com/images/equipos-audiovisuales.jpg',
  ],
  description:
    'Empresa especializada en alquiler de equipos audiovisuales profesionales para eventos en Valencia. Sonido, iluminación, pantallas LED y equipos DJ. Servicio en Valencia y provincia.',
  priceRange: '€€',
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
      opens: '09:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '14:00',
    },
  ],
  areaServed: [
    {
      '@type': 'City',
      name: 'Valencia',
    },
    {
      '@type': 'State',
      name: 'Comunidad Valenciana',
    },
  ],
  sameAs: [
    // Añadir enlaces a redes sociales cuando estén disponibles
    'https://resonaevents.com',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Servicios de Alquiler',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Alquiler de Equipos de Sonido',
          description:
            'Altavoces profesionales, mesas de mezclas, micrófonos y sistemas de sonido completos para eventos.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'ReSona Events',
          },
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: '0',
        },
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Alquiler de Iluminación',
          description:
            'Focos LED, barras de iluminación, efectos especiales y sistemas de iluminación profesional.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'ReSona Events',
          },
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: '0',
        },
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Alquiler de Pantallas LED',
          description:
            'Pantallas LED de alta resolución, proyectores y sistemas de vídeo para presentaciones y eventos.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'ReSona Events',
          },
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: '0',
        },
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Equipos DJ Profesionales',
          description:
            'Controladoras, CDJs, mesas de mezclas DJ y equipos completos para DJs profesionales.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'ReSona Events',
          },
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: '0',
        },
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Montaje e Instalación',
          description:
            'Servicio técnico completo con montaje, instalación y soporte durante el evento.',
          provider: {
            '@type': 'LocalBusiness',
            name: 'ReSona Events',
          },
        },
        priceSpecification: {
          '@type': 'PriceSpecification',
          priceCurrency: 'EUR',
          price: '0',
        },
        availability: 'https://schema.org/InStock',
      },
    ],
  },
});

/**
 * Schema para organización (website principal)
 */
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
    'Alquiler profesional de equipos audiovisuales para eventos en Valencia',
  foundingDate: '2009',
  areaServed: {
    '@type': 'City',
    name: 'Valencia',
  },
});

/**
 * Schema para WebSite con SearchAction
 * Permite que Google muestre un cuadro de búsqueda en los resultados
 */
export const getWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://resonaevents.com/#website',
  name: 'ReSona Events',
  url: 'https://resonaevents.com',
  description: 'Alquiler profesional de equipos audiovisuales para eventos en Valencia',
  publisher: {
    '@id': 'https://resonaevents.com/#organization',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://resonaevents.com/productos?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'es-ES',
});

/**
 * Schema para breadcrumbs (migas de pan)
 */
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/**
 * Schema para FAQs
 */
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Schema para artículos de blog
 */
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
  author: {
    '@type': 'Person',
    name: post.author,
  },
  publisher: {
    '@type': 'Organization',
    name: 'ReSona Events',
    logo: {
      '@type': 'ImageObject',
      url: 'https://resonaevents.com/logo.png',
    },
  },
  datePublished: post.datePublished,
  dateModified: post.dateModified,
  image: post.image,
  url: post.url,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': post.url,
  },
});
