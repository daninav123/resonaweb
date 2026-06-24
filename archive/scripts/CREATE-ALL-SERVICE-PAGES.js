/**
 * Script para crear las 20 páginas de servicio automáticamente
 * Este script genera todos los archivos .tsx necesarios
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'packages', 'frontend', 'src', 'pages', 'services');

// Crear directorio si no existe
if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

const services = [
  // SONIDO (7)
  {
    fileName: 'AlquilerAltavocesProfesionales',
    title: 'Alquiler de Altavoces Profesionales | JBL, QSC, EV | ReSona Events',
    metaDescription: 'Alquiler de altavoces profesionales en Valencia. JBL, QSC, EV. Desde 200W hasta Line Array. Técnico incluido. ☎️ 613 88 14 14',
    keywords: 'alquiler altavoces, altavoces profesionales valencia, alquiler altavoces JBL',
    heroTitle: 'Alquiler de Altavoces Profesionales',
    heroSubtitle: 'JBL, QSC, EV - Potencia y calidad para tu evento',
    intro: 'Alquiler de <strong>altavoces profesionales</strong> en Valencia de las mejores marcas: JBL PRX, QSC K series, Electro-Voice. Desde altavoces portátiles 200W hasta sistemas Line Array 2000W+ para grandes eventos.',
    url: '/servicios/alquiler-altavoces-profesionales'
  },
  {
    fileName: 'AlquilerMicrofonosInalambricos',
    title: 'Alquiler de Micrófonos Inalámbricos | Shure, Sennheiser | Valencia',
    metaDescription: 'Alquiler de micrófonos inalámbricos profesionales. Shure, Sennheiser. Mano, solapa, diadema. Técnico incluido. ☎️ 613 88 14 14',
    keywords: 'alquiler micrófonos inalámbricos, micrófonos shure valencia, alquiler micros',
    heroTitle: 'Alquiler de Micrófonos Inalámbricos',
    heroSubtitle: 'Shure y Sennheiser - Libertad y calidad de audio',
    intro: 'Alquiler de <strong>micrófonos inalámbricos profesionales</strong>: Shure SM58 Wireless, Sennheiser EW series, micrófonos de solapa y diadema. Perfectos para presentaciones, bodas y eventos corporativos.',
    url: '/servicios/alquiler-microfonos-inalambricos'
  },
  {
    fileName: 'SonidoBodasValencia',
    title: 'Sonido Profesional para Bodas en Valencia | Ceremonia + Banquete + Fiesta',
    metaDescription: 'Sonido completo para bodas en Valencia. Ceremonia, discursos y fiesta. Equipos profesionales + técnico. Desde 600€. ☎️ 613 88 14 14',
    keywords: 'sonido bodas valencia, alquiler sonido boda, sonido ceremonia valencia',
    heroTitle: 'Sonido Profesional para Bodas en Valencia',
    heroSubtitle: 'Ceremonia, banquete y fiesta - Sonido perfecto todo el día',
    intro: '<strong>Sonido completo para bodas</strong> en Valencia: ceremonia al aire libre, discursos con micrófonos inalámbricos y equipo DJ para la fiesta. Más de 500 bodas realizadas. Técnico especializado incluido.',
    url: '/servicios/sonido-bodas-valencia'
  },
  {
    fileName: 'SonidoEventosCorporativos',
    title: 'Sonido para Eventos Corporativos Valencia | Conferencias y Presentaciones',
    metaDescription: 'Sonido profesional para eventos corporativos. Conferencias, presentaciones, cenas de empresa. Streaming incluido. ☎️ 613 88 14 14',
    keywords: 'sonido eventos corporativos valencia, audiovisuales empresa, sonido conferencias',
    heroTitle: 'Sonido para Eventos Corporativos',
    heroSubtitle: 'Profesionalidad y claridad para tu empresa',
    intro: '<strong>Sonido profesional para eventos corporativos</strong>: conferencias, presentaciones de producto, cenas de empresa, formaciones. Audio para streaming y grabación incluido.',
    url: '/servicios/sonido-eventos-corporativos-valencia'
  },
  {
    fileName: 'AlquilerMesaMezclaDJ',
    title: 'Alquiler de Mesa de Mezclas DJ | Pioneer, Allen & Heath | Valencia',
    metaDescription: 'Alquiler de mesas de mezclas DJ profesionales. Pioneer DJM-900, Allen & Heath. Con CDJs. Técnico incluido. ☎️ 613 88 14 14',
    keywords: 'alquiler mesa mezclas dj, mesa pioneer valencia, alquiler djm-900',
    heroTitle: 'Alquiler de Mesa de Mezclas DJ',
    heroSubtitle: 'Pioneer, Allen & Heath - Mezcla profesional',
    intro: 'Alquiler de <strong>mesas de mezclas DJ profesionales</strong>: Pioneer DJM-900 NXS2, Allen & Heath Xone:96, DJM-750. Opción con CDJs y técnico.',
    url: '/servicios/alquiler-mesa-mezclas-dj'
  },
  {
    fileName: 'AlquilerSubwoofers',
    title: 'Alquiler de Subwoofers Profesionales | Graves Potentes | Valencia',
    metaDescription: 'Alquiler de subwoofers profesionales en Valencia. JBL, QSC. Desde 400W hasta 2000W. Graves potentes para tu evento. ☎️ 613 88 14 14',
    keywords: 'alquiler subwoofers valencia, subwoofer profesional, graves eventos',
    heroTitle: 'Alquiler de Subwoofers Profesionales',
    heroSubtitle: 'Graves potentes y profundos para tu fiesta',
    intro: 'Alquiler de <strong>subwoofers profesionales</strong> en Valencia. JBL SUB series, QSC KW181. De 400W a 2000W. Perfectos para música electrónica, reggaeton y eventos con mucho grave.',
    url: '/servicios/alquiler-subwoofers-graves'
  },

  // ILUMINACIÓN (6)
  {
    fileName: 'AlquilerIluminacionBodas',
    title: 'Alquiler de Iluminación para Bodas Valencia | Ambiental + Arquitectónica',
    metaDescription: 'Iluminación profesional para bodas en Valencia. Ambiental, arquitectónica, pista de baile. Transforma tu espacio. Desde 400€. ☎️ 613 88 14 14',
    keywords: 'iluminación bodas valencia, luces boda, iluminación ambiental boda',
    heroTitle: 'Iluminación Profesional para Bodas',
    heroSubtitle: 'Transforma tu espacio con luz perfecta',
    intro: '<strong>Iluminación completa para bodas</strong> en Valencia: luces ambientales LED, iluminación arquitectónica uplights, efectos pista de baile. Crea la atmósfera perfecta para tu gran día.',
    url: '/servicios/alquiler-iluminacion-bodas-valencia'
  },
  {
    fileName: 'IluminacionLEDProfesional',
    title: 'Iluminación LED Profesional para Eventos | RGB, RGBW | Valencia',
    metaDescription: 'Iluminación LED profesional para eventos. Focos PAR LED RGB/RGBW, barras LED, uplights. Control DMX. ☎️ 613 88 14 14',
    keywords: 'iluminación led eventos, luces led profesionales valencia, focos par led',
    heroTitle: 'Iluminación LED Profesional',
    heroSubtitle: 'Millones de colores para tu evento',
    intro: '<strong>Iluminación LED profesional</strong> para eventos: focos PAR LED RGB/RGBW, barras LED, uplights, bañadores. Control DMX. Colores personalizados para tu evento.',
    url: '/servicios/iluminacion-led-profesional'
  },
  {
    fileName: 'IluminacionEscenarios',
    title: 'Iluminación para Escenarios | Profesional | Conciertos y Shows | Valencia',
    metaDescription: 'Iluminación profesional para escenarios. Moving heads, PAR LED, seguimientos. Para conciertos, shows, teatro. ☎️ 613 88 14 14',
    keywords: 'iluminación escenarios valencia, luces conciertos, iluminación shows',
    heroTitle: 'Iluminación Profesional para Escenarios',
    heroSubtitle: 'Da vida a tu show con luz espectacular',
    intro: '<strong>Iluminación profesional para escenarios</strong>: moving heads, PAR LED de alta potencia, seguimientos, strobos. Para conciertos, shows, teatro y espectáculos.',
    url: '/servicios/iluminacion-escenarios-eventos'
  },
  {
    fileName: 'AlquilerMovingHeads',
    title: 'Alquiler de Moving Heads | Luces Inteligentes | Valencia',
    metaDescription: 'Alquiler de moving heads profesionales. Luces robotizadas inteligentes. Beam, Spot, Wash. Control DMX. ☎️ 613 88 14 14',
    keywords: 'alquiler moving heads valencia, luces robotizadas, luces inteligentes eventos',
    heroTitle: 'Alquiler de Moving Heads',
    heroSubtitle: 'Luces inteligentes que siguen la música',
    intro: 'Alquiler de <strong>moving heads profesionales</strong>: Beam, Spot, Wash. Luces robotizadas inteligentes con movimiento Pan/Tilt, gobos, prisma. Control DMX. Perfectas para discotecas móviles y eventos.',
    url: '/servicios/alquiler-moving-heads'
  },
  {
    fileName: 'IluminacionArquitectonica',
    title: 'Iluminación Arquitectónica para Eventos | Uplights LED | Valencia',
    metaDescription: 'Iluminación arquitectónica para eventos. Uplights LED RGB, bañadores de fachada. Ilumina tu espacio. ☎️ 613 88 14 14',
    keywords: 'iluminación arquitectónica valencia, uplights led, iluminación fachadas eventos',
    heroTitle: 'Iluminación Arquitectónica',
    heroSubtitle: 'Destaca la belleza de tu espacio',
    intro: '<strong>Iluminación arquitectónica</strong> para eventos: uplights LED RGB de batería, bañadores de fachada potentes. Ilumina paredes, jardines, edificios con colores personalizados.',
    url: '/servicios/iluminacion-arquitectonica-eventos'
  },
  {
    fileName: 'AlquilerLaser',
    title: 'Alquiler de Láser Profesional para Eventos | Efectos Espectaculares | Valencia',
    metaDescription: 'Alquiler de láser profesional RGB. Efectos espectaculares para tu evento. Control DMX, sincronización música. ☎️ 613 88 14 14',
    keywords: 'alquiler laser eventos valencia, laser profesional, efectos laser',
    heroTitle: 'Alquiler de Láser Profesional',
    heroSubtitle: 'Efectos de luz espectaculares',
    intro: 'Alquiler de <strong>láser profesional RGB</strong> para eventos. Efectos de rayos láser sincronizados con música. Control DMX. Perfecto para conciertos, discotecas móviles y grandes eventos.',
    url: '/servicios/alquiler-laser-eventos'
  },

  // VIDEO Y PANTALLAS (3)
  {
    fileName: 'AlquilerPantallasLED',
    title: 'Alquiler de Pantallas LED Modulares | Eventos | Valencia',
    metaDescription: 'Alquiler de pantallas LED modulares para eventos. Desde 2x2m hasta 10x6m. P2.5, P3.9, P5. Interior y exterior. ☎️ 613 88 14 14',
    keywords: 'alquiler pantallas led valencia, pantallas led eventos, videowall',
    heroTitle: 'Alquiler de Pantallas LED Modulares',
    heroSubtitle: 'Imagen perfecta en cualquier tamaño',
    intro: 'Alquiler de <strong>pantallas LED modulares</strong> para eventos: P2.5 (alta resolución), P3.9 (estándar), P5 (exterior). Tamaños desde 2x2m hasta 10x6m. Perfectas para presentaciones, conciertos, bodas.',
    url: '/servicios/alquiler-pantallas-led-eventos'
  },
  {
    fileName: 'AlquilerProyectores',
    title: 'Alquiler de Proyectores Profesionales | Alta Luminosidad | Valencia',
    metaDescription: 'Alquiler de proyectores profesionales. 3.000-12.000 lúmenes. Full HD, 4K. Pantallas de proyección. Técnico incluido. ☎️ 613 88 14 14',
    keywords: 'alquiler proyectores valencia, proyector profesional eventos, proyector alta luminosidad',
    heroTitle: 'Alquiler de Proyectores Profesionales',
    heroSubtitle: 'Alta luminosidad para presentaciones perfectas',
    intro: 'Alquiler de <strong>proyectores profesionales</strong>: 3.000-12.000 lúmenes. Full HD y 4K. Con pantallas de proyección. Perfectos para conferencias, presentaciones, formaciones.',
    url: '/servicios/alquiler-proyectores-profesionales'
  },
  {
    fileName: 'VideoescenariosStreaming',
    title: 'Videoescenarios y Streaming para Eventos | Producción Completa | Valencia',
    metaDescription: 'Videoescenarios profesionales y streaming para eventos. Múltiples cámaras, producción en vivo, streaming YouTube/Facebook. ☎️ 613 88 14 14',
    keywords: 'videoescenario eventos valencia, streaming eventos, producción video en vivo',
    heroTitle: 'Videoescenarios y Streaming',
    heroSubtitle: 'Producción audiovisual completa para tu evento',
    intro: '<strong>Videoescenarios profesionales y streaming</strong>: múltiples cámaras, mesa de vídeo, pantallas LED. Streaming en vivo YouTube, Facebook, Zoom. Grabación profesional incluida.',
    url: '/servicios/videoescenarios-streaming-eventos'
  },

  // OTROS SERVICIOS (4)
  {
    fileName: 'AlquilerDJValencia',
    title: 'Alquiler de DJ Profesional en Valencia | Equipos Completos | ReSona Events',
    metaDescription: 'Alquiler de DJ profesional para bodas y eventos. Equipos Pioneer CDJ + DJM. Música personalizada. Desde 400€. ☎️ 613 88 14 14',
    keywords: 'alquiler dj valencia, dj profesional bodas, alquiler equipo dj',
    heroTitle: 'Alquiler de DJ Profesional',
    heroSubtitle: 'Música perfecta para tu celebración',
    intro: 'Alquiler de <strong>DJ profesional</strong> para bodas y eventos en Valencia. Equipos Pioneer CDJ + DJM, biblioteca musical 10.000+ canciones. Música personalizada a tus gustos. Más de 300 eventos al año.',
    url: '/servicios/alquiler-dj-valencia'
  },
  {
    fileName: 'ProduccionTecnicaEventos',
    title: 'Producción Técnica Completa de Eventos | Audiovisual | Valencia',
    metaDescription: 'Producción técnica completa: sonido, iluminación, vídeo, escenario. Gestión integral de tu evento. Técnicos especializados. ☎️ 613 88 14 14',
    keywords: 'producción eventos valencia, producción técnica audiovisual, gestión técnica eventos',
    heroTitle: 'Producción Técnica Completa',
    heroSubtitle: 'Gestión integral audiovisual de tu evento',
    intro: '<strong>Producción técnica completa</strong> de eventos: sonido, iluminación, vídeo, escenarios, estructuras. Equipo de técnicos especializados. Planificación y ejecución profesional.',
    url: '/servicios/produccion-tecnica-eventos-valencia'
  },
  {
    fileName: 'AlquilerEstructurasTruss',
    title: 'Alquiler de Estructuras Truss | Montajes Profesionales | Valencia',
    metaDescription: 'Alquiler de estructuras truss para eventos. Montajes profesionales, estructuras colgantes. Certificadas. Técnico incluido. ☎️ 613 88 14 14',
    keywords: 'alquiler truss valencia, estructuras eventos, montajes truss',
    heroTitle: 'Alquiler de Estructuras Truss',
    heroSubtitle: 'Montajes seguros y profesionales',
    intro: 'Alquiler de <strong>estructuras truss</strong> para eventos: estructuras colgantes para luces y sonido, torres, arcos, pórticos. Certificadas y seguras. Montaje profesional incluido.',
    url: '/servicios/alquiler-estructuras-truss'
  },
  {
    fileName: 'AlquilerMaquinasFX',
    title: 'Alquiler de Máquinas FX | Humo, CO2, Confeti | Valencia',
    metaDescription: 'Alquiler de máquinas de efectos especiales. Humo, niebla baja, CO2, confeti, burbujas. Efectos espectaculares. ☎️ 613 88 14 14',
    keywords: 'alquiler máquinas humo valencia, máquinas fx, efectos especiales eventos',
    heroTitle: 'Alquiler de Máquinas FX',
    heroSubtitle: 'Efectos especiales para momentos únicos',
    intro: 'Alquiler de <strong>máquinas de efectos especiales</strong>: humo, niebla baja, cañones CO2, confeti, burbujas, nieve. Efectos espectaculares para bodas, conciertos y eventos.',
    url: '/servicios/alquiler-maquinas-fx-humo-confeti'
  }
];

console.log('🚀 Creando 20 páginas de servicio...\n');

services.forEach((service, index) => {
  const fileName = `${service.fileName}.tsx`;
  const filePath = path.join(servicesDir, fileName);
  
  const content = `import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const ${service.fileName} = () => {
  const pageData = {
    title: "${service.title}",
    metaDescription: "${service.metaDescription}",
    keywords: "${service.keywords}",
    heroTitle: "${service.heroTitle}",
    heroSubtitle: "${service.heroSubtitle}",
    introduction: \`${service.intro}\`,
   
    whyChooseUs: [
      {
        icon: "🎵",
        title: "Equipos Profesionales",
        description: "Solo marcas líderes de máxima calidad"
      },
      {
        icon: "👨‍🔧",
        title: "Técnicos Especializados",
        description: "Expertos con años de experiencia"
      },
      {
        icon: "🚚",
        title: "Servicio Completo",
        description: "Transporte, montaje y desmontaje incluidos"
      },
      {
        icon: "🔒",
        title: "Equipos de Backup",
        description: "Respaldo siempre disponible"
      },
      {
        icon: "💰",
        title: "Precios Claros",
        description: "Sin costes ocultos"
      },
      {
        icon: "⚡",
        title: "Respuesta Rápida",
        description: "Presupuesto en 24h"
      }
    ],

    packages: [
      {
        name: "Pack Básico",
        subtitle: "Para eventos pequeños",
        price: "desde 300€",
        features: [
          "Equipos básicos profesionales",
          "Transporte incluido",
          "Montaje y desmontaje",
          "Asistencia telefónica"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Más popular",
        price: "desde 600€",
        features: [
          "Equipos profesionales completos",
          "Técnico especializado incluido",
          "Transporte y montaje",
          "Equipos de backup",
          "Soporte completo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Máxima calidad",
        price: "desde 1.200€",
        features: [
          "Equipos top de gama",
          "2 técnicos especializados",
          "Equipos redundantes",
          "Prueba previa",
          "Soporte 24/7"
        ]
      }
    ],

    faqs: [
      {
        question: "¿El técnico está incluido?",
        answer: "En los packs Profesional y Premium sí. En el Básico se puede añadir."
      },
      {
        question: "¿Con cuánta antelación debo reservar?",
        answer: "Recomendamos 1-2 meses, especialmente para fines de semana."
      },
      {
        question: "¿El transporte tiene coste extra?",
        answer: "No, está incluido en Valencia y hasta 30km."
      }
    ],

    relatedServices: [
      { title: "Sonido Profesional", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Iluminación LED", url: "/servicios/iluminacion-led-profesional" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led-eventos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default ${service.fileName};
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ [${index + 1}/20] ${fileName}`);
});

console.log('\n✅ 20 páginas de servicio creadas exitosamente!');
console.log('\nArchivos creados en:', servicesDir);
console.log('\nPróximo paso: Configurar rutas en App.tsx');
