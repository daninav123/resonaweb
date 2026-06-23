// ⚠️ DEPRECATED: Este archivo contiene schemas VIEJOS
// Usar en su lugar: /components/SEO/schemas.ts
// Este archivo se mantiene temporalmente para compatibilidad con código legacy

// NO USAR - Schema LocalBusiness viejo (usar getLocalBusinessSchema de /components/SEO/schemas.ts)
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://resonarent.com/#localbusiness",
  "name": "ReSona Rent",
  "url": "https://resonarent.com",
  "image": "https://resonarent.com/logo.png",
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
  "name": "ReSona Rent",
  "alternateName": "ReSona",
  "url": "https://resonarent.com",
  "logo": "https://resonarent.com/logo.png",
  "description": "Líder en alquiler de equipos audiovisuales para eventos en Valencia. Sonido, iluminación, fotografía y video profesional.",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34613881414",
    "contactType": "customer service",
    "email": "info@resonarent.com",
    "areaServed": "ES",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/resonarent",
    "https://www.instagram.com/resonarent",
    "https://www.linkedin.com/company/resonarent"
  ]
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ReSona Rent",
  "url": "https://resonarent.com",
  "description": "Alquiler de equipos audiovisuales para eventos. Calculadora de presupuesto online. Valencia, Alicante, Castellón.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://resonarent.com/productos?search={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ReSona Rent",
    "logo": {
      "@type": "ImageObject",
      "url": "https://resonarent.com/logo.png"
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
    "image": product.mainImageUrl || "https://resonarent.com/placeholder.jpg",
    "sku": product.sku,
    "mpn": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "ReSona Rent"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://resonarent.com/productos/${product.slug}`,
      "priceCurrency": "EUR",
      "price": product.pricePerDay,
      "priceValidUntil": priceValidUntil,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": {
        "@type": "Organization",
        "name": "ReSona Rent"
      }
    },
    // aggregateRating y review eliminados: se añadirán cuando existan reseñas reales vinculadas al producto
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
    "@id": "https://resonarent.com/#localbusiness",
    "name": "ReSona Rent",
    "image": "https://resonarent.com/logo.png",
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
  }
  // aggregateRating eliminado: se añadirá cuando existan reseñas reales agregadas de clientes
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
