/**
 * Schema.org JSON-LD estructuras para SEO
 */

// Schema de la Organización
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Resona Events',
  url: 'https://resona.com',
  logo: 'https://resona.com/logo-resona.svg',
  description: 'Alquiler profesional de equipos de sonido, iluminación y audiovisuales para eventos',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+34-600-123-456',
    contactType: 'customer service',
    email: 'info@resona.com',
    availableLanguage: ['Spanish'],
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ES',
    addressLocality: 'Valencia',
  },
  sameAs: [
    'https://www.facebook.com/resonaevents',
    'https://www.instagram.com/resonaevents',
    'https://twitter.com/resonaevents',
  ],
};

// Schema del sitio web
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Resona Events',
  url: 'https://resona.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://resona.com/productos?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

// Schema de Local Business
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://resona.com',
  name: 'Resona Events',
  image: 'https://resona.com/logo-resona.svg',
  description: 'Alquiler de material profesional para eventos: sonido, iluminación, fotografía y video',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'ES',
    addressLocality: 'Valencia',
  },
  telephone: '+34-600-123-456',
  email: 'info@resona.com',
  url: 'https://resona.com',
  priceRange: '€€',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: '39.4699',
      longitude: '-0.3763',
    },
    geoRadius: '100',
  },
};

// Schema para producto individual
export const productSchema = (product: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.imageUrl,
  brand: {
    '@type': 'Brand',
    name: product.brand || 'Resona Events',
  },
  offers: {
    '@type': 'Offer',
    url: `https://resona.com/productos/${product.slug}`,
    priceCurrency: 'EUR',
    price: product.pricePerDay,
    availability: product.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    seller: {
      '@type': 'Organization',
      name: 'Resona Events',
    },
  },
  ...(product.category && {
    category: product.category.name,
  }),
});

// Schema para lista de productos
export const productListSchema = (products: any[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: products.map((product, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: product.name,
      url: `https://resona.com/productos/${product.slug}`,
      image: product.imageUrl,
      offers: {
        '@type': 'Offer',
        price: product.pricePerDay,
        priceCurrency: 'EUR',
      },
    },
  })),
});

// Schema para breadcrumb
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

// Schema para FAQPage
export const faqSchema = (faqs: { question: string; answer: string }[]) => ({
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

// Schema para Service
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Alquiler de Material para Eventos',
  description: 'Servicio profesional de alquiler de equipos de sonido, iluminación, fotografía y video para todo tipo de eventos',
  provider: {
    '@type': 'Organization',
    name: 'Resona Events',
    url: 'https://resona.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Spain',
  },
  serviceType: ['Alquiler de Sonido', 'Alquiler de Iluminación', 'Alquiler de Equipos Audiovisuales'],
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '50',
    highPrice: '500',
  },
};

// Schema para evento (calculadora)
export const eventSchema = (eventType: string, attendees: number) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: `${eventType} - Calculadora de Presupuesto`,
  description: `Calcula el presupuesto estimado para tu ${eventType} con ${attendees} asistentes`,
  organizer: {
    '@type': 'Organization',
    name: 'Resona Events',
    url: 'https://resona.com',
  },
  offers: {
    '@type': 'Offer',
    url: 'https://resona.com/calculadora-evento',
    priceCurrency: 'EUR',
  },
});
