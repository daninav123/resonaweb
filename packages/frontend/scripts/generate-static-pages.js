import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://resonaevents.com';

const pages = [
  {
    route: '/calculadora-evento',
    file: 'calculadora-evento.html',
    title: 'Calculadora de Presupuesto para Eventos Valencia - Calcula tu Alquiler | ReSona Events',
    description:
      'Calculadora online gratuita para presupuesto de alquiler de equipos de eventos en Valencia. Sonido, iluminación, audiovisuales para bodas, conciertos y eventos corporativos. Presupuesto instantáneo.',
    keywords:
      'calculadora presupuesto eventos valencia, calcular alquiler sonido valencia, presupuesto boda valencia, precio alquiler equipos eventos valencia, calculadora alquiler material',
    canonical: `${baseUrl}/calculadora-evento`,
    ogTitle: 'Calculadora de Eventos | ReSona Events',
    ogDescription:
      'Calculadora online para obtener un presupuesto estimado de alquiler de equipos para eventos en Valencia.',
  },
  {
    route: '/faqs',
    file: 'faqs.html',
    title: 'Preguntas Frecuentes (FAQs) | ReSona Events',
    description:
      'Resolvemos dudas frecuentes sobre alquiler de equipos para eventos: reservas, transporte, montaje, depósito y presupuesto.',
    keywords:
      'faqs alquiler equipos eventos, preguntas frecuentes alquiler sonido valencia, alquiler audiovisuales valencia',
    canonical: `${baseUrl}/faqs`,
    ogTitle: 'Preguntas Frecuentes | ReSona Events',
    ogDescription:
      'Dudas frecuentes sobre alquiler de equipos para eventos: reservas, transporte, montaje y presupuesto.',
  },
];

