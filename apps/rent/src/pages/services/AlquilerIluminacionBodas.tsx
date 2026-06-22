import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerIluminacionBodas = () => {
  const pageData = {
    title: "Iluminación Bodas Valencia | LED Ambiental | ReSona",
    metaDescription: "Iluminación para bodas en Valencia. Ambiental, arquitectónica, pista de baile. Técnico incluido. Desde 150€. ☎️ 613 88 14 14",
    keywords: "iluminación bodas valencia, luces boda, iluminación ambiental boda, bodas valencia, luces bodas valencia",
    canonicalUrl: "https://resonaevents.com/servicios/alquiler-iluminacion-bodas",
    heroTitle: "Iluminación Profesional para Bodas en Valencia",
    heroSubtitle: "Focos LED RGB, Moving Heads, Efectos - Iluminación mágica para tu boda",
    introduction: `La <strong>iluminación para bodas en Valencia</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Events contamos con más de 15 años de experiencia proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>iluminación para bodas en Valencia</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Trabajamos exclusivamente con equipamiento profesional de las marcas líderes del mercado: uplights LED, PAR LED RGBW, moving heads, proyectores gobo, garantizando rendimiento y fiabilidad máximos.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos nuestros sistemas se entregan con técnico especializado incluido, quien se encarga de la instalación, configuración, operación durante el evento y desmontaje completo.

El servicio completo incluye transporte sin coste adicional en Valencia capital y hasta 30 kilómetros, montaje y desmontaje profesional, calibración técnica, asistencia técnica durante todo el evento, equipos de respaldo en los packs premium, y soporte telefónico 24/7.

Hemos iluminado más de 500 <strong>bodas en Valencia</strong>: <strong>La Hacienda</strong>, <strong>Mas de San Antonio</strong>, <strong>El Bohío</strong>, <strong>Viveros Municipales</strong>, <strong>Torre del Pi</strong>, <strong>Hotel Las Arenas</strong>, <strong>Casa Granero</strong>, fincas en Godella, Bétera, L'Eliana, Alboraya, y espacios únicos en toda la provincia. Si buscas un <a href="/bodas-valencia" class="text-primary-600 hover:underline font-semibold">servicio completo para bodas en Valencia</a>, también ofrecemos <a href="/servicios/sonido-bodas-valencia" class="text-primary-600 hover:underline font-semibold">sonido para bodas</a> y <a href="/servicios/sonido-iluminacion-bodas-valencia" class="text-primary-600 hover:underline font-semibold">packs completos sonido + iluminación</a>.`,
   
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

    technicalSpecs: [
      {
            title: "Iluminación Ambiental para Bodas",
            items: [
                  "Focos LED RGB Decoración 18W: Millones de colores, control remoto, compactos y discretos",
                  "8+ focos disponibles - Iluminan paredes, columnas, mesas, rincones",
                  "Cambio de color programado: ceremonia (blanco/dorado), banquete (cálido), fiesta (colores)",
                  "Batería opcional - Funcionan sin cables en espacios sin electricidad",
                  "Instalación invisible - Se colocan antes de los invitados"
            ]
      },
      {
            title: "Efectos Dinámicos - Entrada y Primer Baile",
            items: [
                  "Moving Head 3en1 17R: Beam/Spot/Wash 350W, efectos espectaculares entrada de novios",
                  "Moving Head Beam 7R: Haces de luz concentrados, sincronizados con música primer baile",
                  "Flash Estroboscópico RGB 1000W: Momentos clave (entrada, brindis, corte tarta)",
                  "Ventilador LED RGB: Efectos giratorios de luz para pista de baile",
                  "Control DMX sincronizado - Efectos coordinados perfectamente con la música"
            ]
      },
      {
            title: "Iluminación de Pista de Baile",
            items: [
                  "Mini Beam LED + Mini Wash RGBW: Efectos compactos para pista de baile",
                  "Modo automático music-reactive - Se sincronizan con la música del DJ",
                  "Programación de escenas personalizadas por momento (cena, baile, fiesta)",
                  "Técnico especializado controla todo desde tablet de forma discreta",
                  "Sin molestas luces en la cara - Orientación profesional hacia arriba/paredes"
            ]
      },
      {
            title: "Servicio Completo Bodas",
            items: [
                  "Visita previa al espacio - Diseñamos la iluminación según tu masía/finca/hotel",
                  "Montaje invisible 2-3 horas antes - Todo listo antes de los invitados",
                  "Cambios de ambiente programados - Ceremonia, cóctel, banquete, fiesta",
                  "Técnico todo el día - Ajusta luces en tiempo real según necesidades",
                  "Desmontaje al finalizar - Tú solo disfrutas, nosotros nos ocupamos de todo"
            ]
      }
],

    packages: [
      {
        name: "Pack Ambiente",
        subtitle: "Iluminación ambiental (50-100 invitados)",
        price: "desde 150€",
        features: [
          "8x Focos LED RGB Decoración",
          "Iluminación de paredes/columnas",
          "Cambios de color programados",
          "Transporte Valencia capital",
          "Montaje invisible antes de invitados"
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
            question: "¿Qué incluye exactamente el servicio de iluminación para bodas en Valencia?",
            answer: "Nuestro servicio completo de iluminación para bodas en Valencia incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales."
      },
      {
            question: "¿Con cuánta antelación debo reservar el iluminación para bodas en Valencia?",
            answer: "El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como ceremonia o banquete que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas."
      },
      {
            question: "¿El técnico especializado está incluido en el precio?",
            answer: "Sí, en los packs Profesional y Premium el técnico especializado está totalmente incluido durante todo el evento. El técnico llega 2-3 horas antes para montaje y configuración, permanece durante todo el desarrollo del evento gestionando niveles, ecualizaciones y solucionando cualquier incidencia técnica, y se encarga del desmontaje completo al finalizar. En el pack Básico, los equipos son autoamplificados fáciles de operar con controles intuitivos, pero puedes añadir técnico especializado por 150€ adicionales si lo prefieres. Nuestros técnicos tienen formación específica en iluminacion profesional y más de 10 años de experiencia en eventos en Valencia, garantizando resultados profesionales impecables."
      },
      {
            question: "¿El transporte y montaje tiene coste adicional?",
            answer: "No, el transporte está completamente incluido en Valencia capital y hasta 30 kilómetros de radio sin ningún coste adicional. Para distancias superiores aplicamos suplemento: 30-50km +30€, 50-80km +60€, 80-120km +100€, más de 120km consultar presupuesto personalizado. El precio incluye: transporte de ida con furgoneta equipada, descarga y traslado de equipos al espacio del evento, montaje completo siguiendo especificaciones técnicas y plano del espacio, calibración y pruebas, desmontaje al finalizar el evento, recogida y transporte de vuelta. Todo en un precio cerrado final sin sorpresas. También ofrecemos opción de recogida en nuestro almacén en Valencia con 20% descuento si prefieres transportar tú mismo."
      },
      {
            question: "¿Qué pasa si hay algún fallo técnico durante el evento?",
            answer: "La fiabilidad es nuestra máxima prioridad. Todos nuestros equipos pasan revisión técnica completa antes de cada evento y utilizamos exclusivamente marcas profesionales de máxima confianza. En los packs Profesional y Premium incluimos siempre equipos de respaldo (backup completo de elementos críticos) sin coste adicional. En el improbable caso de fallo técnico, el técnico presente soluciona el 95% de incidencias en menos de 5 minutos. Para el 5% restante, disponemos de técnicos de guardia 24/7 con furgoneta equipada para reemplazo urgente, llegando en menos de 60 minutos en Valencia capital. En 15 años de trayectoria y más de 2.000 eventos realizados, nunca hemos tenido que cancelar o suspender un evento por fallo técnico gracias a nuestros sistemas redundantes y protocolos de contingencia."
      },
      {
            question: "¿Trabajáis con todos los tipos de eventos en Valencia?",
            answer: "Sí, tenemos amplia experiencia en todo tipo de eventos: ceremonia, banquete, primer baile, cocktail, decoración, y cualquier celebración que requiera iluminación para bodas en Valencia. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica."
      },
      {
            question: "¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?",
            answer: "Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas."
      },
      {
            question: "¿Puedo ver los equipos antes de contratar el servicio?",
            answer: "Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para ceremonia o banquete grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento."
      },
      {
            question: "¿Qué formas de pago aceptáis?",
            answer: "Aceptamos múltiples formas de pago para tu comodidad: transferencia bancaria (IBAN español), Bizum (hasta 1.000€), tarjeta de crédito/débito (Visa, Mastercard), PayPal, y efectivo. El proceso de reserva es: 1) Confirmas fecha y servicio, 2) Pagas señal del 30% para bloquear fecha (no reembolsable), 3) Pagas 70% restante hasta 7 días antes del evento, 4) Realizamos el evento, 5) Firmas albarán de conformidad. Emitimos factura completa con IVA desglosado. Para empresas ofrecemos pago a 30 días con contrato marco. Para eventos grandes (+ 2.000€) aceptamos pago fraccionado: 30% reserva, 40% un mes antes, 30% 7 días antes. Todas las transacciones son seguras y ofrecemos recibo/factura oficial."
      },
      {
            question: "¿Tenéis seguro de responsabilidad civil?",
            answer: "Sí, disponemos de seguro de responsabilidad civil profesional con cobertura de 600.000€ que cubre cualquier daño a terceros, equipos, instalaciones del venue, y accidentes durante montaje/desmontaje. Además, todos nuestros equipos están asegurados contra robo, daño, y mal funcionamiento. Nuestras estructuras truss están certificadas TÜV (inspección anual), cumplimos normativa UNE-EN 61439, y seguimos todos los protocolos de seguridad eléctrica y prevención de riesgos laborales. Nuestros técnicos tienen formación en prevención de riesgos, primeros auxilios, y trabajos en altura. Podemos proporcionar copia del seguro y certificados si el venue lo requiere. Tu evento está en manos profesionales y totalmente aseguradas, garantizando tranquilidad absoluta."
      },
      {
            question: "¿Cuánto cuesta la iluminación para una boda en Valencia?",
            answer: "El precio de la iluminación para bodas en Valencia depende del tipo de servicio: Pack Ambiente (50-100 invitados) desde 150€ incluye 8+ focos LED RGB para iluminar paredes/columnas. Pack Profesional (100-200 invitados) desde 350€ con iluminación arquitectónica uplighting completa + efectos dinámicos. Pack Premium (+200 invitados) desde 600€ con moving heads, efectos láser, baile en las nubes y programación show completo. Todos incluyen técnico especializado, programación de colores personalizados, transporte Valencia capital, montaje invisible y desmontaje. Sin costes ocultos."
      },
      {
            question: "¿Qué tipo de iluminación ofrecéis para bodas en Valencia?",
            answer: "Ofrecemos iluminación LED profesional completa: Uplighting (focos LED RGB para iluminar paredes, columnas, árboles en cualquier color), proyección de nombres/logotipos con gobo personalizado, iluminación de pista de baile con moving heads y efectos dinámicos, baile en las nubes (humo bajo con iluminación), iluminación arquitectónica exterior para fachadas/jardines, efectos láser profesionales (packs premium), y candilejas LED para mesas/caminos. Toda la iluminación es programable y se sincroniza con los momentos clave de tu boda: ceremonia (blanco/dorado cálido), banquete (colores suaves), primer baile (efectos especiales), fiesta (colores dinámicos)."
      },
      {
            question: "¿Puedo elegir los colores de la iluminación para mi boda?",
            answer: "Sí, totalmente personalizable. Nuestros focos LED RGB pueden crear millones de colores diferentes. Coordinamos los colores con la decoración y paleta cromática de tu boda. Ejemplos típicos: ceremonia en blanco cálido/dorado, banquete en tonos rosas/melocotón/lavanda según decoración, primer baile en azul/morado romántico, fiesta en colores vivos dinámicos. Programamos cambios de color automáticos para cada momento o puedes tener control manual durante el evento. Muchos novios eligen iluminación que combine con las flores, manteles o tema de la boda. El técnico programa todos los colores antes de que lleguen los invitados."
      },
      {
            question: "¿Qué es el uplighting y para qué sirve en bodas?",
            answer: "El uplighting son focos LED RGB colocados en el suelo que iluminan hacia arriba (paredes, columnas, cortinas, árboles, techos altos). Es la iluminación más popular en bodas porque transforma completamente el espacio con luz de color personalizada. Beneficios: cambia el ambiente del espacio según el momento de la boda, oculta paredes feas o elementos poco estéticos iluminándolos en tu color, crea profundidad y atmósfera en espacios grandes, es muy versátil (funciona en cualquier finca/hotel), y el efecto visual es espectacular en fotos y vídeo. Usamos focos LED inalámbricos con batería (sin cables visibles) que se colocan discretamente. Pack Profesional incluye 12-16 focos, Pack Premium 20-30 focos."
      },
      {
            question: "¿Ofrecéis baile en las nubes para bodas en Valencia?",
            answer: "Sí, el baile en las nubes (first dance on clouds) es uno de nuestros efectos más solicitados para bodas. Usamos máquinas de humo bajo profesionales (Antari ICE-101) que crean una capa de niebla densa a ras de suelo durante el primer baile de los novios, dando efecto mágico de bailar sobre nubes. Combinamos con iluminación LED RGB que ilumina el humo desde abajo creando colores espectaculares. El humo es frío (ice fog), no tóxico, no deja residuos, y se disipa en 3-5 minutos. Está incluido en Pack Premium o se puede añadir a cualquier pack por 120€ adicionales. Hemos hecho baile en nubes en cientos de bodas en Valencia con resultados siempre espectaculares."
      },
      {
            question: "¿La iluminación funciona bien en bodas al aire libre en Valencia?",
            answer: "Sí, nuestra iluminación LED está diseñada para exterior. Usamos equipos con certificación IP65 resistentes a lluvia, polvo y humedad. Para bodas en jardines/fincas al aire libre: uplights inalámbricos con batería 12h (sin cables), bañadores LED para iluminar fachadas/árboles, proyectores para nombres en paredes exteriores, y moving heads resistentes para efectos. La iluminación exterior es especialmente impactante al atardecer/noche. Llevamos protección extra contra lluvia. Hemos iluminado bodas en jardines de La Hacienda, patios de masías, playas, terrazas con vistas, y espacios abiertos con resultados perfectos. La iluminación exterior profesional crea ambiente mágico que no se consigue con iluminación básica."
      },
      {
            question: "¿Podéis proyectar nuestros nombres o iniciales en la boda?",
            answer: "Sí, ofrecemos proyección de nombres/iniciales personalizada con proyector gobo. Proyectamos en paredes, suelo, techo o cualquier superficie lisa. Diseñamos el gobo (plantilla metálica) con vuestros nombres, iniciales, fecha de boda, o logo personalizado. El proyector puede cambiar de color y rotar. Muy popular proyectar en: pared detrás de la mesa presidencial, suelo de la pista de baile, entrada al banquete, o fachada exterior. El diseño del gobo está incluido, solo pagas la fabricación del gobo físico (80-120€ según complejidad). Puedes conservar el gobo de recuerdo. El proyector y técnico para programarlo están incluidos en nuestros packs. Envíanos vuestros nombres/diseño y preparamos una preview antes de la boda."
      },
      {
            question: "¿Qué diferencia hay entre iluminación LED y iluminación tradicional?",
            answer: "La iluminación LED profesional que usamos tiene ventajas enormes vs. iluminación tradicional: Consumo 90% menor (importante en fincas con electricidad limitada), no genera calor (los invitados no sufren calor), cambia de color instantáneamente (millones de colores vs. filtros fijos), control DMX programable (automatizamos cambios de color/escenas), equipos más compactos y ligeros (montaje más rápido y discreto), y vida útil 10x mayor (equipos más fiables). La iluminación tradicional con halógenos consume mucha electricidad, genera calor insoportable, y solo da luz blanca/amarilla. Todas las bodas modernas usan LED. Nuestros equipos LED son profesionales (no LED domésticos baratos), garantizando colores vivos, potencia adecuada y control total."
      },
      {
            question: "¿Incluís iluminación para toda la boda o solo para la fiesta?",
            answer: "Nuestros packs incluyen iluminación para toda la boda: ceremonia (iluminación suave ceremonia/cocktail), banquete (iluminación ambiente durante cena), primer baile (efectos especiales románticos), y fiesta (iluminación dinámica completa). No solo iluminamos la fiesta. El técnico programa diferentes escenas para cada momento: ceremonia en tonos cálidos discretos, banquete con uplighting en colores de tu decoración, primer baile con efectos especiales, y fiesta con moving heads/efectos dinámicos. La iluminación evoluciona durante la boda creando ambientes diferentes. Si solo quieres iluminar la fiesta, ofrecemos packs reducidos, pero recomendamos iluminación completa porque transforma totalmente el espacio desde el inicio."
      },
      {
            question: "¿Trabajáis iluminación para bodas en todas las fincas de Valencia?",
            answer: "Sí, trabajamos en cualquier finca, hotel, masía o espacio en Valencia. Hemos iluminado más de 500 bodas en: La Hacienda, Mas de San Antonio, El Bohío, Torre del Pi, Alquería del Pi, Casa Granero, Masía Egara, Viveros Municipales, Hotel Las Arenas, y centenares de fincas en Godella, Bétera, L'Eliana, Alboraya, Torrent y toda la provincia. Conocemos las particularidades de cada finca: puntos eléctricos disponibles, restricciones de instalación, mejores ubicaciones para uplighting, y permisos necesarios. Para fincas donde no hemos trabajado antes, hacemos visita técnica previa gratuita para planificar distribución óptima de iluminación y garantizar resultado espectacular."
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

export default AlquilerIluminacionBodas;
