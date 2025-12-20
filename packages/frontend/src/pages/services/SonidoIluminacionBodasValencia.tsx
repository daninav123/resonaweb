import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const SonidoIluminacionBodasValencia = () => {
  const pageData = {
    title: "Sonido + Iluminación Bodas Valencia | Desde 850€ | ReSona",
    metaDescription: "Sonido e iluminación para bodas Valencia desde 850€. Técnico incluido toda la boda. +500 bodas realizadas. ☎️ 613 88 14 14",
    keywords: "bodas valencia, sonido bodas valencia, iluminación bodas valencia, audio bodas valencia, equipos bodas valencia, dj bodas valencia",
    canonicalUrl: "https://resonaevents.com/servicios/sonido-iluminacion-bodas-valencia",
    heroTitle: "Sonido e Iluminación Profesional para Bodas en Valencia",
    heroSubtitle: "DAS Audio + ICOA + Moving Heads + LED RGB - Sonido e iluminación perfectos para tu boda",
    introduction: `Organizar una <strong>boda en Valencia</strong> requiere atención al detalle, y el <strong>sonido e iluminación para bodas</strong> es fundamental para crear la atmósfera perfecta. En ReSona Events somos especialistas en <strong>equipamiento audiovisual para bodas en Valencia</strong>, con más de 500 bodas realizadas en espacios emblemáticos como La Hacienda, Mas de San Antonio, El Bohío, Viveros Municipales, y fincas privadas en toda la provincia de Valencia.

Sabemos que cada <strong>boda en Valencia</strong> es única. Por eso ofrecemos un servicio personalizado que se adapta perfectamente a tu estilo, número de invitados y espacio del evento. Desde ceremonias íntimas de 50 personas hasta grandes celebraciones de 400 invitados, disponemos del equipo profesional y la experiencia necesaria para que todo funcione perfectamente.

Nuestro servicio completo de <strong>sonido para bodas en Valencia</strong> incluye: equipos de alta calidad (DAS Audio 515A, ICOA 12A/15A, Behringer, Pioneer RX2, Shure), técnico especializado durante toda la celebración, microfonía inalámbrica para ceremonia y discursos, sistema de música ambiente y DJ, iluminación decorativa LED (uplighting, proyectores, efectos), montaje y desmontaje completo, pruebas previas en el espacio, y coordinación con otros proveedores.

Trabajamos en los mejores espacios para <strong>bodas en Valencia</strong>: La Hacienda, Mas de San Antonio, El Bohío, Viveros Municipales, Palau de la Música, Hotel Las Arenas, Hotel SH Valencia Palace, Jardines de Monforte, Casa Granero, Alquería del Pi, Torre del Pi, Masía Egara, y centenares de fincas, hoteles y espacios únicos en Valencia, Alboraya, Torrent, Paterna, Bétera, Godella, Moncada, L'Eliana y toda la provincia.

Hemos sido parte de más de 500 <strong>bodas en Valencia</strong>, ayudando a crear momentos inolvidables con sonido perfecto e iluminación espectacular. Tu día especial merece el mejor equipamiento profesional y un equipo técnico experimentado que garantice que todo funcione sin fallos.

Si buscas más información sobre <a href="/bodas-valencia" class="text-primary-600 hover:underline font-semibold">bodas en Valencia</a>, visita nuestra página principal de bodas donde encontrarás información detallada sobre fincas, precios y servicios. También puedes ver nuestros servicios individuales de <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">sonido para bodas</a> y <a href="/servicios/alquiler-iluminacion-bodas-valencia" class="text-primary-600 hover:underline font-semibold">iluminación para bodas</a>.`,
   
    whyChooseUs: [
      {
        icon: "💍",
        title: "Especialistas en Bodas",
        description: "Más de 500 bodas realizadas en Valencia - Conocemos todos los espacios"
      },
      {
        icon: "🎵",
        title: "Sonido Perfecto Garantizado",
        description: "Ceremonia, cocktail, banquete y fiesta - Audio impecable en cada momento"
      },
      {
        icon: "✨",
        title: "Iluminación de Ensueño",
        description: "Uplighting, proyección nombres, baile nubes - Crea la atmósfera perfecta"
      },
      {
        icon: "👨‍🔧",
        title: "Técnico Especializado Incluido",
        description: "Estamos durante toda la boda - Tú disfruta, nosotros nos ocupamos"
      },
      {
        icon: "📋",
        title: "Coordinación Total",
        description: "Trabajamos con tu wedding planner, DJ, catering - Todo sincronizado"
      },
      {
        icon: "💰",
        title: "Presupuesto Sin Sorpresas",
        description: "Todo incluido desde 850€ - Transporte, montaje, técnico - Sin extras ocultos"
      }
    ],

    packages: [
      {
        name: "Pack Ceremonia + Ambiente",
        subtitle: "Hasta 100 invitados",
        price: "desde 300€",
        features: [
          "SONIDO: 2x ICOA 12A Blanco + 2x Shure SM58",
          "ILUMINACIÓN: 8x Focos LED RGB Decoración",
          "2 altavoces profesionales",
          "2 micrófonos inalámbricos",
          "Reproductor música ceremonia",
          "Técnico para configuración",
          "Transporte Valencia incluido",
          "Montaje y desmontaje",
          "Prueba previa opcional"
        ]
      },
      {
        name: "Pack Boda Completa",
        subtitle: "100-200 invitados",
        price: "desde 1.500€",
        features: [
          "Sonido ceremonia completo",
          "Sistema audio banquete",
          "Equipo DJ profesional",
          "Iluminación LED decorativa",
          "4 micrófonos inalámbricos",
          "Técnico durante toda la boda",
          "Coordinación con proveedores",
          "Equipos de respaldo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "+200 invitados",
        price: "desde 2.800€",
        features: [
          "Line Array profesional",
          "Iluminación arquitectónica completa",
          "Uplighting LED (20+ focos)",
          "Proyección nombres + iniciales",
          "Efecto baile en las nubes",
          "Mesa DJ Pioneer premium",
          "2 técnicos especializados",
          "Prueba previa in-situ incluida",
          "Backup completo garantizado"
        ]
      }
    ],

    technicalSpecs: [
      {
        title: "Sonido para Ceremonia",
        items: [
          "Altavoces JBL EON/PRX compactos pero potentes, perfectos para exteriores",
          "Micrófonos inalámbricos Shure/Sennheiser para oficiante, novios, lecturas",
          "Reproductor profesional con todas tus canciones (marcha nupcial, entrada, firma, salida)",
          "Configuración acústica según espacio (jardín, iglesia, salón, terraza)",
          "Técnico para gestionar entradas musicales y niveles durante la ceremonia"
        ]
      },
      {
        title: "Sonido para Banquete y Fiesta",
        items: [
          "Sistema PA completo escalable según invitados (100-400 personas)",
          "Subwoofers para graves profundos en pista de baile",
          "Mesa de mezclas digital Pioneer/Yamaha para DJ o música en directo",
          "Micrófonía inalámbrica múltiple para discursos, animación, karaoke",
          "Monitores de escenario si hay banda en vivo o actuaciones",
          "Cableado profesional oculto - Sin cables visibles en zonas nobles"
        ]
      },
      {
        title: "Iluminación Decorativa LED",
        items: [
          "Uplighting LED RGB: 10-30 focos para iluminar paredes, columnas, árboles",
          "Proyector GOBO personalizado: Iniciales o nombres proyectados",
          "Iluminación pista de baile: Moving heads, efectos LED, wash lights",
          "Efecto 'Baile en las Nubes': Máquina de humo bajo + iluminación especial",
          "Iluminación arquitectónica para resaltar espacios (fachadas, jardines)",
          "Control DMX sincronizado - Escenas programadas para cada momento"
        ]
      },
      {
        title: "Servicios Adicionales",
        items: [
          "Photocall con iluminación profesional para fotografías",
          "Pantalla LED o proyector para vídeos emotivos, presentaciones",
          "Cabina DJ profesional con frontales iluminados personalizados",
          "Coordinación total con wedding planner, catering, fotógrafo",
          "Playlist personalizada - Música ambiente, cenas, baile",
          "Timeline detallado: Timing perfecto ceremonia-cocktail-cena-fiesta"
        ]
      }
    ],

    faqs: [
      {
        question: "¿Cuánto cuesta el sonido e iluminación para una boda en Valencia?",
        answer: "El precio varía según número de invitados, duración y servicios. Pack Ceremonia (hasta 100 personas) desde 450€. Pack Boda Completa (100-200 invitados, sonido + iluminación + técnico todo el día) desde 1.500€. Pack Premium (+200 invitados, line array, uplighting, efectos especiales) desde 2.800€. Todos incluyen transporte en Valencia, montaje, técnico especializado, y desmontaje. Hacemos presupuestos personalizados sin compromiso en menos de 24h. Llama al 613 88 14 14 o envía email a info@resonaevents.com con fecha, ubicación y número aproximado de invitados."
      },
      {
        question: "¿Qué incluye exactamente el servicio para bodas en Valencia?",
        answer: "Servicio completo todo incluido: Reunión previa para conocer vuestros gustos musicales y necesidades técnicas. Equipamiento profesional (altavoces JBL/QSC, mesa mezclas Pioneer, micrófonos Shure, iluminación LED). Técnico especializado presente durante TODA la boda (ceremonia, cocktail, banquete, fiesta). Montaje con antelación (normalmente el día anterior o mañana de la boda). Configuración y calibración acústica del espacio. Coordinación con wedding planner, DJ, banda, catering. Gestión de timeline musical completo. Desmontaje al finalizar. Transporte incluido en Valencia capital y 30km. Equipos de respaldo en packs Profesional y Premium. Todo sin costes ocultos."
      },
      {
        question: "¿Trabajáis con DJ o necesito contratar uno aparte?",
        answer: "Ambas opciones posibles. Si YA tienes DJ: Proporcionamos el equipo profesional completo (mesa Pioneer, altavoces, luces) y nuestro técnico coordina todo con tu DJ durante la boda. Si NO tienes DJ: Podemos recomendar DJs especializados en bodas con los que trabajamos habitualmente, o gestionar la música nosotros mismos con playlist personalizada (perfecta para ceremonias, cocktails, cenas con música ambiente). También opción intermedia: Música playlist para ceremonia/cena + DJ profesional solo para la fiesta. Nos adaptamos totalmente a vuestras preferencias y presupuesto."
      },
      {
        question: "¿Con cuánta antelación hay que reservar para una boda en Valencia?",
        answer: "Para bodas recomendamos reservar con la máxima antelación posible. Temporada alta en Valencia (mayo-octubre): 6-12 meses de antelación ideal, especialmente para fines de semana. Fechas muy demandadas (junio, septiembre, octubre): 12 meses o más recomendado. Temporada media (abril, noviembre): 3-6 meses suficiente. Temporada baja (diciembre-marzo): 2-3 meses puede ser suficiente. En cualquier caso, contacta lo antes posible al 613 88 14 14. Aunque tengamos agenda completa, a veces hay cancelaciones y podemos ayudarte. También trabajamos con equipo adicional en fechas con múltiples bodas."
      },
      {
        question: "¿Habéis trabajado en [nombre del espacio de mi boda]?",
        answer: "Muy probablemente SÍ. Hemos trabajado en más de 500 bodas en Valencia y alrededores, cubriendo los principales espacios: La Hacienda, Mas de San Antonio, El Bohío, Viveros Municipales, Palau de la Música, Hotel Las Arenas, Hotel SH Valencia Palace, Casa Granero, Alquería del Pi, Torre del Pi, Masía Egara, Jardines de Monforte, y decenas de fincas, hoteles, restaurantes, masías. Conocemos las características acústicas, puntos eléctricos, zonas de montaje, restricciones de ruido, y peculiaridades técnicas de cada espacio. Si es un espacio nuevo para nosotros, hacemos visita técnica previa GRATUITA para evaluar y planificar el montaje óptimo."
      },
      {
        question: "¿Qué pasa si hay problemas técnicos durante la boda?",
        answer: "En 500+ bodas JAMÁS hemos tenido que suspender por fallo técnico. Nuestro protocolo de seguridad: Revisión técnica completa de todos los equipos antes de cada boda. Equipos profesionales de máxima fiabilidad (JBL, QSC, Pioneer, Shure). Técnico especializado presente durante TODA la boda. Equipos de respaldo (backup) incluidos en packs Profesional y Premium: altavoces, micrófonos, reproductores duplicados. Técnico de guardia 24/7 con furgoneta equipada para sustitución urgente si fuera necesario. Seguro de responsabilidad civil 600.000€. En el improbable caso de incidencia técnica menor, se resuelve en menos de 5 minutos sin que los invitados lo noten. Tu tranquilidad es nuestra prioridad absoluta."
      },
      {
        question: "¿Podemos hacer una prueba antes de la boda?",
        answer: "Por supuesto. Pack Básico: Reunión online o presencial para revisar timeline y preferencias musicales. Pack Profesional: Prueba de sonido opcional en nuestro showroom (puedes escuchar equipos, ver luces). Pack Premium: Prueba previa IN-SITU INCLUIDA - Vamos al espacio de tu boda días antes, hacemos pruebas de sonido e iluminación, revisamos acústica, planificamos ubicación exacta de equipos. Para todas las bodas: Montamos con antelación (día anterior o mañana) y hacemos pruebas completas antes de que lleguen invitados. Durante la ceremonia: soundcheck discreto 30 minutos antes. Te garantizamos que todo estará perfecto cuando comience tu boda."
      },
      {
        question: "¿Qué forma de pago aceptáis para bodas?",
        answer: "Proceso de pago para bodas: Reserva de fecha: Señal 30% al confirmar (bloquea fecha en exclusiva). Pago intermedio: 40% dos meses antes de la boda. Pago final: 30% restante una semana antes de la boda. Métodos aceptados: Transferencia bancaria (preferente), Bizum (hasta 1.000€ por pago), Tarjeta de crédito/débito, PayPal. Emitimos factura oficial completa con IVA desglosado. Para empresas: Pago a 30 días con contrato marco. Todos los pagos 100% seguros. En caso de cancelación: Política de cancelación flexible según antelación y circunstancias. Lo hablamos personalmente en cada caso."
      },
      {
        question: "¿Ofrecéis descuentos si contratamos varios servicios?",
        answer: "Sí, descuentos significativos por packs combinados: Sonido + Iluminación: 15% descuento. Sonido + Iluminación + Photocall: 20% descuento. Servicio completo (ceremonia + cocktail + banquete + fiesta): 15% descuento vs contratar por separado. Bodas largas (+12 horas): Precio especial día completo. Bodas entre semana (lunes-jueves): 10% descuento adicional. Temporada baja (enero-marzo): Condiciones especiales. Recomendación de otros novios: Regalo especial. Eventos múltiples (pre-boda + boda + postboda): Pack personalizado con descuento. Cada boda es única, hacemos presupuesto a medida para optimizar tu inversión."
      },
      {
        question: "¿Tenéis referencias de otras bodas en Valencia?",
        answer: "Por supuesto. Portfolio con fotos y vídeos de bodas reales realizadas (con permiso de los novios). Testimonios escritos de parejas satisfechas. Referencias verificables de wedding planners con los que colaboramos habitualmente. Vídeos de montajes en espacios emblemáticos de Valencia. Contactos de parejas que aceptan ser referencia (si lo solicitas). Reseñas Google Business verificadas. Colaboraciones con: Bodas.net (perfil verificado), Wedding planners Valencia, Fincas y espacios bodas, Proveedores bodas (catering, fotografía, floristas). Puedes vernos en acción en cualquier boda donde trabajemos (pregunta si tenemos alguna próxima donde puedas visitarnos). Nuestra reputación es nuestro mayor activo."
      },
      {
        question: "¿Qué equipos de sonido e iluminación usáis en bodas?",
        answer: "Equipamiento profesional exclusivamente: SONIDO - Altavoces DAS Audio 515A (1500W) y ICOA 12A/15A blancos elegantes, subwoofers DAS Audio 215A/218A para graves, mezcladoras Behringer X Air XR18 digitales, equipos DJ Pioneer RX2/CDJ-2000 profesionales, micrófonos Shure SM58/Beta 58A inalámbricos. ILUMINACIÓN - Focos LED RGB 18W uplighting inalámbricos, moving heads beam/wash profesionales, máquinas humo bajo Antari ICE-101 para baile nubes, proyectores gobo para nombres personalizados, bañadores LED exterior IP65. Todo perfectamente mantenido, calibrado y con certificaciones profesionales."
      },
      {
        question: "¿El técnico está durante toda la boda en Valencia?",
        answer: "Sí, en TODOS nuestros packs para bodas el técnico especializado está presente durante TODO el evento: Llega 2-3 horas antes para montaje y configuración. Gestiona sonido perfecto durante ceremonia (micrófonos, música entrada/salida). Ajusta música ambiente durante cóctel. Optimiza niveles durante banquete y discursos. Opera iluminación y efectos especiales (primer baile, baile nubes). Gestiona la fiesta trabajando con el DJ. Permanece hasta el final del evento. Se encarga del desmontaje completo. No te dejamos solo en ningún momento. El técnico es discreto pero siempre atento a que todo funcione perfecto."
      },
      {
        question: "¿Podemos personalizar los colores de iluminación para nuestra boda?",
        answer: "Totalmente personalizable. Coordinamos iluminación con vuestros colores de boda: Ceremonia (blanco cálido, dorado, o color personalizado). Cóctel (tonos suaves coordinados con decoración). Banquete (colores elegantes que combinen con flores/manteles). Primer baile (colores románticos especiales). Fiesta (colores vivos dinámicos). Programamos hasta 20 escenas diferentes de colores. Podéis cambiar colores durante el evento si queréis. Enviádnos fotos de vuestra decoración/flores y preparamos paleta cromática perfecta. El técnico programa todo antes de que lleguen invitados."
      },
      {
        question: "¿Funcionan bien los equipos en bodas al aire libre en Valencia?",
        answer: "Sí, perfectamente. Equipos diseñados para exterior: SONIDO - Altavoces con protección contra humedad, micrófonos que cancelan viento/ruido ambiental, sistemas que funcionan en espacios abiertos sin eco. ILUMINACIÓN - Focos LED IP65 resistentes a lluvia/polvo, equipos inalámbricos con batería 12h (sin cables), protección anti-lluvia incluida. Hemos trabajado en cientos de bodas al aire libre: jardines de fincas, playas, patios, terrazas con vistas, espacios abiertos. Si cambia el tiempo (lluvia), movemos equipos a interior sin coste adicional. Llevamos siempre protección extra. 500+ bodas sin cancelar ninguna por meteorología."
      },
      {
        question: "¿Incluís microfonía para ceremonia y discursos en la boda?",
        answer: "Sí, totalmente incluido en todos los packs: Ceremonia - Micrófono de solapa/diadema para sacerdote/maestro ceremonias (manos libres), 2 micrófonos de mano para lecturas, sistema para que el oficiante se escuche bien. Banquete - Micrófonos inalámbricos para discursos de padres/padrinos/testigos/novios, sistema de monitorización, mezcla profesional de niveles. Los micrófonos son Shure profesionales, inalámbricos (sin cables), con batería 8+ horas. El técnico los coloca, prueba y gestiona durante todos los momentos que se necesiten. Discretos pero con sonido perfecto."
      },
      {
        question: "¿Ofrecéis baile en las nubes para el primer baile?",
        answer: "Sí, es uno de nuestros efectos más populares. Máquinas profesionales Antari ICE-101 que crean niebla densa a ras de suelo durante vuestro primer baile como pareja. Efecto mágico de bailar sobre nubes. Combinado con iluminación LED RGB que ilumina el humo creando colores espectaculares. El humo es frío (ice fog), completamente seguro, no tóxico, no mancha ropa, y se disipa en 3-5 minutos. Incluido en Pack Premium o añadible a cualquier pack por 120€. El momento más emotivo y fotografiado de muchas bodas. Hemos hecho baile nubes en centenares de bodas en Valencia con resultados siempre espectaculares."
      },
      {
        question: "¿Trabajáis en domingo y festivos en Valencia sin recargo?",
        answer: "Sí, trabajamos TODOS los días del año: domingos, festivos, Navidad, Año Nuevo, Fallas, San Juan, y cualquier fecha especial. SIN RECARGO en nuestros packs estándar para bodas (mismo precio que entre semana). Sabemos que muchas bodas en Valencia son en domingo (especialmente en verano). Tenemos equipos técnicos disponibles 365 días. Solo para servicios de última hora (menos de 72h) en festivos aplicamos pequeño suplemento urgencia. La mayoría de bodas son fines de semana y festivos, es nuestro trabajo habitual. Llama al 613 88 14 14 para confirmar disponibilidad en tu fecha."
      },
      {
        question: "¿Qué pasa si mi boda se alarga más de lo previsto?",
        answer: "Sin problema. Nuestros packs incluyen horarios generosos: Pack Básico (ceremonia + cóctel): 4-5 horas. Pack Completo (ceremonia + banquete + fiesta): 8-10 horas. Pack Premium (día completo): 12-14 horas. Si la boda se alarga 30-60 minutos, normalmente lo incluimos sin coste (el técnico se queda hasta que termine). Para extensiones mayores: 50€/hora adicional. Muchas bodas en Valencia duran hasta las 3-4 AM y no hay problema. El técnico se queda hasta el final, desmonta, y todos felices. Hablamos todo esto en la reunión previa para ajustar horarios realistas a vuestro timeline de boda."
      },
      {
        question: "¿Coordinais con otros proveedores de la boda en Valencia?",
        answer: "Totalmente. Coordinación profesional con TODOS vuestros proveedores: Wedding planner - Seguimos su timeline al detalle, coordinamos montaje/desmontaje. Catering - Sincronizamos música ambiente, avisos de servicio, momento del brindis. Fotógrafo/videógrafo - Coordinamos iluminación para fotos/vídeo perfectos, pausamos música para discursos. DJ/banda - Proporcionamos equipos, trabajamos juntos durante fiesta. Finca/hotel - Respetamos restricciones horario/ruido, coordinamos montaje. Hemos trabajado con los principales proveedores de bodas en Valencia. Conocemos cómo funciona el timing de bodas y nos integramos perfectamente en el equipo. Un proveedor menos del que preocuparse."
      }
    ],

    relatedServices: [
      { title: "Alquiler de Sonido Valencia", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Iluminación LED Profesional", url: "/servicios/iluminacion-led-profesional" },
      { title: "Alquiler de DJ Valencia", url: "/servicios/alquiler-dj-valencia" },
      { title: "Pantallas LED para Eventos", url: "/servicios/alquiler-pantallas-led-eventos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default SonidoIluminacionBodasValencia;