const seoLandings = [
  {
    route: '/alquiler-altavoces-valencia',
    file: 'alquiler-altavoces-valencia.html',
    title: 'Alquiler Altavoces Valencia 🔊 Desde 35€/día | JBL, QSC, Yamaha',
    description:
      '✅ Altavoces profesionales Valencia: JBL, QSC, Yamaha 400W-2000W. Instalación GRATIS en Valencia y área metropolitana. ⭐ 4.9/5. Eventos, bodas, fiestas. Presupuesto 24h ☎️ 613881414',
    keywords:
      'alquiler altavoces valencia, alquiler altavoces profesionales valencia, alquiler altavoces activos valencia, alquiler altavoces eventos valencia, alquiler PA valencia, alquiler altavoces JBL valencia, alquiler altavoces baratos valencia, alquiler sonido valencia',
    canonical: `${baseUrl}/alquiler-altavoces-valencia`,
    ogTitle: 'Alquiler Altavoces Valencia | ReSona Events',
    ogDescription:
      'Altavoces profesionales en Valencia con entrega e instalación. Presupuesto rápido.',
  },
  {
    route: '/alquiler-sonido-valencia',
    file: 'alquiler-sonido-valencia.html',
    title: 'Alquiler Sonido Valencia 🎵 Equipos Profesionales | ReSona Events',
    description:
      'Alquiler de sonido profesional en Valencia para bodas, eventos y conciertos. Equipos de alta gama, montaje y soporte técnico. Presupuesto en 24h.',
    keywords:
      'alquiler sonido valencia, alquiler equipos sonido valencia, alquiler PA valencia, sonido eventos valencia',
    canonical: `${baseUrl}/alquiler-sonido-valencia`,
    ogTitle: 'Alquiler Sonido Valencia | ReSona Events',
    ogDescription:
      'Sonido profesional en Valencia para eventos. Presupuesto rápido.',
  },
  {
    route: '/alquiler-iluminacion-valencia',
    file: 'alquiler-iluminacion-valencia.html',
    title: 'Alquiler Iluminación Valencia 💡 Iluminación Profesional | ReSona Events',
    description:
      'Alquiler de iluminación profesional en Valencia: focos LED, moving heads, control DMX y ambientación. Montaje y soporte técnico. Presupuesto en 24h.',
    keywords:
      'alquiler iluminacion valencia, iluminacion eventos valencia, alquiler luces valencia, iluminacion bodas valencia',
    canonical: `${baseUrl}/alquiler-iluminacion-valencia`,
    ogTitle: 'Alquiler Iluminación Valencia | ReSona Events',
    ogDescription:
      'Iluminación profesional en Valencia para eventos. Presupuesto rápido.',
  },
  {
    route: '/sonido-bodas-valencia',
    file: 'sonido-bodas-valencia.html',
    title: 'Sonido para Bodas en Valencia 💍 | ReSona Events',
    description:
      'Sonido profesional para bodas en Valencia: ceremonia, cóctel, banquete y fiesta. Equipos y técnico. Montaje incluido. Presupuesto en 24h.',
    keywords:
      'sonido bodas valencia, alquiler sonido boda valencia, sonido ceremonia valencia, dj boda valencia',
    canonical: `${baseUrl}/sonido-bodas-valencia`,
    ogTitle: 'Sonido para Bodas Valencia | ReSona Events',
    ogDescription:
      'Sonido profesional para bodas en Valencia. Presupuesto rápido.',
  },
  {
    route: '/alquiler-sonido-torrent',
    file: 'alquiler-sonido-torrent.html',
    title: 'Alquiler Sonido Torrent 🎵 | ReSona Events',
    description:
      'Alquiler de sonido en Torrent para eventos, bodas y fiestas. Equipos profesionales, entrega y montaje. Presupuesto en 24h.',
    keywords:
      'alquiler sonido torrent, sonido eventos torrent, alquiler altavoces torrent',
    canonical: `${baseUrl}/alquiler-sonido-torrent`,
    ogTitle: 'Alquiler Sonido Torrent | ReSona Events',
    ogDescription:
      'Sonido profesional en Torrent para eventos. Presupuesto rápido.',
  },
  {
    route: '/servicios/alquiler-sonido-valencia',
    file: 'servicios-alquiler-sonido-valencia.html',
    title: 'Alquiler Sonido Valencia 🔊 Desde 35€/día | Eventos, Bodas, Fiestas',
    description:
      '✅ Alquiler de sonido profesional en Valencia y área metropolitana. Equipos JBL, QSC, Yamaha. Instalación GRATIS. 15 años de experiencia. Presupuesto en 24h. ⭐ 4.9/5 estrellas. ☎️ 613881414',
    keywords:
      'alquiler sonido valencia, alquiler altavoces valencia, alquiler equipos sonido valencia, sonido profesional valencia, alquiler PA valencia, sistema sonido eventos valencia, alquiler subwoofer valencia',
    canonical: `${baseUrl}/alquiler-sonido-valencia`,
    ogTitle: 'Alquiler Sonido Valencia | ReSona Events',
    ogDescription: 'Sonido profesional en Valencia para eventos. Presupuesto rápido.',
  },
  {
    route: '/servicios/sonido-bodas-valencia',
    file: 'servicios-sonido-bodas-valencia.html',
    title: 'Sonido para Bodas en Valencia | Alquiler Equipos Profesionales',
    description:
      'Alquiler de sonido profesional para bodas en Valencia. Ceremonia, banquete y fiesta con equipos de alta calidad. Microfonía inalámbrica y técnico incluido. Más de 500 bodas realizadas. ☎️ 613881414',
    keywords:
      'sonido bodas valencia, alquiler sonido boda valencia, equipos audio bodas valencia, microfono boda valencia, sonido ceremonia valencia, sonido banquete valencia, musica boda valencia',
    canonical: `${baseUrl}/sonido-bodas-valencia`,
    ogTitle: 'Sonido para Bodas Valencia | ReSona Events',
    ogDescription: 'Sonido profesional para bodas en Valencia. Presupuesto rápido.',
  },
];

