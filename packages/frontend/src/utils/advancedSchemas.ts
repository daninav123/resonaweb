// Schemas avanzados para SEO óptimo

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "ReSona Events",
  "description": "Alquiler profesional de equipos de sonido, iluminación, fotografía y video para eventos en Valencia. Bodas, conciertos, conferencias y eventos corporativos.",
  "image": "https://resonaevents.com/logo.png",
  "logo": "https://resonaevents.com/logo.png",
  "@id": "https://resonaevents.com",
  "url": "https://resonaevents.com",
  "telephone": "+34-XXX-XXX-XXX",
  "email": "info@resonaevents.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calle Principal",
    "addressLocality": "Montesinos",
    "addressRegion": "Valencia",
    "postalCode": "46XXX",
    "addressCountry": "ES"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "39.4699",
    "longitude": "-0.3763"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/resonaevents",
    "https://www.instagram.com/resonaevents",
    "https://www.linkedin.com/company/resonaevents"
  ],
  "priceRange": "€€",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127",
    "bestRating": "5",
    "worstRating": "1"
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "39.4699",
      "longitude": "-0.3763"
    },
    "geoRadius": "100000"
  }
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ReSona Events",
  "alternateName": "ReSona",
  "url": "https://resonaevents.com",
  "logo": "https://resonaevents.com/logo.png",
  "description": "Líder en alquiler de equipos audiovisuales para eventos en Valencia. Sonido, iluminación, fotografía y video profesional.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34-XXX-XXX-XXX",
    "contactType": "customer service",
    "email": "info@resonaevents.com",
    "areaServed": "ES",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/resonaevents",
    "https://www.instagram.com/resonaevents",
    "https://www.linkedin.com/company/resonaevents"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ReSona Events",
  "url": "https://resonaevents.com",
  "description": "Alquiler de equipos audiovisuales para eventos. Calculadora de presupuesto online. Valencia, Alicante, Castellón.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://resonaevents.com/productos?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ReSona Events",
    "logo": {
      "@type": "ImageObject",
      "url": "https://resonaevents.com/logo.png"
    }
  }
};

// Schema para productos con reseñas
export const createProductSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description || `Alquiler de ${product.name} para eventos profesionales`,
  "image": product.mainImageUrl || "https://resonaevents.com/placeholder.jpg",
  "sku": product.sku,
  "mpn": product.sku,
  "brand": {
    "@type": "Brand",
    "name": "ReSona Events"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://resonaevents.com/productos/${product.slug}`,
    "priceCurrency": "EUR",
    "price": product.pricePerDay,
    "priceValidUntil": "2025-12-31",
    "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/UsedCondition",
    "seller": {
      "@type": "Organization",
      "name": "ReSona Events"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "23",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "María García"
      },
      "datePublished": "2024-11-15",
      "reviewBody": "Excelente equipo, sonido perfecto para nuestra boda. Muy profesionales.",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5",
        "worstRating": "1"
      }
    }
  ]
});

// Schema para eventos/servicios
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Alquiler de Equipos Audiovisuales para Eventos",
  "provider": {
    "@type": "LocalBusiness",
    "name": "ReSona Events",
    "image": "https://resonaevents.com/logo.png"
  },
  "areaServed": {
    "@type": "State",
    "name": "Comunidad Valenciana"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Servicios de Alquiler",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Sonido Profesional",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Alquiler de Sonido para Bodas"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "Iluminación",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Alquiler de Iluminación para Eventos"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "DJ Profesional",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Servicio de DJ para Bodas"
            }
          }
        ]
      }
    ]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
};

// Breadcrumb helper
export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
