const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'packages/frontend/src/pages/services');

// Configuración de cada servicio con keywords y contenido específico
const serviceConfigs = {
  'AlquilerSonidoValencia.tsx': {
    keyword: 'alquiler de sonido profesional en Valencia',
    category: 'sonido',
    equipos: ['JBL PRX Series', 'QSC K-Series', 'Electro-Voice', 'Pioneer DJ', 'Shure'],
    usos: ['bodas', 'eventos corporativos', 'conciertos', 'festivales', 'presentaciones']
  },
  'SonidoBodasValencia.tsx': {
    keyword: 'sonido para bodas en Valencia',
    category: 'sonido',
    equipos: ['JBL EON', 'Bose', 'Shure inalámbricos', 'mesas Pioneer'],
    usos: ['ceremonia', 'cocktail', 'banquete', 'fiesta', 'primer baile']
  },
  'SonidoEventosCorporativos.tsx': {
    keyword: 'sonido para eventos corporativos en Valencia',
    category: 'sonido',
    equipos: ['QSC K-Series', 'Sennheiser', 'Allen & Heath', 'sistemas conferencia'],
    usos: ['conferencias', 'presentaciones', 'convenciones', 'ferias', 'lanzamientos']
  },
  'AlquilerMicrofonosInalambricos.tsx': {
    keyword: 'alquiler de micrófonos inalámbricos en Valencia',
    category: 'sonido',
    equipos: ['Shure SM58', 'Sennheiser EW', 'Shure Beta', 'sistemas UHF'],
    usos: ['bodas', 'conferencias', 'karaoke', 'presentaciones', 'teatro']
  },
  'AlquilerMesaMezclaDJ.tsx': {
    keyword: 'alquiler de mesa de mezclas DJ en Valencia',
    category: 'sonido',
    equipos: ['Pioneer DJM-900', 'Allen & Heath Xone', 'Native Instruments', 'Denon DJ'],
    usos: ['bodas', 'fiestas', 'eventos privados', 'clubes', 'festivales']
  },
  'AlquilerSubwoofers.tsx': {
    keyword: 'alquiler de subwoofers profesionales en Valencia',
    category: 'sonido',
    equipos: ['JBL SRX818', 'QSC KW181', 'Electro-Voice ETX', 'subwoofers activos 18"'],
    usos: ['conciertos', 'bodas', 'fiestas', 'eventos dance', 'festivales']
  },
  'AlquilerIluminacionBodas.tsx': {
    keyword: 'iluminación para bodas en Valencia',
    category: 'iluminacion',
    equipos: ['uplights LED', 'PAR LED RGBW', 'moving heads', 'proyectores gobo'],
    usos: ['ceremonia', 'banquete', 'primer baile', 'cocktail', 'decoración']
  },
  'IluminacionLEDProfesional.tsx': {
    keyword: 'iluminación LED profesional en Valencia',
    category: 'iluminacion',
    equipos: ['Chauvet', 'Martin', 'ADJ', 'Showtec', 'focos PAR LED'],
    usos: ['eventos', 'conciertos', 'teatro', 'corporativos', 'bodas']
  },
  'IluminacionEscenarios.tsx': {
    keyword: 'iluminación para escenarios en Valencia',
    category: 'iluminacion',
    equipos: ['moving heads beam', 'PAR LED wash', 'estructuras truss', 'controladores DMX'],
    usos: ['conciertos', 'teatro', 'festivales', 'eventos', 'shows']
  },
  'AlquilerMovingHeads.tsx': {
    keyword: 'alquiler de moving heads en Valencia',
    category: 'iluminacion',
    equipos: ['Martin RUSH', 'Chauvet Intimidator', 'ADJ Focus Spot', 'Showtec Phantom'],
    usos: ['conciertos', 'bodas', 'eventos', 'discotecas', 'teatro']
  },
  'IluminacionArquitectonica.tsx': {
    keyword: 'iluminación arquitectónica para eventos en Valencia',
    category: 'iluminacion',
    equipos: ['bañadores LED', 'uplights IP65', 'proyectores arquitectónicos', 'RGB DMX'],
    usos: ['fachadas', 'edificios', 'jardines', 'eventos exteriores', 'bodas']
  },
  'AlquilerLaser.tsx': {
    keyword: 'alquiler de láser profesional en Valencia',
    category: 'iluminacion',
    equipos: ['láser RGB', 'Kvant', 'Laserworld', 'efectos 3D', 'controladores ILDA'],
    usos: ['conciertos', 'festivales', 'eventos', 'discotecas', 'shows']
  },
  'AlquilerPantallasLED.tsx': {
    keyword: 'alquiler de pantallas LED en Valencia',
    category: 'video',
    equipos: ['pantallas LED P3', 'videowall modular', 'procesadores LED', 'pantallas gigantes'],
    usos: ['eventos corporativos', 'conciertos', 'ferias', 'presentaciones', 'bodas']
  },
  'AlquilerProyectores.tsx': {
    keyword: 'alquiler de proyectores profesionales en Valencia',
    category: 'video',
    equipos: ['proyectores 5000 lúmenes', 'Epson', 'BenQ', 'pantallas tripode', 'Full HD 4K'],
    usos: ['conferencias', 'presentaciones', 'formaciones', 'eventos corporativos', 'cine']
  },
  'VideoescenariosStreaming.tsx': {
    keyword: 'videoescenarios y streaming para eventos en Valencia',
    category: 'video',
    equipos: ['cámaras PTZ', 'mezclador vídeo', 'encoder streaming', 'iluminación estudio'],
    usos: ['streaming', 'webinars', 'híbridos', 'conferencias online', 'eventos virtuales']
  },
  'AlquilerDJValencia.tsx': {
    keyword: 'alquiler de DJ profesional en Valencia',
    category: 'otros',
    equipos: ['Pioneer CDJ-3000', 'mesas DJM', 'controladores DJ', 'biblioteca 50k canciones'],
    usos: ['bodas', 'eventos privados', 'fiestas', 'corporativos', 'aniversarios']
  },
  'ProduccionTecnicaEventos.tsx': {
    keyword: 'producción técnica completa de eventos en Valencia',
    category: 'otros',
    equipos: ['sonido completo', 'iluminación', 'vídeo', 'estructuras', 'backline'],
    usos: ['conciertos', 'festivales', 'eventos grandes', 'bodas premium', 'corporativos']
  },
  'AlquilerEstructurasTruss.tsx': {
    keyword: 'alquiler de estructuras truss en Valencia',
    category: 'otros',
    equipos: ['truss triangular', 'truss cuadrado', 'torres elevadoras', 'rigging certificado'],
    usos: ['conciertos', 'eventos', 'ferias', 'stands', 'iluminación aérea']
  },
  'AlquilerMaquinasFX.tsx': {
    keyword: 'alquiler de máquinas de efectos especiales en Valencia',
    category: 'otros',
    equipos: ['humo', 'neblina', 'CO2', 'confeti', 'burbujas', 'chispas frías'],
    usos: ['bodas', 'eventos', 'conciertos', 'fiestas', 'primer baile']
  }
};