function ensureReplaced(html, replacer) {
  const result = replacer(html);
  return result;
}

function setOrReplaceMeta(html, nameOrProperty, attrName, content) {
  const escaped = nameOrProperty.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const re = new RegExp(`<meta\\s+[^>]*${attrName}="${escaped}"[^>]*>`, 'i');
  if (re.test(html)) {
    return html.replace(re, `<meta ${attrName}="${nameOrProperty}" content="${content}" />`);
  }
  return html.replace('</head>', `  <meta ${attrName}="${nameOrProperty}" content="${content}" />\n</head>`);
}

function setCanonical(html, href) {
  const re = /<link\s+rel="canonical"[^>]*>/i;
  if (re.test(html)) {
    return html.replace(re, `<link rel="canonical" href="${href}" />`);
  }
  return html.replace('</head>', `  <link rel="canonical" href="${href}" />\n</head>`);
}

function setTitle(html, title) {
  const re = /<title>.*?<\/title>/is;
  if (re.test(html)) {
    return html.replace(re, `<title>${title}</title>`);
  }
  return html.replace('</head>', `  <title>${title}</title>\n</head>`);
}

function injectSchemas(html, schemas) {
  if (!schemas || schemas.length === 0) return html;
  const scripts = schemas
    .map((schema) => `  <script type="application/ld+json">\n${JSON.stringify(schema)}\n  </script>`)
    .join('\n');
  return html.replace('</head>', `${scripts}\n</head>`);
}

function buildPageHTML(baseHTML, page) {
  let html = baseHTML;
  html = ensureReplaced(html, (h) => setTitle(h, page.title));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'description', 'name', page.description));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'keywords', 'name', page.keywords));
  html = ensureReplaced(html, (h) => setCanonical(h, page.canonical));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'og:url', 'property', page.canonical));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'twitter:url', 'property', page.canonical));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'og:title', 'property', page.ogTitle || page.title));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'twitter:title', 'property', page.ogTitle || page.title));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'og:description', 'property', page.ogDescription || page.description));
  html = ensureReplaced(html, (h) => setOrReplaceMeta(h, 'twitter:description', 'property', page.ogDescription || page.description));

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url: page.canonical,
    name: page.title,
    description: page.description,
    inLanguage: 'es-ES',
  };

  let extraSchemas = [];
  if (page.route === '/faqs') {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cómo funciona el alquiler de equipos con ReSona Events?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Puedes navegar por el catálogo, seleccionar productos y fechas, y completar la reserva. Si prefieres una recomendación personalizada, utiliza la calculadora de eventos y te prepararemos un presupuesto según tipo de evento, asistentes, duración y ubicación.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Puedo calcular un presupuesto online para mi evento?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí. Puedes usar nuestra calculadora para estimar el presupuesto de tu evento y solicitar una propuesta. Te recomendamos empezar por la calculadora si no tienes claro qué equipo necesitas.',
          },
        },
        {
          '@type': 'Question',
          name: '¿Incluís transporte, montaje y desmontaje?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Depende del servicio seleccionado. En muchos casos podemos incluir transporte y montaje (especialmente en Valencia y área metropolitana). Indícanos la ubicación y horarios para darte una propuesta clara.',
          },
        },
      ],
    };
    extraSchemas = [faqSchema];
  }

  html = injectSchemas(html, [webPageSchema, ...extraSchemas]);
  return html;
}

function getBaseHTML() {
  const indexHtmlPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexHtmlPath)) {
    return fs.readFileSync(indexHtmlPath, 'utf-8');
  }
  return `<!doctype html>
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

const baseHTML = getBaseHTML();
const distDir = path.join(__dirname, '../dist');

for (const page of [...pages, ...seoLandings]) {
  const htmlContent = buildPageHTML(baseHTML, page);
  const outPath = path.join(distDir, page.file);
  fs.writeFileSync(outPath, htmlContent, 'utf-8');
  console.log(`✅ Generado: ${page.route} -> ${page.file}`);
}
