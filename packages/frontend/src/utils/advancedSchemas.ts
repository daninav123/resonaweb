// ⚠️ DEPRECATED: Este archivo contiene schemas VIEJOS
// Usar en su lugar: /components/SEO/schemas.ts
// Este archivo se mantiene temporalmente para compatibilidad con código legacy

// NO USAR - Schema LocalBusiness viejo (usar getLocalBusinessSchema de /components/SEO/schemas.ts)
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://resonaevents.com/#localbusiness",
  "name": "ReSona Events",
  "url": "https://resonaevents.com",
  "image": "https://resonaevents.com/logo.png",
  "telephone": "+34613881414",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "C/ de l'Illa Cabrera, 13",
    "addressLocality": "València",
    "postalCode": "46026",
    "addressRegion": "Comunidad Valenciana",
    "addressCountry": "ES"
  },
  "priceRange": "€€"
}; // Vacío intencionalmente para forzar error si se usa

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
    "telephone": "+34613881414",
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

// Schema para producto individual (SEO)
export const advancedProductSchema = (product: any) => {
  // Fecha dinámica: siempre un año en el futuro
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const priceValidUntil = nextYear.toISOString().split('T')[0]; // YYYY-MM-DD

  return {
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
      "priceValidUntil": priceValidUntil,
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
        },
        "itemReviewed": {
          "@type": "Product",
          "name": product.name
        }
      }
    ]
  };
};

// Schema para eventos/servicios
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Alquiler de Equipos Audiovisuales para Eventos",
  "serviceType": "Alquiler de Equipos Audiovisuales para Eventos",
  "description": "Servicio profesional de alquiler de equipos de sonido, iluminación y audiovisuales para todo tipo de eventos en Valencia",
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://resonaevents.com/#localbusiness",
    "name": "ReSona Events",
    "image": "https://resonaevents.com/logo.png",
    "telephone": "+34613881414",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "C/ de l'Illa Cabrera, 13",
      "addressLocality": "Valencia",
      "postalCode": "46026",
      "addressRegion": "Comunidad Valenciana",
      "addressCountry": "ES"
    },
    "priceRange": "€€"
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