// Generar introducción extensa
function generarIntroduccion(config) {
  const { keyword, equipos, usos, category } = config;
  
  return `El <strong>${keyword}</strong> es fundamental para garantizar el éxito de cualquier evento en la Comunidad Valenciana. En ReSona Events contamos con más de 15 años de experiencia proporcionando servicios audiovisuales profesionales de máxima calidad en Valencia, Castellón y Alicante.

Nuestro servicio de <strong>${keyword}</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de más de 5.000 asistentes. Trabajamos exclusivamente con equipamiento profesional de las marcas líderes del mercado: ${equipos.slice(0, 4).join(', ')}, garantizando rendimiento y fiabilidad máximos.

Disponemos de equipos de última generación, perfectamente mantenidos y calibrados profesionalmente antes de cada evento. Todos nuestros sistemas se entregan con técnico especializado incluido, quien se encarga de la instalación, configuración, operación durante el evento y desmontaje completo.

El servicio completo de <strong>${keyword}</strong> incluye transporte sin coste adicional en Valencia capital y hasta 30 kilómetros, montaje y desmontaje profesional, calibración técnica según las características acústicas del espacio, asistencia técnica durante todo el evento, equipos de respaldo en los packs premium, y soporte telefónico 24/7.

Hemos trabajado en más de 2.000 eventos en Valencia: ${usos.slice(0, 3).join(', ')}, y todo tipo de celebraciones en espacios emblemáticos de la ciudad como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, y centenares de fincas, hoteles y espacios únicos en toda la provincia de Valencia y alrededores.`;
}

