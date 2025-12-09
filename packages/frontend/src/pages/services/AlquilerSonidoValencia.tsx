import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerSonidoValencia = () => {
  const pageData = {
    title: "Alquiler de Sonido Profesional en Valencia | ReSona Events",
    metaDescription: "Alquiler de sonido profesional en Valencia. Equipos JBL, QSC, Pioneer. Técnico incluido. Presupuesto gratis en 24h. ☎️ 613 88 14 14",
    keywords: "alquiler sonido valencia, equipos audio valencia, sonido profesional eventos, alquiler altavoces valencia",
    heroTitle: "Alquiler de Sonido Profesional en Valencia",
    heroSubtitle: "Equipos de última generación con técnico especializado incluido",
    introduction: `¿Necesitas <strong>alquiler de sonido profesional en Valencia</strong>? En ReSona Events ofrecemos equipos de última generación de marcas líderes como JBL, QSC, Pioneer y Shure. Con más de 15 años de experiencia, garantizamos sonido perfecto para bodas, eventos corporativos, conciertos y todo tipo de celebraciones. Incluimos técnico especializado, transporte, montaje y desmontaje sin costes adicionales.`,
   
    whyChooseUs: [
      {
        icon: "🎵",
        title: "Equipos de Última Generación",
        description: "JBL, QSC, EV, Pioneer - Solo marcas profesionales de confianza"
      },
      {
        icon: "👨‍🔧",
        title: "Técnico Especializado Incluido",
        description: "Ajuste perfecto, mezcla profesional y soporte durante todo el evento"
      },
      {
        icon: "🚚",
        title: "Todo Incluido",
        description: "Transporte, montaje, desmontaje y cables - Sin cargos ocultos"
      },
      {
        icon: "🔒",
        title: "Equipos de Backup",
        description: "Siempre llevamos respaldo - Cero riesgo de fallo"
      },
      {
        icon: "💰",
        title: "Precios Transparentes",
        description: "Presupuesto claro desde el principio - Sin sorpresas"
      },
      {
        icon: "⚡",
        title: "Respuesta Rápida",
        description: "Presupuesto en menos de 24h - Servicio ágil y profesional"
      }
    ],

    packages: [
      {
        name: "Pack Básico",
        subtitle: "Hasta 80 personas",
        price: "desde 350€",
        features: [
          "2 altavoces activos 500W",
          "Mesa de mezclas digital",
          "2 micrófonos inalámbricos",
          "Cables y soportes",
          "Transporte Valencia",
          "Montaje y desmontaje",
          "Asistencia telefónica"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "80-150 personas",
        price: "desde 650€",
        features: [
          "2 altavoces profesionales 1000W",
          "2 subwoofers potentes",
          "Mesa mezclas Pioneer",
          "4 micrófonos inalámbricos",
          "Sistema monitoreo",
          "Técnico especializado incluido",
          "Montaje completo",
          "Equipos de backup"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "+150 personas",
        price: "desde 1.200€",
        features: [
          "Line Array profesional 2000W+",
          "Sistema subwoofer triple",
          "Mesa Yamaha digital",
          "6 micrófonos premium",
          "Procesador audio digital",
          "2 técnicos especializados",
          "Equipos redundantes completos",
          "Prueba previa en el lugar"
        ]
      }
    ],

    technicalSpecs: [
      {
        title: "Altavoces Disponibles",
        items: [
          "JBL PRX series (500-1000W)",
          "QSC K series (1000-2000W)",
          "EV ZLX/ZXA (500-1500W)",
          "Line Array L-Acoustics (grandes eventos)",
          "Monitores de escenario",
          "Sistemas portátiles compactos"
        ]
      },
      {
        title: "Micrófonos",
        items: [
          "Shure SM58 (mano cable)",
          "Shure SM58 Wireless",
          "Shure Beta 87A (condensador)",
          "Sennheiser EW series",
          "Micrófonos de solapa inalámbricos",
          "Micrófonos de diadema"
        ]
      },
      {
        title: "Mesas de Mezclas",
        items: [
          "Pioneer DJM-900 NXS2",
          "Yamaha MG series",
          "Allen & Heath ZED series",
          "Behringer X32 (digital)",
          "Mackie ProFX series"
        ]
      },
      {
        title: "Accesorios",
        items: [
          "Cables XLR profesionales",
          "Soportes de altavoces",
          "Soportes de micrófonos",
          "Distribuidores de señal",
          "Procesadores de audio",
          "Reproductores de música"
        ]
      }
    ],

    faqs: [
      {
        question: "¿El técnico de sonido está incluido en el precio?",
        answer: "En los packs Profesional y Premium sí está incluido. En el pack Básico ofrecemos asistencia telefónica, pero puedes añadir técnico presencial por 150€ adicionales."
      },
      {
        question: "¿Cuánto tiempo antes debo reservar?",
        answer: "Recomendamos reservar con 1-2 meses de antelación, especialmente para eventos en fin de semana. Sin embargo, a veces tenemos disponibilidad con menos tiempo."
      },
      {
        question: "¿El transporte tiene coste extra?",
        answer: "No, el transporte está incluido en Valencia capital y hasta 30km. Para distancias mayores hay un suplemento de 0,50€/km."
      },
      {
        question: "¿Qué pasa si algo falla durante el evento?",
        answer: "Siempre llevamos equipos de backup completos. En 15 años nunca hemos tenido un fallo sin solución inmediata."
      },
      {
        question: "¿Hacen prueba de sonido antes del evento?",
        answer: "Sí, en el pack Premium está incluida. Para otros packs se puede añadir por 50€."
      }
    ],

    relatedServices: [
      { title: "Iluminación para Eventos", url: "/servicios/iluminacion-led-profesional" },
      { title: "Alquiler de DJ", url: "/servicios/alquiler-dj-valencia" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led-eventos" },
      { title: "Micrófonos Inalámbricos", url: "/servicios/alquiler-microfonos-inalambricos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerSonidoValencia;
