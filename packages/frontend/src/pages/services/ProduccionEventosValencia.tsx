import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const ProduccionEventosValencia = () => {
  const pageData = {
    title: "Producción de Eventos en Valencia · Sonido Luz Vídeo",
    metaDescription: "Producción técnica integral para eventos en Valencia desde 800€. Sonido, iluminación, vídeo y streaming. +1000 eventos en Palau, Ciudad Artes ☎ 613 88 14 14",
    keywords: "produccion eventos valencia, empresa de sonido para eventos, eventos corporativos valencia, iluminacion y sonido eventos",
    canonicalUrl: "https://resonaevents.com/servicios/produccion-eventos-valencia",
    heroTitle: "Producción Técnica Completa para Eventos en Valencia",
    heroSubtitle: "DAS Audio, ICOA, Moving Heads 17R/7R, Pioneer RX2 - Producción integral completa",
    introduction: `Organizar <strong>eventos en Valencia</strong> de alto nivel requiere una <strong>producción técnica profesional</strong> que garantice resultados impecables. En ReSona Events somos especialistas en <strong>producción de eventos en Valencia</strong>, ofreciendo soluciones audiovisuales completas para eventos corporativos, conciertos, festivales, conferencias, presentaciones de producto, galas, y todo tipo de celebraciones profesionales.

Con más de 15 años de experiencia y más de 1.000 <strong>eventos producidos en Valencia</strong>, conocemos perfectamente los mejores espacios de la ciudad: Palau de la Música, Ciudad de las Artes y las Ciencias, Feria Valencia, Marina de Empresas, Hotel Las Arenas, La Rambleta, Centro de Congresos, Jardín Botánico, y centenares de hoteles, teatros, auditorios y espacios únicos en Valencia capital y provincia.

Nuestro servicio completo de <strong>producción técnica para eventos en Valencia</strong> abarca todas las necesidades audiovisuales: sistemas de sonido profesional escalables (50-5.000 personas), iluminación escénica y arquitectónica, pantallas LED y videoescenarios, proyección y mapping, streaming profesional y grabación multicámara, estructuras y escenarios, control técnico centralizado, equipo técnico especializado, y coordinación integral con todos los proveedores.

Ya sea un <strong>evento corporativo en Valencia</strong> de 100 asistentes, un concierto con 2.000 personas, o una conferencia internacional, disponemos del equipamiento profesional, la experiencia técnica y el equipo humano necesario para que tu evento sea un éxito rotundo. Trabajamos con equipamiento profesional real: DAS Audio 515A/215A/218A, ICOA 12A/15A, Moving Head 3en1 17R y Beam 7R, Behringer X Air XR18, Pioneer RX2, Shure SM58, Flash RGB 1000W, Focos LED RGB, garantizando fiabilidad y calidad audiovisual excepcional.

Cada <strong>evento en Valencia</strong> tiene sus particularidades técnicas. Por eso nuestro proceso incluye: visita técnica previa al espacio, diseño personalizado de producción, planificación de timeline detallado, montaje con antelación suficiente, pruebas técnicas completas, equipo técnico durante todo el evento, desmontaje eficiente, y soporte post-evento. Todo con un único interlocutor que coordina todos los aspectos técnicos.`,
   
    whyChooseUs: [
      {
        icon: "🎯",
        title: "Experiencia Demostrada",
        description: "Más de 1.000 eventos producidos - Palau Música, Feria Valencia, hoteles 5 estrellas"
      },
      {
        icon: "🎬",
        title: "Producción 360°",
        description: "Sonido + Iluminación + Vídeo + Streaming - Todo desde un único proveedor"
      },
      {
        icon: "🏆",
        title: "Equipamiento Premium",
        description: "JBL, QSC, d&b, Martin, Robe - Solo marcas profesionales de máxima calidad"
      },
      {
        icon: "👥",
        title: "Equipo Técnico Experto",
        description: "Ingenieros de sonido, iluminadores, técnicos vídeo - Profesionales certificados"
      },
      {
        icon: "📋",
        title: "Coordinación Total",
        description: "Gestionamos todo el aspecto técnico - Tú te centras en tu evento"
      },
      {
        icon: "🔒",
        title: "Backup Garantizado",
        description: "Equipos redundantes, técnicos de guardia - Cero riesgo de fallo"
      }
    ],

    packages: [
      {
        name: "Pack Conferencia",
        subtitle: "50-150 asistentes",
        price: "desde 800€",
        features: [
          "Sistema PA completo",
          "4 micrófonos inalámbricos",
          "Proyector HD + pantalla 3m",
          "Mesa mezclas digital",
          "Iluminación escenario",
          "Técnico audiovisual",
          "Grabación básica opcional",
          "Montaje y desmontaje"
        ]
      },
      {
        name: "Pack Evento Corporativo",
        subtitle: "150-400 asistentes",
        price: "desde 2.500€",
        features: [
          "Line Array profesional",
          "Pantalla LED 6m²",
          "Iluminación escénica completa",
          "Streaming Full HD",
          "8 micrófonos + sistema conferencia",
          "2 cámaras profesionales",
          "2 técnicos especializados",
          "Estructura y escenario",
          "Control técnico centralizado"
        ],
        highlighted: true
      },
      {
        name: "Pack Producción Premium",
        subtitle: "+400 asistentes",
        price: "desde 6.000€",
        features: [
          "Sistema d&b audiotechnik",
          "Videoescenario LED 20m²+",
          "Iluminación robotizada (moving heads)",
          "Streaming 4K multicámara",
          "Mapping y efectos especiales",
          "Estructura truss completa",
          "4 técnicos + director técnico",
          "Ensayo técnico previo",
          "Backup completo garantizado",
          "Coordinación integral proveedores"
        ]
      }
    ],

    technicalSpecs: [
      {
        title: "Sistemas de Sonido Profesional",
        items: [
          "Line Arrays JBL VTX/QSC K2/d&b Y-Series escalables 50-5.000 personas",
          "Subwoofers potentes 18\" para graves profundos y impacto",
          "Mesas digitales Yamaha CL/Avid S6L 64+ canales, control remoto iPad",
          "Procesadores DSP Lake/BSS para optimización acústica del espacio",
          "Microfonía inalámbrica Shure Axient/Sennheiser Digital 6000",
          "Sistemas conferencias Bosch/Taiden para eventos multilingües"
        ]
      },
      {
        title: "Iluminación Escénica y Arquitectónica",
        items: [
          "Moving Heads Robe/Martin robotizados BEAM, SPOT, WASH",
          "LEDs RGB/RGBW Chauvet/Elation para colores infinitos",
          "Proyectores arquitectónicos IP65 para exteriores",
          "Máquinas efectos: humo bajo, niebla, CO2, confeti",
          "Láser RGB profesional Kvant/RTI para efectos espectaculares",
          "Control DMX/ArtNet grandMA2/3 con programación personalizada"
        ]
      },
      {
        title: "Vídeo, Pantallas y Proyección",
        items: [
          "Pantallas LED modulares P2.9/P3.9 interior, P4.8 exterior",
          "Proyectores Panasonic/Christie 10.000-30.000 lúmenes",
          "Cámaras Sony/Panasonic 4K con operadores profesionales",
          "Video mapping Resolume/Disguise para proyecciones artísticas",
          "Switcher Roland V-800HD/Blackmagic ATEM para multicámara",
          "Mezcladores vídeo en tiempo real para eventos en directo"
        ]
      },
      {
        title: "Streaming y Grabación",
        items: [
          "Streaming Full HD/4K YouTube, Facebook, Zoom, Teams, plataformas privadas",
          "Encoders profesionales Epiphan/Teradek bonding 4G",
          "Multipantalla con chroma, gráficos, rotulación en directo",
          "Grabación multicámara sincronizada con audio profesional",
          "Realización y postproducción vídeo del evento",
          "CDN dedicado para miles de espectadores simultáneos"
        ]
      },
      {
        title: "Estructuras y Escenarios",
        items: [
          "Truss Prolyte/Milos certificado TÜV para suspensiones seguras",
          "Escenarios modulares 2m² hasta 200m² según necesidades",
          "Ground support para iluminación sin estructura aérea",
          "Decoración escénica, backdrops, photocall corporativo",
          "Cabinas técnicas insonorizadas para control",
          "Tarimas, alfombras, vallas, señalética"
        ]
      }
    ],

    faqs: [
      {
        question: "¿Cuánto cuesta la producción técnica de un evento en Valencia?",
        answer: "El coste depende de tamaño, duración y complejidad técnica. Conferencia 50-150 personas (sonido + proyección + iluminación básica) desde 800€. Evento corporativo 150-400 personas (sonido line array + pantalla LED + iluminación + streaming) desde 2.500€. Producción grande +400 personas (sistema d&b + videoescenario + moving heads + multicámara) desde 6.000€. Conciertos y festivales: presupuesto personalizado según rider técnico. Todos los precios incluyen: equipo técnico, transporte Valencia, montaje/desmontaje, pruebas técnicas. Hacemos presupuestos detallados sin compromiso en 24-48h. Contacta 613 88 14 14 o info@resonaevents.com."
      },
      {
        question: "¿Qué incluye exactamente vuestro servicio de producción de eventos en Valencia?",
        answer: "Servicio integral desde concepto hasta ejecución: Reunión inicial para entender objetivos y necesidades técnicas. Visita técnica al espacio (acústica, eléctrica, accesos, restricciones). Diseño técnico personalizado con planos 3D y propuesta equipamiento. Coordinación previa con venue, catering, otros proveedores. Transporte equipos con furgonetas profesionales. Montaje con antelación suficiente (normalmente día anterior). Pruebas técnicas completas pre-evento. Equipo técnico durante TODO el evento (sonidistas, iluminadores, vídeo). Operación en tiempo real y solución de cualquier incidencia. Desmontaje eficiente post-evento. Entrega material grabado (si aplica). Todo con director técnico único coordinando."
      },
      {
        question: "¿Con cuánta antelación hay que contratar para eventos en Valencia?",
        answer: "Recomendamos máxima antelación posible. Eventos grandes (conferencias, conciertos, galas +200 personas): 2-4 meses ideal, especialmente temporada alta. Eventos medianos (presentaciones, eventos corporativos 100-200 personas): 1-2 meses suficiente. Eventos pequeños (reuniones, conferencias <100): 2-4 semanas puede ser viable. Eventos urgentes: Contacta siempre, a veces tenemos disponibilidad inmediata. Fechas conflictivas (Feria Valencia, grandes eventos ciudad): Hasta 6 meses recomendado. Cuanto antes reserves, más opciones de equipamiento y mejores condiciones. Llama al 613 88 14 14 para consultar disponibilidad de tu fecha específica."
      },
      {
        question: "¿Trabajáis en todos los espacios de eventos en Valencia?",
        answer: "Sí, experiencia demostrada en los principales espacios: Palau de la Música, Ciudad de las Artes y las Ciencias (Hemisfèric, Ágora, Oceanogràfic), Feria Valencia (todos los pabellones), Marina de Empresas, La Rambleta, Teatre Principal, Teatre Talía, Jardín Botánico, Centre del Carme, Almodí, Lonja, Viveros Municipales, Puerto Valencia (Veles e Vents). Hoteles: Las Arenas, Westin, SH Valencia Palace, Meliá, NH Collection, Barceló. Espacios privados: fincas, naves industriales, carpas, espacios singulares. También trabajamos fuera de Valencia: Alicante, Castellón, Murcia, Madrid. Si es espacio nuevo, hacemos visita técnica previa GRATUITA para planificar montaje óptimo."
      },
      {
        question: "¿Ofrecéis servicio de streaming para eventos en Valencia?",
        answer: "Sí, especialistas en streaming profesional. Configuraciones disponibles: Streaming básico (1 cámara fija, audio mezclado) desde 400€. Streaming profesional (2-3 cámaras, realización en directo, gráficos) desde 1.200€. Streaming premium (multicámara, chroma, rotulación, multipantalla) desde 2.500€. Plataformas soportadas: YouTube Live, Facebook Live, Zoom Webinar, Microsoft Teams, Vimeo, plataformas corporativas privadas. Incluye: configuración técnica completa, test previo, técnico realizador durante evento, encoding redundante (backup), CDN para miles espectadores simultáneos, grabación HD del stream. También ofrecemos: página web evento con chat, interacción audiencia, analytics detallados, subtitulado en directo."
      },
      {
        question: "¿Tenéis equipos de backup por si algo falla?",
        answer: "Absolutamente. Protocolos redundancia máxima: Equipos críticos SIEMPRE duplicados (mesas mezclas, reproductores, micros inalámbricos). Sistema sonido: Amplificadores redundantes, altavoces backup. Iluminación: Controladores duplicados, fuentes backup. Vídeo: Encoders duplicados, cámaras respaldo. Eléctrico: Distribución redundante, SAI para equipos críticos. Equipos en almacén disponibles para sustitución urgente en 60 min en Valencia. Técnicos de guardia 24/7 con furgoneta equipada. En 1.000+ eventos JAMÁS hemos suspendido por fallo técnico. Nuestro objetivo: que ni tú ni los asistentes noten nunca ningún problema. Tranquilidad total garantizada."
      },
      {
        question: "¿Podemos hacer una prueba técnica antes del evento?",
        answer: "Por supuesto, según complejidad del evento: Eventos medianos: Reunión técnica online/presencial para revisar timeline y requerimientos. Eventos grandes: Visita al espacio días antes para evaluar acústica, iluminación, vídeo. Eventos muy grandes: Ensayo técnico completo 1-2 días antes con todos proveedores. Día del evento: Montaje siempre con antelación suficiente (normalmente día anterior o mañana). Soundcheck y pruebas luces antes de llegada asistentes. Test streaming 1h antes del directo. Reunión pre-evento con todos técnicos y organización. Para conciertos: Respetamos horarios rider técnico, pruebas de sonido completas. Todo planificado para que cuando empiece el evento, TODO funcione perfectamente."
      },
      {
        question: "¿Gestionáis también la parte de producción creativa?",
        answer: "Sí, ofrecemos producción técnica Y creativa: Concepto y diseño visual del evento. Escenografías personalizadas y decoración técnica. Contenidos audiovisuales (vídeos corporativos, motion graphics). Mapping y proyecciones artísticas. Show de luces coreografiado con música. Efectos especiales (láser, fuegos fríos, CO2). Coordinación artística de actuaciones. Timeline completo optimizado. También colaboramos perfectamente con vuestros creativos: agencias eventos, productoras audiovisuales, diseñadores. Nosotros ejecutamos técnicamente sus conceptos creativos. Flexibilidad total: desde producción llave en mano hasta solo proveedor técnico. Nos adaptamos a vuestras necesidades."
      },
      {
        question: "¿Qué formas de pago aceptáis para eventos corporativos?",
        answer: "Múltiples opciones según cliente: Empresas con CIF: Pago a 30-60 días desde factura. Particulares/asociaciones: 50% reserva, 50% 7 días antes del evento. Eventos grandes: Fraccionado 30% reserva, 40% mes antes, 30% semana antes. Métodos pago: Transferencia bancaria (preferente), Tarjeta crédito/débito, PayPal, Bizum (hasta 1.000€). Emitimos factura oficial completa con IVA desglosado. Para clientes recurrentes: Contrato marco con condiciones ventajosas. Descuentos: Eventos múltiples en año, >3 eventos. Todo transparente y profesional, trabajamos con las principales empresas y organizaciones de Valencia."
      },
      {
        question: "¿Tenéis seguros y certificaciones necesarias?",
        answer: "Sí, cumplimos toda normativa legal y técnica: Seguro Responsabilidad Civil 600.000€ cubriendo daños terceros, equipos, instalaciones. Seguro equipos contra robo, daño, mal funcionamiento. Estructuras truss certificadas TÜV con inspección anual obligatoria. Instalaciones eléctricas certificadas por electricista autorizado. Equipos con marcado CE y certificados fabricante. Personal técnico con formación: Prevención riesgos laborales, Trabajos en altura, Primeros auxilios, Contra incendios. Cumplimiento normativa: UNE-EN 61439 eléctrica, RD 486/1997 seguridad lugares trabajo. Podemos proporcionar copias certificados si venue lo requiere. Trabajamos con total profesionalidad y seguridad."
      }
    ],

    relatedServices: [
      { title: "Sonido para Bodas Valencia", url: "/servicios/sonido-bodas-valencia" },
      { title: "Alquiler de Sonido Profesional", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Iluminación LED Profesional", url: "/servicios/iluminacion-led-profesional" },
      { title: "Streaming Eventos", url: "/servicios/videoescenarios-streaming" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default ProduccionEventosValencia;