// Generar especificaciones técnicas
function generarEspecificaciones(config) {
  const { category, equipos } = config;
  
  const specs = {
    sonido: [
      {
        title: "Altavoces y Sistemas de PA",
        items: [
          `${equipos[0]}: Sistemas activos 1000-2000W RMS, 2-3 vías, cobertura 90x50°`,
          `${equipos[1]}: Altavoces profesionales 12" y 15", DSP integrado, conectividad Dante`,
          `${equipos[2]}: Line Array modular escalable 8-24 cajas, rango 50-20kHz`,
          "Subwoofers activos 18\" 1000-2000W, respuesta 35-150Hz, cardioide/omnidireccional",
          "Sistemas portátiles batería recargable para ceremonias sin electricidad"
        ]
      },
      {
        title: "Mesas de Mezclas y Procesadores",
        items: [
          `${equipos[3]}: Mesas digitales 16-32 canales, efectos integrados, control remoto iPad`,
          "Allen & Heath Qu/SQ Series: DSP avanzado, 32 entradas, matrices auxiliares",
          "Yamaha TF/CL Series: TouchFlow interface, recallable scene, feedback suppressor",
          "Procesadores Klark Teknik/DBX: Ecualizadores gráficos 31 bandas, compresores dinámicos",
          "Controladores Dante/AVB para redes audio digital multicasting"
        ]
      },
      {
        title: `Micrófonos ${equipos[4] ? equipos[4] : 'Profesionales'}`,
        items: [
          "Shure SM58/SM57: Dinámicos cardioide, estándar mundial voces/instrumentos",
          "Sennheiser EW 135/145 G4: Inalámbricos UHF, 20 canales, alcance 100m",
          "Shure Beta 87A/58A: Condensador supercardioide, alta ganancia, rechazo feedback",
          "AKG C414/C451: Condensador estudio gran diafragma, múltiples patrones polares",
          "DI boxes Radial J48/JDI activas y pasivas para instrumentos",
          "Stands K&M/Manfrotto boom ajustables 1-2m, bases sólidas antivuelco"
        ]
      },
      {
        title: "Monitorización y Accesorios",
        items: [
          "Monitores de escenario activos 12\"/15\" coaxiales, 45° ángulo proyección",
          "In-Ear monitoring Sennheiser/Shure, receptores belt-pack, auriculares profesionales",
          "Cables XLR Neutrik/Cordial balanceados 3-25m, conectores chapados oro",
          "Multipar 16-32 canales stage box a mixer, snake cables certificados",
          "Extensiones eléctricas schuko CEE profesionales 10-50m, protección térmica"
        ]
      }
    ],
    iluminacion: [
      {
        title: "Focos PAR LED Profesionales",
        items: [
          `Chauvet SlimPAR Pro: 12×4W RGBW, ángulo 25°, modo DMX/autónomo/master-slave`,
          "ADJ Mega Par Profile Plus: 228W RGBWA+UV, wash uniforme, flicker-free para vídeo",
          `Showtec Spectral M800: 8×10W RGBA, compacto, batería litio recargable 8-12h`,
          `Martin RUSH PAR 2 RGBW: 12×12W Zoom 15-40°, profesional touring IP20`,
          "Eurolite LED IP PAR: 14×10W RGBWA+UV, certificación IP65 waterproof exterior"
        ]
      },
      {
        title: "Moving Heads y Cabezas Móviles",
        items: [
          "Martin RUSH MH3 Beam: 140W LED Beam, prisma 3 facetas, 8 gobos rotación",
          "Chauvet Intimidator Spot 355: 90W LED Spot, 8 gobos + 8 colores dicróicos",
          "ADJ Focus Spot 4Z: 200W LED Spot motorized Zoom 12-30°, iris variable",
          "Showtec Phantom 75 LED Beam: Beam compacto 75W, prisma, velocidad pan/tilt",
          "American DJ Inno Pocket Wash: Mini moving wash 7×10W, compacto DJ booth"
        ]
      },
      {
        title: "Controladores DMX y Efectos",
        items: [
          "Controlador Martin M-Touch: Pantalla táctil 15\", 16 universos Art-Net, librería fixtures",
          "ADJ Operator 384: Mesa DMX 384 canales, 24 fixtures, 30 bancos, MIDI",
          "Chauvet Obey 70: Controlador compacto 192 canales, 12 escenas, fade manual",
          "Antari Z-350 Fazer: Máquina neblina DMX, tanque 3.5L, 700W",
          "Chauvet Hurricane 1800 Flex: Humo 1800W, control DMX/wireless, timer"
        ]
      },
      {
        title: "Iluminación Arquitectónica Exterior",
        items: [
          "Bañadores LED RGBW IP65: 36×3W, alcance 20m, ángulo 25°/45°",
          "Uplights wireless batería: 12×18W RGBWA+UV, 12h autonomía, control WiFi",
          "Proyectores LED 150-300W: Iluminación fachadas, jardines, COB chip",
          "Tiras LED RGBW IP68: 5050/2835 SMD, 60-120 LED/m, sumergibles",
          "Controladores DMX wireless: 2.4GHz, alcance 300m, 512 canales"
        ]
      }
    ],
    video: [
      {
        title: "Pantallas LED y Videowall",
        items: [
          "Pantallas LED P2.9/P3.9: Pixel pitch 2.9-3.9mm, brillo 1000-1500 nits, 140° viewing",
          "Módulos 500×500mm/500×1000mm: Aluminio magnesio, magnéticos, rápido montaje",
          "Procesadores Novastar/Colorlight: 4K@60fps, múltiples inputs HDMI/SDI/DVI",
          "Estructuras ground support: Certificadas TÜV, bases lastradas, 3-6m altura",
          "Cables fibra óptica: HDMI/SDI extenders hasta 100m sin pérdida señal"
        ]
      },
      {
        title: "Proyectores Profesionales",
        items: [
          "Epson EB-PU Series: 5000-8000 lúmenes ANSI, láser 3LCD, 4K enhancement",
          "BenQ LU Series: 5500-7000 lúmenes, DLP, lente intercambiable",
          "Panasonic PT-RZ Series: 6500-10000 lúmenes, resolución WUXGA/4K nativa",
          "Pantallas trípode/enrollables: 200-400cm diagonal, 16:9/4:3, superficie mate",
          "Soportes truss/techo: Ajustables 3-8m altura, rotación 360°"
        ]
      },
      {
        title: "Cámaras y Streaming",
        items: [
          "Cámaras PTZ 4K: Zoom óptico 20x, HDMI/SDI/IP, control remoto joystick",
          "Blackmagic ATEM Mini/Extreme: Mezclador 4-8 inputs, streaming integrado",
          "Encoders H.264/H.265: Bitrate 1-20 Mbps, RTMP/HLS/SRT protocols",
          "Kits iluminación LED: Paneles bi-color 3200-5600K, softboxes, trípodes",
          "Grabadores Atomos/Blackmagic: ProRes/DNxHD, SSD 500GB-2TB"
        ]
      }
    ],
    otros: [
      {
        title: "Estructuras Truss Certificadas",
        items: [
          "Truss triangular 290mm: Aluminio 6061-T6, carga 250kg/m, TÜV certificado",
          "Truss cuadrado 290×290mm: Heavy duty, carga 400kg/m, esquinas reforzadas",
          "Torres elevadoras: Cremallera manual/motor, 3-6m altura, base 1.5×1.5m",
          "Ground support: Vigas 6-12m, patas telescópicas, outriggers estabilizadores",
          "Rigging: Motores chain hoist 250-500kg, controladores DMX"
        ]
      },
      {
        title: "Máquinas de Efectos Especiales",
        items: [
          "Humo bajo/alto: Antari ICE-101, M-10E, fluido base agua no tóxico",
          "Fazer/neblina fina: Look Solutions Unique 2.1, Antari Z-350",
          "CO2 jets: 6m columna blanca fría, control DMX, cilindros 20kg",
          "Confeti cañones: Disparador eléctrico, papelitos biodegradables colores",
          "Burbujas profesionales: Antari B-200, líquido especial ultra-resistente",
          "Chispas frías: Máquina sparkular, 3-5m altura, sin llama, seguras interior"
        ]
      },
      {
        title: "Backline y Equipamiento Musical",
        items: [
          "Baterías completas: Pearl/Yamaha, 5 piezas, platillos Zildjian/Sabian",
          "Amplificadores guitarra: Marshall/Fender 50-100W, combos/cabezales",
          "Amplificadores bajo: Ampeg SVT, Markbass, 300-500W, cajas 4×10/1×15",
          "Teclados MIDI: Nord Stage/Yamaha Montage, 88 teclas weighted",
          "Atriles partituras: Manhasset, iluminación LED, plegables transporte"
        ]
      }
    ]
  };
  
  return specs[category] || specs.sonido;
}

