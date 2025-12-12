/**
 * Generador de Structured Data (Schema.org) para SEO
 * Mejora la visibilidad en Google con Rich Snippets
 */

export interface Product {
  id: string;
  slug?: string; // Slug para URLs amigables
  name: string;
  description: string;
  price?: number;
  pricePerDay?: number;
  image?: string;
  category?: string;
  brand?: string;
  sku?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}

export interface Organization {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  contactPoint?: {
    telephone: string;
    email: string;
    contactType: string;
  };
  socialMedia?: string[];
}

export interface Breadcrumb {
  name: string;
  url: string;
}

/**
 * Schema para Organización / LocalBusiness
 */
export const generateOrganizationSchema = (org: Organization) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: org.name,
    url: org.url,
    logo: org.logo,
    description: org.description,
    image: org.logo,
    ...(org.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: org.address.street,
        addressLocality: org.address.city,
        addressRegion: org.address.region,
        postalCode: org.address.postalCode,
        addressCountry: org.address.country,
      },
    }),
    ...(org.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: org.contactPoint.telephone,
        email: org.contactPoint.email,
        contactType: org.contactPoint.contactType,
      },
    }),
    ...(org.socialMedia && {
      sameAs: org.socialMedia,
    }),
  };
};

/**
 * Schema para Producto (con precio de alquiler)
 */
export const generateProductSchema = (product: Product, baseUrl: string) => {
  const price = product.pricePerDay || product.price || 0;
  
  // Asegurar que la imagen sea una URL completa
  const imageUrl = product.image?.startsWith('http') 
    ? product.image 
    : product.image 
      ? `${baseUrl}${product.image}` 
      : `${baseUrl}/og-image.jpg`;
  
  // Usar slug si está disponible, de lo contrario usar id
  const productUrl = product.slug 
    ? `${baseUrl}/productos/${product.slug}` 
    : `${baseUrl}/productos/${product.id}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: [imageUrl], // Google requiere array de imágenes
    url: productUrl, // URL del producto
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && {
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: price.toString(),
      priceCurrency: 'EUR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: productUrl, // URL de la oferta
      seller: {
        '@type': 'Organization',
        name: 'Resona Events',
      },
    },
    ...(product.rating && product.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviewCount.toString(),
      },
    }),
  };
};

/**
 * Schema para Breadcrumbs
 */
export const generateBreadcrumbSchema = (breadcrumbs: Breadcrumb[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: {
        '@type': 'WebPage',
        '@id': crumb.url,
        name: crumb.name,
      },
    })),
  };
};

/**
 * Schema para FAQ
 */
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};

/**
 * Schema para Artículo de Blog
 */
export const generateBlogPostSchema = (post: {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedDate: string;
  modifiedDate: string;
  url: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Resona Events',
      logo: {
        '@type': 'ImageObject',
        url: 'https://resonaevents.com/logo.png',
      },
    },
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': post.url,
    },
  };
};

/**
 * Schema para Servicio
 */
export const generateServiceSchema = (service: {
  name: string;
  description: string;
  provider: string;
  areaServed?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: service.provider,
    },
    ...(service.areaServed && {
      areaServed: {
        '@type': 'Place',
        name: service.areaServed,
      },
    }),
  };
};

/**
 * Schema para Evento
 */
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
  organizer?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    location: {
      '@type': 'Place',
      name: event.location,
    },
    ...(event.image && { image: event.image }),
    ...(event.organizer && {
      organizer: {
        '@type': 'Organization',
        name: event.organizer,
      },
    }),
  };
};

/**
 * Schema para WebSite con SearchAction
 */
export const generateWebSiteSchema = (baseUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Resona Events',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/productos?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
};
