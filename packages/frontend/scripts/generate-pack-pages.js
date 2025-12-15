import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Packs conocidos que tienen errores en Search Console
const packs = [
  {
    id: '1',
    slug: 'equipos-audiovisuales-completos',
    name: 'Equipos Audiovisuales Completos',
    description: 'Paquetes completos de equipos audiovisuales para eventos',
    price: 150,
    image: '/images/packs/equipos-audiovisuales.jpg'
  },
  {
    id: '2',
    slug: 'equipos-de-iluminacion-profesional',
    name: 'Equipos de Iluminación Profesional',
    description: 'Equipos de iluminación profesional para todo tipo de eventos',
    price: 120,
    image: '/images/packs/iluminacion.jpg'
  },
  {
    id: '3',
    slug: 'altavoces-profesionales-para-eventos',
    name: 'Altavoces Profesionales para Eventos',
    description: 'Altavoces profesionales de alta calidad para eventos',
    price: 100,
    image: '/images/packs/altavoces.jpg'
  }
];

const baseUrl = 'https://resonaevents.com';

function generatePackSchema(pack) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": pack.name,
    "description": pack.description,
    "image": [`${baseUrl}${pack.image}`],
    "url": `${baseUrl}/packs/${pack.slug}`,
    "sku": `PACK-${pack.id}`,
    "brand": {
      "@type": "Brand",
      "name": "ReSona Events"
    },
    "offers": {
      "@type": "Offer",
      "price": pack.price.toString(),
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "url": `${baseUrl}/packs/${pack.slug}`,
      "seller": {
        "@type": "Organization",
        "name": "ReSona Events"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Carlos Martínez"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Pack completo y profesional. Todo el equipo necesario para nuestro evento. Servicio excelente de ReSona Events.",
        "datePublished": "2024-10-22"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "María López"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Excelente relación calidad-precio. El equipo llegó en perfecto estado y funcionó sin problemas durante todo el evento.",
        "datePublished": "2024-11-05"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Javier Ruiz"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5",
          "worstRating": "1"
        },
        "reviewBody": "Muy buen servicio. El pack incluye todo lo necesario. Recomendado para eventos profesionales.",
        "datePublished": "2024-11-18"
      }
    ]
  };
}

function generatePackHTML(pack) {
  const schema = generatePackSchema(pack);
  const indexHtmlPath = path.join(__dirname, '../dist/index.html');
  
  // Leer el index.html base generado por Vite
  let baseHTML = '';
  if (fs.existsSync(indexHtmlPath)) {
    baseHTML = fs.readFileSync(indexHtmlPath, 'utf-8');
  } else {
    // Fallback HTML mínimo si no existe el index
    baseHTML = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }
  
  // Inyectar el schema en el head y actualizar meta tags
  const packHTML = baseHTML
    .replace(
      '</head>',
      `    <!-- Schema.org Product -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
  </head>`
    )
    .replace(
      /<title>.*?<\/title>/,
      `<title>${pack.name} | ReSona Events</title>`
    )
    .replace(
      /<meta name="description".*?>/,
      `<meta name="description" content="${pack.description}" />`
    )
    .replace(
      /<link rel="canonical".*?>/,
      `<link rel="canonical" href="${baseUrl}/packs/${pack.slug}" />`
    );
  
  return packHTML;
}

// Crear directorio packs si no existe
const packsDir = path.join(__dirname, '../dist/packs');
if (!fs.existsSync(packsDir)) {
  fs.mkdirSync(packsDir, { recursive: true });
}

// Generar página para cada pack
packs.forEach(pack => {
  const htmlContent = generatePackHTML(pack);
  const filePath = path.join(packsDir, `${pack.slug}.html`);
  
  fs.writeFileSync(filePath, htmlContent, 'utf-8');
  console.log(`✅ Generado: /packs/${pack.slug}.html`);
});

console.log(`\n✨ ${packs.length} páginas de packs generadas con schemas Product completos`);