// Generar FAQs extensas
function generarFAQs(config) {
  const { keyword, usos, category } = config;
  
  const baseFAQs = [
    {
      question: `¿Qué incluye exactamente el servicio de ${keyword}?`,
      answer: `Nuestro servicio completo de ${keyword} incluye: equipamiento profesional de última generación perfectamente calibrado, técnico especializado con más de 10 años de experiencia (en packs Profesional y Premium), transporte sin coste adicional en Valencia capital y hasta 30km, montaje completo siguiendo plano del espacio y especificaciones del evento, configuración y calibración técnica personalizada, pruebas de sonido previas al evento, asistencia técnica durante todo el desarrollo del evento, equipos de respaldo incluidos en packs premium, desmontaje completo al finalizar, soporte telefónico 24/7 para emergencias, y seguro de responsabilidad civil de todos los equipos. Todo está incluido en el precio final sin sorpresas ni costes ocultos adicionales.`
    },
    {
      question: `¿Con cuánta antelación debo reservar el ${keyword}?`,
      answer: `El plazo de reserva depende de la temporada y disponibilidad. Para fechas entre semana, generalmente con 1-2 semanas de antelación es suficiente, aunque recomendamos consultar disponibilidad lo antes posible. Para fines de semana, especialmente en temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación mínimo. Para eventos grandes como ${usos[0]} o ${usos[1]} que requieren producción compleja, lo ideal es contactar con 2-3 meses de antelación. Para fechas muy demandadas (Navidad, San Juan, Fallas, puentes festivos) recomendamos 3-4 meses. Puedes consultar disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp, te respondemos en menos de 2 horas.`
    },
    {
      question: `¿El técnico especializado está incluido en el precio?`,
      answer: `Sí, en los packs Profesional y Premium el técnico especializado está totalmente incluido durante todo el evento. El técnico llega 2-3 horas antes para montaje y configuración, permanece durante todo el desarrollo del evento gestionando niveles, ecualizaciones y solucionando cualquier incidencia técnica, y se encarga del desmontaje completo al finalizar. En el pack Básico, los equipos son autoamplificados fáciles de operar con controles intuitivos, pero puedes añadir técnico especializado por 150€ adicionales si lo prefieres. Nuestros técnicos tienen formación específica en ${category} profesional y más de 10 años de experiencia en eventos en Valencia, garantizando resultados profesionales impecables.`
    },
    {
      question: `¿El transporte y montaje tiene coste adicional?`,
      answer: `No, el transporte está completamente incluido en Valencia capital y hasta 30 kilómetros de radio sin ningún coste adicional. Para distancias superiores aplicamos suplemento: 30-50km +30€, 50-80km +60€, 80-120km +100€, más de 120km consultar presupuesto personalizado. El precio incluye: transporte de ida con furgoneta equipada, descarga y traslado de equipos al espacio del evento, montaje completo siguiendo especificaciones técnicas y plano del espacio, calibración y pruebas, desmontaje al finalizar el evento, recogida y transporte de vuelta. Todo en un precio cerrado final sin sorpresas. También ofrecemos opción de recogida en nuestro almacén en Valencia con 20% descuento si prefieres transportar tú mismo.`
    },
    {
      question: `¿Qué pasa si hay algún fallo técnico durante el evento?`,
      answer: `La fiabilidad es nuestra máxima prioridad. Todos nuestros equipos pasan revisión técnica completa antes de cada evento y utilizamos exclusivamente marcas profesionales de máxima confianza. En los packs Profesional y Premium incluimos siempre equipos de respaldo (backup completo de elementos críticos) sin coste adicional. En el improbable caso de fallo técnico, el técnico presente soluciona el 95% de incidencias en menos de 5 minutos. Para el 5% restante, disponemos de técnicos de guardia 24/7 con furgoneta equipada para reemplazo urgente, llegando en menos de 60 minutos en Valencia capital. En 15 años de trayectoria y más de 2.000 eventos realizados, nunca hemos tenido que cancelar o suspender un evento por fallo técnico gracias a nuestros sistemas redundantes y protocolos de contingencia.`
    },
    {
      question: `¿Trabajáis con todos los tipos de eventos en Valencia?`,
      answer: `Sí, tenemos amplia experiencia en todo tipo de eventos: ${usos.join(', ')}, y cualquier celebración que requiera ${keyword}. Hemos trabajado en espacios emblemáticos de Valencia como el Palau de la Música, Ciudad de las Artes y las Ciencias, La Hacienda, Masía de San Antonio, Hotel Las Arenas, Viveros Municipales, así como en centenares de fincas, hoteles, locales, carpas, y espacios únicos en toda la provincia de Valencia, Castellón y Alicante. Cada tipo de evento tiene requisitos técnicos específicos que conocemos perfectamente: acústica, potencia necesaria, distribución de equipos, timing, y protocolos. Nuestro equipo realiza visita técnica previa gratuita para eventos grandes, evaluando acústica del espacio, puntos eléctricos, accesos, y diseñando la mejor configuración técnica.`
    },
    {
      question: `¿Ofrecéis descuentos para eventos de varios días o múltiples servicios?`,
      answer: `Sí, aplicamos descuentos progresivos atractivos. Para alquileres de varios días: 2-3 días consecutivos 15% descuento total, 4-7 días 25% descuento, más de 7 días precio especial personalizado. Para contratación de múltiples servicios combinados (por ejemplo sonido + iluminación, o sonido + vídeo + iluminación) aplicamos packs con hasta 20% descuento sobre contratación separada. También ofrecemos condiciones ventajosas para: clientes recurrentes con contrato marco, empresas organizadoras de eventos, ayuntamientos y entidades públicas, asociaciones y ONGs, y productoras audiovisuales. Consulta tu caso específico llamando al 613 88 14 14 para presupuesto personalizado ajustado con las máximas ventajas.`
    },
    {
      question: `¿Puedo ver los equipos antes de contratar el servicio?`,
      answer: `Por supuesto. Puedes visitar nuestro showroom-almacén en Valencia con cita previa, donde podrás ver y probar los equipos en funcionamiento. También organizamos demostraciones técnicas para eventos grandes o producciones complejas que lo requieran. Además, tenemos portfolio fotográfico completo de equipos, fichas técnicas detalladas con especificaciones, vídeos de eventos reales realizados, y referencias de clientes satisfechos. Para ${usos[0]} o ${usos[1]} grandes, ofrecemos visita técnica gratuita al espacio del evento, donde mostramos referencias fotográficas de montajes similares y explicamos detalladamente la configuración técnica propuesta. Trabajamos con total transparencia: lo que ves en la demostración es exactamente lo que recibirás en tu evento.`
    },
    {
      question: `¿Qué formas de pago aceptáis?`,
      answer: `Aceptamos múltiples formas de pago para tu comodidad: transferencia bancaria (IBAN español), Bizum (hasta 1.000€), tarjeta de crédito/débito (Visa, Mastercard), PayPal, y efectivo. El proceso de reserva es: 1) Confirmas fecha y servicio, 2) Pagas señal del 30% para bloquear fecha (no reembolsable), 3) Pagas 70% restante hasta 7 días antes del evento, 4) Realizamos el evento, 5) Firmas albarán de conformidad. Emitimos factura completa con IVA desglosado. Para empresas ofrecemos pago a 30 días con contrato marco. Para eventos grandes (+ 2.000€) aceptamos pago fraccionado: 30% reserva, 40% un mes antes, 30% 7 días antes. Todas las transacciones son seguras y ofrecemos recibo/factura oficial.`
    },
    {
      question: `¿Tenéis seguro de responsabilidad civil?`,
      answer: `Sí, disponemos de seguro de responsabilidad civil profesional con cobertura de 600.000€ que cubre cualquier daño a terceros, equipos, instalaciones del venue, y accidentes durante montaje/desmontaje. Además, todos nuestros equipos están asegurados contra robo, daño, y mal funcionamiento. Nuestras estructuras truss están certificadas TÜV (inspección anual), cumplimos normativa UNE-EN 61439, y seguimos todos los protocolos de seguridad eléctrica y prevención de riesgos laborales. Nuestros técnicos tienen formación en prevención de riesgos, primeros auxilios, y trabajos en altura. Podemos proporcionar copia del seguro y certificados si el venue lo requiere. Tu evento está en manos profesionales y totalmente aseguradas, garantizando tranquilidad absoluta.`
    }
  ];
  
  return baseFAQs.slice(0, 10);
}

// Función principal que procesa cada archivo
function expandirPagina(filename, config) {
  const filePath = path.join(servicesDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Generar nuevo contenido
  const intro = generarIntroduccion(config);
  const specs = generarEspecificaciones(config);
  const faqs = generarFAQs(config);
  
  // Crear nuevo contenido técnico
  const specsCode = `technicalSpecs: ${JSON.stringify(specs, null, 6).replace(/"([^"]+)":/g, '$1:')},\n\n    `;
  const faqsCode = `faqs: ${JSON.stringify(faqs, null, 6).replace(/"([^"]+)":/g, '$1:')},`;
  
  // Encontrar y reemplazar introduction
  let newContent = content.replace(
    /introduction:\s*`[^`]*`,/,
    `introduction: \`${intro}\`,`
  );
  
  // Añadir o reemplazar technicalSpecs
  if (newContent.includes('technicalSpecs:')) {
    newContent = newContent.replace(
      /technicalSpecs:\s*\[[\s\S]*?\],\s*\n\s*\n/,
      specsCode
    );
  } else {
    newContent = newContent.replace(
      /packages:\s*\[/,
      `${specsCode}packages: [`
    );
  }
  
  // Reemplazar FAQs
  newContent = newContent.replace(
    /faqs:\s*\[[\s\S]*?\],/,
    faqsCode
  );
  
  // Guardar archivo
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  // Contar palabras
  const words = (intro + JSON.stringify(specs) + JSON.stringify(faqs)).split(/\s+/).length;
  
  return { filename, words };
}

// EJECUTAR EXPANSIÓN
console.log('\n🚀 EXPANDIENDO 20 PÁGINAS DE SERVICIO\n');
console.log('='.repeat(80));

const results = [];
let processed = 0;

Object.entries(serviceConfigs).forEach(([filename, config]) => {
  try {
    const result = expandirPagina(filename, config);
    results.push(result);
    processed++;
    console.log(`✅ ${processed}/20 - ${result.filename.padEnd(45)} ${result.words} palabras`);
  } catch (error) {
    console.log(`❌ ERROR en ${filename}: ${error.message}`);
  }
});

console.log('='.repeat(80));
console.log(`\n✅ COMPLETADO: ${processed}/20 páginas expandidas`);
console.log(`\nPróximo paso: Completar AlquilerAltavocesProfesionales manualmente (ya tiene 859, necesita 641 más)`);
